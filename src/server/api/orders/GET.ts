/**
 * GET /api/orders
 * Returns the authenticated user's order history.
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { order } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await db
      .select()
      .from(order)
      .where(eq(order.buyerId, session.user.id))
      .orderBy(desc(order.createdAt))
      .limit(50);

    res.json(orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      freightFee: Number(o.freightFee),
      grandTotal: Number(o.grandTotal),
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', message: String(error) });
  }
}
