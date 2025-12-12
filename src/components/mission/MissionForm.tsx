'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { 
  Save, 
  Copy, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Target,
  Gift,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MissionFormData {
  id?: number;
  title: string;
  description: string;
  type: 'challenge' | 'sns' | 'review' | 'attendance' | 'referral';
  rewardAmount: number;
  experiencePoints: number;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isRepeating: boolean;
  repeatPattern?: 'daily' | 'weekly' | 'monthly';
  targetStores: string[];
  targetUserGroups: string[];
  requirements: Record<string, any>;
  conditions: {
    minLevel?: number;
    maxLevel?: number;
    requiredMissions?: number[];
    excludedUsers?: string[];
  };
}

interface MissionFormProps {
  mission?: MissionFormData;
  onSave: (mission: MissionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MissionForm({ mission, onSave, onCancel, isLoading }: MissionFormProps) {
  const [formData, setFormData] = useState<MissionFormData>({
    title: '',
    description: '',
    type: 'challenge',
    rewardAmount: 0,
    experiencePoints: 100,
    isActive: true,
    isRepeating: false,
    targetStores: [],
    targetUserGroups: [],
    requirements: {},
    conditions: {}
  });

  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (mission) {
      setFormData(mission);
    }
    loadStores();
  }, [mission]);

  const loadStores = async () => {
    // TODO: Load stores from Supabase
    // For now, use mock data
    setAvailableStores([
      { id: '1', name: '강남점', region: '서울' },
      { id: '2', name: '홍대점', region: '서울' },
      { id: '3', name: '부산점', region: '부산' }
    ]);
  };

  const handleInputChange = (field: keyof MissionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequirementChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [key]: value
      }
    }));
  };

  const handleConditionChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: value
      }
    }));
  };

  const addTargetStore = (storeId: string) => {
    if (!formData.targetStores.includes(storeId)) {
      handleInputChange('targetStores', [...formData.targetStores, storeId]);
    }
  };

  const removeTargetStore = (storeId: string) => {
    handleInputChange('targetStores', formData.targetStores.filter(id => id !== storeId));
  };

  const addUserGroup = () => {
    if (newTag.trim() && !formData.targetUserGroups.includes(newTag.trim())) {
      handleInputChange('targetUserGroups', [...formData.targetUserGroups, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeUserGroup = (group: string) => {
    handleInputChange('targetUserGroups', formData.targetUserGroups.filter(g => g !== group));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('미션 제목을 입력해주세요');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('미션 설명을 입력해주세요');
      return;
    }

    if (formData.rewardAmount < 0) {
      toast.error('보상 금액은 0 이상이어야 합니다');
      return;
    }

    try {
      await onSave(formData);
      toast.success(mission ? '미션이 수정되었습니다' : '미션이 생성되었습니다');
    } catch (error) {
      toast.error('미션 저장에 실패했습니다');
    }
  };

  const copyMission = () => {
    const copiedMission = {
      ...formData,
      id: undefined,
      title: `${formData.title} (복사본)`,
      isActive: false
    };
    setFormData(copiedMission);
    toast.success('미션이 복사되었습니다');
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'challenge':
        return (
          <div className="space-y-4">
            <div>
              <Label>필요 학습 시간 (분)</Label>
              <Input
                type="number"
                value={formData.requirements.studyMinutes || ''}
                onChange={(e) => handleRequirementChange('studyMinutes', parseInt(e.target.value) || 0)}
                placeholder="예: 60"
              />
            </div>
            <div>
              <Label>필요 자격증 종류</Label>
              <Select value={formData.requirements.certificateType || ''} onValueChange={(value) => handleRequirementChange('certificateType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="자격증 종류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license">운전면허</SelectItem>
                  <SelectItem value="safety">안전운전</SelectItem>
                  <SelectItem value="professional">전문자격</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'sns':
        return (
          <div className="space-y-4">
            <div>
              <Label>지원 플랫폼</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['instagram', 'facebook', 'youtube', 'tiktok'].map(platform => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.requirements.platforms?.includes(platform) || false}
                      onChange={(e) => {
                        const platforms = formData.requirements.platforms || [];
                        if (e.target.checked) {
                          handleRequirementChange('platforms', [...platforms, platform]);
                        } else {
                          handleRequirementChange('platforms', platforms.filter((p: string) => p !== platform));
                        }
                      }}
                    />
                    <span className="capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>최소 팔로워 수</Label>
              <Input
                type="number"
                value={formData.requirements.minFollowers || ''}
                onChange={(e) => handleRequirementChange('minFollowers', parseInt(e.target.value) || 0)}
                placeholder="예: 100"
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div>
              <Label>리뷰 플랫폼</Label>
              <Select value={formData.requirements.platform || ''} onValueChange={(value) => handleRequirementChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="naver">네이버</SelectItem>
                  <SelectItem value="kakao">카카오맵</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>최소 별점</Label>
              <Select value={formData.requirements.minRating?.toString() || ''} onValueChange={(value) => handleRequirementChange('minRating', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="별점 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1점</SelectItem>
                  <SelectItem value="2">2점</SelectItem>
                  <SelectItem value="3">3점</SelectItem>
                  <SelectItem value="4">4점</SelectItem>
                  <SelectItem value="5">5점</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>최소 리뷰 길이 (글자)</Label>
              <Input
                type="number"
                value={formData.requirements.minLength || ''}
                onChange={(e) => handleRequirementChange('minLength', parseInt(e.target.value) || 0)}
                placeholder="예: 50"
              />
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-4">
            <div>
              <Label>출석 방식</Label>
              <Select value={formData.requirements.method || ''} onValueChange={(value) => handleRequirementChange('method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="출석 방식 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">수동 체크</SelectItem>
                  <SelectItem value="gps">GPS 인증</SelectItem>
                  <SelectItem value="qr">QR 코드</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>연속 출석 일수</Label>
              <Input
                type="number"
                value={formData.requirements.consecutiveDays || ''}
                onChange={(e) => handleRequirementChange('consecutiveDays', parseInt(e.target.value) || 1)}
                placeholder="예: 7"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.requirements.allowWeekends || false}
                onCheckedChange={(checked) => handleRequirementChange('allowWeekends', checked)}
              />
              <Label>주말 출석 허용</Label>
            </div>
          </div>
        );

      case 'referral':
        return (
          <div className="space-y-4">
            <div>
              <Label>필요 추천 인원</Label>
              <Input
                type="number"
                value={formData.requirements.requiredReferrals || ''}
                onChange={(e) => handleRequirementChange('requiredReferrals', parseInt(e.target.value) || 1)}
                placeholder="예: 3"
              />
            </div>
            <div>
              <Label>추천인 보상 금액</Label>
              <Input
                type="number"
                value={formData.requirements.referrerBonus || ''}
                onChange={(e) => handleRequirementChange('referrerBonus', parseInt(e.target.value) || 0)}
                placeholder="예: 5000"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {mission ? '미션 수정' : '새 미션 생성'}
        </h2>
        <div className="flex space-x-2">
          {mission && (
            <HoverScale>
              <Button type="button" variant="outline" onClick={copyMission}>
                <Copy className="h-4 w-4 mr-2" />
                복사
              </Button>
            </HoverScale>
          )}
          <HoverScale>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </HoverScale>
          <HoverScale>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mission ? '수정' : '생성'}
            </Button>
          </HoverScale>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <SlideIn direction="left">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>기본 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">미션 제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="미션 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">미션 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="미션에 대한 자세한 설명을 입력하세요"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">미션 타입</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">챌린지</SelectItem>
                    <SelectItem value="sns">SNS</SelectItem>
                    <SelectItem value="review">리뷰</SelectItem>
                    <SelectItem value="attendance">출석</SelectItem>
                    <SelectItem value="referral">추천</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardAmount">보상 금액 (원)</Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    value={formData.rewardAmount}
                    onChange={(e) => handleInputChange('rewardAmount', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="experiencePoints">경험치</Label>
                  <Input
                    id="experiencePoints"
                    type="number"
                    value={formData.experiencePoints}
                    onChange={(e) => handleInputChange('experiencePoints', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxParticipants">최대 참여자 수 (선택사항)</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || undefined)}
                  placeholder="제한 없음"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* 미션 조건 */}
        <SlideIn direction="right">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>미션 조건</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderTypeSpecificFields()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>최소 레벨</Label>
                  <Input
                    type="number"
                    value={formData.conditions.minLevel || ''}
                    onChange={(e) => handleConditionChange('minLevel', parseInt(e.target.value) || undefined)}
                    placeholder="제한 없음"
                    min="1"
                  />
                </div>
                <div>
                  <Label>최대 레벨</Label>
                  <Input
                    type="number"
                    value={formData.conditions.maxLevel || ''}
                    onChange={(e) => handleConditionChange('maxLevel', parseInt(e.target.value) || undefined)}
                    placeholder="제한 없음"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>선행 미션 개수</Label>
                <Input
                  type="number"
                  value={formData.conditions.requiredMissions?.length || ''}
                  onChange={(e) => handleConditionChange('requiredMissions', 
                    Array(parseInt(e.target.value) || 0).fill(0).map((_, i) => i + 1)
                  )}
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* 일정 및 반복 설정 */}
        <SlideIn direction="left" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>일정 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>시작일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date)}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>종료일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange('endDate', date)}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isRepeating}
                  onCheckedChange={(checked) => handleInputChange('isRepeating', checked)}
                />
                <Label>반복 미션</Label>
              </div>

              {formData.isRepeating && (
                <div>
                  <Label>반복 주기</Label>
                  <Select value={formData.repeatPattern || ''} onValueChange={(value: any) => handleInputChange('repeatPattern', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="반복 주기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label>미션 활성화</Label>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* 대상 설정 */}
        <SlideIn direction="right" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>대상 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>대상 지점</Label>
                <Select onValueChange={addTargetStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="지점 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 지점</SelectItem>
                    {availableStores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} ({store.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetStores.map(storeId => {
                    const store = availableStores.find(s => s.id === storeId);
                    return (
                      <Badge key={storeId} variant="secondary">
                        {store?.name || '전체 지점'}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => removeTargetStore(storeId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>대상 사용자 그룹</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="그룹명 입력 (예: 신규회원, VIP)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUserGroup())}
                  />
                  <Button type="button" onClick={addUserGroup} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetUserGroups.map(group => (
                    <Badge key={group} variant="secondary">
                      {group}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeUserGroup(group)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </form>
  );
}