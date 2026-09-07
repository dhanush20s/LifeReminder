import React, { useState } from 'react';
import { View } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import {
  createQuickAddReminder,
  createQuickAddBill,
  createQuickAddChecklist,
  createQuickAddExpiry,
  createQuickAddBorrow,
  createQuickAddInventory,
  createQuickAddParking,
  addBrainDump,
  fetchAllLifeItems,
} from '../../store/slices/lifeItemSlice';
import { addExpense, fetchExpenses } from '../../store/slices/expenseSlice';
import { ReminderFormSheet } from './components/ReminderFormSheet';
import { ExpenseFormSheet } from './components/ExpenseFormSheet';
import { BillFormSheet } from './components/BillFormSheet';
import { ChecklistFormSheet } from './components/ChecklistFormSheet';
import { ExpiryFormSheet } from './components/ExpiryFormSheet';
import { BorrowFormSheet } from './components/BorrowFormSheet';
import { InventoryFormSheet } from './components/InventoryFormSheet';
import { ParkingFormSheet } from './components/ParkingFormSheet';
import { NoteFormSheet } from './components/NoteFormSheet';
import { MoreActionsSheet, MoreActionType } from './components/MoreActionsSheet';
import { QuickAddSuccessToast } from './components/QuickAddSuccessToast';

export type QuickAddType =
  | 'reminder'
  | 'task'
  | 'expense'
  | 'bill'
  | 'checklist'
  | 'expiry'
  | 'borrow'
  | 'inventory'
  | 'parking'
  | 'note'
  | 'inbox'
  | 'more'
  | null;

interface QuickAddManagerProps {
  activeType: QuickAddType;
  onClose: () => void;
  onSelectAction?: (type: QuickAddType) => void;
}

export const QuickAddManager: React.FC<QuickAddManagerProps> = ({
  activeType,
  onClose,
  onSelectAction,
}) => {
  const dispatch = useAppDispatch();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleCreateReminder = async (data: {
    title: string;
    description?: string;
    startAt: string;
    priority?: 'low' | 'normal' | 'high';
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    const created = await dispatch(createQuickAddReminder(data)).unwrap();
    console.log('📌 SAVED REMINDER ITEM JSON:\n', JSON.stringify(created, null, 2));
    dispatch(fetchAllLifeItems());
    showToast(`${activeType === 'task' ? 'Task' : 'Reminder'} created!`);
  };

  const handleCreateExpense = async (data: {
    amountMinor: number;
    categoryId: string;
    description?: string;
    expenseDate: string;
  }) => {
    await dispatch(
      addExpense({
        amountMinor: data.amountMinor,
        categoryId: data.categoryId,
        description: data.description,
        expenseDate: data.expenseDate,
      })
    ).unwrap();
    dispatch(fetchExpenses());
    showToast('Expense recorded!');
  };

  const handleCreateBill = async (data: {
    title: string;
    amountMinor: number;
    dueDate: string;
    description?: string;
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    await dispatch(createQuickAddBill(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Bill saved!');
  };

  const handleCreateChecklist = async (data: {
    title: string;
    itemsList: string[];
    alarmTime?: string;
    startAt?: string;
  }) => {
    await dispatch(createQuickAddChecklist(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Checklist created!');
  };

  const handleCreateExpiry = async (data: {
    title: string;
    expiryDate: string;
    expiryType: 'food' | 'medicine' | 'warranty' | 'document' | 'membership' | 'insurance' | 'renewal' | 'service';
    warningDays?: number;
  }) => {
    await dispatch(createQuickAddExpiry(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Expiry item tracked!');
  };

  const handleCreateBorrow = async (data: {
    direction: 'lent' | 'borrowed';
    personName: string;
    itemName?: string;
    amountMinor?: number;
    expectedReturnAt?: string;
    notes?: string;
  }) => {
    await dispatch(createQuickAddBorrow(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast(data.direction === 'lent' ? 'Lent record saved!' : 'Borrow record saved!');
  };

  const handleCreateInventory = async (data: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    purchaseDate?: string;
    expiryDate?: string;
    notes?: string;
  }) => {
    await dispatch(createQuickAddInventory(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Inventory item added!');
  };

  const handleCreateParking = async (data: {
    floor?: string;
    slot?: string;
    locationNotes?: string;
  }) => {
    await dispatch(createQuickAddParking(data)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Parking location saved!');
  };

  const handleCreateNote = async (content: string) => {
    await dispatch(addBrainDump(content)).unwrap();
    dispatch(fetchAllLifeItems());
    showToast('Note added to Life Inbox!');
  };

  const handleMoreActionSelect = (moreType: MoreActionType) => {
    if (onSelectAction) {
      onSelectAction(moreType as QuickAddType);
    }
  };

  return (
    <>
      <QuickAddSuccessToast message={toastMessage} onHide={() => setToastMessage(null)} />

      {/* 1. Reminder / Task */}
      <ReminderFormSheet
        visible={activeType === 'reminder' || activeType === 'task'}
        isTask={activeType === 'task'}
        onClose={onClose}
        onSubmit={handleCreateReminder}
      />

      {/* 2. Expense */}
      <ExpenseFormSheet
        visible={activeType === 'expense'}
        onClose={onClose}
        onSubmit={handleCreateExpense}
      />

      {/* 3. Bill / Subscription */}
      <BillFormSheet
        visible={activeType === 'bill'}
        onClose={onClose}
        onSubmit={handleCreateBill}
      />

      {/* 4. Checklist */}
      <ChecklistFormSheet
        visible={activeType === 'checklist'}
        onClose={onClose}
        onSubmit={handleCreateChecklist}
      />

      {/* 5. Expiry */}
      <ExpiryFormSheet
        visible={activeType === 'expiry'}
        onClose={onClose}
        onSubmit={handleCreateExpiry}
      />

      {/* 6. Borrow / Lend */}
      <BorrowFormSheet
        visible={activeType === 'borrow'}
        onClose={onClose}
        onSubmit={handleCreateBorrow}
      />

      {/* 7. Inventory */}
      <InventoryFormSheet
        visible={activeType === 'inventory'}
        onClose={onClose}
        onSubmit={handleCreateInventory}
      />

      {/* 8. Parking */}
      <ParkingFormSheet
        visible={activeType === 'parking'}
        onClose={onClose}
        onSubmit={handleCreateParking}
      />

      {/* 9. Note / Brain Dump */}
      <NoteFormSheet
        visible={activeType === 'note' || activeType === 'inbox'}
        onClose={onClose}
        onSubmit={handleCreateNote}
      />

      {/* 10. More Actions Grid */}
      <MoreActionsSheet
        visible={activeType === 'more'}
        onClose={onClose}
        onSelectAction={handleMoreActionSelect}
      />
    </>
  );
};
