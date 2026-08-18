# AuditIA — Demo SAAM Towage Chile

Demo de auditoría interna con IA adaptada a SAAM (remolcadores portuarios).
Un solo portal · 6 espacios · AuditIA presente como copiloto en los espacios de datos.

```
┌─────────────────────────────────────────────────────────────────┐
│ ESPACIO 01  Pagos a Proveedores — bunkering, astilleros, P2P    │
│ ESPACIO 02  Monitoreo Continuo — indicadores y seguimiento      │
│ ESPACIO 03  Audit Expert — marcos y normativa                   │
│ ESPACIO 04  Gastos y Rendiciones — traslados y viáticos         │
│ ESPACIO 05  Remuneraciones y Dotación — nómina vs. bitácora     │
│ ESPACIO 06  Coach de Auditor — preparación de reuniones         │
└─────────────────────────────────────────────────────────────────┘
```

Todos los datos son **sintéticos**. Ningún dato real de SAAM fue utilizado.
El logo debe colocarse en `client/public/logo-saam.png`.

---

## Setup (< 5 minutos en Windows o Mac)

### Requisitos previos
- Node.js 22 LTS o superior (probado en 22, 24 y 25)
- API key de Anthropic ([console.anthropic.com](https://console.anthropic.com))

### Instalación

```bash
# 1. Instala dependencias (raíz + cliente en un solo comando)
npm run install:all

# 2. Copia el archivo de configuración
cp .env.example .env

# 3. Edita .env y pega tu ANTHROPIC_API_KEY
#    En Windows: notepad .env
#    En Mac:     open -e .env

# 4. Arranca todo (backend + frontend)
npm run dev
```

Luego abre [http://localhost:5173](http://localhost:5173) en el navegador.

### En Windows con OneDrive

Si tu carpeta `audit-ai-demo` está dentro de OneDrive, OneDrive a veces bloquea
archivos durante la instalación. Recomendado: copiar a `C:\dev\audit-ai-demo`
antes de instalar.

---

## Configuración (.env)

```bash
ANTHROPIC_API_KEY=sk-ant-...            # Requerido
ANTHROPIC_MODEL=claude-sonnet-4-5       # Opcional. Otras: claude-opus-4-7
PORT=3001                               # Opcional. Backend.
```

**Recomendación de modelo para esta demo:**
- `claude-sonnet-4-5` — balance velocidad / costo / calidad. Default.
- `claude-opus-4-7` — máxima calidad para el día del demo. Más lento, más caro.

---

## Estructura del proyecto

```
audit-ai-demo/
├── server.js                # Express + SSE + Anthropic SDK
├── package.json             # Scripts del monorepo
├── .env                     # API key (no commitear)
└── client/                  # React 18 + Vite + TypeScript
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Layout.tsx       # Sidebar + main + chat colapsable
        │   ├── Sidebar.tsx
        │   ├── Login.tsx
        │   └── Veritas/         # Toda la lógica del asistente
        ├── views/
        │   ├── EspacioUno.tsx   # Engagement P2P
        │   ├── EspacioDos.tsx   # Audit Hub
        │   └── EspacioTres.tsx  # Copiloto regulatorio
        ├── data/
        │   ├── andina.ts        # Universo Industrias Andina (sintético)
        │   ├── auditHub.ts      # KPIs continuos
        │   └── frameworks.ts    # 7 marcos + 6 riesgos emergentes
        └── store/useStore.ts    # Zustand
```

---

## Cómo funciona Veritas (técnico)

1. **Frontend** envía mensajes a `POST /api/chat` por SSE.
2. **Backend** llama a `messages.create()` de Anthropic (no-stream).
3. Backend hace **fake-streaming** chunkeando la respuesta palabra por palabra
   y emitiéndolas vía SSE. Esto resuelve un problema observado de inestabilidad
   del streaming nativo del SDK en Node 25 bajo ciertas condiciones.
4. **System prompt** es específico por Espacio: inyecta los datos relevantes
   (Industrias Andina / KPIs del Hub / marcos regulatorios) como contexto JSON.
5. **DynamicRenderer** detecta bloques `<<<SPEC>>>...<<<END_SPEC>>>` en la
   respuesta de Veritas y renderiza gráficos Recharts al vuelo (tablas, bar,
   line, pie, area, kpi cards). Nunca usa `eval`.

---

## Troubleshooting

### "Error: Falta ANTHROPIC_API_KEY"
Verifica que `.env` exista en la raíz y que la variable esté bien escrita.
Reinicia el servidor (`Ctrl+C` y `npm run dev` de nuevo).

### "Connection refused" en el chat
El backend probablemente no arrancó. Mira la terminal: tiene que decir
`●  Audit AI Demo — Veritas backend  http://localhost:3001`.

### El chat se queda "pensando" indefinidamente (Node 25 only)
Caso conocido. El servidor ya usa `res.on("close")` (no `req.on("close")`) y
fake-streaming. Si aun así pasa: cierra el navegador, recarga, intenta de nuevo.
Si persiste, usa Node 22 LTS.

### Recharts dice "ResponsiveContainer: width(0) and height(0)"
Pasa solo si el contenedor padre no tiene altura. La demo ya lo maneja, pero si
modificas el layout asegúrate que el card padre tenga altura definida.

### "Failed to parse SPEC block"
Veritas a veces emite SPEC malformado. El renderer lo silencia (no rompe la UI).
Si pasa mucho con un modelo dado, considera bajar la temperatura o forzar
`claude-sonnet-4-5` por estabilidad.

---

## Flujo del demo en vivo (sugerido)

**Tiempo total**: 25 minutos demo + 15 minutos Q&A

| Min | Espacio | Acción |
|---|---|---|
| 0–3 | Intro | Login. Mostrar que cada perfil entra al mismo portal con el mismo Veritas. |
| 3–12 | 01 | Mostrar los 4 archivos. Lanzar 3 preguntas killer (ver cheatsheet). Foco: colisión empleado-proveedor (el "wow"). |
| 12–20 | 02 | Mostrar dashboard. Mover el simulador en vivo. Lanzar 2 preguntas: evolución de excepciones + simulación de +20% rotación. |
| 20–25 | 03 | Pedirle a Veritas el plan anual de auditoría 2026 para seguros. Mostrar que cruza marcos. |
| 25–40 | Q&A | Preguntas de los socios. |

Ver `DEMO_CHEATSHEET.md` para las 15 preguntas y respuestas esperadas.

---

## Branding

La paleta visual se rige por `client/src/config/branding.ts`. Para rebrandear:
1. Reemplaza `client/public/deloitte-logo.svg`.
2. Edita los colores en `branding.ts` y `tailwind.config.js`.
3. Reemplaza la frase de marca en `Login.tsx`.

---

## Notas finales

- **Privacidad**: los datos de Industrias Andina son 100% sintéticos. Los marcos
  regulatorios son resúmenes de estructura pública (no reproducen texto literal).
- **Modelo**: por defecto `claude-sonnet-4-5`. Cambiable en `.env`.
- **No reemplaza juicio profesional**: el demo lo aclara en cada Espacio y
  Veritas lo refuerza en sus respuestas.

© 2026 Deloitte — Uso interno

---

## Arquitectura multi-industria

```
src/
  packs/           ← todo lo que cambia entre clientes
    types.ts       contrato de un IndustryPack
    maritimo.ts    remolcadores portuarios
    medios.ts      televisión
    index.ts       registro + overrides del Admin
  engine/
    p2p.ts         motor Procure-to-Pay — no menciona ningún cliente
```

El motor genera el universo, planta los 14 hallazgos y los detecta. El pack
aporta cargos, razones sociales, categorías de gasto y los nombres de los casos
plantados. Ambos packs producen exactamente los mismos 14 hallazgos.

**Para agregar una industria:** copiar `packs/maritimo.ts`, cambiar el
vocabulario y registrarlo en `packs/index.ts`. No se toca el motor.

**Admin** (⚙ al pie del menú): cambia el pack, el nombre del cliente y el logo.
Aplicar recarga la app, porque los datasets se generan al cargar los módulos.

Espacios 02, 04 y 05 todavía tienen su vocabulario embebido en `src/data/`.
Migrarlos al mismo patrón es el paso siguiente.
