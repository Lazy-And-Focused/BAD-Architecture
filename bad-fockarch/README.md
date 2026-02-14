# BAD Архитектура

**Backend After Drinking** — это пакет-схематик для [NestJS](https://nestjs.com/), который позволяет быстро создать проект с жёсткой, но гибкой архитектурой, а также генерировать роуты по единому шаблону.

> Шутливое название скрывает серьёзный подход: BAD помогает поддерживать порядок в коде, ускорять разработку и внедрять лучшие практики из коробки.

## Возможности

- **Генерация проекта одной командой** – `bad create` разворачивает полностью настроенный NestJS-проект с поддержкой Swagger, Sentry, Passport.js, Throttler, кэширования, Docker и тестов.
- **Автоматическое создание роутов** – `nest g badp users` (см. `nest g bad --help`) генерирует папку роута со всеми необходимыми файлами: контроллер, сервис, модуль, DTO, файл маршрутов и опционально тесты.
- **Версионирование API из коробки** – каждая версия (v1, v2, …) изолирована в своей папке, что позволяет бесшовно развивать API.
- **Единый стиль кода** – все файлы следуют соглашениям команды LAF, включая именование, форматирование и структуру импортов.

## Установка

Установите пакет глобально или используйте через `npx`:

```bash
npm install -g bad-fockarch
# или
pnpm add -g bad-fockarch
```

## Создание нового проекта

```bash
bad create <имя-проекта> [путь] [менеджер-пакетов]
```

- `<имя-проекта>` – обязательное имя папки проекта.
- `[путь]` – путь для размещения (по умолчанию текущая папка).
- `[менеджер-пакетов]` – `pnpm` (по умолчанию), `npm` или `yarn`.

**Пример:**

```bash
bad create my-api . pnpm
```

После выполнения вы получите готовый к работе проект с установленными зависимостями. Перейдите в папку и запустите dev-режим:

```bash
cd my-api
pnpm dev
```

API будет доступно по адресу `http://localhost:8080/api/docs` (порт можно изменить в `.env`).

## Генерация роута

Внутри созданного проекта используйте NestJS CLI с нашей схемой:

```bash
nest g badp user
```

Будет создана папка `src/v1/routes/users/` со следующим содержимым:

```
users/
├── dto/
│   ├── user-create.dto.ts
│   └── user-update.dto.ts
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── users.routes.ts
├── users.controller.test.ts (?)
└── users.service.test.ts (?)
```

Файл `users.routes.ts` задаёт базовый путь и имена эндпоинтов:

```ts
import { Routes } from "@/utils";

export const { ROUTE, ROUTES, OPERATIONS } = new Routes({
  route: "users",

  routes: { ... },
  operations: { ... }
});
```

Вы можете сразу добавлять свою бизнес-логику в сервис и контроллер.

## Структура сгенерированного проекта

- [Структура проекта (src)](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/project-structure.md)
- [Структура рабочей области](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/workspace.md)

## Правила и соглашения

Мы строго следуем [стандартам написания кода команды LAF](https://docs.laf-team.ru/agreements/general). Основные моменты:

- **Имена файлов**: `kebab-case` с суффиксом (`.service.ts`, `.controller.ts`, …).
- **Имена классов**: `UpperCamelCase`.
- **Имена переменных и функций**: `camelCase`.
- **Константы**: `SCREAMING_SNAKE_CASE`.
- **Импорты**: сортировка (инициализаторы → типы → данные → статитка).
- **Ошибки**: только `throw`, в сервисах – `HttpException`.
- **Альтернативные папки**: выбирайте что-то одно (`services/` или `api/`, `types/` или `entities/`) и придерживайтесь во всём проекте.

## Документация

Подробное описание архитектуры, структуры, правил и примеров использования доступно в [документации BAD](https://github.com/Lazy-And-Focused/BAD-template/tree/main/docs). Рекомендуется ознакомиться со следующими разделами:

- [Введение](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/introduction.md)
- [Быстрый старт](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/getting-started.md)
- [Структура проекта (src)](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/project-structure.md)
- [Структура рабочей области](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/workspace.md)
- [Правила стиля](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/conventions.md)
- [Генерация роутов](https://github.com/Lazy-And-Focused/BAD-template/blob/main/docs/routes.md)

## Лицензия

MIT © [Lazy And Focused](https://laf-team.ru)
