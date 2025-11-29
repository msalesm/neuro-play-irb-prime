import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticIntensity = 'off' | 'light' | 'medium' | 'strong';

export interface HapticPattern {
  success: number | number[];
  error: number | number[];
  tap: number | number[];
  sequence: number | number[];
  achievement: number | number[];
  warning: number | number[];
}

// Web Vibration API patterns (for Android web)
const WEB_HAPTIC_PATTERNS: Record<HapticIntensity, HapticPattern> = {
  off: {
    success: 0,
    error: 0,
    tap: 0,
    sequence: 0,
    achievement: 0,
    warning: 0,
  },
  light: {
    success: [30, 50, 30],
    error: [50, 30, 50],
    tap: 20,
    sequence: 30,
    achievement: [40, 60, 40, 60, 80],
    warning: [60, 40, 60],
  },
  medium: {
    success: [50, 70, 50, 70, 100],
    error: [100, 50, 100],
    tap: 40,
    sequence: 50,
    achievement: [60, 80, 60, 80, 120],
    warning: [80, 60, 80],
  },
  strong: {
    success: [80, 100, 80, 100, 150],
    error: [150, 80, 150],
    tap: 60,
    sequence: 80,
    achievement: [100, 120, 100, 120, 200],
    warning: [120, 80, 120],
  },
};

// Capacitor Haptics mapping (for native iOS/Android)
const CAPACITOR_HAPTIC_MAPPING: Record<keyof HapticPattern, {
  type: 'impact' | 'notification';
  style: ImpactStyle | NotificationType;
}> = {
  tap: { type: 'impact', style: ImpactStyle.Light },
  sequence: { type: 'impact', style: ImpactStyle.Medium },
  success: { type: 'notification', style: NotificationType.Success },
  error: { type: 'notification', style: NotificationType.Error },
  warning: { type: 'notification', style: NotificationType.Warning },
  achievement: { type: 'notification', style: NotificationType.Success },
};

export class HapticsEngine {
  private intensity: HapticIntensity = 'medium';
  private isNative: boolean;
  private isSupported: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    
    if (this.isNative) {
      // Native app - Capacitor Haptics is always supported on iOS/Android
      this.isSupported = true;
    } else {
      // Web browser - check Vibration API (works on Android, not iOS)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      this.isSupported = 'vibrate' in navigator && !isIOS;
    }
  }

  setIntensity(intensity: HapticIntensity) {
    this.intensity = intensity;
  }

  getIntensity(): HapticIntensity {
    return this.intensity;
  }

  isHapticsSupported(): boolean {
    return this.isSupported;
  }

  isNativeApp(): boolean {
    return this.isNative;
  }

  async trigger(type: keyof HapticPattern) {
    if (!this.isSupported || this.intensity === 'off') {
      return;
    }

    try {
      if (this.isNative) {
        // Use Capacitor Haptics for native apps (iOS/Android)
        await this.triggerNativeHaptic(type);
      } else {
        // Use Web Vibration API for web browsers (Android only)
        this.triggerWebVibration(type);
      }
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }

  private async triggerNativeHaptic(type: keyof HapticPattern) {
    const mapping = CAPACITOR_HAPTIC_MAPPING[type];
    
    // Adjust intensity for native haptics
    if (mapping.type === 'impact') {
      let impactStyle = mapping.style as ImpactStyle;
      
      // Adjust impact based on intensity setting
      if (this.intensity === 'light') {
        impactStyle = ImpactStyle.Light;
      } else if (this.intensity === 'medium') {
        impactStyle = ImpactStyle.Medium;
      } else if (this.intensity === 'strong') {
        impactStyle = ImpactStyle.Heavy;
      }
      
      await Haptics.impact({ style: impactStyle });
      
      // For achievement, trigger multiple impacts
      if (type === 'achievement') {
        await new Promise(resolve => setTimeout(resolve, 100));
        await Haptics.impact({ style: impactStyle });
        await new Promise(resolve => setTimeout(resolve, 100));
        await Haptics.impact({ style: impactStyle });
      }
    } else {
      // Notification haptics
      await Haptics.notification({ type: mapping.style as NotificationType });
    }
  }

  private triggerWebVibration(type: keyof HapticPattern) {
    const pattern = WEB_HAPTIC_PATTERNS[this.intensity][type];
    
    if (pattern && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Helper method for custom patterns (web only)
  vibratePattern(pattern: number | number[]) {
    if (!this.isSupported || this.intensity === 'off' || this.isNative) {
      return;
    }
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Vibration error:', error);
    }
  }
}

// Singleton instance
export const hapticsEngine = new HapticsEngine();
