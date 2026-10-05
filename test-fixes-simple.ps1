# Simple Test Script for Fixes
Write-Host "`n=== Testing Fixes ===" -ForegroundColor Cyan

# Test 1: Backend Running
Write-Host "`n1. Backend Status..." -ForegroundColor Yellow
$result = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($result) {
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend is NOT running. Run: cd backend; npm run dev" -ForegroundColor Red
    exit
}

# Test 2: Product Stock API
Write-Host "`n2. Product Stock API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/products?limit=3" -Method Get
    $inStock = $response.data | Where-Object { $_.in_stock -eq $true }
    if ($inStock.Count -gt 0) {
        Write-Host "   ✓ Found $($inStock.Count) products in stock" -ForegroundColor Green
        $inStock | ForEach-Object {
            Write-Host "     - $($_.name): stock=$($_.stock_quantity)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✗ No products in stock!" -ForegroundColor Red
        Write-Host "     Run: cd backend; node -r ts-node/register update-variant-stock.ts" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ API Error: $_" -ForegroundColor Red
}

# Test 3: Cart Clearing Code
Write-Host "`n3. Cart Clearing Code..." -ForegroundColor Yellow
if (Test-Path "backend\dist\routes\payments.js") {
    $hasCode = Select-String -Path "backend\dist\routes\payments.js" -Pattern "Cart cleared for user" -Quiet
    if ($hasCode) {
        Write-Host "   ✓ Cart clearing code is deployed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Code not found. Run: cd backend; npm run build" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ Backend not compiled. Run: cd backend; npm run build" -ForegroundColor Red
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Hard refresh (Ctrl+F5)" -ForegroundColor White  
Write-Host "3. Test adding items to cart and checking out" -ForegroundColor White
Write-Host ""
