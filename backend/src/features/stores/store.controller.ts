import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  createStoreService,
  deleteStoreService,
  getStoreByIdService,
  getStoresService,
  updateStoreService,
} from './store.service'
import { getUserFromRequest } from '../../middlewares/authMiddleware'

// =========================
// HELPER FUNCTION
// =========================
const getIdFromParams = (params: Request['params']): string => {
  const id = params.id
  if (Array.isArray(id)) return id[0]
  if (typeof id === 'string') return id
  throw Boom.badRequest('ID parameter is required')
}

// =========================
// GET ALL
// =========================
export const getStoresController = async (req: Request, res: Response) => {
  const stores = await getStoresService()
  return res.json(stores)
}

// =========================
// GET BY ID
// =========================
export const getStoreByIdController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  const store = await getStoreByIdService(id)
  return res.json(store)
}

// =========================
// CREATE
// =========================
export const createStoreController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req)

  const { name } = req.body

  if (!name) throw Boom.badRequest('Name is required')

  const store = await createStoreService({
    name,
    userId: user.id,
  })

  return res.status(201).json(store)
}

// =========================
// UPDATE
// =========================
export const updateStoreController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  const { name, isOpen } = req.body

  const store = await updateStoreService({
    id,
    name,
    isOpen,
  })

  return res.json(store)
}

// =========================
// DELETE
// =========================
export const deleteStoreController = async (req: Request, res: Response) => {
  const id = getIdFromParams(req.params)
  await deleteStoreService(id)
  return res.send('Store deleted')
}