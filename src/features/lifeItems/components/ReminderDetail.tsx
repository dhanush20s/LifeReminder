import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAppDispatch } from '../../../store/hooks';
import { snoozeReminder, fetchAllLifeItems } from '../../../store/slices/lifeItemSlice';
import { LifeItem, Reminder } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { formatLifeItemDateTime } from '../utils/lifeItemHelpers';
import { Calendar, Bell, Repeat, FileText, Clock, AlertTriangle, X } from 'lucide-react-native';
import { parseISO, formatDistanceToNow } from 'date-fns';

interface ReminderDetailProps {
  item: LifeItem;
  detailData?: (Reminder & { recurrenceRule?: any }) | null;
  onRefresh?: () => void;
}

export const ReminderDetail: React.FC<ReminderDetailProps> = ({ item, detailData, onRefresh }) => {
  const dispatch = useAppDispatch();
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);

  const targetDate = item.startAt ? parseISO(item.startAt) : null;
  const isOverdue = targetDate ? (targetDate.getTime() < Date.now() && item.status !== 'completed') : false;
  const overdueDuration = targetDate && isOverdue ? formatDistanceToNow(targetDate) : null;

  const snoozeOptions = [
    { label: '5 Minutes', minutes: 5 },
    { label: '10 Minutes', minutes: 10 },
    { label: '30 Minutes', minutes: 30 },
    { label: '1 Hour', minutes: 60 },
    { label: 'Tomorrow', minutes: 1440 },
  ];

  const handleSelectSnooze = async (minutes: number) => {
    setShowSnoozeModal(false);
    await dispatch(snoozeReminder({ id: item.id, snoozeMinutes: minutes })).unwrap();
    dispatch(fetchAllLifeItems());
    if (onRefresh) onRefresh();
  };

  const getRepeatLabel = () => {
    const freq = detailData?.recurrenceRule?.frequency;
    if (!freq) return null;
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return String(freq);
    }
  };

  const repeatLabel = getRepeatLabel();

  return (
    <View style={styles.card}>
      {/* Overdue Banner */}
      {isOverdue && overdueDuration && (
        <View style={styles.overdueBanner}>
          <AlertTriangle size={18} color={colors.danger} />
          <Text style={styles.overdueBannerText}>Overdue by {overdueDuration}</Text>
        </View>
      )}

      {/* Scheduled Date & Time */}
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Scheduled Date & Time</Text>
          <Text style={styles.value}>{formatLifeItemDateTime(item.startAt)}</Text>
        </View>
      </View>

      {/* Recurrence Rule */}
      {repeatLabel && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Repeat size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Repeat Schedule</Text>
              <Text style={styles.value}>{repeatLabel}</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.divider} />

      {/* Notification Status */}
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Bell size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Notification Status</Text>
          <Text style={styles.value}>
            {detailData?.isEnabled !== false ? 'Scheduled (Local Device Alert)' : 'Disabled'}
          </Text>
        </View>
      </View>

      {/* Description / Notes */}
      {item.description ? (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{item.description}</Text>
            </View>
          </View>
        </>
      ) : null}

      {/* Snooze Button if Pending / Overdue */}
      {item.status !== 'completed' && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.snoozeBtn}
            onPress={() => setShowSnoozeModal(true)}
            activeOpacity={0.8}
          >
            <Clock size={18} color={colors.primary} />
            <Text style={styles.snoozeBtnText}>Snooze Reminder</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Snooze Options Modal */}
      <Modal visible={showSnoozeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSnoozeModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Snooze Reminder</Text>
              <TouchableOpacity onPress={() => setShowSnoozeModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {snoozeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.minutes}
                style={styles.modalOption}
                onPress={() => handleSelectSnooze(opt.minutes)}
              >
                <Clock size={16} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.modalOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.default,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radii.field,
    padding: spacing.compact,
    marginBottom: spacing.default,
  },
  overdueBannerText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: spacing.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.default,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.compact + 2,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  snoozeBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.default,
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  modalTitle: {
    ...typography.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalOptionText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
