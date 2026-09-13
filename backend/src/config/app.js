const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('../routes/auth.routes');
const productRoutes = require('../routes/products.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/media', express.static(path.join(__dirname, '../../media')));

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = app;
