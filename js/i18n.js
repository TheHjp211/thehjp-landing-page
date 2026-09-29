/* ==========================================================================
   THEHJP MULTI-PAGE I18N BILINGUAL SYSTEM (VI / EN)
   Runtime logic — translations are split into:
     * js/i18n.vi.js  (tieng Viet - chinh sua file nay de thay doi noi dung VI)
     * js/i18n.en.js  (English - edit this file to update the EN content)
   ========================================================================== */

/* Build the unified translations object from the two language files. */
const translations = {
  vi: translationsVI,
  en: translationsEN
};

let currentLang = 'vi';

function updateLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  
  // Update toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Find all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const parts = key.split('.');
    let val = translations[lang];
    for (const part of parts) {
      if (val) val = val[part];
    }
    if (val !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    }
  });

  window.currentLang = lang;

  // Also update placeholders specifically marked with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    const parts = key.split('.');
    let val = translations[lang];
    for (const part of parts) {
      if (val) val = val[part];
    }
    if (val !== undefined) {
      el.placeholder = val;
    }
  });

  // Update aria-labels marked with data-i18n-aria
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const parts = key.split('.');
    let val = translations[lang];
    for (const part of parts) {
      if (val) val = val[part];
    }
    if (val !== undefined) {
      el.setAttribute('aria-label', val);
    }
  });

  // Update title attributes marked with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const parts = key.split('.');
    let val = translations[lang];
    for (const part of parts) {
      if (val) val = val[part];
    }
    if (val !== undefined) {
      el.setAttribute('title', val);
    }
  });

  // Save to localStorage
  try {
    localStorage.setItem('thehjp_lang', lang);
  } catch (e) {
    // ignore
  }

  // Notify custom components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('thehjp_lang') || 'vi';
  updateLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      updateLanguage(btn.dataset.lang);
    });
  });
});