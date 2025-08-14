import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    this.logger.log('Attempting to register user', {
      email: registerUserDto.email,
    });
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerUserDto.email },
      });

      if (existingUser) {
        this.logger.warn('Registration failed: User already exists', {
          email: registerUserDto.email,
        });
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: registerUserDto.email,
          password: hashedPassword,
        },
      });

      this.logger.log('User registered successfully', { userId: user.id });
      return { message: 'User registered successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error during user registration', error.stack);
      throw new InternalServerErrorException('Could not register user');
    }
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<Omit<User, 'password'> | null> {
    this.logger.log('Attempting to validate user', {
      email: loginUserDto.email,
    });
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
      });

      if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        this.logger.log('User validation successful', { userId: user.id });
        return result;
      }

      this.logger.warn('User validation failed', { email: loginUserDto.email });
      return null;
    } catch (error) {
      this.logger.error('Error during user validation', error.stack);
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginUserDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: { email: string; sub: string; role: string } = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
