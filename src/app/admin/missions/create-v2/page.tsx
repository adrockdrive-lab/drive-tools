'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Coins,
  Eye,
  Image as ImageIcon,
  Plus,
  Save,
  Smartphone,
  Target,
  Trash2,
  Trophy,
  X,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Requirement {
  id: string
  type: string
  description: string
  value: number
}

interface ProofRequirement {
  id: string
  type: string
  description: string
  required: boolean
}

export default function MissionCreateV2Page() {
  const router = useRouter()
  const [missionType, setMissionType] = useState('daily')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [rewardXP, setRewardXP] = useState(100)
  const [rewardCoins, setRewardCoins] = useState(50)
  const [rewardCash, setRewardCash] = useState(0)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([])
  const [chapterId, setChapterId] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterOrder, setChapterOrder] = useState(1)
  const [missionOrder, setMissionOrder] = useState(1)

  const addRequirement = () => {
    setRequirements([
      ...requirements,
      {
        id: Date.now().toString(),
        type: 'custom',
        description: '',
        value: 1,
      },
    ])
  }

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter((r) => r.id !== id))
  }

  const updateRequirement = (id: string, field: keyof Requirement, value: any) => {
    setRequirements(
      requirements.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const addProofRequirement = () => {
    setProofRequirements([
      ...proofRequirements,
      {
        id: Date.now().toString(),
        type: 'image',
        description: '',
        required: true,
      },
    ])
  }

  const removeProofRequirement = (id: string) => {
    setProofRequirements(proofRequirements.filter((p) => p.id !== id))
  }

  const updateProofRequirement = (id: string, field: keyof ProofRequirement, value: any) => {
    setProofRequirements(
      proofRequirements.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('미션 제목을 입력해주세요.')
      return
    }

    if (!description.trim()) {
      toast.error('미션 설명을 입력해주세요.')
      return
    }

    try {
      const missionData = {
        type: missionType,
        category,
        title,
        description,
        longDescription,
        difficulty,
        rewards: {
          xp: rewardXP,
          coins: rewardCoins,
          cash: rewardCash,
        },
        requirements,
        proofRequirements,
        chapterId: missionType === 'story' ? chapterId : undefined,
        chapterTitle: missionType === 'story' ? chapterTitle : undefined,
        chapterOrder: missionType === 'story' ? chapterOrder : undefined,
        missionOrder: missionType === 'story' ? missionOrder : undefined,
      }

      toast.success('미션이 생성되었습니다.')
      router.push('/admin/missions')
    } catch (error) {
      toast.error('미션 생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">미션 생성</h1>
          <p className="text-gray-600 mt-2">새로운 미션을 만들고 보상을 설정하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            취소
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>미션의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>미션 유형 *</Label>
                  <Select value={missionType} onValueChange={setMissionType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">일일 미션</SelectItem>
                      <SelectItem value="story">스토리 미션</SelectItem>
                      <SelectItem value="challenge">챌린지 미션</SelectItem>
                      <SelectItem value="social">소셜 미션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">퀴즈</SelectItem>
                      <SelectItem value="checkin">체크인</SelectItem>
                      <SelectItem value="learning">학습</SelectItem>
                      <SelectItem value="social">소셜</SelectItem>
                      <SelectItem value="challenge">챌린지</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>미션 제목 *</Label>
                <Input
                  placeholder="예: 오늘의 교통법규 퀴즈"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>간단한 설명 *</Label>
                <Textarea
                  placeholder="미션에 대한 간단한 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>상세 설명</Label>
                <Textarea
                  placeholder="미션에 대한 상세한 설명을 입력하세요"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>난이도</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">쉬움</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="hard">어려움</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {missionType === 'story' && (
            <Card>
              <CardHeader>
                <CardTitle>스토리 미션 설정</CardTitle>
                <CardDescription>챕터 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>챕터 ID</Label>
                    <Input
                      placeholder="chapter-1"
                      value={chapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>챕터 제목</Label>
                    <Input
                      placeholder="시작의 발걸음"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>챕터 순서</Label>
                    <Input
                      type="number"
                      value={chapterOrder}
                      onChange={(e) => setChapterOrder(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>미션 순서</Label>
                    <Input
                      type="number"
                      value={missionOrder}
                      onChange={(e) => setMissionOrder(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>미션 요구사항</CardTitle>
                  <CardDescription>사용자가 완료해야 할 조건들</CardDescription>
                </div>
                <Button size="sm" onClick={addRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {requirements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>요구사항을 추가해주세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Select
                        value={req.type}
                        onValueChange={(val) => updateRequirement(req.id, 'type', val)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">사용자 정의</SelectItem>
                          <SelectItem value="checkin_count">체크인 횟수</SelectItem>
                          <SelectItem value="quiz_completed">퀴즈 완료</SelectItem>
                          <SelectItem value="image_upload">이미지 업로드</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="설명"
                        value={req.description}
                        onChange={(e) => updateRequirement(req.id, 'description', e.target.value)}
                        className="flex-1"
                      />

                      <Input
                        type="number"
                        value={req.value}
                        onChange={(e) => updateRequirement(req.id, 'value', parseInt(e.target.value))}
                        className="w-24"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRequirement(req.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>증빙 자료 요구사항</CardTitle>
                  <CardDescription>사용자가 제출해야 할 증빙 자료</CardDescription>
                </div>
                <Button size="sm" onClick={addProofRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {proofRequirements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>증빙 자료 요구사항을 추가해주세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proofRequirements.map((proof) => (
                    <div key={proof.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Select
                        value={proof.type}
                        onValueChange={(val) => updateProofRequirement(proof.id, 'type', val)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">이미지</SelectItem>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="video">동영상</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="설명"
                        value={proof.description}
                        onChange={(e) => updateProofRequirement(proof.id, 'description', e.target.value)}
                        className="flex-1"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProofRequirement(proof.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>보상 설정</CardTitle>
              <CardDescription>미션 완료 시 지급할 보상</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>경험치 (XP)</span>
                </Label>
                <Input
                  type="number"
                  value={rewardXP}
                  onChange={(e) => setRewardXP(parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span>코인</span>
                </Label>
                <Input
                  type="number"
                  value={rewardCoins}
                  onChange={(e) => setRewardCoins(parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span>캐시 (원)</span>
                </Label>
                <Input
                  type="number"
                  value={rewardCash}
                  onChange={(e) => setRewardCash(parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">보상 미리보기</div>
                <div className="space-y-2">
                  {rewardXP > 0 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">경험치</span>
                      <Badge className="bg-yellow-500">+{rewardXP} XP</Badge>
                    </div>
                  )}
                  {rewardCoins > 0 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">코인</span>
                      <Badge className="bg-yellow-600">+{rewardCoins}</Badge>
                    </div>
                  )}
                  {rewardCash > 0 && (
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm">캐시</span>
                      <Badge className="bg-purple-600">+{rewardCash.toLocaleString()}원</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
              <CardDescription>사용자에게 표시될 모습</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600">{category || '카테고리'}</Badge>
                  <Badge variant="outline">{difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}</Badge>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {title || '미션 제목'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {description || '미션 설명이 여기에 표시됩니다'}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  {rewardXP > 0 && (
                    <Badge className="bg-yellow-500">+{rewardXP} XP</Badge>
                  )}
                  {rewardCoins > 0 && (
                    <Badge className="bg-yellow-600">+{rewardCoins} 코인</Badge>
                  )}
                  {rewardCash > 0 && (
                    <Badge className="bg-purple-600">+{rewardCash.toLocaleString()}원</Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 text-center">
                <Smartphone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">모바일 화면 미리보기</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>빠른 템플릿</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setMissionType('daily')
                  setCategory('quiz')
                  setTitle('교통법규 OX 퀴즈')
                  setDescription('교통법규 퀴즈 5문제를 풀어보세요')
                  setDifficulty('easy')
                  setRewardXP(100)
                  setRewardCoins(50)
                }}
              >
                퀴즈 미션
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setMissionType('daily')
                  setCategory('checkin')
                  setTitle('아침 체크인')
                  setDescription('오전에 학원에 체크인하세요')
                  setDifficulty('easy')
                  setRewardXP(80)
                  setRewardCoins(40)
                }}
              >
                체크인 미션
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setMissionType('challenge')
                  setCategory('challenge')
                  setTitle('학과 시험 합격 인증')
                  setDescription('학과 시험 합격증을 업로드하세요')
                  setDifficulty('medium')
                  setRewardXP(1000)
                  setRewardCoins(700)
                  setRewardCash(5000)
                }}
              >
                챌린지 미션
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
