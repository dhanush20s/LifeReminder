import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { 
  Zap, 
  MoreHorizontal, 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  User, 
  Bell, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react-native';
import { RankedNextUpItem } from '../../../services/homePriorityService';

interface NextUpCardProps {
  item: RankedNextUpItem;
  index?: number;
  onPress: () => void;
  onMenuPress?: () => void;
}

export const NextUpCard: React.FC<NextUpCardProps> = ({ item, index = 0, onPress, onMenuPress }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 320,
      delay: index * 70, // Staggered horizontal slide animation
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: true,
    }).start();
  }, [item.id]);

  const animatedStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
      {
        scale: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  const getIcon = () => {
    const iconSize = 18;
    switch (item.type) {
      case 'bill':
      case 'subscription':
        return <CreditCard size={iconSize} color="#FDE68A" />;
      case 'expiry':
        return <Shield size={iconSize} color="#C4B5FD" />;
      case 'borrow':
        return <User size={iconSize} color="#FBCFE8" />;
      case 'task':
      case 'checklist':
        return <CheckSquare size={iconSize} color="#A7F3D0" />;
      case 'reminder':
        return <Bell size={iconSize} color="#A5B4FC" />;
      default:
        return <ShoppingCart size={iconSize} color="#A5B4FC" />;
    }
  };

  const getIconBoxBg = () => {
    switch (item.type) {
      case 'bill':
      case 'subscription':
        return 'rgba(245, 158, 11, 0.25)';
      case 'expiry':
        return 'rgba(139, 92, 246, 0.25)';
      case 'borrow':
        return 'rgba(236, 72, 153, 0.25)';
      case 'task':
      case 'checklist':
        return 'rgba(16, 185, 129, 0.25)';
      default:
        return 'rgba(99, 102, 241, 0.25)';
    }
  };

  const isOverdue = item.urgency === 'critical' && item.tagLabel === 'OVERDUE';

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={[
          styles.cardContainer,
          isOverdue && styles.overdueBorder
        ]} 
        onPress={onPress} 
        activeOpacity={0.9}
      >
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.tagRow}>
            {isOverdue ? (
              <AlertTriangle size={13} color="#EF4444" style={{ marginRight: 4 }} />
            ) : (
              <Zap size={13} color={item.tagColor} fill={item.tagColor} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tagLabel}</Text>
          </View>

          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.menuTouch}>
            <MoreHorizontal size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Main Content Row */}
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: getIconBoxBg() }]}>
            {getIcon()}
          </View>
          <View style={styles.detailsCol}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.dateStrText} numberOfLines={1}>{item.dateStr}</Text>
          </View>
        </View>

        {/* Footer Countdown / Relative Time Row */}
        <View style={styles.footerRow}>
          <View style={styles.relativeTimeRow}>
            <Clock size={13} color={isOverdue ? '#F87171' : '#F472B6'} style={{ marginRight: 4 }} />
            <Text style={[styles.relativeTimeText, isOverdue && styles.overdueText]}>
              {item.relativeTime}
            </Text>
          </View>

          <View style={styles.arrowCircleBtn}>
            <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 220,
    height: 142,
    backgroundColor: '#0F172A',
    borderRadius: radii.card,
    padding: spacing.default,
    marginRight: spacing.compact,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  overdueBorder: {
    borderColor: '#EF4444',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuTouch: {
    padding: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateStrText: {
    ...typography.caption,
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relativeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relativeTimeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#F472B6',
  },
  overdueText: {
    color: '#F87171',
  },
  arrowCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
