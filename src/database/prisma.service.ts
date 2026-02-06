import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/services";

const ADAPTER =
  process.env.NODE_ENV === "development"
    ? new PrismaPg({ connectionString: env.DATABASE_URL })
    : undefined;

const ACCELERATE_URL =
  process.env.NODE_ENV === "development" ? undefined : env.DATABASE_URL;

const OPTIONS = {
  adapter: ADAPTER,
  accelerateUrl: ACCELERATE_URL,
} as
  | {
      adapter: PrismaPg;
      accelerateUrl: undefined;
    }
  | {
      adapter: undefined;
      accelerateUrl: string;
    };

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public constructor() {
    super(OPTIONS);
  }

  public async onModuleInit() {
    await this.$connect();
  }

  public async onModuleDestroy() {
    await this.$disconnect();
  }
}

export default PrismaService;
