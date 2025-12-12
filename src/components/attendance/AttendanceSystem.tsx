'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPSAttendance } from './GPSAttendance';
import { QRAttendance } from './QRAttendance';
import { SlideIn, FadeIn } from '@/components/animations/MicroInteractions';
import { 
  MapPin, 
  QrCode, 
  CheckCircle, 
  Clock,
  Smartphone,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  storeId: string;
  storeName: string;
  method: 'gps' | 'qr';
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  qrData?: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface StoreLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address: string;
  qrCode: string;
  isActive: boolean;
  attendanceMethods: ('gps' | 'qr')[];
}

interface AttendanceSystemProps {
  storeLocations: StoreLocation[];
  onAttendanceSubmit: (record: Omit<AttendanceRecord, 'id' | 'status'>) => Promise<boolean>;
  isLoading?: boolean;
  disabled?: boolean;
  todayAttendance?: AttendanceRecord[];
}

export function AttendanceSystem({
  storeLocations,
  onAttendanceSubmit,
  isLoading = false,
  disabled = false,
  todayAttendance = []
}: AttendanceSystemProps) {
  const [activeMethod, setActiveMethod] = useState<'gps' | 'qr'>('gps');
  const [submitting, setSubmitting] = useState(false);

  // GPS 출석 처리
  const handleGPSAttendance = async (storeId: string, position: any) => {
    const store = storeLocations.find(s => s.id === storeId);
    if (!store) return;

    setSubmitting(true);
    try {
      const attendanceData = {
        storeId,
        storeName: store.name,
        method: 'gps' as const,
        timestamp: Date.now(),
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        }
      };

      const success = await onAttendanceSubmit(attendanceData);
      if (success) {
        toast.success(`${store.name} GPS 출석이 완료되었습니다`);
      } else {
        toast.error('출석 처리 중 오류가 발생했습니다');
      }
    } catch (error) {
      toast.error('출석 처리 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // QR 출석 처리
  const handleQRAttendance = async (data: any) => {
    setSubmitting(true);
    try {
      const attendanceData = {
        storeId: data.storeId,
        storeName: data.storeName,
        method: 'qr' as const,
        timestamp: data.timestamp,
        qrData: data.qrCodeData
      };

      const success = await onAttendanceSubmit(attendanceData);
      if (success) {
        toast.success(`${data.storeName} QR 출석이 완료되었습니다`);
      } else {
        toast.error('출석 처리 중 오류가 발생했습니다');
      }
    } catch (error) {
      toast.error('출석 처리 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 오늘 출석한 지점 확인
  const isAttendedToday = (storeId: string): boolean => {
    return todayAttendance.some(record => 
      record.storeId === storeId && 
      record.status !== 'rejected'
    );
  };

  // 출석 가능한 지점 필터링
  const availableStores = storeLocations.filter(store => 
    store.isActive && 
    !isAttendedToday(store.id) &&
    store.attendanceMethods.includes(activeMethod)
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <FadeIn>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">출석 체크</h2>
          <p className="text-gray-600">위치 확인 또는 QR 코드 스캔으로 출석을 완료하세요</p>
        </div>
      </FadeIn>

      {/* 오늘 출석 현황 */}
      {todayAttendance.length > 0 && (
        <SlideIn direction="down">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                오늘 출석 완료 ({todayAttendance.length}개 지점)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="text-sm font-medium">{record.storeName}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={record.method === 'gps' ? 'default' : 'secondary'}>
                        {record.method === 'gps' ? (
                          <><MapPin className="h-3 w-3 mr-1" />GPS</>
                        ) : (
                          <><QrCode className="h-3 w-3 mr-1" />QR</>
                        )}
                      </Badge>
                      <Badge variant={
                        record.status === 'verified' ? 'default' :
                        record.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {record.status === 'verified' ? '확인됨' :
                         record.status === 'pending' ? '대기중' : '거부됨'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 출석 방법 선택 */}
      <SlideIn direction="up">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as 'gps' | 'qr')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gps" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>GPS 위치</span>
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4" />
                  <span>QR 코드</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gps" className="mt-6">
                <GPSAttendance
                  storeLocations={availableStores}
                  onAttendanceSuccess={handleGPSAttendance}
                  isLoading={submitting || isLoading}
                  disabled={disabled}
                />
              </TabsContent>

              <TabsContent value="qr" className="mt-6">
                <QRAttendance
                  storeLocations={availableStores}
                  onAttendanceSuccess={handleQRAttendance}
                  isLoading={submitting || isLoading}
                  disabled={disabled}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </SlideIn>

      {/* 출석 방법 비교 */}
      <SlideIn direction="up" delay={0.1}>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">출석 방법 비교</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GPS 방법 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">GPS 위치 확인</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    정확한 위치 기반 출석
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    자동 거리 계산
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-3 w-3 text-yellow-500 mr-2" />
                    실외에서 더 정확함
                  </li>
                </ul>
              </div>

              {/* QR 방법 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <QrCode className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">QR 코드 스캔</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    빠르고 간편한 인증
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    실내에서도 정확함
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-3 w-3 text-blue-500 mr-2" />
                    시간 제한으로 보안 강화
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* 사용 불가 상태 */}
      {availableStores.length === 0 && (
        <SlideIn direction="up" delay={0.2}>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-8 text-center">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                출석 가능한 지점이 없습니다
              </h3>
              <p className="text-gray-600">
                {todayAttendance.length > 0 
                  ? '오늘 모든 지점의 출석을 완료했습니다'
                  : `${activeMethod === 'gps' ? 'GPS' : 'QR 코드'} 출석을 지원하는 지점이 없습니다`
                }
              </p>
            </CardContent>
          </Card>
        </SlideIn>
      )}
    </div>
  );
}