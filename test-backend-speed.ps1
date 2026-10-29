# Test Backend API Performance
# Run this script to check if your backend is fast enough

Write-Host "`n🔍 Testing Backend Performance..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$backendUrl = "https://rufaelan-backend.onrender.com"

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
$healthStart = Get-Date
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -TimeoutSec 10
    $healthEnd = Get-Date
    $healthTime = ($healthEnd - $healthStart).TotalMilliseconds
    
    Write-Host "   ✅ Backend is UP" -ForegroundColor Green
    Write-Host "   Time: $([math]::Round($healthTime, 0))ms" -ForegroundColor $(if($healthTime -lt 1000){"Green"}else{"Red"})
    Write-Host "   Database: $($health.database)" -ForegroundColor $(if($health.database -eq "connected"){"Green"}else{"Red"})
} catch {
    Write-Host "   ❌ Backend is DOWN or SLOW" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Products API (10 items)
Write-Host "`n2. Testing Products API - 10 items..." -ForegroundColor Yellow
$prod10Start = Get-Date
try {
    $products10 = Invoke-RestMethod -Uri "$backendUrl/api/products?limit=10" -TimeoutSec 15
    $prod10End = Get-Date
    $prod10Time = ($prod10End - $prod10Start).TotalMilliseconds
    
    Write-Host "   ✅ Products loaded: $($products10.data.Count)" -ForegroundColor Green
    Write-Host "   Time: $([math]::Round($prod10Time, 0))ms" -ForegroundColor $(if($prod10Time -lt 500){"Green"}elseif($prod10Time -lt 1000){"Yellow"}else{"Red"})
    
    if($prod10Time -lt 500) {
        Write-Host "   🚀 EXCELLENT - Very fast!" -ForegroundColor Green
    } elseif($prod10Time -lt 1000) {
        Write-Host "   ⚠️  ACCEPTABLE - Could be faster" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ SLOW - Database indexes might be missing!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Products API (50 items)
Write-Host "`n3. Testing Products API - 50 items..." -ForegroundColor Yellow
$prod50Start = Get-Date
try {
    $products50 = Invoke-RestMethod -Uri "$backendUrl/api/products?limit=50" -TimeoutSec 20
    $prod50End = Get-Date
    $prod50Time = ($prod50End - $prod50Start).TotalMilliseconds
    
    Write-Host "   ✅ Products loaded: $($products50.data.Count)" -ForegroundColor Green
    Write-Host "   Time: $([math]::Round($prod50Time, 0))ms" -ForegroundColor $(if($prod50Time -lt 800){"Green"}elseif($prod50Time -lt 1500){"Yellow"}else{"Red"})
    
    if($prod50Time -lt 800) {
        Write-Host "   🚀 EXCELLENT - Indexes are working!" -ForegroundColor Green
    } elseif($prod50Time -lt 1500) {
        Write-Host "   ⚠️  ACCEPTABLE - But could be optimized" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ SLOW - Apply database indexes immediately!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Fast Deals API
Write-Host "`n4. Testing Fast Deals API..." -ForegroundColor Yellow
$dealsStart = Get-Date
try {
    $deals = Invoke-RestMethod -Uri "$backendUrl/api/fast-deals?limit=6" -TimeoutSec 15
    $dealsEnd = Get-Date
    $dealsTime = ($dealsEnd - $dealsStart).TotalMilliseconds
    
    Write-Host "   ✅ Deals loaded: $($deals.data.Count)" -ForegroundColor Green
    Write-Host "   Time: $([math]::Round($dealsTime, 0))ms" -ForegroundColor $(if($dealsTime -lt 500){"Green"}elseif($dealsTime -lt 1000){"Yellow"}else{"Red"})
} catch {
    Write-Host "   ⚠️  No deals available or failed" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$allTestsPassed = $true

if($prod10Time -and $prod10Time -lt 1000) {
    Write-Host "✅ Small queries are fast" -ForegroundColor Green
} else {
    Write-Host "❌ Small queries are slow" -ForegroundColor Red
    $allTestsPassed = $false
}

if($prod50Time -and $prod50Time -lt 1500) {
    Write-Host "✅ Large queries are acceptable" -ForegroundColor Green
} else {
    Write-Host "❌ Large queries are too slow" -ForegroundColor Red
    $allTestsPassed = $false
}

Write-Host "`n"

if($allTestsPassed) {
    Write-Host "🎉 YOUR BACKEND IS PERFORMING WELL!" -ForegroundColor Green
    Write-Host "If Vercel is still slow, the issue is likely:" -ForegroundColor Yellow
    Write-Host "  - Frontend code needs optimization" -ForegroundColor Yellow
    Write-Host "  - Network/CDN issues" -ForegroundColor Yellow
    Write-Host "  - Browser caching not working" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  YOUR BACKEND NEEDS OPTIMIZATION!" -ForegroundColor Red
    Write-Host ""
    Write-Host "CRITICAL ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "  1. Open Supabase SQL Editor" -ForegroundColor Yellow
    Write-Host "  2. Run APPLY_PERFORMANCE_INDEXES.sql" -ForegroundColor Yellow
    Write-Host "  3. Re-run this test script" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Without database indexes, queries are doing full table scans!" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "`n"
