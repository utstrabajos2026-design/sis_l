/**
 * auth-nav.js  ─  Navegación compartida con autenticación
 * Se incluye en TODAS las páginas.
 */

// ── Rutas base ────────────────────────────────────────────────
const BASE = '';
const API  = BASE + '/api';

// ── Páginas que requieren login ───────────────────────────────
const PAGINAS_PROTEGIDAS = ['practica', 'quiz', 'progreso', 'extension', 'lecciones'];

// ── Gestión del token JWT ─────────────────────────────────────
const Auth = {
  getToken:     () => localStorage.getItem('sis_l_token'),
  getUsuario:   () => { try { return JSON.parse(localStorage.getItem('sis_l_usuario')); } catch { return null; } },
  estaLogueado: () => !!localStorage.getItem('sis_l_token'),

  cerrarSesion() {
    localStorage.removeItem('sis_l_token');
    localStorage.removeItem('sis_l_usuario');
    window.location.href = BASE + '/index.html';
  }
};

// ── Proteger página solo si está en la lista ──────────────────
function protegerPagina() {
  const ruta = window.location.pathname;
  const necesitaLogin = PAGINAS_PROTEGIDAS.some(p => ruta.includes(p));

  if (necesitaLogin && !Auth.estaLogueado()) {
    localStorage.setItem('sis_l_redirect', window.location.href);
    // Usar ruta relativa que funcione desde cualquier ubicación
    const enPages = window.location.pathname.includes('/pages/');
    const redirect = enPages ? '../acceso_requerido.html' : './acceso_requerido.html';
    window.location.href = redirect;
    return false;
  }
  return true;
}

// ── Inyectar nav con usuario logueado ─────────────────────────
function inyectarNav(paginaActiva = '') {
  const usuario = Auth.getUsuario();

  const enPages = window.location.pathname.includes('/pages/');
  const prefix  = enPages ? '..' : '.';

  const ROL_CONFIG = {
    estudiante: { icon: '🎓', color: 'rgba(99,255,180,.12)',  border: 'rgba(99,255,180,.2)',  text: '#63FFB4' },
    docente:    { icon: '📚', color: 'rgba(99,200,255,.12)',  border: 'rgba(99,200,255,.2)',  text: '#63C8FF' },
    admin:      { icon: '⚙️',  color: 'rgba(255,200,99,.12)', border: 'rgba(255,200,99,.2)',  text: '#FFD063' },
    oyente:     { icon: '👂', color: 'rgba(200,160,255,.12)', border: 'rgba(200,160,255,.2)', text: '#C8A0FF' },
  };
  const rc = ROL_CONFIG[usuario?.rol] || { icon: '👤', color: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.12)', text: 'var(--text)' };

  const progresoLabel = usuario?.rol === 'docente' ? 'Mis Grupos' :
                        usuario?.rol === 'admin'    ? 'Panel Admin' : 'Mi Progreso';

  const nav = document.getElementById('nav-principal');
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-logo" href="${prefix}/index.html">🤟 <span>SIS</span>-L</a>

    <div class="nav-links">
      <a href="${prefix}/index.html"            ${paginaActiva==='inicio'    ?'class="active"':''}>Inicio</a>
      <a href="${prefix}/pages/lecciones.html"  ${paginaActiva==='lecciones' ?'class="active"':''}>Lecciones</a>
      <a href="${prefix}/pages/practica.html"   ${paginaActiva==='practica'  ?'class="active"':''}>Práctica</a>
      <a href="${prefix}/pages/quiz.html"       ${paginaActiva==='quiz'      ?'class="active"':''}>Quiz</a>
      <a href="${prefix}/pages/extension.html"  ${paginaActiva==='extension' ?'class="active"':''}>Extensión</a>
      <a href="${prefix}/pages/chatbot.html"    ${paginaActiva==='chatbot'   ?'class="active"':''}>Chatbot</a>
      <a href="${prefix}/pages/progreso.html"   ${paginaActiva==='progreso'  ?'class="active"':''}>${progresoLabel}</a>
    </div>

    <div class="nav-usuario">
      ${usuario ? `
        <span class="nav-nombre">${rc.icon} ${usuario.nombre}</span>
        <span class="nav-rol" style="background:${rc.color};color:${rc.text};border-color:${rc.border}">
          ${usuario.rol}
        </span>
        <button class="nav-logout" onclick="Auth.cerrarSesion()">Cerrar sesión</button>
      ` : `
        <a class="nav-cta" href="${prefix}/pages/login.html">Ingresar →</a>
      `}
    </div>
  `;
}

// ── Estilos del nav ───────────────────────────────────────────
(function agregarEstilosNav() {
  if (document.getElementById('auth-nav-styles')) return;
  const style = document.createElement('style');
  style.id = 'auth-nav-styles';
  style.textContent = `
    .nav-usuario {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-nombre {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }
    .nav-rol {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 100px;
      border: 1px solid;
    }
    .nav-logout {
      background: rgba(255,99,99,.1);
      border: 1px solid rgba(255,99,99,.25);
      color: #FF6363;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 12px;
      padding: 7px 16px;
      border-radius: 100px;
      cursor: pointer;
      transition: all .2s;
    }
    .nav-logout:hover { background: rgba(255,99,99,.2); }
    .nav-cta {
      background: var(--accent);
      color: var(--bg);
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 22px;
      border-radius: 100px;
      text-decoration: none;
      transition: all .25s;
    }
    .nav-cta:hover { opacity: .85; }
    @media(max-width:768px){
      .nav-nombre, .nav-rol { display: none; }
    }
  `;
  document.head.appendChild(style);
})();