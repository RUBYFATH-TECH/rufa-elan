# RUFA ELAN Backend

Express.js backend API for the RUFA ELAN e-commerce platform.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🏗️ Architecture

### Directory Structure
```
backend/
├── src/
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic services
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript definitions
├── tests/                # Test files
├── deployment/           # Docker and deployment configs
├── shared/              # Shared utilities
└── package.json         # Dependencies and scripts
```

### Key Features
- **Express.js** with TypeScript
- **Security middleware** (Helmet, CORS, Rate limiting)
- **Comprehensive logging** with Winston
- **Error handling** with structured responses
- **Input validation** with Zod schemas

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# Services
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_xxx

# Security
JWT_SECRET=your-jwt-secret
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/send-otp` - Send OTP verification
- `POST /auth/verify-otp` - Verify OTP
- `GET /auth/me` - Get current user

### Products (`/api/products`)
- `GET /products` - List products (with pagination/filtering)
- `GET /products/:slug` - Get single product
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Orders (`/api/orders`)
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get single order
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order (admin only)

### Admin (`/api/admin`)
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/orders` - All orders (admin view)
- `GET /admin/customers` - Customer list
- `PUT /admin/orders/:id/status` - Update order status

### Payments (`/api/payments`)
- `POST /payments/paystack/init` - Initialize payment
- `POST /payments/paystack/verify` - Verify payment
- `POST /payments/webhooks/paystack` - Handle webhooks

## 🔐 Security

### Authentication & Authorization
- **JWT-based authentication** with Supabase
- **Admin verification** via database checks
- **Role-based access control** for admin endpoints
- **Request validation** with Zod schemas

### Security Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - Tiered limits by endpoint type
- **Input sanitization** - Prevent injection attacks

### Database Security
- **Row Level Security (RLS)** - Database-level access control
- **Prepared statements** - SQL injection prevention
- **Service role minimization** - Limited elevated access
- **Audit logging** - Track admin actions

## 🛠️ Middleware Stack

### Security Layer
```typescript
helmet()                    // Security headers
cors(corsOptions)          // CORS configuration
rateLimitMiddleware        // Rate limiting
```

### Application Layer
```typescript
compression()              // Response compression
morgan()                   // Request logging
express.json()            // JSON parsing
authMiddleware            // JWT verification
adminMiddleware           // Admin authorization
```

### Error Handling
```typescript
errorHandler              // Centralized error handling
```

## 📊 Logging

### Log Levels
- **Error** - Application errors
- **Warn** - Warning conditions
- **Info** - General information
- **Debug** - Detailed debugging info

### Log Types
- **Application logs** - General app activity
- **Audit logs** - Admin actions and security events
- **Performance logs** - Response times and metrics

## 🧪 Testing

### Test Structure
```bash
tests/
├── unit/                 # Unit tests
├── integration/          # API integration tests
└── fixtures/            # Test data
```

### Running Tests
```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t rufa-elan-backend .

# Run container
docker run -p 8000:8000 rufa-elan-backend
```

### Production Build
```bash
npm run build
npm start
```

### Health Checks
- `GET /health` - Application health status
- `GET /api/health` - API health check

## 📈 Performance

### Optimization Features
- **Response compression** - Reduced bandwidth usage
- **Redis caching** - Fast data retrieval
- **Database connection pooling** - Efficient DB access
- **Query optimization** - Indexed database queries

### Monitoring
- **Response time tracking** - Performance metrics
- **Error rate monitoring** - System health
- **Memory usage** - Resource utilization

## 🔄 Services Architecture

### Database Service
```typescript
// Supabase client management
createSupabaseClient()    // Regular client (RLS)
createAdminClient()       // Service role client
```

### Business Logic Services
```typescript
productService           // Product operations
orderService            // Order processing  
authService             // Authentication
paymentService          // Payment handling
```

## 📝 API Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE", 
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Development with hot reload
- `npm run build` - TypeScript compilation
- `npm run start` - Production server
- `npm test` - Run test suite
- `npm run lint` - Code linting

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

## 🤝 Contributing

### Adding New Endpoints
1. Create route handler in `src/routes/`
2. Add business logic to appropriate service
3. Include proper validation with Zod
4. Add tests for the new functionality
5. Update API documentation

### Code Standards
- Use TypeScript for all new code
- Follow existing error handling patterns
- Include proper logging for debugging
- Add appropriate middleware for security
- Document API changes

---

**Part of the RUFA ELAN separated architecture.**