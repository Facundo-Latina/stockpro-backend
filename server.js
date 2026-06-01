const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockpro')
  .then(async () => {
    console.log('MongoDB connected');
    await require('./utils/seeder')();
  })
  .catch((err) => console.error('MongoDB error:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));
app.use('*', (req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
