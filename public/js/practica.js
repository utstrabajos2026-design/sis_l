/**
 * practica.js  —  Lógica del modo práctica (flashcards + micro-lecciones)
 */

// ── Estado ───────────────────────────────────────────────────
let allCards      = [];
let filteredCards = [];
let cardIndex     = 0;
let isFlipped     = false;
let streakCount   = 0;
let currentFilter = 'todos';
let currentMode   = 'flashcards';

// ── Categorías para el filtro ────────────────────────────────
const CATEGORIES = [
  { key:'todos',    label:'Todos',    data: null },
  { key:'alfabeto', label:'Alfabeto', data: 'alfabeto' },
  { key:'saludos',  label:'Saludos',  data: 'saludos'  },
  { key:'numeros',  label:'Números',  data: 'numeros'  },
  { key:'frases',   label:'Frases',   data: 'frases'   },
  { key:'colores',  label:'Colores',  data: 'colores'  },
];

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildAllCards();
  buildFilterRow();
  applyFilter('todos');
  loadStreak();

  const p = new URLSearchParams(window.location.search).get('modo');
  if (p) applyFilter(p);
});

function buildAllCards() {
  allCards = [];
  Object.entries(LSC_DATA).forEach(([cat, items]) => {
    items.forEach(item => {
      allCards.push({
        category: cat,
        emoji: item.emoji,
        word: item.word || item.letra,
        desc: item.desc,
        tip:  item.tip,
      });
    });
  });
  // mezclar
  allCards.sort(() => Math.random() - .5);
}

function buildFilterRow() {
  const row = document.getElementById('filterRow');
  if (!row) return;
  row.innerHTML = CATEGORIES.map(c => `
    <button class="filter-btn ${c.key === 'todos' ? 'active' : ''}"
            id="filter-${c.key}"
            onclick="applyFilter('${c.key}')">
      ${c.label}
    </button>`).join('');
}

window.applyFilter = function(key) {
  currentFilter = key;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('filter-' + key);
  if (btn) btn.classList.add('active');

  if (key === 'todos') {
    filteredCards = [...allCards];
  } else {
    filteredCards = allCards.filter(c => c.category === key);
  }
  filteredCards.sort(() => Math.random() - .5);
  cardIndex = 0;
  isFlipped = false;
  showCard();
};

// ── Flashcard ─────────────────────────────────────────────────
function showCard() {
  if (!filteredCards.length) return;
  const card = filteredCards[cardIndex];
  const fc   = document.getElementById('flashcard');

  fc.classList.remove('flipped');
  isFlipped = false;

  document.getElementById('fcSign').textContent = card.emoji;
  document.getElementById('fcWord').textContent = card.word;
  document.getElementById('fcDesc').textContent = card.desc;
  document.getElementById('fcTip').innerHTML    = `💡 ${card.tip}`;
  document.getElementById('fcHint').textContent = `Clic para revelar la seña`;
  document.getElementById('fcCounter').textContent =
    `Tarjeta ${cardIndex + 1} de ${filteredCards.length}`;
}

window.flipCard = function() {
  const fc = document.getElementById('flashcard');
  isFlipped = !isFlipped;
  fc.classList.toggle('flipped', isFlipped);
};

window.rateCard = function(knew) {
  if (!isFlipped) {
    showToast('Primero voltea la tarjeta para ver la respuesta 👁', 'default');
    return;
  }
  if (knew) {
    streakCount++;
    saveLearnedSign(filteredCards[cardIndex].category, filteredCards[cardIndex].word);
    showToast('✅ ¡Bien! Racha: ' + streakCount, 'success', 1500);
  } else {
    // Mover la tarjeta al final para repasar
    const failed = filteredCards.splice(cardIndex, 1)[0];
    filteredCards.push(failed);
    streakCount = 0;
    showToast('❌ Sin problema, la verás de nuevo.', 'default', 1500);
  }

  document.getElementById('streakNum').textContent = streakCount;
  saveStreak(streakCount);

  if (cardIndex >= filteredCards.length) cardIndex = 0;
  else if (knew) cardIndex = (cardIndex + 1) % filteredCards.length;

  showCard();
};

function loadStreak() {
  const p = getProgress();
  streakCount = p.streak || 0;
  document.getElementById('streakNum').textContent = streakCount;
}

// ── Mode toggle ──────────────────────────────────────────────
window.setMode = function(mode) {
  currentMode = mode;
  document.getElementById('mode-flashcards').style.display = mode === 'flashcards' ? 'flex' : 'none';
  document.getElementById('mode-micro').style.display      = mode === 'micro'      ? 'block': 'none';
  document.getElementById('tab-flashcards').classList.toggle('active', mode === 'flashcards');
  document.getElementById('tab-micro').classList.toggle('active', mode === 'micro');
  if (mode === 'micro') initMicro();
};

// ── Micro-lección ─────────────────────────────────────────────
let microCards = [];
let microIndex = 0;
let microType  = 'sign-to-word'; // or word-to-sign

function initMicro() {
  microCards = [...allCards].filter(c => c.category === 'alfabeto').sort(() => Math.random() - .5);
  microIndex = 0;
  showMicro();
}

function showMicro() {
  const card = microCards[microIndex % microCards.length];
  document.getElementById('microSign').textContent   = card.emoji;
  document.getElementById('microPrompt').textContent = '¿Qué letra o seña es esta?';
  const inp = document.getElementById('microInput');
  inp.value = '';
  inp.className = 'micro-input';
  inp.placeholder = 'Escribe tu respuesta';
  document.getElementById('microFeedback').textContent = '';
  document.getElementById('microFeedback').className   = 'micro-feedback';
  inp.focus();
}

window.checkMicro = function() {
  const inp    = document.getElementById('microInput');
  const answer = inp.value.trim().toUpperCase();
  const card   = microCards[microIndex % microCards.length];
  const correct= card.word.toUpperCase();

  if (answer.length < 1) return;

  if (answer === correct) {
    inp.classList.add('correct');
    document.getElementById('microFeedback').textContent = '✅ ¡Correcto!';
    document.getElementById('microFeedback').className   = 'micro-feedback ok';
    streakCount++;
    document.getElementById('streakNum').textContent = streakCount;
    saveStreak(streakCount);
    microIndex++;
    setTimeout(showMicro, 1000);
  } else if (answer.length >= correct.length) {
    inp.classList.add('wrong');
    document.getElementById('microFeedback').textContent = `❌ Era: ${card.word}`;
    document.getElementById('microFeedback').className   = 'micro-feedback err';
    streakCount = 0;
    document.getElementById('streakNum').textContent = 0;
    setTimeout(() => {
      inp.classList.remove('wrong');
      document.getElementById('microFeedback').textContent = '';
    }, 1200);
  }
};

window.skipMicro = function() {
  microIndex++;
  showMicro();
};

window.showHintMicro = function() {
  const card = microCards[microIndex % microCards.length];
  showToast(`💡 Pista: empieza con "${card.word[0]}" (${card.desc})`, 'default', 3000);
};
