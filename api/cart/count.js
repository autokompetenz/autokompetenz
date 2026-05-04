const prisma = require('../../lib/prisma');
const { cors, auth } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const count = await prisma.cart.count({ where: { userId: req.user.id } });
    res.json({ count });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
