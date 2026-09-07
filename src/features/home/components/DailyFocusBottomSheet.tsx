import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { Target, Check, Trash2 } from 'lucide-react-native';
import { BottomSheet } from '../../../components/BottomSheet';

interface DailyFocusBottomSheetProps {
  visible: boolean;
  currentFocus: string | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}

export const DailyFocusBottomSheet: React.FC<DailyFocusBottomSheetProps> = ({
  visible,
  currentFocus,
  onClose,
  onSave,
  onClear,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (visible) {
      setInputText(currentFocus || '');
      setIsSaving(false);
      setIsClearing(false);
    }
  }, [visible, currentFocus]);

  const handleSavePress = async () => {
    if (isSaving || isClearing) return;
    Keyboard.dismiss();
    setIsSaving(true);
    try {
      if (inputText.trim()) {
        await onSave(inputText.trim());
      } else {
        await onClear();
      }
    } catch (err) {
      console.warn('Failed to save focus:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPress = async () => {
    if (isSaving || isClearing) return;
    Keyboard.dismiss();
    setIsClearing(true);
    try {
      await onClear();
    } catch (err) {
      console.warn('Failed to clear focus:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClose = () => {
    if (isSaving || isClearing) return;
    Keyboard.dismiss();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Today's Focus"
      icon={<Target size={20} color="#6366F1" style={{ marginRight: 8 }} />}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.subTitleText}>
          Set one primary objective to stay aligned and productive today.
        </Text>

        {/* Input Area */}
        <TextInput
          style={styles.input}
          placeholder="e.g. Finish CV, Team Meeting, Read 20 pages..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          autoFocus
          maxLength={60}
          editable={!isSaving && !isClearing}
        />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {currentFocus ? (
            <TouchableOpacity
              style={[styles.clearBtn, (isSaving || isClearing) && styles.disabledBtn]}
              onPress={handleClearPress}
              disabled={isSaving || isClearing}
              activeOpacity={0.8}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#EF4444" style={{ marginRight: 4 }} />
              ) : (
                <Trash2 size={16} color="#EF4444" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.clearBtnText}>{isClearing ? 'Clearing...' : 'Clear'}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleClose}
            disabled={isSaving || isClearing}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, (isSaving || isClearing) && styles.disabledBtn]}
            onPress={handleSavePress}
            disabled={isSaving || isClearing}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
            ) : (
              <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            )}
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  subTitleText: {
    ...typography.caption,
    fontSize: 12,
    color: '#64748B',
    marginBottom: spacing.default,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    backgroundColor: '#FEF2F2',
  },
  clearBtnText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  cancelBtn: {
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    marginRight: spacing.small,
  },
  cancelBtnText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.pill,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.7,
  },
});
