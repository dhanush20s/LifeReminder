import { lifeItemRepository } from '../database/repositories/lifeItemRepository';
import { expenseRepository } from '../database/repositories/expenseRepository';
import { inboxRepository } from '../database/repositories/inboxRepository';
import { LifeItem, Expense, InboxItem } from '../types/lifeItem';
import Share from 'react-native-share';

export interface BackupPayload {
  app: 'LifeReminder';
  schemaVersion: number;
  exportedAt: string;
  data: {
    lifeItems: LifeItem[];
    expenses: Expense[];
    inboxItems: InboxItem[];
  };
}

export const backupService = {
  async generateBackupJSON(): Promise<string> {
    const lifeItems = await lifeItemRepository.findAll();
    const expenses = await expenseRepository.findAll();
    const inboxItems = await inboxRepository.findUnprocessed();

    const payload: BackupPayload = {
      app: 'LifeReminder',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        lifeItems,
        expenses,
        inboxItems,
      },
    };

    return JSON.stringify(payload, null, 2);
  },

  async exportBackup(): Promise<void> {
    const backupJson = await this.generateBackupJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `LifeReminder_Backup_${dateStr}.lrb`;

    try {
      await Share.open({
        title: 'Export Life Reminder Backup',
        filename,
        message: backupJson,
        type: 'application/json',
      });
    } catch (err) {
      console.log('Backup share dismissed:', err);
    }
  },

  async restoreFromJSON(jsonString: string): Promise<boolean> {
    try {
      const payload: BackupPayload = JSON.parse(jsonString);
      if (payload.app !== 'LifeReminder' || !payload.data) {
        throw new Error('Invalid backup file format');
      }

      // Restore Life Items
      for (const item of payload.data.lifeItems || []) {
        await lifeItemRepository.create(item);
      }

      // Restore Expenses
      for (const exp of payload.data.expenses || []) {
        await expenseRepository.create(exp);
      }

      // Restore Inbox Items
      for (const inbox of payload.data.inboxItems || []) {
        await inboxRepository.create(inbox.content);
      }

      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  },
};
