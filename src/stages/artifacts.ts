// Стадия 3 — артефакты системного аналитика: SRS, блок-схема процесса,
// sequence-диаграмма с переключателем REST⇄SOAP и Swagger-фрагмент.

import { CASE } from '../data/case.ts';
import { el } from '../core/dom.ts';
import { highlight } from '../highlight.ts';
import { renderSequence, type Protocol } from '../diagrams/sequence.ts';
import { renderFlow, type FlowMode } from '../diagrams/flowchart.ts';
import { store } from '../core/state.ts';

type Tab = 'srs' | 'flow' | 'integration' | 'swagger';

let activeTab: Tab = 'srs';
let protocol: Protocol = 'rest';
let flowMode: FlowMode = 'as-is';

export function renderArtifacts(root: HTMLElement, goNext: () => void): void {
  root.append(
    el('div', { class: 'stage__kicker' }, 'Стадия 3 · Артефакты системного аналитика'),
    el('h3', {}, 'Требования превращаются в документы'),
    el(
      'p',
      { class: 'stage__lead' },
      'Реестр из интервью и классификации ложится в артефакты: спецификацию требований, схему процесса, контракт интеграции. ' +
        'Именно эти документы согласуются с заказчиком и передаются разработке и поставщику.',
    ),
  );

  // --- Табы ---
  const tabs = el('div', { class: 'tabs', role: 'tablist' });
  const tabDefs: { id: Tab; label: string }[] = [
    { id: 'srs', label: 'SRS-фрагмент' },
    { id: 'flow', label: 'Бизнес-процесс' },
    { id: 'integration', label: 'Интеграция' },
    { id: 'swagger', label: 'Swagger' },
  ];
  for (const t of tabDefs) {
    tabs.append(
      el(
        'button',
        {
          class: `tab ${activeTab === t.id ? 'tab--active' : ''}`,
          type: 'button',
          role: 'tab',
          ariaSelected: String(activeTab === t.id),
          onClick: () => {
            activeTab = t.id;
            store.update({}); // перерисовать
          },
        },
        t.label,
      ),
    );
  }
  root.append(tabs);

  // --- Содержимое артефакта ---
  const artifact = el('div', { class: 'artifact' });
  const body = el('div', { class: 'artifact__body' });
  const bar = el('div', { class: 'artifact__bar' });

  if (activeTab === 'srs') {
    bar.append(el('span', {}, 'SRS-фрагмент · сервис розничных уведомлений · v0.3 · статус: на согласовании'));
    body.append(renderSrs());
  } else if (activeTab === 'flow') {
    bar.append(
      el('span', {}, 'process-notifications.bpmn · экспорт схемы'),
      flowSwitch(),
    );
    body.append(renderFlow(flowMode));
  } else if (activeTab === 'integration') {
    bar.append(
      el('span', {}, protocol === 'rest' ? 'sequence-integration.rest' : 'sequence-integration.soap'),
      protocolSwitch(),
    );
    body.append(renderSequence(protocol), payloadBlock());
  } else {
    bar.append(el('span', {}, 'swagger.yaml · OAS 3.0.1 · POST /v1/notifications'));
    body.append(swaggerBlock());
  }

  artifact.append(bar, body);
  root.append(artifact);

  // --- Действия ---
  root.append(
    el(
      'div',
      { class: 'stage__actions' },
      el(
        'button',
        {
          class: 'btn btn--primary',
          type: 'button',
          onClick: () => {
            store.update({ artifactsDone: true });
            goNext();
          },
        },
        'Согласовано с заказчиком — передаём в разработку →',
      ),
    ),
  );
}

/* ---------- Переключатели ---------- */

function protocolSwitch(): HTMLElement {
  const wrap = el('span', { class: 'switch', role: 'group', ariaLabel: 'Протокол интеграции' });
  for (const option of [
    { id: 'rest' as Protocol, label: 'REST · JSON' },
    { id: 'soap' as Protocol, label: 'SOAP · XML' },
  ]) {
    wrap.append(
      el(
        'button',
        {
          class: protocol === option.id ? 'switch--active' : '',
          type: 'button',
          onClick: () => {
            protocol = option.id;
            store.update({});
          },
        },
        option.label,
      ),
    );
  }
  return wrap;
}

function flowSwitch(): HTMLElement {
  const wrap = el('span', { class: 'switch', role: 'group', ariaLabel: 'Версия процесса' });
  for (const option of [
    { id: 'as-is' as FlowMode, label: 'Как есть' },
    { id: 'to-be' as FlowMode, label: 'Как будет' },
  ]) {
    wrap.append(
      el(
        'button',
        {
          class: flowMode === option.id ? 'switch--active' : '',
          type: 'button',
          onClick: () => {
            flowMode = option.id;
            store.update({});
          },
        },
        option.label,
      ),
    );
  }
  return wrap;
}

/* ---------- SRS ---------- */

function reqRow(kind: ReqRowKind, id: string, text: string, source: 'интервью' | 'анализ'): HTMLElement {
  return el(
    'div',
    { class: `reqrow reqrow--${kind === 'FR' ? 'fr' : kind === 'NFR' ? 'nfr' : 'con'}` },
    el('span', { class: 'reqrow__id' }, id),
    el('span', { style: 'flex:1' }, text),
    el(
      'span',
      { class: `chip ${source === 'интервью' ? 'chip--accent' : 'chip--warn'}`, title: 'Как получено требование' },
      source,
    ),
  );
}

type ReqRowKind = 'FR' | 'NFR' | 'CON';

function renderSrs(): HTMLElement {
  const state = store.get();
  const wrap = el('div', { class: 'srs' });
  const discovered = state.discovered;

  const group = (kind: ReqRowKind, title: string) => {
    const section = el('div', {});
    section.append(el('h4', {}, title));
    const items = CASE.requirements.filter((req) => req.kind === kind);
    for (const req of items) {
      section.append(reqRow(kind, req.id, req.text, discovered.includes(req.id) ? 'интервью' : 'анализ'));
    }
    return section;
  };

  wrap.append(
    el('h4', {}, '1. Введение'),
    el(
      'p',
      {},
      'Назначение: сервис розничных уведомлений о банковских операциях. Объём: переводы и оплаты в мобильном приложении. ' +
        'Заказчик: департамент розничного бизнеса. Документ согласуется с заказчиком, ИБ и поставщиком шлюза.',
    ),
    group('FR', '2. Функциональные требования'),
    group('NFR', '3. Нефункциональные требования'),
    group('CON', '4. Ограничения и допущения'),
  );

  const notFound = CASE.requirements.filter((req) => !discovered.includes(req.id)).length;
  if (notFound > 0) {
    wrap.append(
      el(
        'div',
        { class: 'srs__todo' },
        el('span', { class: 'srs__todo-label' }, 'Примечание аналитика'),
        `${notFound} треб. помечено «анализ»: не всплыли на интервью и добавлены по результатам изучения регламентов. ` +
          'На согласовании SRS такие требования проверяются в первую очередь — Interview coverage никогда не бывает 100%.',
      ),
    );
  }

  wrap.append(
    el('h4', {}, '5. Критерии приёмки'),
    el(
      'p',
      {},
      'Каждое ФТ проверяется приёмочным сценарием (стадия 4), каждое НФТ — измерением. Поставка без журнала статусов (ФТ-4) к приёмке не принимается.',
    ),
  );

  return wrap;
}

/* ---------- Payload / Swagger ---------- */

function payloadBlock(): HTMLElement {
  const restPayload = `POST /v1/notifications HTTP/1.1
Host: notify.bank.example
Content-Type: application/json

{
  "operationId": "op-2026-11-22-00913",
  "clientId": "cl-8842",
  "channel": "push",
  "text": "Перевод 100 BYN · карта •• 0910"
}`;

  const soapPayload = `POST /NotificationService HTTP/1.1
Host: gateway.supplier.example
SOAPAction: "Send"
Content-Type: application/soap+xml

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <ns:SendNotification xmlns:ns="https://gateway.supplier.example/wsdl/v1">
      <operationId>op-2026-11-22-00913</operationId>
      <channel>PUSH</channel>
      <text>Перевод 100 BYN · карта •• 0910</text>
    </ns:SendNotification>
  </soap:Body>
</soap:Envelope>`;

  const code = protocol === 'rest' ? restPayload : soapPayload;
  const lang = protocol === 'rest' ? 'json' : 'xml';

  return el(
    'div',
    { class: 'payload' },
    el('div', { class: 'artifact__bar' }, el('span', {}, protocol === 'rest' ? 'Пример запроса · JSON' : 'Пример запроса · SOAP-конверт (контракт WSDL)')),
    el('pre', { class: 'code', html: highlight(code, lang) }),
    el(
      'p',
      { class: 'stage__lead', style: 'margin-top:10px' },
      protocol === 'rest'
        ? 'REST/JSON: лёгкий формат, идемпотентный operationId, очередь на стороне банка при сбое шлюза (НФТ-3).'
        : 'SOAP/XML: строгий контракт по WSDL поставщика, конверт и типизация решают всё — но payload тяжелее, а версионирование жёстче.',
    ),
  );
}

function swaggerBlock(): HTMLElement {
  const yaml = `openapi: 3.0.1
info:
  title: Notification Gateway API          # контракт поставщика шлюза
  version: 1.0.0
servers:
  - url: https://gateway.supplier.example/v1
paths:
  /notifications:
    post:
      summary: Отправка уведомления клиенту
      operationId: sendNotification
      security:
        - serviceToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [operationId, channel, text]
              properties:
                operationId:               # идемпотентность повторов (НФТ-3)
                  type: string
                channel:                   # push основной, sms резерв (ФТ-3)
                  type: string
                  enum: [push, sms]
                text:                      # без полного номера (ОГР-1)
                  type: string
      responses:
        '202':
          description: Принято в очередь
        '400':
          description: Нарушение формата или политики ИБ (ОГР-1)
        '401':
          description: Неверный сервисный токен`;

  return el(
    'div',
    {},
    el('pre', { class: 'code', html: highlight(yaml, 'yaml') }),
    el(
      'p',
      { class: 'stage__lead', style: 'margin-top:10px' },
      'Swagger-контракт — общий язык банка и поставщика: из него генерируются клиенты, моки и проверки приёмочных сценариев.',
    ),
  );
}
