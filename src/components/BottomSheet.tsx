import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Modal, 
  Platform,
  ScrollView,
  Easing,
  Dimensions,
  PanResponder,
  Keyboard,
  KeyboardEvent
} from 'react-native';
import { colors, spacing, radii, typography } from '../theme';
import { X, CheckCircle2 } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetOption {
  lookupId: string | number;
  lookupValues: string;
  [key: string]: any;
}

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  options?: BottomSheetOption[];
  selected?: string | number | null;
  onSelect?: (lookupId: string | number) => void;
  children?: React.ReactNode;
  maxHeight?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  icon,
  options,
  selected,
  onSelect,
  children,
  maxHeight = SCREEN_HEIGHT * 0.75,
}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(visible);

  // Soft Input / Keyboard Height Event Listener
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: KeyboardEvent) => {
      const kh = e.endCoordinates ? e.endCoordinates.height : 280;
      Animated.timing(keyboardOffset, {
        toValue: -kh,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const onKeyboardHide = (e?: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e && e.duration ? e.duration : 200) : 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      dragY.setValue(0);
      keyboardOffset.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Keyboard.dismiss();
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
        dragY.setValue(0);
        keyboardOffset.setValue(0);
      });
    }
  }, [visible]);

  // Draggable Gesture Handler (Drag down to dismiss)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Keyboard.dismiss();
          Animated.timing(dragY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  // Total Y Translation combining entrance slide, gesture drag, and soft input keyboard offset
  const totalTranslateY = Animated.add(
    Animated.add(translateY, dragY),
    keyboardOffset
  );

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5], // Exactly 50% Black Opacity
  });

  const handleSelect = (lookupId: string | number) => {
    if (onSelect) {
      onSelect(lookupId);
    }
    Keyboard.dismiss();
    onClose();
  };

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        {/* Soft 50% Black Backdrop Overlay */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        {/* Sliding, Draggable & Soft-Input Keyboard-Avoided Bottom Sheet Container */}
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight },
            { transform: [{ translateY: totalTranslateY }] },
          ]}
        >
          {/* Top Handle Bar (Draggable) */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Optional Header with Icon & Title */}
          {title ? (
            <View style={styles.sheetHeader} {...panResponder.panHandlers}>
              <View style={styles.headerTitleRow}>
                {icon}
                <Text style={styles.title}>{title}</Text>
              </View>

              <TouchableOpacity 
                style={styles.closeIconBtn} 
                onPress={handleBackdropPress}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Option List Mode OR Custom Content Mode */}
          {options && options.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {options.map((item, i) => {
                const isSelected = selected === item.lookupId;
                return (
                  <TouchableOpacity
                    key={item.lookupId ?? i}
                    style={styles.optionItem}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.lookupId)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.lookupValues}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={{ marginLeft: 16 }}>
                        <CheckCircle2 size={22} color="#10B981" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            children
          )}

          <View style={{ height: Platform.OS === 'ios' ? 24 : 12 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    flexShrink: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeIconBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});
