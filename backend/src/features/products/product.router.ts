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

// 🔒 Todas las rutas protegidas
router.use(authMiddleware);

// 📦 GET ALL PRODUCTS
router.get('/', getProductsController);

// 📦 GET PRODUCT BY ID
router.get('/:id', getProductByIdController);

// 📦 CREATE PRODUCT
router.post('/', createProductController);

// 📦 UPDATE PRODUCT
router.patch('/:id', updateProductController);

// 📦 DELETE PRODUCT
router.delete('/:id', deleteProductController);