const prisma = require('../../lib/prisma');
const { cors } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { category, search, featured, limit, page = 1 } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = take ? (parseInt(page) - 1) * take : undefined;
    const where = { isActive: true };
    if (category && category !== 'all') where.category = category;
    if (search) where.OR = [
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
    if (featured === 'true') where.featured = true;
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, orderBy: [{ featured:'desc' },{ createdAt:'desc' }], take, skip }),
      prisma.car.count({ where }),
    ]);
    res.json({ cars, total, page: parseInt(page), limit: take });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
