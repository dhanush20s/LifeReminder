import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, TextStyle, StyleProp, ScrollView } from 'react-native';

interface AutoLoopTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  delayMs?: number;
  speedMsPerPixel?: number;
}

export const AutoLoopText: React.FC<AutoLoopTextProps> = ({
  text,
  style,
  delayMs = 800,
  speedMsPerPixel = 30,
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollAnim.stopAnimation();
    scrollAnim.setValue(0);

    if (containerWidth <= 0 || textWidth <= 0) return;

    const overflow = textWidth - containerWidth;
    if (overflow > 2) {
      const duration = Math.max(1800, overflow * speedMsPerPixel);

      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(delayMs),
          Animated.timing(scrollAnim, {
            toValue: -overflow,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(delayMs),
          Animated.timing(scrollAnim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [textWidth, containerWidth, text, delayMs, speedMsPerPixel, scrollAnim]);

  const overflow = textWidth - containerWidth;
  const isOverflowing = overflow > 2 && textWidth > 0 && containerWidth > 0;

  return (
    <View
      style={{ overflow: 'hidden', width: '100%', justifyContent: 'center' }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setContainerWidth(w);
      }}
    >
      {/* Offscreen ScrollView to measure unconstrained 100% natural text width */}
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 3000 }}
        pointerEvents="none"
      >
        <Text
          style={style}
          numberOfLines={1}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setTextWidth(w);
          }}
        >
          {text}
        </Text>
      </ScrollView>

      {/* Visible single-line animated auto-looping text */}
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          transform: [{ translateX: scrollAnim }],
        }}
      >
        <Text
          style={[
            style,
            isOverflowing ? { minWidth: textWidth, flexShrink: 0 } : undefined,
          ]}
          numberOfLines={1}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

export default AutoLoopText;
