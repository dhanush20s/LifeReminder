import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { notificationService } from '../../services/notificationService';
import { colors, spacing, radii, typography } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { CheckSquare, Plus, BellRing } from 'lucide-react-native';

export const ChecklistListScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.lifeItems.items);
  const checklists = items.filter((i) => i.type === 'checklist');

  const [newTitle, setNewTitle] = useState('');

  const handleCreateChecklist = async () => {
    if (!newTitle.trim()) return;

    const created = await dispatch(
      createLifeItem({
        type: 'checklist',
        title: newTitle.trim(),
        status: 'pending',
        startAt: new Date().toISOString(),
      })
    ).unwrap();

    // Schedule checklist alarm notification
    try {
      const alarmDate = new Date();
      alarmDate.setHours(8, 30, 0, 0); // 8:30 AM
      if (alarmDate < new Date()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }
      await notificationService.scheduleNotification(
        created.id,
        '⏰ Checklist Alarm: ' + created.title,
        'Tap TURN OFF to stop sound. Tap OPEN to check off items.',
        alarmDate,
        'checklist_alarms'
      );
    } catch (err) {
      console.warn('Failed to schedule checklist alarm:', err);
    }

    setNewTitle('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Smart Checklists" onBack={() => navigation.goBack()} />

      <View style={styles.createBox}>
        <TextInput
          style={styles.input}
          placeholder="New checklist (e.g. Morning Routine)"
          placeholderTextColor={colors.textMuted}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateChecklist}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('LifeItemDetail', { id: item.id })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <CheckSquare size={20} color={colors.accentTeal} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <View style={styles.alarmBadge}>
              <BellRing size={14} color={colors.warning} />
              <Text style={styles.alarmText}>Alarm at 8:30 AM (Daily)</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  createBox: {
    flexDirection: 'row',
    padding: spacing.default,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  addBtn: {
    backgroundColor: colors.primary,
    padding: spacing.compact,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.default,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    marginBottom: spacing.compact,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  cardTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginLeft: spacing.small,
  },
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: radii.small,
    alignSelf: 'flex-start',
  },
  alarmText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
});
