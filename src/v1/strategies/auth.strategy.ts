import type { AuthTypes } from "@1/types";
import type { CreateUserByPasswordEntity, SignInByPasswordUserEntity } from "@1/entities";

import type { Profile } from "passport";

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { sign } from "jsonwebtoken";
import env from "f@/env";

import { UsernamePipe } from "@1/pipes";
import { HashService } from "@1/services";
import { PrismaService } from "@/database/prisma.service";

import { v4 as uuid } from "uuid";

<<<<<<< HEAD:src/v1/strategies/strategy.register.ts
import { PasswordSingUp, singUp, ServiseSingUP } from "./strategies.dto";

type Strategies = Map<AuthTypes, OAuth2Strategy>;
type OAuth2ServiceProperties = {
  path: string;
  scope: string[];
};

interface PassportStrategyMixin<TValidationResult = unknown> {
  validate(...args: unknown[]): TValidationResult | Promise<TValidationResult>;
}

export type OAuth2Strategy = OAuth2 & PassportStrategyMixin;

const oauth2Services: Record<AuthTypes, OAuth2ServiceProperties> = {
  google: {
    path: "passport-google-oauth20",
    scope: ["openid", "profile", "email"],
  },
};

=======
>>>>>>> 7f0f88598d9e0b318a5778185c52dd030d791449:src/v1/strategies/auth.strategy.ts
@Injectable()
export class AuthStrategy {
  private readonly hash = new HashService();

  public constructor(
    private readonly prisma: PrismaService,
  ) {}

  public singUpByPassword({
    username,
    password,
    email,
    nickname,
<<<<<<< HEAD:src/v1/strategies/strategy.register.ts
  }: PasswordSingUp) {
=======
  }: CreateUserByPasswordEntity) {
>>>>>>> 7f0f88598d9e0b318a5778185c52dd030d791449:src/v1/strategies/auth.strategy.ts
    const hash = this.hash.execute(password);

    return this.singUp({
      username: username,
      nickname: nickname || username,
      email,
      password: hash,
    });
  }

  public async singUpByService({
    profile,
    accessToken,
    refreshToken,
    name,
  }: ServiseSingUP) {
    const profileUsername = (
      profile.username || profile.displayName
    ).toLowerCase();
    const nickname = profile.displayName;
    const username = (await this.prisma.user.findUnique({
      where: { username: profileUsername },
      select: { username: true },
    }))
      ? uuid()
      : profileUsername;

    return this.singUp({
      username,
      nickname,
      service: {
        id: profile.id,
        name: name,
        accessToken,
        refreshToken,
      },
    });
  }

  public async singInByPassword({
    password,
    username,
  }: SignInByPasswordUserEntity) {
    const user = await this.prisma.user.findUnique({
      where: { username: UsernamePipe.validate(username.toLowerCase()) },
    });

    if (!user) {
      throw new HttpException(
        `User with username ${username} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const auth = await this.prisma.auth.findUnique({
      where: { userId: user.id },
    });

    if (!auth) {
      throw new HttpException(
        `Auth not found`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (auth.password !== this.hash.execute(password)) {
      throw new HttpException("Password not equals", HttpStatus.FORBIDDEN);
    }

    return { user, auth };
  }

  public async singInByService({
    profile,
    accessToken,
    refreshToken,
    name,
  }: ServiseSingUP) {
    const service = await this.prisma.service.findUnique({
      where: {
        id: profile.id,
        name,
      },
    });

    if (!service) {
      return null;
    }

    const auth = await this.prisma.auth.findUnique({
      where: {
        id: service.authId,
      },
    });

    if (!auth) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
    });

    if (!user) {
      throw new HttpException(
        `User with "${auth.userId}" not found`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const update = {
      where: {
        id: service.id
      },
      data: {
        accessToken,
        refreshToken
      }
    };

    const updatedAuth = await this.prisma.auth.update({
      where: {
        id: auth.id,
      },
      data: {
        services: { update }
      },
    });

    return {
      auth: updatedAuth,
      user,
    };
  }

  protected async singUp({
    username,
    email,
    nickname,
    password,
    service,
  }: singUp) {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        username: UsernamePipe.validate(username),
      },
    });

    if (existedUser) {
      throw new HttpException(
        `User with username "${username}" is exists`,
        HttpStatus.CONFLICT,
      );
    }

    const id = uuid();
    const userId = uuid();
    const authData = {
      id,
      userId,
    };

    const passwordData = password
      ? {
          password: password,
        }
      : {};

    const token = sign(authData, env.HASH_KEY, {
      expiresIn: env.TOKEN_EXPIRATION,
    });
    const auth = await this.prisma.auth.create({
      data: {
        ...authData,
        ...passwordData,
        token,
        email,
        services: { create: service },
      },
    });

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        nickname: nickname,
        username: UsernamePipe.validate(username.toLowerCase()),
      },
    });

    return {
      auth,
      user,
      token,
    };
  }
}

export default AuthStrategy;
