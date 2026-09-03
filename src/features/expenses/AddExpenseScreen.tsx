import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addExpense } from '../../store/slices/expenseSlice';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { colors, spacing, radii, typography } from '../../theme';
import { ArrowLeft } from 'lucide-react-native';

export const AddExpenseScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.expenses.categories);

  const [amountStr, setAmountStr] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_food');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    const amountVal = parseFloat(amountStr);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    const amountMinor = Math.round(amountVal * 100);

    // Save to expenses repository
    await dispatch(
      addExpense({
        amountMinor,
        categoryId: selectedCategoryId,
        description: description.trim() || undefined,
        expenseDate: dateStr,
      })
    ).unwrap();

    // Create a corresponding LifeItem for timeline/calendar visibility
    const catObj = categories.find((c) => c.id === selectedCategoryId);
    await dispatch(
      createLifeItem({
        type: 'expense',
        title: `${catObj?.name || 'Expense'}: ₹${amountVal.toFixed(2)}`,
        description: description.trim() || undefined,
        status: 'completed',
        startAt: new Date(dateStr).toISOString(),
      })
    );

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.amountLabel}>Amount (₹)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={amountStr}
          onChangeText={setAmountStr}
          autoFocus
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategoryId === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.catChipText, selectedCategoryId === cat.id && styles.catChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lunch with team"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateStr}
          onChangeText={setDateStr}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  saveBtn: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  container: {
    padding: spacing.default,
  },
  amountLabel: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  amountInput: {
    ...typography.display,
    fontSize: 40,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    padding: spacing.default,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.default,
  },
  label: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
    marginTop: spacing.default,
  },
  catRow: {
    marginBottom: spacing.default,
  },
  catChip: {
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
