$ErrorActionPreference = "Stop"
$root = "C:\Users\Muhammad Umer\Desktop\IntegrationHub"

Write-Host "Starting Nexus dev servers..." -ForegroundColor Cyan

$apiJob = Start-Process -FilePath "node" -ArgumentList "node_modules\.bin\tsx","src\index.ts" -WorkingDirectory $root -PassThru -WindowStyle Minimized
Write-Host "API Server started (PID: $($apiJob.Id))" -ForegroundColor Green

$uiJob = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "$root\client" -PassThru -WindowStyle Minimized
Write-Host "Frontend started (PID: $($uiJob.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Servers running:" -ForegroundColor Cyan
Write-Host "  API: http://localhost:3000" -ForegroundColor White
Write-Host "  UI:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "To stop: Get-Process -Id $($apiJob.Id),$($uiJob.Id) | Stop-Process" -ForegroundColor Gray