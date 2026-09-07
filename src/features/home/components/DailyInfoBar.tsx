import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../../theme';
import { Target, Flame, Plus, Clock, Calendar, Trophy } from 'lucide-react-native';
import { useDailyInfoBar } from '../hooks/useDailyInfoBar';
import { DailyFocusBottomSheet } from './DailyFocusBottomSheet';
import { AutoLoopText } from '../../../components/AutoLoopText';

interface DailyInfoBarProps {
  navigation?: any;
}

const DynamicProgressClockCircle = ({ percentage }: { percentage: number }) => {
  const size = 38;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.svgWrapper}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background Track Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E0E7FF"
          strokeWidth={strokeWidth}
          fill="#EEF2FF"
        />
        {/* Dynamic Progress Arc (Only draws when percentage > 0) */}
        {percentage > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#4F46E5"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>
      <Clock size={16} color="#4F46E5" strokeWidth={2.4} />
    </View>
  );
};

export const DailyInfoBar: React.FC<DailyInfoBarProps> = ({ navigation }) => {
  const {
    weatherEnabled,
    weatherData,
    focusTimeText,
    completionPercentage,
    dailyFocus,
    streakCount,
    focusSheetVisible,
    openFocusSheet,
    closeFocusSheet,
    saveFocus,
    clearFocus,
  } = useDailyInfoBar();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.4, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [dailyFocus, streakCount, focusTimeText]);

  const showWeather = weatherEnabled && weatherData !== null;

  return (
    <View style={styles.container}>
      <View style={styles.cardStrip}>
        {/* Column 1: Focus Time OR Weather */}
        {showWeather ? (
          <View style={styles.column}>
            <View style={styles.weatherIconCircle}>
              <Text style={styles.emojiText}>{weatherData.conditionIcon}</Text>
            </View>
            <View style={styles.columnContent}>
              <Text style={styles.mainValueText} numberOfLines={1}>
                {weatherData.temperature}°
              </Text>
              <Text style={styles.subText} numberOfLines={1}>
                {weatherData.locationName}
              </Text>
              <View style={styles.bluePill}>
                <Text style={styles.bluePillText} numberOfLines={1}>{weatherData.condition}</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.column}
            onPress={() => navigation && navigation.navigate('CalendarTab')}
            activeOpacity={0.8}
          >
            <DynamicProgressClockCircle percentage={completionPercentage} />
            <View style={styles.columnContent}>
              <Text style={styles.mainValueText} numberOfLines={1}>
                {focusTimeText}
              </Text>
              <Text style={styles.subText} numberOfLines={1}>
                Focus Time
              </Text>
              <View style={styles.bluePill}>
                <Calendar size={9} color="#4F46E5" style={{ marginRight: 2 }} />
                <Text style={styles.bluePillText}>Today</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {/* Column 2: Daily Focus */}
        <TouchableOpacity
          style={styles.column}
          onPress={openFocusSheet}
          activeOpacity={0.8}
        >
          <View style={styles.greenIconCircle}>
            <Target size={18} color="#10B981" strokeWidth={2.2} />
          </View>
          <Animated.View style={[styles.columnContent, { opacity: fadeAnim }]}>
            <Text style={styles.sectionLabel} numberOfLines={1}>DAILY FOCUS</Text>
            <AutoLoopText
              text={dailyFocus || 'Set Focus'}
              style={styles.focusTitleText}
            />
            <TouchableOpacity onPress={openFocusSheet} style={styles.greenPill} activeOpacity={0.7}>
              <Plus size={9} color="#059669" style={{ marginRight: 2 }} strokeWidth={2.5} />
              <Text style={styles.greenPillText}>Change</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Column 3: Day Streak */}
        <View style={styles.column}>
          <View style={styles.orangeIconCircle}>
            <Flame size={18} color="#F97316" fill="#F97316" />
          </View>
          <Animated.View style={[styles.columnContent, { opacity: fadeAnim }]}>
            <Text style={styles.streakNumberText} numberOfLines={1}>
              {streakCount}
            </Text>
            <Text style={styles.subText} numberOfLines={1}>
              Day Streak
            </Text>
            <View style={styles.orangePill}>
              <Trophy size={8.5} color="#D97706" style={{ marginRight: 2 }} />
              <Text style={styles.orangePillText} numberOfLines={1}>Keep it up!</Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Daily Focus Edit/Clear Bottom Sheet */}
      <DailyFocusBottomSheet
        visible={focusSheetVisible}
        currentFocus={dailyFocus}
        onClose={closeFocusSheet}
        onSave={saveFocus}
        onClear={clearFocus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
  },
  cardStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  column: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 3,
  },
  // SVG Dynamic Progress Ring Wrapper
  svgWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 6,
  },
  weatherIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  emojiText: {
    fontSize: 16,
  },
  greenIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  orangeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  // Content Texts
  columnContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  mainValueText: {
    ...typography.heading,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  focusTitleText: {
    ...typography.heading,
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  streakNumberText: {
    ...typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
  },
  subText: {
    ...typography.caption,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  // Pills / Chips
  bluePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 1,
  },
  bluePillText: {
    ...typography.caption,
    fontSize: 8.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  greenPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 1,
  },
  greenPillText: {
    ...typography.caption,
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  orangePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 1,
  },
  orangePillText: {
    ...typography.caption,
    fontSize: 8.5,
    fontWeight: '700',
    color: '#D97706',
  },
});
