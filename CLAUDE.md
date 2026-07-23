# 🟢 Uptime Monitor MVP — Contexto para IA

## Proyecto

Sistema web de monitoreo de disponibilidad de sitios web. El usuario se registra, ingresa URLs, y el sistema las verifica automáticamente cada `frecuencia_minutos` registrando latencia, código HTTP y estado online/offline.

**Estado general:** MVP funcional y estable. Post-auditoría profunda de métricas y visualización. En fase de expansión de testing.

---

## Stack Tecnológico

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | React 19 + Vite 8 | 5173 |
| Backend | Node.js + Express 5 | 5000 |
| Base de datos | PostgreSQL 15-alpine | 5432 |
| Contenedor BD | Docker | — |
| Auth | JWT + bcryptjs | — |
| Monitoreo | node-cron + axios | — |
| Gráficos | chart.js 4 + react-chartjs-2 | — |
| Animaciones | GSAP 3 | — |
| WebGL | OGL (partículas, shaders) | — |
| Validación | Zod | — |
| Testing | Vitest + React Testing Library | — |

---

## Estructura del Proyecto

```
uptime-monitor-mvp/
├── client/
│   └── src/
│       ├── components/        — 13 componentes React
│       │   ├── Sidebar.jsx        — Navegación lateral (logo, nav items, logout)
│       │   ├── TopBar.jsx         — Barra superior (búsqueda, refresh, acciones)
│       │   ├── SearchDropdown.jsx  — Dropdown de búsqueda en vivo (memoized)
│       │   ├── ErrorBoundary.jsx   — Class component, atrapa errores de render
│       │   ├── KpiCard.jsx         — Tarjeta de KPI compacta (memoized)
│       │   ├── StatCard.jsx        — Tarjeta de métrica detallada (memoized)
│       │   ├── ConfirmModal.jsx    — Diálogo de confirmación accesible
│       │   ├── AddSiteForm.jsx     — Formulario para agregar monitor
│       │   ├── SitiosTable.jsx     — Tabla de sitios con menú contextual
│       │   ├── LatencyChart.jsx    — Gráfico de líneas histórico (chart.js, memoized)
│       │   ├── LatencyGauge.jsx    — Aguja SVG de latencia (memoized)
│       │   ├── DarkVeil.jsx        — Shader WebGL de fondo orgánico (default export)
│       │   └── Particles.jsx       — Sistema de partículas 3D WebGL (default export)
│       ├── contexts/
│       │   ├── AuthContext.jsx     — Estado global: user, token, login, register, logout
│       │   └── ToastContext.jsx    — Sistema de notificaciones toast
│       ├── hooks/               — 7 hooks personalizados
│       ├── pages/               — 4 páginas
│       ├── services/
│       │   └── api.js              — 7 funciones fetch al backend
│       ├── utils/               — 5 utilidades
│       ├── App.jsx                 — Router manual
│       ├── main.jsx                — Entry point
│       └── index.css               — 611 líneas: reset, tema dark, dashboard theme, animaciones
│
├── server/
│   └── src/
│       ├── index.js               — Entry: dotenv, createTables, cron start, graceful shutdown
│       ├── app.js                 — Express app factory (CORS, JSON, routes)
│       ├── worker.js              — node-cron: workerLoop con concurrencia y retry
│       ├── config/
│       │   └── database.js        — Pool PostgreSQL (pg)
│       ├── middleware/
│       │   ├── auth_m.js          — JWT verification, req.user
│       │   └── validate.js        — Generic Zod validation middleware factory
│       ├── routes/
│       │   ├── auth.js            — POST /auth/register, POST /auth/login
│       │   └── sitios.js          — CRUD + /:id/logs + /:id/stats
│       └── utils/
│           ├── validate.js        — Zod schemas (register, login, createSitio, idParam)
│           └── fetchWrapper.js    — fetchWithRetry: axios con retry exponencial
│
├── docker-compose.yml
├── .gitignore
└── CLAUDE.md (este archivo)
```

---

## Base de Datos — Esquema

```sql
-- Tabla: usuarios
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
fecha_registro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- Tabla: sitios
id                  SERIAL PRIMARY KEY
usuario_id          INTEGER REFERENCES usuarios(id)
url                 VARCHAR(255) NOT NULL
nombre              VARCHAR(255)
frecuencia_minutos  INTEGER DEFAULT 5

-- Tabla: logs
id          SERIAL PRIMARY KEY
sitio_id    INTEGER REFERENCES sitios(id)
status_code INTEGER
latencia_ms INTEGER
is_online   BOOLEAN
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
| GET | /sitios/summary | ?range=24h | {range, totalSitios, totalChequeos, resumen, tendencias, sitios} |
| DELETE | /sitios/:id | — | {sitio} |
| GET | /sitios/:id/logs | — | {logs: [...]} últimos 10 |
| GET | /sitios/:id/stats | — | {latenciaPromedio, latenciaMin, latenciaMax, uptime, ultimoLog, logs, totalChequeos} |

### Salud
| Método | Endpoint | Respuesta |
|--------|----------|-----------|
| GET | /health | {status: 'OK'} |

> ⚠️ ORDEN CRÍTICO en `sitios.js`: las rutas específicas van ANTES que el DELETE `/:id`

---

## Componentes Principales

| Componente | Propósito |
|-----------|-----------|
| **Sidebar** | Navegación lateral fija de 256px. Logo NOC-UPTIME, Deploy Probe button, 4 nav items funcionales (Overview/Monitors/Analytics/Settings), Help/Sign Out abajo. `activeSection` + `onNavigate` props. `aria-current="page"`, `aria-disabled`, `tabIndex`, keyboard: Enter/Space |
| **TopBar** | Barra superior con input de búsqueda + SearchDropdown, título "System Monitor", botones: Notifications, Refresh, Terminal. Integra SearchDropdown |
| **SearchDropdown** | Filtro en vivo por nombre/URL con status dot, latency label, click-outside detection. Memoized |
| **ErrorBoundary** | Class component. Catch de errores de render, log vía logger.js, fallback UI con Try Again y Reload Page. Dev mode muestra error details |
| **KpiCard** | Tarjeta compacta (112px) con label, valor monospace, unidad opcional, status dot (primary/warning/error/neutral), trend prop (↑↓→ con color via status.js). Memoized |
| **StatCard** | Tarjeta de métrica con título, ícono, valor grande coloreado, unidad. Memoized |
| **ConfirmModal** | Diálogo accesible con overlay, Escape/Tab key trap, focus management, danger/default variant |
| **AddSiteForm** | Formulario: URL (monospace), display name, frecuencia (1/5/15 min), loading state, error display |
| **SitiosTable** | Tabla responsiva con status dot/color, nombre, URL (tablet+), latencia, frecuencia (desktop+), menú contextual por fila para eliminar. Columnas ordenables (status/name/latency/frequency), status filter bar (All/Passing/Warning/Slow/Down/Sin datos), paginación (10/20/50), integración con searchQuery, dual classification + ultimoLog. `db-row-menu-btn` aparece en hover |
| **LatencyChart** | Chart.js line chart con líneas de referencia en 200ms/400ms, tema oscuro, tooltips con datetime completo. Estados: 0 logs (null), 1 log (firstDataBox), 2-4 (sparse), 5+ (full). Memoized |
| **LatencyGauge** | SVG arc gauge 0-180°, colores: verde <200ms, amarillo 200-400ms, rojo >400ms, gris si null. Aguja rotada. Memoized |
| **DarkVeil** | Shader WebGL (OGL) con CPPN, hueShift, noise, scanlines, warp. Fondo animado de WelcomePage |
| **Particles** | Sistema de partículas 3D (OGL). 200 por defecto, hover tracking, auto-rotación, alpha blending. Fondo de DashboardPage |

---

## Hooks

| Hook | Propósito |
|------|-----------|
| **usePolling(callback, intervalMs, {enabled})** | Polling con protección de concurrencia (pendingRef). Devuelve `{refresh}` |
| **useDebounce(value, delay)** | Debounce de valor (default 300ms) |
| **useDashboardData(token, options)** | Hook central del dashboard. Llama GET /sitios/summary con polling (10s). Devuelve `{data, loading, error, refresh, range, setRange, resumen, tendencias, sitios, totalSitios, totalChequeos}` |
| **useDashboardMetrics(sitios)** | Calcula KPIs locales: passing/warnings/failed/avgLatencia. Ya no se usa en DashboardPage |
| **useMobileDetection()** | `isMobile = window.innerWidth <= 768`. Se actualiza en resize |
| **useStaggerReveal(ref, options)** | Animación staggered con IntersectionObserver + GSAP. Respeta `prefers-reduced-motion` |
| **useSpotlight(containerRef, options)** | Spotlight radial que sigue el mouse y ajusta glow en `.magic-glow-card`. GSAP + CSS custom properties |
| **useMagicEffects(ref, options)** | Hover magnetism, tilt, estrellas, click ripple. GSAP. Deshabilitado en mobile |

---

## Utilidades

| Utilidad | Propósito |
|----------|-----------|
| **getStatus(log)** | Mapea log → {label, color, dotColor}: PENDING / DOWN / SLOW (>=400ms) / WARN (>=200ms) / UP (<200ms) |
| **token.js** | `saveToken`, `getToken`, `removeToken` — wrapper de localStorage |
| **formatLocalTime.js** | `toDate`, `formatLocalTime`, `formatLocalDate`, `formatLocalDateTime`, `formatLocalChartTime`. Locale `es-AR`. Regex TZ_OFFSET_RE para timezone |
| **logger.js** | `logError`, `logWarn`, `logInfo`, `setSentryEnabled`, `initErrorMonitoring`. Consola + Sentry opcional |
| **glow.js** | Constantes (MOBILE_BREAKPOINT=768, etc.) + `calculateSpotlightValues`, `updateCardGlowProperties`, `createParticleElement` |

---

## Context Providers

### AuthProvider
Estado: `{user, token, loading, error}`. Funciones: `login(email, password)`, `register(email, password)`, `logout()`.
- Al montar: si hay token en localStorage → decodifica JWT (base64 manual) → verifica `exp` → restaura sesión o hace logout
- Login/Register: llama api.js, guarda token en localStorage, setea user en estado
- Logout: remueve token, limpia estado

### ToastProvider
Expone: `addToast(message, type='info', duration=4000)` → devuelve ID.
- tipos: success (✅), error (❌), warning (⚠️), info (ℹ️)
- Auto-dismiss: setTimeout → removing=true → setTimeout(400ms) → remove
- Límite: no tiene límite superior
- Cleanup: `useEffect` return clears all timers on unmount

---

## Flujo de Datos

```
Worker (cron cada 1 minuto):
  SELECT sitios → filtra por frecuencia_minutos → fetchWithRetry (concurrencia 5)
  → INSERT logs → ciclo cada 1 minuto

API (Express):
  GET /sitios → lista sitios del usuario
  GET /sitios/:id/logs → últimos 10 logs
  GET /sitios/:id/stats → métricas agregadas

Frontend Dashboard:
  useDashboardData(token) → cada 10s:
    GET /sitios/summary?range=24h → {resumen, tendencias, sitios}
  useSpotlight(contentRef) → efecto glow en cards
  useStaggerReveal(kpiGridRef) → animación de entrada

Frontend Detail:
  usePolling(cargarStats, 10000) → cada 10s:
    GET /sitios/:id/stats → setStats
  LatencyChart (lazy-loaded via Suspense) → chart.js
  LatencyGauge → SVG puro
```

---

## Sistema de Métricas

### Cálculos (server/src/routes/sitios.js, endpoint /stats)
| Métrica | Cálculo |
|---------|---------|
| latenciaPromedio | `avg(latencias)` donde `latencia_ms != null`. Redondeado. Si no hay logs: null |
| latenciaMin/Max | `min/max(latencias)` donde `latencia_ms != null`. 0 si no hay latencias |
| uptime | `(onlineCount / totalChequeos) * 100`, redondeado |
| ultimoLog | `logs[0]` (más reciente) |

### Status (frontend, status.js)
| Estado | Condición |
|--------|-----------|
| PENDING | log es null o undefined |
| DOWN | `!log.is_online` |
| SLOW | `log.latencia_ms >= 400` |
| WARN | `log.latencia_ms >= 200` |
| UP | cualquier otro caso online |

### KPIs (Dashboard, useDashboardMetrics.js)
| KPI | Conteo |
|-----|--------|
| passing | sitios con `is_online=true` y `latencia_ms < 200` |
| warnings | sitios con `is_online=true` y `latencia_ms >= 200` |
| failed | sitios con `is_online=false` |
| avgLatencia | promedio de latencias de sitios online con latencia no-null |

---

## Testing

**Framework:** Vitest 4 + React Testing Library + jsdom

**Setup:** `client/src/test/setup.js` — import `@testing-library/jest-dom`, mock `matchMedia`, polyfill `IntersectionObserver`

**Total:** 410 frontend + 68 backend = **478 tests**, 30 suites, 0 fallos. **0 regresiones.**

### Cobertura actual

| Módulo | Archivos | Tests | Estado |
|--------|----------|-------|--------|
| Components | 7/13 | ~73 | Sidebar, TopBar, SearchDropdown, ErrorBoundary sin test |
| Hooks | 5/7 | ~32 | useMagicEffects, useSpotlight sin test |
| Utils | 3/5 | ~47 | logger.js, glow.js sin test |
| Services | 1/1 | 16 | api.js completo ✅ |
| Contexts | 2/2 | 31 | AuthContext + ToastContext completos ✅ |
| Pages | 2/4 | ~13 | WelcomePage, LoginPage sin test |
| Backend | 4 | — | validate, fetchWrapper, auth routes, sitios routes |

### Tests existentes
```
client/src/test/
├── utils/
│   ├── status.test.js         — 11 tests, calidad A
│   ├── formatLocalTime.test.js — 27 tests, nuevo
│   └── token.test.js           — 9 tests, nuevo
├── hooks/
│   ├── useDashboardMetrics.test.js — 9 tests, A
│   ├── useDebounce.test.js         — 5 tests, A-
│   ├── useMobileDetection.test.js  — 6 tests, A-
│   ├── usePolling.test.js          — 7 tests, B (falta pendingRef dedup)
│   └── useStaggerReveal.test.js    — 5 tests, D (GSAP no mockeado)
├── components/
│   ├── AddSiteForm.test.jsx  — 9 tests, B
│   ├── ConfirmModal.test.jsx — 14 tests, A
│   ├── KpiCard.test.jsx      — 8 tests, B
│   ├── LatencyChart.test.jsx — 6 tests, C (chart.js no mockeado)
│   ├── LatencyGauge.test.jsx — 12 tests, A-
│   ├── SitiosTable.test.jsx  — 20 tests, A-
│   └── StatCard.test.jsx     — 6 tests, B
├── contexts/
│   ├── AuthContext.test.jsx  — 17 tests, nuevo
│   └── ToastContext.test.jsx — 14 tests, nuevo
├── pages/
│   ├── DashboardPage.test.jsx  — 9 tests, B
│   └── SitioDetailPage.test.jsx — 7 tests, B
├── services/
│   └── api.test.js           — 16 tests, nuevo
└── setup.js

server/src/__tests__/
├── validate.test.js
├── fetchWrapper.test.js
├── routes/auth.test.js
└── routes/sitios.test.js
```

---

## Estado del Desarrollo

### ✅ Completado
- Auth: register, login, JWT, bcrypt, persistencia de sesión, restauración al recargar
- CRUD sitios: crear, listar, eliminar (cada uno con verificación de pertenencia)
- Worker: node-cron cada 1 minuto, concurrencia 5, filtro por frecuencia_minutos, fetchWithRetry con backoff
- Endpoints: /stats (métrica agregada), /logs (últimos 10), /health, /summary
- Dashboard completo con Sidebar, TopBar, KPI cards, AddSiteForm, SitiosTable, Particles background
- SitioDetailPage con StatCards, LatencyGauge, LatencyChart (lazy-loaded), skeleton loading
- SearchDropdown con filtro en vivo, click-outside, status dots
- ConfirmModal accesible (Escape, Tab trap, focus management, aria)
- ErrorBoundary con fallback UI y dev details
- ToastContext con 4 tipos, auto-dismiss, animación, cleanup
- Motion design: GSAP (stagger reveal, spotlight, magic effects), WebGL (partículas, DarkVeil)
- Polling cada 10s en Dashboard y Detail (usePolling con protección de concurrencia)
- Backend hardening: Zod validation schemas, validation middleware, factory pattern con DI
- Graceful shutdown: SIGTERM/SIGINT → stop cron → close server → end pool
- Auditoría profunda de métricas: thresholds SLOW/WARN/UP, filtros null-safety, formatLocalTime con regex
- Testing: servicios (api.js), utilidades (token, formatLocalTime, status), contextos (Auth, Toast)
- Dashboard redesign: sidebar inline, search dropdown, KPI grid, add probe form
- F11.1: useDashboardData hook, getDashboardSummary api, RangeSelector component
- F11.2: SitiosTable sortable/filtered/paginated, status.js helpers (formatLatency, getTrend, getClassificationStatus), KpiCard trend prop
- F11.3: Sidebar with activeSection navigation (Overview/Monitors/Analytics/Settings), DashboardPage refactored with useDashboardData, 4 section views (Overview/Monitors/Analytics/Settings)

### 🚧 En progreso
- Sidebar, TopBar, SearchDropdown, ErrorBoundary sin tests
- WelcomePage, LoginPage sin tests
- useMagicEffects, useSpotlight sin tests
- logger.js, glow.js sin tests
- useStaggerReveal test con calidad D (falta mock GSAP)
- LatencyChart test sin mock de chart.js

### 📌 Pendiente
- useReducedMotion hook (no existe, preferencia inline en SitioDetailPage)
- Uptime % histórico (7d, 30d)
- Alertas por email
- Dashboard Analytics y Settings pages (contenido real, no placeholder)
- Lazy loading adicional
- i18n

---

## Decisiones Arquitectónicas

| Decisión | Implementación |
|----------|---------------|
| **Factory Pattern** | Backend: `createApp(pool)`, `createAuthRouter(pool)`, `createSitiosRouter(pool)` — inyección de dependencias para testability |
| **Dependency Injection** | Pool de PostgreSQL inyectado en routers y app factory |
| **React.memo** | KpiCard, StatCard, LatencyChart, LatencyGauge, SearchDropdown, SitioTableRow |
| **usePolling** | Custom hook con `pendingRef` para prevenir ejecución concurrente + `mountedRef` para evitar state updates post-unmount |
| **safeExecute** | Función helper en usePolling: si callback es async, `pendingRef` se resetea en `.finally()` |
| **ConfirmModal** | Diálogo accesible: focus trap, Escape key, overlay click, aria attributes, body scroll lock |
| **ToastContext** | IDs auto-incrementales (module-level `toastId`), `timersRef` para cleanup en unmount, doble setTimeout para animación de salida |
| **ErrorBoundary** | Class component (requisito de React), `logError` via logger.js, dev-only error details |
| **SearchDropdown** | Click-outside via `mousedown` listener en useEffect, memoized, getStatus para status dot |
| **Zod Validation** | Schemas separados en `utils/validate.js`, middleware genérico `validate(schema, source)` |
| **Fetch Wrapper** | `fetchWithRetry` con axios, timeout, retry count y retry delay con backoff lineal |
| **Worker concurrente** | `runWithConcurrency(items, 5, fn)` — batches de Promise.allSettled, control de concurrencia |
| **Graceful Shutdown** | SIGTERM/SIGINT → `job.stop()` → `server.close()` → `pool.end()` → `process.exit(0)` |
| **FormatLocalTime** | Regex `TZ_OFFSET_RE` para evitar falsos positivos con guiones ISO. Locale `es-AR` |
| **Status centralizado** | `getStatus()` en utils/status.js — fuente única de verdad para labels, colores y thresholds |
| **Stagger Reveal** | IntersectionObserver + GSAP. Respeta `prefers-reduced-motion` |
| **Spotlight + Magic Effects** | GSAP + CSS custom properties (`--glow-x`, `--glow-y`, etc.). `useMobileDetection` para disable en mobile |
| **No recharts** | Usar siempre chart.js. `react-chartjs-2` es compatible con Vite. NO instalar recharts |

---

## Convenciones del Proyecto

- **Estilos:** Objetos `const styles = {}` inline en cada componente. NO Tailwind, NO CSS modules.
- **Excepción:** Clases CSS en `index.css` para inputs (`.auth-input`, `.auth-btn`), animaciones (`.db-skeleton`, `.db-fade-in`), layout responsivo (`.db-dashboard-grid`, `.db-cell-desktop`)
- **Imports:** Named exports siempre: `export function Componente()`, `export const hook`. Solo DarkVeil y Particles usan default export.
- **Nombres:** camelCase variables, PascalCase componentes, snake_case columnas BD, kebab-case clases CSS
- **Errores:** `console.error()` en catch blocks, `res.status().json({message})` en backend
- **Seguridad:** `usuario_id` SIEMPRE de `req.user.id` (JWT). NUNCA del body del request
- **Hooks:** `useCallback` para handlers pasados como props, `useMemo` para cómputos derivados
- **Testing:** `describe`/`it`/`expect` de vitest, `vi.fn()` para mocks, `vi.useFakeTimers()` para timers, `@testing-library/react` para render, `screen.getByText`/`queryByText` para aserciones
- **Responsive:** 3 breakpoints: desktop (>1024px con sidebar), tablet (640-1024px oculta sidebar), mobile (<640px). Clases `.db-cell-desktop` (hidden <768px) y `.db-cell-tablet` (hidden <640px)
- **Accesibilidad:** `aria-label`, `role`, `aria-current`, `aria-disabled`, `aria-live`, `aria-modal`, keyboard handlers. `prefers-reduced-motion` respetado en animaciones GSAP.

---

## Comandos Útiles

```bash
# Frontend
cd client
npm run dev        # Vite dev server :5173
npm run build      # Vite build → dist/
npm run test       # Vitest run (211 tests)
npm run test:watch # Vitest watch mode
npm run lint       # ESLint

# Backend
cd server
npm run dev        # Nodemon :5000
npm run start      # Node production
npm run test       # Vitest run (backend)
npm run test:watch # Vitest watch

# Docker (desde PowerShell de Windows, NO desde WSL)
docker compose up -d
docker exec -it uptime_monitor_db psql -U uptime_user -d uptime_monitor

# Testing manual
curl -X POST http://localhost:5000/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"123456"}'
curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"123456"}'
curl http://localhost:5000/sitios -H "Authorization: Bearer <token>"
curl http://localhost:5000/health
```

---

## Variables de Entorno (server/.env)

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

## Información para Futuras Sesiones de IA

### Checklist antes de modificar código
1. Leer CLAUDE.md y verificar que la info esté actualizada
2. Leer los archivos a modificar COMPLETOS (no asumir estructura)
3. Identificar convenciones del proyecto (estilos inline, named exports, etc.)
4. Verificar que ningún test existente cubra ya el cambio planeado
5. Si se añade dependencia npm: verificar compatibilidad con Vite (NO recharts)

### Checklist antes de hacer commit
1. `npm run test` en client/ y server/ — 0 fallos, 0 regresiones
2. `npm run build` en client/ — 0 errores, 121 modules
3. `npm run lint` en client/ — sin errores
4. Los tests nuevos son determinísticos, aislados, rápidos
5. No se modificó lógica de producción sin querer

### Checklist antes de dar una fase por finalizada
1. Tests nuevos pasan + tests anteriores no regresionan
2. Build exitoso
3. No hay console.log residuales (solo los intencionales de worker y error handling)
4. Cobertura documentada en CLAUDE.md
5. No se introdujeron dependencias nuevas sin documentar

### Puntos críticos / delicados
- **Router manual App.jsx**: No hay React Router. La navegación es por estado (`currentPage`, `sitioSeleccionado`). Cualquier cambio en la estructura de navegación debe mantener este patrón.
- **Sidebar y TopBar**: Sin test. Son la navegación principal. Modificarlos requiere test manual completo.
- **usePolling**: `pendingRef` evita concurrencia. Si se modifica el hook, verificar que la protección siga funcionando con callbacks async.
- **SafeExecute en usePolling**: Si `fn()` lanza sincrónicamente, `pendingRef` queda trabado (edge case menor, todos los callbacks son async).
- **AuthContext JWT decode**: Decodifica manualmente con `atob()`. Si el JWT contiene caracteres no-ASCII, puede fallar.
- **toastId module-level**: Variable global del módulo. Persiste entre renders. Si se necesita resetear en tests, usar `vi.resetModules()`.
- **No existe useReducedMotion**: La detección de `prefers-reduced-motion` es inline en SitioDetailPage. No hay un hook centralizado.
- **Expres 5**: El backend usa Express 5.x. La API de Express 5 tiene diferencias sutiles con Express 4 (manejo de errores, `req.query`).
- **Worker corre cada 1 minuto**: No cada 5 minutos. El filtro `frecuencia_minutos` decide qué sitios verificar.

### Archivos que requieren cuidado extra
| Archivo | Riesgo |
|---------|--------|
| server/src/routes/sitios.js | Orden de rutas CRÍTICO. `/:id/stats` antes de `/:id` |
| server/src/worker.js | Concurrencia 5, errores de red, timeouts. No modificar sin pruebas |
| client/src/hooks/usePolling.js | pendingRef, mountedRef, safeExecute. Modificar con cuidado |
| client/src/contexts/AuthContext.jsx | Session restoration, JWT decode, exp check. Cambios afectan auth global |
| client/src/contexts/ToastContext.jsx | Timers, cleanup. Memory leaks si se modifica incorrectamente |
| client/src/pages/DashboardPage.jsx | Integra 10+ componentes, 3 hooks, polling, contextos |
| client/src/utils/status.js | Usado por SearchDropdown, SitiosTable, SitioDetailPage, KpiCard |

### Módulos sensibles a regresión
- `getStatus()` — usado en 4+ ubicaciones. Cambiar thresholds afecta Dashboard, Detail, SearchDropdown
- `useDashboardMetrics()` — thresholds WARN/PASSING deben coincidir con `getStatus()`
- `formatLocalTime.toDate()` — usado por 4 funciones de formateo. Cambiar parseo afecta charts, logs, info boxes
- `auth_m.js` — cualquier cambio en JWT verification afecta todos los endpoints `/sitios`
- `api.js` — todas las páginas y contextos dependen de él
