import type { Auth } from "@/database/generated/client";
import { ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";

@ApiSchema({
  name: "AuthSchema"
})
export class AuthEntity implements Auth {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  userId: string;
  
  @ApiProperty()
  token: string;
  
  @ApiPropertyOptional({ type: "string", nullable: true  })
  email: string | null;
  
  @ApiPropertyOptional({ type: "string", nullable: true })
  password: string | null;
  
  @ApiProperty()
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
}

export type {
  Auth
}