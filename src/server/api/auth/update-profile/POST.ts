import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth.js';
import { db } from '@/server/db/client.js';
import { user, userProfile } from '@/server/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    // Get session from BetterAuth
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { role, companyName, farmName, farmLocation, phone } = req.body as {
      role?: string;
      companyName?: string;
      farmName?: string;
      farmLocation?: string;
      phone?: string;
    };

    const validRole = role === 'farmer' ? 'farmer' : 'buyer';

    // Update role on user row
    await db.update(user).set({ role: validRole }).where(eq(user.id, session.user.id));

    // Upsert profile
    const existing = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userProfile)
        .set({ companyName, farmName, farmLocation, phone })
        .where(eq(userProfile.userId, session.user.id));
    } else {
      await db.insert(userProfile).values({
        userId: session.user.id,
        companyName,
        farmName,
        farmLocation,
        phone,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('update-profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', message: String(error) });
  }
}
