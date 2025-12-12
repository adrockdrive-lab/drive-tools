import { supabase } from '@/lib/supabase'

/**
 * Supabase Storage 서비스
 * 이미지 및 파일 업로드 관리
 */

export const BUCKETS = {
  MISSION_PROOFS: 'mission-proofs',
  AVATARS: 'avatars',
  POST_IMAGES: 'post-images',
} as const

// 파일 업로드
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: '파일 크기는 10MB 이하여야 합니다.' }
    }

    // 파일 타입 확인
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)' }
    }

    // 파일명 생성 (timestamp + random + extension)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${random}.${extension}`
    const fullPath = `${path}/${fileName}`

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage.from(bucket).upload(fullPath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fullPath)

    return {
      success: true,
      url: publicUrlData.publicUrl,
    }
  } catch (error: any) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error.message || '파일 업로드에 실패했습니다.',
    }
  }
}

// 미션 증빙 이미지 업로드
export async function uploadMissionProof(
  userId: string,
  missionId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  const path = `${userId}/${missionId}`
  return uploadFile(BUCKETS.MISSION_PROOFS, path, file)
}

// 아바타 이미지 업로드
export async function uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  // 기존 아바타 삭제
  const { data: user } = await supabase.from('users').select('avatar_url').eq('id', userId).single()

  if (user?.avatar_url) {
    const oldPath = user.avatar_url.split('/').slice(-2).join('/')
    await supabase.storage.from(BUCKETS.AVATARS).remove([oldPath])
  }

  // 새 아바타 업로드
  const path = userId
  const result = await uploadFile(BUCKETS.AVATARS, path, file)

  if (result.success && result.url) {
    // 사용자 프로필 업데이트
    await supabase.from('users').update({ avatar_url: result.url }).eq('id', userId)
  }

  return result
}

// 게시글 이미지 업로드
export async function uploadPostImage(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  const path = `${userId}`
  return uploadFile(BUCKETS.POST_IMAGES, path, file)
}

// 파일 삭제
export async function deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('File delete error:', error)
    return {
      success: false,
      error: error.message || '파일 삭제에 실패했습니다.',
    }
  }
}

// 다중 파일 업로드
export async function uploadMultipleFiles(
  bucket: string,
  path: string,
  files: File[]
): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const uploadPromises = files.map((file) => uploadFile(bucket, path, file))
    const results = await Promise.all(uploadPromises)

    // 모든 업로드가 성공했는지 확인
    const failed = results.find((r) => !r.success)
    if (failed) {
      return { success: false, error: failed.error }
    }

    const urls = results.map((r) => r.url!).filter(Boolean)
    return { success: true, urls }
  } catch (error: any) {
    console.error('Multiple file upload error:', error)
    return {
      success: false,
      error: error.message || '파일 업로드에 실패했습니다.',
    }
  }
}

// 이미지 압축 (클라이언트 사이드)
export async function compressImage(file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 비율 유지하면서 리사이즈
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('이미지 압축에 실패했습니다.'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'))
    }

    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'))
  })
}

// 파일 유효성 검사
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: '파일 크기는 10MB 이하여야 합니다.' }
  }

  // 파일 타입 확인
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)' }
  }

  return { valid: true }
}

// 파일명 생성
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${random}.${extension}`
}
