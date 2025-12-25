import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import loadGoogleMaps from '../lib/loadGoogleMaps';

// Google Maps type declarations
declare global {
    interface Window {
        google: any;
    }
}

interface IncidentMarker {
    id: string;
    lat: number;
    lng: number;
    severity: 'Minor' | 'Moderate' | 'Severe';
    location: string;
    date: string;
    description: string;
    type?: 'incident' | 'hospital';
}

interface MapCenter {
    lat: number;
    lng: number;
}

interface MapComponentProps {
    incidents?: IncidentMarker[];
    center?: MapCenter;
    zoom?: number;
    onMarkerClick?: (incident: IncidentMarker) => void;
    showHospitals?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
    incidents: propIncidents,
    center = { lat: 12.9716, lng: 77.5946 },
    zoom = 12,
    onMarkerClick,
    showHospitals = true
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stabilize props to prevent re-initialization loops
    const initialCenter = React.useMemo(() => center, []);
    const initialZoom = React.useMemo(() => zoom, []);
    const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
    const [hospitals, setHospitals] = useState<IncidentMarker[]>([]);
    const markersRef = useRef<Map<string, any>>(new Map());
    const infoWindowRef = useRef<any>(null);
    const incidentsFetchedRef = useRef(false);
    const hospitalsFetchedRef = useRef(false);

    // Fetch incidents from Firestore real-time
    useEffect(() => {
        if (propIncidents !== undefined) {
            setIncidents(propIncidents || []);
            return;
        }

        console.log('🗺️ MapComponent: Setting up real-time incident listener...');
        let unsubscribe: (() => void) | undefined;

        const setupListener = async () => {
            try {
                const { onSnapshot, collection, query, orderBy, limit } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');

                const incidentsRef = collection(db, 'incidents');
                const q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(100));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const fetchedIncidents: IncidentMarker[] = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.location?.coordinates) {
                            fetchedIncidents.push({
                                id: doc.id,
                                lat: data.location.coordinates.latitude || data.location.coordinates._lat || data.location.coordinates._latitude,
                                lng: data.location.coordinates.longitude || data.location.coordinates._long || data.location.coordinates._longitude,
                                severity: data.severity || 'Minor',
                                location: data.location.address || 'Unknown Location',
                                date: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown Date',
                                description: data.description || 'No description',
                                type: 'incident'
                            });
                        }
                    });
                    setIncidents(fetchedIncidents);
                    console.log(`✅ MapComponent: Received ${fetchedIncidents.length} incidents in real-time`);
                }, (err) => {
                    console.error('❌ MapComponent: listener error:', err);
                });
            } catch (err) {
                console.error('❌ MapComponent: import error:', err);
            }
        };

        setupListener();

        return () => {
            if (unsubscribe) {
                console.log('🗺️ MapComponent: Cleaning up listener');
                unsubscribe();
            }
        };
    }, [propIncidents]);

    // Fetch hospitals (optional)
    useEffect(() => {
        if (!showHospitals || hospitalsFetchedRef.current) return;
        hospitalsFetchedRef.current = true;

        const fetchHospitals = async () => {
            console.log('🏥 MapComponent: Fetching hospitals...');
            try {
                // We use incidentService's helper
                const { getNearbyHospitals } = await import('../services/incidentService');
                const hospitalData = await getNearbyHospitals(initialCenter.lat, initialCenter.lng);

                const mappedHospitals: IncidentMarker[] = hospitalData.map(h => ({
                    id: h.id,
                    lat: h.location.lat,
                    lng: h.location.lng,
                    severity: 'Minor', // Not applicable to hospitals but type-safe
                    location: h.name,
                    date: 'Emergency Service',
                    description: h.address + '\nPhone: ' + h.phone,
                    type: 'hospital'
                }));

                setHospitals(mappedHospitals);
                console.log(`✅ Loaded ${mappedHospitals.length} hospitals`);
            } catch (err) {
                console.error('❌ Error fetching hospitals:', err);
            }
        };

        fetchHospitals();
    }, [showHospitals, initialCenter]);

    // Initialize Map Script
    useEffect(() => {
        let isMounted = true;
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        const initMapInstance = async () => {
            if (!mapRef.current) return;

            try {
                console.log('🗺️ MapComponent: Loading Google Maps API...');
                const google = await loadGoogleMaps(apiKey);

                if (!isMounted || !mapRef.current) return;

                console.log('🗺️ MapComponent: Initializing map instance...');
                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: initialCenter,
                    zoom: initialZoom,
                    disableDefaultUI: true,
                    styles: [
                        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
                        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
                        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
                    ],
                });

                infoWindowRef.current = new google.maps.InfoWindow();
                setMap(mapInstance);
                setIsLoading(false);
                console.log('✅ MapComponent: Map initialized successfully');
            } catch (err: any) {
                if (!isMounted) return;
                console.error('❌ MapComponent: Init error:', err);
                setError(err.message || 'Failed to initialize map');
                setIsLoading(false);
            }
        };

        if (isLoading && !map) {
            initMapInstance();
        }

        return () => {
            isMounted = false;
        };
    }, [initialCenter, initialZoom, isLoading, map]);

    // Update markers when incidents/hospitals or map changes
    useEffect(() => {
        if (!map || !window.google) return;

        const allMarkers = [...incidents, ...hospitals];

        // Clear markers not in the new list
        const currentIds = new Set(allMarkers.map(i => i.id));
        markersRef.current.forEach((marker, id) => {
            if (!currentIds.has(id)) {
                marker.setMap(null);
                markersRef.current.delete(id);
            }
        });

        // Add or update markers
        allMarkers.forEach(incident => {
            if (markersRef.current.has(incident.id)) return;

            let color = '#ef4444'; // Red for Severe
            if (incident.type === 'hospital') {
                color = '#2563eb'; // Blue for Hospitals
            } else {
                color = incident.severity === 'Severe' ? '#ef4444' : incident.severity === 'Moderate' ? '#f59e0b' : '#10b981';
            }

            const marker = new window.google.maps.Marker({
                position: { lat: incident.lat, lng: incident.lng },
                map,
                title: incident.location,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: color,
                    fillOpacity: 0.9,
                    strokeWeight: 2,
                    strokeColor: '#ffffff'
                },
                animation: window.google.maps.Animation.DROP
            });

            marker.addListener('click', () => {
                if (onMarkerClick) onMarkerClick(incident);

                const contentString = `
                    <div style="padding: 12px; min-width: 200px;">
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1e293b;">${incident.location}</div>
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></span>
                            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${color};">${incident.severity}</span>
                        </div>
                        <div style="font-size: 12px; color: #64748b; line-height: 1.4;">${incident.description}</div>
                        <div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">${incident.date}</div>
                    </div>
                `;

                infoWindowRef.current.setContent(contentString);
                infoWindowRef.current.open(map, marker);
            });

            markersRef.current.set(incident.id, marker);
        });

        // Fit bounds to markers if they exist and it's the first load
        if (allMarkers.length > 0 && map && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            allMarkers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));

            // Only fit bounds if we haven't done it yet for this map instance
            if (!map.__boundsFitted) {
                map.fitBounds(bounds);
                map.__boundsFitted = true;

                // Don't zoom in too much if there's only one marker
                if (allMarkers.length === 1) {
                    const listener = window.google.maps.event.addListener(map, 'idle', () => {
                        if (map.getZoom() > 15) map.setZoom(15);
                        window.google.maps.event.removeListener(listener);
                    });
                }
            }
        }

    }, [map, incidents, hospitals, onMarkerClick]);

    const handleZoomIn = () => map?.setZoom((map.getZoom() || 12) + 1);
    const handleZoomOut = () => map?.setZoom((map.getZoom() || 12) - 1);

    const handleRecenter = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                map?.panTo(coords);
                map?.setZoom(15);
            });
        }
    }, [map]);

    if (error) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300">
                <div className="text-center px-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800">Map Error</h3>
                    <p className="text-slate-500 max-w-md text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-slate-50/80 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                        <span className="text-slate-600 font-medium">Loading Map Assets...</span>
                    </div>
                </div>
            )}

            <div ref={mapRef} className="w-full h-full bg-slate-100" />

            {/* Controls */}
            {!isLoading && (
                <>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button onClick={handleZoomIn} className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 transition-colors border border-slate-100">
                            <ZoomIn size={20} className="text-slate-700" />
                        </button>
                        <button onClick={handleZoomOut} className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 transition-colors border border-slate-100">
                            <ZoomOut size={20} className="text-slate-700" />
                        </button>
                        <button onClick={handleRecenter} className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 transition-colors border border-slate-100 mt-2">
                            <Navigation size={20} className="text-indigo-600" />
                        </button>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800 tracking-tight">LIVE MONITOR</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className="text-xs text-slate-500">{incidents.length} events detected</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default MapComponent;
export type { IncidentMarker, MapComponentProps };
