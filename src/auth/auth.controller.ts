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
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

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
    return this.authService.loginUser(req.user.id, req.user.name);
  }
}
