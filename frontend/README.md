# RUFA ELAN Frontend

Next.js frontend application for the RUFA ELAN e-commerce platform.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🏗️ Architecture

### Directory Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (customer)/         # Customer-facing routes
│   └── (admin)/           # Admin dashboard routes
├── components/            # React components
├── lib/                   # Utilities and configurations
├── store/                 # Zustand state stores
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

### Key Features
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **API Client** for backend communication

## 🔧 Configuration

### Environment Variables (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Paystack (public key only)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

### API Communication
The frontend communicates with the backend via the API client in `lib/api-client.ts`. All API calls are automatically routed to the backend service.

## 🎨 Components

### UI Components
- **Reusable components** in `components/ui/`
- **Customer components** in `components/customer/`
- **Admin components** in `components/admin/`

### Pages Structure
- **Customer routes**: `/`, `/products`, `/cart`, `/checkout`, etc.
- **Admin routes**: `/admin/*` (dashboard, products, orders, etc.)
- **Auth routes**: `/auth/*` (login, register, etc.)

## 📦 Dependencies

### Core Dependencies
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `zustand` - State management

### Supabase Integration
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Hot Reload
The development server supports hot reload for all React components and pages.

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Deployment
```bash
npm run build
# Deploy the .next folder and package.json
```

## 🔐 Security

### Authentication
- Uses Supabase Auth for user authentication
- JWT tokens handled automatically
- Admin routes protected by authentication checks

### API Security
- All sensitive operations routed to backend
- Client-side validation for UX only
- No sensitive data stored in frontend

## 📱 Responsive Design

The frontend is fully responsive and works across:
- **Desktop** - Full functionality
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Performance

### Optimization Features
- **Next.js optimization** - Built-in performance features
- **Image optimization** - Automatic WebP conversion
- **Code splitting** - Automatic route-based splitting
- **Static generation** - Pre-rendered pages where possible

### Bundle Analysis
```bash
npm run analyze
```

## 🔄 State Management

### Zustand Stores
- **Product store** - Product catalog state
- **Cart store** - Shopping cart state  
- **Auth store** - Authentication state
- **Admin store** - Admin dashboard state

### Server State
Server data is fetched via the API client and cached appropriately.

## 🎯 Best Practices

### Code Organization
- **Separation of concerns** - Clear component boundaries
- **Reusable components** - DRY principle
- **TypeScript** - Full type coverage
- **Error boundaries** - Graceful error handling

### Performance
- **Lazy loading** - Components loaded on demand
- **Memoization** - Prevent unnecessary re-renders
- **Efficient re-renders** - Optimized state updates

## 🤝 Contributing

1. Follow the existing component structure
2. Use TypeScript for all new code
3. Add tests for new components
4. Follow the established naming conventions
5. Update documentation for new features

---

**Part of the RUFA ELAN separated architecture.**