import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { Hourglass, Check, Calendar } from 'lucide-react-native';
import { format, addMonths } from 'date-fns';
import { DateTimePickerModal } from '../../../components/DateTimePickerModal';

type ExpiryType = 'food' | 'medicine' | 'warranty' | 'document' | 'membership' | 'insurance' | 'renewal' | 'service';

interface ExpiryFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    expiryDate: string;
    expiryType: ExpiryType;
    warningDays?: number;
  }) => Promise<void>;
}

const EXPIRY_TYPES: { type: ExpiryType; label: string }[] = [
  { type: 'document', label: 'Document' },
  { type: 'warranty', label: 'Warranty' },
  { type: 'medicine', label: 'Medicine' },
  { type: 'insurance', label: 'Insurance' },
  { type: 'food', label: 'Food' },
  { type: 'membership', label: 'Membership' },
  { type: 'renewal', label: 'Renewal' },
  { type: 'service', label: 'Service' },
];

export const ExpiryFormSheet: React.FC<ExpiryFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState(format(addMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [expiryType, setExpiryType] = useState<ExpiryType>('document');
  const [warningDays, setWarningDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setExpiryDate(format(date, 'yyyy-MM-dd'));
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter document or item name');
      return;
    }
    if (!expiryDate.trim()) {
      setErrorMsg('Please enter a valid expiry date');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        expiryDate: expiryDate.trim(),
        expiryType,
        warningDays: parseInt(warningDays, 10) || 7,
      });

      setTitle('');
      onClose();
    } catch (err) {
      console.error('Error saving expiry record:', err);
      setErrorMsg('Failed to save expiry item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Expiry Tracker"
      icon={<Hourglass size={20} color="#EF4444" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Item / Document Name */}
        <Text style={styles.fieldLabel}>DOCUMENT / ITEM NAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Passport, Car Insurance, Paracetamol, Appliance Warranty"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={(txt) => {
            setTitle(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
          {EXPIRY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.type}
              style={[styles.typeChip, expiryType === t.type && styles.selectedTypeChip]}
              onPress={() => setExpiryType(t.type)}
            >
              <Text style={[styles.typeChipText, expiryType === t.type && styles.selectedTypeChipText]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expiry Date & Warning Days Row */}
        <View style={styles.row}>
          <View style={{ flex: 1.5, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>EXPIRY DATE *</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.datePickerText}>{expiryDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ALERT (DAYS PRIOR)</Text>
            <TextInput
              style={styles.input}
              value={warningDays}
              onChangeText={setWarningDays}
              keyboardType="number-pad"
              placeholder="7"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Expiry'}</Text>
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
  typeScrollView: {
    marginBottom: spacing.default,
  },
  typeChip: {
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact - 2,
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: spacing.small,
  },
  selectedTypeChip: {
    backgroundColor: '#EF4444',
  },
  typeChipText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  selectedTypeChipText: {
    color: '#FFFFFF',
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
