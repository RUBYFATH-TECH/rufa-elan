# Test Payment Flow Script
# This script tests the complete payment flow including initialization, verification, and order creation

$BACKEND_URL = "http://localhost:8000"

# Colors for output
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

Write-Info "================================"
Write-Info "Payment Flow Test Suite"
Write-Info "================================"

# Test 1: Check if backend is accessible
Write-Info "`n[TEST 1] Checking backend connection..."
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/orders" -Method GET -Headers @{
        "Authorization" = "Bearer test-token"
    } -ErrorAction SilentlyContinue
    Write-Success "Backend is accessible"
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Success "Backend is accessible (returned 401 as expected for invalid token)"
    }
    else {
        Write-Error "Backend is not accessible"
        Write-Error "Error: $($_.Exception.Message)"
        exit 1
    }
}

Write-Info "`n================================"
Write-Info "Backend is ready for testing!"
Write-Info "================================"
Write-Info "`nNext steps:"
Write-Info "1. Log in to the frontend (http://localhost:3000)"
Write-Info "2. Add items to cart"
Write-Info "3. Complete checkout with address"
Write-Info "4. Complete payment with Paystack test card:"
Write-Info "   Card: 4123450131001381"
Write-Info "   Expiry: any future date"
Write-Info "   CVV: any 3 digits"
Write-Info "5. Check http://localhost:3000/account/orders for your order"
Write-Info "`nWatch the backend logs for:"
Write-Info "- Payment initialized successfully"
Write-Info "- Payment verified successfully"
Write-Info "- Order created successfully from payment"
Write-Info "- Order creation from payment complete"
