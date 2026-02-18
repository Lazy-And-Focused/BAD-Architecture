import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserBodyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  @MinLength(2)
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(64)
  @MinLength(2)
  nickname?: string;
}

export class CreateUserHeadersDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
