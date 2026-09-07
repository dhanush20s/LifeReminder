import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { Package, Check, Calendar } from 'lucide-react-native';

interface InventoryFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    purchaseDate?: string;
    expiryDate?: string;
    notes?: string;
  }) => Promise<void>;
}

export const InventoryFormSheet: React.FC<InventoryFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [quantityStr, setQuantityStr] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter inventory item name');
      return;
    }
    const qty = parseInt(quantityStr, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid quantity');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        quantity: qty,
        unit: unit.trim() || undefined,
        location: location.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
      });

      setName('');
      setQuantityStr('1');
      setLocation('');
      setExpiryDate('');
      onClose();
    } catch (err) {
      console.error('Error saving inventory item:', err);
      setErrorMsg('Failed to save inventory item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Inventory Item"
      icon={<Package size={20} color="#06B6D4" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Item Name */}
        <Text style={styles.fieldLabel}>ITEM NAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. AA Batteries, Olive Oil, Printer Ink, Coffee Beans"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={(txt) => {
            setName(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Quantity & Unit Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>QTY *</Text>
            <TextInput
              style={styles.input}
              value={quantityStr}
              onChangeText={setQuantityStr}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ flex: 1.5 }}>
            <Text style={styles.fieldLabel}>UNIT</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pcs, kg, bottles, packs"
              placeholderTextColor="#94A3B8"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        {/* Location & Expiry Date */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>LOCATION</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kitchen Cabinet, Store Room, Desk"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>EXPIRY DATE (OPTIONAL)</Text>
            <View style={styles.iconInputRow}>
              <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
              <TextInput
                style={styles.flexInput}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Inventory Item'}</Text>
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
    paddingVertical: spacing.compact,
    marginBottom: spacing.default,
  },
  flexInput: {
    flex: 1,
    ...typography.body,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#06B6D4',
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
