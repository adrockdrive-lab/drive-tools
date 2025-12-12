'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface FileValidationRules {
  maxSize: number; // bytes
  allowedTypes: string[];
  maxFiles: number;
  requireImages?: boolean;
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  videoMaxDuration?: number; // seconds
}

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  compressedSize?: number;
  originalSize: number;
  dimensions?: { width: number; height: number };
  duration?: number; // for videos
}

interface FileUploadEnhancedProps {
  onFilesChange: (files: UploadedFile[]) => void;
  validationRules: FileValidationRules;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

export function FileUploadEnhanced({
  onFilesChange,
  validationRules,
  accept,
  placeholder = "파일을 드래그하거나 클릭하여 업로드하세요",
  disabled = false,
  existingFiles = []
}: FileUploadEnhancedProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입 아이콘 반환
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  // 파일 검증
  const validateFile = async (file: File): Promise<{ isValid: boolean; error?: string; metadata?: any }> => {
    // 파일 크기 검증
    if (file.size > validationRules.maxSize) {
      return {
        isValid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(validationRules.maxSize)}까지 허용됩니다.`
      };
    }

    // 파일 타입 검증
    if (!validationRules.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `지원되지 않는 파일 형식입니다. 허용된 형식: ${validationRules.allowedTypes.join(', ')}`
      };
    }

    let metadata: any = {};

    // 이미지 검증
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await getImageDimensions(file);
        metadata.dimensions = dimensions;

        if (validationRules.imageMaxWidth && dimensions.width > validationRules.imageMaxWidth) {
          return {
            isValid: false,
            error: `이미지 폭이 너무 큽니다. 최대 ${validationRules.imageMaxWidth}px까지 허용됩니다.`
          };
        }

        if (validationRules.imageMaxHeight && dimensions.height > validationRules.imageMaxHeight) {
          return {
            isValid: false,
            error: `이미지 높이가 너무 큽니다. 최대 ${validationRules.imageMaxHeight}px까지 허용됩니다.`
          };
        }
      } catch (error) {
        return {
          isValid: false,
          error: '이미지 파일이 손상되었습니다.'
        };
      }
    }

    // 비디오 검증
    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoDuration(file);
        metadata.duration = duration;

        if (validationRules.videoMaxDuration && duration > validationRules.videoMaxDuration) {
          return {
            isValid: false,
            error: `비디오가 너무 깁니다. 최대 ${validationRules.videoMaxDuration}초까지 허용됩니다.`
          };
        }
      } catch (error) {
        return {
          isValid: false,
          error: '비디오 파일이 손상되었습니다.'
        };
      }
    }

    return { isValid: true, metadata };
  };

  // 이미지 크기 가져오기
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // 비디오 길이 가져오기
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  };

  // 이미지 압축
  const compressImage = async (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        // 비율 유지하면서 크기 조정
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // 압축된 파일 생성
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    // 초기 파일 정보 추가
    const newFile: UploadedFile = {
      id: fileId,
      file,
      url: '',
      uploadProgress: 0,
      status: 'uploading',
      originalSize: file.size
    };

    setFiles(prev => [...prev, newFile]);

    try {
      // 파일 검증
      const validation = await validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 이미지 압축 (이미지인 경우)
      let finalFile = file;
      if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // 1MB 이상인 경우 압축
        finalFile = await compressImage(file);
        newFile.compressedSize = finalFile.size;
      }

      // 메타데이터 추가
      if (validation.metadata) {
        newFile.dimensions = validation.metadata.dimensions;
        newFile.duration = validation.metadata.duration;
      }

      // 실제 업로드 시뮬레이션 (진행률 표시)
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, uploadProgress: progress }
            : f
        ));
      }

      // 업로드 완료
      const fileUrl = URL.createObjectURL(finalFile);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              file: finalFile,
              url: fileUrl,
              status: 'completed',
              uploadProgress: 100
            }
          : f
      ));

      toast.success('파일이 성공적으로 업로드되었습니다');

    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'error',
              error: error.message
            }
          : f
      ));
      
      toast.error(error.message);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    // 파일 개수 검증
    if (files.length + fileArray.length > validationRules.maxFiles) {
      toast.error(`최대 ${validationRules.maxFiles}개의 파일만 업로드할 수 있습니다`);
      return;
    }

    // 각 파일 업로드 처리
    for (const file of fileArray) {
      await handleFileUpload(file);
    }
  }, [files.length, validationRules.maxFiles]);

  // 파일 제거
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      onFilesChange(newFiles.filter(f => f.status === 'completed'));
      return newFiles;
    });
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  // 완료된 파일들을 부모 컴포넌트에 전달
  React.useEffect(() => {
    const completedFiles = files.filter(f => f.status === 'completed');
    onFilesChange(completedFiles);
  }, [files, onFilesChange]);

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`} />
          <p className={`text-lg font-medium mb-2 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {placeholder}
          </p>
          <p className={`text-sm ${
            disabled ? 'text-gray-300' : 'text-gray-500'
          }`}>
            최대 {formatFileSize(validationRules.maxSize)}, {validationRules.maxFiles}개 파일
          </p>
          <p className="text-xs text-gray-400 mt-1">
            지원 형식: {validationRules.allowedTypes.join(', ')}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={validationRules.maxFiles > 1}
            accept={accept || validationRules.allowedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">업로드된 파일 ({files.length})</h4>
          
          {files.map((file) => {
            const IconComponent = getFileIcon(file.file);
            
            return (
              <Card key={file.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {file.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="p-1 h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.originalSize)}</span>
                      
                      {file.compressedSize && file.compressedSize < file.originalSize && (
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.compressedSize)} (압축됨)
                        </Badge>
                      )}
                      
                      {file.dimensions && (
                        <span>{file.dimensions.width} × {file.dimensions.height}</span>
                      )}
                      
                      {file.duration && (
                        <span>{Math.round(file.duration)}초</span>
                      )}
                    </div>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.uploadProgress} className="h-1 mt-2" />
                    )}
                    
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 검증 규칙 표시 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 최대 파일 크기: {formatFileSize(validationRules.maxSize)}</p>
        <p>• 최대 파일 개수: {validationRules.maxFiles}개</p>
        {validationRules.imageMaxWidth && (
          <p>• 이미지 최대 너비: {validationRules.imageMaxWidth}px</p>
        )}
        {validationRules.imageMaxHeight && (
          <p>• 이미지 최대 높이: {validationRules.imageMaxHeight}px</p>
        )}
        {validationRules.videoMaxDuration && (
          <p>• 비디오 최대 길이: {validationRules.videoMaxDuration}초</p>
        )}
      </div>
    </div>
  );
}