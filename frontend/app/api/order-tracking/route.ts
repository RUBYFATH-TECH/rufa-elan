import { NextResponse } from "next/server";
import { orderTrackingSchema } from "@/lib/validators";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface TimelineEntry {
  status: string;
  note: string;
  timestamp: string;
  location: string;
  icon: string;
}

interface Order {
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  customerName: string;
  deliveryAddress: string;
  carrier: string;
  timeline: TimelineEntry[];
  items: OrderItem[];
  total: number;
}

const sampleOrders: Order[] = [
  {
    orderNumber: "RUFA-1001",
    status: "In transit",
    estimatedDelivery: "2026-07-26",
    customerName: "Abena Mensah",
    deliveryAddress: "123 Independence Ave, Accra",
    carrier: "RUFA Express",
    timeline: [
      {
        status: "Payment confirmed",
        note: "Payment verified successfully via Paystack.",
        timestamp: "2026-07-22T10:30:00Z",
        location: "Accra Distribution Center",
        icon: "check"
      },
      {
        status: "Packed",
        note: "Package is packed and ready for dispatch.",
        timestamp: "2026-07-23T08:45:00Z",
        location: "Accra Distribution Center",
        icon: "box"
      },
      {
        status: "Dispatched",
        note: "Item left our warehouse for regional hub.",
        timestamp: "2026-07-24T14:20:00Z",
        location: "Accra Distribution Center",
        icon: "truck"
      },
      {
        status: "In transit",
        note: "Your order is on the way to Kumasi hub.",
        timestamp: "2026-07-25T09:10:00Z",
        location: "Kasoa Junction",
        icon: "truck"
      },
      {
        status: "Arriving soon",
        note: "Package arriving at your location today.",
        timestamp: "2026-07-26T15:00:00Z",
        location: "Delivery Location",
        icon: "location"
      }
    ],
    items: [
      { name: "Alaia Leather Tote", quantity: 1, price: 280 },
      { name: "Mila Crossbody", quantity: 2, price: 199 }
    ],
    total: 678
  },
  {
    orderNumber: "RUFA-1002",
    status: "Delivered",
    estimatedDelivery: "2026-07-24",
    customerName: "Nana Owusu",
    deliveryAddress: "45 Osu Main Street, Accra",
    carrier: "RUFA Express",
    timeline: [
      {
        status: "Payment confirmed",
        note: "Payment verified successfully via Paystack.",
        timestamp: "2026-07-20T09:15:00Z",
        location: "Accra Distribution Center",
        icon: "check"
      },
      {
        status: "Packed",
        note: "Package packed and dispatched.",
        timestamp: "2026-07-21T11:30:00Z",
        location: "Accra Distribution Center",
        icon: "box"
      },
      {
        status: "In transit",
        note: "Out for delivery in Accra.",
        timestamp: "2026-07-22T08:00:00Z",
        location: "Accra (North)",
        icon: "truck"
      },
      {
        status: "Delivered",
        note: "Package delivered successfully. Signed by recipient.",
        timestamp: "2026-07-24T14:30:00Z",
        location: "45 Osu Main Street, Accra",
        icon: "location"
      }
    ],
    items: [
      { name: "Selene Shoulder Bag", quantity: 1, price: 250 },
      { name: "Noelle Classic Purse", quantity: 1, price: 130 }
    ],
    total: 380
  },
  {
    orderNumber: "RUFA-1003",
    status: "Processing",
    estimatedDelivery: "2026-07-28",
    customerName: "Efua Dadzie",
    deliveryAddress: "78 Airport Hills, Kumasi",
    carrier: "RUFA Express",
    timeline: [
      {
        status: "Payment confirmed",
        note: "Payment verified. Awaiting dispatch.",
        timestamp: "2026-07-24T16:00:00Z",
        location: "Kumasi Distribution Hub",
        icon: "check"
      }
    ],
    items: [
      { name: "Alaia Leather Tote", quantity: 1, price: 280 },
      { name: "Mila Crossbody", quantity: 1, price: 199 },
      { name: "Noelle Classic Purse", quantity: 1, price: 130 }
    ],
    total: 609
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = orderTrackingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid order number format." },
        { status: 400 }
      );
    }

    const order = sampleOrders.find(
      (item) =>
        item.orderNumber.toUpperCase() ===
        parseResult.data.orderNumber.toUpperCase()
    );

    if (!order) {
      return NextResponse.json(
        {
          message: `Order "${parseResult.data.orderNumber}" not found. Please check the order number and try again.`
        },
        { status: 404 }
      );
    }

    // Simulate real-time progress based on current time cycle (2 min demo cycle)
    const cycleMs = 2 * 60 * 1000;
    const t = ((Date.now() % cycleMs) / cycleMs) % 1;
    const progress = Math.round(t * 100);

    return NextResponse.json({
      ...order,
      currentProgress: progress,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { message: "Failed to retrieve order information. Please try again." },
      { status: 500 }
    );
  }
}
