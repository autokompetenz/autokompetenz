const prisma = require('../../lib/prisma');
const { cors, auth } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (!await auth(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { firstName, lastName, phone, address, monthlySalary } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName || undefined, lastName: lastName || undefined,
        phone: phone || undefined, address: address || undefined,
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : undefined,
      },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, phone:true, address:true, monthlySalary:true, role:true },
    });
    res.json({ user: updated, message: 'Profil mis à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
