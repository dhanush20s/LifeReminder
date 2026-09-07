import React from 'react';

let NativeDateTimePickerModal: any = null;
try {
  NativeDateTimePickerModal = require('react-native-modal-datetime-picker').default;
} catch (e) {
  NativeDateTimePickerModal = null;
}

interface DateTimePickerModalProps {
  isVisible: boolean;
  mode?: 'date' | 'time' | 'datetime';
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  date?: Date;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = (props) => {
  if (NativeDateTimePickerModal) {
    const Component = NativeDateTimePickerModal;
    return <Component {...props} />;
  }

  // Fallback if native package is not present in test runner
  return null;
};

export default DateTimePickerModal;
