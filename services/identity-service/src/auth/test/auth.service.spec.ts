import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';

import { AuthService } from '../auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';

// Mock dependencies
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerUserDto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword';
    const user = {
      id: '1',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(user);

      const result = await service.register(registerUserDto);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { email: registerUserDto.email, password: hashedPassword },
      });
    });

    it('should throw a ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      await expect(service.register(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw an InternalServerErrorException on database error during find', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);
      await expect(service.register(registerUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during user registration',
        dbError.stack,
      );
    });

    it('should throw an InternalServerErrorException on database error during create', async () => {
      const dbError = new Error('Database insert failed');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockRejectedValue(dbError);
      await expect(service.register(registerUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during user registration',
        dbError.stack,
      );
    });
  });

  describe('validateUser', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user data if validation is successful', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedUser } = user;
      const result = await service.validateUser(loginUserDto);

      expect(result).toEqual(expectedUser);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        user.password,
      );
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser(loginUserDto);
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser(loginUserDto);
      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);
      const result = await service.validateUser(loginUserDto);
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during user validation',
        dbError.stack,
      );
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const user: Omit<User, 'password'> = {
      id: '1',
      email: 'test@example.com',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const accessToken = 'test.access.token';

    it('should return an access token on successful login', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginUserDto);

      expect(result).toEqual({ access_token: accessToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });

    it('should throw an UnauthorizedException if validation fails', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);
      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
