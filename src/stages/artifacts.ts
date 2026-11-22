// Стадия 3 — артефакты системного аналитика (реализация будет добавлена следующим коммитом).

import { el } from '../core/dom.ts';

export function renderArtifacts(root: HTMLElement, goNext: () => void): void {
  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 3 · Артефакты'),
    el('h3', {}, 'Артефакты'),
    el('p', { class: 'stage__lead' }, 'Готовится: SRS, блок-схема процесса, sequence-диаграмма REST⇄SOAP, Swagger.'),
    el('button', { class: 'btn btn--primary', type: 'button', onClick: () => goNext() }, 'Дальше (демо)'),
  );
}
