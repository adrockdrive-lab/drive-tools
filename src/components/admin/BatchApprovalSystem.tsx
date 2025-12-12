'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlideIn, FadeIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Eye,
  Users,
  FileText,
  Calendar,
  MapPin,
  Star,
  AlertTriangle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface MissionSubmission {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  missionId: string;
  missionTitle: string;
  missionType: 'challenge' | 'sns' | 'review' | 'attendance' | 'referral';
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  proofData: any;
  rewardAmount: number;
  experiencePoints: number;
  storeId?: string;
  storeName?: string;
  reviewData?: {
    rating: number;
    comment: string;
    images?: string[];
  };
  attendanceData?: {
    method: 'gps' | 'qr';
    location?: { latitude: number; longitude: number };
    timestamp: string;
  };
  priority: 'high' | 'medium' | 'low';
  autoApprovalEligible: boolean;
}

interface BatchApprovalFilters {
  status: string;
  missionType: string;
  priority: string;
  dateRange: string;
  storeId: string;
  autoApprovalOnly: boolean;
}

interface BatchApprovalSystemProps {
  submissions: MissionSubmission[];
  onBatchApprove: (submissionIds: string[], decision: 'approved' | 'rejected', reason?: string) => Promise<boolean>;
  onViewSubmission: (submission: MissionSubmission) => void;
  isLoading?: boolean;
  stores: Array<{ id: string; name: string; }>;
}

export function BatchApprovalSystem({
  submissions,
  onBatchApprove,
  onViewSubmission,
  isLoading = false,
  stores
}: BatchApprovalSystemProps) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<BatchApprovalFilters>({
    status: 'all',
    missionType: 'all',
    priority: 'all',
    dateRange: 'all',
    storeId: 'all',
    autoApprovalOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 필터링된 제출물
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // 상태 필터
      if (filters.status !== 'all' && submission.status !== filters.status) {
        return false;
      }

      // 미션 타입 필터
      if (filters.missionType !== 'all' && submission.missionType !== filters.missionType) {
        return false;
      }

      // 우선순위 필터
      if (filters.priority !== 'all' && submission.priority !== filters.priority) {
        return false;
      }

      // 지점 필터
      if (filters.storeId !== 'all' && submission.storeId !== filters.storeId) {
        return false;
      }

      // 자동 승인 대상만 필터
      if (filters.autoApprovalOnly && !submission.autoApprovalEligible) {
        return false;
      }

      // 날짜 범위 필터
      if (filters.dateRange !== 'all') {
        const submittedDate = new Date(submission.submittedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });
  }, [submissions, filters]);

  // 통계 계산
  const statistics = useMemo(() => {
    const total = filteredSubmissions.length;
    const pending = filteredSubmissions.filter(s => s.status === 'pending').length;
    const approved = filteredSubmissions.filter(s => s.status === 'approved').length;
    const rejected = filteredSubmissions.filter(s => s.status === 'rejected').length;
    const autoApprovalEligible = filteredSubmissions.filter(s => s.autoApprovalEligible && s.status === 'pending').length;
    const totalReward = filteredSubmissions
      .filter(s => s.status === 'pending' && selectedSubmissions.has(s.id))
      .reduce((sum, s) => sum + s.rewardAmount, 0);

    return { total, pending, approved, rejected, autoApprovalEligible, totalReward };
  }, [filteredSubmissions, selectedSubmissions]);

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredSubmissions
        .filter(s => s.status === 'pending')
        .map(s => s.id);
      setSelectedSubmissions(new Set(pendingIds));
    } else {
      setSelectedSubmissions(new Set());
    }
  };

  // 개별 선택/해제
  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    const newSelection = new Set(selectedSubmissions);
    if (checked) {
      newSelection.add(submissionId);
    } else {
      newSelection.delete(submissionId);
    }
    setSelectedSubmissions(newSelection);
  };

  // 자동 승인 대상 선택
  const selectAutoApprovalEligible = () => {
    const autoApprovalIds = filteredSubmissions
      .filter(s => s.autoApprovalEligible && s.status === 'pending')
      .map(s => s.id);
    setSelectedSubmissions(new Set(autoApprovalIds));
  };

  // 일괄 처리
  const handleBatchAction = async (decision: 'approved' | 'rejected') => {
    if (selectedSubmissions.size === 0) {
      toast.error('처리할 제출물을 선택해주세요');
      return;
    }

    if (decision === 'rejected' && !rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요');
      return;
    }

    setProcessing(true);
    try {
      const success = await onBatchApprove(
        Array.from(selectedSubmissions),
        decision,
        decision === 'rejected' ? rejectionReason : undefined
      );

      if (success) {
        toast.success(`${selectedSubmissions.size}개 제출물이 ${decision === 'approved' ? '승인' : '거부'}되었습니다`);
        setSelectedSubmissions(new Set());
        setRejectionReason('');
      } else {
        toast.error('처리 중 오류가 발생했습니다');
      }
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setProcessing(false);
    }
  };

  // 미션 타입 아이콘
  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Star className="h-4 w-4" />;
      case 'sns': return <Users className="h-4 w-4" />;
      case 'review': return <FileText className="h-4 w-4" />;
      case 'attendance': return <MapPin className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // 미션 타입 라벨
  const getMissionTypeLabel = (type: string) => {
    const labels = {
      challenge: '챌린지',
      sns: 'SNS',
      review: '리뷰',
      attendance: '출석',
      referral: '추천'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">일괄 승인 관리</h2>
            <p className="text-gray-600">미션 제출물을 효율적으로 승인하거나 거부할 수 있습니다</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>필터</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={selectAutoApprovalEligible}
              disabled={statistics.autoApprovalEligible === 0}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>자동승인 선택</span>
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* 통계 카드 */}
      <SlideIn direction="down">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
              <div className="text-sm text-gray-600">전체</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
              <div className="text-sm text-gray-600">대기중</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
              <div className="text-sm text-gray-600">승인됨</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
              <div className="text-sm text-gray-600">거부됨</div>
            </CardContent>
          </Card>
        </div>
      </SlideIn>

      {/* 필터 */}
      {showFilters && (
        <SlideIn direction="down">
          <Card>
            <CardHeader>
              <CardTitle>필터 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">상태</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="pending">대기중</SelectItem>
                      <SelectItem value="approved">승인됨</SelectItem>
                      <SelectItem value="rejected">거부됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">미션 타입</label>
                  <Select
                    value={filters.missionType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, missionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="challenge">챌린지</SelectItem>
                      <SelectItem value="sns">SNS</SelectItem>
                      <SelectItem value="review">리뷰</SelectItem>
                      <SelectItem value="attendance">출석</SelectItem>
                      <SelectItem value="referral">추천</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">우선순위</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">기간</label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="today">오늘</SelectItem>
                      <SelectItem value="week">1주일</SelectItem>
                      <SelectItem value="month">1개월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">지점</label>
                  <Select
                    value={filters.storeId}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, storeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.autoApprovalOnly}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, autoApprovalOnly: !!checked }))
                      }
                    />
                    <span className="text-sm">자동승인 대상만</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 선택된 항목 정보 및 일괄 작업 */}
      {selectedSubmissions.size > 0 && (
        <SlideIn direction="up">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    {selectedSubmissions.size}개 항목 선택됨
                  </span>
                  <Badge variant="secondary">
                    총 리워드: {statistics.totalReward.toLocaleString()}원
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* 거부 사유 입력 */}
                  <input
                    type="text"
                    placeholder="거부 사유 입력..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="px-3 py-1 border rounded text-sm w-48"
                  />
                  
                  <Button
                    onClick={() => handleBatchAction('approved')}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    일괄 승인
                  </Button>
                  
                  <Button
                    onClick={() => handleBatchAction('rejected')}
                    disabled={processing}
                    variant="destructive"
                  >
                    {processing ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    일괄 거부
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 제출물 목록 */}
      <SlideIn direction="up">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>제출물 목록</CardTitle>
              
              <div className="flex items-center space-x-2">
                {filteredSubmissions.filter(s => s.status === 'pending').length > 0 && (
                  <Checkbox
                    checked={
                      filteredSubmissions.filter(s => s.status === 'pending').length > 0 &&
                      filteredSubmissions
                        .filter(s => s.status === 'pending')
                        .every(s => selectedSubmissions.has(s.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                )}
                <span className="text-sm text-gray-600">전체 선택</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">조건에 맞는 제출물이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission, index) => (
                  <SlideIn key={submission.id} direction="left" delay={index * 0.05}>
                    <Card className={`border ${
                      submission.status === 'approved' ? 'border-green-200 bg-green-50' :
                      submission.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      submission.autoApprovalEligible ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {/* 체크박스 */}
                          {submission.status === 'pending' && (
                            <Checkbox
                              checked={selectedSubmissions.has(submission.id)}
                              onCheckedChange={(checked) => 
                                handleSelectSubmission(submission.id, !!checked)
                              }
                            />
                          )}

                          {/* 미션 타입 아이콘 */}
                          <div className="flex-shrink-0">
                            {getMissionTypeIcon(submission.missionType)}
                          </div>

                          {/* 제출물 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {submission.missionTitle}
                              </h4>
                              <Badge variant="outline">
                                {getMissionTypeLabel(submission.missionType)}
                              </Badge>
                              <Badge className={getPriorityColor(submission.priority)}>
                                {submission.priority === 'high' ? '높음' :
                                 submission.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                              {submission.autoApprovalEligible && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  자동승인 가능
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{submission.userName}</span>
                              <span>{submission.userPhone}</span>
                              {submission.storeName && <span>{submission.storeName}</span>}
                              <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* 리워드 정보 */}
                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">
                              {submission.rewardAmount.toLocaleString()}원
                            </div>
                            <div className="text-gray-600">
                              {submission.experiencePoints}XP
                            </div>
                          </div>

                          {/* 상태 */}
                          <div className="flex items-center space-x-2">
                            {submission.status === 'pending' && (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                            {submission.status === 'approved' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {submission.status === 'rejected' && (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewSubmission(submission)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              상세보기
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SlideIn>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SlideIn>

      {/* 자동 승인 안내 */}
      {statistics.autoApprovalEligible > 0 && (
        <SlideIn direction="up" delay={0.1}>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>자동 승인 대상 {statistics.autoApprovalEligible}개</strong>가 있습니다. 
              이들은 모든 조건을 만족하여 자동으로 승인할 수 있습니다.
            </AlertDescription>
          </Alert>
        </SlideIn>
      )}
    </div>
  );
}