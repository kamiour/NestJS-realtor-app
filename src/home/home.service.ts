import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { PropertyType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private prismaService: PrismaService) {}

  async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        listed_date: true,
        land_size: true,
        realtor_id: true,
        created_at: true,
        updated_at: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;

      return new HomeResponseDto(fetchedHome);
    });
  }

  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        listed_date: true,
        land_size: true,
        realtor_id: true,
        created_at: true,
        updated_at: true,
        images: {
          select: {
            url: true,
          },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }

  async createHome(
    body: CreateHomeParams,
    userId: number,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.create({
      data: {
        address: body.address,
        number_of_bathrooms: body.numberOfBathrooms,
        number_of_bedrooms: body.numberOfBedrooms,
        land_size: body.landSize,
        city: body.city,
        price: body.price,
        property_type: body.propertyType,
        realtor_id: userId,
      },
    });

    const images = body.images.map((image) => ({ ...image, home_id: home.id }));

    await this.prismaService.image.createMany({
      data: images,
    });

    return new HomeResponseDto(home);
  }

  async updateHome(
    id: number,
    body: UpdateHomeParams,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data: body,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number): Promise<void> {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });

    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async getRealtorByHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home.realtor;
  }
}
