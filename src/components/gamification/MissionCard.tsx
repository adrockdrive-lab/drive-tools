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

// Mission type colors for dark theme
const missionColors = {
  challenge: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30'
  },
  sns: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30'
  },
  review: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30'
  },
  referral: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30'
  },
  attendance: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  }
};

export function MissionCard({ mission, userMission, size = 'large' }: MissionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/missions/${mission.missionType}`);
  };

  const icon = missionIcons[mission.missionType] || '📋';
  const colors = missionColors[mission.missionType] || missionColors.challenge;
  const status = userMission?.status || 'available';
  const isCompleted = status === 'completed' || status === 'verified';

  return (
    <div 
      className="card-hover gradient-card rounded-2xl p-4 border border-border cursor-pointer"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              {mission.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              {mission.description}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        {isCompleted && (
          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            완료 ✓
          </div>
        )}
      </div>

      {/* Reward Section */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs mb-1">페이백 보상</div>
            <div className={`${colors.text} font-bold text-lg`}>
              {mission.rewardAmount.toLocaleString()}원
            </div>
          </div>
          <div className="text-2xl">💰</div>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        size="sm"
        className={`
          w-full ${isCompleted ? 'bg-secondary text-muted-foreground' : 'bg-primary hover:bg-primary/90'}
          rounded-xl transition-all duration-200
        `}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {isCompleted ? '완료됨 ✓' : '시작하기'}
      </Button>
    </div>
  );
}