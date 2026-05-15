/**
 * public/js/api.js  ─  Cliente HTTP del frontend
 * ─────────────────────────────────────────────────────────────
 * Toda llamada al backend pasa por aquí.
 * Maneja el token JWT automáticamente en cada petición.
 * Los archivos de página (lecciones.js, quiz.js, etc.) llaman
 * a estas funciones y reciben datos limpios para mostrar.
 */

// ⬇ URL del backend Express/Node.js
const API_BASE = '/api';

// ── Token JWT en localStorage ─────────────────────────────────
const Token = {
  get:    ()      => localStorage.getItem('sis_l_token'),
  set:    (t)     => localStorage.setItem('sis_l_token', t),
  remove: ()      => localStorage.removeItem('sis_l_token'),
  headers: ()     => ({ 'Content-Type': 'application/json',
                         'Authorization': 'Bearer ' + Token.get() })
};

// ── Fetch helper ──────────────────────────────────────────────
async function call(method, path, body = null) {
  const opts = { method, headers: Token.headers() };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    // Si el token expiró redirigir al login
    if (res.status === 401 && !path.includes('/auth/')) {
      Token.remove();
      window.location.href = '/pages/login.html';
      return null;
    }
    return data;
  } catch (e) {
    console.error('API error:', e);
    return { ok: false, error: 'Error de conexión con el servidor' };
  }
}

// ════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════
const Auth = {
  async login(correo, contrasena) {
    const data = await call('POST', '/auth/login', { correo, contrasena });
    if (data?.ok) {
      Token.set(data.token);
      localStorage.setItem('sis_l_usuario', JSON.stringify(data.usuario));
    }
    return data;
  },

  async registro(datos) {
    return call('POST', '/auth/registro', datos);
  },

  async enviarCodigoAutenticacion(correo) {
    return call('POST', '/auth/enviar-codigo', { correo });
  },

  async solicitarRecuperacion(correo) {
    return call('POST', '/auth/solicitar-recuperacion', { correo });
  },

  async logout() {
    await call('POST', '/auth/logout');
    Token.remove();
    localStorage.removeItem('sis_l_usuario');
    window.location.href = '/pages/login.html';
  },

  getUsuario() {
    try { return JSON.parse(localStorage.getItem('sis_l_usuario')); }
    catch { return null; }
  },

  estaAutenticado() { return !!Token.get(); },

  // Proteger páginas: redirige al login si no hay sesión
  requerirAuth() {
    if (!this.estaAutenticado()) {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
};

// ════════════════════════════════════════════════
//  LECCIONES
// ════════════════════════════════════════════════
const Lecciones = {
  getAll:    ()      => call('GET',  '/lecciones'),
  completar: (clave) => call('POST', '/lecciones/completar', { clave }),
};

// ════════════════════════════════════════════════
//  SEÑAS
// ════════════════════════════════════════════════
const Senas = {
  aprender: (categoria, clave) => call('POST', '/senas/aprender', { categoria, clave }),
};

// ════════════════════════════════════════════════
//  QUIZZES
// ════════════════════════════════════════════════
const Quizzes = {
  getAll:          ()        => call('GET',  '/quizzes'),
  getHistorial:    ()        => call('GET',  '/quizzes/historial'),
  guardarResultado: (datos)  => call('POST', '/quizzes/resultado', datos),
};

// ════════════════════════════════════════════════
//  DASHBOARD / PROGRESO
// ════════════════════════════════════════════════
const Dashboard = {
  get:        ()  => call('GET', '/dashboard'),
  getProgreso: () => call('GET', '/progreso'),
};

// ── Exportar al scope global (accesible desde todos los HTML) ──
window.API    = { Auth, Lecciones, Senas, Quizzes, Dashboard, Token };
window.call   = call;
