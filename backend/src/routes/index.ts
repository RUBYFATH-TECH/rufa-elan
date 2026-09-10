import express from 'express';
import productsRouter from './products';
import productImagesRouter from './product-images';
import productVariantsRouter from './product-variants';
import categoriesRouter from './categories';
import ordersRouter from './orders';
import cartRouter from './cart';
import wishlistRouter from './wishlist';
import addressesRouter from './addresses';

const router = express.Router();

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RUFA ELAN API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Product routes
router.use('/products', productsRouter);
router.use('/products', productImagesRouter);
router.use('/products', productVariantsRouter);

// Category routes
router.use('/categories', categoriesRouter);

// Order routes
router.use('/orders', ordersRouter);

// Cart routes
router.use('/cart', cartRouter);

// Wishlist routes
router.use('/wishlist', wishlistRouter);

// Address routes
router.use('/addresses', addressesRouter);

// Placeholder routes - will be implemented in subsequent tasks
router.use('/users', (req, res) => {
  res.status(501).json({
    error: 'User management endpoints not yet implemented',
    message: 'This will be implemented in Task 3',
    availableIn: 'Task 3: User Management CRUD'
  });
});

router.use('/admin', (req, res) => {
  res.status(501).json({
    error: 'Admin endpoints not yet implemented',
    message: 'This will be implemented in Task 5',
    availableIn: 'Task 5: Admin CRUD'
  });
});

router.use('/auth', (req, res) => {
  res.status(501).json({
    error: 'Authentication endpoints not yet implemented',
    message: 'This will be implemented with user management',
    availableIn: 'Task 3: User Management CRUD'
  });
});

router.use('/payments', (req, res) => {
  res.status(501).json({
    error: 'Payment endpoints not yet implemented',
    message: 'This will be implemented with order management',
    availableIn: 'Task 2: Orders CRUD'
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'RUFA ELAN API v1.0',
    status: 'In Development - Products, Categories, Orders, Cart, Wishlist & Addresses CRUD Complete',
    endpoints: {
      products: {
        base: '/api/products',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'Product listing with filters and pagination',
          'Product CRUD operations',
          'Product image management',
          'Product variant management',
          'Stock management',
          'Advanced search'
        ]
      },
      categories: {
        base: '/api/categories',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'Category listing with pagination',
          'Hierarchical category support',
          'Category CRUD operations',
          'Category reordering',
          'Products by category',
          'Category tree view'
        ]
      },
      orders: {
        base: '/api/orders',
        methods: ['GET', 'POST', 'PUT'],
        features: [
          'Order creation with automatic totals',
          'Order listing with filtering',
          'Order status management',
          'Delivery tracking',
          'Coupon application',
          'Payment tracking'
        ]
      },
      cart: {
        base: '/api/cart',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'Shopping cart management',
          'User and session-based carts',
          'Add/update/remove items',
          'Cart totals calculation',
          'Stock validation'
        ]
      },
      wishlist: {
        base: '/api/wishlist',
        methods: ['GET', 'POST', 'DELETE'],
        features: [
          'User wishlist management',
          'Add/remove products',
          'Wishlist statistics',
          'Product availability check'
        ]
      },
      addresses: {
        base: '/api/addresses',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'User address management',
          'Add/update/remove addresses',
          'Set default address',
          'Address listing with default first'
        ]
      },
      users: '/api/users - Coming Soon',
      admin: '/api/admin - Coming Soon',
      auth: '/api/auth - Coming Soon',
      payments: '/api/payments - Coming Soon'
    },
    documentation: {
      addresses: {
        'GET /addresses': 'List all user addresses',
        'GET /addresses/:id': 'Get single address',
        'POST /addresses': 'Create new address',
        'PUT /addresses/:id': 'Update address',
        'DELETE /addresses/:id': 'Delete address',
        'POST /addresses/:id/set-default': 'Set address as default'
      }
    }
  });
});

export default router;