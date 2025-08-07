'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';

interface PaybackCounterProps {
  amount: number;
  currency?: string;
  animationType?: 'countUp' | 'slide' | 'bounce';
  showCurrency?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'success' | 'warning' | 'premium';
  glowEffect?: boolean;
  prefix?: string;
  suffix?: string;
}

const sizeConfig = {
  sm: 'text-sm font-medium',
  md: 'text-lg font-semibold', 
  lg: 'text-2xl font-bold',
  xl: 'text-4xl font-bold'
};

const colorConfig = {
  default: 'text-gray-900 dark:text-white',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  premium: 'text-purple-600 dark:text-purple-400'
};

export function PaybackCounter({
  amount,
  currency = '원',
  animationType = 'countUp',
  showCurrency = true,
  size = 'md',
  color = 'success',
  glowEffect = false,
  prefix = '',
  suffix = ''
}: PaybackCounterProps) {
  const [previousAmount, setPreviousAmount] = useState(amount);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (amount > previousAmount) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), 1500);
      return () => clearTimeout(timer);
    }
    setPreviousAmount(amount);
  }, [amount, previousAmount]);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const baseClasses = `${sizeConfig[size]} ${colorConfig[color]} transition-all duration-300`;
  const glowClasses = glowEffect ? 'drop-shadow-[0_0_10px_currentColor]' : '';
  const increaseClasses = isIncreasing ? 'scale-110 brightness-125' : 'scale-100';

  if (animationType === 'slide') {
    return (
      <motion.div
        className={`${baseClasses} ${glowClasses} ${increaseClasses}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {prefix}
        <motion.span
          key={amount}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {formatNumber(amount)}
        </motion.span>
        {showCurrency && currency}
        {suffix}
      </motion.div>
    );
  }

  if (animationType === 'bounce') {
    return (
      <motion.div
        className={`${baseClasses} ${glowClasses} ${increaseClasses}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 15,
          bounce: 0.6
        }}
      >
        {prefix}
        <motion.span
          key={amount}
          initial={{ scale: 1.5, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatNumber(amount)}
        </motion.span>
        {showCurrency && currency}
        {suffix}
      </motion.div>
    );
  }

  // Default countUp animation
  return (
    <motion.div
      className={`${baseClasses} ${glowClasses} ${increaseClasses}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <CountUp
        start={Math.max(0, amount - 50000)} // Start from a lower number for dramatic effect
        end={amount}
        duration={1.2}
        separator=","
        preserveValue
      />
      {showCurrency && currency}
      {suffix}
      
      {/* Sparkle effect when increasing */}
      {isIncreasing && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent rounded-lg blur-sm" />
        </motion.div>
      )}
    </motion.div>
  );
}