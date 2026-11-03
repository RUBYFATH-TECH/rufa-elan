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
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Dynamically import leaflet only on client
    const loadMap = async () => {
      if (!containerRef.current || mapLoaded) return;

      try {
        const L = (await import("leaflet")).default;
        // Import Leaflet CSS using require
        require("leaflet/dist/leaflet.css");

        if (!isMounted) return;

        // Fix for default marker icons in production
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map with better styling
        if (!mapRef.current && containerRef.current) {
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

        if (!isMounted || !mapRef.current) return;

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
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
            </div>
          `,
          className: 'custom-marker-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const endIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="#3b82f6"></circle>
                </svg>
              </div>
            </div>
          `,
          className: 'custom-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        // Add start marker (Shop)
        L.marker([startLat, startLng], { icon: startIcon })
          .bindPopup(`<div style="font-weight: 600; font-size: 12px;">🏪 ${startLabel}</div>`)
          .addTo(map);

        // Add end marker (Delivery Address)
        L.marker([endLat, endLng], { icon: endIcon })
          .bindPopup(`<div style="font-weight: 600; font-size: 12px;">📍 ${endLabel}</div>`)
          .addTo(map);

        // Add pulsing circle at start location
        L.circle([startLat, startLng], {
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.15,
          radius: 200,
          weight: 2,
        }).addTo(map);

        // Add destination circle
        L.circle([endLat, endLng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          radius: 150,
          weight: 2,
        }).addTo(map);

        // Fetch real route from OSRM (Open Source Routing Machine)
        setIsLoadingRoute(true);
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
          );
          const routeData = await routeResponse.json();

          if (!isMounted) return;

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
            const animationInterval = setInterval(() => {
              if (!isMounted) {
                clearInterval(animationInterval);
                return;
              }
              offset = (offset + 1) % 25;
              (animatedLine as any).setStyle({ dashOffset: String(offset) });
            }, 50);

            // Fit bounds with padding
            map.fitBounds(mainRoute.getBounds(), { 
              padding: [60, 60],
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
          if (isMounted) {
            // Fallback to straight line
            drawFallbackLine(L, map, startLat, startLng, endLat, endLng);
          }
        } finally {
          if (isMounted) {
            setIsLoadingRoute(false);
          }
        }

        // Add CSS for animations
        if (isMounted && !document.getElementById('leaflet-custom-styles')) {
          const style = document.createElement('style');
          style.id = 'leaflet-custom-styles';
          style.textContent = `
            .leaflet-container {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              z-index: 1;
            }
            .custom-marker-icon {
              background: transparent !important;
              border: none !important;
            }
            .leaflet-popup-content-wrapper {
              border-radius: 8px;
            }
          `;
          document.head.appendChild(style);
        }

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading map:", error);
        setIsLoadingRoute(false);
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

      map.fitBounds(line.getBounds(), { padding: [50, 50] });
    };

    loadMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [startLat, startLng, endLat, endLng, mapLoaded, startLabel, endLabel]);

  return (
    <div className="space-y-0">
      {/* Map Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-64 sm:h-80 bg-gray-100 relative"
          style={{ zIndex: 1 }}
        />
        
        {isLoadingRoute && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-700">Loading route map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Route Details Card - Below Map */}
      <div className="bg-gradient-to-r from-orange-50 via-orange-50 to-blue-50 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Distance Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Navigation className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distance</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{distance.toFixed(1)} km</p>
            </div>
          </div>
          
          {/* Duration Info */}
          {routeData && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Est. Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{routeData.duration} min</p>
              </div>
            </div>
          )}
        </div>

        {/* From/To Details */}
        <div className="mt-4 pt-4 border-t border-orange-200/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-4 h-4 text-orange-600" />
                <p className="font-semibold text-gray-600 uppercase text-xs tracking-wide">From</p>
              </div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">{startLabel}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="font-semibold text-gray-600 uppercase text-xs tracking-wide">To</p>
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">{endLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
