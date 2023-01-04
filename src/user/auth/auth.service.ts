import { Injectable } from '@nestjs/common';
import { ConflictException, HttpException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signup(body: SignupParams, userType: UserType): Promise<string> {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: body.email,
        name: body.name,
        phone: body.phone,
        password: hashedPassword,
        user_type: userType,
      },
    });

    return this.generateJWT(user);
  }

  async signin(body: SigninParams): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(body.password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(user);
  }

  private generateJWT(user: User): string {
    const token = jwt.sign(
      {
        name: user.name,
        id: user.id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: '1h',
      },
    );

    return token;
  }

  generateProductKey(email: string, userType: UserType): Promise<string> {
    const str = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(str, 10);
  }
}
