//IMPORTACIONES

//ENTRY POINT del servidor, aquí se configura el servidor, las rutas y se inicia el worker de node-cron
const dotenv = require('dotenv');  //dotenv → saca valores del archivo .env y los pone en process.env
dotenv.config();
const cors = require('cors');
const pool = require('./config/database'); //traemos la configuracion del archivo de config de la carpeta declarada
const authRoutes = require('./routes/auth');  //importamos las rutas de autenticacion y las guardamos en la variable authRoutes
const authMiddleware = require('./middleware/auth_m.js');  //importamos el middleware de autenticacion y lo guardamos en la variable authMiddleware



//MOLDE
const express = require("express");  //importamos la libreria de express y la guardamos en la variable "express"
const app = express();  //creamos una instancia de express y la guardamos en la variable "app"

//CONFIGURACION DEL SERVIDOR
app.use(cors({ origin: process.env.CLIENT_URL }))  //configuramos cors para que solo permita peticiones desde el cliente
app.use(express.json());  //configuramos express para que pueda parsear el cuerpo de las peticiones en formato json
app.use('/auth', authRoutes);  //usamos las rutas de autenticacion para cualquier endpoint que empiece con /auth
const sitiosRoutes = require('./routes/sitios');
app.use('/sitios', authMiddleware, sitiosRoutes); //Cualquier petición a /sitios primero pasa por authMiddleware



//ARMADO DE RUTAS (endpoints)
app.get("/health", (req, res) => {
    res.json({ status: "OK" });  //enviar una respuesta en formato json
});

//Creamos las tablas en la base de datos si no existen
//id Se auto-incrementa
//fecha_registro se llena solo con la fecha actual
const createTables = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255)  NOT NULL,
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
        sitio_id INTEGER NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,
        status_code INTEGER,
        latencia_ms INTEGER,
        is_online BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Tablas creadas o ya existen');
    } catch (err) {
        console.error('Error creando tablas:', err);
    }
};

createTables();


const PORT = process.env.PORT;  //gracias a dotenv, puedo acceder a las variables de entorno de .env
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);   //imprimimos en consola que el servidor se esta ejecutando en el puerto 5000
});

// ── WORKER (node-cron) ─────────────────────────────────────────────────────
const cron = require('node-cron');
const workerLoop = require('./worker');

// Ejecutar worker cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  await workerLoop();
});

console.log('[CRON] Worker iniciado. Se ejecutará cada 5 minutos.');