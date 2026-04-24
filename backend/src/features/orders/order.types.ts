export { OrderStatus } from '../../enums/orderStatus.enum'
import { OrderStatus } from '../../enums/orderStatus.enum'

export interface Order {
  id: string
  consumerId: string
  storeId: string
  deliveryId?: string | null
  status: OrderStatus
  createdAt: string
  destination: unknown
  delivery_position?: unknown
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
}

export interface CreateOrderDTO {
  consumerId: string
  storeId: string
  items: { productId: string; quantity: number }[]
  destinationLat: number
  destinationLng: number
}

export interface UpdatePositionDTO {
  orderId: string
  lat: number
  lng: number
}
