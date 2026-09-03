import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { exportService } from '../../services/exportService';
import { colors, spacing, radii, typography } from '../../theme';
import { ArrowLeft, Copy, Share2, FileSpreadsheet } from 'lucide-react-native';

export const ExpenseReportScreen = ({ navigation }: any) => {
  const { expenses, totalIncomeMinor } = useAppSelector((state) => state.expenses);

  const plainTextReport = exportService.generatePlainText(expenses, totalIncomeMinor);
  const csvReport = exportService.generateCSV(expenses);

  const handleShareCSV = async () => {
    await exportService.shareReport('Expense CSV Export', csvReport);
  };

  const handleShareText = async () => {
    await exportService.shareReport('Expense Summary', plainTextReport);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Report</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Formatted Preview</Text>
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{plainTextReport}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShareText}>
            <Share2 size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Share Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.csvBtn]} onPress={handleShareCSV}>
            <FileSpreadsheet size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    padding: spacing.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginLeft: spacing.compact,
  },
  container: {
    padding: spacing.default,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.compact,
  },
  previewBox: {
    backgroundColor: colors.surface,
    padding: spacing.default,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.section,
  },
  previewText: {
    fontFamily: 'Platform',
    ...typography.secondary,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  csvBtn: {
    backgroundColor: colors.success,
    marginRight: 0,
  },
  actionBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.small,
  },
});
