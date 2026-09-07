import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { ListChecks, Check, Plus, Trash2 } from 'lucide-react-native';

interface ChecklistFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    itemsList: string[];
    alarmTime?: string;
    startAt?: string;
  }) => Promise<void>;
}

export const ChecklistFormSheet: React.FC<ChecklistFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setItems((prev) => [...prev, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a checklist title');
      return;
    }
    // Include pending typed item if any
    let finalItems = [...items];
    if (newItemText.trim()) {
      finalItems.push(newItemText.trim());
    }

    if (finalItems.length === 0) {
      setErrorMsg('Please add at least one item to your checklist');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        itemsList: finalItems,
      });

      setTitle('');
      setNewItemText('');
      setItems([]);
      onClose();
    } catch (err) {
      console.error('Error saving checklist:', err);
      setErrorMsg('Failed to save checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="New Checklist"
      icon={<ListChecks size={20} color="#8B5CF6" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Title */}
        <Text style={styles.fieldLabel}>CHECKLIST TITLE *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Travel Packing, Grocery List, Weekend Cleaning"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={(txt) => {
            setTitle(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Checklist Item Add Row */}
        <Text style={styles.fieldLabel}>ADD ITEMS</Text>
        <View style={styles.addItemRow}>
          <TextInput
            style={styles.flexInput}
            placeholder="Type checklist item..."
            placeholderTextColor="#94A3B8"
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem} activeOpacity={0.8}>
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Added Items List */}
        {items.length > 0 && (
          <ScrollView style={styles.itemsListContainer} nestedScrollEnabled>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Trash2 size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Checklist'}</Text>
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
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingLeft: spacing.default,
    paddingRight: 6,
    paddingVertical: 4,
    marginBottom: spacing.compact,
  },
  flexInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: spacing.compact - 2,
  },
  addBtn: {
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsListContainer: {
    maxHeight: 140,
    marginBottom: spacing.default,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    padding: spacing.compact,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    ...typography.body,
    fontSize: 13,
    color: '#1E293B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#8B5CF6',
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
