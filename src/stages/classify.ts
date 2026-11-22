// Стадия 2 — классификация выявленных требований: игрок раскладывает карточки
// по типам (ФТ / НФТ / Ограничение). Drag-n-drop + клавиатурный фолбэк.

import { CASE, KIND_LABELS, type ReqKind, type Requirement } from '../data/case.ts';
import { el } from '../core/dom.ts';
import { store } from '../core/state.ts';

const BUCKETS: { kind: ReqKind; hint: string }[] = [
  { kind: 'FR', hint: 'что система должна делать' },
  { kind: 'NFR', hint: 'насколько хорошо: скорость, надёжность' },
  { kind: 'CON', hint: 'рамки: бюджет, ИБ, контракты' },
];

/** Локальное состояние выбора (не сохраняется — только для клавиатурного фолбэка). */
let selectedId: string | null = null;

export function renderClassify(root: HTMLElement, goNext: () => void): void {
  const state = store.get();
  const reqs = CASE.requirements.filter((req) => state.discovered.includes(req.id));
  const placed = Object.keys(state.classified).filter((id) => reqs.some((req) => req.id === id));
  const allPlaced = reqs.length > 0 && placed.length === reqs.length;
  const checked = state.classifyChecked;

  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 2 · Классификация требований'),
    el('h3', {}, 'Распределите реестр по типам'),
    el(
      'p',
      { class: 'stage__lead' },
      'Перетащите карточки в нужные категории. Это не бюрократия: тип требования определяет, ' +
        'кто и как его проверяет — функциональные тестируются сценариями, нефункциональные — метриками, ограничения — ревью архитектуры. ' +
        'С клавиатуры: выберите карточку кликом, затем кликните категорию.',
    ),
  );

  // --- Пул нераспределённых карточек ---
  const unplaced = reqs.filter((req) => !state.classified[req.id]);
  const pool = el('div', { class: 'pool', ariaLabel: 'Нераспределённые требования' });
  if (unplaced.length === 0) {
    pool.append(el('span', { class: 'bucket__empty' }, 'Все карточки распределены — можно проверять'));
  }
  for (const req of unplaced) {
    pool.append(reqCard(req, checked));
  }
  root.append(pool);

  // --- Категории ---
  const buckets = el('div', { class: 'buckets' });
  for (const bucket of BUCKETS) {
    buckets.append(reqBucket(bucket, reqs, checked));
  }
  root.append(buckets);

  // --- Действия ---
  const actions = el('div', { class: 'classify-actions' });
  const checkBtn = el(
    'button',
    {
      class: 'btn btn--primary',
      type: 'button',
      disabled: !allPlaced,
      onClick: () => store.update({ classifyChecked: true }),
    },
    checked ? 'Перепроверить' : 'Проверить классификацию',
  );
  actions.append(checkBtn);
  if (checked) {
    const correct = reqs.filter((req) => state.classified[req.id] === req.kind).length;
    actions.append(
      el(
        'span',
        { class: `chip ${correct === reqs.length ? 'chip--ok' : 'chip--warn'}` },
        `Верно: ${correct} из ${reqs.length}. ${correct === reqs.length ? 'Отличная сортировка!' : 'Карточки с ошибками подсвечены — исправьте и перепроверьте.'}`,
      ),
    );
    actions.append(
      el(
        'button',
        { class: 'btn btn--soft', type: 'button', onClick: () => goNext() },
        'Артефакты →',
      ),
    );
  }
  root.append(actions);
}

function reqCard(req: Requirement, checked: boolean): HTMLElement {
  const state = store.get();
  const wrong = checked && state.classified[req.id] !== undefined && state.classified[req.id] !== req.kind;
  const verdictClass = checked
    ? state.classified[req.id] === req.kind
      ? ' card-req--verdict-ok'
      : ' card-req--verdict-fail'
    : '';
  const node = el(
    'div',
    {
      class: `card-req${verdictClass}`,
      dataset: { reqId: req.id },
      tabIndex: 0,
      role: 'button',
      ariaLabel: `${req.id}: ${req.text}. Требование без категории.`,
      onClick: () => {
        selectedId = selectedId === req.id ? null : req.id;
        syncSelection();
      },
      onKeyDown: (_node, ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          selectedId = selectedId === req.id ? null : req.id;
          syncSelection();
        }
      },
      onDragStart: (node, ev) => {
        ev.dataTransfer?.setData('text/plain', req.id);
        ev.dataTransfer!.effectAllowed = 'move';
        node.classList.add('card-req--dragging');
      },
      onDragEnd: (node) => node.classList.remove('card-req--dragging'),
    },
    el('span', { class: 'card-req__id' }, req.id),
    req.text,
  );
  node.draggable = !checked;
  if (wrong) node.setAttribute('aria-label', `${req.id}: ${req.text}. Ошибка: это ${KIND_LABELS[req.kind].toLowerCase()}.`);
  return node;
}

function reqBucket(bucket: { kind: ReqKind; hint: string }, reqs: Requirement[], checked: boolean): HTMLElement {
  const state = store.get();
  const inside = reqs.filter((req) => state.classified[req.id] === bucket.kind);
  const drop = el('div', { class: 'bucket__drop' });
  if (inside.length === 0) {
    drop.append(el('div', { class: 'bucket__empty' }, 'Перетащите карточки сюда'));
  }
  for (const req of inside) {
    drop.append(reqCard(req, checked));
  }

  const zone = el(
    'div',
    {
      class: `bucket bucket--${bucket.kind.toLowerCase()}`,
      ariaLabel: `Категория: ${KIND_LABELS[bucket.kind]} (${bucket.hint})`,
      onDragOver: (node, ev) => {
        ev.preventDefault();
        node.classList.add('bucket--over');
      },
      onDragLeave: (node) => node.classList.remove('bucket--over'),
      onDrop: (node, ev) => {
        ev.preventDefault();
        node.classList.remove('bucket--over');
        const reqId = ev.dataTransfer?.getData('text/plain');
        if (reqId) assign(reqId, bucket.kind);
      },
      onClick: () => {
        // Клавиатурный фолбэк: клик по категории назначает выбранную карточку.
        if (selectedId) {
          const id = selectedId;
          selectedId = null;
          assign(id, bucket.kind);
        }
      },
    },
    el(
      'div',
      { class: 'bucket__title' },
      `${KIND_LABELS[bucket.kind]} · ${bucket.kind}`,
      el('div', { style: 'font-weight:400;font-size:11.5px;color:var(--faint)' }, bucket.hint),
    ),
    drop,
  );
  zone.tabIndex = 0;
  zone.setAttribute('role', 'button');
  zone.onkeydown = (ev) => {
    if (ev.key === 'Enter' && selectedId) {
      const id = selectedId;
      selectedId = null;
      assign(id, bucket.kind);
    }
  };
  return zone;
}

function assign(reqId: string, kind: ReqKind): void {
  const current = store.get();
  if (current.classifyChecked) return;
  store.update({ classified: { ...current.classified, [reqId]: kind } });
}

function syncSelection(): void {
  document.querySelectorAll<HTMLElement>('.card-req').forEach((node) => {
    const isSelected = node.dataset.reqId === selectedId;
    node.style.outline = isSelected ? '2px solid var(--accent)' : '';
    node.setAttribute('aria-selected', String(isSelected));
  });
}
