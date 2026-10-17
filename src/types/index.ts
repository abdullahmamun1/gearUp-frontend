import type { LucideIcon } from "lucide-react"

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"
export type RegisterRole = Exclude<Role, "ADMIN">
export type UserStatus = "ACTIVE" | "SUSPENDED"
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED"
export type PaymentGateway = "STRIPE"
export type RentalStatus =
  "PLACED" | "CONFIRMED" | "CANCELLED" | "PAID" | "PICKED_UP" | "RETURNED"
export type CancelReason =
  | "CUSTOMER"
  | "PROVIDER_DECLINED"
  | "PAYMENT_EXPIRED"
  | "NO_PROVIDER_RESPONSE"
  | "ADMIN"
export type DepositStatus =
  "NONE" | "HELD" | "REFUNDED" | "PARTIALLY_REFUNDED" | "CLAIMED"

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

export interface GoogleLoginPayload {
  code: string
  codeVerifier: string
  redirectUri: string
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
  /** Null until the emailed verification link is clicked. */
  emailVerifiedAt?: string | null
  marketingEmails?: boolean
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
  /** Refundable security deposit per unit. */
  depositAmount?: string
  /** Units the provider owns. Free units depend on dates — see GearAvailability. */
  stock: number
  isAvailable: boolean
  isFeatured?: boolean
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
  /** Units are held on every day in [startDate, endDate). */
  startDate: string
  endDate: string
  /** Rental cost only; the deposit is charged on top. */
  totalAmount: string
  depositAmount: string
  depositStatus: DepositStatus
  damageClaimAmount?: string | null
  damageNote?: string | null
  /** PLACED orders are auto-cancelled if the provider hasn't answered by then. */
  respondBy?: string | null
  /** CONFIRMED orders are auto-cancelled if unpaid by then. */
  paymentDueAt?: string | null
  confirmedAt?: string | null
  pickedUpAt?: string | null
  returnedAt?: string | null
  cancelledAt?: string | null
  cancelReason?: CancelReason | null
  cancelNote?: string | null
  customerId?: string
  providerId?: string
  customer?: Pick<User, "id" | "name" | "email">
  provider?: Pick<User, "id" | "name" | "email">
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
  /** Rental + deposit, as charged. */
  amount: string
  refundedAmount?: string
  refundedAt?: string | null
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
  /** Both or neither: only gear with a unit free on every day of [from, to). */
  from?: string
  to?: string
  page?: string
  limit?: string
}

export interface GearAvailability {
  gearItemId: string
  stock: number
  from: string
  to: string
  days: { date: string; available: number }[]
}
