"use client";

import React, { useState } from "react";
import { X, Star, Upload, Loader2, Package } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

// Keep this consistent with the rest of the customer order flow.  The local
// environment defines NEXT_PUBLIC_BACKEND_URL; NEXT_PUBLIC_API_URL is retained
// for deployments that still use that older variable name.
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  products: Array<{
    id: string; // order_item_id
    product_variant_id: string;
    product_id?: string;
    product_name?: string;
    image_url?: string;
    product_snapshot?: {
      product_id?: string;
      product_name?: string;
      image_url?: string;
    };
  }>;
  onSuccess?: () => void;
}

interface ProductReview {
  product_id: string;
  product_variant_id: string;
  order_item_id: string; // Add order_item_id
  rating: number;
  title: string;
  comment: string;
  images: string[];
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  products,
  onSuccess,
}: ReviewModalProps) {
  const supabase = createClientComponentSupabaseClient();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [reviews, setReviews] = useState<Map<string, ProductReview>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current product being reviewed
  const currentProduct = products[currentProductIndex];
  const currentReview = reviews.get(currentProduct?.id) || {
    product_id: currentProduct?.product_snapshot?.product_id || currentProduct?.product_id || "",
    product_variant_id: currentProduct?.product_variant_id || "",
    order_item_id: currentProduct?.id || "", // Store order_item_id
    rating: 0,
    title: "",
    comment: "",
    images: [],
  };

  const [rating, setRating] = useState(currentReview.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(currentReview.title);
  const [comment, setComment] = useState(currentReview.comment);
  const [images, setImages] = useState<string[]>(currentReview.images);

  if (!isOpen) return null;

  const handleNext = () => {
    // Save current review
    const review: ProductReview = {
      product_id: currentProduct.product_snapshot?.product_id || currentProduct.product_id || "",
      product_variant_id: currentProduct.product_variant_id,
      order_item_id: currentProduct.id, // Store order_item_id
      rating,
      title,
      comment,
      images,
    };
    
    const newReviews = new Map(reviews);
    newReviews.set(currentProduct.id, review);
    setReviews(newReviews);

    // Move to next product
    if (currentProductIndex < products.length - 1) {
      const nextIndex = currentProductIndex + 1;
      setCurrentProductIndex(nextIndex);
      
      // Load next product's review if exists
      const nextProduct = products[nextIndex];
      const nextReview = newReviews.get(nextProduct.id);
      if (nextReview) {
        setRating(nextReview.rating);
        setTitle(nextReview.title);
        setComment(nextReview.comment);
        setImages(nextReview.images);
      } else {
        setRating(0);
        setTitle("");
        setComment("");
        setImages([]);
      }
    }
  };

  const handlePrevious = () => {
    // Save current review
    const review: ProductReview = {
      product_id: currentProduct.product_snapshot?.product_id || currentProduct.product_id || "",
      product_variant_id: currentProduct.product_variant_id,
      order_item_id: currentProduct.id, // Store order_item_id
      rating,
      title,
      comment,
      images,
    };
    
    const newReviews = new Map(reviews);
    newReviews.set(currentProduct.id, review);
    setReviews(newReviews);

    // Move to previous product
    if (currentProductIndex > 0) {
      const prevIndex = currentProductIndex - 1;
      setCurrentProductIndex(prevIndex);
      
      // Load previous product's review
      const prevProduct = products[prevIndex];
      const prevReview = newReviews.get(prevProduct.id) || {
        product_id: prevProduct.product_snapshot?.product_id || prevProduct.product_id || "",
        product_variant_id: prevProduct.product_variant_id,
        order_item_id: prevProduct.id, // Store order_item_id
        rating: 0,
        title: "",
        comment: "",
        images: [],
      };
      
      setRating(prevReview.rating);
      setTitle(prevReview.title);
      setComment(prevReview.comment);
      setImages(prevReview.images);
    }
  };

  const handleSkipProduct = () => {
    if (currentProductIndex < products.length - 1) {
      handleNext();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!currentProduct) {
        setError("No product is available to review.");
        return;
      }

      // Save current product review
      const review: ProductReview = {
        product_id: currentProduct.product_snapshot?.product_id || currentProduct.product_id || "",
        product_variant_id: currentProduct.product_variant_id,
        order_item_id: currentProduct.id, // Store order_item_id
        rating,
        title,
        comment,
        images,
      };
      
      const finalReviews = new Map(reviews);
      if (rating > 0) {
        finalReviews.set(currentProduct.id, review);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You must be logged in to submit reviews");
        return;
      }

      // Submit all reviews with ratings
      const reviewsToSubmit = Array.from(finalReviews.values()).filter(r => r.rating > 0);
      
      if (reviewsToSubmit.length === 0) {
        setError("Please rate at least one product");
        return;
      }

      const promises = reviewsToSubmit.map((reviewData) => {
        if (!reviewData.product_id) {
          throw new Error("This order item is missing its product information.");
        }

        const payload = {
          product_id: reviewData.product_id,
          order_id: orderId,
          order_item_id: reviewData.order_item_id,
          rating: reviewData.rating,
          title: reviewData.title.trim() || null,
          comment: reviewData.comment.trim() || null,
          images: reviewData.images.length > 0 ? reviewData.images : null,
        };
        
        console.log('Submitting review:', payload);
        
        return fetch(`${apiUrl}/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      });

      const results = await Promise.all(promises);
      
      // Log any errors for debugging
      const errors = await Promise.all(
        results.map(async (r, index) => {
          if (!r.ok) {
            let errorData: { message?: string; error?: string; status?: number; statusText?: string };
            try {
              errorData = await r.json();
            } catch (e) {
              errorData = { 
                message: `HTTP ${r.status}: ${r.statusText}`,
                status: r.status,
                statusText: r.statusText
              };
            }
            errorData.message ??= errorData.error ?? `Review submission failed (HTTP ${r.status}).`;
            // A rejected request is handled below and shown in the modal. Use
            // warn so Next's development error overlay is reserved for actual
            // unhandled client errors.
            console.warn(`Review submission failed for product ${index}: ${errorData.message}`);
            return errorData;
          }
          return null;
        })
      );

      const successCount = results.filter((r) => r.ok).length;

      if (successCount > 0) {
        setSuccessMessage(
          `Thank you! ${successCount} review${successCount > 1 ? 's' : ''} submitted successfully.`
        );
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 2000);
      } else {
        const firstError = errors.find(e => e);
        setError(firstError?.message || 'Failed to submit reviews. Please try again.');
      }
    } catch (err) {
      console.error("Error submitting reviews:", err);
      setError("Failed to submit reviews. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("You can upload up to 5 images only");
      return;
    }

    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setImages([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const productName = currentProduct?.product_snapshot?.product_name || currentProduct?.product_name || "Product";
  const productImage = currentProduct?.product_snapshot?.image_url || currentProduct?.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rate Your Products</h2>
            <p className="text-sm text-slate-600">Order #{orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            disabled={submitting}
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            {successMessage}
          </div>
        )}

        {/* Content */}
        {!successMessage && (
          <div className="p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Product {currentProductIndex + 1} of {products.length}</span>
                <span>{Math.round(((currentProductIndex + 1) / products.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentProductIndex + 1) / products.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
              <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                {productImage ? (
                  <img src={productImage} alt={productName} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-16 w-16 text-slate-400 p-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{productName}</h3>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                How would you rate this product? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-base text-slate-600 self-center font-medium">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label htmlFor="review-title" className="block text-sm font-semibold text-slate-900 mb-2">
                Review Title (Optional)
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-900 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think about this product..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Images */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Add Photos (Optional)
              </label>
              
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!successMessage && (
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
            {currentProductIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={submitting}
                className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={handleSkipProduct}
              disabled={submitting}
              className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Skip
            </button>

            {currentProductIndex < products.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting || rating === 0}
                className="flex-1 px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Product
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reviews"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
