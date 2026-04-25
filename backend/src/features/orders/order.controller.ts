import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  getAvailableOrdersService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  getOrdersByDeliveryService,
  getOrderByIdService,
  createOrderService,
  acceptOrderService,
  updatePositionService,
} from './order.service'
import { getUserFromRequest } from '../../middlewares/authMiddleware'
import { supabase } from '../../config/supabase'

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Fire-and-forget server-side Supabase Broadcast.
 * Returns a promise so callers can .catch() errors without blocking the response.
 */
function broadcastEvent(channelName: string, event: string, payload: object): Promise<void> {
  return new Promise((resolve) => {
    const channel = supabase.channel(channelName)
    const timer = setTimeout(() => { supabase.removeChannel(channel); resolve() }, 3000)

    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return
      channel
        .send({ type: 'broadcast', event, payload })
        .then(() => { clearTimeout(timer); supabase.removeChannel(channel); resolve() })
        .catch(() => { clearTimeout(timer); supabase.removeChannel(channel); resolve() })
    })
  })
}

// ─── controllers ─────────────────────────────────────────────────────────────

export const getOrdersController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const { storeId, deliveryId, status } = req.query

  if (status === 'available') {
    return res.json(await getAvailableOrdersService())
  }
  if (storeId) {
    return res.json(await getOrdersByStoreService(String(storeId)))
  }
  if (deliveryId) {
    return res.json(await getOrdersByDeliveryService(String(deliveryId)))
  }
  return res.json(await getOrdersByConsumerService(user.id))
}

export const getOrderByIdController = async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) throw Boom.badRequest('Order ID is required')
  return res.json(await getOrderByIdService(String(id)))
}

export const createOrderController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const { storeId, items, destinationLat, destinationLng } = req.body

  if (!storeId) throw Boom.badRequest('storeId is required')
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw Boom.badRequest('items must be a non-empty array')
  }
  if (destinationLat === undefined || destinationLng === undefined) {
    throw Boom.badRequest('destination coordinates are required')
  }

  const order = await createOrderService({
    consumerId: user.id,
    storeId,
    items,
    destinationLat: Number(destinationLat),
    destinationLng: Number(destinationLng),
  })

  return res.status(201).json(order)
}

export const acceptOrderController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const { id } = req.params
  const { lat, lng } = req.body

  if (!id) throw Boom.badRequest('Order ID is required')

  const order = await acceptOrderService(
    String(id),
    user.id,
    lat !== undefined ? Number(lat) : undefined,
    lng !== undefined ? Number(lng) : undefined,
  )

  res.json(order)

  // Notify all parties subscribed to this order (consumer + delivery apps)
  broadcastEvent(`order:${id}`, 'order-accepted', {
    orderId: order.id,
    status: order.status,
    deliveryId: order.delivery_id,
  }).catch(console.error)

  // Also notify the store so it can update its order list
  if (order.store_id) {
    broadcastEvent(`store:${order.store_id}`, 'order-update', {
      orderId: order.id,
      status: order.status,
    }).catch(console.error)
  }
}

export const updatePositionController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { lat, lng } = req.body

  if (!id) throw Boom.badRequest('Order ID is required')
  if (lat === undefined || lng === undefined) {
    throw Boom.badRequest('lat and lng are required')
  }

  // 1. Update delivery_position in DB + ST_DWithin check
  const result = await updatePositionService({
    orderId: String(id),
    lat: Number(lat),
    lng: Number(lng),
  })

  // 2. Respond immediately — don't block on broadcast
  res.json({ status: result.status, arrived: result.arrived })

  // 3. Fire-and-forget broadcasts after DB update (satisfies: update DB → broadcast)
  const payload = { lat: Number(lat), lng: Number(lng), status: result.status }
  broadcastEvent(`order:${id}`, 'position-update', payload).catch(console.error)

  if (result.store_id) {
    broadcastEvent(`store:${result.store_id}`, 'order-update', {
      orderId: id,
      status: result.status,
    }).catch(console.error)
  }
}
