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

export const acceptOrderService = async (
  orderId: string,
  deliveryId: string,
  lat?: number,
  lng?: number,
): Promise<Order> => {
  // Build query dynamically: include delivery_position only when coordinates are provided
  let query: string
  let params: unknown[]

  if (lat !== undefined && lng !== undefined) {
    // ST_MakePoint expects (longitude, latitude)
    query = `
      UPDATE orders
      SET "deliveryId" = $1,
          status = $2,
          delivery_position = ST_SetSRID(ST_MakePoint($3, $4), 4326)
      WHERE id = $5 AND status = $6
      RETURNING *`
    params = [deliveryId, OrderStatus.IN_DELIVERY, lng, lat, orderId, OrderStatus.CREATED]
  } else {
    query = `
      UPDATE orders
      SET "deliveryId" = $1,
          status = $2
      WHERE id = $3 AND status = $4
      RETURNING *`
    params = [deliveryId, OrderStatus.IN_DELIVERY, orderId, OrderStatus.CREATED]
  }

  const { rows } = await pool.query<Order>(query, params)
  if (!rows[0]) throw Boom.badRequest('Order not available or already accepted')
  return rows[0]
}

export const updatePositionService = async (
  dto: UpdatePositionDTO,
): Promise<{ status: string; arrived: boolean; storeId: string }> => {
  // Step 1: enforce business rule — delivery must stop when order is already delivered
  const { rows: current } = await pool.query<{ status: string; storeId: string }>(
    `SELECT status, "storeId" FROM orders WHERE id = $1`,
    [dto.orderId],
  )

  if (!current[0]) throw Boom.notFound('Order not found')
  if (current[0].status === OrderStatus.DELIVERED) {
    throw Boom.badRequest('Order already delivered')
  }

  // Step 2: update delivery_position with PostGIS; auto-promote status to 'Entregado'
  // when ST_DWithin reports the delivery is within 5 metres of the destination.
  // ST_MakePoint expects (longitude, latitude).
  const { rows } = await pool.query<{ status: string; storeId: string; arrived: boolean }>(
    `UPDATE orders
     SET delivery_position = ST_SetSRID(ST_MakePoint($1, $2), 4326),
         status = CASE
           WHEN ST_DWithin(
             ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
             destination,
             5
           ) THEN $3
           ELSE status
         END
     WHERE id = $4
     RETURNING
       status,
       "storeId",
       ST_DWithin(delivery_position, destination, 5) AS arrived`,
    [dto.lng, dto.lat, OrderStatus.DELIVERED, dto.orderId],
  )

  if (!rows[0]) throw Boom.notFound('Order not found')

  return {
    status: rows[0].status,
    arrived: rows[0].arrived,
    storeId: rows[0].storeId ?? '',
  }
}
