import type { AuthTypes } from "@1/types";
import type { CreateUserByPasswordEntity, SignInByPasswordUserEntity } from "@1/entities";

import type { Profile } from "passport";
import type { VerifyCallback } from "passport-oauth2";
import type OAuth2 from "passport-oauth2";

import { sign } from "jsonwebtoken";

import { PassportStrategy } from "@nestjs/passport";

import env, { getPassportEnv } from "f@/env";

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { UsernamePipe } from "@1/pipes";

import { HashService } from "@1/services";
import { LoggerService } from "@/services";
import { PrismaService } from "@/database/prisma.service";

import { v4 as uuid } from "uuid";

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

@Injectable()
export class AuthStrategyRegister {
  private readonly hash = new HashService();

  public static readonly strategies: Strategies = new Map();
  public readonly strategies: Strategies = new Map();

  public static getStrategy(strategy: string): OAuth2Strategy | null {
    const output = this.strategies.get(strategy as AuthTypes);
    return output || null;
  }

  public constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {
    this.execute();
  }

  public singUpByPassword({
    username,
    password,
    email,
    nickname,
  }: CreateUserByPasswordEntity) {
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
  }: {
    profile: Profile;
    accessToken: string;
    refreshToken?: string;
    name: AuthTypes;
  }) {
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
  }: {
    profile: Profile;
    accessToken: string;
    refreshToken?: string;
    name: AuthTypes;
  }) {
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

    const updatedAuth = await this.prisma.service.update({
      where: {
        id: service.id,
      },
      data: {
        accessToken,
        refreshToken,
      },
    });

    return {
      auth: updatedAuth,
      user,
    };
  }

  public execute(): this {
    for (const service in oauth2Services) {
      const { path, scope } = oauth2Services[service];
      const client = getPassportEnv(
        service.toUpperCase() as Uppercase<AuthTypes>,
      );

      const { Strategy } = require(path);

      const ServiceStrategyClass = PassportStrategy(Strategy, service);
      const ServiceStrategy = new ServiceStrategyClass(
        {
          clientID: client.id,
          clientSecret: client.secret,
          callbackURL: client.callback,
          scope: scope,
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: VerifyCallback,
        ) => {
          try {
            const parameters = {
              accessToken,
              refreshToken,
              profile,
              name: service as AuthTypes,
            };

            const signInData = await this.singInByService(parameters);
            if (signInData) {
              return done(false, signInData);
            }

            const signUpData = await this.singUpByService(parameters);
            return done(false, signUpData);
          } catch (error) {
            this.logger.error(error);
            return done(error, false);
          }
        },
      ) as OAuth2Strategy;

      this.logger.execute(`Загружен сервис авторизации ${service}`);

      this.strategies.set(service as AuthTypes, ServiceStrategy);
      AuthStrategyRegister.strategies.set(
        service as AuthTypes,
        ServiceStrategy,
      );
    }

    return this;
  }

  protected async singUp({
    username,
    email,
    nickname,
    password,
    service,
  }: {
    username: string;
    nickname: string;
    email?: string;
    service?: {
      id: string;
      name: AuthTypes;
      accessToken: string;
      refreshToken?: string;
    };
    password?: string;
  }) {
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

export default AuthStrategyRegister;
