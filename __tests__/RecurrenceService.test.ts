import { recurrenceService } from '../src/services/recurrenceService';
import { RecurrenceRule } from '../src/types/lifeItem';

describe('RecurrenceService Unit Tests', () => {
  it('should describe daily recurrence correctly', () => {
    const rule: RecurrenceRule = {
      id: '1',
      frequency: 'daily',
      interval: 1,
      startDate: '2026-09-03',
      timezone: 'UTC',
    };
    expect(recurrenceService.describe(rule)).toBe('Daily');
  });

  it('should describe custom interval weekly recurrence', () => {
    const rule: RecurrenceRule = {
      id: '2',
      frequency: 'weekly',
      interval: 2,
      startDate: '2026-09-03',
      timezone: 'UTC',
    };
    expect(recurrenceService.describe(rule)).toBe('Every 2 weeks');
  });
});
