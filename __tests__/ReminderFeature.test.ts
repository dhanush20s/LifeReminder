import { reminderService } from '../src/services/reminderService';
import { notificationService } from '../src/services/notificationService';
import { lifeItemRepository } from '../src/database/repositories/lifeItemRepository';
import { recurrenceService } from '../src/services/recurrenceService';
import notifee from '@notifee/react-native';

describe('Reminder Feature End-to-End Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('1. Reminder Creation & Scheduling', () => {
    it('should create reminder composite record in SQLite, schedule Notifee notification, and persist notificationId', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const mockItem = {
        id: 'item_rem_1',
        type: 'reminder',
        title: 'Team Sync Meeting',
        description: 'Discuss sprint goals',
        status: 'pending',
        priority: 'high',
        startAt: futureDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(lifeItemRepository, 'createReminderComposite').mockResolvedValue(mockItem as any);
      jest.spyOn(notificationService, 'scheduleReminderNotification').mockResolvedValue({
        notificationId: 'reminder_item_rem_1',
        permissionGranted: true,
      });
      jest.spyOn(lifeItemRepository, 'updateReminderNotificationId').mockResolvedValue();

      const result = await reminderService.createReminder({
        title: 'Team Sync Meeting',
        description: 'Discuss sprint goals',
        startAt: futureDate,
        priority: 'high',
        repeatFrequency: 'daily',
      });

      expect(lifeItemRepository.createReminderComposite).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Team Sync Meeting',
          description: 'Discuss sprint goals',
          priority: 'high',
        }),
        futureDate,
        'daily'
      );

      expect(notificationService.scheduleReminderNotification).toHaveBeenCalled();
      expect(lifeItemRepository.updateReminderNotificationId).toHaveBeenCalledWith('item_rem_1', 'reminder_item_rem_1');
      expect(result.lifeItem.id).toBe('item_rem_1');
      expect(result.notificationId).toBe('reminder_item_rem_1');
      expect(result.permissionGranted).toBe(true);
    });

    it('should throw error when title is empty or whitespace', async () => {
      await expect(
        reminderService.createReminder({
          title: '   ',
          startAt: new Date().toISOString(),
        })
      ).rejects.toThrow('Reminder title cannot be empty');
    });
  });

  describe('2. Notification Scheduling Logic', () => {
    it('should schedule trigger notification for future target date', async () => {
      const futureDate = new Date(Date.now() + 7200000);
      const res = await notificationService.scheduleReminderNotification({
        lifeItemId: 'rem_100',
        title: 'Water Plants',
        targetDate: futureDate,
      });

      expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'reminder_rem_100',
          title: '⏰ REMINDER ALARM',
          body: 'Water Plants',
        }),
        expect.objectContaining({
          timestamp: futureDate.getTime(),
        })
      );
      expect(res.notificationId).toBe('reminder_rem_100');
    });

    it('should not schedule trigger notification if target date is in the past', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      const res = await notificationService.scheduleReminderNotification({
        lifeItemId: 'rem_101',
        title: 'Past Task',
        targetDate: pastDate,
      });

      expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
      expect(res.notificationId).toBe('reminder_rem_101');
    });
  });

  describe('3. Non-Recurring Completion', () => {
    it('should mark status as completed and cancel active notification', async () => {
      const mockItem = { id: 'rem_200', title: 'Buy Groceries', status: 'pending' };
      const mockReminderDetails = { id: 'r_200', lifeItemId: 'rem_200', notificationId: 'reminder_rem_200' };

      jest.spyOn(lifeItemRepository, 'findById').mockResolvedValue(mockItem as any);
      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue(mockReminderDetails as any);
      jest.spyOn(lifeItemRepository, 'findRecurrenceRuleByLifeItemId').mockResolvedValue(null);
      jest.spyOn(notificationService, 'cancelReminderNotification').mockResolvedValue();
      jest.spyOn(lifeItemRepository, 'updateStatus').mockResolvedValue();

      const result = await reminderService.completeReminder('rem_200');

      expect(notificationService.cancelReminderNotification).toHaveBeenCalledWith('reminder_rem_200');
      expect(lifeItemRepository.updateStatus).toHaveBeenCalledWith('rem_200', 'completed');
      expect(result.isRecurringNext).toBe(false);
    });
  });

  describe('4. Recurring Series Next Occurrence', () => {
    it('should calculate next occurrence, update start_at time, and reschedule notification without completing item', async () => {
      const currentDate = new Date('2026-09-04T10:00:00.000Z');
      const mockItem = {
        id: 'rem_300',
        title: 'Daily Workout',
        status: 'pending',
        startAt: currentDate.toISOString(),
      };
      const mockReminderDetails = { id: 'r_300', lifeItemId: 'rem_300', notificationId: 'reminder_rem_300' };
      const mockRule = { id: 'rule_1', lifeItemId: 'rem_300', frequency: 'daily' as const, interval: 1, startDate: currentDate.toISOString() };

      jest.spyOn(lifeItemRepository, 'findById').mockResolvedValue(mockItem as any);
      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue(mockReminderDetails as any);
      jest.spyOn(lifeItemRepository, 'findRecurrenceRuleByLifeItemId').mockResolvedValue(mockRule as any);
      jest.spyOn(lifeItemRepository, 'updateReminderTime').mockResolvedValue();
      jest.spyOn(notificationService, 'scheduleReminderNotification').mockResolvedValue({
        notificationId: 'reminder_rem_300',
        permissionGranted: true,
      });

      const updateStatusSpy = jest.spyOn(lifeItemRepository, 'updateStatus').mockResolvedValue();

      const result = await reminderService.completeReminder('rem_300');

      expect(result.isRecurringNext).toBe(true);
      expect(result.nextDate).toBeDefined();
      expect(lifeItemRepository.updateReminderTime).toHaveBeenCalledWith('rem_300', expect.any(String));
      expect(updateStatusSpy).not.toHaveBeenCalledWith('rem_300', 'completed');
    });
  });

  describe('5. Snooze Functionality', () => {
    it('should add specified snooze minutes, update reminder time in SQLite, and reschedule notification', async () => {
      const mockItem = {
        id: 'rem_400',
        title: 'Doctor Appointment',
        status: 'pending',
        startAt: new Date().toISOString(),
      };
      const mockReminderDetails = { id: 'r_400', lifeItemId: 'rem_400', notificationId: 'reminder_rem_400' };

      jest.spyOn(lifeItemRepository, 'findById').mockResolvedValue(mockItem as any);
      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue(mockReminderDetails as any);
      jest.spyOn(lifeItemRepository, 'updateReminderTime').mockResolvedValue();
      jest.spyOn(notificationService, 'cancelReminderNotification').mockResolvedValue();
      jest.spyOn(notificationService, 'scheduleReminderNotification').mockResolvedValue({
        notificationId: 'reminder_rem_400',
        permissionGranted: true,
      });
      jest.spyOn(lifeItemRepository, 'updateReminderNotificationId').mockResolvedValue();

      const newDate = await reminderService.snoozeReminder('rem_400', 15);

      expect(notificationService.cancelReminderNotification).toHaveBeenCalledWith('reminder_rem_400');
      expect(lifeItemRepository.updateReminderTime).toHaveBeenCalledWith('rem_400', newDate.toISOString());
      expect(notificationService.scheduleReminderNotification).toHaveBeenCalled();
    });
  });

  describe('6. Updating & Editing Reminder', () => {
    it('should update SQLite record and reschedule notification on title/time changes', async () => {
      const initialItem = {
        id: 'rem_500',
        title: 'Old Title',
        status: 'pending',
        startAt: new Date(Date.now() + 3600000).toISOString(),
        priority: 'normal',
      };
      const updatedItem = {
        ...initialItem,
        title: 'New Updated Title',
        startAt: new Date(Date.now() + 7200000).toISOString(),
      };

      jest.spyOn(lifeItemRepository, 'findById')
        .mockResolvedValueOnce(initialItem as any)
        .mockResolvedValueOnce(updatedItem as any);

      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue({
        id: 'r_500',
        lifeItemId: 'rem_500',
        notificationId: 'reminder_rem_500',
      } as any);

      jest.spyOn(lifeItemRepository, 'update').mockResolvedValue();
      jest.spyOn(notificationService, 'cancelReminderNotification').mockResolvedValue();
      jest.spyOn(notificationService, 'scheduleReminderNotification').mockResolvedValue({
        notificationId: 'reminder_rem_500',
        permissionGranted: true,
      });

      const res = await reminderService.updateReminder('rem_500', {
        title: 'New Updated Title',
        startAt: updatedItem.startAt,
      });

      expect(lifeItemRepository.update).toHaveBeenCalledWith('rem_500', expect.objectContaining({
        title: 'New Updated Title',
      }));
      expect(notificationService.cancelReminderNotification).toHaveBeenCalledWith('reminder_rem_500');
      expect(res.title).toBe('New Updated Title');
    });
  });

  describe('7. Deletion & Archiving', () => {
    it('should cancel notification and delete from SQLite on deleteReminder', async () => {
      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue({
        id: 'r_600',
        lifeItemId: 'rem_600',
        notificationId: 'reminder_rem_600',
      } as any);
      jest.spyOn(notificationService, 'cancelReminderNotification').mockResolvedValue();
      jest.spyOn(lifeItemRepository, 'delete').mockResolvedValue();

      await reminderService.deleteReminder('rem_600');

      expect(notificationService.cancelReminderNotification).toHaveBeenCalledWith('reminder_rem_600');
      expect(lifeItemRepository.delete).toHaveBeenCalledWith('rem_600');
    });

    it('should cancel notification and archive item on archiveReminder', async () => {
      jest.spyOn(lifeItemRepository, 'findReminderByLifeItemId').mockResolvedValue({
        id: 'r_700',
        lifeItemId: 'rem_700',
        notificationId: 'reminder_rem_700',
      } as any);
      jest.spyOn(notificationService, 'cancelReminderNotification').mockResolvedValue();
      jest.spyOn(lifeItemRepository, 'archive').mockResolvedValue();

      await reminderService.archiveReminder('rem_700');

      expect(notificationService.cancelReminderNotification).toHaveBeenCalledWith('reminder_rem_700');
      expect(lifeItemRepository.archive).toHaveBeenCalledWith('rem_700');
    });
  });

  describe('8. Startup Notification Reconciliation', () => {
    it('should reschedule notifications for future pending reminders and update overdue status for past reminders', async () => {
      const futureTime = new Date(Date.now() + 3600000).toISOString();
      const pastTime = new Date(Date.now() - 3600000).toISOString();

      const pendingList = [
        {
          item: { id: 'rem_fut', title: 'Future Reminder', status: 'pending', startAt: futureTime } as any,
          reminder: { id: 'r_fut', lifeItemId: 'rem_fut', reminderOffsetMinutes: 0 } as any,
        },
        {
          item: { id: 'rem_past', title: 'Past Reminder', status: 'pending', startAt: pastTime } as any,
          reminder: { id: 'r_past', lifeItemId: 'rem_past', reminderOffsetMinutes: 0 } as any,
        },
      ];

      jest.spyOn(lifeItemRepository, 'findAllPendingReminders').mockResolvedValue(pendingList);
      jest.spyOn(notificationService, 'scheduleReminderNotification').mockResolvedValue({
        notificationId: 'reminder_rem_fut',
        permissionGranted: true,
      });
      jest.spyOn(lifeItemRepository, 'updateReminderNotificationId').mockResolvedValue();
      jest.spyOn(lifeItemRepository, 'updateStatus').mockResolvedValue();

      await reminderService.reconcileReminderNotifications();

      expect(notificationService.scheduleReminderNotification).toHaveBeenCalledWith(
        expect.objectContaining({ lifeItemId: 'rem_fut' })
      );
      expect(lifeItemRepository.updateStatus).toHaveBeenCalledWith('rem_past', 'overdue');
    });
  });

  describe('9. Recurrence Service Math', () => {
    it('should correctly calculate daily, weekly, monthly, and yearly next occurrences', () => {
      const baseDate = new Date('2026-09-04T10:00:00.000Z');

      const dailyNext = recurrenceService.calculateNextOccurrence({ frequency: 'daily', interval: 1, startDate: baseDate.toISOString() }, baseDate);
      expect(dailyNext.toISOString()).toBe('2026-09-05T10:00:00.000Z');

      const weeklyNext = recurrenceService.calculateNextOccurrence({ frequency: 'weekly', interval: 1, startDate: baseDate.toISOString() }, baseDate);
      expect(weeklyNext.toISOString()).toBe('2026-09-11T10:00:00.000Z');

      const monthlyNext = recurrenceService.calculateNextOccurrence({ frequency: 'monthly', interval: 1, startDate: baseDate.toISOString() }, baseDate);
      expect(monthlyNext.toISOString()).toBe('2026-10-04T10:00:00.000Z');

      const yearlyNext = recurrenceService.calculateNextOccurrence({ frequency: 'yearly', interval: 1, startDate: baseDate.toISOString() }, baseDate);
      expect(yearlyNext.toISOString()).toBe('2027-09-04T10:00:00.000Z');
    });
  });
});
