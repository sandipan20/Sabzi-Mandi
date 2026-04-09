/**
 * Drizzle ORM schema — Sabzi Mandi
 *
 * Tables:
 *  - BetterAuth core tables: user, session, account, verification
 *  - Extended: userProfile (role: farmer | buyer, extra fields)
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  decimal,
  json,
} from 'drizzle-orm/mysql-core';

// ── BetterAuth required tables ──────────────────────────────────────────────

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  // Custom field: role stored on the user row
  role: varchar('role', { length: 20 }).notNull().default('buyer'),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── Produce listings table ───────────────────────────────────────────────────

export const produceListing = mysqlTable('produce_listing', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameHi: varchar('name_hi', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  categoryHi: varchar('category_hi', { length: 100 }).notNull(),
  image: text('image').notNull(),
  bulkPrice: decimal('bulk_price', { precision: 10, scale: 2 }).notNull(),
  bulkUnit: varchar('bulk_unit', { length: 20 }).notNull().default('kg'),
  minBulkQty: int('min_bulk_qty').notNull(),
  maxBulkQty: int('max_bulk_qty').notNull(),
  stock: int('stock').notNull(),
  harvestDate: varchar('harvest_date', { length: 20 }).notNull(),
  farmer: varchar('farmer', { length: 255 }).notNull(),
  farmerHi: varchar('farmer_hi', { length: 255 }).notNull(),
  farmerId: varchar('farmer_id', { length: 64 }).notNull(),
  region: varchar('region', { length: 255 }).notNull(),
  regionHi: varchar('region_hi', { length: 255 }).notNull(),
  verified: boolean('verified').notNull().default(false),
  rating: decimal('rating', { precision: 3, scale: 1 }).notNull().default('0.0'),
  reviews: int('reviews').notNull().default(0),
  description: text('description').notNull(),
  descriptionHi: text('description_hi').notNull(),
  exportReady: boolean('export_ready').notNull().default(false),
  gradeOptions: text('grade_options').notNull().default('[]'),
  packagingOptions: text('packaging_options').notNull().default('[]'),
  certifications: text('certifications').notNull().default('[]'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// ── Orders table ─────────────────────────────────────────────────────────────

export const order = mysqlTable('order', {
  id: varchar('id', { length: 64 }).primaryKey(),
  buyerId: varchar('buyer_id', { length: 36 }).notNull().references(() => user.id),
  // Razorpay IDs
  razorpayOrderId: varchar('razorpay_order_id', { length: 64 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 64 }),
  razorpaySignature: varchar('razorpay_signature', { length: 256 }),
  // Order details
  items: json('items').notNull(),           // CartItem[]
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  freightFee: decimal('freight_fee', { precision: 10, scale: 2 }).notNull(),
  grandTotal: decimal('grand_total', { precision: 12, scale: 2 }).notNull(),
  // Delivery info
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  address: text('address').notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull().default(''),
  deliveryType: varchar('delivery_type', { length: 20 }).notNull().default('delivery'),
  notes: text('notes'),
  // Status
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'),
  // pending | paid | failed | refunded
  orderStatus: varchar('order_status', { length: 20 }).notNull().default('pending'),
  // pending | confirmed | dispatched | delivered | cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// ── Extended profile table ───────────────────────────────────────────────────

export const userProfile = mysqlTable('user_profile', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Farmer-specific
  farmName: varchar('farm_name', { length: 255 }),
  farmLocation: varchar('farm_location', { length: 255 }),
  farmSizeAcres: int('farm_size_acres'),
  // Buyer-specific
  companyName: varchar('company_name', { length: 255 }),
  gstNumber: varchar('gst_number', { length: 20 }),
  // Shared
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
