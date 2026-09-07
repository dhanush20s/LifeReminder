import notifee, { TriggerType, AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

export const notificationService = {
  async requestPermissions(): Promise<{ granted: boolean }> {
    const settings = await notifee.requestPermission();
    const granted = settings.authorizationStatus >= 1;
    return { granted };
  },

  async createChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'life_reminders',
        name: 'Life Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });

      await notifee.createChannel({
        id: 'checklist_alarms',
        name: 'Checklist Alarms',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }
  },

  async registerReminderCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await notifee.setNotificationCategories([
        {
          id: 'life_reminders',
          actions: [
            {
              id: 'complete',
              title: 'Complete',
            },
            {
              id: 'snooze',
              title: 'Snooze',
            },
            {
              id: 'open',
              title: 'Open',
              foreground: true,
            },
          ],
        },
      ]);
    }
  },

  async scheduleReminderNotification(params: {
    lifeItemId: string;
    title: string;
    body?: string;
    targetDate: Date;
    offsetMinutes?: number;
  }): Promise<{ notificationId: string; permissionGranted: boolean }> {
    await this.createChannels();
    await this.registerReminderCategories();
    const { granted } = await this.requestPermissions();

    const notificationId = `reminder_${params.lifeItemId}`;
    const offset = params.offsetMinutes || 0;

    // 1. Schedule Advance Notification (e.g. 15 mins before = 4:45 PM for a 5:00 PM reminder)
    if (offset > 0) {
      const advanceDate = new Date(params.targetDate.getTime() - offset * 60000);
      if (advanceDate.getTime() > Date.now()) {
        const advanceTrigger: any = {
          type: TriggerType.TIMESTAMP,
          timestamp: advanceDate.getTime(),
        };
        await notifee.createTriggerNotification(
          {
            id: `${notificationId}_advance`,
            title: `🔔 Upcoming Reminder (in ${offset} mins)`,
            body: params.title,
            data: {
              lifeItemId: params.lifeItemId,
              type: 'reminder_advance',
            },
            android: {
              channelId: 'life_reminders',
              smallIcon: 'ic_launcher',
              category: AndroidCategory.REMINDER,
              pressAction: {
                id: 'open',
                launchActivity: 'default',
              },
              actions: [
                { title: 'Open', pressAction: { id: 'open' } },
                { title: 'Turn Off', pressAction: { id: 'turn_off' } },
              ],
            },
            ios: {
              categoryId: 'life_reminders',
            },
          },
          advanceTrigger
        );
      }
    }

    // 2. Schedule Exact Time Alarm Notification (e.g. at exact 5:00 PM time)
    if (params.targetDate.getTime() > Date.now()) {
      const exactTrigger: any = {
        type: TriggerType.TIMESTAMP,
        timestamp: params.targetDate.getTime(),
        alarmManager: {
          allowWhileIdle: true,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: `⏰ REMINDER ALARM`,
          body: params.title,
          data: {
            lifeItemId: params.lifeItemId,
            type: 'reminder_alarm',
          },
          android: {
            channelId: 'checklist_alarms',
            smallIcon: 'ic_launcher',
            category: AndroidCategory.ALARM,
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
            fullScreenAction: {
              id: 'open_alarm',
              launchActivity: 'default',
            },
            pressAction: {
              id: 'open',
              launchActivity: 'default',
            },
            actions: [
              { title: 'Complete', pressAction: { id: 'complete' } },
              { title: 'Snooze 10m', pressAction: { id: 'snooze' } },
              { title: 'Turn Off', pressAction: { id: 'turn_off' } },
            ],
          },
          ios: {
            categoryId: 'life_reminders',
          },
        },
        exactTrigger
      );
    }

    return { notificationId, permissionGranted: granted };
  },

  async scheduleNotification(
    lifeItemId: string,
    title: string,
    body: string,
    targetDate: Date,
    channelId: string = 'life_reminders'
  ): Promise<{ notificationId: string; permissionGranted: boolean }> {
    await this.createChannels();
    await this.registerReminderCategories();
    const { granted } = await this.requestPermissions();

    const notificationId = `notif_${lifeItemId}`;
    if (targetDate.getTime() <= Date.now()) {
      return { notificationId, permissionGranted: granted };
    }

    const trigger: any = {
      type: TriggerType.TIMESTAMP,
      timestamp: targetDate.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title,
        body,
        data: {
          lifeItemId,
          type: 'general',
        },
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          category: AndroidCategory.REMINDER,
          pressAction: {
            id: 'open',
            launchActivity: 'default',
          },
        },
        ios: {
          categoryId: 'life_reminders',
        },
      },
      trigger
    );

    return { notificationId, permissionGranted: granted };
  },

  async displayImmediateNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    await this.createChannels();
    const { granted } = await this.requestPermissions();
    if (!granted) return;

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: 'life_reminders',
        smallIcon: 'ic_launcher',
        category: AndroidCategory.REMINDER,
        pressAction: {
          id: 'default',
        },
      },
    });
  },

  async cancelReminderNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      await notifee.cancelNotification(`${notificationId}_advance`);
    } catch (e) {
      console.warn('Error cancelling notification:', e);
    }
  },

  async cancelAll(): Promise<void> {
    await notifee.cancelAllNotifications();
  },
};

export default notificationService;
