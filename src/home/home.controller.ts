import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Body, Param } from '@nestjs/common/decorators';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { Message, PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User, UserJwtInfo } from 'src/user/decorators/user.decorator';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { property_type: propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHome(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHome(id);
  }

  @Roles(UserType.REALTOR)
  @Post()
  createHome(
    @Body() body: CreateHomeDto,
    @User() user: UserJwtInfo,
  ): Promise<HomeResponseDto> {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserJwtInfo,
  ): Promise<HomeResponseDto> {
    const realtor = await this.homeService.getRealtorByHome(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.updateHome(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserJwtInfo,
  ): Promise<void> {
    const realtor = await this.homeService.getRealtorByHome(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.deleteHome(id);
  }

  @Roles(UserType.BUYER)
  @Post('inquire/:id')
  inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: UserJwtInfo,
    @Body() body: InquireDto,
  ): Promise<Message> {
    return this.homeService.inquire(user, homeId, body.message);
  }

  @Roles(UserType.REALTOR)
  @Get(':id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserJwtInfo,
  ): Promise<Partial<Message>[]> {
    const realtor = await this.homeService.getRealtorByHome(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.getHomeMessages(id);
  }
}
