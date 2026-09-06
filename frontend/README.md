# RUFA ELAN Frontend

Next.js frontend application for the RUFA ELAN e-commerce platform with Temu-inspired UI/UX design.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠 Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **Lucide React** for icons
- **Framer Motion** for animations

## 📁 Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── (pages)/        # Page components
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout
├── components/         # Reusable React components
│   ├── temu-header.tsx       # Main navigation header
│   ├── temu-product-card.tsx # Product display card
│   ├── temu-deals-section.tsx # Promotional sections
│   ├── category-pills.tsx    # Category navigation
│   ├── filter-bar.tsx       # Search and filter controls
│   └── temu-layout.tsx      # Layout wrapper
├── lib/               # Utility functions and configurations
│   ├── utils.ts       # Helper functions
│   ├── sample-data.ts # Mock data for development
│   └── supabase-*.ts  # Database configurations
├── store/             # Zustand state management
│   ├── cart-store.ts   # Shopping cart state
│   └── wishlist-store.ts # Wishlist state
├── public/            # Static assets
└── .env.local         # Environment variables
```

## 🎨 Design System

### Color Palette
```typescript
rufaelan: {
  primary: "#E65100",       // Main brand color
  "primary-dark": "#D84315", // Dark variant
  secondary: "#FF8F65",     // Light orange
  accent: "#FFF3E0",        // Very light orange
  dark: "#2E2E2E",          // Dark neutral
  "dark-light": "#424242",  // Light dark
  gray: "#FAFAFA",          // Background
  "gray-light": "#F5F5F5"   // Light background
}
```

### Component Architecture
- **Atomic Design**: Components organized by complexity
- **Responsive First**: Mobile-optimized with desktop scaling
- **Accessibility**: WCAG compliant with keyboard navigation
- **Performance**: Optimized images and lazy loading

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler check
```

## 🌍 Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Payment Gateway
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Application Settings
NEXT_PUBLIC_APP_NAME=RUFA ELAN
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Key Features

### Temu-Inspired Design
- **High-Density Layouts**: Maximum product visibility
- **Trust Indicators**: Purchase protection, free shipping badges
- **Social Proof**: Ratings, reviews, "X+ sold" counters
- **Lightning Deals**: Countdown timers and stock progress
- **Interactive Elements**: Hover effects, quick actions

### E-commerce Functionality
- **Product Catalog**: Grid/list views with filtering
- **Shopping Cart**: Add/remove items with persistence
- **Wishlist**: Save favorite products
- **User Authentication**: Login, register, profile management
- **Order Tracking**: Real-time delivery status
- **Payment Integration**: Secure checkout flow

### Performance Optimizations
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **State Management**: Efficient Zustand stores
- **Caching**: Browser and server-side caching

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0px - 768px (2-3 columns)
- **Tablet**: 768px - 1024px (3-4 columns)  
- **Desktop**: 1024px+ (4-6 columns)

### Mobile Features
- Touch-optimized interactions
- Collapsible navigation menu
- Swipe gestures for categories
- Optimized button sizes

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔍 Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Implement proper error boundaries
- Use semantic HTML elements

### Performance
- Optimize images before adding to public folder
- Use dynamic imports for large components
- Implement proper loading states
- Monitor Core Web Vitals

### Accessibility
- Include proper alt text for images
- Maintain keyboard navigation support
- Use proper heading hierarchy
- Test with screen readers

## 🐛 Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript types and imports
2. **Environment Variables**: Ensure NEXT_PUBLIC_ prefix for client-side
3. **API Connections**: Verify backend server is running
4. **Styling Issues**: Check Tailwind CSS compilation

### Debug Mode
```bash
# Enable detailed logging
NODE_OPTIONS='--inspect' npm run dev

# Run with debug information
DEBUG=* npm run dev
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)

---

For more information, see the main project README or contact the development team.