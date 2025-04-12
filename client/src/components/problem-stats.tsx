import { 
  getColorByDifficulty, 
  getBgColorByDifficulty 
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProblemStatsProps {
  totalSolved: number | null;
  easySolved: number | null;
  easyTotal: number;
  mediumSolved: number | null;
  mediumTotal: number;
  hardSolved: number | null;
  hardTotal: number;
  isLoading?: boolean;
}

export default function ProblemStats({
  totalSolved,
  easySolved,
  easyTotal,
  mediumSolved,
  mediumTotal,
  hardSolved,
  hardTotal,
  isLoading = false
}: ProblemStatsProps) {
  const easyPercentage = easySolved ? Math.round((easySolved / easyTotal) * 100) : 0;
  const mediumPercentage = mediumSolved ? Math.round((mediumSolved / mediumTotal) * 100) : 0;
  const hardPercentage = hardSolved ? Math.round((hardSolved / hardTotal) * 100) : 0;

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
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">Problem Solving</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: Today</span>
      </div>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 dark:bg-primary/20 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <span className="block text-3xl font-bold">{totalSolved || 0}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total problems solved</span>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={getColorByDifficulty('easy') + " font-medium"}>Easy</span>
            <span>{easySolved || 0}/{easyTotal}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`${getBgColorByDifficulty('easy')} h-2 rounded-full`}
              style={{ width: `${easyPercentage}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={getColorByDifficulty('medium') + " font-medium"}>Medium</span>
            <span>{mediumSolved || 0}/{mediumTotal}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`${getBgColorByDifficulty('medium')} h-2 rounded-full`}
              style={{ width: `${mediumPercentage}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={getColorByDifficulty('hard') + " font-medium"}>Hard</span>
            <span>{hardSolved || 0}/{hardTotal}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`${getBgColorByDifficulty('hard')} h-2 rounded-full`}
              style={{ width: `${hardPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
