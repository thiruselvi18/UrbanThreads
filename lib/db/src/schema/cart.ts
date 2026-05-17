import { pgTable, serial, text, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true });
export type CartItem = typeof cartItemsTable.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
