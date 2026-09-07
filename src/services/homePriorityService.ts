import { LifeItem, LifeItemType } from '../types/lifeItem';
import { 
  parseISO, 
  isToday, 
  isTomorrow, 
  isBefore, 
  isAfter, 
  differenceInMinutes, 
  differenceInHours, 
  differenceInDays, 
  format 
} from 'date-fns';

export interface RankedNextUpItem {
  id: string;
  originalId: string;
  type: LifeItemType;
  title: string;
  subtitle?: string;
  tagLabel: string;        // e.g. "OVERDUE", "NEXT UP", "BILL DUE", "EXPIRING SOON", "BORROW"
  tagColor: string;       // e.g. "#EF4444", "#F59E0B", "#6366F1", "#8B5CF6"
  dateStr: string;        // e.g. "Today · 6:00 PM", "Tomorrow", "12 Sep 2025"
  relativeTime: string;   // e.g. "In 20 mins", "In 2 hours", "Overdue by 2h", "Due in 1 day", "6 days left"
  urgency: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;  // Sorting weight (higher = higher priority)
  status: string;
  amountFormatted?: string;
  categoryName?: string;
  originalItem: any;
}

export const homePriorityService = {
  /**
   * Main entry point: Process all LifeItems and return top 3 to 5 ranked Next Up items.
   */
  getNextUpItems(allItems: LifeItem[], limit: number = 5): RankedNextUpItem[] {
    const now = new Date();
    const activeItems = allItems.filter(
      (item) => item.status !== 'completed' && item.status !== 'archived' && item.status !== 'cancelled'
    );

    const rankedList: RankedNextUpItem[] = activeItems
      .map((item) => this.rankItem(item, now))
      .filter((ranked): ranked is RankedNextUpItem => ranked !== null)
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return rankedList.slice(0, limit);
  },

  /**
   * Rank a single LifeItem and convert it to a RankedNextUpItem structure.
   */
  rankItem(item: LifeItem, now: Date): RankedNextUpItem | null {
    if (!item.startAt) return null;

    let itemDate: Date;
    try {
      itemDate = parseISO(item.startAt);
    } catch (e) {
      return null;
    }

    const minsDiff = differenceInMinutes(itemDate, now);
    const hoursDiff = differenceInHours(itemDate, now);
    const daysDiff = differenceInDays(itemDate, now);
    const isPast = isBefore(itemDate, now);

    let tagLabel = 'NEXT UP';
    let tagColor = '#F59E0B'; // Gold/Amber
    let urgency: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let priorityScore = 100;

    // Determine type tag & accent colors
    switch (item.type) {
      case 'bill':
      case 'subscription':
        tagLabel = 'BILL DUE';
        tagColor = '#F59E0B';
        break;
      case 'expiry':
        tagLabel = 'EXPIRING SOON';
        tagColor = '#8B5CF6';
        break;
      case 'borrow':
        tagLabel = 'BORROW RECORD';
        tagColor = '#EC4899';
        break;
      case 'checklist':
        tagLabel = 'CHECKLIST';
        tagColor = '#10B981';
        break;
      default:
        tagLabel = isPast ? 'OVERDUE' : 'NEXT UP';
        tagColor = isPast ? '#EF4444' : '#F59E0B';
        break;
    }

    // Priority Score & Urgency Calculation Engine
    if (isPast) {
      // 1. Overdue Items (Highest Priority)
      urgency = 'critical';
      tagLabel = 'OVERDUE';
      tagColor = '#EF4444';
      priorityScore = 1000 + Math.min(Math.abs(hoursDiff), 500);
    } else if (minsDiff <= 60) {
      // 2. Happening within the hour
      urgency = 'critical';
      priorityScore = 850 + (60 - minsDiff);
    } else if (isToday(itemDate)) {
      // 3. Happening later today
      urgency = 'high';
      priorityScore = 700 + (24 - hoursDiff);
    } else if (isTomorrow(itemDate)) {
      // 4. Happening tomorrow
      urgency = 'medium';
      priorityScore = 500;
    } else if (daysDiff <= 7) {
      // 5. Happening within a week
      urgency = 'medium';
      priorityScore = 300 - daysDiff * 10;
    } else {
      // 6. Future items
      urgency = 'low';
      priorityScore = 100 - Math.min(daysDiff, 90);
    }

    // High priority override
    if (item.priority === 'high') {
      priorityScore += 50;
    }

    const relativeTime = this.calculateRelativeTime(itemDate, now, isPast);
    const dateStr = this.formatDateString(itemDate);

    return {
      id: item.id,
      originalId: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.description,
      tagLabel,
      tagColor,
      dateStr,
      relativeTime,
      urgency,
      priorityScore,
      status: item.status,
      categoryName: item.categoryId,
      originalItem: item,
    };
  },

  /**
   * Format human-friendly relative time string (e.g. "In 20 mins", "In 2 hours", "Tomorrow", "Overdue by 2h").
   */
  calculateRelativeTime(date: Date, now: Date = new Date(), isPast: boolean = false): string {
    const minsDiff = Math.abs(differenceInMinutes(date, now));
    const hoursDiff = Math.abs(differenceInHours(date, now));
    const daysDiff = Math.abs(differenceInDays(date, now));

    if (isPast) {
      if (minsDiff < 60) return `Overdue by ${minsDiff}m`;
      if (hoursDiff < 24) return `Overdue by ${hoursDiff}h`;
      return `Overdue by ${daysDiff}d`;
    }

    if (minsDiff < 60) {
      return minsDiff === 0 ? 'Due now' : `In ${minsDiff} mins`;
    }
    if (hoursDiff < 24) {
      if (isToday(date)) return `In ${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'}`;
      if (isTomorrow(date)) return 'Tomorrow';
    }
    if (isTomorrow(date)) return 'Tomorrow';
    if (daysDiff <= 7) return `In ${daysDiff} days`;

    return format(date, 'MMM dd');
  },

  /**
   * Format Date String (e.g. "Today · 6:00 PM", "Tomorrow · 10:30 AM", "Sep 10 · 2:00 PM").
   */
  formatDateString(date: Date): string {
    const timeStr = format(date, 'h:mm a');
    if (isToday(date)) return `Today · ${timeStr}`;
    if (isTomorrow(date)) return `Tomorrow · ${timeStr}`;
    return format(date, 'MMM dd · h:mm a');
  },

  /**
   * Determine item urgency.
   */
  determineItemUrgency(item: LifeItem): 'critical' | 'high' | 'medium' | 'low' {
    if (!item.startAt) return 'low';
    const date = parseISO(item.startAt);
    const now = new Date();
    if (isBefore(date, now)) return 'critical';
    if (differenceInMinutes(date, now) <= 60) return 'critical';
    if (isToday(date)) return 'high';
    if (isTomorrow(date)) return 'medium';
    return 'low';
  },
};
