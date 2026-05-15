
/**
 * app.js  —  Utilidades globales del módulo SIS-L
 * Toast, persistencia localStorage, helpers compartidos.
 */

// ── TOAST ──────────────────────────────────────────────────
window.showToast = function(msg, type = 'default', dur = 2800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = 'toast show ' + type;
  t.innerHTML = msg;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), dur);
};

// ── STORAGE HELPERS ────────────────────────────────────────
function _getStorageKey() {
  try {
    const u = JSON.parse(localStorage.getItem('sis_l_usuario') || 'null');
    if (u && u.id && u.rol) {
      return 'sis_l_progress_v1__' + u.rol + '_' + u.id;
    }
  } catch {}
  return 'sis_l_progress_v1';
}

window.getProgress = function() {
  try { return JSON.parse(localStorage.getItem(_getStorageKey()) || '{}'); }
  catch { return {}; }
};

window.saveProgress = function(data) {
  const current = window.getProgress();
  const merged  = { ...current, ...data };
  localStorage.setItem(_getStorageKey(), JSON.stringify(merged));
  return merged;
};

window.markLessonDone = function(key) {
  const p = window.getProgress();
  p.lessons = p.lessons || {};
  p.lessons[key] = { done: true, date: new Date().toISOString() };
  p.lastActivity = new Date().toISOString();
  p.activityLog = p.activityLog || [];
  const today = new Date().toDateString();
  if (!p.activityLog.includes(today)) p.activityLog.push(today);
  localStorage.setItem(_getStorageKey(), JSON.stringify(p));
};

window.saveQuizResult = function(quizId, score, total) {
  const p = window.getProgress();
  p.quizResults = p.quizResults || [];
  p.quizResults.push({
    quizId, score, total,
    pct: Math.round((score / total) * 100),
    passed: score >= Math.ceil(total * 0.6),
    date: new Date().toISOString()
  });
  p.lastActivity = new Date().toISOString();
  const today = new Date().toDateString();
  p.activityLog = p.activityLog || [];
  if (!p.activityLog.includes(today)) p.activityLog.push(today);
  localStorage.setItem(_getStorageKey(), JSON.stringify(p));
};

window.saveLearnedSign = function(category, key) {
  const p = window.getProgress();
  p.learnedSigns = p.learnedSigns || {};
  p.learnedSigns[category + '_' + key] = true;
  localStorage.setItem(_getStorageKey(), JSON.stringify(p));

  // También guardar en la BD via PHP
  try {
    const usuario = JSON.parse(localStorage.getItem('sis_l_usuario'));
    if (usuario && usuario.id) {
      fetch('http://localhost/sis_l_fullstack/api.php?action=guardarSena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          categoria:  category,
          clave:      key
        })
      })
      .then(r => r.json())
      .then(d => console.log('Seña guardada BD:', d))
      .catch(e => console.log('ERROR seña:', e));
    }
  } catch(e) { console.log('ERROR auth:', e); }
};

window.saveStreak = function(count) {
  const p = window.getProgress();
  p.streak = count;
  localStorage.setItem(_getStorageKey(), JSON.stringify(p));
};

// ── ANIMATE ON SCROLL ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-fadeUp').forEach(el => {
    el.style.animationPlayState = 'paused';
    obs.observe(el);
  });
});