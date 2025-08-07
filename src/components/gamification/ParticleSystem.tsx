'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import confetti from 'canvas-confetti';

interface ParticleSystemProps {
  trigger: boolean;
  type?: 'success' | 'levelUp' | 'achievement' | 'celebration';
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
  duration?: number;
  onComplete?: () => void;
}

export function ParticleSystem({
  trigger,
  type = 'success',
  intensity = 'medium',
  colors,
  duration = 3000,
  onComplete
}: ParticleSystemProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const particleConfigs = useMemo(() => ({
    success: {
      particleCount: intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 150,
      colors: colors || ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      shapes: ['circle', 'square'] as const,
      spread: 60,
      startVelocity: 30,
      decay: 0.9,
      gravity: 1,
    },
    levelUp: {
      particleCount: intensity === 'low' ? 80 : intensity === 'medium' ? 150 : 200,
      colors: colors || ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
      shapes: ['star', 'circle'] as const,
      spread: 80,
      startVelocity: 45,
      decay: 0.8,
      gravity: 0.8,
    },
    achievement: {
      particleCount: intensity === 'low' ? 60 : intensity === 'medium' ? 120 : 180,
      colors: colors || ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
      shapes: ['circle', 'square'] as const,
      spread: 70,
      startVelocity: 35,
      decay: 0.85,
      gravity: 1.2,
    },
    celebration: {
      particleCount: intensity === 'low' ? 100 : intensity === 'medium' ? 200 : 300,
      colors: colors || ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'],
      shapes: ['circle', 'square', 'star'] as const,
      spread: 90,
      startVelocity: 50,
      decay: 0.75,
      gravity: 0.7,
    }
  }), [intensity, colors]);

  const fireParticles = useCallback(() => {
    const config = particleConfigs[type];

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Multiple bursts for more dramatic effect
    const burstCount = type === 'celebration' ? 5 : 3;
    const burstInterval = duration / burstCount;

    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        // Center burst
        confetti({
          particleCount: Math.floor(config.particleCount / burstCount),
          colors: config.colors,
          spread: config.spread,
          startVelocity: config.startVelocity,
          decay: config.decay,
          gravity: config.gravity,
          origin: { x: 0.5, y: 0.5 },
        });

        // Side bursts for celebration type
        if (type === 'celebration' && i % 2 === 0) {
          setTimeout(() => {
            confetti({
              particleCount: Math.floor(config.particleCount / (burstCount * 2)),
              colors: config.colors,
              spread: 50,
              startVelocity: 25,
              origin: { x: 0.2, y: 0.7 },
            });
            confetti({
              particleCount: Math.floor(config.particleCount / (burstCount * 2)),
              colors: config.colors,
              spread: 50,
              startVelocity: 25,
              origin: { x: 0.8, y: 0.7 },
            });
          }, 100);
        }
      }, i * burstInterval);
    }

    // Set completion timeout
    timeoutRef.current = setTimeout(() => {
      onComplete?.();
    }, duration);
  }, [type, duration, onComplete, particleConfigs]);

  useEffect(() => {
    if (trigger) {
      fireParticles();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, fireParticles]);

  // This component doesn't render anything visible
  // The particles are rendered by canvas-confetti
  return null;
}

// Fireworks component for special occasions
interface FireworksProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function Fireworks({ active, duration = 5000, onComplete }: FireworksProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const launchFirework = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
  };

  useEffect(() => {
    if (active) {
      // Launch fireworks every 600ms
      intervalRef.current = setInterval(launchFirework, 600);

      // Stop after duration
      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onComplete?.();
      }, duration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active, duration, onComplete]);

  return null;
}

// Utility function to trigger particles programmatically
export const triggerParticleExplosion = (element: HTMLElement, type: ParticleSystemProps['type'] = 'success') => {
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x, y },
    colors: type === 'success' ? ['#10B981', '#34D399'] :
            type === 'levelUp' ? ['#8B5CF6', '#A78BFA'] :
            ['#F59E0B', '#FBBF24']
  });
};
