/**
 * GET /api/produce
 * Returns all active produce listings, optionally filtered by category.
 * Query params: ?category=Dairy&exportReady=true
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { produceListing } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

function parseRow(row: typeof produceListing.$inferSelect) {
  return {
    ...row,
    bulkPrice: Number(row.bulkPrice),
    rating: Number(row.rating),
    gradeOptions: JSON.parse(row.gradeOptions || '[]'),
    packagingOptions: JSON.parse(row.packagingOptions || '[]'),
    certifications: JSON.parse(row.certifications || '[]'),
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const { category, exportReady } = req.query;

    const conditions = [eq(produceListing.active, true)];

    if (category && category !== 'All') {
      conditions.push(eq(produceListing.category, String(category)));
    }
    if (exportReady === 'true') {
      conditions.push(eq(produceListing.exportReady, true));
    }

    const rows = await db
      .select()
      .from(produceListing)
      .where(and(...conditions))
      .orderBy(produceListing.category, produceListing.name);

    res.json(rows.map(parseRow));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch produce', message: String(error) });
  }
}
