import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { colors, spacing, radii, typography } from '../../theme';
import { LifeItemRow } from '../../components/LifeItemRow';
import { AppHeader } from '../../components/AppHeader';
import { Plus } from 'lucide-react-native';

export const ExpiryTrackerScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.lifeItems.items);
  const expiryItems = items.filter((i) => i.type === 'expiry');

  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-15');

  const handleAddExpiry = async () => {
    if (!title.trim()) return;
    await dispatch(
      createLifeItem({
        type: 'expiry',
        title: title.trim(),
        status: 'pending',
        startAt: new Date(expiryDate).toISOString(),
      })
    );
    setTitle('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Expiry & Document Tracker" onBack={() => navigation.goBack()} />

      <View style={styles.createBox}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Passport Expiry"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddExpiry}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={expiryItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <LifeItemRow item={item} />}
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
});
