import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.irbprime.neuroplay',
  appName: 'NeuroPlay',
  webDir: 'dist',
  // For production: remove server block or leave url empty
  // For development: uncomment to enable hot-reload
  // server: {
  //   url: 'https://d98addd9-9b3b-410c-900b-c8de6e51b25e.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
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
      releaseType: 'AAB' // Required for Google Play
    }
  }
};

export default config;
