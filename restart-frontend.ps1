# Restart Frontend Script
Write-Host "`n=== Restarting Frontend ===" -ForegroundColor Cyan

# Stop any running node processes
Write-Host "`n1. Stopping old frontend process..." -ForegroundColor Yellow
$nodProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Stopping process $($_.Id) (started $($_.StartTime))" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
    Start-Sleep -Seconds 2
    Write-Host "   ✓ Stopped" -ForegroundColor Green
} else {
    Write-Host "   No node processes running" -ForegroundColor Gray
}

# Navigate to frontend and start
Write-Host "`n2. Starting frontend with new code..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "   Running: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Frontend Starting ===" -ForegroundColor Green
Write-Host "Wait for 'Ready' message, then test checkout" -ForegroundColor White
Write-Host ""

# Start the dev server
npm run dev
