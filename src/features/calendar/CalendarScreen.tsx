import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Platform, StatusBar } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { colors, spacing, radii, typography } from '../../theme';
import { LifeItemRow } from '../../components/LifeItemRow';
import { setViewMode, setActiveFilter } from '../../store/slices/calendarSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react-native';

export const CalendarScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.lifeItems);
  const { viewMode, activeFilter } = useAppSelector((state) => state.calendar);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Reminders', value: 'reminder' },
    { label: 'Bills', value: 'bill' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Checklists', value: 'checklist' },
    { label: 'Expiry', value: 'expiry' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeFilter !== 'all' && item.type !== activeFilter) return false;
    return true;
  });

  const selectedDayItems = filteredItems.filter(
    (item) => item.startAt && isSameDay(parseISO(item.startAt), selectedDate)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Unified Calendar</Text>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
            onPress={() => dispatch(setViewMode('month'))}
          >
            <CalendarIcon size={18} color={viewMode === 'month' ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'agenda' && styles.toggleBtnActive]}
            onPress={() => dispatch(setViewMode('agenda'))}
          >
            <List size={18} color={viewMode === 'agenda' ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Filter Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, activeFilter === opt.value && styles.filterChipActive]}
            onPress={() => dispatch(setActiveFilter(opt.value as any))}
          >
            <Text style={[styles.filterChipText, activeFilter === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {viewMode === 'month' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Month Header */}
          <View style={styles.monthSelector}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            >
              <ChevronLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            >
              <ChevronRight size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Month Grid */}
          <View style={styles.grid}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekdayHeader}>{day}</Text>
            ))}
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayItems = filteredItems.filter(
                (it) => it.startAt && isSameDay(parseISO(it.startAt), day)
              );
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {format(day, 'd')}
                  </Text>
                  {dayItems.length > 0 && (
                    <View style={[styles.eventDot, isSelected && styles.eventDotSelected]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Header */}
          <View style={styles.selectedDayHeader}>
            <Text style={styles.selectedDayTitle}>{format(selectedDate, 'EEEE, MMMM d')}</Text>
          </View>

          {/* Items for selected date */}
          <View style={styles.dayItemsList}>
            {selectedDayItems.length > 0 ? (
              selectedDayItems.map((item) => (
                <LifeItemRow key={item.id} item={item} />
              ))
            ) : (
              <Text style={styles.emptyDayText}>No items scheduled for this day.</Text>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Agenda View */
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.agendaList}
          renderItem={({ item }) => <LifeItemRow item={item} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.default,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 8 : spacing.default,
    paddingBottom: spacing.default,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.field,
    padding: 3,
  },
  toggleBtn: {
    padding: spacing.small,
    borderRadius: radii.field - 3,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
  },
  filterScroll: {
    paddingHorizontal: spacing.default,
    marginBottom: spacing.compact,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.secondary,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.default,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.compact,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekdayHeader: {
    width: '14.28%',
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.small,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.small,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  selectedDayHeader: {
    marginTop: spacing.section,
    marginBottom: spacing.compact,
  },
  selectedDayTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  dayItemsList: {
    paddingBottom: 110,
  },
  emptyDayText: {
    ...typography.secondary,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  agendaList: {
    padding: spacing.default,
    paddingBottom: 110,
  },
});
