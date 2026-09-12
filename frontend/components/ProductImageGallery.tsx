"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn } from "lucide-react";

export interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string;
  position?: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  onImageClick?: (image: ProductImage) => void;
}

export default function ProductImageGallery({
  images,
  productName,
  onImageClick,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center aspect-square">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No image available</p>
        </div>
      </div>
    );
  }

  const mainImage = images[selectedImageIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(mainImage);
    }
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square group">
        <img
          src={mainImage.url}
          alt={mainImage.alt_text || productName}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={handleImageClick}
        />

        {/* Zoom Button */}
        <button
          onClick={handleImageClick}
          className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title={isZoomed ? "Zoom out" : "Zoom in"}
        >
          <ZoomIn className="w-5 h-5 text-gray-800" />
        </button>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 text-white rounded-full text-sm font-medium">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {hasMultipleImages && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                index === selectedImageIndex
                  ? "ring-2 ring-orange-500"
                  : "ring-1 ring-gray-200 hover:ring-gray-300"
              }`}
              title={image.alt_text || `Image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.alt_text || `${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      {mainImage.alt_text && (
        <p className="text-sm text-gray-600 px-1">{mainImage.alt_text}</p>
      )}
    </div>
  );
}
