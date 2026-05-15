/**
 * view/routes.js  ─  CAPA VIEW
 * ─────────────────────────────────────────────────────────────
 * Solo recibe peticiones HTTP, llama al Watcher y devuelve JSON.
 * NO tiene lógica de negocio. NO toca el Model directamente.
 *
 * Flujo MVW:
 *   Navegador  →  View (rutas)  →  Watcher  →  Model (SQL)  →  MySQL
 */

const express = require('express');
const router  = express.Router();
const { AuthWatcher, AprendizajeWatcher, QuizWatcher, DashboardWatcher } = require('../watcher');

// ── Middleware: verificar JWT en rutas protegidas ─────────────
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Token requerido' });

  const payload = AuthWatcher.verificarToken(token);
  if (!payload) return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });

  req.usuario = payload;   // { id, rol }
  next();
}

// ── Respuesta estándar ────────────────────────────────────────
function respond(res, result) {
  if (!result.ok) return res.status(result.code || 400).json(result);
  return res.json(result);
}

// ════════════════════════════════════════════════
//  AUTH  (RF01, RF02)
// ════════════════════════════════════════════════

// POST /api/auth/registro
router.post('/auth/registro', async (req, res) => {
  const result = await AuthWatcher.registrar(req.body);
  respond(res, result);
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const result = await AuthWatcher.login({ ...req.body, ip: req.ip });
  respond(res, result);
});

// POST /api/auth/logout  🔒
router.post('/auth/logout', auth, async (req, res) => {
  const token  = req.headers.authorization.slice(7);
  const result = await AuthWatcher.logout(token);
  respond(res, result);
});

// POST /api/auth/eliminar-cuenta  🔒
router.post('/auth/eliminar-cuenta', auth, async (req, res) => {
  const result = await AuthWatcher.eliminarCuenta(req.usuario.id);
  respond(res, result);
});

// POST /api/auth/enviar-codigo
// Envía un código de autenticación al correo del usuario
router.post('/auth/enviar-codigo', async (req, res) => {
  const result = await AuthWatcher.enviarCodigoAutenticacion(req.body.correo);
  respond(res, result);
});

// POST /api/auth/verificar-codigo
// Verifica el código de autenticación y devuelve un token JWT
router.post('/auth/verificar-codigo', async (req, res) => {
  const result = await AuthWatcher.verificarCodigoAutenticacion(req.body.correo, req.body.codigo);
  respond(res, result);
});

// POST /api/auth/solicitar-recuperacion
// Envía un link de recuperación de contraseña al correo
router.post('/auth/solicitar-recuperacion', async (req, res) => {
  const result = await AuthWatcher.solicitarRecuperacion(req.body.correo);
  respond(res, result);
});

// POST /api/auth/resetear-password
// Valida el token y actualiza la contraseña
router.post('/auth/resetear-password', async (req, res) => {
  const result = await AuthWatcher.resetearContraseña(req.body.token, req.body.nuevaContrasena);
  respond(res, result);
});

// GET /api/auth/validar-token-reset
// Valida que un token de reset sea válido (sin gastarlo)
router.get('/auth/validar-token-reset', async (req, res) => {
  const result = await AuthWatcher.validarTokenReset(req.query.token);
  respond(res, result);
});

// ════════════════════════════════════════════════
//  LECCIONES  (RF03, RF04)
// ════════════════════════════════════════════════

// GET /api/lecciones  🔒
router.get('/lecciones', auth, async (req, res) => {
  const result = await AprendizajeWatcher.getLecciones();
  respond(res, result);
});

// POST /api/lecciones/completar  🔒
router.post('/lecciones/completar', auth, async (req, res) => {
  const result = await AprendizajeWatcher.completarLeccion(req.usuario.id, req.body.clave);
  respond(res, result);
});

// ════════════════════════════════════════════════
//  SEÑAS APRENDIDAS
// ════════════════════════════════════════════════

// POST /api/senas/aprender  🔒
router.post('/senas/aprender', auth, async (req, res) => {
  const { categoria, clave } = req.body;
  const result = await AprendizajeWatcher.guardarSena(req.usuario.id, categoria, clave);
  respond(res, result);
});

// ════════════════════════════════════════════════
//  QUIZZES
// ════════════════════════════════════════════════

// GET /api/quizzes  🔒
router.get('/quizzes', auth, async (req, res) => {
  const result = await QuizWatcher.getQuizzes(req.usuario.id);
  respond(res, result);
});

// POST /api/quizzes/resultado  🔒
router.post('/quizzes/resultado', auth, async (req, res) => {
  const result = await QuizWatcher.guardarResultado(req.usuario.id, req.body);
  respond(res, result);
});

// GET /api/quizzes/historial  🔒
router.get('/quizzes/historial', auth, async (req, res) => {
  const result = await QuizWatcher.getHistorial(req.usuario.id);
  respond(res, result);
});

// ════════════════════════════════════════════════
//  DASHBOARD / PROGRESO  🔒
// ════════════════════════════════════════════════

// GET /api/dashboard  🔒
router.get('/dashboard', auth, async (req, res) => {
  const result = await DashboardWatcher.getDashboard(req.usuario.id);
  respond(res, result);
});

// GET /api/progreso  🔒
router.get('/progreso', auth, async (req, res) => {
  const result = await AprendizajeWatcher.getProgreso(req.usuario.id);
  respond(res, result);
});

// ════════════════════════════════════════════════
//  CHATBOT  —  IA asistente especializado en LSC
// ════════════════════════════════════════════════

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT) || 300000; // 5 minutos

// Detectar si usamos phi (modelo ligero) o otro (pesado)
const isPhi = OLLAMA_MODEL.toLowerCase().startsWith('phi');

const SYSTEM_PROMPT = `Eres un asistente educativo especializado en Lengua de Señas Colombiana (LSC).
Tu nombre es "Asistente LSC" y formas parte del módulo de aprendizaje SIS-L.

IMPORTANTE: TODAS tus respuestas deben estar exclusivamente en ESPAÑOL. No uses inglés ni ningún otro idioma. No añadas traducciones al inglés ni repitas la respuesta en otro idioma. Si hay palabras o frases en inglés, corrígelas y elimina el inglés.

Tus conocimientos incluyen:
- El alfabeto dactilológico de la LSC (27 letras)
- Saludos y presentaciones básicas en LSC
- Números del 0 al 10 en LSC
- Frases comunes y estructura gramatical de la LSC
- Colores, familia, emociones y preguntas en LSC
- Historia y cultura de la comunidad sorda en Colombia
- Diferencias entre LSC, ASL (americana) y LSM (mexicana)
- Técnicas pedagógicas para aprender lengua de señas

Reglas importantes:
- Responde SIEMPRE en español, sin excepciones
- Si el usuario pregunta sobre una seña específica, descríbela de forma visual y detallada
- Usa emojis de manos (👋, 🤟, ✌️, 👌, 🖐) cuando sea apropiado
- Proporciona ejercicios prácticos cuando sean útiles
- Si no sabes algo con certeza, dilo honestamente
- Mantén un tono amigable y motivador
- Sé conciso: respuestas entre 2-4 párrafos a menos que pidan explicaciones largas`;

router.get('/chatbot/status', async (req, res) => {
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    if (!resp.ok) throw new Error('Ollama no responde');

    const data   = await resp.json();
    const models = (data.models || []).map(m => m.name);
    const model  = models.find(m => m.startsWith(OLLAMA_MODEL.split(':')[0])) || models[0];

    if (!model) {
      return res.json({
        ok: false,
        error: `Ningún modelo encontrado. Ejecuta: ollama pull ${OLLAMA_MODEL}`,
        available: models
      });
    }

    return res.json({
      ok: true,
      model,
      available: models,
      timeout: OLLAMA_TIMEOUT / 1000 + 's',
      optimized: isPhi
    });
  } catch (e) {
    return res.status(503).json({
      ok: false,
      error: 'Ollama no disponible: ' + e.message,
      hint: 'Ejecuta: ollama serve'
    });
  }
});

router.post('/chatbot/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'Se requieren mensajes' });
  }

  const safeMessages = messages
    .filter(m => m.role && m.content && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    // Usar parámetros optimizados según el modelo
    const options = isPhi
      ? {
          temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.3,
          top_p:       parseFloat(process.env.OLLAMA_TOP_P) || 0.85,
          top_k:       parseInt(process.env.OLLAMA_TOP_K) || 40,
          num_predict: parseInt(process.env.OLLAMA_NUM_PREDICT) || 300,
        }
      : {
          temperature: 0.7,
          top_p:       0.9,
          num_predict: 600,
        };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

    console.log(`[Chatbot] Enviando a Ollama (${OLLAMA_MODEL}):`, {
      model: OLLAMA_MODEL,
      isPhi,
      options,
      timeout: OLLAMA_TIMEOUT / 1000 + 's'
    });

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:    OLLAMA_MODEL,
        stream:   true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        options,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text();
      console.error('[Chatbot] Ollama error:', err);
      return res.status(502).json({
        ok: false,
        error: 'Ollama error: ' + err,
        status: ollamaRes.status
      });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Cache-Control', 'no-cache');

    let receivedBytes = 0;
    let lineBuffer = '';

    // Procesar stream con validación JSON robusta
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          receivedBytes += chunk.length;

          lineBuffer += chunk;
          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop(); // Guardar línea incompleta

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              if (!line.trim().startsWith('{')) {
                console.warn('[Chatbot] Línea no-JSON recibida:', line.slice(0, 50));
                continue;
              }

              const obj = JSON.parse(line);
              if (obj.message?.content) {
                res.write(line + '\n');
              }
              if (obj.done) {
                console.log('[Chatbot] Stream completado. Bytes recibidos:', receivedBytes);
              }
            } catch (parseErr) {
              console.warn('[Chatbot] JSON corrupto:', line.slice(0, 100), parseErr.message);
              // Continuar, no fallar
            }
          }
        }

        // Procesar última línea
        if (lineBuffer.trim()) {
          try {
            if (lineBuffer.trim().startsWith('{')) {
              const obj = JSON.parse(lineBuffer);
              res.write(lineBuffer + '\n');
            }
          } catch (e) {
            console.warn('[Chatbot] Última línea corrupta:', lineBuffer.slice(0, 100));
          }
        }

        res.end();
      } catch (streamErr) {
        console.error('[Chatbot] Stream error:', streamErr.message);
        if (!res.headersSent) {
          res.status(503).json({ ok: false, error: 'Stream error: ' + streamErr.message });
        } else {
          res.end();
        }
      }
    };

    await processStream();

  } catch (e) {
    console.error('[Chatbot] Error:', e.message);
    if (e.name === 'AbortError') {
      if (!res.headersSent) {
        res.status(504).json({
          ok: false,
          error: `Timeout: Ollama tardó más de ${OLLAMA_TIMEOUT / 1000}s`,
          model: OLLAMA_MODEL,
          hint: OLLAMA_MODEL.includes('phi')
            ? 'Phi es lento sin GPU. Instala CUDA o cambia a un modelo más rápido (gemma2)'
            : 'Intenta con un modelo más ligero (phi, gemma2)'
        });
      } else {
        res.write('\n{"error":"Timeout","code":504}');
        res.end();
      }
    } else if (!res.headersSent) {
      res.status(503).json({
        ok: false,
        error: 'No se pudo conectar con Ollama: ' + e.message,
        hint: 'Ejecuta: ollama serve'
      });
    } else {
      res.end();
    }
  }
});

// ════════════════════════════════════════════════
//  HEALTH CHECK  (RNF-D1)
// ════════════════════════════════════════════════

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'SIS-L corriendo',
    timestamp: new Date().toISOString(),
    chatbot: {
      model: OLLAMA_MODEL,
      optimized: isPhi,
      timeout: OLLAMA_TIMEOUT / 1000 + 's'
    }
  });
});

module.exports = router;
