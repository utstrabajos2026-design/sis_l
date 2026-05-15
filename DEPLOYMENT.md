# 🚀 Guía Completa: Despliegue en Hugging Face Spaces

## 📋 Requisitos

- Cuenta en **Hugging Face** (https://huggingface.co)
- **Token de acceso** con permisos de lectura/escritura
- **Git** instalado
- **Base de datos MySQL externa** (Railway, Render, Supabase, etc.)

---

## ⚡ Inicio Rápido (10 minutos)

### 1️⃣ Crear Space en HF

```
https://huggingface.co/new-space
├─ Space name: sis-l-app
├─ License: MIT
├─ SDK: Docker ← IMPORTANTE
└─ Visibility: Public
```

### 2️⃣ Clonar y Preparar

```bash
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/sis-l-app
cd sis-l-app

# Copy files from your local project
# (Windows PowerShell)
Copy-Item C:\xampp\htdocs\sis_l_fullstack\* . -Recurse
```

### 3️⃣ Configurar BD Externa

**Escoge una opción:**

#### Opción A: Railway (Recomendado)

1. Ve a https://railway.app
2. Crea una nueva cuenta
3. Nuevo proyecto → Add Service → MySQL
4. Copia la `DATABASE_URL`
5. Extrae credenciales:
   ```
   mysql://root:AchKgtZeUMcRvacLXhbBtbWIearAngDn@yamanote.proxy.rlwy.net:57071/railway
   DATABASE_URL = mysql://root:AchKgtZeUMcRvacLXhbBtbWIearAngDn@yamanote.proxy.rlwy.net:57071/railway
                           ↑    ↑         ↑    ↑
                          USER PASS      HOST PORT
   ```

#### Opción B: Render

1. Ve a https://render.com
2. Create → MySQL Database
3. Copia credenciales de la conexión

#### Opción C: Supabase (PostgreSQL)

1. Ve a https://supabase.com
2. New Project → Copia conexión string
3. Modifica `config/db.js` para PostgreSQL

### 4️⃣ Configurar Variables en HF

En tu Space (Settings → Secrets):

| Variable | Valor |
|----------|-------|
| `DB_HOST` | host.railway.app |
| `DB_PORT` | 57071 |
| `DB_USER` | root |
| `DB_PASSWORD` | AchKgtZeUMcRvacLXhbBtbWIearAngDn (secreto) |
| `DB_NAME` | sisl |
| `JWT_SECRET` | genera-algo-aleatorio (secreto) |
| `NODE_ENV` | production |

**Para secretos sensibles:** Settings → Secrets → Add Secret

### 5️⃣ Push y Deploy

```bash
git add .
git commit -m "Setup SIS-L en Hugging Face Spaces"
git push
```

HF construye automáticamente. Verifica en **Logs** que todo funcione.

---

## 🔍 Verificación Post-Deploy

Una vez desplegado, prueba:

```bash
# En tu navegador o terminal
curl https://tu-space.hf.space/api/health

# Esperado:
# {"status": "ok"}
```

---

## 🛠️ Solución de Problemas

### "Build failed"

```
Logs → Ver error específico
```

**Causas comunes:**
- `Dockerfile` tiene errores de sintaxis
- Falta puerto 7860 en `server.js`
- Variables de entorno no configuradas

### "Cannot connect to database"

```bash
# Verifica credenciales
# Asegúrate que:
1. DB_HOST es correcto (no localhost)
2. DB_PASSWORD está en Settings → Secrets
3. BD está online y accesible
4. Firewall permite conexión
```

### "CORS error desde frontend"

En `server.js`, asegúrate que CORS está habilitado:

```javascript
const cors = require('cors');
app.use(cors({
  origin: '*',  // En HF, permite todos los orígenes
  credentials: true
}));
```

### "Application timeout"

- Aumenta `timeout` en HF Spaces settings
- Verifica que BD responde rápido
- Revisa queries SQL que sean lentas

---

## 📁 Estructura de Archivos en HF

Tu Space debe tener:

```
.
├── dockerfile           ← Construcción del contenedor
├── entrypoint.sh        ← Script de arranque
├── server.js            ← Punto de entrada Node.js
├── package.json         ← Dependencias
├── .env.production      ← Variables (template)
├── config/              ← Configuración BD, email
├── model/               ← Lógica de datos
├── view/                ← Rutas API
├── watcher/             ← Lógica de negocio
├── public/              ← Frontend (HTML, CSS, JS)
├── README.md            ← Documentación
└── docker-compose.yml   ← (opcional, solo para desarrollo)
```

---

## 🔐 Seguridad en Producción

### ✅ Configuración Recomendada

```env
# .env.production

NODE_ENV=production

# Base de datos segura en Railway/Render
DB_HOST=secure-host.railway.app
DB_USER=app_user           # NO uses root
DB_PASSWORD=xxx            # Contraseña fuerte
DB_NAME=sisl

# JWT
JWT_SECRET=algo-muy-aleatorio-cambiar

# CORS
ALLOWED_ORIGINS=https://tu-space.hf.space

# Logging
LOG_LEVEL=info
```

### ⚠️ NO hacer

```
❌ Hardcodear secretos en código
❌ Usar DB_PASSWORD=123456
❌ Tener NODE_ENV=development en prod
❌ Permitir CORS para todos los orígenes
❌ Dejar logs de SQL query en consola
```

---

## 🚀 Optimización de Performance

### Dockerfile

Ya está optimizado con:
- ✅ Multi-stage build (node:20-alpine)
- ✅ Copia de package.json primero
- ✅ .dockerignore configurado
- ✅ Alpine (imagen pequeña)

### Node.js

```javascript
// Habilita clustering en producción
if (NODE_ENV === 'production') {
  // Usa más de una worker
  cluster.fork();
}
```

### Database

```javascript
// Usa connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});
```

---

## 📊 Monitoreo en HF Spaces

### Ver logs en tiempo real

```
Space Dashboard → Logs (pestaña)
```

### Hardware utilizado

```
Space Settings → Hardware (muestra CPU, RAM, GPU)
```

### Health checks

Agregado en `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--spider", "http://localhost:7860/api/health"]
  interval: 10s
  timeout: 5s
  retries: 3
```

---

## 🔄 Actualizar el Space Después del Deploy

```bash
# Hacer cambios locales
# ...

# Push a HF
git add .
git commit -m "Fix: nombre del cambio"
git push

# HF reconstruye automáticamente
```

---

## 💾 Backups de Base de Datos

### Con Railway

1. Ve a tu proyecto Railway
2. MySQL → Backups (automático diario)
3. Download si necesitas

### Manual

```bash
# Desde tu computadora
mysqldump -h DB_HOST -u DB_USER -p DB_NAME > backup.sql

# Restaurar
mysql -h DB_HOST -u DB_USER -p DB_NAME < backup.sql
```

---

## 📞 Soporte

- **Problemas con HF**: https://huggingface.co/docs/hub/spaces
- **Problemas con Docker**: https://docs.docker.com
- **Problemas con Node.js**: https://nodejs.org/docs
- **Problemas de BD**: Revisa documentación de tu proveedor

---

## ✨ Checklist Final

- [ ] Space creado en HF
- [ ] Archivos pusheados
- [ ] Variables de entorno configuradas en HF Secrets
- [ ] BD externa online y accesible
- [ ] Build completed en HF Logs
- [ ] `/api/health` responde 200 OK
- [ ] Login funciona
- [ ] Lecciones cargan
- [ ] Quiz se guarda en BD

¡Listo! 🎉
