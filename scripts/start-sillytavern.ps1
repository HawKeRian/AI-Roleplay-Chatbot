$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sillyTavernDir = Join-Path $projectRoot '.local\SillyTavern'
$runDir = Join-Path $sillyTavernDir '.run'
$pidFile = Join-Path $runDir 'pid.txt'

if (-not (Test-Path -LiteralPath (Join-Path $sillyTavernDir 'server.js'))) {
    throw 'SillyTavern is not installed. Run scripts/setup-sillytavern.ps1 first.'
}

if (Test-Path -LiteralPath $pidFile) {
    $existingPid = [int](Get-Content -LiteralPath $pidFile)
    $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Host "SillyTavern is already running (PID $existingPid)."
        Write-Host 'Open http://127.0.0.1:8000/'
        exit 0
    }
}

New-Item -ItemType Directory -Path $runDir -Force | Out-Null
$stdout = Join-Path $runDir 'stdout.log'
$stderr = Join-Path $runDir 'stderr.log'
$node = (Get-Command node -ErrorAction Stop).Source

$process = Start-Process `
    -FilePath $node `
    -ArgumentList 'server.js' `
    -WorkingDirectory $sillyTavernDir `
    -WindowStyle Hidden `
    -PassThru `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr

Set-Content -LiteralPath $pidFile -Value $process.Id

for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "SillyTavern is ready (PID $($process.Id))."
            Write-Host 'Open http://127.0.0.1:8000/'
            exit 0
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

throw "SillyTavern did not become ready. Check $stdout and $stderr"
