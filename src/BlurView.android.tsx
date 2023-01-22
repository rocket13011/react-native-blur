import React, { forwardRef, PropsWithChildren, useEffect } from 'react';
import {
  View,
  requireNativeComponent,
  DeviceEventEmitter,
  StyleSheet,
  ViewProps,
  ViewStyle,
} from 'react-native';

const OVERLAY_COLORS = {
  light: 'rgba(255, 255, 255, 0.2)',
  xlight: 'rgba(255, 255, 255, 0.75)',
  dark: 'rgba(16, 12, 12, 0.64)',
};

export type BlurViewProps = PropsWithChildren &
  ViewProps & {
    blurAmount?: number;
    blurType?: 'dark' | 'light' | 'xlight';
    blurRadius?: number;
    downsampleFactor?: number;
    overlayColor?: string;
  };

const BlurView = forwardRef<View, BlurViewProps>(
  ({
    downsampleFactor,
    blurRadius,
    blurAmount = 10,
    blurType = 'dark',
    overlayColor,
    children,
    style,
    ...rest
  },ref) => {
    useEffect(() => {
      DeviceEventEmitter.addListener('ReactNativeBlurError', (message) => {
        throw new Error(`[ReactNativeBlur]: ${message}`);
      });

      return () => {
        DeviceEventEmitter.removeAllListeners('ReactNativeBlurError');
      };
    }, []);

    const getOverlayColor = () => {
      if (overlayColor != null) {
        return overlayColor;
      }

      return OVERLAY_COLORS[blurType] || OVERLAY_COLORS.dark;
    };

    const getBlurRadius = () => {
      if (blurRadius != null) {
        if (blurRadius > 25) {
          throw new Error(
            `[ReactNativeBlur]: blurRadius cannot be greater than 25! (was: ${blurRadius})`,
          );
        }
        return blurRadius;
      }

      // iOS seems to use a slightly different blurring algorithm (or scale?).
      // Android blurRadius + downsampleFactor is approximately 80% of blurAmount.
      const equivalentBlurRadius = Math.round(blurAmount * 0.8);

      if (equivalentBlurRadius > 25) {
        return 25;
      }
      return equivalentBlurRadius;
    };

    const getDownsampleFactor = () => {
      if (downsampleFactor != null) {
        return downsampleFactor;
      }

      return blurRadius;
    };

    return (
      <NativeBlurView
        {...rest}
        blurRadius={getBlurRadius()}
        downsampleFactor={getDownsampleFactor()}
        overlayColor={getOverlayColor()}
        blurAmount={blurAmount}
        blurType={blurType}
        pointerEvents="none"
        style={StyleSheet.compose(styles.transparent, style)}>
        {children}
      </NativeBlurView>
    );
  },
);

const styles = StyleSheet.create<{ transparent: ViewStyle }>({
  transparent: { backgroundColor: 'transparent' },
});

const NativeBlurView = requireNativeComponent<BlurViewProps>('BlurView');

export default BlurView;
