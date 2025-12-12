'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Zap, Database, Globe, BarChart3 } from 'lucide-react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  bundleSize?: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 표시
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      measurePerformance();
      
      const interval = setInterval(measurePerformance, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const measurePerformance = () => {
    // Core Web Vitals 측정
    if ('web-vital' in window) {
      // Web Vitals 라이브러리가 있는 경우
      measureWebVitals();
    }

    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Memory usage
    const memory = (performance as any).memory;
    if (memory) {
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });
    }

    // 기본 성능 메트릭 계산
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
    
    // API 응답 시간 측정 (가장 최근 fetch 요청 기준)
    const resourceEntries = performance.getEntriesByType('resource');
    const apiCalls = resourceEntries.filter(entry => 
      entry.name.includes('/api/') || entry.name.includes('supabase')
    );
    const avgApiTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, entry) => sum + entry.duration, 0) / apiCalls.length 
      : 0;

    // 캐시 히트율 추정 (304 응답 비율)
    const cachedResources = resourceEntries.filter(entry => 
      (entry as any).transferSize === 0 || (entry as any).transferSize < (entry as any).decodedBodySize
    );
    const cacheHitRate = resourceEntries.length > 0 
      ? (cachedResources.length / resourceEntries.length) * 100 
      : 0;

    setMetrics({
      loadTime: Math.round(loadTime),
      renderTime: Math.round(renderTime),
      apiResponseTime: Math.round(avgApiTime),
      cacheHitRate: Math.round(cacheHitRate),
      fcp: navigation?.responseStart ? Math.round(navigation.responseStart - navigation.fetchStart) : undefined,
      ttfb: navigation?.responseStart ? Math.round(navigation.responseStart - navigation.requestStart) : undefined,
    });
  };

  const measureWebVitals = () => {
    // Web Vitals 측정 (실제 구현시 web-vitals 라이브러리 사용)
    if (typeof window !== 'undefined') {
      // LCP 측정
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => prev ? { ...prev, lcp: Math.round(lastEntry.startTime) } : null);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS 측정
      new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        setMetrics(prev => prev ? { ...prev, cls: Math.round(cls * 1000) / 1000 } : null);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  };

  const getPerformanceScore = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
      loadTime: { good: 3000, poor: 5000 },
      renderTime: { good: 100, poor: 300 },
      apiResponseTime: { good: 200, poor: 1000 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearPerformance = () => {
    if (typeof window !== 'undefined') {
      performance.clearResourceTimings();
      performance.clearMarks();
      performance.clearMeasures();
    }
  };

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            성능 모니터
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="ml-auto h-6 w-6 p-0 text-gray-400"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Core Web Vitals */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-300">Core Web Vitals</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {metrics.lcp && (
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <Badge variant={getPerformanceScore('lcp', metrics.lcp) === 'good' ? 'default' : 'destructive'}>
                    {metrics.lcp}ms
                  </Badge>
                </div>
              )}
              {metrics.cls !== undefined && (
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <Badge variant={getPerformanceScore('cls', metrics.cls) === 'good' ? 'default' : 'destructive'}>
                    {metrics.cls}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* 로딩 성능 */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-300 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              로딩 성능
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>페이지 로드:</span>
                <Badge variant={getPerformanceScore('loadTime', metrics.loadTime) === 'good' ? 'default' : 'destructive'}>
                  {metrics.loadTime}ms
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>렌더링:</span>
                <Badge variant={getPerformanceScore('renderTime', metrics.renderTime) === 'good' ? 'default' : 'destructive'}>
                  {metrics.renderTime}ms
                </Badge>
              </div>
              {metrics.ttfb && (
                <div className="flex justify-between">
                  <span>TTFB:</span>
                  <Badge variant={getPerformanceScore('ttfb', metrics.ttfb) === 'good' ? 'default' : 'destructive'}>
                    {metrics.ttfb}ms
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* API 성능 */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-300 flex items-center gap-1">
              <Database className="h-3 w-3" />
              API 성능
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>응답 시간:</span>
                <Badge variant={getPerformanceScore('apiResponseTime', metrics.apiResponseTime) === 'good' ? 'default' : 'destructive'}>
                  {metrics.apiResponseTime}ms
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>캐시 히트율:</span>
                <Badge variant={metrics.cacheHitRate > 70 ? 'default' : 'destructive'}>
                  {metrics.cacheHitRate}%
                </Badge>
              </div>
            </div>
          </div>

          {/* 메모리 사용량 */}
          {memoryInfo && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-300 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                메모리
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>사용중:</span>
                  <span>{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>총 할당:</span>
                  <span>{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={clearPerformance}
            className="w-full text-xs h-7"
          >
            성능 데이터 초기화
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 성능 측정 데코레이터
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`${name} 실행 시간: ${end - start}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`${name} 실행 시간: ${end - start}ms`);
      return result;
    }
  }) as T;
}

// React Hook for performance monitoring
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${componentName} 렌더링 시간: ${end - start}ms`);
    };
  }, [componentName]);
}