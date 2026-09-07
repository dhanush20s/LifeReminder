import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { colors, radii, spacing, typography } from '../../../theme';
import { Bell, Check, Calendar, Clock, CheckSquare } from 'lucide-react-native';
import { format } from 'date-fns';
import { DateTimePickerModal } from '../../../components/DateTimePickerModal';

interface ReminderFormSheetProps {
  visible: boolean;
  isTask?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    startAt: string;
    priority?: 'low' | 'normal' | 'high';
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => Promise<void>;
}

export const ReminderFormSheet: React.FC<ReminderFormSheetProps> = ({
  visible,
  isTask = false,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const handleConfirmDate = (date: Date) => {
    const updated = new Date(selectedDateTime);
    updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateTime(updated);
    setDatePickerVisible(false);
  };

  const handleConfirmTime = (date: Date) => {
    const updated = new Date(selectedDateTime);
    updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setSelectedDateTime(updated);
    setTimePickerVisible(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title');
      return;
    }
    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const fullIsoDate = selectedDateTime.toISOString();
      await onSubmit({
        title: title.trim(),
        description: notes.trim() || undefined,
        startAt: fullIsoDate,
        priority,
        repeatFrequency: repeat !== 'none' ? repeat : undefined,
      });
      setTitle('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Error saving reminder:', err);
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isTask ? 'New Task' : 'New Reminder'}
      icon={
        isTask ? (
          <CheckSquare size={20} color="#10B981" style={{ marginRight: 8 }} />
        ) : (
          <Bell size={20} color="#6366F1" style={{ marginRight: 8 }} />
        )
      }
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Title Input */}
        <Text style={styles.fieldLabel}>TITLE *</Text>
        <TextInput
          style={styles.input}
          placeholder={isTask ? 'e.g. Complete quarterly report' : 'e.g. Call Dr. Sharma'}
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={(txt) => {
            setTitle(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
          maxLength={100}
        />

        {/* Date & Time Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>DATE</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.datePickerText}>{format(selectedDateTime, 'yyyy-MM-dd')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>TIME</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setTimePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Clock size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.datePickerText}>{format(selectedDateTime, 'hh:mm a')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal Pickers */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisible(false)}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={() => setTimePickerVisible(false)}
        />

        {/* Priority & Repeat Options */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>PRIORITY</Text>
            <View style={styles.pillGroup}>
              {(['normal', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.smallPill, priority === p && styles.activePill]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.pillText, priority === p && styles.activePillText]}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>REPEAT</Text>
            <View style={styles.pillGroup}>
              {(['none', 'daily', 'weekly'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.smallPill, repeat === r && styles.activePill]}
                  onPress={() => setRepeat(r)}
                >
                  <Text style={[styles.pillText, repeat === r && styles.activePillText]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notes Input */}
        <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
          placeholder="Add details, link or notes..."
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
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
    marginBottom: spacing.default,
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
  },
  datePickerText: {
    ...typography.body,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  pillGroup: {
    flexDirection: 'row',
  },
  smallPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  activePill: {
    backgroundColor: '#4F46E5',
  },
  pillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#4F46E5',
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
