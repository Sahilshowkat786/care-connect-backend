require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Care Connect', version: '1.0.0' }));

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/v1/alerts', require('./routes/alertRoutes'));
app.use('/api/v1/donors', require('./routes/donorRoutes'));
app.use('/api/v1/requests', require('./routes/bloodRequestRoutes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
