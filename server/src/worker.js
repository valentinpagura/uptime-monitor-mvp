const pool = require('./config/database');
const { fetchWithRetry } = require('./utils/fetchWrapper');

const CONCURRENCY = 5;

async function workerLoop() {
  console.log('[WORKER] Iniciado, monitoreando sitios...');

  try {
    const result = await pool.query('SELECT * FROM sitios');
    const sitios = result.rows;

    if (sitios.length === 0) {
      console.log('[WORKER] No hay sitios para monitorear.');
      return;
    }

    const dueResult = await pool.query(`
      SELECT s.id, s.url, s.nombre, s.frecuencia_minutos,
             l.created_at AS ultimo_chequeo
      FROM sitios s
      LEFT JOIN LATERAL (
        SELECT created_at FROM logs
        WHERE sitio_id = s.id
        ORDER BY created_at DESC
        LIMIT 1
      ) l ON true
    `);
    const now = new Date();
    const sitiosDebidos = dueResult.rows.filter((sitio) => {
      if (!sitio.ultimo_chequeo) return true;
      const diffMin = (now - new Date(sitio.ultimo_chequeo)) / 60000;
      return diffMin >= sitio.frecuencia_minutos;
    });

    if (sitiosDebidos.length === 0) {
      console.log('[WORKER] Todos los sitios ya fueron chequeados recientemente. Saltando ciclo.');
      return;
    }

    console.log(`[WORKER] Monitoreando ${sitiosDebidos.length}/${sitios.length} sitios debidos (concurrencia: ${CONCURRENCY})...`);

    const results = await runWithConcurrency(sitiosDebidos, CONCURRENCY, async (sitio) => {
      let latencia = null;
      let statusCode = null;
      let isOnline = false;

      try {
        const startTime = Date.now();
        const response = await fetchWithRetry(sitio.url, { timeout: 5000, retries: 1 });
        latencia = Date.now() - startTime;
        statusCode = response.status;
        isOnline = statusCode >= 200 && statusCode < 400;
        console.log(`[WORKER] ✅ ${sitio.url} | Status: ${statusCode} | Latencia: ${latencia}ms`);
      } catch (error) {
        console.log(`[WORKER] ❌ ${sitio.url} | Error: ${error.message}`);
      }

      await pool.query(
        'INSERT INTO logs (sitio_id, status_code, latencia_ms, is_online, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [sitio.id, statusCode, latencia, isOnline]
      );

      return { id: sitio.id, url: sitio.url, isOnline };
    });

    const onlineCount = results.filter((r) => r.status === 'fulfilled' && r.value.isOnline).length;
    console.log(`[WORKER] Ciclo completado. ${onlineCount}/${sitiosDebidos.length} sitios online. Esperando próximo chequeo...`);
  } catch (err) {
    console.error('[WORKER] Error fatal:', err);
  }
}

async function runWithConcurrency(items, concurrency, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

module.exports = workerLoop;
