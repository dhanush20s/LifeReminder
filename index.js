/**
 * @format
 */

import './src/utils/uuid';
import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { reminderService } from './src/services/reminderService';

// Handle background notification action buttons (Complete, Snooze, Turn Off)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  const lifeItemId = notification?.data?.lifeItemId;

  if (type === EventType.ACTION_PRESS && lifeItemId) {
    if (pressAction?.id === 'complete') {
      await reminderService.completeReminder(lifeItemId);
    } else if (pressAction?.id === 'snooze') {
      await reminderService.snoozeReminder(lifeItemId, 10);
    } else if (pressAction?.id === 'turn_off') {
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    }
  }
});

AppRegistry.registerComponent(appName, () => App);

