import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchExpenses, deleteExpense } from '../../store/slices/expenseSlice';
import { exportService } from '../../services/exportService';
import { colors, spacing, radii, typography } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Plus, Download, Trash2 } from 'lucide-react-native';

export const ExpenseDashboardScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { expenses, totalIncomeMinor } = useAppSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const totalExpenseMinor = expenses.reduce((acc, curr) => acc + curr.amountMinor, 0);
  const balanceMinor = totalIncomeMinor - totalExpenseMinor;

  const handleDelete = (id: string) => {
    dispatch(deleteExpense(id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Expenses"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('ExpenseReport')}>
            <Download size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>{exportService.formatAmount(balanceMinor)}</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.incomeText}>{exportService.formatAmount(totalIncomeMinor)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.expenseText}>{exportService.formatAmount(totalExpenseMinor)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddExpense')}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Expense</Text>
        </TouchableOpacity>

        {/* Recent Expense Transactions List */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        {expenses.length > 0 ? (
          expenses.map((exp) => (
            <View key={exp.id} style={styles.txRow}>
              <View style={styles.txInfo}>
                <Text style={styles.txCategory}>{exp.categoryName}</Text>
                <Text style={styles.txDesc}>{exp.description || exp.expenseDate}</Text>
              </View>
              <Text style={styles.txAmount}>{exportService.formatAmount(exp.amountMinor)}</Text>
              <TouchableOpacity onPress={() => handleDelete(exp.id)} style={styles.deleteTouch}>
                <Trash2 size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No expenses logged this month.</Text>
        )}
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
    padding: spacing.default,
    paddingBottom: 110,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.default,
    marginBottom: spacing.default,
  },
  balanceLabel: {
    ...typography.caption,
    color: '#E0E7FF',
  },
  balanceAmount: {
    ...typography.display,
    color: '#FFFFFF',
    marginVertical: spacing.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.small,
    marginTop: spacing.small,
  },
  summaryLabel: {
    ...typography.caption,
    color: '#E0E7FF',
  },
  incomeText: {
    ...typography.body,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  expenseText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FECACA',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radii.field,
    paddingVertical: spacing.compact,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  addBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.small,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.compact,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.default,
    borderRadius: radii.card,
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  txDesc: {
    ...typography.secondary,
    color: colors.textSecondary,
  },
  txAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.small,
  },
  deleteTouch: {
    padding: spacing.micro,
  },
  emptyText: {
    ...typography.secondary,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
