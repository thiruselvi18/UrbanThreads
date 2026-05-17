import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, addressesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

router.get("/orders", requireAuth, async (req: any, res) => {
  try {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId));
    const result = await Promise.all(orders.map(async (o) => await hydrateOrder(o, req.userId)));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", requireAuth, async (req: any, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

    const { addressId, paymentMethod } = parsed.data;

    const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));
    if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const [address] = await db.select().from(addressesTable).where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, req.userId)));
    if (!address) return res.status(404).json({ error: "Address not found" });

    const total = cartItems.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);

    const [order] = await db.insert(ordersTable).values({
      userId: req.userId,
      status: "confirmed",
      total: String(total.toFixed(2)),
      shippingAddressId: addressId,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }).returning();

    await db.insert(orderItemsTable).values(
      cartItems.map(i => ({
        orderId: order.id,
        productId: i.productId,
        productName: i.productName,
        productImageUrl: i.productImageUrl,
        price: i.price,
        size: i.size,
        quantity: i.quantity,
      }))
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId));

    const hydrated = await hydrateOrder(order, req.userId);
    res.status(201).json(hydrated);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", requireAuth, async (req: any, res) => {
  try {
    const parsed = GetOrderParams.safeParse({ id: parseInt(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

    const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, parsed.data.id), eq(ordersTable.userId, req.userId)));
    if (!order) return res.status(404).json({ error: "Not found" });

    res.json(await hydrateOrder(order, req.userId));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

async function hydrateOrder(order: typeof ordersTable.$inferSelect, userId: string) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  let shippingAddress = null;
  if (order.shippingAddressId) {
    const [addr] = await db.select().from(addressesTable).where(eq(addressesTable.id, order.shippingAddressId));
    if (addr) shippingAddress = serializeAddress(addr);
  }
  return {
    id: order.id,
    status: order.status,
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImageUrl: i.productImageUrl,
      price: Number(i.price),
      size: i.size,
      quantity: i.quantity,
    })),
    total: Number(order.total),
    shippingAddress,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt.toISOString(),
  };
}

function serializeAddress(a: typeof addressesTable.$inferSelect) {
  return {
    id: a.id,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone,
    isDefault: a.isDefault === 1,
  };
}

export default router;
