/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Global error handler to catch unhandled promise rejections
const globalThis2 = globalThis as any;
const originalErrorHandler = globalThis2.ErrorUtils?.getGlobalHandler?.();
if (globalThis2.ErrorUtils?.setGlobalHandler) {
  globalThis2.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
    console.debug('=== GLOBAL ERROR HANDLER ===');
    console.debug('Error:', error);
    console.debug('Is Fatal:', isFatal);
    console.debug('Stack:', error?.stack);
    console.debug('============================');
    
    // Call original handler to maintain default behavior
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

// Handle unhandled promise rejections
if (typeof Promise !== 'undefined') {
  (Promise as any).onPossiblyUnhandledRejection = (promise: Promise<any>, reason: any) => {
    console.debug('=== UNHANDLED PROMISE REJECTION ===');
    console.debug('Promise:', promise);
    console.debug('Reason:', reason);
    console.debug('Stack:', reason?.stack);
    console.debug('===================================');
  };
}

function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;

