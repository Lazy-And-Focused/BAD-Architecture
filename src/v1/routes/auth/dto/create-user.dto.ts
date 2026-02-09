import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class CreateUserBodyDto {
  @ApiProperty()
  @IsString()
  username: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
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