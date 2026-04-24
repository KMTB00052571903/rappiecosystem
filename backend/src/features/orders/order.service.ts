import Boom from '@hapi/boom'
import { supabase } from '../../config/supabase'
import pool from '../../config/database'
import { CreateOrderDTO, Order, OrderStatus, UpdatePositionDTO } from './order.types'

export const getAvailableOrdersService = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('status', OrderStatus.CREATED)
    .order('createdAt', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByConsumerService = async (consumerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('consumerId', consumerId)
    .order('createdAt', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByStoreService = async (storeId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('storeId', storeId)
    .order('createdAt', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByDeliveryService = async (deliveryId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('deliveryId', deliveryId)
    .order('createdAt', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrderByIdService = async (orderId: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', orderId)
    .single()

  if (error || !data) throw Boom.notFound('Order not found')
  return data as Order
}

export const createOrderService = async (dto: CreateOrderDTO): Promise<Order> => {
  const { rows } = await pool.query<Order>(
    `INSERT INTO orders ("consumerId", "storeId", status, destination)
     VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
     RETURNING *`,
    [dto.consumerId, dto.storeId, OrderStatus.CREATED, dto.destinationLng, dto.destinationLat],
  )

  const order = rows[0]
  if (!order) throw Boom.badRequest('Failed to create order')

  if (dto.items.length > 0) {
    const orderItems = dto.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw Boom.badRequest(itemsError.message)
    }
  }

  return order
}

export const acceptOrderService = async (orderId: string, deliveryId: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ deliveryId, status: OrderStatus.IN_DELIVERY })
    .eq('id', orderId)
    .eq('status', OrderStatus.CREATED)
    .select()
    .single()

  if (error || !data) throw Boom.badRequest('Order not available or already accepted')
  return data as Order
}

// Calls PostgreSQL RPC that does: update delivery_position + ST_DWithin check + status update
export const updatePositionService = async (
  dto: UpdatePositionDTO
): Promise<{ status: string; arrived: boolean; storeId: string }> => {
  // Step 1: update position in DB + check 5m proximity via PostGIS ST_DWithin
  const { data, error } = await supabase.rpc('update_order_position', {
    p_order_id: dto.orderId,
    p_lat: dto.lat,
    p_lng: dto.lng,
  })

  if (error) throw Boom.badImplementation(error.message)

  // Step 2: get storeId so the controller can broadcast to the store channel
  const { data: orderRow } = await supabase
    .from('orders')
    .select('storeId')
    .eq('id', dto.orderId)
    .single()

  const status = data as string
  return {
    status,
    arrived: status === OrderStatus.DELIVERED,
    storeId: (orderRow as { storeId: string } | null)?.storeId ?? '',
  }
}
