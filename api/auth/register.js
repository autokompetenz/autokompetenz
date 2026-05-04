const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
const { cors } = require('../../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, email, password, firstName, lastName, phone, monthlySalary } = req.body;
    if (!username || !email || !password || !firstName || !lastName)
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Mot de passe trop court (min. 8 caractères)' });

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return res.status(409).json({ error: existing.email === email ? 'Email déjà utilisé' : 'Nom d\'utilisateur déjà pris' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, password: hashed, firstName, lastName,
        phone: phone || null, monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true, phone:true, monthlySalary:true },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Compte créé avec succès', token, user });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
