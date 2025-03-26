import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginResponse, UserPayload } from './interface/user-login.interface';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newEmployee = await this.prisma.user.create({
        data: {
          userName: createUserDto.userName,
          password: await hash(createUserDto.password, 10),
          name: createUserDto.name,
        },
      });

      delete newEmployee.password;

      return newEmployee;
    } catch (error) {
      // check if username already registered and throw error
      if (error.code === 'P2002') {
        throw new ConflictException('User Name already registered');
      }

      // throw error if any
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userName: loginUserDto.userName },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!(await compare(loginUserDto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: UserPayload = {
        sub: user.id,
        userName: user.userName,
        name: user.name,
      };

      return {
        name: payload.name,
        userName: payload.userName,
        token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw error;
    }
  }
}
