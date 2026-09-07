import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { MapPin, Check } from 'lucide-react-native';

interface ParkingFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    floor?: string;
    slot?: string;
    locationNotes?: string;
  }) => Promise<void>;
}

export const ParkingFormSheet: React.FC<ParkingFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [floor, setFloor] = useState('');
  const [slot, setSlot] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!floor.trim() && !slot.trim() && !locationNotes.trim()) {
      setErrorMsg('Please enter floor, slot number, or location details');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit({
        floor: floor.trim() || undefined,
        slot: slot.trim() || undefined,
        locationNotes: locationNotes.trim() || undefined,
      });

      setFloor('');
      setSlot('');
      setLocationNotes('');
      onClose();
    } catch (err) {
      console.error('Error saving parking location:', err);
      setErrorMsg('Failed to save parking location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Save Parking Spot"
      icon={<MapPin size={20} color="#F59E0B" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Floor & Slot Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>FLOOR / LEVEL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. B2, P3, Level 1"
              placeholderTextColor="#94A3B8"
              value={floor}
              onChangeText={(txt) => {
                setFloor(txt);
                if (errorMsg) setErrorMsg('');
              }}
              autoFocus
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>SLOT / SPOT NO.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 104, Spot A-12"
              placeholderTextColor="#94A3B8"
              value={slot}
              onChangeText={(txt) => {
                setSlot(txt);
                if (errorMsg) setErrorMsg('');
              }}
            />
          </View>
        </View>

        {/* Location Notes */}
        <Text style={styles.fieldLabel}>LOCATION NOTES / LANDMARKS</Text>
        <TextInput
          style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
          placeholder="e.g. Phoenix Mall B2, near pillar 4, west elevator"
          placeholderTextColor="#94A3B8"
          value={locationNotes}
          onChangeText={setLocationNotes}
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
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Parking Spot'}</Text>
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
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#F59E0B',
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
