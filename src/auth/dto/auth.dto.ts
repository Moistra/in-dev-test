import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'IsEmail validation' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'not empty, string validation' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
