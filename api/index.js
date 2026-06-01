const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
   ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
   : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
   origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
   },
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true,
}));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  standardHeaders: true, legacyHeaders: false });

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));

// ─── Nodemailer transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
   port: 587,
   secure: false, // Use TLS
   requireTLS: true,
   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

app.use((req, res, next) => { req.transporter = transporter; next(); });

// ─── Routes ───────────────────────────────────────────────────────────────────
const contactRoute  = require('./routes/contact');
const userRoute     = require('./routes/user');
const productRoute  = require('./routes/product');
const adminRoute    = require('./routes/admin');
const wishlistRoute = require('./routes/wishlist');
const orderRoute    = require('./routes/order');

app.use('/api/contact',  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), contactRoute);
app.use('/api/users',    authLimiter, userRoute);
app.use('/api/products', productRoute);
app.use('/api/admin',    adminRoute);
app.use('/api/wishlist', wishlistRoute);
app.use('/api/orders',   orderRoute);

app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'supabase' }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
   console.error(err.message);
   res.status(err.status || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT} (Supabase backend)`));