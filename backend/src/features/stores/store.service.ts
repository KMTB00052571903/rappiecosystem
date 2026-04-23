import Boom from '@hapi/boom'
import { supabase } from '../../config/supabase'
import { CreateStoreDTO, Store, UpdateStoreDTO } from './store.types'

export const getStoresService = async (): Promise<Store[]> => {
  const { data, error } = await supabase.from('stores').select('*')
  if (error) throw Boom.badImplementation(error.message)
  return (data ?? []) as Store[]
}

export const getStoreByIdService = async (id: string): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) throw Boom.notFound('Store not found')
  return data as Store
}

export const getStoreByUserIdService = async (userId: string): Promise<Store | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('userId', userId)
    .single()
  if (error || !data) return null
  return data as Store
}

export const createStoreService = async (store: CreateStoreDTO): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .insert([{ name: store.name, userId: store.userId }])
    .select()
    .single()
  if (error) throw Boom.badRequest(error.message)
  return data as Store
}

export const updateStoreService = async (store: UpdateStoreDTO): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .update({ name: store.name, isOpen: store.isOpen })
    .eq('id', store.id)
    .select()
    .single()
  if (error || !data) throw Boom.badRequest(error?.message ?? 'Update failed')
  return data as Store
}

export const deleteStoreService = async (id: string): Promise<void> => {
  const { error } = await supabase.from('stores').delete().eq('id', id)
  if (error) throw Boom.badRequest(error.message)
}
