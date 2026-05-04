const prisma = require('../../lib/prisma');
const { cors, auth, adminOnly } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;
  if (!adminOnly(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { totalPrice: true }, where: { status: { notIn: ['cancelled'] } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const result = clients.map(c => ({
      ...c, password: undefined,
      totalSpent: c.orders.reduce((s, o) => s + o.totalPrice, 0),
      orderCount: c._count.orders,
    }));
    res.json({ clients: result });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
