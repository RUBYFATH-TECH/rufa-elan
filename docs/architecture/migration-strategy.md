# RUFA ELAN - Migration Strategy

**Generated:** December 5, 2026  
**Focus:** Incremental migration from monolithic to separated frontend/backend architecture

## Migration Overview

### Strategy Principles

1. **Zero-Downtime Migration:** The application remains fully functional throughout the migration
2. **Incremental Changes:** Each phase delivers value and can be rolled back independently
3. **Risk Mitigation:** Critical security fixes implemented early in the process
4. **Feature Preservation:** All existing functionality maintained during transition
5. **Performance Improvement:** Each phase should improve or maintain performance
6. **Rollback Capability:** Every step has a defined rollback procedure

### Migration Phases

```
Current State → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Target State
Monolithic     Prep &    Frontend  Backend   Security   Separated
Next.js        Security  Extract   Extract   Hardening  Architecture
```

### High-Level Timeline

| Phase | Duration | Risk Level | Rollback Time |
|-------|----------|------------|---------------|
| **Phase 1:** Preparation & Security Fixes | 1-2 weeks | LOW | Immediate |
| **Phase 2:** Frontend Extraction | 1-2 weeks | MEDIUM | 30 minutes |
| **Phase 3:** Backend Extraction | 2-3 weeks | HIGH | 1-2 hours |
| **Phase 4:** Security Hardening & Optimization | 1 week | LOW | 30 minutes |
| **Total Migration Time** | **5-8 weeks** | - | - |

## Phase 1: Preparation & Critical Security Fixes

**Duration:** 1-2 weeks  
**Risk Level:** LOW  
**Goal:** Fix critical security vulnerabilities and prepare infrastructure

### Phase 1.1: Database Security Hardening (Days 1-3)

#### Critical RLS Policy Fixes
```sql
-- URGENT: Fix admin authorization vulnerability
-- Replace dangerous auth.role() = 'authenticated' policies

-- 1. Create secure admin verification function
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.email()
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update all admin policies
DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Admin can manage products" ON products
FOR ALL USING (auth.is_admin());

DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories" ON categories  
FOR INSERT, UPDATE, DELETE USING (auth.is_admin());

-- 3. Add missing RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own delivery tracking" ON delivery_tracking
FOR SELECT USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = delivery_tracking.order_id 
  AND orders.user_id = auth.uid()
));
```

#### Performance Index Additions
```sql
-- Add critical missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created 
ON orders (status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON orders (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status 
ON products (category_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured 
ON products (featured, status) WHERE featured = true AND status = 'active';
```

### Phase 1.2: Admin Authentication Security (Days 4-5)

#### Remove Session Storage Admin Secret
```typescript
// BEFORE: Dangerous admin secret in session storage
sessionStorage.setItem('adminSecret', 'secret123'); // REMOVE

// AFTER: Proper admin verification
const verifyAdminAccess = async (): Promise<AdminStatus> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { isAdmin: false, error: 'Not authenticated' };
    }
    
    // Check admin_users table with regular client (respects RLS)
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('email', user.email)
      .single();
      
    if (error || !adminUser) {
      return { isAdmin: false, error: 'Not authorized' };
    }
    
    return { 
      isAdmin: true, 
      role: adminUser.role,
      user: user 
    };
  } catch (error) {
    return { isAdmin: false, error: 'Verification failed' };
  }
};
```

#### Implement Rate Limiting
```typescript
// Add rate limiting middleware to existing API routes
import rateLimit from 'express-rate-limit';

// Create rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to API routes
// app/api/auth/*/route.ts - add rate limiting
export async function POST(request: Request) {
  // Apply rate limiting logic here
  // ... existing auth logic
}
```

### Phase 1.3: Infrastructure Preparation (Days 6-10)

#### Set Up Development Environment
```bash
# 1. Create new directory structure
mkdir -p rufa-elan-new/{frontend,backend,shared,database,docs,deployment}

# 2. Initialize backend project
cd backend
npm init -y
npm install express cors helmet morgan compression
npm install -D @types/node @types/express typescript ts-node nodemon

# 3. Set up shared types package
cd ../shared
npm init -y
npm install -D typescript

# 4. Configure development Docker
cd ../deployment
# Create docker-compose.dev.yml for local development
```

#### Backend Project Structure Setup
```
backend/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server startup
│   ├── routes/             # API routes
│   │   ├── index.ts        # Route aggregation
│   │   └── health.ts       # Health check
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication
│   │   ├── validation.ts   # Request validation
│   │   └── error.ts        # Error handling
│   ├── services/           # Business logic
│   ├── utils/              # Utilities
│   └── types/              # TypeScript definitions
├── tests/                  # Test files
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

### Phase 1.4: Monitoring & Logging Setup (Days 8-10)

#### Add Application Monitoring
```typescript
// Add structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Add audit logging for admin actions
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' })
  ]
});
```

### Phase 1 Deliverables

✅ **Security Fixes Completed:**
- Fixed admin RLS policies  
- Removed session storage admin secret
- Added rate limiting to authentication
- Implemented proper admin verification

✅ **Infrastructure Ready:**
- Backend project structure created
- Development environment configured
- Monitoring and logging implemented
- Performance indexes added

✅ **Risk Mitigation:**
- All changes are backward compatible
- No user-facing changes
- Immediate rollback capability maintained

---

## Phase 2: Frontend Extraction

**Duration:** 1-2 weeks  
**Risk Level:** MEDIUM  
**Goal:** Extract frontend code into separate project while maintaining full functionality
### Phase 2.1: Frontend Project Setup (Days 1-3)

#### Create Frontend Directory Structure
```bash
# 1. Copy current app structure to frontend/
mkdir frontend
cp -r app/ frontend/
cp -r components/ frontend/
cp -r lib/ frontend/
cp -r styles/ frontend/
cp -r public/ frontend/
cp package.json frontend/
cp next.config.js frontend/
cp tailwind.config.js frontend/
cp tsconfig.json frontend/

# 2. Update frontend package.json
cd frontend
# Remove backend-specific dependencies
# Update scripts for frontend-only build
```

#### Frontend Package.json Configuration
```json
{
  "name": "rufa-elan-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "zustand": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^1.0.0",
    "lucide-react": "^0.200.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

#### Update Next.js Configuration
```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes removed - will proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      }
    ];
  },
  
  // Environment variables for frontend
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  },
  
  // Optimize for separated architecture
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  }
};

module.exports = nextConfig;
```

### Phase 2.2: Remove Backend Code from Frontend (Days 2-4)

#### Remove API Routes Directory
```bash
# Remove all API routes from frontend
rm -rf frontend/app/api/

# Create proxy API directory for development
mkdir frontend/app/api
```

#### Create API Proxy for Development
```typescript
// frontend/app/api/[...path]/route.ts
// Temporary proxy during migration
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    });
    
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend service unavailable' }, 
      { status: 503 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
```

#### Update API Client Configuration
```typescript
// frontend/lib/api-client.ts
// Centralized API client for backend communication

class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async getAuthToken(): Promise<string | null> {
    const { createClientComponentSupabaseClient } = await import('./supabase-client');
    const supabase = createClientComponentSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
  
  // API methods
  async getProducts(params?: URLSearchParams): Promise<Product[]> {
    const query = params ? `?${params.toString()}` : '';
    return this.request(`/products${query}`);
  }
  
  async getProduct(slug: string): Promise<Product> {
    return this.request(`/products/${slug}`);
  }
  
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
  
  async getOrders(): Promise<Order[]> {
    return this.request('/orders');
  }
  
  // Admin methods
  async getAdminStats(): Promise<AdminStats> {
    return this.request('/admin/stats');
  }
  
  async getAdminOrders(): Promise<AdminOrder[]> {
    return this.request('/admin/orders');
  }
}

export const apiClient = new ApiClient();
```

### Phase 2.3: Update Frontend Components (Days 3-5)

#### Update State Management
```typescript
// frontend/lib/stores/useProductStore.ts
import { create } from 'zustand';
import { apiClient } from '../api-client';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  getProduct: (slug: string) => Promise<Product>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters as any);
      const products = await apiClient.getProducts(params);
      set({ products, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false 
      });
    }
  },
  
  getProduct: async (slug: string) => {
    try {
      return await apiClient.getProduct(slug);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product' 
      });
      throw error;
    }
  },
}));
```

#### Update Page Components to Use API Client
```typescript
// frontend/app/products/page.tsx
'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/lib/stores/useProductStore';
import ProductCard from '@/components/ProductCard';
import Loading from '@/components/ui/Loading';

export default function ProductsPage() {
  const { products, loading, error, fetchProducts } = useProductStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Phase 2.4: Environment Configuration (Days 4-6)

#### Frontend Environment Variables
```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_or_live_key

# Development
NODE_ENV=development

# Production
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://api.rufa-elan.com
```

#### Docker Configuration for Frontend
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder  
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Phase 2.5: Testing & Validation (Days 5-7)

#### Create Development Docker Compose
```yaml
# deployment/docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - ../frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    command: npm run dev

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ../backend/src:/app/src
    command: npm run dev
```

#### Parallel Development Testing
```bash
# Test 1: Run both old and new systems in parallel
cd original-project
npm run dev & # Port 3001

cd ../rufa-elan-new
docker-compose -f deployment/docker-compose.dev.yml up

# Test 2: Compare functionality
# Navigate through both applications
# Verify identical behavior
```

### Phase 2 Deliverables

✅ **Frontend Extracted Successfully:**
- Standalone Next.js frontend project
- All UI components and pages functional
- API client configured for backend communication
- Development environment working

✅ **Backward Compatibility Maintained:**
- API proxy ensures no broken functionality
- All URLs continue to work
- User experience unchanged

✅ **Ready for Backend Migration:**
- Clear API contract defined
- Environment configuration separated
- Container setup completed
## Phase 3: Backend Extraction

**Duration:** 2-3 weeks  
**Risk Level:** HIGH  
**Goal:** Migrate all API routes and business logic to separate backend service

### Phase 3.1: Core Backend Infrastructure (Days 1-5)

#### Express Server Setup
```typescript
// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
```

#### Database Service Layer
```typescript
// backend/src/services/database.ts
import { createClient } from '@supabase/supabase-js';

// Create different clients for different access levels
export const createSupabaseClient = (serviceRole = false) => {
  const url = process.env.SUPABASE_URL!;
  const key = serviceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.SUPABASE_ANON_KEY!;
    
  return createClient(url, key, {
    auth: {
      autoRefreshToken: !serviceRole,
      persistSession: !serviceRole
    }
  });
};

// User-scoped client (respects RLS)
export const supabase = createSupabaseClient(false);

// Admin client (service role - use sparingly!)
export const supabaseAdmin = createSupabaseClient(true);
```

#### Authentication Middleware
```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/database';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  isAdmin?: boolean;
}

export const authMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn('Authentication failed', { error: error?.message });
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = {
      id: user.id,
      email: user.email!,
    };
    
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    return res.status(500).json({ error: 'Authentication service error' });
  }
};

export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Check admin status using RLS-protected query
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('email', req.user.email)
      .single();
      
    if (error || !adminUser) {
      logger.warn('Admin access denied', { 
        email: req.user.email,
        error: error?.message 
      });
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.isAdmin = true;
    req.user.role = adminUser.role;
    
    next();
  } catch (error) {
    logger.error('Admin middleware error', error);
    return res.status(500).json({ error: 'Authorization service error' });
  }
};
```

### Phase 3.2: Authentication API Migration (Days 3-6)

#### Auth Routes Implementation
```typescript
// backend/src/routes/auth.ts
import express from 'express';
import { z } from 'zod';
import { supabase } from '../services/database';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2)
});

const otpSchema = z.object({
  email: z.string().email()
});

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      logger.warn('Login failed', { email, error: error.message });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', email)
      .single();
    
    logger.info('User login successful', { userId: data.user.id, email });
    
    res.json({
      user: data.user,
      session: data.session,
      isAdmin: !!adminUser
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ error: 'Login service error' });
  }
});

// POST /api/auth/register  
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      logger.warn('Registration failed', { email, error: error.message });
      return res.status(400).json({ error: error.message });
    }
    
    logger.info('User registration successful', { userId: data.user?.id, email });
    
    res.status(201).json({
      user: data.user,
      session: data.session,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ error: 'Registration service error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
      
    if (error) {
      logger.warn('Profile fetch failed', { userId: req.user.id, error: error.message });
    }
    
    res.json({
      user: req.user,
      profile: profile || null,
      isAdmin: req.isAdmin || false
    });
  } catch (error) {
    logger.error('User profile error', error);
    res.status(500).json({ error: 'Profile service error' });
  }
});

export default router;
```

### Phase 3.3: Product API Migration (Days 4-8)

#### Product Service Layer
```typescript
// backend/src/services/productService.ts
import { supabase, supabaseAdmin } from './database';
import { logger } from '../utils/logger';

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductService {
  async getProducts(filters: ProductFilters = {}) {
    const {
      category,
      featured,
      status = 'active',
      priceMin,
      priceMax,
      search,
      page = 1,
      limit = 20
    } = filters;
    
    let query = supabase
      .from('products')
      .select(`
        id, name, slug, regular_price, sale_price, featured, status,
        categories!inner(id, name, slug),
        product_images(url, alt_text, position)
      `, { count: 'exact' });
    
    // Apply filters
    query = query.eq('status', status);
    
    if (category) {
      query = query.eq('categories.slug', category);
    }
    
    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }
    
    if (priceMin) {
      query = query.gte('regular_price', priceMin);
    }
    
    if (priceMax) {
      query = query.lte('regular_price', priceMax);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error('Product fetch error', error);
      throw new Error('Failed to fetch products');
    }
    
    // Transform data
    const products = (data || []).map(product => ({
      ...product,
      category_name: product.categories?.name || 'Uncategorized',
      images: (product.product_images || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((img: any) => ({
          url: img.url,
          alt_text: img.alt_text || product.name
        })),
      // Remove nested data
      categories: undefined,
      product_images: undefined
    }));
    
    return {
      data: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: ((page - 1) * limit + products.length) < (count || 0),
        hasPrev: page > 1
      }
    };
  }
  
  async getProduct(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, sku, description, regular_price, sale_price, 
        featured, status, created_at,
        categories!inner(id, name, slug),
        product_images(url, alt_text, position),
        product_variants(id, name, value, sku, price, stock_quantity)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
      
    if (error || !data) {
      logger.warn('Product not found', { slug, error: error?.message });
      throw new Error('Product not found');
    }
    
    // Transform data
    return {
      ...data,
      category: data.categories,
      images: (data.product_images || [])
        .sort((a: any, b: any) => a.position - b.position),
      variants: data.product_variants || [],
      // Remove nested properties
      categories: undefined,
      product_images: undefined,
      product_variants: undefined
    };
  }
  
  // Admin methods
  async createProduct(productData: any, adminEmail: string) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (error) {
      logger.error('Product creation failed', { error: error.message, adminEmail });
      throw new Error('Failed to create product');
    }
    
    logger.info('Product created', { productId: data.id, adminEmail });
    return data;
  }
  
  async updateProduct(id: string, updates: any, adminEmail: string) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      logger.error('Product update failed', { id, error: error.message, adminEmail });
      throw new Error('Failed to update product');
    }
    
    logger.info('Product updated', { productId: id, adminEmail });
    return data;
  }
}

export const productService = new ProductService();
```

#### Product Routes
```typescript
// backend/src/routes/products.ts
import express from 'express';
import { z } from 'zod';
import { productService } from '../services/productService';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation schemas
const productFiltersSchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(1).max(50),
  description: z.string().max(5000).optional(),
  category_id: z.string().uuid(),
  regular_price: z.number().min(0.01),
  sale_price: z.number().min(0.01).optional(),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'archived']).default('active')
});

// GET /api/products
router.get('/', validateRequest(productFiltersSchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as any;
    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch products' 
    });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.slug);
    res.json(product);
  } catch (error) {
    const status = error instanceof Error && error.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch product' 
    });
  }
});

// POST /api/products (Admin only)
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(createProductSchema), 
  async (req: any, res) => {
    try {
      const product = await productService.createProduct(req.body, req.user.email);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create product' 
      });
    }
  }
);

export default router;
```

### Phase 3.4: Order & Payment API Migration (Days 6-10)

#### Order Service with Security Fixes
```typescript
// backend/src/services/orderService.ts
import { supabase, supabaseAdmin } from './database';
import { logger } from '../utils/logger';
import { paymentService } from './paymentService';

export interface CreateOrderRequest {
  items: Array<{
    variantId: string;
    quantity: number;
    // NOTE: price NOT accepted from client - calculated server-side
  }>;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region?: string;
  };
  deliveryOption: 'standard' | 'express' | 'pickup';
}

export class OrderService {
  async createOrder(orderData: CreateOrderRequest, userId?: string) {
    const { items, shippingAddress, deliveryOption } = orderData;
    
    // 1. Validate and calculate order totals SERVER-SIDE
    const orderCalculation = await this.calculateOrderTotals(items, deliveryOption);
    
    // 2. Check inventory availability
    const inventoryCheck = await this.checkInventoryAvailability(items);
    if (!inventoryCheck.available) {
      throw new Error(`Insufficient inventory for items: ${inventoryCheck.unavailableItems.join(', ')}`);
    }
    
    // 3. Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    // 4. Create order record with calculated totals
    const orderRecord = {
      user_id: userId || null,
      order_number: orderNumber,
      status: 'pending_payment',
      currency: 'GHS',
      subtotal: orderCalculation.subtotal,
      shipping_fee: orderCalculation.shippingFee,
      discount_amount: orderCalculation.discountAmount,
      total_amount: orderCalculation.totalAmount,
      shipping_address: shippingAddress,
      items: orderCalculation.itemsSnapshot, // Store snapshot for reference
      payment_status: 'unpaid'
    };
    
    // Use service role for order creation (admin operation)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert(orderRecord)
      .select()
      .single();
      
    if (error) {
      logger.error('Order creation failed', { error: error.message, userId });
      throw new Error('Failed to create order');
    }
    
    // 5. Create normalized order items
    await this.createOrderItems(order.id, orderCalculation.items);
    
    // 6. Reserve inventory
    await this.reserveInventory(order.id, items);
    
    logger.info('Order created', { 
      orderId: order.id, 
      orderNumber: orderNumber,
      userId,
      totalAmount: orderCalculation.totalAmount 
    });
    
    return order;
  }
  
  private async calculateOrderTotals(items: any[], deliveryOption: string) {
    // Fetch current prices from database (NEVER trust client prices)
    const variantIds = items.map(item => item.variantId);
    
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id, price, stock_quantity, sku,
        products!inner(id, name, regular_price, sale_price)
      `)
      .in('id', variantIds);
      
    if (error || !variants) {
      throw new Error('Failed to fetch product pricing');
    }
    
    // Calculate subtotal using SERVER-SIDE prices
    let subtotal = 0;
    const itemsSnapshot = [];
    const calculatedItems = [];
    
    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Product variant not found: ${item.variantId}`);
      }
      
      // Use variant price if set, otherwise product price
      const unitPrice = variant.price || variant.products.sale_price || variant.products.regular_price;
      const lineTotal = unitPrice * item.quantity;
      
      subtotal += lineTotal;
      
      // Store snapshot for order record
      itemsSnapshot.push({
        variantId: item.variantId,
        sku: variant.sku,
        name: variant.products.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: lineTotal
      });
      
      calculatedItems.push({
        product_variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: lineTotal
      });
    }
    
    // Calculate shipping fee based on delivery option
    const shippingFee = this.calculateShippingFee(deliveryOption, subtotal);
    
    // Apply discounts (if any)
    const discountAmount = 0; // TODO: Implement coupon system
    
    const totalAmount = subtotal + shippingFee - discountAmount;
    
    return {
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      items: calculatedItems,
      itemsSnapshot
    };
  }
  
  private calculateShippingFee(deliveryOption: string, subtotal: number): number {
    // Business logic for shipping calculation
    if (deliveryOption === 'pickup') return 0;
    if (subtotal >= 200) return 0; // Free shipping over 200 GHS
    if (deliveryOption === 'express') return 20;
    return 10; // Standard shipping
  }
  
  private async checkInventoryAvailability(items: any[]) {
    const variantIds = items.map(item => item.variantId);
    
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .in('id', variantIds);
      
    if (error) {
      throw new Error('Failed to check inventory');
    }
    
    const unavailableItems = [];
    
    for (const item of items) {
      const variant = variants?.find(v => v.id === item.variantId);
      if (!variant || variant.stock_quantity < item.quantity) {
        unavailableItems.push(item.variantId);
      }
    }
    
    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  }
  
  // Additional methods for order management...
}

export const orderService = new OrderService();
```
### Phase 3.5: Admin API Migration (Days 8-12)

#### Admin Service with Enhanced Security
```typescript
// backend/src/services/adminService.ts
import { supabase, supabaseAdmin } from './database';
import { logger } from '../utils/logger';

export class AdminService {
  async getDashboardStats() {
    // Use optimized single query instead of multiple queries
    const { data, error } = await supabaseAdmin.rpc('get_dashboard_stats');
    
    if (error) {
      logger.error('Dashboard stats error', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
    
    return data;
  }
  
  async getOrders(page = 1, limit = 20, filters: any = {}) {
    let query = supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_status, total_amount, created_at,
        shipping_address, user_id,
        profiles(id, full_name, phone)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error('Admin orders fetch error', error);
      throw new Error('Failed to fetch orders');
    }
    
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }
  
  async updateOrderStatus(orderId: string, status: string, adminEmail: string) {
    const validStatuses = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) {
      logger.error('Order status update failed', { orderId, status, error: error.message });
      throw new Error('Failed to update order status');
    }
    
    // Log admin action for audit
    logger.info('Order status updated', { 
      orderId, 
      newStatus: status, 
      adminEmail 
    });
    
    return data;
  }
  
  async getCustomers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('profiles')
      .select(`
        id, full_name, phone, created_at,
        orders(id)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      logger.error('Admin customers fetch error', error);
      throw new Error('Failed to fetch customers');
    }
    
    // Transform data to include order count
    const customers = (data || []).map(customer => ({
      ...customer,
      orderCount: customer.orders?.length || 0,
      orders: undefined // Remove nested orders data
    }));
    
    return {
      data: customers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }
}

export const adminService = new AdminService();
```

#### Admin Routes with Audit Logging
```typescript
// backend/src/routes/admin.ts
import express from 'express';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../utils/auditLogger';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (req: any, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    
    auditLogger.info('Dashboard accessed', {
      adminEmail: req.user.email,
      timestamp: new Date().toISOString()
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data' 
    });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };
    
    const result = await adminService.getOrders(page, limit, filters);
    
    auditLogger.info('Orders accessed', {
      adminEmail: req.user.email,
      filters,
      resultCount: result.data.length
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    });
  }
});

// PUT /api/admin/orders/:id/status
const updateStatusSchema = z.object({
  status: z.enum(['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'])
});

router.put('/orders/:id/status', 
  validateRequest(updateStatusSchema), 
  async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      const order = await adminService.updateOrderStatus(orderId, status, req.user.email);
      
      auditLogger.info('Order status updated', {
        adminEmail: req.user.email,
        orderId,
        oldStatus: 'previous', // TODO: Fetch previous status
        newStatus: status
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update order status' 
      });
    }
  }
);

// GET /api/admin/customers
router.get('/customers', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await adminService.getCustomers(page, limit);
    
    auditLogger.info('Customers accessed', {
      adminEmail: req.user.email,
      page,
      limit,
      resultCount: result.data.length
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch customers' 
    });
  }
});

export default router;
```

### Phase 3.6: Payment Integration Migration (Days 10-14)

#### Secure Payment Service
```typescript
// backend/src/services/paymentService.ts
import fetch from 'node-fetch';
import { supabase } from './database';
import { logger } from '../utils/logger';
import { orderService } from './orderService';

export class PaymentService {
  private paystackSecretKey: string;
  
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;
    if (!this.paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }
  
  async initializePayment(orderId: string) {
    // Fetch order with SERVER-CALCULATED total
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, shipping_address, user_id')
      .eq('id', orderId)
      .single();
      
    if (error || !order) {
      throw new Error('Order not found');
    }
    
    // Use server-calculated amount (not client-provided)
    const paymentData = {
      email: order.shipping_address.email,
      amount: Math.round(order.total_amount * 100), // Convert to kobo
      reference: `${order.order_number}_${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: order.order_number
          }
        ]
      }
    };
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json() as any;
    
    if (!response.ok || !result.status) {
      logger.error('Paystack initialization failed', { 
        orderId, 
        error: result.message 
      });
      throw new Error('Payment initialization failed');
    }
    
    logger.info('Payment initialized', { 
      orderId, 
      reference: paymentData.reference,
      amount: paymentData.amount 
    });
    
    return {
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: paymentData.reference
    };
  }
  
  async verifyPayment(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`
      }
    });
    
    const result = await response.json() as any;
    
    if (!response.ok || !result.status) {
      logger.error('Payment verification failed', { reference, error: result.message });
      throw new Error('Payment verification failed');
    }
    
    const transaction = result.data;
    
    if (transaction.status !== 'success') {
      logger.warn('Payment not successful', { reference, status: transaction.status });
      return { success: false, transaction };
    }
    
    // Extract order information from metadata
    const orderId = transaction.metadata?.order_id;
    
    if (!orderId) {
      logger.error('Order ID missing from payment metadata', { reference });
      throw new Error('Invalid payment metadata');
    }
    
    // Update order status
    await this.updateOrderAfterPayment(orderId, reference, transaction);
    
    logger.info('Payment verified successfully', { 
      reference, 
      orderId,
      amount: transaction.amount 
    });
    
    return { success: true, transaction, orderId };
  }
  
  private async updateOrderAfterPayment(orderId: string, reference: string, transaction: any) {
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        payment_status: 'paid',
        payment_reference: reference,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (orderError) {
      logger.error('Order update after payment failed', { orderId, reference });
      throw new Error('Failed to update order after payment');
    }
    
    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        provider: 'Paystack',
        reference: reference,
        status: 'success',
        amount: transaction.amount / 100, // Convert from kobo
        currency: transaction.currency,
        metadata: transaction
      });
      
    if (paymentError) {
      logger.error('Payment record creation failed', { orderId, reference });
      // Don't throw error - payment was successful, just logging failed
    }
    
    // TODO: Send order confirmation email
    // TODO: Update inventory
    // TODO: Create delivery tracking record
  }
  
  async handleWebhook(signature: string, payload: any) {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    if (hash !== signature) {
      logger.warn('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }
    
    const { event, data } = payload;
    
    switch (event) {
      case 'charge.success':
        await this.handleSuccessfulCharge(data);
        break;
      case 'charge.failed':
        await this.handleFailedCharge(data);
        break;
      default:
        logger.info('Unhandled webhook event', { event });
    }
  }
  
  private async handleSuccessfulCharge(data: any) {
    // Additional processing for successful charges
    logger.info('Webhook: Charge successful', { reference: data.reference });
  }
  
  private async handleFailedCharge(data: any) {
    // Handle failed charges
    logger.info('Webhook: Charge failed', { reference: data.reference });
  }
}

export const paymentService = new PaymentService();
```

### Phase 3.7: Route Aggregation & Testing (Days 12-15)

#### Main Routes Configuration
```typescript
// backend/src/routes/index.ts
import express from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import adminRoutes from './admin';
import paymentRoutes from './payments';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'RUFA ELAN API v1.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      payments: '/api/payments'
    },
    documentation: '/api/docs'
  });
});

export default router;
```

#### Backend Server Entry Point
```typescript
// backend/src/server.ts
import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8000;

// Validate environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
```

### Phase 3.8: Gradual Traffic Migration (Days 13-21)

#### Traffic Splitting Strategy
```typescript
// Middleware for gradual migration
// backend/src/middleware/trafficSplit.ts
export const trafficSplitMiddleware = (percentage: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const random = Math.random() * 100;
    
    if (random < percentage) {
      // Route to new backend
      next();
    } else {
      // Proxy to old Next.js API
      const oldApiUrl = `${process.env.OLD_API_URL}${req.originalUrl}`;
      // Implement proxy logic here
    }
  };
};

// Apply gradual migration
// Week 1: 10% traffic to new backend
// Week 2: 50% traffic to new backend
// Week 3: 100% traffic to new backend
```

### Phase 3 Deliverables

✅ **Backend API Fully Functional:**
- All API routes migrated and tested
- Proper authentication and authorization
- Enhanced security with server-side validation
- Business logic properly separated

✅ **Critical Security Fixes Applied:**
- Client-controlled pricing eliminated
- Proper inventory validation
- Server-side total calculation
- Admin authorization hardened

✅ **Performance Optimizations:**
- Database queries optimized
- Proper indexing implemented
- Response caching added
- Connection pooling configured

✅ **Zero-Downtime Migration:**
- Gradual traffic splitting implemented
- Rollback procedures tested
- Monitoring and alerting active

---

## Phase 4: Security Hardening & Final Optimization

**Duration:** 1 week  
**Risk Level:** LOW  
**Goal:** Complete security implementation and performance optimization
### Phase 4.1: Enhanced Security Implementation (Days 1-3)

#### Complete RLS Policy Overhaul
```sql
-- Database security hardening script
-- Run after backend migration is complete

-- 1. Create enhanced admin verification function with logging
CREATE OR REPLACE FUNCTION auth.is_admin_with_audit()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Check admin status
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.email() 
    AND active = true
  ) INTO is_admin_user;
  
  -- Log admin access attempts
  IF is_admin_user THEN
    INSERT INTO audit_logs (
      admin_email,
      action,
      resource_type,
      ip_address,
      timestamp
    ) VALUES (
      auth.email(),
      'admin_access',
      'system',
      inet_client_addr(),
      now()
    );
  END IF;
  
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update all admin policies to use audited function
UPDATE pg_policies SET 
  qual = replace(qual, 'auth.is_admin()', 'auth.is_admin_with_audit()')
WHERE qual LIKE '%auth.is_admin()%';

-- 3. Add comprehensive audit logging table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  admin_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now() NOT NULL,
  
  -- Indexes for performance
  INDEX idx_audit_logs_timestamp (timestamp DESC),
  INDEX idx_audit_logs_admin_email (admin_email),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_resource (resource_type, resource_id)
);

-- 4. Audit log RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (auth.is_admin_with_audit());

-- System can insert audit logs (no user restrictions)
CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);

-- 5. Create audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id,
      admin_email,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      timestamp
    ) VALUES (
      auth.uid(),
      auth.email(),
      'update',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id,
      admin_email,
      action,
      resource_type,
      resource_id,
      old_values,
      timestamp
    ) VALUES (
      auth.uid(),
      auth.email(),
      'delete',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD),
      now()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_products_trigger
  AFTER UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_orders_trigger
  AFTER UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_admin_users_trigger
  AFTER UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

#### CSRF Protection Implementation
```typescript
// backend/src/middleware/csrf.ts
import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// CSRF protection middleware
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF token endpoint
export const getCsrfToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
};

// Apply CSRF protection to state-changing operations
export const applyCsrfToRoutes = (app: any) => {
  // Protect all POST, PUT, DELETE routes
  app.use('/api/admin', csrfProtection);
  app.use('/api/orders', csrfProtection);
  app.use('/api/payments', csrfProtection);
  
  // Provide CSRF token endpoint
  app.get('/api/csrf-token', csrfProtection, getCsrfToken);
};
```

#### Enhanced Rate Limiting
```typescript
// backend/src/middleware/advancedRateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Tiered rate limiting based on operation sensitivity
export const rateLimits = {
  // Strict limits for authentication
  authentication: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Increase penalty for repeated failures
    skipSuccessfulRequests: true,
  }),
  
  // Moderate limits for general API usage
  general: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Rate limit exceeded. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Very strict limits for admin operations
  admin: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 admin operations per minute
    message: { error: 'Admin rate limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Extremely strict for payment operations
  payment: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 payment attempts per 5 minutes
    message: { error: 'Payment rate limit exceeded. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
  })
};
```

### Phase 4.2: Performance Optimization (Days 2-4)

#### Database Performance Enhancements
```sql
-- Additional performance optimizations
-- Add covering indexes for common query patterns

-- Product search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_vector 
ON products USING gin(to_tsvector('english', name || ' ' || description))
WHERE status = 'active';

-- Order analytics optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_analytics
ON orders (created_at, status, total_amount) 
WHERE status IN ('completed', 'delivered');

-- Customer analysis optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_registration
ON profiles (created_at, id);

-- Admin dashboard optimization - materialized view
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
  (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30_days,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_customers_last_30_days,
  (SELECT COUNT(*) FROM orders WHERE status = 'processing') as orders_processing,
  (SELECT COUNT(*) FROM orders WHERE payment_status = 'unpaid') as unpaid_orders;

-- Refresh materialized view every hour
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-dashboard', '0 * * * *', 'SELECT refresh_dashboard_stats();');
```

#### Caching Implementation
```typescript
// backend/src/services/cacheService.ts
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
  
  // Cache wrapper function
  async remember<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    
    return fresh;
  }
}

export const cacheService = new CacheService();

// Cache keys constants
export const CACHE_KEYS = {
  PRODUCTS: (filters: string) => `products:${filters}`,
  PRODUCT: (slug: string) => `product:${slug}`,
  CATEGORIES: 'categories:all',
  DASHBOARD_STATS: 'admin:dashboard:stats',
  USER_ORDERS: (userId: string) => `orders:user:${userId}`,
};

// Cache TTL constants (seconds)
export const CACHE_TTL = {
  PRODUCTS: 300,      // 5 minutes
  PRODUCT: 600,       // 10 minutes  
  CATEGORIES: 1800,   // 30 minutes
  DASHBOARD: 300,     // 5 minutes
  USER_DATA: 900,     // 15 minutes
};
```

#### Response Compression & Optimization
```typescript
// backend/src/middleware/performance.ts
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Smart compression middleware
export const smartCompression = compression({
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Compress all text responses
    return compression.filter(req, res);
  },
  level: 6, // Good balance of compression vs CPU
  threshold: 1024, // Only compress responses > 1KB
});

// Response time tracking
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Request size limiting
export const requestSizeLimit = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-length']) {
      const size = parseInt(req.headers['content-length']);
      const maxBytes = parseSize(maxSize);
      
      if (size > maxBytes) {
        return res.status(413).json({ 
          error: `Request too large. Maximum size is ${maxSize}` 
        });
      }
    }
    
    next();
  };
};

function parseSize(size: string): number {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  
  if (!match) throw new Error('Invalid size format');
  
  const [, num, unit = 'b'] = match;
  return Math.floor(parseFloat(num) * units[unit as keyof typeof units]);
}
```

### Phase 4.3: Monitoring & Alerting (Days 3-5)

#### Application Performance Monitoring
```typescript
// backend/src/utils/monitoring.ts
import { Request, Response } from 'express';

interface MetricData {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  errorMessage?: string;
}

class MonitoringService {
  private metrics: MetricData[] = [];
  
  recordRequest(req: Request, res: Response, responseTime: number, error?: Error) {
    const metric: MetricData = {
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.id,
      errorMessage: error?.message
    };
    
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
    
    // Alert on errors
    if (error || res.statusCode >= 500) {
      this.sendAlert(metric);
    }
  }
  
  getMetrics(minutes = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }
  
  getHealthStatus() {
    const recentMetrics = this.getMetrics(5); // Last 5 minutes
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    
    return {
      status: errorRate > 0.1 || avgResponseTime > 2000 ? 'unhealthy' : 'healthy',
      errorRate: Math.round(errorRate * 100),
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests: recentMetrics.length,
      timestamp: new Date().toISOString()
    };
  }
  
  private async sendAlert(metric: MetricData) {
    // Implement alerting logic (email, Slack, etc.)
    console.error('ALERT:', {
      message: 'Application error detected',
      metric,
      timestamp: new Date().toISOString()
    });
  }
}

export const monitoring = new MonitoringService();

// Health check endpoint
export const healthCheckHandler = (req: Request, res: Response) => {
  const health = monitoring.getHealthStatus();
  const status = health.status === 'healthy' ? 200 : 503;
  
  res.status(status).json({
    ...health,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || '1.0.0'
  });
};
```

#### Database Connection Monitoring
```typescript
// backend/src/utils/dbMonitoring.ts
import { supabase } from '../services/database';

class DatabaseMonitor {
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
  
  async getConnectionStats() {
    // This would require access to Supabase's connection pool stats
    // For now, we'll implement basic connection testing
    const start = Date.now();
    const isConnected = await this.checkConnection();
    const responseTime = Date.now() - start;
    
    return {
      connected: isConnected,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
}

export const dbMonitor = new DatabaseMonitor();
```

### Phase 4.4: Documentation & Final Cleanup (Days 4-7)

#### API Documentation with OpenAPI
```typescript
// backend/src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RUFA ELAN E-commerce API',
      version: '1.0.0',
      description: 'RESTful API for RUFA ELAN e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@rufa-elan.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.rufa-elan.com/api', 
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
```

#### Frontend Cleanup & Optimization
```typescript
// Remove old API routes from frontend
// frontend/cleanup-script.js
const fs = require('fs');
const path = require('path');

// Remove old API directory
const apiDir = path.join(__dirname, 'app/api');
if (fs.existsSync(apiDir)) {
  // Keep only proxy route
  const files = fs.readdirSync(apiDir);
  files.forEach(file => {
    if (file !== 'proxy') {
      fs.rmSync(path.join(apiDir, file), { recursive: true, force: true });
    }
  });
}

// Update package.json to remove backend dependencies
const packageJson = require('./package.json');
const backendDeps = ['@supabase/supabase-js', 'resend', 'paystack-node'];
backendDeps.forEach(dep => {
  delete packageJson.dependencies[dep];
});

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

console.log('Frontend cleanup completed');
```

### Phase 4 Deliverables

✅ **Security Hardening Complete:**
- Comprehensive audit logging implemented
- CSRF protection active
- Enhanced rate limiting deployed
- All RLS policies strengthened

✅ **Performance Optimized:**
- Database queries optimized with proper indexing
- Caching layer implemented with Redis
- Response compression enabled
- Connection pooling configured

✅ **Monitoring & Alerting Active:**
- Application performance monitoring
- Database connection monitoring
- Health check endpoints
- Error alerting system

✅ **Documentation Complete:**
- API documentation with OpenAPI/Swagger
- Deployment guides updated
- Security configuration documented
- Performance tuning guide created

---

## Migration Validation & Testing

### Comprehensive Testing Strategy

#### Functional Testing Checklist
```typescript
// Test scenarios to validate migration success

const migrationTests = {
  authentication: [
    'User registration flow',
    'Email/password login',
    'OAuth login (Google)',
    'OTP authentication',
    'Password reset flow',
    'Session management',
    'Admin authentication',
    'Token refresh'
  ],
  
  ecommerce: [
    'Product catalog browsing',
    'Product search and filtering', 
    'Shopping cart functionality',
    'Guest checkout process',
    'Authenticated user checkout',
    'Payment processing (Paystack)',
    'Order confirmation emails',
    'Order tracking',
    'Order history access'
  ],
  
  admin: [
    'Admin dashboard access',
    'Product management (CRUD)',
    'Order management',
    'Customer insights',
    'Analytics reporting',
    'Inventory updates',
    'User role verification'
  ],
  
  security: [
    'SQL injection prevention',
    'XSS protection',
    'CSRF protection',
    'Rate limiting enforcement',
    'Admin authorization checks',
    'Input validation',
    'Authentication bypass attempts',
    'Price manipulation prevention'
  ],
  
  performance: [
    'Page load times < 2 seconds',
    'API response times < 500ms',
    'Database query optimization',
    'Caching effectiveness',
    'Concurrent user handling',
    'Mobile responsiveness'
  ]
};
```

#### Load Testing Configuration
```yaml
# k6 load testing script
# tests/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '5m', // 5 minute test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  // Test product listing
  let response = http.get('https://api.rufa-elan.com/api/products');
  check(response, {
    'products API status 200': (r) => r.status === 200,
    'products response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // Test authentication
  response = http.post('https://api.rufa-elan.com/api/auth/login', {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  check(response, {
    'auth API responds': (r) => r.status === 200 || r.status === 401,
  });
  
  sleep(1);
}
```

### Migration Rollback Procedures

#### Emergency Rollback Plan
```bash
#!/bin/bash
# Emergency rollback script

echo "Starting emergency rollback..."

# 1. Switch traffic back to original system
kubectl patch service frontend-service -p '{"spec":{"selector":{"app":"original-frontend"}}}'
kubectl patch service backend-service -p '{"spec":{"selector":{"app":"original-backend"}}}'

# 2. Verify services are responding
curl -f http://rufa-elan.com/health || exit 1

# 3. Restore database if needed (from backup)
# psql $DATABASE_URL < backups/pre-migration-backup.sql

echo "Rollback completed successfully"
echo "System restored to pre-migration state"
```

#### Data Integrity Validation
```sql
-- Validate data integrity after migration
-- Run these checks to ensure no data loss

-- 1. Check record counts match
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL  
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

-- 2. Verify order totals are consistent
SELECT 
  id,
  order_number,
  total_amount,
  (subtotal + shipping_fee - discount_amount) as calculated_total,
  CASE 
    WHEN abs(total_amount - (subtotal + shipping_fee - discount_amount)) > 0.01 
    THEN 'MISMATCH' 
    ELSE 'OK' 
  END as status
FROM orders
WHERE status != 'cancelled'
  AND abs(total_amount - (subtotal + shipping_fee - discount_amount)) > 0.01;

-- 3. Check for orphaned records
SELECT 'orphaned_order_items' as issue, COUNT(*) as count
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL

UNION ALL

SELECT 'orphaned_cart_items', COUNT(*)
FROM cart_items ci
LEFT JOIN profiles p ON ci.user_id = p.id
WHERE ci.user_id IS NOT NULL AND p.id IS NULL;
```

---

**Migration Strategy Summary:** This comprehensive migration plan ensures a smooth, secure, and zero-downtime transition from the current monolithic Next.js architecture to a separated frontend/backend system. Each phase builds upon the previous one, with clear rollback procedures and extensive testing to minimize risk while maximizing the security and performance benefits of the new architecture.