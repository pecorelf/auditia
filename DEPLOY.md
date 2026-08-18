# Despliegue en Vercel

## 1. Subir el repo

```bash
git init && git add . && git commit -m "AuditIA multi-industria"
# crear el repo en GitHub y hacer push
```

## 2. Importar en Vercel

En vercel.com → Add New → Project → importar el repo.
La configuración de build ya viene en `vercel.json`; no hay que tocar nada.

## 3. Variables de entorno

En Project Settings → Environment Variables:

| Variable | Valor | Obligatoria |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Sí |
| `DEMO_PASSWORD` | clave compartida del equipo | Sí, en producción |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5` | No |

**`DEMO_PASSWORD` no es opcional en la práctica.** Sin ella, cualquiera con el
link consume la API key. Con ella, las funciones rechazan toda solicitud que no
traiga el header correcto, y el login pide la clave.

## 4. Verificar

Abrir `https://<tu-deploy>.vercel.app/api/health`. Debe responder:

```json
{ "ok": true, "apiKeyPresente": true, "gateActivo": true }
```

Si `apiKeyPresente` es `false`, la variable no quedó guardada o falta redesplegar.

---

## Local vs. Vercel

| | Local | Vercel |
|---|---|---|
| Backend | `server.js` en el 3001 | funciones en `/api` |
| Arranque | `npm run dev` | automático al hacer push |
| Clave | no se pide | se pide en el login |

`src/lib/api.ts` detecta el entorno por el puerto: si el navegador está en 5173,
apunta a `localhost:3001`; si no, usa el mismo origen. No hay que cambiar código
para pasar de uno a otro.

## Nota sobre el peso del bundle

Los datasets se generan en el navegador al cargar la app (~92 mil turnos solo en
Remuneraciones). Funciona, pero el chunk supera los 500 KB y el arranque en frío
se nota. Si empieza a molestar en las demos, el paso siguiente es mover la
generación a una función serverless y traer los datos por fetch.
