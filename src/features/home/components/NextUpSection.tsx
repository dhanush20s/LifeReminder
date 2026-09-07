import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  LayoutChangeEvent
} from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { 
  Zap, 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  User, 
  Bell, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react-native';
import { useNextUp } from '../hooks/useNextUp';
import { NextUpEmptyState } from './NextUpEmptyState';
import { RankedNextUpItem } from '../../../services/homePriorityService';

interface NextUpSectionProps {
  navigation: any;
}

export const NextUpSection: React.FC<NextUpSectionProps> = ({ navigation }) => {
  const { rankedItems, isEmpty, navigateToItemDetail } = useNextUp();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [innerViewportWidth, setInnerViewportWidth] = useState<number>(140);

  const scrollRef = useRef<ScrollView>(null);

  if (isEmpty) {
    return <NextUpEmptyState />;
  }

  const currentItem: RankedNextUpItem = rankedItems[activeIndex] || rankedItems[0];
  const isOverdue = currentItem.urgency === 'critical' && currentItem.tagLabel === 'OVERDUE';

  const handleCardLayout = (event: LayoutChangeEvent) => {
    const containerWidth = event.nativeEvent.layout.width;
    // Padding horizontal is 16 on left & 16 on right (32 total)
    if (containerWidth > 32) {
      setInnerViewportWidth(containerWidth - 32);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width || innerViewportWidth;
    if (layoutWidth > 0) {
      const index = Math.round(contentOffsetX / layoutWidth);
      if (index >= 0 && index < rankedItems.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const getIcon = (type: string) => {
    const iconSize = 18;
    switch (type) {
      case 'bill':
      case 'subscription':
        return <CreditCard size={iconSize} color="#FDE68A" />;
      case 'expiry':
        return <Shield size={iconSize} color="#C4B5FD" />;
      case 'borrow':
        return <User size={iconSize} color="#FBCFE8" />;
      case 'task':
      case 'checklist':
        return <CheckSquare size={iconSize} color="#A7F3D0" />;
      case 'reminder':
        return <Bell size={iconSize} color="#A5B4FC" />;
      default:
        return <ShoppingCart size={iconSize} color="#A5B4FC" />;
    }
  };

  const getIconBoxBg = (type: string) => {
    switch (type) {
      case 'bill':
      case 'subscription':
        return 'rgba(245, 158, 11, 0.25)';
      case 'expiry':
        return 'rgba(139, 92, 246, 0.25)';
      case 'borrow':
        return 'rgba(236, 72, 153, 0.25)';
      case 'task':
      case 'checklist':
        return 'rgba(16, 185, 129, 0.25)';
      default:
        return 'rgba(99, 102, 241, 0.25)';
    }
  };

  return (
    <View 
      style={[styles.singleCardContainer, isOverdue && styles.overdueBorder]}
      onLayout={handleCardLayout}
    >
      {/* Dynamic Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.tagRow}>
          {isOverdue ? (
            <AlertTriangle size={13} color="#EF4444" style={{ marginRight: 4 }} />
          ) : (
            <Zap size={13} color={currentItem.tagColor} fill={currentItem.tagColor} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.tagText, { color: currentItem.tagColor }]}>
            {currentItem.tagLabel}
          </Text>
        </View>

        {/* Micro Pager Indicator Dots inside card header */}
        <View style={styles.pagerDotsRow}>
          {rankedItems.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Scrollable Content INSIDE the Single Card Boundary */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.innerScrollContent}
      >
        {rankedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.innerItemSlide, { width: innerViewportWidth }]}
            onPress={() => navigateToItemDetail(item, navigation)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, { backgroundColor: getIconBoxBg(item.type) }]}>
              {getIcon(item.type)}
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.dateStrText} numberOfLines={1}>
                {item.dateStr}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dynamic Footer Row */}
      <View style={styles.footerRow}>
        <View style={styles.relativeTimeRow}>
          <Clock size={13} color={isOverdue ? '#F87171' : '#F472B6'} style={{ marginRight: 4 }} />
          <Text style={[styles.relativeTimeText, isOverdue && styles.overdueText]}>
            {currentItem.relativeTime}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.arrowCircleBtn}
          onPress={() => navigateToItemDetail(currentItem, navigation)}
          activeOpacity={0.8}
        >
          <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  singleCardContainer: {
    flex: 1,
    height: 142,
    backgroundColor: '#0F172A',
    borderRadius: radii.card,
    padding: spacing.default,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  overdueBorder: {
    borderColor: '#EF4444',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pagerDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginLeft: 3,
  },
  dotActive: {
    width: 12,
    backgroundColor: '#A5B4FC',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  innerScrollContent: {
    alignItems: 'center',
  },
  innerItemSlide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateStrText: {
    ...typography.caption,
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relativeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relativeTimeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#F472B6',
  },
  overdueText: {
    color: '#F87171',
  },
  arrowCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
