const prisma = require('../../lib/prisma');
const { cors } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (!car || !car.isActive) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json({ car });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
