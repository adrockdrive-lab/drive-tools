'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MissionForm } from './MissionForm';
import { MissionTemplates } from './MissionTemplates';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { ArrowLeft, Plus, Template, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

export function MissionCreator() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState<MissionFormData | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveMission = async (mission: MissionFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement mission creation API call
      console.log('Creating mission:', mission);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('미션이 성공적으로 생성되었습니다!');
      router.push('/admin/missions');
    } catch (error) {
      toast.error('미션 생성에 실패했습니다');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...template,
      targetStores: [],
      targetUserGroups: [],
      isActive: true,
      isRepeating: false
    });
    setActiveTab('form');
  };

  const handleCancel = () => {
    router.push('/admin/missions');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <SlideIn direction="down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HoverScale>
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
            </HoverScale>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">미션 생성</h1>
              <p className="text-gray-600">새로운 미션을 생성하거나 템플릿을 사용하세요</p>
            </div>
          </div>
        </div>
      </SlideIn>

      {/* 메인 콘텐츠 */}
      <SlideIn direction="up">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="h-6 w-6" />
              <span>미션 생성 도구</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="form" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>직접 생성</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <Template className="h-4 w-4" />
                  <span>템플릿 사용</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-6">
                <MissionForm
                  mission={formData}
                  onSave={handleSaveMission}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="templates" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">미션 템플릿 선택</h3>
                    <p className="text-gray-600">
                      검증된 템플릿을 사용하여 빠르게 미션을 생성하세요
                    </p>
                  </div>
                  
                  <MissionTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
}