const express = require('express');
const { validate } = require('../middleware/validate');
const { createSitioSchema, idParamSchema } = require('../utils/validate');

function createSitiosRouter(pool) {
  const router = express.Router();

  router.get('/:id/stats', validate(idParamSchema, 'params'), async (req, res) => {
    const sitioId = req.params.id;
    const usuario_id = req.user.id;

    try {
      const sitioResult = await pool.query(
        'SELECT * FROM sitios WHERE id = $1 AND usuario_id = $2',
        [sitioId, usuario_id]
      );

      if (sitioResult.rows.length === 0) {
        return res.status(404).json({ message: 'Sitio no encontrado' });
      }

      const sitio = sitioResult.rows[0];

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
          totalChequeos: 0,
        });
      }

      const latencias = logs
        .filter((log) => log.latencia_ms)
        .map((log) => log.latencia_ms);

      const latenciaPromedio =
        latencias.length > 0
          ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
          : 0;

      const latenciaMin = latencias.length > 0 ? Math.min(...latencias) : 0;
      const latenciaMax = latencias.length > 0 ? Math.max(...latencias) : 0;

      const onlineCount = logs.filter((log) => log.is_online).length;
      const uptime = Math.round((onlineCount / logs.length) * 100);

      const ultimoLog = logs[0];

      res.json({
        message: 'Estadísticas del sitio obtenidas',
        sitio: {
          id: sitio.id,
          url: sitio.url,
          nombre: sitio.nombre,
        },
        latenciaPromedio,
        latenciaMin,
        latenciaMax,
        ultimoLog,
        uptime,
        totalChequeos: logs.length,
        logs: logs.slice(0, 10),
      });
    } catch (err) {
      console.error('Error obteniendo estadísticas del sitio:', err);
      res.status(500).json({ message: 'Error obteniendo estadísticas' });
    }
  });

  router.get('/:id/logs', validate(idParamSchema, 'params'), async (req, res) => {
    const sitioId = req.params.id;
    const usuario_id = req.user.id;

    try {
      const sitioResult = await pool.query(
        'SELECT * FROM sitios WHERE id = $1 AND usuario_id = $2',
        [sitioId, usuario_id]
      );

      if (sitioResult.rowCount === 0) {
        return res
          .status(404)
          .json({ message: 'Sitio no encontrado o no pertenece al usuario' });
      }

      const logsResult = await pool.query(
        'SELECT * FROM logs WHERE sitio_id = $1 ORDER BY created_at DESC LIMIT 10',
        [sitioId]
      );

      res.json({
        message: 'Logs obtenidos exitosamente',
        logs: logsResult.rows,
      });
    } catch (err) {
      console.error('Error obteniendo logs:', err);
      res.status(500).json({ message: 'Error obteniendo logs' });
    }
  });

  router.delete('/:id', validate(idParamSchema, 'params'), async (req, res) => {
    const sitioId = req.params.id;
    const usuario_id = req.user.id;

    if (!sitioId) {
      return res.status(400).json({ error: 'El ID del sitio es requerido' });
    }

    try {
      const result = await pool.query(
        'DELETE FROM sitios WHERE id = $1 AND usuario_id = $2 RETURNING *',
        [sitioId, usuario_id]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: 'Sitio no encontrado o no pertenece al usuario' });
      }

      res.status(200).json({
        message: 'Sitio eliminado exitosamente',
        sitio: result.rows[0],
      });
    } catch (err) {
      console.error('Error eliminando sitio:', err);
      res.status(500).json({ message: 'Error eliminando sitio' });
    }
  });

  router.post('/', validate(createSitioSchema, 'body'), async (req, res) => {
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
        sitio: result.rows[0],
      });
    } catch (err) {
      console.error('Error creando sitio:', err);
      res.status(500).json({ message: 'Error creando sitio' });
    }
  });

  router.get('/', async (req, res) => {
    const usuario_id = req.user.id;

    try {
      const result = await pool.query(
        'SELECT * FROM sitios WHERE usuario_id = $1 ORDER BY id DESC',
        [usuario_id]
      );

      res.status(200).json({
        message: 'Sitios obtenidos exitosamente',
        sitios: result.rows,
      });
    } catch (err) {
      console.error('Error obteniendo sitios:', err);
      res.status(500).json({ message: 'Error obteniendo sitios' });
    }
  });

  return router;
}

module.exports = createSitiosRouter;
