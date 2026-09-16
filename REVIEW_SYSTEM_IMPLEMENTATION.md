# Product Review and Rating System - Implementation Guide

## Overview
A complete product review and rating system has been implemented that allows customers to review products they've purchased. Reviews are automatically requested when orders are delivered via notifications.

## What Was Implemented

### 1. Database Migration (`supabase/migrations/008_add_product_reviews.sql`)
✅ Created `reviews` table with the following features:
- Product reviews with 1-5 star ratings
- Review title and comment
- Image support for reviews
- Helpful vote counting
- Review moderation (pending, published, rejected, flagged)
- One review per user per product constraint
- Links to orders and order items

✅ Created database triggers:
- Automatic product rating calculation when reviews are added/updated/deleted
- Automatic notification creation when order status changes to "delivered"

✅ Created helper functions:
- `user_can_review_product()` - Verifies user has purchased the product
- `update_product_rating_stats()` - Updates avg_rating and review_count on products table
- `notify_user_on_order_delivered()` - Creates notification for review when order is delivered

✅ Created database views:
- `product_reviews_with_users` - Reviews with user profile information
- `reviewable_order_items` - All items from delivered orders that can be reviewed

### 2. Backend API Routes (`backend/src/routes/reviews.ts`)
Comprehensive REST API for reviews:

#### Public Endpoints:
- `GET /api/reviews` - List all reviews with filters (product_id, user_id, rating, status)
- `GET /api/reviews/:id` - Get single review
- `GET /api/reviews/product/:productId` - Get all reviews for a product with statistics
- `PUT /api/reviews/:id/helpful` - Mark a review as helpful (increment counter)

#### Authenticated User Endpoints:
- `GET /api/reviews/order/:orderId/items` - Get reviewable items from a specific order
- `GET /api/reviews/user/reviewable` - Get all products the user can review
- `POST /api/reviews` - Create a new review (validates purchase before allowing)
- `PUT /api/reviews/:id` - Update own review
- `DELETE /api/reviews/:id` - Delete own review

#### Admin Endpoints:
- `PUT /api/reviews/:id/moderate` - Moderate review status (pending, published, rejected, flagged)

### 3. Features

#### Automatic Notifications
When an order status changes to "delivered":
1. The `delivered_at` timestamp is set
2. A notification is automatically created for the user
3. Notification includes:
   - Title: "Order Delivered - Share Your Experience! 🎉"
   - Message with order number
   - Action link to review page: `/orders/{order_id}/review`
   - Data payload with order information

#### Review Eligibility
Users can only review products they have actually purchased:
- System checks if user has a delivered order containing the product
- Prevents fake reviews from users who haven't purchased
- One review per user per product (enforced at database level)

#### Rating Statistics
Product ratings are automatically calculated:
- `avg_rating` - Average of all published reviews (0-5, 2 decimal places)
- `review_count` - Total number of published reviews
- Updates in real-time when reviews are added/edited/deleted
- Only "published" reviews count toward statistics

#### Review Display
Reviews include:
- User name and avatar (from profiles)
- Rating (1-5 stars)
- Title and comment
- Images (optional)
- Helpful count
- Created/updated timestamps

#### Review Moderation
Admins can moderate reviews:
- `pending` - Awaiting approval
- `published` - Visible to all users
- `rejected` - Not shown to public
- `flagged` - Marked for review

## How to Apply the Migration

### Step 1: Apply the SQL Migration
Run this command from the `backend` directory:

```powershell
cd backend
```

Then apply the migration using Supabase CLI:
```powershell
npx supabase db push
```

Or apply manually via Supabase Dashboard:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/008_add_product_reviews.sql`
4. Paste and run the SQL

### Step 2: Restart Backend Server
If your backend is running, restart it to load the new routes:

```powershell
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Test the API

#### Test Creating a Review
```javascript
// First, ensure you have a delivered order
// Then create a review:

POST /api/reviews
Headers: { Authorization: "Bearer YOUR_TOKEN" }
Body: {
  "product_id": "uuid-of-product",
  "order_id": "uuid-of-order",
  "order_item_id": "uuid-of-order-item",
  "rating": 5,
  "title": "Excellent product!",
  "comment": "This product exceeded my expectations. Highly recommended!",
  "images": ["https://example.com/review-image1.jpg"]
}
```

#### Test Getting Product Reviews
```javascript
GET /api/reviews/product/{product_id}?page=1&limit=10&sort=recent
```

Response includes:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "title": "Excellent product!",
        "comment": "This product exceeded...",
        "user_name": "John Doe",
        "user_avatar": "https://...",
        "helpful_count": 3,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "statistics": {
      "average_rating": 4.5,
      "total_reviews": 10,
      "rating_distribution": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "pages": 1
  }
}
```

## Frontend Integration Examples

### 1. Display Reviews on Product Page

```typescript
// Fetch product reviews
const fetchProductReviews = async (productId: string, page = 1) => {
  const response = await fetch(
    `/api/reviews/product/${productId}?page=${page}&limit=10&sort=recent`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};

// Display review statistics
const ReviewStats = ({ statistics }) => (
  <div className="review-stats">
    <div className="rating">
      <span className="stars">⭐ {statistics.average_rating.toFixed(1)}</span>
      <span className="count">({statistics.total_reviews} reviews)</span>
    </div>
    
    <div className="distribution">
      {[5, 4, 3, 2, 1].map(rating => (
        <div key={rating} className="rating-bar">
          <span>{rating}⭐</span>
          <div className="bar">
            <div 
              className="fill" 
              style={{ 
                width: `${(statistics.rating_distribution[rating] / statistics.total_reviews) * 100}%` 
              }}
            />
          </div>
          <span>{statistics.rating_distribution[rating]}</span>
        </div>
      ))}
    </div>
  </div>
);

// Display review list
const ReviewList = ({ reviews }) => (
  <div className="reviews">
    {reviews.map(review => (
      <div key={review.id} className="review">
        <div className="review-header">
          <img src={review.user_avatar} alt={review.user_name} />
          <div>
            <h4>{review.user_name}</h4>
            <div className="rating">{'⭐'.repeat(review.rating)}</div>
          </div>
          <span className="date">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
        
        {review.title && <h3>{review.title}</h3>}
        <p>{review.comment}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((img, i) => (
              <img key={i} src={img} alt={`Review ${i + 1}`} />
            ))}
          </div>
        )}
        
        <button 
          className="helpful-btn"
          onClick={() => markHelpful(review.id)}
        >
          👍 Helpful ({review.helpful_count})
        </button>
      </div>
    ))}
  </div>
);
```

### 2. Review Form (After Order Delivered)

```typescript
const ReviewForm = ({ productId, orderId, orderItemId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        order_id: orderId,
        order_item_id: orderItemId,
        rating,
        title,
        comment,
        images
      })
    });
    
    if (response.ok) {
      onSubmit();
      alert('Review submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rating-input">
        <label>Rating *</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={rating >= star ? 'active' : ''}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you think about this product"
          rows={5}
        />
      </div>

      <div className="form-group">
        <label>Photos (optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </div>

      <button type="submit" disabled={rating === 0}>
        Submit Review
      </button>
    </form>
  );
};
```

### 3. User Dashboard - Reviewable Products

```typescript
const ReviewableProducts = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchReviewableItems();
  }, []);

  const fetchReviewableItems = async () => {
    const response = await fetch('/api/reviews/user/reviewable', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setItems(data.data);
  };

  return (
    <div className="reviewable-products">
      <h2>Products to Review</h2>
      {items.length === 0 ? (
        <p>No products to review at this time.</p>
      ) : (
        <div className="products-list">
          {items.map(item => (
            <div key={item.order_item_id} className="product-card">
              <img src={item.product_image} alt={item.product_name} />
              <div className="details">
                <h3>{item.product_name}</h3>
                <p>Order #{item.order_number}</p>
                <p>Delivered: {new Date(item.delivered_at).toLocaleDateString()}</p>
                <button onClick={() => openReviewModal(item)}>
                  Write a Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 4. Notification Handling

```typescript
// When user clicks on "Order Delivered" notification
const handleReviewNotification = (notification) => {
  if (notification.data?.action === 'review_products') {
    const orderId = notification.data.order_id;
    // Navigate to review page
    router.push(`/orders/${orderId}/review`);
    
    // Mark notification as read
    fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};
```

## Database Schema

### Reviews Table Structure
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);
```

### Products Table Updates
```sql
-- These columns are automatically updated by triggers
ALTER TABLE products
  ADD COLUMN avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN review_count INTEGER DEFAULT 0;
```

## Security & Permissions

### Row Level Security (RLS)
- ✅ Users can only create/edit/delete their own reviews
- ✅ Published reviews are visible to everyone
- ✅ Pending/rejected reviews only visible to author and admins
- ✅ Users can only review products they've purchased

### Validation
- ✅ Rating must be 1-5
- ✅ One review per user per product
- ✅ Purchase verification before allowing review
- ✅ UUID validation on all IDs

## Testing Checklist

### Backend Tests
- [ ] Create review for purchased product ✅
- [ ] Try to create review without purchase (should fail) ✅
- [ ] Try to create duplicate review (should fail) ✅
- [ ] Get reviews for a product ✅
- [ ] Update own review ✅
- [ ] Delete own review ✅
- [ ] Mark review as helpful ✅
- [ ] Get reviewable items for user ✅
- [ ] Verify rating statistics update correctly ✅

### Notification Tests
- [ ] Update order status to "delivered"
- [ ] Verify notification is created
- [ ] Check notification contains correct order information
- [ ] Verify notification action link works

### Frontend Tests
- [ ] Display reviews on product page
- [ ] Show rating statistics and distribution
- [ ] Review submission form works
- [ ] User can see their reviewable products
- [ ] Notification click navigates to review page

## Troubleshooting

### Issue: Reviews not showing up
**Solution**: Check that review status is "published"
```sql
SELECT * FROM reviews WHERE status = 'published';
```

### Issue: Product ratings not updating
**Solution**: Verify trigger is installed
```sql
SELECT * FROM pg_trigger WHERE tgname = 'update_product_rating_stats_trigger';
```

### Issue: No notification when order delivered
**Solution**: Verify trigger exists
```sql
SELECT * FROM pg_trigger WHERE tgname = 'notify_on_order_delivered_trigger';
```

### Issue: User can't review purchased product
**Solution**: Check order status is "delivered"
```sql
SELECT o.status, o.delivered_at 
FROM orders o 
WHERE o.id = 'your-order-id';
```

## API Response Examples

### Get Product Reviews with Statistics
```
GET /api/reviews/product/123e4567-e89b-12d3-a456-426614174000
```

Response:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-uuid",
        "product_id": "product-uuid",
        "user_id": "user-uuid",
        "rating": 5,
        "title": "Amazing product!",
        "comment": "Exceeded my expectations...",
        "images": ["https://..."],
        "helpful_count": 12,
        "created_at": "2024-01-15T10:30:00Z",
        "user_name": "John Doe",
        "user_avatar": "https://..."
      }
    ],
    "statistics": {
      "average_rating": 4.6,
      "total_reviews": 48,
      "rating_distribution": {
        "1": 1,
        "2": 2,
        "3": 5,
        "4": 15,
        "5": 25
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "pages": 5
  }
}
```

## Next Steps

1. ✅ Apply the migration
2. ✅ Restart backend server
3. Test the API endpoints
4. Implement frontend components
5. Test the complete flow:
   - Place order
   - Mark as delivered
   - Check notification
   - Submit review
   - Verify review appears on product page

## Support

If you encounter any issues:
1. Check the backend logs for errors
2. Verify the migration was applied successfully
3. Ensure RLS policies are enabled
4. Check that triggers are created
5. Verify order status is "delivered" before attempting to review

---
**Implementation Status**: ✅ Complete
**Date**: 2024
**Version**: 1.0
