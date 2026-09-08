# Backend Setup & Deployment Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Supabase** account (free tier available)
- **Git** for version control
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone Repository
```bash
cd rufa-elan
git clone <repository-url>
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
APP_VERSION=1.0.0

# API Keys and Secrets
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# External Services (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@rufaelan.com

PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### 4. Get Supabase Credentials

1. Go to https://supabase.io
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → SUPABASE_URL
   - **Service Role Key** (reveal it) → SUPABASE_SERVICE_ROLE_KEY
5. Generate JWT_SECRET (random string at least 32 characters)

## Database Setup

### 1. Run Migrations

Option A: Using Supabase Dashboard
1. Go to **SQL Editor**
2. Create new query
3. Open `supabase/migrations/001_enhanced_schema.sql`
4. Copy entire content
5. Paste into SQL editor
6. Click **Run**

Option B: Using CLI (if configured)
```bash
supabase migration up
```

### 2. Verify Database Setup

Test database connection:
```bash
npm run test:db
```

Check if tables are created:
```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

## Development Setup

### 1. Start Development Server

```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Database connection: healthy
```

### 2. Test API Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "RUFA ELAN API",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### 3. Test Endpoints

List products:
```bash
curl http://localhost:5000/api/v1/products
```

Get categories:
```bash
curl http://localhost:5000/api/v1/categories?hierarchy=true
```

## Building for Production

### 1. Build TypeScript
```bash
npm run build
```

Compiled files go to `dist/` directory.

### 2. Verify Build
```bash
npm run lint
```

### 3. Start Production Server
```bash
npm start
```

## Docker Setup (Optional)

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]
```

### 2. Create Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NODE_ENV=production
      - PORT=5000
    restart: unless-stopped
```

### 3. Build and Run
```bash
docker build -t rufa-elan-api .
docker run -p 5000:5000 --env-file .env rufa-elan-api
```

## Testing

### 1. Unit Tests
```bash
npm run test
```

### 2. Test with Watch Mode
```bash
npm run test:watch
```

### 3. Test Coverage
```bash
npm run test:coverage
```

### 4. Manual Testing with cURL

#### Create Product (requires auth)
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category_id": "uuid",
    "name": "Test Product",
    "sku": "TEST-001",
    "regular_price": 99.99,
    "status": "active"
  }'
```

#### List Products
```bash
curl "http://localhost:5000/api/v1/products?page=1&limit=20&status=active"
```

#### Get Single Product
```bash
curl http://localhost:5000/api/v1/products/product-uuid
```

## Troubleshooting

### Issue: "SUPABASE_URL is not defined"
**Solution**: Check `.env` file and ensure all variables are set correctly

### Issue: "Database connection failed"
**Solution**: 
1. Verify SUPABASE_URL is correct
2. Check internet connectivity
3. Test with Supabase dashboard SQL editor
4. Check if RLS policies are blocking access

### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Issue: "Authentication failed"
**Solution**:
1. Check JWT_SECRET is set
2. Verify token hasn't expired
3. Check Authorization header format

### Issue: "CORS errors"
**Solution**:
1. Verify FRONTEND_URL in .env
2. Check CORS middleware in app.ts
3. Test with `curl -H "Origin: http://localhost:3000"`

## Database Backup & Restore

### Backup Database
```bash
# Using Supabase CLI
supabase db push

# Using pg_dump
pg_dump postgresql://user:password@host/database > backup.sql
```

### Restore Database
```bash
# Using Supabase CLI
supabase db pull

# Using psql
psql postgresql://user:password@host/database < backup.sql
```

## Performance Optimization

### 1. Enable Query Caching
Set `REDIS_URL` in .env to enable caching

### 2. Monitor Database Performance
```bash
# Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

### 3. Analyze Query Plans
```sql
EXPLAIN ANALYZE
SELECT * FROM products WHERE status = 'active';
```

## Monitoring & Logs

### 1. View Application Logs
```bash
tail -f logs/app.log
```

### 2. Log Levels
- `error` - Errors that need attention
- `warn` - Warnings about potential issues
- `info` - General information
- `debug` - Detailed debugging information

### 3. Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

## Security Checklist

Before production deployment:

- [ ] Change JWT_SECRET to secure random value
- [ ] Change ENCRYPTION_KEY to secure random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS correctly (not * in production)
- [ ] Set secure rate limits
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets
- [ ] Enable RLS on all tables
- [ ] Test authentication thoroughly
- [ ] Review audit logs
- [ ] Set up error tracking

## Deployment Platforms

### Render
```bash
# Connect Git repository
# Set environment variables in Render dashboard
# Deploy: `npm run build && npm start`
```

### Railway
```bash
# Connect Git repository
# Add variables from .env
# Auto-deploys on push
```

### Heroku
```bash
heroku create rufa-elan-api
heroku config:set SUPABASE_URL=your_url
git push heroku main
```

### AWS (EC2 + RDS)
```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-instance

# Install Node
sudo yum install nodejs npm

# Clone and setup app
git clone <repo>
npm install
npm start
```

## Health Checks

### API Health
```bash
curl http://localhost:5000/health
```

### Database Health
```bash
curl http://localhost:5000/api/v1/categories
```

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
npm test             # Run tests
npm run test:watch   # Watch mode

# Production
npm start            # Start production server
npm run build        # Build for production

# Database
npx supabase start   # Local Supabase
supabase migration up    # Run migrations
supabase migration down  # Rollback migrations
```

## Support & Documentation

- **API Documentation**: See `/docs/API_QUICK_REFERENCE.md`
- **Implementation Details**: See `/docs/DATABASE_CRUD_IMPLEMENTATION.md`
- **Supabase Docs**: https://supabase.io/docs
- **Express Docs**: https://expressjs.com
- **TypeScript Docs**: https://www.typescriptlang.org

## Next Steps

1. ✅ Setup backend
2. → Integrate with frontend
3. → User management API
4. → Admin dashboard
5. → Production deployment
6. → Monitoring setup
7. → Team training

---

**Last Updated**: 2024
**Version**: 1.0.0