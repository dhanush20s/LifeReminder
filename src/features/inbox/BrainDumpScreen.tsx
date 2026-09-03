import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { inboxRepository } from '../../database/repositories/inboxRepository';
import { fetchAllLifeItems } from '../../store/slices/lifeItemSlice';
import { colors, spacing, radii, typography } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Trash2 } from 'lucide-react-native';
import { LifeItemType } from '../../types/lifeItem';

export const BrainDumpScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const inbox = useAppSelector((state) => state.lifeItems.inbox);

  const handleConvert = async (inboxId: string, content: string, type: LifeItemType) => {
    const item = await dispatch(
      createLifeItem({
        type,
        title: content,
        status: 'pending',
        startAt: new Date().toISOString(),
      })
    ).unwrap();

    await inboxRepository.markProcessed(inboxId, type, item.id);
    dispatch(fetchAllLifeItems());
  };

  const handleDelete = async (inboxId: string) => {
    await inboxRepository.delete(inboxId);
    dispatch(fetchAllLifeItems());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={`Life Inbox (${inbox.length})`} onBack={() => navigation.goBack()} />

      <FlatList
        data={inbox}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.itemText}>{item.content}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.convertLabel}>Convert to:</Text>
            <View style={styles.chipRow}>
              {(['reminder', 'bill', 'expiry', 'checklist', 'expense'] as LifeItemType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.chip}
                  onPress={() => handleConvert(item.id, item.content, t)}
                >
                  <Text style={styles.chipText}>+ {t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingBottom: 110,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    marginBottom: spacing.compact,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  itemText: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.small,
  },
  convertLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.small,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    borderRadius: radii.field,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  chipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});
