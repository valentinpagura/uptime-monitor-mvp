const dotenv = require('dotenv');
dotenv.config();

const createApp = require('./app');
const pool = require('./config/database');
const app = createApp(pool);

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sitios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        url VARCHAR(255) NOT NULL,
        nombre VARCHAR(255),
        frecuencia_minutos INTEGER DEFAULT 5
      );
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        sitio_id INTEGER NOT NULL REFERENCES sitios(id),
        status_code INTEGER,
        latencia_ms INTEGER,
        is_online BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_logs_sitio_created ON logs (sitio_id, created_at DESC);
    `);
    console.log('Tablas creadas o ya existen');
  } catch (err) {
    console.error('Error creando tablas:', err);
  }
};

createTables();

const cron = require('node-cron');
const workerLoop = require('./worker');

const job = cron.schedule('* * * * *', async () => {
  await workerLoop();
});

console.log('[CRON] Worker iniciado. Se ejecutará cada 1 minuto.');

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\n[SHUTDOWN] ${signal} recibido. Cerrando recursos...`);
  job.stop();
  console.log('[SHUTDOWN] Cron detenido.');
  server.close(() => {
    pool.end().then(() => {
      console.log('[SHUTDOWN] Pool de BD cerrado.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };
