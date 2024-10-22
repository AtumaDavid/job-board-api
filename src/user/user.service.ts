import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { Prisma, User, UserRole } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  // -------------CREATE USER-----------
  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...user,
        // role: role || UserRole.USER,
      },
    });
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  // ---------FIND ONE------------
  async findOne(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRefreshToken,
      },
    });
  }

  // ------------FIND ALL USERS(ADMIN ONLY)------------
  async findAll(params: {
    skip?: number;
    take?: number;
    role?: UserRole;
    search?: string;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    currentUserRole?: UserRole;
  }) {
    const { skip, take, role, search, orderBy, currentUserRole } = params;

    // Define the where clause for filtering
    const where: Prisma.UserWhereInput = {
      AND: [
        role ? { role } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    // define select object based on user role
    const selectObject = {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          id: true,
          phoneNumber: true,
          resumeUrl: true,
          profilePictureUrl: true,
          workExperience: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      // only include these counts for ADMIN USERS
      ...(currentUserRole === UserRole.ADMIN && {
        _count: {
          select: {
            jobListings: true,
            applications: true,
          },
        },
      }),
      // always exclude sensitive fields
      password: false,
      hashedRefreshToken: false,
    };

    // Execute both queries concurrently for better performance
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: selectObject,
      }),
      this.prisma.user.count({ where }),
    ]);
    // Transform the response based on user role
    const transformedUsers = users.map((user) => {
      // If user is ADMIN, include job-related stats
      if (currentUserRole === UserRole.ADMIN) {
        return {
          ...user,
          stats: {
            jobListings: user._count?.jobListings || 0,
            applications: user._count?.applications || 0,
          },
          _count: undefined, // Remove _count from the final response
        };
      }
      // For non-admin users, return basic user info without stats
      return {
        ...user,
        _count: undefined,
      };
    });

    return {
      users: transformedUsers,
      pagination: {
        total,
        pageSize: take,
        currentPage: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // --------------UPDATE A USER---------------
  async update(
    userId: string,
    updateData: Prisma.UserUpdateInput,
    // currentUserRole: UserRole,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent non-admin users from updating roles
    // if (updateData.role && currentUserRole !== UserRole.ADMIN) {
    //   throw new ForbiddenException('You are not authorized to update roles');
    // }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hash(updateData.password as string);
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  // ------------DELETE USER---------
  async delete(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
