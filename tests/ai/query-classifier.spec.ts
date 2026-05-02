import { Test, TestingModule } from '@nestjs/testing';
import { QueryClassifierService } from '../../apps/api/src/ai/query-classifier.service';

describe('QueryClassifierService', () => {
  let service: QueryClassifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryClassifierService],
    }).compile();

    service = module.get<QueryClassifierService>(QueryClassifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect emergency intent', async () => {
    const res = await service.classify({
      rawQuery: 'help me election day right now',
      isElectionDay: true,
      countryCode: 'IND',
      daysToElection: 0,
      personaCode: 'P01',
    });
    expect(res.intent).toBe('EMERGENCY');
    expect(res.isEmergency).toBe(true);
  });
});
