import { createParamDecorator } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

export interface UserJwtInfo {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

export const User = createParamDecorator(
  (data, context: ExecutionContext): UserJwtInfo => {
    const user = context.switchToHttp().getRequest().user;

    return user;
  },
);
