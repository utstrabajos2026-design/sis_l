/**
 * watcher/index.js  ─  CAPA WATCHER
 * ─────────────────────────────────────────────────────────────
 * Contiene TODA la lógica de negocio del sistema.
 * Observa eventos y reacciona actualizando el Model.
 * NUNCA devuelve HTML. Solo devuelve objetos JS planos.
 * La View (rutas Express) llama a estos métodos y serializa a JSON.
 *
 * Flujo MVW:
 *   View (req/res)  →  Watcher (lógica)  →  Model (SQL)
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Usuario, Sesion, Leccion, Progreso, SenaAprendida,
        Quiz, ResultadoQuiz, Actividad, CodigoAutenticacion, Log, PasswordResetToken } = require('../model');
const { enviarCodigoAutenticacion } = require('../config/email');

const JWT_SECRET  = process.env.JWT_SECRET  || 'secreto_dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

// ── Helper interno ────────────────────────────────────────────
function ok(data)        { return { ok: true,  ...data }; }
function fail(msg, code) { return { ok: false, error: msg, code: code || 400 }; }

// ══════════════════════════════════════════════════════════════
//  AUTH WATCHER  (RF01 - Autenticación, RF02 - Registro)
// ══════════════════════════════════════════════════════════════

const AuthWatcher = {

  // RF02 - Registro
  async registrar({ documento, nombre, apellido, correo, contrasena, rol }) {
    if (!documento || !nombre || !apellido || !correo || !contrasena)
      return fail('Todos los campos son obligatorios');

    const existeCorreo = await Usuario.findByCorreo(correo);
    if (existeCorreo) return fail('El correo ya está registrado');

    const existeDoc = await Usuario.findByDocumento(documento);
    if (existeDoc) return fail('El documento ya está registrado');

    // RNF-S4: contraseña hasheada con bcrypt (salt 10)
    const hash = await bcrypt.hash(contrasena, 10);
    const id   = await Usuario.create({ documento, nombre, apellido, correo, hash, rol });

    await Log.write('INFO', 'AuthWatcher', `Nuevo usuario registrado: ${correo}`, id);
    return ok({ mensaje: 'Registro exitoso', usuario_id: id });
  },

  // RF01 - Login
  async login({ correo, contrasena, ip }) {
    const usuario = await Usuario.findByCorreo(correo);
    if (!usuario) return fail('Credenciales inválidas', 401);

    const valido = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!valido) {
      await Log.write('WARNING', 'AuthWatcher', `Login fallido: ${correo}`);
      return fail('Credenciales inválidas', 401);
    }

    // Generar JWT (RNF-S1: transmisión segura via HTTPS)
    const token    = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const expires  = new Date(Date.now() + 8 * 3600 * 1000);
    await Sesion.create(usuario.id, token, ip, expires);

    // Registrar actividad del día
    await Actividad.registrar(usuario.id);

    await Log.write('INFO', 'AuthWatcher', `Login exitoso: ${correo}`, usuario.id);
    return ok({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol }
    });
  },

  // Verificar token JWT
  verificarToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },

  async logout(token) {
    await Sesion.cerrar(token);
    return ok({ mensaje: 'Sesión cerrada' });
  },

  // Enviar código de autenticación por correo
  async enviarCodigoAutenticacion(correo) {
    if (!correo) return fail('Correo requerido');

    // Verificar que el usuario exista
    const usuario = await Usuario.findByCorreo(correo);
    if (!usuario) return fail('Este correo no está registrado', 404);

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en base de datos
    await CodigoAutenticacion.guardar(correo, codigo);

    // Enviar correo
    const enviado = await enviarCodigoAutenticacion(correo, codigo);
    if (!enviado && process.env.NODE_ENV === 'production') {
      return fail('Error al enviar código. Intenta de nuevo más tarde');
    }

    await Log.write('INFO', 'AuthWatcher', `Código de autenticación enviado a: ${correo}`);
    return ok({ mensaje: 'Código enviado al correo electrónico' });
  },

  // Verificar código de autenticación
  async verificarCodigoAutenticacion(correo, codigo) {
    if (!correo || !codigo) return fail('Correo y código requeridos');

    // Obtener el código almacenado
    const data = await CodigoAutenticacion.obtener(correo);
    if (!data) return fail('Código no encontrado o expirado', 404);

    // Verificar expiración
    const ahora = new Date();
    if (ahora > new Date(data.expira_en)) {
      return fail('Código expirado. Solicita un nuevo código');
    }

    // Verificar intentos
    if (data.intentos_restantes <= 0) {
      await CodigoAutenticacion.marcar_usado(correo);
      return fail('Demasiados intentos. Solicita un nuevo código');
    }

    // Verificar código
    if (codigo !== data.codigo) {
      await CodigoAutenticacion.descontar_intento(correo);
      const intentosRestantes = data.intentos_restantes - 1;
      return fail(
        `Código incorrecto. ${intentosRestantes} intento(s) restante(s)`,
        400
      );
    }

    // Código correcto - marcar como usado
    await CodigoAutenticacion.marcar_usado(correo);

    // Obtener usuario y generar token JWT
    const usuario = await Usuario.findByCorreo(correo);
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const expires = new Date(Date.now() + 8 * 3600 * 1000);
    
    // Crear sesión
    await Sesion.create(usuario.id, token, null, expires);
    await Actividad.registrar(usuario.id);

    await Log.write('INFO', 'AuthWatcher', `Login por código exitoso: ${correo}`, usuario.id);
    return ok({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol }
    });
  },

  // Solicitar recuperación de contraseña
  async solicitarRecuperacion(correo) {
    if (!correo) return fail('Correo requerido');

    // Verificar que el usuario exista
    const usuario = await Usuario.findByCorreo(correo);
    if (!usuario) return fail('Este correo no está registrado', 404);

    // Generar token seguro de 64 caracteres hexadecimales
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expira_en = new Date(Date.now() + 3600 * 1000); // 1 hora

    // Guardar token en BD
    await PasswordResetToken.guardar(usuario.id, token, expira_en);

    // Obtener config de email
    const { enviarLinkRecuperacion } = require('../config/email');

    // Construir link de recuperación
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/pages/reset-password.html?token=${token}`;

    // Enviar correo
    const enviado = await enviarLinkRecuperacion(correo, usuario.nombre, resetLink);
    if (!enviado && process.env.NODE_ENV === 'production') {
      return fail('Error al enviar email de recuperación. Intenta de nuevo más tarde');
    }

    await Log.write('INFO', 'AuthWatcher', `Recuperación solicitada: ${correo}`, usuario.id);
    return ok({ mensaje: 'Link de recuperación enviado al correo electrónico' });
  },

  // Resetear contraseña con token
  async resetearContraseña(token, nuevaContrasena) {
    if (!token || !nuevaContrasena) return fail('Token y contraseña requeridos');

    // Validar token
    const data = await PasswordResetToken.obtener(token);
    if (!data) return fail('Token inválido o no encontrado', 404);

    // Verificar expiración
    const ahora = new Date();
    if (ahora > new Date(data.expira_en)) {
      return fail('Link expirado. Solicita un nuevo enlace de recuperación');
    }

    // Verificar que no haya sido usado
    if (data.usado) {
      return fail('Este link ya fue utilizado. Solicita un nuevo enlace de recuperación');
    }

    // Hash de la nueva contraseña
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar contraseña
    await Usuario.updateContraseña(data.usuario_id, hash);

    // Marcar token como usado
    await PasswordResetToken.marcar_usado(token);

    // Revocar todas las sesiones del usuario
    await Sesion.revocar_todas(data.usuario_id);

    await Log.write('INFO', 'AuthWatcher', `Contraseña reseteada`, data.usuario_id);
    return ok({ mensaje: 'Contraseña actualizada exitosamente' });
  },

  // Validar token de reset (sin consumirlo)
  async validarTokenReset(token) {
    if (!token) return fail('Token requerido');

    const data = await PasswordResetToken.obtener(token);
    if (!data) return fail('Token inválido o no encontrado', 404);

    // Verificar expiración
    const ahora = new Date();
    if (ahora > new Date(data.expira_en)) {
      return fail('Link expirado. Solicita un nuevo enlace de recuperación');
    }

    // Verificar que no haya sido usado
    if (data.usado) {
      return fail('Este link ya fue utilizado. Solicita un nuevo enlace de recuperación');
    }

    return ok({ mensaje: 'Token válido' });
  },

  // Eliminar cuenta del usuario
  async eliminarCuenta(usuario_id) {
    // Obtener info del usuario para logging
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) return fail('Usuario no encontrado', 404);

    // Revocar todas las sesiones del usuario
    await Sesion.revocar_todas(usuario_id);

    // Eliminar al usuario de la base de datos
    await Usuario.delete(usuario_id);

    // Registrar la acción
    await Log.write('INFO', 'AuthWatcher', `Cuenta eliminada: ${usuario.correo}`, usuario_id);
    
    return ok({ mensaje: 'Cuenta eliminada exitosamente' });
  }
};

// ══════════════════════════════════════════════════════════════
//  APRENDIZAJE WATCHER  (Lecciones, Señas, Progreso)
// ══════════════════════════════════════════════════════════════

const AprendizajeWatcher = {

  // RF03 - Consultar lecciones
  async getLecciones() {
    const lecciones = await Leccion.findAll();
    return ok({ lecciones });
  },

  // Marcar lección como completada
  async completarLeccion(usuario_id, leccion_clave) {
    const leccion = await Leccion.findByClave(leccion_clave);
    if (!leccion) return fail('Lección no encontrada', 404);

    await Progreso.upsert(usuario_id, leccion.id, 'completado', 100);
    await Actividad.registrar(usuario_id);
    await Log.write('INFO', 'AprendizajeWatcher', `Lección completada: ${leccion_clave}`, usuario_id);
    return ok({ mensaje: 'Lección completada', leccion: leccion_clave });
  },

  // Guardar seña aprendida
  async guardarSena(usuario_id, categoria, clave) {
    await SenaAprendida.save(usuario_id, categoria, clave);
    await Actividad.registrar(usuario_id);
    return ok({ guardado: true });
  },

  // Obtener progreso completo del usuario
  async getProgreso(usuario_id) {
    const [progreso, senas, racha, actividadLog] = await Promise.all([
      Progreso.findByUsuario(usuario_id),
      SenaAprendida.findByUsuario(usuario_id),
      Actividad.getRacha(usuario_id),
      Actividad.getLog(usuario_id, 21)
    ]);
    return ok({ progreso, senas, racha, actividadLog });
  }
};

// ══════════════════════════════════════════════════════════════
//  QUIZ WATCHER
// ══════════════════════════════════════════════════════════════

const QuizWatcher = {

  async getQuizzes(usuario_id) {
    const quizzes     = await Quiz.findAll();
    const resultados  = await ResultadoQuiz.findByUsuario(usuario_id);

    // Adjuntar último resultado a cada quiz
    const quizzesConResultado = quizzes.map(q => {
      const ultimo = resultados.find(r => r.quiz_id === q.id);
      return { ...q, ultimo_resultado: ultimo || null };
    });

    return ok({ quizzes: quizzesConResultado });
  },

  async guardarResultado(usuario_id, { quiz_clave, puntaje, total, duracion_seg }) {
    const quiz = await Quiz.findByClave(quiz_clave);
    if (!quiz) return fail('Quiz no encontrado', 404);

    const resultado = await ResultadoQuiz.save(usuario_id, quiz.id, puntaje, total, duracion_seg);
    await Actividad.registrar(usuario_id);

    await Log.write('INFO', 'QuizWatcher',
      `Quiz ${quiz_clave}: ${resultado.porcentaje}% - ${resultado.aprobado ? 'APROBADO' : 'REPROBADO'}`,
      usuario_id
    );
    return ok({ ...resultado, mensaje: resultado.aprobado ? '¡Aprobado!' : 'Sigue practicando' });
  },

  async getHistorial(usuario_id) {
    const historial = await ResultadoQuiz.findByUsuario(usuario_id);
    return ok({ historial });
  }
};

// ══════════════════════════════════════════════════════════════
//  DASHBOARD WATCHER  (Progreso completo para la pantalla)
// ══════════════════════════════════════════════════════════════

const DashboardWatcher = {

  async getDashboard(usuario_id) {
    const [usuario, progreso, historialQuiz, racha, actividadLog, totalSenas] = await Promise.all([
      Usuario.findById(usuario_id),
      Progreso.findByUsuario(usuario_id),
      ResultadoQuiz.findByUsuario(usuario_id),
      Actividad.getRacha(usuario_id),
      Actividad.getLog(usuario_id, 21),
      SenaAprendida.countByUsuario(usuario_id)
    ]);

    const leccionesCompletadas = progreso.filter(p => p.estado === 'completado').length;
    const quizzesAprobados     = historialQuiz.filter(r => r.aprobado).length;

    return ok({
      usuario,
      stats: { leccionesCompletadas, totalSenas, racha, quizzesAprobados },
      progreso,
      historialQuiz,
      actividadLog
    });
  }
};

module.exports = { AuthWatcher, AprendizajeWatcher, QuizWatcher, DashboardWatcher };
