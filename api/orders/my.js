const prisma = require('../../lib/prisma');
const { cors, auth } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { car: true } }, tracking: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
