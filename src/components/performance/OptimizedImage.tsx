'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  placeholder = 'empty',
  sizes,
  quality = 85,
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Base64 placeholder for blur effect
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="20%" />
          <stop stop-color="#e5e7eb" offset="50%" />
          <stop stop-color="#f3f4f6" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f3f4f6" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    quality,
    className: `transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    } ${className}`,
    onLoad: () => setIsLoading(false),
    onError: () => setHasError(true),
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL: blurDataURL || 
      (placeholder === 'blur' && width && height
        ? `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
        : undefined),
    priority,
    sizes: sizes || (fill 
      ? '100vw' 
      : `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
    ),
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  );
}

// 미션 증빙 이미지용 최적화 컴포넌트
export function MissionProofImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={`rounded-lg object-cover ${className}`}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      quality={80}
    />
  );
}

// 프로필 이미지용 최적화 컴포넌트
export function ProfileImage({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 },
  };

  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-full object-cover ${className}`}
      placeholder="blur"
      quality={90}
      priority={size === 'lg'}
    />
  );
}

// 배경 이미지용 최적화 컴포넌트
export function BackgroundImage({
  src,
  alt,
  className = '',
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        placeholder="blur"
        sizes="100vw"
        quality={75}
      />
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

// 갤러리용 이미지 컴포넌트
export function GalleryImage({
  src,
  alt,
  className = '',
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`relative cursor-pointer transition-transform hover:scale-105 ${className}`}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={300}
        height={200}
        className="rounded-lg object-cover"
        placeholder="blur"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
        quality={80}
      />
    </div>
  );
}