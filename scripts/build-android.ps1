$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$javaHome = Join-Path $root ".tools\jdk17"
$sdkRoot = Join-Path $root ".tools\android-sdk"
$gradle = Join-Path $root ".tools\gradle-8.10.2\bin\gradle.bat"
$apkSource = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDir = Join-Path $root "dist\android"
$apkTarget = Join-Path $apkDir "local-bible-reader-offline-1.7.0-debug.apk"

if (!(Test-Path $javaHome)) {
  throw "Missing JDK at $javaHome. Run the Android toolchain setup first."
}

if (!(Test-Path $sdkRoot)) {
  throw "Missing Android SDK at $sdkRoot. Run the Android toolchain setup first."
}

if (!(Test-Path $gradle)) {
  throw "Missing Gradle at $gradle. Run the Android toolchain setup first."
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:PATH = "$javaHome\bin;$env:PATH"

& $gradle -p (Join-Path $root "android") assembleDebug

New-Item -ItemType Directory -Force -Path $apkDir | Out-Null
Copy-Item -LiteralPath $apkSource -Destination $apkTarget -Force

Write-Host "APK built: $apkTarget"
