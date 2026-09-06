import { z } from "zod";

export const orderTrackingSchema = z.object({
  orderNumber: z.string().min(6, "Enter a valid order number")
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  city: z.string().min(2),
  address: z.string().min(5),
  deliveryOption: z.enum(["standard", "express", "pickup"]),
  couponCode: z.string().optional()
});

export const paystackInitSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
  orderId: z.string().min(6),
  metadata: z.any().optional()
});

export const productSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  inStock: z.boolean().optional(),
  sort: z.enum(["newest", "priceAsc", "priceDesc", "popularity"]).optional()
});
