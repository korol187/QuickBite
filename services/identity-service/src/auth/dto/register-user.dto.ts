import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
