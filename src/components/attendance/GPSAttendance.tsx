'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  Crosshair,
  Clock,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface StoreLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // 출석 인정 반경 (미터)
  address: string;
}

interface GPSAttendanceProps {
  storeLocations: StoreLocation[];
  onAttendanceSuccess: (storeId: string, position: GPSPosition) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GPSAttendance({ 
  storeLocations, 
  onAttendanceSuccess, 
  isLoading = false,
  disabled = false 
}: GPSAttendanceProps) {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<(StoreLocation & { distance: number })[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // 위치 권한 확인
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setLocationError('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
        }
      });
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  // 현재 위치와 근처 지점 계산
  useEffect(() => {
    if (currentPosition && storeLocations.length > 0) {
      const storesWithDistance = storeLocations.map(store => ({
        ...store,
        distance: calculateDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          store.latitude,
          store.longitude
        )
      })).sort((a, b) => a.distance - b.distance);

      setNearbyStores(storesWithDistance);
    }
  }, [currentPosition, storeLocations]);

  // 두 지점 간 거리 계산 (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('위치 서비스가 지원되지 않습니다.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1분간 캐시된 위치 사용
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        setCurrentPosition(newPosition);
        setIsGettingLocation(false);
        toast.success('위치를 성공적으로 가져왔습니다');
      },
      (error) => {
        setIsGettingLocation(false);
        
        let errorMessage = '위치를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      options
    );
  };

  // 출석 체크
  const handleAttendanceCheck = (store: StoreLocation & { distance: number }) => {
    if (!currentPosition) {
      toast.error('먼저 현재 위치를 확인해주세요');
      return;
    }

    if (store.distance > store.radius) {
      toast.error(`${store.name}에서 너무 멀리 떨어져 있습니다. (${Math.round(store.distance)}m)`);
      return;
    }

    // 위치 정확도 검사
    if (currentPosition.accuracy > 100) {
      toast.warning('위치 정확도가 낮습니다. 실외에서 다시 시도해주세요.');
      return;
    }

    setSelectedStore(store.id);
    onAttendanceSuccess(store.id, currentPosition);
  };

  // 거리 포맷팅
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  // 정확도 레벨 계산
  const getAccuracyLevel = (accuracy: number): { level: 'high' | 'medium' | 'low'; color: string; text: string } => {
    if (accuracy <= 10) {
      return { level: 'high', color: 'text-green-600', text: '높음' };
    } else if (accuracy <= 50) {
      return { level: 'medium', color: 'text-yellow-600', text: '보통' };
    } else {
      return { level: 'low', color: 'text-red-600', text: '낮음' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 위치 정보 카드 */}
      <SlideIn direction="down">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>GPS 출석 체크</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 현재 위치 정보 */}
            {currentPosition ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">위치 확인됨</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    새로고침
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">위도:</span>
                    <span className="ml-2 font-mono">{currentPosition.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">경도:</span>
                    <span className="ml-2 font-mono">{currentPosition.longitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">정확도:</span>
                    <span className={`ml-2 font-medium ${getAccuracyLevel(currentPosition.accuracy).color}`}>
                      {Math.round(currentPosition.accuracy)}m ({getAccuracyLevel(currentPosition.accuracy).text})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">업데이트:</span>
                    <span className="ml-2">{new Date(currentPosition.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Crosshair className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">위치 정보가 필요합니다</p>
                <Button 
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation || disabled}
                  className="flex items-center space-x-2"
                >
                  {isGettingLocation ? (
                    <Spinner size="sm" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  <span>{isGettingLocation ? '위치 확인 중...' : '현재 위치 확인'}</span>
                </Button>
              </div>
            )}

            {/* 오류 메시지 */}
            {locationError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </SlideIn>

      {/* 근처 지점 목록 */}
      {currentPosition && nearbyStores.length > 0 && (
        <SlideIn direction="up">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>출석 가능한 지점</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nearbyStores.map((store, index) => {
                  const isInRange = store.distance <= store.radius;
                  const isSelected = selectedStore === store.id;
                  
                  return (
                    <SlideIn key={store.id} direction="left" delay={index * 0.1}>
                      <HoverScale>
                        <Card className={`${
                          isInRange 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200'
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                                  <Badge variant={isInRange ? "default" : "secondary"}>
                                    {formatDistance(store.distance)}
                                  </Badge>
                                  {isInRange && (
                                    <Badge className="bg-green-100 text-green-800">
                                      출석 가능
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                                
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>인정 반경: {store.radius}m</span>
                                  <span>정확도: {Math.round(currentPosition.accuracy)}m</span>
                                </div>
                              </div>
                              
                              <div className="ml-4">
                                {isInRange ? (
                                  <Button
                                    onClick={() => handleAttendanceCheck(store)}
                                    disabled={isLoading || disabled || isSelected}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isSelected ? (
                                      <>
                                        <Spinner size="sm" className="mr-2" />
                                        처리중...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        출석
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="text-center">
                                    <AlertTriangle className="h-6 w-6 text-gray-400 mx-auto" />
                                    <span className="text-xs text-gray-500 block mt-1">
                                      범위 밖
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverScale>
                    </SlideIn>
                  );
                })}
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
            <strong>GPS 출석 안내:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>정확한 위치 측정을 위해 실외에서 이용해주세요</li>
              <li>지점별 출석 인정 반경 내에 있어야 출석 가능합니다</li>
              <li>위치 정확도가 높을수록 더 정확한 출석 체크가 가능합니다</li>
              <li>건물 내부나 지하에서는 GPS 신호가 약할 수 있습니다</li>
            </ul>
          </AlertDescription>
        </Alert>
      </SlideIn>
    </div>
  );
}