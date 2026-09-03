import { homeDashboardService } from '../src/features/home/services/homeDashboardService';
import { lifeItemRepository } from '../src/database/repositories/lifeItemRepository';
import { expenseRepository } from '../src/database/repositories/expenseRepository';
import { inboxRepository } from '../src/database/repositories/inboxRepository';

describe('HomeDashboardService Unit Tests', () => {
  it('should fetch home dashboard data without errors', async () => {
    const data = await homeDashboardService.getDashboardData();
    expect(data).toBeDefined();
    expect(Array.isArray(data.attentionItems)).toBe(true);
    expect(Array.isArray(data.todayItems)).toBe(true);
    expect(Array.isArray(data.upcomingItems)).toBe(true);
    expect(typeof data.monthlySpendingMinor).toBe('number');
    expect(typeof data.upcomingBillsCount).toBe('number');
    expect(typeof data.inboxCount).toBe('number');
  });

  it('should cap attention items to top 3', async () => {
    const data = await homeDashboardService.getDashboardData();
    expect(data.attentionItems.length).toBeLessThanOrEqual(3);
  });
});
