'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Gift, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileContainer, ResponsiveLayout, useResponsive } from '@/components/layout/ResponsiveLayout';
import type { Mission } from '@/types';

interface MissionLayoutProps {
  mission?: Mission;
  children: React.ReactNode;
  title: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'verified';
  isLoading?: boolean;
}

const statusConfig = {
  pending: { label: '시작 전', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '진행 중', color: 'bg-blue-100 text-blue-600' },
  completed: { label: '완료', color: 'bg-green-100 text-green-600' },
  verified: { label: '검증 완료', color: 'bg-purple-100 text-purple-600' }
};

export function MissionLayout({
  mission,
  children,
  title,
  description,
  status = 'pending',
  isLoading = false
}: MissionLayoutProps) {
  const router = useRouter();
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <MobileContainer className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </MobileContainer>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <MobileContainer className="space-y-6">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center space-x-3"
        >
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
        </motion.div>

        {/* Mission Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className={`${isMobile ? 'pb-4' : 'pb-6'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>
                        {title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={statusConfig[status].color}>
                          {statusConfig[status].label}
                        </Badge>
                        {mission && (
                          <Badge variant="outline" className="text-xs">
                            💰 {mission.paybackAmount.toLocaleString()}원
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                    {description}
                  </p>
                </div>
              </div>

              {/* Mission Info */}
              {mission && (
                <div className={`flex flex-wrap gap-4 mt-4 ${isMobile ? 'justify-center' : ''}`}>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Gift className="w-4 h-4" />
                    <span>페이백: {mission.paybackAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      기한: {new Date(mission.endDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        {/* Mission Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {children}
        </motion.div>
      </MobileContainer>
    </ResponsiveLayout>
  );
}

// Mission Step Component for better organization
interface MissionStepProps {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  completed?: boolean;
}

export function MissionStep({ 
  step, 
  title, 
  description, 
  children, 
  completed = false 
}: MissionStepProps) {
  const { isMobile } = useResponsive();

  return (
    <Card className={`transition-all duration-200 ${completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${completed 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-100 text-blue-600'
            }
          `}>
            {completed ? '✓' : step}
          </div>
          <div className="flex-1">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} ${completed ? 'text-green-700' : 'text-gray-900'}`}>
              {title}
            </CardTitle>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Mobile-optimized form container
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function MobileForm({ children, onSubmit, className = '' }: MobileFormProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
    >
      {children}
    </form>
  );
}