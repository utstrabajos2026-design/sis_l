---
title: SIS-L — Sistema de Interpretación y Aprendizaje de Lengua de Señas
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# SIS-L · Sistema de Interpretación y Aprendizaje de Lengua de Señas

Plataforma interactiva para aprender **Lengua de Señas Colombiana (LSC)** con lecciones, práctica guiada, quizzes y chatbot con IA.

---

## 🚀 Despliegue en Hugging Face Spaces (RÁPIDO)

### Pasos 1-3: Setup Inicial

```bash
# 1. Clonar tu Space en HF
git clone https://huggingface.co/spaces/TU_USUARIO/sis-l-app
cd sis-l-app

# 2. Copiar archivos del proyecto
# (Usa el comando de tu sistema operativo)

# 3. Editar .env.production con credenciales de BD
```

### Paso 4: Configurar Base de Datos Externa

**Necesitas una BD MySQL externa** (no puede ser local en HF).

**Opciones recomendadas:**
- **Railway**: https://railway.app (más rápido)
- **Render**: https://render.com
- **Clever Cloud**: https://www.clever-cloud.com

Ejemplo con Railway:
1. Crea proyecto en Railway
2. Añade servicio MySQL
3. Copia credenciales a `.env.production`
4. En HF Space > Settings > Secrets, añade:
   - `DB_PASSWORD`
   - `JWT_SECRET`

### Paso 5: Push y Deploy

```bash
git add .
git commit -m "Setup SIS-L en HF Spaces"
git push
```

¡Listo! HF construye y deploya automáticamente.

---

## 🏗️ Arquitectura MVW (Local Dev)

```
sis_l_fullstack/
│
├── server.js                ← Arranque del servidor Express
├── package.json             ← Dependencias Node.js
├── .env                     ← Variables de entorno (desarrollo)
├── .env.production          ← Variables para HF Spaces
│
├── model/
│   └── index.js             ◄── CAPA MODEL
│                                Consultas SQL puras a MySQL
│
├── watcher/
│   └── index.js             ◄── CAPA WATCHER
│                                Toda la lógica de negocio
│
├── view/
│   └── routes.js            ◄── CAPA VIEW (Backend)
│                                Rutas Express / API REST
│
├── config/
│   ├── db.js                ← Conexión MySQL con pool
│   └── seed.js              ← Script inicialización BD
│
└── public/                  ◄── CAPA VIEW (Frontend)
    ├── pages/               ← Páginas HTML
    ├── js/                  ← JavaScript cliente
    ├── css/                 ← Estilos
    └── locales/             ← Traducciones (ES/EN)
```

### Flujo MVW

```
Navegador → view/routes.js → watcher/index.js → model/index.js → MySQL
```

**Reglas de oro:**
- ✅ View → Watcher → Model (solo este sentido)
- ❌ View NO toca Model directamente
- ❌ Watcher NO maneja req/res

---

## 💻 Ejecutar Localmente (Desarrollo)

### Requisitos
- Node.js 20+
- MySQL 8+ (o Docker Compose)

### Con Docker Compose

```bash
# Inicia MySQL + app automáticamente
docker-compose up

# En otra terminal: inicializar BD
docker-compose exec app npm run seed

# Abre: http://localhost:3000
```

### Sin Docker (Manual)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
# DB_HOST=localhost, etc.

# 3. Crear tablas + datos
npm run seed

# 4. Iniciar servidor
npm run dev      # Con auto-reload
npm start        # Producción

# Abre: http://localhost:3000
```

**Usuario demo:** admin@sisl.edu.co / Admin1234

---

## 🔌 API REST Endpoints

| Método | Ruta                     | Auth | Descripción             |
|--------|--------------------------|------|-------------------------|
| POST   | /api/auth/registro       | No   | Crear cuenta            |
| POST   | /api/auth/login          | No   | Iniciar sesión          |
| POST   | /api/auth/logout         | Sí   | Cerrar sesión           |
| GET    | /api/lecciones           | Sí   | Listar lecciones        |
| POST   | /api/lecciones/completar | Sí   | Marcar completa         |
| POST   | /api/senas/aprender      | Sí   | Guardar seña            |
| GET    | /api/quizzes             | Sí   | Listar evaluaciones     |
| POST   | /api/quizzes/resultado   | Sí   | Guardar resultado       |
| GET    | /api/dashboard           | Sí   | Estadísticas usuario    |
| POST   | /api/chatbot/message     | Sí   | Chat con IA             |
| GET    | /api/health              | No   | Estado del servidor     |

---

## 🛠️ Variables de Entorno

### Desarrollo (.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=sisl
JWT_SECRET=dev-secret-123
```

### Producción (.env.production)
```env
PORT=7860
NODE_ENV=production
DB_HOST=tu-bd.railway.app
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=***SECRETO***
DB_NAME=sisl
JWT_SECRET=***CAMBIAR***
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=***SECRETO***
```

**⚠️ Nunca hardcodees secretos. Usa HF Spaces > Settings > Secrets**

---

## 🚨 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Cannot connect to DB" | Verifica credenciales en .env.production |
| "Port 7860 already in use" | HF Spaces lo asigna automáticamente |
| "CORS error" | Añade IP de HF Spaces a whitelist |
| "IA no funciona" | OLLAMA_HOST debe quedar en blanco |
| "Template error" | Revisa logs en HF Spaces Dashboard |

---

## 📚 Documentación Completa

- [HF Spaces Docs](https://huggingface.co/docs/hub/spaces)
- [Dockerfile Reference](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [Express.js Guide](https://expressjs.com)
- [MySQL Node.js](https://github.com/mysqljs/mysql)

---

## 📜 Licencia

MIT - Libre para usar, modificar y distribuir

---

**¿Problemas?** Revisa los logs en HF Spaces o abre un issue en GitHub.
