/**
 * config/seed.js  ─  Crea tablas e inserta datos iniciales
 * ─────────────────────────────────────────────────────────
 * Ejecutar UNA sola vez:  node config/seed.js
 */

require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  // ── 1. Crear base de datos ──────────────────────────────
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${process.env.DB_NAME}\``);
  console.log('🗄  Base de datos lista');

  // ── 2. Crear tablas (MODEL) ─────────────────────────────
  await conn.query(`
    SET FOREIGN_KEY_CHECKS = 0;
    DROP TABLE IF EXISTS logs;
    DROP TABLE IF EXISTS actividades;
    DROP TABLE IF EXISTS resultados_quiz;
    DROP TABLE IF EXISTS quizzes;
    DROP TABLE IF EXISTS senas_aprendidas;
    DROP TABLE IF EXISTS progreso_leccion;
    DROP TABLE IF EXISTS lecciones;
    DROP TABLE IF EXISTS sesiones;
    DROP TABLE IF EXISTS usuarios;
    SET FOREIGN_KEY_CHECKS = 1;
    CREATE TABLE usuarios (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      documento       VARCHAR(50)  UNIQUE NOT NULL,
      nombre          VARCHAR(100)  NOT NULL,
      apellido        VARCHAR(100)  NOT NULL,
      correo          VARCHAR(120) UNIQUE NOT NULL,
      contrasena_hash VARCHAR(255) NOT NULL,
      rol             ENUM('admin','docente','estudiante','oyente') DEFAULT 'estudiante',
      activo          BOOLEAN DEFAULT TRUE,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_correo (correo),
      INDEX idx_documento (documento)
    );

    CREATE TABLE sesiones (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id  INT NOT NULL,
      token       VARCHAR(512) UNIQUE NOT NULL,
      ip          VARCHAR(50),
      activa      BOOLEAN DEFAULT TRUE,
      expires_at  DATETIME,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_token (token),
      INDEX idx_usuario (usuario_id)
    );

    CREATE TABLE lecciones (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      clave        VARCHAR(100) UNIQUE NOT NULL,
      titulo       VARCHAR(200) NOT NULL,
      descripcion  TEXT,
      contenido    LONGTEXT,
      nivel        ENUM('basico','intermedio','avanzado') DEFAULT 'basico',
      orden        INT DEFAULT 0,
      activa       BOOLEAN DEFAULT TRUE,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_clave (clave),
      INDEX idx_nivel (nivel)
    );

    CREATE TABLE progreso_leccion (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id       INT NOT NULL,
      leccion_id       INT NOT NULL,
      estado           ENUM('no_iniciado','en_progreso','completado') DEFAULT 'no_iniciado',
      porcentaje       INT DEFAULT 0,
      completado_en    DATETIME,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_usuario_leccion (usuario_id, leccion_id),
      FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
      FOREIGN KEY (leccion_id)  REFERENCES lecciones(id) ON DELETE CASCADE,
      INDEX idx_usuario (usuario_id),
      INDEX idx_leccion (leccion_id)
    );

    CREATE TABLE senas_aprendidas (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id  INT NOT NULL,
      categoria   VARCHAR(100) NOT NULL,
      clave       VARCHAR(100) NOT NULL,
      aprendido_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_sena (usuario_id, categoria, clave),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_usuario (usuario_id),
      INDEX idx_categoria (categoria)
    );

    CREATE TABLE quizzes (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      clave       VARCHAR(100) UNIQUE NOT NULL,
      titulo      VARCHAR(200) NOT NULL,
      descripcion TEXT,
      icono       VARCHAR(50),
      color       VARCHAR(20),
      preguntas   JSON,
      activo      BOOLEAN DEFAULT TRUE,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_clave (clave)
    );

    CREATE TABLE resultados_quiz (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id  INT NOT NULL,
      quiz_id     INT NOT NULL,
      puntaje     INT NOT NULL,
      total       INT NOT NULL,
      porcentaje  INT,
      aprobado    BOOLEAN DEFAULT FALSE,
      duracion_seg INT,
      realizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id)    REFERENCES quizzes(id)  ON DELETE CASCADE,
      INDEX idx_usuario (usuario_id),
      INDEX idx_quiz (quiz_id),
      INDEX idx_fecha (realizado_en)
    );

    CREATE TABLE actividades (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id       INT NOT NULL,
      fecha_actividad  DATE,
      contador         INT DEFAULT 1,
      UNIQUE KEY uq_usuario_fecha (usuario_id, fecha_actividad),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_usuario (usuario_id),
      INDEX idx_fecha (fecha_actividad)
    );

    CREATE TABLE logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      nivel      ENUM('INFO','WARNING','ERROR') DEFAULT 'INFO',
      modulo     VARCHAR(100),
      mensaje    TEXT,
      usuario_id INT,
      creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_nivel (nivel),
      INDEX idx_usuario (usuario_id),
      INDEX idx_fecha (creado_en)
    );

    CREATE TABLE codigos_autenticacion (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      correo               VARCHAR(120) UNIQUE NOT NULL,
      codigo               VARCHAR(6) NOT NULL,
      intentos_restantes   INT DEFAULT 3,
      usado                BOOLEAN DEFAULT FALSE,
      creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
      expira_en            DATETIME NOT NULL,
      INDEX idx_correo (correo),
      INDEX idx_expira (expira_en)
    );
  `);
  console.log('📋 Tablas creadas');

  // ── 3. Lecciones base ───────────────────────────────────
  await conn.query(`
    INSERT IGNORE INTO lecciones (clave, titulo, descripcion, nivel, orden, activa) VALUES
    ('leccion_1', 'Introducción a las Señas', 'Aprende las señas básicas', 'basico', 1, 1),
    ('leccion_2', 'Señas de Números', 'Números del 1 al 10', 'basico', 2, 1),
    ('leccion_3', 'Saludos y Despedidas', 'Señas básicas de cortesía', 'intermedio', 3, 1),
    ('alfabeto',  'Alfabeto dactilológico', NULL, 'basico', 1, 1),
    ('saludos',   'Saludos y presentaciones', NULL, 'basico', 2, 1),
    ('numeros',   'Números 0 al 10', NULL, 'basico', 3, 1),
    ('frases',    'Frases comunes', NULL, 'intermedio', 4, 1),
    ('colores',   'Colores', NULL, 'intermedio', 5, 1),
    ('familia',   'Vocabulario de familia', NULL, 'intermedio', 6, 1),
    ('emociones', 'Emociones', NULL, 'avanzado', 7, 1),
    ('preguntas', 'Palabras de pregunta', NULL, 'avanzado', 8, 1);
  `);

  // ── 4. Quizzes base ─────────────────────────────────────
  await conn.query(`
    INSERT IGNORE INTO quizzes (clave, titulo, descripcion, icono, color, preguntas, activo) VALUES
    ('quiz_1', 'Quiz de Señas Básicas', 'Prueba tus conocimientos', '📝', 'blue', '[{"pregunta":"¿Cómo se señea hola?","opciones":["A","B","C"],"respuesta":0}]', 1),
    ('q-alfabeto', 'Alfabeto A–Z', NULL, '🔤', '#63FFB4', NULL, 1),
    ('q-saludos',  'Saludos básicos', NULL, '👋', '#63C8FF', NULL, 1),
    ('q-numeros',  'Números 0–10', NULL, '🔢', '#FFD063', NULL, 1),
    ('q-frases',   'Frases del día', NULL, '💬', '#C8A0FF', NULL, 1),
    ('q-colores',  'Colores', NULL, '🎨', '#FF8A63', NULL, 1),
    ('q-emociones','Emociones', NULL, '😊', '#63FFD0', NULL, 1);
  `);

  // ── 5. Usuario administrador demo ──────────────────────
  const hash = await bcrypt.hash('Admin1234', 10);
  await conn.query(`
    INSERT IGNORE INTO usuarios (documento, nombre, apellido, correo, contrasena_hash, rol)
    VALUES ('0000000001', 'Admin', 'SIS-L', 'admin@sisl.edu.co', ?, 'admin');
  `, [hash]);

  // ── 6. Usuarios reales ──────────────────────────────────
  await conn.query(`
    INSERT IGNORE INTO usuarios (documento, nombre, apellido, correo, contrasena_hash, rol, activo, created_at) VALUES
    ('0000000002', 'Estudiante', 'Demo', 'estudiante@sisl.edu.co', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante', 1, '2026-03-07 15:32:44'),
    ('1102354415', 'leidy', 'prada', 'praleidy.0429@gmail.com', '$2y$10$Xm/by4h7JmZuXwaQrExPpuFHW5PJguafyq2pQgu47c6VEvpj97YK.', 'estudiante', 1, '2026-03-14 16:53:28'),
    ('1098641756', 'Santiago', 'Vega', 'Santiagovega17@gmail.com', '$2y$10$zcaJZ3QVcrUtm2BLEqkH2.iSEda1n7qSazWEF5iARKwkVzJezIFFu', 'docente', 1, '2026-03-14 16:59:02'),
    ('1102360983', 'Ilda', 'Briceño', 'ilda1@gmail.com', '$2y$10$9wJBLtQYJszrsG75WLLtMedoNfee5h6C9Fxs5GjA3l9CK2nUuuDU6', 'docente', 1, '2026-03-15 19:08:50');
  `);

  // ── 7. Datos adicionales ────────────────────────────────
  await conn.query(`
    INSERT IGNORE INTO sesiones (usuario_id, token, ip, activa, created_at, expires_at) VALUES
    (4, '3910ca9aaad7bad2e0c7b577a82a835e77fb29f2ffbe4365b8603f35ace1c9d5', '::1', 1, '2026-03-15 19:08:14', '2026-03-16 09:08:14'),
    (6, '994d6ce9add43ce339917b7242a6b282fd60de8b5b853426e41a51ffff0eb6c9', '::1', 1, '2026-03-15 19:09:26', '2026-03-16 09:09:26'),
    (4, '569e480c60edd7a00c525018191b10d4a28296eb12303b3958149b6dae4f7e14', '::1', 1, '2026-03-15 19:24:17', '2026-03-16 09:24:17');

    INSERT IGNORE INTO progreso_leccion (usuario_id, leccion_id, estado, porcentaje, completado_en, created_at) VALUES
    (4, 1, 'completado', 100, '2026-03-15 16:37:08', NOW()),
    (4, 2, 'completado', 100, '2026-03-15 19:15:04', NOW()),
    (6, 1, 'completado', 100, '2026-03-15 19:15:04', NOW());

    INSERT IGNORE INTO senas_aprendidas (usuario_id, categoria, clave, aprendido_en) VALUES
    (4, 'alfabeto', 'A', '2026-03-15 18:54:27'),
    (6, 'alfabeto', 'A', '2026-03-15 19:16:44'),
    (6, 'alfabeto', 'B', '2026-03-15 19:17:00');

    INSERT IGNORE INTO resultados_quiz (usuario_id, quiz_id, puntaje, total, porcentaje, aprobado, duracion_seg, realizado_en) VALUES
    (4, 1, 3, 5, 60, 1, 31, '2026-03-15 18:14:40'),
    (6, 1, 2, 5, 40, 0, 33, '2026-03-15 19:16:12');

    INSERT IGNORE INTO actividades (usuario_id, fecha_actividad, contador) VALUES
    (4, '2026-03-14', 1),
    (4, '2026-03-15', 1),
    (5, '2026-03-14', 1),
    (5, '2026-03-15', 1);

    INSERT IGNORE INTO logs (nivel, modulo, mensaje, usuario_id, creado_en) VALUES
    ('WARNING', 'AuthWatcher', 'Login fallido: sxnkuj', NULL, '2026-03-07 16:35:02'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-07 16:35:47'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-07 16:35:50'),
    ('INFO', 'AuthWatcher', 'Nuevo usuario: praleidy.0312@gmail.com', 3, '2026-03-07 16:36:11'),
    ('INFO', 'AuthWatcher', 'Login: praleidy.0312@gmail.com', 3, '2026-03-07 16:36:27'),
    ('INFO', 'AuthWatcher', 'Login: praleidy.0312@gmail.com', 3, '2026-03-07 16:44:25'),
    ('WARNING', 'AuthWatcher', 'Login fallido: praleidy.0312@gmail.com', NULL, '2026-03-14 16:51:58'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:52:46'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:52:49'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:52:50'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:52:50'),
    ('INFO', 'AuthWatcher', 'Nuevo usuario: praleidy.0429@gmail.com', 4, '2026-03-14 16:53:28'),
    ('INFO', 'AuthWatcher', 'Login: praleidy.0429@gmail.com', 4, '2026-03-14 16:54:26'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:57:12'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:57:33'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:57:42'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:57:43'),
    ('WARNING', 'AuthWatcher', 'Login fallido: admin@sisl.edu.co', NULL, '2026-03-14 16:57:44'),
    ('INFO', 'AuthWatcher', 'Nuevo usuario: Santiagovega17@gmail.com', 5, '2026-03-14 16:59:03'),
    ('INFO', 'AuthWatcher', 'Login: Santiagovega17@gmail.com', 5, '2026-03-14 17:01:04'),
    ('INFO', 'AuthWatcher', 'Login: Santiagovega17@gmail.com', 5, '2026-03-14 17:53:40'),
    ('INFO', 'AuthWatcher', 'Login: praleidy.0429@gmail.com', 4, '2026-03-14 17:57:24'),
    ('INFO', 'AuthWatcher', 'Login: Santiagovega17@gmail.com', 5, '2026-03-15 13:10:55'),
    ('INFO', 'AuthWatcher', 'Login: praleidy.0429@gmail.com', 4, '2026-03-15 15:21:34');
  `);

  console.log('🌱 Datos iniciales insertados');
  console.log('👤 Admin demo: admin@sisl.edu.co / Admin1234');
  await conn.end();
  console.log('✅ Seed completado');
}

seed().catch(e => { console.error(e); process.exit(1); });
