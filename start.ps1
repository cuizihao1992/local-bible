$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$env:BIBLE_READER_PORT = "8767"
npm start
