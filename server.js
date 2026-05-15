/**
 * server.js  ─  Punto de entrada del servidor Express
 * ─────────────────────────────────────────────────────
 * Arquitectura MVW:
 *   MODEL   → model/index.js      (consultas SQL puras)
 *   WATCHER → watcher/index.js    (lógica de negocio)
 *   VIEW    → view/routes.js      (rutas HTTP / API REST)
 *             public/             (HTML, CSS, JS del frontend)
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs     = require('fs');

const app    = express();
const PORT   = process.env.PORT || 7860;  // Hugging Face Spaces requiere puerto 7860

// ── Crear archivos de traducción (i18n) si no existen ──────────
(function setupI18n() {
  const baseDir = path.join(__dirname, 'public', 'locales');
  const esDir = path.join(baseDir, 'es');
  const enDir = path.join(baseDir, 'en');

  const esTranslation = {
    "title": "SIS-L · Aprende Lengua de Señas",
    "badge": "Lengua de Señas Colombiana — LSC",
    "heroTitle": "Aprende a<br><em>comunicarte</em><br>con tus manos",
    "heroSub": "Módulo interactivo de aprendizaje de LSC con lecciones por niveles, práctica guiada y quizzes. Diseñado para incluir a todos, sin barreras.",
    "startLessons": "Iniciar lecciones →",
    "practiceMode": "🖐 Modo práctica",
    "signsAlphabet": "Señas del alfabeto",
    "levels": "Niveles",
    "quizzes": "Quizzes",
    "moduleContent": "Contenido del módulo",
    "chooseStart": "Elige por dónde comenzar",
    "basic": "Básico",
    "dactylologicalAlphabet": "Alfabeto dactilológico",
    "basicDesc": "Las 27 letras del alfabeto en LSC. La base para deletrear cualquier palabra.",
    "greetings": "Saludos y presentaciones",
    "greetingsDesc": "Hola, gracias, por favor, ¿cómo estás? Las señas más usadas en el día a día.",
    "intermediate": "Intermedio",
    "commonPhrases": "Frases comunes",
    "phrasesDesc": "Construcción de frases completas: preguntas, respuestas y conversaciones básicas.",
    "freePractice": "Práctica libre",
    "practiceTitle": "Modo práctica",
    "practiceDesc": "Repasa señas a tu ritmo con tarjetas interactivas y modo flashcard.",
    "evaluation": "Evaluación",
    "quizzesTitle": "Quizzes",
    "quizzesDesc": "Pon a prueba tu conocimiento con evaluaciones interactivas por nivel.",
    "profile": "Mi perfil",
    "progressTitle": "Mi progreso",
    "progressDesc": "Visualiza tu avance, lecciones completadas, racha diaria y logros."
  };

  const enTranslation = {
    "title": "SIS-L · Learn Colombian Sign Language",
    "badge": "Colombian Sign Language — CSL",
    "heroTitle": "Learn to<br><em>communicate</em><br>with your hands",
    "heroSub": "Interactive learning module for CSL with lessons by levels, guided practice and quizzes. Designed to include everyone, without barriers.",
    "startLessons": "Start lessons →",
    "practiceMode": "🖐 Practice mode",
    "signsAlphabet": "Alphabet signs",
    "levels": "Levels",
    "quizzes": "Quizzes",
    "moduleContent": "Module content",
    "chooseStart": "Choose where to start",
    "basic": "Basic",
    "dactylologicalAlphabet": "Dactylological alphabet",
    "basicDesc": "The 27 letters of the alphabet in CSL. The foundation for spelling any word.",
    "greetings": "Greetings and introductions",
    "greetingsDesc": "Hello, thank you, please, how are you? The most used signs in everyday life.",
    "intermediate": "Intermediate",
    "commonPhrases": "Common phrases",
    "phrasesDesc": "Building complete sentences: questions, answers and basic conversations.",
    "freePractice": "Free practice",
    "practiceTitle": "Practice mode",
    "practiceDesc": "Review signs at your own pace with interactive cards and flashcard mode.",
    "evaluation": "Evaluation",
    "quizzesTitle": "Quizzes",
    "quizzesDesc": "Test your knowledge with interactive evaluations by level.",
    "profile": "My profile",
    "progressTitle": "My progress",
    "progressDesc": "Visualize your progress, completed lessons, daily streak and achievements."
  };

  try {
    fs.mkdirSync(esDir, { recursive: true });
    fs.mkdirSync(enDir, { recursive: true });
    fs.writeFileSync(path.join(esDir, 'translation.json'), JSON.stringify(esTranslation, null, 2), 'utf8');
    fs.writeFileSync(path.join(enDir, 'translation.json'), JSON.stringify(enTranslation, null, 2), 'utf8');
    console.log('✅ Archivos de traducción creados/verificados');
  } catch (e) {
    console.warn('⚠️ Error al crear archivos de traducción:', e.message);
  }
})();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos (Frontend HTML/CSS/JS) ─────────────────
// La carpeta public/ ES la capa VIEW del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ── API REST (View → Watcher → Model) ────────────────────────
app.use('/api', require('./view/routes'));

// ── SPA fallback: solo para rutas HTML, no archivos estáticos ──
app.get('*', (req, res) => {
  const publicPath = path.join(__dirname, 'public', req.path);
  
  // Si la ruta solicita un archivo estático existente (JS, CSS, etc), 
  // ya fue servida por express.static() arriba, no llega aquí
  // Solo llegamos aquí si NO es un archivo estático
  // En ese caso, servir index.html para rutas de página HTML
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ── Arrancar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🤟  SIS-L corriendo en http://localhost:' + PORT);
  console.log('  📋  API:      http://localhost:' + PORT + '/api/health');
  console.log('  🌐  Frontend: http://localhost:' + PORT);
  console.log('');
});
