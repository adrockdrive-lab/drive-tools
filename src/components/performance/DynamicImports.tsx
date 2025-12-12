'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/animations/LoadingAnimations';

// 애니메이션 컴포넌트들 - 무거우므로 동적 로딩
export const DynamicGameDashboard = dynamic(
  () => import('@/components/gamification/GameDashboard'),
  {
    loading: () => (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    ),
    ssr: false, // 클라이언트 사이드에서만 로딩
  }
);

// 관리자 페이지 컴포넌트들 - 일반 사용자에게는 불필요
export const DynamicAdvancedAnalytics = dynamic(
  () => import('@/components/admin/AdvancedAnalytics'),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-64 bg-secondary rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-secondary rounded animate-pulse"></div>
          <div className="h-32 bg-secondary rounded animate-pulse"></div>
        </div>
      </div>
    ),
  }
);

export const DynamicMarketingDashboard = dynamic(
  () => import('@/components/admin/MarketingDashboard'),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-8 bg-secondary rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-secondary rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
  }
);

export const DynamicFileManager = dynamic(
  () => import('@/components/admin/FileManager'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-16 bg-secondary rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-secondary rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
  }
);

// 애니메이션 관련 컴포넌트들 - 필요할 때만 로딩
export const DynamicPageTransition = dynamic(
  () => import('@/components/animations/PageTransition').then(mod => ({ default: mod.PageTransition })),
  {
    loading: () => <div className="min-h-screen" />,
    ssr: false,
  }
);

export const DynamicGestureInteractions = {
  SwipeToDismiss: dynamic(
    () => import('@/components/animations/GestureInteractions').then(mod => ({ default: mod.SwipeToDismiss })),
    { ssr: false }
  ),
  PullToRefresh: dynamic(
    () => import('@/components/animations/GestureInteractions').then(mod => ({ default: mod.PullToRefresh })),
    { ssr: false }
  ),
  SwipeNavigation: dynamic(
    () => import('@/components/animations/GestureInteractions').then(mod => ({ default: mod.SwipeNavigation })),
    { ssr: false }
  ),
  LongPress: dynamic(
    () => import('@/components/animations/GestureInteractions').then(mod => ({ default: mod.LongPress })),
    { ssr: false }
  ),
  PinchZoom: dynamic(
    () => import('@/components/animations/GestureInteractions').then(mod => ({ default: mod.PinchZoom })),
    { ssr: false }
  ),
};

// 미션 관련 컴포넌트들 - 필요한 페이지에서만 로딩
export const DynamicMissionSubmissionViewer = dynamic(
  () => import('@/components/mission/MissionSubmissionViewer'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 bg-secondary rounded animate-pulse"></div>
        <div className="h-64 bg-secondary rounded animate-pulse"></div>
      </div>
    ),
  }
);

export const DynamicFormRenderer = dynamic(
  () => import('@/components/mission/DynamicFormRenderer'),
  {
    loading: () => (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-secondary rounded animate-pulse"></div>
        ))}
      </div>
    ),
  }
);

// Framer Motion이 포함된 무거운 컴포넌트들을 지연 로딩
export const LazyMotionProvider = dynamic(
  () => import('framer-motion').then(mod => ({ 
    default: ({ children }: { children: React.ReactNode }) => (
      <mod.LazyMotion features={mod.domAnimation} strict>
        {children}
      </mod.LazyMotion>
    )
  })),
  { ssr: false }
);

// 차트 라이브러리 동적 로딩 (필요시 추가)
export const DynamicChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <div className="h-64 bg-secondary rounded animate-pulse" />,
    ssr: false,
  }
);