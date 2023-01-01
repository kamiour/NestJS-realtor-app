import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signup(body: SignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }
  }
}
