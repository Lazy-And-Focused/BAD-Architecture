import type { Operations } from "@/v1/types/operations.type"

export const createOperations = <T extends Readonly<{[key: string]: string}>>(routes: T, operations: Operations<T>) => {
  return operations;
}
