import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { addressesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateAddressBody, DeleteAddressParams } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

function serialize(a: typeof addressesTable.$inferSelect) {
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

router.get("/addresses", requireAuth, async (req: any, res) => {
  try {
    const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, req.userId));
    res.json(addresses.map(serialize));
  } catch (err) {
    req.log.error({ err }, "Failed to list addresses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addresses", requireAuth, async (req: any, res) => {
  try {
    const parsed = CreateAddressBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

    const { isDefault, ...rest } = parsed.data;

    if (isDefault) {
      await db.update(addressesTable).set({ isDefault: 0 }).where(eq(addressesTable.userId, req.userId));
    }

    const [addr] = await db.insert(addressesTable).values({
      userId: req.userId,
      ...rest,
      isDefault: isDefault ? 1 : 0,
    }).returning();

    res.status(201).json(serialize(addr));
  } catch (err) {
    req.log.error({ err }, "Failed to create address");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/addresses/:id", requireAuth, async (req: any, res) => {
  try {
    const parsed = DeleteAddressParams.safeParse({ id: parseInt(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

    await db.delete(addressesTable).where(and(eq(addressesTable.id, parsed.data.id), eq(addressesTable.userId, req.userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete address");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
