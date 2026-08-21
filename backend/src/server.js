require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('⚡ Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check Endpoint (Actually performs SQL query SELECT 1 against PostgreSQL)
app.get('/api/health', async (req, res) => {
  const isDbConnected = await db.testConnection();
  if (isDbConnected) {
    res.json({
      success: true,
      data: { api: 'ok', database: 'connected' }
    });
  } else {
    res.status(503).json({
      success: false,
      data: { api: 'ok', database: 'disconnected' },
      error: { code: 'DATABASE_DISCONNECTED', message: 'Unable to query PostgreSQL database pool.' }
    });
  }
});

// Auth Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Business Routes
try { app.use('/api/users', require('./routes/users.routes')); } catch(e) { console.warn('users routes not ready:', e.message); }
try { app.use('/api/customers', require('./routes/customers.routes')); } catch(e) { console.warn('customers routes not ready:', e.message); }
try { app.use('/api/suppliers', require('./routes/suppliers.routes')); } catch(e) { console.warn('suppliers routes not ready:', e.message); }
try { app.use('/api/categories', require('./routes/categories.routes')); } catch(e) { console.warn('categories routes not ready:', e.message); }
try { app.use('/api/products', require('./routes/products.routes')); } catch(e) { console.warn('products routes not ready:', e.message); }
try { app.use('/api/inventory', require('./routes/inventory.routes')); } catch(e) { console.warn('inventory routes not ready:', e.message); }
try { app.use('/api/quotations', require('./routes/quotations.routes')); } catch(e) { console.warn('quotations routes not ready:', e.message); }
try { app.use('/api/sales-orders', require('./routes/salesOrders.routes')); } catch(e) { console.warn('sales routes not ready:', e.message); }
try { app.use('/api/boms', require('./routes/bom.routes')); } catch(e) { console.warn('bom routes not ready:', e.message); }
try { app.use('/api/purchase-orders', require('./routes/purchaseOrders.routes')); } catch(e) { console.warn('purchase routes not ready:', e.message); }
try { 
  const prodRoutes = require('./routes/production.routes');
  app.use('/api/production-orders', prodRoutes);
  app.use('/api/production', prodRoutes);
  app.use('/api/manufacturing-orders', prodRoutes);
} catch(e) { console.warn('production routes not ready:', e.message); }
try { app.use('/api/quality', require('./routes/quality.routes')); } catch(e) { console.warn('quality routes not ready:', e.message); }
try { app.use('/api/deliveries', require('./routes/deliveries.routes')); } catch(e) { console.warn('deliveries routes not ready:', e.message); }
try { app.use('/api/invoices', require('./routes/invoices.routes')); } catch(e) { console.warn('invoices routes not ready:', e.message); }
try { app.use('/api/dashboard', require('./routes/dashboard.routes')); } catch(e) { console.warn('dashboard routes not ready:', e.message); }

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// Startup PostgreSQL DB Test & Server Launch
server.listen(PORT, async () => {
  console.log(`\n🚀 Shiv Furniture Works ERP Backend`);
  console.log(`   Server & Socket.IO running on http://localhost:${PORT}`);
  
  const isDbOk = await db.testConnection();
  if (isDbOk) {
    console.log(`   ✅ PostgreSQL connected successfully: ${process.env.DATABASE_URL?.split('@')[1] || 'PostgreSQL'}`);
  } else {
    console.error(`   ❌ PostgreSQL connection failed! Check your DATABASE_URL environment variable.`);
  }
});
