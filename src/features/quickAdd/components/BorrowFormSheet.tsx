import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { Handshake, Check, Calendar } from 'lucide-react-native';
import { format, addDays } from 'date-fns';
import { DateTimePickerModal } from '../../../components/DateTimePickerModal';

interface BorrowFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    direction: 'lent' | 'borrowed';
    personName: string;
    itemName?: string;
    amountMinor?: number;
    expectedReturnAt?: string;
    notes?: string;
  }) => Promise<void>;
}

export const BorrowFormSheet: React.FC<BorrowFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [direction, setDirection] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [itemName, setItemName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setExpectedReturnDate(format(date, 'yyyy-MM-dd'));
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!personName.trim()) {
      setErrorMsg('Please enter a person name');
      return;
    }
    if (!itemName.trim() && !amountText.trim()) {
      setErrorMsg('Please specify either an item name or money amount');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const numericAmount = parseFloat(amountText);
      const amountMinor = !isNaN(numericAmount) && numericAmount > 0 ? Math.round(numericAmount * 100) : undefined;

      await onSubmit({
        direction,
        personName: personName.trim(),
        itemName: itemName.trim() || undefined,
        amountMinor,
        expectedReturnAt: expectedReturnDate ? `${expectedReturnDate}T09:00:00.000Z` : undefined,
        notes: notes.trim() || undefined,
      });

      setPersonName('');
      setItemName('');
      setAmountText('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Error saving borrow record:', err);
      setErrorMsg('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Borrow / Lend Tracker"
      icon={<Handshake size={20} color="#EC4899" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Direction Toggle */}
        <Text style={styles.fieldLabel}>TRANSACTION TYPE</Text>
        <View style={styles.directionToggleRow}>
          <TouchableOpacity
            style={[styles.directionBtn, direction === 'lent' && styles.lentActiveBtn]}
            onPress={() => setDirection('lent')}
          >
            <Text style={[styles.directionBtnText, direction === 'lent' && styles.activeBtnText]}>
              I LENT (Gave)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.directionBtn, direction === 'borrowed' && styles.borrowedActiveBtn]}
            onPress={() => setDirection('borrowed')}
          >
            <Text style={[styles.directionBtnText, direction === 'borrowed' && styles.activeBtnText]}>
              I BORROWED (Took)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Person Name */}
        <Text style={styles.fieldLabel}>PERSON NAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rahul, Priya, Alex"
          placeholderTextColor="#94A3B8"
          value={personName}
          onChangeText={(txt) => {
            setPersonName(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Item or Amount Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>ITEM NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Book, DSLR Camera, Tools"
              placeholderTextColor="#94A3B8"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>AMOUNT (₹ OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Expected Return Date */}
        <Text style={styles.fieldLabel}>EXPECTED RETURN DATE</Text>
        <TouchableOpacity
          style={styles.iconInputRow}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.7}
        >
          <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.datePickerText}>{expectedReturnDate || 'YYYY-MM-DD'}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisible(false)}
        />

        {/* Submit Action */}
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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Record'}</Text>
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
  directionToggleRow: {
    flexDirection: 'row',
    marginBottom: spacing.default,
  },
  directionBtn: {
    flex: 1,
    paddingVertical: spacing.compact + 2,
    alignItems: 'center',
    borderRadius: radii.field,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  lentActiveBtn: {
    backgroundColor: '#EC4899',
  },
  borrowedActiveBtn: {
    backgroundColor: '#8B5CF6',
  },
  directionBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  activeBtnText: {
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
  row: {
    flexDirection: 'row',
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.compact + 2,
    paddingVertical: spacing.compact + 2,
    marginBottom: spacing.default,
  },
  datePickerText: {
    ...typography.body,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#EC4899',
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
