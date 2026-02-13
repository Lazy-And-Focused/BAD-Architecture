import type { Request } from "express";
import type { Observable } from "rxjs";

import { Reflector } from "@nestjs/core";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

import { logger } from "@sentry/nestjs";

import { tryCatchThrow } from "@/utils/try-catch.utils";
import { Service } from "./auth-guard.service";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    return tryCatchThrow(
      () => Service.validateRequest(request),
      () => {
        logger.error("error", {
          hostname: request.hostname,
          body: request.body,
        });
      },
    );
  }
}

export default AuthGuard;
