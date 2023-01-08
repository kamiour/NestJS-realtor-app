import { CanActivate, Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split('Bearer ')[1];

      try {
        const user = jwt.verify(token, process.env.JSON_TOKEN_KEY);
        console.log(user);
        return true;
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}
