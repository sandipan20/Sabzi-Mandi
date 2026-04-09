/**
 * GET /api/produce/:id
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { produceListing } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rows = await db
      .select()
      .from(produceListing)
      .where(eq(produceListing.id, id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const row = rows[0];
    res.json({
      ...row,
      bulkPrice: Number(row.bulkPrice),
      rating: Number(row.rating),
      gradeOptions: JSON.parse(row.gradeOptions || '[]'),
      packagingOptions: JSON.parse(row.packagingOptions || '[]'),
      certifications: JSON.parse(row.certifications || '[]'),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing', message: String(error) });
  }
}
