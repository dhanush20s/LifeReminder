import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { colors, radii, spacing, typography } from '../../../theme';
import { IndianRupee, Check } from 'lucide-react-native';
import { format } from 'date-fns';
import { expenseRepository } from '../../../database/repositories/expenseRepository';
import { ExpenseCategory } from '../../../types/lifeItem';

interface ExpenseFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amountMinor: number;
    categoryId: string;
    description?: string;
    expenseDate: string;
    notes?: string;
  }) => Promise<void>;
}

export const ExpenseFormSheet: React.FC<ExpenseFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('cat_food');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      expenseRepository.getCategories().then((cats) => {
        if (cats.length > 0) {
          setCategories(cats);
          setSelectedCatId(cats[0].id);
        }
      });
    }
  }, [visible]);

  const handleSave = async () => {
    const numericAmount = parseFloat(amountText);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }
    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      // Store in minor integer units (paise/cents): ₹350.50 -> 35050 paise
      const amountMinor = Math.round(numericAmount * 100);

      await onSubmit({
        amountMinor,
        categoryId: selectedCatId,
        description: description.trim() || undefined,
        expenseDate,
      });

      setAmountText('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      setErrorMsg('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Expense"
      icon={<IndianRupee size={20} color="#EF4444" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Fast Amount-First Input */}
        <Text style={styles.fieldLabel}>AMOUNT (₹) *</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
            value={amountText}
            onChangeText={(txt) => {
              setAmountText(txt);
              if (errorMsg) setErrorMsg('');
            }}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScrollView}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCatId === cat.id && styles.selectedCategoryChip,
              ]}
              onPress={() => setSelectedCatId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCatId === cat.id && styles.selectedCategoryChipText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Description / Note */}
        <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lunch with team, Groceries, Fuel"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Expense'}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  errorBanner: {
    ...typography.caption,
    fontSize: 12,
    color: '#EF4444',
    marginBottom: spacing.small,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radii.field,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact - 2,
    marginBottom: spacing.default,
  },
  currencyPrefix: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: '800',
    color: '#EF4444',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    ...typography.heading,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  catScrollView: {
    marginBottom: spacing.default,
  },
  categoryChip: {
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact - 2,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: spacing.small,
  },
  selectedCategoryChip: {
    backgroundColor: '#EF4444',
  },
  categoryChipText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: spacing.default,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.7,
  },
});
