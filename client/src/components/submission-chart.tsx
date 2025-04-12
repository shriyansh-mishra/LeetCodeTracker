import { Skeleton } from "@/components/ui/skeleton";

interface SubmissionData {
  date: string;
  count: number;
}

interface SubmissionChartProps {
  data: SubmissionData[];
  totalSubmissions: number | null;
  isLoading?: boolean;
}

export default function SubmissionChart({ 
  data, 
  totalSubmissions, 
  isLoading = false 
}: SubmissionChartProps) {
  // Get the last 14 days of submissions for the chart
  const chartData = data.slice(-14);
  
  // Find the maximum count to normalize the bars
  const maxCount = Math.max(...chartData.map(item => item.count), 1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Skeleton className="w-16 h-16 rounded-full mr-4" />
          <div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Submission Stats</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">14-day trend</span>
      </div>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-secondary/10 dark:bg-secondary/20 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <span className="block text-3xl font-bold">{totalSubmissions || 0}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total submissions</span>
        </div>
      </div>
      <div className="h-32 overflow-hidden">
        <div className="h-full w-full flex items-end">
          {chartData.map((item, index) => {
            const height = (item.count / maxCount) * 100;
            const formattedDate = new Date(item.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            
            return (
              <div 
                key={index}
                className="code-chart-bar bg-secondary h-20 w-3 mx-1 rounded-t-sm" 
                style={{ height: `${height}%` }}
                title={`${formattedDate}: ${item.count} submissions`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
