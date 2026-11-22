// Точка входа: титульный лист, каркас «кейс + досье», колофон.

import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-serif/400.css';
import '@fontsource/ibm-plex-serif/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';
import './styles/main.css';

import { PROFILE } from './data/profile.ts';
import { el } from './core/dom.ts';
import { store } from './core/state.ts';
import { initCase } from './stages/index.ts';
import { renderSidebar } from './sections/sidebar.ts';

const app = document.querySelector<HTMLElement>('#app');

function hero(): HTMLElement {
  return el(
    'header',
    { class: 'hero' },
    el(
      'div',
      { class: 'hero__sheet' },
      el(
        'div',
        { class: 'hero__topline' },
        el('span', { class: 'is-accent' }, 'Личное дело'),
        el('span', {}, 'системный аналитик'),
        el('span', {}, 'Минск · 2026'),
      ),
      el(
        'div',
        { class: 'hero__body' },
        el(
          'div',
          { class: 'hero__intro' },
          el('h1', { class: 'hero__name' }, PROFILE.name),
          el('div', { class: 'hero__role' }, PROFILE.role),
          el('p', { class: 'hero__tagline' }, PROFILE.tagline),
          el(
            'div',
            { class: 'hero__actions' },
            el('a', { class: 'btn btn--primary', href: '#case' }, 'Пройти кейс — 5 минут'),
            el(
              'a',
              {
                class: 'btn',
                href: 'resume.pdf',
                download: 'Кукар_ЯМ_резюме.pdf',
                title: 'Статичное A4-резюме в PDF',
              },
              'Скачать PDF',
            ),
          ),
        ),
        el(
          'div',
          { class: 'stamp', ariaHidden: 'true' },
          el('span', { class: 'stamp__word' }, 'К рассмотрению'),
          el('span', { class: 'stamp__sub' }, 'BPB-2026-11 · резюме-кейс'),
        ),
      ),
    ),
  );
}

function footer(): HTMLElement {
  return el(
    'footer',
    { class: 'footer' },
    'Досье подготовлено для вакансии «Специалист отдела развития информационных систем розничного бизнеса» · TypeScript + Vite · Docker · ',
    el(
      'a',
      { href: 'https://github.com/Kerarty/cv-belgazprombank', target: '_blank', rel: 'noopener' },
      'исходники на GitHub',
    ),
    ' · ',
    el(
      'a',
      { href: 'https://rabota.by/vacancy/133855231', target: '_blank', rel: 'noopener' },
      'вакансия',
    ),
  );
}

if (app) {
  app.append(hero());

  const caseColumn = el('div', { class: 'layout__case' });
  const resumeColumn = el('aside', { class: 'resume', ariaLabel: 'Досье: резюме' });
  const layout = el('main', { class: 'layout' }, caseColumn, resumeColumn);
  app.append(layout);

  initCase(caseColumn);
  renderSidebar(resumeColumn);

  app.append(footer());

  // Сброс кейса по hash-команде #reset — удобно при повторном показе.
  if (window.location.hash === '#reset') {
    store.reset();
    history.replaceState(null, '', window.location.pathname);
  }
}
