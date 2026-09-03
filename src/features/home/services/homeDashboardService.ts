import { lifeItemRepository } from '../../../database/repositories/lifeItemRepository';
import { expenseRepository } from '../../../database/repositories/expenseRepository';
import { inboxRepository } from '../../../database/repositories/inboxRepository';
import { attentionService } from '../../../services/attentionService';
import { LifeItem, AttentionItem } from '../../../types/lifeItem';
import { isToday, parseISO, isAfter, startOfDay, format } from 'date-fns';

export interface HomeDashboardData {
  attentionItems: AttentionItem[];
  todayItems: LifeItem[];
  upcomingItems: LifeItem[];
  monthlySpendingMinor: number;
  upcomingBillsCount: number;
  inboxCount: number;
}

export const homeDashboardService = {
  async getDashboardData(): Promise<HomeDashboardData> {
    const allItems = await lifeItemRepository.findAll();
    const expenses = await expenseRepository.findAll();
    const inboxItems = await inboxRepository.findUnprocessed();

    const todayStart = startOfDay(new Date());
    const currentMonthStr = format(new Date(), 'yyyy-MM');

    // 1. Top 3 Needs Attention Items
    const fullAttentionList = attentionService.calculateNeedsAttention(allItems);
    const attentionItems = fullAttentionList.slice(0, 3);

    // 2. Today Items
    const todayItems = allItems.filter((item) => {
      if (!item.startAt) return false;
      return isToday(parseISO(item.startAt));
    });

    // 3. Upcoming 3 to 5 future LifeItems sorted chronologically
    const upcomingItems = allItems
      .filter((item) => {
        if (!item.startAt || item.status === 'completed') return false;
        const itemDate = parseISO(item.startAt);
        return isAfter(itemDate, todayStart) && !isToday(itemDate);
      })
      .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())
      .slice(0, 4);

    // 4. Monthly Spending (Calculated from SQLite expenses for current month)
    const monthlyExpenses = expenses.filter((exp) => exp.expenseDate.startsWith(currentMonthStr));
    const monthlySpendingMinor = monthlyExpenses.reduce((acc, curr) => acc + curr.amountMinor, 0);

    // 5. Upcoming Bills Count
    const upcomingBillsCount = allItems.filter(
      (item) => (item.type === 'bill' || item.type === 'subscription') && item.status !== 'completed'
    ).length;

    // 6. Unprocessed Inbox Count
    const inboxCount = inboxItems.length;

    return {
      attentionItems,
      todayItems,
      upcomingItems,
      monthlySpendingMinor,
      upcomingBillsCount,
      inboxCount,
    };
  },
};
