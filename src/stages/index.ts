// Реестр стадий кейса: пайплайн (трекер статусов) + рендер активной стадии.

import { CASE } from '../data/case.ts';
import { el } from '../core/dom.ts';
import { store } from '../core/state.ts';
import { renderInterview } from './interview.ts';
import { renderClassify } from './classify.ts';
import { renderArtifacts } from './artifacts.ts';
import { renderAcceptance } from './acceptance.ts';
import { renderResults } from './results.ts';

type StageRender = (root: HTMLElement, goNext: () => void) => void;

const STAGES: { title: string; render: StageRender }[] = [
  { title: 'Интервью', render: renderInterview },
  { title: 'Классификация', render: renderClassify },
  { title: 'Артефакты', render: renderArtifacts },
  { title: 'Приёмка', render: renderAcceptance },
  { title: 'Итоги', render: renderResults },
];

/** Завершена ли стадия с индексом i по состоянию игры. */
function stageDone(i: number): boolean {
  const s = store.get();
  switch (i) {
    case 0:
      return s.asked.length >= CASE.questionsBudget;
    case 1:
      return s.classifyChecked;
    case 2:
      return s.artifactsDone;
    case 3:
      return s.acceptanceDone;
    default:
      return true;
  }
}

export function renderCaseCard(container: HTMLElement): void {
  const state = store.get();

  const head = el(
    'div',
    { class: 'case__head' },
    el(
      'div',
      { class: 'case__meta' },
      el('span', { class: 'case__ticket' }, `КЕЙС #${CASE.id}`),
      el('span', { class: 'chip chip--accent' }, 'Приоритет: высокий'),
      el('span', { class: 'chip' }, 'Компонент: розничные уведомления'),
    ),
    el('h2', { class: 'case__title' }, CASE.title),
    el('div', { class: 'case__customer' }, `Заказчик: ${CASE.customer}`),
  );

  const pipeline = el('div', { class: 'pipeline', role: 'tablist', ariaLabel: 'Стадии кейса' });
  STAGES.forEach((stage, i) => {
    const done = stageDone(i);
    const current = state.stage === i;
    const locked = i > state.stage;
    const num = done && !current ? '✓' : String(i + 1);
    const step = el(
      'button',
      {
        class: `pipeline__step ${done && !current ? 'pipeline__step--done' : ''} ${
          current ? 'pipeline__step--current' : ''
        } ${locked ? 'pipeline__step--locked' : ''}`,
        type: 'button',
        disabled: locked,
        onClick: () => {
          if (i <= state.stage) store.update({ stage: i });
        },
      },
      el('span', { class: 'pipeline__num', ariaHidden: 'true' }, num),
      stage.title,
    );
    if (current) step.setAttribute('aria-selected', 'true');
    pipeline.append(step);
  });

  const body = el('div', { class: 'stage', role: 'tabpanel' });
  const goNext = () => store.update({ stage: Math.min(state.stage + 1, STAGES.length - 1) });
  STAGES[state.stage].render(body, goNext);

  const card = el('section', { class: 'case', id: 'case', ariaLabel: 'Интерактивный кейс' }, head, pipeline, body);
  container.replaceChildren(card);
}

/** Перерисовать кейс при изменении состояния. */
export function initCase(container: HTMLElement): () => void {
  const render = () => renderCaseCard(container);
  render();
  return store.subscribe(render);
}
