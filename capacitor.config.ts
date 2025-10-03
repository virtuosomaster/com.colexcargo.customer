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
      backgroundColor: "#1a1e3a"
    }
  },
};

export default config;
