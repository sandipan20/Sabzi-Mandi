/**
 * POST /api/produce
 * Create a new produce listing (farmers only).
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { produceListing } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = session.user as { role?: string; id: string; name: string };
    if (user.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });

    const {
      id, name, nameHi, category, categoryHi, image,
      bulkPrice, bulkUnit = 'kg', minBulkQty, maxBulkQty, stock,
      harvestDate, region, regionHi, description, descriptionHi,
      exportReady = false, gradeOptions = [], packagingOptions = [], certifications = [],
    } = req.body;

    if (!id || !name || !bulkPrice || !minBulkQty || !stock) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.insert(produceListing).values({
      id,
      name,
      nameHi: nameHi || name,
      category: category || 'Vegetables',
      categoryHi: categoryHi || category || 'सब्जियां',
      image: image || '',
      bulkPrice: String(bulkPrice),
      bulkUnit,
      minBulkQty: Number(minBulkQty),
      maxBulkQty: Number(maxBulkQty || stock),
      stock: Number(stock),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      farmer: user.name,
      farmerHi: user.name,
      farmerId: user.id,
      region: region || '',
      regionHi: regionHi || region || '',
      verified: false,
      rating: '0.0',
      reviews: 0,
      description: description || '',
      descriptionHi: descriptionHi || description || '',
      exportReady: Boolean(exportReady),
      gradeOptions: JSON.stringify(gradeOptions),
      packagingOptions: JSON.stringify(packagingOptions),
      certifications: JSON.stringify(certifications),
      active: true,
    });

    const created = await db
      .select()
      .from(produceListing)
      .where(eq(produceListing.id, id))
      .limit(1);

    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing', message: String(error) });
  }
}
