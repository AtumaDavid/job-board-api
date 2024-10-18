// import {
//   Body,
//   Controller,
//   Post,
//   Request,
//   UseGuards,
//   ValidationPipe,
// } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { CreateUserDto } from 'src/user/dto/create-user.dto';
// import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('signup')
//   registerUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
//     return this.authService.registerUser(createUserDto);
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post('login')
//   loginUser(@Request() req) {
//     return this.authService.loginUser(req.user.id, req.user.name);
//   }
// }

import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefrestAuthGuard } from './guards/refrest-auth/refrest-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Request() req) {
    // Extracts the authenticated user's details from the request object.
    return this.authService.loginUser(
      req.user.id,
      req.user.email,
      req.user.name,
      req.user.role,
      req.user.createdAt,
      req.user.updatedAt,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@Request() req) {
    return { message: `now you cann access this api ${req.user.id}` };
  }

  @UseGuards(RefrestAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(
      req.user.id,
      req.user.email,
      req.user.name,
      req.user.role,
      req.user.createdAt,
      req.user.updatedAt,
    );
  }
}
