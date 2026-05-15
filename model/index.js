/**
 * model/index.js  ─  CAPA MODEL
 * ─────────────────────────────────────────────────────────────
 * ÚNICA responsabilidad: ejecutar consultas SQL.
 * NO contiene lógica de negocio. Solo habla con MySQL.
 * Los Watchers llaman a estas funciones; la View nunca las toca.
 */

const db = require('../config/db');

// ══════════════════════════════════════════════════
//  USUARIOS
// ══════════════════════════════════════════════════

const Usuario = {
  findByCorreo: (correo) =>
    db.query('SELECT * FROM usuarios WHERE correo = ? AND activo = 1', [correo])
      .then(([rows]) => rows[0] || null),

  findById: (id) =>
    db.query('SELECT id,nombre,apellido,correo,rol FROM usuarios WHERE id = ?', [id])
      .then(([rows]) => rows[0] || null),

  findByDocumento: (doc) =>
    db.query('SELECT id FROM usuarios WHERE documento = ?', [doc])
      .then(([rows]) => rows[0] || null),

  create: ({ documento, nombre, apellido, correo, hash, rol }) =>
    db.query(
      'INSERT INTO usuarios (documento,nombre,apellido,correo,contrasena_hash,rol) VALUES (?,?,?,?,?,?)',
      [documento, nombre, apellido, correo, hash, rol || 'estudiante']
    ).then(([r]) => r.insertId),

  delete: (usuario_id) =>
    db.query('DELETE FROM usuarios WHERE id = ?', [usuario_id]),
};

// ══════════════════════════════════════════════════
//  SESIONES
// ══════════════════════════════════════════════════

const Sesion = {
  create: (usuario_id, token, ip, expires_at) =>
    db.query(
      'INSERT INTO sesiones (usuario_id,token,ip,expires_at) VALUES (?,?,?,?)',
      [usuario_id, token, ip, expires_at]
    ),

  findByToken: (token) =>
    db.query(
      'SELECT * FROM sesiones WHERE token = ? AND activa = 1 AND expires_at > NOW()',
      [token]
    ).then(([rows]) => rows[0] || null),

  cerrar: (token) =>
    db.query('UPDATE sesiones SET activa = 0 WHERE token = ?', [token]),
};

// ══════════════════════════════════════════════════
//  LECCIONES
// ══════════════════════════════════════════════════

const Leccion = {
  findAll: () =>
    db.query('SELECT * FROM lecciones WHERE activa = 1 ORDER BY orden')
      .then(([rows]) => rows),

  findByClave: (clave) =>
    db.query('SELECT * FROM lecciones WHERE clave = ?', [clave])
      .then(([rows]) => rows[0] || null),
};

// ══════════════════════════════════════════════════
//  PROGRESO DE LECCIÓN
// ══════════════════════════════════════════════════

const Progreso = {
  findByUsuario: (usuario_id) =>
    db.query(
      `SELECT p.*, l.clave, l.titulo, l.nivel
       FROM progreso_leccion p
       JOIN lecciones l ON l.id = p.leccion_id
       WHERE p.usuario_id = ?`,
      [usuario_id]
    ).then(([rows]) => rows),

  upsert: (usuario_id, leccion_id, estado, porcentaje) =>
    db.query(
      `INSERT INTO progreso_leccion (usuario_id, leccion_id, estado, porcentaje)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE
         estado = VALUES(estado),
         porcentaje = VALUES(porcentaje),
         completado_en = IF(VALUES(estado)='completado', NOW(), completado_en)`,
      [usuario_id, leccion_id, estado, porcentaje]
    ),
};

// ══════════════════════════════════════════════════
//  SEÑAS APRENDIDAS
// ══════════════════════════════════════════════════

const SenaAprendida = {
  save: (usuario_id, categoria, clave) =>
    db.query(
      'INSERT IGNORE INTO senas_aprendidas (usuario_id,categoria,clave) VALUES (?,?,?)',
      [usuario_id, categoria, clave]
    ),

  countByUsuario: (usuario_id) =>
    db.query(
      'SELECT COUNT(*) as total FROM senas_aprendidas WHERE usuario_id = ?',
      [usuario_id]
    ).then(([rows]) => rows[0].total),

  findByUsuario: (usuario_id) =>
    db.query(
      'SELECT categoria, clave FROM senas_aprendidas WHERE usuario_id = ?',
      [usuario_id]
    ).then(([rows]) => rows),
};

// ══════════════════════════════════════════════════
//  QUIZZES
// ══════════════════════════════════════════════════

const Quiz = {
  findAll: () =>
    db.query('SELECT * FROM quizzes WHERE activo = 1')
      .then(([rows]) => rows),

  findByClave: (clave) =>
    db.query('SELECT * FROM quizzes WHERE clave = ?', [clave])
      .then(([rows]) => rows[0] || null),
};

// ══════════════════════════════════════════════════
//  RESULTADOS DE QUIZ
// ══════════════════════════════════════════════════

const ResultadoQuiz = {
  save: (usuario_id, quiz_id, puntaje, total, duracion_seg) => {
    const porcentaje = Math.round((puntaje / total) * 100);
    const aprobado   = porcentaje >= 60;
    return db.query(
      'INSERT INTO resultados_quiz (usuario_id,quiz_id,puntaje,total,porcentaje,aprobado,duracion_seg) VALUES (?,?,?,?,?,?,?)',
      [usuario_id, quiz_id, puntaje, total, porcentaje, aprobado, duracion_seg]
    ).then(([r]) => ({ id: r.insertId, porcentaje, aprobado }));
  },

  findByUsuario: (usuario_id) =>
    db.query(
      `SELECT r.*, q.titulo, q.icono, q.color
       FROM resultados_quiz r
       JOIN quizzes q ON q.id = r.quiz_id
       WHERE r.usuario_id = ?
       ORDER BY r.realizado_en DESC LIMIT 20`,
      [usuario_id]
    ).then(([rows]) => rows),

  lastByQuiz: (usuario_id, quiz_id) =>
    db.query(
      'SELECT * FROM resultados_quiz WHERE usuario_id=? AND quiz_id=? ORDER BY realizado_en DESC LIMIT 1',
      [usuario_id, quiz_id]
    ).then(([rows]) => rows[0] || null),
};

// ══════════════════════════════════════════════════
//  ACTIVIDAD DIARIA  (para racha y calendario)
// ══════════════════════════════════════════════════

const Actividad = {
  registrar: (usuario_id) =>
    db.query(
      'INSERT IGNORE INTO actividades (usuario_id, fecha_actividad) VALUES (?, CURDATE())',
      [usuario_id]
    ),

  getLog: (usuario_id, dias = 21) =>
    db.query(
      `SELECT DATE_FORMAT(fecha_actividad,'%Y-%m-%d') as fecha
       FROM actividades
       WHERE usuario_id = ?
         AND fecha_actividad >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY fecha_actividad`,
      [usuario_id, dias]
    ).then(([rows]) => rows.map(r => r.fecha)),

  getRacha: async (usuario_id) => {
    const [rows] = await db.query(
      `SELECT fecha_actividad FROM actividades
       WHERE usuario_id = ? ORDER BY fecha_actividad DESC`,
      [usuario_id]
    );
    let racha = 0;
    let d = new Date();
    d.setHours(0,0,0,0);
    for (const row of rows) {
      const f = new Date(row.fecha);
      f.setHours(0,0,0,0);
      if (f.getTime() === d.getTime()) {
        racha++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return racha;
  }
};

// ══════════════════════════════════════════════════
//  CÓDIGOS DE AUTENTICACIÓN  (por correo)
// ══════════════════════════════════════════════════

const CodigoAutenticacion = {
  guardar: (correo, codigo) =>
    db.query(
      `INSERT INTO codigos_autenticacion (correo, codigo, intentos_restantes, expira_en)
       VALUES (?, ?, 3, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
       ON DUPLICATE KEY UPDATE
         codigo = ?,
         intentos_restantes = 3,
         creado_en = NOW(),
         expira_en = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
         usado = FALSE`,
      [correo, codigo, codigo]
    ),

  obtener: (correo) =>
    db.query(
      'SELECT * FROM codigos_autenticacion WHERE correo = ? AND usado = FALSE',
      [correo]
    ).then(([rows]) => rows[0] || null),

  descontar_intento: (correo) =>
    db.query(
      'UPDATE codigos_autenticacion SET intentos_restantes = intentos_restantes - 1 WHERE correo = ?',
      [correo]
    ),

  marcar_usado: (correo) =>
    db.query(
      'UPDATE codigos_autenticacion SET usado = TRUE WHERE correo = ?',
      [correo]
    ),

  limpiar_expirados: () =>
    db.query(
      'DELETE FROM codigos_autenticacion WHERE expira_en < NOW() OR usado = TRUE'
    ),
};

// ══════════════════════════════════════════════════
//  LOGS
// ══════════════════════════════════════════════════

const Log = {
  write: (nivel, modulo, mensaje, usuario_id = null) =>
    db.query(
      'INSERT INTO logs (nivel,modulo,mensaje,usuario_id) VALUES (?,?,?,?)',
      [nivel, modulo, mensaje, usuario_id]
    ).catch(() => {}), // los logs nunca deben romper el flujo
};

// ══════════════════════════════════════════════════
//  RESET DE CONTRASEÑA  (tokens)
// ══════════════════════════════════════════════════

const PasswordResetToken = {
  guardar: (usuario_id, token, expira_en) =>
    db.query(
      `INSERT INTO password_reset_tokens (usuario_id, token, expira_en)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         token = VALUES(token),
         expira_en = VALUES(expira_en),
         usado = FALSE,
         creado_en = NOW()`,
      [usuario_id, token, expira_en]
    ),

  obtener: (token) =>
    db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND usado = FALSE',
      [token]
    ).then(([rows]) => rows[0] || null),

  marcar_usado: (token) =>
    db.query(
      'UPDATE password_reset_tokens SET usado = TRUE WHERE token = ?',
      [token]
    ),

  limpiar_expirados: () =>
    db.query(
      'DELETE FROM password_reset_tokens WHERE expira_en < NOW() OR usado = TRUE'
    ),
};

// ══════════════════════════════════════════════════
//  ACTUALIZAR CONTRASEÑA
// ══════════════════════════════════════════════════

// Agregar método en Usuario
Usuario.updateContraseña = (usuario_id, hash) =>
  db.query(
    'UPDATE usuarios SET contrasena_hash = ? WHERE id = ?',
    [hash, usuario_id]
  );

// Agregar método en Sesion
Sesion.revocar_todas = (usuario_id) =>
  db.query(
    'UPDATE sesiones SET activa = 0 WHERE usuario_id = ?',
    [usuario_id]
  );

module.exports = { Usuario, Sesion, Leccion, Progreso, SenaAprendida, Quiz, ResultadoQuiz, Actividad, CodigoAutenticacion, Log, PasswordResetToken };
