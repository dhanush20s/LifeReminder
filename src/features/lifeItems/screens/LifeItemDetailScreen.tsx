import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../../../store/hooks';
import { lifeItemRepository } from '../../../database/repositories/lifeItemRepository';
import { 
  updateLifeItemStatus, 
  archiveLifeItem, 
  deleteLifeItem, 
  fetchAllLifeItems 
} from '../../../store/slices/lifeItemSlice';
import { fetchExpenses } from '../../../store/slices/expenseSlice';
import { recurrenceService } from '../../../services/recurrenceService';
import { LifeItem, LifeItemType } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { LifeItemDetailHeader } from '../components/LifeItemDetailHeader';
import { LifeItemActions } from '../components/LifeItemActions';
import { ReminderDetail } from '../components/ReminderDetail';
import { BillDetail } from '../components/BillDetail';
import { ExpenseDetail } from '../components/ExpenseDetail';
import { ChecklistDetail } from '../components/ChecklistDetail';
import { ExpiryDetail } from '../components/ExpiryDetail';
import { BorrowDetail } from '../components/BorrowDetail';
import { GenericLifeItemDetail } from '../components/GenericLifeItemDetail';
import { EmptyState } from '../../../components/EmptyState';
import { formatLifeItemDateTime } from '../utils/lifeItemHelpers';

const detailComponentMap: Record<string, React.ComponentType<any>> = {
  reminder: ReminderDetail,
  bill: BillDetail,
  subscription: BillDetail,
  expense: ExpenseDetail,
  checklist: ChecklistDetail,
  expiry: ExpiryDetail,
  borrow: BorrowDetail,
};

export const LifeItemDetailScreen = ({ route, navigation }: any) => {
  const dispatch = useAppDispatch();
  const { id } = route.params || {};

  const [item, setItem] = useState<LifeItem | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) {
      setError('Item ID missing');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const baseItem = await lifeItemRepository.findById(id);
      if (!baseItem) {
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(baseItem);
      const details = await lifeItemRepository.findDetailsById(id, baseItem.type);
      setDetailData(details);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading LifeItem detail:', err);
      setError('Failed to load item details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          title="Item Not Found"
          description={error || "The requested item does not exist or has been deleted."}
          actionText="Go Back"
          onActionPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const DetailComponent = detailComponentMap[item.type] || GenericLifeItemDetail;

  const getPrimaryActionLabel = (): string | undefined => {
    switch (item.type) {
      case 'reminder': return 'Mark as Complete';
      case 'bill':
      case 'subscription': return 'Mark as Paid';
      case 'checklist': return 'Complete All Tasks';
      case 'expiry': return 'Mark as Renewed';
      case 'borrow': return 'Mark as Returned / Repaid';
      default: return 'Complete Item';
    }
  };

  const handlePrimaryAction = async () => {
    if (item.type === 'bill' || item.type === 'subscription') {
      // Mark as paid
      await dispatch(updateLifeItemStatus({ id: item.id, status: 'completed' })).unwrap();
    } else {
      await dispatch(updateLifeItemStatus({ id: item.id, status: 'completed' })).unwrap();
    }
    dispatch(fetchAllLifeItems());
    dispatch(fetchExpenses());
    loadData();
  };

  const handleEdit = () => {
    navigation.navigate('EditLifeItem', { id: item.id });
  };

  const handleArchive = async () => {
    await dispatch(archiveLifeItem(item.id)).unwrap();
    dispatch(fetchAllLifeItems());
    navigation.goBack();
  };

  const handleDelete = async () => {
    await dispatch(deleteLifeItem(item.id)).unwrap();
    dispatch(fetchAllLifeItems());
    dispatch(fetchExpenses());
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LifeItemDetailHeader
          item={item}
          onBack={() => navigation.goBack()}
          onEdit={handleEdit}
        />

        <View style={styles.bodySection}>
          {/* Scalable Type-Specific Detail Component */}
          <DetailComponent
            item={item}
            detailData={detailData}
            onRefresh={loadData}
          />

          {/* Contextual Action System */}
          <LifeItemActions
            item={item}
            primaryActionLabel={getPrimaryActionLabel()}
            onPrimaryAction={handlePrimaryAction}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />

          {/* Metadata Footer */}
          <View style={styles.metadataCard}>
            <Text style={styles.metaText}>Created: {formatLifeItemDateTime(item.createdAt)}</Text>
            <Text style={styles.metaText}>Last Updated: {formatLifeItemDateTime(item.updatedAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: spacing.section,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodySection: {
    padding: spacing.default,
  },
  metadataCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    padding: spacing.compact,
    borderWidth: 1,
    borderColor: colors.divider,
    marginTop: spacing.small,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
