import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password } = registerUserDto;
    this.logger.log(`Starting user registration for email: ${email}`);
    let existingUser: User | null;
    try {
      existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.error('Error checking user existence', error.stack);
      throw new InternalServerErrorException('Error checking user existence');
    }

    if (existingUser) {
      this.logger.warn(
        `Registration attempt failed - user already exists: ${email}`,
      );
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      this.logger.log(
        `User successfully registered: ${email} (ID: ${user.id})`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    const { email, password } = loginUserDto;
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.debug(`User not found: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      } else {
        this.logger.debug(`Password validation failed for: ${email}`);
        return null;
      }
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
