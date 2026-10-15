// Entry point (package.json -> "main": "server.js").
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');

const app = express();

// Allow requests from the Vite dev server and any configured origin
const rawOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://devsphare2.netlify.app',
  process.env.FRONTEND_URL,
];

const allowedOrigins = rawOrigins
  .filter(Boolean)
  .map(o => o.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, Netlify proxy)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow Netlify production and deploy previews
    try {
      const { hostname } = new URL(cleanOrigin);
      if (hostname.endsWith('.netlify.app') || hostname === 'localhost') {
        return callback(null, true);
      }
    } catch (_) {}

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

app.get('/api/health', (req, res) => res.json({ ok: true, message: 'DevSphere API operational' }));

// Auth & profile routes
app.use('/api/auth', require('./routes/userRoutes'));          // POST /register, /login
app.use('/api/me', require('./routes/profileRoutes'));         // profile + settings
app.use('/api/profiles', require('./routes/publicProfileRoutes')); // public profile

// Library routes - mounted at both /api/library and /api/projects/library for compatibility
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/projects/library', require('./routes/libraryRoutes'));

// Main feature routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/coding', require('./routes/codingRoutes'));
app.use('/api/roadmaps', require('./routes/roadmapRoutes'));   // roadmap content + per-user progress
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`DevSphere server running on port ${PORT}`));
});

module.exports = app;
