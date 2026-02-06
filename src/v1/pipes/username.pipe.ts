import { HttpException, HttpStatus, PipeTransform } from "@nestjs/common";
import { env } from "@/services";

export class UsernamePipe implements PipeTransform {
  public static validate(value: string) {
    const username = value.trim().toLowerCase();
    const usernameValided = Array.from(username).every((char) =>
      env.AVAILABLE_USERNAME_SYMBOLS.includes(char),
    );
    if (!usernameValided) {
      throw new HttpException(
        "username must includes only this symbols: " +
          env.AVAILABLE_USERNAME_SYMBOLS,
        HttpStatus.BAD_REQUEST,
      );
    }

    return username;
  }

  public transform(value: unknown) {
    if (typeof value !== "string") {
      throw new HttpException(
        "username must be string",
        HttpStatus.BAD_REQUEST,
      );
    }

    return UsernamePipe.validate(value);
  }
}
