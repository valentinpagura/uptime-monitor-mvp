const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /sitios - Crear sitio
router.post('/', async (req, res) => {
  const { url, nombre, frecuencia_minutos } = req.body;
  const usuario_id = req.user.id;

  if (!url) {
    return res.status(400).json({ error: 'La URL es requerida' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO sitios (usuario_id, url, nombre, frecuencia_minutos) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, url, nombre || null, frecuencia_minutos || 5]
    );

    res.status(201).json({
      message: 'Sitio creado exitosamente',
      sitio: result.rows[0]
    });
  } catch (err) {
    console.error('Error creando sitio:', err);
    res.status(500).json({ message: 'Error creando sitio' });
  }
});

// GET /sitios - Listar sitios del usuario
router.get('/', async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM sitios WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );

    res.status(200).json({
      message: 'Sitios obtenidos exitosamente',
      sitios: result.rows
    });
  } catch (err) {
    console.error('Error obteniendo sitios:', err);
    res.status(500).json({ message: 'Error obteniendo sitios' });
  }
});

// DELETE /sitios/:id - Eliminar sitio
router.delete('/:id', async (req, res) => {
  // Lógica aquí
});

module.exports = router;