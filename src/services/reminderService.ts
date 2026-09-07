import { lifeItemRepository } from '../database/repositories/lifeItemRepository';
import { notificationService } from './notificationService';
import { recurrenceService } from './recurrenceService';
import { LifeItem, LifeItemPriority, LifeItemStatus } from '../types/lifeItem';
import { addMinutes, parseISO, isPast } from 'date-fns';

export interface CreateReminderParams {
  title: string;
  description?: string;
  startAt: string; // ISO date string
  priority?: LifeItemPriority;
  categoryId?: string;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  offsetMinutes?: number;
}

export interface UpdateReminderParams {
  title?: string;
  description?: string;
  startAt?: string;
  priority?: LifeItemPriority;
  categoryId?: string;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  offsetMinutes?: number;
}

export const reminderService = {
  /**
   * Complete End-to-End Reminder Creation:
   * Validate -> SQLite Composite -> Schedule Notification -> Save notificationId -> Return result
   */
  async createReminder(params: CreateReminderParams): Promise<{
    lifeItem: LifeItem;
    notificationId?: string;
    permissionGranted: boolean;
  }> {
    if (!params.title || !params.title.trim()) {
      throw new Error('Reminder title cannot be empty');
    }

    const startAtISO = params.startAt;
    const targetDate = parseISO(startAtISO);

    // 1. Save Composite Item to SQLite
    const createdItem = await lifeItemRepository.createReminderComposite(
      {
        type: 'reminder',
        title: params.title.trim(),
        description: params.description?.trim() || undefined,
        categoryId: params.categoryId,
        status: 'pending',
        priority: params.priority || 'normal',
        startAt: startAtISO,
      },
      startAtISO,
      params.repeatFrequency
    );

    // 2. Schedule Local Notification via Notifee
    let notificationId: string | undefined = undefined;
    let permissionGranted = true;

    try {
      const result = await notificationService.scheduleReminderNotification({
        lifeItemId: createdItem.id,
        title: createdItem.title,
        body: createdItem.description || createdItem.title,
        targetDate,
        offsetMinutes: params.offsetMinutes || 0,
      });

      notificationId = result.notificationId;
      permissionGranted = result.permissionGranted;

      // 3. Save native notification identifier to SQLite
      if (notificationId) {
        await lifeItemRepository.updateReminderNotificationId(createdItem.id, notificationId);
      }
    } catch (err) {
      console.warn('Failed to schedule notification for reminder:', err);
    }

    return { lifeItem: createdItem, notificationId, permissionGranted };
  },

  /**
   * Edit Reminder & Synchronize SQLite + Notification
   */
  async updateReminder(id: string, params: UpdateReminderParams): Promise<LifeItem> {
    const existing = await lifeItemRepository.findById(id);
    if (!existing) {
      throw new Error(`Reminder ${id} not found`);
    }

    const reminderDetails = await lifeItemRepository.findReminderByLifeItemId(id);

    // 1. Update SQLite
    await lifeItemRepository.update(id, {
      title: params.title?.trim() || existing.title,
      description: params.description !== undefined ? params.description.trim() : existing.description,
      priority: params.priority || existing.priority,
      startAt: params.startAt || existing.startAt,
      categoryId: params.categoryId !== undefined ? params.categoryId : existing.categoryId,
    });

    const updatedItem = (await lifeItemRepository.findById(id))!;

    // 2. Reschedule notification if date or title changed
    if (reminderDetails?.notificationId) {
      await notificationService.cancelReminderNotification(reminderDetails.notificationId);
    }

    if (updatedItem.startAt && updatedItem.status === 'pending') {
      const targetDate = parseISO(updatedItem.startAt);
      try {
        const { notificationId } = await notificationService.scheduleReminderNotification({
          lifeItemId: updatedItem.id,
          title: updatedItem.title,
          body: updatedItem.description || updatedItem.title,
          targetDate,
          offsetMinutes: params.offsetMinutes || reminderDetails?.reminderOffsetMinutes || 0,
        });

        if (notificationId) {
          await lifeItemRepository.updateReminderNotificationId(updatedItem.id, notificationId);
        }
      } catch (err) {
        console.warn('Failed to reschedule updated reminder notification:', err);
      }
    }

    return updatedItem;
  },

  /**
   * Complete Action:
   * Handles recurring next occurrence OR marks status = completed, cancels notification
   */
  async completeReminder(id: string): Promise<{ isRecurringNext: boolean; nextDate?: string }> {
    const existing = await lifeItemRepository.findById(id);
    if (!existing) return { isRecurringNext: false };

    const reminderDetails = await lifeItemRepository.findReminderByLifeItemId(id);
    if (reminderDetails?.notificationId) {
      await notificationService.cancelReminderNotification(reminderDetails.notificationId);
    }

    // Check if recurring
    const recurrenceRule = await lifeItemRepository.findRecurrenceRuleByLifeItemId(id);

    if (recurrenceRule && existing.startAt) {
      // Recurring series: calculate next occurrence date, update start_at, reschedule
      const currentDate = parseISO(existing.startAt);
      const nextDate = recurrenceService.calculateNextOccurrence(recurrenceRule, currentDate);
      const nextDateISO = nextDate.toISOString();

      await lifeItemRepository.updateReminderTime(id, nextDateISO);

      // Reschedule for next occurrence
      try {
        const { notificationId } = await notificationService.scheduleReminderNotification({
          lifeItemId: id,
          title: existing.title,
          body: existing.description || existing.title,
          targetDate: nextDate,
          offsetMinutes: reminderDetails?.reminderOffsetMinutes || 0,
        });

        if (notificationId) {
          await lifeItemRepository.updateReminderNotificationId(id, notificationId);
        }
      } catch (err) {
        console.warn('Failed to schedule next recurring occurrence:', err);
      }

      return { isRecurringNext: true, nextDate: nextDateISO };
    } else {
      // Non-recurring: mark status completed
      await lifeItemRepository.updateStatus(id, 'completed');
      return { isRecurringNext: false };
    }
  },

  /**
   * Snooze Action:
   * Calculates new time (5m, 10m, 30m, 1h, 1440m/Tomorrow), cancels current notification,
   * schedules new notification, updates SQLite & returns new Date
   */
  async snoozeReminder(id: string, snoozeMinutes: number = 10): Promise<Date> {
    const existing = await lifeItemRepository.findById(id);
    if (!existing) {
      throw new Error(`Reminder ${id} not found`);
    }

    const reminderDetails = await lifeItemRepository.findReminderByLifeItemId(id);
    if (reminderDetails?.notificationId) {
      await notificationService.cancelReminderNotification(reminderDetails.notificationId);
    }

    // Calculate new target time from now (or original startAt if in future)
    const baseTime = existing.startAt && parseISO(existing.startAt) > new Date() ? parseISO(existing.startAt) : new Date();
    const newTargetDate = addMinutes(baseTime, snoozeMinutes);
    const newTargetISO = newTargetDate.toISOString();

    // Update SQLite
    await lifeItemRepository.updateReminderTime(id, newTargetISO);

    // Schedule new notification
    try {
      const { notificationId } = await notificationService.scheduleReminderNotification({
        lifeItemId: id,
        title: existing.title,
        body: existing.description || existing.title,
        targetDate: newTargetDate,
        offsetMinutes: 0,
      });

      if (notificationId) {
        await lifeItemRepository.updateReminderNotificationId(id, notificationId);
      }
    } catch (err) {
      console.warn('Failed to schedule snoozed notification:', err);
    }

    return newTargetDate;
  },

  /**
   * Delete Reminder:
   * Cancel notification & delete SQLite record
   */
  async deleteReminder(id: string): Promise<void> {
    const reminderDetails = await lifeItemRepository.findReminderByLifeItemId(id);
    if (reminderDetails?.notificationId) {
      await notificationService.cancelReminderNotification(reminderDetails.notificationId);
    }
    await lifeItemRepository.delete(id);
  },

  /**
   * Archive Reminder:
   * Cancel notification & mark archived in SQLite
   */
  async archiveReminder(id: string): Promise<void> {
    const reminderDetails = await lifeItemRepository.findReminderByLifeItemId(id);
    if (reminderDetails?.notificationId) {
      await notificationService.cancelReminderNotification(reminderDetails.notificationId);
    }
    await lifeItemRepository.archive(id);
  },

  /**
   * Missed Reminders & Startup Reconciliation:
   * Checks pending reminders in SQLite and reschedules missing active notifications
   */
  async reconcileReminderNotifications(): Promise<void> {
    try {
      const pendingList = await lifeItemRepository.findAllPendingReminders();
      const now = Date.now();

      for (const { item, reminder } of pendingList) {
        if (item.startAt) {
          const targetTime = parseISO(item.startAt).getTime();
          // If future scheduled item and notification_id missing or needs reconciliation
          if (targetTime > now) {
            const { notificationId } = await notificationService.scheduleReminderNotification({
              lifeItemId: item.id,
              title: item.title,
              body: item.description || item.title,
              targetDate: parseISO(item.startAt),
              offsetMinutes: reminder.reminderOffsetMinutes || 0,
            });

            if (notificationId) {
              await lifeItemRepository.updateReminderNotificationId(item.id, notificationId);
            }
          } else if (targetTime <= now && item.status === 'pending') {
            // Update overdue status in SQLite if time passed
            await lifeItemRepository.updateStatus(item.id, 'overdue');
          }
        }
      }
    } catch (err) {
      console.warn('Error in reconcileReminderNotifications:', err);
    }
  },
};

export default reminderService;
