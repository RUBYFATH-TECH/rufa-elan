"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Store, Package } from "lucide-react";

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
  startLabel = "RUFA ELAN Shop",
  endLabel = "Delivery Address"
}: DeliveryMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);

  useEffect(() => {
    // Dynamically import leaflet only on client
    const loadMap = async () => {
      if (!containerRef.current || mapLoaded) return;

      try {
        const L = (await import("leaflet")).default;
        require("leaflet/dist/leaflet.css");

        // Fix for default marker icons in production
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map with better styling
        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: false,
          }).setView(
            [(startLat + endLat) / 2, (startLng + endLng) / 2],
            12
          );

          // Add modern tile layer (CartoDB Positron - clean and professional)
          L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: '© OpenStreetMap contributors, © CARTO',
            maxZoom: 19,
            subdomains: 'abcd',
          }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clear existing markers and lines
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
            map.removeLayer(layer);
          }
        });

        // Create custom icons using divIcon for better styling
        const startIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: 4px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s ease-in-out infinite;
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div style="
                position: absolute;
                top: 52px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 6px 12px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                white-space: nowrap;
                font-weight: 600;
                font-size: 12px;
                color: #1e293b;
              ">
                🏪 ${startLabel}
              </div>
            </div>
          `,
          className: 'custom-marker-icon',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const endIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border: 4px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: bounce 2s ease-in-out infinite;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="#3b82f6"></circle>
                </svg>
              </div>
              <div style="
                position: absolute;
                top: 48px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 6px 12px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                white-space: nowrap;
                font-weight: 600;
                font-size: 12px;
                color: #1e293b;
              ">
                📍 ${endLabel}
              </div>
            </div>
          `,
          className: 'custom-marker-icon',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        // Add start marker (Shop)
        L.marker([startLat, startLng], { icon: startIcon })
          .addTo(map);

        // Add end marker (Delivery Address)
        L.marker([endLat, endLng], { icon: endIcon })
          .addTo(map);

        // Add pulsing circle at start location
        const startCircle = L.circle([startLat, startLng], {
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.15,
          radius: 200,
          weight: 2,
        }).addTo(map);

        // Add destination circle
        const endCircle = L.circle([endLat, endLng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          radius: 150,
          weight: 2,
        }).addTo(map);

        // Fetch real route from OSRM (Open Source Routing Machine)
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
          );
          const routeData = await routeResponse.json();

          if (routeData.routes && routeData.routes.length > 0) {
            const route = routeData.routes[0];
            const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

            // Draw main route line with gradient effect
            const mainRoute = L.polyline(coordinates, {
              color: '#f97316',
              weight: 6,
              opacity: 0.8,
              lineJoin: 'round',
              lineCap: 'round',
            }).addTo(map);

            // Add shadow/outline effect
            const routeShadow = L.polyline(coordinates, {
              color: '#000000',
              weight: 8,
              opacity: 0.2,
              lineJoin: 'round',
              lineCap: 'round',
            }).addTo(map);
            routeShadow.bringToBack();

            // Add animated dashed line overlay
            const animatedLine = L.polyline(coordinates, {
              color: '#ffffff',
              weight: 2,
              opacity: 0.9,
              dashArray: '10, 15',
              dashOffset: '0',
              lineJoin: 'round',
              lineCap: 'round',
            }).addTo(map);

            // Animate the dashed line
            let offset = 0;
            setInterval(() => {
              offset = (offset + 1) % 25;
              (animatedLine as any).setStyle({ dashOffset: String(offset) });
            }, 50);

            // Fit bounds with padding
            map.fitBounds(mainRoute.getBounds(), { 
              padding: [80, 80],
              maxZoom: 14
            });

            setRouteData({
              distance: (route.distance / 1000).toFixed(1),
              duration: Math.round(route.duration / 60)
            });
          } else {
            // Fallback to straight line if routing fails
            drawFallbackLine(L, map, startLat, startLng, endLat, endLng);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          // Fallback to straight line
          drawFallbackLine(L, map, startLat, startLng, endLat, endLng);
        }

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .leaflet-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .custom-marker-icon {
            background: transparent !important;
            border: none !important;
          }
        `;
        document.head.appendChild(style);

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    // Helper function to draw fallback straight line
    const drawFallbackLine = (L: any, map: any, startLat: number, startLng: number, endLat: number, endLng: number) => {
      const line = L.polyline([[startLat, startLng], [endLat, endLng]], {
        color: "#f97316",
        weight: 5,
        opacity: 0.8,
        dashArray: "10, 10",
        lineJoin: 'round',
      }).addTo(map);

      map.fitBounds(line.getBounds(), { padding: [60, 60] });
    };

    loadMap();
  }, [startLat, startLng, endLat, endLng, mapLoaded, startLabel, endLabel]);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-orange-200 shadow-lg">
        <div
          ref={containerRef}
          className="w-full h-80 bg-gray-100"
          style={{ zIndex: 1 }}
        />
        
        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start gap-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Distance</p>
              <p className="text-lg font-bold text-gray-900">{distance.toFixed(1)} km</p>
            </div>
          </div>
          
          {routeData && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Est. Time</p>
                <p className="text-lg font-bold text-gray-900">{routeData.duration} min</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Details Card */}
      <div className="bg-gradient-to-r from-orange-50 via-orange-50 to-blue-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">From</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{startLabel}</p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-orange-300 flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">To</p>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{endLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
