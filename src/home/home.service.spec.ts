import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { homeSelect, HomeService } from './home.service';

const mockGetHomes = [
  {
    id: 2,
    address: '1 Avenue',
    city: 'Ottawa',
    price: 500000,
    image: 'url3',
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
    listedDate: '2023-01-04T21:36:14.280Z',
    landSize: 100,
    propertyType: 'CONDO',
    images: [
      {
        url: 'url3',
      },
    ],
  },
  {
    id: 4,
    address: '3 Str',
    city: 'Vancouver',
    price: 450000,
    image: 'url10',
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
    listedDate: '2023-01-06T23:42:32.993Z',
    landSize: 50,
    propertyType: 'CONDO',
    images: [
      {
        url: 'url3',
      },
    ],
  },
  {
    id: 5,
    address: '3 Str',
    city: 'Kitchener',
    price: 450000,
    image: 'url10',
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
    listedDate: '2023-01-07T23:43:03.378Z',
    landSize: 50,
    propertyType: 'CONDO',
    images: [
      {
        url: 'url3',
      },
    ],
  },
];

const mockHome = {
  id: 2,
  address: '1 Avenue',
  city: 'Ottawa',
  price: 500000,
  image: 'url3',
  numberOfBedrooms: 2,
  numberOfBathrooms: 2,
  listedDate: '2023-01-04T21:36:14.280Z',
  landSize: 100,
  propertyType: 'CONDO',
};

const mockImages = [
  { id: 1, url: 'url1' },
  { id: 2, url: 'url2' },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 100000,
        lte: 1000000,
      },
      propertyType: PropertyType.CONDO,
    };

    it('should call prisma home.findMany with correct parameters', async () => {
      const expectedPayload = {
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      };

      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith(expectedPayload);
    });

    it('should throw not found exception if no homes found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomePayload = {
      price: 450000,
      landSize: 50,
      city: 'Kitchener',
      propertyType: PropertyType.CONDO,
      numberOfBathrooms: 2,
      numberOfBedrooms: 2,
      address: '3 Str',
      images: [
        {
          url: 'url1',
        },
        {
          url: 'url2',
        },
      ],
    };

    it('should call prisma home.create with correct payload', async () => {
      const mockPrismaHomeCreate = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockPrismaHomeCreate);

      await service.createHome(mockCreateHomePayload, 1);

      expect(mockPrismaHomeCreate).toBeCalledWith({
        data: {
          address: mockCreateHomePayload.address,
          number_of_bathrooms: mockCreateHomePayload.numberOfBathrooms,
          number_of_bedrooms: mockCreateHomePayload.numberOfBedrooms,
          land_size: mockCreateHomePayload.landSize,
          city: mockCreateHomePayload.city,
          price: mockCreateHomePayload.price,
          property_type: mockCreateHomePayload.propertyType,
          realtor_id: 1,
        },
      });
    });

    it('should call prisma image.createMany with correct payload', async () => {
      const mockPrismaImageCreateMany = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockPrismaImageCreateMany);

      await service.createHome(mockCreateHomePayload, 1);

      expect(mockPrismaImageCreateMany).toBeCalledWith({
        data: [
          {
            home_id: mockHome.id,
            url: 'url1',
          },
          {
            home_id: mockHome.id,
            url: 'url2',
          },
        ],
      });
    });
  });
});
