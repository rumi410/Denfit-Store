// This line loads our secret keys from the .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Import the 'path' module

// --- Import our route files ---
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// --- Middlewares ---
app.use(express.json());

// --- Serve Static Files ---
// This tells Express to serve all the frontend files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
// API routes must be defined *before* the catch-all route
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// --- Catch-all Route for Frontend ---
// This makes sure that any request that isn't for an API endpoint
// gets the main index.html file. This is important for single-page apps.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// --- Function to connect to the database and start the server ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // This command starts the server ONLY if the database connection is successful.
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit the process with an error code if we can't connect.
  }
};

// --- We call the function to start everything ---
startServer();
