$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $projectRoot '.local\SillyTavern\.run\pid.txt'

if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Host 'SillyTavern is not running.'
    exit 0
}

$sillyTavernPid = [int](Get-Content -LiteralPath $pidFile)
$process = Get-Process -Id $sillyTavernPid -ErrorAction SilentlyContinue

if ($process) {
    if ($process.ProcessName -ne 'node') {
        throw "PID $sillyTavernPid is no longer a Node process; refusing to stop it."
    }
    Stop-Process -Id $sillyTavernPid
    $process.WaitForExit(10000)
    Write-Host "Stopped SillyTavern (PID $sillyTavernPid)."
} else {
    Write-Host 'SillyTavern was already stopped.'
}

Remove-Item -LiteralPath $pidFile -Force
