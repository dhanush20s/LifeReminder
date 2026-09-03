import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { NeedsAttentionScreen } from '../../features/home/NeedsAttentionScreen';
import { BrainDumpScreen } from '../../features/inbox/BrainDumpScreen';
import { CreateReminderScreen } from '../../features/reminders/CreateReminderScreen';
import { ExpenseDashboardScreen } from '../../features/expenses/ExpenseDashboardScreen';
import { AddExpenseScreen } from '../../features/expenses/AddExpenseScreen';
import { ExpenseReportScreen } from '../../features/expenses/ExpenseReportScreen';
import { BillListScreen } from '../../features/bills/BillListScreen';
import { ChecklistListScreen } from '../../features/checklists/ChecklistListScreen';
import { ExpiryTrackerScreen } from '../../features/expiry/ExpiryTrackerScreen';
import { BorrowReturnScreen } from '../../features/borrowReturn/BorrowReturnScreen';
import { SettingsScreen } from '../../features/settings/SettingsScreen';
import { LifeItemDetailScreen } from '../../features/lifeItems/screens/LifeItemDetailScreen';
import { EditLifeItemScreen } from '../../features/lifeItems/screens/EditLifeItemScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="NeedsAttention" component={NeedsAttentionScreen} />
      <Stack.Screen name="Inbox" component={BrainDumpScreen} />
      <Stack.Screen name="CreateReminder" component={CreateReminderScreen} />
      <Stack.Screen name="Expenses" component={ExpenseDashboardScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} />
      <Stack.Screen name="Bills" component={BillListScreen} />
      <Stack.Screen name="Checklists" component={ChecklistListScreen} />
      <Stack.Screen name="Expiry" component={ExpiryTrackerScreen} />
      <Stack.Screen name="BorrowReturn" component={BorrowReturnScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LifeItemDetail" component={LifeItemDetailScreen} />
      <Stack.Screen name="EditLifeItem" component={EditLifeItemScreen} />
    </Stack.Navigator>
  );
};
