$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'extensions\fable-friendly-ui'
$sillyTavernDir = Join-Path $projectRoot '.local\SillyTavern'
$destination = Join-Path $sillyTavernDir 'public\scripts\extensions\third-party\fable-friendly-ui'

if (-not (Test-Path -LiteralPath (Join-Path $sillyTavernDir 'server.js'))) {
    throw 'SillyTavern is not installed. Run scripts/setup-sillytavern.ps1 first.'
}

New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $source 'manifest.json') -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $source 'index.js') -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $source 'style.css') -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $source 'README.md') -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $source 'LICENSE') -Destination $destination -Force

Write-Host "Installed Fable Friendly UI at $destination"
Write-Host 'Restart SillyTavern, then refresh http://127.0.0.1:8000/'
