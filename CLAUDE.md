# 🟢 Uptime Monitor MVP — Contexto para Claude Code

## ¿Qué es este proyecto?
Sistema web de monitoreo de disponibilidad de sitios web. El usuario se registra, ingresa URLs, y el sistema las chequea automáticamente cada 5 minutos registrando latencia, status HTTP e is_online.

---

## Stack Tecnológico

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | React + Vite | 5173 |
| Backend | Node.js + Express | 5000 |
| Base de datos | PostgreSQL 15-alpine | 5432 |
| Contenedor BD | Docker | — |
| Auth | JWT + bcrypt | — |
| Monitoreo | node-cron + axios | — |
| Gráficos | chart.js + react-chartjs-2 | — |

---

## Estructura de Archivos

```
uptime-monitor-mvp/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Forms/
│       │   │   ├── LoginForm.jsx       — Form de login con estilos CSS class
│       │   │   ├── RegisterForm.jsx    — Form de registro con validación de passwords
│       │   │   └── CreateSitioForm.jsx — Form para agregar URL a monitorear
│       │   ├── Navbar.jsx              — Barra superior: logo, email usuario, logout
│       │   ├── SitioCard.jsx           — Tarjeta de sitio: url, status, latencia, eliminar
│       │   ├── StatCard.jsx            — Card de métrica: latencia prom, uptime%, etc
│       │   ├── LatencyGauge.jsx        — Aguja SVG de latencia (0-500ms, colores semáforo)
│       │   └── LatencyChart.jsx        — Gráfico de líneas histórico (chart.js)
│       ├── contexts/
│       │   └── AuthContext.jsx         — Estado global: user, token, login(), register(), logout()
│       ├── pages/
│       │   ├── WelcomePage.jsx         — Landing con gradiente, feature cards (NO USAR: hay LoginPage)
│       │   ├── LoginPage.jsx           — Layout 2 columnas: formulario + panel decorativo derecha
│       │   ├── DashboardPage.jsx       — Tabla clickeable de sitios + panel lateral inline
│       │   └── SitioDetailPage.jsx     — Vista detallada: StatCards + Gauge + Chart + logs
│       ├── services/
│       │   └── api.js                  — Funciones centralizadas de fetch al backend
│       ├── utils/
│       │   └── token.js                — Helpers localStorage: saveToken, getToken, removeToken
│       ├── App.jsx                     — Router manual: WelcomePage → LoginPage → DashboardPage
│       ├── main.jsx                    — Entry point, envuelve con AuthProvider
│       └── index.css                  — CSS global: .auth-input, .auth-btn con estilos
│
├── server/
│   └── src/
│       ├── config/
│       │   └── database.js            — Pool de conexión PostgreSQL (pg)
│       ├── middleware/
│       │   └── auth_m.js              — Verifica JWT, agrega req.user = {id, email}
│       ├── routes/
│       │   ├── auth.js                — POST /auth/register, POST /auth/login
│       │   └── sitios.js              — CRUD sitios + GET logs + GET stats por sitio
│       ├── index.js                   — Entry point: carga .env, middlewares, rutas, createTables()
│       └── worker.js                  — node-cron: pings automáticos cada 5 minutos
│
├── docker-compose.yml
├── .gitignore
└── CLAUDE.md (este archivo)
```

---

## Base de Datos — Esquema

### Tabla: `usuarios`
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL          -- hasheado con bcrypt
fecha_registro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla: `sitios`
```sql
id                  SERIAL PRIMARY KEY
usuario_id          INTEGER REFERENCES usuarios(id)
url                 VARCHAR(255) NOT NULL
nombre              VARCHAR(255)               -- opcional
frecuencia_minutos  INTEGER DEFAULT 5
```

### Tabla: `logs`
```sql
id          SERIAL PRIMARY KEY
sitio_id    INTEGER REFERENCES sitios(id)
status_code INTEGER                            -- ej: 200, 404, null si falla
latencia_ms INTEGER                            -- ms de respuesta, null si falla
is_online   BOOLEAN                            -- true si status 200-399
created_at  TIMESTAMP DEFAULT NOW()
```

> Las tablas se crean automáticamente con `createTables()` en `index.js` al iniciar el servidor.

---

## API REST — Endpoints

### Autenticación (sin token)
| Método | Endpoint | Body | Respuesta |
|--------|----------|------|-----------|
| POST | /auth/register | {email, password} | {token, usuario} |
| POST | /auth/login | {email, password} | {token, usuario} |

### Sitios (requieren Bearer token)
| Método | Endpoint | Body/Params | Respuesta |
|--------|----------|-------------|-----------|
| POST | /sitios | {url, nombre?, frecuencia_minutos?} | {sitio} |
| GET | /sitios | — | {sitios: [...]} |
| DELETE | /sitios/:id | — | {sitio eliminado} |
| GET | /sitios/:id/logs | — | {logs: [...]} últimos 10 |
| GET | /sitios/:id/stats | — | {latenciaPromedio, latenciaMin, latenciaMax, uptime, ultimoLog, logs, totalChequeos} |

> ⚠️ ORDEN CRÍTICO en `sitios.js`: las rutas específicas van ANTES que `/:id`
> ```
> router.get('/:id/stats', ...)   ← PRIMERO
> router.get('/:id/logs', ...)    ← SEGUNDO
> router.delete('/:id', ...)      ← TERCERO
> router.get('/', ...)            ← ÚLTIMO
> ```
> Si `/:id` va antes que `/:id/stats`, Express confunde "stats" como un ID.

---

## Flujo de Autenticación

```
1. Usuario completa RegisterForm / LoginForm
2. AuthContext llama registerUser() / loginUser() de api.js
3. api.js hace POST /auth/register o /auth/login
4. Backend (auth.js):
   - Register: bcrypt.hash(password) → INSERT usuarios → jwt.sign({id, email})
   - Login: SELECT usuario → bcrypt.compare → jwt.sign({id, email})
5. Responde {token, usuario}
6. AuthContext guarda token en localStorage (via token.js) y user en estado React
7. App.jsx detecta user != null → muestra DashboardPage
```

### Restauración de sesión al recargar (AuthContext useEffect)
```javascript
// Al montar la app, si hay token en localStorage:
// 1. Decodifica el JWT manualmente (base64)
// 2. Verifica que no esté expirado (payload.exp * 1000 < Date.now())
// 3. Si válido → setUser({ id, email })
// 4. Si expirado → logout()
```

---

## Flujo del Worker (node-cron)

```
Cada 5 minutos (*/5 * * * *):
1. SELECT * FROM sitios (todos los sitios)
2. Para cada sitio:
   a. axios.get(sitio.url, { timeout: 5000 })
   b. Medir latencia: Date.now() - startTime
   c. Si responde: status_code = response.status, is_online = (200-399)
   d. Si falla: status_code = null, latencia_ms = null, is_online = false
   e. INSERT INTO logs (sitio_id, status_code, latencia_ms, is_online, created_at)
3. Console.log resultado de cada sitio
```

> El worker se inicia en `index.js` después de `app.listen()`:
> ```javascript
> cron.schedule('*/5 * * * *', async () => { await workerLoop(); });
> ```

---

## Flujo Frontend — Navegación

```
App.jsx (router manual)
├── user == null → LoginPage
│   ├── mode === 'login'    → LoginForm
│   └── mode === 'register' → RegisterForm
│
└── user != null → DashboardPage
    ├── sitioSeleccionado == null → Tabla de sitios
    └── sitioSeleccionado != null → SitioDetailPage (panel lateral)
```

---

## Detalles Importantes por Archivo

### `server/src/index.js`
```javascript
app.use(express.json())                              // parsea body JSON
app.use(cors({ origin: process.env.CLIENT_URL }))   // CORS solo desde frontend
app.use('/auth', authRoutes)                         // rutas sin auth
app.use('/sitios', authMiddleware, sitiosRoutes)     // rutas con JWT
```

### `server/src/middleware/auth_m.js`
```javascript
// Extrae: req.headers.authorization.split(' ')[1] → "Bearer TOKEN" → "TOKEN"
// Verifica: jwt.verify(token, process.env.JWT_SECRET)
// Agrega: req.user = { id, email } para uso en rutas
// Si falla: 401 Unauthorized
```

### `client/src/services/api.js`
```javascript
// Funciones disponibles:
registerUser(email, password)              // POST /auth/register
loginUser(email, password)                 // POST /auth/login
createSitio(url, nombre, frecuencia, token) // POST /sitios
getSitios(token)                           // GET /sitios
deleteSitio(sitioId, token)                // DELETE /sitios/:id
getLogs(sitioId, token)                    // GET /sitios/:id/logs
getSitioStats(sitioId, token)              // GET /sitios/:id/stats
```

### `client/src/utils/token.js`
```javascript
saveToken(token)   // localStorage.setItem('token', token)
getToken()         // localStorage.getItem('token')
removeToken()      // localStorage.removeItem('token')
```

### `client/src/components/LatencyChart.jsx`
```javascript
// Usa chart.js + react-chartjs-2 (NO recharts — incompatible con Vite en este proyecto)
// Importaciones necesarias:
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
```

### `client/src/components/LatencyGauge.jsx`
```javascript
// SVG puro, sin librería externa
// Arco de 0 a 180 grados
// Verde < 200ms, Naranja 200-400ms, Rojo > 400ms
// Props: { latencia: number, max: number (default 500) }
```

---

## Variables de Entorno

### `server/.env`
```
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_USER=uptime_user
DB_PASSWORD=uptime_pass
DB_NAME=uptime_monitor
JWT_SECRET=tu_super_secreto_aqui
```

---

## Comandos para levantar el proyecto

```bash
# 1. Docker (desde PowerShell de Windows, NO desde WSL)
cd C:\Users\Valentin\Desktop\MVP\uptime-monitor-mvp
docker compose up -d

# 2. Backend (desde WSL)
cd /mnt/c/Users/Valentin/Desktop/MVP/uptime-monitor-mvp/server
npm run dev

# 3. Frontend (desde WSL)
cd /mnt/c/Users/Valentin/Desktop/MVP/uptime-monitor-mvp/client
npm run dev
```

> ⚠️ Docker SIEMPRE desde PowerShell de Windows. Desde WSL da error ECONNREFUSED.

---

## Testing Manual (Thunder Client / curl)

```bash
# Register
POST http://localhost:5000/auth/register
Body: {"email":"test@gmail.com","password":"123456"}

# Login
POST http://localhost:5000/auth/login
Body: {"email":"test@gmail.com","password":"123456"}

# Crear sitio (con token)
POST http://localhost:5000/sitios
Headers: Authorization: Bearer <token>
Body: {"url":"https://www.google.com","nombre":"Google","frecuencia_minutos":5}

# Listar sitios
GET http://localhost:5000/sitios
Headers: Authorization: Bearer <token>

# Stats de sitio
GET http://localhost:5000/sitios/1/stats
Headers: Authorization: Bearer <token>

# Ver BD
docker exec -it uptime_monitor_db psql -U uptime_user -d uptime_monitor
SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;
```

---

## Estado Actual del MVP

### ✅ Completado
- Auth completa (register, login, JWT, persistencia de sesión)
- CRUD sitios (crear, listar, eliminar)
- Worker automático node-cron (cada 5 minutos)
- Endpoints stats y logs por sitio
- SitioDetailPage con StatCards, Gauge SVG y Chart histórico
- Dashboard con tabla clickeable
- Auto-refresh cada 10 segundos
- Restauración de sesión al recargar página
- Login/Register rediseñados (layout 2 columnas)

### 🔄 En progreso
- Rediseño visual completo del Dashboard
- Panel lateral inline (click en sitio → abre sidebar con gráficos)
- Gráficos dinámicos sin recarga de página

### ⬜ Pendiente
- Dashboard sidebar (navegación lateral)
- Auto-refresh dinámico de gráficos
- Uptime % histórico (7d, 30d)
- Alertas por email (Fase 6)

---

## Convenciones del Proyecto

- **Estilos:** Inline styles en objetos `const styles = {}` por componente. NO usar CSS modules ni Tailwind.
- **Excepción estilos inputs:** Clases CSS `.auth-input`, `.auth-btn` en `index.css` para sobrescribir estilos del navegador.
- **Imports:** Named exports `export function NombreComponente()`, no default exports.
- **Nombres:** camelCase para variables, PascalCase para componentes.
- **Errores:** `console.error()` en catch blocks, respuestas con `res.status().json({message})`.
- **Seguridad:** `usuario_id` SIEMPRE de `req.user.id` (del JWT), NUNCA del body del request.
- **recharts:** NO instalar — incompatible con Vite en este proyecto. Usar `chart.js` + `react-chartjs-2`.

---

## Dependencias Instaladas

### Backend (`server/package.json`)
```
express, cors, dotenv, pg, bcryptjs, jsonwebtoken, nodemon, node-cron, axios
```

### Frontend (`client/package.json`)
```
react, react-dom, vite, chart.js, react-chartjs-2
```

> ⚠️ NO instalar recharts. Causa conflictos con Vite en este entorno.
