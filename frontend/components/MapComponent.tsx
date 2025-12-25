
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
        open(map: Map, marker: Marker): void;
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
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incidents, setIncidents] = useState<IncidentMarker[]>([]);

    // Fetch incidents from Firestore
    useEffect(() => {
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
                // Use prop incidents or empty array as fallback
                setIncidents(propIncidents || []);
            }
        };

        fetchIncidents();
    }, [propIncidents]);

    // Initialize Google Maps
    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current) return;

            try {
                // Check if Google Maps is loaded
                if (typeof google === 'undefined' || !google.maps) {
                    setError('Google Maps not loaded. Please check API key.');
                    setIsLoading(false);
                    return;
                }

                const mapInstance = new google.maps.Map(mapRef.current, {
                    center,
                    zoom,
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
                setIsLoading(false);
            } catch (err) {
                console.error('Map initialization error:', err);
                setError('Failed to initialize map');
                setIsLoading(false);
            }
        };

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');

        // Load Google Maps script if not already loaded
        if (!window.google && !existingScript) {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
                setError('Google Maps API key not configured');
                setIsLoading(false);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('Google Maps loaded successfully');
                initMap();
            };
            script.onerror = () => {
                setError('Failed to load Google Maps. Check your API key.');
                setIsLoading(false);
            };
            document.head.appendChild(script);
        } else if (window.google) {
            // Google Maps already loaded
            initMap();
        } else {
            // Script is loading, wait for it
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    initMap();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkGoogle);
                if (!window.google) {
                    setError('Google Maps loading timeout');
                    setIsLoading(false);
                }
            }, 10000);
        }
    }, []);

    // Add markers to map
    useEffect(() => {
        if (!map || incidents.length === 0) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        // Create new markers
        const newMarkers = incidents.map(incident => {
            const marker = new google.maps.Marker({
                position: { lat: incident.lat, lng: incident.lng },
                map,
                title: incident.location,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: incident.severity === 'Severe' ? '#DC2626' :
                        incident.severity === 'Moderate' ? '#F59E0B' : '#10B981',
                    fillOpacity: 0.8,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                },
            });

            // Add click listener
            marker.addListener('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(incident);
                }

                // Show info window
                const infoWindow = new google.maps.InfoWindow({
                    content: `
            <div style="padding: 8px; font-family: Inter, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #2D2424;">
                ${incident.location}
              </h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                <strong>Severity:</strong> 
                <span style="color: ${incident.severity === 'Severe' ? '#DC2626' :
                            incident.severity === 'Moderate' ? '#F59E0B' : '#10B981'}">
                  ${incident.severity}
                </span>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                ${incident.date}
              </p>
            </div>
          `,
                });
                infoWindow.open(map, marker);
            });

            return marker;
        });

        setMarkers(newMarkers);
    }, [map, incidents, onMarkerClick]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-[#8AB17D]/20 to-[#E9C46A]/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B4513] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-sm text-[#2D2424]/60">Loading map...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
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
            <div ref={mapRef} className="w-full h-full" />

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
