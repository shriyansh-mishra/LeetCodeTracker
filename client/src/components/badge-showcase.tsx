import { 
  Trophy, 
  Zap, 
  Calendar, 
  Scale, 
  CheckCircle, 
  Code,
  Award,
  Star,
  Target,
  Rocket,
  Bookmark
} from "lucide-react";
import { getBadgeColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Badge {
  name: string;
  description: string;
  icon: string;
}

interface BadgeShowcaseProps {
  badges: Badge[];
  isLoading?: boolean;
}

export default function BadgeShowcase({ badges, isLoading = false }: BadgeShowcaseProps) {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      trophy: <Trophy className="h-10 w-10 text-white" />,
      zap: <Zap className="h-10 w-10 text-white" />,
      calendar: <Calendar className="h-10 w-10 text-white" />,
      scale: <Scale className="h-10 w-10 text-white" />,
      "check-circle": <CheckCircle className="h-10 w-10 text-white" />,
      code: <Code className="h-10 w-10 text-white" />,
      award: <Award className="h-10 w-10 text-white" />,
      star: <Star className="h-10 w-10 text-white" />,
      target: <Target className="h-10 w-10 text-white" />,
      rocket: <Rocket className="h-10 w-10 text-white" />,
      bookmark: <Bookmark className="h-10 w-10 text-white" />
    };

    return iconMap[iconName] || <Code className="h-10 w-10 text-white" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="p-3 rounded-lg h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Badges Earned</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No badges earned yet. Keep solving problems to earn badges!
          </div>
        ) : (
          badges.map((badge, index) => (
            <div 
              key={index}
              className={`challenge-badge bg-gradient-to-br ${getBadgeColor(index)} p-3 rounded-lg text-center shadow-sm`}
            >
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                {getIconComponent(badge.icon)}
              </div>
              <h3 className="text-sm font-bold text-white">{badge.name}</h3>
              <p className="text-xs text-white/80">{badge.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
