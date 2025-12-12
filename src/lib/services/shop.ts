import { supabase } from '@/lib/supabase'

export interface ShopItem {
  id: string
  name: string
  description: string
  type: string
  price: number
  icon: string
  isPurchased?: boolean
  isEquipped?: boolean
  metadata?: any
}

export interface UserInventory {
  id: string
  userId: string
  itemId: string
  purchasedAt: string
  isEquipped: boolean
  item: ShopItem
}

// 상점 아이템 목록 조회
export async function getShopItems(userId: string): Promise<ShopItem[]> {
  try {
    // 모든 아이템 조회
    const { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('price', { ascending: true })

    if (itemsError) throw itemsError

    // 사용자 인벤토리 조회
    const { data: inventory, error: inventoryError } = await supabase
      .from('user_inventory')
      .select('item_id, is_equipped')
      .eq('user_id', userId)

    if (inventoryError) throw inventoryError

    const inventoryMap = new Map(inventory?.map((inv) => [inv.item_id, inv.is_equipped]) || [])

    return (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price,
      icon: item.icon,
      isPurchased: inventoryMap.has(item.id),
      isEquipped: inventoryMap.get(item.id) || false,
      metadata: item.metadata,
    }))
  } catch (error) {
    console.error('Error loading shop items:', error)
    return []
  }
}

// 아이템 구매
export async function purchaseItem(userId: string, itemId: string): Promise<void> {
  try {
    // 아이템 정보 조회
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (itemError) throw itemError
    if (!item) throw new Error('아이템을 찾을 수 없습니다.')

    // 사용자 코인 잔액 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single()

    if (userError) throw userError
    if (!user) throw new Error('사용자를 찾을 수 없습니다.')

    // 잔액 확인
    if (user.coins < item.price) {
      throw new Error('코인이 부족합니다.')
    }

    // 이미 구매했는지 확인
    const { data: existing, error: existingError } = await supabase
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single()

    if (existing) {
      throw new Error('이미 구매한 아이템입니다.')
    }

    // 트랜잭션으로 처리
    // 1. 코인 차감
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins - item.price })
      .eq('id', userId)

    if (updateError) throw updateError

    // 2. 인벤토리에 추가
    const { error: inventoryError } = await supabase.from('user_inventory').insert({
      user_id: userId,
      item_id: itemId,
      is_equipped: false,
    })

    if (inventoryError) throw inventoryError

    // 3. 코인 히스토리 기록
    await supabase.from('coin_history').insert({
      user_id: userId,
      amount: -item.price,
      type: 'purchase',
      description: `${item.name} 구매`,
      metadata: { itemId, itemName: item.name },
    })

    // 4. 알림 생성
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'item_purchased',
      title: '아이템 구매 완료',
      message: `${item.name}을(를) 구매했습니다!`,
      metadata: { itemId, itemName: item.name },
      is_read: false,
    })
  } catch (error) {
    console.error('Error purchasing item:', error)
    throw error
  }
}

// 아이템 장착
export async function equipItem(userId: string, itemId: string): Promise<void> {
  try {
    // 아이템 타입 조회
    const { data: inventory, error: inventoryError } = await supabase
      .from('user_inventory')
      .select('id, item:shop_items(type)')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single()

    if (inventoryError) throw inventoryError
    if (!inventory) throw new Error('보유하지 않은 아이템입니다.')

    const itemType = (inventory.item as any).type

    // 같은 타입의 다른 아이템 장착 해제
    await supabase
      .from('user_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .in(
        'item_id',
        supabase.from('shop_items').select('id').eq('type', itemType) as any
      )

    // 선택한 아이템 장착
    const { error: equipError } = await supabase
      .from('user_inventory')
      .update({ is_equipped: true })
      .eq('id', inventory.id)

    if (equipError) throw equipError
  } catch (error) {
    console.error('Error equipping item:', error)
    throw error
  }
}

// 아이템 장착 해제
export async function unequipItem(userId: string, itemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .eq('item_id', itemId)

    if (error) throw error
  } catch (error) {
    console.error('Error unequipping item:', error)
    throw error
  }
}

// 사용자 인벤토리 조회
export async function getUserInventory(userId: string): Promise<UserInventory[]> {
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        item:shop_items(*)
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    if (error) throw error

    return (data || []).map((inv) => ({
      id: inv.id,
      userId: inv.user_id,
      itemId: inv.item_id,
      purchasedAt: inv.purchased_at,
      isEquipped: inv.is_equipped,
      item: {
        id: inv.item.id,
        name: inv.item.name,
        description: inv.item.description,
        type: inv.item.type,
        price: inv.item.price,
        icon: inv.item.icon,
        metadata: inv.item.metadata,
      },
    }))
  } catch (error) {
    console.error('Error loading inventory:', error)
    return []
  }
}

// 코인 히스토리 조회
export async function getCoinHistory(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('coin_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading coin history:', error)
    return []
  }
}

// 코인 추가 (미션 완료, 보상 등)
export async function addCoins(
  userId: string,
  amount: number,
  type: string,
  description: string,
  metadata?: any
): Promise<void> {
  try {
    // 사용자 코인 업데이트
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: (user?.coins || 0) + amount })
      .eq('id', userId)

    if (updateError) throw updateError

    // 히스토리 기록
    await supabase.from('coin_history').insert({
      user_id: userId,
      amount,
      type,
      description,
      metadata,
    })
  } catch (error) {
    console.error('Error adding coins:', error)
    throw error
  }
}
