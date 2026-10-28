"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Layers,
  Link2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "uz" | "ru";
  initialRegion?: string;
  initialGeolocation?: string;
  onConfirm: (result: {
    geolocationUrl: string;
    lat: number;
    lng: number;
    detectedDistrict?: string;
    detectedAddress?: string;
  }) => void;
}

interface SearchSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Default coordinates for Uzbekistan regions (so the map opens in the buyer's selected region)
const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  toshkent: { lat: 41.311081, lng: 69.240562, zoom: 13 },
  ташкент: { lat: 41.311081, lng: 69.240562, zoom: 13 },
  samarqand: { lat: 39.65417, lng: 66.95972, zoom: 13 },
  самарканд: { lat: 39.65417, lng: 66.95972, zoom: 13 },
  buxoro: { lat: 39.77472, lng: 64.42861, zoom: 13 },
  бухар: { lat: 39.77472, lng: 64.42861, zoom: 13 },
  andijon: { lat: 40.78206, lng: 72.34424, zoom: 13 },
  андижан: { lat: 40.78206, lng: 72.34424, zoom: 13 },
  "farg'ona": { lat: 40.38421, lng: 71.78432, zoom: 13 },
  ферган: { lat: 40.38421, lng: 71.78432, zoom: 13 },
  namangan: { lat: 40.9983, lng: 71.67257, zoom: 13 },
  наманган: { lat: 40.9983, lng: 71.67257, zoom: 13 },
  qashqadaryo: { lat: 38.8606, lng: 65.78905, zoom: 13 },
  кашкадар: { lat: 38.8606, lng: 65.78905, zoom: 13 },
  surxondaryo: { lat: 37.22417, lng: 67.27833, zoom: 13 },
  сурхандар: { lat: 37.22417, lng: 67.27833, zoom: 13 },
  xorazm: { lat: 41.55, lng: 60.63333, zoom: 13 },
  хорезм: { lat: 41.55, lng: 60.63333, zoom: 13 },
  navoiy: { lat: 40.08444, lng: 65.37917, zoom: 13 },
  навои: { lat: 40.08444, lng: 65.37917, zoom: 13 },
  jizzax: { lat: 40.11583, lng: 67.84222, zoom: 13 },
  джизак: { lat: 40.11583, lng: 67.84222, zoom: 13 },
  sirdaryo: { lat: 40.48972, lng: 68.78417, zoom: 13 },
  сырдар: { lat: 40.48972, lng: 68.78417, zoom: 13 },
  "qoraqalpog'iston": { lat: 42.4602, lng: 59.6166, zoom: 13 },
  каракалпак: { lat: 42.4602, lng: 59.6166, zoom: 13 },
};

/**
 * Formats coordinates into the exact 1C ERP geolocation URL specification:
 * https://maps.google.com/maps?q=41.351791,69.240149&ll=41.351791,69.240149&z=16
 */
export function formatOneCGeolocationUrl(lat: number, lng: number): string {
  const latStr = lat.toFixed(6);
  const lngStr = lng.toFixed(6);
  return `https://maps.google.com/maps?q=${latStr},${lngStr}&ll=${latStr},${lngStr}&z=16`;
}

/**
 * Extracts (lat, lng) from any Google Maps link, Yandex Maps link, or raw coordinate pair.
 * Automatically normalizes Uzbekistan lat (37..46) vs lng (55..74) even when Yandex uses (lon, lat).
 */
export function parseCoordinatesFromInput(
  raw: string
): { lat: number; lng: number } | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw.trim());

  // Find all decimal numbers that look like coordinates (e.g. 41.351791, 69.240149)
  const matches = decoded.match(/-?\d{2}\.\d{3,10}/g);
  if (!matches || matches.length < 2) return null;

  const n1 = parseFloat(matches[0]);
  const n2 = parseFloat(matches[1]);
  if (Number.isNaN(n1) || Number.isNaN(n2)) return null;

  // Uzbekistan bounds check: Lat is ~37..46, Lng is ~55..74
  if (n1 >= 36 && n1 <= 47 && n2 >= 55 && n2 <= 75) {
    return { lat: n1, lng: n2 };
  }
  if (n2 >= 36 && n2 <= 47 && n1 >= 55 && n1 <= 75) {
    // Yandex Maps format where longitude comes first (ll=69.240149,41.351791)
    return { lat: n2, lng: n1 };
  }

  if (Math.abs(n1) <= 90 && Math.abs(n2) <= 180) {
    return { lat: n1, lng: n2 };
  }
  return null;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  locale,
  initialRegion = "",
  initialGeolocation = "",
  onConfirm,
}: LocationPickerModalProps) {
  const isUz = locale === "uz";

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 41.311081,
    lng: 69.240562,
  });
  const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Reverse geocoded address preview
  const [detectedAddress, setDetectedAddress] = useState<string>("");
  const [detectedDistrict, setDetectedDistrict] = useState<string>("");
  const [isReverseLoading, setIsReverseLoading] = useState(false);

  // Search & Link input state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [linkPasteHint, setLinkPasteHint] = useState<string>("");

  // Reverse geocode coordinates into human-readable street & district
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(
            6
          )}&lon=${lng.toFixed(6)}&zoom=18&addressdetails=1&accept-language=${locale}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const addr = data?.address || {};

        const districtCandidate =
          addr.county ||
          addr.city_district ||
          addr.suburb ||
          addr.borough ||
          addr.town ||
          "";

        const streetParts = [
          addr.neighbourhood || addr.quarter || addr.residential,
          addr.road || addr.pedestrian,
          addr.house_number,
          addr.building || addr.amenity || addr.shop || addr.office,
        ].filter(Boolean);

        const formattedStreet =
          streetParts.length > 0
            ? streetParts.join(", ")
            : data?.display_name
                ?.split(",")
                .slice(0, 3)
                .join(",")
                .trim() || "";

        setDetectedDistrict(districtCandidate);
        setDetectedAddress(formattedStreet);
      } catch {
        // Ignore network errors on reverse geocoding
      } finally {
        setIsReverseLoading(false);
      }
    },
    [locale]
  );

  // Determine initial coordinates when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const parsedInit = parseCoordinatesFromInput(initialGeolocation);
    if (parsedInit) {
      setCoords(parsedInit);
      void reverseGeocode(parsedInit.lat, parsedInit.lng);
      return;
    }

    const regionLower = initialRegion.toLowerCase();
    const matchedRegionKey = Object.keys(REGION_CENTERS).find((k) =>
      regionLower.includes(k)
    );
    const center = matchedRegionKey
      ? REGION_CENTERS[matchedRegionKey]
      : REGION_CENTERS.toshkent;

    setCoords({ lat: center.lat, lng: center.lng });
    void reverseGeocode(center.lat, center.lng);
  }, [isOpen, initialGeolocation, initialRegion, reverseGeocode]);

  // Dynamically load Leaflet CSS & JS from CDN only when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const ensureLeafletLoaded = async () => {
      if (typeof window === "undefined") return;

      // 1. Inject Leaflet CSS if not present
      if (!document.getElementById("leaflet-cdn-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-cdn-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS if not present
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.getElementById("leaflet-cdn-js");
          if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            return;
          }
          const script = document.createElement("script");
          script.id = "leaflet-cdn-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Leaflet load error"));
          document.body.appendChild(script);
        });
      }

      if (cancelled || !mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      // Clean up any previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initCoords =
        parseCoordinatesFromInput(initialGeolocation) || coords;

      const map = L.map(mapContainerRef.current, {
        center: [initCoords.lat, initCoords.lng],
        zoom: 16,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const streetUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const layer = L.tileLayer(streetUrl, {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Click anywhere on map to smoothly center the pin there
      map.on("click", (e: any) => {
        if (e?.latlng) {
          map.flyTo([e.latlng.lat, e.latlng.lng], map.getZoom(), {
            duration: 0.4,
          });
        }
      });

      map.on("movestart", () => {
        setIsDragging(true);
      });

      map.on("moveend", () => {
        setIsDragging(false);
        const center = map.getCenter();
        if (center) {
          setCoords({ lat: center.lat, lng: center.lng });
          void reverseGeocode(center.lat, center.lng);
        }
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    };

    void ensureLeafletLoaded();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Switch between Street and Satellite map tiles
  const toggleMapLayer = () => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    const nextStyle = mapStyle === "street" ? "satellite" : "street";
    setMapStyle(nextStyle);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      nextStyle === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);
  };

  // Handle address search or pasted Yandex/Google Maps link
  const handleSearchOrPaste = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // 1. Check if user pasted a Yandex Maps / Google Maps link or raw coordinates
    const parsedCoords = parseCoordinatesFromInput(q);
    if (parsedCoords) {
      setCoords(parsedCoords);
      setSuggestions([]);
      setLinkPasteHint(
        isUz
          ? "Havola koordinatalari aniqlandi!"
          : "Координаты из ссылки определены!"
      );
      setTimeout(() => setLinkPasteHint(""), 3500);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([parsedCoords.lat, parsedCoords.lng], 17, {
          duration: 0.6,
        });
      }
      void reverseGeocode(parsedCoords.lat, parsedCoords.lng);
      return;
    }

    // 2. Otherwise search address by text in Uzbekistan
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=uz&limit=5&accept-language=${locale}&q=${encodeURIComponent(
          q
        )}`
      );
      if (res.ok) {
        const list = (await res.json()) as SearchSuggestion[];
        setSuggestions(list);
        if (list.length > 0) {
          const first = list[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng) && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.6 });
          }
        }
      }
    } catch {
      // Ignore search error
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSuggestions([]);
    setSearchQuery(item.display_name.split(",").slice(0, 2).join(", "));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setCoords({ lat, lng });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.5 });
      }
      void reverseGeocode(lat, lng);
    }
  };

  // Locate via browser GPS if available
  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.6 });
        }
        void reverseGeocode(lat, lng);
        setIsLocatingGps(false);
      },
      () => {
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirmLocation = () => {
    const geolocationUrl = formatOneCGeolocationUrl(coords.lat, coords.lng);
    onConfirm({
      geolocationUrl,
      lat: coords.lat,
      lng: coords.lng,
      detectedDistrict: detectedDistrict || undefined,
      detectedAddress: detectedAddress || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {isUz
                  ? "Yetkazib berish nuqtasini xaritadan tanlang"
                  : "Выберите точку доставки на карте"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUz
                  ? "Xaritani suring, manzilni qidiring yoki Yandex/Google xarita linkini tashlang"
                  : "Передвиньте карту, найдите адрес или вставьте ссылку из Яндекс/Google Карт"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Link Paste Bar */}
        <div className="p-3.5 sm:px-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 relative z-20">
          <form onSubmit={handleSearchOrPaste} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  // Auto-parse if user pastes a link with coordinates
                  const parsed = parseCoordinatesFromInput(val);
                  if (parsed) {
                    setCoords(parsed);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([parsed.lat, parsed.lng], 17, {
                        duration: 0.5,
                      });
                    }
                    void reverseGeocode(parsed.lat, parsed.lng);
                    setLinkPasteHint(
                      isUz
                        ? "Koordinata havoladan olindi ✓"
                        : "Координаты из ссылки получены ✓"
                    );
                    setTimeout(() => setLinkPasteHint(""), 3500);
                  }
                }}
                placeholder={
                  isUz
                    ? "Ko'cha, mo'ljal (masalan: Chilonzor 9) yoki Yandex/Google Maps linki..."
                    : "Улица, ориентир (напр.: Чиланзар 9) или ссылка из Яндекс/Google Карт..."
                }
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isUz ? "Topish" : "Найти"}</span>
              )}
            </button>
          </form>

          {linkPasteHint && (
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              <span>{linkPasteHint}</span>
            </div>
          )}

          {/* Search Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-3.5 right-3.5 sm:left-5 sm:right-5 top-full mt-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto z-30">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-sora-50 dark:hover:bg-slate-700/60 flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-sora-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Map Viewport */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 dark:bg-slate-800 select-none overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {!isMapReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 z-10">
              <Loader2 className="w-7 h-7 text-sora-600 animate-spin" />
              <span className="text-xs font-medium text-slate-500">
                {isUz ? "Xarita yuklanmoqda..." : "Загрузка карты..."}
              </span>
            </div>
          )}

          {/* Fixed Center Pin (Yandex Go / Uzum Tezkor style) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div
              className={`flex flex-col items-center -translate-y-5 transition-transform duration-150 ${
                isDragging ? "-translate-y-7 scale-110" : ""
              }`}
            >
              <div className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-bold shadow-md mb-1 whitespace-nowrap">
                {isUz ? "Yetkazish nuqtasi" : "Точка доставки"}
              </div>
              <div className="w-9 h-9 rounded-full bg-rose-600 border-3 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <div className="w-2 h-2 rounded-full bg-slate-900/40 mt-0.5 blur-[1px]" />
            </div>
          </div>

          {/* Floating Map Controls (Top-Right: Layer Toggle & GPS) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleMapLayer}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-sora-600" />
              <span>
                {mapStyle === "street"
                  ? isUz
                    ? "Sputnik"
                    : "Спутник"
                  : isUz
                  ? "Sxema"
                  : "Схема"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLocateMe}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold text-sora-600 dark:text-sora-400 hover:bg-white cursor-pointer"
            >
              {isLocatingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>{isUz ? "GPS orqali" : "Где я (GPS)"}</span>
            </button>
          </div>
        </div>

        {/* Footer: Detected Address & Confirm Button */}
        <div className="p-4 sm:px-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </span>
              <a
                href={`https://yandex.uz/maps/?pt=${coords.lng.toFixed(
                  6
                )},${coords.lat.toFixed(6)}&z=17&l=map`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-sora-600 hover:underline font-sans"
              >
                <span>Yandex Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {isReverseLoading
                ? isUz
                  ? "Manzil aniqlanmoqda..."
                  : "Определение адреса..."
                : detectedAddress ||
                  (isUz
                    ? "Nuqta tanlandi (koordinata tayyor)"
                    : "Точка выбрана (координаты готовы)")}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmLocation}
            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>
              {isUz ? "Shu nuqtani tasdiqlash" : "Подтвердить эту точку"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
