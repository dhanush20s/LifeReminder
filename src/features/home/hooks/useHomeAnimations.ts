import { useRef, useEffect, useMemo } from 'react';
import { Animated, Easing } from 'react-native';

export const useHomeAnimations = () => {
  const animatedValues = useRef({
    header: new Animated.Value(1),
    topWidget: new Animated.Value(1),
    quickAdd: new Animated.Value(1),
    attention: new Animated.Value(1),
    today: new Animated.Value(1),
    upcoming: new Animated.Value(1),
    glance: new Animated.Value(1),
  }).current;

  const hasAnimated = useRef(false);

  const playEntranceAnimation = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    Object.values(animatedValues).forEach((val) => val.setValue(0));

    Animated.stagger(40, [
      Animated.timing(animatedValues.header, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.topWidget, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.quickAdd, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.attention, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.today, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.upcoming, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues.glance, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    playEntranceAnimation();
  }, []);

  const styles = useMemo(() => {
    const makeStyle = (val: Animated.Value) => ({
      opacity: val,
      transform: [
        {
          translateY: val.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        },
      ],
    });

    return {
      headerStyle: makeStyle(animatedValues.header),
      topWidgetStyle: makeStyle(animatedValues.topWidget),
      quickAddStyle: makeStyle(animatedValues.quickAdd),
      attentionStyle: makeStyle(animatedValues.attention),
      todayStyle: makeStyle(animatedValues.today),
      upcomingStyle: makeStyle(animatedValues.upcoming),
      glanceStyle: makeStyle(animatedValues.glance),
    };
  }, [animatedValues]);

  return {
    playEntranceAnimation,
    ...styles,
  };
};
