import { Router } from 'express'
import {
  createStoreController,
  deleteStoreController,
  getMyStoreController,
  getStoreByIdController,
  getStoresController,
  updateStoreController,
} from './store.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

export const router = Router()

// Public
router.get('/', getStoresController)
router.get('/me', authMiddleware, getMyStoreController)
router.get('/:id', getStoreByIdController)

// Protected
router.post('/', authMiddleware, createStoreController)
router.patch('/:id', authMiddleware, updateStoreController)
router.delete('/:id', authMiddleware, deleteStoreController)
