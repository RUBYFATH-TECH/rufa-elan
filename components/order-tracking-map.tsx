"use client";

import { useEffect, useRef, useState } from "react";
import { Truck, MapPin, Clock } from "lucide-react";

type TrackingData = {
  lat: number;
  lng: number;
  path: [number, number][];
  status: string;
  progress: number;
};

type Props = {
  orderNumber?: string;
  pollIntervalMs?: number;
};

export default function OrderTrackingMap({ orderNumber = "RUFA-1001", pollIntervalMs = 5000 }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polyRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadLeaflet = async () => {
      if (!window || !document) return;
      if (!(window as any).L) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);

        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.onload = () => resolve();
          document.body.appendChild(s);
        });
      }

      if (cancelled) return;

      const L = (window as any).L;
      if (!mapRef.current) return;

      leafletMapRef.current = L.map(mapRef.current, {
        center: [5.6037, -0.1870],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(leafletMapRef.current);

      polyRef.current = L.polyline([], { 
        color: "#b76d3a", 
        weight: 4,
        opacity: 0.8,
        dashArray: "5, 5"
      }).addTo(leafletMapRef.current);

      const customIcon = L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background-color: #b76d3a; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"><svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M12 2L19 21H5Z"></path></svg></div>`,
        iconSize: [40, 40],
        className: "tracking-marker"
      });

      markerRef.current = L.marker([5.6037, -0.1870], { icon: customIcon }).addTo(leafletMapRef.current);

      // initial fetch
      await fetchAndUpdate();
      setIsLoading(false);

      if (!cancelled) {
        intervalRef.current = setInterval(fetchAndUpdate, pollIntervalMs);
      }
    };

    async function fetchAndUpdate() {
      try {
        const res = await fetch(`/api/order-tracking/position?orderNumber=${encodeURIComponent(orderNumber)}`);
        if (!res.ok) {
          setError("Unable to fetch tracking data");
          return;
        }
        const json = await res.json();
        const { lat, lng, path } = json;
        setTrackingData(json);
        setError(null);

        const L = (window as any).L;
        if (!leafletMapRef.current || !L) return;

        const latLng = [lat, lng];
        markerRef.current.setLatLng(latLng);

        if (Array.isArray(path) && path.length > 0) {
          polyRef.current.setLatLngs(path);
          const bounds = polyRef.current.getBounds();
          leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          leafletMapRef.current.setView(latLng, 10, { animate: true });
        }
      } catch (err) {
        setError("Location update failed - will retry");
        console.error("Tracking error:", err);
      }
    }

    const cleanupPromise = loadLeaflet();
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cleanupPromise.then(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      });
    };
  }, [orderNumber, pollIntervalMs]);

  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-soft">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-brand-50 to-slate-50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Live Order Tracking</p>
            <p className="text-xs text-slate-600 mt-1">Order: {orderNumber}</p>
          </div>
          <div className="text-right">
            {trackingData && (
              <>
                <div className="flex items-center gap-1 text-brand-700 mb-1">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs font-semibold">{trackingData.status}</span>
                </div>
                <div className="text-sm font-bold text-slate-950">{trackingData.progress}% Progress</div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin">
              <Truck className="h-6 w-6 text-brand-700" />
            </div>
            <p className="text-sm text-slate-600">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} style={{ height: 320 }} className="bg-slate-100" />

          {error && (
            <div className="px-4 py-3 bg-amber-50 border-t border-slate-200 text-xs text-amber-800">
              <p>{error}</p>
            </div>
          )}

          {trackingData && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Status</p>
                  <p className="text-sm font-semibold text-slate-950 capitalize">{trackingData.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Distance Traveled</p>
                  <p className="text-sm font-semibold text-slate-950">{trackingData.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Coverage</p>
                  <p className="text-sm font-semibold text-slate-950">Live</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-3 bg-brand-50 border-t border-slate-200">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-brand-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">
                <span className="font-semibold text-brand-700">Live updates</span> every 5 seconds. Your package is on its way!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
