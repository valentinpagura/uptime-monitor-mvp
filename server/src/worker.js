//1. Conectar a la BD y traer todos los sitios
//2. Para CADA sitio:
   //a. Hacer GET request a la URL
   //b. Medir TIEMPO (latencia)
   //c. Verificar si respondió (is_online)
   //d. INSERT en logs
//3. Capturar errores (si la URL falla, etc)

const pool = require('./config/database');  //importamos la conexion a la base de datos
const axios = require('axios');             //libreria para hacer peticiones HTTP
 
async function workerLoop() {
    console.log('[WORKER] Iniciado, monitoreando sitios...');

    try {
        //1. Traer todos los sitios de la BD
        const result = await pool.query('SELECT * FROM sitios');
        const sitios = result.rows;

        if (sitios.length === 0) {
            console.log('[WORKER] No hay sitios para monitorear.');
            return;
        }

        console.log(`[WORKER] Monitoreando ${sitios.length} sitios...`);

        //2. Para cada sitio, hacer GET request y medir latencia
        for (const x of sitios) {  //para cada x (sitio) en sitios:
            let response;
            let latencia;
            let statusCode;
            let isOnline;

            try {
                const startTime = Date.now();

                response = await axios.get(x.url, {
                  timeout: 5000,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                  },
                  maxRedirects: 5,
                  validateStatus: null,
                });

                latencia = Date.now() - startTime;
                statusCode = response.status;
                isOnline = statusCode >= 200 && statusCode < 400;
                
                console.log(`[WORKER] ✅ ${x.url} | Status: ${statusCode} | Latencia: ${latencia}ms`);

            } catch (error) {
                latencia = null;
                statusCode = error.response?.status || null;
                isOnline = false;

                if (error.code === 'ECONNABORTED') {
                  console.log(`[WORKER] ❌ ${x.url} | Timeout (5s)`);
                } else if (error.response) {
                  console.log(`[WORKER] ❌ ${x.url} | HTTP ${error.response.status}`);
                } else {
                  console.log(`[WORKER] ❌ ${x.url} | ${error.message}`);
                }
            }
            
            //Guardar en logs (SIEMPRE, online u offline)
            await pool.query(
                'INSERT INTO logs (sitio_id, status_code, latencia_ms, is_online, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [x.id, statusCode, latencia, isOnline]
            );
        }

        console.log('[WORKER] Ciclo completado. Esperando próximo chequeo...');

    } catch (err) {
        console.error('[WORKER] Error fatal:', err);
    }
}

module.exports = workerLoop;