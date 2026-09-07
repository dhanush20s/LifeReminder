import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { Bell, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onNotificationPress, onProfilePress }) => {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Logan';
    if (hour < 17) return 'Good afternoon, Logan';
    return 'Good evening, Logan';
  };

  const currentDateStr = format(new Date(), 'EEEE, MMMM dd');

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.greetingText}>{getGreeting()} 👋</Text>
        <Text style={styles.titleText}>
          You’re making <Text style={styles.highlightText}>progress</Text> today.
        </Text>

        <View style={styles.dateRow}>
          <Calendar size={13} color="#64748B" style={styles.calendarIcon} />
          <Text style={styles.dateText}>{currentDateStr}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Notification Bell Button */}
        <TouchableOpacity style={styles.bellBtn} onPress={onNotificationPress} activeOpacity={0.8}>
          <Bell size={19} color="#0F172A" />
          <View style={styles.redBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* User Profile Avatar with Online Dot */}
        <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress} activeOpacity={0.8}>
          <Image
            source={require('../../../assets/logan-avatar.png')}
            style={styles.avatarImg}
          />
          <View style={styles.greenOnlineDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.default,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 6 : spacing.small,
  },
  leftCol: {
    flex: 1,
    paddingRight: spacing.compact,
  },
  greetingText: {
    ...typography.secondary,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  titleText: {
    ...typography.heading,
    fontSize: 22,
    color: '#0F172A',
    marginTop: 2,
    fontWeight: '800',
    lineHeight: 28,
  },
  highlightText: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  calendarIcon: {
    marginRight: 5,
  },
  dateText: {
    ...typography.caption,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.compact,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  redBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  greenOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
