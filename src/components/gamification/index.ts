// Gamification Components Export
export { ProgressRing } from './ProgressRing';
export { PaybackCounter } from './PaybackCounter';
export { ParticleSystem, Fireworks, triggerParticleExplosion } from './ParticleSystem';
export { LevelSystem, LevelBadge } from './LevelSystem';
export { MissionCard } from './MissionCard';
export { GameDashboard } from './GameDashboard';

// Types
export interface GamificationEvent {
  type: 'mission_start' | 'mission_complete' | 'level_up' | 'achievement_unlock' | 'payback_received';
  data?: Record<string, any>;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlockedAt?: string;
}

export interface AchievementRequirement {
  type: 'mission_complete' | 'payback_amount' | 'referral_count' | 'streak_days';
  target: number;
  current?: number;
}

export interface AchievementReward {
  type: 'experience' | 'payback_bonus' | 'badge' | 'title';
  value: number | string;
}

// Utility functions
export const calculateLevel = (experiencePoints: number): number => {
  return Math.floor(Math.sqrt(experiencePoints / 100)) + 1;
};

export const calculateExpForNextLevel = (currentLevel: number): number => {
  return (currentLevel * currentLevel) * 100;
};

export const getExperienceProgress = (currentExp: number, currentLevel: number): number => {
  const currentLevelExp = calculateExpForNextLevel(currentLevel - 1);
  const nextLevelExp = calculateExpForNextLevel(currentLevel);
  const progressExp = currentExp - currentLevelExp;
  const requiredExp = nextLevelExp - currentLevelExp;
  
  return Math.max(0, Math.min(100, (progressExp / requiredExp) * 100));
};