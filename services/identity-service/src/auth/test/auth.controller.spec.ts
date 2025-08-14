import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';

// Mock the AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

// Mock the AuthGuard
const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return a success message', async () => {
      const registerUserDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { message: 'User registered successfully' };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerUserDto);

      expect(service.register).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return an access token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'some.jwt.token' };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginUserDto);

      expect(service.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile without the password', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = { user: mockUser };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = mockUser;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('health', () => {
    it('should return a health status of "ok"', () => {
      const expectedResult = { status: 'ok' };
      const result = controller.check();
      expect(result).toEqual(expectedResult);
    });
  });
});
