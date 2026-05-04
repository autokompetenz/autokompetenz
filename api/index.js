const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Initialize Express app
const app = express();

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

// CORS configuration
const corsOptions = {
  origin: [
    'https://autokompetenz.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Helper functions
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMD-${year}${month}${day}-${random}`;
}

function calculateOrderTotals(subtotal, paymentType) {
  const discountAmount = paymentType === 'full' ? subtotal * 0.05 : 0;
  const discountedTotal = subtotal - discountAmount;
  
  if (paymentType === 'deposit') {
    const depositAmount = discountedTotal * 0.2;
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount, 
      monthlyAmount: null, 
      monthlyDuration: null 
    };
  } else if (paymentType === 'monthly') {
    const monthlyDuration = 48;
    const monthlyAmount = discountedTotal / monthlyDuration;
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount: null, 
      monthlyAmount, 
      monthlyDuration 
    };
  } else {
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount: null, 
      monthlyAmount: null, 
      monthlyDuration: null 
    };
  }
}

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, address:true, monthlySalary:true 
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
}

// Routes

// API Root
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Auto Kompetenz GmbH API', 
    version: '2.0.0', 
    time: new Date().toISOString() 
  });
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Connexion réussie', 
      token, 
      user: {
        id: user.id, username: user.username, email: user.email,
        firstName: user.firstName, lastName: user.lastName, role: user.role,
        phone: user.phone, address: user.address, monthlySalary: user.monthlySalary,
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, monthlySalary } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Mot de passe trop court (min. 8 caractères)' });
    }

    const existing = await prisma.user.findFirst({ 
      where: { OR: [{ email }, { username }] } 
    });
    if (existing) {
      return res.status(409).json({ 
        error: existing.email === email ? 'Email déjà utilisé' : 'Nom d\'utilisateur déjà pris' 
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        username, email, password: hashed, firstName, lastName,
        phone: phone || null, monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null 
      },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, monthlySalary:true 
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Compte créé avec succès', token, user });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Cars Routes
app.get('/api/cars', async (req, res) => {
  try {
    const { category, search, featured, limit, page = 1 } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = take ? (parseInt(page) - 1) * take : undefined;
    const where = { isActive: true };
    
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (featured === 'true') where.featured = true;
    
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ 
        where, 
        orderBy: [{ featured:'desc' },{ createdAt:'desc' }], 
        take, 
        skip 
      }),
      prisma.car.count({ where }),
    ]);
    
    res.json({ cars, total, page: parseInt(page), limit: take });
  } catch (e) { 
    res.status(500).json({ error: 'Erreur serveur' }); 
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const car = await prisma.car.findUnique({ 
      where: { id: parseInt(id) } 
    });
    if (!car || !car.isActive) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    res.json(car);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/cars/categories', async (req, res) => {
  try {
    const categories = await prisma.car.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { car: true },
    });
    res.json(cartItems);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { carId, quantity = 1, paymentType = 'full' } = req.body;
    
    const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
    if (!car || !car.isActive) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    if (car.stock < quantity) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    const existingItem = await prisma.cart.findFirst({
      where: { userId: req.user.id, carId: parseInt(carId) },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (car.stock < newQuantity) {
        return res.status(400).json({ error: 'Stock insuffisant' });
      }
      const updated = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, paymentType },
        include: { car: true },
      });
      res.json(updated);
    } else {
      const created = await prisma.cart.create({
        data: { 
          userId: req.user.id, 
          carId: parseInt(carId), 
          quantity, 
          paymentType 
        },
        include: { car: true },
      });
      res.status(201).json(created);
    }
  } catch (e) {
    console.error('Add to cart error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/cart/:carId', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    const { quantity, paymentType } = req.body;

    const cartItem = await prisma.cart.findFirst({
      where: { userId: req.user.id, carId: parseInt(carId) },
      include: { car: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    }

    if (quantity > cartItem.car.stock) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    const updated = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity, paymentType },
      include: { car: true },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/cart/:carId', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    await prisma.cart.deleteMany({
      where: { userId: req.user.id, carId: parseInt(carId) },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.cart.count({
      where: { userId: req.user.id },
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Orders Routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { paymentType, shippingAddress, notes } = req.body;
    if (!['full','deposit','monthly'].includes(paymentType)) {
      return res.status(400).json({ error: 'Type de paiement invalide' });
    }
    if (!shippingAddress?.trim()) {
      return res.status(400).json({ error: 'Adresse de livraison requise' });
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: req.user.id }, 
      include: { car: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    for (const item of cartItems) {
      if (item.car.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant : ${item.car.make} ${item.car.model}` 
        });
      }
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
        data: { 
          orderNumber, 
          userId: req.user.id, 
          paymentType, 
          shippingAddress, 
          notes: notes || null, 
          ...totals 
        },
      });
      
      await tx.orderItem.createMany({
        data: cartItems.map(i => ({ 
          orderId: newOrder.id, 
          carId: i.carId, 
          quantity: i.quantity, 
          unitPrice: i.car.price 
        })),
      });
      
      for (const item of cartItems) {
        await tx.car.update({ 
          where: { id: item.carId }, 
          data: { stock: { decrement: item.quantity } } 
        });
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
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    // User orders
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { car: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    // Admin orders
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const where = status ? { status } : {};
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where, 
          include: { 
            user: { select: { firstName:true, lastName:true, email:true } }, 
            items: { include: { car: true } } 
          },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page)-1)*parseInt(limit), 
          take: parseInt(limit),
        }),
        prisma.order.count({ where }),
      ]);
      const statusCounts = await prisma.order.groupBy({ 
        by:['status'], 
        _count: { status: true } 
      });
      res.json({ orders, total, statusCounts });
    } catch (e) { 
      res.status(500).json({ error: 'Erreur serveur' }); 
    }
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id: parseInt(id) };
    
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const order = await prisma.order.findFirst({
      where,
      include: { 
        user: { select: { firstName:true, lastName:true, email:true } }, 
        items: { include: { car: true } },
        tracking: { 
          include: { admin: { select: { firstName:true, lastName:true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/orders/my', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { car: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { 
        tracking: { 
          include: { admin: { select: { firstName:true, lastName:true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// User Routes
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, monthlySalary } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        firstName, 
        lastName, 
        phone: phone || null, 
        address: address || null, 
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null 
      },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, address:true, monthlySalary:true 
      },
    });
    res.json({ message: 'Profil mis à jour', user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Nouveau mot de passe trop court (min. 8 caractères)' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, cars, orders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.car.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { firstName:true, lastName:true } },
        items: { include: { car: { select: { make:true, model:true } } } }
      },
    });

    res.json({
      users,
      cars,
      orders,
      revenue: revenue._sum.totalPrice || 0,
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    
    const where = { role: 'CLIENT' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:true, username:true, email:true, firstName:true, lastName:true,
          phone:true, address:true, monthlySalary:true, createdAt:true,
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: 'desc' },
        take, skip,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ clients, total, page: parseInt(page), limit: take });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulation Route
app.post('/api/simulation', async (req, res) => {
  try {
    const { carPrice, monthlySalary, paymentType } = req.body;
    if (!carPrice || !monthlySalary || !paymentType) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const maxMonthlyPayment = monthlySalary * 0.3;
    const totals = calculateOrderTotals(carPrice, paymentType);

    if (paymentType === 'monthly') {
      const affordable = totals.monthlyAmount <= maxMonthlyPayment;
      res.json({
        ...totals,
        maxMonthlyPayment,
        affordable,
        recommendation: affordable 
          ? 'Financement mensuel recommandé' 
          : 'Veuillez considérer un apport plus élevé ou un véhicule moins cher',
      });
    } else {
      res.json(totals);
    }
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Export the Express app for Vercel
module.exports = app;
