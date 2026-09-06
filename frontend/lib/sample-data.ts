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
