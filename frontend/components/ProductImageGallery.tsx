"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn, Check } from "lucide-react";

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
  selectedImagesForCart?: ProductImage[];
  onImagesSelectForCart?: (images: ProductImage[]) => void;
  showCartSelection?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  onImageClick,
  selectedImagesForCart = [],
  onImagesSelectForCart,
  showCartSelection = false,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Initialize with first image selected if not set
  useEffect(() => {
    if (showCartSelection && selectedImagesForCart.length === 0 && images.length > 0 && onImagesSelectForCart) {
      onImagesSelectForCart([images[0]]);
    }
  }, [showCartSelection, selectedImagesForCart.length, images, onImagesSelectForCart]);

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

  const handleThumbnailClick = (image: ProductImage, index: number) => {
    setSelectedImageIndex(index);
  };

  // Toggle image selection for cart
  const handleImageSelectForCart = (image: ProductImage) => {
    if (!showCartSelection || !onImagesSelectForCart) return;
    
    const isCurrentlySelected = isSelectedForCart(image);
    
    if (isCurrentlySelected) {
      // Remove from selection
      const newSelection = selectedImagesForCart.filter(img => img.url !== image.url);
      // Keep at least one selected
      if (newSelection.length > 0) {
        onImagesSelectForCart(newSelection);
      }
    } else {
      // Add to selection
      onImagesSelectForCart([...selectedImagesForCart, image]);
    }
  };

  // Check if an image is selected for cart
  const isSelectedForCart = (image: ProductImage) => {
    if (!showCartSelection || !selectedImagesForCart) return false;
    return selectedImagesForCart.some(img => img.url === image.url);
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
        <div className="space-y-2">
          {showCartSelection && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 font-medium">
                Select designs to order ({selectedImagesForCart.length} selected):
              </p>
              {selectedImagesForCart.length > 1 && (
                <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">
                  Multiple variants will be added
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {images.map((image, index) => {
              const isCurrentlyViewing = index === selectedImageIndex;
              const isForCart = isSelectedForCart(image);
              
              return (
                <div key={image.id || index} className="relative">
                  <button
                    onClick={() => handleThumbnailClick(image, index)}
                    className={`relative flex-shrink-0 w-full aspect-square rounded-lg overflow-hidden transition-all ${
                      isCurrentlyViewing
                        ? "ring-2 ring-blue-500 shadow-md"
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
                  
                  {/* Cart selection checkbox */}
                  {showCartSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageSelectForCart(image);
                      }}
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg z-10 ${
                        isForCart
                          ? "bg-orange-500 text-white ring-2 ring-orange-300"
                          : "bg-white text-gray-400 hover:bg-gray-100 ring-1 ring-gray-300"
                      }`}
                      title={isForCart ? "Remove from selection" : "Add to selection"}
                    >
                      {isForCart ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-current rounded-sm" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {showCartSelection && (
            <p className="text-xs text-gray-600 mt-2">
              Click the checkboxes to select multiple designs. Each selected design will be added to your cart.
            </p>
          )}
        </div>
      )}

      {/* Image Info */}
      {mainImage.alt_text && (
        <p className="text-sm text-gray-600 px-1">{mainImage.alt_text}</p>
      )}
    </div>
  );
}
