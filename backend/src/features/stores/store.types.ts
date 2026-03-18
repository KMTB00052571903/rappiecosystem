export interface Store {
  id: string
  name: string
  isOpen: boolean
  userId: string
}

// =========================
// DTOs
// =========================

export interface CreateStoreDTO {
  name: string
  userId: string
}

export interface UpdateStoreDTO {
  id: string
  name?: string
  isOpen?: boolean
}