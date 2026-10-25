require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Allowed origins for CORS (local dev, env var, and production frontends)
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-course-builder-sambhav-kumars-projects-6a95d468.vercel.app',
  'https://ai-course-builder-sepia.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, or health checks)
    if (!origin) return callback(null, true);
    
    // Normalize trailing slashes for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = 
      allowedOrigins.some(o => o.replace(/\/$/, '') === normalizedOrigin) ||
      /\.vercel\.app$/.test(new URL(origin).hostname);

    if (isAllowed || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Course Builder API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
