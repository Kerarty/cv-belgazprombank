// Минимальный DOM-хелпер вместо фреймворка.

export type Child = Node | string | null | undefined | false;

interface Attrs {
  class?: string;
  id?: string;
  html?: string;
  dataset?: Record<string, string>;
  style?: string;
  type?: string;
  value?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  placeholder?: string;
  ariaLabel?: string;
  ariaHidden?: string;
  ariaSelected?: string;
  role?: string;
  tabIndex?: number;
  draggable?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onClick?: (el: HTMLElement, ev: MouseEvent) => void;
  onInput?: (el: HTMLElement, ev: Event) => void;
  onChange?: (el: HTMLElement, ev: Event) => void;
  onKeyDown?: (el: HTMLElement, ev: KeyboardEvent) => void;
  onDragStart?: (el: HTMLElement, ev: DragEvent) => void;
  onDragOver?: (el: HTMLElement, ev: DragEvent) => void;
  onDragLeave?: (el: HTMLElement, ev: DragEvent) => void;
  onDragEnd?: (el: HTMLElement, ev: DragEvent) => void;
  onDrop?: (el: HTMLElement, ev: DragEvent) => void;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      const evName = key.slice(2).toLowerCase();
      node.addEventListener(evName, (ev) => (value as (el: HTMLElement, ev: never) => void)(node, ev as never));
    } else if (key === 'class') {
      node.className = String(value);
    } else if (key === 'html') {
      node.innerHTML = String(value);
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else if (key === 'tabIndex') {
      node.tabIndex = value as number;
    } else if (key === 'checked') {
      (node as HTMLInputElement).checked = Boolean(value);
    } else if (key === 'disabled') {
      (node as HTMLButtonElement).disabled = Boolean(value);
    } else if (key === 'value') {
      (node as HTMLInputElement).value = String(value);
    } else if (key === 'ariaLabel') {
      node.setAttribute('aria-label', String(value));
    } else if (key === 'ariaHidden') {
      node.setAttribute('aria-hidden', String(value));
    } else if (key === 'ariaSelected') {
      node.setAttribute('aria-selected', String(value));
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Разметка статуса «выполнено/ошибка». */
export function mark(ok: boolean): HTMLElement {
  return el('span', { class: `mark ${ok ? 'mark--ok' : 'mark--fail'}`, ariaHidden: 'true' }, ok ? '✓' : '✕');
}
