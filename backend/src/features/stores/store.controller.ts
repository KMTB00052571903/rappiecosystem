import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  createStoreService,
  deleteStoreService,
  getStoreByIdService,
  getStoreByUserIdService,
  getStoresService,
  updateStoreService,
} from './store.service'
import { getUserFromRequest } from '../../middlewares/authMiddleware'

const getIdFromParams = (params: Request['params']): string => {
  const id = params.id
  if (Array.isArray(id)) return id[0]
  if (typeof id === 'string') return id
  throw Boom.badRequest('ID parameter is required')
}

export const getStoresController = async (req: Request, res: Response) => {
  const stores = await getStoresService()
  return res.json(stores)
}

export const getStoreByIdController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  const store = await getStoreByIdService(id)
  return res.json(store)
}

export const getMyStoreController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const store = await getStoreByUserIdService(user.id)
  if (!store) throw Boom.notFound('Store not found for this user')
  return res.json(store)
}

export const createStoreController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)
  const { name } = req.body
  if (!name) throw Boom.badRequest('Name is required')
  const store = await createStoreService({ name, userId: user.id })
  return res.status(201).json(store)
}

export const updateStoreController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  const { name, isOpen } = req.body
  const store = await updateStoreService({ id, name, isOpen })
  return res.json(store)
}

export const deleteStoreController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  await deleteStoreService(id)
  return res.send('Store deleted')
}
