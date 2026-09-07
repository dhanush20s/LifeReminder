import { getDB } from '../connection';
import { format } from 'date-fns';

export interface DailyFocus {
  id: string;
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export const dailyFocusRepository = {
  /**
   * Get active Daily Focus for today's date (yyyy-MM-dd).
   * Automatically returns null for a new day unless set.
   */
  async getTodayFocus(): Promise<string | null> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const db = await getDB();

    const [results] = await db.executeSql(
      `SELECT text FROM daily_focus WHERE date = ? AND text != '';`,
      [todayStr]
    );

    if (results.rows.length > 0) {
      return results.rows.item(0).text;
    }
    return null;
  },

  /**
   * Upsert (create or update) focus text for today's date.
   */
  async saveFocus(text: string): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const nowIso = new Date().toISOString();
    const db = await getDB();
    const id = `focus_${todayStr}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO daily_focus (id, date, text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      [id, todayStr, text.trim(), nowIso, nowIso]
    );
  },

  /**
   * Clear focus text for today's date.
   */
  async clearFocus(): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const db = await getDB();
    await db.executeSql(`DELETE FROM daily_focus WHERE date = ?;`, [todayStr]);
  },
};
