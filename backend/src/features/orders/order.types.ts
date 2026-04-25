export { OrderStatus } from '../../enums/orderStatus.enum'
import { OrderStatus } from '../../enums/orderStatus.enum'

export interface Order {
  id: string
  consumer_id: string
  store_id: string
  delivery_id?: string | null
  status: OrderStatus
  created_at: string
  destination: unknown
  delivery_position?: unknown
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
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
