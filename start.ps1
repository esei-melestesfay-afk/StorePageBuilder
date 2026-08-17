Set-Location $PSScriptRoot

Write-Host "Uppdaterar Store Page Builder..." -ForegroundColor Cyan
try {
    git pull --ff-only | Out-Host
} catch {
    Write-Host "Kunde inte kontrollera GitHub just nu. Startar den lokala versionen." -ForegroundColor Yellow
}

$alreadyRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 8765 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($alreadyRunning) {
    Start-Process "http://127.0.0.1:8765"
    exit
}

py -3 .\server.py
