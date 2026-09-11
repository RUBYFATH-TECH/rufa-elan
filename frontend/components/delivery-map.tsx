"use client";

import { useEffect, useRef, useState } from "react";

interface DeliveryMapProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distance: number;
  startLabel?: string;
  endLabel?: string;
}

export default function DeliveryMap({
  startLat,
  startLng,
  endLat,
  endLng,
  distance,
  startLabel = "Kumasi Office",
  endLabel = "Delivery Address"
}: DeliveryMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import leaflet only on client
    const loadMap = async () => {
      if (!containerRef.current || mapLoaded) return;

      try {
        const L = (await import("leaflet")).default;
        require("leaflet/dist/leaflet.css");

        // Initialize map
        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current).setView(
            [(startLat + endLat) / 2, (startLng + endLng) / 2],
            10
          );

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clear existing markers and lines
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });

        // Add start marker (Office) - using default marker
        L.marker([startLat, startLng])
          .bindPopup(`<div class="font-bold text-sm">${startLabel}</div>`)
          .addTo(map)
          .openPopup();

        // Add end marker (Delivery Address)
        L.marker([endLat, endLng])
          .bindPopup(`<div class="font-bold text-sm">${endLabel}</div>`)
          .addTo(map);

        // Draw line between points
        const line = L.polyline([[startLat, startLng], [endLat, endLng]], {
          color: "#ff8c00",
          weight: 3,
          opacity: 0.8,
          dashArray: "5, 5",
        }).addTo(map);

        // Fit bounds
        map.fitBounds(line.getBounds(), { padding: [50, 50] });

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();
  }, [startLat, startLng, endLat, endLng, mapLoaded]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full h-64 rounded-lg border border-slate-200 overflow-hidden bg-slate-100"
        style={{ zIndex: 1 }}
      />
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p className="font-bold text-blue-900">📍 Distance: {distance.toFixed(1)} km</p>
      </div>
    </div>
  );
}
