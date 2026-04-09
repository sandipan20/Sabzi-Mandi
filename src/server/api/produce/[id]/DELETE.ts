/**
 * DELETE /api/produce/:id
 * Soft-delete (sets active=false) — farmer owner only.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { produceListing } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = session.user as { role?: string; id: string };
    if (user.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });

    const { id } = req.params;

    const existing = await db
      .select()
      .from(produceListing)
      .where(and(eq(produceListing.id, id), eq(produceListing.farmerId, user.id)))
      .limit(1);

    if (!existing.length) return res.status(404).json({ error: 'Listing not found or not yours' });

    await db
      .update(produceListing)
      .set({ active: false })
      .where(eq(produceListing.id, id));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing', message: String(error) });
  }
}
