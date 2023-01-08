import * as bcrypt from 'bcryptjs';
import { Body, Controller, Post } from '@nestjs/common';
import { Get, Param } from '@nestjs/common/decorators';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ParseEnumPipe } from '@nestjs/common/pipes';
import { UserType } from '@prisma/client';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import { User, UserJwtInfo } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signup(body, userType);
  }

  @Post('signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('key')
  generateProductKey(@Body() body: GenerateProductKeyDto) {
    return this.authService.generateProductKey(body.email, body.userType);
  }

  @Get('me')
  me(@User() user: UserJwtInfo): UserJwtInfo {
    return user;
  }
}
