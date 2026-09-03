import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, typography } from '../theme';
import { Sparkles } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Sparkles size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.button} onPress={onActionPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.section,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginVertical: spacing.default,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.small,
  },
  description: {
    ...typography.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.default,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
