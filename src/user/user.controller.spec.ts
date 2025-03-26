import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StatusCodes } from 'http-status-codes';
import * as request from 'supertest';
import {
  ConflictException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      loginUser: jest.fn(),
      registerUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userService = module.get(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /user/login', () => {
    const loginDto = { userName: 'testuser', password: 'password' };

    it('should return 200 OK with token on successful login', async () => {
      const mockResponse = {
        name: 'Test User',
        userName: 'testuser',
        token: 'mockToken',
      };
      userService.loginUser.mockResolvedValue(mockResponse);

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(StatusCodes.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.OK,
            message: 'Successfully authenticated',
            body: mockResponse,
          });
        });
    });

    it('should return 404 if user not found', async () => {
      userService.loginUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(StatusCodes.NOT_FOUND)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.NOT_FOUND,
            message: 'User not found',
            error: 'Not Found',
          });
        });
    });

    it('should return 401 for invalid credentials', async () => {
      userService.loginUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(StatusCodes.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.UNAUTHORIZED,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          });
        });
    });

    it('should return 500 for internal server error', async () => {
      userService.loginUser.mockRejectedValue(new Error('Database error'));

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong',
            error: 'Internal Server Error',
          });
        });
    });
  });

  describe('POST /user/register', () => {
    const registerDto = {
      name: 'Test User',
      userName: 'testuser',
      password: 'password',
    };

    it('should return 200 OK with user data on successful registration', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        userName: 'testuser',
      };
      userService.registerUser.mockResolvedValue(mockUser as any);

      return request(app.getHttpServer())
        .post('/user/register')
        .send(registerDto)
        .expect(StatusCodes.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.OK,
            message: 'Successfully registered',
            body: { newUser: mockUser },
          });
        });
    });

    it('should return 409 for duplicate username', async () => {
      userService.registerUser.mockRejectedValue(
        new ConflictException('User Name already registered'),
      );

      return request(app.getHttpServer())
        .post('/user/register')
        .send(registerDto)
        .expect(StatusCodes.CONFLICT)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.CONFLICT,
            message: 'User Name already registered',
            error: 'Conflict',
          });
        });
    });

    it('should return 500 for internal server error', async () => {
      userService.registerUser.mockRejectedValue(new Error('Database error'));

      return request(app.getHttpServer())
        .post('/user/register')
        .send(registerDto)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong',
            error: 'Internal Server Error',
          });
        });
    });
  });
});
