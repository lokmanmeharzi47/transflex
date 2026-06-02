import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.transflex.app',
  appName: 'TransFlex',
  webDir: 'out',
  server: {
    // Use https scheme so absolute paths (/logo.png, /_next/…) resolve correctly
    // — identical behaviour to npm run dev.
    androidScheme: 'https',
  },
};

export default config;
