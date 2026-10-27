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
  "NONE" | "HELD" | "REFUNDED" | "PARTIALLY_REFUNDED" | "CLAIMED" | "KEPT"

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
  locale?: Locale
}

export interface GoogleLoginPayload {
  code: string
  codeVerifier: string
  redirectUri: string
  role: RegisterRole
  /** Only used when the Google account is new. */
  locale?: Locale
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  /** The user's saved language, so login lands on /bn for Bangla users. */
  locale?: Locale
}

export type Locale = "en" | "bn"

export interface JwtUser {
  id: string
  name: string
  email: string
  role: Role
  /** Tokens issued before avatars joined the payload don't carry it. */
  avatarUrl?: string | null
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
  avatarUrl?: string | null
  bio?: string | null
  city?: string | null
  area?: string | null
  /** Exact pickup point: only in your own profile. */
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
}

export interface LatLng {
  latitude: number
  longitude: number
}

/** A provider as shown on public pages: location rounded to ~1 km. */
export interface PublicProvider {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
  city?: string | null
  area?: string | null
  location?: LatLng | null
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
  provider?: PublicProvider
  createdAt?: string
  updatedAt?: string
  /** Only with a `near` search, in km. */
  distanceKm?: number
  /** List endpoint only — aggregated across every review, not a page of them. */
  rating?: { average: number | null; count: number }
  _count?: { orderItems: number; reviews: number }
  /** Only on the gear detail response. */
  reviewSummary?: ReviewSummary | null
  reviewSummaryAt?: string | null
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
  /** Set when an admin settles a damage claim. */
  claimResolvedAt?: string | null
  claimKeptAmount?: string | null
  claimResolutionNote?: string | null
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
  /** Order detail only. */
  pickup?: PickupPoint | null
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
  /** Hidden by an admin: left out of public lists, ratings and summaries. */
  isHidden?: boolean
  hiddenAt?: string | null
  createdAt?: string
}

export interface ReviewList extends Paginated<Review> {
  summary: { average: number | null; total: number }
}

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
  /** Show a live count next to the label. */
  badge?: "messages" | "claims" | "inbox"
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
  city?: string
  /** "lat,lng" */
  near?: string
  /** km around `near` */
  radius?: string
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

/** AI digest of an item's reviews (3+ reviews), stored on the gear item. */
export interface ReviewSummary {
  summary: string
  pros: string[]
  cons: string[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface GearFinderResult {
  reply: string
  gear: GearItem[]
  /** Browse filters for "See all matches". */
  filters: {
    category?: string
    maxPrice?: string
    searchTerm?: string
    from?: string
    to?: string
  }
}

export interface ListingDraft {
  description: string
  highlights: string[]
  categoryId: string
  suggestedPricePerDay: number
  priceReason: string
  usedImage: boolean
}

export interface ProviderProfile {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  city: string | null
  area: string | null
  location: LatLng | null
  createdAt: string
  stats: {
    listings: number
    completedRentals: number
    rating: { average: number | null; count: number }
    /** Median hours from booking request to confirmation. */
    responseHours: number | null
  }
  gear: GearItem[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    customerName: string
    gearItem: { id: string; name: string }
  }[]
}

export interface Favorites {
  ids: string[]
  items: GearItem[]
}

export interface OrderMessage {
  id: string
  rentalOrderId: string
  senderId: string
  body: string
  readAt: string | null
  createdAt: string
  sender: { id: string; name: string; role: Role; avatarUrl: string | null }
}

export interface UnreadMessages {
  total: number
  byOrder: Record<string, number>
}

/** Where to collect an order: exact once paid, approximate before. */
export interface PickupPoint {
  city: string | null
  area: string | null
  exact: boolean
  location: LatLng | null
}

export interface UploadSignature {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

// ---------------------------------------------------------------- admin

export interface AdminAnalytics {
  range: { from: string; to: string }
  totals: {
    /** Money in minus refunds, for payments made in the range. */
    netRevenue: number
    orders: number
    paidOrders: number
    averageOrderValue: number
    newUsers: number
    activeListings: number
  }
  /** One row per month ("2026-10"), zero-filled. */
  revenueByMonth: {
    month: string
    gross: number
    refunded: number
    net: number
  }[]
  ordersByStatus: { status: RentalStatus; count: number }[]
  topCategories: { name: string; orders: number; revenue: number }[]
  topProviders: { id: string; name: string; orders: number; revenue: number }[]
  rentalsByCity: { city: string; count: number }[]
}

export type ExportType = "users" | "rentals" | "payments" | "subscribers"

export interface ClaimList extends Paginated<RentalOrder> {
  openCount: number
}

export type ContactStatus = "NEW" | "REPLIED" | "ARCHIVED"

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  status: ContactStatus
  readAt?: string | null
  replyBody?: string | null
  repliedAt?: string | null
  createdAt: string
}

export interface InboxList extends Paginated<ContactMessage> {
  unread: number
}

export interface Subscriber {
  id: string
  email: string
  confirmedAt?: string | null
  unsubscribedAt?: string | null
  createdAt: string
}

export interface SubscriberList extends Paginated<Subscriber> {
  counts: { confirmed: number; pending: number; unsubscribed: number }
}

export interface AdminAttention {
  openClaims: number
  unreadMessages: number
}

// ------------------------------------------------------------ dashboards

export interface MonthAmount {
  /** "2026-10" (Dhaka time). */
  month: string
  amount: number
}

export interface StatusCount {
  status: RentalStatus
  count: number
}

/** `GET /api/rentals/stats`: six months, current month included. */
export interface CustomerStats {
  spendingByMonth: MonthAmount[]
  ordersByStatus: StatusCount[]
}

/** `GET /api/provider/stats`. */
export interface ProviderStats {
  earningsByMonth: MonthAmount[]
  ordersByStatus: StatusCount[]
  topGear: { id: string; name: string; orders: number }[]
}

// ------------------------------------------------------------- AI extras

/** One "Try: …" chip under the browse search box. */
export interface SearchSuggestion {
  label: string
  searchTerm?: string
  categoryId?: string
  city?: string
  maxPricePerDay?: number
}

export type InsightTone = "positive" | "warning" | "neutral"

/** `GET /api/admin/analytics/insights`. */
export interface AiInsights {
  headline: string
  insights: { tone: InsightTone; title: string; detail: string }[]
  /** "rules" when the AI was unavailable and only the rule checks ran. */
  source: "ai" | "rules"
}
