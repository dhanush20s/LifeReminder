import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { getWeatherIfEnabled } from '../../../services/weather/weatherService';
import { WeatherData } from '../../../services/weather/weatherTypes';
import { dailyFocusRepository } from '../../../database/repositories/dailyFocusRepository';
import { activityDayRepository } from '../../../database/repositories/activityDayRepository';
import { selectFocusTimeStats } from '../selectors/homeSelectors';

export const useDailyInfoBar = () => {
  const { weatherEnabled } = useAppSelector((state) => state.settings);
  const focusStats = useAppSelector(selectFocusTimeStats);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [dailyFocus, setDailyFocus] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [focusSheetVisible, setFocusSheetVisible] = useState<boolean>(false);

  const refreshInfoBarData = useCallback(async () => {
    try {
      // 1. Weather (if enabled in settings)
      const weather = await getWeatherIfEnabled(weatherEnabled);
      setWeatherData(weather);

      // 2. Daily Focus (from SQLite)
      const focusText = await dailyFocusRepository.getTodayFocus();
      setDailyFocus(focusText);

      // 3. Daily Streak (from activity_days in SQLite)
      const streak = await activityDayRepository.calculateStreak();
      setStreakCount(streak);
    } catch (err) {
      console.warn('Error refreshing Daily Info Bar data:', err);
    }
  }, [weatherEnabled]);

  useEffect(() => {
    refreshInfoBarData();
  }, [refreshInfoBarData]);

  const openFocusSheet = () => setFocusSheetVisible(true);
  const closeFocusSheet = () => setFocusSheetVisible(false);

  const saveFocus = async (text: string) => {
    await dailyFocusRepository.saveFocus(text);
    setDailyFocus(text);
    closeFocusSheet();
  };

  const clearFocus = async () => {
    await dailyFocusRepository.clearFocus();
    setDailyFocus(null);
    closeFocusSheet();
  };

  return {
    weatherEnabled,
    weatherData,
    focusTimeText: focusStats.focusTimeText,
    completionPercentage: focusStats.focusProgressPercentage,
    dailyFocus,
    streakCount,
    focusSheetVisible,
    openFocusSheet,
    closeFocusSheet,
    saveFocus,
    clearFocus,
    refreshInfoBarData,
  };
};
