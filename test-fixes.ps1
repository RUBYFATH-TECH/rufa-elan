# Test Fixes Script
# This script tests both the product stock and cart clearing fixes

Write-Host "`n=== Testing Product Stock Fix ===" -ForegroundColor Cyan

# Test 1: Check if backend is running
Write-Host "`nTest 1: Backend Status..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($backendRunning) {
    Write-Host "  ✓ Backend is running on port 8000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend is NOT running on port 8000" -ForegroundColor Red
    Write-Host "    Run: cd backend; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check API response
Write-Host "`nTest 2: Product Stock Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/products?limit=5" -UseBasicParsing -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    
    $totalProducts = $json.data.Count
    $inStockCount = ($json.data | Where-Object { $_.in_stock -eq $true }).Count
    $outOfStockCount = $totalProducts - $inStockCount
    
    Write-Host "  Total products checked: $totalProducts" -ForegroundColor White
    Write-Host "  In stock: $inStockCount" -ForegroundColor Green
    Write-Host "  Out of stock: $outOfStockCount" -ForegroundColor $(if ($outOfStockCount -gt 0) { "Yellow" } else { "Green" })
    
    if ($inStockCount -gt 0) {
        Write-Host "`n  ✓ Product stock fix is working!" -ForegroundColor Green
        Write-Host "    Sample products:" -ForegroundColor Gray
        $json.data | Where-Object { $_.in_stock -eq $true } | Select-Object -First 3 | ForEach-Object {
            Write-Host "      - $($_.name): stock=$($_.stock_quantity)" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n  ✗ No products in stock!" -ForegroundColor Red
        Write-Host "    Run: cd backend; node -r ts-node/register update-variant-stock.ts" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Failed to connect to API: $_" -ForegroundColor Red
}

# Test 3: Check compiled code
Write-Host "`nTest 3: Cart Clearing Code..." -ForegroundColor Yellow
$paymentsFile = "backend\dist\routes\payments.js"
if (Test-Path $paymentsFile) {
    $content = Get-Content $paymentsFile -Raw
    if ($content -like "*Cart cleared for user*") {
        Write-Host "  ✓ Cart clearing code is compiled" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Cart clearing code NOT found" -ForegroundColor Red
        Write-Host "    Run: cd backend; npm run build" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Compiled backend not found" -ForegroundColor Red
    Write-Host "    Run: cd backend; npm run build" -ForegroundColor Yellow
}

# Test 4: Check database cart items
Write-Host "`nTest 4: Cart Items in Database..." -ForegroundColor Yellow
Push-Location backend
try {
    $cartCheckScript = @"
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data, count } = await supabase.from('cart_items').select('*', { count: 'exact' });
  console.log(count || 0);
})();
"@
    
    $tempFile = New-TemporaryFile
    $cartCheckScript | Out-File -FilePath $tempFile -Encoding UTF8
    $cartCheck = node -r ts-node/register $tempFile.FullName 2>$null | Select-Object -Last 1
    Remove-Item $tempFile
    
    if ($cartCheck) {
        Write-Host "  Cart items in database: $cartCheck" -ForegroundColor $(if ($cartCheck -eq "0") { "Green" } else { "Yellow" })
        if ($cartCheck -ne "0") {
            Write-Host "    Note: Cart items exist. Test checkout to verify clearing." -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  Could not check cart items" -ForegroundColor Gray
} finally {
    Pop-Location
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "1. Backend: " -NoNewline
Write-Host $(if ($backendRunning) { "✓ Running" } else { "✗ Not Running" }) -ForegroundColor $(if ($backendRunning) { "Green" } else { "Red" })
Write-Host "2. Product Stock: " -NoNewline
Write-Host $(if ($inStockCount -gt 0) { "✓ Working" } else { "✗ Need Update" }) -ForegroundColor $(if ($inStockCount -gt 0) { "Green" } else { "Red" })
Write-Host "3. Cart Code: " -NoNewline
Write-Host $(if ($content -like "*Cart cleared for user*") { "✓ Deployed" } else { "✗ Need Build" }) -ForegroundColor $(if ($content -like "*Cart cleared for user*") { "Green" } else { "Red" })

Write-Host "`nNext Steps:" -ForegroundColor Cyan
if ($inStockCount -eq 0) {
    Write-Host "  1. Run: cd backend; node -r ts-node/register update-variant-stock.ts" -ForegroundColor Yellow
}
Write-Host "  2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "  3. Hard refresh frontend (Ctrl+F5)" -ForegroundColor Yellow
Write-Host "  4. Test checkout flow to verify cart clearing" -ForegroundColor Yellow
Write-Host ""
