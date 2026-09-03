import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  TextInput, 
  Alert,
  ScrollView
} from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { 
  Sparkles, 
  Sprout, 
  Plus, 
  Rocket, 
  Target, 
  Brain, 
  Trophy, 
  CheckCircle2,
  Trash2
} from 'lucide-react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { ConfirmationModal } from '../../../components/ConfirmationModal';

export type IconType = 'sprout' | 'rocket' | 'sparkles' | 'target' | 'brain' | 'trophy';

export interface NoteItem {
  id: string;
  quote: string;
  author?: string;
  iconType: IconType;
  accentColor: string;
}

const ICON_OPTIONS: { type: IconType; label: string; color: string }[] = [
  { type: 'sparkles', label: 'Poetry', color: '#818CF8' },
  { type: 'sprout', label: 'Growth', color: '#A7F3D0' },
  { type: 'rocket', label: 'Mindset', color: '#FDE68A' },
  { type: 'target', label: 'Goal', color: '#FCA5A5' },
  { type: 'brain', label: 'Clarity', color: '#6EE7B7' },
  { type: 'trophy', label: 'Focus', color: '#FCD34D' },
];

const DEFAULT_NOTES: NoteItem[] = [
  { id: '1', quote: 'Small steps create big changes.', author: 'Daily Focus', iconType: 'sprout', accentColor: '#A7F3D0' },
  { id: '2', quote: 'Focus on progress, not perfection.', author: 'Mindset', iconType: 'rocket', accentColor: '#FDE68A' },
  { id: '3', quote: 'Your future is created by what you do today.', author: 'Motivation', iconType: 'sparkles', accentColor: '#818CF8' },
  { id: '4', quote: 'Done is better than perfect.', author: 'Productivity', iconType: 'target', accentColor: '#FCA5A5' },
  { id: '5', quote: 'Organize your mind, simplify your life.', author: 'Clarity', iconType: 'brain', accentColor: '#6EE7B7' },
  { id: '6', quote: 'One task at a time, one victory at a time.', author: 'Focus', iconType: 'trophy', accentColor: '#FCD34D' },
];

export const MotivationalNotesCard: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Bottom Sheet State
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newQuoteText, setNewQuoteText] = useState<string>('');
  const [newAuthorText, setNewAuthorText] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<IconType>('sparkles');

  // Custom Delete Confirmation Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  const currentIndexRef = useRef(currentIndex);
  const notesRef = useRef(notes);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Inner Card Content Animation Values
  const contentPanX = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentScaleAnim = useRef(new Animated.Value(1)).current;

  const currentNote = notes[currentIndex % notes.length] || DEFAULT_NOTES[0];

  const animateToNote = (nextIdx: number, direction: 'left' | 'right') => {
    const exitX = direction === 'left' ? -80 : 80;
    const enterX = direction === 'left' ? 80 : -80;

    Animated.parallel([
      Animated.timing(contentPanX, {
        toValue: exitX,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(nextIdx);
      contentPanX.setValue(enterX);
      Animated.parallel([
        Animated.spring(contentPanX, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(contentScaleAnim, {
          toValue: 1.0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (notesRef.current.length === 0) return;
    const total = notesRef.current.length;
    const nextIdx = (currentIndexRef.current + 1) % total;
    animateToNote(nextIdx, 'left');
  };

  const handlePrev = () => {
    if (notesRef.current.length === 0) return;
    const total = notesRef.current.length;
    const prevIdx = (currentIndexRef.current - 1 + total) % total;
    animateToNote(prevIdx, 'right');
  };

  // Trigger Custom Delete Confirmation Modal
  const handleDeletePress = () => {
    if (notes.length <= 1) {
      Alert.alert('Cannot Delete', 'You must keep at least one motivational note.');
      return;
    }
    setDeleteModalVisible(true);
  };

  // Perform Animated Deletion of Current Note
  const handleConfirmDeleteNote = () => {
    setDeleteModalVisible(false);

    // Animate Card Out (Fade + Scale down)
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentScaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const noteToDelete = notes[currentIndex % notes.length];
      const updatedNotes = notes.filter((n) => n.id !== noteToDelete.id);
      setNotes(updatedNotes);
      setCurrentIndex(0);

      // Animate Next Card Back In
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(contentScaleAnim, {
          toValue: 1.0,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // PanResponder for Inner Content Swipe Gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        contentPanX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -25) {
          handleNext();
        } else if (gestureState.dx > 25) {
          handlePrev();
        } else {
          Animated.spring(contentPanX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSaveCustomNote = () => {
    if (!newQuoteText.trim()) {
      Alert.alert('Empty Note', 'Please enter a poem or note before saving.');
      return;
    }

    const matchedIcon = ICON_OPTIONS.find((opt) => opt.type === selectedIcon) || ICON_OPTIONS[0];

    const newNote: NoteItem = {
      id: Date.now().toString(),
      quote: newQuoteText.trim(),
      author: newAuthorText.trim() || matchedIcon.label,
      iconType: selectedIcon,
      accentColor: matchedIcon.color,
    };

    setNotes([newNote, ...notes]);
    setCurrentIndex(0);
    setAddModalVisible(false);
    setNewQuoteText('');
    setNewAuthorText('');
  };

  const renderIcon = (type: IconType, color: string, size: number = 22) => {
    switch (type) {
      case 'rocket': return <Rocket size={size} color={color} />;
      case 'sparkles': return <Sparkles size={size} color={color} />;
      case 'target': return <Target size={size} color={color} />;
      case 'brain': return <Brain size={size} color={color} />;
      case 'trophy': return <Trophy size={size} color={color} />;
      default: return <Sprout size={size} color={color} />;
    }
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Fixed Outer Card Container */}
      <View style={styles.quoteCard} {...panResponder.panHandlers}>
        {/* Header Row: Fixed Quote marks + Delete + Add Poet Buttons */}
        <View style={styles.quoteHeader}>
          <TouchableOpacity onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.quoteMarks}>“</Text>
          </TouchableOpacity>

          <View style={styles.headerRightRow}>
            {/* Dots Indicator */}
            <View style={styles.dotsRow}>
              {notes.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex % notes.length && { backgroundColor: currentNote.accentColor, width: 10 },
                  ]}
                />
              ))}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeletePress}
              activeOpacity={0.8}
            >
              <Trash2 size={13} color="#F87171" />
            </TouchableOpacity>

            {/* Creative Poet Add (+) Button */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* INNER ANIMATED CONTENT */}
        <Animated.View
          style={[
            styles.innerContentContainer,
            {
              transform: [{ translateX: contentPanX }, { scale: contentScaleAnim }],
              opacity: contentFadeAnim,
            },
          ]}
        >
          {/* Note / Quote Text */}
          <TouchableOpacity style={styles.quoteContentBtn} onPress={handleNext} activeOpacity={0.9}>
            <Text style={styles.quoteText} numberOfLines={3}>
              {currentNote.quote}
            </Text>
          </TouchableOpacity>

          {/* Bottom Row: Accent Icon + Author Tag */}
          <View style={styles.bottomRow}>
            <Text style={[styles.authorTag, { color: currentNote.accentColor }]}>
              {currentNote.author || 'Poetry'}
            </Text>
            <View style={styles.iconWrapper}>
              {renderIcon(currentNote.iconType, currentNote.accentColor)}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* REUSABLE PREMIUM BOTTOM SHEET MODAL */}
      <BottomSheet
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setNewQuoteText('');
          setNewAuthorText('');
        }}
        title="Add Creative Note / Poem"
        icon={<Sparkles size={18} color={colors.primary} style={{ marginRight: 6 }} />}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Note/Poem Input Field */}
          <Text style={styles.inputLabel}>POEM / NOTE CONTENT</Text>
          <TextInput
            style={styles.sheetInput}
            placeholder="Write your inspiring poem or note..."
            placeholderTextColor={colors.textMuted}
            value={newQuoteText}
            onChangeText={setNewQuoteText}
            multiline
            numberOfLines={3}
            autoFocus
          />

          {/* Author / Category Input */}
          <Text style={styles.inputLabel}>AUTHOR / CATEGORY (OPTIONAL)</Text>
          <TextInput
            style={styles.sheetAuthorInput}
            placeholder="e.g. Daily Poetry, Mindset..."
            placeholderTextColor={colors.textMuted}
            value={newAuthorText}
            onChangeText={setNewAuthorText}
          />

          {/* Icon Selection Dropdown / Selector */}
          <Text style={styles.inputLabel}>CHOOSE ACCENT ICON</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iconOptionsRow}
          >
            {ICON_OPTIONS.map((opt) => {
              const isSelected = selectedIcon === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.iconChip,
                    isSelected && { borderColor: opt.color, backgroundColor: `${opt.color}15` },
                  ]}
                  onPress={() => setSelectedIcon(opt.type)}
                  activeOpacity={0.8}
                >
                  <View style={styles.chipIconBox}>
                    {renderIcon(opt.type, opt.color, 18)}
                  </View>
                  <Text style={[styles.chipText, isSelected && { color: colors.textPrimary, fontWeight: '700' }]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedCheckBadge, { backgroundColor: opt.color }]}>
                      <CheckCircle2 size={10} color="#0F172A" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.sheetSaveBtn} 
            onPress={handleSaveCustomNote}
            activeOpacity={0.85}
          >
            <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.sheetSaveText}>Save to Collection</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>

      {/* REUSABLE PREMIUM CONFIRMATION MODAL */}
      <ConfirmationModal
        visible={deleteModalVisible}
        variant="danger"
        title="Delete Note?"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDeleteNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    marginLeft: spacing.small,
  },
  quoteCard: {
    backgroundColor: '#0F172A',
    borderRadius: radii.card,
    padding: spacing.compact,
    justifyContent: 'space-between',
    height: 110,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  quoteMarks: {
    fontSize: 22,
    fontWeight: '800',
    color: '#818CF8',
    lineHeight: 22,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 1.5,
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  addBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 2,
  },
  quoteContentBtn: {
    flex: 1,
    justifyContent: 'center',
  },
  quoteText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  authorTag: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconWrapper: {
    alignItems: 'flex-end',
  },
  inputLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.micro,
    marginTop: spacing.small,
  },
  sheetInput: {
    backgroundColor: colors.background,
    borderRadius: radii.field,
    padding: spacing.default,
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 75,
    textAlignVertical: 'top',
  },
  sheetAuthorInput: {
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconOptionsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.micro,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.compact,
    marginRight: spacing.small,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipIconBox: {
    marginRight: 6,
  },
  chipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectedCheckBadge: {
    marginLeft: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetSaveBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.default,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.default,
    marginBottom: spacing.small,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sheetSaveText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
});
