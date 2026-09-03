jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@notifee/react-native', () => ({
  requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  createChannel: jest.fn().mockResolvedValue('life_reminders'),
  createTriggerNotification: jest.fn().mockResolvedValue('notif_123'),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  TriggerType: { TIMESTAMP: 0 },
  AndroidImportance: { HIGH: 4 },
  AndroidCategory: { ALARM: 'alarm', REMINDER: 'reminder' },
}));

jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn().mockResolvedValue({
    executeSql: jest.fn().mockResolvedValue([{ rows: { length: 0, item: () => ({}) } }]),
    transaction: jest.fn(),
  }),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        return (props) => React.createElement(View, props);
      },
    }
  );
});
