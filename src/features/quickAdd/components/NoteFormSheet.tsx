import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { Brain, Check } from 'lucide-react-native';

interface NoteFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
}

export const NoteFormSheet: React.FC<NoteFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setErrorMsg('Please enter your note or idea');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit(content.trim());
      setContent('');
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
      setErrorMsg('Failed to save note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Brain Dump / Note"
      icon={<Brain size={20} color="#64748B" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        <Text style={styles.fieldLabel}>QUICK NOTE / BRAIN DUMP *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Jot down quick thoughts, ideas, or things to process later..."
          placeholderTextColor="#94A3B8"
          value={content}
          onChangeText={(txt) => {
            setContent(txt);
            if (errorMsg) setErrorMsg('');
          }}
          multiline
          autoFocus
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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Note'}</Text>
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
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    fontSize: 14,
    color: '#0F172A',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.default,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748B',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#64748B',
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
