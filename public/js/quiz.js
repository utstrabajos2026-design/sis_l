/**
 * quiz.js  —  Lógica del sistema de evaluación (Capa WATCHER en MVW)
 * Gestiona el flujo completo: selección → preguntas → retroalimentación → resultados.
 */

let currentQuiz   = null;
let currentQ      = 0;
let score         = 0;
let answered      = false;
let startTime     = 0;
let selectedQuizId = null;

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderQuizCards();
});

function renderQuizCards() {
  const container = document.getElementById('quizCards');
  if (!container) return;

  fetch('http://localhost/sis_l_fullstack/api.php?action=getQuizzes')
    .then(res => res.json())
    .then(data => {
      if (!data.ok) return;
      const p = getProgress();
      const results = p.quizResults || [];
      container.innerHTML = data.quizzes.map(q => {
        const lastResult = results.filter(r => r.quizId === q.clave).slice(-1)[0];
        const scoreHtml  = lastResult
          ? `<span class="qcard-score ${lastResult.passed ? '' : 'fail'}">${lastResult.pct}%</span>`
          : `<span class="qcard-score none">Sin intentos</span>`;
        const quizData = QUIZZES.find(x => x.id === q.clave) || {};
        return `
          <div class="qcard" style="--card-color:${q.color}" onclick="startQuiz('${q.clave}')">
            ${scoreHtml}
            <span class="qcard-icon">${q.icono}</span>
            <div class="qcard-title">${q.titulo}</div>
            <p style="font-size:13px;color:var(--text-muted)">${q.descripcion || ''}</p>
            <div class="qcard-meta">
              <span>❓ ${quizData.questions ? quizData.questions.length : '?'} preguntas</span>
              <span>🎯 Mínimo 60%</span>
            </div>
          </div>`;
      }).join('');
    })
    .catch(() => {
      const p = getProgress();
      const results = p.quizResults || [];
      container.innerHTML = QUIZZES.map(q => {
        const lastResult = results.filter(r => r.quizId === q.id).slice(-1)[0];
        const scoreHtml  = lastResult
          ? `<span class="qcard-score ${lastResult.passed ? '' : 'fail'}">${lastResult.pct}%</span>`
          : `<span class="qcard-score none">Sin intentos</span>`;
        return `
          <div class="qcard" style="--card-color:${q.color}" onclick="startQuiz('${q.id}')">
            ${scoreHtml}
            <span class="qcard-icon">${q.icon}</span>
            <div class="qcard-title">${q.title}</div>
            <p style="font-size:13px;color:var(--text-muted)">${q.desc}</p>
            <div class="qcard-meta">
              <span>❓ ${q.questions.length} preguntas</span>
              <span>🎯 Mínimo 60%</span>
            </div>
          </div>`;
      }).join('');
    });
}

// ── Iniciar quiz ────────────────────────────────────────────
window.startQuiz = function(id) {
  currentQuiz    = QUIZZES.find(q => q.id === id);
  selectedQuizId = id;
  if (!currentQuiz) return;

  currentQ  = 0;
  score     = 0;
  answered  = false;
  startTime = Date.now();

  currentQuiz._shuffled = [...currentQuiz.questions].sort(() => Math.random() - .5);

  document.getElementById('quizSelect').style.display  = 'none';
  document.getElementById('quizActive').style.display  = 'block';
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('activQuizTitle').textContent = currentQuiz.title;

  renderQuestion();
};

// ── Renderizar pregunta ─────────────────────────────────────
function renderQuestion() {
  const q   = currentQuiz._shuffled[currentQ];
  const tot = currentQuiz._shuffled.length;
  answered  = false;

  document.getElementById('qNum').textContent      = `PREGUNTA ${currentQ + 1}`;
  document.getElementById('qCounter').textContent  = `Pregunta ${currentQ + 1} de ${tot}`;
  document.getElementById('qSign').textContent     = q.sign;
  document.getElementById('qText').textContent     = q.question;

  const pct = Math.round(((currentQ) / tot) * 100);
  document.getElementById('qProgress').style.width = pct + '%';

  const opts = [...q.options].sort(() => Math.random() - .5);
  const grid = document.getElementById('optionsGrid');
  const labels = ['A','B','C','D'];

  grid.innerHTML = opts.map((opt, i) => `
    <button class="quiz-option" onclick="selectAnswer(this, '${opt}', '${q.correct}', '${q.sign}')">
      <span class="quiz-option-num">${labels[i]}</span>
      ${opt}
    </button>`).join('');

  document.getElementById('feedbackBlock').style.display = 'none';
  document.getElementById('nextBtn').style.display       = 'none';

  const block = document.getElementById('questionBlock');
  block.style.animation = 'none';
  void block.offsetHeight;
  block.style.animation = 'fadeSlideUp .4s ease both';
}

// ── Seleccionar respuesta ───────────────────────────────────
window.selectAnswer = function(btn, selected, correct, sign) {
  if (answered) return;
  answered = true;

  const isCorrect = selected === correct;
  if (isCorrect) score++;

  document.querySelectorAll('.quiz-option').forEach(b => {
    b.disabled = true;
    if (b.textContent.includes(correct)) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  const fb = document.getElementById('feedbackBlock');
  const ft = document.getElementById('feedbackTitle');
  const fe = document.getElementById('feedbackExp');
  const nextBtnContainer = document.getElementById('nextBtnContainer');
  
  fb.className = 'feedback-block ' + (isCorrect ? 'correct' : 'wrong');
  ft.textContent = isCorrect
    ? ['¡Correcto! 🎉', '¡Excelente! ✨', '¡Muy bien! 🌟'][Math.floor(Math.random() * 3)]
    : '¡Casi! 😊';
  fe.textContent = isCorrect
    ? `La seña ${sign} efectivamente representa "${correct}". ¡Sigue así!`
    : `La respuesta correcta es "${correct}". ¿Quieres intentar de nuevo o continuar? Recuerda esta seña para reforzar tu aprendizaje.`;
  fb.style.display = 'block';

  if (isCorrect) {
    // Si es correcto, mostrar botón "Siguiente" y esperar 2 segundos
    nextBtnContainer.innerHTML = `<button class="btn btn-primary" onclick="nextQuestion()">Siguiente →</button>`;
    nextBtnContainer.style.justifyContent = 'flex-end';
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  } else {
    // Si es incorrecto, mostrar dos opciones
    nextBtnContainer.innerHTML = `
      <button class="btn btn-secondary" onclick="retryCurrentQuestion()">🔄 Intentar de nuevo</button>
      <button class="btn btn-primary" onclick="nextQuestion()">Continuar →</button>
    `;
    nextBtnContainer.style.justifyContent = 'space-between';
  }
  
  nextBtnContainer.style.display = 'flex';
};

// ── Siguiente pregunta ──────────────────────────────────────
window.nextQuestion = function() {
  currentQ++;
  if (currentQ >= currentQuiz._shuffled.length) {
    showResults();
  } else {
    renderQuestion();
  }
};

// ── Reintentar pregunta actual ──────────────────────────────
window.retryCurrentQuestion = function() {
  const q = currentQuiz._shuffled[currentQ];
  answered = false;
  
  document.querySelectorAll('.quiz-option').forEach(b => {
    b.disabled = false;
    b.classList.remove('correct', 'wrong');
  });
  
  document.getElementById('feedbackBlock').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
};

// ── Resultados ──────────────────────────────────────────────
function showResults() {
  const total   = currentQuiz._shuffled.length;
  const pct     = Math.round((score / total) * 100);
  const passed  = pct >= 60;
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  document.getElementById('quizActive').style.display  = 'none';
  document.getElementById('quizResults').style.display = 'block';

  document.getElementById('resultIcon').textContent  = passed ? '🏆' : '📚';
  document.getElementById('resultScore').textContent = pct + '%';
  document.getElementById('resultScore').style.color = passed ? 'var(--accent)' : 'var(--accent-coral)';
  
  let resultMessage = '';
  if (passed) {
    resultMessage = pct === 100 
      ? '¡Puntaje perfecto! Eres un experto en LSC.' 
      : '¡Aprobado! Excelente trabajo.';
  } else {
    // Mensajes más constructivos y motivadores
    if (pct >= 40) {
      resultMessage = `¡Buen intento! ${pct}% acertado. Revisa las lecciones de las señas que fallaste y vuelve a intentar. ¡Estás muy cerca!`;
    } else {
      resultMessage = `Aún hay mucho por aprender. ${pct}% acertado. Repasa las lecciones y practica más. Cada intento te acerca a dominar la LSC.`;
    }
  }
  
  document.getElementById('resultLabel').textContent = resultMessage;

  document.getElementById('rbCorrect').textContent = score;
  document.getElementById('rbWrong').textContent   = total - score;
  document.getElementById('rbTime').textContent    = elapsed + 's';

  // Guardar en localStorage
  saveQuizResult(selectedQuizId, score, total);

  const usuario = Auth.getUsuario();
  if (usuario) {
    fetch(API + '?action=guardarResultadoQuiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id:   usuario.id,
        quiz_clave:   selectedQuizId,
        puntaje:      score,
        total:        total,
        duracion_seg: elapsed
      })
    })
    .then(r => r.json())
    .then(d => console.log('RESULTADO BD:', d))
    .catch(e => console.log('ERROR:', e));
  }

  renderQuizCards();

  if (passed) showToast('🏆 ¡Quiz aprobado! Resultado guardado.', 'success', 3500);
  else        showToast('📚 Sigue repasando. ¡Tú puedes!', 'default', 3500);
}

// ── Retry / Exit ────────────────────────────────────────────
window.retryQuiz = function() {
  startQuiz(selectedQuizId);
};

window.exitQuiz = function() {
  document.getElementById('quizActive').style.display  = 'none';
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('quizSelect').style.display  = 'block';
  renderQuizCards();
};