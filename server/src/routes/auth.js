const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;    // cuando el front envia los datos para extraerlos es con req.body
    if (!email || !password) {              // Validación básica
        return res.status(400).json({ message: 'Email y password son requeridos' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);  // Encriptamos la contraseña
    try {
        const result = await pool.query(  //PostgreSQL ejecuta INSERT
            'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email, fecha_registro', //ingresamos los datos a la tabla usuarios
            [email, hashedPassword]  //datos enviados a la tabla usuarios | id y fecha_registro se generan automáticamente en la base de datos
        );
        const usuario = result.rows[0];  //objeto JavaScript con los datos del usuario registrado (id, email, fecha_registro)
        
        //el token es el resultado de la encriptacion de los datos!!!!
        const token = jwt.sign( //generamos un token con el id y email del usuario
            { id: usuario.id,  //accedemos al objeto JS y extraemos el id
            email: usuario.email },  //accedemos al objeto JS y extraemos el email
            process.env.JWT_SECRET, { expiresIn: '24h' });  //guardamos en llave jwt.secret


        res.status(201).json({  //enviamos una respuesta con el token y los datos del usuario
            token: token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                fecha_registro: usuario.fecha_registro
            }
        });
    } catch (err) {  //en caso de error
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];
    if (!usuario) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    const passwordValida = await bcrypt.compare(password, usuario.password);  //comparamos la contraseña ingresada con la contraseña encriptada en la base de datos| hasheo interno
    if (!passwordValida) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    res.json({
        message: 'Login exitoso',
        token: token,
        usuario: {
        id: usuario.id,
            email: usuario.email,
            fecha_registro: usuario.fecha_registro
        }
    });
});

module.exports = router;