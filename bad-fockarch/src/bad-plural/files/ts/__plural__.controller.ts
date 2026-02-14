import { <%= classify(name) %>CreateDto } from "./dto/<%= name %>-create.dto";
import { <%= classify(name) %>UpdateDto } from "./dto/<%= name %>-update.dto";

import { Public } from "@/decorators";
import { AuthGuard } from "@1/guards/auth/auth.guard";

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
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { ROUTE, ROUTES, OPERATIONS } from "./<%= plural %>.routes";
import { Service } from "./<%= plural %>.service"

@Injectable()
@NestController(ROUTE)
@UseGuards(AuthGuard)
export class Controller {
  public constructor(
    private readonly service: Service
  ) {}

  @ApiOperation(OPERATIONS.GET)
  @Get(ROUTES.GET)
  @Public()
  public get() {
    return this.service.get()
  }

  @ApiOperation(OPERATIONS.GET_ONE)
  @Get(ROUTES.GET_ONE)
  @Public()
  public getOne(
    @Param("id") id: string
  ) {
    return this.service.getOne(id);
  }

  @ApiOperation(OPERATIONS.POST)
  @Post(ROUTES.POST)
  public post(
    @Body() data: <%= classify(name) %>CreateDto 
  ) {
    return this.service.post(data);
  }

  @ApiOperation(OPERATIONS.PUT)
  @Put(ROUTES.PUT)
  public put(
    @Param("id") id: string,
    @Body() data: <%= classify(name) %>UpdateDto 
  ) {
    return this.service.put(id, data);
  }

  @ApiOperation(OPERATIONS.PATCH)
  @Patch(ROUTES.PATCH)
  public patch(
    @Param("id") id: string,
    @Body() data: <%= classify(name) %>UpdateDto 
  ) {
    return this.service.patch(id, data);
  }
  
  @ApiOperation(OPERATIONS.DELETE)
  @Delete(ROUTES.DELETE)
  public delete(
    @Param("id") id: string
  ) {
    return this.service.delete(id);
  }
}