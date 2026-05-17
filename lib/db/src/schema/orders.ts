import { pgTable, serial, text, numeric, integer, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fullName: text("full_name").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phone: text("phone").notNull(),
  isDefault: integer("is_default").notNull().default(0),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: integer("shipping_address_id"),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull(),
});

export const insertAddressSchema = createInsertSchema(addressesTable).omit({ id: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true });

export type Address = typeof addressesTable.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
