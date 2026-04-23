import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductsService,
  updateProductService,
} from './product.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';

export const getProductsController = async (req: Request, res: Response) => {
  const { storeId } = req.query;
  const products = await getProductsService(storeId ? String(storeId) : undefined);
  return res.json(products);
};

export const getProductByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw Boom.badRequest('Product ID is required');
  const product = await getProductByIdService(String(id));
  return res.json(product);
};

export const createProductController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) throw Boom.unauthorized('User not authenticated');
  if (!req.body) throw Boom.badRequest('Request body is required');

  const { name, price, storeId } = req.body;
  if (!name || typeof name !== 'string') throw Boom.badRequest('Name is required');
  if (price === undefined || typeof price !== 'number') throw Boom.badRequest('Price must be a number');
  if (!storeId || typeof storeId !== 'string') throw Boom.badRequest('Store ID is required');

  const product = await createProductService({ name, price, storeId });
  return res.status(201).json(product);
};

export const updateProductController = async (req: Request, res: Response) => {
  if (!req.body) throw Boom.badRequest('Request body is required');
  const { id } = req.params;
  const { name, price } = req.body;
  if (!id) throw Boom.badRequest('Product ID is required');
  if (name !== undefined && typeof name !== 'string') throw Boom.badRequest('Name must be a string');
  if (price !== undefined && typeof price !== 'number') throw Boom.badRequest('Price must be a number');
  const product = await updateProductService({ id: String(id), name, price });
  return res.json(product);
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw Boom.badRequest('Product ID is required');
  await deleteProductService(String(id));
  return res.send('Product deleted');
};
