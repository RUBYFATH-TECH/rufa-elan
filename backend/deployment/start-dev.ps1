# RUFA ELAN Development Startup Script

Write-Host "🚀 Starting RUFA ELAN Development Environment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please update with your actual values." -ForegroundColor Green
        Write-Host "📝 Required variables:" -ForegroundColor Cyan
        Write-Host "   - SUPABASE_URL" -ForegroundColor Cyan
        Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan  
        Write-Host "   - SUPABASE_ANON_KEY" -ForegroundColor Cyan
        Write-Host "   - PAYSTACK_SECRET_KEY" -ForegroundColor Cyan
        Write-Host "" 
        Read-Host "Press Enter after updating .env file to continue"
    } else {
        Write-Host "❌ No .env.example file found!" -ForegroundColor Red
        exit 1
    }
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies if needed
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
Set-Location ..

# Install backend dependencies if needed  
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
}
Set-Location ..

# Start services with Docker Compose
Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Blue
Set-Location deployment
docker-compose -f docker-compose.dev.yml up --build

Write-Host "🎉 Development environment started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Redis: localhost:6379" -ForegroundColor Cyan