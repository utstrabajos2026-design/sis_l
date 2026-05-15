// ════════════════════════════════════════════════
//  CHATBOT  —  Añadir estas rutas a view/routes.js
//  (pegar antes del último module.exports)
// ════════════════════════════════════════════════

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';   // o 'gemma2', 'mistral', etc.

// Prompt de sistema: asistente especializado en LSC
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
- Responde siempre en español, de forma clara y didáctica
- Si el usuario pregunta sobre una seña específica, descríbela de forma visual y detallada
- Usa emojis de manos (👋, 🤟, ✌️, 👌, 🖐) cuando sea apropiado
- Proporciona ejercicios prácticos cuando sean útiles
- Si no sabes algo con certeza, dilo honestamente
- Mantén un tono amigable y motivador
- Sé conciso: respuestas entre 2-4 párrafos a menos que pidan explicaciones largas`;

// GET /api/chatbot/status  — verificar Ollama y modelo
router.get('/chatbot/status', async (req, res) => {
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!resp.ok) throw new Error('Ollama no responde');

    const data   = await resp.json();
    const models = (data.models || []).map(m => m.name);
    const model  = models.find(m => m.startsWith(OLLAMA_MODEL.split(':')[0])) || models[0];

    if (!model) {
      return res.json({ ok: false, error: `Ningún modelo encontrado. Ejecuta: ollama pull ${OLLAMA_MODEL}` });
    }

    return res.json({ ok: true, model, available: models });
  } catch (e) {
    return res.status(503).json({ ok: false, error: 'Ollama no disponible: ' + e.message });
  }
});

// POST /api/chatbot/chat  — streaming de respuesta (sin auth requerida en demo)
router.post('/chatbot/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'Se requieren mensajes' });
  }

  // Sanitizar mensajes: solo role y content
  const safeMessages = messages
    .filter(m => m.role && m.content && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
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
        options: {
          temperature: 0.7,
          top_p:       0.9,
          num_predict: 600,   // máximo tokens de respuesta
        }
      }),
    });

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text();
      return res.status(502).json({ ok: false, error: 'Ollama error: ' + err });
    }

    // Hacer pipe del stream de Ollama → cliente directamente
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');   // desactivar buffering en nginx

    ollamaRes.body.pipe(res);

  } catch (e) {
    console.error('[ChatbotRoute] Error:', e.message);
    if (!res.headersSent) {
      res.status(503).json({ ok: false, error: 'No se pudo conectar con Ollama' });
    }
  }
});
