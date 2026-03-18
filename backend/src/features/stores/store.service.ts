import Boom from '@hapi/boom'
import { supabase } from '../../config/supabase'
import { CreateStoreDTO, Store, UpdateStoreDTO } from './store.types'

// =========================
// 🏪 GET ALL STORES
// =========================
export const getStoresService = async (): Promise<Store[]> => {
  const { data, error } = await supabase.from('stores').select('*')

  if (error) {
    throw Boom.badImplementation(error.message)
  }

  return data as Store[]
}

// =========================
// 🏪 GET STORE BY ID
// =========================
export const getStoreByIdService = async (id: string): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw Boom.notFound('Store not found')
  }

  return data as Store
}

// =========================
// 🏪 CREATE STORE
// =========================
export const createStoreService = async (
  store: CreateStoreDTO
): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .insert([
      {
        name: store.name,
        userId: store.userId,
      },
    ])
    .select()
    .single()

  if (error) {
    throw Boom.badRequest(error.message)
  }

  return data as Store
}

// =========================
// 🏪 UPDATE STORE
// =========================
export const updateStoreService = async (
  store: UpdateStoreDTO
): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .update({
      name: store.name,
      isOpen: store.isOpen,
    })
    .eq('id', store.id)
    .select()
    .single()

  if (error || !data) {
    throw Boom.badRequest(error?.message || 'Update failed')
  }

  return data as Store
}

// =========================
// 🏪 DELETE STORE
// =========================
export const deleteStoreService = async (id: string): Promise<void> => {
  const { error } = await supabase.from('stores').delete().eq('id', id)

  if (error) {
    throw Boom.badRequest(error.message)
  }
}