import { Router } from 'express'
import {
  createStoreController,
  deleteStoreController,
  getStoreByIdController,
  getStoresController,
  updateStoreController,
} from './store.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

export const router = Router()

// 🔓 Públicas
router.get('/', getStoresController)
router.get('/:id', getStoreByIdController)

// 🔐 Protegidas
router.post('/', authMiddleware, createStoreController)
router.patch('/:id', authMiddleware, updateStoreController)
router.delete('/:id', authMiddleware, deleteStoreController)