// Стадия 5 — итоги кейса (реализация будет добавлена следующим коммитом).

import { el } from '../core/dom.ts';

export function renderResults(root: HTMLElement): void {
  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 5 · Итоги'),
    el('h3', {}, 'Итоги'),
    el('p', { class: 'stage__lead' }, 'Готовится: баллы за кейс и связь стадий с обязанностями вакансии.'),
  );
}
