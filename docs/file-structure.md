# Архитектура

<!-- prettier-ignore -->
> [!NOTE]
> Данная структура будет перемещана на стиль `lafistory` в будущем.

## Описание

Данная структура строгая и не позволяет убирать некоторые папки,
однако такие есть. Пройдёмся по всем:

- Файлы-конфигураторы:
  - `.gitignore` — Можно изменять.
  - `.prettierc` — Можно изменять.
  - `eslint.config.mjs` — Можно изменять.
  - `nest-cli.json` — Лучше не трогать.
  - `tsconfig.json` — Лучше не трогать.
  - `tsconfig.build.json` — Лучше не трогать.

- Категории:
  - `src/` (`~/`) — Обязательная категория со всем исходным кодом.
  - `~/app/` — категории с приложением. (В будущем может поменяться)
  - `~/database/` — Категория с логикой БД, можно изменять под свои
    нужды.
  - `~/decorators/` — Категория с декораторами, если требуется
    использовать сервисы, то можно изменить под свои нужды. (Сделать
    как в )
  - `~/errors/` — Категория со своими ошибками.
  - `~/guards/` — Категория с "защитниками", можно изменять под свои
    нужды.
  - `~/middleware/` — Также можно изменять под свои нужды.
  - `~/routes/` — Категория роутов, лучше не трогать и подключать
    модули через импорт. (Разрешаю сделать `deployer`)
  - `~/services/` — Категория с дополнительными сервисами/API других
    приложений или локальных модулей, фактически полная свобода, но
    лучше придерживаться единому стилю.
  - `~/api/` — Аналогичная категория к `~/services/`, лучше не
    использовать две этих категории в одном приложении.
  - `~/types/` — Категория с сущностями приложения, можно использовать
    `~/entities/`.
    - `~/types/promise/` — Копия родительской категории, только с
      `Promise` типами.
  - `~/entities/` — Аналогичная категория к `~/types/`, лучше не
    использовать две эти категории в одном приложении.

## Структура

```txt
└── {workFolder}/
    ├── .dockerignore
    ├── .env
    ├── .env.{envName}
    ├── .gitignore
    ├── .prettierrc.mjs
    ├── docker-compose.yaml
    ├── dockerfile
    ├── eslint.config.mjs
    ├── LICENSE
    ├── nest-cli.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── README.md
    ├── tsconfig.build.json
    ├── tsconfig.build.tsbuildinfo
    ├── tsconfig.json
    ├── test/
    │   ├── app.e2e-spec.ts
    │   ├── jest-e2e.json
    │   └── jest.json
    └── src/
        ├── app.module.ts
        ├── main.ts
        ├── {version}/
        │   ├── {version}.module.ts
        │   ├── types/
        │   │   ├── {typeName}.type.ts
        │   │   └── index.ts
        │   ├── services/                                      # services
        │   │   ├── {serviceName}.service.ts
        │   │   └── index.ts
        │   ├── middleware/
        │   │   ├── {middlewareName}.middleware.ts
        │   │   └── index.ts
        │   ├── errors/
        │   │   ├── constructor.ts
        │   │   └── {errorCategory}/
        │   │       └── {errorName}.errors.ts
        │   ├── decorators/
        │   │   ├── {decoratorName}.decorator.ts
        │   │   └── public.decorator.ts
        │   ├── constants/                                    # ?
        │   │   ├── {constantName}.constants.ts
        │   │   └── index.ts
        │   ├── utils/
        │   │   ├── {utilsName}.utils.ts
        │   │   ├── create-endpoints.utils.ts
        │   │   ├── index.ts
        │   │   └── urlize.utils.ts
        │   ├── routes/
        │   │   └── {routeName}/                               # routes/:route/
        │   │       ├── dto/
        │   │       │   └── {routeName}-{dtoName}.dto.ts
        │   │       ├── {routeName}.controller.test.ts
        │   │       ├── {routeName}.controller.ts
        │   │       ├── {routeName}.service.test.ts
        │   │       ├── {routeName}.service.ts
        │   │       ├── {routeName}.module.ts
        │   │       ├── {routeName}.routes.ts
        │   │       └── {subRouteName}/...{link:routeName}     # ? /:route/:subroute
        │   └── guards/
        │       └── {guardName}/
        │           ├── {guardName}.service.ts
        │           ├── {guardName}.guard.ts
        │           └── index.ts
        ├── services/                                          # ? services
        │   ├── {serviceName}.service.ts
        │   └── env.service.ts
        └── app/
            ├── session.app.ts
            └── strategies/
                ├── {strategy}.ts
                ├── authenticator.ts
                └── index.ts
```

- ? - Необязательный файл/папка

- `routes/:route/` — Не генерировать в ручную, использовать:
  `nest g bad $ROUTE`.
- `.routes` — Обязательный файл для расписывания URL запросов и их
  методов.
- `/:route/:subroute` — Копия `$ROUTE`, максимум до 3-4 вложеностей.
- `services` — Можно заменить на `api/`, также можно создать
  `index.ts`.

Роуты могут иметь максимум 3-4 вложенности.
