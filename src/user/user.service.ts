import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { UserRole } from '@prisma/client';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, role, ...user } = createUserDto;
    const hashedPassword = await hash(password);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...user,
        role: role || UserRole.USER,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
