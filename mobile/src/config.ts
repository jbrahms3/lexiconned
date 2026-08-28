/**
 * Online mode's server URL. Overridable at build time with
 * EXPO_PUBLIC_WS_URL (see https://docs.expo.dev/guides/environment-variables/);
 * otherwise falls back to the deployed Railway server below.
 */
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://lexiconned-server-production.up.railway.app';
