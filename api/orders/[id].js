const prisma = require('../../lib/prisma');
const { cors, auth, adminOnly } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;

  const { id } = req.query;

  // GET — fetch order by orderNumber (for client) or by numeric id (for admin)
  if (req.method === 'GET') {
    try {
      // Try numeric id first (admin detail)
      const numId = parseInt(id);
      let order;
      if (!isNaN(numId)) {
        order = await prisma.order.findUnique({
          where: { id: numId },
          include: {
            user: true,
            items: { include: { car: true } },
            tracking: {
              orderBy: { createdAt: 'desc' },
              include: { admin: { select: { firstName:true, lastName:true } } },
            },
          },
        });
      } else {
        // orderNumber string
        order = await prisma.order.findUnique({
          where: { orderNumber: id },
          include: {
            user: { select: { firstName:true, lastName:true, email:true, phone:true } },
            items: { include: { car: true } },
            tracking: { orderBy: { createdAt: 'desc' } },
          },
        });
      }
      if (!order) return res.status(404).json({ error: 'Commande introuvable' });
      // Non-admin can only see own orders
      if (req.user.role !== 'ADMIN' && order.userId !== req.user.id)
        return res.status(403).json({ error: 'Accès refusé' });
      res.json({ order });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }

  // PATCH — update status (admin only)
  } else if (req.method === 'PATCH') {
    if (!adminOnly(req, res)) return;
    try {
      const { status, comment } = req.body;
      const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

      const numId = parseInt(id);
      if (isNaN(numId)) return res.status(400).json({ error: 'ID invalide' });

      const order = await prisma.order.findUnique({ where: { id: numId }, include: { user: true } });
      if (!order) return res.status(404).json({ error: 'Commande introuvable' });

      const [updated] = await prisma.$transaction([
        prisma.order.update({ where: { id: numId }, data: { status } }),
        prisma.orderTracking.create({ data: { orderId: numId, status, comment: comment || null, updatedBy: req.user.id } }),
      ]);
      res.json({ success: true, order: updated });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
