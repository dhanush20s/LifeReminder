import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { initDatabase } from './src/database/connection';
import { notificationService } from './src/services/notificationService';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize SQLite Database and Notification Channels on app launch
    const setupApp = async () => {
      try {
        await initDatabase();
        await notificationService.createChannels();
      } catch (err) {
        console.error('App setup error:', err);
      }
    };
    setupApp();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}

export default App;
