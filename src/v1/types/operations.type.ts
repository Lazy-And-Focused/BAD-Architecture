import type { ApiOperationOptions } from "@nestjs/swagger";

export type Operations<T extends Readonly<{[key: string]: string}>> = Record<keyof T, ApiOperationOptions>;
