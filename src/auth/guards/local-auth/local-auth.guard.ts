// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Observable } from 'rxjs';

// @Injectable()
// export class LocalAuthGuard extends AuthGuard('local') {}

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
// import { AuthService } from '../auth.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    const user = await this.authService.validateLocalUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    request.user = user; // Attach user to request object
    return true;
  }
}
