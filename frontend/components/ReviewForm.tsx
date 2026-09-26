"use client";

import React, { useState } from "react";
import { Star, Upload, X, Loader2 } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  orderItemId?: string;
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ productId, orderId, orderItemId, productName, onSuccess, onCancel }: ReviewFormProps) {
  const supabase = createClientComponentSupabaseClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You must be logged in to submit a review");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
          images: images.length > 0 ? images : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setRating(0);
        setTitle("");
        setComment("");
        setImages([]);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images
    if (images.length + files.length > 5) {
      setError("You can upload up to 5 images only");
      return;
    }

    // In a real implementation, you would upload to a service like Cloudinary
    // For now, we'll create data URLs (not recommended for production)
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

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Write Your Review</h3>

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Your Rating <span className="text-red-500">*</span>
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
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-slate-600 self-center">
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
      <div>
        <label htmlFor="review-title" className="block text-sm font-semibold text-slate-900 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience in one sentence"
          maxLength={100}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <p className="text-xs text-slate-500 mt-1">{title.length}/100 characters</p>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-900 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you think about this product..."
          rows={5}
          maxLength={1000}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">{comment.length}/1000 characters</p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Add Photos (Optional)
        </label>
        <p className="text-xs text-slate-600 mb-3">Help others by sharing photos of your product</p>
        
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
            <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
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
        <p className="text-xs text-slate-500 mt-2">
          You can upload up to 5 images (max 5MB each)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
