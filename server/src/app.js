const express = require('express');
const cors = require('cors');
const createAuthRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth_m');
const createSitiosRouter = require('./routes/sitios');

function createApp(pool) {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL }));
  app.use(express.json());

  app.use('/auth', createAuthRouter(pool));
  app.use('/sitios', authMiddleware, createSitiosRouter(pool));

  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });

  return app;
}

module.exports = createApp;
