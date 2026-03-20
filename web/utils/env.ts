/**
 * Checks if the application is running in browser or runtime.
 */
export const isEnvBrowser = (): boolean => {
  return !(window as any).invokeNative;
};