import { NextResponse } from "next/server";

// Realistic delivery route: Accra → Kasoa → Kumasi → Tamale
const deliveryPath = [
  { lat: 5.6037, lng: -0.1870, location: "Accra Distribution Center", type: "start" },
  { lat: 5.6200, lng: -0.2100, location: "Accra (North)" },
  { lat: 5.6500, lng: -0.25, location: "Kasoa Junction" },
  { lat: 6.0000, lng: -0.3500, location: "Winneba Road" },
  { lat: 6.3500, lng: -0.5000, location: "Cape Coast Area" },
  { lat: 6.8000, lng: -1.0500, location: "Dunkwa-On-Offin" },
  { lat: 7.1000, lng: -1.4000, location: "Obuasi" },
  { lat: 7.1500, lng: -1.6500, location: "Kumasi Distribution Hub", type: "hub" },
  { lat: 7.5000, lng: -1.8000, location: "Mampong" },
  { lat: 8.0000, lng: -1.9000, location: "Ejura" },
  { lat: 8.5000, lng: -1.8500, location: "Nkoranza" },
  { lat: 9.2000, lng: -1.8000, location: "Tamale (Final Destination)", type: "end" }
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function positionAlongPath(t: number) {
  // t between 0..1
  const segments = deliveryPath.length - 1;
  const pos = Math.min(Math.max(t, 0), 0.9999) * segments;
  const idx = Math.floor(pos);
  const localT = pos - idx;
  
  const a = deliveryPath[idx];
  const b = deliveryPath[idx + 1];
  
  const lat = lerp(a.lat, b.lat, localT);
  const lng = lerp(a.lng, b.lng, localT);
  
  return { lat, lng };
}

function getCurrentLocationInfo(t: number) {
  const segments = deliveryPath.length - 1;
  const pos = Math.min(Math.max(t, 0), 0.9999) * segments;
  const idx = Math.floor(pos);
  const nextIdx = Math.min(idx + 1, deliveryPath.length - 1);
  
  const current = deliveryPath[idx];
  const next = deliveryPath[nextIdx];
  
  const localT = Math.min(pos - idx, 1);
  
  return {
    currentLocation: current.location,
    nextLocation: next.location,
    progress: localT
  };
}

function getStatus(progress: number) {
  if (progress < 0.25) return "Packed";
  if (progress < 0.5) return "In transit to regional hub";
  if (progress < 0.75) return "In transit";
  if (progress < 0.95) return "Out for delivery";
  return "Delivery complete";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber") ?? "RUFA-1001";

  try {
    // Simulate realistic delivery: Complete route in 4 hours (demo: 2 min full cycle)
    const cycleMs = 2 * 60 * 1000; // 2 minutes full cycle for demo
    const t = ((Date.now() % cycleMs) / cycleMs) % 1;
    const pos = positionAlongPath(t);
    const locationInfo = getCurrentLocationInfo(t);
    const status = getStatus(t);
    const progress = Math.round(t * 100);

    // Convert path to array of [lat, lng]
    const pathArray = deliveryPath.map(p => [p.lat, p.lng]) as [number, number][];

    return NextResponse.json({
      orderNumber,
      lat: pos.lat,
      lng: pos.lng,
      path: pathArray,
      status,
      progress,
      currentLocation: locationInfo.currentLocation,
      nextLocation: locationInfo.nextLocation,
      timestamp: new Date().toISOString(),
      eta: getETA(t),
      distance: getDistanceTraveled(t)
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
}

function getETA(progress: number) {
  // Assume 4-hour delivery cycle
  const remainingProgress = Math.max(0, 1 - progress);
  const remainingMs = remainingProgress * 4 * 60 * 60 * 1000;
  const eta = new Date(Date.now() + remainingMs);
  return {
    date: eta.toLocaleDateString("en-US"),
    time: eta.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  };
}

function getDistanceTraveled(progress: number) {
  // Approximate total distance: ~450km (Accra to Tamale)
  const totalDistance = 450;
  const traveled = totalDistance * progress;
  const remaining = totalDistance * (1 - progress);
  
  return {
    traveled: Math.round(traveled),
    remaining: Math.round(remaining),
    total: totalDistance
  };
}
