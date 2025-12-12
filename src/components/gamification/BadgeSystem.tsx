'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, Crown, Lock, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Badge, BadgeRarity, UserBadge } from '@/types';

interface BadgeSystemProps {
  userBadges: UserBadge[];
  availableBadges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
}

interface BadgeCardProps {
  badge: Badge;
  isEarned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showProgress?: boolean;
  progress?: number;
}

interface BadgeModalProps {
  badge?: Badge;
  isEarned: boolean;
  earnedAt?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Badge rarity colors and effects
const RARITY_CONFIG: Record<BadgeRarity, { 
  color: string; 
  bgGradient: string; 
  borderGlow: string;
  animation: string;
}> = {
  common: {
    color: '#6B7280',
    bgGradient: 'from-gray-100 to-gray-200',
    borderGlow: 'shadow-gray-300/50',
    animation: ''
  },
  rare: {
    color: '#3B82F6',
    bgGradient: 'from-blue-100 to-blue-200',
    borderGlow: 'shadow-blue-400/50',
    animation: 'animate-pulse'
  },
  epic: {
    color: '#8B5CF6',
    bgGradient: 'from-purple-100 to-purple-200',
    borderGlow: 'shadow-purple-400/50',
    animation: 'animate-bounce'
  },
  legendary: {
    color: '#F59E0B',
    bgGradient: 'from-yellow-100 to-orange-200',
    borderGlow: 'shadow-orange-400/50',
    animation: 'animate-pulse'
  }
};

// Badge icons
const getBadgeIcon = (badgeName: string) => {
  const iconMap: Record<string, any> = {
    first_mission: Target,
    mission_streak: Zap,
    referral_master: Users,
    level_milestone: Crown,
    payback_collector: Trophy,
    perfect_month: Star,
    early_adopter: Award,
    default: Trophy
  };
  
  return iconMap[badgeName.toLowerCase()] || iconMap.default;
};

export function BadgeCard({ 
  badge, 
  isEarned, 
  earnedAt, 
  size = 'md', 
  onClick,
  showProgress = false,
  progress = 0
}: BadgeCardProps) {
  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const IconComponent = getBadgeIcon(badge.name);
  
  const sizeConfig = {
    sm: { container: 'w-16 h-16', icon: 'w-6 h-6', text: 'text-xs' },
    md: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-sm' },
    lg: { container: 'w-24 h-24', icon: 'w-10 h-10', text: 'text-base' }
  };
  
  const config = sizeConfig[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer ${isEarned ? '' : 'opacity-60'}`}
      onClick={onClick}
    >
      <div
        className={`
          ${config.container} rounded-xl bg-gradient-to-br ${rarityConfig.bgGradient}
          border-2 ${rarityConfig.borderGlow} shadow-lg
          flex flex-col items-center justify-center p-2 relative overflow-hidden
          ${isEarned ? rarityConfig.animation : ''}
        `}
        style={{ borderColor: rarityConfig.color }}
      >
        {/* Earned indicator */}
        {isEarned && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
        )}
        
        {/* Lock overlay for unearned badges */}
        {!isEarned && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
            <Lock className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Badge icon */}
        <IconComponent 
          className={`${config.icon} mb-1`}
          style={{ color: isEarned ? rarityConfig.color : '#9CA3AF' }}
        />
        
        {/* Badge name */}
        <span className={`${config.text} font-medium text-center text-gray-700 leading-tight`}>
          {badge.title}
        </span>
        
        {/* Progress bar for unearned badges */}
        {showProgress && !isEarned && progress > 0 && (
          <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
        
        {/* Shimmer effect for rare+ badges */}
        {isEarned && badge.rarity !== 'common' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}
      </div>
      
      {/* Earned date */}
      {isEarned && earnedAt && (
        <p className="text-xs text-gray-500 text-center mt-1">
          {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

export function BadgeModal({ badge, isEarned, earnedAt, isOpen, onClose }: BadgeModalProps) {
  if (!badge) return null;
  
  const rarityConfig = RARITY_CONFIG[badge.rarity];
  const IconComponent = getBadgeIcon(badge.name);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge display */}
            <div className="flex flex-col items-center mb-6">
              <div
                className={`
                  w-24 h-24 rounded-xl bg-gradient-to-br ${rarityConfig.bgGradient}
                  border-2 ${rarityConfig.borderGlow} shadow-lg
                  flex items-center justify-center relative overflow-hidden
                  ${isEarned ? rarityConfig.animation : 'opacity-60'}
                `}
                style={{ borderColor: rarityConfig.color }}
              >
                {!isEarned && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <IconComponent 
                  className="w-12 h-12"
                  style={{ color: isEarned ? rarityConfig.color : '#9CA3AF' }}
                />
                
                {isEarned && badge.rarity !== 'common' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                )}
              </div>
              
              {/* Rarity indicator */}
              <span 
                className="text-xs font-semibold px-2 py-1 rounded-full mt-2"
                style={{ 
                  backgroundColor: `${rarityConfig.color}20`,
                  color: rarityConfig.color 
                }}
              >
                {badge.rarity.toUpperCase()}
              </span>
            </div>
            
            {/* Badge info */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {badge.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {badge.description}
              </p>
              
              {isEarned && earnedAt && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 {new Date(earnedAt).toLocaleDateString()}에 획득
                  </p>
                </div>
              )}
              
              {!isEarned && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    📋 획득 조건: {getConditionText(badge.condition)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Close button */}
            <Button
              onClick={onClose}
              className="w-full"
              variant="outline"
            >
              닫기
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BadgeSystem({ 
  userBadges, 
  availableBadges, 
  onBadgeClick,
  className = ''
}: BadgeSystemProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRarity, setFilterRarity] = useState<BadgeRarity | 'all'>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
  
  // Filter badges
  const filteredBadges = availableBadges.filter(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id);
    
    if (showEarnedOnly && !isEarned) return false;
    if (filterRarity !== 'all' && badge.rarity !== filterRarity) return false;
    
    return true;
  });

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
    onBadgeClick?.(badge);
  };

  const getSelectedBadgeInfo = () => {
    if (!selectedBadge) return { isEarned: false };
    
    const userBadge = userBadges.find(ub => ub.badgeId === selectedBadge.id);
    return {
      isEarned: !!userBadge,
      earnedAt: userBadge?.earnedAt
    };
  };

  const { isEarned: selectedIsEarned, earnedAt: selectedEarnedAt } = getSelectedBadgeInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">배지 컬렉션</h2>
          <p className="text-sm text-gray-600">
            {userBadges.length}개의 배지 획득 / 총 {availableBadges.length}개
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Rarity filter */}
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as BadgeRarity | 'all')}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
          >
            <option value="all">모든 등급</option>
            <option value="common">일반</option>
            <option value="rare">레어</option>
            <option value="epic">에픽</option>
            <option value="legendary">전설</option>
          </select>
          
          {/* Show earned only */}
          <Button
            variant={showEarnedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEarnedOnly(!showEarnedOnly)}
          >
            {showEarnedOnly ? "모든 배지" : "획득한 배지만"}
          </Button>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {filteredBadges.map(badge => {
          const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
          const isEarned = !!userBadge;
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={isEarned}
              earnedAt={userBadge?.earnedAt}
              onClick={() => handleBadgeClick(badge)}
              size="md"
            />
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">조건에 맞는 배지가 없습니다.</p>
        </div>
      )}

      {/* Badge detail modal */}
      <BadgeModal
        badge={selectedBadge || undefined}
        isEarned={selectedIsEarned}
        earnedAt={selectedEarnedAt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// Helper function to convert condition to readable text
function getConditionText(condition: any): string {
  switch (condition.type) {
    case 'mission_complete':
      return `${condition.missionType} 미션 ${condition.value}회 완료`;
    case 'mission_count':
      return `총 미션 ${condition.value}회 완료`;
    case 'referral_count':
      return `친구 ${condition.value}명 추천`;
    case 'payback_amount':
      return `총 페이백 ${condition.value.toLocaleString()}원 달성`;
    case 'streak':
      return `${condition.value}일 연속 참여`;
    default:
      return '특별한 조건 달성';
  }
}