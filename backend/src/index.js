import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { initDatabase } from './db/index.js';
import dashboardRoutes from './routes/dashboard.js';
import assetsRoutes from './routes/assets.js';
import issuesRoutes from './routes/issues.js';
import scansRoutes from './routes/scans.js';

// Initialize database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Demo auth middleware (für Standalone-Betrieb)
app.use((req, res, next) => {
  // In production: hier VoxDrop-Session prüfen
  req.user = {
    id: 'demo-user',
    organizationId: null, // Will be set from DB
    role: 'admin'
  };
  next();
});

// Set organization from demo data
import db from './db/index.js';
app.use((req, res, next) => {
  const org = db.prepare('SELECT id FROM organizations LIMIT 1').get();
  if (org) {
    req.user.organizationId = org.id;
  }
  next();
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/scans', scansRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
