import { getPool } from '../api/_lib/db.js';

function overlapScore(tagsA, tagsB) {
  if (!tagsA.size || !tagsB.size) return 0;
  let common = 0;
  for (const t of tagsA) {
    if (tagsB.has(t)) common += 1;
  }
  const union = new Set([...tagsA, ...tagsB]).size;
  return union ? common / union : 0;
}

function parseTags(raw) {
  if (!raw) return new Set();
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean));
    }
  } catch {
    // fallback below
  }
  return new Set(String(raw).split(',').map((v) => v.trim().toLowerCase()).filter(Boolean));
}

async function run() {
  const pool = getPool();
  const [products] = await pool.query(
    `SELECT id, category, price, tags
     FROM products
     WHERE stock > 0`
  );

  const normalized = products.map((p) => ({
    id: Number(p.id),
    category: String(p.category || '').trim().toLowerCase(),
    price: Number(p.price || 0),
    tags: parseTags(p.tags),
  })).filter((p) => p.id > 0);

  const rows = [];
  for (const base of normalized) {
    const candidates = normalized
      .filter((p) => p.id !== base.id)
      .map((other) => {
        const categoryBoost = base.category && base.category === other.category ? 0.4 : 0;
        const priceDiff = Math.abs(base.price - other.price);
        const priceBoost = base.price > 0 ? Math.max(0, 0.35 - (priceDiff / Math.max(base.price, 1)) * 0.35) : 0;
        const tagBoost = overlapScore(base.tags, other.tags) * 0.5;
        const score = Math.min(0.99, categoryBoost + priceBoost + tagBoost);
        return { other, score };
      })
      .filter((x) => x.score >= 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    for (const candidate of candidates) {
      const relationshipType = base.category && base.category === candidate.other.category
        ? 'frequently_bought_together'
        : 'accessory';
      rows.push({
        product_id: base.id,
        related_product_id: candidate.other.id,
        relationship_type: relationshipType,
        strength_score: Number(candidate.score.toFixed(2)),
      });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM product_relationships');
    for (const row of rows) {
      await conn.query(
        `INSERT INTO product_relationships (product_id, related_product_id, relationship_type, strength_score)
         VALUES (?, ?, ?, ?)`,
        [row.product_id, row.related_product_id, row.relationship_type, row.strength_score]
      );
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }

  console.log(JSON.stringify({
    ok: true,
    products: normalized.length,
    relationships_created: rows.length,
  }));
}

run().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
