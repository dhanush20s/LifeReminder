import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  themeMode: 'system' | 'light' | 'dark';
  appLockEnabled: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  themeMode: 'light',
  appLockEnabled: false,
  notificationsEnabled: true,
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
  },
});

export const { setThemeMode, setAppLockEnabled, setNotificationsEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
