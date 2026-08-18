# AuditIA Demo · Documento de Transferencia

> **Propósito de este documento:** dar contexto completo de un producto digital construido como demo
> para los socios de Auditoría Interna de Deloitte Chile. Está pensado para que una persona técnica
> que recibe el proyecto pueda continuar el desarrollo sin haber participado en las conversaciones
> previas.

---

## 1. Resumen ejecutivo

**AuditIA** es una plataforma demo en React + Node que muestra cómo la IA puede transformar la práctica
de auditoría interna en cinco espacios funcionales distintos. Fue construida específicamente para una
presentación interna a los **socios y gerentes de Auditoría Interna de Deloitte Chile** el miércoles
27 de mayo de 2026 (audiencia: 4 socios + ~60 managers).

**El demo no usa datos reales** — todos los datasets son sintéticos pero plantados con hallazgos
específicos detectables, para que las consultas a la IA arrojen resultados materiales y narrativos.

**Estado actual:** completamente funcional, build limpio, listo para la demo. Pendiente: probar
exhaustivamente cada killer question contra la API real (durante desarrollo se validó arquitectura
pero la API key se carga desde `.env` local del usuario).

---

## 2. Stack técnico

### Backend
- **Node.js 22+** (requiere `--max-old-space-size=4096` por defensa OOM)
- **Express** servidor HTTP
- **@anthropic-ai/sdk** para llamadas al modelo Claude Sonnet 4.5
- **SSE (Server-Sent Events)** para streaming en chat lateral
- **CORS** habilitado para frontend en puerto separado

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con tokens custom para branding Deloitte
- **Zustand** para state management global (login + espacio activo)
- **Recharts** para visualizaciones cuando AuditIA devuelve SPECs de chart
- **Web Speech API** nativa del navegador (Chrome/Edge) para voz STT + TTS

### Variables de entorno
Crear archivo `.env` en la raíz del proyecto con:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### Comandos
```bash
# Instalación
cd audit-ai-demo
npm install
cd client && npm install && cd ..

# Desarrollo (corre frontend en 5173 + backend en 3001)
npm run dev

# Sólo backend
npm run dev:server

# Sólo frontend (Vite)
cd client && npm run dev

# Build producción
cd client && npm run build
```

---

## 3. Arquitectura

```
audit-ai-demo/
├── server.js                     # Backend Express + SSE + Anthropic SDK
├── package.json                  # Scripts: dev, dev:server, dev:client
├── .env                          # ANTHROPIC_API_KEY (no committed)
└── client/
    ├── vite.config.ts
    ├── tailwind.config.js        # Custom: deloitte-green, deloitte-ink, risk-*, etc.
    ├── tsconfig.json
    ├── public/
    │   └── deloitte-logo.svg     # Logo reemplazable
    └── src/
        ├── App.tsx               # Routing por espacio
        ├── main.tsx              # Sin StrictMode (causaba double-render en SSE)
        ├── index.css             # Custom CSS variables + utilities
        ├── store/
        │   └── useStore.ts       # Zustand: user, espacio
        ├── config/
        │   └── branding.ts       # logoPath, colores
        ├── lib/
        │   └── format.ts         # CLP, num, fmtRUT, fmtDate helpers
        ├── components/
        │   ├── Login.tsx
        │   ├── Sidebar.tsx       # Lista de 5 espacios
        │   ├── Layout.tsx        # Sidebar + Main + ChatPanel lateral
        │   ├── Header.tsx        # Eyebrow + título + meta cards
        │   ├── AlertCard.tsx     # Card de hallazgo (Espacio 2)
        │   ├── KPICard.tsx       # Card de KPI con drill-down opcional
        │   ├── DrillDown.tsx     # Modal de detalle de KPI
        │   ├── Logo.tsx          # SVG render
        │   └── Veritas/          # Chat lateral (carpeta retiene nombre interno)
        │       ├── ChatPanel.tsx
        │       ├── DynamicRenderer.tsx  # Parsea <<<SPEC>>> JSON → React
        │       ├── Markdown.tsx
        │       ├── systemPrompts.ts     # Un prompt por espacio
        │       └── useClaude.ts         # Hook de streaming
        ├── data/
        │   ├── andina.ts                # Espacio 1: 4 archivos P2P
        │   ├── auditHub.ts              # Espacio 2: KPIs continuos
        │   ├── seguimiento.ts           # Espacio 2: planilla 163 hallazgos
        │   ├── compromisos.ts           # Espacio 2: localStorage compromisos
        │   ├── frameworks.ts            # Espacio 3 (legacy)
        │   └── cumplimientoLaboral.ts   # Espacio 4: portuario
        └── views/
            ├── EspacioUno.tsx           # Engagement P2P
            ├── EspacioDos.tsx           # Audit Hub
            ├── EspacioTres.tsx          # Audit Expert (3 tabs internos)
            ├── EspacioCinco.tsx         # Cumplimiento Laboral (id "cinco")
            └── EspacioCuatro.tsx        # Coach de Auditor (id "cuatro")
```

### Convención de naming importante

**Los IDs internos del routing (`cuatro`, `cinco`) NO coinciden con los números visibles en el menú.**
Esto es histórico — al principio el Coach se posicionó como 4to en el sidebar y Cumplimiento Laboral
como 5to, después se reordenaron visualmente pero los IDs se mantuvieron para no romper imports
ni rutas. La fuente de verdad del orden visual está en `Sidebar.tsx`:

```ts
// Orden visual final
ITEMS = [
  { id: "uno",    number: "01", title: "Engagement P2P" },
  { id: "dos",    number: "02", title: "Audit Hub" },
  { id: "tres",   number: "03", title: "Audit Expert" },
  { id: "cinco",  number: "04", title: "Cumplimiento Laboral" },  // id="cinco" pero visible como 04
  { id: "cuatro", number: "05", title: "Coach de Auditor" },      // id="cuatro" pero visible como 05
];
```

**Si reordenás espacios:** cambiá el `number` y el orden del array, mantené los `id` originales.

---

## 4. Branding y diseño

### Colores (en `tailwind.config.js`)
- **Verde Deloitte**: `#86BC25` (deloitte-green), `#6FA01D` (deloitte-greenDark)
- **Negro**: `#0A0A0A` (deloitte-ink, sidebar)
- **Slate**: `#3C3C3C` (deloitte-slate, texto)
- **Mute**: `#6E6E6E` (deloitte-mute, texto secundario)
- **Paper**: `#F7F7F4` (deloitte-paper, background)
- **Line**: `#E5E5E0` (deloitte-line, bordes)
- **Risk**: `#DC2626` (alta), `#F59E0B` (media), `#16A34A` (baja)

### Tipografías
- **Open Sans** para UI
- **Source Serif 4** para títulos serif
- **JetBrains Mono** para datos tabulares, códigos, monoespaciado

### Reemplazar logo
1. Reemplazar `client/public/deloitte-logo.svg` manteniendo el nombre
2. O cambiar `client/src/config/branding.ts` línea `logoPath`
3. Para fondo oscuro del sidebar usar versión blanca del logo

---

## 5. Los 5 espacios

### Espacio 01 — Engagement P2P (Industrias Andina S.A.)

**Concepto:** los 4 archivos típicos de un engagement de Procure-to-Pay + Nómina cruzada, sobre los
que un auditor hace análisis de fraude/control.

**Dataset sintético** (`data/andina.ts`):
- Maestro Proveedores: **1.210** registros
- Órdenes de Compra FY26: **3.493** registros
- Facturas y Pagos FY26: **3.385** registros
- Maestro Empleados: **2.500** registros
- Total facturado: **CLP 26.000 millones**

**14 categorías de hallazgos plantados (números exactos):**

| Severidad | Hallazgo | Cantidad |
|-----------|----------|----------|
| Crítico | Colisión empleado-proveedor (datos bancarios compartidos) | 3 |
| Crítico | Proveedores fantasma (creados <90d, alto monto facturado) | 2 |
| Crítico | Backdating de OCs (factura emitida antes que OC) | 4 |
| Crítico | Pago antes de fecha de factura | 3 |
| Alto | Email personal en transacciones B2B | 3 |
| Alto | Proveedor inactivo reactivado | 1 |
| Alto | Split de aprobación (montos justo bajo umbral) | 12 |
| Alto | Concentración de aprobador en proveedor | 1 |
| Alto | Facturas duplicadas | 2 pares |
| Alto | Empleados que comparten cuenta bancaria | 2 |
| Alto | Sueldos atípicos para cargo | 3 |
| Medio | Facturas pagadas sin OC previa | 23 |
| Medio | Transacciones fin de semana | 8 |
| Medio | Montos redondos sospechosos | 5 |

**UI:** card por archivo + tabla paginada (50/100/250/500 filas) con paginador « ‹ Pág N/M › »
+ chat lateral con 6 killer questions precargadas.

**System prompt** en `systemPrompts.ts` → `systemPromptEspacioUno()`. Contexto JSON serializado de
todos los hallazgos detectados, para que AuditIA responda con números exactos.

---

### Espacio 02 — Audit Hub (continuo, Industrias Andina)

**Concepto:** el portal del CAE (Chief Audit Executive). Dos dimensiones de información:

**A) Planilla de Seguimiento Histórica** (`data/seguimiento.ts`)
- 163 hallazgos FY23-FY26
- 8 procesos, 6 gerencias, 10 personas responsables
- Patrones plantados:
  - Cadena de reiteración TI 2023→2024→2025: HAL-2023-005 → HAL-2024-018 → HAL-2025-022 (todos sobre cuentas de ex-empleados activas — patrón crónico)
  - Carlos Robles sobrecargado con 10 compromisos abiertos
  - 7 críticos abiertos hace más de 180 días
  - Gerencia Legal 50% cumplimiento + Tecnología 58% (las peores)

**B) KPIs continuos P2P** (`data/auditHub.ts`)
- 5 tarjetas superiores **clickeables con drill-down modal** (`components/DrillDown.tsx`):
  - Abiertos / Vencidos / Críticos / Reiterados / Cumplimiento

**Funcionalidad "Mi plan de auditoría"** (`data/compromisos.ts`)
- Cada AlertCard de Hallazgos Activos tiene botón **"+ Generar compromiso"**
- Al click: genera COM-2026-XXXXX con responsable + plazo según severidad (60/90/180 días)
- **Persiste en localStorage** — sobrevive al refresh
- Aparecen al tope del Hub en sección "Mi plan de auditoría"
- Botón × inline para eliminar

**System prompt:** combina contexto del Hub + Seguimiento. Total contexto ~3.5K tokens.

---

### Espacio 03 — Audit Expert (planificación + consulta)

**Concepto:** asistente experto con acceso a marcos regulatorios. Dos tabs internos:

**Tab A — Consulta experta CON VOZ** (componente `TabConsulta` en `EspacioTres.tsx`)
- Web Speech API nativa (Chrome/Edge). Reconocimiento `es-ES`, respuesta hablada con `SpeechSynthesis`.
- Si input vino por voz, system prompt pide respuesta más corta (máx 4 oraciones, sin markdown)
- Toggle 🔊/🔇 en header
- **Web search a IAI España** (auditoresinternos.es) — la "Fábrica de Pensamiento"
- 6 preguntas frecuentes precargadas

**Tab B — Generar plan de auditoría** (componente `TabGenerar`)
- Form: Organización + Sector + Tipo + Briefing + (opcional) Contexto
- AuditIA devuelve JSON estructurado con:
  - Resumen ejecutivo
  - Objetivos (máx 4)
  - Alcance (incluye + excluye)
  - Riesgos clave (Alto/Medio/Bajo)
  - Metodología
  - Fases con cronograma
  - Recursos (equipo, herramientas, estimación de horas)
  - **Papeles de trabajo codificados** (PT-01...PT-05) con evidencia esperada
  - Entregables
  - Fuentes IAI consultadas

**Nota:** Antes existía un tercer tab "Evaluar Plan" que fue removido por decisión del usuario en
una iteración. El componente `TabEvaluar` y `EvalResult` siguen en el archivo como código muerto
(no referenciado en el JSX) — pueden eliminarse en un cleanup futuro.

**Sin chat lateral:** este espacio tiene su propio chat interno (no usa `ChatPanel`).

---

### Espacio 04 — Cumplimiento Laboral & Sindical ⭐ ANCLA NARRATIVA

**Cliente ficticio:** Empresa Portuaria Pacífico S.A. — operador portuario multi-puerto (Valparaíso,
San Antonio, Mejillones, Coronel).

**El caso clave del demo.** Combina datos ESTRUCTURADOS + datos NO ESTRUCTURADOS + normativa +
multas históricas.

**Dataset sintético** (`data/cumplimientoLaboral.ts`):
- 810 trabajadores
- 16.480 turnos analizados (oct 2025 – mar 2026)
- 8 sindicatos
- 41 convenios (8 vigentes + 33 históricos)
- 15 multas DT (394 UTM acumulados, 2022-2026)
- 8 ítems de normativa (Código del Trabajo, Convenios OIT, Código ISPS, NCG 401)

**7 hallazgos detectables sobre el 100% del universo:**

| # | Hallazgo | Cantidad | Normativa |
|---|----------|----------|-----------|
| 1 | Turnos S03 exceden 10h (convenio máx) | 23 turnos | Convenio S03 + CT Art. 22 |
| 2 | Descanso entre jornadas < 7h | ~24 pares | CT Art. 38 (mín 12h) |
| 3 | Bono dominical mal calculado (1.50x vs 1.75x convenio) | 14 turnos | CT Art. 348, impacto CLP 378.000 |
| 4 | Sin certificación OIT-137 vigente en muelle internacional | 62 trabajadores | OIT C-137 + Código ISPS |
| 5 | Sobre-jornada semanal sostenida en Coronel | 6 trabajadores | CT Art. 22 |
| 6 | Turnos S04 fusionado con cláusulas viejas | 9 turnos | CT Art. 348 |
| 7 | S03 reincidente en multas DT | 5 multas, 122 UTM | Histórico DT 2022-2026 |

**Gancho narrativo principal (decirlo al abrir el espacio):**
> "Auditoría tradicional tomaría muestra de 8 convenios sobre 46 y revisaría ~100 turnos sobre 16.000+.
> AuditIA cruza el 100% del universo de turnos contra TODOS los convenios + el Código del Trabajo +
> los Convenios OIT + el histórico de multas DT. **Pasamos de revisar el 0,6% al revisar el 100%.**"

**Punch line al cierre:**
> "Es el caso que más sintetiza el cambio. No era posible que un auditor lea 46 convenios sindicales
> en un mes ni que pruebe 16.000 turnos contra cada uno. La IA lo hace en segundos. Y los hallazgos
> son materiales: contingencias laborales acumuladas, riesgo de pérdida de habilitación internacional,
> sanciones reincidentes que el muestreo no detectaría. **El mismo motor sirve después para contratos
> de proveedores, pagarés vs cartera, contratos comerciales — cambia el dataset, no la lógica.**"

**UI:**
- Header con KPIs "tradicional vs AuditIA" (8/46 convenios → 46 cruzados, ~100 turnos → 16.480 universo)
- 5 cards de archivos clickeables con etiqueta `estructurado` vs `NO estructurado`
- Tabla paginada por archivo
- Sección de 7 HallazgoCards por severidad (crítica/alta/media)
- Mensaje educativo al pie con el gancho narrativo

---

### Espacio 05 — Coach de Auditor

**Concepto:** ayuda a un auditor a preparar reuniones difíciles con stakeholders sobre hallazgos
de auditoría.

**State machine de 3 modos:** `setup` → `briefing` | `roleplay`

**Setup form** (`SetupForm` en `EspacioCuatro.tsx`):
- Perfil del stakeholder:
  - Nombre (opcional)
  - Cargo (10 opciones: CFO, CTO, Gerente Compras, etc.)
  - Personalidad: cooperativo / defensivo / escéptico / agresivo
  - Contexto adicional
- Tu objetivo en la reunión
- Lista dinámica de hallazgos a presentar (severidad: Crítica/Alta/Media)

**Modo Briefing** (`BriefingView`)
- Genera markdown con 7 secciones:
  1. Lectura del stakeholder
  2. Apertura sugerida (frase concreta)
  3. Cómo presentar los hallazgos
  4. Objeciones probables con respuesta ("Si dice X → respondes Y")
  5. Frases que SÍ funcionan
  6. Frases que evitar (con ❌)
  7. Cierre de la reunión
- Output rico, ~400 palabras, formato editorial

**Modo Roleplay** (`RoleplayView`) — **el más sofisticado**

- El sistema **interpreta al stakeholder** con personalidad consistente (system prompt `SYS_ROLEPLAY`)
- Pitch de voz ajustado: más grave si agresivo, más cálido si cooperativo
- Voz: mic input (es-ES) + TTS response del stakeholder
- Toggle 🔊 voz ON/OFF

**Pistas del coach en tiempo real** (lo último que se construyó):
- Después de cada respuesta del stakeholder, **segunda llamada en paralelo** al backend con
  `SYS_COACH_HINTS` que devuelve JSON `{lectura, siguiente_movimiento, frase_sugerida, alerta?}`
- Las pistas aparecen **debajo de cada burbuja del stakeholder** en panel ámbar diferenciado
  (componente `CoachHintCard` al final del archivo)
- **NO se leen por voz** — son texto para reflexionar
- Toggle 💡 "Pistas ON/OFF" en header del Roleplay
- Cada turno hace 2 llamadas a la API (stakeholder + coach) → ligeramente más lento

**Sin chat lateral** (igual que Espacio 3).

---

## 6. AuditIA — el asistente

### Naming history
Originalmente se llamaba **"Veritas"**. En una iteración mid-development se renombró a **"AuditIA"**
en toda la UI visible. La carpeta `client/src/components/Veritas/` retuvo el nombre interno por
costo de refactor — no afecta funcionalidad, sólo es nombre de carpeta y filename de archivos
fuente. Si querés alinearlo, hay que renombrar la carpeta + actualizar imports.

### System prompts
Cada espacio tiene su system prompt en `client/src/components/Veritas/systemPrompts.ts`:
- `systemPromptEspacioUno()` — Engagement P2P, contexto de Industrias Andina
- `systemPromptEspacioDos()` — Audit Hub, contexto de KPIs + seguimiento
- `systemPromptEspacioTres()` — Audit Expert, contexto de frameworks (legacy, ahora reemplazado por web_search)
- `systemPromptEspacioCinco()` — Cumplimiento Laboral, contexto del cliente portuario

Todos los prompts incluyen `AUDITIA_PERSONA` (top del archivo) que define tono, formato y reglas de
concisión.

### Formato de visualizaciones embebidas
Cuando AuditIA quiere mostrar un chart o tabla, devuelve un bloque:

```
<<<SPEC>>>
{
  "kind": "table" | "bar" | "line" | "area" | "pie" | "kpi",
  "title": "...",
  "data": [...],
  "xKey": "...",
  "yKey": "..." | [...],
  "format": "money" | "percent" | "number",
  "note": "..."
}
<<<END_SPEC>>>
```

Lo parsea `DynamicRenderer.tsx` → renderea con Recharts. Tablas se truncan a 50 filas para evitar OOM.

---

## 7. Defensas técnicas críticas aplicadas

Estas decisiones se tomaron iterativamente resolviendo bugs reales durante desarrollo. **Mantenerlas
todas** o entender por qué existen antes de removerlas.

### Problema 1: OOM en navegador durante streaming largo

**Causa:** cada chunk del stream disparaba un re-render que re-parseaba todo el markdown acumulado.
Para una respuesta de 2000 chars en 150 chunks, eso son 150 parsings del texto creciente.

**Defensas activas:**

1. **Throttle de `setStreamText`** a máximo 1 update cada 150ms en `useClaude.ts`
2. **Durante streaming: texto plano sin markdown** en `ChatPanel.tsx` (`whiteSpace: pre-wrap`). El
   parseo de markdown sólo ocurre una vez al final, cuando el mensaje pasa a `history`.
3. **SPECs durante streaming se muestran como placeholder** `[generando visualización...]`
4. **DynamicRenderer memoizado** — sólo recalcula cuando cambia el texto o `streamingMode`
5. **Cap de 50 filas en tablas** dentro del SPEC parser
6. **`--max-old-space-size=4096`** en el script `dev:server` (heap Node a 4GB)
7. **Historial truncado a últimas 4 entradas** enviadas al backend (la UI mantiene full history)
8. **maxTokens = 2048** en chat lateral (antes 4096)
9. **System prompts con instrucción de concisión extrema** (6-10 líneas + 1 tabla máx 15 filas)

### Problema 2: Errores de API en español

`server.js` traduce errores comunes:
- `overloaded` → "El servicio está saturado. Reintenta en unos segundos."
- `rate limit` → "Demasiadas consultas. Espera un momento."
- `timeout` → "La generación tomó demasiado..."

### Problema 3: Node 25 quirk con SSE

El cliente puede cerrar la conexión sin que `res.on("close")` se dispare. La solución es enviar
**heartbeats cada 3 segundos** durante streaming para detectar desconexión.

### Problema 4: Race condition en useClaude cache

Versión anterior usaba closure stale para detectar primer chunk. Solución: `receivedFirstChunkRef`
en lugar de variable local.

### Problema 5: Detección de AbortError

Variantes detectadas: `AbortError`, `message=Aborted`, `code=ABORT_ERR`. Helper `isAbortError()`
en `useClaude.ts`.

### Problema 6: StrictMode causaba double-render

`main.tsx` NO usa `<StrictMode>` — se removió porque duplicaba las llamadas a SSE en desarrollo.

---

## 8. Voz (Web Speech API)

### Soporte
- ✅ Chrome y Edge en desktop
- ❌ Firefox y Safari (botón mic se oculta automáticamente con `voiceSupported = false`)

### Componentes con voz
- **Espacio 3 / Tab Consulta** → STT + TTS
- **Espacio 5 / Coach Roleplay** → STT + TTS con pitch ajustado por personalidad

### Patrón de uso
```ts
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const r = new SR();
r.lang = "es-ES";
r.continuous = false;
r.interimResults = true;
// ... handlers onstart, onresult, onerror, onend
```

### Limpieza de texto para TTS
Antes de pasar a `SpeechSynthesisUtterance`:
- Remover emojis (`📄`, etc.)
- Remover markdown (`**`, `*`, `` ` ``, `#`)
- Remover bloques SPEC
- Limpiar caracteres tipográficos (`›`, `●`, `→`)
- Cap a 1200 chars

### Voz en español
```ts
const voices = window.speechSynthesis.getVoices();
const esVoice = voices.find((v) => v.lang.startsWith("es") && v.localService)
             || voices.find((v) => v.lang.startsWith("es"));
```

---

## 9. Backend (`server.js`)

### Endpoints

**`POST /api/chat`** — SSE para streaming
```json
{
  "messages": [...],
  "system": "...",
  "maxTokens": 2048,
  "tools": [{ "type": "web_search_20250305", "name": "web_search", "max_uses": 3 }]
}
```
Devuelve eventos SSE:
- `event: chunk` con `data: {"text": "..."}`
- `event: done`
- `event: error` con `data: {"message": "..."}`

**`POST /api/generate`** — One-shot, no streaming. Usado por:
- Audit Expert / Generar Plan (JSON estructurado)
- Coach / Briefing (markdown)
- Coach / Roleplay turn (texto plano)
- Coach / Hints (JSON estructurado)

**`GET /health`** — healthcheck `{"ok": true, "model": "claude-sonnet-4-5", "ts": ...}`

### Modelo usado
```js
const MODEL = "claude-sonnet-4-5";
```

### Implementación SSE
- Usa `messages.create()` sin stream nativo del SDK
- Hace **manual chunking del texto completo** para simular streaming (~80 chars por chunk con delay)
- Esto se hizo así porque al inicio el cliente Anthropic tenía issues con SSE en Node 25
- Si se actualiza el SDK, se puede migrar a streaming nativo

---

## 10. El demo en sí (cheat sheet de presentación)

### Audiencia
- **Wednesday May 27, 2026** · presentación interna Deloitte Chile
- 4 socios de Auditoría Interna: **Jaime, Pame, Daniel, Fernando**
- ~60 gerentes y managers de auditoría

### Tiempo total: ~35 min + 15 min Q&A

| # | Espacio | Tiempo | Foco |
|---|---------|--------|------|
| 1 | Login + Sidebar | 1 min | Visión general |
| 2 | Espacio 01 — Engagement P2P | 10 min | Killer questions sobre fraude |
| 3 | Espacio 02 — Audit Hub | 8 min | Planilla + KPIs + Compromisos + Drill-downs |
| 4 | **Espacio 04 — Cumplimiento Laboral** ⭐ | 7 min | Ancla narrativa: 0,6% → 100% |
| 5 | Espacio 05 — Coach (solo Briefing) | 3 min | Como cierre emocional |
| 6 | Espacio 03 — Audit Expert | 3 min | Demostrar plan generation |
| 7 | Q&A | 15 min | Incluye Roleplay del Coach con pistas si preguntan |

### Killer questions principales por espacio

**Espacio 01:**
1. ¿Hay proveedores que compartan datos bancarios con empleados?
2. Encuéntrame OCs con backdating
3. ¿Algún aprobador concentra el gasto a un proveedor de forma anómala?
4. Proveedores creados últimos 90 días con facturación >CLP 10M
5. Empleados con cuenta compartida o sueldos atípicos
6. Dame los hallazgos prioritarios

**Espacio 02:**
1. ¿Qué hallazgos se reiteran año a año? (apunta a la cadena TI 2023-2025)
2. Áreas con peor cumplimiento (Legal 50%, TI 58%)
3. Críticos abiertos hace más de 180 días (7 casos)
4. Hay responsables sobrecargados (Carlos Robles con 10)

**Espacio 03 / Consulta:**
- ¿Cómo auditar IA según el IAI España? (web_search en vivo a auditoresinternos.es)
- (Por voz) ¿Cuáles son las NGAI?

**Espacio 04 / Cumplimiento:**
1. Cruza turnos vs convenios → 23 exceden 10h del S03
2. Trabajadores en muelle internacional sin OIT-137 → 62 casos
3. Descanso entre jornadas < 12h → 24 pares
4. Bono dominical mal calculado → 14 turnos, CLP 378.000, reincidencia 2023/24/25
5. Sindicatos reincidentes en multas → S03 con 5 multas, 122 UTM
6. Inconsistencias entre sistemas → 9 turnos S04 fusión

### Notas operativas

- **Puerto 3001 default.** Si está ocupado en Windows:
  ```
  netstat -ano | findstr :3001
  taskkill /PID X /F
  ```
- **Demo requiere `ANTHROPIC_API_KEY` en `.env`** — no se incluye en el ZIP
- **Voz solo en Chrome/Edge** — recomendar abrir demo en Chrome
- **Primera vez que se usa mic:** el navegador pide permiso. Aceptarlo antes de la demo en vivo para que el popup no aparezca durante presentación.

---

## 11. Pendientes y mejoras posibles

### Pendiente crítico para validar
- [ ] **Probar cada killer question** contra la API real al menos una vez antes de la demo, para
      asegurar que el modelo responde con los números esperados. Especialmente Espacio 04 que es el
      más nuevo y no se ha rodado.
- [ ] **Verificar respuestas del Coach Hints en Roleplay** — la generación es JSON, el parser tiene
      fallback de reparación pero conviene validar empíricamente.

### Mejoras de bajo costo
- [ ] Cleanup: eliminar funciones muertas `TabEvaluar` y `EvalResult` en `EspacioTres.tsx`
- [ ] Cleanup: eliminar carpeta `Veritas/` renombrándola a `Chat/` o `AuditIA/`
- [ ] Manual chunking del SSE: migrar al streaming nativo del SDK Anthropic cuando se valide estable
- [ ] Internacionalizar strings (actualmente todo hardcoded en español)
- [ ] Tema oscuro

### Mejoras de mayor costo
- [ ] Code splitting (actualmente el bundle es ~790KB)
- [ ] Tests E2E con Playwright para las killer questions
- [ ] Backend con persistencia real (actualmente compromisos en localStorage)
- [ ] Autenticación real (actualmente cualquier usuario logea con cualquier credencial)

### Casos clientes futuros
La arquitectura permite agregar más espacios fácilmente. Patrón:
1. Crear `client/src/data/nuevoCaso.ts` con dataset sintético + función `buildXXXContext()`
2. Crear `client/src/views/EspacioN.tsx` siguiendo patrón de los existentes
3. Agregar al `Sidebar.tsx` y `App.tsx`
4. Si usa chat lateral, agregar `systemPromptEspacioN()` en `systemPrompts.ts` y killer questions en
   `Layout.tsx` → `KILLERS`

Casos pre-discutidos que podrían sumarse:
- **Contratos comerciales con clientes/proveedores** — mismo motor de cumplimiento laboral pero
  para contratos comerciales (clausulado vs ejecución)
- **Pagarés vs cartera** — arqueo cruzando documento físico (PDF) con base de datos
- **Realidad aumentada para inventarios** — descartado para web, requiere hardware específico

---

## 12. Decisiones de diseño no obvias

Cosas que parecen "raras" en el código pero tienen razones:

1. **`useStore.ts` con Zustand pero sin persist:** intencional. La sesión se pierde al refresh porque
   queremos que el demo siempre arranque desde Login. Excepción: compromisos del Espacio 2 sí
   persisten en localStorage por separado.

2. **`main.tsx` SIN `<StrictMode>`:** double-render rompía SSE en desarrollo.

3. **Carpeta `Veritas/` se mantiene a pesar del rename a AuditIA:** evita rebreakage de imports a
   esta altura del proyecto. Renombrar antes del demo no aporta valor.

4. **`Espacio cuatro` con id `cuatro` está visible como número 05:** ver sección 3, "Convención de
   naming importante".

5. **El `EspacioCuatro.tsx` (Coach) y `EspacioCinco.tsx` (Cumplimiento) intercambian visualmente sus
   posiciones en el menú:** el reorden visual se hizo en último momento.

6. **El system prompt del Coach Hints es muy estricto con JSON-only:** porque el frontend lo parsea
   con un extractor de JSON. Si el modelo añade prosa antes/después, hay reparación pero puede fallar.

7. **Tablas truncadas a 50 filas en SPEC:** crítico para OOM. NO incrementar este número.

8. **`maxTokens` distintos por endpoint:**
   - Chat lateral: 2048 (concisión)
   - Audit Expert / Plan: 4000 (estructura rica)
   - Coach Briefing: 1500 (~400 palabras)
   - Coach Roleplay turn: 400 (corto, conversacional)
   - Coach Hints: 400 (JSON breve)

---

## 13. Cómo continuar el desarrollo

### Si recibís este proyecto

1. **Clonar y levantar:**
   ```bash
   unzip audit-ai-demo.zip
   cd audit-ai-demo
   npm install
   cd client && npm install && cd ..
   echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
   npm run dev
   ```

2. **Probar las 5 vistas** navegando por el sidebar. Hacer al menos una killer question por espacio.

3. **Leer estos archivos en orden:**
   - `server.js` (210 líneas) — entender el backend
   - `client/src/store/useStore.ts` (chiquito) — entender el state
   - `client/src/App.tsx` y `Layout.tsx` — entender el routing
   - `client/src/components/Veritas/useClaude.ts` — entender el streaming
   - `client/src/components/Veritas/systemPrompts.ts` — entender cómo se le da contexto al modelo
   - Un Espacio simple (`EspacioUno.tsx`) — entender el patrón de las vistas
   - El más complejo (`EspacioCuatro.tsx` — Coach) — entender el state machine + voz + hints

4. **No tocar las defensas técnicas de la sección 7 sin entenderlas primero.**

### Cómo agregar una killer question nueva
Editar `client/src/components/Layout.tsx` → `KILLERS[espacio]` y agregar el string al array.

### Cómo cambiar el dataset de un espacio
Editar el archivo correspondiente en `client/src/data/`. Mantener la estructura exportada (los
prompts dependen de los nombres de propiedades en `buildXXXContext()`).

### Cómo cambiar la persona/tono de AuditIA
Editar `AUDITIA_PERSONA` al top de `systemPrompts.ts`.

### Para producción real (no demo)
Sería necesario:
1. Reemplazar todos los datasets sintéticos por integración real con sistemas del cliente
2. Implementar autenticación real (Azure AD / SSO Deloitte)
3. Backend con base de datos para persistencia
4. RBAC: distintos socios ven distintos clientes
5. Logging y auditoría de todas las consultas a la IA
6. Compliance con políticas de Deloitte sobre uso de IA

---

## Contacto y contexto histórico

Este proyecto fue iniciado por **Francisco Pecorella** (Director Deloitte Digital Chile, lidera la
práctica T&T) en preparación para una presentación al equipo de Auditoría Interna de Deloitte Chile.

El desarrollo se hizo en sesiones iterativas a lo largo de varios días previos a la demo, con
Francisco proporcionando feedback de cada iteración y refinando casos basados en conversaciones con
otros líderes de la práctica (Pame, otra colega que sugirió el caso del Coach + reordenamiento del
menú).

El estado actual representa la versión funcional final para la demo del miércoles 27 de mayo de 2026.
