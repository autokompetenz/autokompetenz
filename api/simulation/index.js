const prisma = require('../../lib/prisma');
const { cors } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const salary = parseFloat(req.query.salary);
    if (!salary || salary <= 0) return res.status(400).json({ error: 'Salaire invalide' });
    const maxMonthly = Math.round(salary * 0.33);
    const cars = await prisma.car.findMany({
      where: { isActive: true, monthlyPayment: { lte: maxMonthly } },
      orderBy: [{ featured: 'desc' }, { monthlyPayment: 'desc' }],
      take: 12,
    });
    res.json({ salary, maxMonthly, maxDeposit: Math.round(salary * 3), cars, count: cars.length });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
