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
  const displayItems = items.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Today</Text>
        </View>
        <Text style={styles.itemCountText}>{items.length} items</Text>
      </View>

      {/* Main Single White Card Container */}
      <View style={styles.cardContainer}>
        {displayItems.length > 0 ? (
          displayItems.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const timeStr = item.startAt
              ? new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '10:00 AM';

            const isLast = idx === displayItems.length - 1;

            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Time Column */}
                <Text style={[styles.timeText, isCompleted && styles.completedTimeText]}>
                  {timeStr}
                </Text>

                {/* Timeline Connector Line & Dot */}
                <View style={styles.timelineCol}>
                  <View style={[styles.timelineDot, isCompleted && styles.completedDot]} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Checkbox Toggle Button */}
                <TouchableOpacity
                  style={styles.checkBtn}
                  onPress={() => onToggleComplete(item)}
                  activeOpacity={0.7}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={22} color={colors.success} fill={colors.success} />
                  ) : (
                    <Circle size={22} color={colors.primary} strokeWidth={1.8} />
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
                    {item.categoryName || 'General'} {isCompleted ? '· Completed' : ''}
                  </Text>
                </TouchableOpacity>

                {/* Right Bell / Alarm Icon */}
                <TouchableOpacity onPress={() => onItemPress(item.id)} style={styles.bellTouch}>
                  {idx === 0 ? (
                    <AlarmClock size={16} color={colors.primary} />
                  ) : (
                    <Bell size={16} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Sparkles size={24} color={colors.primary} />
            <Text style={styles.emptyText}>Your schedule for today is completely clear!</Text>
          </View>
        )}

        {/* Bottom CTA Strip */}
        <TouchableOpacity style={styles.addStrip} onPress={onAddPress} activeOpacity={0.8}>
          <View style={styles.addStripLeft}>
            <View style={styles.sparkleIconBox}>
              <Sparkles size={14} color={colors.primary} />
            </View>
            <Text style={styles.addStripText}>Add something to your today</Text>
          </View>
          <ChevronRight size={16} color={colors.primary} />
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
    color: colors.textPrimary,
  },
  itemCountText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.primary,
    width: 60,
  },
  completedTimeText: {
    color: colors.success,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.small,
  },
  timelineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  completedDot: {
    backgroundColor: colors.success,
  },
  timelineLine: {
    position: 'absolute',
    top: 7,
    bottom: -22,
    width: 1.5,
    backgroundColor: colors.divider,
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
    color: colors.textPrimary,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemCategory: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  completedCategory: {
    color: colors.success,
  },
  bellTouch: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.default,
  },
  emptyText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.small,
  },
  addStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    marginTop: spacing.small,
  },
  addStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIconBox: {
    marginRight: spacing.small,
  },
  addStripText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
