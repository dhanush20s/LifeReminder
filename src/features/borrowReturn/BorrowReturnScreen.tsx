import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createLifeItem } from '../../store/slices/lifeItemSlice';
import { colors, spacing, radii, typography } from '../../theme';
import { LifeItemRow } from '../../components/LifeItemRow';
import { AppHeader } from '../../components/AppHeader';
import { Plus } from 'lucide-react-native';

export const BorrowReturnScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.lifeItems.items);
  const borrowItems = items.filter((i) => i.type === 'borrow');

  const [person, setPerson] = useState('');
  const [itemOrMoney, setItemOrMoney] = useState('');

  const handleAddRecord = async () => {
    if (!person.trim() || !itemOrMoney.trim()) return;
    await dispatch(
      createLifeItem({
        type: 'borrow',
        title: `${person.trim()}: ${itemOrMoney.trim()}`,
        status: 'pending',
        startAt: new Date().toISOString(),
      })
    );
    setPerson('');
    setItemOrMoney('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Borrow & Return" onBack={() => navigation.goBack()} />

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Person name (e.g. Arun)"
          placeholderTextColor={colors.textMuted}
          value={person}
          onChangeText={setPerson}
        />
        <TextInput
          style={[styles.input, { marginTop: spacing.small }]}
          placeholder="Item or amount (e.g. Headphones or ₹500)"
          placeholderTextColor={colors.textMuted}
          value={itemOrMoney}
          onChangeText={setItemOrMoney}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddRecord}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Record</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={borrowItems}
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
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.default,
    margin: spacing.default,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.default,
  },
  addBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.small,
  },
  list: {
    paddingHorizontal: spacing.default,
    paddingBottom: 110,
  },
});
