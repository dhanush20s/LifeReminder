import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LifeItemType } from '../../types/lifeItem';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarState {
  selectedDateISO: string;
  viewMode: CalendarViewMode;
  activeFilter: LifeItemType | 'all';
}

const initialState: CalendarState = {
  selectedDateISO: new Date().toISOString(),
  viewMode: 'month',
  activeFilter: 'all',
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDateISO = action.payload;
    },
    setViewMode(state, action: PayloadAction<CalendarViewMode>) {
      state.viewMode = action.payload;
    },
    setActiveFilter(state, action: PayloadAction<LifeItemType | 'all'>) {
      state.activeFilter = action.payload;
    },
  },
});

export const { setSelectedDate, setViewMode, setActiveFilter } = calendarSlice.actions;
export default calendarSlice.reducer;
