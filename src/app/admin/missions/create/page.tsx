import { Metadata } from 'next';
import { MissionCreator } from '@/components/mission/MissionCreator';

export const metadata: Metadata = {
  title: '미션 생성 - 관리자',
  description: '새로운 미션을 생성하고 관리합니다',
};

export default function CreateMissionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MissionCreator />
    </div>
  );
}