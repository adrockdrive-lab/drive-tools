'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  HardDrive
} from 'lucide-react'
import { OptimizedImage, MissionProofImage } from '@/components/performance/OptimizedImage'
import { toast } from 'sonner'

interface FileData {
  name: string
  id: string
  created_at: string
  updated_at: string
  last_accessed_at: string | null
  metadata: {
    size: number
    mimetype: string
    cacheControl?: string
  }
  buckets: {
    name: string
  }
}

interface FileManagerProps {
  bucketName?: string
}

export function FileManager({ bucketName = 'mission-proofs' }: FileManagerProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    recentUploads: 0
  })

  useEffect(() => {
    loadFiles()
    loadStats()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      setFiles(data || [])
    } catch (error) {
      console.error('파일 목록 로드 오류:', error)
      toast.error('파일 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000
        })

      if (data) {
        const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
        const recentUploads = data.filter(file => {
          const uploadDate = new Date(file.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate > weekAgo
        }).length

        setStats({
          totalFiles: data.length,
          totalSize,
          recentUploads
        })
      }
    } catch (error) {
      console.error('통계 로드 오류:', error)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    } else if (mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-500" />
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (file: FileData) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(file.name)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('파일 다운로드가 시작되었습니다.')
    } catch (error) {
      console.error('다운로드 오류:', error)
      toast.error('파일 다운로드에 실패했습니다.')
    }
  }

  const handleDelete = async (file: FileData) => {
    if (!confirm(`"${file.name}" 파일을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([file.name])

      if (error) throw error

      toast.success('파일이 삭제되었습니다.')
      loadFiles()
      loadStats()
    } catch (error) {
      console.error('삭제 오류:', error)
      toast.error('파일 삭제에 실패했습니다.')
    }
  }

  const handlePreview = async (file: FileData) => {
    setSelectedFile(file)
    setPreviewOpen(true)
  }

  const getPreviewUrl = async (fileName: string) => {
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600) // 1시간 유효

    return data?.signedUrl || ''
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 파일 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 용량</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 업로드 (7일)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            파일 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">파일명 검색</Label>
              <Input
                id="search"
                placeholder="파일명을 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={loadFiles} variant="outline">
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 파일 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>파일 목록 ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">로딩 중...</div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">파일이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>파일</TableHead>
                    <TableHead>크기</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.metadata?.mimetype || '')}
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {file.metadata?.mimetype}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatFileSize(file.metadata?.size || 0)}
                      </TableCell>
                      <TableCell>
                        {formatDate(file.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 파일 미리보기 대화상자 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>파일 미리보기: {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">파일명:</span> {selectedFile.name}
                </div>
                <div>
                  <span className="font-medium">크기:</span> {formatFileSize(selectedFile.metadata?.size || 0)}
                </div>
                <div>
                  <span className="font-medium">타입:</span> {selectedFile.metadata?.mimetype}
                </div>
                <div>
                  <span className="font-medium">생성일:</span> {formatDate(selectedFile.created_at)}
                </div>
              </div>
              
              {selectedFile.metadata?.mimetype?.startsWith('image/') && (
                <div className="flex justify-center">
                  <div className="relative max-w-full max-h-96">
                    <MissionProofImage
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${selectedFile.name}`}
                      alt={selectedFile.name}
                      className="border rounded max-h-96 w-auto"
                    />
                  </div>
                </div>
              )}
              
              {selectedFile.metadata?.mimetype?.startsWith('video/') && (
                <div className="flex justify-center">
                  <video
                    controls
                    className="max-w-full max-h-96"
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${selectedFile.name}`}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}