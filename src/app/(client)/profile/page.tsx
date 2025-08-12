'use client';


import { ProgressRing } from '@/components/gamification/ProgressRing';
import { Header } from '@/components/layout/Header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  Phone,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
    const {
    user,
    missions,
    userMissions,
    paybacks,
    isAuthenticated
  } = useAppStore();

  // 클라이언트 사이드에서만 실행되도록 보장
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 서버 사이드에서는 빈 화면 반환
  if (!isMounted) {
    return null;
  }

  // 인증되지 않은 사용자 처리
  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  // 통계 계산
  const completedMissions = userMissions.filter(um =>
    um.status === 'completed' || um.status === 'verified'
  ).length;

  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  const paidPaybacks = paybacks.filter(p => p.status === 'paid');
  const pendingPaybacks = paybacks.filter(p => p.status === 'pending');

  const totalPaidAmount = paidPaybacks.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingAmount = pendingPaybacks.reduce((sum, p) => sum + p.amount, 0);

  // 레벨 정보
  const currentLevel = user.level || 1;
  const currentExp = user.experiencePoints || 0;
  const expToNext = currentLevel * 1000;
  const levelProgress = (currentExp % 1000) / 10; // 백분율

  // 가입일 계산
  const joinedDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 레퍼럴 코드 복사 함수
  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await navigator.clipboard.writeText(user.referralCode);
        toast.success('레퍼럴 코드가 복사되었습니다!');
      } catch {
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  // 레퍼럴 링크 복사 함수
  const copyReferralLink = async () => {
    if (user?.referralCode && typeof window !== 'undefined') {
      const referralLink = `${window.location.origin}/register?referral=${user.referralCode}`;
      try {
        await navigator.clipboard.writeText(referralLink);
        toast.success('추천 링크가 복사되었습니다!');
      } catch {
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  // 레퍼럴 링크 공유 함수
  const shareReferralLink = async () => {
    if (user?.referralCode && typeof window !== 'undefined') {
      const referralLink = `${window.location.origin}/register?referral=${user.referralCode}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: '드라이빙존 미션 시스템 추천',
            text: '운전면허 합격하고 페이백 받자! 드라이빙존 미션 시스템에 참여해보세요.',
            url: referralLink
          });
        } catch {
          // 공유 취소 시 에러가 발생할 수 있음
          console.log('Share cancelled');
        }
      } else {
        // Web Share API를 지원하지 않는 경우 복사
        copyReferralLink();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 hover:bg-white/60 dark:hover:bg-gray-800/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-black text-3xl">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {currentLevel > 1 && (
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-yellow-900">
                      레벨 {currentLevel}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{user.name}님</CardTitle>
                <CardDescription className="text-lg">
                  드라이빙존 멤버
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 기본 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">휴대폰</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">가입일</p>
                      <p className="font-medium">{joinedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">인증 상태</p>
                      <p className="font-medium text-green-600">
                        {user.phoneVerified ? '인증 완료' : '인증 필요'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 레벨 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">레벨 {currentLevel}</span>
                    </div>
                    <Badge variant="secondary">
                      {currentExp.toLocaleString()} XP
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>다음 레벨까지</span>
                      <span>{(expToNext - (currentExp % 1000)).toLocaleString()} XP</span>
                    </div>
                    <ProgressRing
                      progress={levelProgress}
                      size="sm"
                      color="#EAB308"
                      animated={true}
                      showValue={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 통계 및 성과 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 주요 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 완료한 미션 */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto mb-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {completedMissions}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    완료한 미션
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    총 {totalMissions}개 중
                  </p>
                </CardContent>
              </Card>

              {/* 총 페이백 */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4">
                    <Coins className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {totalPaidAmount.toLocaleString()}원
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-500">
                    지급받은 페이백
                  </p>
                </CardContent>
              </Card>

              {/* 완료율 */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {Math.round(completionRate)}%
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-500">
                    미션 완료율
                  </p>
                  <div className="mt-2">
                    <ProgressRing
                      progress={completionRate}
                      size="sm"
                      color="#A855F7"
                      showValue={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 페이백 내역 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>페이백 현황</span>
                </CardTitle>
                <CardDescription>
                  미션 완료에 따른 페이백 내역입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold text-green-700 dark:text-green-400">지급 완료</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {totalPaidAmount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paidPaybacks.length}건
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-orange-700 dark:text-orange-400">지급 대기</h4>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalPendingAmount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pendingPaybacks.length}건
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 레퍼럴 코드 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>친구 추천</span>
                </CardTitle>
                <CardDescription>
                  친구를 추천하고 함께 혜택을 받아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 레퍼럴 코드 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    나의 추천 코드
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={user?.referralCode || ''}
                      readOnly
                      className="font-mono text-lg bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 레퍼럴 링크 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    추천 링크
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={user?.referralCode ? `${typeof window !== 'undefined' ? window.location.origin : 'https://driving-zone.vercel.app'}/register?referral=${user.referralCode}` : ''}
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralLink}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 공유 버튼 */}
                <Button
                  onClick={shareReferralLink}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  친구에게 공유하기
                </Button>

                {/* 레퍼럴 혜택 안내 */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 text-sm">
                    🎁 추천 혜택
                  </h4>
                  <ul className="text-purple-800 dark:text-purple-400 text-xs space-y-1">
                    <li>• 친구가 가입하면 둘 다 보너스 포인트 획득</li>
                    <li>• 친구가 미션 완료 시 추가 보상</li>
                    <li>• 최대 3명까지 추천 가능</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 성취 배지 */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>성취 배지</span>
                </CardTitle>
                <CardDescription>
                  미션 완료로 획득한 배지들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 첫 번째 미션 완료 */}
                  {completedMissions >= 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="text-center p-4 bg-gradient-to-b from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-700"
                    >
                      <div className="text-3xl mb-2">🥉</div>
                      <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-400">
                        첫 미션 완료
                      </p>
                    </motion.div>
                  )}

                  {/* 절반 완료 */}
                  {completedMissions >= totalMissions / 2 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                      className="text-center p-4 bg-gradient-to-b from-silver-100 to-silver-200 dark:from-gray-700/20 dark:to-gray-600/20 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    >
                      <div className="text-3xl mb-2">🥈</div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-400">
                        절반 달성
                      </p>
                    </motion.div>
                  )}

                  {/* 모든 미션 완료 */}
                  {completedMissions >= totalMissions && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                      className="text-center p-4 bg-gradient-to-b from-yellow-200 to-yellow-300 dark:from-yellow-800/20 dark:to-yellow-700/20 rounded-lg border-2 border-yellow-400 dark:border-yellow-600"
                    >
                      <div className="text-3xl mb-2">🥇</div>
                      <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-300">
                        완주 달성
                      </p>
                    </motion.div>
                  )}

                  {/* 레벨업 */}
                  {currentLevel >= 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
                      className="text-center p-4 bg-gradient-to-b from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border-2 border-purple-300 dark:border-purple-700"
                    >
                      <div className="text-3xl mb-2">🚀</div>
                      <p className="font-semibold text-sm text-purple-800 dark:text-purple-400">
                        레벨업 마스터
                      </p>
                    </motion.div>
                  )}
                </div>

                {completedMissions === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>미션을 완료하면 배지를 획득할 수 있습니다!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
