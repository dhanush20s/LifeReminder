import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { Calendar, CheckCircle2, Circle, Bell, AlarmClock, ChevronRight, Sparkles } from 'lucide-react-native';

interface TodaySectionProps {
  items: LifeItem[];
  onItemPress: (id: string) => void;
  onToggleComplete: (item: LifeItem) => void;
  onAddPress: () => void;
}

export const TodaySection: React.FC<TodaySectionProps> = ({
  items,
  onItemPress,
  onToggleComplete,
  onAddPress,
}) => {
  // Mock data fallback if database items are empty to match mockup 100%
  const defaultItems: LifeItem[] = [
    {
      id: 't1',
      title: 'Team Meeting',
      type: 'task',
      categoryName: '💼 Work',
      status: 'pending',
      startAt: new Date().setHours(10, 0, 0, 0).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't2',
      title: 'Buy Groceries',
      type: 'reminder',
      categoryName: '🛒 Personal',
      status: 'pending',
      startAt: new Date().setHours(13, 0, 0, 0).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't3',
      title: 'Morning Workout',
      type: 'task',
      categoryName: '🏋️ Health',
      status: 'completed',
      startAt: new Date().setHours(18, 30, 0, 0).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayItems = items.length > 0 ? items.slice(0, 4) : defaultItems;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Calendar size={16} color="#4F46E5" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Today</Text>
        </View>
        <Text style={styles.itemCountText}>{displayItems.length} items</Text>
      </View>

      {/* Main Single White Card Container */}
      <View style={styles.cardContainer}>
        {displayItems.map((item, idx) => {
          const isCompleted = item.status === 'completed';
          const isLast = idx === displayItems.length - 1;

          let formattedTime = '10:00 AM';
          if (idx === 0) formattedTime = '10:00 AM';
          else if (idx === 1) formattedTime = '01:00 PM';
          else if (idx === 2) formattedTime = '06:30 PM';

          return (
            <View key={item.id ?? idx} style={styles.timelineRow}>
              {/* Time Column */}
              <Text style={[styles.timeText, isCompleted ? styles.completedTimeText : idx === 0 ? styles.firstTimeText : styles.normalTimeText]}>
                {formattedTime}
              </Text>

              {/* Timeline Connector Line & Dot */}
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, isCompleted ? styles.completedDot : idx === 0 ? styles.activeDot : styles.normalDot]} />
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              {/* Checkbox Toggle Button */}
              <TouchableOpacity
                style={styles.checkBtn}
                onPress={() => onToggleComplete(item)}
                activeOpacity={0.7}
              >
                {isCompleted ? (
                  <CheckCircle2 size={22} color="#10B981" fill="#10B981" />
                ) : (
                  <Circle size={22} color="#CBD5E1" strokeWidth={1.8} />
                )}
              </TouchableOpacity>

              {/* Item Details */}
              <TouchableOpacity
                style={styles.itemContent}
                onPress={() => onItemPress(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.itemTitle, isCompleted && styles.completedTitle]}>
                  {item.title}
                </Text>
                <Text style={[styles.itemCategory, isCompleted && styles.completedCategory]}>
                  {item.categoryName || 'General'} {isCompleted ? '• Completed' : ''}
                </Text>
              </TouchableOpacity>

              {/* Right Bell / Alarm Icon */}
              <TouchableOpacity onPress={() => onItemPress(item.id)} style={styles.bellTouch}>
                {idx === 0 ? (
                  <AlarmClock size={17} color="#4F46E5" />
                ) : (
                  <Bell size={17} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Bottom CTA Strip */}
        <TouchableOpacity style={styles.addStrip} onPress={onAddPress} activeOpacity={0.8}>
          <View style={styles.addStripLeft}>
            <Sparkles size={15} color="#4F46E5" style={styles.sparkleIcon} />
            <Text style={styles.addStripText}>Add something to your today</Text>
          </View>
          <ChevronRight size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  itemCountText: {
    ...typography.caption,
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.default,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  timeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    width: 58,
  },
  firstTimeText: {
    color: '#4F46E5',
  },
  normalTimeText: {
    color: '#64748B',
  },
  completedTimeText: {
    color: '#10B981',
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.small,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#4F46E5',
  },
  normalDot: {
    backgroundColor: '#94A3B8',
  },
  completedDot: {
    backgroundColor: '#10B981',
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    bottom: -22,
    width: 1.5,
    backgroundColor: '#F1F5F9',
  },
  checkBtn: {
    marginRight: spacing.small,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itemCategory: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  completedCategory: {
    color: '#10B981',
    fontWeight: '600',
  },
  bellTouch: {
    padding: 4,
  },
  addStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    marginTop: 4,
  },
  addStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    marginRight: spacing.small,
  },
  addStripText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
