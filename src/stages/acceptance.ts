// Стадия 4 — приёмочное тестирование поставки от поставщика ПО:
// игрок помечает сценарии «пройден/дефект», для дефектов указывает нарушенное требование.

import { CASE, KIND_LABELS, type ReqKind } from '../data/case.ts';
import { el, mark } from '../core/dom.ts';
import { store, type AcceptanceResult } from '../core/state.ts';

export function renderAcceptance(root: HTMLElement, goNext: () => void): void {
  const state = store.get();
  const done = state.acceptanceDone;

  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 4 · Приёмочное тестирование'),
    el('h3', {}, 'Поставка от поставщика — принимаем?'),
    el(
      'p',
      { class: 'stage__lead' },
      'Поставщик прислал сборку по вашему SRS. Прогоните приёмочные сценарии: часть из них специально расходится со спецификацией. ' +
        'Дефект — только там, где сценарий нарушает конкретное требование; для него укажите, какое именно. ' +
        'Это и есть «оценка качества поставляемого ПО» из обязанностей аналитика.',
    ),
  );

  const list = el('div', { class: 'acceptance' });
  for (const scenario of CASE.acceptance) {
    list.append(scenarioNode(scenario, done));
  }
  root.append(list);

  // --- Действия ---
  const answered = CASE.acceptance.filter((scenario) => state.acceptance[scenario.id]).length;
  const allAnswered = answered === CASE.acceptance.length;
  const actions = el('div', { class: 'stage__actions' });
  if (!done) {
    actions.append(
      el(
        'span',
        { class: `chip ${allAnswered ? 'chip--ok' : 'chip--accent'}` },
        `Пройдено сценариев: ${answered} из ${CASE.acceptance.length}`,
      ),
      el(
        'button',
        {
          class: 'btn btn--primary',
          type: 'button',
          disabled: !allAnswered,
          onClick: () => store.update({ acceptanceDone: true }),
        },
        'Сформировать решение по поставке →',
      ),
    );
  } else {
    const { defectsFound, falseAlarms, violationsCorrect } = scoreAcceptance();
    const allRight = falseAlarms === 0 && defectsFound === totalRealDefects() && violationsCorrect === totalRealDefects();
    actions.append(
      el(
        'div',
        {
          class: `verdict-banner ${allRight ? 'verdict-banner--ok' : 'verdict-banner--mixed'}`,
          style: 'flex:1;min-width:280px',
        },
        allRight
          ? `${mark(true)} Решение: возвращено поставщику с замечаниями — все ${totalRealDefects()} дефекта найдены, требования нарушений указаны верно. Приёмка не пройдена — и это правильный результат.`
          : `${mark(false)} Дефекты найдены: ${defectsFound} из ${totalRealDefects()}, ложных тревог: ${falseAlarms}, нарушения указаны верно: ${violationsCorrect}. Проверьте пояснения ниже — и перепройдите сценарии.`,
      ),
      el(
        'button',
        { class: 'btn btn--soft', type: 'button', onClick: () => goNext() },
        'Итоги кейса →',
      ),
    );
  }
  root.append(actions);
}

/* ---------- Один сценарий ---------- */

function scenarioNode(scenario: (typeof CASE.acceptance)[number], done: boolean): HTMLElement {
  const state = store.get();
  const result = state.acceptance[scenario.id];
  const verdict = result?.verdict;

  const verdictWrap = el('div', { class: 'ac__verdict' });
  for (const option of ['pass', 'fail'] as const) {
    const label = option === 'pass' ? '✓ Пройден' : '✕ Дефект';
    const active = verdict === option;
    verdictWrap.append(
      el(
        'button',
        {
          class: `btn btn--outline ${active ? (option === 'pass' ? 'chip--ok' : 'chip--fail') : ''}`,
          type: 'button',
          disabled: done && verdict === option,
          style: active
            ? option === 'pass'
              ? 'background:var(--ok-soft);border-color:#bfe3d0;color:var(--ok);font-weight:700'
              : 'background:var(--fail-soft);border-color:#ecc8c2;color:var(--fail);font-weight:700'
            : '',
          onClick: () => setVerdict(scenario.id, option),
        },
        label,
      ),
    );
  }

  if (verdict === 'fail') {
    const select = el(
      'select',
      {
        ariaLabel: `Нарушенное требование для ${scenario.id}`,
        onChange: (node) => setViolation(scenario.id, (node as HTMLSelectElement).value),
      },
      el('option', { value: '' }, '— нарушенное требование —'),
      ...CASE.requirements.map((req) =>
        el('option', { value: req.id }, `${req.id} · ${KIND_LABELS[req.kind as ReqKind]}`),
      ),
    );
    select.value = result?.violation ?? '';
    verdictWrap.append(select);
  }

  const node = el(
    'div',
    {
      class: `ac ${done && verdict ? (verdict === (scenario.actuallyPasses ? 'pass' : 'fail') ? 'ac--checked-ok' : 'ac--checked-fail') : ''}`,
    },
    el('div', { class: 'ac__head' }, el('span', { class: 'ac__id' }, scenario.id), verdictWrap),
    el('div', { class: 'ac__text' }, scenario.text),
  );

  if (done) {
    const verdictCorrect = verdict === (scenario.actuallyPasses ? 'pass' : 'fail');
    node.append(
      el(
        'div',
        { class: 'ac__explain' },
        `${mark(scenario.actuallyPasses)} Итог: ${scenario.explanation}`,
        verdictCorrect ? '' : ' — ваше решение было другим.',
      ),
    );
  }

  return node;
}

function setVerdict(id: string, verdict: 'pass' | 'fail'): void {
  const current = store.get();
  if (current.acceptanceDone) return;
  const previous = current.acceptance[id];
  const entry: AcceptanceResult =
    verdict === 'pass' ? { verdict } : { verdict, violation: previous?.violation };
  store.update({ acceptance: { ...current.acceptance, [id]: entry } });
}

function setViolation(id: string, violation: string): void {
  const current = store.get();
  if (current.acceptanceDone) return;
  const existing = current.acceptance[id];
  if (!existing) return;
  store.update({
    acceptance: { ...current.acceptance, [id]: { ...existing, violation: violation || undefined } },
  });
}

/* ---------- Подсчёт ---------- */

function totalRealDefects(): number {
  return CASE.acceptance.filter((scenario) => !scenario.actuallyPasses).length;
}

export function scoreAcceptance(): {
  verdictsCorrect: number;
  defectsFound: number;
  falseAlarms: number;
  violationsCorrect: number;
} {
  const state = store.get();
  let verdictsCorrect = 0;
  let defectsFound = 0;
  let falseAlarms = 0;
  let violationsCorrect = 0;
  for (const scenario of CASE.acceptance) {
    const result = state.acceptance[scenario.id];
    if (!result) continue;
    const expected = scenario.actuallyPasses ? 'pass' : 'fail';
    if (result.verdict === expected) verdictsCorrect++;
    if (result.verdict === 'fail' && !scenario.actuallyPasses) {
      defectsFound++;
      if (result.violation === scenario.violates) violationsCorrect++;
    }
    if (result.verdict === 'fail' && scenario.actuallyPasses) falseAlarms++;
  }
  return { verdictsCorrect, defectsFound, falseAlarms, violationsCorrect };
}
