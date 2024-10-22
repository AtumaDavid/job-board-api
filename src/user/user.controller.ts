import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Prisma, UserRole } from '@prisma/client';
import { RolesGuardGuard } from 'src/auth/guards/roles/roles.guard/roles.guard.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN) // Only admins can access this endpoint
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder', new DefaultValuePipe('desc'))
    sortOrder?: 'asc' | 'desc',
    @Query('currentUserRole') currentUserRole?: UserRole,
  ) {
    const skip = (page - 1) * pageSize;

    // Build the orderBy object based on sortBy and sortOrder
    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    return this.userService.findAll({
      skip,
      take: pageSize,
      role,
      search,
      orderBy,
      currentUserRole,
    });
  }
}
