// SVG-диаграмма последовательности: АБС → сервис уведомлений → шлюз поставщика.
// Переключение REST/JSON ⇄ SOAP/XML меняет набор сообщений.

export type Protocol = 'rest' | 'soap';

interface Participant {
  label: string;
  sub?: string;
}

interface Msg {
  from: number;
  to: number;
  label: string;
  dashed?: boolean;
  self?: boolean;
  tone?: 'accent' | 'ok' | 'fail' | 'muted';
}

const PARTICIPANTS: Participant[] = [
  { label: 'АБС банка', sub: 'операции' },
  { label: 'Сервис уведомлений', sub: 'новый контур' },
  { label: 'Шлюз поставщика', sub: 'внешняя система' },
  { label: 'Телефон клиента', sub: 'push / SMS' },
];

const REST_MESSAGES: Msg[] = [
  { from: 0, to: 1, label: 'POST /v1/notifications · JSON', tone: 'accent' },
  { from: 1, to: 1, label: 'валидация + маскирование (ОГР-1)', self: true, tone: 'ok' },
  { from: 1, to: 2, label: 'POST /v1/send {text, channel} · JSON', tone: 'accent' },
  { from: 2, to: 1, label: '202 Accepted {notificationId}', dashed: true, tone: 'muted' },
  { from: 2, to: 3, label: 'push доставлен (НФТ-1: ≤5 с)', tone: 'ok' },
  { from: 2, to: 1, label: 'callback POST /v1/status «delivered»', dashed: true, tone: 'muted' },
  { from: 1, to: 1, label: 'статус → журнал (ФТ-4), очередь при сбое (НФТ-3)', self: true, tone: 'ok' },
];

const SOAP_MESSAGES: Msg[] = [
  { from: 0, to: 1, label: 'POST /NotificationService · SOAP 1.2', tone: 'accent' },
  { from: 1, to: 1, label: 'валидация + маскирование (ОГР-1)', self: true, tone: 'ok' },
  { from: 1, to: 2, label: 'SOAPAction: Send · XML-конверт по WSDL', tone: 'accent' },
  { from: 2, to: 1, label: '200 OK · SOAP-ответ', dashed: true, tone: 'muted' },
  { from: 2, to: 3, label: 'push доставлен (НФТ-1: ≤5 с)', tone: 'ok' },
  { from: 2, to: 1, label: 'статус доставки по контракту WSDL', dashed: true, tone: 'muted' },
  { from: 1, to: 1, label: 'статус → журнал (ФТ-4), очередь при сбое (НФТ-3)', self: true, tone: 'ok' },
];

const COLORS = {
  accent: '#1c1a15',
  ok: '#2e6b4f',
  fail: '#b3271a',
  muted: '#5f594c',
  line: '#b5ad9a',
  ink: '#1c1a15',
  soft: '#efece2',
};

export function renderSequence(protocol: Protocol): SVGSVGElement {
  const msgs = protocol === 'rest' ? REST_MESSAGES : SOAP_MESSAGES;
  const W = 744;
  const rowH = 48;
  const top = 64;
  const H = top + msgs.length * rowH + 28;
  const step = (W - 160) / (PARTICIPANTS.length - 1);
  const xs = PARTICIPANTS.map((_, i) => 80 + i * step);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'seq');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    `Диаграмма последовательности интеграции (${protocol === 'rest' ? 'REST/JSON' : 'SOAP/XML'})`,
  );

  const defs = document.createElementNS(svg.namespaceURI, 'defs');
  defs.innerHTML =
    `<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 0 L10 5 L0 10 z" fill="${COLORS.accent}"/></marker>` +
    `<marker id="arr-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 0 L10 5 L0 10 z" fill="${COLORS.muted}"/></marker>`;
  svg.append(defs);

  // Заголовки участников + линии жизни
  PARTICIPANTS.forEach((p, i) => {
    const x = xs[i];
    const box = rect(x - 62, 14, 124, 40, COLORS.soft, COLORS.accent);
    svg.append(box);
    svg.append(text(x, 30, p.label, { size: 12, bold: true }));
    if (p.sub) svg.append(text(x, 44, p.sub, { size: 10, fill: COLORS.muted }));
    svg.append(dline(x, 54, x, H - 8));
  });

  // Сообщения
  msgs.forEach((m, i) => {
    const y = top + i * rowH;
    const color = COLORS[m.tone ?? 'accent'];
    if (m.self) {
      const x = xs[m.from];
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', `M ${x} ${y} h 30 v 14 h -30`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.6');
      path.setAttribute('marker-end', `url(#${m.tone === 'muted' ? 'arr-muted' : 'arr'})`);
      svg.append(path);
      svg.append(text(x + 38, y + 12, m.label, { size: 11, fill: COLORS.ink }));
    } else {
      const x1 = xs[m.from];
      const x2 = xs[m.to];
      const line = document.createElementNS(svg.namespaceURI, 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x2 - (x2 > x1 ? 6 : -6)));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', m.dashed ? COLORS.muted : color);
      line.setAttribute('stroke-width', '1.6');
      if (m.dashed) line.setAttribute('stroke-dasharray', '5 4');
      line.setAttribute('marker-end', `url(#${m.dashed ? 'arr-muted' : 'arr'})`);
      svg.append(line);
      const mid = (x1 + x2) / 2;
      svg.append(text(mid, y - 7, m.label, { size: 11, fill: COLORS.ink, anchor: 'middle' }));
    }
  });

  return svg;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke: string): SVGRectElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  node.setAttribute('x', String(x));
  node.setAttribute('y', String(y));
  node.setAttribute('width', String(w));
  node.setAttribute('height', String(h));
  node.setAttribute('rx', '2');
  node.setAttribute('fill', fill);
  node.setAttribute('stroke', stroke);
  node.setAttribute('stroke-width', '1.2');
  return node;
}

function dline(x: number, y1: number, x2: number, y2: number): SVGLineElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  node.setAttribute('x1', String(x));
  node.setAttribute('y1', String(y1));
  node.setAttribute('x2', String(x2));
  node.setAttribute('y2', String(y2));
  node.setAttribute('stroke', COLORS.line);
  node.setAttribute('stroke-dasharray', '4 4');
  return node;
}

function text(x: number, y: number, content: string, opts: { size?: number; bold?: boolean; fill?: string; anchor?: string } = {}): SVGTextElement {
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
