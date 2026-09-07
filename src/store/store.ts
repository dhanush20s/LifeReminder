import { configureStore } from '@reduxjs/toolkit';
import lifeItemReducer from './slices/lifeItemSlice';
import calendarReducer from './slices/calendarSlice';
import expenseReducer from './slices/expenseSlice';
import settingsReducer from './slices/settingsSlice';
import quickAddReducer from './slices/quickAddSlice';

export const store = configureStore({
  reducer: {
    lifeItems: lifeItemReducer,
    calendar: calendarReducer,
    expenses: expenseReducer,
    settings: settingsReducer,
    quickAdd: quickAddReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
