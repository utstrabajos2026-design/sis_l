import i18next from 'https://cdn.jsdelivr.net/npm/i18next@23.7.6/+esm';
import HttpApi from 'https://cdn.jsdelivr.net/npm/i18next-http-backend@2.2.2/+esm';
import LanguageDetector from 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/+esm';

// Esconder el contenido mientras se cargan las traducciones
document.documentElement.style.opacity = '0';

i18next
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'es',
    debug: false,
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  }, function(err, t) {
    // Traducir elementos y mostrar contenido
    updateContent();
    document.documentElement.style.opacity = '1';
    document.documentElement.style.transition = 'opacity 0.3s ease-in';
  });

function updateContent() {
  // Traducir elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key.includes('[html]')) {
      const cleanKey = key.replace('[html]', '');
      el.innerHTML = i18next.t(cleanKey);
    } else {
      el.textContent = i18next.t(key);
    }
  });

  // Cambiar lang del html
  document.documentElement.lang = i18next.language;
}

// Función para cambiar idioma
window.changeLanguage = function(lng) {
  i18next.changeLanguage(lng, (err, t) => {
    if (err) return console.log('Error cambiando idioma', err);
    updateContent();
  });
};

export default i18next;