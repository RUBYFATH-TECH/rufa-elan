'use client';

import React, { useState } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase-client';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  orderItemId?: string;
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  orderItemId,
  productName,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const supabase = createClientComponentSupabaseClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in before uploading review photos.');
      }

      const uploadedUrls: string[] = [];

      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload to your backend
        const response = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success && data.data?.url) {
          uploadedUrls.push(data.data.url);
        }
      }

      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in before submitting a review.');
      }

      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
          order_item_id: orderItemId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          images: images.length > 0 ? images : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setRating(0);
        setTitle('');
        setComment('');
        setImages([]);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        alert('Review submitted successfully! Thank you for your feedback.');
      } else {
        setError(data.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-4xl transition-all transform hover:scale-110"
          >
            <span className={
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }>
              ★
            </span>
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = () => {
    const labels = {
      0: 'Select a rating',
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating as keyof typeof labels];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {productName && (
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg">Reviewing: {productName}</h3>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        {renderStars()}
        <p className="text-sm text-gray-600 mt-2">{getRatingLabel()}</p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Review Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience in a few words"
          maxLength={100}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">{title.length}/100</p>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you think about this product..."
          rows={5}
          maxLength={1000}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">{comment.length}/1000</p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Photos (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Add up to 5 photos to help others see what you experienced
        </p>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <div>
            <input
              type="file"
              id="review-images"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="review-images"
              className={`inline-block px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>📷</span>
                  Add Photos ({5 - images.length} remaining)
                </span>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={rating === 0 || submitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree that your review may be published and shared publicly
      </p>
    </form>
  );
}
