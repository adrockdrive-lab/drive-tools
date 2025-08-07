'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ParticleSystem } from './ParticleSystem';

interface LevelSystemProps {
  currentLevel: number;
  currentExp: number;
  expToNext: number;
  totalExp: number;
  showLevelUpAnimation?: boolean;
  onLevelUp?: (newLevel: number) => void;
  className?: string;
}

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showRing?: boolean;
  animated?: boolean;
}

// Level benefits and titles
const LEVEL_CONFIG = {
  1: { title: '새싹 운전자', icon: '🌱', color: '#10B981' },
  2: { title: '초보 드라이버', icon: '🚗', color: '#3B82F6' },
  3: { title: '숙련 운전자', icon: '🏆', color: '#8B5CF6' },
  5: { title: '프로 드라이버', icon: '👑', color: '#F59E0B' },
  10: { title: '마스터', icon: '⭐', color: '#EF4444' },
  20: { title: '레전드', icon: '💎', color: '#8B5CF6' }
};

const getLevelInfo = (level: number) => {
  const levelKeys = Object.keys(LEVEL_CONFIG).map(Number).sort((a, b) => b - a);
  const targetLevel = levelKeys.find(l => level >= l) || 1;
  return LEVEL_CONFIG[targetLevel as keyof typeof LEVEL_CONFIG];
};

export function LevelBadge({ level, size = 'md', showRing = true, animated = true }: LevelBadgeProps) {
  const levelInfo = getLevelInfo(level);

  const sizeConfig = {
    sm: { container: 'w-12 h-12', text: 'text-xs', icon: 'text-sm' },
    md: { container: 'w-16 h-16', text: 'text-sm', icon: 'text-lg' },
    lg: { container: 'w-20 h-20', text: 'text-base', icon: 'text-xl' }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {showRing && (
        <div
          className={`${config.container} rounded-full border-3 border-opacity-30 flex items-center justify-center`}
          style={{ borderColor: levelInfo.color }}
        >
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center text-white font-bold"
            style={{ backgroundColor: levelInfo.color }}
          >
            <span className={config.icon}>{levelInfo.icon}</span>
            <span className={config.text}>{level}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function LevelSystem({
  currentLevel,
  currentExp,
  expToNext,
  totalExp,
  showLevelUpAnimation = true,
  onLevelUp,
  className = ''
}: LevelSystemProps) {
  const [previousLevel, setPreviousLevel] = useState(currentLevel);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);

  const progressPercentage = totalExp > 0 ? (currentExp / expToNext) * 100 : 0;
  const levelInfo = getLevelInfo(currentLevel);

  useEffect(() => {
    if (currentLevel > previousLevel && showLevelUpAnimation) {
      setShowLevelUpEffect(true);
      onLevelUp?.(currentLevel);

      const timer = setTimeout(() => {
        setShowLevelUpEffect(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    setPreviousLevel(currentLevel);
  }, [currentLevel, previousLevel, showLevelUpAnimation, onLevelUp]);

  return (
    <div className={`relative ${className}`}>
      {/* Level Up Particles */}
      <ParticleSystem
        trigger={showLevelUpEffect}
        type="levelUp"
        intensity="high"
        onComplete={() => setShowLevelUpEffect(false)}
      />

      <div className="flex items-center space-x-4">
        {/* Level Badge */}
        <LevelBadge level={currentLevel} size="lg" />

        {/* Level Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {levelInfo.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                레벨 {currentLevel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {currentExp.toLocaleString()} / {expToNext.toLocaleString()} XP
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                총 {totalExp.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full relative overflow-hidden"
                style={{ backgroundColor: levelInfo.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, type: "spring", stiffness: 60 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
              </motion.div>
            </div>

            {/* XP gained indicator */}
            <AnimatePresence>
              {showLevelUpEffect && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 2 }}
                  className="absolute right-0 top-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                >
                  레벨업! 🎉
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Level Up Modal Overlay */}
      <AnimatePresence>
        {showLevelUpEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLevelUpEffect(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                <LevelBadge level={currentLevel} size="lg" />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                  레벨 업!
                </h2>
                <p className="text-lg text-purple-600 dark:text-purple-400 font-semibold">
                  {levelInfo.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  레벨 {currentLevel}에 도달했습니다!
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setShowLevelUpEffect(false)}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                계속하기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
