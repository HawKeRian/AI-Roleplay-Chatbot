$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sillyTavernDir = Join-Path $projectRoot '.local\SillyTavern'

if (-not (Test-Path -LiteralPath $sillyTavernDir)) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $sillyTavernDir) -Force | Out-Null
    git clone --branch release --single-branch https://github.com/SillyTavern/SillyTavern.git $sillyTavernDir
}

Push-Location $sillyTavernDir
try {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm ci --omit=dev
    } elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm dlx npm@11.6.4 ci --omit=dev
    } else {
        throw 'SillyTavern requires npm, or pnpm as a fallback installer.'
    }
} finally {
    Pop-Location
}

Write-Host "SillyTavern is installed at $sillyTavernDir"
& (Join-Path $PSScriptRoot 'install-sillytavern-ui.ps1')
Write-Host 'Run scripts/start-sillytavern.ps1 next.'
