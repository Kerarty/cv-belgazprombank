// Стадия 4 — приёмочное тестирование (реализация будет добавлена следующим коммитом).

import { el } from '../core/dom.ts';

export function renderAcceptance(root: HTMLElement, goNext: () => void): void {
  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 4 · Приёмка'),
    el('h3', {}, 'Приёмочное тестирование'),
    el('p', { class: 'stage__lead' }, 'Готовится: чеклист сценариев и поиск дефектов.'),
    el('button', { class: 'btn btn--primary', type: 'button', onClick: () => goNext() }, 'Дальше (демо)'),
  );
}
