
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Google Maps type declarations
declare global {
    interface Window {
        google: typeof google;
    }
}

declare namespace google.maps {
    class Map {
        constructor(element: HTMLElement, options: any);
        setCenter(latLng: any): void;
        setZoom(zoom: number): void;
        getZoom(): number | undefined;
    }
    class Marker {
        constructor(options: any);
        setMap(map: Map | null): void;
        addListener(event: string, handler: () => void): void;
    }
    class InfoWindow {
        constructor(options: any);
        open(options: { map?: Map; anchor?: any; content?: string }): void;
        close(): void;
    }
    namespace marker {
        class AdvancedMarkerElement {
            constructor(options: {
                map?: Map;
                position: { lat: number; lng: number };
                title?: string;
                content?: HTMLElement | null;
            });
            addListener(event: string, handler: () => void): void;
            position: { lat: number; lng: number };
            map: Map | null;
        }
    }
    namespace SymbolPath {
        const CIRCLE: any;
    }
}

interface IncidentMarker {
    id: string;
    lat: number;
    lng: number;
    severity: 'Minor' | 'Moderate' | 'Severe';
    location: string;
    date: string;
}

interface MapComponentProps {
    incidents?: IncidentMarker[];
    center?: { lat: number; lng: number };
    zoom?: number;
    onMarkerClick?: (incident: IncidentMarker) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
    incidents: propIncidents,
    center = { lat: 12.9716, lng: 77.5946 }, // Bangalore
    zoom = 12,
    onMarkerClick
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
    const mapInitializedRef = useRef(false);

    // Fetch incidents from Firestore (only if propIncidents not provided)
    useEffect(() => {
        // If incidents are provided as props, use them and skip fetching
        if (propIncidents !== undefined) {
            setIncidents(propIncidents || []);
            return;
        }

        const fetchIncidents = async () => {
            try {
                const incidentsRef = collection(db, 'incidents');
                const q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(50));
                const querySnapshot = await getDocs(q);

                const fetchedIncidents: IncidentMarker[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.location?.coordinates) {
                        fetchedIncidents.push({
                            id: doc.id,
                            lat: data.location.coordinates.latitude || data.location.coordinates._lat,
                            lng: data.location.coordinates.longitude || data.location.coordinates._long,
                            severity: data.severity || 'Minor',
                            location: data.location.address || 'Unknown Location',
                            date: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown Date'
                        });
                    }
                });

                setIncidents(fetchedIncidents);
                console.log(`Loaded ${fetchedIncidents.length} incidents from Firestore`);
            } catch (err) {
                console.error('Error fetching incidents:', err);
                setIncidents([]);
            }
        };

        fetchIncidents();
    }, [propIncidents]);

    // Initialize Google Maps
    useEffect(() => {
        // Prevent multiple initializations
        if (mapInitializedRef.current) return;
        mapInitializedRef.current = true;

        console.log('🗺️ MapComponent: Initializing...');

        const domCheckAttemptsRef = { count: 0 };
        const initMap = () => {
            if (!mapRef.current) {
                domCheckAttemptsRef.count++;
                if (domCheckAttemptsRef.count > 50) {
                    console.error('❌ MapComponent: mapRef.current not available after multiple attempts');
                    setError('Failed to initialize map: DOM element not ready');
                    setIsLoading(false);
                    return;
                }
                // Use requestAnimationFrame for better timing - retry after DOM update
                requestAnimationFrame(() => {
                    initMap(); // Always call initMap again to check
                });
                return;
            }

            try {
                if (typeof google === 'undefined' || !google.maps) {
                    console.error('❌ MapComponent: Google Maps not loaded');
                    setError('Google Maps not loaded. Please check API key.');
                    setIsLoading(false);
                    return;
                }

                console.log('✅ MapComponent: Creating Google Maps instance');
                const mapInstance = new google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    mapId: 'SAFEPAW_MAP_ID', // Required for AdvancedMarkerElement
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ],
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                setMap(mapInstance);
                setIsLoading(false); // Map is ready, stop loading
                console.log('✅ MapComponent: Map instance created successfully');
            } catch (err) {
                console.error('❌ MapComponent: Map initialization error:', err);
                setError('Failed to initialize map');
                setIsLoading(false);
            }
        };

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        // Load Google Maps script if not already loaded
        if (!window.google && !existingScript) {
            if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
                console.error('❌ MapComponent: Google Maps API key not configured');
                setError('Google Maps API key not configured');
                setIsLoading(false);
                return;
            }

            console.log('🗺️ MapComponent: Loading Google Maps script...');
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('✅ MapComponent: Google Maps script loaded successfully');
                initMap();
            };
            script.onerror = () => {
                console.error('❌ MapComponent: Failed to load Google Maps script');
                setError('Failed to load Google Maps. Check your API key.');
                setIsLoading(false);
            };
            document.head.appendChild(script);
        } else if (window.google) {
            console.log('✅ MapComponent: Google Maps already loaded');
            initMap();
        } else if (existingScript) {
            // Script is loading, wait for it with a more efficient check
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds max (100 * 100ms)

            const checkGoogle = setInterval(() => {
                attempts++;
                if (window.google && window.google.maps) {
                    clearInterval(checkGoogle);
                    console.log('✅ MapComponent: Google Maps now available');
                    initMap();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkGoogle);
                    console.error('❌ MapComponent: Google Maps loading timeout');
                    setError('Google Maps loading timeout');
                    setIsLoading(false);
                }
            }, 100);

            // Cleanup on unmount
            return () => {
                clearInterval(checkGoogle);
                mapInitializedRef.current = false;
            };
        }

        // Cleanup on unmount (for other branches)
        return () => {
            mapInitializedRef.current = false;
        };
    }, []); // Empty dependency array - only run once on mount

    // Add markers to map (optimized with AdvancedMarkerElement)
    useEffect(() => {
        if (!map) return;

        console.log(`🗺️ Adding markers for ${incidents.length} incidents`);

        // Check if AdvancedMarkerElement is available, otherwise fall back to Marker
        const useAdvancedMarkers = typeof google !== 'undefined' && 
                                   google.maps?.marker?.AdvancedMarkerElement;

        console.log(`🗺️ Using ${useAdvancedMarkers ? 'AdvancedMarkerElement' : 'legacy Marker'} API`);

        // Clear existing markers and info windows
        markersRef.current.forEach(marker => {
            if ('map' in marker) {
                (marker as any).map = null;
            } else {
                (marker as any).setMap(null);
            }
        });
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        markersRef.current = [];
        infoWindowsRef.current = [];

        if (incidents.length === 0) {
            console.log('⚠️ No incidents to display on map');
            return;
        }

        // Create new markers
        const newMarkers = incidents.map((incident, index) => {
            const severityColor = incident.severity === 'Severe' ? '#DC2626' :
                                 incident.severity === 'Moderate' ? '#F59E0B' : '#10B981';

            if (useAdvancedMarkers) {
                // Use AdvancedMarkerElement with custom pin element
                const pinElement = document.createElement('div');
                pinElement.style.width = '20px';
                pinElement.style.height = '20px';
                pinElement.style.borderRadius = '50%';
                pinElement.style.backgroundColor = severityColor;
                pinElement.style.border = '3px solid white';
                pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                pinElement.style.cursor = 'pointer';

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: { lat: incident.lat, lng: incident.lng },
                    title: incident.location,
                    content: pinElement,
                });

                // Create info window
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; font-family: Inter, sans-serif;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #2D2424;">
                                ${incident.location}
                            </h3>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                                <strong>Severity:</strong> 
                                <span style="color: ${severityColor}">
                                    ${incident.severity}
                                </span>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                ${incident.date}
                            </p>
                        </div>
                    `,
                });

                // Add click listener - for AdvancedMarkerElement, use click event on pin element
                pinElement.addEventListener('click', () => {
                    if (onMarkerClick) {
                        onMarkerClick(incident);
                    }
                    // Close other info windows
                    infoWindowsRef.current.forEach(iw => iw.close());
                    // Show this info window
                    infoWindow.open({
                        anchor: marker,
                        map,
                    });
                });

                infoWindowsRef.current.push(infoWindow);
                return marker;
            } else {
                // Fallback to old Marker API
                const marker = new google.maps.Marker({
                    position: { lat: incident.lat, lng: incident.lng },
                    map,
                    title: incident.location,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: severityColor,
                        fillOpacity: 0.8,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                    },
                });

                // Create info window
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; font-family: Inter, sans-serif;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #2D2424;">
                                ${incident.location}
                            </h3>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                                <strong>Severity:</strong> 
                                <span style="color: ${severityColor}">
                                    ${incident.severity}
                                </span>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                ${incident.date}
                            </p>
                        </div>
                    `,
                });

                // Add click listener - for legacy Marker API
                marker.addListener('click', () => {
                    if (onMarkerClick) {
                        onMarkerClick(incident);
                    }
                    // Close other info windows
                    infoWindowsRef.current.forEach(iw => iw.close());
                    // Show this info window - legacy API uses different signature
                    infoWindow.open({
                        anchor: marker,
                        map,
                    });
                });

                infoWindowsRef.current.push(infoWindow);
                return marker as any; // Type assertion for compatibility
            }
        });

        markersRef.current = newMarkers;
        console.log(`✅ Added ${newMarkers.length} markers to map`);
    }, [map, incidents, onMarkerClick]);

    // Show error state
    if (error && !map) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-[#8AB17D]/20 to-[#E9C46A]/20 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                    <MapPin size={48} className="mx-auto text-[#8B4513] mb-4" />
                    <h3 className="text-lg font-bold text-[#2D2424] mb-2">Map Unavailable</h3>
                    <p className="text-sm text-[#2D2424]/60 mb-4">{error}</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
                        <p className="text-xs text-yellow-800 mb-2"><strong>To enable Google Maps:</strong></p>
                        <ol className="text-xs text-yellow-700 space-y-1 ml-4">
                            <li>1. Get a Google Maps API key from Google Cloud Console</li>
                            <li>2. Add it to your .env file as VITE_GOOGLE_MAPS_API_KEY</li>
                            <li>3. Refresh the page</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
            {/* Always render map container so ref is available */}
            <div ref={mapRef} className="w-full h-full" />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#8AB17D]/20 to-[#E9C46A]/20 rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B4513] border-t-transparent mx-auto mb-4"></div>
                        <p className="text-sm text-[#2D2424]/60">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => map?.setZoom((map.getZoom() || 12) + 1)}
                    className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <ZoomIn size={20} className="text-[#2D2424]" />
                </button>
                <button
                    onClick={() => map?.setZoom((map.getZoom() || 12) - 1)}
                    className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <ZoomOut size={20} className="text-[#2D2424]" />
                </button>
                <button
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((position) => {
                                const pos = {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                };
                                map?.setCenter(pos);
                                map?.setZoom(15);
                            });
                        }
                    }}
                    className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <Navigation size={20} className="text-[#8B4513]" />
                </button>
            </div>

            {/* Incident Count Badge */}
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg">
                <p className="text-sm font-semibold text-[#2D2424]">
                    {incidents.length} Incidents Reported
                </p>
            </div>
        </div>
    );
};

export default MapComponent;
export type { IncidentMarker, MapComponentProps };
