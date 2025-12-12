'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface QRAttendanceData {
  storeId: string;
  storeName: string;
  timestamp: number;
  qrCodeData: string;
}

interface StoreLocation {
  id: string;
  name: string;
  qrCode: string;
  address: string;
  isActive: boolean;
}

interface QRAttendanceProps {
  storeLocations: StoreLocation[];
  onAttendanceSuccess: (data: QRAttendanceData) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function QRAttendance({ 
  storeLocations, 
  onAttendanceSuccess, 
  isLoading = false,
  disabled = false 
}: QRAttendanceProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<QRAttendanceData | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 카메라 권한 확인
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 스트림 정리
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [stream]);

  // QR 코드 검증
  const validateQRCode = (qrData: string): QRAttendanceData | null => {
    try {
      // QR 코드 형식: store:{storeId}:{timestamp}:{signature}
      const parts = qrData.split(':');
      if (parts.length !== 4 || parts[0] !== 'store') {
        return null;
      }

      const [, storeId, timestamp, signature] = parts;
      const store = storeLocations.find(s => s.id === storeId);
      
      if (!store) {
        throw new Error('등록되지 않은 지점입니다');
      }

      if (!store.isActive) {
        throw new Error('현재 사용할 수 없는 지점입니다');
      }

      // 시간 검증 (QR 코드는 5분간 유효)
      const qrTimestamp = parseInt(timestamp);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - qrTimestamp > fiveMinutes) {
        throw new Error('QR 코드가 만료되었습니다. 새로운 QR 코드를 요청해주세요');
      }

      // 간단한 서명 검증 (실제로는 더 복잡한 검증 로직 필요)
      const expectedSignature = btoa(`${storeId}:${timestamp}`).slice(0, 8);
      if (signature !== expectedSignature) {
        throw new Error('유효하지 않은 QR 코드입니다');
      }

      return {
        storeId,
        storeName: store.name,
        timestamp: now,
        qrCodeData: qrData
      };

    } catch (error: any) {
      toast.error(error.message || 'QR 코드 형식이 올바르지 않습니다');
      return null;
    }
  };

  // 카메라 시작
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      // 카메라 스트림 요청
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 선호
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        // QR 코드 스캔 시작
        scanIntervalRef.current = setInterval(scanQRCode, 500);
      }

      toast.success('카메라가 시작되었습니다');

    } catch (error: any) {
      setIsScanning(false);
      
      let errorMessage = '카메라에 접근할 수 없습니다';
      if (error.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '이 브라우저는 카메라를 지원하지 않습니다';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
    setScannedData(null);
  };

  // QR 코드 스캔 (간단한 구현)
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // 실제 프로덕션에서는 qr-scanner 라이브러리나 ZXing 사용 권장
    // 여기서는 시뮬레이션으로 처리
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // QR 코드 스캔 시뮬레이션
      // 실제로는 qr-scanner 라이브러리를 사용해야 함
      
    } catch (error) {
      // 스캔 실패 시 무시
    }
  };

  // 수동 입력 처리
  const handleManualInput = () => {
    if (!manualCode.trim()) {
      toast.error('QR 코드를 입력해주세요');
      return;
    }

    const result = validateQRCode(manualCode.trim());
    if (result) {
      setScanResult(result);
      setManualCode('');
      setShowManualInput(false);
      toast.success(`${result.storeName} 출석이 확인되었습니다`);
    }
  };

  // 출석 확정
  const confirmAttendance = () => {
    if (scanResult) {
      onAttendanceSuccess(scanResult);
      setScanResult(null);
      stopCamera();
    }
  };

  // 스캔 결과 리셋
  const resetScan = () => {
    setScanResult(null);
    setScannedData(null);
  };

  return (
    <div className="space-y-6">
      {/* QR 코드 스캔 카드 */}
      <SlideIn direction="down">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR 코드 출석 체크</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning && !scanResult ? (
              // 시작 화면
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">QR 코드를 스캔하여 출석 체크를 완료하세요</p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={startCamera}
                    disabled={disabled || isLoading}
                    className="w-full flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>QR 코드 스캔 시작</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowManualInput(true)}
                    disabled={disabled || isLoading}
                    className="w-full flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>수동 입력</span>
                  </Button>
                </div>
              </div>
            ) : isScanning ? (
              // 스캔 중 화면
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* 스캔 가이드 오버레이 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg bg-black bg-opacity-20">
                      <div className="w-full h-full border-4 border-transparent border-t-blue-500 border-l-blue-500 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  
                  {/* 스캔 상태 표시 */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black bg-opacity-50 text-white text-sm rounded px-3 py-2 text-center">
                      QR 코드를 카메라 중앙에 맞춰주세요
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      stopCamera();
                      setShowManualInput(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    수동 입력
                  </Button>
                </div>
              </div>
            ) : (
              // 스캔 완료 화면
              scanResult && (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">출석 확인됨</h3>
                  <p className="text-gray-600 mb-6">{scanResult.storeName}</p>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">지점:</span>
                        <span className="ml-2 font-medium">{scanResult.storeName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">시간:</span>
                        <span className="ml-2 font-medium">{new Date(scanResult.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={resetScan}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      다시 스캔
                    </Button>
                    
                    <Button 
                      onClick={confirmAttendance}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          처리중...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          출석 확정
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* 카메라 오류 */}
            {cameraError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </SlideIn>

      {/* 수동 입력 모달 */}
      {showManualInput && (
        <SlideIn direction="up">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EyeOff className="h-5 w-5" />
                <span>QR 코드 수동 입력</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR 코드 내용
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="store:123:1640995200000:abc12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowManualInput(false);
                    setManualCode('');
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                
                <Button 
                  onClick={handleManualInput}
                  disabled={!manualCode.trim()}
                  className="flex-1"
                >
                  확인
                </Button>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 사용 가능한 지점 목록 */}
      {storeLocations.length > 0 && (
        <SlideIn direction="up" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>출석 가능한 지점</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {storeLocations.map((store, index) => (
                  <SlideIn key={store.id} direction="left" delay={index * 0.1}>
                    <HoverScale>
                      <Card className={`p-3 ${store.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{store.name}</h4>
                            <p className="text-sm text-gray-600">{store.address}</p>
                          </div>
                          
                          <Badge variant={store.isActive ? "default" : "secondary"}>
                            {store.isActive ? '이용 가능' : '일시 중단'}
                          </Badge>
                        </div>
                      </Card>
                    </HoverScale>
                  </SlideIn>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 안내 정보 */}
      <SlideIn direction="up" delay={0.2}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>QR 코드 출석 안내:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>지점에 비치된 QR 코드를 스캔하여 출석 체크를 완료하세요</li>
              <li>QR 코드는 5분간 유효하며, 만료 시 새로운 코드가 필요합니다</li>
              <li>카메라 접근을 허용해야 QR 코드 스캔이 가능합니다</li>
              <li>스캔이 어려운 경우 수동 입력을 이용하세요</li>
            </ul>
          </AlertDescription>
        </Alert>
      </SlideIn>
    </div>
  );
}