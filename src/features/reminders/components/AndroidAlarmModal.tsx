import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { Bell, Check, Clock, X, ExternalLink } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { LifeItem } from '../../../types/lifeItem';

interface AndroidAlarmModalProps {
  visible: boolean;
  item: LifeItem | null;
  onComplete: (item: LifeItem) => Promise<void>;
  onSnooze: (item: LifeItem, snoozeMinutes: number) => Promise<void>;
  onTurnOff: (item: LifeItem) => void;
  onOpen: (item: LifeItem) => void;
}

export const AndroidAlarmModal: React.FC<AndroidAlarmModalProps> = ({
  visible,
  item,
  onComplete,
  onSnooze,
  onTurnOff,
  onOpen,
}) => {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  if (!visible || !item) return null;

  const formattedTime = item.startAt
    ? format(parseISO(item.startAt), 'h:mm a')
    : format(new Date(), 'h:mm a');

  const snoozeIntervals = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: 'Tomorrow', value: 1440 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.bellCircle}>
            <Bell size={32} color="#FFFFFF" />
          </View>

          <Text style={styles.headerLabel}>🔔 REMINDER</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>

          {item.description ? (
            <Text style={styles.notesText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Snooze Sub-options */}
          {showSnoozeOptions ? (
            <View style={styles.snoozeContainer}>
              <Text style={styles.snoozeTitle}>Snooze for:</Text>
              <View style={styles.snoozeRow}>
                {snoozeIntervals.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.snoozeChip}
                    onPress={() => {
                      setShowSnoozeOptions(false);
                      onSnooze(item, opt.value);
                    }}
                  >
                    <Text style={styles.snoozeChipText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {/* Primary COMPLETE Button */}
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => onComplete(item)}
                activeOpacity={0.85}
              >
                <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.completeBtnText}>COMPLETE</Text>
              </TouchableOpacity>

              {/* Secondary Actions: SNOOZE & TURN OFF */}
              <View style={styles.secondaryRow}>
                <TouchableOpacity
                  style={styles.snoozeBtn}
                  onPress={() => setShowSnoozeOptions(true)}
                  activeOpacity={0.85}
                >
                  <Clock size={16} color="#6366F1" style={{ marginRight: 6 }} />
                  <Text style={styles.snoozeBtnText}>SNOOZE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.turnOffBtn}
                  onPress={() => onTurnOff(item)}
                  activeOpacity={0.85}
                >
                  <X size={16} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.turnOffBtnText}>TURN OFF</Text>
                </TouchableOpacity>
              </View>

              {/* OPEN Action */}
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() => onOpen(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.openBtnText}>OPEN DETAILS</Text>
                <ExternalLink size={14} color="#6366F1" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.default,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.section,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  bellCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1.2,
    marginBottom: spacing.micro,
  },
  itemTitle: {
    ...typography.heading,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  timeText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: spacing.default,
  },
  notesText: {
    ...typography.caption,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: spacing.default,
  },
  completeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: spacing.default,
    borderRadius: radii.pill,
    marginBottom: spacing.compact,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeBtnText: {
    ...typography.caption,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  secondaryRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.default,
  },
  snoozeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: spacing.compact + 2,
    borderRadius: radii.pill,
    marginRight: spacing.small,
  },
  snoozeBtnText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  turnOffBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.compact + 2,
    borderRadius: radii.pill,
  },
  turnOffBtnText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  openBtnText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  snoozeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  snoozeTitle: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: spacing.compact,
  },
  snoozeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  snoozeChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.pill,
    margin: 4,
  },
  snoozeChipText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
});
