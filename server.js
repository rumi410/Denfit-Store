// This line loads our secret keys from the .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const abandonedCartJob = require('./utils/cron');

// --- Import our route files ---
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// --- Middlewares ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// --- API Routes ---
// IMPORTANT: API routes must be defined BEFORE serving static files.
// This ensures that API requests are handled by the router and not treated as file requests.
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// --- Serve static files from the React app ---
// This tells Express to find all frontend files (HTML, TSX, etc.) in the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// The "catchall" handler: for any request that doesn't match an API route above,
// send back React's index.html file. This is crucial for client-side routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// --- Function to connect to the database and start the server ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // Start the server ONLY if the database connection is successful.
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}.`);
      // --- Start the Abandoned Cart Checker ---
      abandonedCartJob.start();
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit if we can't connect to the DB.
  }
};

// --- Start everything ---
startServer();