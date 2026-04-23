import { Router } from 'express';
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  getProductsController,
  updateProductController,
} from './product.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

// Public: consumers browse products without logging in
router.get('/', getProductsController);
router.get('/:id', getProductByIdController);

// Protected: only store owners manage products
router.post('/', authMiddleware, createProductController);
router.patch('/:id', authMiddleware, updateProductController);
router.delete('/:id', authMiddleware, deleteProductController);
