import type { NextFunction, Request, Response } from "express";

import type { Auth } from "@1/types";
import { AuthTypes } from "@1/types";

import { Next, Req, Res } from "@nestjs/common";

import passport = require("passport");
import AuthStrategyRegister from "@1/strategies/strategy.register";

const abbreviations: Map<string, AuthTypes> = new Map([]);

type GenerateReturnProps<T = unknown> =
  | boolean
  | {
      successed: boolean;
      body?: T;
      method?: string;
    };

export class AuthApi {
  private readonly _method: string;

  public constructor(method: string) {
    this._method = method;
  }

  static get methods(): Record<"abbreviations" | "methods", readonly string[]> {
    return {
      abbreviations: Array.from(abbreviations.keys()),
      methods: Object.keys(AuthTypes),
    };
  }

  public auth(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): unknown {
    const { successed, method, body } = this.getMethod();

    const strategy = AuthStrategyRegister.getStrategy(method);
    if (!successed || !strategy) {
      return res.send(body);
    }

    return passport.authenticate(method, {
      prompt: "consent",
    })(req, res, next);
  }

  public callback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
    callback: (...args: [undefined, Auth | null]) => unknown,
  ): unknown {
    const { successed, method, body } = this.getMethod();
    if (!successed) {
      return res.send(body);
    }

    return passport.authenticate(method, callback)(req, res, next);
  }

  private getMethod(): { successed: boolean; method: string; body: unknown } {
    const exists = this._method in AuthTypes;
    if (exists) {
      return this.generateReturn(true);
    }

    const abbreviation = abbreviations.get(this._method);
    if (abbreviation) {
      return this.generateReturn({ successed: true, method: abbreviation });
    }

    return this.generateReturn({
      successed: false,
      body: {
        message: "Sorry, but method " + this._method + " not found. Try next:",
        methods: Object.keys(AuthTypes),
      },
    });
  }

  private generateReturn(data: GenerateReturnProps) {
    if (typeof data === "boolean") {
      return {
        successed: data,
        body: null,
        method: this._method,
      };
    }

    return {
      successed: data.successed,
      body: data.body || null,
      method: data.method || this._method,
    } as const;
  }
}

export default AuthApi;
