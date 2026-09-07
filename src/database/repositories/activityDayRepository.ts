import { getDB } from '../connection';
import { format, subDays, parseISO } from 'date-fns';

export const activityDayRepository = {
  /**
   * Recalculate completed items count for today and update activity_days table.
   */
  async updateActivityForToday(): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const nowIso = new Date().toISOString();
    const db = await getDB();

    // Count completed actionable items scheduled for today
    const [countResult] = await db.executeSql(
      `SELECT COUNT(*) as count FROM life_items 
       WHERE status = 'completed' 
         AND start_at LIKE ?;`,
      [`${todayStr}%`]
    );

    const completedCount = countResult.rows.length > 0 ? countResult.rows.item(0).count : 0;

    await db.executeSql(
      `INSERT OR REPLACE INTO activity_days (date, completed_items_count, created_at, updated_at)
       VALUES (?, ?, ?, ?);`,
      [todayStr, completedCount, nowIso, nowIso]
    );
  },

  /**
   * Calculate current streak count (consecutive active calendar days).
   */
  async calculateStreak(): Promise<number> {
    await this.updateActivityForToday();
    const db = await getDB();

    const [results] = await db.executeSql(
      `SELECT date, completed_items_count FROM activity_days 
       WHERE completed_items_count > 0 
       ORDER BY date DESC;`
    );

    if (results.rows.length === 0) {
      return 0;
    }

    const activeDatesSet = new Set<string>();
    for (let i = 0; i < results.rows.length; i++) {
      activeDatesSet.add(results.rows.item(i).date);
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    let streak = 0;
    let checkDate = today;

    // If today is not completed yet, start checking from yesterday so streak doesn't reset early in the day
    if (!activeDatesSet.has(todayStr)) {
      if (!activeDatesSet.has(yesterdayStr)) {
        return 0; // Missed yesterday and today -> streak 0
      }
      checkDate = subDays(today, 1);
    }

    // Count backwards consecutive days
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (activeDatesSet.has(dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  },
};
