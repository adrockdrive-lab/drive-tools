// 이미지 압축 유틸리티

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
  backgroundColor?: string; // PNG에서 JPEG로 변환시 배경색
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    original: { width: number; height: number };
    compressed: { width: number; height: number };
  };
}

// 기본 압축 설정
export const COMPRESSION_PRESETS = {
  // 증명사진 (고품질 유지)
  PROOF_PHOTO: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    format: 'jpeg' as const,
    backgroundColor: '#ffffff'
  },
  
  // 스크린샷 (적당한 압축)
  SCREENSHOT: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.8,
    format: 'jpeg' as const,
    backgroundColor: '#ffffff'
  },
  
  // 썸네일 (높은 압축)
  THUMBNAIL: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,
    format: 'jpeg' as const,
    backgroundColor: '#ffffff'
  },
  
  // 웹 최적화 (균형)
  WEB_OPTIMIZED: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.85,
    format: 'webp' as const
  }
} as const;

/**
 * 이미지 파일을 압축합니다
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    maintainAspectRatio = true,
    backgroundColor = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다'));
      return;
    }

    img.onload = () => {
      try {
        const originalDimensions = { width: img.width, height: img.height };
        
        // 크기 계산
        const targetDimensions = calculateTargetDimensions(
          originalDimensions,
          { maxWidth, maxHeight },
          maintainAspectRatio
        );

        // 캔버스 설정
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;

        // 배경색 설정 (PNG → JPEG 변환시)
        if (format === 'jpeg' && file.type === 'image/png') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 이미지 그리기 (고품질 설정)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetDimensions.width, targetDimensions.height);

        // 압축된 파일 생성
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다'));
              return;
            }

            const compressedFile = new File(
              [blob],
              changeFileExtension(file.name, format),
              {
                type: `image/${format}`,
                lastModified: Date.now()
              }
            );

            const compressionRatio = (1 - blob.size / file.size) * 100;

            resolve({
              compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio,
              dimensions: {
                original: originalDimensions,
                compressed: targetDimensions
              }
            });
          },
          `image/${format}`,
          quality
        );

        // 메모리 정리
        URL.revokeObjectURL(img.src);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('이미지를 로드할 수 없습니다'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * 대상 크기 계산
 */
function calculateTargetDimensions(
  original: { width: number; height: number },
  constraints: { maxWidth: number; maxHeight: number },
  maintainAspectRatio: boolean = true
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(original.width, constraints.maxWidth),
      height: Math.min(original.height, constraints.maxHeight)
    };
  }

  const aspectRatio = original.width / original.height;
  let targetWidth = original.width;
  let targetHeight = original.height;

  // 너비 기준으로 조정
  if (targetWidth > constraints.maxWidth) {
    targetWidth = constraints.maxWidth;
    targetHeight = targetWidth / aspectRatio;
  }

  // 높이 기준으로 재조정
  if (targetHeight > constraints.maxHeight) {
    targetHeight = constraints.maxHeight;
    targetWidth = targetHeight * aspectRatio;
  }

  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  };
}

/**
 * 파일 확장자 변경
 */
function changeFileExtension(fileName: string, newFormat: string): string {
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  return `${nameWithoutExt}.${newFormat}`;
}

/**
 * 배치 압축 (여러 파일 동시 처리)
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name);
    }
    
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`파일 압축 실패: ${file.name}`, error);
      // 압축 실패시 원본 파일 정보로 결과 생성
      results.push({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        dimensions: {
          original: { width: 0, height: 0 },
          compressed: { width: 0, height: 0 }
        }
      });
    }
  }
  
  if (onProgress) {
    onProgress(100, '완료');
  }
  
  return results;
}

/**
 * 압축이 필요한지 판단
 */
export function shouldCompress(
  file: File,
  options: {
    maxSize?: number; // bytes
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): boolean {
  const {
    maxSize = 2 * 1024 * 1024, // 2MB
    maxWidth = 1920,
    maxHeight = 1080
  } = options;

  // 이미지 파일이 아니면 압축하지 않음
  if (!file.type.startsWith('image/')) {
    return false;
  }

  // 파일 크기가 임계값을 초과하면 압축
  if (file.size > maxSize) {
    return true;
  }

  // TODO: 이미지 크기 검사 (비동기 처리 필요)
  // 현재는 파일 크기만으로 판단

  return false;
}

/**
 * 압축률 계산
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * 압축 품질 추천
 */
export function recommendQuality(fileSize: number): number {
  // 파일 크기에 따른 품질 추천
  if (fileSize < 1024 * 1024) { // 1MB 미만
    return 0.9;
  } else if (fileSize < 5 * 1024 * 1024) { // 5MB 미만
    return 0.8;
  } else if (fileSize < 10 * 1024 * 1024) { // 10MB 미만
    return 0.7;
  } else {
    return 0.6;
  }
}

/**
 * WebP 지원 여부 확인
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 최적 포맷 선택
 */
export function selectOptimalFormat(file: File): 'jpeg' | 'png' | 'webp' {
  // WebP 지원시 우선 선택
  if (supportsWebP()) {
    return 'webp';
  }
  
  // 투명도가 있는 PNG는 유지
  if (file.type === 'image/png') {
    // TODO: 실제 투명도 검사 로직 추가
    return 'png';
  }
  
  // 기본적으로 JPEG 사용
  return 'jpeg';
}