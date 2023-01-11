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
  });
});
