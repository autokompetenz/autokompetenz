const prisma = require('../../lib/prisma');
const { cors, auth } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;

  if (req.method === 'GET') {
    try {
      const cartItems = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
        orderBy: { createdAt: 'asc' },
      });
      const total = cartItems.reduce((s, i) => s + i.car.price * i.quantity, 0);
      res.json({ cartItems, total, count: cartItems.length });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }

  } else if (req.method === 'POST') {
    try {
      const { carId, paymentType = 'full' } = req.body;
      if (!carId) return res.status(400).json({ error: 'carId requis' });
      if (!['full','deposit','monthly'].includes(paymentType))
        return res.status(400).json({ error: 'Type de paiement invalide' });

      const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
      if (!car || !car.isActive) return res.status(404).json({ error: 'Véhicule introuvable' });
      if (car.stock < 1) return res.status(400).json({ error: 'Rupture de stock' });

      const item = await prisma.cart.upsert({
        where: { userId_carId: { userId: req.user.id, carId: parseInt(carId) } },
        update: { paymentType, quantity: 1 },
        create: { userId: req.user.id, carId: parseInt(carId), paymentType, quantity: 1 },
        include: { car: true },
      });
      const count = await prisma.cart.count({ where: { userId: req.user.id } });
      res.json({ success: true, message: 'Ajouté au panier', cartItem: item, cartCount: count });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
