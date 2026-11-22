// Состояние кейса: заданные вопросы, выявленные требования, классификация,
// результаты приёмки, текущая стадия. Хранится в localStorage.

import { CASE, type ReqKind } from '../data/case.ts';

export interface AcceptanceResult {
  verdict: 'pass' | 'fail';
  violation?: string;
}

export interface CaseState {
  /** id вопросов, заданных на интервью (в порядке задания). */
  asked: string[];
  /** id требований, выявленных интервью. */
  discovered: string[];
  /** id требования → выбранный игроком тип. */
  classified: Record<string, ReqKind>;
  /** Классификация проверена. */
  classifyChecked: boolean;
  /** Артефакты рассмотрены. */
  artifactsDone: boolean;
  /** id сценария → решение игрока при приёмке. */
  acceptance: Record<string, AcceptanceResult>;
  /** Приёмка завершена. */
  acceptanceDone: boolean;
  /** Индекс активной стадии 0..5 (5 = итоги). */
  stage: number;
}

const STORAGE_KEY = 'cv-bpb-case-v1';

function initial(): CaseState {
  return {
    asked: [],
    discovered: [],
    classified: {},
    classifyChecked: false,
    artifactsDone: false,
    acceptance: {},
    acceptanceDone: false,
    stage: 0,
  };
}

let state: CaseState = load();

function load(): CaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as Partial<CaseState>;
    return { ...initial(), ...parsed };
  } catch {
    return initial();
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* приватный режим — работаем в памяти */
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export const store = {
  get(): CaseState {
    return state;
  },

  update(patch: Partial<CaseState>): void {
    state = { ...state, ...patch };
    persist();
    for (const listener of listeners) listener();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  reset(): void {
    state = initial();
    persist();
    for (const listener of listeners) listener();
  },

  /** Требования, вскрытые заданными вопросами (в порядке реестра). */
  discoveredReqs() {
    return CASE.requirements.filter((req) => state.discovered.includes(req.id));
  },

  /** Сколько всего требований доступно для классификации. */
  discoveredCount(): number {
    return state.discovered.length;
  },
};
