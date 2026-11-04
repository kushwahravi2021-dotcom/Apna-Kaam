import type { CapacitorConfig } from "@capacitor/cli";
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const config: CapacitorConfig = {
  appId: "com.apnakaam.app",
  appName: "Apna Kaam",
  webDir: "public",
  server: appUrl ? { url: appUrl, cleartext: false, androidScheme: "https" } : undefined,
  android: { allowMixedContent: false }
};
export default config;
