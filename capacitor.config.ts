import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.morsekids.app',
  appName: 'Morse Code Kids',
  webDir: 'out',
  android: {
    // Enable Web Audio API in Android WebView
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    StatusBar: {
      style: 'dark' as const,
      backgroundColor: '#7C3AED',
    },
  },
};

export default config;
