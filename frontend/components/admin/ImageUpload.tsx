"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, CheckCircle, Image as ImageIcon, Loader2 } from "lucide-react";

export interface UploadedImage {
  id?: string;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
  position?: number;
  file?: File;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file format. Accepted: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    return null;
  };

  const processFiles = useCallback(
    (files: FileList) => {
      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      const newImages: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (images.length + newImages.length >= maxImages) {
          break;
        }

        const error = validateFile(file);
        const reader = new FileReader();

        reader.onload = (e) => {
          const newImage: UploadedImage = {
            file,
            url: "",
            alt_text: "",
            is_primary: images.length === 0 && newImages.length === 0,
            preview: e.target?.result as string,
            uploading: false,
            error: error || undefined,
          };

          setUploading(false);
          onImagesChange([...images, ...newImages.filter(img => img !== newImage), newImage]);
        };

        reader.readAsDataURL(file);
      }
    },
    [images, maxImages, onImagesChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    
    // If removed image was primary, set first remaining as primary
    if (images[index].is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    onImagesChange(updated);
  };

  const setPrimaryImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onImagesChange(updated);
  };

  const updateAltText = (index: number, altText: string) => {
    const updated = [...images];
    updated[index].alt_text = altText;
    onImagesChange(updated);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updated = [...images];
    const [movedImage] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedImage);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? "border-orange-500 bg-orange-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-semibold text-slate-900 mb-2">
            Drop images here or click to upload
          </p>
          <p className="text-sm text-slate-600 mb-4">
            PNG, JPG, WebP or GIF • Up to {maxFileSize}MB each
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Select Images
              </>
            )}
          </button>
          <p className="text-xs text-slate-600 mt-2">
            {images.length} / {maxImages} images uploaded
          </p>
        </div>
      </div>

      {/* Images List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Uploaded Images ({images.length})
          </h3>

          <div className="space-y-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
              >
                {/* Image Preview */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
                    {image.preview || image.url ? (
                      <img
                        src={image.preview || image.url}
                        alt={image.alt_text || `Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      Primary
                    </div>
                  )}

                  {/* Status Icon */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Image Details */}
                <div className="flex-1 min-w-0">
                  {image.error ? (
                    <div className="flex items-start gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Upload Error</p>
                        <p className="text-xs">{image.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Alt Text Input */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={image.alt_text || ""}
                          onChange={(e) => updateAltText(index, e.target.value)}
                          placeholder="Describe this image for accessibility"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="text-xs px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            Set as Primary
                          </button>
                        )}

                        {images.length > 1 && index > 0 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index - 1)}
                            className="text-xs px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            ↑ Move Up
                          </button>
                        )}

                        {images.length > 1 && index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index + 1)}
                            className="text-xs px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            ↓ Move Down
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors ml-auto"
                        >
                          <X className="h-3 w-3 inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
