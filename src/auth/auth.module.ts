import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { UserService } from 'src/user/user.service';
// import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshConfig from './config/refresh.config';
import { JwtStrategyRefresh } from './strategies/refresh-token.strategy';
import { UserService } from 'src/user/user.service';
import { localStrategy } from './strategies/local.strategy';
import googleOauthConfig from './config/google-oauth.config';
import { googleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtStrategyRefresh,
    localStrategy,
    googleStrategy,
  ],
})
export class AuthModule {}
