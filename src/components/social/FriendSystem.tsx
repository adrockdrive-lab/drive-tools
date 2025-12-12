'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { socialService } from '@/lib/services/social';
import { useAppStore } from '@/lib/store';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  MessageCircle,
  UserX,
  Clock,
  Heart,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

interface Friend {
  id: string;
  name: string;
  phone: string;
  friendshipId: number;
  friendshipCreatedAt: string;
}

interface FriendRequest {
  id: number;
  requester: {
    id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
}

export function FriendSystem() {
  const { user } = useAppStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const result = await socialService.getFriends(user.id);
    
    if (result.success) {
      setFriends(result.friends || []);
    } else {
      toast.error('친구 목록을 불러올 수 없습니다: ' + result.error);
    }
    setIsLoading(false);
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    
    const result = await socialService.getFriendRequests(user.id);
    
    if (result.success) {
      setFriendRequests(result.requests || []);
    } else {
      toast.error('친구 요청 목록을 불러올 수 없습니다: ' + result.error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const result = await socialService.searchUsers(query, user.id);
    
    if (result.success) {
      setSearchResults(result.users || []);
    } else {
      toast.error('사용자 검색에 실패했습니다: ' + result.error);
    }
    setIsSearching(false);
  };

  const sendFriendRequest = async (userId: string, userName: string) => {
    const result = await socialService.sendFriendRequest(userId);
    
    if (result.success) {
      toast.success(`${userName}님께 친구 요청을 보냈습니다`);
      // 검색 결과에서 제거
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } else {
      toast.error('친구 요청 전송에 실패했습니다: ' + result.error);
    }
  };

  const respondToFriendRequest = async (requestId: number, accept: boolean, requesterName: string) => {
    const result = await socialService.respondToFriendRequest(requestId, accept);
    
    if (result.success) {
      if (accept) {
        toast.success(`${requesterName}님과 친구가 되었습니다!`);
        loadFriends(); // 친구 목록 새로고침
      } else {
        toast.success('친구 요청을 거절했습니다');
      }
      loadFriendRequests(); // 요청 목록 새로고침
    } else {
      toast.error('친구 요청 처리에 실패했습니다: ' + result.error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // 디바운스
    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">친구</h1>
          <p className="text-gray-600">친구들과 함께 미션을 완료하고 경쟁해보세요</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <HoverScale>
              <Button className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>친구 추가</span>
              </Button>
            </HoverScale>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>친구 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름 또는 전화번호로 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {isSearching && (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map(searchUser => (
                  <SlideIn key={searchUser.id} direction="up" delay={0.1}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {searchUser.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{searchUser.name}</p>
                          <p className="text-sm text-gray-500">{searchUser.phone}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(searchUser.id, searchUser.name)}
                        className="flex items-center space-x-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>요청</span>
                      </Button>
                    </div>
                  </SlideIn>
                ))}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HoverScale>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">친구</p>
                  <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </HoverScale>
        
        <HoverScale>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">받은 요청</p>
                  <p className="text-2xl font-bold text-gray-900">{friendRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </HoverScale>
        
        <HoverScale>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">온라인 친구</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {friends.filter(() => Math.random() > 0.7).length}
                  </p>
                </div>
                <div className="relative">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </div>

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="friends" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>친구 목록</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2 relative">
            <UserPlus className="h-4 w-4" />
            <span>요청</span>
            {friendRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {friendRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : friends.length === 0 ? (
            <SlideIn direction="up">
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    아직 친구가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    친구를 추가하고 함께 미션을 완료해보세요!
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>친구 추가하기</Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </SlideIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend, index) => (
                <SlideIn key={friend.id} direction="up" delay={index * 0.1}>
                  <HoverScale>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {friend.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                            <p className="text-sm text-gray-500">{friend.phone}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(friend.friendshipCreatedAt).toLocaleDateString()} 친구
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            메시지
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverScale>
                </SlideIn>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {friendRequests.length === 0 ? (
            <SlideIn direction="up">
              <Card>
                <CardContent className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    새로운 친구 요청이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    친구 요청이 오면 여기에 표시됩니다
                  </p>
                </CardContent>
              </Card>
            </SlideIn>
          ) : (
            <div className="space-y-4">
              {friendRequests.map((request, index) => (
                <SlideIn key={request.id} direction="up" delay={index * 0.1}>
                  <HoverScale>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                {request.requester.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{request.requester.name}</h3>
                              <p className="text-sm text-gray-500">{request.requester.phone}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => respondToFriendRequest(request.id, true, request.requester.name)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              수락
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToFriendRequest(request.id, false, request.requester.name)}
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              거절
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverScale>
                </SlideIn>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}