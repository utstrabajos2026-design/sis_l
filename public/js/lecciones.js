/**
 * lecciones.js  —  Lógica de la página de Lecciones (Capa WATCHER en MVW)
 * Observa interacciones del usuario y actualiza la View reactivamente.
 */

// ── Estado actual ──────────────────────────────────────────
let currentModal = null;
const TOTAL_LESSONS = 8;

// ── Construir grillas ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Verificar lecciones activas en BD y ocultar las inactivas
  fetch('http://localhost/sis_l_fullstack/api.php?action=getLecciones')
    .then(res => res.json())
    .then(data => {
      if (!data.ok) return;
      const activasEnBD = data.lecciones.map(l => l.clave);
      const todasLasClaves = ['alfabeto','saludos','numeros','frases','colores','familia','emociones','preguntas'];
      todasLasClaves.forEach(clave => {
        if (!activasEnBD.includes(clave)) {
          const btn = document.querySelector(`[onclick="showLesson('${clave}')"]`);
          if (btn) btn.style.display = 'none';
          const seccion = document.getElementById('lesson-' + clave);
          if (seccion) seccion.style.display = 'none';
        }
      });
    })
    .catch(() => {});

  buildAlphabet();
  buildGrid('saludosGrid',   LSC_DATA.saludos,   '#63C8FF');
  buildGrid('numerosGrid',   LSC_DATA.numeros,   '#63FFB4');
  buildGrid('frasesGrid',    LSC_DATA.frases,    '#C8A0FF');
  buildGrid('coloresGrid',   LSC_DATA.colores,   '#FF8A63');
  buildGrid('familiaGrid',   LSC_DATA.familia,   '#FFD063');
  buildGrid('emocionesGrid', LSC_DATA.emociones, '#63FFD0');
  buildGrid('preguntasGrid', LSC_DATA.preguntas, '#63C8FF');
  updateSidebarChecks();
  updateTotalProgress();
  applyUrlParam();
});

function applyUrlParam() {
  const p = new URLSearchParams(window.location.search).get('nivel');
  if (p) showLesson(p);
}

// ── Alfabeto ────────────────────────────────────────────────
function buildAlphabet() {
  const grid = document.getElementById('alphabetGrid');
  if (!grid) return;
  const prog = getProgress();
  grid.innerHTML = LSC_DATA.alfabeto.map(item => {
    const learned = prog.learnedSigns?.['alfabeto_' + item.letra];
    return `
      <div class="alpha-card ${learned ? 'learned' : ''}"
           onclick="openModal('${item.letra}','${item.emoji}','${item.desc}','${item.tip}','alfabeto')">
        ${learned ? '<span class="learned-badge">✅</span>' : ''}
        <span class="alpha-letter">${item.letra}</span>
        <span class="alpha-emoji">${item.emoji}</span>
        <span class="alpha-desc">${item.desc.substring(0,24)}…</span>
      </div>`;
  }).join('');
}

// ── Grilla genérica de señas ────────────────────────────────
function buildGrid(containerId, data, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map((item, i) => `
    <div class="lesson-sign-card"
         style="--card-color:${color}"
         onclick="openModal('${item.word}','${item.emoji}','${item.desc.replace(/'/g,"\\'")}','${item.tip.replace(/'/g,"\\'")}','${containerId}')">
      <span class="lsc-emoji">${item.emoji}</span>
      <div class="lsc-word">${item.word}</div>
      <div class="lsc-desc">${item.desc}</div>
      <div class="lsc-tip">💡 ${item.tip}</div>
    </div>`
  ).join('');
}

// ── Modal ────────────────────────────────────────────────────
window.openModal = function(letter, emoji, desc, tip, category) {
  currentModal = { letter, emoji, desc, tip, category };
  document.getElementById('modalSign').textContent   = emoji;
  document.getElementById('modalLetter').textContent = letter;
  document.getElementById('modalWord').textContent   = desc;
  document.getElementById('modalTip').innerHTML =
    `<strong style="color:var(--accent-gold)">💡 Consejo:</strong> ${tip}`;
  document.getElementById('modalOverlay').classList.add('open');
};

window.closeModal = function(e) {
  if (!e || e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
};

window.learnedThis = function() {
  if (!currentModal) return;
  saveLearnedSign(currentModal.category, currentModal.letter);
  showToast(`✅ "${currentModal.letter}" marcada como aprendida`, 'success');
  closeModal();
  buildAlphabet();
};

// ── Navegación de lecciones ─────────────────────────────────
window.showLesson = function(name) {
  document.querySelectorAll('.lesson-view').forEach(v => v.style.display = 'none');
  const target = document.getElementById('lesson-' + name);
  if (target) { target.style.display = 'block'; target.scrollIntoView({ behavior:'smooth', block:'start' }); }
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[onclick="showLesson('${name}')"]`);
  if (btn) btn.classList.add('active');
};

// ── Marcar lección completada ────────────────────────────────
window.markDone = function(key) {
  markLessonDone(key);
  updateSidebarChecks();
  updateTotalProgress();
  showToast('🎉 ¡Lección completada! Sigue aprendiendo.', 'success');

  const usuario = Auth.getUsuario();
  if (!usuario) return;

  fetch('http://localhost/sis_l_fullstack/api.php?action=getLeccionId&clave=' + key)
    .then(res => res.json())
    .then(data => {
      if (!data.ok || !data.leccion_id) return;
      return fetch('http://localhost/sis_l_fullstack/api.php?action=completarLeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          leccion_id: data.leccion_id
        })
      });
    })
    .catch(() => {});
};

// ── Actualizar sidebar ───────────────────────────────────────
function updateSidebarChecks() {
  const p = getProgress();
  const done = p.lessons || {};
  const keys = ['alfabeto','saludos','numeros','frases','colores','familia','emociones','preguntas'];
  keys.forEach(k => {
    const el = document.getElementById('chk-' + k);
    if (el) el.textContent = done[k]?.done ? '✅' : '';
  });
}

function updateTotalProgress() {
  const p = getProgress();
  const done = Object.keys(p.lessons || {}).filter(k => p.lessons[k].done).length;
  const pct = Math.round((done / TOTAL_LESSONS) * 100);
  const bar = document.getElementById('totalProgress');
  const txt = document.getElementById('progressText');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = `${done} / ${TOTAL_LESSONS} lecciones`;
}