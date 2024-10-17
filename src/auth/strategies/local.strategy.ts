import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

// const s = new Strategy({

// })

export class localStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  validate(email: string, password: string) {
    return this.authService.validateLocalUser(email, password);
  }
}
