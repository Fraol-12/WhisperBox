const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/complaint_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

