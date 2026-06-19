//archivo que maneja TODA la lógica de CRUD y logs de sitios

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /sitios/:id/stats - Obtener estadísticas de un sitio específico
router.get('/:id/stats', async (req, res) => {
  const sitioId = req.params.id;
  const usuario_id = req.user.id;

  try {
    // 1. Verificar que el sitio existe y pertenece al usuario
    const sitioResult = await pool.query(
      'SELECT * FROM sitios WHERE id = $1 AND usuario_id = $2',
      [sitioId, usuario_id]
    );

    if (sitioResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sitio no encontrado' });
    }

    const sitio = sitioResult.rows[0];

    // 2. Traer todos los logs del sitio
    const logsResult = await pool.query(
      'SELECT is_online, latencia_ms, created_at FROM logs WHERE sitio_id = $1 ORDER BY created_at DESC',
      [sitioId]
    );

    const logs = logsResult.rows;

    if (logs.length === 0) {
      return res.json({
        message: 'Sin datos de monitoreo aún',
        sitio: { id: sitio.id, url: sitio.url, nombre: sitio.nombre },
        latenciaPromedio: 0,
        latenciaMin: 0,
        latenciaMax: 0,
        ultimoLog: null,
        uptime: 0,
        totalChequeos: 0
      });
    }

    // 3. Calcular estadísticas
    const latencias = logs
      .filter(log => log.latencia_ms)
      .map(log => log.latencia_ms);

    const latenciaPromedio = latencias.length > 0
      ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
      : 0;

    const latenciaMin = latencias.length > 0 ? Math.min(...latencias) : 0;
    const latenciaMax = latencias.length > 0 ? Math.max(...latencias) : 0;

    const onlineCount = logs.filter(log => log.is_online).length;
    const uptime = Math.round((onlineCount / logs.length) * 100);

    const ultimoLog = logs[0];

    // 4. Responder
    res.json({
      message: 'Estadísticas del sitio obtenidas',
      sitio: {
        id: sitio.id,
        url: sitio.url,
        nombre: sitio.nombre
      },
      latenciaPromedio,
      latenciaMin,
      latenciaMax,
      ultimoLog,
      uptime,
      totalChequeos: logs.length,
      logs: logs.slice(0, 10)  // Últimos 10 logs
    });

  } catch (err) {
    console.error('Error obteniendo estadísticas del sitio:', err);
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

// Obtiene últimos logs de un sitio específico
router.get('/:id/logs', async (req, res) => {
  const sitioId = req.params.id;
  const usuario_id = req.user.id; // del Middleware JWT

  try {
    // Verifica que el sitio exista y pertenezca al usuario
    const sitioResult = await pool.query(
      'SELECT * FROM sitios WHERE id = $1 AND usuario_id = $2',
      [sitioId, usuario_id]
    );

    if (sitioResult.rowCount === 0) {
      return res.status(404).json({ message: 'Sitio no encontrado o no pertenece al usuario' });
    }

    // Traer últimos 10 logs del sitio ordenados por fecha descendente
    const logsResult = await pool.query(
      'SELECT * FROM logs WHERE sitio_id = $1 ORDER BY created_at DESC LIMIT 10',
      [sitioId]
    );

    // Devolver logs
    res.json({
      message: 'Logs obtenidos exitosamente',
      logs: logsResult.rows
    });

  } catch (err) {
    console.error('Error obteniendo logs:', err);
    res.status(500).json({ message: 'Error obteniendo logs' });
  }
}
);

// Elimina un sitio si pertenece al usuario autenticado
// Elimina en cascada los logs asociados para evitar violación de FK
router.delete('/:id', async (req, res) => {
  const sitioId = req.params.id;
  const usuario_id = req.user.id;

  if (!sitioId) {
    return res.status(400).json({ error: 'El ID del sitio es requerido' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verificar propiedad
    const sitioCheck = await client.query(
      'SELECT id FROM sitios WHERE id = $1 AND usuario_id = $2',
      [sitioId, usuario_id]
    );

    if (sitioCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ message: 'Sitio no encontrado o no pertenece al usuario' });
    }

    // Eliminar logs asociados primero
    await client.query('DELETE FROM logs WHERE sitio_id = $1', [sitioId]);

    // Eliminar el sitio
    const result = await client.query(
      'DELETE FROM sitios WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [sitioId, usuario_id]
    );

    await client.query('COMMIT');
    client.release();

    res.status(200).json({
      message: 'Sitio eliminado exitosamente',
      sitio: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Error eliminando sitio:', err);
    res.status(500).json({ message: 'Error eliminando sitio' });
  }
});

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

module.exports = router;


