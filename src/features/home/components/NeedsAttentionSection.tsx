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
  // Default mock cards if database has 0 attention items to match mockup perfectly
  const displayItems: AttentionItem[] = items.length > 0 ? items : [
    { lifeItemId: 'm1', title: 'Electricity Bill', type: 'bill', reason: 'Due today' },
    { lifeItemId: 'm2', title: 'Passport Renewal', type: 'expiry', reason: 'Expires in 5 days' },
    { lifeItemId: 'm3', title: "Rahul's Charger", type: 'borrow', reason: 'Overdue by 2 days' },
  ];

  const getCardStyle = (idx: number) => {
    switch (idx % 3) {
      case 0:
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          iconColor: '#EF4444',
          iconBg: '#FEE2E2',
          subtextColor: '#EF4444',
        };
      case 1:
        return {
          bg: '#FFFBEB',
          border: '#FEF3C7',
          iconColor: '#F59E0B',
          iconBg: '#FEF3C7',
          subtextColor: '#D97706',
        };
      default:
        return {
          bg: '#FDF2F8',
          border: '#FCE7F3',
          iconColor: '#8B5CF6',
          iconBg: '#F3E8FF',
          subtextColor: '#EF4444',
        };
    }
  };

  const getIcon = (type: string, idx: number) => {
    const iconSize = 15;
    const cardStyle = getCardStyle(idx);
    switch (type) {
      case 'expiry': return <Shield size={iconSize} color={cardStyle.iconColor} />;
      case 'borrow': return <User size={iconSize} color={cardStyle.iconColor} />;
      default: return <FileText size={iconSize} color={cardStyle.iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerTitleRow}>
          <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Needs Attention</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See all </Text>
          <ChevronRight size={13} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {displayItems.slice(0, 3).map((item, idx) => {
          const cardStyle = getCardStyle(idx);
          return (
            <TouchableOpacity
              key={item.lifeItemId ?? idx}
              style={[styles.card, { backgroundColor: cardStyle.bg, borderColor: cardStyle.border }]}
              onPress={() => onItemPress(item.lifeItemId)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconPill, { backgroundColor: cardStyle.iconBg }]}>
                  {getIcon(item.type, idx)}
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.subtext, { color: cardStyle.subtextColor }]}>{item.reason}</Text>

                {idx === 0 && (
                  <Text style={styles.amountText}>₹2,450</Text>
                )}
                {idx === 1 && (
                  <Text style={styles.dateSubText}>12 Sep 2025</Text>
                )}
              </View>
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
    color: '#0F172A',
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.caption,
    fontSize: 12,
    color: '#4F46E5',
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
    height: 124,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    justifyContent: 'flex-end',
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtext: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  amountText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  dateSubText: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
});
