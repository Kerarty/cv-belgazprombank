// Точка входа: хедер, каркас «кейс + резюме», футер.

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
      { class: 'hero__inner' },
      el(
        'span',
        { class: 'hero__badge' },
        el('span', { class: 'dot', ariaHidden: 'true' }),
        'Резюме-кейс · пройдите мою работу руками',
      ),
      el('h1', { class: 'hero__name' }, PROFILE.name),
      el('div', { class: 'hero__role' }, PROFILE.role),
      el('p', { class: 'hero__tagline' }, PROFILE.tagline),
      el(
        'div',
        { class: 'hero__actions' },
        el(
          'a',
          { class: 'btn btn--primary', href: '#case' },
          '▶ Пройти кейс (5 минут)',
        ),
        el(
          'button',
          {
            class: 'btn btn--ghost',
            type: 'button',
            onClick: () => window.print(),
          },
          '⭳ Скачать PDF',
        ),
      ),
    ),
  );
}

function footer(): HTMLElement {
  return el(
    'footer',
    { class: 'footer' },
    'Интерактивное резюме · TypeScript + Vite · Docker · ',
    el(
      'a',
      { href: 'https://github.com/Kerarty/cv-belgazprombank', target: '_blank', rel: 'noopener' },
      'исходники на GitHub',
    ),
    ' · ',
    el(
      'a',
      { href: 'https://hh.ru/vacancy/138053420', target: '_blank', rel: 'noopener' },
      'вакансия',
    ),
  );
}

if (app) {
  app.append(hero());

  const caseColumn = el('div', { class: 'layout__case' });
  const resumeColumn = el('aside', { class: 'resume', ariaLabel: 'Резюме' });
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
