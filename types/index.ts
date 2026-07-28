import type { LucideIcon } from "lucide-react"

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED"
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED"
export type PaymentGateway = "STRIPE"
export type RentalStatus =
  "PLACED" | "CONFIRMED" | "CANCELLED" | "PAID" | "PICKED_UP" | "RETURNED"

export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: Meta
}
export interface Meta {
  page: number
  limit: number
  total: number
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface JwtUser {
  id: string
  name: string
  email: string
  role: Role
  iat: number
  exp: number
}
export interface Category {
  id: string
  name: string
  description?: string
}
export interface GearItem {
  id: string
  name: string
  description?: string
  brand?: string
  imageUrl?: string
  pricePerDay: string
  stock: number
  isAvailable: boolean
  categoryId: string
  category?: Category
  provider?: Pick<User, "id" | "name" | "email">
}
export interface OrderItem {
  id: string
  quantity: number
  pricePerDay: string
  rentalOrder?: RentalOrder
  gearItem?: GearItem
}
export interface RentalOrder {
  id: string
  status: RentalStatus
  startDate: string
  endDate: string
  totalAmount: string
  customer?: Pick<User, "id" | "name" | "email">
  items?: OrderItem[]
  createdAt: string
}
export interface Payment {
  id: string
  transactionId: string
  amount: string
  gateway: PaymentGateway
  status: PaymentStatus
  paidAt?: string
  rentalOrder?: RentalOrder
  customer?: Pick<User, "id" | "name" | "email">
}
export interface Review {
  id: string
  rating: number
  comment?: string
  customer?: Pick<User, "id" | "name" | "email">
  rentalOrder?: RentalOrder
  gearItem?: GearItem
}

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

export type GearQuery = {
  searchTerm?: string
  category?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  isAvailable?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: string
  limit?: string
}
