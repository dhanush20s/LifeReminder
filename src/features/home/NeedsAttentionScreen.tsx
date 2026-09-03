import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { colors, spacing, typography, radii } from '../../theme';
import { StatusBadge } from '../../components/StatusBadge';
import { AppHeader } from '../../components/AppHeader';
import { updateLifeItemStatus } from '../../store/slices/lifeItemSlice';

export const NeedsAttentionScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const needsAttention = useAppSelector((state) => state.lifeItems.needsAttention);

  const handleResolve = (lifeItemId: string) => {
    dispatch(updateLifeItemStatus({ id: lifeItemId, status: 'completed' }));
  };

  const handleCardPress = (lifeItemId: string) => {
    navigation.navigate('LifeItemDetail', { id: lifeItemId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Needs Attention" onBack={() => navigation.goBack()} />

      <FlatList
        data={needsAttention}
        keyExtractor={(item) => item.lifeItemId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => handleCardPress(item.lifeItemId)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <StatusBadge status={item.severity} label={item.reason} />
              <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <TouchableOpacity 
              style={styles.resolveButton} 
              onPress={() => handleResolve(item.lifeItemId)}
            >
              <Text style={styles.resolveText}>Mark Resolved</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    marginBottom: spacing.compact,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  cardType: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.default,
  },
  resolveButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    alignItems: 'center',
  },
  resolveText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
});
