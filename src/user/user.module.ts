import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuardGuard } from 'src/auth/guards/roles/roles.guard/roles.guard.guard';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
