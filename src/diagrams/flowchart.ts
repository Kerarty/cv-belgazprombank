// SVG-блок-схема бизнес-процесса: «как есть» (проблемная) и «как будет» (целевая).

export type FlowMode = 'as-is' | 'to-be';

interface FlowStep {
  title: string;
  sub?: string;
  tone?: 'accent' | 'ok' | 'fail' | 'plain';
}

const AS_IS: FlowStep[] = [
  { title: 'Операция в АБС (перевод, оплата)', tone: 'accent' },
  { title: 'Событие об операции регистрируется', tone: 'plain' },
  { title: 'Регламентная рассылка — раз в 10 минут', sub: 'задержка 2–10 минут · НФТ-1 не выполнимо', tone: 'fail' },
  { title: 'SMS всем клиентам без исключений', sub: 'платный канал без бюджета (ОГР-2) · push не используется', tone: 'fail' },
  { title: 'Клиент получает уведомление с опозданием', sub: 'жалобы, звонки в поддержку', tone: 'fail' },
];

const TO_BE: FlowStep[] = [
  { title: 'Операция в АБС (перевод, оплата)', tone: 'accent' },
  { title: 'Событие → интеграционная шина, ≤1 с', tone: 'ok' },
  { title: 'Сервис уведомлений: валидация + маскирование', sub: 'текст без полного номера карты (ОГР-1)', tone: 'ok' },
  { title: 'Маршрутизация каналов', sub: 'push — основной, SMS — резерв после 60 с (ФТ-3, ОГР-2)', tone: 'ok' },
  { title: 'Очередь и до 3 повторов при сбое шлюза', sub: 'сообщения не теряются (НФТ-3)', tone: 'ok' },
  { title: 'Шлюз поставщика · официальное API', sub: 'интеграция по контракту (ОГР-3)', tone: 'plain' },
  { title: 'Доставка ≤5 с · статус в журнал · отчёт', sub: 'НФТ-1, ФТ-4, ФТ-5', tone: 'ok' },
];

const COLORS = {
  accent: '#1c1a15',
  ok: '#2e6b4f',
  fail: '#b3271a',
  plain: '#5f594c',
  softAccent: '#efece2',
  softOk: '#e4efe6',
  softFail: '#f4e3dd',
  softPlain: '#f1eee5',
  ink: '#1c1a15',
  muted: '#5f594c',
};

export function renderFlow(mode: FlowMode): SVGSVGElement {
  const steps = mode === 'as-is' ? AS_IS : TO_BE;
  const W = 640;
  const boxW = 500;
  const x = (W - boxW) / 2;
  const top = 16;
  const gap = 24;

  const heights = steps.map((s) => (s.sub ? 50 : 38));
  const totalH = heights.reduce((a, b) => a + b + gap, 0) - gap + top * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${totalH}`);
  svg.setAttribute('class', 'flow');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Схема бизнес-процесса (${mode === 'as-is' ? 'как есть' : 'как будет'})`);

  const defs = document.createElementNS(svg.namespaceURI, 'defs');
  defs.innerHTML =
    `<marker id="flow-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 0 L10 5 L0 10 z" fill="${COLORS.muted}"/></marker>`;
  svg.append(defs);

  let y = top;
  steps.forEach((step, i) => {
    const h = heights[i];
    const tone = step.tone ?? 'plain';
    const fill = tone === 'accent' ? COLORS.softAccent : tone === 'ok' ? COLORS.softOk : tone === 'fail' ? COLORS.softFail : COLORS.softPlain;
    const stroke = tone === 'accent' ? COLORS.accent : tone === 'ok' ? COLORS.ok : tone === 'fail' ? COLORS.fail : COLORS.plain;

    const box = document.createElementNS(svg.namespaceURI, 'rect');
    box.setAttribute('x', String(x));
    box.setAttribute('y', String(y));
    box.setAttribute('width', String(boxW));
    box.setAttribute('height', String(h));
    box.setAttribute('rx', '2');
    box.setAttribute('fill', fill);
    box.setAttribute('stroke', stroke);
    box.setAttribute('stroke-width', '1.3');
    svg.append(box);

    svg.append(flowText(W / 2, y + (step.sub ? 20 : h / 2 + 4), step.title, { size: 13, bold: true, anchor: 'middle' }));
    if (step.sub) {
      svg.append(flowText(W / 2, y + 38, step.sub, { size: 11, anchor: 'middle', fill: COLORS.muted }));
    }

    if (i < steps.length - 1) {
      const line = document.createElementNS(svg.namespaceURI, 'line');
      line.setAttribute('x1', String(W / 2));
      line.setAttribute('y1', String(y + h));
      line.setAttribute('x2', String(W / 2));
      line.setAttribute('y2', String(y + h + gap - 6));
      line.setAttribute('stroke', COLORS.muted);
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('marker-end', 'url(#flow-arr)');
      svg.append(line);
    }
    y += h + gap;
  });

  return svg;
}

function flowText(x: number, y: number, content: string, opts: { size?: number; bold?: boolean; fill?: string; anchor?: string } = {}): SVGTextElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  node.setAttribute('x', String(x));
  node.setAttribute('y', String(y));
  node.setAttribute('font-size', String(opts.size ?? 12));
  node.setAttribute('fill', opts.fill ?? COLORS.ink);
  if (opts.bold) node.setAttribute('font-weight', '600');
  node.setAttribute('text-anchor', opts.anchor ?? 'start');
  node.setAttribute('font-family', "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif");
  node.textContent = content;
  return node;
}
