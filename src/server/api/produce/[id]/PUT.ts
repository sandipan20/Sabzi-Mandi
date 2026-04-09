/**
 * PUT /api/produce/:id
 * Update a produce listing (owner farmer only).
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

    // Verify ownership
    const existing = await db
      .select()
      .from(produceListing)
      .where(and(eq(produceListing.id, id), eq(produceListing.farmerId, user.id)))
      .limit(1);

    if (!existing.length) return res.status(404).json({ error: 'Listing not found or not yours' });

    const {
      name, nameHi, category, categoryHi, image,
      bulkPrice, bulkUnit, minBulkQty, maxBulkQty, stock,
      harvestDate, region, regionHi, description, descriptionHi,
      exportReady, gradeOptions, packagingOptions, certifications, active,
    } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (nameHi !== undefined) updateData.nameHi = nameHi;
    if (category !== undefined) updateData.category = category;
    if (categoryHi !== undefined) updateData.categoryHi = categoryHi;
    if (image !== undefined) updateData.image = image;
    if (bulkPrice !== undefined) updateData.bulkPrice = String(bulkPrice);
    if (bulkUnit !== undefined) updateData.bulkUnit = bulkUnit;
    if (minBulkQty !== undefined) updateData.minBulkQty = Number(minBulkQty);
    if (maxBulkQty !== undefined) updateData.maxBulkQty = Number(maxBulkQty);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (harvestDate !== undefined) updateData.harvestDate = harvestDate;
    if (region !== undefined) updateData.region = region;
    if (regionHi !== undefined) updateData.regionHi = regionHi;
    if (description !== undefined) updateData.description = description;
    if (descriptionHi !== undefined) updateData.descriptionHi = descriptionHi;
    if (exportReady !== undefined) updateData.exportReady = Boolean(exportReady);
    if (gradeOptions !== undefined) updateData.gradeOptions = JSON.stringify(gradeOptions);
    if (packagingOptions !== undefined) updateData.packagingOptions = JSON.stringify(packagingOptions);
    if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications);
    if (active !== undefined) updateData.active = Boolean(active);

    await db
      .update(produceListing)
      .set(updateData)
      .where(eq(produceListing.id, id));

    const updated = await db
      .select()
      .from(produceListing)
      .where(eq(produceListing.id, id))
      .limit(1);

    const row = updated[0];
    res.json({
      ...row,
      bulkPrice: Number(row.bulkPrice),
      rating: Number(row.rating),
      gradeOptions: JSON.parse(row.gradeOptions || '[]'),
      packagingOptions: JSON.parse(row.packagingOptions || '[]'),
      certifications: JSON.parse(row.certifications || '[]'),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update listing', message: String(error) });
  }
}
