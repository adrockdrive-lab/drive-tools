'use client';

import { motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

// Swipe to dismiss component
interface SwipeToDismissProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  threshold?: number;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export function SwipeToDismiss({ 
  children, 
  onDismiss,
  threshold = 100,
  className = '',
  direction = 'right'
}: SwipeToDismissProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = direction === 'left' || direction === 'right' ? info.offset.x : info.offset.y;
    const velocity = direction === 'left' || direction === 'right' ? info.velocity.x : info.velocity.y;

    let shouldDismiss = false;

    switch (direction) {
      case 'right':
        shouldDismiss = offset > threshold || velocity > 500;
        break;
      case 'left':
        shouldDismiss = offset < -threshold || velocity < -500;
        break;
      case 'down':
        shouldDismiss = offset > threshold || velocity > 500;
        break;
      case 'up':
        shouldDismiss = offset < -threshold || velocity < -500;
        break;
    }

    if (shouldDismiss) {
      const exitValue = direction === 'left' ? -300 : direction === 'right' ? 300 : direction === 'up' ? -300 : 300;
      const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
      
      controls.start({ [axis]: exitValue, opacity: 0 }).then(() => {
        onDismiss?.();
      });
    } else {
      controls.start({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      animate={controls}
      drag={direction === 'left' || direction === 'right' ? 'x' : 'y'}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  className = ''
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 180]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full p-4"
        style={{ opacity }}
      >
        <motion.div
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          style={{ rotate }}
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        />
      </motion.div>

      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Swipe navigation
interface SwipeNavigationProps {
  children: React.ReactNode[];
  onSwipe?: (direction: 'left' | 'right', currentIndex: number) => void;
  className?: string;
  sensitivity?: number;
}

export function SwipeNavigation({ 
  children, 
  onSwipe,
  className = '',
  sensitivity = 50
}: SwipeNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > sensitivity || Math.abs(velocity) > 500) {
      if (offset > 0) {
        // Swiped right
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        onSwipe?.('right', newIndex);
      } else {
        // Swiped left
        const newIndex = Math.min(children.length - 1, currentIndex + 1);
        setCurrentIndex(newIndex);
        onSwipe?.('left', newIndex);
      }
    }

    x.set(-currentIndex * 100);
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex"
        style={{ x: useTransform(x, (value) => `${value}%`) }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentIndex * 100 + '%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

// Long press interaction
interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  className?: string;
}

export function LongPress({ 
  children, 
  onLongPress, 
  delay = 500,
  className = ''
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handlePointerDown = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <motion.div
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      {children}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-blue-500/10 rounded-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: delay / 1000 }}
        />
      )}
    </motion.div>
  );
}

// Draggable list item
interface DraggableItemProps {
  children: React.ReactNode;
  id: string;
  onReorder?: (from: number, to: number) => void;
  index: number;
  className?: string;
}

export function DraggableItem({ 
  children, 
  id, 
  onReorder,
  index,
  className = ''
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);

  return (
    <motion.div
      className={className}
      style={{ y }}
      drag="y"
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        // Calculate drop position and call onReorder
        const dropIndex = Math.round(info.offset.y / 60) + index;
        if (dropIndex !== index && onReorder) {
          onReorder(index, Math.max(0, dropIndex));
        }
      }}
      whileDrag={{ 
        scale: 1.02, 
        zIndex: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
      animate={{
        opacity: isDragging ? 0.8 : 1
      }}
    >
      {children}
    </motion.div>
  );
}

// Pinch to zoom
interface PinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

export function PinchZoom({ 
  children, 
  minScale = 0.5, 
  maxScale = 3,
  className = ''
}: PinchZoomProps) {
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastDistance > 0) {
        const newScale = scale * (distance / lastDistance);
        setScale(Math.min(maxScale, Math.max(minScale, newScale)));
      }
      
      setLastDistance(distance);
    }
  };

  return (
    <motion.div
      className={className}
      style={{ scale }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      animate={{ scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}