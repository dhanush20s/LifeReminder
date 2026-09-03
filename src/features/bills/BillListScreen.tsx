import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { colors, spacing, typography } from '../../theme';
import { LifeItemRow } from '../../components/LifeItemRow';
import { AppHeader } from '../../components/AppHeader';
import { CreditCard } from 'lucide-react-native';

export const BillListScreen = ({ navigation }: any) => {
  const items = useAppSelector((state) => state.lifeItems.items);
  const billItems = items.filter((i) => i.type === 'bill' || i.type === 'subscription');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Bills & Subscriptions" onBack={() => navigation.goBack()} />

      <FlatList
        data={billItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <LifeItemRow item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CreditCard size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No bills recorded</Text>
            <Text style={styles.emptySub}>Track subscriptions, rent, utilities and recurring payments.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.default,
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.hero,
    padding: spacing.default,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.default,
  },
  emptySub: {
    ...typography.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
});
