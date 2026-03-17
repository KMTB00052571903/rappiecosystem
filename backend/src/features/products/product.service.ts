import { supabase } from '../../config/supabase'
import Boom from '@hapi/boom'

// Types 
export interface Product {
  id: string
  name: string
  price: number
  storeId: string
}

export interface CreateProductDTO {
  name: string
  price: number
  storeId: string
}

export interface UpdateProductDTO {
  id: string
  name?: string
  price?: number
}

// GET ALL
export const getProductsService = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*')

  if (error) throw Boom.badRequest(error.message)

  return data as Product[]
}

// GET BY ID
export const getProductByIdService = async (
  productId: string
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error || !data) {
    throw Boom.notFound('Product not found')
  }

  return data as Product
}

// CREATE
export const createProductService = async (
  product: CreateProductDTO
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw Boom.badRequest(error.message)

  return data as Product
}

// UPDATE
export const updateProductService = async (
  product: UpdateProductDTO
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      price: product.price,
    })
    .eq('id', product.id)
    .select()
    .single()

  if (error || !data) {
    throw Boom.notFound('Product not found')
  }

  return data as Product
}

// DELETE
export const deleteProductService = async (
  productId: string
): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw Boom.badRequest(error.message)
}