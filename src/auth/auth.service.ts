import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtpayload';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import refreshConfig from './config/refresh.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('User already exists');

    // Create the user if they don't exist
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    // console.log('Email received:', email);
    if (!email) {
      throw new UnauthorizedException('Email is required');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await verify(user.password, password); // Await the verify method
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async loginUser(
    userId: string,
    email: string,
    name: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
  ) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    return {
      userId,
      // userName: name,
      name,
      email,
      role,
      createdAt,
      updatedAt,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    // const accessToken = await this.jwtService.signAsync(payload);
    // return { accessToken };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const currentUser = { id: user.id };
    return currentUser;
  }

  async validateRefreshToken(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const currentUser = { id: user.id };
    return currentUser;
  }

  async refreshToken(
    userId: string,
    email: string,
    name: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
  ) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    return {
      userId,
      // userName: name,
      name,
      email,
      role,
      createdAt,
      updatedAt,
      accessToken,
      refreshToken,
    };
  }
}
