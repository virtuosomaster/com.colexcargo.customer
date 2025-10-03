import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colexcargo.customer',
  appName: 'Colex Cargo Customer App',
  webDir: 'www',
  android: {
    adjustMarginsForEdgeToEdge: "auto"
  },
  plugins: {
    EdgeToEdge: {
      backgroundColor: "#ffffff"
    }
  },
};

export default config;
