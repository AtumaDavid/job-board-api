// import {
//   ConflictException,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { verify } from 'argon2';
// import { CreateUserDto } from 'src/user/dto/create-user.dto';
// import { UserService } from 'src/user/user.service';
// import { AuthJwtPayload } from './types/auth-jwtpayload';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//   ) {}

//   async registerUser(createUserDto: CreateUserDto) {
//     const user = await this.userService.findByEmail(createUserDto.email);
//     if (user) throw new ConflictException('User already exists');

//     // Create the user if they don't exist
//     return this.userService.create(createUserDto);
//   }

//   async validateLocalUser(email: string, password: string) {
//     const user = await this.userService.findByEmail(email);
//     if (!user) throw new UnauthorizedException('User not found');

//     const isPasswordHashed = verify(user.password, password);
//     if (!isPasswordHashed)
//       throw new UnauthorizedException('Invalid credentials');

//     return { id: user.id, name: user.name };
//   }

//   async loginUser(userId: number, name?: string) {
//     const { accessToken } = await this.generateTokens(userId);
//     return {
//       id: userId,
//       name: name,
//       accessToken,
//     };
//   }

//   async generateTokens(useId: number) {
//     const payload: AuthJwtPayload = { sub: useId };
//     const [accessToken] = await Promise.all([
//       this.jwtService.signAsync(payload),
//     ]);
//     return { accessToken };
//   }
// }

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
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await verify(user.password, password); // Await the verify method
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, name: user.name };
  }

  async loginUser(userId: string, name?: string) {
    const { accessToken } = await this.generateTokens(userId);
    return {
      id: userId,
      name: name,
      accessToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
