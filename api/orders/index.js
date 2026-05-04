const prisma = require('../../lib/prisma');
const { cors, auth, adminOnly } = require('../../lib/middleware');
const { calculateOrderTotals, generateOrderNumber } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;

  // POST — create order
  if (req.method === 'POST') {
    try {
      const { paymentType, shippingAddress, notes } = req.body;
      if (!['full','deposit','monthly'].includes(paymentType))
        return res.status(400).json({ error: 'Type de paiement invalide' });
      if (!shippingAddress?.trim())
        return res.status(400).json({ error: 'Adresse de livraison requise' });

      const cartItems = await prisma.cart.findMany({
        where: { userId: req.user.id }, include: { car: true },
      });
      if (cartItems.length === 0)
        return res.status(400).json({ error: 'Panier vide' });

      for (const item of cartItems) {
        if (item.car.stock < item.quantity)
          return res.status(400).json({ error: `Stock insuffisant : ${item.car.make} ${item.car.model}` });
      }

      const subtotal = cartItems.reduce((s, i) => s + i.car.price * i.quantity, 0);
      const totals = calculateOrderTotals(subtotal, paymentType);

      // Generate unique order number
      let orderNumber, exists = true;
      while (exists) {
        orderNumber = generateOrderNumber();
        exists = !!(await prisma.order.findUnique({ where: { orderNumber } }));
      }

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: { orderNumber, userId: req.user.id, paymentType, shippingAddress, notes: notes || null, ...totals },
        });
        await tx.orderItem.createMany({
          data: cartItems.map(i => ({ orderId: newOrder.id, carId: i.carId, quantity: i.quantity, unitPrice: i.car.price })),
        });
        for (const item of cartItems) {
          await tx.car.update({ where: { id: item.carId }, data: { stock: { decrement: item.quantity } } });
        }
        await tx.orderTracking.create({
          data: { orderId: newOrder.id, status: 'pending', comment: 'Commande reçue' },
        });
        await tx.cart.deleteMany({ where: { userId: req.user.id } });
        return newOrder;
      });

      res.status(201).json({ success: true, orderNumber: order.orderNumber, order });
    } catch (e) {
      console.error('Create order error:', e);
      res.status(500).json({ error: 'Erreur serveur' });
    }

  // GET — all orders (admin only)
  } else if (req.method === 'GET') {
    if (!adminOnly(req, res)) return;
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const where = status ? { status } : {};
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where, include: { user: { select: { firstName:true, lastName:true, email:true } }, items: { include: { car: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page)-1)*parseInt(limit), take: parseInt(limit),
        }),
        prisma.order.count({ where }),
      ]);
      const statusCounts = await prisma.order.groupBy({ by:['status'], _count: { status: true } });
      res.json({ orders, total, statusCounts });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
