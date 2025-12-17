import type { <%= classify(name) %>CreateDto } from "./dto/<%= name %>-create.dto";
import type { <%= classify(name) %>UpdateDto } from "./dto/<%= name %>-update.dto";

import { Public } from "v1/decorators/public.decorator";
import { AuthGuard } from "v1/guards/auth/auth.guard";

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
  HttpStatus
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import { ROUTE, ROUTES } from "./<%= plural %>.routes";
import { Service } from "./<%= plural %>.service"

@Injectable()
@NestController(ROUTE)
@UseGuards(AuthGuard)
@ApiResponse({
  status: HttpStatus.OK,
  description: "Ok"
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: "Not accesss to route"
})
@ApiResponse({
  status: HttpStatus.TOO_MANY_REQUESTS,
  description: `A large number of requests`
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: "Does not have an authentication token in headers (`headers.authorization`)"
})
export class Controller {
  public constructor(
    private readonly service: Service
  ) {}

  @ApiOperation({
    summary: "Getting an array of <%= name %>"
  })
  @Get(ROUTES.GET)
  @Public()
  public get() {
    return this.service.get()
  }

  @ApiOperation({
    summary: "Getting a <%= name %> by id"
  })
  @Get(ROUTES.GET_ONE)
  @Public()
  public getOne(
    @Param("id") id: string
  ) {
    return this.service.getOne(id);
  }

  @ApiOperation({
    summary: "Creaing a <%= name %>"
  })
  @Post(ROUTES.POST)
  public post(
    @Body() data: <%= classify(name) %>CreateDto 
  ) {
    return this.service.post(data);
  }

  @ApiOperation({
    summary: "Updating a <%= name %>"
  })
  @Put(ROUTES.PUT)
  public put(
    @Param("id") id: string,
    @Body() data: <%= classify(name) %>UpdateDto 
  ) {
    return this.service.put(id, data);
  }

  @ApiOperation({
    summary: "Updating a <%= name %>"
  })
  @Patch(ROUTES.PATCH)
  public patch(
    @Param("id") id: string,
    @Body() data: <%= classify(name) %>UpdateDto 
  ) {
    return this.service.patch(id, data);
  }
  
  @ApiOperation({
    summary: "Deleting a <%= name %>"
  })
  @Delete(ROUTES.DELETE)
  public delete(
    @Param("id") id: string
  ) {
    return this.service.delete(id);
  }
}