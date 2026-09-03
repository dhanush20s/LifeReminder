import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../theme';

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'overdue' | 'cancelled' | 'archived' | 'critical' | 'high' | 'medium';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let badgeBg = colors.infoLight;
  let textColor = colors.info;
  let defaultLabel = status;

  switch (status) {
    case 'overdue':
    case 'critical':
      badgeBg = colors.dangerLight;
      textColor = colors.danger;
      defaultLabel = 'Overdue';
      break;
    case 'high':
      badgeBg = colors.warningLight;
      textColor = colors.warning;
      defaultLabel = 'Due Today';
      break;
    case 'completed':
      badgeBg = colors.successLight;
      textColor = colors.success;
      defaultLabel = 'Done';
      break;
    case 'medium':
      badgeBg = colors.infoLight;
      textColor = colors.info;
      defaultLabel = 'Expiring';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {label || defaultLabel.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: radii.small,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
