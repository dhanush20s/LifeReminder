import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
import { store } from './src/store/store';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { navigationRef, navigate } from './src/app/navigation/navigationRef';
import { initDatabase } from './src/database/connection';
import { notificationService } from './src/services/notificationService';
import { reminderService } from './src/services/reminderService';
import { lifeItemRepository } from './src/database/repositories/lifeItemRepository';
import { fetchAllLifeItems } from './src/store/slices/lifeItemSlice';
import { AndroidAlarmModal } from './src/features/reminders/components/AndroidAlarmModal';
import { LifeItem } from './src/types/lifeItem';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  const [alarmItem, setAlarmItem] = useState<LifeItem | null>(null);
  const [alarmVisible, setAlarmVisible] = useState<boolean>(false);

  const handleOpenAlarmForId = async (id: string) => {
    try {
      const item = await lifeItemRepository.findById(id);
      if (item && item.status !== 'completed') {
        setAlarmItem(item);
        setAlarmVisible(true);
      }
    } catch (err) {
      console.warn('Error fetching alarm item:', err);
    }
  };

  useEffect(() => {
    // Initialize SQLite Database, Notification Channels & Reconcile Missed Reminders on launch
    const setupApp = async () => {
      try {
        await initDatabase();
        await notificationService.createChannels();
        await reminderService.reconcileReminderNotifications();
        store.dispatch(fetchAllLifeItems());

        // Check if app was opened from notification launch
        const initial = await notifee.getInitialNotification();
        if (initial?.notification?.data?.lifeItemId) {
          handleOpenAlarmForId(initial.notification.data.lifeItemId as string);
        }
      } catch (err) {
        console.error('App setup error:', err);
      }
    };
    setupApp();

    // Register Notifee foreground notification event listener
    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;
      const lifeItemId = notification?.data?.lifeItemId as string | undefined;

      if (lifeItemId) {
        if (type === EventType.ACTION_PRESS) {
          if (pressAction?.id === 'complete') {
            await reminderService.completeReminder(lifeItemId);
            store.dispatch(fetchAllLifeItems());
            setAlarmVisible(false);
          } else if (pressAction?.id === 'snooze') {
            await reminderService.snoozeReminder(lifeItemId, 10);
            store.dispatch(fetchAllLifeItems());
            setAlarmVisible(false);
          } else if (pressAction?.id === 'turn_off') {
            if (notification?.id) {
              await notifee.cancelNotification(notification.id);
            }
            setAlarmVisible(false);
          } else if (pressAction?.id === 'open' || pressAction?.id === 'open_alarm') {
            await handleOpenAlarmForId(lifeItemId);
          }
        } else if (type === EventType.DELIVERED || type === EventType.PRESS) {
          await handleOpenAlarmForId(lifeItemId);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCompleteAlarm = async (item: LifeItem) => {
    setAlarmVisible(false);
    await reminderService.completeReminder(item.id);
    store.dispatch(fetchAllLifeItems());
  };

  const handleSnoozeAlarm = async (item: LifeItem, snoozeMinutes: number) => {
    setAlarmVisible(false);
    await reminderService.snoozeReminder(item.id, snoozeMinutes);
    store.dispatch(fetchAllLifeItems());
  };

  const handleTurnOffAlarm = (item: LifeItem) => {
    setAlarmVisible(false);
  };

  const handleOpenDetails = (item: LifeItem) => {
    setAlarmVisible(false);
    navigate('LifeItemDetail', { id: item.id });
  };

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <RootNavigator />
        <AndroidAlarmModal
          visible={alarmVisible}
          item={alarmItem}
          onComplete={handleCompleteAlarm}
          onSnooze={handleSnoozeAlarm}
          onTurnOff={handleTurnOffAlarm}
          onOpen={handleOpenDetails}
        />
      </NavigationContainer>
    </Provider>
  );
}

export default App;
