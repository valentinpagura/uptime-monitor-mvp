//archivo que maneja TODA la lógica de CRUD y logs de sitios

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/stats', async (req, res) => {
  const usuario_id = req.user.id; //extraemos el usuario, ya que es requerido para buscar sus logs
  try {
    const statsResult = await pool.query(`
      SELECT id FROM sitios WHERE usuario_id = $1
    `, [usuario_id]);
    
  const sitios_obtenidos = statsResult.rows; //array de objetos con los sitios del usuario}
    if (sitios_obtenidos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron sitios para el usuario' });
      total_Online = 0;
      total_Offline = 0;
      Latencia_Promedio = 0;
      ultimoChequeo = null;
    }

    let total_Online = 0;
    let total_Offline = 0;
    let Latencia_Promedio = 0;
    let ultimoChequeo = null;

    for (const sitio of sitios_obtenidos) {
      const logsResult = await pool.query(`
        SELECT is_online, latencia_ms, created_at FROM logs WHERE sitio_id = $1 ORDER BY created_at DESC LIMIT 1
      `, [sitio.id]);

      if (logsResult.rowCount > 0) {
        const log = logsResult.rows[0];

      if (log.is_online) {
          total_Online++;
        }
        else {
          total_Offline++;
        }
      if (log.latencia_ms) {
          latencias.push(log.latencia_ms);
        }
      
      if (!ultimoChequeo || log.created_at > ultimoChequeo) {
          ultimoChequeo = log.created_at;
        }
      }
    }

     // 3. Calcular latencia promedio
    const latenciaPromedio = latencias.length > 0
      ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
      : 0;

      // 4. Responder
    res.json({
      message: 'Estadísticas obtenidas',
      totalOnline,
      totalOffline,
      latenciaPromedio,
      ultimoChequeo
    });

  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
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




