'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Mission, UserMission } from '@/types';
import { useRouter } from 'next/navigation';

interface MissionCardProps {
  mission: Mission;
  userMission?: UserMission;
}

const missionIcons = {
  challenge: '🏆',
  sns: '📱', 
  review: '📝',
  referral: '👥',
  attendance: '📅'
};

export function MissionCard({ mission, userMission }: MissionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/missions/${mission.missionType}`);
  };

  const icon = missionIcons[mission.missionType] || '📋';
  const status = userMission?.status || 'available';
  const isCompleted = status === 'completed' || status === 'verified';

  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <CardTitle className="text-lg">{mission.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">페이백 보상</div>
          <div className="text-2xl font-bold text-green-600">
            {mission.rewardAmount.toLocaleString()}원
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? '완료됨' : '상세보기'}
        </Button>
        
        {isCompleted && (
          <div className="text-center text-green-600 text-sm">
            ✨ 미션 완료!
          </div>
        )}
      </CardContent>
    </Card>
  );
}