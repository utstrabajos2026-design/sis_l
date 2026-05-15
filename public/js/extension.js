/**
 * extension.js  —  Lógica exclusiva de la página extensión / modo práctica
 */

document.addEventListener('DOMContentLoaded', () => {
  protegerPagina();
  inyectarNav('extension');

  // Inicializar dictado al cargar
  dictCards = shuffle(flatCards());
  showDictCard();

  // Restaurar estadísticas desde progreso guardado
  const p = window.getProgress();
  dOk     = p.ext_dictado_ok     || 0;
  dStreak = p.ext_dictado_streak || 0;
  updateDictStats();
});

// ══ NAVEGACIÓN DE TABS ══════════════════════════════════════
function setExtMode(mode) {
  document.querySelectorAll('.ext-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ext-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('extTab-' + mode).classList.add('active');
  document.getElementById('panel-' + mode).classList.add('active');
  if (mode === 'reto') renderReto();
}

// ══ HELPERS ═════════════════════════════════════════════════
function flatCards() {
  const arr = [];
  Object.entries(LSC_DATA).forEach(([cat, items]) => {
    items.forEach(it => arr.push({
      cat,
      emoji: it.emoji,
      word:  (it.word || it.letra || '').toString().toUpperCase(),
      desc:  it.desc || '',
    }));
  });
  return arr;
}
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

// ══ DICTADO ══════════════════════════════════════════════════
let dictCards = [], dictIdx = 0, dOk = 0, dFail = 0, dStreak = 0;

function showDictCard() {
  const c = dictCards[dictIdx % dictCards.length];
  document.getElementById('dictadoEmoji').textContent = c.emoji;
  document.getElementById('dictadoCat').textContent   = c.cat;
  document.getElementById('dictadoInput').value       = '';
  document.getElementById('dictadoInput').className   = 'dictado-input';
  document.getElementById('dictadoFb').textContent    = '';
  document.getElementById('dictadoInput').focus();
}

function checkDictado() {
  const c   = dictCards[dictIdx % dictCards.length];
  const inp = document.getElementById('dictadoInput');
  const val = inp.value.trim().toUpperCase();
  const ans = c.word.toUpperCase();
  const fb  = document.getElementById('dictadoFb');
  if (!val) return;

  if (val === ans) {
    inp.classList.add('correct');
    fb.style.color = 'var(--correct)';
    fb.textContent = '✅ ¡Correcto! · ' + c.desc;
    dOk++; dStreak++;
    window.saveLearnedSign(c.cat, c.word);
    setTimeout(nextDictado, 1100);
  } else {
    inp.classList.add('wrong');
    fb.style.color = 'var(--wrong)';
    fb.textContent = '❌ Era: ' + ans;
    dFail++; dStreak = 0;
    setTimeout(nextDictado, 1600);
  }
  updateDictStats();
}

function nextDictado() {
  dictIdx++;
  if (dictIdx >= dictCards.length) { dictCards = shuffle(flatCards()); dictIdx = 0; }
  showDictCard();
}

function showDictadoAnswer() {
  const c  = dictCards[dictIdx % dictCards.length];
  const fb = document.getElementById('dictadoFb');
  fb.style.color = 'var(--accent-gold)';
  fb.textContent = '💡 Respuesta: ' + c.word + (c.desc ? ' · ' + c.desc : '');
}

function updateDictStats() {
  document.getElementById('dStat-ok').textContent     = dOk;
  document.getElementById('dStat-fail').textContent   = dFail;
  document.getElementById('dStat-streak').textContent = dStreak;
}

// ══ VELOCIDAD ════════════════════════════════════════════════
let spCards = [], spIdx = 0, spScore = 0, spTotal = 10, spSec = 8;
let spTimer = null, spTimeLeft = 0, spRunning = false;

function startSpeed() {
  spTotal  = parseInt(document.getElementById('qSlider').value);
  spSec    = parseInt(document.getElementById('secSlider').value);
  spCards  = shuffle(flatCards()).slice(0, spTotal);
  spIdx    = 0; spScore = 0; spRunning = true;
  document.getElementById('speedConfig').style.display = 'none';
  document.getElementById('speedResult').style.display = 'none';
  document.getElementById('speedGame').style.display   = 'block';
  showSpeedQ();
}

function showSpeedQ() {
  if (spIdx >= spTotal) { endSpeed(); return; }
  clearInterval(spTimer);
  spTimeLeft = spSec;
  const c    = spCards[spIdx];
  const pool = flatCards().filter(x => x.word !== c.word);
  const opts = shuffle([c, ...shuffle(pool).slice(0, 3)]);

  document.getElementById('speedProgress').textContent = `Pregunta ${spIdx + 1}/${spTotal}`;
  document.getElementById('speedScore').textContent    = spScore + ' pts';
  document.getElementById('speedSign').textContent     = c.emoji;
  document.getElementById('speedTimer').textContent    = spTimeLeft;
  document.getElementById('speedTimer').className      = 'speed-timer';
  document.getElementById('speedOptions').innerHTML    = opts.map(o =>
    `<button class="speed-opt" onclick="pickSpeed(this,'${o.word}','${c.word}')">${o.word}</button>`
  ).join('');

  spTimer = setInterval(() => {
    spTimeLeft--;
    const el = document.getElementById('speedTimer');
    el.textContent = spTimeLeft;
    if (spTimeLeft <= 3) el.classList.add('urgent');
    if (spTimeLeft <= 0) {
      clearInterval(spTimer);
      markSpeedOpts(null, c.word);
      setTimeout(() => { spIdx++; showSpeedQ(); }, 900);
    }
  }, 1000);
}

function pickSpeed(btn, chosen, correct) {
  if (!spRunning) return;
  clearInterval(spTimer);
  markSpeedOpts(chosen, correct);
  if (chosen === correct) {
    spScore += Math.max(10, spTimeLeft * 12);
    window.saveLearnedSign(spCards[spIdx].cat, spCards[spIdx].word);
  }
  setTimeout(() => { spIdx++; showSpeedQ(); }, 900);
}

function markSpeedOpts(chosen, correct) {
  document.querySelectorAll('.speed-opt').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct)      b.classList.add('correct-ans');
    else if (b.textContent === chosen)  b.classList.add('wrong-ans');
  });
}

function endSpeed() {
  clearInterval(spTimer); spRunning = false;
  document.getElementById('speedGame').style.display   = 'none';
  document.getElementById('speedResult').style.display = 'block';
  document.getElementById('speedFinalScore').textContent = spScore;
  const pct = Math.round((spScore / (spTotal * spSec * 12)) * 100);
  document.getElementById('speedFinalMsg').textContent =
    pct >= 75 ? '🔥 ¡Excelente velocidad de respuesta!' :
    pct >= 40 ? '👍 Buen intento, sigue practicando.'   :
                '💪 Practica más y mejorarás tu tiempo.';
  window.saveQuizResult('ext_velocidad', Math.round(spScore / 100), spTotal);
}

function resetSpeed() {
  document.getElementById('speedGame').style.display   = 'none';
  document.getElementById('speedResult').style.display = 'none';
  document.getElementById('speedConfig').style.display = 'block';
}

// ══ RETO DIARIO ══════════════════════════════════════════════
const RETOS = [
  { id:'r_dictado10',  icon:'✍️', title:'Dictado express',     desc:'Identifica correctamente 10 señas seguidas en el modo Dictado.',  xp:50, check: p => (p.ext_dictado_ok||0) >= 10 },
  { id:'r_speed1',     icon:'⚡', title:'Primera carrera',     desc:'Completa una prueba de velocidad sin importar el puntaje.',        xp:30, check: p => (p.ext_speed_runs||0) >= 1 },
  { id:'r_speed_gold', icon:'🥇', title:'Récord de oro',       desc:'Logra más de 500 puntos en una prueba de velocidad.',             xp:80, check: p => (p.ext_speed_best||0) >= 500 },
  { id:'r_signs30',    icon:'🧠', title:'30 señas aprendidas', desc:'Llega a 30 señas marcadas como aprendidas en cualquier modo.',     xp:60, check: p => Object.keys(p.learnedSigns||{}).length >= 30 },
  { id:'r_streak3',    icon:'🔥', title:'Racha imparable',     desc:'Consigue 3 correctas seguidas en el modo Dictado.',               xp:40, check: p => (p.ext_dictado_streak||0) >= 3 },
  { id:'r_category',   icon:'🎨', title:'Maestro de colores',  desc:'Aprende al menos 5 señas de la categoría Colores.',              xp:35, check: p => Object.keys(p.learnedSigns||{}).filter(k => k.startsWith('colores_')).length >= 5 },
];

const LEVELS = [
  { min:0,    max:100,  label:'Principiante', avatar:'🌱' },
  { min:100,  max:300,  label:'Aprendiz',     avatar:'📚' },
  { min:300,  max:600,  label:'Practicante',  avatar:'✋' },
  { min:600,  max:1000, label:'Avanzado',     avatar:'🌟' },
  { min:1000, max:99999,label:'Experto LSC',  avatar:'🏆' },
];

function renderReto() {
  const p  = window.getProgress();
  const u  = Auth.getUsuario();
  const xp = p.ext_xp || 0;
  const lv = LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[0];

  document.getElementById('xpName').textContent   = u ? u.nombre + ' ' + (u.apellido || '') : 'Usuario';
  document.getElementById('xpLevel').textContent  = 'Nivel ' + (LEVELS.indexOf(lv) + 1) + ' · ' + lv.label;
  document.getElementById('xpPts').textContent    = xp + ' XP';
  document.getElementById('xpAvatar').textContent = lv.avatar;
  const pct = Math.min(100, Math.round(((xp - lv.min) / (lv.max - lv.min)) * 100));
  document.getElementById('xpFill').style.width   = pct + '%';

  const done = p.ext_retos_done || {};
  document.getElementById('retoGrid').innerHTML = RETOS.map(r => {
    const completed = !!done[r.id] || r.check(p);
    return `
      <div class="reto-card ${completed ? 'done' : ''}">
        <div class="reto-icon">${r.icon}</div>
        <div class="reto-title">${r.title}</div>
        <div class="reto-desc">${r.desc}</div>
        <div class="reto-xp">⭐ ${r.xp} XP</div><br/>
        <button class="reto-btn ${completed ? 'completed' : ''}"
                ${completed ? 'disabled' : ''}
                onclick="claimReto('${r.id}',${r.xp})">
          ${completed ? '✅ Completado' : '🎯 Reclamar'}
        </button>
      </div>`;
  }).join('');

  const log = (p.ext_xp_log || []).slice().reverse().slice(0, 8);
  if (log.length) {
    const histMsg = document.getElementById('xpHistMsg');
    if (histMsg) histMsg.style.display = 'none';
    document.getElementById('xpHistory').innerHTML = log.map(e =>
      `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <span>${e.reto}</span>
        <span style="font-family:'Syne',sans-serif;font-weight:800;color:var(--accent-gold)">+${e.xp} XP</span>
      </div>`
    ).join('');
  }
}

function claimReto(id, xp) {
  const p = window.getProgress();
  if ((p.ext_retos_done || {})[id]) return;
  p.ext_retos_done      = p.ext_retos_done || {};
  p.ext_retos_done[id]  = true;
  p.ext_xp              = (p.ext_xp || 0) + xp;
  p.ext_xp_log          = p.ext_xp_log || [];
  const r = RETOS.find(x => x.id === id);
  p.ext_xp_log.push({ reto: r.title, xp, date: new Date().toISOString() });
  window.saveProgress(p);
  showToast('🎉 +' + xp + ' XP · ' + r.title, 'correct');
  renderReto();
}
