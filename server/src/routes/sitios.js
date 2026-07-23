const express = require('express');
const { validate } = require('../middleware/validate');
const { createSitioSchema, idParamSchema } = require('../utils/validate');
const { RANGE_MAP, getBucketInterval, validateRange } = require('../utils/range');

function createSitiosRouter(pool) {
  const router = express.Router();

  function computeTrend(current, previous) {
    if (current == null || previous == null || previous === 0) return null;
    const diff = current - previous;
    const pct = Math.round((diff / previous) * 100);
    return {
      direccion: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      porcentaje: Math.abs(pct),
    };
  }

  router.get('/summary', async (req, res) => {
    const usuario_id = req.user.id;
    const range = req.query.range || '24h';

    const rangeConfig = validateRange(range);
    if (!rangeConfig) {
      return res.status(400).json({
        message: `Rango inválido. Valores aceptados: ${Object.keys(RANGE_MAP).join(', ')}`,
      });
    }

    const interval = rangeConfig.interval;

    try {
      const siteQuery = `
        SELECT
          s.id, s.url, s.nombre, s.frecuencia_minutos,
          COUNT(l.*)::int AS total_chequeos,
          COUNT(l.*) FILTER (WHERE l.is_online = true)::int AS online_chequeos,
          ROUND(AVG(l.latencia_ms) FILTER (WHERE l.latencia_ms IS NOT NULL))::int AS avg_latencia,
          MIN(l.latencia_ms) FILTER (WHERE l.latencia_ms IS NOT NULL)::int AS min_latencia,
          MAX(l.latencia_ms) FILTER (WHERE l.latencia_ms IS NOT NULL)::int AS max_latencia
        FROM sitios s
        LEFT JOIN logs l ON l.sitio_id = s.id
          AND ($2::interval IS NULL OR l.created_at >= NOW() - $2::interval)
        WHERE s.usuario_id = $1
        GROUP BY s.id, s.url, s.nombre
        ORDER BY s.id ASC
      `;

      const currentResult = await pool.query(siteQuery, [usuario_id, interval]);

      const sites = currentResult.rows;
      const totalSitios = sites.length;

      let passing = 0, warning = 0, slow = 0, down = 0, sinDatos = 0;
      let sumLatencia = 0, latenciaCount = 0;
      let sumOnline = 0, sumChequeos = 0;
      let minLatenciaGlobal = null, maxLatenciaGlobal = null;

      const sitiosData = sites.map((s) => {
        const uptime = s.total_chequeos > 0
          ? Math.round((s.online_chequeos / s.total_chequeos) * 100)
          : null;

        let clasificacion;
        if (s.total_chequeos === 0) {
          clasificacion = 'sin_datos';
          sinDatos++;
        } else if (s.online_chequeos / s.total_chequeos < 0.99) {
          clasificacion = 'down';
          down++;
        } else if (s.avg_latencia != null && s.avg_latencia >= 400) {
          clasificacion = 'slow';
          slow++;
        } else if (s.avg_latencia != null && s.avg_latencia >= 200) {
          clasificacion = 'warning';
          warning++;
        } else {
          clasificacion = 'passing';
          passing++;
        }

        if (s.avg_latencia != null) {
          sumLatencia += s.avg_latencia;
          latenciaCount++;
        }
        sumOnline += s.online_chequeos;
        sumChequeos += s.total_chequeos;
        if (s.min_latencia != null && (minLatenciaGlobal == null || s.min_latencia < minLatenciaGlobal)) minLatenciaGlobal = s.min_latencia;
        if (s.max_latencia != null && (maxLatenciaGlobal == null || s.max_latencia > maxLatenciaGlobal)) maxLatenciaGlobal = s.max_latencia;

        return {
          id: s.id,
          url: s.url,
          nombre: s.nombre,
          frecuenciaMinutos: s.frecuencia_minutos,
          avgLatencia: s.avg_latencia,
          uptime,
          totalChequeos: s.total_chequeos,
          clasificacion,
        };
      });

      const promedioGlobal = latenciaCount > 0 ? Math.round(sumLatencia / latenciaCount) : null;
      const uptimeGlobal = sumChequeos > 0 ? Math.round((sumOnline / sumChequeos) * 100) : null;

      let tendencias = null;
      if (interval != null) {
        const prevInterval = `2 ${interval.split(' ').slice(1).join(' ')}`;
        const prevResult = await pool.query(
          `SELECT
            COUNT(*)::int AS total_chequeos,
            ROUND(AVG(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL))::int AS avg_latencia,
            COUNT(*) FILTER (WHERE is_online = true)::int AS online_count
          FROM logs l
          JOIN sitios s ON s.id = l.sitio_id
          WHERE s.usuario_id = $1
            AND l.created_at >= NOW() - $3::interval
            AND l.created_at < NOW() - $2::interval`,
          [usuario_id, interval, prevInterval]
        );

        const prev = prevResult.rows[0];

        if (prev.total_chequeos > 0) {
          const prevAvgLatencia = prev.avg_latencia;
          const prevUptime = prev.total_chequeos > 0
            ? Math.round((prev.online_count / prev.total_chequeos) * 100)
            : null;

          tendencias = {
            promedioGlobal: computeTrend(promedioGlobal, prevAvgLatencia),
            uptimeGlobal: computeTrend(uptimeGlobal, prevUptime),
            totalChequeos: computeTrend(sumChequeos, prev.total_chequeos),
          };
        }
      }

      res.json({
        range,
        totalSitios,
        totalChequeos: sumChequeos,
        resumen: {
          passing,
          warning,
          slow,
          down,
          sinDatos,
          promedioGlobal,
          uptimeGlobal,
          minLatencia: minLatenciaGlobal,
          maxLatencia: maxLatenciaGlobal,
        },
        tendencias,
        sitios: sitiosData,
      });
    } catch (err) {
      console.error('Error obteniendo sumario del dashboard:', err);
      res.status(500).json({ message: 'Error obteniendo sumario del dashboard' });
    }
  });

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
          latenciaPromedio: null,
          latenciaMin: null,
          latenciaMax: null,
          ultimoLog: null,
          uptime: null,
          totalChequeos: 0,
        });
      }

      const latencias = logs
        .filter((log) => log.latencia_ms != null)
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

  router.get('/:id/dashboard', validate(idParamSchema, 'params'), async (req, res) => {
    const sitioId = req.params.id;
    const usuario_id = req.user.id;
    const range = req.query.range || '24h';

    const rangeConfig = validateRange(range);
    if (!rangeConfig) {
      return res.status(400).json({
        message: `Rango inválido. Valores aceptados: ${Object.keys(RANGE_MAP).join(', ')}`,
      });
    }

    try {
      const sitioResult = await pool.query(
        'SELECT id, url, nombre FROM sitios WHERE id = $1 AND usuario_id = $2',
        [sitioId, usuario_id]
      );

      if (sitioResult.rows.length === 0) {
        return res.status(404).json({ message: 'Sitio no encontrado' });
      }

      const sitio = sitioResult.rows[0];
      const bucket = rangeConfig.bucket;
      const interval = rangeConfig.interval;

      const [aggResult, globalResult, timelineResult] = await Promise.all([
        pool.query(
          `SELECT
            COUNT(*)::int AS total_chequeos,
            COUNT(*) FILTER (WHERE is_online = true)::int AS online_count,
            ROUND(AVG(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL))::int AS latencia_promedio,
            MIN(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL)::int AS latencia_min,
            MAX(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL)::int AS latencia_max
          FROM logs
          WHERE sitio_id = $1
            AND ($2::interval IS NULL OR created_at >= NOW() - $2::interval)`,
          [sitioId, interval]
        ),
        pool.query(
          'SELECT COUNT(*)::int AS total_global FROM logs WHERE sitio_id = $1',
          [sitioId]
        ),
        pool.query(
          `SELECT
            date_trunc($3::text, created_at) AS bucket,
            ROUND(AVG(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL))::int AS latencia_promedio,
            MIN(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL)::int AS latencia_min,
            MAX(latencia_ms) FILTER (WHERE latencia_ms IS NOT NULL)::int AS latencia_max,
            COUNT(*)::int AS checks,
            bool_or(is_online) AS was_online
          FROM logs
          WHERE sitio_id = $1
            AND ($2::interval IS NULL OR created_at >= NOW() - $2::interval)
          GROUP BY bucket
          ORDER BY bucket ASC`,
          [sitioId, interval, bucket]
        ),
      ]);

      const agg = aggResult.rows[0];
      const totalGlobal = globalResult.rows[0].total_global;
      const totalChequeos = agg.total_chequeos;

      if (totalChequeos === 0) {
        return res.json({
          message: 'Sin datos de monitoreo en el rango seleccionado',
          sitio: { id: sitio.id, url: sitio.url, nombre: sitio.nombre },
          range,
          totalGlobal,
          resumen: {
            latenciaPromedio: null,
            latenciaMin: null,
            latenciaMax: null,
            uptime: null,
            totalChequeos: 0,
          },
          timeline: [],
        });
      }

      const uptime = Math.round((agg.online_count / totalChequeos) * 100);

      res.json({
        message: 'Dashboard data obtained',
        sitio: { id: sitio.id, url: sitio.url, nombre: sitio.nombre },
        range,
        totalGlobal,
        resumen: {
          latenciaPromedio: agg.latencia_promedio,
          latenciaMin: agg.latencia_min,
          latenciaMax: agg.latencia_max,
          uptime,
          totalChequeos,
        },
        timeline: timelineResult.rows,
      });
    } catch (err) {
      console.error('Error obteniendo dashboard:', err);
      res.status(500).json({ message: 'Error obteniendo dashboard' });
    }
  });

  router.get('/:id/logs', validate(idParamSchema, 'params'), async (req, res) => {
    const sitioId = req.params.id;
    const usuario_id = req.user.id;
    const range = req.query.range;

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

      if (range) {
        const rangeConfig = RANGE_MAP[range];
        if (!rangeConfig) {
          return res.status(400).json({
            message: `Rango inválido. Valores aceptados: ${Object.keys(RANGE_MAP).join(', ')}`,
          });
        }

        let query, params;
        if (rangeConfig.interval) {
          query = 'SELECT * FROM logs WHERE sitio_id = $1 AND created_at >= NOW() - $2::interval ORDER BY created_at DESC';
          params = [sitioId, rangeConfig.interval];
        } else {
          query = 'SELECT * FROM logs WHERE sitio_id = $1 ORDER BY created_at DESC';
          params = [sitioId];
        }

        const logsResult = await pool.query(query, params);

        return res.json({
          message: 'Logs obtenidos exitosamente',
          logs: logsResult.rows,
          range,
        });
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
