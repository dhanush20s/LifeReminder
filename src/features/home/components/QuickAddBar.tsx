import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  PanResponder,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import {
  Zap,
  SlidersHorizontal,
  Bell,
  CheckSquare,
  IndianRupee,
  CreditCard,
  Edit3,
  ListChecks,
  HandHandshake,
  ShieldAlert,
  Brain,
  Plus,
  X,
} from 'lucide-react-native';
import { QuickAddShortcutItem } from '../../../database/repositories/quickAddRepository';
import { AddShortcutBottomSheet } from './AddShortcutBottomSheet';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ICON_MAP: Record<string, any> = {
  Bell,
  CheckSquare,
  IndianRupee,
  CreditCard,
  Edit3,
  ListChecks,
  HandHandshake,
  ShieldAlert,
  Zap,
  Brain,
};

// Smooth Spring LayoutAnimation for fluid item swapping
const smoothSpringConfig = {
  duration: 280,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.78,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

interface QuickAddBarProps {
  shortcuts: QuickAddShortcutItem[];
  availableShortcuts: QuickAddShortcutItem[];
  onSelectType: (type: string) => void;
  onOpenQuickAdd: () => void;
  onRemoveShortcut: (id: string) => void;
  onAddShortcut: (item: QuickAddShortcutItem) => void;
  onReorderShortcuts: (fromIndex: number, toIndex: number) => void;
  onSaveCustomization: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  shortcuts,
  availableShortcuts,
  onSelectType,
  onOpenQuickAdd,
  onRemoveShortcut,
  onAddShortcut,
  onReorderShortcuts,
  onSaveCustomization,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Drag displacement animation value
  const dragX = useRef(new Animated.Value(0)).current;

  // iOS-style Jiggle / Wiggle Animation
  const jiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCustomizing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(jiggleAnim, {
            toValue: 1,
            duration: 110,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(jiggleAnim, {
            toValue: -1,
            duration: 110,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(jiggleAnim, {
            toValue: 0,
            duration: 110,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      jiggleAnim.setValue(0);
    }
  }, [isCustomizing, jiggleAnim]);

  const toggleCustomize = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(smoothSpringConfig);
    }
    if (isCustomizing) {
      onSaveCustomization();
    }
    setIsCustomizing(!isCustomizing);
  };

  const handleRemove = (id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(smoothSpringConfig);
    }
    onRemoveShortcut(id);
  };

  // Interpolated rotation & translation for jiggle animation
  const jiggleRotate = jiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2.5deg', '0deg', '2.5deg'],
  });

  const jiggleTranslateY = jiggleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-1, 0, 1],
  });

  // Calculate width per slot for drag displacement math
  const totalItems = shortcuts.length + (availableShortcuts.length > 0 ? 1 : 0);
  const slotWidth = cardWidth > 0 && totalItems > 0 ? cardWidth / totalItems : 60;

  // Refs for tracking active drag state inside PanResponder callbacks
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const slotWidthRef = useRef(slotWidth);
  slotWidthRef.current = slotWidth;

  const onReorderRef = useRef(onReorderShortcuts);
  onReorderRef.current = onReorderShortcuts;

  const activeDragIndexRef = useRef<number | null>(null);

  // PanResponder map for smooth touch drag-and-drop reordering
  const createPanResponder = (item: QuickAddShortcutItem, index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => isCustomizing,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        isCustomizing && Math.abs(gestureState.dx) > 6,
      onPanResponderGrant: () => {
        activeDragIndexRef.current = index;
        setDraggingId(item.id);
        dragX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        dragX.setValue(gestureState.dx);
        const currIndex = activeDragIndexRef.current;
        const curSlotWidth = slotWidthRef.current;
        const curList = shortcutsRef.current;

        if (currIndex !== null && curSlotWidth > 0) {
          let targetIndex = currIndex;
          const threshold = curSlotWidth * 0.55;

          if (gestureState.dx > threshold && currIndex < curList.length - 1) {
            targetIndex = currIndex + 1;
          } else if (gestureState.dx < -threshold && currIndex > 0) {
            targetIndex = currIndex - 1;
          }

          if (targetIndex !== currIndex) {
            if (Platform.OS !== 'web') {
              LayoutAnimation.configureNext(smoothSpringConfig);
            }
            onReorderRef.current(currIndex, targetIndex);
            activeDragIndexRef.current = targetIndex;
            dragX.setValue(gestureState.dx - (targetIndex - currIndex) * curSlotWidth);
          }
        }
      },
      onPanResponderRelease: () => {
        activeDragIndexRef.current = null;
        setDraggingId(null);
        Animated.spring(dragX, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        activeDragIndexRef.current = null;
        setDraggingId(null);
        Animated.spring(dragX, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }).start();
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.zapIconCircle}>
            <Zap size={16} color="#6366F1" fill="#6366F1" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <Text style={styles.sectionSubtitle}>
              {isCustomizing
                ? 'Tap to add or drag to reorder'
                : 'Capture things quickly, stay organized'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.customizeBtn, isCustomizing && styles.doneBtn]}
          onPress={toggleCustomize}
          activeOpacity={0.8}
        >
          <Text style={[styles.customizeText, isCustomizing && styles.doneText]}>
            {isCustomizing ? 'Done' : 'Customize '}
          </Text>
          {!isCustomizing && <SlidersHorizontal size={12} color="#4F46E5" />}
        </TouchableOpacity>
      </View>

      {/* Main Card Surface */}
      <View
        style={[styles.cardContainer, isCustomizing && styles.cardContainerCustomizing]}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        {shortcuts.map((act, index) => {
          const IconComp = ICON_MAP[act.iconName] || Bell;
          const isBeingDragged = draggingId === act.id;
          const panResponder = createPanResponder(act, index);

          return (
            <Animated.View
              key={act.id}
              {...(isCustomizing ? panResponder.panHandlers : {})}
              style={[
                styles.actionItem,
                isBeingDragged && styles.actionItemDragging,
                isCustomizing && !isBeingDragged && {
                  transform: [
                    { rotate: index % 2 === 0 ? jiggleRotate : jiggleRotate },
                    { translateY: index % 2 === 0 ? jiggleTranslateY : Animated.multiply(jiggleTranslateY, -1) },
                  ],
                },
                isBeingDragged && {
                  transform: [
                    { translateX: dragX },
                    { translateY: -6 },
                    { scale: 1.12 },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => {
                  if (!isCustomizing) {
                    onSelectType(act.type);
                  }
                }}
                activeOpacity={isCustomizing ? 1 : 0.75}
              >
                <View style={[styles.iconPill, { backgroundColor: act.bgColor }]}>
                  <IconComp size={20} color={act.iconColor} />

                  {/* Remove Badge (×) in Customize Mode */}
                  {isCustomizing && (
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => handleRemove(act.id)}
                      activeOpacity={0.8}
                    >
                      <X size={11} color="#64748B" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {act.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Add (+) or More Button */}
        {isCustomizing ? (
          availableShortcuts.length > 0 && (
            <Animated.View
              style={[
                styles.actionItem,
                {
                  transform: [{ rotate: jiggleRotate }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setAddSheetVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.addShortcutPill}>
                  <Plus size={20} color="#4F46E5" strokeWidth={2.5} />
                </View>
                <Text style={styles.actionLabel}>+ Add</Text>
              </TouchableOpacity>
            </Animated.View>
          )
        ) : (
          <TouchableOpacity style={styles.actionItem} onPress={onOpenQuickAdd} activeOpacity={0.8}>
            <View style={styles.moreFab}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.actionLabel}>More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Shortcut Selection Sheet */}
      <AddShortcutBottomSheet
        visible={addSheetVisible}
        availableShortcuts={availableShortcuts}
        onClose={() => setAddSheetVisible(false)}
        onSelectShortcut={(item) => {
          onAddShortcut(item);
          setAddSheetVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zapIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
    lineHeight: 18,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.compact + 2,
    paddingVertical: spacing.compact - 2,
    borderRadius: radii.pill,
  },
  customizeText: {
    ...typography.caption,
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: spacing.default,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  doneText: {
    color: '#FFFFFF',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: spacing.default,
    paddingHorizontal: spacing.compact,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardContainerCustomizing: {
    borderColor: '#C7D2FE',
    backgroundColor: '#FAF5FF',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
  },
  actionItemDragging: {
    zIndex: 100,
    elevation: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  removeBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addShortcutPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  moreFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});
