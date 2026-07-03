const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validate');

function createAuthRouter(pool) {
  const router = express.Router();

  router.post('/register', validate(registerSchema, 'body'), async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await pool.query(
        'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email, fecha_registro',
        [email, hashedPassword]
      );
      const usuario = result.rows[0];

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          fecha_registro: usuario.fecha_registro,
        },
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error registering user' });
    }
  });

  router.post('/login', validate(loginSchema, 'body'), async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    const passwordValida = await bcrypt.compare(password, usuario.password);
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
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        fecha_registro: usuario.fecha_registro,
      },
    });
  });

  return router;
}

module.exports = createAuthRouter;
