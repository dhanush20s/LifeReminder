import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LifeItem } from '../types/lifeItem';
import { colors, spacing, radii, typography } from '../theme';
import { StatusBadge } from './StatusBadge';
import { 
  Bell, 
  CreditCard, 
  CheckSquare, 
  Hourglass, 
  PhoneCall, 
  DollarSign, 
  Package, 
  Handshake, 
  FileText,
  CheckCircle2,
  Circle
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

interface LifeItemRowProps {
  item: LifeItem;
  onPress?: (item: LifeItem) => void;
  onToggleComplete?: (item: LifeItem) => void;
}

export const LifeItemRow: React.FC<LifeItemRowProps> = ({ item, onPress, onToggleComplete }) => {
  const navigation = useNavigation<any>();
  const isCompleted = item.status === 'completed';

  const handleRowPress = () => {
    if (onPress) {
      onPress(item);
    } else {
      navigation.navigate('LifeItemDetail', { id: item.id });
    }
  };

  const getIconConfig = () => {
    const iconSize = 18;
    switch (item.type) {
      case 'reminder': 
        return { icon: <Bell size={iconSize} color={colors.primary} />, bg: colors.primaryLight };
      case 'bill':
      case 'subscription': 
        return { icon: <CreditCard size={iconSize} color={colors.warning} />, bg: colors.warningLight };
      case 'checklist': 
        return { icon: <CheckSquare size={iconSize} color={colors.accentTeal} />, bg: colors.accentTealLight };
      case 'expiry': 
        return { icon: <Hourglass size={iconSize} color={colors.danger} />, bg: colors.dangerLight };
      case 'follow_up': 
        return { icon: <PhoneCall size={iconSize} color={colors.accentPurple} />, bg: colors.accentPurpleLight };
      case 'expense': 
        return { icon: <DollarSign size={iconSize} color={colors.success} />, bg: colors.successLight };
      case 'inventory': 
        return { icon: <Package size={iconSize} color={colors.accentOrange} />, bg: colors.accentOrangeLight };
      case 'borrow': 
        return { icon: <Handshake size={iconSize} color={colors.info} />, bg: colors.infoLight };
      default: 
        return { icon: <FileText size={iconSize} color={colors.primary} />, bg: colors.primaryLight };
    }
  };

  const { icon, bg } = getIconConfig();

  const formattedTime = item.startAt 
    ? format(parseISO(item.startAt), 'MMM d · h:mm a') 
    : format(parseISO(item.createdAt), 'MMM d');

  return (
    <TouchableOpacity 
      style={[styles.card, isCompleted && styles.completedCard]} 
      onPress={handleRowPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.checkTouch} 
        onPress={() => onToggleComplete && onToggleComplete(item)}
      >
        {isCompleted ? (
          <CheckCircle2 size={22} color={colors.success} />
        ) : (
          <Circle size={22} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      <View style={[styles.iconPill, { backgroundColor: bg }]}>{icon}</View>

      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>

      {item.status === 'overdue' ? (
        <StatusBadge status="overdue" />
      ) : (
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type.replace('_', ' ')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.compact,
    paddingHorizontal: spacing.default,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  completedCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.borderLight,
  },
  checkTouch: {
    marginRight: spacing.compact,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.compact,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  timeText: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.small,
    paddingVertical: 3,
    borderRadius: radii.small,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
