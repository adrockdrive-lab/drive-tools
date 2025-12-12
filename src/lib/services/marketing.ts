import { supabase } from '@/lib/supabase'
import type { MissionDefinition, MissionType, FormField, CouponType, DiscountType } from '@/types'

interface MarketingEventTemplate {
  id: string
  name: string
  description: string
  missionType: MissionType
  rewardAmount: number
  formFields: FormField[]
  duration: number // 일수
  couponReward?: {
    type: CouponType
    discountType: DiscountType
    discountValue: number
  }
}

export const marketingService = {
  // ===============================================
  // 마케팅 이벤트 템플릿
  // ===============================================

  // 미리 정의된 마케팅 이벤트 템플릿들
  getEventTemplates(): MarketingEventTemplate[] {
    return [
      {
        id: 'seasonal_challenge',
        name: '🌸 봄맞이 특별 챌린지',
        description: '봄을 맞이하여 특별히 준비한 챌린지 미션입니다.',
        missionType: 'challenge',
        rewardAmount: 30000,
        formFields: [
          {
            id: 'certificateFile',
            label: '합격증 사진',
            type: 'file',
            required: true,
            accept: 'image/*',
            helpText: '운전면허 필기시험 합격증을 촬영하여 업로드해주세요'
          },
          {
            id: 'studyHours',
            label: '공부 시간 (시간)',
            type: 'number',
            required: true,
            minValue: 1,
            maxValue: 20,
            helpText: '특별 이벤트로 최대 20시간까지 인정됩니다'
          },
          {
            id: 'seasonalMessage',
            label: '봄맞이 다짐',
            type: 'textarea',
            required: false,
            placeholder: '운전면허 취득을 향한 봄맞이 다짐을 작성해주세요',
            maxLength: 200
          }
        ],
        duration: 14,
        couponReward: {
          type: 'discount',
          discountType: 'percentage',
          discountValue: 20
        }
      },
      {
        id: 'weekend_sns_boost',
        name: '📱 주말 SNS 부스터',
        description: '주말 동안 SNS에서 드라이빙존을 홍보하고 추가 보상을 받아보세요!',
        missionType: 'sns_enhanced',
        rewardAmount: 15000,
        formFields: [
          {
            id: 'snsUrl',
            label: 'SNS 게시물 링크',
            type: 'url',
            required: true,
            placeholder: 'https://www.instagram.com/p/...',
            helpText: '주말 특별 이벤트 해시태그와 함께 게시해주세요'
          },
          {
            id: 'platform',
            label: 'SNS 플랫폼',
            type: 'select',
            required: true,
            options: [
              { value: 'instagram', label: 'Instagram' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'tiktok', label: 'TikTok' },
              { value: 'youtube', label: 'YouTube' }
            ]
          },
          {
            id: 'hashtags',
            label: '사용한 해시태그',
            type: 'textarea',
            required: true,
            placeholder: '#드라이빙존주말이벤트 #운전면허 #주말특가',
            helpText: '반드시 #드라이빙존주말이벤트 해시태그를 포함해야 합니다'
          },
          {
            id: 'followerCount',
            label: '팔로워 수 (선택)',
            type: 'number',
            required: false,
            helpText: '팔로워 수에 따라 추가 보상이 제공될 수 있습니다'
          }
        ],
        duration: 2, // 주말 이벤트
        couponReward: {
          type: 'coffee',
          discountType: 'fixed',
          discountValue: 5000
        }
      },
      {
        id: 'friend_bring_event',
        name: '👥 친구와 함께 이벤트',
        description: '친구를 더 많이 초대할수록 더 큰 보상을 받는 특별 이벤트!',
        missionType: 'referral_enhanced',
        rewardAmount: 80000,
        formFields: [
          {
            id: 'referralTargets',
            label: '초대할 친구 수 목표',
            type: 'select',
            required: true,
            options: [
              { value: '3', label: '3명 (기본 보상)' },
              { value: '5', label: '5명 (1.5배 보상)' },
              { value: '7', label: '7명 (2배 보상)' },
              { value: '10', label: '10명 (3배 보상!)' }
            ]
          },
          {
            id: 'invitationMethod',
            label: '초대 방법',
            type: 'select',
            required: true,
            options: [
              { value: 'kakao', label: '카카오톡' },
              { value: 'sms', label: '문자메시지' },
              { value: 'social', label: '소셜미디어' },
              { value: 'offline', label: '직접 만나서' }
            ]
          },
          {
            id: 'eventMessage',
            label: '이벤트 홍보 메시지',
            type: 'textarea',
            required: false,
            placeholder: '친구들에게 보낸 초대 메시지를 공유해주세요',
            maxLength: 300
          }
        ],
        duration: 7
      },
      {
        id: 'review_marathon',
        name: '✍️ 리뷰 마라톤 위크',
        description: '일주일간 다양한 플랫폼에 리뷰를 작성하고 누적 보상을 받아보세요!',
        missionType: 'review_enhanced',
        rewardAmount: 50000,
        formFields: [
          {
            id: 'naverReviewUrl',
            label: '네이버 리뷰 링크',
            type: 'url',
            required: true,
            placeholder: 'https://smartplace.naver.com/...'
          },
          {
            id: 'googleReviewUrl',
            label: '구글 리뷰 링크',
            type: 'url',
            required: true,
            placeholder: 'https://maps.google.com/...'
          },
          {
            id: 'appReviewUrl',
            label: '앱 리뷰 링크 (선택)',
            type: 'url',
            required: false,
            placeholder: '운전면허 관련 앱 리뷰 링크'
          },
          {
            id: 'blogReviewUrl',
            label: '블로그/카페 후기 (선택)',
            type: 'url',
            required: false,
            placeholder: '블로그나 카페에 작성한 후기 링크'
          },
          {
            id: 'reviewSummary',
            label: '리뷰 요약',
            type: 'textarea',
            required: true,
            placeholder: '작성한 리뷰들의 핵심 내용을 요약해주세요',
            maxLength: 500
          }
        ],
        duration: 7,
        couponReward: {
          type: 'gift',
          discountType: 'fixed',
          discountValue: 20000
        }
      },
      {
        id: 'daily_attendance_boost',
        name: '📅 출석체크 부스터',
        description: '연속 출석으로 누적 보상을 받는 특별 이벤트!',
        missionType: 'attendance',
        rewardAmount: 1000, // 일일 기본 보상
        formFields: [
          {
            id: 'attendanceGoal',
            label: '출석 목표',
            type: 'select',
            required: true,
            options: [
              { value: '7', label: '7일 연속 (기본)' },
              { value: '14', label: '14일 연속 (2배 보상)' },
              { value: '21', label: '21일 연속 (3배 보상)' },
              { value: '30', label: '30일 연속 (5배 보상!)' }
            ]
          },
          {
            id: 'motivationMessage',
            label: '오늘의 동기부여 한마디',
            type: 'text',
            required: false,
            placeholder: '오늘 하루를 시작하는 동기부여 한마디',
            maxLength: 100
          }
        ],
        duration: 30
      }
    ]
  },

  // ===============================================
  // 이벤트 미션 생성
  // ===============================================

  // 템플릿을 기반으로 실제 이벤트 미션 생성
  async createEventMission(
    templateId: string,
    customizations: {
      title?: string
      description?: string
      rewardAmount?: number
      startDate?: string
      endDate?: string
      storeId?: number | null
      isGlobal?: boolean
      maxParticipants?: number
    }
  ): Promise<{ success: boolean; mission?: MissionDefinition; error?: string }> {
    try {
      const templates = this.getEventTemplates()
      const template = templates.find(t => t.id === templateId)

      if (!template) {
        return { success: false, error: '템플릿을 찾을 수 없습니다.' }
      }

      // 기본값 설정
      const startDate = customizations.startDate || new Date().toISOString()
      const endDate = customizations.endDate || new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000).toISOString()

      // 동적 폼 설정 생성
      const formConfig = {
        fields: template.formFields,
        maxRewardAmount: customizations.rewardAmount || template.rewardAmount,
        requiresManualVerification: true,
        autoApprove: false
      }

      // 미션 정의 생성
      const { data, error } = await supabase
        .from('mission_definitions')
        .insert({
          title: customizations.title || template.name,
          description: customizations.description || template.description,
          mission_type: template.missionType,
          reward_amount: customizations.rewardAmount || template.rewardAmount,
          form_config: formConfig,
          is_active: true,
          is_global: customizations.isGlobal ?? true,
          store_id: customizations.storeId,
          max_participants: customizations.maxParticipants,
          start_date: startDate,
          end_date: endDate,
          created_by: 'marketing_system'
        })
        .select()
        .single()

      if (error) throw error

      // 쿠폰 보상이 있으면 자동으로 생성
      if (template.couponReward) {
        const { couponService } = await import('./coupons')
        await couponService.createCoupon({
          code: `EVENT-${data.id}-${Date.now()}`,
          title: `${template.name} 완료 보상`,
          description: '이벤트 미션 완료 보상으로 받은 쿠폰입니다.',
          type: template.couponReward.type,
          discountType: template.couponReward.discountType,
          discountValue: template.couponReward.discountValue,
          validFrom: startDate,
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60일 유효
          isGlobal: customizations.isGlobal ?? true,
          storeId: customizations.storeId
        })
      }

      const mission: MissionDefinition = {
        id: data.id,
        title: data.title,
        description: data.description,
        missionType: data.mission_type,
        rewardAmount: data.reward_amount,
        requirements: data.requirements,
        proofRequirements: data.proof_requirements,
        formConfig: data.form_config,
        isActive: data.is_active,
        isGlobal: data.is_global,
        storeId: data.store_id,
        maxParticipants: data.max_participants,
        startDate: data.start_date,
        endDate: data.end_date,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, mission }
    } catch (error) {
      console.error('이벤트 미션 생성 오류:', error)
      return { success: false, error: '이벤트 미션 생성에 실패했습니다.' }
    }
  },

  // ===============================================
  // 마케팅 자동화
  // ===============================================

  // 계절별 자동 이벤트 생성
  async createSeasonalEvents(): Promise<{ success: boolean; createdEvents?: number; error?: string }> {
    try {
      const currentMonth = new Date().getMonth() + 1
      let templateId = ''
      let customTitle = ''

      // 계절별 이벤트 매핑
      if ([3, 4, 5].includes(currentMonth)) {
        templateId = 'seasonal_challenge'
        customTitle = '🌸 봄맞이 특별 챌린지'
      } else if ([6, 7, 8].includes(currentMonth)) {
        templateId = 'seasonal_challenge'
        customTitle = '☀️ 여름휴가 준비 챌린지'
      } else if ([9, 10, 11].includes(currentMonth)) {
        templateId = 'seasonal_challenge'
        customTitle = '🍂 가을 드라이브 챌린지'
      } else {
        templateId = 'seasonal_challenge'
        customTitle = '❄️ 겨울 안전운전 챌린지'
      }

      const result = await this.createEventMission(templateId, {
        title: customTitle,
        rewardAmount: 25000,
        maxParticipants: 500
      })

      if (result.success) {
        // 모든 사용자에게 이벤트 알림
        await this.notifyAllUsers({
          type: 'event_announcement',
          title: '🎉 새로운 계절 이벤트 시작!',
          message: `${customTitle}이 시작되었습니다. 지금 참여해보세요!`,
          data: { missionId: result.mission?.id }
        })

        return { success: true, createdEvents: 1 }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('계절별 이벤트 생성 오류:', error)
      return { success: false, error: '계절별 이벤트 생성에 실패했습니다.' }
    }
  },

  // 주말 특별 이벤트 자동 생성
  async createWeekendEvents(): Promise<{ success: boolean; error?: string }> {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay()

      // 금요일에만 주말 이벤트 생성
      if (dayOfWeek !== 5) {
        return { success: true } // 금요일이 아니면 생성하지 않음
      }

      const result = await this.createEventMission('weekend_sns_boost', {
        title: '📱 이번 주말 SNS 특별 이벤트',
        rewardAmount: 12000,
        startDate: new Date(today.setDate(today.getDate() + 1)).toISOString(), // 토요일부터
        endDate: new Date(today.setDate(today.getDate() + 2)).toISOString(), // 일요일까지
        maxParticipants: 200
      })

      if (result.success) {
        await this.notifyAllUsers({
          type: 'event_announcement',
          title: '📱 주말 한정 SNS 이벤트!',
          message: '이번 주말 동안만 진행되는 특별 SNS 이벤트에 참여해보세요!',
          data: { missionId: result.mission?.id }
        })
      }

      return result
    } catch (error) {
      console.error('주말 이벤트 생성 오류:', error)
      return { success: false, error: '주말 이벤트 생성에 실패했습니다.' }
    }
  },

  // ===============================================
  // 알림 시스템
  // ===============================================

  // 모든 활성 사용자에게 알림 전송
  async notifyAllUsers(notification: {
    type: string
    title: string
    message: string
    data?: any
  }): Promise<void> {
    try {
      // 활성 사용자 조회 (최근 30일 내 활동)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .gte('updated_at', thirtyDaysAgo)

      if (error || !users) return

      // 배치로 알림 생성
      const notifications = users.map(user => ({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        is_read: false,
        created_at: new Date().toISOString()
      }))

      // 1000개씩 배치 처리
      for (let i = 0; i < notifications.length; i += 1000) {
        const batch = notifications.slice(i, i + 1000)
        await supabase
          .from('notifications')
          .insert(batch)
      }
    } catch (error) {
      console.error('전체 사용자 알림 오류:', error)
    }
  },

  // 개인화된 미션 추천
  async getPersonalizedMissionRecommendations(userId: string): Promise<{
    success: boolean
    recommendations?: {
      missionId: number
      title: string
      reason: string
      priority: number
    }[]
    error?: string
  }> {
    try {
      // 사용자의 미션 참여 이력 분석
      const { data: participations } = await supabase
        .from('mission_participations')
        .select('mission_definition_id, status, created_at')
        .eq('user_id', userId)

      const { data: missions } = await supabase
        .from('mission_definitions')
        .select('*')
        .eq('is_active', true)

      if (!missions) return { success: true, recommendations: [] }

      const completedMissionIds = (participations || [])
        .filter(p => p.status === 'completed')
        .map(p => p.mission_definition_id)

      const availableMissions = missions.filter(m => !completedMissionIds.includes(m.id))

      // 추천 점수 계산
      const recommendations = availableMissions.map(mission => {
        let priority = 0
        let reason = ''

        // 보상금액이 높은 미션 우선
        if (mission.reward_amount >= 30000) {
          priority += 3
          reason = '높은 보상금'
        } else if (mission.reward_amount >= 15000) {
          priority += 2
          reason = '적당한 보상금'
        } else {
          priority += 1
          reason = '참여하기 쉬운 미션'
        }

        // 종료 임박 미션 우선
        if (mission.end_date) {
          const daysUntilEnd = Math.floor((new Date(mission.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (daysUntilEnd <= 3) {
            priority += 5
            reason = '종료 임박 미션'
          } else if (daysUntilEnd <= 7) {
            priority += 2
            reason = '종료 예정 미션'
          }
        }

        // 참가자 수 제한이 있는 미션
        if (mission.max_participants) {
          priority += 1
          reason = '제한된 참가 미션'
        }

        return {
          missionId: mission.id,
          title: mission.title,
          reason,
          priority
        }
      })

      // 우선순위 정렬
      recommendations.sort((a, b) => b.priority - a.priority)

      return { success: true, recommendations: recommendations.slice(0, 5) }
    } catch (error) {
      console.error('개인화 추천 오류:', error)
      return { success: false, error: '추천 미션을 불러오는데 실패했습니다.' }
    }
  }
}