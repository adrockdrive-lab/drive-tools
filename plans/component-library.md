# 드라이빙존 미션 시스템 V2 - 컴포넌트 라이브러리

## 📋 목차
1. [기본 컴포넌트](#1-기본-컴포넌트)
2. [게이미피케이션 컴포넌트](#2-게이미피케이션-컴포넌트)
3. [미션 컴포넌트](#3-미션-컴포넌트)
4. [소셜 컴포넌트](#4-소셜-컴포넌트)
5. [레이아웃 컴포넌트](#5-레이아웃-컴포넌트)
6. [폼 컴포넌트](#6-폼-컴포넌트)

---

## 1. 기본 컴포넌트

### 1.1 Button

**파일**: `src/components/ui/Button.tsx`

```tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-primary active:scale-95',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
      ghost: 'text-gray-700 hover:bg-gray-100',
      gradient: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>로딩 중...</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**사용 예시**:
```tsx
<Button variant="primary" size="md">
  시작하기
</Button>

<Button variant="gradient" size="lg" isLoading>
  미션 완료
</Button>

<Button variant="outline" leftIcon={<Star />}>
  좋아요
</Button>
```

---

### 1.2 Card

**파일**: `src/components/ui/Card.tsx`

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card = ({ children, className, hover = false, gradient = false }: CardProps) => {
  const baseStyles = 'bg-white rounded-xl shadow-md p-6';
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white to-primary-50' : '';

  return (
    <div className={cn(baseStyles, hoverStyles, gradientStyles, className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-xl font-bold text-gray-900', className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
);

export const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('text-gray-700', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mt-6 pt-4 border-t border-gray-200 flex items-center justify-between', className)}>
    {children}
  </div>
);
```

**사용 예시**:
```tsx
<Card hover>
  <CardHeader>
    <CardTitle>재능충 챌린지</CardTitle>
    <CardDescription>14시간 내 합격 도전</CardDescription>
  </CardHeader>
  <CardBody>
    <p>합격 인증 시 2만원 페이백</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">시작하기</Button>
  </CardFooter>
</Card>
```

---

### 1.3 Modal

**파일**: `src/components/ui/Modal.tsx`

```tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  showCloseButton = true
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-51 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                'bg-white rounded-2xl shadow-2xl w-full p-8 relative',
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}

              {title && (
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  {title}
                </h2>
              )}

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 2. 게이미피케이션 컴포넌트

### 2.1 LevelDisplay

**파일**: `src/components/gamification/LevelDisplay.tsx`

```tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  level: number;
  xp: number;
  nextLevelXp: number;
  title?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelDisplay = ({
  level,
  xp,
  nextLevelXp,
  title,
  showProgress = true,
  size = 'md'
}: LevelDisplayProps) => {
  const progress = (xp / nextLevelXp) * 100;

  const sizes = {
    sm: {
      container: 'gap-2',
      level: 'w-12 h-12 text-lg',
      text: 'text-sm',
      progress: 'h-2'
    },
    md: {
      container: 'gap-3',
      level: 'w-16 h-16 text-2xl',
      text: 'text-base',
      progress: 'h-3'
    },
    lg: {
      container: 'gap-4',
      level: 'w-20 h-20 text-3xl',
      text: 'text-lg',
      progress: 'h-4'
    }
  };

  return (
    <div className={cn('flex items-center', sizes[size].container)}>
      {/* Level Badge */}
      <div className={cn(
        'rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg',
        sizes[size].level
      )}>
        {level}
      </div>

      {/* Level Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <span className={cn('font-semibold text-gray-900', sizes[size].text)}>
            레벨 {level}
          </span>
          {title && (
            <span className={cn('text-gray-600', sizes[size].text)}>
              • {title}
            </span>
          )}
        </div>

        {showProgress && (
          <>
            <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size].progress)}>
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">
                {xp.toLocaleString()} XP
              </span>
              <span className="text-xs text-gray-600">
                {nextLevelXp.toLocaleString()} XP
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

---

### 2.2 BadgeCard

**파일**: `src/components/gamification/BadgeCard.tsx`

```tsx
import React from 'react';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BadgeCardProps {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earnedAt?: string;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
  onClick?: () => void;
}

export const BadgeCard = ({
  name,
  description,
  iconUrl,
  rarity,
  earned,
  earnedAt,
  progress,
  onClick
}: BadgeCardProps) => {
  const rarityColors = {
    bronze: 'from-amber-500 to-orange-600',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 to-purple-600'
  };

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative p-6 rounded-xl cursor-pointer transition-all',
        earned
          ? 'bg-white shadow-lg'
          : 'bg-gray-50 opacity-60'
      )}
      onClick={onClick}
    >
      {/* Badge Icon */}
      <div className="relative mb-4">
        <div className={cn(
          'w-24 h-24 mx-auto rounded-full p-1',
          `bg-gradient-to-br ${rarityColors[rarity]}`
        )}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {earned ? (
              <img src={iconUrl} alt={name} className="w-16 h-16" />
            ) : (
              <Lock className="w-16 h-16 text-gray-400" />
            )}
          </div>
        </div>

        {earned && (
          <div className="absolute -top-2 -right-2">
            <Award className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>

        {earned ? (
          <div className="text-xs text-green-600 font-semibold">
            {new Date(earnedAt!).toLocaleDateString()} 획득
          </div>
        ) : progress && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {progress.current} / {progress.required}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

---

### 2.3 RankingCard

**파일**: `src/components/gamification/RankingCard.tsx`

```tsx
import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingCardProps {
  rank: number;
  user: {
    id: string;
    nickname: string;
    level: number;
    avatarUrl?: string;
  };
  score: number;
  change?: number;
  isCurrentUser?: boolean;
}

export const RankingCard = ({ rank, user, score, change, isCurrentUser }: RankingCardProps) => {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-400 to-gray-600';
      case 3: return 'from-amber-600 to-orange-700';
      default: return '';
    }
  };

  const getChangeIcon = () => {
    if (!change) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-400';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-xl transition-all',
      isCurrentUser
        ? 'bg-primary-50 border-2 border-primary-500'
        : 'bg-white hover:bg-gray-50'
    )}>
      {/* Rank */}
      <div className="relative">
        {rank <= 3 ? (
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            `bg-gradient-to-br ${getMedalColor(rank)}`
          )}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="font-bold text-gray-700">{rank}</span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1">
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt={user.nickname}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold text-gray-900">{user.nickname}</div>
          <div className="text-sm text-gray-600">레벨 {user.level}</div>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-mono font-bold text-lg">{score.toLocaleString()}</div>
        <div className={cn('flex items-center gap-1 text-sm', getChangeColor())}>
          {getChangeIcon()}
          {change !== undefined && Math.abs(change)}
        </div>
      </div>
    </div>
  );
};
```

---

## 3. 미션 컴포넌트

### 3.1 MissionCard

**파일**: `src/components/mission/MissionCard.tsx`

```tsx
import React from 'react';
import { Clock, Star, Coins, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MissionCardProps {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'story' | 'challenge';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  rewards: {
    xp: number;
    coins: number;
    cash?: number;
  };
  deadline?: string;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
  iconUrl?: string;
  onStart?: () => void;
  onContinue?: () => void;
  onView?: () => void;
}

export const MissionCard = ({
  title,
  description,
  type,
  status,
  rewards,
  deadline,
  progress,
  iconUrl,
  onStart,
  onContinue,
  onView
}: MissionCardProps) => {
  const typeColors = {
    daily: 'bg-blue-500',
    story: 'bg-purple-500',
    challenge: 'bg-orange-500'
  };

  const typeLabels = {
    daily: '일일 미션',
    story: '스토리 미션',
    challenge: '챌린지'
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'locked':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
            <Lock className="w-4 h-4 text-gray-500" />
            <span>잠김</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>완료</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full text-sm text-yellow-700">
            <Clock className="w-4 h-4" />
            <span>진행 중</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAction = () => {
    if (status === 'locked') {
      return null;
    }

    if (status === 'completed') {
      return (
        <Button variant="outline" size="sm" onClick={onView}>
          보기
        </Button>
      );
    }

    if (status === 'in_progress') {
      return (
        <Button variant="primary" size="sm" onClick={onContinue}>
          계속하기
          <ChevronRight className="w-4 h-4" />
        </Button>
      );
    }

    return (
      <Button variant="gradient" size="sm" onClick={onStart}>
        시작하기
        <ChevronRight className="w-4 h-4" />
      </Button>
    );
  };

  return (
    <Card hover={status !== 'locked'} className={cn(status === 'locked' && 'opacity-60')}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold text-white', typeColors[type])}>
            {typeLabels[type]}
          </span>
          {renderStatusBadge()}
        </div>

        <div className="flex items-start gap-3">
          {iconUrl && (
            <img src={iconUrl} alt={title} className="w-12 h-12" />
          )}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Progress */}
        {progress && status === 'in_progress' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">진행률</span>
              <span className="font-semibold">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progress.current} / {progress.required}
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4" />
            <span>{rewards.xp} XP</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <Coins className="w-4 h-4" />
            <span>{rewards.coins} 코인</span>
          </div>
          {rewards.cash && (
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <span>{rewards.cash.toLocaleString()}원</span>
            </div>
          )}
        </div>

        {/* Deadline */}
        {deadline && status !== 'completed' && (
          <div className="flex items-center gap-1 text-sm text-orange-600 mt-3">
            <Clock className="w-4 h-4" />
            <span>마감: {new Date(deadline).toLocaleString()}</span>
          </div>
        )}
      </CardBody>

      <CardFooter>
        {renderAction()}
      </CardFooter>
    </Card>
  );
};
```

---

(계속해서 더 많은 컴포넌트 문서 작성...)

**버전**: 2.0.0
**최종 업데이트**: 2025-01-10
**작성자**: Frontend Team
