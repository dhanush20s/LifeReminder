import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { Calendar, MoreVertical, CreditCard, Shield, Stethoscope } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

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
  const displayItems = items.slice(0, 4);

  const getDatePillStyle = (item: LifeItem, idx: number) => {
    let dateLabel = 'UPCOMING';
    if (item.startAt) {
      try {
        const parsed = parseISO(item.startAt);
        dateLabel = format(parsed, 'MMM dd').toUpperCase();
      } catch (e) {
        dateLabel = 'UPCOMING';
      }
    }

    switch (idx % 3) {
      case 0:
        return { bg: '#EFF6FF', text: colors.primary, dateLabel };
      case 1:
        return { bg: '#FFFBEB', text: colors.warning, dateLabel };
      default:
        return { bg: '#FEF2F2', text: colors.danger, dateLabel };
    }
  };

  const getIcon = (type: string) => {
    const iconSize = 16;
    switch (type) {
      case 'bill':
      case 'subscription': return <CreditCard size={iconSize} color={colors.warning} />;
      case 'expiry': return <Shield size={iconSize} color={colors.danger} />;
      default: return <Stethoscope size={iconSize} color={colors.primary} />;
    }
  };

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
          <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {displayItems.length > 0 ? (
          displayItems.map((item, idx) => {
            const pillStyle = getDatePillStyle(item, idx);
            const isLast = idx === displayItems.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemBorder]}
                onPress={() => onItemPress(item.id)}
                activeOpacity={0.8}
              >
                {/* Date Badge Pill */}
                <View style={[styles.datePill, { backgroundColor: pillStyle.bg }]}>
                  <Text style={[styles.datePillText, { color: pillStyle.text }]}>
                    {pillStyle.dateLabel}
                  </Text>
                </View>

                {/* Type Icon */}
                <View style={styles.iconBox}>
                  {getIcon(item.type)}
                </View>

                {/* Details */}
                <View style={styles.detailsCol}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubText}>
                    {item.type.toUpperCase()} · {item.priority ? `${item.priority} priority` : 'Scheduled'}
                  </Text>
                </View>

                {/* Interactive 3-Dot Menu Button */}
                <TouchableOpacity onPress={() => handleOpenMenu(item)} style={styles.dotsTouch}>
                  <MoreVertical size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No upcoming items scheduled for this week.</Text>
        )}
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
  seeAllText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.default,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderBottomColor: colors.divider,
  },
  datePill: {
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    borderRadius: radii.small,
    marginRight: spacing.compact,
    minWidth: 54,
    alignItems: 'center',
  },
  datePillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
  },
  iconBox: {
    marginRight: spacing.compact,
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSubText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dotsTouch: {
    padding: 6,
  },
  emptyText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: spacing.default,
    textAlign: 'center',
  },
});
