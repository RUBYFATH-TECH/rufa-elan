import express from 'express';
import productsRouter from './products';
import productImagesRouter from './product-images';
import productVariantsRouter from './product-variants';
import categoriesRouter from './categories';
import ordersRouter from './orders';
import cartRouter from './cart';
import wishlistRouter from './wishlist';

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
    status: 'In Development - Products, Categories, Orders, Cart, & Wishlist CRUD Complete',
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
      users: '/api/users - Coming in Task 3',
      admin: '/api/admin - Coming in Task 5',
      auth: '/api/auth - Coming in Task 3',
      payments: '/api/payments - Coming in Task 2'
    },
    documentation: {
      products: {
        'GET /products': 'List products with filtering and pagination',
        'GET /products/:id': 'Get single product details',
        'POST /products': 'Create new product (Admin)',
        'PUT /products/:id': 'Update product (Admin)',
        'DELETE /products/:id': 'Delete product (Admin)'
      },
      categories: {
        'GET /categories': 'List all categories',
        'GET /categories?hierarchy=true': 'Get category tree',
        'GET /categories/:id': 'Get single category',
        'POST /categories': 'Create new category (Admin)',
        'PUT /categories/:id': 'Update category (Admin)',
        'DELETE /categories/:id': 'Delete category (Admin)'
      },
      orders: {
        'GET /orders': 'List user orders',
        'GET /orders/:id': 'Get order details',
        'POST /orders': 'Create new order',
        'PUT /orders/:id': 'Update order status',
        'GET /orders/:id/tracking': 'Get delivery tracking'
      },
      cart: {
        'GET /cart': 'Get cart items',
        'POST /cart/items': 'Add item to cart',
        'PUT /cart/items/:itemId': 'Update item quantity',
        'DELETE /cart/items/:itemId': 'Remove item from cart',
        'DELETE /cart': 'Clear cart'
      },
      wishlist: {
        'GET /wishlist': 'Get wishlist items',
        'POST /wishlist/:productId': 'Add product to wishlist',
        'DELETE /wishlist/:productId': 'Remove product from wishlist',
        'GET /wishlist/check/:productId': 'Check if product in wishlist'
      }
    }
  });
});

export default router;

router.use('/users', (req, res) => {
  res.status(501).json({
    error: 'User management endpoints not yet implemented',
    message: 'This will be implemented in Task 3',
    availableIn: 'Task 3: User Management CRUD'
  });
});

router.use('/cart', (req, res) => {
  res.status(501).json({
    error: 'Cart endpoints not yet implemented',
    message: 'This will be implemented in Task 4',
    availableIn: 'Task 4: Cart and Wishlist CRUD'
  });
});

router.use('/wishlist', (req, res) => {
  res.status(501).json({
    error: 'Wishlist endpoints not yet implemented',
    message: 'This will be implemented in Task 4',
    availableIn: 'Task 4: Cart and Wishlist CRUD'
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
    status: 'In Development - Products & Categories CRUD Complete',
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
      orders: '/api/orders - Coming in Task 2',
      users: '/api/users - Coming in Task 3',
      cart: '/api/cart - Coming in Task 4',
      wishlist: '/api/wishlist - Coming in Task 4',
      admin: '/api/admin - Coming in Task 5',
      auth: '/api/auth - Coming in Task 3',
      payments: '/api/payments - Coming in Task 2'
    },
    documentation: {
      products: {
        'GET /products': 'List products with filtering and pagination',
        'GET /products/:id': 'Get single product details',
        'POST /products': 'Create new product (Admin)',
        'PUT /products/:id': 'Update product (Admin)',
        'DELETE /products/:id': 'Delete product (Admin)',
        'GET /products/:id/variants': 'Get product variants',
        'GET /products/:id/images': 'Get product images'
      },
      categories: {
        'GET /categories': 'List all categories',
        'GET /categories?hierarchy=true': 'Get category tree',
        'GET /categories/:id': 'Get single category',
        'POST /categories': 'Create new category (Admin)',
        'PUT /categories/:id': 'Update category (Admin)',
        'DELETE /categories/:id': 'Delete category (Admin)',
        'GET /categories/:id/children': 'Get child categories',
        'GET /categories/:id/products': 'Get products in category'
      }
    }
  });
});

export default router;