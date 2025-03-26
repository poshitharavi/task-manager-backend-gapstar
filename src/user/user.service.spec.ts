import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

// Properly type the mock Prisma service
type MockPrismaService = {
  user: {
    create: jest.Mock<Promise<User>, any[]>;
    findUnique: jest.Mock<Promise<User | null>, any[]>;
  };
};

// Properly type the mock JWT service
type MockJwtService = {
  signAsync: jest.Mock<Promise<string>, any[]>;
};

describe('UserService', () => {
  let service: UserService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma: MockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const mockJwt: MockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  describe('registerUser', () => {
    it('should successfully register a user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        userName: 'testuser',
        password: 'hashedPassword',
      } as User;

      // Type assertion for the mock
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.registerUser({
        name: 'Test User',
        userName: 'testuser',
        password: 'password',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        userName: 'testuser',
      });
    });
  });

  describe('loginUser', () => {
    it('should throw NotFoundException for non-existent user', async () => {
      // Type assertion for the mock
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.loginUser({
          userName: 'nonexistent',
          password: 'password',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
