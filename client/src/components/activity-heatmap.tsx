import { useState } from "react";
import { getHeatMapColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityHeatmapProps {
  data: {
    date: string;
    count: number;
  }[];
  isLoading?: boolean;
}

export default function ActivityHeatmap({ data, isLoading = false }: ActivityHeatmapProps) {
  // Generate a 7x4 grid for the heatmap (representing days of the week for 4 weeks)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const getActivityForDay = (weekIndex: number, dayIndex: number): number => {
    if (isLoading || !data || data.length === 0) return 0;

    const index = weekIndex * 7 + dayIndex;
    if (index >= data.length) return 0;
    
    return data[index].count;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div key={day} className="text-xs text-gray-400 text-center">{day}</div>
          ))}
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton key={i} className="w-6 h-6 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Activity Heatmap</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <div key={day} className="text-xs text-gray-400 text-center">{day}</div>
            ))}
            
            {Array.from({ length: 4 }).map((_, weekIndex) => (
              Array.from({ length: 7 }).map((_, dayIndex) => {
                const count = getActivityForDay(weekIndex, dayIndex);
                return (
                  <div 
                    key={`${weekIndex}-${dayIndex}`}
                    className={`heat-map-cell ${getHeatMapColor(count)} w-6 h-6 rounded`}
                    title={`${days[dayIndex]}: ${count} submissions`}
                  />
                );
              })
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded mr-1"></div>
          <span>0-1</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-300 dark:bg-green-700/30 rounded mr-1"></div>
          <span>2-4</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 dark:bg-green-600/40 rounded mr-1"></div>
          <span>5-7</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 dark:bg-green-500/40 rounded mr-1"></div>
          <span>8-10</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-600 dark:bg-green-400/50 rounded mr-1"></div>
          <span>10+</span>
        </div>
      </div>
    </div>
  );
}
