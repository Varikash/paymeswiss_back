import { Test, TestingModule } from '@nestjs/testing';
import { PokerGateway } from './poker.gateway';

describe('PokerGateway', () => {
  let gateway: PokerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokerGateway],
    }).compile();

    gateway = module.get<PokerGateway>(PokerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
