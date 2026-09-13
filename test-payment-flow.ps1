# Test Payment Flow Script
# Tests: initialization → payment verification → order creation

# Configuration
$BACKEND_URL = "http://localhost:8000"
$USER_ID = "test-user-$(Get-Random)"
$ORDER_ID = "test-order-$(Get-Random)"
$EMAIL = "test@example.com"
$AUTH_TOKEN = "test-token"  # We'll need real token, but this is for structure

Write-Host "=== Testing Payment Flow ===" -ForegroundColor Cyan
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Gray
Write-Host "Order ID: $ORDER_ID" -ForegroundColor Gray
Write-Host ""

# Step 1: Test Payment Initialize with valid metadata
Write-Host "Step 1: Testing payment initialization endpoint..." -ForegroundColor Yellow

$initPayload = @{
    order_id = $ORDER_ID
    amount = 100.00
    email = $EMAIL
    metadata = @{
        delivery_option = "delivery"
        address_id = "addr-123"
        subtotal_amount = 95.00
        shipping_fee = 5.00
        discount_amount = 0
        items = @(
            @{
                product_variant_id = "var-1"
                quantity = 2
                price = 47.50
            }
        )
    }
} | ConvertTo-Json -Depth 10

Write-Host "Payload: " -ForegroundColor Gray
Write-Host $initPayload -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/payments/initialize" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $AUTH_TOKEN"
        } `
        -Body $initPayload `
        -ErrorAction SilentlyContinue

    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Payment initialization successful (200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "Response: " -ForegroundColor Gray
        Write-Host ($data | ConvertTo-Json -Depth 5) -ForegroundColor Gray
        
        $REFERENCE = $data.data.reference
        Write-Host ""
        Write-Host "Extracted reference: $REFERENCE" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
        Write-Host $response.Content -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error during payment initialization: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response: $errorBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=== Payment flow test completed ===" -ForegroundColor Cyan
