'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from './ProgressRing';
import { PaybackCounter } from './PaybackCounter';
import { triggerParticleExplosion } from './ParticleSystem';
import type { Mission, UserMission } from '@/types';

interface MissionCardProps {
  mission: Mission;
  userMission?: UserMission;
  onStart?: () => void;
  onContinue?: () => void;
  onViewDetails?: () => void;
  className?: string;
  interactive?: boolean;
}

const missionTypeConfig = {
  challenge: {
    icon: '🏆',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  sns: {
    icon: '📱',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
    borderColor: 'border-pink-200 dark:border-pink-800'
  },
  review: {
    icon: '📝',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  referral: {
    icon: '👥',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  attendance: {
    icon: '📅',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    borderColor: 'border-green-200 dark:border-green-800'
  }
};

const getStatusInfo = (userMission?: UserMission) => {
  if (!userMission) {
    return { status: 'available', label: '시작 가능', color: 'bg-green-500' };
  }

  switch (userMission.status) {
    case 'pending':
      return { status: 'pending', label: '대기중', color: 'bg-gray-500' };
    case 'in_progress':
      return { status: 'in_progress', label: '진행중', color: 'bg-blue-500' };
    case 'completed':
      return { status: 'completed', label: '완료', color: 'bg-green-500' };
    case 'verified':
      return { status: 'verified', label: '검증완료', color: 'bg-purple-500' };
    default:
      return { status: 'available', label: '시작 가능', color: 'bg-green-500' };
  }
};

const calculateProgress = (userMission?: UserMission) => {
  if (!userMission) return 0;
  
  switch (userMission.status) {
    case 'pending': return 10;
    case 'in_progress': return 50;
    case 'completed': return 90;
    case 'verified': return 100;
    default: return 0;
  }
};

export function MissionCard({
  mission,
  userMission,
  onStart,
  onContinue,
  onViewDetails,
  className = '',
  interactive = true
}: MissionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const config = missionTypeConfig[mission.missionType] || missionTypeConfig.challenge;
  const statusInfo = getStatusInfo(userMission);
  const progress = calculateProgress(userMission);
  
  // Debug logging
  console.log('MissionCard:', { 
    missionType: mission.missionType, 
    config: !!config, 
    statusInfo: statusInfo.status,
    interactive: interactive
  });

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('MissionCard handleActionClick:', { 
      interactive, 
      status: statusInfo.status,
      missionType: mission.missionType 
    });
    
    // Stop event propagation to prevent parent handlers from interfering
    e.stopPropagation();
    
    if (!interactive) return;

    // Particle effect on button click
    triggerParticleExplosion(e.currentTarget, 'success');

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Call appropriate handler
    if (statusInfo.status === 'available') {
      console.log('Calling onStart for:', mission.missionType);
      onStart?.();
    } else if (statusInfo.status === 'in_progress') {
      console.log('Calling onContinue for:', mission.missionType);
      onContinue?.();
    } else {
      console.log('Calling onViewDetails for:', mission.missionType);
      onViewDetails?.();
    }
  };

  const cardVariants = {
    rest: { 
      scale: 1, 
      rotateY: 0, 
      rotateX: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    hover: { 
      scale: interactive ? 1.03 : 1,
      rotateY: interactive ? -5 : 0,
      rotateX: interactive ? 5 : 0,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    tap: { 
      scale: interactive ? 0.98 : 1
    }
  };

  const cardTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 20
  };

  const contentVariants = {
    rest: { y: 0, opacity: 1 },
    hover: { y: -2, opacity: 1 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      animate={isHovered ? "hover" : "rest"}
      transition={cardTransition}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`transform-gpu perspective-1000 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300 h-full
        ${config.bgColor} ${config.borderColor}
        ${isPressed ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45 translate-x-1/2" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${statusInfo.color} text-white text-xs px-2 py-1`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Progress Ring (top-left) */}
        {progress > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <ProgressRing
              progress={progress}
              size="sm"
              showValue={false}
              color={config.color.includes('blue') ? '#3B82F6' : 
                     config.color.includes('pink') ? '#EC4899' :
                     config.color.includes('orange') ? '#F97316' :
                     config.color.includes('green') ? '#10B981' : '#8B5CF6'}
            />
          </div>
        )}

        <CardHeader className="pb-2">
          <motion.div variants={contentVariants} className="flex items-start space-x-3">
            <motion.div 
              className="text-3xl flex-shrink-0"
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {config.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {mission.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {mission.description}
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-2">
          <motion.div variants={contentVariants} className="space-y-4">
            {/* Reward Display */}
            <div className="text-center py-3 px-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">페이백 보상</div>
              <PaybackCounter
                amount={mission.rewardAmount}
                size="lg"
                color="success"
                glowEffect={isHovered}
                animationType="countUp"
              />
            </div>

            {/* Mission Details */}
            {userMission?.proofData && (
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span>진행 상태:</span>
                  <span className="font-medium">{progress}% 완료</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div>
              <Button 
                onClick={(e) => {
                  console.log('Button clicked!', mission.missionType, statusInfo.status);
                  handleActionClick(e);
                }}
                disabled={!interactive}
                className={`
                  w-full font-semibold relative overflow-hidden
                  bg-gradient-to-r ${config.color}
                  hover:shadow-lg transition-all duration-200
                  ${statusInfo.status === 'completed' || statusInfo.status === 'verified' 
                    ? 'opacity-75' : ''}
                `}
                size="lg"
              >
                {/* Button ripple effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isPressed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
                
                <span className="relative z-10">
                  {statusInfo.status === 'available' && '시작하기'}
                  {statusInfo.status === 'in_progress' && '계속하기'}
                  {(statusInfo.status === 'completed' || statusInfo.status === 'verified') && '완료됨'}
                  {statusInfo.status === 'pending' && '대기중'}
                </span>
              </Button>
            </div>

            {/* Success indicator for completed missions */}
            <AnimatePresence>
              {(statusInfo.status === 'completed' || statusInfo.status === 'verified') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-green-600 dark:text-green-400 text-sm font-medium"
                >
                  ✨ 미션 완료! {mission.rewardAmount.toLocaleString()}원 적립됨
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>

        {/* Hover glow effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-lg"
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}