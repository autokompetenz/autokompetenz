const prisma = require('../../lib/prisma');
const { cors } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const categories = await prisma.car.groupBy({
      by: ['category'], where: { isActive: true },
      _count: { category: true }, orderBy: { _count: { category: 'desc' } },
    });
    res.json({ categories: categories.map(c => ({ name: c.category, count: c._count.category })) });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
