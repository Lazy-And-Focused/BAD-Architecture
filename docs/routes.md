# Работа с роутами

Роуты (маршруты) — это основная единица функциональности в BAD архитектуре. Каждый роут представляет собой отдельную папку внутри `src/{version}/routes/`, которая содержит все необходимые файлы для обработки запросов по определённому пути (например, `/users`, `/auth`). Генерация роутов автоматизирована с помощью кастомной схемы NestJS, что гарантирует единообразие структуры и сокращает время разработки.

## Генерация роута

Для создания нового роута выполните команду внутри проекта (где уже установлен `@nestjs/cli`):

```bash
nest g bad <route-name>
```

Например, для создания роута `users`:

```bash
nest g badp user
```

> **Алиас:** `nest g bad` эквивалентно `nest g bad-fockarch`.
> **Алиас:** `nest g badp` эквивалентно `nest g bad-plural`.

Команда создаст папку с именем роута в `src/v1/routes/` (если у вас активна версия v1; при наличии других версий роут создаётся в той версии, которая указана в настройках схемы). Внутри папки генерируются следующие файлы:

```
{routeName}/
├── dto/
│   ├── {routeName}-create.dto.ts
│   └── {routeName}-update.dto.ts
├── {routeName}.controller.ts
├── {routeName}.service.ts
├── {routeName}.module.ts
├── {routeName}.routes.ts
├── {routeName}.controller.test.ts
└── {routeName}.service.test.ts
```

Все файлы заполнены шаблонным кодом, который можно сразу дополнять своей логикой.

## Файл маршрутов (`{routeName}.routes.ts`)

Этот файл определяет базовый путь для контроллера, пути отдельных эндпоинтов и метаданные для Swagger. В BAD используется два подхода: **классический** (ручное объявление констант) и **новый** (через утилитный класс `Routes`). Рекомендуется использовать новый подход, так как он сокращает дублирование и добавляет поддержку операций для документирования.

### Новый подход (с использованием класса `Routes`)

Импортируйте класс `Routes` из `@/utils` или `@/utils/routes.utils` и создайте экземпляр с конфигурацией:

```ts
import { Routes } from "@/utils/routes.utils";

export const { ROUTE, ROUTES, OPERATIONS } = new Routes({
  route: "sentry",                    // базовый путь (будет /sentry)
  routes: {                            // относительные пути эндпоинтов
    GET: "/",
    GET_ERROR: "/error",
    GET_HTTP: "/http",
  },
  operations: {
    GET: {
      summary: "Using a `logger.info` from `@sentry/nestjs`",
    },
    GET_ERROR: {
      summary: "Testing an error for sentry",
    },
    GET_HTTP: {
      summary: "Testing an `HttpException` from sentry",
    },
  },
}).execute();
```

Метод `.execute()` возвращает объект с тремя деструктурированными константами:

- `ROUTE` – строка с базовым путём (например, `'sentry'`).
- `ROUTES` – объект с путями эндпоинтов (например, `{ GET: '/', GET_ERROR: '/error', ... }`).
- `OPERATIONS` – объект с метаданными для декоратора `@ApiOperation()`.

## Использование в контроллере

В контроллере импортируйте сгенерированные константы и применяйте их в декораторах:

```ts
import { Controller, Get, ... } from '@nestjs/common';
import { ROUTE, ROUTES, OPERATIONS } from './users.routes';
import { ApiOperation } from '@nestjs/swagger';

@Controller(ROUTE)
export class UsersController {
  @Get(ROUTES.GET)
  @ApiOperation(OPERATIONS.GET)   // используем метаданные из OPERATIONS
  public get() {
    // ...
  }
}
```

Обратите внимание: `OPERATIONS` содержит объекты, которые полностью совместимы с декоратором `@ApiOperation()` из `@nestjs/swagger`.

## Использование в тестах

Для построения полных путей с учётом версии API используйте утилиту `createEndpoints` из `@/utils`. Она принимает параметры `route`, `routes` и `version` и возвращает объект с теми же ключами, что и `ROUTES`, но с префиксом версии.

Пример из `sentry.controller.test.ts`:

```ts
import { createEndpoints } from "@/utils";
import { ROUTE, ROUTES } from "./sentry.routes";

const endpoints = createEndpoints({
  route: ROUTE,
  routes: ROUTES,
  version: "v1",
});

// endpoints.GET будет равен '/api/v1/sentry/'
// endpoints.GET_ERROR будет равен '/api/v1/sentry/error'
```

Это позволяет писать чистые и независимые от конфигурации тесты.

## DTO (Data Transfer Objects)

Папка `dto/` содержит классы, описывающие структуру данных, которые принимает API при создании и обновлении сущности. Эти классы используются в контроллере для валидации входящих запросов и автоматически попадают в документацию Swagger.

- `{routeName}-create.dto.ts` — для POST-запросов (создание).
- `{routeName}-update.dto.ts` — для PUT/PATCH-запросов (обновление).

Пример (`user-create.dto.ts`):

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class UserCreateDto {
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongP@ssw0rd' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

## Сервис (`{routeName}.service.ts`)

Сервис содержит бизнес-логику роута. Он взаимодействует с базой данных, вызывает внешние API и реализует основную функциональность. В сгенерированном файле уже есть заготовки методов, соответствующих эндпоинтам.

```ts
import { Injectable } from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UsersService {
  public async get() {
    // логика получения списка
  }

  public async getOne(id: string) {
    // логика получения одного элемента
  }

  public async post(data: UsersCreateDto) {
    // логика создания
  }

  public async put(id: string, data: UsersUpdateDto) {
    // логика полного обновления
  }

  public async patch(id: string, data: UsersUpdateDto) {
    // логика частичного обновления
  }

  public async delete(id: string) {
    // логика удаления
  }
}

export default Service;
```

**Важно:** Для вызова внешних API рекомендуется выносить клиентскую логику в отдельные сервисы внутри `services/` (или `api/`) и использовать их в сервисе роута. Это сохраняет единственную ответственность и упрощает тестирование.

## Модуль роута (`{routeName}.module.ts`)

Модуль связывает контроллер и сервис, а также подключает необходимые зависимости. В сгенерированном файле он минимален:

```ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {};
export default UsersModule;
```

Этот модуль затем импортируется в модуль версии (например, `v1.module.ts`), и благодаря настройкам `RouterModule` все его эндпоинты получают префикс `/api/v1/users`.

## Подроуты (вложенность)

BAD поддерживает вложенные роуты (например, `/users/:userId/posts`). Для создания подроута внутри существующего роута:

1. Создайте папку с именем подроута внутри папки родительского роута.
2. Запустите генератор для подроута, указав полный путь относительно `routes/`, либо создайте файлы вручную, следуя той же структуре.

**Пример:** для роута `users` и подроута `posts` структура будет такой:

```
users/
├── dto/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── users.routes.ts
└── posts/                 # подроут
    ├── dto/
    ├── posts.controller.ts
    ├── posts.service.ts
    ├── posts.module.ts
    └── posts.routes.ts
```

В файле `posts.routes.ts` путь может быть определён как `'/:userId/posts'`, а в контроллере использовать `@Param('userId')` для доступа к идентификатору родительского ресурса.

**Максимальная вложенность:** рекомендуется не превышать 3–4 уровня, чтобы избежать излишней сложности.

## Тестирование

Рядом с контроллером и сервисом могут находиться файлы тестов (`.test.ts`). Тесты пишутся с использованием Jest (уже настроен в проекте). Расположение тестов рядом с тестируемыми файлами облегчает навигацию и поддержку.

Пример теста для контроллера (`sentry.controller.test.ts`) показывает, как использовать `createEndpoints` и supertest для проверки эндпоинтов.
