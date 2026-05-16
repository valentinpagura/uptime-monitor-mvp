const express = require("express");  //importamos la libreria de express y la guardamos en la variable "express"
const app = express();                //creamos una instancia de express y la guardamos en la variable "app"

app.get("/health", (req, res) => {
    res.json({ status: "OK" });  //enviar una respuesta en formato json
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);   //imprimimos en consola que el servidor se esta ejecutando en el puerto 5000
});

