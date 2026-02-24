/**
 * @format
 */

console.log('[INDEX.JS] Entry point loading - about to import gesture-handler');

import 'react-native-gesture-handler';

console.log('[INDEX.JS] Gesture-handler imported successfully');
console.log('[INDEX.JS] About to import AppRegistry and App');

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

console.log('[INDEX.JS] All imports completed, appName:', appName);

try {
  console.log('[INDEX.JS] About to register component:', appName);
  AppRegistry.registerComponent(appName, () => App);
  console.log('[INDEX.JS] Component registered successfully');
} catch (e) {
  console.error('[INDEX.JS] FATAL ERROR during component registration:', e);
  console.error('[INDEX.JS] Stack:', e?.stack);
  throw e;
}

console.log('[INDEX.JS] Boot complete');
