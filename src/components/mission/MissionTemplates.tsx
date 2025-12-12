'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { 
  Target, 
  Instagram, 
  Star, 
  MapPin, 
  Users, 
  Copy,
  Edit,
  Eye,
  Calendar,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'challenge' | 'sns' | 'review' | 'attendance' | 'referral';
  category: 'beginner' | 'intermediate' | 'advanced' | 'event';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedReward: number;
  estimatedDuration: string;
  popularityScore: number;
  template: {
    title: string;
    description: string;
    rewardAmount: number;
    experiencePoints: number;
    requirements: Record<string, any>;
    conditions: Record<string, any>;
  };
  tags: string[];
  previewImage?: string;
}

const missionTemplates: MissionTemplate[] = [
  {
    id: '1',
    name: '신규 회원 첫 수업 챌린지',
    description: '신규 회원을 위한 첫 번째 학습 미션으로 운전 기초 교육 완료',
    type: 'challenge',
    category: 'beginner',
    difficulty: 1,
    estimatedReward: 10000,
    estimatedDuration: '2-3일',
    popularityScore: 95,
    template: {
      title: '첫 번째 운전 수업 완료하기',
      description: '신규 회원 환영! 첫 번째 운전 수업을 완료하고 기본기를 익혀보세요.',
      rewardAmount: 10000,
      experiencePoints: 200,
      requirements: {
        studyMinutes: 60,
        certificateType: 'license'
      },
      conditions: {
        maxLevel: 3
      }
    },
    tags: ['신규회원', '기초', '환영미션']
  },
  {
    id: '2',
    name: 'SNS 후기 공유 미션',
    description: '수강 후기를 SNS에 공유하여 브랜드 인지도 향상',
    type: 'sns',
    category: 'intermediate',
    difficulty: 2,
    estimatedReward: 15000,
    estimatedDuration: '1일',
    popularityScore: 88,
    template: {
      title: '운전학원 후기 SNS 공유하기',
      description: '수강 경험을 SNS에 공유하고 다른 사람들에게 도움을 주세요!',
      rewardAmount: 15000,
      experiencePoints: 150,
      requirements: {
        platforms: ['instagram', 'facebook'],
        minFollowers: 50
      },
      conditions: {
        minLevel: 2
      }
    },
    tags: ['SNS', '마케팅', '후기']
  },
  {
    id: '3',
    name: '구글 리뷰 작성 미션',
    description: '구글에 5점 리뷰를 작성하여 온라인 평판 관리',
    type: 'review',
    category: 'beginner',
    difficulty: 1,
    estimatedReward: 8000,
    estimatedDuration: '30분',
    popularityScore: 92,
    template: {
      title: '구글에 학원 리뷰 남기기',
      description: '학원에 대한 솔직한 리뷰를 구글에 작성해주세요.',
      rewardAmount: 8000,
      experiencePoints: 100,
      requirements: {
        platform: 'google',
        minRating: 4,
        minLength: 50
      },
      conditions: {}
    },
    tags: ['리뷰', '구글', '평점']
  },
  {
    id: '4',
    name: '7일 연속 출석 챌린지',
    description: '일주일 동안 매일 출석하여 학습 습관 형성',
    type: 'attendance',
    category: 'intermediate',
    difficulty: 3,
    estimatedReward: 25000,
    estimatedDuration: '7일',
    popularityScore: 85,
    template: {
      title: '7일 연속 출석 달성하기',
      description: '꾸준한 학습으로 운전 실력을 향상시켜보세요!',
      rewardAmount: 25000,
      experiencePoints: 300,
      requirements: {
        method: 'manual',
        consecutiveDays: 7,
        allowWeekends: false
      },
      conditions: {}
    },
    tags: ['출석', '습관형성', '연속']
  },
  {
    id: '5',
    name: '친구 3명 추천 미션',
    description: '친구 3명을 추천하여 함께 운전 배우기',
    type: 'referral',
    category: 'advanced',
    difficulty: 4,
    estimatedReward: 50000,
    estimatedDuration: '1-2주',
    popularityScore: 78,
    template: {
      title: '친구 3명 추천하고 함께 배우기',
      description: '친구들과 함께 운전을 배우면 더 재미있어요!',
      rewardAmount: 50000,
      experiencePoints: 500,
      requirements: {
        requiredReferrals: 3,
        referrerBonus: 10000
      },
      conditions: {
        minLevel: 5
      }
    },
    tags: ['추천', '친구', '고수익']
  },
  {
    id: '6',
    name: '주말 특별 출석 이벤트',
    description: '주말에도 출석하여 추가 보상 획득',
    type: 'attendance',
    category: 'event',
    difficulty: 2,
    estimatedReward: 20000,
    estimatedDuration: '주말',
    popularityScore: 90,
    template: {
      title: '주말 특별 출석 이벤트',
      description: '주말에도 열심히! 특별 보상을 받아가세요.',
      rewardAmount: 20000,
      experiencePoints: 250,
      requirements: {
        method: 'gps',
        consecutiveDays: 2,
        allowWeekends: true
      },
      conditions: {}
    },
    tags: ['주말', '이벤트', '특별보상']
  }
];

interface MissionTemplatesProps {
  onSelectTemplate: (template: MissionTemplate['template']) => void;
}

export function MissionTemplates({ onSelectTemplate }: MissionTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<MissionTemplate | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge': return Target;
      case 'sns': return Instagram;
      case 'review': return Star;
      case 'attendance': return MapPin;
      case 'referral': return Users;
      default: return Target;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'challenge': return 'text-blue-600';
      case 'sns': return 'text-pink-600';
      case 'review': return 'text-yellow-600';
      case 'attendance': return 'text-green-600';
      case 'referral': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'event': return '이벤트';
      default: return category;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'challenge': return '챌린지';
      case 'sns': return 'SNS';
      case 'review': return '리뷰';
      case 'attendance': return '출석';
      case 'referral': return '추천';
      default: return type;
    }
  };

  const filteredTemplates = missionTemplates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (selectedType !== 'all' && template.type !== selectedType) return false;
    return true;
  });

  const useTemplate = (template: MissionTemplate) => {
    onSelectTemplate(template.template);
    toast.success(`${template.name} 템플릿이 적용되었습니다`);
  };

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">카테고리</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">전체</option>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
            <option value="event">이벤트</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">미션 타입</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">전체</option>
            <option value="challenge">챌린지</option>
            <option value="sns">SNS</option>
            <option value="review">리뷰</option>
            <option value="attendance">출석</option>
            <option value="referral">추천</option>
          </select>
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const IconComponent = getTypeIcon(template.type);
          
          return (
            <SlideIn key={template.id} direction="up" delay={index * 0.1}>
              <HoverScale>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-5 w-5 ${getTypeColor(template.type)}`} />
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: template.difficulty }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-orange-400 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">예상 보상</span>
                        <p className="font-semibold text-green-600">
                          {template.estimatedReward.toLocaleString()}원
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">소요 시간</span>
                        <p className="font-semibold">
                          {template.estimatedDuration}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {template.popularityScore}%
                        </span>
                        <span className="text-xs text-gray-500">인기도</span>
                      </div>
                      <Badge variant="outline">
                        {getTypeLabel(template.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            미리보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <IconComponent className={`h-5 w-5 ${getTypeColor(template.type)}`} />
                              <span>{template.name}</span>
                            </DialogTitle>
                          </DialogHeader>
                          
                          {previewTemplate && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">미션 내용</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <h5 className="font-medium">{previewTemplate.template.title}</h5>
                                  <p className="text-sm text-gray-600">{previewTemplate.template.description}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">보상</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>금액:</span>
                                      <span className="font-medium">{previewTemplate.template.rewardAmount.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>경험치:</span>
                                      <span className="font-medium">{previewTemplate.template.experiencePoints} XP</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">조건</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    {Object.entries(previewTemplate.template.requirements).map(([key, value]) => (
                                      <div key={key} className="flex justify-between text-sm">
                                        <span>{key}:</span>
                                        <span className="font-medium">{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  onClick={() => useTemplate(previewTemplate)}
                                  className="flex items-center space-x-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span>이 템플릿 사용</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => useTemplate(template)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        사용
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </HoverScale>
            </SlideIn>
          );
        })}
      </div>
      
      {filteredTemplates.length === 0 && (
        <SlideIn direction="up">
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                조건에 맞는 템플릿이 없습니다
              </h3>
              <p className="text-gray-600">
                다른 필터 조건을 선택해보세요
              </p>
            </CardContent>
          </Card>
        </SlideIn>
      )}
    </div>
  );
}