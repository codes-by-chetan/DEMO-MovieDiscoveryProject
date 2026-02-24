#!/bin/bash

# Debug Release Build Script
# This script helps debug release APK builds by automating common tasks

set -e

PROJECT_DIR="/home/chetan/projects/DEMO-MovieDiscoveryProject"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== React Native Release APK Debug Helper ===${NC}\n"

# Parse command line arguments
COMMAND=${1:-help}

build_release() {
    echo -e "${YELLOW}Building release APK...${NC}"
    ./gradlew clean
    ./gradlew assembleRelease
    echo -e "${GREEN}✓ Release APK built${NC}"
    echo "Location: $PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"
}

build_debug() {
    echo -e "${YELLOW}Building debug APK...${NC}"
    ./gradlew clean
    ./gradlew assembleDebug
    echo -e "${GREEN}✓ Debug APK built${NC}"
    echo "Location: $PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
}

install_and_run() {
    APK_TYPE=${1:-release}
    
    if [ "$APK_TYPE" = "release" ]; then
        APK_PATH="$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"
    else
        APK_PATH="$PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
    fi
    
    if [ ! -f "$APK_PATH" ]; then
        echo -e "${RED}APK not found at $APK_PATH${NC}"
        echo "Building first..."
        if [ "$APK_TYPE" = "release" ]; then
            build_release
        else
            build_debug
        fi
    fi
    
    echo -e "${YELLOW}Installing APK...${NC}"
    adb shell pm clear com.moviediscoveryapp 2>/dev/null || true
    adb install -r "$APK_PATH"
    
    echo -e "${YELLOW}Launching app...${NC}"
    adb shell am start -n com.moviediscoveryapp/.MainActivity
    
    echo -e "${GREEN}✓ App installed and launched${NC}"
}

monitor_logs() {
    LOG_FILTER=${1:-errors}
    
    echo -e "${YELLOW}Monitoring logcat...${NC}"
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    if [ "$LOG_FILTER" = "errors" ]; then
        echo -e "${YELLOW}Filtering: Errors, Crashes, and Custom Debug Logs${NC}"
        adb logcat | grep -E "GLOBAL ERROR HANDLER|UNHANDLED PROMISE|ReactNativeJS.*Error|FATAL|Exception|Crash" || true
    elif [ "$LOG_FILTER" = "react" ]; then
        echo -e "${YELLOW}Filtering: React Native Logs${NC}"
        adb logcat *:S ReactNativeJS:V
    elif [ "$LOG_FILTER" = "all" ]; then
        echo -e "${YELLOW}Showing: All Logs (verbose)${NC}"
        adb logcat
    fi
}

save_logs() {
    OUTPUT_FILE="logcat_$(date +%Y%m%d_%H%M%S).txt"
    echo -e "${YELLOW}Capturing logcat to $OUTPUT_FILE...${NC}"
    echo "Reproduce the crash now. Press Ctrl+C when done..."
    adb logcat > "$OUTPUT_FILE"
    echo -e "${GREEN}✓ Logs saved to $OUTPUT_FILE${NC}"
}

run_full_debug() {
    echo -e "${YELLOW}Starting full debug session...${NC}\n"
    
    read -p "Build release (r) or debug (d) APK? [d]: " BUILD_TYPE
    BUILD_TYPE=${BUILD_TYPE:-d}
    
    if [ "$BUILD_TYPE" = "r" ]; then
        build_release
    else
        build_debug
    fi
    
    install_and_run "${BUILD_TYPE:-debug}"
    
    sleep 3
    echo -e "\n${YELLOW}Starting logcat monitoring...${NC}"
    echo "Open another terminal to run: npm run debug:logs"
    monitor_logs "errors"
}

case $COMMAND in
    build:release)
        build_release
        ;;
    build:debug)
        build_debug
        ;;
    install:release)
        install_and_run release
        ;;
    install:debug)
        install_and_run debug
        ;;
    logs:errors)
        monitor_logs errors
        ;;
    logs:react)
        monitor_logs react
        ;;
    logs:all)
        monitor_logs all
        ;;
    logs:save)
        save_logs
        ;;
    debug)
        run_full_debug
        ;;
    clean)
        echo -e "${YELLOW}Cleaning app and build cache...${NC}"
        adb shell pm clear com.moviediscoveryapp 2>/dev/null || true
        ./gradlew clean
        echo -e "${GREEN}✓ Clean complete${NC}"
        ;;
    help|*)
        cat << 'EOF'
React Native Release APK Debug Helper

Usage: ./debug.sh [command]

COMMANDS:
  build:release       Build release APK
  build:debug         Build debug APK
  install:release     Build and install release APK
  install:debug       Build and install debug APK
  logs:errors         Monitor errors and crashes
  logs:react          Monitor React Native logs
  logs:all            Monitor all logs (verbose)
  logs:save           Save logcat output to file
  debug               Full debug session (interactive)
  clean               Clean app data and build cache
  help                Show this help message

WORKFLOW EXAMPLE:
  1. ./debug.sh build:release     # Build release APK
  2. ./debug.sh install:release   # Install and launch
  3. ./debug.sh logs:errors       # Monitor crashes (in another terminal)
  4. Reproduce the crash in the app
  5. Press Ctrl+C to stop monitoring
  6. Analyze the error message

FOR QUICK DEBUG SESSION:
  ./debug.sh debug                # Interactive debugging

EOF
        ;;
esac
