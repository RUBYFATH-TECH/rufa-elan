"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Filter, Grid3X3, List, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductSort = "recommended" | "price-low" | "price-high" | "rating" | "newest" | "bestselling";

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  minimumRating?: number;
  brands: string[];
}

interface FilterBarProps {
  totalItems?: number;
  brands?: string[];
  sort?: ProductSort;
  filters?: ProductFilters;
  viewMode?: "grid" | "list";
  onSortChange?: (sort: ProductSort) => void;
  onFiltersChange?: (filters: ProductFilters) => void;
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
];

const EMPTY_FILTERS: ProductFilters = { brands: [] };
const emptyFilters = (): ProductFilters => ({ brands: [] });

export default function FilterBar({
  totalItems = 0,
  brands = [],
  sort = "recommended",
  filters = EMPTY_FILTERS,
  viewMode = "grid",
  onSortChange,
  onFiltersChange,
  onViewModeChange,
  className,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(filters);

  useEffect(() => setDraftFilters(filters), [filters]);

  const updateDraft = (updates: Partial<ProductFilters>) => {
    setDraftFilters((current) => ({ ...current, ...updates }));
  };

  const toggleBrand = (brand: string) => {
    const selected = draftFilters.brands.includes(brand);
    updateDraft({ brands: selected ? draftFilters.brands.filter((item) => item !== brand) : [...draftFilters.brands, brand] });
  };

  const applyFilters = () => {
    onFiltersChange?.(draftFilters);
    setShowFilters(false);
  };

  return (
    <div className={cn("bg-white border-b border-slate-200 py-2 sm:py-3", className)}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm text-slate-600">
            <span className="font-medium text-slate-900">{totalItems.toLocaleString()}</span> <span className="hidden sm:inline">results</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown((visible) => !visible)}
                aria-expanded={showSortDropdown}
                className="flex items-center gap-1 sm:gap-2 rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="hidden sm:inline">{sortOptions.find((option) => option.value === sort)?.label}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 sm:w-48 rounded-md border border-slate-200 bg-white shadow-lg">
                  {sortOptions.map((option) => (
                    <button key={option.value} type="button" onClick={() => { onSortChange?.(option.value); setShowSortDropdown(false); }} className={cn("w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-slate-50", sort === option.value ? "bg-rufaelan-primary/10 text-rufaelan-primary font-medium" : "text-slate-700")}>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={() => setShowFilters((visible) => !visible)} aria-expanded={showFilters} className="flex items-center gap-1 sm:gap-2 rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Filters</span>
            </button>

            {onViewModeChange && (
              <div className="hidden sm:flex rounded-md border border-slate-300 bg-white">
                <button type="button" onClick={() => onViewModeChange("grid")} aria-label="Grid view" className={cn("px-2 py-1.5 rounded-l-md", viewMode === "grid" ? "bg-rufaelan-primary text-white" : "text-slate-700 hover:bg-slate-50")}><Grid3X3 className="h-4 w-4" /></button>
                <button type="button" onClick={() => onViewModeChange("list")} aria-label="List view" className={cn("px-2 py-1.5 rounded-r-md border-l border-slate-300", viewMode === "list" ? "bg-rufaelan-primary text-white" : "text-slate-700 hover:bg-slate-50")}><List className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 sm:mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs sm:text-sm font-medium text-slate-900">Price range (GHS)</label>
                <div className="flex gap-2">
                  <input type="number" min="0" value={draftFilters.minPrice ?? ""} onChange={(event) => updateDraft({ minPrice: event.target.value === "" ? undefined : Number(event.target.value) })} placeholder="Min" className="w-full rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" />
                  <input type="number" min="0" value={draftFilters.maxPrice ?? ""} onChange={(event) => updateDraft({ maxPrice: event.target.value === "" ? undefined : Number(event.target.value) })} placeholder="Max" className="w-full rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="minimum-rating" className="mb-2 block text-xs sm:text-sm font-medium text-slate-900">Customer rating</label>
                <select id="minimum-rating" value={draftFilters.minimumRating ?? ""} onChange={(event) => updateDraft({ minimumRating: event.target.value === "" ? undefined : Number(event.target.value) })} className="w-full rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700">
                  <option value="">Any rating</option><option value="4">4 stars & up</option><option value="3">3 stars & up</option><option value="2">2 stars & up</option><option value="1">1 star & up</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <h4 className="mb-2 text-xs sm:text-sm font-medium text-slate-900">Brand</h4>
                {brands.length ? <div className="max-h-28 space-y-2 overflow-y-auto pr-1">{brands.map((brand) => <label key={brand} className="flex items-center gap-2 text-xs sm:text-sm"><input type="checkbox" checked={draftFilters.brands.includes(brand)} onChange={() => toggleBrand(brand)} className="rounded border-slate-300 text-rufaelan-primary focus:ring-rufaelan-primary" /><span className="text-slate-700">{brand}</span></label>)}</div> : <p className="text-xs sm:text-sm text-slate-500">No brand information is available yet.</p>}
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-end gap-2">
              <button type="button" onClick={() => { const reset = emptyFilters(); setDraftFilters(reset); onFiltersChange?.(reset); }} className="flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"><RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" /> Clear</button>
              <button type="button" onClick={() => { setDraftFilters(filters); setShowFilters(false); }} className="rounded-md border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100">Cancel</button>
              <button type="button" onClick={applyFilters} className="rounded-md bg-rufaelan-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-rufaelan-primary-dark active:bg-orange-800">Apply filters</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
