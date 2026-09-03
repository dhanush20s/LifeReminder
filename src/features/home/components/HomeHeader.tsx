import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { Bell, User } from 'lucide-react-native';

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

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.greetingText}>{getGreeting()} 👋</Text>
        <Text style={styles.titleText}>Ready for a productive day?</Text>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity style={styles.bellBtn} onPress={onNotificationPress} activeOpacity={0.8}>
          <Bell size={18} color={colors.textPrimary} />
          <View style={styles.redBadgeDot} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <User size={18} color="#FFFFFF" />
          </View>
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
    alignItems: 'center',
    marginBottom: spacing.default,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 6 : spacing.small,
  },
  leftCol: {
    flex: 1,
    paddingRight: spacing.small,
  },
  greetingText: {
    ...typography.secondary,
    color: colors.textSecondary,
    fontSize: 13,
  },
  titleText: {
    ...typography.heading,
    fontSize: 21,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  greenOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
