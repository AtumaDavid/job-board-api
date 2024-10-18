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

    // If validation succeeds, attach the authenticated user to the request object for future use.
    request.user = user; // Attach user to request object

    // Returning true allows the request to proceed to the route handler.
    return true;
  }
}

// ----------Explanation-------------

// Purpose of the Guard:
// This guard intercepts requests to protected routes, extracts the email and password from the request body, and verifies the user credentials via the AuthService.

// How it works:

// If the user's credentials are valid, the request.user property is populated with the user's details.
// If the credentials are invalid, it throws an UnauthorizedException to block access.
// Benefit:
// By attaching the user to request.user, the authenticated user’s information is readily available in the route handlers for further processing.

// This guard ensures that only valid users can proceed to the next stage of the request.
