import { Test, TestingModule } from '@nestjs/testing';
import { PokerService } from './poker.service';

describe('PokerService', () => {
  let service: PokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokerService],
    }).compile();

    service = module.get<PokerService>(PokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
