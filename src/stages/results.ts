// Стадия 5 — итоги кейса: баллы, связь стадий с обязанностями вакансии, призыв к действию.

import { CASE } from '../data/case.ts';
import { el, mark } from '../core/dom.ts';
import { store } from '../core/state.ts';
import { scoreAcceptance } from './acceptance.ts';

const MAX_DISCOVERED = 9; // максимум требований при бюджете в 5 вопросов
const MAX_TOTAL = MAX_DISCOVERED + MAX_DISCOVERED + 6 + 3; // интервью + классификация + вердикты + нарушения

export function renderResults(root: HTMLElement): void {
  const state = store.get();
  const discovered = state.discovered.length;
  const discoveredReqs = CASE.requirements.filter((req) => state.discovered.includes(req.id));
  const classified = discoveredReqs.filter((req) => state.classified[req.id] === req.kind).length;
  const { verdictsCorrect, defectsFound, violationsCorrect } = scoreAcceptance();
  const total = discovered + classified + verdictsCorrect + violationsCorrect;
  const percent = Math.round((total / MAX_TOTAL) * 100);

  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 5 · Итоги кейса'),
    el('h3', {}, 'Вы только что выполнили работу системного аналитика'),
    el(
      'p',
      { class: 'stage__lead' },
      'Кейс закрыт: требования собраны, классифицированы, оформлены в артефакты, поставка проверена. Ниже — ваш результат и то, как каждая стадия соотносится с обязанностями вакансии.',
    ),
  );

  // --- Баллы ---
  const score = el(
    'div',
    { class: 'score' },
    scoreItem(String(discovered), `требований выявлено · макс. ${MAX_DISCOVERED}`),
    scoreItem(`${classified}/${discoveredReqs.length || '—'}`, 'верно классифицировано'),
    scoreItem(`${defectsFound}/3`, 'дефектов найдено при приёмке'),
    scoreItem(`${violationsCorrect}/3`, 'нарушенные требования указаны'),
    scoreItem(`${total}`, `баллов из ${MAX_TOTAL} · ${percent}%`),
  );
  root.append(score);

  // --- Связь с вакансией ---
  const map = el(
    'div',
    { class: 'map' },
    mapRow('Интервью', 'Сбор и формализация бизнес-требований; взаимодействие с внутренними бизнес-заказчиками'),
    mapRow('Классификация', 'Формирование системных требований и программных решений'),
    mapRow('Артефакты', 'Разработка и согласование документации системного анализа; SRS, спецификации; взаимодействие с поставщиком ПО'),
    mapRow('Приёмка', 'Приёмочное тестирование ПО; оценка качества поставляемого ПО'),
    mapRow('Итоги', 'Аналитический склад ума: видеть в жалобе заказчика требования, в требованиях — сценарии проверки'),
  );
  root.append(map);

  // --- Итоговый вердикт ---
  const banner = el(
    'div',
    {
      class: `verdict-banner ${percent >= 70 ? 'verdict-banner--ok' : 'verdict-banner--mixed'}`,
      style: 'margin-top:16px',
    },
    percent >= 70
      ? `${mark(true)} Так выглядит моя ежедневная работа. Готов обсудить кейс на интервью — в том числе то, что вы сделали иначе.`
      : `${mark(true)} Кейс пройден — и неважно, с какими баллами: каждый аналитик начинает с того, что где-то не спросил. Главное — структура: требования → артефакты → приёмка.`,
  );
  root.append(banner);

  root.append(
    el(
      'div',
      { class: 'stage__actions' },
      el(
        'button',
        {
          class: 'btn btn--soft',
          type: 'button',
          onClick: () => store.reset(),
        },
        '↺ Пройти кейс заново',
      ),
      el('span', { class: 'chip chip--accent' }, 'Контакты — в карточке «Контакты» справа'),
    ),
  );
}

function scoreItem(value: string, label: string): HTMLElement {
  return el(
    'div',
    { class: 'score__item' },
    el('div', { class: 'score__value' }, value),
    el('div', { class: 'score__label' }, label),
  );
}

function mapRow(stage: string, duty: string): HTMLElement {
  return el(
    'div',
    { class: 'map__row' },
    el('span', { class: 'map__stage' }, stage),
    el('span', { class: 'map__duty' }, duty),
  );
}
