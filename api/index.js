const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { prisma } = require('../lib/prisma.js');

// Initialize Express app
const app = express();

// Verify Supabase environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL manquant');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configure multer for file uploads (memory storage for Vercel compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    fields: 20, // Increase field limit
    files: 3   // Limit to 3 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  }
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

// Cars Routes - ORDER MATTERS: specific routes before parameterized routes
app.get('/api/cars', async (req, res) => {
  try {
    console.log('=== GET /api/cars ===');
    console.log('Query params:', req.query);
    
    const { category, search, featured, limit, page = 1 } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page ? (parseInt(page) - 1) * (take || 12) : 0;
    const where = { isActive: true };
    
    if (category) where.category = category;
    if (search) where.OR = [
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
    if (featured !== undefined) where.featured = featured === 'true';
    
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      prisma.car.count({ where })
    ]);
    
    console.log('Found cars:', cars.length, 'Total:', total);
    res.json({ cars, total });
  } catch (error) {
    console.error('=== GET /api/cars ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      cars: [],
      total: 0
    });
  }
});

// Categories route MUST come before :id route
app.get('/api/cars/categories', async (req, res) => {
  try {
    console.log('=== GET /api/cars/categories ===');
    
    // Use hardcoded categories from Prisma enum for reliability
    const categories = [
      { category: 'Berline', _count: { category: 0 } },
      { category: 'SUV', _count: { category: 0 } },
      { category: 'Citadine', _count: { category: 0 } },
      { category: 'Break', _count: { category: 0 } },
      { category: 'Coupe', _count: { category: 0 } },
      { category: 'Cabriolet', _count: { category: 0 } },
      { category: 'Utilitaire', _count: { category: 0 } }
    ];
    
    console.log('Returning categories:', categories);
    res.json(categories);
  } catch (error) {
    console.error('=== GET /api/cars/categories ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      categories: []
    });
  }
});

// This MUST come after specific routes like /categories
app.get('/api/cars/:id', async (req, res) => {
  try {
    console.log('=== GET /api/cars/:id ===');
    console.log('Car route param:', req.params.id);
    
    const { id } = req.params;
    const carId = Number(id);
    
    // Validate ID
    if (isNaN(carId) || carId <= 0) {
      console.log('Invalid car ID:', id);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Looking for car ID:', carId);
    
    const car = await prisma.car.findUnique({ 
      where: { id: carId },
      include: {
        _count: {
          select: {
            cartItems: true
          }
        }
      }
    });
    
    console.log('Found car:', car ? 'YES' : 'NO');
    
    if (!car) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    
    res.json(car);
  } catch (error) {
    console.error('=== GET /api/cars/:id ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur' 
    });
  }
});

// Car Routes
app.post('/api/cars', authenticateToken, requireAdmin, upload.array('images', 3), async (req, res) => {
  try {
    console.log('=== POST /api/cars Debug ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Files uploaded:', req.files?.length || 0);
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'price', 'fuelType', 'transmission', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Champs obligatoires manquants: ${missingFields.join(', ')}`
      });
    }
    
    // Handle FormData for file uploads
    if (req.files && req.files.length > 0) {
      const data = req.body;
      const files = req.files;
      
      const carData = {
        make: data.make,
        model: data.model,
        year: Number(data.year),
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || null,
        fuelType: data.fuelType,
        transmission: data.transmission,
        mileage: Number(data.mileage) || 0,
        color: data.color || null,
        power: data.power ? Number(data.power) : null,
        category: data.category,
        minSalary: data.minSalary ? Number(data.minSalary) : null,
        featured: data.featured === 'true',
        isActive: data.isActive !== 'false',
        imageUrl: data.imageUrl || null,
      };
      
      // Handle uploaded files - Upload to Supabase Storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.originalname}`;
        
        console.log(`Uploading file ${i + 1}:`, fileName);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('cars')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });
        
        if (error) {
          console.error('Supabase upload error:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('cars')
          .getPublicUrl(fileName);
        
        const fieldName = i === 0 ? 'imageUrl' : `imageUrl${i + 1}`;
        carData[fieldName] = publicUrlData.publicUrl;
        
        console.log(`File ${i + 1} uploaded successfully:`, publicUrlData.publicUrl);
        console.log(`File ${i + 1} publicUrlData:`, publicUrlData);
      }
      
      console.log('Final carData:', carData);
      
      const car = await prisma.car.create({ data: carData });
      console.log('Car created:', car);
      res.status(201).json({ car });
    } else {
      // Handle regular JSON data
      const { make, model, year, price, stock, description, fuelType, transmission, mileage, color, power, category, minSalary, featured, isActive, imageUrl } = req.body;
      
      const carData = {
        make,
        model,
        year: Number(year),
        price: Number(price),
        stock: Number(stock),
        description: description || null,
        fuelType,
        transmission,
        mileage: Number(mileage) || 0,
        color: color || null,
        power: power ? Number(power) : null,
        category,
        minSalary: minSalary ? Number(minSalary) : null,
        featured: featured === 'true',
        isActive: isActive !== 'false',
        imageUrl: imageUrl || null,
      };
      
      console.log('Final carData (JSON):', carData);
      
      const car = await prisma.car.create({ data: carData });
      console.log('Car created:', car);
      res.status(201).json({ car });
    }
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du véhicule' });
  }
});

app.put('/api/cars/:id', authenticateToken, requireAdmin, upload.array('images', 3), async (req, res) => {
  try {
    console.log('=== PUT /api/cars/:id ===');
    console.log('Car route param:', req.params.id);
    
    const { id } = req.params;
    const carId = Number(id);
    
    // Validate ID
    if (isNaN(carId) || carId <= 0) {
      console.log('Invalid car ID:', id);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Updating car ID:', carId);
    console.log('Updating car:', id, 'with data:', Object.keys(req.body));
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Files uploaded:', req.files?.length || 0);
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'price', 'fuelType', 'transmission', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Champs obligatoires manquants: ${missingFields.join(', ')}`
      });
    }
    
    // Handle FormData for file uploads
    if (req.files && req.files.length > 0) {
      const data = req.body;
      const files = req.files;
      
      const carData = {
        make: data.make,
        model: data.model,
        year: Number(data.year),
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || null,
        fuelType: data.fuelType,
        transmission: data.transmission,
        mileage: Number(data.mileage) || 0,
        color: data.color || null,
        power: data.power ? Number(data.power) : null,
        category: data.category,
        minSalary: data.minSalary ? Number(data.minSalary) : null,
        featured: data.featured === 'true',
        isActive: data.isActive !== 'false',
        imageUrl: data.imageUrl || null,
      };
      
      // Handle uploaded files - Upload to Supabase Storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.originalname}`;
        
        console.log(`Uploading file ${i + 1}:`, fileName);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('cars')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });
        
        if (error) {
          console.error('Supabase upload error:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('cars')
          .getPublicUrl(fileName);
        
        const fieldName = i === 0 ? 'imageUrl' : `imageUrl${i + 1}`;
        carData[fieldName] = publicUrlData.publicUrl;
        
        console.log(`File ${i + 1} uploaded successfully:`, publicUrlData.publicUrl);
        console.log(`File ${i + 1} publicUrlData:`, publicUrlData);
      }
      
      console.log('Final carData:', carData);
      
      const car = await prisma.car.update({
        where: { id: parseInt(id) },
        data: carData
      });
      
      console.log('Car updated:', car);
      res.json({ car });
    } else {
      // Handle regular JSON data
      const { make, model, year, price, stock, description, fuelType, transmission, mileage, color, power, category, minSalary, featured, isActive, imageUrl } = req.body;
      
      const carData = {
        make,
        model,
        year: Number(year),
        price: Number(price),
        stock: Number(stock),
        description: description || null,
        fuelType,
        transmission,
        mileage: Number(mileage) || 0,
        color: color || null,
        power: power ? Number(power) : null,
        category,
        minSalary: minSalary ? Number(minSalary) : null,
        featured: featured === 'true',
        isActive: isActive !== 'false',
        imageUrl: imageUrl || null,
      };
      
      console.log('Final carData (JSON):', carData);
      
      const car = await prisma.car.update({
        where: { id: parseInt(id) },
        data: carData
      });
      
      console.log('Car updated:', car);
      res.json({ car });
    }
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
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
    console.log('=== POST /api/cart ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { carId, quantity = 1, paymentType = 'full' } = req.body;
    
    console.log('Parsed data:', { carId, quantity, paymentType });
    
    const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
    console.log('Found car:', car);
    
    if (!car || !car.isActive) {
      console.log('Car not found or inactive');
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    if (car.stock < quantity) {
      console.log('Insufficient stock:', { stock: car.stock, requested: quantity });
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    const existingItem = await prisma.cart.findFirst({
      where: { userId: req.user.id, carId: parseInt(carId) },
    });
    
    console.log('Existing item:', existingItem);

    if (existingItem) {
      console.log('Updating existing cart item');
      const newQuantity = existingItem.quantity + quantity;
      if (car.stock < newQuantity) {
        console.log('Insufficient stock for update:', { stock: car.stock, newQuantity });
        return res.status(400).json({ error: 'Stock insuffisant' });
      }
      const updated = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, paymentType },
        include: { car: true },
      });
      console.log('Updated cart item:', updated);
      
      // Return full cart state like PUT endpoint
      const updatedCart = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
        orderBy: { createdAt: 'desc' }
      });

      const cartItems = updatedCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        carId: item.carId,
        paymentType: item.paymentType,
        car: item.car
      }));

      const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

      console.log('Full cart response after update:', { cartItems, total, count: cartItems.length });
      res.json({ cartItems, total, count: cartItems.length });
    } else {
      console.log('Creating new cart item');
      const created = await prisma.cart.create({
        data: { 
          userId: req.user.id, 
          carId: parseInt(carId), 
          quantity, 
          paymentType 
        },
        include: { car: true },
      });
      console.log('Created cart item:', created);
      
      // Return full cart state for consistency
      const updatedCart = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
        orderBy: { createdAt: 'desc' }
      });

      const cartItems = updatedCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        carId: item.carId,
        paymentType: item.paymentType,
        car: item.car
      }));

      const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

      console.log('Full cart response after create:', { cartItems, total, count: cartItems.length });
      res.status(201).json({ cartItems, total, count: cartItems.length });
    }
  } catch (e) {
    console.error('=== POST /api/cart ERROR ===');
    console.error('Error details:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ 
      error: e.message || 'Erreur serveur',
      stack: process.env.NODE_ENV !== 'production' ? e.stack : undefined
    });
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

    // Fetch updated cart to return complete cart state
    const updatedCart = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });

    const cartItems = updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      carId: item.carId,
      paymentType: item.paymentType,
      car: item.car
    }));

    const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

    console.log('=== Cart PUT Debug ===');
    console.log('Updated cart item:', updated);
    console.log('Full cart response:', { cartItems, total, count: cartItems.length });

    res.json({ cartItems, total, count: cartItems.length });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/cart/:carId', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/cart/:carId ===');
    console.log('Car route param:', req.params.carId);
    
    const { carId } = req.params;
    const carIdNum = Number(carId);
    
    // Validate ID
    if (isNaN(carIdNum) || carIdNum <= 0) {
      console.log('Invalid car ID:', carId);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Removing from cart car ID:', carIdNum);
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
    console.log('=== GET /api/orders/:id ===');
    console.log('Order route param:', req.params.id);
    
    const { id } = req.params;
    const orderId = Number(id);
    
    // Validate ID
    if (isNaN(orderId) || orderId <= 0) {
      console.log('Invalid order ID:', id);
      return res.status(400).json({ 
        error: 'Invalid order ID - must be a positive number' 
      });
    }
    
    console.log('Looking for order ID:', orderId);
    const where = { id: orderId };
    
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
    console.log('=== GET /api/orders/my ===');
    console.log('User:', req.user);
    console.log('Headers:', req.headers);
    console.log('User ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.error('No user found in request');
      return res.status(401).json({ 
        error: 'Utilisateur non authentifié',
        orders: []
      });
    }
    
    console.log('Fetching orders for user ID:', req.user.id);
    
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { 
        items: { 
          include: { 
            car: true 
          } 
        },
        tracking: true
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('Orders found:', orders);
    console.log('Orders count:', orders.length);
    
    // Transform data to ensure consistent format
    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.items || [],
      tracking: order.tracking || []
    }));
    
    console.log('Transformed orders:', transformedOrders);
    
    res.json(transformedOrders);
  } catch (error) {
    console.error('=== GET /api/orders/my ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    // Return safe fallback response
    res.status(500).json({ 
      error: error.message || 'Erreur serveur inconnue',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      orders: []
    });
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
    const totalClients = await prisma.user.count();
    const totalCars = await prisma.car.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    
    const revenueResult = await prisma.order.aggregate({ 
      _sum: { totalPrice: true } 
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;
    
    const pendingOrders = await prisma.order.count({ 
      where: { status: 'pending' } 
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { firstName:true, lastName:true } },
        items: { include: { car: { select: { make:true, model:true } } } }
      },
    });

    res.json({
      totalClients,
      totalCars,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      totalClients: 0,
      totalCars: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      recentOrders: [],
      error: 'Erreur récupération statistiques'
    });
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
