/**
 * progreso.js  —  Dashboard de progreso del usuario
 */

const LESSON_META = [
  { key:'alfabeto',  name:'Alfabeto dactilológico', icon:'🔤', color:'var(--accent)',         total:27 },
  { key:'saludos',   name:'Saludos y presentaciones',icon:'👋', color:'var(--accent-blue)',   total:12 },
  { key:'numeros',   name:'Números 0–10',             icon:'🔢', color:'var(--accent-gold)',  total:11 },
  { key:'frases',    name:'Frases comunes',            icon:'💬', color:'var(--accent-purple)',total:10 },
  { key:'colores',   name:'Colores',                  icon:'🎨', color:'var(--accent-coral)', total:8  },
  { key:'familia',   name:'Familia',                  icon:'👨‍👩‍👧', color:'var(--accent-gold)', total:8  },
  { key:'emociones', name:'Emociones',                icon:'😊', color:'var(--accent)',        total:8  },
  { key:'preguntas', name:'Preguntas',                icon:'❓', color:'var(--accent-blue)',   total:7  },
];

const ACHIEVEMENTS = [
  { id:'first_lesson',  icon:'🌱', name:'Primer paso',    desc:'Completa tu primera lección',           check: p => Object.keys(p.lessons||{}).length >= 1 },
  { id:'all_basic',     icon:'⭐', name:'Nivel básico',   desc:'Completa las 3 lecciones básicas',       check: p => ['alfabeto','saludos','numeros'].every(k => p.lessons?.[k]?.done) },
  { id:'quiz_pass',     icon:'🏆', name:'Aprobado',        desc:'Aprueba tu primer quiz',                 check: p => (p.quizResults||[]).some(r => r.passed) },
  { id:'perfect_quiz',  icon:'💯', name:'Perfecto',        desc:'Obtén 100% en cualquier quiz',           check: p => (p.quizResults||[]).some(r => r.pct === 100) },
  { id:'streak5',       icon:'🔥', name:'En llamas',       desc:'Alcanza una racha de 5 consecutivas',   check: p => (p.streak||0) >= 5 },
  { id:'all_lessons',   icon:'🎓', name:'Graduado',         desc:'Completa las 8 lecciones del módulo',  check: p => Object.keys(p.lessons||{}).filter(k => p.lessons[k].done).length >= 8 },
  { id:'5_quizzes',     icon:'📝', name:'Estudiante',      desc:'Completa 5 quizzes',                    check: p => (p.quizResults||[]).length >= 5 },
  { id:'daily_3',       icon:'📅', name:'Constancia',      desc:'Practica 3 días diferentes',            check: p => (p.activityLog||[]).length >= 3 },
];

document.addEventListener('DOMContentLoaded', () => {
  const p = getProgress();
  renderStats(p);
  renderLessonsTable(p);
  renderQuizHistory(p);
  renderRachaGrid(p);
  renderAchievements(p);
});

function renderStats(p) {
  const doneLessons = Object.keys(p.lessons || {}).filter(k => p.lessons[k].done).length;
  const learnedSigns = Object.keys(p.learnedSigns || {}).length;
  const quizzesPassed = (p.quizResults || []).filter(r => r.passed).length;
  const streak = p.streak || 0;

  animateNum('statLecciones', doneLessons);
  animateNum('statSenas',     learnedSigns);
  animateNum('statRacha',     streak);
  animateNum('statQuizzes',   quizzesPassed);
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n;
    if (n >= target) clearInterval(t);
  }, 40);
}

function renderLessonsTable(p) {
  const container = document.getElementById('lessonsTable');
  if (!container) return;
  const done = p.lessons || {};

  container.innerHTML = LESSON_META.map(m => {
    const isDone  = done[m.key]?.done;
    const learned = Object.keys(p.learnedSigns || {}).filter(k => k.startsWith(m.key + '_')).length;
    const pct     = isDone ? 100 : Math.round((learned / m.total) * 100);
    return `
      <div class="lesson-row">
        <span class="lr-icon">${m.icon}</span>
        <div class="lr-info">
          <div class="lr-name">${m.name}</div>
          <div class="lr-sub">${learned} / ${m.total} señas aprendidas</div>
        </div>
        <div class="lr-progress">
          <div class="lr-pct" style="color:${m.color}">${pct}%</div>
          <div class="progress" style="height:4px">
            <div class="progress-bar" style="width:${pct}%;background:${m.color}"></div>
          </div>
        </div>
        <span class="lr-status">${isDone ? '✅' : pct > 0 ? '🔄' : '⬜'}</span>
      </div>`;
  }).join('');
}

function renderQuizHistory(p) {
  const container = document.getElementById('quizHistoryTable');
  const noHistory = document.getElementById('noQuizHistory');
  const results   = (p.quizResults || []).slice().reverse();
  if (!results.length) return;
  if (noHistory) noHistory.style.display = 'none';

  const QUIZ_NAMES = Object.fromEntries(QUIZZES.map(q => [q.id, q.title]));
  container.innerHTML = results.slice(0, 10).map(r => {
    const date = new Date(r.date).toLocaleDateString('es-CO', { day:'2-digit', month:'short' });
    return `
      <div class="qh-row">
        <span class="qh-name">${QUIZ_NAMES[r.quizId] || r.quizId}</span>
        <span class="qh-score ${r.passed ? 'pass' : 'fail'}">${r.pct}%</span>
        <span style="font-size:12px">${r.score}/${r.total} correctas</span>
        <span class="qh-date">${date}</span>
      </div>`;
  }).join('');
}

function renderRachaGrid(p) {
  const grid = document.getElementById('rachaGrid');
  if (!grid) return;
  const log = p.activityLog || [];
  const dots = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const active  = log.includes(ds);
    const partial = !active && log.some(l => {
      const ld = new Date(l);
      return Math.abs(ld - d) < 86400000 * 2;
    });
    dots.push(`<div class="day-dot ${active ? 'active' : partial ? 'partial' : ''}" title="${ds}"></div>`);
  }
  grid.innerHTML = dots.join('');
}

function renderAchievements(p) {
  const container = document.getElementById('achievementsGrid');
  if (!container) return;
  container.innerHTML = ACHIEVEMENTS.map(a => {
    const earned = a.check(p);
    return `
      <div class="achieve-card ${earned ? 'earned' : 'locked'}">
        <span class="achieve-icon">${a.icon}</span>
        <div class="achieve-name">${a.name}</div>
        <div class="achieve-desc">${a.desc}</div>
        ${earned ? '<div style="font-size:11px;color:var(--accent-gold);margin-top:6px">✅ Desbloqueado</div>' : ''}
      </div>`;
  }).join('');
}

window.resetProgress = function() {
  if (confirm('¿Seguro? Se borrará todo tu progreso guardado.')) {
    // Usa la misma clave dinámica que usa app.js
    try {
      const u = JSON.parse(localStorage.getItem('sis_l_usuario') || 'null');
      const key = (u && u.id && u.rol)
        ? 'sis_l_progress_v1__' + u.rol + '_' + u.id
        : 'sis_l_progress_v1';
      localStorage.removeItem(key);
    } catch { localStorage.removeItem('sis_l_progress_v1'); }
    location.reload();
  }
};

window.deleteAccount = function() {
  const confirmMsg = '⚠️ ADVERTENCIA: Esto eliminará tu cuenta permanentemente y no se puede deshacer. ¿Estás seguro?';
  if (!confirm(confirmMsg)) return;

  const doubleConfirm = 'Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta:';
  const userInput = prompt(doubleConfirm);
  
  if (userInput !== 'ELIMINAR') {
    showToast('Eliminación cancelada', 'error');
    return;
  }

  // Obtener el token
  const token = localStorage.getItem('sis_l_token');
  if (!token) {
    showToast('No se encontró token de sesión', 'error');
    return;
  }

  // Llamar a la API para eliminar la cuenta
  fetch('/api/auth/eliminar-cuenta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        showToast('Cuenta eliminada. Redirigiendo...', 'success');
        // Limpiar localStorage
        localStorage.removeItem('sis_l_token');
        localStorage.removeItem('sis_l_usuario');
        try {
          const u = JSON.parse(localStorage.getItem('sis_l_usuario') || 'null');
          const key = (u && u.id && u.rol)
            ? 'sis_l_progress_v1__' + u.rol + '_' + u.id
            : 'sis_l_progress_v1';
          localStorage.removeItem(key);
        } catch { localStorage.removeItem('sis_l_progress_v1'); }
        // Redirigir al login después de 1.5 segundos
        setTimeout(() => {
          window.location.href = '../pages/login.html';
        }, 1500);
      } else {
        showToast(data.error || 'Error al eliminar cuenta', 'error');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      showToast('Error al conectar con el servidor', 'error');
    });
};
