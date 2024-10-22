import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { Prisma, User, UserRole } from '@prisma/client';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  // -------------CREATE USER-----------
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
    if (!email) {
      throw new Error('Email is required');
    }

    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

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

  // // find all users
  // async findAll(params: {
  //   skip?: number; // Number of records to skip (used for pagination)
  //   take?: number; // Number of records to take (limit per page)
  //   role?: UserRole;
  //   search?: string; // Search query to filter users by name
  //   orderBy?: Prisma.UserOrderByWithRelationInput;
  // }) {
  //   // Destructure parameters for easier access
  //   const { skip, take, role, search, orderBy } = params;

  //   // Define the 'where' filter object for the database query
  //   const where: Prisma.UserWhereInput = {
  //     AND: [
  //       // All conditions in this array must be satisfied
  //       role ? { role } : {}, // If 'role' is provided, filter by it
  //       search
  //         ? {
  //             // If 'search' is provided, filter by name or email
  //             OR: [
  //               // At least one of these conditions must be true
  //               { name: { contains: search, mode: 'insensitive' } }, // Case-insensitive name match
  //               // { email: { contains: search, mode: 'insensitive' } },
  //             ],
  //           }
  //         : {}, // If no search query, leave the condition empty
  //     ],
  //   };

  //   // Execute both queries (find users and count total) concurrently using Promise.all
  //   const [users, total] = await Promise.all([
  //     this.prisma.user.findMany({
  //       skip, // Skip the specified number of records
  //       take, // Limit the number of records to the specified value
  //       where, // Apply filters defined in 'where'
  //       orderBy: orderBy || { createdAt: 'desc' }, // Sort by the given criteria or default to descending 'createdAt'
  //       include: {
  //         // Include related data in the result
  //         profile: true, // Include the user's profile
  //         _count: {
  //           // Include counts of related job listings and applications
  //           select: {
  //             jobListings: true, // Count the user's job listings
  //             applications: true, // Count the user's applications
  //           },
  //         },
  //       },
  //     }),
  //     this.prisma.user.count({ where }), // Count total users that match the filter
  //   ]);

  //   // Calculate pagination details and return the result
  //   return {
  //     users, // List of users matching the query
  //     total, // Total number of users matching the query
  //     page: skip ? Math.floor(skip / (take || 10)) + 1 : 1, // Current page number
  //     pageSize: take || 10, // Number of users per page (default is 10)
  //     totalPages: Math.ceil(total / (take || 10)), // Total number of pages
  //   };
  // }
}
