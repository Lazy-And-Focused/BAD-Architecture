import { HttpException, HttpStatus } from "@nestjs/common";

export const tryCatch = <T, P>(tryFunc: () => T, catchFunc: () => P): T | P => {
  try {
    return tryFunc();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    return catchFunc();
  }
};

export const tryCatchThrow = <T>(
  tryFunc: () => T,
  onError?: (error: unknown) => void,
): T => {
  try {
    return tryFunc();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    onError?.(error);

    throw new HttpException(
      "Internal server error",
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        cause: error,
      },
    );
  }
};
