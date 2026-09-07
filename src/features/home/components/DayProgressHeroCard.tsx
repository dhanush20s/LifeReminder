import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { Check, ChevronRight, Sparkles } from 'lucide-react-native';

interface DayProgressHeroCardProps {
  totalTodayItems: number;
  completedItems: number;
  remainingItems: number;
  percentage: number;
  motivationalMessage: string;
  isEmpty: boolean;
}

export const DayProgressHeroCard: React.FC<DayProgressHeroCardProps> = ({
  totalTodayItems,
  completedItems,
  remainingItems,
  percentage,
  motivationalMessage,
  isEmpty,
}) => {
  const progressAnim = useRef(new Animated.Value(percentage)).current;
  const messageOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    Animated.sequence([
      Animated.timing(messageOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(messageOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [percentage, motivationalMessage]);

  const totalSteps = Math.max(totalTodayItems, 5);
  const stepNodes = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <View style={styles.progressCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardSectionLabel}>TODAY'S PROGRESS</Text>
          {isEmpty ? (
            <Text style={styles.emptyTitleText}>0 tasks today</Text>
          ) : (
            <Text style={styles.progressStatText}>
              <Text style={styles.boldCountText}>{completedItems}</Text> of {totalTodayItems} completed
            </Text>
          )}
        </View>

        {/* Donut Progress Ring */}
        <View style={styles.donutContainer}>
          <View style={styles.donutOuterRing}>
            <Text style={styles.donutPercentageText}>{percentage}%</Text>
          </View>
        </View>
      </View>

      {/* Dynamic Progress Bar or Step Nodes */}
      {isEmpty ? (
        <View style={styles.emptyBarContainer}>
          <Sparkles size={16} color="#6366F1" />
          <Text style={styles.emptyBarText}>Clear Schedule</Text>
        </View>
      ) : (
        <View style={styles.timelineNodeBar}>
          {stepNodes.slice(0, 5).map((idx) => {
            const isCompletedNode = idx < completedItems;
            const isCurrentNode = idx === completedItems;
            const isLastNode = idx === 4;

            return (
              <React.Fragment key={idx}>
                <View
                  style={[
                    styles.nodeDot,
                    isCompletedNode && styles.nodeDotCompleted,
                    isCurrentNode && styles.nodeDotCurrent,
                    !isCompletedNode && !isCurrentNode && styles.nodeDotPending,
                  ]}
                >
                  {isCompletedNode ? (
                    <Check size={9} color="#FFFFFF" strokeWidth={3} />
                  ) : isCurrentNode ? (
                    <ChevronRight size={10} color="#FFFFFF" strokeWidth={3} />
                  ) : null}
                </View>

                {!isLastNode && (
                  <View
                    style={[
                      styles.nodeLine,
                      isCompletedNode ? styles.nodeLineCompleted : styles.nodeLinePending,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      )}

      {/* Remaining Count Badge & Motivational Message */}
      <View style={styles.footerRow}>
        <Animated.Text style={[styles.encouragementText, { opacity: messageOpacity }]} numberOfLines={1}>
          {motivationalMessage}
        </Animated.Text>
        {!isEmpty && remainingItems > 0 && (
          <Text style={styles.remainingBadgeText}>({remainingItems} remaining)</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    flex: 1,
    backgroundColor: '#F3F0FF',
    borderRadius: radii.card,
    padding: spacing.default,
    borderWidth: 1,
    borderColor: '#E9E3FF',
    justifyContent: 'space-between',
    minHeight: 142,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardSectionLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  progressStatText: {
    ...typography.caption,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  boldCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyTitleText: {
    ...typography.caption,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutOuterRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3.5,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  donutPercentageText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  timelineNodeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  nodeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeDotCompleted: {
    backgroundColor: '#6366F1',
  },
  nodeDotCurrent: {
    backgroundColor: '#818CF8',
  },
  nodeDotPending: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  nodeLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 1,
  },
  nodeLineCompleted: {
    backgroundColor: '#6366F1',
  },
  nodeLinePending: {
    backgroundColor: '#CBD5E1',
  },
  emptyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.small,
    marginVertical: 4,
  },
  emptyBarText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  encouragementText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#6366F1',
    flex: 1,
  },
  remainingBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
  },
});
