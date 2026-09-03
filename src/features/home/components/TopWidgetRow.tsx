import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  RefreshCw,
  MapPin
} from 'lucide-react-native';
import { weatherService, WeatherData } from '../services/weatherService';
import { MotivationalNotesCard } from './MotivationalNotesCard';

export const TopWidgetRow: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Micro-interaction Touch Scale Animation for Weather Card
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Rotating Spin Icon Animation
  const spinValue = useRef(new Animated.Value(0)).current;

  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinAnimation = () => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadWeather = async () => {
    try {
      setLoading(true);
      startSpinAnimation();
      const data = await weatherService.getCurrentWeather();
      setWeather(data);
    } catch (err) {
      console.warn('Failed to load dynamic weather:', err);
    } finally {
      setLoading(false);
      stopSpinAnimation();
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const getWeatherIcon = (type?: WeatherData['conditionType']) => {
    const iconSize = 24;
    switch (type) {
      case 'sun': return <Sun size={iconSize} color="#F59E0B" />;
      case 'cloud-sun': return <CloudSun size={iconSize} color="#F59E0B" />;
      case 'cloud': return <Cloud size={iconSize} color="#64748B" />;
      case 'rain': return <CloudRain size={iconSize} color="#3B82F6" />;
      case 'thunder': return <CloudLightning size={iconSize} color="#8B5CF6" />;
      case 'snow': return <CloudSnow size={iconSize} color="#06B6D4" />;
      case 'fog': return <CloudFog size={iconSize} color="#94A3B8" />;
      default: return <Sun size={iconSize} color="#F59E0B" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Card: Dynamic Interactive Weather & Date Card */}
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.weatherCard}
          onPress={loadWeather}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.weatherTopRow}>
            <View style={styles.iconRow}>
              {getWeatherIcon(weather?.conditionType)}
              {loading && (
                <Animated.View style={{ marginLeft: 6, transform: [{ rotate: spinInterpolate }] }}>
                  <RefreshCw size={14} color={colors.primary} />
                </Animated.View>
              )}
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.dayNameText}>{weather?.dayName || 'THURSDAY'}</Text>
              <Text style={styles.dayNumText}>{weather?.dayNum || '03'}</Text>
              <Text style={styles.monthText}>{weather?.monthName || 'September'}</Text>
            </View>
          </View>

          <View style={styles.weatherBottomRow}>
            <Text style={styles.tempText}>{weather ? `${weather.temp}°` : '32°'}</Text>
            <View style={styles.locationCol}>
              <Text style={styles.weatherDescText} numberOfLines={1}>
                {weather ? weather.condition : 'Sunny'}
              </Text>
              <View style={styles.cityRow}>
                <MapPin size={11} color={colors.primary} style={styles.mapPinIcon} />
                <Text style={styles.cityText} numberOfLines={1}>
                  {weather ? weather.city : 'Chennai'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Right Card: Interactive Swipeable Motivational Notes / Poetry Card */}
      <MotivationalNotesCard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.default,
  },
  weatherCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: radii.card,
    padding: spacing.compact,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: '#E9E3FF',
    justifyContent: 'space-between',
    height: 110,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dayNameText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  dayNumText: {
    ...typography.heading,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  monthText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  weatherBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    ...typography.heading,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: spacing.compact,
    lineHeight: 28,
  },
  locationCol: {
    flex: 1,
    justifyContent: 'center',
  },
  weatherDescText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 13,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  mapPinIcon: {
    marginRight: 3,
  },
  cityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 13,
  },
});
