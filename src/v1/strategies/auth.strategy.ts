import type {
  SignInData,
  SignInRequiredData,
} from "@1/entities";

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { sign } from "jsonwebtoken";

import { SingUpData, SingInByServiceData } from "./strategies.dto";
import { AUTH_STRATEGIES_ERRORS } from "../errors";

import { UsernamePipe } from "@1/pipes";
import { HashService } from "@1/services";
import { PrismaService } from "@/database";
import { env } from "@/services/env/config/config.service";

import { v4 as uuid } from "uuid";

@Injectable()
export class AuthStrategy {
  private readonly hash = new HashService();

  public constructor(private readonly prisma: PrismaService) {}

  public singUpByPassword({
    username,
    password,
    email,
    nickname,
  }: SignInData) {
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
  }: SingInByServiceData) {
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
  }: SignInRequiredData) {
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
      throw AUTH_STRATEGIES_ERRORS.AUTH_NOT_FOUND.exeption;
    }

    if (auth.password !== this.hash.execute(password)) {
      throw AUTH_STRATEGIES_ERRORS.PASSWORD_ERROR.exeption;
    }

    return { user, auth };
  }

  public async singInByService({
    profile,
    accessToken,
    refreshToken,
    name,
  }: SingInByServiceData) {
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
        id: service.id,
      },
      data: {
        accessToken,
        refreshToken,
      },
    };

    const updatedAuth = await this.prisma.auth.update({
      where: {
        id: auth.id,
      },
      data: {
        services: { update },
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
  }: SingUpData) {
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
