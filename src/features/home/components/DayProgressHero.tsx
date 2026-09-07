import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { 
  Zap, 
  MoreHorizontal, 
  ShoppingCart, 
  Clock, 
  ArrowRight, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import { LifeItem } from '../../../types/lifeItem';
import { format, parseISO } from 'date-fns';

interface DayProgressHeroProps {
  totalTodayItems: number;
  completedItems: number;
  remainingItems: number;
  percentage: number;
  motivationalMessage: string;
  isEmpty: boolean;
  nextUpItem?: LifeItem | null;
  onNextItemPress?: (id: string) => void;
}

export const DayProgressHero: React.FC<DayProgressHeroProps> = ({
  totalTodayItems,
  completedItems,
  remainingItems,
  percentage,
  motivationalMessage,
  isEmpty,
  nextUpItem,
  onNextItemPress,
}) => {
  // Animated Progress Value for smooth percentage transitions
  const progressAnim = useRef(new Animated.Value(percentage)).current;
  const messageOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth progress animation on count updates
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Subtle fade bounce on motivational message update
    Animated.sequence([
      Animated.timing(messageOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(messageOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [percentage, motivationalMessage]);

  const animatedPercentage = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Calculate step nodes for step progress bar
  const totalSteps = Math.max(totalTodayItems, 5);
  const stepNodes = Array.from({ length: totalSteps }, (_, i) => i);

  // Formatting Next Up Details
  const nextTitle = nextUpItem ? nextUpItem.title : 'Buy Groceries';
  let nextTimeStr = 'Today • 06:00 PM';
  if (nextUpItem && nextUpItem.startAt) {
    try {
      const parsed = parseISO(nextUpItem.startAt);
      nextTimeStr = `Today • ${format(parsed, 'hh:mm a')}`;
    } catch (e) {
      nextTimeStr = 'Today • 06:00 PM';
    }
  }

  return (
    <View style={styles.container}>
      {/* Left Hero Card: TODAY'S PROGRESS */}
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

      {/* Right Hero Card: NEXT UP */}
      <TouchableOpacity 
        style={styles.nextUpCard} 
        onPress={() => nextUpItem && onNextItemPress && onNextItemPress(nextUpItem.id)} 
        activeOpacity={0.9}
      >
        {/* Top Header Row */}
        <View style={styles.nextUpHeaderRow}>
          <View style={styles.nextUpTagRow}>
            <Zap size={13} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.nextUpTagText}>NEXT UP</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <MoreHorizontal size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Main Content Row */}
        <View style={styles.nextUpContentRow}>
          <View style={styles.cartIconBox}>
            <ShoppingCart size={18} color="#A5B4FC" />
          </View>
          <View style={styles.nextUpDetailsCol}>
            <Text style={styles.nextUpTitle} numberOfLines={1}>{nextTitle}</Text>
            <Text style={styles.nextUpTimeText} numberOfLines={1}>{nextTimeStr}</Text>
          </View>
        </View>

        {/* Footer Countdown Row */}
        <View style={styles.nextUpFooterRow}>
          <View style={styles.countdownRow}>
            <Clock size={13} color="#F472B6" style={{ marginRight: 4 }} />
            <Text style={styles.startsInLabel}>Starts in </Text>
            <Text style={styles.timerText}>2h 08m</Text>
          </View>

          <View style={styles.arrowCircleBtn}>
            <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.default,
  },
  // Left Progress Card Styling
  progressCard: {
    flex: 1,
    backgroundColor: '#F3F0FF',
    borderRadius: radii.card,
    padding: spacing.default,
    marginRight: spacing.small,
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
  // Right Next Up Card Styling
  nextUpCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: radii.card,
    padding: spacing.default,
    marginLeft: spacing.small,
    justifyContent: 'space-between',
    minHeight: 142,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextUpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextUpTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextUpTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  nextUpContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  cartIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nextUpDetailsCol: {
    flex: 1,
  },
  nextUpTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextUpTimeText: {
    ...typography.caption,
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 1,
  },
  nextUpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startsInLabel: {
    ...typography.caption,
    fontSize: 10,
    color: '#94A3B8',
  },
  timerText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#F472B6',
  },
  arrowCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
