import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

export class localStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Specifies that the username field is 'email' instead of the default 'username'.
    });
  }

  // Method to validate the user with provided email and password.
  validate(email: string, password: string) {
    if (password === '')
      throw new UnauthorizedException('please proviide your password');
    // Calls the AuthService's validateLocalUser method to verify credentials.
    return this.authService.validateLocalUser(email, password);

    // If the credentials are valid, the validated user object will be returned.
    // If invalid, an exception will be thrown by the AuthService (e.g., UnauthorizedException).
  }
}
