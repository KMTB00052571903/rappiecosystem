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

export const getOrdersController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const { storeId, deliveryId, status } = req.query

  if (status === 'available') {
    const orders = await getAvailableOrdersService()
    return res.json(orders)
  }

  if (storeId) {
    const orders = await getOrdersByStoreService(String(storeId))
    return res.json(orders)
  }

  if (deliveryId) {
    const orders = await getOrdersByDeliveryService(String(deliveryId))
    return res.json(orders)
  }

  const orders = await getOrdersByConsumerService(user.id)
  return res.json(orders)
}

export const getOrderByIdController = async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) throw Boom.badRequest('Order ID is required')
  const order = await getOrderByIdService(String(id))
  return res.json(order)
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
  if (!id) throw Boom.badRequest('Order ID is required')
  const order = await acceptOrderService(String(id), user.id)
  return res.json(order)
}

export const updatePositionController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { lat, lng } = req.body

  if (!id) throw Boom.badRequest('Order ID is required')
  if (lat === undefined || lng === undefined) {
    throw Boom.badRequest('lat and lng are required')
  }

  const result = await updatePositionService({
    orderId: String(id),
    lat: Number(lat),
    lng: Number(lng),
  })

  return res.json(result)
}
