import { Router } from 'express'
import {
  getOrdersController,
  getOrderByIdController,
  createOrderController,
  acceptOrderController,
  updatePositionController,
} from './order.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

export const router = Router()

router.use(authMiddleware)

router.get('/', getOrdersController)
router.get('/:id', getOrderByIdController)
router.post('/', createOrderController)
router.patch('/:id/accept', acceptOrderController)
router.patch('/:id/position', updatePositionController)
