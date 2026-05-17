import { pgTable, serial, text, numeric, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const genderEnum = pgEnum("gender", ["mens", "womens", "unisex"]);

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gender: genderEnum("gender").notNull(),
  slug: text("slug").notNull().unique(),
  productCount: integer("product_count").notNull().default(0),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  gender: genderEnum("gender").notNull(),
  category: text("category").notNull(),
  sizes: text("sizes").array().notNull().default([]),
  imageUrl: text("image_url").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  trending: boolean("trending").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });

export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
