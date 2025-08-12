'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, FileIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface FileUploadProps {
  accept: string;
  maxSize: number; // bytes
  onUpload: (url: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUpload({
  accept,
  maxSize,
  onUpload,
  placeholder,
  className,
  disabled = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `파일 크기가 너무 큽니다. 최대 ${(maxSize / 1024 / 1024).toFixed(1)}MB까지 업로드 가능합니다.`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return fileExtension === acceptedType.toLowerCase();
      }
      if (acceptedType.includes('/*')) {
        return mimeType.startsWith(acceptedType.replace('/*', ''));
      }
      return mimeType === acceptedType;
    });

    if (!isValidType) {
      return `지원하지 않는 파일 형식입니다. 허용 형식: ${accept}`;
    }

    return null;
  }, [maxSize, accept]);

  const createFilePreview = (file: File): FileWithPreview => {
    const fileWithPreview = file as FileWithPreview;

    if (file.type.startsWith('image/')) {
      fileWithPreview.preview = URL.createObjectURL(file);
    }

    return fileWithPreview;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setIsComplete(false);
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const fileWithPreview = createFilePreview(file);
    setSelectedFile(fileWithPreview);
  }, [validateFile]);

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('mission-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('mission-proofs')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading || disabled) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const url = await uploadToSupabase(selectedFile);
      setUploadProgress(100);
      setIsComplete(true);
      toast.success('파일이 성공적으로 업로드되었습니다!');
      onUpload(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    setIsComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {!selectedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragOver && !disabled
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-gray-600',
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
              : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className={cn(
            'w-12 h-12 mx-auto mb-4',
            disabled ? 'text-gray-400' : 'text-gray-500'
          )} />
          <p className={cn(
            'text-lg font-medium mb-2',
            disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
          )}>
            {placeholder}
          </p>
          <p className={cn(
            'text-sm',
            disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
          )}>
            클릭하거나 파일을 드래그해서 업로드하세요
          </p>
          <p className={cn(
            'text-xs mt-2',
            disabled ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'
          )}>
            최대 {(maxSize / 1024 / 1024).toFixed(1)}MB • {accept}
          </p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-start space-x-4">
            {/* File preview */}
            <div className="flex-shrink-0">
              {selectedFile.preview ? (
                <Image
                  src={selectedFile.preview}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-black truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>

              {/* Status */}
              {isComplete ? (
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">업로드 완료</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">업로드 실패</span>
                </div>
              ) : isUploading ? (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-600 dark:text-blue-400">업로드 중...</span>
                    <span className="text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              ) : null}

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              {!isComplete && !isUploading && (
                <Button
                  onClick={removeFile}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Upload button */}
          {!isComplete && !error && (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={removeFile}
                variant="outline"
                size="sm"
                disabled={isUploading || disabled}
              >
                취소
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || disabled}
                size="sm"
              >
                {isUploading ? '업로드 중...' : '업로드'}
              </Button>
            </div>
          )}

          {/* Retry button */}
          {error && !isUploading && (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={removeFile}
                variant="outline"
                size="sm"
                disabled={disabled}
              >
                다시 선택
              </Button>
              <Button
                onClick={handleUpload}
                variant="default"
                size="sm"
                disabled={disabled}
              >
                다시 시도
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
