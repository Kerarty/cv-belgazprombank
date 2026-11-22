// Данные кандидата. Всё, что персональное, — здесь.

export interface Skill {
  name: string;
  /** Честный уровень 1–5. */
  level: 1 | 2 | 3 | 4 | 5;
  /** Где применял — доказательство. */
  proof: string;
}

export interface Project {
  title: string;
  kind: string;
  bullets: string[];
  tags: string[];
  link?: string;
  linkLabel?: string;
}

const projects: Project[] = [
  {
    title: 'АС учёта деятельности парикмахерской',
    kind: 'Курсовой проект · БГУИР · «Программирование сетевых приложений» · 2025',
    bullets: [
      'Клиент-серверное ИС: JavaFX-клиент с тремя ролями (клиент, сотрудник, администратор)',
      'Многопоточный TCP-сервер: пул ClientHandler, обмен POJO-DTO между клиентом и сервером',
      'Слой DAO поверх MySQL (JDBC): клиенты, сотрудники, услуги, расписание, записи, отзывы',
      'Безопасность: хэширование паролей jBCrypt; тесты JUnit 5 + Mockito + H2',
    ],
    tags: ['Java', 'JavaFX', 'MySQL', 'JDBC', 'TCP', 'JUnit 5'],
  },
  {
    title: 'Скрипты тестирования HSM REST API',
    kind: 'Практика · hsm-qa-scripts · Python',
    bullets: [
      'Скрипты приёмочного тестирования REST API модуля безопасности (HSM)',
      'Проверка ответов и сенсорных данных по контрактам API',
    ],
    tags: ['Python', 'REST API', 'Тестирование'],
    link: 'https://github.com/Kerarty/hsm-qa-scripts',
    linkLabel: 'github.com/Kerarty/hsm-qa-scripts',
  },
  {
    title: 'SDK играбельной рекламы',
    kind: 'Опыт интеграций · playble-ads · TypeScript · MIT',
    bullets: [
      'Движко-независимый SDK для HTML5 playable-ads',
      'Адаптеры к внешним рекламным сетям (Meta, AppLovin, Google) по их контрактам — работа с требованиями внешних систем и форматами обмена',
    ],
    tags: ['TypeScript', 'Интеграции', 'MRAID'],
    link: 'https://github.com/Kerarty/playble-ads',
    linkLabel: 'github.com/Kerarty/playble-ads',
  },
  {
    title: 'Серия интерактивных web-приложений',
    kind: 'Портфолио · 15+ приложений · HTML/TypeScript',
    bullets: [
      'Интерактивные резюме-приложения для разных компаний: симуляции, игры, дашборды',
      'Сборка (esbuild/Vite), деплой на GitHub Pages, печать в PDF',
    ],
    tags: ['HTML', 'TypeScript', 'Vite', 'GitHub Pages'],
    link: 'https://github.com/Kerarty',
    linkLabel: 'github.com/Kerarty',
  },
];

const skills: Skill[] = [
  { name: 'Сбор и формализация требований', level: 4, proof: 'Пояснительная записка курсового проекта; интервью в этом кейсе' },
  { name: 'Документация: SRS, спецификации, планы тестирования', level: 4, proof: 'Курсовой проект; артефакты в этом кейсе' },
  { name: 'REST, Swagger, HTTP', level: 4, proof: 'Скрипты HSM REST API; контракт этого кейса' },
  { name: 'JSON / XML, форматы обмена', level: 4, proof: 'POJO-DTO клиент↔сервер в курсовом; адаптеры SDK' },
  { name: 'СУБД: MySQL, SQL, JDBC', level: 4, proof: 'DAO-слой курсового проекта: 9 сущностей БД' },
  { name: 'SOAP / WSDL', level: 3, proof: 'Контракты внешних сетей в SDK; переключатель в кейсе' },
  { name: 'Docker / Linux', level: 3, proof: 'Это резюме упаковано в Docker-образ' },
  { name: 'Jira / Confluence', level: 3, proof: 'Процессная документация, оформление задач' },
  { name: 'MS Visio / BPMN, UML', level: 3, proof: 'Диаграммы курсового проекта и этого кейса' },
  { name: 'Python', level: 4, proof: 'Тестовые скрипты HSM REST API' },
  { name: 'Java', level: 4, proof: 'Курсовой проект: JavaFX-клиент + сервер' },
  { name: 'TypeScript / JavaScript', level: 4, proof: 'SDK playble-ads; это резюме' },
];

export const PROFILE = {
  name: 'Кукар Я.М.',
  role: 'Специалист отдела развития информационных систем розничного бизнеса',
  tagline:
    'Превращаю разговоры с заказчиком в работающие системы: интервью → требования → SRS → приёмка. Слева этот путь можно пройти руками — за 5 минут.',
  location: 'Минск',

  contacts: [
    { label: 'GitHub', value: 'github.com/Kerarty', href: 'https://github.com/Kerarty' },
    { label: 'Email', value: 'kukar.yar@gmail.com', href: 'mailto:kukar.yar@gmail.com' },
    { label: 'Telegram', value: '@Kerarty', href: 'https://t.me/Kerarty' },
  ],

  about:
    'Аналитик — переводчик между бизнесом и разработкой. Я не рассказываю, как я работаю, — я показываю: ' +
    'кейс слева повторяет мой полный цикл — от интервью с заказчиком до приёмочного тестирования поставки. ' +
    'Под ним — проекты, где эти навыки уже применялись.',

  education: {
    university: 'БГУИР',
    faculty: 'Факультет информационных технологий и управления (ФИТУ) · кафедра вычислительных методов и программирования (ВМИП)',
    // TODO: уточнить годы обучения
    detail: 'Информационные системы и технологии',
  },

  projects,
  skills,
};
