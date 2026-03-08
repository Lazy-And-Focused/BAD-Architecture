import type { Request } from "express";
import type { ExecutionContext } from "@nestjs/common";
import type { ValidationError } from "class-validator";

import { ClassConstructor, plainToInstance } from "class-transformer";

import { createParamDecorator, HttpException, HttpStatus } from "@nestjs/common";
import { AuthorizationTypes, Headers } from "@/enums";

import { validate } from "class-validator";

export const BasicHeadersAuthorization = createParamDecorator(async (classConstructor: ClassConstructor<object>, context: ExecutionContext) => {
  const { headers } = context.switchToHttp().getRequest() as Request;
  const { [Headers.authorization]: authorization } = headers;
  if (!authorization) {
    throw new HttpException("Authorization is required", HttpStatus.BAD_REQUEST);
  }

  const [ type, ...data ] = authorization.split(" ");
  if (type !== AuthorizationTypes.Basic) {
    throw new HttpException("Authorization must be Basic type", HttpStatus.BAD_REQUEST);
  }
  
  const base64 = data.join(" ");
  const json = JSON.parse(atob(base64));

  const validateObject = plainToInstance(classConstructor, json);
  const errors: ValidationError[] = await validate(validateObject);
  
  if (errors.length > 0) {
    const validationErrors = errors.map(obj => Object.values(obj.constraints!));
    throw new HttpException(`Validation failed with following Errors: ${validationErrors}`, HttpStatus.BAD_REQUEST);
  }
  
  return validateObject;
});