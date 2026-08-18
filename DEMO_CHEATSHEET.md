# Audit AI Demo Series — Cheatsheet de demo

**Audiencia:** Jaime, Pame, Daniel, Fernando — partners de Auditoría Interna Deloitte Chile  
**Duración objetivo:** 25 min demo + 15 min Q&A  
**Fecha:** miércoles 27 de mayo, 2026  
**URL local:** http://localhost:5173 (después de `npm run dev`)

---

## Insights de la conversación previa con Pame (validados con auditoría interna)

Lo que ella enfatizó y ahora está reflejado en la demo:

1. **Lo más importante para un gerente de auditoría es la planilla de seguimiento de hallazgos.** *"Esto es como la vida de los gerentes de auditoría interna, porque con esto los miden — son sus KPIs"*. → **Por eso el Espacio 2 ahora lidera con la planilla de seguimiento histórica.**

2. **El proceso de compra es transversal a todas las industrias** (minería, banca, retail). → **Por eso Espacio 1 sigue siendo P2P + Nómina.**

3. **Los auditores revisan más "incumplimiento de procesos" que anomalías puntuales.** Ejemplo: política dice pagar en 30 días, ¿cuántas pasaron de 30? → **El Hub tiene KPI de "días pago vs término".**

4. **Hallazgos típicos que ellos buscan** (todos ya plantados): aprobación fuera de matriz, sin OC previa, monto aprobado mayor al permitido, facturación duplicada.

5. **La audiencia son 60 gerentes de auditoría interna**. Son preguntones por oficio — anticipar el Q&A.

---

## El ancla narrativa — la frase a repetir

> **"Pasamos del muestreo del 0,2% al testing del 100% del universo."**

La auditoría tradicional, por costos y tiempo, prueba 60–100 transacciones de una muestra estadística. Si el fraude está fuera de la muestra, el auditor nunca lo ve. **Veritas analiza el 100% del universo en segundos.**

El dataset de Industrias Andina S.A.:
- **2.500 empleados** · 1.210 proveedores · 3.493 OCs · 3.385 facturas
- **CLP 26B** facturados en el período
- Una muestra MUS típica habría revisado ~80 facturas (2,4%)
- Veritas las revisa **todas**

---

## Flujo de demo sugerido (25 min)

### 1. Login + Sidebar (1 min)
- Mostrar los 3 espacios en la barra negra: Engagement, Audit Hub, Copiloto Regulatorio
- Mencionar que **Veritas** (chat lateral) está presente en los 3 espacios y mantiene el contexto

### 2. Espacio 1 — Engagement P2P + Nómina (10 min)

**Apertura (2 min):**
- Mostrar header: "Industrias Andina S.A. · 2.500 empleados · 1.200 proveedores · 4 plantas"
- Mostrar los 4 archivos: Maestro de Proveedores, OCs, Facturas/Pagos, Maestro de Empleados
- Click en cada archivo para ver el preview con datos reales

**Las 6 preguntas killer (8 min):**

Click la primera, esperar respuesta, comentar. Después click la 2da. Etc.

> **1. ¿Hay proveedores que compartan datos bancarios con empleados?**  
> Veritas detecta 3 proveedores activos cuya cuenta bancaria coincide con un empleado del área de Compras, Logística y Finanzas respectivamente. Patrón consistente con conflicto de interés no declarado.

> **2. Encuéntrame OCs con backdating: facturas emitidas antes de su orden de compra.**  
> 4 facturas con fecha anterior a la fecha de su OC. La compra existió antes que la autorización — la OC se generó para regularizar. Identificar al aprobador y verificar patrón.

> **3. ¿Algún aprobador concentra el gasto a un proveedor específico de forma anómala?**  
> 1 proveedor (CLP ~116M anuales) tiene el 94% de sus OCs aprobadas por un solo usuario. Violación clara de segregación de funciones.

> **4. Muéstrame proveedores creados en los últimos 90 días que ya hayan facturado más de CLP 10M.**  
> 2 proveedores creados hace 53 y 78 días, ya con CLP 18,5M y CLP 24,2M facturados sin OC previa. Proveedores fantasma clásicos.

> **5. ¿Hay empleados que compartan cuenta bancaria entre sí o sueldos atípicos para su cargo?**  
> 2 empleados de Operaciones con cuenta idéntica (BCI 33445566). 3 empleados con sueldo > 2x el promedio de su cargo (analistas/asistentes recién contratados ganando CLP 4,9M–6,2M).

> **6. Dame los hallazgos prioritarios de control sobre este universo.**  
> Veritas hace un resumen ejecutivo de los 14 hallazgos plantados, priorizados por severidad. Cierre del espacio.

**Punch line al cierre del Espacio 1:**
> "Lo que acabo de hacer en 5 minutos sobre el 100% del universo equivale a 4 semanas de un equipo de 3 personas haciendo muestreo manual. Y la muestra habría omitido al menos 10 de estos 14 hallazgos por probabilidad estadística."

### 3. Espacio 2 — Audit Hub / Tablero de seguimiento (10 min)

Este espacio cambió mucho. Ahora tiene **DOS dimensiones**:
- Arriba: **Planilla de seguimiento histórica** (4 años de hallazgos, todos los procesos) — *esto es el "corazón" de auditoría interna que Pame mencionó*
- Abajo: **Indicadores P2P continuos** (lo que ya estaba antes)

**Apertura del espacio (1 min):**
> "Esto es la planilla de seguimiento que cualquier gerente de auditoría reconoce. Industrias Andina lleva 4 años, 163 hallazgos, todos los procesos. Lo que en su día a día son tablas dinámicas y horas de trabajo manual, acá se actualiza solo y Veritas lo lee entero."

Mostrar los 5 KPI cards arriba: 58 abiertos, 48 vencidos (83%), 11 críticos, 4 reiterados, 64% cumplimiento global.

**Lo que tiene que destacar visualmente (2 min):**
- Gráfico de tendencia anual de severidad: críticos crecen 2→10→11→10 (proyección)
- Cumplimiento por área: Tecnología y Legal abajo del 60%, Compras 68%
- Tabla de 7 críticos abiertos hace >180 días (uno hace 833 días — más de 2 años)
- 2 responsables sobrecargados (Carlos Robles 10 compromisos, Andrea Pino 8)
- Bloque inferior con los 4 hallazgos reiterados

**Killer questions para la planilla (5 min):**

> **1. ¿Qué hallazgos se me están reiterando año a año sin cerrarse?**  
> Veritas debe identificar los 4 reiterados, en particular la cadena HAL-2023-005 → HAL-2024-018 → HAL-2025-022 sobre cuentas de ex-empleados activas. Es el mismo hallazgo crítico de TI repitiéndose 3 años seguidos.

> **2. ¿Qué áreas tienen el peor cumplimiento de compromisos? Dame el ranking.**  
> Veritas lista: Gerencia Legal 50%, Tecnología 58%, Personas 58%, Adquisiciones 68%, Finanzas 71%, Operaciones 74%. Tecnología es el cuello de botella en absoluto (17 vencidos).

> **3. Muéstrame los hallazgos críticos abiertos hace más de 180 días.**  
> Veritas tabula los 7 casos. El peor: HAL-2024-007 (plan de continuidad TI), 833 días abierto. Recomienda escalamiento al Comité de Auditoría inmediato.

> **4. ¿Hay algún responsable con sobrecarga de compromisos abiertos?**  
> Carlos Robles (Gerente TI) con 10 compromisos. Veritas recomienda redistribución y plantea que TI no está pudiendo absorber el ritmo de hallazgos.

**Puente al simulador P2P (2 min):**

Bajar al simulador y mostrar:
> Pregunta a Veritas: *"Si la rotación de personal del área de Compras sube 20%, ¿qué pasa con el riesgo operacional?"*

**Punch line al cierre:**
> "Lo que acaban de ver es esto: la planilla del Excel del gerente de auditoría se vuelve **conversacional**. La gerente de auditoría sube por la mañana, pregunta '¿qué se me está reiterando?', '¿quién está sobrecargado?', '¿qué le presento al Comité este mes?' — y tiene respuesta en 5 segundos sobre 4 años de data. Esto es lo que reemplaza el reporte mensual del equipo."

### 5. Espacio 4 — Cumplimiento Laboral & Sindical (7 min) ⭐ ANCLA NARRATIVA

**El caso más rico del demo.** Combina las dos capacidades clave de IA: datos estructurados + datos NO estructurados + normativa + multas históricas.

**Cliente:** Empresa Portuaria Pacífico S.A. (EPP) — operador portuario multi-puerto (Valparaíso, San Antonio, Mejillones, Coronel).

**Datos cargados (5 archivos):**
- 01_Convenios_Sindicales.zip → 46 convenios (NO estructurado — PDF)
- 02_Turnos_Pagados_FY26.xlsx → 16.000+ turnos (estructurado)
- 03_Maestro_Trabajadores.xlsx → 810 trabajadores
- 04_Multas_DT_Historico.pdf → 15 sanciones DT 2022-2026
- 05_Normativa_Aplicable.pdf → Código del Trabajo + Convenios OIT + Código ISPS + NCG 401

**El gancho narrativo (decirlo con firmeza al abrir el espacio):**
> "El equipo de auditoría tradicional tomó muestra de 8 convenios sobre 46 y revisó cerca de 100 turnos sobre más de 16.000. AuditIA cruza el 100% del universo de turnos contra TODOS los convenios sindicales + el Código del Trabajo + los Convenios OIT + el Código ISPS + el histórico completo de multas DT. Pasamos de revisar el 0,6% al revisar el 100%."

**Las 7 killer questions:**

> **1. Cruza turnos pagados contra los convenios sindicales: ¿cuántos exceden el máximo de horas?**
> AuditIA detecta 23 turnos del Sindicato 3 con 11-14h cuando su convenio permite máximo 10h. Cita Convenio S03 + CT Art. 22.

> **2. ¿Hay trabajadores en muelle internacional sin certificación OIT-137 vigente?**
> 62 trabajadores en zona internacional con certificación vencida o ausente. Riesgo dual: multa DT + pérdida de habilitación bajo Código ISPS.

> **3. Detecta turnos con menos de 12h de descanso entre jornadas (CT Art. 38).**
> 24 pares de turnos consecutivos con descanso de 6-7h. CT obliga mínimo 12h. Multa estándar: 10-40 UTM por trabajador.

> **4. ¿El bono dominical se está pagando según el convenio de cada sindicato?**
> Sindicato 3 tiene convenio con bono dominical 1.75x, pero 14 turnos se pagaron a 1.50x. Impacto: CLP 378.000. **Reincidencia documentada en multas DT 2023, 2024 y 2025.**

> **5. ¿Hay sindicatos reincidentes en multas de la Dirección del Trabajo?**
> Sindicato 3: 5 multas históricas, 122 UTM acumulados. Patrón crónico — recomendar escalamiento al directorio.

> **6. Detecta inconsistencias en los datos: los dos sistemas fusionados aplican cláusulas distintas.**
> 9 turnos del Sindicato 4 (fusionado en 2024) registrados en SistemaTurnos2024 aplicando bonos del convenio anterior, no del fusionado. Contingencia laboral material.

> **7. Dame los hallazgos prioritarios con la potencial multa DT en UTM por cada uno.**
> AuditIA tabula los 7 categorías de hallazgos con artículo violado + UTM esperado por trabajador afectado.

**Punch line al cierre del Espacio 5:**
> "Este es el caso que más sintetiza el cambio: no era posible que un auditor lea 46 convenios sindicales en un mes, ni que pruebe 16.000 turnos contra cada uno de ellos. La IA lo hace en segundos. Y los hallazgos son materiales: contingencias laborales acumuladas, riesgo de pérdida de habilitación internacional, sanciones reincidentes de la DT que el muestreo no detectaría. El mismo motor sirve después para contratos de proveedores, pagarés vs cartera, contratos comerciales con cláusulas — cambia el dataset, no la lógica."

---

### 6. Espacio 5 — Coach de Auditor (3 min · opcional)

Si queda tiempo después del Espacio 4 (Cumplimiento Laboral), mostrar **el modo Briefing** que es predecible y rinde bien. El Roleplay queda como demo bajo demanda en Q&A.

**Modo Briefing** (siempre que sobre tiempo):
- Setup form: stakeholder, personalidad, hallazgos, objetivo
- AuditIA genera documento ejecutivo con 7 secciones: Lectura del stakeholder, Apertura sugerida, Cómo presentar los hallazgos, Objeciones probables con respuesta, Frases que SÍ funcionan, Frases que evitar, Cierre.
- Toma 15-25 segundos, output rico y útil.

**Modo Roleplay con coaching en tiempo real** (solo en Q&A si preguntan):
- El sistema interpreta al stakeholder según la personalidad seleccionada (cooperativo/defensivo/escéptico/agresivo).
- Voz: input por mic + respuesta hablada del stakeholder, con pitch ajustado por personalidad.
- **Después de cada respuesta del stakeholder**, un panel ámbar debajo muestra las **pistas del coach** para el siguiente turno: lectura de la situación, siguiente movimiento sugerido, frase concreta lista para usar entre comillas, y opcionalmente una alerta de qué evitar. Las pistas NO se leen por voz — son texto para reflexionar.
- Toggle 💡 "Pistas ON/OFF" en el header del Roleplay para desactivarlas si querés practicar sin red de seguridad.
- Punch line si lo demostrás en vivo: *"Es un simulador de conversaciones difíciles. Pero más que eso: es un tutor en tiempo real. Cada turno, el auditor ve cómo respondió el stakeholder Y recibe coaching sobre qué hacer después. Aprende practicando."*

---

### 7. Espacio 3 — Audit Expert (3 min · si queda tiempo)

Tres tabs internos:

**Tab A — Consulta experta** con voz: AuditIA con web_search a la Fábrica de Pensamiento del IAI España, NGAI y normativa chilena. Killer question demo: *"¿Cómo auditar IA según el IAI España?"* — Veritas busca en tiempo real, cita 📄 [Título]. Si vino por voz, responde por voz.

**Tab B — Generar plan de auditoría**: formulario (Organización + Sector + Tipo + Briefing) → plan estructurado con objetivos, alcance, riesgos, metodología, fases, papeles de trabajo codificados (PT-01…) y entregables. Toma 30-45 segundos.

(Tab Evaluar Plan se removió en última versión.)

**Lo que es ahora:** tres tabs internos que reemplazan al antiguo Copiloto Regulatorio:

**Tab A — Consulta experta** (2 min)
- AuditIA con acceso vía web_search a la **Fábrica de Pensamiento del IAI España** (auditoresinternos.es), NGAI y normativa chilena
- Killer question: *"¿Cómo auditar IA según el IAI España?"* — Veritas hace web_search en tiempo real, cita documentos con 📄 [Título]
- Otras preguntas frecuentes precargadas

**Tab B — Generar plan de auditoría** (2 min) ⭐ El gancho del módulo
- Formulario: Organización + Sector + Tipo de auditoría + Briefing
- AuditIA consulta IAI España y devuelve un plan estructurado con:
  - Resumen ejecutivo, Objetivos, Alcance (incluye/excluye), Riesgos clave, Metodología
  - Fases y cronograma
  - Recursos (equipo, herramientas, estimación de horas)
  - **Papeles de trabajo sugeridos** (codificados PT-01, PT-02… con evidencia esperada)
  - Entregables y fuentes IAI consultadas
- Demo en vivo: organización ficticia + sector + briefing corto, esperar 30-45s, mostrar el plan generado

**Tab C — Evaluar plan existente** (1 min — opcional, mostrar solo si hay tiempo)
- Pega un plan existente + checkboxes con elementos del plan
- Devuelve score 0-100 con nivel (Excelente/Avanzado/En desarrollo/Inicial)
- 6 dimensiones evaluadas: Evaluación de riesgos, Cobertura, Recursos, Tecnología, Gobierno, Seguimiento
- Hallazgos clasificados por severidad + recomendaciones priorizadas

**Punch line:**
> "Esto le ahorra al jefe de auditoría el 70% del tiempo que hoy gasta en armar el plan anual. Y la calidad sube — AuditIA siempre tiene la versión más reciente del marco. Para evaluación de planes existentes, tu equipo puede subir cualquier plan del cliente y recibir un benchmark contra mejores prácticas en 30 segundos."

### 5. Cierre (1 min)

Tres mensajes finales:
1. **Eficiencia:** "Esto no es una herramienta para reemplazar al auditor — es para amplificarlo. Un auditor con Veritas hace lo que hoy hace un equipo de 4."
2. **Cobertura:** "Pasamos de muestrear a testing 100%. El riesgo de omisión por muestreo se reduce a cero."
3. **Ventana de oportunidad:** "Los clientes están listos. La conversación no es si vamos a usar IA en auditoría — es quién la va a vender primero. Necesitamos lanzar esto en Junio."

---

## Las 14 categorías de hallazgos plantados en el dataset

Para referencia rápida durante la demo — qué encuentra Veritas y por qué importa:

### Críticos (4)
| # | Hallazgo | Casos | Por qué importa |
|---|----------|-------|-----------------|
| 1 | Colisión empleado–proveedor (misma cuenta bancaria) | 3 | Conflicto de interés directo, posible desvío de fondos |
| 2 | Proveedores fantasma (alta <90 días + facturación >CLP 10M) | 2 | Esquema clásico de fraude documentado |
| 6 | Backdating de OCs (factura antes de OC) | 4 | OC fabricada para regularizar compra no autorizada |
| 12 | Pago antes de fecha de factura | 3 | Imposible operativamente — error o fabricación |

### Altos (7)
| # | Hallazgo | Casos | Por qué importa |
|---|----------|-------|-----------------|
| 3 | Email personal en proveedor B2B (gmail/hotmail) | 3 | Falta de profesionalismo o proveedor de fachada |
| 4 | Proveedor inactivo con factura reciente | 1 | Reactivación irregular sin reaprobación |
| 5 | Split de aprobación (12 OCs justo bajo CLP 5M) | 12 | Evasión deliberada del umbral gerencial |
| 7 | Concentración de aprobador (>85% del valor) | 1 | Violación de segregación de funciones |
| 9 | Facturas duplicadas (mismo monto, <7 días) | 2 pares | Pago doble por error o fraude |
| 13 | Empleados con cuenta bancaria compartida entre sí | 2 emp. | Empleado fantasma o error grave de maestro |
| 14 | Sueldos atípicos para el cargo (>2x promedio) | 3 | Posible fraude de nómina o nepotismo |

### Medios (3)
| # | Hallazgo | Casos | Por qué importa |
|---|----------|-------|-----------------|
| 8 | Facturas sin OC previa | 23 | Excede tolerancia política (10/trimestre) |
| 10 | Facturas emitidas en fin de semana | 8 | Inusual para B2B, requiere validar el flujo |
| 11 | Montos exactamente redondos (5M, 10M, 15M) | 5 | Patrón sospechoso de fabricación |

---

## Setup pre-demo

1. **15 minutos antes:** correr `npm run dev` en el repo. Esperar a que diga `Local: http://localhost:5173`
2. **Verificar:** abrir http://localhost:5173, hacer login como "Daniel Soto (Partner Auditoría)"
3. **Verificar Veritas:** ir a Espacio 1, click en cualquier pregunta sugerida, esperar respuesta. Si no responde en 5 segundos, revisar que el servidor en :3001 esté corriendo (`netstat -ano | findstr :3001` debe mostrar LISTENING)
4. **Cerrar pestañas innecesarias del navegador** para que se vea limpio
5. **Tener este cheatsheet en una ventana separada o impreso**

## Si algo falla durante el demo

- **El chat no responde:** Veritas usa la API de Anthropic. Si la red corporativa la bloquea, mostrar una respuesta pre-generada (puedes pegar texto desde este cheatsheet directamente en el panel)
- **El puerto 3001 está ocupado:** `taskkill /F /PID <pid>` después de `netstat -ano | findstr :3001`
- **Una pregunta da respuesta rara:** click en la siguiente pregunta sugerida, no insistir en la que falló
- **El espacio 3 no responde:** decir "este espacio carga marcos regulatorios de fuentes públicas; vamos a verlo más tarde por separado"

## Preguntas anticipadas que pueden hacer los partners

**P: ¿De dónde viene la data?**  
R: Para esta demo, sintética y plantada con hallazgos específicos. En producción, conexión directa a SAP/Oracle/Microsoft Dynamics del cliente vía conectores. Pipeline nightly.

**P: ¿Cómo manejamos el dato sensible?**  
R: El procesamiento puede ser on-premise o en cloud privada del cliente. Nunca sale data identificable. Veritas trabaja sobre embeddings + agregados, no sobre raw PII.

**P: ¿Esto reemplaza a los auditores junior?**  
R: No — los amplifica. Los junior dejan de hacer el grunt work de muestreo y vouching repetitivo, y se enfocan en investigación de hallazgos. Es un cambio de rol, no una reducción.

**P: ¿Cuánto cuesta vendido al cliente?**  
R: Setup ~USD 80-120K (3 meses) + suscripción anual USD 60-90K. Para un cliente con auditoría interna tercerizada que hoy paga USD 300-500K/año, es una mejora de costo + cobertura.

**P: ¿Cuántos hallazgos falsos positivos genera?**  
R: En esta demo, prácticamente cero porque los datos son sintéticos. En producción, Veritas se afina por cliente con un período de calibración de 2-3 meses. Después la tasa de FP esperada es <15%.

**P: ¿Audit Trail?**  
R: Sí — todo lo que pregunta el auditor y todo lo que responde Veritas queda en logs versionados. Cumple ISACA, SOX, IIA. Trazabilidad completa.

---

## Apéndice — Cambios en esta versión

### Renombres importantes
- **Veritas → AuditIA** (nombre de la plataforma, mostrado en sidebar, headers y chat)
- **Copiloto Regulatorio → Audit Expert** (Espacio 03)
- "Marcos y planificación" → "Mejores prácticas y regulaciones"

### Nuevas funcionalidades

**Espacio 1 — Engagement P2P**
- Paginación de archivos: selector 50/100/250/500 filas + botones « ‹ › »
- Ahora se pueden recorrer los 1.210 proveedores, 3.493 OCs, 3.385 facturas y 2.500 empleados sin necesidad de scroll infinito

**Espacio 2 — Audit Hub**
- **Mis compromisos:** los compromisos generados desde Hallazgos Activos aparecen al tope del Hub, persisten en localStorage, sobreviven al recargar la página
- **Drill-down en KPIs:** las 5 tarjetas superiores (Abiertos, Vencidos, Críticos, Reiterados, Cumplimiento) son clickeables y abren un modal con detalle, tabla, fuente y notas accionables
- **Botón "+ Generar compromiso"** en cada AlertCard de Hallazgos Activos: con un click se crea un compromiso codificado (COM-2026-XXXXX), con responsable sugerido + plazo según severidad

**Espacio 3 — Audit Expert** (totalmente nuevo)
- Tab Consulta: chat con la Fábrica de Pensamiento del IAI España (web_search en tiempo real)
- Tab Generar plan: formulario que produce un plan de auditoría estructurado completo incluyendo papeles de trabajo codificados
- Tab Evaluar plan: scoring contra mejores prácticas con 6 dimensiones evaluadas

### Mejoras técnicas
- **OOM resuelto:** truncado de historial de chat a últimos 4 mensajes + heap de Node a 4GB + mensajes de error traducidos al español (overloaded, rate limit, timeout)
- **Backend extendido** con endpoint `/api/generate` para respuestas one-shot estructuradas (Audit Expert), y soporte para `tools` (web_search)
- Eliminadas todas las referencias visibles a "Claude" en la UI

### Para cambiar el logo de Deloitte

El logo está en `client/public/deloitte-logo.svg`. Para cambiarlo:

1. **Si tienes el logo oficial:** reemplaza el archivo `client/public/deloitte-logo.svg` por tu archivo manteniendo el mismo nombre. El sitio lo recoge automáticamente sin tocar código.
2. **Si quieres usar otro nombre/formato (PNG, JPG):** edita `client/src/config/branding.ts` línea 8: `logoPath: "/tu-archivo.png"` y deja el archivo en `client/public/`.
3. **Si quieres hacer cambios visuales más profundos** del componente Logo (tamaño, color, etc.): editar `client/src/components/Logo.tsx`.
