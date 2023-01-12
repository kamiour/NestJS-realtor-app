import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserJwtInfo } from 'src/user/decorators/user.decorator';
import { UpdateHomeDto } from './dto/home.dto';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

const mockUser = {
  id: 53,
  name: 'John S',
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHome: jest.fn().mockReturnValue(mockUser),
            updateHome: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter options correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);

      await controller.getHomes('Toronto', '10000');

      expect(mockGetHomes).toHaveBeenCalledWith({
        city: 'Toronto',
        price: {
          gte: 10000,
        },
      });
    });
  });

  describe('updateHomes', () => {
    it('should throw UnauthorizedException error if home was not created by this realtor', async () => {
      await expect(
        controller.updateHome(
          1,
          {} as UpdateHomeDto,
          { id: 5, name: 'Jack R' } as UserJwtInfo,
        ),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if home was created by this realtor', async () => {
      const mockHomeId = 5;
      const mockHomeBody = {} as UpdateHomeDto;
      const mockUser = { id: 53, name: 'Jack R' } as UserJwtInfo; // user ID mathes realtor ID

      const mockUpdateHomes = jest.fn().mockReturnValue({});

      jest.spyOn(homeService, 'updateHome').mockImplementation(mockUpdateHomes);

      await controller.updateHome(mockHomeId, mockHomeBody, mockUser);

      expect(mockUpdateHomes).toBeCalledWith(mockHomeId, mockHomeBody);
    });
  });
});
