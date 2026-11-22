// Мини-подсветка кода (JSON / XML / YAML) без зависимостей.

export type Lang = 'json' | 'xml' | 'yaml';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function span(cls: string, text: string): string {
  return `<span class="${cls}">${esc(text)}</span>`;
}

interface Token {
  start: number;
  end: number;
  cls: string;
}

function collect(code: string, lang: Lang): Token[] {
  const tokens: Token[] = [];

  if (lang === 'json') {
    const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g;
    for (const m of code.matchAll(re)) {
      if (m[1] && m[2]) tokens.push({ start: m.index!, end: m.index! + m[0].length, cls: 'k' });
      else if (m[1]) tokens.push({ start: m.index!, end: m.index! + m[0].length, cls: 's' });
      else if (m[3]) tokens.push({ start: m.index!, end: m.index! + m[0].length, cls: 't' });
      else tokens.push({ start: m.index!, end: m.index! + m[0].length, cls: 'n' });
    }
    return tokens;
  }

  if (lang === 'xml') {
    const re = /<!--[\s\S]*?-->|<\/?[\w:.-]+|\/?>|[\w:.-]+="[^"]*"/g;
    for (const m of code.matchAll(re)) {
      const text = m[0];
      const cls = text.startsWith('<!--') ? 'c' : text.includes('=') ? 't' : 'k';
      tokens.push({ start: m.index!, end: m.index! + text.length, cls });
    }
    return tokens;
  }

  // yaml — построчно: ключ, комментарий, строка/число.
  let offset = 0;
  for (const line of code.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      tokens.push({ start: offset, end: offset + line.length, cls: 'c' });
    } else {
      const key = /^( *- *|\s*)([\w.-]+)(:)(?!\S)/.exec(line);
      if (key) {
        tokens.push({ start: offset + key[1].length, end: offset + key[1].length + key[2].length + 1, cls: 'k' });
      }
      const re = /"([^"]*)"|\b(true|false|null)\b|(: )(\b\d+(?:\.\d+)?\b)/g;
      for (const m of line.matchAll(re)) {
        const start = offset + m.index!;
        if (m[1] !== undefined) tokens.push({ start, end: start + m[0].length, cls: 's' });
        else if (m[2]) tokens.push({ start, end: start + m[0].length, cls: 't' });
        else if (m[3] !== undefined || m[4]) tokens.push({ start: start + (m[5] ? m[4]!.length : 0), end: start + m[0].length, cls: 'n' });
      }
    }
    offset += line.length + 1;
  }
  return tokens;
}

export function highlight(code: string, lang: Lang): string {
  const tokens = collect(code, lang).sort((a, b) => a.start - b.start);
  let out = '';
  let pos = 0;
  for (const token of tokens) {
    if (token.start < pos) continue; // пересечение — пропускаем
    out += esc(code.slice(pos, token.start));
    out += span(token.cls, code.slice(token.start, token.end));
    pos = token.end;
  }
  out += esc(code.slice(pos));
  return out;
}
