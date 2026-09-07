import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { createQuickAddReminder } from '../../store/slices/lifeItemSlice';
import { colors, spacing, radii, typography } from '../../theme';
import { ArrowLeft, Bell, Calendar, Clock, Check, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';

export const CreateReminderScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  });
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [offsetMinutes, setOffsetMinutes] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState<'idle' | 'saving' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

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
      setErrorMsg('Please enter a reminder title.');
      return;
    }

    setErrorMsg('');
    setWarningMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);
    setSaveStatusText('saving');

    try {
      const fullIsoDate = selectedDateTime.toISOString();

      await dispatch(
        createQuickAddReminder({
          title: title.trim(),
          description: description.trim() || undefined,
          startAt: fullIsoDate,
          priority,
          repeatFrequency: repeat !== 'none' ? repeat : undefined,
          offsetMinutes,
        })
      ).unwrap();

      setSaveStatusText('success');

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (err: any) {
      console.error('Failed to save reminder:', err);
      setErrorMsg(err.message || 'Failed to save reminder. Please try again.');
      setSaveStatusText('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Reminder</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveHeaderBtn, isSubmitting && { opacity: 0.6 }]}>
            {saveStatusText === 'saving' ? 'Saving...' : saveStatusText === 'success' ? 'Saved ✓' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {errorMsg ? (
          <View style={styles.errorCard}>
            <AlertCircle size={16} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {warningMsg ? (
          <View style={styles.warningCard}>
            <Bell size={16} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.warningText}>{warningMsg}</Text>
          </View>
        ) : null}

        {/* Title */}
        <Text style={styles.label}>REMINDER TITLE *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Call John, Doctor Appointment, Renew License"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={(txt) => {
            setTitle(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Date & Time Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.label}>DATE</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Calendar size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.datePickerText}>{format(selectedDateTime, 'yyyy-MM-dd')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>TIME (12-HOUR)</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setTimePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Clock size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.datePickerText}>{format(selectedDateTime, 'hh:mm a')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal Date / Time Pickers */}
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

        {/* Priority */}
        <Text style={styles.label}>PRIORITY</Text>
        <View style={styles.pillGroup}>
          {(['low', 'normal', 'high'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.pill, priority === p && styles.activePill]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.pillText, priority === p && styles.activePillText]}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Remind Me Before */}
        <Text style={styles.label}>REMIND ME BEFORE</Text>
        <View style={styles.pillGroup}>
          {[
            { label: 'At time', minutes: 0 },
            { label: '5m before', minutes: 5 },
            { label: '15m before', minutes: 15 },
            { label: '30m before', minutes: 30 },
            { label: '1h before', minutes: 60 },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.minutes}
              style={[styles.smallPill, offsetMinutes === opt.minutes && styles.activePill]}
              onPress={() => setOffsetMinutes(opt.minutes)}
            >
              <Text style={[styles.pillText, offsetMinutes === opt.minutes && styles.activePillText]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Repeat Recurrence */}
        <Text style={styles.label}>REPEAT RECURRENCE</Text>
        <View style={styles.pillGroup}>
          {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.smallPill, repeat === r && styles.activePill]}
              onPress={() => setRepeat(r)}
            >
              <Text style={[styles.pillText, repeat === r && styles.activePillText]}>
                {r === 'none' ? 'OFF' : r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.label}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add details, links, or context..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* Submit Action Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Check size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.submitBtnText}>
            {saveStatusText === 'saving' ? 'Saving...' : saveStatusText === 'success' ? 'Saved Successfully' : 'Save Reminder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact + 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  saveHeaderBtn: {
    ...typography.body,
    fontWeight: '800',
    color: '#6366F1',
  },
  form: {
    padding: spacing.default,
    paddingBottom: spacing.section,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: radii.field,
    padding: spacing.compact,
    marginBottom: spacing.small,
  },
  errorText: {
    ...typography.caption,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: radii.field,
    padding: spacing.compact,
    marginBottom: spacing.small,
  },
  warningText: {
    ...typography.caption,
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: spacing.compact,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact + 2,
    ...typography.body,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact + 2,
  },
  datePickerText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.compact,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    marginBottom: 6,
  },
  activePill: {
    backgroundColor: '#6366F1',
  },
  pillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: spacing.default,
    borderRadius: radii.pill,
    marginTop: spacing.default + 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    ...typography.caption,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
});
