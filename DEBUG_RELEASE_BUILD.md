# Debug Guide for Release APK Crashes

## Problem Summary
Your release APK crashes silently without logs when navigating between screens. This is a common issue caused by:
- Unhandled exceptions in native code or JavaScript
- Missing ProGuard keep rules
- Difference between debug and release build configurations
- Silent crashes in production builds

## Solution: Step-by-Step Debugging

### Step 1: Rebuild Release APK with New Error Handler
The error handler has been added to your App.tsx which will catch and log all uncaught errors.

```bash
cd /home/chetan/projects/DEMO-MovieDiscoveryProject

# Clean previous build
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 2: Clear App Data and Install Fresh APK
```bash
# Clear app data to remove cached state
adb shell pm clear com.moviediscoveryapp

# Install the new APK
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Monitor Logcat with Proper Filters

Open multiple terminal tabs and run these commands:

**Terminal 1 - Catch All Logs (Recommended First):**
```bash
adb logcat | grep -E "GLOBAL ERROR HANDLER|UNHANDLED|ReactNativeJS|Crash|FATAL|Exception"
```

**Terminal 2 - Full React Native Logs:**
```bash
adb logcat *:S ReactNativeJS:V
```

**Terminal 3 - All Logs (Most Verbose):**
```bash
adb logcat
```

**Terminal 4 - Crash/Error Only:**
```bash
adb logcat | grep -iE "error|exception|fatal|crash"
```

### Step 4: Test Navigation to Trigger Crash
1. Install and open the app
2. Navigate to a movie details screen
3. Go back to home
4. **Watch the logcat output** - it should show the error now

### Step 5: Alternative - Build Debug APK with All Symbols

If you still don't see logs, create a debug APK first to compare:

```bash
# Build debug APK
./gradlew assembleDebug

# Install debug version
adb shell pm clear com.moviediscoveryapp
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Test the debug APK with logcat monitoring (same commands). The debug version may reveal different behavior.

### Step 6: Check for Navigation-Related Issues

Add this temporary logging to AppNavigator.tsx to see which navigation action causes the crash:

```typescript
// In AppNavigator.tsx - Add console logs to navigation handlers
const goToMovieDetails = useCallback((movieId: number) => {
  console.debug('Navigating to MovieDetails with ID:', movieId);
  setRoute({ name: 'MovieDetails', movieId });
}, []);

const goBack = useCallback(() => {
  console.debug('Going back from route:', currentRoute);
  setRoute({ name: 'Home' });
}, []);
```

### Step 7: Additional Debugging Commands

**Get full stack trace from last crash:**
```bash
adb logcat -d | tail -100
```

**Save logcat output to file for analysis:**
```bash
adb logcat > logcat_output.txt
# Keep this running while you reproduce the crash
# Then close it (Ctrl+C) and analyze logcat_output.txt
```

**Check if app is crashing immediately:**
```bash
adb shell am start -D -N com.moviediscoveryapp/.MainActivity
# -D: Wait for debugger
# -N: Show native crashes
```

## Common Causes to Check

### 1. **Navigation State Corruption**
   - Issue: State not properly reset when navigating
   - Fix: Ensure route transitions use immutable state

### 2. **API Call Timing Issues** 
   - Issue: Promises resolve after component unmounts
   - Fix: Add cleanup in useEffect hooks

### 3. **Memory Leaks**
   - Issue: Release build has stricter memory management
   - Fix: Always cleanup event listeners and subscriptions

### 4. **Missing Dependencies**
   - Issue: Some native modules don't initialize in release
   - Fix: Check android/app/build.gradle for all dependencies

## Build Configuration Checks

**File: android/app/build.gradle**
- Verify `enableProguardInReleaseBuilds = false` for now (when debugging)
- Once stable, enable it with proper keep rules

**File: android/app/proguard-rules.pro**
- Has been updated with safe keep rules
- Keeps React Native, native methods, and exceptions

**File: App.tsx**
- Now has global error handler to catch exceptions
- Enables promise rejection handling

## Expected Output When Error Happens

When the crash occurs, you should see something like:
```
=== GLOBAL ERROR HANDLER ===
Error: Cannot read property 'navigation' of undefined
Is Fatal: true
Stack: at HomeScreen (HomeScreen.tsx:45)
    at MovieDetailsScreen (MovieDetailsScreen.tsx:32)
============================
```

## Next Steps After Getting Error Logs

1. **Take screenshot/copy of error message**
2. **Check the referenced file and line number**
3. **Look for null/undefined checks**
4. **Verify API responses are structured correctly**

## Emergency: If App Won't Start at All

Try these steps:
```bash
# Complete reset
adb shell pm clear com.moviediscoveryapp
adb uninstall com.moviediscoveryapp

# Rebuild
./gradlew clean
./gradlew assembleDebug

# Reinstall
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Monitor immediately
adb logcat *:S ReactNativeJS:V
```

## Performance Comparison: Debug vs Release

Debug APK:
- ✅ No minification (readable code)
- ✅ Full logging enabled
- ✅ Easier to debug crashes
- ❌ Larger file size
- ❌ Slower performance

Release APK:
- ✅ Fast performance
- ✅ Small file size
- ❌ Code obfuscated
- ❌ Silent crashes if not properly configured

---

**Remember:** Once you find and fix the issue, re-test with both debug and release builds to ensure it works in both.
