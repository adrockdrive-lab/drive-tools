'use client';

import { Button } from '@/components/ui/button';
import type { Mission, UserMission } from '@/types';
import { useRouter } from 'next/navigation';

interface MissionCardProps {
  mission: Mission;
  userMission?: UserMission;
  size?: 'small' | 'medium' | 'large';
}

const missionIcons = {
  challenge: '🏆',
  sns: '📱', 
  review: '📝',
  referral: '👥',
  attendance: '📅'
};

// Apple Glass inspired subtle color tints
const missionGlassStyles = {
  challenge: {
    bg: 'bg-slate-500/8',
    border: 'border-slate-200/20',
    accent: 'text-slate-700',
    shadow: 'shadow-slate-500/10',
    iconBg: 'bg-slate-100/80'
  },
  sns: {
    bg: 'bg-rose-500/8',
    border: 'border-rose-200/20',
    accent: 'text-rose-700',
    shadow: 'shadow-rose-500/10',
    iconBg: 'bg-rose-100/80'
  },
  review: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-200/20',
    accent: 'text-amber-700',
    shadow: 'shadow-amber-500/10',
    iconBg: 'bg-amber-100/80'
  },
  referral: {
    bg: 'bg-indigo-500/8',
    border: 'border-indigo-200/20',
    accent: 'text-indigo-700',
    shadow: 'shadow-indigo-500/10',
    iconBg: 'bg-indigo-100/80'
  },
  attendance: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-200/20',
    accent: 'text-emerald-700',
    shadow: 'shadow-emerald-500/10',
    iconBg: 'bg-emerald-100/80'
  }
};

export function MissionCard({ mission, userMission, size = 'medium' }: MissionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/missions/${mission.missionType}`);
  };

  const icon = missionIcons[mission.missionType] || '📋';
  const glassStyle = missionGlassStyles[mission.missionType] || missionGlassStyles.challenge;
  const status = userMission?.status || 'available';
  const isCompleted = status === 'completed' || status === 'verified';

  const sizeClasses = {
    small: 'col-span-1 min-h-[200px]',
    medium: 'col-span-1 sm:col-span-2 min-h-[220px] sm:min-h-[260px]',
    large: 'col-span-1 sm:col-span-2 lg:col-span-3 min-h-[260px] sm:min-h-[320px]'
  };

  return (
    <div 
      className={`
        relative group cursor-pointer rounded-3xl p-6 sm:p-8
        ${glassStyle.bg} ${glassStyle.border} ${glassStyle.shadow}
        backdrop-blur-xl border
        hover:scale-[1.01] hover:shadow-2xl hover:${glassStyle.shadow.replace('/10', '/20')}
        hover:-translate-y-1 hover:bg-white/20
        transition-all duration-500 ease-out
        active:scale-[0.99] active:duration-150
        ${sizeClasses[size]}
        overflow-hidden
        before:absolute before:inset-0 before:rounded-3xl
        before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent
        before:pointer-events-none
      `}
      onClick={handleClick}
    >
      {/* Subtle noise texture for Apple Glass effect */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] bg-repeat"
        />
      </div>

      {/* Status Badge - Apple Glass Style */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 z-20 border border-white/20 shadow-sm">
          <span className="text-gray-700 text-xs font-semibold tracking-wide">완료 ✓</span>
        </div>
      )}

      {/* Content - Apple Typography Hierarchy */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="space-y-4 sm:space-y-5">
          {/* Icon and Title Section */}
          <div className="flex items-start space-x-4">
            <div className={`
              ${glassStyle.iconBg} backdrop-blur-sm rounded-2xl p-3 
              flex items-center justify-center shadow-sm border border-white/30
              group-hover:scale-110 group-hover:shadow-md group-hover:border-white/40
              transition-all duration-300 ease-out
            `}>
              <span className="text-2xl group-hover:scale-105 transition-transform duration-300">{icon}</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight tracking-tight">
                {mission.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed font-medium">
                {mission.description}
              </p>
            </div>
          </div>

          {/* Reward Amount - Apple Card Style */}
          <div className="
            bg-white/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 
            border border-white/30 shadow-sm
            group-hover:bg-white/70 group-hover:border-white/40 group-hover:shadow-md
            transition-all duration-300 ease-out
          ">
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">페이백 보상</div>
            <div className={`${glassStyle.accent} font-bold text-2xl sm:text-3xl tracking-tight`}>
              {mission.rewardAmount.toLocaleString()}<span className="text-lg font-semibold ml-1">원</span>
            </div>
          </div>
        </div>

        {/* Apple-style Action Button */}
        <Button 
          size="lg"
          className={`
            w-full mt-6 bg-gray-900/80 hover:bg-gray-900/90 
            backdrop-blur-md border-0 text-white font-semibold
            rounded-2xl py-4 transition-all duration-300
            shadow-lg hover:shadow-xl
            active:scale-[0.98] active:duration-100
            ${isCompleted ? 'opacity-60' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <span className="tracking-wide">
            {isCompleted ? '완료됨 ✓' : '시작하기'}
          </span>
          {!isCompleted && <span className="ml-2 text-white/80">→</span>}
        </Button>
      </div>
    </div>
  );
}