import type { LucideIcon } from "lucide-react"

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"
export type RegisterRole = Exclude<Role, "ADMIN">
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
}
export interface Meta {
  page: number
  limit: number
  total: number
  totalPages?: number
}

export interface Paginated<T> {
  data: T[]
  meta: Meta
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: RegisterRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtUser {
  id: string
  name: string
  email: string
  role: Role
  iat: number
  exp: number
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
export interface Category {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  _count?: { gearItems: number }
}
export interface GearItem {
  id: string
  name: string
  description?: string
  brand?: string
  /** Cover image, used in cards and listings. */
  imageUrl?: string
  /** Extra gallery shots, shown on the detail page after the cover. */
  images?: string[]
  pricePerDay: string
  stock: number
  isAvailable: boolean
  categoryId: string
  category?: Category
  provider?: Pick<User, "id" | "name" | "email">
  createdAt?: string
  /** List endpoint only — aggregated across every review, not a page of them. */
  rating?: { average: number | null; count: number }
  _count?: { orderItems: number; reviews: number }
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
  payments?: Payment[]
  /** At most one — the schema keys reviews to the order, not the gear item. */
  review?: Review | null
  createdAt: string
}
export interface Payment {
  id: string
  /** Stripe checkout session id — the handle for support requests. */
  transactionId: string
  amount: string
  gateway: PaymentGateway
  status: PaymentStatus
  /** Null until the Stripe webhook confirms the charge. */
  paidAt?: string | null
  rentalOrderId?: string
  rentalOrder?: RentalOrder
  customer?: Pick<User, "id" | "name" | "email">
  createdAt: string
}
export interface CheckoutSession {
  paymentUrl: string | null
  payment: Payment
}

export interface Review {
  id: string
  rating: number
  comment?: string | null
  customer?: Pick<User, "id" | "name" | "email">
  rentalOrder?: RentalOrder
  rentalOrderId?: string
  gearItem?: GearItem
  gearItemId?: string
  createdAt?: string
}

export interface ReviewList extends Paginated<Review> {
  summary: { average: number | null; total: number }
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
