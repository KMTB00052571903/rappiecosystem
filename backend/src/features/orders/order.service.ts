import Boom from '@hapi/boom'
import { supabase } from '../../config/supabase'
import { CreateOrderDTO, Order, OrderStatus, UpdatePositionDTO } from './order.types'

export const getAvailableOrdersService = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('status', OrderStatus.CREATED)
    .order('created_at', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByConsumerService = async (consumerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('consumer_id', consumerId)
    .order('created_at', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByStoreService = async (storeId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Order[]
}

export const getOrdersByDeliveryService = async (deliveryId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('delivery_id', deliveryId)
    .order('created_at', { ascending: false })

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
  // RPC handles the PostGIS ST_MakePoint call for the destination geography column.
  // See: supabase/migrations — function create_order(...)
  const { data, error } = await supabase.rpc('create_order', {
    p_consumer_id: dto.consumerId,
    p_store_id: dto.storeId,
    p_status: OrderStatus.CREATED,
    p_lng: dto.destinationLng,
    p_lat: dto.destinationLat,
  })

  if (error) throw Boom.badImplementation(error.message)

  const order = (data as Order[])[0]
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

export const acceptOrderService = async (
  orderId: string,
  deliveryId: string,
  lat?: number,
  lng?: number,
): Promise<Order> => {
  if (lat !== undefined && lng !== undefined) {
    // Coordinates provided: use RPC to set delivery_position via PostGIS ST_MakePoint.
    // See: supabase/migrations — function accept_order_with_position(...)
    const { data, error } = await supabase.rpc('accept_order_with_position', {
      p_order_id: orderId,
      p_delivery_id: deliveryId,
      p_status: OrderStatus.IN_DELIVERY,
      p_lng: lng,
      p_lat: lat,
    })

    if (error) throw Boom.badImplementation(error.message)

    const order = (data as Order[])[0]
    if (!order) throw Boom.badRequest('Order not available or already accepted')
    return order
  }

  // No initial position: plain Supabase update is sufficient.
  const { data, error } = await supabase
    .from('orders')
    .update({ delivery_id: deliveryId, status: OrderStatus.IN_DELIVERY })
    .eq('id', orderId)
    .eq('status', OrderStatus.CREATED)
    .select()
    .single()

  if (error || !data) throw Boom.badRequest('Order not available or already accepted')
  return data as Order
}

export const updatePositionService = async (
  dto: UpdatePositionDTO,
): Promise<{ status: string; arrived: boolean; store_id: string }> => {
  // Step 1: enforce business rule — stop position updates once delivered.
  const { data: current, error: selectErr } = await supabase
    .from('orders')
    .select('status, store_id')
    .eq('id', dto.orderId)
    .single()

  if (selectErr || !current) throw Boom.notFound('Order not found')

  const { status: currentStatus } = current as { status: string; store_id: string }
  if (currentStatus === OrderStatus.DELIVERED) {
    throw Boom.badRequest('Order already delivered')
  }

  // Step 2: update delivery_position + auto-promote status via PostGIS ST_DWithin(5m).
  // See: supabase/migrations — function update_order_position(...)
  const { data, error } = await supabase.rpc('update_order_position', {
    p_order_id: dto.orderId,
    p_lng: dto.lng,
    p_lat: dto.lat,
  })

  if (error) throw Boom.badImplementation(error.message)

  const row = (data as { status: string; store_id: string; arrived: boolean }[])[0]
  if (!row) throw Boom.notFound('Order not found after position update')

  return {
    status: row.status,
    arrived: row.arrived,
    store_id: row.store_id ?? '',
  }
}
