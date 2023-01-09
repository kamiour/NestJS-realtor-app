import { CanActivate, Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserJwtInfo } from 'src/user/decorators/user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split('Bearer ')[1];

      try {
        const payload = jwt.verify(
          token,
          process.env.JSON_TOKEN_KEY,
        ) as UserJwtInfo;

        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        });

        if (!user) {
          return false;
        }

        return roles.includes(user.user_type);
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}
