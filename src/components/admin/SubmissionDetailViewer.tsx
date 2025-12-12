'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlideIn, FadeIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { 
  User,
  MapPin,
  Star,
  Calendar,
  Phone,
  FileText,
  Image as ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface MissionSubmission {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  missionId: string;
  missionTitle: string;
  missionDescription: string;
  missionType: 'challenge' | 'sns' | 'review' | 'attendance' | 'referral';
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  proofData: any;
  rewardAmount: number;
  experiencePoints: number;
  storeId?: string;
  storeName?: string;
  reviewData?: {
    rating: number;
    comment: string;
    images?: string[];
    platform?: string;
    reviewUrl?: string;
  };
  attendanceData?: {
    method: 'gps' | 'qr';
    location?: { latitude: number; longitude: number; accuracy: number };
    timestamp: string;
    distance?: number;
  };
  snsData?: {
    platform: string;
    postUrl: string;
    screenshots: string[];
    description: string;
  };
  referralData?: {
    referredUserName: string;
    referredUserPhone: string;
    registrationDate: string;
  };
  challengeData?: {
    description: string;
    images: string[];
    videos?: string[];
    completionDate: string;
  };
  priority: 'high' | 'medium' | 'low';
  autoApprovalEligible: boolean;
  adminNotes?: string;
}

interface SubmissionDetailViewerProps {
  submission: MissionSubmission;
  onApprove: (submissionId: string, notes?: string) => Promise<boolean>;
  onReject: (submissionId: string, reason: string, notes?: string) => Promise<boolean>;
  onClose: () => void;
  isLoading?: boolean;
}

export function SubmissionDetailViewer({
  submission,
  onApprove,
  onReject,
  onClose,
  isLoading = false
}: SubmissionDetailViewerProps) {
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // 승인 처리
  const handleApprove = async () => {
    setProcessing(true);
    try {
      const success = await onApprove(submission.id, adminNotes);
      if (success) {
        toast.success('제출물이 승인되었습니다');
        onClose();
      } else {
        toast.error('승인 처리 중 오류가 발생했습니다');
      }
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다');
    } finally {
      setProcessing(false);
    }
  };

  // 거부 처리
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요');
      return;
    }

    setProcessing(true);
    try {
      const success = await onReject(submission.id, rejectionReason, adminNotes);
      if (success) {
        toast.success('제출물이 거부되었습니다');
        onClose();
      } else {
        toast.error('거부 처리 중 오류가 발생했습니다');
      }
    } catch (error) {
      toast.error('거부 처리 중 오류가 발생했습니다');
    } finally {
      setProcessing(false);
    }
  };

  // 상태 배지 컴포넌트
  const StatusBadge = () => {
    switch (submission.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />승인됨</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />거부됨</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />대기중</Badge>;
    }
  };

  // 우선순위 배지
  const PriorityBadge = () => {
    const colorMap = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    const labelMap = {
      high: '높음',
      medium: '보통',
      low: '낮음'
    };
    
    return (
      <Badge className={colorMap[submission.priority]}>
        {labelMap[submission.priority]}
      </Badge>
    );
  };

  // 이미지 갤러리 렌더링
  const renderImageGallery = (images: string[], title: string) => {
    if (!images || images.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <FadeIn>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">제출물 상세 보기</h2>
              <p className="text-gray-600">{submission.missionTitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge />
              <PriorityBadge />
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </FadeIn>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <SlideIn direction="down">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>기본 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제출자</label>
                    <p className="mt-1 text-sm text-gray-900">{submission.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">연락처</label>
                    <p className="mt-1 text-sm text-gray-900">{submission.userPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제출일시</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">지점</label>
                    <p className="mt-1 text-sm text-gray-900">{submission.storeName || '-'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">리워드</label>
                      <p className="mt-1 text-sm font-semibold text-green-600">
                        {submission.rewardAmount.toLocaleString()}원
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">경험치</label>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {submission.experiencePoints}XP
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">자동승인</label>
                      <p className="mt-1">
                        {submission.autoApprovalEligible ? (
                          <Badge className="bg-blue-100 text-blue-800">가능</Badge>
                        ) : (
                          <Badge variant="secondary">불가</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          {/* 미션 정보 */}
          <SlideIn direction="left">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>미션 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">미션 제목</label>
                    <p className="mt-1 text-sm text-gray-900">{submission.missionTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">미션 설명</label>
                    <p className="mt-1 text-sm text-gray-700">{submission.missionDescription}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          {/* 제출 증빙 자료 */}
          <SlideIn direction="right">
            <Card>
              <CardHeader>
                <CardTitle>제출 증빙 자료</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">개요</TabsTrigger>
                    <TabsTrigger value="files">파일</TabsTrigger>
                    <TabsTrigger value="details">상세정보</TabsTrigger>
                    <TabsTrigger value="location">위치정보</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* 리뷰 미션 */}
                    {submission.missionType === 'review' && submission.reviewData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">평점</label>
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= submission.reviewData!.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              ({submission.reviewData.rating}/5)
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">리뷰 내용</label>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                            {submission.reviewData.comment}
                          </p>
                        </div>
                        {submission.reviewData.reviewUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">리뷰 링크</label>
                            <a
                              href={submission.reviewData.reviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {submission.reviewData.reviewUrl}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SNS 미션 */}
                    {submission.missionType === 'sns' && submission.snsData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">플랫폼</label>
                          <p className="mt-1 text-sm text-gray-900">{submission.snsData.platform}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">게시물 링크</label>
                          <a
                            href={submission.snsData.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {submission.snsData.postUrl}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">설명</label>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                            {submission.snsData.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 추천 미션 */}
                    {submission.missionType === 'referral' && submission.referralData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">추천 대상자</label>
                          <p className="mt-1 text-sm text-gray-900">{submission.referralData.referredUserName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">연락처</label>
                          <p className="mt-1 text-sm text-gray-900">{submission.referralData.referredUserPhone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">가입일</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(submission.referralData.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 챌린지 미션 */}
                    {submission.missionType === 'challenge' && submission.challengeData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">완료 설명</label>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                            {submission.challengeData.description}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">완료일</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(submission.challengeData.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    {/* 이미지 갤러리 */}
                    {submission.reviewData?.images && renderImageGallery(submission.reviewData.images, '리뷰 이미지')}
                    {submission.snsData?.screenshots && renderImageGallery(submission.snsData.screenshots, 'SNS 스크린샷')}
                    {submission.challengeData?.images && renderImageGallery(submission.challengeData.images, '챌린지 증빙 이미지')}

                    {/* 비디오 파일 */}
                    {submission.challengeData?.videos && submission.challengeData.videos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">증빙 비디오</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {submission.challengeData.videos.map((video, index) => (
                            <video
                              key={index}
                              src={video}
                              controls
                              className="w-full h-48 bg-gray-100 rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">상세 데이터</h4>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                        {JSON.stringify(submission.proofData, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    {submission.attendanceData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">출석 방법</label>
                          <Badge className="mt-1">
                            {submission.attendanceData.method === 'gps' ? 'GPS 위치' : 'QR 코드'}
                          </Badge>
                        </div>

                        {submission.attendanceData.location && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">위도</label>
                              <p className="mt-1 text-sm text-gray-900 font-mono">
                                {submission.attendanceData.location.latitude.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">경도</label>
                              <p className="mt-1 text-sm text-gray-900 font-mono">
                                {submission.attendanceData.location.longitude.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">정확도</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {Math.round(submission.attendanceData.location.accuracy)}m
                              </p>
                            </div>
                            {submission.attendanceData.distance && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">지점과의 거리</label>
                                <p className="mt-1 text-sm text-gray-900">
                                  {Math.round(submission.attendanceData.distance)}m
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700">출석 시간</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(submission.attendanceData.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </SlideIn>

          {/* 관리자 메모 */}
          <SlideIn direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>관리자 메모</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="검토 내용이나 특이사항을 기록하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </CardContent>
            </Card>
          </SlideIn>

          {/* 거부된 경우 거부 사유 표시 */}
          {submission.status === 'rejected' && submission.rejectionReason && (
            <SlideIn direction="up">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>거부 사유:</strong> {submission.rejectionReason}
                </AlertDescription>
              </Alert>
            </SlideIn>
          )}

          {/* 승인/거부 버튼 */}
          {submission.status === 'pending' && (
            <SlideIn direction="up">
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        거부 사유 (거부 시 필수)
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="거부 사유를 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing ? (
                          <Spinner size="sm" className="mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        승인
                      </Button>

                      <Button
                        onClick={handleReject}
                        disabled={processing || !rejectionReason.trim()}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing ? (
                          <Spinner size="sm" className="mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        거부
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          )}
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            {/* 현재 표시 중인 이미지 배열 찾기 */}
            {(() => {
              const allImages = [
                ...(submission.reviewData?.images || []),
                ...(submission.snsData?.screenshots || []),
                ...(submission.challengeData?.images || [])
              ];
              return allImages[selectedImageIndex] && (
                <img
                  src={allImages[selectedImageIndex]}
                  alt="확대 보기"
                  className="max-w-full max-h-full object-contain"
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}