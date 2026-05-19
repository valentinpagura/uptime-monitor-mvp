const { Pool } = require('pg');


//traemos los datos del .env para establecer conexion con la BD.
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on('error', (err) => {
    console.error('Error en Pool:', err);
});

module.exports = pool;