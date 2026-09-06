export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  rating: number;
  image: string;
  slug: string;
  badge?: string;
};

// Temu-style product type
export type TemuProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  image: string;
  slug: string;
  badge?: string;
  freeShipping: boolean;
};

export const featuredProducts: Product[] = [
  {
    id: "bag-alaia-01",
    name: "Alaia Leather Tote",
    category: "Tote Bags",
    price: 320,
    salePrice: 280,
    rating: 4.9,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    slug: "alaia-leather-tote",
    badge: "Best seller"
  },
  {
    id: "bag-mila-02",
    name: "Mila Crossbody",
    category: "Crossbody Bags",
    price: 220,
    salePrice: 199,
    rating: 4.8,
    image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
    slug: "mila-crossbody",
    badge: "New"
  },
  {
    id: "bag-selene-03",
    name: "Selene Shoulder Bag",
    category: "Shoulder Bags",
    price: 270,
    salePrice: 250,
    rating: 4.7,
    image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg",
    slug: "selene-shoulder-bag",
    badge: "Limited"
  },
  {
    id: "bag-noelle-04",
    name: "Noelle Classic Purse",
    category: "Purses",
    price: 150,
    salePrice: 130,
    rating: 4.6,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg",
    slug: "noelle-classic-purse",
    badge: "Trending"
  }
];

// Temu-style products with all the additional properties
export const temuProducts: TemuProduct[] = [
  {
    id: "makeup-organizer-01",
    name: "360° Rotating Makeup Organizer Storage Box with Multiple compartments",
    category: "Beauty & Personal Care",
    price: 145.61,
    originalPrice: 274.03,
    rating: 4.7,
    reviewCount: 90193,
    soldCount: 65,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    slug: "360-rotating-makeup-organizer",
    badge: "Best-Selling",
    freeShipping: true
  },
  {
    id: "soft-slippers-02",
    name: "Soft And Cozy Plush Indoor Slippers for Women, Non-slip and Comfortable House Shoes",
    category: "Women's Shoes",
    price: 62.36,
    originalPrice: 114.30,
    rating: 4.7,
    reviewCount: 15258,
    soldCount: 100,
    image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
    slug: "soft-cozy-plush-slippers",
    badge: "Top Rated",
    freeShipping: true
  },
  {
    id: "square-bag-03",
    name: "Unisex Square Bag, Men's and Women's Waist & Chest bags",
    category: "Fashion Bags",
    price: 47.76,
    originalPrice: 86.49,
    rating: 4.7,
    reviewCount: 2312,
    soldCount: 30,
    image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg",
    slug: "unisex-square-bag",
    badge: "Star seller",
    freeShipping: true
  },
  {
    id: "jewelry-set-04",
    name: "Random 6pcs Set, Heart and Butterfly Layer Necklace and Earrings Jewelry Set",
    category: "Women's Jewelry",
    price: 25.30,
    originalPrice: 46.91,
    rating: 4.8,
    reviewCount: 921,
    soldCount: 10,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg",
    slug: "heart-butterfly-jewelry-set",
    badge: "Best-Selling Item",
    freeShipping: true
  },
  {
    id: "colorful-rug-05",
    name: "A Super Soft Tie-Dye Colorful Pink Blue Abstract Pattern Round Carpet",
    category: "Home & Garden",
    price: 67.42,
    originalPrice: 129.84,
    rating: 4.5,
    reviewCount: 1368,
    soldCount: 20,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    slug: "tie-dye-colorful-round-carpet",
    badge: "Star seller",
    freeShipping: true
  },
  {
    id: "led-lights-06",
    name: "LED Strip Lights with Remote Control, Color Changing RGB Lighting for Bedroom",
    category: "Electronics",
    price: 89.99,
    originalPrice: 159.99,
    rating: 4.6,
    reviewCount: 5432,
    soldCount: 45,
    image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
    slug: "led-strip-lights-rgb",
    badge: "Lightning Deal",
    freeShipping: true
  },
  {
    id: "wireless-earbuds-07",
    name: "Wireless Bluetooth Earbuds with Charging Case, Noise Cancelling Headphones",
    category: "Electronics",
    price: 129.99,
    originalPrice: 249.99,
    rating: 4.4,
    reviewCount: 8765,
    soldCount: 88,
    image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg",
    slug: "wireless-bluetooth-earbuds",
    badge: "Best Choice",
    freeShipping: true
  },
  {
    id: "phone-case-08",
    name: "Shockproof Clear Phone Case with Camera Protection for iPhone 14 Pro Max",
    category: "Phone Accessories",
    price: 19.99,
    originalPrice: 39.99,
    rating: 4.3,
    reviewCount: 3421,
    soldCount: 156,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg",
    slug: "shockproof-clear-phone-case",
    badge: "Top Seller",
    freeShipping: true
  }
];
