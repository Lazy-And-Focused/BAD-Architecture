import type { CreateUserByPasswordEntity } from "../../entities/user.entity";
import type { Auth } from "@/v1/types";

import { Injectable } from "@nestjs/common";

import { AuthStrategyRegister } from "@/v1/strategies";
import PrismaService from "@/database/prisma.service";
import AuthService from "@1/services/auth.service";

import { env } from "@/services";

const toStr = (str: unknown) => JSON.stringify(str, undefined, 4);

@Injectable()
export class Service {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly strategy: AuthStrategyRegister
  ) {}

  public getAllMethods() {
    const { abbreviations, methods } = AuthService.methods;

    return {
      stringMethods: toStr(methods),
      stringAbbreviations: toStr(abbreviations),
      abbreviations,
      methods,
    };
  }

  public async getMe(authId: string, userId: string) {
    const auth = await this.prisma.auth.findUnique({
      where: { id: authId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return { auth, user };
  }

  public async createUser(data: CreateUserByPasswordEntity) {
    return this.strategy.singUpByPassword(data);
  }

  public getRedirectUrl(auth: Auth) {
    const url = new URL(env.CLIENT_URL);
    url.searchParams.append("token", auth.token);
    return url.href;
  }
}
