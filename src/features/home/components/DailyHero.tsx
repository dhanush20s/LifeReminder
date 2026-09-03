import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react-native';

interface DailyHeroProps {
  attentionCount: number;
  todayCount: number;
}

export const DailyHero: React.FC<DailyHeroProps> = ({ attentionCount, todayCount }) => {
  let heroIcon = <Sparkles size={16} color={colors.primary} />;
  let heroText = "You've got a calm day ahead.";
  let bgStyle = styles.calmBg;
  let textStyle = styles.calmText;

  if (attentionCount > 0) {
    heroIcon = <AlertTriangle size={16} color={colors.warning} />;
    heroText = `${attentionCount} item${attentionCount > 1 ? 's' : ''} need your attention today.`;
    bgStyle = styles.urgentBg;
    textStyle = styles.urgentText;
  } else if (todayCount > 0) {
    heroIcon = <CheckCircle2 size={16} color={colors.primary} />;
    heroText = `Today at a glance: ${todayCount} item${todayCount > 1 ? 's' : ''} planned.`;
    bgStyle = styles.activeBg;
    textStyle = styles.activeText;
  } else {
    heroIcon = <Sparkles size={16} color={colors.success} />;
    heroText = "✨ Everything looks under control. You're all caught up.";
    bgStyle = styles.successBg;
    textStyle = styles.successText;
  }

  return (
    <View style={[styles.container, bgStyle]}>
      {heroIcon}
      <Text style={[styles.heroText, textStyle]}>{heroText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.pill,
    marginBottom: spacing.default,
    borderWidth: 1,
  },
  heroText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  calmBg: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  calmText: {
    color: colors.primary,
  },
  urgentBg: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  urgentText: {
    color: colors.warning,
  },
  activeBg: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  activeText: {
    color: colors.primary,
  },
  successBg: {
    backgroundColor: colors.iconBgGreen,
    borderColor: colors.success,
  },
  successText: {
    color: colors.success,
  },
});
