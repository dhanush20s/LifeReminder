import { getDB } from '../connection';

export interface QuickAddShortcutItem {
  id: string;
  type: string;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  position: number;
  isActive: boolean;
}

export const DEFAULT_SHORTCUTS: QuickAddShortcutItem[] = [
  { id: 'qa_reminder', type: 'reminder', label: 'Reminder', iconName: 'Bell', iconColor: '#6366F1', bgColor: '#EEF2FF', position: 0, isActive: true },
  { id: 'qa_task', type: 'task', label: 'Task', iconName: 'CheckSquare', iconColor: '#10B981', bgColor: '#ECFDF5', position: 1, isActive: true },
  { id: 'qa_expense', type: 'expense', label: 'Expense', iconName: 'IndianRupee', iconColor: '#EF4444', bgColor: '#FEF2F2', position: 2, isActive: true },
  { id: 'qa_bill', type: 'bill', label: 'Bill', iconName: 'CreditCard', iconColor: '#F59E0B', bgColor: '#FFFBEB', position: 3, isActive: true },
  { id: 'qa_note', type: 'note', label: 'Note', iconName: 'Edit3', iconColor: '#3B82F6', bgColor: '#EFF6FF', position: 4, isActive: true },
  { id: 'qa_checklist', type: 'checklist', label: 'Checklist', iconName: 'ListChecks', iconColor: '#8B5CF6', bgColor: '#F5F3FF', position: 5, isActive: false },
  { id: 'qa_borrow', type: 'borrow', label: 'Borrow', iconName: 'HandHandshake', iconColor: '#EC4899', bgColor: '#FDF2F8', position: 6, isActive: false },
  { id: 'qa_expiry', type: 'expiry', label: 'Expiry', iconName: 'ShieldAlert', iconColor: '#F97316', bgColor: '#FFEDD5', position: 7, isActive: false },
  { id: 'qa_subscription', type: 'subscription', label: 'Subscription', iconName: 'Zap', iconColor: '#06B6D4', bgColor: '#ECFEFF', position: 8, isActive: false },
  { id: 'qa_inbox', type: 'inbox', label: 'Brain Dump', iconName: 'Brain', iconColor: '#64748B', bgColor: '#F1F5F9', position: 9, isActive: false },
];

export const quickAddRepository = {
  async getActiveShortcuts(): Promise<QuickAddShortcutItem[]> {
    try {
      const db = await getDB();
      const [results] = await db.executeSql(
        'SELECT * FROM quick_add_shortcuts WHERE is_active = 1 ORDER BY position ASC;'
      );

      const items: QuickAddShortcutItem[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        items.push({
          id: row.id,
          type: row.type,
          label: row.label,
          iconName: row.icon_name,
          iconColor: row.icon_color,
          bgColor: row.bg_color,
          position: row.position,
          isActive: Boolean(row.is_active),
        });
      }
      return items.length > 0 ? items : DEFAULT_SHORTCUTS.filter((s) => s.isActive);
    } catch (err) {
      console.warn('Failed to fetch active quick add shortcuts from SQLite:', err);
      return DEFAULT_SHORTCUTS.filter((s) => s.isActive);
    }
  },

  async getAvailableShortcuts(): Promise<QuickAddShortcutItem[]> {
    try {
      const db = await getDB();
      const [results] = await db.executeSql(
        'SELECT * FROM quick_add_shortcuts WHERE is_active = 0 ORDER BY position ASC;'
      );

      const items: QuickAddShortcutItem[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        items.push({
          id: row.id,
          type: row.type,
          label: row.label,
          iconName: row.icon_name,
          iconColor: row.icon_color,
          bgColor: row.bg_color,
          position: row.position,
          isActive: Boolean(row.is_active),
        });
      }
      return items;
    } catch (err) {
      console.warn('Failed to fetch available quick add shortcuts from SQLite:', err);
      return DEFAULT_SHORTCUTS.filter((s) => !s.isActive);
    }
  },

  async saveShortcutsOrder(
    activeItems: QuickAddShortcutItem[],
    removedItems: QuickAddShortcutItem[] = []
  ): Promise<void> {
    try {
      const db = await getDB();
      await db.transaction((tx) => {
        // Mark all active items with their new position
        activeItems.forEach((item, index) => {
          tx.executeSql(
            `UPDATE quick_add_shortcuts SET is_active = 1, position = ? WHERE id = ?;`,
            [index, item.id]
          );
        });

        // Mark all removed items as inactive
        removedItems.forEach((item, index) => {
          tx.executeSql(
            `UPDATE quick_add_shortcuts SET is_active = 0, position = ? WHERE id = ?;`,
            [activeItems.length + index, item.id]
          );
        });
      });
    } catch (err) {
      console.error('Failed to save quick add shortcuts order:', err);
    }
  },
};
