import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns';
import { RecurrenceRule } from '../types/lifeItem';

export const recurrenceService = {
  calculateNextOccurrence(rule: RecurrenceRule, fromDate: Date = new Date()): Date {
    const start = rule.startDate ? parseISO(rule.startDate) : fromDate;
    let candidate = start > fromDate ? start : fromDate;

    switch (rule.frequency) {
      case 'daily':
        return addDays(candidate, rule.interval || 1);
      case 'weekly':
        return addWeeks(candidate, rule.interval || 1);
      case 'monthly':
        return addMonths(candidate, rule.interval || 1);
      case 'yearly':
        return addYears(candidate, rule.interval || 1);
      case 'custom':
        return addDays(candidate, rule.interval || 1);
      default:
        return addDays(candidate, 1);
    }
  },

  describe(rule: RecurrenceRule): string {
    const intervalStr = rule.interval > 1 ? `Every ${rule.interval} ` : 'Every ';
    switch (rule.frequency) {
      case 'daily':
        return rule.interval === 1 ? 'Daily' : `${intervalStr}days`;
      case 'weekly':
        return rule.interval === 1 ? 'Weekly' : `${intervalStr}weeks`;
      case 'monthly':
        return rule.interval === 1 ? 'Monthly' : `${intervalStr}months`;
      case 'yearly':
        return rule.interval === 1 ? 'Yearly' : `${intervalStr}years`;
      default:
        return 'Custom Repeat';
    }
  },
};
