'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MissionReviewPanel from '@/components/mission/MissionReviewPanel'
import { adminService } from '@/lib/services/admin'
import { missionService } from '@/lib/services/missions'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function MissionSubmissionsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const result = await adminService.getCurrentUser()
      if (result.success && result.user) {
        setIsAuthenticated(true)
      } else {
        toast.error('관리자 인증이 필요합니다.')
        router.push('/admin/login')
      }
    } catch (error) {
      toast.error('인증 확인 중 오류가 발생했습니다.')
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">관리자 인증이 필요합니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">미션 제출물 관리</h1>
        <p className="text-gray-600 mt-2">
          사용자들이 제출한 미션을 검토하고 승인 또는 반려할 수 있습니다.
        </p>
      </div>

      <MissionReviewPanel />
    </div>
  )
}
