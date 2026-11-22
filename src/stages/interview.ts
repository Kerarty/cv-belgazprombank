// Стадия 1 — интервью с бизнес-заказчиком: игрок выбирает вопросы,
// ответы вскрывают требования (не все — бюджет вопросов ограничен).

import { CASE } from '../data/case.ts';
import { el } from '../core/dom.ts';
import { store } from '../core/state.ts';

export function renderInterview(root: HTMLElement, goNext: () => void): void {
  const state = store.get();
  const asked = state.asked;
  const remaining = CASE.questionsBudget - asked.length;
  const canFinish = remaining <= 0;

  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 1 · Сбор требований'),
    el('h3', {}, 'Интервью с бизнес-заказчиком'),
    el(
      'p',
      { class: 'stage__lead' },
      `Бюджет рабочего времени — ${CASE.questionsBudget} вопросов из ${CASE.questions.length}. ` +
        'Каждый ответ вскрывает часть требований. Что не успели спросить — то и не попадёт в реестр: как и в реальной работе, умение выбирать вопросы важнее их количества.',
    ),
  );

  // --- Диалог ---
  const chat = el('div', { class: 'chat', role: 'log', ariaLabel: 'Ход интервью' });
  chat.append(
    el(
      'div',
      { class: 'msg msg--customer' },
      el('div', { class: 'msg__who' }, CASE.customer),
      CASE.brief,
    ),
  );

  for (const qId of asked) {
    const q = CASE.questions.find((item) => item.id === qId);
    if (!q) continue;
    chat.append(el('div', { class: 'msg msg--analyst' }, el('div', { class: 'msg__who' }, 'Аналитик'), q.question));
    const answer = el(
      'div',
      { class: 'msg msg--customer' },
      el('div', { class: 'msg__who' }, CASE.customer),
      q.answer,
      el('div', { class: 'msg__why' }, q.why),
    );
    const revealed = q.reveals.map((id) => {
      const req = CASE.requirements.find((item) => item.id === id);
      return el('span', { class: 'chip chip--accent' }, `${id} · ${req ? req.text : ''}`);
    });
    if (revealed.length > 0) answer.append(el('div', { class: 'msg__reqs' }, ...revealed));
    chat.append(answer);
  }
  root.append(chat);

  // --- Банк вопросов ---
  const unasked = CASE.questions.filter((q) => !asked.includes(q.id));
  if (unasked.length > 0 && !canFinish) {
    root.append(
      el(
        'p',
        { class: 'qbank__hint' },
        el('strong', {}, `Осталось вопросов: ${remaining}. `),
        'Выберите, что спросить:',
      ),
    );
    const bank = el('div', { class: 'qbank' });
    for (const q of unasked) {
      bank.append(
        el(
          'button',
          {
            class: 'qcard',
            type: 'button',
            onClick: () => {
              const current = store.get();
              if (current.asked.length >= CASE.questionsBudget) return;
              store.update({
                asked: [...current.asked, q.id],
                discovered: [...new Set([...current.discovered, ...q.reveals])],
              });
            },
          },
          el('span', { class: 'qcard__icon', ariaHidden: 'true' }, '❓'),
          el('span', {}, q.question),
        ),
      );
    }
    root.append(bank);
  }

  // --- Действия ---
  const counter = el(
    'span',
    { class: `chip ${canFinish ? 'chip--ok' : 'chip--accent'}` },
    `Выявлено требований: ${state.discovered.length} из ${CASE.requirements.length}`,
  );
  const finishBtn = el(
    'button',
    {
      class: 'btn btn--primary',
      type: 'button',
      disabled: !canFinish,
      onClick: () => goNext(),
    },
    'Сформировать реестр требований →',
  );
  root.append(el('div', { class: 'stage__actions' }, counter, finishBtn));
  if (!canFinish) {
    root.append(
      el(
        'p',
        { class: 'stage__lead' },
        'Кнопка активируется, когда бюджет вопросов исчерпан — интервью не бесконечно.',
      ),
    );
  }
}
