import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme';
import { useDayProgress } from '../hooks/useDayProgress';
import { DayProgressHeroCard } from './DayProgressHeroCard';
import { NextUpSection } from './NextUpSection';

interface TopWidgetRowProps {
  navigation?: any;
}

export const TopWidgetRow: React.FC<TopWidgetRowProps> = ({ navigation }) => {
  const {
    totalTodayItems,
    completedItems,
    remainingItems,
    percentage,
    motivationalMessage,
    isEmpty,
  } = useDayProgress();

  return (
    <View style={styles.container}>
      {/* Left Progress Card Wrapper */}
      <View style={styles.leftCardWrapper}>
        <DayProgressHeroCard
          totalTodayItems={totalTodayItems}
          completedItems={completedItems}
          remainingItems={remainingItems}
          percentage={percentage}
          motivationalMessage={motivationalMessage}
          isEmpty={isEmpty}
        />
      </View>

      {/* Right Next Up Single Card Wrapper */}
      <View style={styles.rightCardWrapper}>
        <NextUpSection navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  leftCardWrapper: {
    flex: 1,
    marginRight: 6,
    height: 142,
  },
  rightCardWrapper: {
    flex: 1,
    marginLeft: 6,
    height: 142,
  },
});
