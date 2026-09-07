import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { Sparkles } from 'lucide-react-native';

export const NextUpEmptyState: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.sparkleIconBox}>
        <Sparkles size={20} color="#A5B4FC" />
      </View>
      <Text style={styles.titleText}>All caught up!</Text>
      <Text style={styles.subText}>No upcoming items right now.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 220,
    height: 142,
    backgroundColor: '#0F172A',
    borderRadius: radii.card,
    padding: spacing.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sparkleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  titleText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subText: {
    ...typography.caption,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
});
