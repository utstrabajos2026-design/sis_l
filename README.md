---
title: SIS-L — Sistema de Interpretación y Aprendizaje de Lengua de Señas
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# SIS-L — Fullstack MVW con Node.js + MySQL
## Sistema de Interpretación y Aprendizaje de Lengua de Señas

---

## Arquitectura MVW completa en JavaScript

```
sis_l_fullstack/
│
├── server.js                ← Arranque del servidor Express
├── package.json             ← Dependencias Node.js
├── .env                     ← Variables de entorno (BD, JWT)
│
├── model/
│   └── index.js             ◄── CAPA MODEL
│                                Consultas SQL puras a MySQL
│                                NO tiene lógica de negocio
│
├── watcher/
│   └── index.js             ◄── CAPA WATCHER
│                                Toda la lógica de negocio
│                                AuthWatcher, AprendizajeWatcher,
│                                QuizWatcher, DashboardWatcher
│
├── view/
│   └── routes.js            ◄── CAPA VIEW (Backend)
│                                Rutas Express / API REST
│                                Solo recibe y responde JSON
│
├── config/
│   ├── db.js                ← Conexión MySQL con pool
│   └── seed.js              ← Crea tablas + datos iniciales
│
└── public/                  ◄── CAPA VIEW (Frontend)
    ├── index.html               Página de inicio
    ├── css/
    │   └── global.css
    ├── js/
    │   ├── api.js           ← Cliente HTTP (llama al backend)
    │   ├── app.js           ← Utilidades globales
    │   ├── data.js          ← Datos de señas LSC
    │   ├── lecciones.js
    │   ├── quiz.js
    │   ├── practica.js
    │   └── progreso.js
    └── pages/
        ├── login.html       ← Login/Registro (nuevo)
        ├── lecciones.html
        ├── quiz.html
        ├── practica.html
        └── progreso.html
```

---

## Flujo de datos MVW

```
Navegador (HTML)
     │  fetch('/api/...')
     ▼
view/routes.js          ← VIEW: recibe HTTP, nada más
     │  Llama Watcher
     ▼
watcher/index.js        ← WATCHER: lógica de negocio
     │  Llama Model
     ▼
model/index.js          ← MODEL: consulta SQL
     │
     ▼
MySQL (sis_l_db)        ← BASE DE DATOS
```

### Reglas de oro MVW (nunca violar):
- ✅ View → Watcher → Model (único sentido)
- ❌ View NO toca el Model directamente
- ❌ Model NO conoce al Watcher ni a la View
- ❌ Watcher NO escribe HTML ni maneja req/res

---

## Tablas en MySQL

| Tabla               | Relacionada con          |
|---------------------|--------------------------|
| `usuarios`          | RF01, RF02               |
| `sesiones`          | JWT / RNF-S1, S2         |
| `lecciones`         | RF03, RF04               |
| `progreso_leccion`  | Avance por lección       |
| `senas_aprendidas`  | Señas marcadas           |
| `quizzes`           | Evaluaciones             |
| `resultados_quiz`   | Historial de quizzes     |
| `actividad_diaria`  | Racha y calendario       |
| `logs_sistema`      | RNF-F1 auditoría         |

---

## Cómo correrlo paso a paso

### Requisitos previos
- Node.js 18 o superior
- MySQL 8 corriendo en tu equipo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar la BD en el archivo .env
```
DB_HOST     = localhost
DB_PORT     = 3306
DB_USER     = root
DB_PASSWORD = tu_password
DB_NAME     = sis_l_db
JWT_SECRET  = algo_muy_secreto
PORT        = 3000
```

### 3. Crear tablas e insertar datos iniciales
```bash
npm run seed
```

### 4. Iniciar el servidor
```bash
npm run dev        # con auto-reload (desarrollo)
npm start          # producción
```

### 5. Abrir en el navegador
```
http://localhost:3000
```

### Usuario demo creado por el seed
```
Correo:     admin@sisl.edu.co
Contraseña: Admin1234
```

---

## Endpoints API disponibles

| Método | Ruta                    | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/auth/registro      | No   | Crear cuenta             |
| POST   | /api/auth/login         | No   | Iniciar sesión           |
| POST   | /api/auth/logout        | Sí   | Cerrar sesión            |
| GET    | /api/lecciones          | Sí   | Listar lecciones         |
| POST   | /api/lecciones/completar| Sí   | Marcar lección completa  |
| POST   | /api/senas/aprender     | Sí   | Guardar seña aprendida   |
| GET    | /api/quizzes            | Sí   | Listar quizzes           |
| POST   | /api/quizzes/resultado  | Sí   | Guardar resultado quiz   |
| GET    | /api/dashboard          | Sí   | Stats del usuario        |
| GET    | /api/health             | No   | Estado del servidor      |
