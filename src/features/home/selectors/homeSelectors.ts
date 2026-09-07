import { RootState } from '../../../store/store';
import { LifeItem, LifeItemType } from '../../../types/lifeItem';
import { isToday, parseISO, isAfter, startOfDay, differenceInMinutes } from 'date-fns';
import { homePriorityService, RankedNextUpItem } from '../../../services/homePriorityService';

// Actionable Item Types for Daily Progress (reminders, tasks, checklists, events, follow-ups)
const ACTIONABLE_TYPES: Set<LifeItemType> = new Set([
  'reminder',
  'task',
  'checklist',
  'event',
  'follow_up',
  'counter',
]);

/**
 * Filter all LifeItems to return only actionable items scheduled for today.
 * Excludes expenses, bills, notes, expiry, and borrow records unless explicitly actionable and scheduled for today.
 */
export const selectActionableTodayItems = (state: RootState): LifeItem[] => {
  const allItems = state.lifeItems.items || [];
  return allItems.filter((item) => {
    if (!item.startAt || item.status === 'archived') return false;
    // Exclude non-actionable types
    if (!ACTIONABLE_TYPES.has(item.type)) return false;
    
    try {
      return isToday(parseISO(item.startAt));
    } catch (e) {
      return false;
    }
  });
};

export interface DayProgressStats {
  totalTodayItems: number;
  completedItems: number;
  remainingItems: number;
  percentage: number;
  motivationalMessage: string;
  isEmpty: boolean;
}

/**
 * Calculate Daily Progress statistics from actionable today items.
 */
export const selectDayProgressStats = (state: RootState): DayProgressStats => {
  const todayItems = selectActionableTodayItems(state);
  const totalTodayItems = todayItems.length;
  
  if (totalTodayItems === 0) {
    return {
      totalTodayItems: 0,
      completedItems: 0,
      remainingItems: 0,
      percentage: 0,
      motivationalMessage: 'No actionable tasks scheduled for today. Enjoy your day! 🌟',
      isEmpty: true,
    };
  }

  const completedItems = todayItems.filter((item) => item.status === 'completed').length;
  const remainingItems = totalTodayItems - completedItems;
  const percentage = Math.round((completedItems / totalTodayItems) * 100);

  let motivationalMessage = 'Start small today. Every journey begins with a single step! 🌱';
  if (percentage === 100) {
    motivationalMessage = 'Awesome job! All items completed today. 🎉';
  } else if (percentage >= 80) {
    motivationalMessage = 'Almost there! Finish strong today. 🚀';
  } else if (percentage >= 50) {
    motivationalMessage = "Keep it up! You're doing great. ✨";
  } else if (percentage > 0) {
    motivationalMessage = "You're off to a good start! Keep pushing forward. 💪";
  }

  return {
    totalTodayItems,
    completedItems,
    remainingItems,
    percentage,
    motivationalMessage,
    isEmpty: false,
  };
};

/**
 * Select top 3 to 5 ranked Next Up items using homePriorityService.
 */
export const selectRankedNextUpItems = (state: RootState): RankedNextUpItem[] => {
  const allItems = state.lifeItems.items || [];
  return homePriorityService.getNextUpItems(allItems, 5);
};

/**
 * Select the single highest priority Next Up actionable item.
 */
export const selectNextUpItem = (state: RootState): LifeItem | null => {
  const ranked = selectRankedNextUpItems(state);
  return ranked.length > 0 ? ranked[0].originalItem : null;
};

export interface FocusTimeStats {
  focusTimeText: string;
  totalFocusMinutes: number;
  completedFocusMinutes: number;
  focusProgressPercentage: number;
}

/**
 * Calculate total planned focus time & focus completion percentage from today's scheduled actionable items.
 */
export const selectFocusTimeStats = (state: RootState): FocusTimeStats => {
  const todayItems = selectActionableTodayItems(state);
  let totalFocusMinutes = 0;
  let completedFocusMinutes = 0;

  todayItems.forEach((item) => {
    if (item.startAt && item.endAt) {
      try {
        const start = parseISO(item.startAt);
        const end = parseISO(item.endAt);
        const diff = differenceInMinutes(end, start);
        if (diff > 0) {
          totalFocusMinutes += diff;
          if (item.status === 'completed') {
            completedFocusMinutes += diff;
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }
  });

  const focusProgressPercentage = totalFocusMinutes > 0 
    ? Math.min(100, Math.round((completedFocusMinutes / totalFocusMinutes) * 100))
    : 0;

  let focusTimeText = '0m';
  if (totalFocusMinutes > 0) {
    const hours = Math.floor(totalFocusMinutes / 60);
    const mins = totalFocusMinutes % 60;
    if (hours > 0 && mins > 0) {
      focusTimeText = `${hours}h ${mins}m`;
    } else if (hours > 0) {
      focusTimeText = `${hours}h`;
    } else {
      focusTimeText = `${mins}m`;
    }
  }

  return {
    focusTimeText,
    totalFocusMinutes,
    completedFocusMinutes,
    focusProgressPercentage,
  };
};
