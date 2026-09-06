"use client";

import { useState } from "react";
import { Filter, ChevronDown, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  totalItems?: number;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" }
];

export default function FilterBar({ 
  totalItems = 0, 
  viewMode = "grid", 
  onViewModeChange,
  className 
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className={cn("bg-white border-b border-slate-200 py-3", className)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Total Count */}
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{totalItems.toLocaleString()}</span> results
          </div>

          {/* Right Side - Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>{sortOptions.find(opt => opt.value === selectedSort)?.label}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedSort(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-slate-50",
                        selectedSort === option.value ? "bg-rufaelan-primary/10 text-rufaelan-primary font-medium" : "text-slate-700"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex rounded-md border border-slate-300 bg-white">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "px-2 py-1.5 rounded-l-md",
                    viewMode === "grid" 
                      ? "bg-rufaelan-primary text-white" 
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "px-2 py-1.5 rounded-r-md border-l border-slate-300",
                    viewMode === "list" 
                      ? "bg-rufaelan-primary text-white" 
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Price Range */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-900">Price Range</h4>
                <div className="space-y-2">
                  {["Under $10", "$10 - $25", "$25 - $50", "$50 - $100", "Over $100"].map((range) => (
                    <label key={range} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-slate-300 text-rufaelan-primary focus:ring-rufaelan-primary" />
                      <span className="text-slate-700">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-900">Customer Rating</h4>
                <div className="space-y-2">
                  {["4 stars & up", "3 stars & up", "2 stars & up", "1 star & up"].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-slate-300 text-rufaelan-primary focus:ring-rufaelan-primary" />
                      <span className="text-slate-700">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-900">Shipping</h4>
                <div className="space-y-2">
                  {["Free shipping", "Fast delivery", "Same day", "Pickup available"].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-slate-300 text-rufaelan-primary focus:ring-rufaelan-primary" />
                      <span className="text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-900">Brand</h4>
                <div className="space-y-2">
                  {["RUFA ELAN", "Generic", "Premium", "Designer"].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-slate-300 text-rufaelan-primary focus:ring-rufaelan-primary" />
                      <span className="text-slate-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setShowFilters(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="rounded-md bg-rufaelan-primary px-4 py-2 text-sm font-medium text-white hover:bg-rufaelan-primary-dark">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}