import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../../../store/hooks';
import { lifeItemRepository } from '../../../database/connection';
import { updateLifeItem, fetchAllLifeItems } from '../../../store/slices/lifeItemSlice';
import { LifeItem, LifeItemPriority, LifeItemStatus } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { AppHeader } from '../../../components/AppHeader';

export const EditLifeItemScreen = ({ route, navigation }: any) => {
  const dispatch = useAppDispatch();
  const { id } = route.params || {};

  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [priority, setPriority] = useState<LifeItemPriority>('normal');
  const [status, setStatus] = useState<LifeItemStatus>('pending');

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      try {
        const item = await lifeItemRepository.findById(id);
        if (item) {
          setTitle(item.title);
          setDescription(item.description || '');
          setDateStr(item.startAt ? item.startAt.split('T')[0] : new Date().toISOString().split('T')[0]);
          setPriority(item.priority || 'normal');
          setStatus(item.status);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading item for edit:', err);
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title cannot be empty.');
      return;
    }

    const startAt = dateStr ? new Date(dateStr).toISOString() : undefined;

    await dispatch(
      updateLifeItem({
        id,
        changes: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          startAt,
        },
      })
    ).unwrap();

    dispatch(fetchAllLifeItems());
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Edit Life Item"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveBtn}>Save</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Item title"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateStr}
          onChangeText={setDateStr}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {(['low', 'normal', 'high'] as LifeItemPriority[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.chipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.row}>
          {(['pending', 'completed', 'overdue'] as LifeItemStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, status === s && styles.chipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description / Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Add additional details..."
          placeholderTextColor={colors.textMuted}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
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
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: spacing.small,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
