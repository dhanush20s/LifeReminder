import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateLifeItemStatus, updateLifeItem, deleteLifeItem, fetchAllLifeItems } from '../../store/slices/lifeItemSlice';
import { fetchExpenses } from '../../store/slices/expenseSlice';
import {
  fetchShortcuts,
  removeShortcut,
  addShortcut,
  reorderShortcuts,
  persistShortcutsOrder,
} from '../../store/slices/quickAddSlice';
import { QuickAddShortcutItem } from '../../database/repositories/quickAddRepository';
import { homeDashboardService, HomeDashboardData } from './services/homeDashboardService';
import { colors, spacing, typography, radii } from '../../theme';
import { useHomeAnimations } from './hooks/useHomeAnimations';
import { useDayProgress } from './hooks/useDayProgress';
import { HomeHeader } from './components/HomeHeader';
import { TopWidgetRow } from './components/TopWidgetRow';
import { DailyInfoBar } from './components/DailyInfoBar';
import { QuickAddBar } from './components/QuickAddBar';
import { NeedsAttentionSection } from './components/NeedsAttentionSection';
import { TodaySection } from './components/TodaySection';
import { UpcomingSection } from './components/UpcomingSection';
import { LifeAtGlanceSection } from './components/LifeAtGlanceSection';
import { QuickAddManager, QuickAddType } from '../quickAdd/QuickAddManager';
import { LifeItem } from '../../types/lifeItem';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
  onOpenQuickAdd: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, onOpenQuickAdd }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const anim = useHomeAnimations();
  const { toggleItemComplete, refreshProgress } = useDayProgress();
  const { activeShortcuts, availableShortcuts } = useAppSelector((state) => state.quickAdd);

  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  const loadDashboardData = useCallback(async (shouldAnimate = false) => {
    try {
      if (isInitialMount.current) {
        setLoading(true);
      }
      setError(false);
      const dashData = await homeDashboardService.getDashboardData();
      setData(dashData);
      setLoading(false);
      if (shouldAnimate && isInitialMount.current) {
        anim.playEntranceAnimation();
        isInitialMount.current = false;
      }
    } catch (err) {
      console.error('Error loading home dashboard:', err);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchShortcuts());
      refreshProgress();
      loadDashboardData(true);
    }
  }, [isFocused, dispatch, loadDashboardData, refreshProgress]);

  const handleToggleCompleteToday = async (item: LifeItem) => {
    // Instant optimistic UI update for 0-latency UI
    if (data) {
      const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
      const updatedToday = data.todayItems.map((t) =>
        t.id === item.id ? { ...t, status: nextStatus } : t
      );
      setData({ ...data, todayItems: updatedToday });
    }

    // Process completion via useDayProgress hook (Redux Thunk + SQLite persistence)
    await toggleItemComplete(item);
    loadDashboardData(false);
  };

  const handleItemPress = (id: string) => {
    navigation.navigate('LifeItemDetail', { id });
  };

  const [activeQuickAddSheet, setActiveQuickAddSheet] = useState<QuickAddType>(null);

  const handleQuickAddType = (type: string) => {
    setActiveQuickAddSheet(type as QuickAddType);
  };

  const handleRemoveShortcut = (id: string) => {
    dispatch(removeShortcut(id));
  };

  const handleAddShortcut = (item: QuickAddShortcutItem) => {
    dispatch(addShortcut(item));
  };

  const handleReorderShortcuts = (fromIndex: number, toIndex: number) => {
    dispatch(reorderShortcuts({ fromIndex, toIndex }));
  };

  const handleSaveCustomization = () => {
    dispatch(persistShortcutsOrder({ active: activeShortcuts, available: availableShortcuts }));
  };

  const handleEditUpcoming = (id: string) => {
    navigation.navigate('EditLifeItem', { id });
  };

  const handleCompleteUpcoming = async (item: LifeItem) => {
    await dispatch(updateLifeItemStatus({ id: item.id, status: 'completed' })).unwrap();
    dispatch(fetchAllLifeItems());
    loadDashboardData(false);
  };

  const handleSnoozeUpcoming = async (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await dispatch(
      updateLifeItem({
        id,
        changes: { startAt: tomorrow.toISOString() },
      })
    ).unwrap();
    dispatch(fetchAllLifeItems());
    loadDashboardData(false);
  };

  const handleDeleteUpcoming = async (id: string) => {
    await dispatch(deleteLifeItem(id)).unwrap();
    dispatch(fetchAllLifeItems());
    loadDashboardData(false);
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <AlertTriangle size={32} color={colors.danger} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>Failed to load your dashboard data.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadDashboardData(true)} activeOpacity={0.8}>
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Section 1: Header */}
        <Animated.View style={anim.headerStyle}>
          <HomeHeader
            onNotificationPress={() => navigation.navigate('NeedsAttention')}
            onProfilePress={() => navigation.navigate('Settings')}
          />
        </Animated.View>

        {/* Section 2: Top Dual Hero Cards (DayProgressHero & NextUp Carousel) */}
        <Animated.View style={anim.topWidgetStyle}>
          <TopWidgetRow navigation={navigation} />
        </Animated.View>

        {/* Section 3: Daily Info Bar (Weather [Optional] / Focus Time, Daily Focus, Daily Streak) */}
        <Animated.View style={anim.quickAddStyle}>
          <DailyInfoBar navigation={navigation} />
        </Animated.View>

        {/* Section 4: Quick Add Bar */}
        <Animated.View style={anim.attentionStyle}>
          <QuickAddBar
            shortcuts={activeShortcuts}
            availableShortcuts={availableShortcuts}
            onSelectType={handleQuickAddType}
            onOpenQuickAdd={onOpenQuickAdd}
            onRemoveShortcut={handleRemoveShortcut}
            onAddShortcut={handleAddShortcut}
            onReorderShortcuts={handleReorderShortcuts}
            onSaveCustomization={handleSaveCustomization}
          />
        </Animated.View>

        {/* Section 5: Needs Attention */}
        <Animated.View style={anim.todayStyle}>
          <NeedsAttentionSection
            items={data.attentionItems}
            onItemPress={handleItemPress}
            onSeeAllPress={() => navigation.navigate('NeedsAttention')}
          />
        </Animated.View>

        {/* Section 6: Today Section */}
        <Animated.View style={anim.upcomingStyle}>
          <TodaySection
            items={data.todayItems}
            onItemPress={handleItemPress}
            onToggleComplete={handleToggleCompleteToday}
            onAddPress={onOpenQuickAdd}
          />
        </Animated.View>

        {/* Section 7: Upcoming Section */}
        <Animated.View style={anim.glanceStyle}>
          <UpcomingSection
            items={data.upcomingItems}
            onItemPress={handleItemPress}
            onSeeAllPress={() => navigation.navigate('CalendarTab')}
            onEditPress={handleEditUpcoming}
            onCompletePress={handleCompleteUpcoming}
            onSnoozePress={handleSnoozeUpcoming}
            onDeletePress={handleDeleteUpcoming}
          />
        </Animated.View>

        {/* Section 8: Life at a Glance */}
        <LifeAtGlanceSection
          monthlySpendingMinor={data.monthlySpendingMinor}
          upcomingBillsCount={data.upcomingBillsCount}
          inboxCount={data.inboxCount}
          onExpensesPress={() => navigation.navigate('Expenses')}
          onBillsPress={() => navigation.navigate('Bills')}
          onInboxPress={() => navigation.navigate('Inbox')}
        />
      </ScrollView>

      <QuickAddManager
        activeType={activeQuickAddSheet}
        onClose={() => setActiveQuickAddSheet(null)}
        onSelectAction={(type) => setActiveQuickAddSheet(type)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FE',
  },
  container: {
    paddingHorizontal: spacing.default,
    paddingBottom: 115,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.section,
  },
  errorTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.compact,
  },
  errorSub: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.default,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.pill,
  },
  retryBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.small,
  },
});
