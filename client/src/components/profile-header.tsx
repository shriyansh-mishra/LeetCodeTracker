import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  username: string;
  leetcodeUsername: string;
  totalSolved: number | null;
  ranking: string | null;
  contestCount: number | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ProfileHeader({
  username,
  leetcodeUsername,
  totalSolved,
  ranking,
  contestCount,
  isLoading = false,
  onRefresh,
  isRefreshing = false
}: ProfileHeaderProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:mr-6 mb-4 md:mb-0">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:mr-6 mb-4 md:mb-0">
          <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold mb-1">{username}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">@{leetcodeUsername}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20">
              <span>{totalSolved || 0}</span> Problems Solved
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary dark:bg-secondary/20">
              <span>{ranking || "Not Ranked"}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent dark:bg-accent/20">
              <span>{contestCount || 0}</span> Contests
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>
    </div>
  );
}
