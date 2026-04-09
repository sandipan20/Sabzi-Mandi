/**
 * Seed script — populates produce_listing from static data in produce.ts
 * Run once: npx tsx src/server/db/seed-produce.ts
 */
import { db } from './client.js';
import { produceListing } from './schema.js';
import { produceData, dairyData } from '../../data/produce.js';

const allItems = [...produceData, ...dairyData];

async function seed() {
  console.log(`Seeding ${allItems.length} produce listings…`);

  for (const item of allItems) {
    await db
      .insert(produceListing)
      .values({
        id: item.id,
        name: item.name,
        nameHi: item.nameHi,
        category: item.category,
        categoryHi: item.categoryHi,
        image: item.image,
        bulkPrice: String(item.bulkPrice),
        bulkUnit: item.bulkUnit,
        minBulkQty: item.minBulkQty,
        maxBulkQty: item.maxBulkQty,
        stock: item.stock,
        harvestDate: item.harvestDate,
        farmer: item.farmer,
        farmerHi: item.farmerHi,
        farmerId: item.farmerId,
        region: item.region,
        regionHi: item.regionHi,
        verified: item.verified,
        rating: String(item.rating),
        reviews: item.reviews,
        description: item.description,
        descriptionHi: item.descriptionHi,
        exportReady: item.exportReady,
        gradeOptions: JSON.stringify(item.gradeOptions),
        packagingOptions: JSON.stringify(item.packagingOptions),
        certifications: JSON.stringify(item.certifications),
        active: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: item.name,
          bulkPrice: String(item.bulkPrice),
          stock: item.stock,
          harvestDate: item.harvestDate,
          active: true,
        },
      });
    console.log(`  ✓ ${item.id}`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
