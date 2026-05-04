const prisma = require('../../../lib/prisma');
const { cors } = require('../../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { orderNumber } = req.query;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { car: true } }, tracking: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) return res.status(404).json({ error: 'Commande introuvable. Vérifiez le numéro.' });
    // Return safe subset (no user personal data)
    res.json({ order: {
      id: order.id, orderNumber: order.orderNumber, status: order.status,
      paymentType: order.paymentType, totalPrice: order.totalPrice,
      depositAmount: order.depositAmount, monthlyAmount: order.monthlyAmount,
      monthlyDuration: order.monthlyDuration, discountAmount: order.discountAmount,
      shippingAddress: order.shippingAddress, createdAt: order.createdAt,
      items: order.items, tracking: order.tracking,
    }});
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
