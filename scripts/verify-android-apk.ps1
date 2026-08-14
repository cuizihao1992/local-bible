param(
  [string]$ApkPath = "dist\android\local-bible-reader-offline-1.9.41-release.apk",
  [string]$ExpectedVersion = "1.9.41",
  [int]$ExpectedVersionCode = 45,
  [int]$ExpectedDbCount = 4
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$apk = Join-Path $root $ApkPath
$aapt = Join-Path $root ".tools\android-sdk\build-tools\35.0.0\aapt.exe"
$apksigner = Join-Path $root ".tools\android-sdk\build-tools\35.0.0\apksigner.bat"
$javaHome = Join-Path $root ".tools\jdk17"

if (!(Test-Path $apk)) {
  throw "Missing APK: $apk"
}

if (!(Test-Path $aapt)) {
  throw "Missing aapt: $aapt"
}

$badging = (& $aapt dump badging $apk) -join "`n"
if ($badging -notmatch "package: name='local\.bible\.reader'") {
  throw "Package name mismatch"
}
if ($badging -notmatch "versionCode='$ExpectedVersionCode'") {
  throw "Version code mismatch"
}
if ($badging -notmatch "versionName='$([regex]::Escape($ExpectedVersion))'") {
  throw "Version name mismatch"
}
if ($badging -notmatch "application-icon") {
  throw "APK icon is missing from badging output"
}
if ($badging -match "application-debuggable") {
  throw "Release APK must not be debuggable"
}

$listing = tar -tf $apk
$dbCount = @($listing | Where-Object { $_ -like "assets/bibles/*.db" }).Count
if ($dbCount -ne $ExpectedDbCount) {
  throw "Expected $ExpectedDbCount bundled Bible DB files, got $dbCount"
}

foreach ($asset in @("assets/static/index.html", "assets/static/app.js", "assets/static/styles.css")) {
  if (!($listing -contains $asset)) {
    throw "Missing bundled asset: $asset"
  }
}

$temp = Join-Path ([IO.Path]::GetTempPath()) ("local-bible-apk-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  tar -xf $apk -C $temp assets/static/index.html assets/static/app.js assets/static/styles.css
  $index = Get-Content -LiteralPath (Join-Path $temp "assets\static\index.html") -Raw
  $app = Get-Content -LiteralPath (Join-Path $temp "assets\static\app.js") -Raw

  if ($index -match "D:\\bibleDownload") {
    throw "APK index still contains D:\bibleDownload"
  }
  if ($index -notmatch 'href="styles\.css"') {
    throw "APK index does not load styles.css relatively"
  }
  if ($index -notmatch 'src="app\.js"') {
    throw "APK index does not load app.js relatively"
  }
  if ($app -notmatch "AndroidBibleApi" -or $app -notmatch "getJson") {
    throw "APK frontend is not using the Android offline GET bridge"
  }
  if ($app -notmatch "data-search-more" -or $app -notmatch "searchState") {
    throw "APK frontend is missing search pagination"
  }
  if ($app -notmatch "data-section-verse" -or $app -notmatch "sectionHeadingNo") {
    throw "APK frontend is missing visible section heading rendering"
  }
  if ($app -match "D:\\\\bibleDownload") {
    throw "APK app.js still contains D:\bibleDownload runtime text"
  }
} finally {
  Remove-Item -LiteralPath $temp -Recurse -Force
}

if (Test-Path $apksigner) {
  $env:JAVA_HOME = $javaHome
  $env:PATH = "$javaHome\bin;$env:PATH"
  & $apksigner verify --print-certs $apk | Out-Null
}

$size = (Get-Item $apk).Length
Write-Host "Android APK verification ok: $ApkPath; version=$ExpectedVersion; bundledDbs=$dbCount; bytes=$size"
