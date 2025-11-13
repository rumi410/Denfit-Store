
// This line loads our secret keys from the .env file
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// --- Import our route files ---
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

// --- Import cron jobs ---
import { startAbandonedCartChecker, startPromotionalEmailer } from './utils/cron.js';

const app = express();

// --- Middlewares ---
// A more permissive CORS policy for development to prevent any "Failed to fetch" errors.
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// --- API Routes ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 5000;

// --- Function to connect to the database and start the server ---
const startServer = async () => {
  try {
    // FIX: Added a check to ensure MONGO_URI is defined before attempting connection.
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your .env file.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // Start the server ONLY if the database connection is successful.
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}.`);
      // Start cron jobs after server starts
      startAbandonedCartChecker();
      startPromotionalEmailer();
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit if we can't connect to the DB.
  }
};

// --- Start everything ---
startServer();
