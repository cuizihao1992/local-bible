param(
  [string]$DataRoot = "D:\bibleDownload",
  [string]$Version = "1.9.19"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outDir = Join-Path $root "dist\android"
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
$bibleFiles = @(Get-ChildItem -LiteralPath $biblesDir -Filter *.db | Where-Object { $bundled -notcontains $_.Name })
$commentaryFiles = @(Get-ChildItem -LiteralPath $commentariesDir -Filter *.db)

$biblesZip = Join-Path $outDir "bibles-extra-v$Version.zip"
$commentariesZip = Join-Path $outDir "commentaries-v$Version.zip"
if (Test-Path $biblesZip) { Remove-Item -LiteralPath $biblesZip -Force }
if (Test-Path $commentariesZip) { Remove-Item -LiteralPath $commentariesZip -Force }

Compress-Archive -LiteralPath $bibleFiles.FullName -DestinationPath $biblesZip -CompressionLevel Optimal
Compress-Archive -LiteralPath $commentaryFiles.FullName -DestinationPath $commentariesZip -CompressionLevel Optimal

Write-Host "Built package: $biblesZip ($($bibleFiles.Count) db files)"
Write-Host "Built package: $commentariesZip ($($commentaryFiles.Count) db files)"
