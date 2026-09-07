import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  themeMode: 'system' | 'light' | 'dark';
  appLockEnabled: boolean;
  notificationsEnabled: boolean;
  weatherEnabled: boolean;
}

const initialState: SettingsState = {
  themeMode: 'light',
  appLockEnabled: false,
  notificationsEnabled: true,
  weatherEnabled: false, // Default: OFF
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<'system' | 'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    setAppLockEnabled(state, action: PayloadAction<boolean>) {
      state.appLockEnabled = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setWeatherEnabled(state, action: PayloadAction<boolean>) {
      state.weatherEnabled = action.payload;
    },
  },
});

export const { 
  setThemeMode, 
  setAppLockEnabled, 
  setNotificationsEnabled,
  setWeatherEnabled
} = settingsSlice.actions;

export default settingsSlice.reducer;
