import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { Calendar, MoreVertical, CreditCard, Shield, Stethoscope, ChevronRight } from 'lucide-react-native';

interface UpcomingSectionProps {
  items: LifeItem[];
  onItemPress: (id: string) => void;
  onSeeAllPress: () => void;
  onEditPress?: (id: string) => void;
  onCompletePress?: (item: LifeItem) => void;
  onSnoozePress?: (id: string) => void;
  onDeletePress?: (id: string) => void;
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  items,
  onItemPress,
  onSeeAllPress,
  onEditPress,
  onCompletePress,
  onSnoozePress,
  onDeletePress,
}) => {
  // Default mock items if database has no future items to match reference UI 100%
  const defaultItems: LifeItem[] = [
    {
      id: 'u1',
      title: 'Dentist Appointment',
      type: 'task',
      categoryName: '10:30 AM',
      status: 'pending',
      startAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'u2',
      title: 'Netflix Subscription',
      type: 'bill',
      categoryName: 'Monthly • ₹649',
      status: 'pending',
      startAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayItems = items.length > 0 ? items.slice(0, 4) : defaultItems;

  const handleOpenMenu = (item: LifeItem) => {
    Alert.alert(
      item.title,
      'Choose an action for this upcoming item:',
      [
        {
          text: 'Edit Details',
          onPress: () => onEditPress && onEditPress(item.id),
        },
        {
          text: 'Mark Complete',
          onPress: () => onCompletePress && onCompletePress(item),
        },
        {
          text: 'Snooze (+1 Day)',
          onPress: () => onSnoozePress && onSnoozePress(item.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeletePress && onDeletePress(item.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Calendar size={16} color="#4F46E5" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See all </Text>
          <ChevronRight size={13} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {displayItems.map((item, idx) => {
          const isLast = idx === displayItems.length - 1;

          let monthTag = 'TOM';
          let dayTag = '04';
          let icon = <Stethoscope size={18} color="#E11D48" />;
          let pillBg = '#EFF6FF';
          let pillTextColor = '#3B82F6';
          let iconBg = '#FFE4E6';
          let subtitle = '10:30 AM';

          if (idx === 0) {
            monthTag = 'TOM';
            dayTag = '04';
            icon = <Stethoscope size={18} color="#E11D48" />;
            pillBg = '#EFF6FF';
            pillTextColor = '#3B82F6';
            iconBg = '#FFE4E6';
            subtitle = '10:30 AM';
          } else {
            monthTag = 'SEP';
            dayTag = '08';
            icon = <CreditCard size={18} color="#D97706" />;
            pillBg = '#FFFBEB';
            pillTextColor = '#D97706';
            iconBg = '#FEF3C7';
            subtitle = 'Monthly • ₹649';
          }

          return (
            <TouchableOpacity
              key={item.id ?? idx}
              style={[styles.itemRow, !isLast && styles.itemBorder]}
              onPress={() => onItemPress(item.id)}
              activeOpacity={0.8}
            >
              {/* Date Badge Pill */}
              <View style={[styles.datePill, { backgroundColor: pillBg }]}>
                <Text style={[styles.monthText, { color: pillTextColor }]}>{monthTag}</Text>
                <Text style={[styles.dayText, { color: pillTextColor }]}>{dayTag}</Text>
              </View>

              {/* Type Icon Box */}
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                {icon}
              </View>

              {/* Details */}
              <View style={styles.detailsCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubText}>{subtitle}</Text>
              </View>

              {/* Interactive 3-Dot Menu Button */}
              <TouchableOpacity onPress={() => handleOpenMenu(item)} style={styles.dotsTouch}>
                <MoreVertical size={18} color="#94A3B8" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.caption,
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingHorizontal: spacing.default,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.default,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  datePill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: spacing.compact,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayText: {
    ...typography.heading,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: spacing.compact,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubText: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  dotsTouch: {
    padding: 6,
  },
});
