'use client';

import { useEffect, useState } from 'react';

import { Header } from './Header';
import { MobileTabBar } from './MobileNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showMobileTabBar?: boolean;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  showMobileTabBar = true,
  className = ''
}: ResponsiveLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Header />
      
      {/* Main Content */}
      <main className={`
        pb-20 md:pb-6
        ${showMobileTabBar ? 'pb-20' : 'pb-6'}
      `}>
        {children}
      </main>

      {/* Mobile Tab Bar */}
      {showMobileTabBar && <MobileTabBar />}
    </div>
  );
}

// Hook for responsive breakpoints
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint
  };
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

export function ResponsiveGrid({
  children,
  className = '',
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3
}: ResponsiveGridProps) {
  const gridClasses = `
    grid gap-4
    grid-cols-${mobileColumns}
    md:grid-cols-${tabletColumns}
    lg:grid-cols-${desktopColumns}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Mobile-optimized container
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobileContainer({ 
  children, 
  className = '',
  padding = 'md'
}: MobileContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  return (
    <div className={`
      w-full max-w-7xl mx-auto
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}