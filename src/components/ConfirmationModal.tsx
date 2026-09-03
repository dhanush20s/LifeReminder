import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Modal, 
  ActivityIndicator,
  Easing
} from 'react-native';
import { colors, spacing, radii, typography } from '../theme';
import { AlertTriangle, Trash2, Info, CheckCircle2 } from 'lucide-react-native';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'primary' | 'success';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: ConfirmationVariant;
  customIcon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onCancel,
  onConfirm,
  isLoading = false,
  variant = 'danger',
  customIcon,
}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState<boolean>(visible);

  useEffect(() => {
    if (visible) {
      animation.setValue(0);
      setIsModalVisible(true);
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
  }, [visible]);

  // Interpolations for 50% Black Opacity Backdrop, Subtle Smooth Scale & Fade
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5], // 50% Black Opacity
  });

  const cardOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  const cardScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  const handleDismiss = (callback: () => void) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      callback();
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: customIcon || <AlertTriangle size={22} color="#F59E0B" />,
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          buttonBg: '#F59E0B',
          buttonText: '#FFFFFF',
        };
      case 'info':
        return {
          icon: customIcon || <Info size={22} color="#3B82F6" />,
          badgeBg: 'rgba(59, 130, 246, 0.12)',
          buttonBg: '#3B82F6',
          buttonText: '#FFFFFF',
        };
      case 'success':
        return {
          icon: customIcon || <CheckCircle2 size={22} color="#10B981" />,
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          buttonBg: '#10B981',
          buttonText: '#FFFFFF',
        };
      case 'primary':
        return {
          icon: customIcon || <Info size={22} color={colors.primary} />,
          badgeBg: `${colors.primary}18`,
          buttonBg: colors.primary,
          buttonText: '#FFFFFF',
        };
      case 'danger':
      default:
        return {
          icon: customIcon || <Trash2 size={22} color="#EF4444" />,
          badgeBg: 'rgba(239, 68, 68, 0.12)',
          buttonBg: '#EF4444',
          buttonText: '#FFFFFF',
        };
    }
  };

  const variantStyle = getVariantStyles();

  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={() => handleDismiss(onCancel)}
    >
      <View style={styles.modalRoot}>
        {/* Exactly 50% Black Backdrop Opacity Interpolation */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => handleDismiss(onCancel)}
          />
        </Animated.View>

        {/* Smooth Subtle Scale + Fade Alert Dialog Card */}
        <Animated.View
          style={[
            styles.dialogCard,
            { 
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Icon Badge Header */}
          <View style={[styles.iconBadge, { backgroundColor: variantStyle.badgeBg }]}>
            {variantStyle.icon}
          </View>

          {/* Title & Description */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleDismiss(onCancel)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: variantStyle.buttonBg }]}
              onPress={() => handleDismiss(onConfirm)}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.confirmText, { color: variantStyle.buttonText }]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Backward compatible alias
export const DeleteConfirmationModal = ConfirmationModal;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.default,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000', // 50% Black Opacity when backdropOpacity = 0.5
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  titleText: {
    ...typography.title,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.micro,
    textAlign: 'center',
  },
  descriptionText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.default,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingVertical: spacing.compact,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmButton: {
    flex: 1,
    borderRadius: radii.field,
    paddingVertical: spacing.compact,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.small,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
  },
});
