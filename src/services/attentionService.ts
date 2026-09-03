import { AttentionItem, LifeItem } from '../types/lifeItem';
import { isToday, isBefore, addDays, parseISO, startOfDay } from 'date-fns';

export const attentionService = {
  calculateNeedsAttention(items: LifeItem[]): AttentionItem[] {
    const attentionList: AttentionItem[] = [];
    const today = startOfDay(new Date());

    items.forEach((item) => {
      if (item.status === 'completed' || item.status === 'cancelled' || item.status === 'archived') {
        return;
      }

      const itemDate = item.startAt ? parseISO(item.startAt) : null;

      if (!itemDate) return;

      // 1. Overdue Items
      if (isBefore(itemDate, today)) {
        attentionList.push({
          lifeItemId: item.id,
          type: item.type,
          title: item.title,
          severity: 'critical',
          reason: 'Overdue',
          dateStr: item.startAt,
        });
        return;
      }

      // 2. Due Today Items (Bills, Reminders, Checklists)
      if (isToday(itemDate)) {
        const severity = item.type === 'bill' ? 'high' : 'high';
        const reason = item.type === 'bill' ? 'Bill due today' : 'Scheduled for today';
        attentionList.push({
          lifeItemId: item.id,
          type: item.type,
          title: item.title,
          severity,
          reason,
          dateStr: item.startAt,
        });
        return;
      }

      // 3. Expiring Soon (Within 7 Days)
      const sevenDaysLater = addDays(today, 7);
      if (item.type === 'expiry' && isBefore(itemDate, sevenDaysLater)) {
        attentionList.push({
          lifeItemId: item.id,
          type: item.type,
          title: item.title,
          severity: 'medium',
          reason: 'Expiring soon',
          dateStr: item.startAt,
        });
      }
    });

    // Sort by severity: critical > high > medium > low
    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    return attentionList.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  },
};
