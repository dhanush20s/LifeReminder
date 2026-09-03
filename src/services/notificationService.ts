import notifee, { TriggerType, AndroidImportance, AndroidCategory } from '@notifee/react-native';
import { Platform } from 'react-native';

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1; // Authorized or Provisional
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

  async scheduleNotification(
    id: string,
    title: string,
    body: string,
    targetDate: Date,
    channelId: 'life_reminders' | 'checklist_alarms' = 'life_reminders'
  ): Promise<string> {
    await this.createChannels();
    const hasPerms = await this.requestPermissions();
    if (!hasPerms) {
      console.warn('Notification permission not granted');
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: targetDate.getTime(),
    };

    return await notifee.createTriggerNotification(
      {
        id,
        title,
        body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Fallback icon
          category: channelId === 'checklist_alarms' ? AndroidCategory.ALARM : AndroidCategory.REMINDER,
          pressAction: {
            id: 'default',
          },
          actions:
            channelId === 'checklist_alarms'
              ? [
                  { title: 'Turn Off', pressAction: { id: 'stop_alarm' } },
                  { title: 'Open Checklist', pressAction: { id: 'open_checklist' } },
                ]
              : [
                  { title: 'Mark Complete', pressAction: { id: 'complete' } },
                  { title: 'Snooze', pressAction: { id: 'snooze' } },
                ],
        },
      },
      trigger
    );
  },

  async cancel(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  },

  async cancelAll(): Promise<void> {
    await notifee.cancelAllNotifications();
  },
};
