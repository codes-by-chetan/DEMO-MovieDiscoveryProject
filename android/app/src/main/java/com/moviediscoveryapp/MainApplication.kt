package com.moviediscoveryapp

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  companion object {
    private const val TAG = "MovieDiscoveryApp"
  }

  override val reactHost: ReactHost by lazy {
    Log.d(TAG, "=== ReactHost initialization starting ===")
    try {
      val host = getDefaultReactHost(
        context = applicationContext,
        packageList =
          PackageList(this).packages.apply {
            Log.d(TAG, "Package list size: ${this.size}")
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // add(MyReactNativePackage())
          },
      )
      Log.d(TAG, "=== ReactHost created successfully ===")
      host
    } catch (e: Exception) {
      Log.e(TAG, "=== FATAL ERROR in ReactHost creation ===", e)
      Log.e(TAG, "Exception message: ${e.message}")
      Log.e(TAG, "Exception cause: ${e.cause}")
      throw e
    }
  }

  override fun onCreate() {
    Log.d(TAG, "=== MainApplication.onCreate() starting ===")
    super.onCreate()
    
    try {
      Log.d(TAG, "About to call loadReactNative()")
      loadReactNative(this)
      Log.d(TAG, "=== loadReactNative() completed successfully ===")
    } catch (e: Exception) {
      Log.e(TAG, "=== FATAL ERROR in loadReactNative ===", e)
      Log.e(TAG, "Exception type: ${e::class.simpleName}")
      Log.e(TAG, "Exception message: ${e.message}")
      Log.e(TAG, "Full stack trace:", e)
      
      // Try to log cause chain
      var cause = e.cause
      var depth = 1
      while (cause != null) {
        Log.e(TAG, "Caused by (depth $depth): ${cause::class.simpleName}: ${cause.message}")
        cause = cause.cause
        depth++
      }
      
      // Re-throw so app crashes visibly
      throw e
    }
  }
}
