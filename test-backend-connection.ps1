# Backend Connection Test Script
# Run this to verify your backend is accessible

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RUFA ELAN Backend Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://rufaelan-backend.onrender.com"

# Test 1: Health Check
Write-Host "[1/4] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 30
    Write-Host "✓ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "  Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "  Database: $($healthResponse.database)" -ForegroundColor Gray
    Write-Host "  Environment: $($healthResponse.environment)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Health Check: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Root Endpoint
Write-Host "[2/4] Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-RestMethod -Uri "$backendUrl/" -Method Get -TimeoutSec 30
    Write-Host "✓ Root Endpoint: SUCCESS" -ForegroundColor Green
    Write-Host "  Message: $($rootResponse.message)" -ForegroundColor Gray
    Write-Host "  Version: $($rootResponse.version)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Root Endpoint: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Products API
Write-Host "[3/4] Testing Products API..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$backendUrl/api/products?limit=5" -Method Get -TimeoutSec 30
    $productCount = $productsResponse.data.Count
    Write-Host "✓ Products API: SUCCESS" -ForegroundColor Green
    Write-Host "  Products fetched: $productCount" -ForegroundColor Gray
    if ($productCount -gt 0) {
        Write-Host "  Sample product: $($productsResponse.data[0].name)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Products API: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Response Time
Write-Host "[4/4] Testing Response Time..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $null = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 30
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 1000) {
        Write-Host "✓ Response Time: EXCELLENT ($responseTime ms)" -ForegroundColor Green
    } elseif ($responseTime -lt 3000) {
        Write-Host "✓ Response Time: GOOD ($responseTime ms)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Response Time: SLOW ($responseTime ms)" -ForegroundColor Yellow
        Write-Host "  Note: Backend may be waking up from sleep (Render free tier)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Response Time: TIMEOUT" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $backendUrl" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If all tests pass: Backend is healthy ✓" -ForegroundColor Gray
Write-Host "2. If tests fail: Check backend logs on Render dashboard" -ForegroundColor Gray
Write-Host "3. Configure CORS on backend with your Vercel URL" -ForegroundColor Gray
Write-Host "4. Add environment variables to Vercel" -ForegroundColor Gray
Write-Host "5. Test mobile: https://your-vercel-app.vercel.app/mobile-debug" -ForegroundColor Gray
Write-Host ""
Write-Host "See MOBILE_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
