const prisma = require('../../lib/prisma');
const { cors, auth, adminOnly } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;
  if (!adminOnly(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const [totalClients, totalOrders, revenue, pendingOrders, totalCars, recentOrders] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: { notIn: ['cancelled'] } } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.car.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName:true, lastName:true, email:true } } },
      }),
    ]);
    res.json({
      stats: { totalClients, totalOrders, totalRevenue: revenue._sum.totalPrice || 0, pendingOrders, totalCars },
      recentOrders,
    });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
