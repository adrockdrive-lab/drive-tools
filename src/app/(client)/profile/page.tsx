'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Award, User, Phone, Store, Calendar, LogOut, Edit2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    setName(user.name || user.nickname || '')
  }, [user, router])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // await supabase
      //   .from('users')
      //   .update({ name: name.trim() })
      //   .eq('id', user!.id)

      toast.success('프로필이 업데이트되었습니다.')
      setIsEditing(false)
    } catch (error) {
      toast.error('프로필 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('로그아웃되었습니다.')
    router.push('/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
          <p className="text-gray-600 mt-2">프로필 정보를 확인하고 수정하세요</p>
        </div>

        {/* 프로필 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>기본 정보</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  수정
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setName(user.name || user.nickname || '')
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{user.name || user.nickname}</p>
                    <p className="text-sm text-gray-600">Level {user.level || 1}</p>
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">전화번호</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>

              {user.storeId && (
                <div className="flex items-center space-x-3">
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">등록 지점</p>
                    <p className="font-medium">지점 ID: {user.storeId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">가입일</p>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 활동 통계 */}
        <Card>
          <CardHeader>
            <CardTitle>활동 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{user.level || 1}</p>
                <p className="text-sm text-gray-600">레벨</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{user.xp || 0}</p>
                <p className="text-sm text-gray-600">경험치</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{user.coins || 0}</p>
                <p className="text-sm text-gray-600">코인</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{user.consecutive_days || 0}</p>
                <p className="text-sm text-gray-600">연속 출석</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Card>
          <CardContent className="py-6">
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
              size="lg"
            >
              <LogOut className="h-5 w-5 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
