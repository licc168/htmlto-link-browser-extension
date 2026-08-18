# Package only the files Chrome actually runs. Do not zip the whole folder —
# node_modules (sharp) and promo images would inflate the store listing to ~8MB.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dist = Join-Path $root "dist"
$stage = Join-Path $dist "stage"
$zip = Join-Path $dist "htmlto-link-extension.zip"

if (Test-Path $dist) {
  Remove-Item $dist -Recurse -Force
}
New-Item -ItemType Directory -Path $stage | Out-Null

$files = @(
  "manifest.json",
  "background.js",
  "content.js",
  "content.css",
  "popup.html",
  "popup.js",
  "popup.css",
  "options.html",
  "options.js",
  "options.css",
  "welcome.html",
  "welcome.js",
  "demo.html",
  "page-i18n.js",
  "file-publish.js",
  "file-publish.css"
)

foreach ($file in $files) {
  $src = Join-Path $root $file
  if (-not (Test-Path $src)) {
    throw "Missing required file: $file"
  }
  Copy-Item $src (Join-Path $stage $file)
}

Copy-Item (Join-Path $root "icons") (Join-Path $stage "icons") -Recurse
Copy-Item (Join-Path $root "_locales") (Join-Path $stage "_locales") -Recurse

# Icons used at runtime; keep generator source out of the store zip.
$iconSvg = Join-Path $stage "icons\icon.svg"
if (Test-Path $iconSvg) {
  Remove-Item $iconSvg -Force
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
$sizeKb = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "Packed $zip ($sizeKb KB)"
Write-Host "Upload this zip to Chrome Web Store. Do not upload the project folder."
