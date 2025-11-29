import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d98addd99b3b410c900bc8de6e51b25e',
  appName: 'NeuroPlay IRB Prime',
  webDir: 'dist',
  server: {
    url: 'https://d98addd9-9b3b-410c-900b-c8de6e51b25e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1e35',
      showSpinner: true,
      spinnerColor: '#c7923e',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
