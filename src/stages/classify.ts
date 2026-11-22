// Стадия 2 — классификация требований (реализация будет добавлена следующим коммитом).

import { el } from '../core/dom.ts';

export function renderClassify(root: HTMLElement, goNext: () => void): void {
  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 2 · Классификация'),
    el('h3', {}, 'Классификация требований'),
    el('p', { class: 'stage__lead' }, 'Готовится: распределите требования по типам — ФТ / НФТ / ограничения.'),
    el('button', { class: 'btn btn--primary', type: 'button', onClick: () => goNext() }, 'Дальше (демо)'),
  );
}
