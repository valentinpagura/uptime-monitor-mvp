//IMPORTACIONES
const dotenv = require('dotenv');  //dotenv → saca valores del archivo .env y los pone en process.env
dotenv.config();
const cors = require('cors');


//MOLDE
const express = require("express");  //importamos la libreria de express y la guardamos en la variable "express"
const app = express();  //creamos una instancia de express y la guardamos en la variable "app"

//CONFIGURACION DEL SERVIDOR
app.use(cors({ origin: process.env.CLIENT_URL }))  //configuramos cors para que solo permita peticiones desde el cliente

//ARMADO DE RUTAS (endpoints)
app.get("/health", (req, res) => {
    res.json({ status: "OK" });  //enviar una respuesta en formato json
});

const PORT = process.env.PORT;  //gracias a dotenv, puedo acceder a las variables de entorno de .env
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);   //imprimimos en consola que el servidor se esta ejecutando en el puerto 5000
});

