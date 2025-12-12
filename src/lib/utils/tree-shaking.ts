// Tree shaking을 향상시키기 위한 최적화된 임포트 유틸리티

// Lucide React Icons - 필요한 아이콘만 임포트
export {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Shield,
  Target,
  CreditCard,
  Megaphone,
  FileText,
  Eye,
  Trash2,
  Download,
  Search,
} from 'lucide-react';

// Framer Motion - 필요한 기능만 임포트
export {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  useTransform,
  domAnimation,
  LazyMotion,
} from 'framer-motion';

// Radix UI - 사용하는 컴포넌트만 임포트 최적화
export {
  Root as DialogRoot,
  Trigger as DialogTrigger,
  Content as DialogContent,
  Header as DialogHeader,
  Title as DialogTitle,
} from '@radix-ui/react-dialog';

export {
  Root as SelectRoot,
  Trigger as SelectTrigger,
  Content as SelectContent,
  Item as SelectItem,
  Value as SelectValue,
} from '@radix-ui/react-select';

// 날짜 관련 유틸리티 최적화
export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 디바운스 최적화
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 성능 모니터링 유틸리티
export const measurePerformance = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${name}-start`);
    return () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    };
  }
  return () => {};
};

// 메모리 리크 방지를 위한 클린업 유틸리티
export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  const addCleanup = (cleanup: () => void) => {
    cleanupFunctions.push(cleanup);
  };
  
  const cleanup = () => {
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions.length = 0;
  };
  
  return { addCleanup, cleanup };
};