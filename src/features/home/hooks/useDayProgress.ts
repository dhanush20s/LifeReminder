import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  selectDayProgressStats, 
  selectActionableTodayItems, 
  selectNextUpItem 
} from '../selectors/homeSelectors';
import { updateLifeItemStatus, fetchAllLifeItems } from '../../../store/slices/lifeItemSlice';
import { fetchExpenses } from '../../../store/slices/expenseSlice';
import { LifeItem, LifeItemStatus } from '../../../types/lifeItem';

export const useDayProgress = () => {
  const dispatch = useAppDispatch();

  const stats = useAppSelector(selectDayProgressStats);
  const actionableTodayItems = useAppSelector(selectActionableTodayItems);
  const nextUpItem = useAppSelector(selectNextUpItem);
  const isLoading = useAppSelector((state) => state.lifeItems.loading);

  const toggleItemComplete = useCallback(
    async (item: LifeItem) => {
      const nextStatus: LifeItemStatus = item.status === 'completed' ? 'pending' : 'completed';
      try {
        await dispatch(updateLifeItemStatus({ id: item.id, status: nextStatus })).unwrap();
        dispatch(fetchExpenses());
      } catch (err) {
        console.error('Failed to update item status in database, rolling back:', err);
        // Rollback state by re-fetching SQLite items
        dispatch(fetchAllLifeItems());
      }
    },
    [dispatch]
  );

  const refreshProgress = useCallback(() => {
    dispatch(fetchAllLifeItems());
    dispatch(fetchExpenses());
  }, [dispatch]);

  return {
    ...stats,
    actionableTodayItems,
    nextUpItem,
    isLoading,
    toggleItemComplete,
    refreshProgress,
  };
};
