# Документация: Типы, DTO и Сущности

В данном руководстве описаны подходы к организации данных в проекте на
NestJS с использованием TypeScript. Чёткое разделение понятий
**Типы**, **DTO** и **Сущности** помогает поддерживать чистоту
архитектуры, улучшает читаемость кода и облегчает командную
разработку.

## 1. Общая концепция

- **Типы (Types)** — базовые строительные блоки, используемые
  повсеместно: в функциях, классах, сервисах, утилитах. Они описывают
  форму данных, но не несут логики валидации или бизнес-правил.
- **DTO (Data Transfer Object)** — объекты, предназначенные для
  передачи данных между клиентом и сервером (или между
  микросервисами). Они определяют контракт взаимодействия и часто
  содержат декораторы валидации.
- **Сущности (Entities)** — внутреннее представление данных в сервисах
  (например, модели базы данных или бизнес-объекты). Они отражают
  структуру хранения и бизнес-логику.

Такое разделение позволяет:

- Чётко отделить внешний API от внутренней реализации.
- Переиспользовать типы в разных частях приложения.
- Легко изменять внутренние сущности, не ломая контракты с клиентом.

---

## 2. Типы (Types)

Типы — это самостоятельные единицы, описывающие структуру данных с
помощью `type` или `interface` в TypeScript. Они используются для
типизации параметров, возвращаемых значений, конфигураций и других
внутренних элементов.

### Где применяются

- В параметрах функций и методов.
- Для типизации возвращаемых значений.
- В конфигурационных объектах (логгер, роуты, настройки).
- Как основа для создания DTO или сущностей (композиция).

### Примеры типов

```typescript
// Тип для конфигурации логгера
export type LoggerConfig = {
  level: "debug" | "info" | "warn" | "error";
  prettyPrint: boolean;
  destination?: string;
};

// Тип для параметров функции
export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// Тип для роута
export type RouteDefinition = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  handler: Function;
  guards?: Function[];
};
```

### Особенности типов

- Не содержат декораторов валидации.
- Могут быть объединены (intersection) или расширены.
- Располагаются обычно в папке `src/types/` или в версии, к которой
  относятся.

---

## 3. DTO (Data Transfer Object)

DTO — это объекты, которые определяют форму данных, принимаемых от
клиента или отправляемых клиенту. В NestJS они часто реализуются как
классы с декораторами из пакетов `class-validator` и
`class-transformer`. DTO могут создаваться на основе типов или
сущностей.

### Где используются

- В контроллерах (параметры тела запроса, query, params).
- В сервисах, которые работают с данными извне.
- При обмене данными между микросервисами (например, через RabbitMQ
  или gRPC).

### Примеры DTO

```typescript
// create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

```typescript
// update-user.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Особенности DTO

- Содержат правила валидации.
- Могут быть созданы на основе типов (например, через `implements`).
- Хранятся в папке `src/modules/<module>/dto/` или в общей папке
  `src/dto/`, если используются в нескольких модулях.
- Именование: обычно `<действие>-<сущность>.dto.ts` (например,
  `create-user.dto.ts`).

### Взаимосвязь с типами

Если уже существует тип с описанием полей, можно использовать его для
создания DTO:

```typescript
// types/user.types.ts
export type UserData = {
  email: string;
  username: string;
  password: string;
};

// dto/create-user.dto.ts
import { UserData } from "@/types/user.types";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto implements UserData {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

## 4. Сущности (Entities)

Сущности — это внутренние модели данных, которые используются в
сервисах, репозиториях или для работы с базой данных (например, с
TypeORM, Mongoose). Они отражают структуру хранения и могут содержать
бизнес-логику (методы). Сущности не должны зависеть от внешних
требований (клиентских DTO).

### Где используются сущности

- В сервисах для обработки данных.
- В репозиториях/моделях базы данных.
- Для маппинга между DTO и хранилищем.

### Примеры

```typescript
// user.entity.ts (TypeORM)
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string; // обратите внимание: не plain password

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // бизнес-метод, например, для проверки пароля
  validatePassword(plainPassword: string): boolean {
    // логика сравнения хеша
  }
}
```

```typescript
// user.entity.ts (простая сущность без ORM)
export type UserEntity = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};
```

### Особенности сущностей

- Могут создаваться на основе типов (например,
  `type UserEntity = UserData & { id: string }`).
- Не должны содержать поля, которые не хранятся в базе (например,
  `password` вместо `passwordHash`), если это не нужно.
- Могут включать методы для работы с данными.
- Располагаются обычно в папке `src/entities/` или в версии, к которой
  относятся.

---

## 5. Взаимосвязи и преобразования

### Как они связаны

1. **Типы** — низкоуровневые описания, используются как основа.
2. **DTO** — строятся на основе типов (или сущностей) и обогащаются
   правилами валидации.
3. **Сущности** — могут расширять типы, добавляя служебные поля (id,
   timestamps) и методы.

### Пример полного цикла

1. Клиент отправляет `POST /users` с телом, соответствующим
   `CreateUserDto`.
2. Контроллер валидирует DTO и передаёт его в сервис.
3. Сервис преобразует DTO в сущность (например, хеширует пароль,
   добавляет дату создания) и сохраняет в БД.
4. При необходимости сервис возвращает клиенту ответное DTO (например,
   `UserResponseDto`), которое может быть построено на основе
   сущности, но без чувствительных полей.

### Маппинг

Для преобразования между DTO и сущностями удобно использовать
классы-мапперы (plain functions) или библиотеки типа `automapper`.
Простой пример:

```typescript
// user.mapper.ts
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./entities/user.entity";
import { HashService } from "@/services";

export function dtoToEntity(dto: CreateUserDto): UserEntity {
  const entity = new UserEntity();

  entity.email = dto.email;
  entity.username = dto.username;
  entity.passwordHash = HashService.execute(dto.password);
  entity.createdAt = new Date();

  return entity;
}
```

---

## Заключение

Соблюдение описанных правил помогает:

- Избегать путаницы между данными для клиента и внутренними данными.
- Упростить валидацию (за счёт DTO).
- Легко изменять схему БД, не затрагивая API.
- Переиспользовать типы в разных частях приложения.

Документируйте каждый DTO и сущность, добавляя JSDoc-комментарии,
особенно если есть специфические правила или ограничения.

Пример JSDoc для DTO:

```typescript
/**
 * Данные для создания пользователя
 * @property {string} email - должен быть уникальным, валидный email
 * @property {string} username - от 3 до 20 символов, только буквы и цифры
 * @property {string} password - минимум 8 символов, должен содержать хотя бы одну цифру
 */
export class CreateUserDto { ... }
```

Такой подход сделает ваш код понятным и для новых участников команды,
и для вас самих через несколько месяцев.
