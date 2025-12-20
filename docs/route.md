# Файлы BAD

<!-- prettier-ignore -->
## Создания роутера

```cmd
nest generate bad-fockarch $ROUTE
```

или

```cmd
nest g bad $ROUTE
```

> Название получилось от слияния BAD, FOCKUSTY и Architecture. bad —
> название архитектуры. fock — указание создателя архитектуры. arch —
> указание, что это архитектура

После этого в категории `~/routes/` у вас создаться ещё одна категория
с названием $ROUTE и следующим содержимым:

- `dto/`
  - `$ROUTE-create.dto.ts`
  - `$ROUTE-update.dto.ts`
- `$ROUTE.contoller.ts`
- `$ROUTE.module.ts`
- `$ROUTE.routes.ts`
- `$ROUTE.service.ts`

По-хорошему, ещё должны создаваться `$ROUTE.controller.test.ts` и
`$ROUTE.service.test.ts`, но я это сделаю чуть позже, следите за
обновлениями или можете предложить свои решения в
[issue](https://github.com/Lazy-And-Focused/BAD-template/issues/new).

## `dto/`

Категория с объектами передачи данных. Позволяет интегрировать типы с
документацией API сразу же. Можно использовать в других роутерах.

### `/$ROUTE-create.dto.ts`

Файл передачи данных, используемый для создания сущности в базе данных
приложения.

### `/$ROUTE-update.dto.ts`

Файл передачи данных, используемый для обновления сущности в базе
данных приложения.

## `$ROUTE.routes.ts`

Файл в котором будут основные пути для контроллера. Следует следовать
следующему паттерну:

```ts
/* 
  ROUTE — Константа, которая будет хранить путь до контроллера.
*/
const ROUTE: string | string[] = "/$ROUTE";

/*
  ROUTES — Объект, который будет хранить пути по определенным методам, например:

  `ROUTES.GET` — Мы используем GET метод и получаем по этому методу его путь.
  `ROUTES.GET_ONE` — Тоже самое, как GET, но получается вместо списка всего одну сущность.
*/
const ROUTES: Record<string, string> = {
  GET: "/",
  GET_ONE: "/:id",
  POST: "/",
  PUT: "/:id",
  PATCH: "/:id",
  DELETE: "/:id",
};
```

## `$ROUTE.service.ts`

Основной файл, в котором будет хранится логика конкретного роутера.
Для удобства можно использовать API других сервисов, создав
`~/v{version}/services/` и перенеся часть из логики сервива туда.
Например:

- Это:

```ts
import env from "f@1/env";

export class Service {
  public async get(token: string, profileId: string) {
    try {
      const data = await (
        await fetch(env.GOOGLE_API_URL + "/people/" + profileId, {
          method: "GET",
          headers: { Authorization: token },
        })
      ).json();

      return {
        successed: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error(error);

      return {
        succssed: false,
        data: null,
        error: error instanceof Error ? error.message : "some error",
      };
    }
  }
}
```

- Превратится в это:

```ts
import GoogleApi from "@/api/google";

export class Service {
  public get(token: string, profileId: string) {
    return new GoogleApi(token).get(profileId);
  }
}

export default Service;
```

## `$ROUTE.controller.ts`

Файл, который будет валидировать запросы пользователя и др. Вот пример
сгенерированного файла:

```ts
import type { UsersCreateDto } from "./dto/users-create.dto";
import type { UsersUpdateDto } from "./dto/users-update.dto";

import { Public } from "@{version}/decorators/public.decorator";
import { AuthGuard } from "@{version}/guards/auth/auth.guard";

import {
  Controller as NestController,
  Injectable,
  Get,
  Param,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { ROUTE, ROUTES } from "./users.routes";
import { Service } from "./users.service.ts";

@Injectable()
@NestController(ROUTE)
@UseGuards(AuthGuard)
export class Controller {
  public constructor(private readonly service: Service) {}

  @ApiOperation({
    summary: "Getting an array of users",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Getted",
  })
  @Get(ROUTES.GET)
  @Public()
  public get() {
    return this.service.get();
  }

  @ApiOperation({
    summary: "Getting a users by id",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Getted",
  })
  @Get(ROUTES.GET_ONE)
  @Public()
  public getOne(@Param("id") id: string) {
    return this.service.getOne(id);
  }

  @ApiOperation({
    summary: "Creaing a users",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Created",
  })
  @Post(ROUTES.POST)
  public post(@Body() data: UsersCreateDto) {
    return this.service.post(data);
  }

  @ApiOperation({
    summary: "Updating a users",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Updated",
  })
  @Put(ROUTES.PUT)
  public put(@Param("id") id: string, @Body() data: UsersUpdateDto) {
    return this.service.put(id, data);
  }

  @ApiOperation({
    summary: "Updating a users",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Updated",
  })
  @Patch(ROUTES.PUT)
  public patch(
    @Param("id") id: string,
    @Body() data: UsersUpdateDto,
  ) {
    return this.service.patch(id, data);
  }

  @ApiOperation({
    summary: "Deleting a users",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Deleted",
  })
  @Delete(ROUTES.DELETE)
  public delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
```

## `$ROUTE.module.ts`

Это модуль, который будет экспортироваться в общих роутер.
