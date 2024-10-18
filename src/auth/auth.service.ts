import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtpayload';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('User already exists');

    // Create the user if they don't exist
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    console.log('Email received:', email);
    if (!email) {
      throw new UnauthorizedException('Email is required');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await verify(user.password, password); // Await the verify method
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async loginUser(userId: string, email: string, name: string, role: UserRole) {
    const { accessToken } = await this.generateTokens(userId);
    return {
      id: userId,
      // userName: name,
      name,
      email,
      role,
      accessToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    // const accessToken = await this.jwtService.signAsync(payload);
    // return { accessToken };
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload),
    ]);
    return { accessToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const currentUser = { id: user.id };
    return currentUser;
  }
}
