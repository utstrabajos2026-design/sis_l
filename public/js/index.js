/**
 * index.js  —  Lógica exclusiva de la página de inicio
 */

document.addEventListener('DOMContentLoaded', () => {

  //  cargar nav
  
  inyectarNav('inicio');

  // ── Proteger acceso a páginas autenticadas ──────────
  const PAGINAS_PROTEGIDAS = ['lecciones', 'practica', 'quiz', 'progreso', 'extension'];
  
  document.querySelectorAll('a.btn-primary, a.btn-ghost, a.module-card').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const necesitaAuth = PAGINAS_PROTEGIDAS.some(p => href.includes(p));
      
      if (necesitaAuth && !Auth.estaLogueado()) {
        e.preventDefault();
        localStorage.setItem('sis_l_redirect', href);
        window.location.href = '/pages/login.html';
      }
    });
  });

  // ── Animación del hero sign ──────────────────────────
  const signs = ['🤟','🖐','✌️','👌','🤙','👏','🤝','🙌'];
  let i = 0;
  const heroEl = document.getElementById('heroSign');
  if (heroEl) {
    heroEl.style.transition = 'all .3s';
    setInterval(() => {
      i = (i + 1) % signs.length;
      heroEl.style.transform = 'scale(.8)';
      heroEl.style.opacity   = '0';
      setTimeout(() => {
        heroEl.textContent     = signs[i];
        heroEl.style.transform = 'scale(1)';
        heroEl.style.opacity   = '1';
      }, 300);
    }, 2500);
  }

  // ── Cargar progreso visual en las tarjetas ───────────
  const cards         = document.querySelectorAll('.progress-fill');
  const savedProgress = JSON.parse(localStorage.getItem('sis_progress') || '{}');
  const levels        = ['basico','saludos','frases','practica','quiz','progreso'];
  cards.forEach((fill, idx) => {
    const p = savedProgress[levels[idx]] || 0;
    setTimeout(() => { fill.style.width = p + '%'; }, 300 + idx * 100);
  });

});
