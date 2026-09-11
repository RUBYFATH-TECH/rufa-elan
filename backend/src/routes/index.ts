import express from 'express';
import productsRouter from './products';
import productImagesRouter from './product-images';
import productVariantsRouter from './product-variants';
import categoriesRouter from './categories';
import ordersRouter from './orders';
import cartRouter from './cart';
import wishlistRouter from './wishlist';
import addressesRouter from './addresses';
import paymentMethodsRouter from './payment-methods';
import notificationsRouter from './notifications';
import userSettingsRouter from './user-settings';
import adminUsersRouter from './admin-users';

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

// Payment Methods routes
router.use('/payment-methods', paymentMethodsRouter);

// Notifications routes
router.use('/notifications', notificationsRouter);

// User Settings routes
router.use('/user-settings', userSettingsRouter);

// Admin User Management routes
router.use('/admin', adminUsersRouter);

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
      paymentMethods: {
        base: '/api/payment-methods',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'User payment method management',
          'Add/update/remove payment methods',
          'Set default payment method',
          'Support for mobile money, cards, bank transfers',
          'Payment method listing with default first'
        ]
      },
      notifications: {
        base: '/api/notifications',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        features: [
          'User notification management',
          'Get notifications with filters and pagination',
          'Create single and bulk notifications',
          'Mark notifications as read/delivered',
          'Notification cleanup and management',
          'Order status and payment notifications',
          'Promotional and system notifications'
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
      },
      paymentMethods: {
        'GET /payment-methods': 'List all user payment methods',
        'GET /payment-methods/:id': 'Get single payment method',
        'POST /payment-methods': 'Create new payment method',
        'PUT /payment-methods/:id': 'Update payment method',
        'DELETE /payment-methods/:id': 'Delete payment method',
        'POST /payment-methods/:id/set-default': 'Set payment method as default'
      },
      notifications: {
        'GET /notifications': 'List notifications with filters and pagination',
        'GET /notifications/:id': 'Get single notification',
        'POST /notifications': 'Create new notification',
        'POST /notifications/bulk': 'Create bulk notifications',
        'PATCH /notifications/:id': 'Update notification',
        'PUT /notifications/:id/read': 'Mark notification as read',
        'PUT /notifications/read/bulk': 'Mark multiple notifications as read',
        'PUT /notifications/user/:userId/read-all': 'Mark all notifications as read for user',
        'PUT /notifications/:id/delivered': 'Mark notification as delivered',
        'DELETE /notifications/:id': 'Delete notification',
        'DELETE /notifications/bulk': 'Delete multiple notifications',
        'DELETE /notifications/user/:userId': 'Delete all notifications for user',
        'GET /notifications/user/:userId/unread-count': 'Get unread notification count',
        'GET /notifications/user/:userId/stats': 'Get notification statistics',
        'POST /notifications/cleanup-expired': 'Clean up expired notifications'
      }
    }
  });
});

export default router;