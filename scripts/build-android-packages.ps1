param(
  [string]$DataRoot = "D:\bibleDownload",
  [string]$Version = "1.9.9"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outDir = Join-Path $root "dist\android"
$tempDir = Join-Path $root "dist\android-packages-temp"
$biblesDir = Join-Path $DataRoot "bibles"
$commentariesDir = Join-Path $DataRoot "cj"
$bundled = @(
  "和合本.db",
  "和合本修订版.db",
  "KJV.db",
  "WEB.db"
)

if (!(Test-Path $biblesDir)) {
  throw "Missing bibles directory: $biblesDir"
}

if (!(Test-Path $commentariesDir)) {
  throw "Missing commentaries directory: $commentariesDir"
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path $tempDir) {
  Remove-Item -LiteralPath $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $tempDir "bibles") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tempDir "commentaries") | Out-Null

Get-ChildItem -LiteralPath $biblesDir -Filter *.db | Where-Object { $bundled -notcontains $_.Name } | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $tempDir "bibles") -Force
}

Get-ChildItem -LiteralPath $commentariesDir -Filter *.db | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $tempDir "commentaries") -Force
}

$biblesZip = Join-Path $outDir "bibles-extra-v$Version.zip"
$commentariesZip = Join-Path $outDir "commentaries-v$Version.zip"
if (Test-Path $biblesZip) { Remove-Item -LiteralPath $biblesZip -Force }
if (Test-Path $commentariesZip) { Remove-Item -LiteralPath $commentariesZip -Force }

Compress-Archive -Path (Join-Path $tempDir "bibles\*.db") -DestinationPath $biblesZip -CompressionLevel Optimal
Compress-Archive -Path (Join-Path $tempDir "commentaries\*.db") -DestinationPath $commentariesZip -CompressionLevel Optimal

$bibleCount = @(Get-ChildItem -LiteralPath (Join-Path $tempDir "bibles") -Filter *.db).Count
$commentaryCount = @(Get-ChildItem -LiteralPath (Join-Path $tempDir "commentaries") -Filter *.db).Count

Remove-Item -LiteralPath $tempDir -Recurse -Force

Write-Host "Built package: $biblesZip ($bibleCount db files)"
Write-Host "Built package: $commentariesZip ($commentaryCount db files)"
