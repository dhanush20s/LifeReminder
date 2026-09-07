import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { CloudRain, Target, Flame, MapPin, Sun, CloudSun, Cloud, CloudLightning, CloudSnow, CloudFog } from 'lucide-react-native';
import { weatherService, WeatherData } from '../services/weatherService';

export const MiddleMetricsRow: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    weatherService.getCurrentWeather().then(setWeather).catch(() => {});
  }, []);

  const getWeatherIcon = (type?: WeatherData['conditionType']) => {
    const iconSize = 18;
    switch (type) {
      case 'sun': return <Sun size={iconSize} color="#F59E0B" />;
      case 'cloud-sun': return <CloudSun size={iconSize} color="#F59E0B" />;
      case 'cloud': return <Cloud size={iconSize} color="#64748B" />;
      case 'rain': return <CloudRain size={iconSize} color="#3B82F6" />;
      case 'thunder': return <CloudLightning size={iconSize} color="#8B5CF6" />;
      case 'snow': return <CloudSnow size={iconSize} color="#06B6D4" />;
      case 'fog': return <CloudFog size={iconSize} color="#94A3B8" />;
      default: return <CloudRain size={iconSize} color="#3B82F6" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Col 1: Weather */}
      <View style={styles.metricCol}>
        <View style={styles.weatherTopRow}>
          <View style={styles.iconCircleBlue}>
            {getWeatherIcon(weather?.conditionType)}
          </View>
          <Text style={styles.tempText}>{weather ? `${weather.temp}°` : '33°'}</Text>
        </View>
        <Text style={styles.descText} numberOfLines={1}>
          {weather ? weather.condition : 'Light Rain'}
        </Text>
        <View style={styles.cityRow}>
          <MapPin size={9} color="#94A3B8" style={{ marginRight: 2 }} />
          <Text style={styles.cityText} numberOfLines={1}>
            {weather ? weather.city : 'Chennai'}
          </Text>
        </View>
      </View>

      <View style={styles.dividerLine} />

      {/* Col 2: Daily Focus */}
      <View style={styles.metricColFlex}>
        <View style={styles.focusHeaderRow}>
          <View style={styles.iconCircleGreen}>
            <Target size={16} color="#10B981" />
          </View>
          <Text style={styles.focusLabel}>DAILY FOCUS</Text>
        </View>
        <Text style={styles.focusSubText} numberOfLines={2}>
          Small steps create big changes.
        </Text>
      </View>

      <View style={styles.dividerLine} />

      {/* Col 3: Streak */}
      <View style={styles.metricCol}>
        <View style={styles.streakTopRow}>
          <View style={styles.iconCircleOrange}>
            <Flame size={16} color="#F97316" fill="#F97316" />
          </View>
          <Text style={styles.streakNumberText}>2</Text>
        </View>
        <Text style={styles.streakSubText}>Day Streak</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: spacing.compact,
    paddingHorizontal: spacing.default,
    marginBottom: spacing.default,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricCol: {
    width: 90,
    justifyContent: 'center',
  },
  metricColFlex: {
    flex: 1,
    paddingHorizontal: spacing.compact,
    justifyContent: 'center',
  },
  dividerLine: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  // Icon Circles
  iconCircleBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconCircleGreen: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconCircleOrange: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  // Col 1 Weather Styles
  weatherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    ...typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  descText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  cityText: {
    ...typography.caption,
    fontSize: 10,
    color: '#94A3B8',
  },
  // Col 2 Daily Focus Styles
  focusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  focusLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  focusSubText: {
    ...typography.caption,
    fontSize: 10,
    color: '#475569',
    lineHeight: 13,
  },
  // Col 3 Streak Styles
  streakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumberText: {
    ...typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  streakSubText: {
    ...typography.caption,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
