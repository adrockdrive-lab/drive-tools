// 파일 검증 유틸리티 함수들

export interface FileValidationConfig {
  maxSize: number; // bytes
  allowedTypes: string[];
  maxFiles: number;
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  videoMaxDuration?: number; // seconds
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    hasAlpha?: boolean;
    colorSpace?: string;
  };
}

// 파일 타입별 기본 설정
export const FILE_VALIDATION_PRESETS = {
  // 이미지 (증명사진, 자격증 등)
  PROOF_IMAGES: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
    imageMaxWidth: 4096,
    imageMaxHeight: 4096
  },
  
  // 동영상 (미션 증명 영상)
  PROOF_VIDEOS: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFiles: 3,
    videoMaxDuration: 300 // 5분
  },
  
  // 문서 (PDF, 워드 등)
  DOCUMENTS: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 10
  },
  
  // 스크린샷 (SNS 미션 등)
  SCREENSHOTS: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png'],
    maxFiles: 3,
    imageMaxWidth: 2048,
    imageMaxHeight: 2048
  }
} as const;

// MIME 타입 검증
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// 파일 확장자 검증 (MIME 타입 스푸핑 방지)
export function validateFileExtension(file: File, allowedTypes: string[]): boolean {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/quicktime': ['.mov'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };
  
  return allowedTypes.some(type => 
    extensionMap[type]?.includes(extension)
  );
}

// 파일 크기 검증
export function validateFileSize(file: File, maxSize: number): ValidationResult {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 허용됩니다. (현재: ${formatFileSize(file.size)})`
    };
  }
  
  // 경고 메시지
  const warnings: string[] = [];
  if (file.size > maxSize * 0.8) {
    warnings.push('파일 크기가 제한에 가깝습니다. 압축을 고려해보세요.');
  }
  
  return {
    isValid: true,
    warnings
  };
}

// 이미지 파일 검증
export async function validateImageFile(file: File, config: FileValidationConfig): Promise<ValidationResult> {
  try {
    const dimensions = await getImageDimensions(file);
    const metadata = { dimensions };
    
    const warnings: string[] = [];
    
    // 크기 검증
    if (config.imageMaxWidth && dimensions.width > config.imageMaxWidth) {
      return {
        isValid: false,
        error: `이미지 너비가 너무 큽니다. 최대 ${config.imageMaxWidth}px까지 허용됩니다. (현재: ${dimensions.width}px)`
      };
    }
    
    if (config.imageMaxHeight && dimensions.height > config.imageMaxHeight) {
      return {
        isValid: false,
        error: `이미지 높이가 너무 큽니다. 최대 ${config.imageMaxHeight}px까지 허용됩니다. (현재: ${dimensions.height}px)`
      };
    }
    
    // 권장 크기 경고
    if (config.imageMaxWidth && dimensions.width > config.imageMaxWidth * 0.8) {
      warnings.push('이미지 크기가 큽니다. 압축을 고려해보세요.');
    }
    
    // 종횡비 검증 (극단적인 비율 방지)
    const aspectRatio = dimensions.width / dimensions.height;
    if (aspectRatio > 10 || aspectRatio < 0.1) {
      warnings.push('이미지 종횡비가 극단적입니다. 올바른 이미지인지 확인해주세요.');
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: '이미지 파일이 손상되었거나 지원되지 않는 형식입니다.'
    };
  }
}

// 비디오 파일 검증
export async function validateVideoFile(file: File, config: FileValidationConfig): Promise<ValidationResult> {
  try {
    const duration = await getVideoDuration(file);
    const metadata = { duration };
    
    const warnings: string[] = [];
    
    // 길이 검증
    if (config.videoMaxDuration && duration > config.videoMaxDuration) {
      return {
        isValid: false,
        error: `비디오가 너무 깁니다. 최대 ${config.videoMaxDuration}초까지 허용됩니다. (현재: ${Math.round(duration)}초)`
      };
    }
    
    // 권장 길이 경고
    if (config.videoMaxDuration && duration > config.videoMaxDuration * 0.8) {
      warnings.push('비디오가 깁니다. 편집을 고려해보세요.');
    }
    
    // 너무 짧은 비디오 경고
    if (duration < 1) {
      warnings.push('비디오가 너무 짧습니다. 올바른 파일인지 확인해주세요.');
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: '비디오 파일이 손상되었거나 지원되지 않는 형식입니다.'
    };
  }
}

// 포괄적인 파일 검증
export async function validateFile(file: File, config: FileValidationConfig): Promise<ValidationResult> {
  // 기본 검증
  if (!validateMimeType(file, config.allowedTypes)) {
    return {
      isValid: false,
      error: `지원되지 않는 파일 형식입니다. 허용된 형식: ${config.allowedTypes.join(', ')}`
    };
  }
  
  if (!validateFileExtension(file, config.allowedTypes)) {
    return {
      isValid: false,
      error: '파일 확장자가 파일 형식과 일치하지 않습니다.'
    };
  }
  
  const sizeValidation = validateFileSize(file, config.maxSize);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  // 파일 타입별 상세 검증
  if (file.type.startsWith('image/')) {
    const imageValidation = await validateImageFile(file, config);
    return {
      ...imageValidation,
      warnings: [...(sizeValidation.warnings || []), ...(imageValidation.warnings || [])]
    };
  }
  
  if (file.type.startsWith('video/')) {
    const videoValidation = await validateVideoFile(file, config);
    return {
      ...videoValidation,
      warnings: [...(sizeValidation.warnings || []), ...(videoValidation.warnings || [])]
    };
  }
  
  // 기본 문서 파일
  return {
    isValid: true,
    warnings: sizeValidation.warnings
  };
}

// 이미지 크기 가져오기
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('이미지를 로드할 수 없습니다'));
    };
    img.src = URL.createObjectURL(file);
  });
}

// 비디오 길이 가져오기
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('비디오를 로드할 수 없습니다'));
    };
    video.src = URL.createObjectURL(file);
  });
}

// 파일 크기 포맷팅
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 파일 압축 필요 여부 판단
export function shouldCompressFile(file: File, threshold: number = 1024 * 1024): boolean {
  return file.type.startsWith('image/') && file.size > threshold;
}

// 악성 파일 패턴 검사
export function checkForMaliciousPatterns(file: File): ValidationResult {
  const suspiciousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'
  ];
  
  const fileName = file.name.toLowerCase();
  
  for (const ext of suspiciousExtensions) {
    if (fileName.includes(ext)) {
      return {
        isValid: false,
        error: '보안상 위험할 수 있는 파일 형식입니다.'
      };
    }
  }
  
  // 더블 확장자 검사 (예: image.jpg.exe)
  const parts = fileName.split('.');
  if (parts.length > 2) {
    return {
      isValid: true,
      warnings: ['파일명에 여러 확장자가 포함되어 있습니다. 올바른 파일인지 확인해주세요.']
    };
  }
  
  return { isValid: true };
}