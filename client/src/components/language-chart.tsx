import { getLanguageColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LanguageStat {
  language: string;
  count: number;
  percentage: string;
}

interface LanguageChartProps {
  languages: LanguageStat[];
  isLoading?: boolean;
}

export default function LanguageChart({ languages, isLoading = false }: LanguageChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort languages by count in descending order
  const sortedLanguages = [...languages].sort((a, b) => b.count - a.count);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Languages Used</h2>
      <div className="space-y-4">
        {sortedLanguages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No language data available.
          </div>
        ) : (
          sortedLanguages.map((lang, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <span className={`w-3 h-3 rounded-full ${getLanguageColor(lang.language)} mr-2`}></span>
                  {lang.language}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{lang.percentage}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`${getLanguageColor(lang.language)} h-2.5 rounded-full`} 
                  style={{ width: lang.percentage }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
