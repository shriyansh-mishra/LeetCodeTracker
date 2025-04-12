import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, refreshLeetCodeData } from "@/lib/api";
import { UserWithStats } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/profile-header";
import ProblemStats from "@/components/problem-stats";
import SubmissionChart from "@/components/submission-chart";
import ActivityHeatmap from "@/components/activity-heatmap";
import LanguageChart from "@/components/language-chart";
import BadgeShowcase from "@/components/badge-showcase";
import ContestHistory from "@/components/contest-history";
import LeetCodeUsernameForm from "@/components/leetcode-username-form";
import LeetCodeConnection from "@/components/leetcode-connection";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data, isLoading, isError, error } = useQuery<UserWithStats>({
    queryKey: ["/api/dashboard"],
    refetchOnWindowFocus: false,
  });

  // Mutation for refreshing LeetCode data
  const refreshMutation = useMutation({
    mutationFn: refreshLeetCodeData,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/dashboard"], data);
      toast({
        title: "Data refreshed",
        description: "Your LeetCode data has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh LeetCode data.",
        variant: "destructive",
      });
    },
  });

  // Handle refresh button click
  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Show error message if data fetching fails
  if (isError) {
    return (
      <div className="py-12 container mx-auto px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : "Failed to load your LeetCode statistics."}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show LeetCode username form if no username is set
  if (!isLoading && !data?.leetcodeUsername) {
    return (
      <div className="py-12 container mx-auto px-4 max-w-2xl">
        <LeetCodeUsernameForm 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] })}
        />
      </div>
    );
  }

  // Fixed data for total problems by difficulty (these don't change often)
  const easyTotal = 592;
  const mediumTotal = 1256;
  const hardTotal = 516;

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        {/* Profile header */}
        <ProfileHeader
          username={data?.username || ""}
          leetcodeUsername={data?.leetcodeUsername || ""}
          totalSolved={data?.profile?.totalSolved || null}
          ranking={data?.profile?.ranking || null}
          contestCount={data?.profile?.contestAttended || null}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          isRefreshing={refreshMutation.isPending}
        />

        {/* LeetCode Connection Settings */}
        {data?.leetcodeUsername && (
          <div className="mb-6">
            <LeetCodeConnection
              username={data.leetcodeUsername}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] })}
            />
          </div>
        )}

        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ProblemStats
              totalSolved={data?.profile?.totalSolved || null}
              easySolved={data?.profile?.easySolved || null}
              easyTotal={easyTotal}
              mediumSolved={data?.profile?.mediumSolved || null}
              mediumTotal={mediumTotal}
              hardSolved={data?.profile?.hardSolved || null}
              hardTotal={hardTotal}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <SubmissionChart
              data={data?.submissionStats || []}
              totalSubmissions={data?.profile?.totalSubmissions || null}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center mb-4">
                  <Skeleton className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">Success Rate</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">All time</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-accent/10 dark:bg-accent/20 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-3xl font-bold">{data?.profile?.acceptanceRate || "0%"}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Acceptance rate</span>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Acceptance by Difficulty</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600 dark:text-green-400">Easy</span>
                        <span>78.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-yellow-600 dark:text-yellow-400">Medium</span>
                        <span>54.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-600 dark:text-red-400">Hard</span>
                        <span>42.1%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ActivityHeatmap
              data={data?.submissionStats || []}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <LanguageChart
              languages={data?.languageStats || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Badges & Contest History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <BadgeShowcase
              badges={data?.badges || []}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ContestHistory
              contests={data?.contestHistory || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
