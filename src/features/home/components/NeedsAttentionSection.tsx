import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AttentionItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { AlertTriangle, ChevronRight, FileText, Shield, User, Sparkles } from 'lucide-react-native';

interface NeedsAttentionSectionProps {
  items: AttentionItem[];
  onItemPress: (id: string) => void;
  onSeeAllPress: () => void;
}

export const NeedsAttentionSection: React.FC<NeedsAttentionSectionProps> = ({
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

  const getCardStyle = (idx: number) => {
    switch (idx % 3) {
      case 0:
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          iconColor: colors.danger,
          iconBg: '#FEE2E2',
          subtextColor: colors.danger,
        };
      case 1:
        return {
          bg: '#FFFBEB',
          border: '#FEF3C7',
          iconColor: colors.warning,
          iconBg: '#FEF3C7',
          subtextColor: colors.warning,
        };
      default:
        return {
          bg: '#FDF2F8',
          border: '#FCE7F3',
          iconColor: colors.accentPurple,
          iconBg: '#F3E8FF',
          subtextColor: colors.danger,
        };
    }
  };

  const getIcon = (type: string, idx: number) => {
    const iconSize = 16;
    const style = getCardStyle(idx);
    switch (type) {
      case 'expiry': return <Shield size={iconSize} color={style.iconColor} />;
      case 'borrow': return <User size={iconSize} color={style.iconColor} />;
      default: return <FileText size={iconSize} color={style.iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerTitleRow}>
          <AlertTriangle size={16} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Needs Attention</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {items.slice(0, 3).map((item, idx) => {
          const cardStyle = getCardStyle(idx);
          return (
            <TouchableOpacity
              key={item.lifeItemId}
              style={[styles.card, { backgroundColor: cardStyle.bg, borderColor: cardStyle.border }]}
              onPress={() => onItemPress(item.lifeItemId)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconPill, { backgroundColor: cardStyle.iconBg }]}>
                  {getIcon(item.type, idx)}
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>

              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.subtext, { color: cardStyle.subtextColor }]}>{item.reason}</Text>

              {item.type === 'bill' && (
                <Text style={styles.amountText}>₹ 2,450</Text>
              )}
              {item.type === 'expiry' && (
                <Text style={styles.dateSubText}>12 Sep 2025</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
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
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingRight: spacing.default,
  },
  card: {
    width: 155,
    borderRadius: radii.card,
    padding: spacing.default,
    marginRight: spacing.compact,
    borderWidth: 1,
    justifyContent: 'space-between',
    height: 120,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.small,
  },
  subtext: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  amountText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  dateSubText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  successStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.card,
    marginBottom: spacing.default,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successStripText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.success,
    marginLeft: spacing.small,
  },
});
