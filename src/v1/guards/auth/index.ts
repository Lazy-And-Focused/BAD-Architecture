import { AuthGuardService } from "./auth-guard.service";
import { PrismaService } from "@/database";
import { HashService } from "@/v1/services";

export * from "./auth-guard.service";
export * from "./auth.guard";

export const AUTH_GUARD_PROVIDERS = [
  AuthGuardService,
  PrismaService,
  HashService
] as const;