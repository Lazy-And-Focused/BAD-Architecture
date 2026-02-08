import { HttpException, HttpStatus } from "@nestjs/common";

export const trycatch = <T, P>(tryFunc: () => T, catchFunc: () => P): T | P => {
  try {
    return tryFunc();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    return catchFunc();
  }
};

export const trycatchThrow = <T>(tryFunc: () => T): T => {
  try {
    return tryFunc();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR, {
      cause: error,
    });
  }
};
