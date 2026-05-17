import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveCartItemParams } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

router.get("/cart", requireAuth, async (req: any, res) => {
  try {
    const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    res.json(buildCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to get cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart", requireAuth, async (req: any, res) => {
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    res.json({ message: "Cart cleared" });
  } catch (err) {
    req.log.error({ err }, "Failed to clear cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cart/items", requireAuth, async (req: any, res) => {
  try {
    const parsed = AddToCartBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

    const { productId, size, quantity } = parsed.data;

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) return res.status(404).json({ error: "Product not found" });

    const [existing] = await db.select().from(cartItemsTable).where(
      and(eq(cartItemsTable.userId, req.userId), eq(cartItemsTable.productId, productId), eq(cartItemsTable.size, size))
    );

    if (existing) {
      await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity }).where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({
        userId: req.userId,
        productId,
        productName: product.name,
        productImageUrl: product.imageUrl,
        price: String(product.salePrice ?? product.price),
        size,
        quantity,
      });
    }

    const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    res.status(201).json(buildCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to add to cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/cart/items/:itemId", requireAuth, async (req: any, res) => {
  try {
    const paramsParsed = UpdateCartItemParams.safeParse({ itemId: parseInt(req.params.itemId) });
    const bodyParsed = UpdateCartItemBody.safeParse(req.body);
    if (!paramsParsed.success || !bodyParsed.success) return res.status(400).json({ error: "Invalid request" });

    const { itemId } = paramsParsed.data;
    const { quantity } = bodyParsed.data;

    if (quantity <= 0) {
      await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId)));
    } else {
      await db.update(cartItemsTable).set({ quantity }).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId)));
    }

    const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    res.json(buildCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to update cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/items/:itemId", requireAuth, async (req: any, res) => {
  try {
    const parsed = RemoveCartItemParams.safeParse({ itemId: parseInt(req.params.itemId) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, parsed.data.itemId), eq(cartItemsTable.userId, req.userId)));
    const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    res.json(buildCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to remove cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});

function buildCart(items: typeof cartItemsTable.$inferSelect[]) {
  const serialized = items.map(i => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName,
    productImageUrl: i.productImageUrl,
    price: Number(i.price),
    size: i.size,
    quantity: i.quantity,
  }));
  const subtotal = serialized.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const itemCount = serialized.reduce((acc, i) => acc + i.quantity, 0);
  return { items: serialized, subtotal, itemCount };
}

export default router;
