import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, like, gte, lte, sql } from "drizzle-orm";

const router = Router();

router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.featured, true))
      .limit(8);
    res.json(products.map(serializeProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/trending", async (req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.trending, true))
      .limit(8);
    res.json(products.map(serializeProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to get trending products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { category, gender, search, minPrice, maxPrice, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;
    
    const conditions = [];
    if (category) conditions.push(eq(productsTable.category, category));
    if (gender) conditions.push(eq(productsTable.gender, gender as "mens" | "womens" | "unisex"));
    if (search) conditions.push(like(productsTable.name, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));

    const products = await db
      .select()
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json(products.map(serializeProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(serializeProduct(product));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);
    res.json(cats);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/storefront/summary", async (req, res) => {
  try {
    const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
    const [mensCount] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.gender, "mens"));
    const [womensCount] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.gender, "womens"));

    const featured = await db.select().from(productsTable).where(eq(productsTable.featured, true)).limit(6);
    const trending = await db.select().from(productsTable).where(eq(productsTable.trending, true)).limit(6);
    const categories = await db.select().from(categoriesTable);

    res.json({
      totalProducts: Number(totalCount.count),
      mensProducts: Number(mensCount.count),
      womensProducts: Number(womensCount.count),
      featuredProducts: featured.map(serializeProduct),
      trendingProducts: trending.map(serializeProduct),
      categories,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get storefront summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

function serializeProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    gender: p.gender,
    category: p.category,
    sizes: p.sizes,
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls,
    inStock: p.inStock,
    featured: p.featured,
    trending: p.trending,
    rating: p.rating ? Number(p.rating) : null,
    reviewCount: p.reviewCount,
  };
}

export default router;
