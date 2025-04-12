import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getColorByDifficulty(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-600 dark:text-green-400";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400";
    case "hard":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

export function getBgColorByDifficulty(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "hard":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function getHeatMapColor(intensity: number): string {
  if (intensity === 0) return "bg-green-100 dark:bg-green-900/20";
  if (intensity < 3) return "bg-green-200 dark:bg-green-800/30";
  if (intensity < 5) return "bg-green-300 dark:bg-green-700/30";
  if (intensity < 8) return "bg-green-400 dark:bg-green-600/40";
  if (intensity < 10) return "bg-green-500 dark:bg-green-500/40";
  return "bg-green-600 dark:bg-green-400/50";
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    python: "bg-blue-500",
    javascript: "bg-yellow-500",
    typescript: "bg-blue-600",
    java: "bg-green-500",
    cpp: "bg-purple-500",
    c: "bg-gray-500",
    csharp: "bg-purple-600",
    ruby: "bg-red-500",
    go: "bg-blue-400",
    swift: "bg-orange-500",
    kotlin: "bg-orange-400",
    rust: "bg-brown-500",
    php: "bg-indigo-400",
    scala: "bg-red-600",
  };

  return colors[language.toLowerCase()] || "bg-pink-500";
}

export function getBadgeColor(index: number): string {
  const colors = [
    "from-yellow-200 to-yellow-500 dark:from-yellow-500 dark:to-yellow-700",
    "from-blue-200 to-blue-500 dark:from-blue-500 dark:to-blue-700",
    "from-green-200 to-green-500 dark:from-green-500 dark:to-green-700",
    "from-purple-200 to-purple-500 dark:from-purple-500 dark:to-purple-700",
    "from-red-200 to-red-500 dark:from-red-500 dark:to-red-700",
    "from-gray-300 to-gray-500 dark:from-gray-500 dark:to-gray-700",
  ];

  return colors[index % colors.length];
}
