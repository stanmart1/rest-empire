import { Crown, Gem, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RankBadge = ({ rank, size = 'md', showLabel = true }: RankBadgeProps) => {
  const rankConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
    'Pearl': { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Gem },
    'Sapphire': { color: 'text-primary', bgColor: 'bg-primary/10', icon: Gem },
    'Ruby': { color: 'text-red-700', bgColor: 'bg-red-100', icon: Gem },
    'Emerald': { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: Gem },
    'Diamond': { color: 'text-primary', bgColor: 'bg-primary/10', icon: Crown },
    'Blue Diamond': { color: 'text-primary', bgColor: 'bg-primary/10', icon: Crown },
    'Green Diamond': { color: 'text-green-700', bgColor: 'bg-green-100', icon: Crown },
    'Purple Diamond': { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Crown },
    'Red Diamond': { color: 'text-red-700', bgColor: 'bg-red-100', icon: Crown },
    'Black Diamond': { color: 'text-gray-900', bgColor: 'bg-gray-200', icon: Crown },
    'Ultima Diamond': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Crown },
    'Double Ultima Diamond': { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Crown },
    'Triple Ultima Diamond': { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Crown },
    'Billion Diamond': { color: 'text-indigo-900', bgColor: 'bg-gradient-to-r from-yellow-100 to-purple-100', icon: Crown },
  };

  const config = rankConfig[rank] || { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Gem };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      config.bgColor,
      config.color,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{rank}</span>}
    </div>
  );
};

export default RankBadge;