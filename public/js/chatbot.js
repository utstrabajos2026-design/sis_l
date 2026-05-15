/**
 * chatbot.js  —  Lógica del asistente IA (LSC)
 * Llama al backend Node.js que hace proxy a Ollama.
 * Arquitectura: Frontend → /api/chatbot → Ollama local
 */

// ── Estado ────────────────────────────────────────────────────
const chatState = {
  history:    [],   // { role: 'user'|'assistant', content: '' }
  msgCount:   0,
  topicCount: 0,
  isLoading:  false,
  model:      'desconocido',
};

// ── DOM refs ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  $('welcomeTime').textContent = formatTime(new Date());
  checkOllamaStatus();
  $('chatInput').focus();
});

// ── Verificar Ollama disponible ───────────────────────────────
async function checkOllamaStatus() {
  setStatus('loading', 'Conectando con Ollama…');
  try {
    const res  = await fetch('/api/chatbot/status');
    const data = await res.json();
    if (data.ok) {
      chatState.model = data.model;
      $('modelName').textContent = data.model;
      $('modelBadge').querySelector('.model-dot').classList.add('online');

      const timeout = data.timeout || '5m';
      const optimized = data.optimized ? '⚡ Optimizado' : '⏱️ Estándar';
      setStatus('online', `${data.model} · ${timeout} · ${optimized}`);
    } else {
      throw new Error(data.error || 'Error desconocido');
    }
  } catch (e) {
    $('modelName').textContent = 'Sin conexión';
    $('modelBadge').querySelector('.model-dot').classList.add('offline');
    setStatus('offline', 'Ollama no disponible');
    showError(`❌ ${e.message}<br>Ejecuta en terminal: <code>ollama serve</code>`);
    console.error('[Chatbot] Status error:', e);
  }
}

function setStatus(type, text) {
  const dot  = $('statusDot');
  const span = $('statusText');
  dot.className  = 'status-indicator ' + type;
  span.textContent = text;
}

// ── Enviar mensaje ────────────────────────────────────────────
async function sendMessage() {
  const input = $('chatInput');
  const text  = input.value.trim();
  if (!text || chatState.isLoading) return;

  input.value = '';
  $('charCount').textContent = '0';
  autoResize(input);

  appendUserMessage(text);
  chatState.history.push({ role: 'user', content: text });
  chatState.msgCount++;
  chatState.topicCount++;
  updateStats();

  setLoading(true);

  const modelInfo = chatState.model.includes('phi')
    ? 'Phi es lento sin GPU (puede tardar 3-5 minutos)'
    : 'Esto puede tomar 1-3 minutos';
  setStatus('loading', `Pensando… ${modelInfo}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos

    const res = await fetch('/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('sis_l_token') || ''),
      },
      body: JSON.stringify({ messages: chatState.history }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errData.error || `Error HTTP ${res.status}`);
    }

    // Streaming de respuesta
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   full    = '';
    const msgEl   = appendAIMessage('');
    let   hasError = false;
    let   lineBuffer = '';

    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        lineBuffer += chunk;
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop(); // Guardar línea incompleta

        lines.forEach(line => {
          if (!line.trim()) return;

          try {
            if (!line.trim().startsWith('{')) return; // Ignorar no-JSON

            const obj = JSON.parse(line);
            if (obj.message?.content) {
              full += obj.message.content;
              msgEl.innerHTML = formatMarkdown(full);
              scrollBottom();
            }
            if (obj.done) {
              console.log('[Chatbot] Stream done');
              setStatus('online', `Listo · ${chatState.model}`);
            }
            if (obj.error) {
              console.warn('[Chatbot] Ollama error:', obj.error);
              hasError = true;
            }
          } catch (parseErr) {
            console.warn('[Chatbot] JSON inválido:', line.slice(0, 100));
            // No fallar, continuar
          }
        });
      } catch (readErr) {
        console.error('[Chatbot] Error leyendo stream:', readErr);
        hasError = true;
        break;
      }
    }

    // Procesar última línea del buffer
    if (lineBuffer.trim() && lineBuffer.trim().startsWith('{')) {
      try {
        const obj = JSON.parse(lineBuffer);
        if (obj.message?.content) {
          full += obj.message.content;
          msgEl.innerHTML = formatMarkdown(full);
        }
      } catch (e) {
        console.warn('[Chatbot] Última línea corrupta');
      }
    }

    if (!hasError && full.length > 0) {
      chatState.history.push({ role: 'assistant', content: full });
      chatState.msgCount++;
      updateStats();
      setStatus('online', `Listo · ${chatState.model}`);
    } else if (!full.length) {
      appendAIMessage('⚠️ La respuesta estuvo vacía. Verifica que Ollama esté correctamente configurado.');
      setStatus('offline', 'Error: respuesta vacía');
    }

  } catch (e) {
    console.error('[Chatbot] Error:', e);

    if (e.name === 'AbortError') {
      appendAIMessage(`⚠️ **Timeout (>5 minutos)**\n\n${chatState.model} tardó demasiado. Opciones:\n- Si usas **Phi**: Instala CUDA para GPU (mucho más rápido)\n- Cambia a un modelo más rápido: **Gemma2** o **Mistral**\n- Intenta con una pregunta más corta`);
      showError(`⏱️ Timeout. Usa: <code>CAMBIAR_MODELO.bat</code> o instala CUDA`);
    } else {
      appendAIMessage('⚠️ Error de conexión. Verifica que Ollama esté activo:\n`ollama serve`');
      showError(`❌ ${e.message}`);
    }
    setStatus('offline', 'Error');
  } finally {
    setLoading(false);
  }
}

// ── Sugerencia rápida ─────────────────────────────────────────
window.sendSuggestion = function(text) {
  $('chatInput').value = text;
  $('charCount').textContent = text.length;
  sendMessage();
};

// ── Limpiar conversación ──────────────────────────────────────
window.clearChat = function() {
  chatState.history    = [];
  chatState.msgCount   = 0;
  chatState.topicCount = 0;
  updateStats();

  const msgs = $('chatMessages');
  // Dejar solo el mensaje de bienvenida
  [...msgs.children].forEach(el => {
    if (el.id !== 'welcomeMsg') el.remove();
  });
  $('chatInput').focus();
  if (typeof showToast === 'function') showToast('💬 Nueva conversación iniciada', 'success');
};

// ── Helpers de DOM ────────────────────────────────────────────
function appendUserMessage(text) {
  const msgs = $('chatMessages');
  const user = Auth.getUsuario();
  const name = user ? user.nombre : 'Tú';

  const el = document.createElement('div');
  el.className = 'msg-wrapper msg-user';
  el.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-bubble">
      <div class="msg-header">
        <span class="msg-name">${name}</span>
        <span class="msg-time">${formatTime(new Date())}</span>
      </div>
      <div class="msg-text">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
    </div>`;
  msgs.appendChild(el);
  scrollBottom();
}

function appendAIMessage(text) {
  $('typingIndicator').style.display = 'none';

  const msgs = $('chatMessages');
  const el   = document.createElement('div');
  el.className = 'msg-wrapper msg-ai';
  el.innerHTML = `
    <div class="msg-avatar">🤟</div>
    <div class="msg-bubble">
      <div class="msg-header">
        <span class="msg-name">Asistente LSC</span>
        <span class="msg-time">${formatTime(new Date())}</span>
      </div>
      <div class="msg-text">${formatMarkdown(text)}</div>
    </div>`;
  msgs.appendChild(el);
  scrollBottom();
  return el.querySelector('.msg-text');
}

function setLoading(isLoading) {
  chatState.isLoading = isLoading;
  $('sendBtn').disabled  = isLoading;
  $('chatInput').disabled = isLoading;
  $('typingIndicator').style.display = isLoading ? 'flex' : 'none';
  if (isLoading) scrollBottom();
}

function showError(msg) {
  $('errorBanner').style.display = 'flex';
  $('errorText').innerHTML = msg;
}

window.dismissError = function() {
  $('errorBanner').style.display = 'none';
};

function updateStats() {
  $('msgCount').textContent   = chatState.msgCount;
  $('topicCount').textContent = chatState.topicCount;
}

function scrollBottom() {
  const msgs = $('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Formateo de Markdown básico ───────────────────────────────
function formatMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Restaurar etiquetas HTML internas ya sanitizadas
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^### (.+)$/gm, '<strong style="color:var(--accent-gold)">$1</strong>')
    .replace(/^## (.+)$/gm,  '<strong style="font-size:15px;color:var(--accent)">$1</strong>')
    .replace(/^# (.+)$/gm,   '<strong style="font-size:16px;color:var(--accent)">$1</strong>')
    .replace(/^- (.+)$/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatTime(date) {
  return date.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
}

// ── Input handlers ────────────────────────────────────────────
window.handleKey = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

window.autoResize = function(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  const len = el.value.length;
  const counter = $('charCount');
  counter.textContent = len;
  counter.className = 'char-count' + (len > 900 ? ' over' : len > 700 ? ' warn' : '');
};
