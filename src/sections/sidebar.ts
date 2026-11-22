// Сайдбар резюме: обо мне, проекты, матрица навыков, контакты.

import { PROFILE } from '../data/profile.ts';
import { el } from '../core/dom.ts';

function aboutCard(): HTMLElement {
  const edu = PROFILE.education;
  return el(
    'div',
    { class: 'side-card' },
    el('h3', {}, 'Обо мне'),
    el('p', { class: 'side-card__about' }, PROFILE.about),
    el(
      'div',
      { class: 'edu' },
      el('div', { class: 'edu__uni' }, edu.university),
      el('div', {}, edu.faculty),
      el('div', {}, edu.detail),
    ),
  );
}

function projectsCard(): HTMLElement {
  const card = el('div', { class: 'side-card' }, el('h3', {}, 'Проекты и доказательства'));
  for (const project of PROFILE.projects) {
    const node = el(
      'div',
      { class: 'proj' },
      el('div', { class: 'proj__kind' }, project.kind),
      el('div', { class: 'proj__title' }, project.title),
      el('ul', { class: 'proj__list' }, ...project.bullets.map((b) => el('li', {}, b))),
      el('div', { class: 'proj__tags' }, ...project.tags.map((t) => el('span', { class: 'tag' }, t))),
    );
    if (project.link) {
      node.append(
        el('a', { class: 'proj__link', href: project.link, target: '_blank', rel: 'noopener' }, project.linkLabel ?? project.link),
      );
    }
    card.append(node);
  }
  return card;
}

function skillsCard(): HTMLElement {
  const card = el(
    'div',
    { class: 'side-card' },
    el('h3', {}, 'Навыки · против требований вакансии'),
    el(
      'p',
      { class: 'side-card__about' },
      'Честные уровни. Каждая строчка — с указанием, где навык применялся.',
    ),
  );
  for (const skill of PROFILE.skills) {
    const dots = el('span', { class: 'skill__dots', ariaHidden: 'true' });
    for (let i = 1; i <= 5; i++) {
      dots.append(el('span', { class: `skill__dot ${i <= skill.level ? 'skill__dot--on' : ''}` }));
    }
    card.append(
      el(
        'div',
        { class: 'skill' },
        el('span', { class: 'skill__name' }, skill.name),
        dots,
      ),
      el('div', { class: 'skill__proof' }, skill.proof),
    );
  }
  return card;
}

function contactsCard(): HTMLElement {
  return el(
    'div',
    { class: 'side-card' },
    el('h3', {}, 'Контакты'),
    el(
      'div',
      { class: 'contacts' },
      ...PROFILE.contacts.map((contact) =>
        el(
          'div',
          { class: 'contacts__row' },
          el('span', { class: 'contacts__label' }, contact.label),
          contact.href
            ? el('a', { href: contact.href, target: '_blank', rel: 'noopener' }, contact.value)
            : el('span', {}, contact.value),
        ),
      ),
    ),
    el('p', { class: 'side-card__about', style: 'margin-top:10px' }, PROFILE.location),
  );
}

export function renderSidebar(container: HTMLElement): void {
  container.replaceChildren(aboutCard(), projectsCard(), skillsCard(), contactsCard());
}
