# API Quick Reference - RUFA ELAN

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
```
Authorization: Bearer <JWT_TOKEN>
```

## Products API

### List Products
```
GET /products?page=1&limit=20&status=active&featured=true&min_price=100&max_price=1000&brand=Nike&sort_by=created_at&sort_order=desc
```

### Get Product Details
```
GET /products/:id
```

### Create Product (Admin)
```
POST /products
Content-Type: application/json

{
  "category_id": "uuid",
  "name": "Product Name",
  "sku": "SKU-123",
  "description": "Description",
  "regular_price": 99.99,
  "sale_price": 79.99,
  "featured": true,
  "status": "active"
}
```

### Update Product (Admin)
```
PUT /products/:id
```

### Delete Product (Admin)
```
DELETE /products/:id
```

### Product Images
```
GET /products/:id/images
POST /products/:id/images
PUT /products/:id/images/:imageId
DELETE /products/:id/images/:imageId
PUT /products/:id/images/:imageId/primary
```

### Product Variants
```
GET /products/:id/variants
POST /products/:id/variants
PUT /products/:id/variants/:variantId
DELETE /products/:id/variants/:variantId
GET /products/:id/variants/:variantId/stock
PUT /products/:id/variants/:variantId/stock
```

## Categories API

### List Categories
```
GET /categories?page=1&limit=50&hierarchy=false&active_only=true

# Hierarchical view
GET /categories?hierarchy=true
```

### Get Category
```
GET /categories/:id
GET /categories/:id?include_children=true&include_products=true
```

### Create Category (Admin)
```
POST /categories
{
  "name": "Electronics",
  "parent_id": "uuid", // optional
  "description": "Electronic products",
  "is_active": true
}
```

### Update Category (Admin)
```
PUT /categories/:id
```

### Delete Category (Admin)
```
DELETE /categories/:id?force=true
```

### Category Products
```
GET /categories/:id/products?page=1&limit=20
```

## Orders API

### List Orders
```
GET /orders?page=1&limit=20&status=pending_payment&payment_status=unpaid&sort_by=created_at&sort_order=desc

# Date range
GET /orders?start_date=2024-01-01&end_date=2024-12-31&min_amount=100&max_amount=1000
```

### Get Order
```
GET /orders/:id
```

### Create Order
```
POST /orders
{
  "items": [
    {
      "product_variant_id": "uuid",
      "quantity": 2
    }
  ],
  "shipping_address": {
    "full_name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Accra",
    "postal_code": "00233",
    "shipping_fee": 10.00
  },
  "billing_address": {}, // optional, defaults to shipping
  "coupon_code": "SAVE10", // optional
  "notes": "Handle with care"
}
```

### Update Order
```
PUT /orders/:id
{
  "status": "processing",
  "payment_status": "paid",
  "notes": "Processing order",
  "estimated_delivery_date": "2024-01-15"
}
```

### Order Items
```
GET /orders/:id/items
```

### Delivery Tracking
```
GET /orders/:id/tracking
POST /orders/:id/tracking/update (Admin)
{
  "status": "shipped",
  "note": "Package dispatched"
}
```

### Order Statistics
```
GET /orders/stats/user
```

## Shopping Cart API

### Get Cart
```
GET /cart
Header: x-session-id: guest-session-123 (for guests)
Header: Authorization: Bearer <token> (for authenticated users)
```

### Add to Cart
```
POST /cart/items
{
  "product_variant_id": "uuid",
  "quantity": 2
}
```

### Update Cart Item
```
PUT /cart/items/:itemId
{
  "quantity": 5
}
```

### Remove Item
```
DELETE /cart/items/:itemId
```

### Clear Cart
```
DELETE /cart
```

## Wishlist API

### Get Wishlist
```
GET /wishlist?page=1&limit=20&sort_by=created_at&sort_order=desc
Header: Authorization: Bearer <token>
```

### Add to Wishlist
```
POST /wishlist/:productId
Header: Authorization: Bearer <token>
```

### Remove from Wishlist
```
DELETE /wishlist/:productId
Header: Authorization: Bearer <token>
```

### Check if in Wishlist
```
GET /wishlist/check/:productId
Header: Authorization: Bearer <token>
```

### Wishlist Statistics
```
GET /wishlist/stats
Header: Authorization: Bearer <token>
```

## Common Query Parameters

### Pagination
```
page=1          # Page number (default: 1)
limit=20        # Items per page (default: 20, max: 100)
```

### Sorting
```
sort_by=created_at    # Field to sort by
sort_order=desc       # asc or desc (default: desc)
```

### Filtering
```
status=active
featured=true
in_stock=true
min_price=100
max_price=1000
search=laptop
tags=electronics,new
```

## Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "price": 99.99
  },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Server Error |
| 503 | Service Unavailable |

## Common Errors

### Missing Authentication
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

### Insufficient Stock
```json
{
  "success": false,
  "error": "Insufficient stock",
  "message": "Only 5 units available"
}
```

### Duplicate Violation
```json
{
  "success": false,
  "error": "Resource conflict",
  "message": "A resource with this data already exists"
}
```

### Invalid UUID
```json
{
  "success": false,
  "error": "Invalid ID",
  "message": "ID must be a valid UUID"
}
```

## Rate Limiting Headers

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

## Useful Filter Combinations

### Featured Products
```
GET /products?featured=true&status=active
```

### Sale Items
```
GET /products?status=active&sort_by=sale_price&sort_order=asc
```

### Budget Shopping
```
GET /products?min_price=0&max_price=100&sort_by=regular_price
```

### Recent Orders
```
GET /orders?sort_by=created_at&sort_order=desc&limit=10
```

### Category with Products
```
GET /categories/:id?include_products=true
```

## Testing with cURL

### Create Product
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "uuid",
    "name": "Test Product",
    "sku": "TEST-001",
    "regular_price": 99.99
  }'
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_variant_id": "uuid",
    "quantity": 1
  }'
```

### Get Orders
```bash
curl http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Postman Collection

Import this collection into Postman to test all endpoints:
```
[See full Postman collection in separate file]
```

## WebSocket Support (Coming Soon)

- Real-time order status updates
- Live stock availability
- Cart synchronization across devices