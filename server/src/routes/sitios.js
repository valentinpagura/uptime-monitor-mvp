const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Crear nuevo sitio para el usuario autenticado
// Requiere: url (obligatorio), nombre y frecuencia_minutos (opcionales)
router.post('/', async (req, res) => {
  const { url, nombre, frecuencia_minutos } = req.body;
  const usuario_id = req.user.id;

  // Valida que la URL esté presente
  if (!url) {
    return res.status(400).json({ error: 'La URL es requerida' });
  }

  try {
    // Inserta sitio con valores por defecto: frecuencia_minutos = 5
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

// Obtiene todos los sitios del usuario autenticado
// Ordena por ID descendente (más recientes primero)
router.get('/', async (req, res) => {
  const usuario_id = req.user.id;

  try {
    // Consulta solo sitios del usuario autenticado
    const result = await pool.query(
      'SELECT * FROM sitios WHERE usuario_id = $1 ORDER BY id DESC',
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

// Elimina un sitio si pertenece al usuario autenticado
// Verifica tanto el ID del sitio como la propiedad del usuario
router.delete('/:id', async (req, res) => {
  const sitioId = req.params.id;
  const usuario_id = req.user.id;

  // Valida que el ID del sitio esté presente
  if (!sitioId) {
    return res.status(400).json({ error: 'El ID del sitio es requerido' });
  }

  try {
    // Elimina solo si sitio existe y pertenece al usuario (seguridad)
    const result = await pool.query(
      'DELETE FROM sitios WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [sitioId, usuario_id]
    );

    // Si no se eliminó nada, sitio no existe o no pertenece al usuario
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sitio no encontrado o no pertenece al usuario' });
    }

    res.status(200).json({
      message: 'Sitio eliminado exitosamente',
      sitio: result.rows[0]
    });
  } catch (err) {
    console.error('Error eliminando sitio:', err);
    res.status(500).json({ message: 'Error eliminando sitio' });
  }
});

module.exports = router;