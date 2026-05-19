//IMPORTACIONES
const dotenv = require('dotenv');  //dotenv → saca valores del archivo .env y los pone en process.env
dotenv.config();
const cors = require('cors');
const pool = require('./config/database'); //traemos la configuracion del archivo de config de la carpeta declarada


//MOLDE
const express = require("express");  //importamos la libreria de express y la guardamos en la variable "express"
const app = express();  //creamos una instancia de express y la guardamos en la variable "app"

//CONFIGURACION DEL SERVIDOR
app.use(cors({ origin: process.env.CLIENT_URL }))  //configuramos cors para que solo permita peticiones desde el cliente

//ARMADO DE RUTAS (endpoints)
app.get("/health", (req, res) => {
    res.json({ status: "OK" });  //enviar una respuesta en formato json
});

//Creamos las tablas en la base de datos si no existen
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
        sitio_id INTEGER NOT NULL REFERENCES sitios(id),
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

