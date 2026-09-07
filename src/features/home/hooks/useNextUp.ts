import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectRankedNextUpItems } from '../selectors/homeSelectors';
import { updateLifeItemStatus, fetchAllLifeItems } from '../../../store/slices/lifeItemSlice';
import { RankedNextUpItem } from '../../../services/homePriorityService';

export const useNextUp = () => {
  const dispatch = useAppDispatch();
  const rankedItems = useAppSelector(selectRankedNextUpItems);

  const navigateToItemDetail = useCallback((item: RankedNextUpItem, navigation: any) => {
    if (!navigation) return;

    switch (item.type) {
      case 'bill':
      case 'subscription':
        navigation.navigate('Bills');
        break;
      case 'expense':
        navigation.navigate('Expenses');
        break;
      case 'expiry':
        navigation.navigate('Expiry');
        break;
      case 'borrow':
        navigation.navigate('BorrowReturn');
        break;
      case 'checklist':
        navigation.navigate('Checklists');
        break;
      case 'reminder':
      case 'task':
      case 'event':
      case 'follow_up':
      default:
        navigation.navigate('LifeItemDetail', { id: item.id });
        break;
    }
  }, []);

  const handleItemComplete = useCallback(
    async (item: RankedNextUpItem) => {
      try {
        await dispatch(updateLifeItemStatus({ id: item.id, status: 'completed' })).unwrap();
      } catch (err) {
        console.error('Failed to update Next Up item status:', err);
        dispatch(fetchAllLifeItems());
      }
    },
    [dispatch]
  );

  const refreshNextUp = useCallback(() => {
    dispatch(fetchAllLifeItems());
  }, [dispatch]);

  return {
    rankedItems,
    isEmpty: rankedItems.length === 0,
    navigateToItemDetail,
    handleItemComplete,
    refreshNextUp,
  };
};
