import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AttentionItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { AlertTriangle, ChevronRight, ReceiptIndianRupee, ShieldCheck, Sparkles, UserRound } from 'lucide-react-native';

interface AttentionSectionProps {
  items: AttentionItem[];
  onItemPress: (id: string) => void;
  onSeeAllPress: () => void;
}

export const AttentionSection: React.FC<AttentionSectionProps> = ({
  items,
  onItemPress,
  onSeeAllPress,
}) => {
  if (items.length === 0) {
    return (
      <View style={styles.successStrip}>
        <Sparkles size={16} color={colors.success} />
        <Text style={styles.successStripText}>All caught up. Nothing needs your attention right now.</Text>
      </View>
    );
  }

  const getItemIcon = (type: string) => {
    const iconSize = 17;
    switch (type) {
      case 'bill':
      case 'subscription': 
        return { icon: <ReceiptIndianRupee size={iconSize} color={colors.danger} />, bg: colors.iconBgRed };
      case 'expiry': 
        return { icon: <ShieldCheck size={iconSize} color={colors.warning} />, bg: colors.iconBgAmber };
      case 'borrow': 
        return { icon: <UserRound size={iconSize} color={colors.accentPurple} />, bg: colors.iconBgPurple };
      default: 
        return { icon: <AlertTriangle size={iconSize} color={colors.danger} />, bg: colors.iconBgRed };
    }
  };

  const getCardTint = (severity: string, idx: number) => {
    switch (severity) {
      case 'critical':
        return { bg: '#FFF1F2', text: colors.danger };
      case 'medium':
        return { bg: '#FFF7E6', text: '#F97316' };
      default:
        return { bg: idx % 2 === 0 ? '#FFF1F8' : colors.dangerLight, text: colors.danger };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconCircle}>
            <AlertTriangle size={15} color="#FF4D00" fill="#FF4D00" strokeWidth={2.2} />
          </View>
          <Text style={styles.sectionTitle}>Needs Attention</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} style={styles.seeAllRow}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardContainer}
      >
        {items.slice(0, 3).map((item, idx) => {
          const { icon, bg } = getItemIcon(item.type);
          const cardTint = getCardTint(item.severity, idx);

          return (
            <TouchableOpacity
              key={item.lifeItemId}
              style={[styles.attentionCard, { backgroundColor: cardTint.bg }]}
              onPress={() => onItemPress(item.lifeItemId)}
              activeOpacity={0.75}
            >
              <View style={styles.attentionTopRow}>
                <View style={[styles.iconPill, { backgroundColor: bg }]}>{icon}</View>
                <ChevronRight size={18} color={colors.textPrimary} strokeWidth={2.1} />
              </View>

              <Text style={styles.title} numberOfLines={2}>{item.title.replace(/^Return /, '')}</Text>
              <Text style={[styles.reasonText, { color: cardTint.text }]} numberOfLines={1}>{item.reason}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.section,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  successStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.card,
    marginBottom: spacing.section,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successStripText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.success,
    marginLeft: spacing.small,
  },
  cardContainer: {
    gap: spacing.compact,
    paddingRight: spacing.default,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attentionCard: {
    width: 148,
    minHeight: 136,
    borderRadius: radii.card,
    padding: spacing.compact,
    justifyContent: 'space-between',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  attentionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.compact,
  },
  title: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reasonText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.small,
  },
});
