import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { notificationService } from '../../services/notificationService';
import { colors, spacing, radii, typography } from '../../theme';
import { ArrowLeft, Bell, Calendar, Clock, Tag } from 'lucide-react-native';

export const CreateReminderScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('09:00 AM');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a reminder title.');
      return;
    }

    const startAtISO = new Date(`${dateStr}T09:00:00`).toISOString();

    const createdItem = await dispatch(
      createLifeItem({
        type: 'reminder',
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'pending',
        priority,
        startAt: startAtISO,
      })
    ).unwrap();

    // Schedule local notification
    try {
      const notifyDate = new Date(startAtISO);
      if (notifyDate > new Date()) {
        await notificationService.scheduleNotification(
          createdItem.id,
          '🔔 Reminder: ' + createdItem.title,
          createdItem.description || 'You have a scheduled life reminder.',
          notifyDate
        );
      }
    } catch (err) {
      console.warn('Failed to schedule notification:', err);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Reminder</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveHeaderBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Renew bike insurance"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateStr}
          onChangeText={setDateStr}
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          value={timeStr}
          onChangeText={setTimeStr}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {(['low', 'normal', 'high'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.priorityChip, priority === p && styles.priorityChipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityChipText, priority === p && styles.priorityChipTextActive]}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add additional context or notes..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
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
  saveHeaderBtn: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  form: {
    padding: spacing.default,
  },
  label: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
    marginTop: spacing.default,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
  },
  priorityChip: {
    flex: 1,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: spacing.small,
  },
  priorityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityChipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priorityChipTextActive: {
    color: '#FFFFFF',
  },
});
