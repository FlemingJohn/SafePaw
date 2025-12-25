
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Dog, Building2 } from 'lucide-react';
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
        open(options?: { map?: Map; anchor?: any; content?: string }): void;
        close(): void;
    }
    namespace places {
        class PlacesService {
            constructor(attrContainer: HTMLElement | Map);
            nearbySearch(request: any, callback: (results: any[], status: any) => void): void;
        }
        enum PlacesServiceStatus {
            OK = 'OK',
            ZERO_RESULTS = 'ZERO_RESULTS',
            ERROR = 'ERROR'
        }
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
    const incidentMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const hospitalMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const userLocationMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
                
                // Auto-detect user location first
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userPos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            setUserLocation(userPos);
                            
                            const mapInstance = new google.maps.Map(mapRef.current!, {
                                center: userPos,
                                zoom: 13,
                                mapId: 'SAFEPAW_MAP_ID',
                                styles: [
                                    // Hide all POI labels
                                    {
                                        featureType: 'poi',
                                        elementType: 'labels',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    // Hide all POI icons (hotels, restaurants, etc.)
                                    {
                                        featureType: 'poi',
                                        elementType: 'all',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    // Hide business POIs
                                    {
                                        featureType: 'poi.business',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    // Hide attractions
                                    {
                                        featureType: 'poi.attraction',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    // Hide places of interest
                                    {
                                        featureType: 'poi.place_of_worship',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    {
                                        featureType: 'poi.school',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    {
                                        featureType: 'poi.sports_complex',
                                        stylers: [{ visibility: 'off' }]
                                    }
                                ],
                                mapTypeControl: true,
                                streetViewControl: false,
                                fullscreenControl: true,
                            });

                            setMap(mapInstance);
                            setIsLoading(false);
                            console.log('✅ MapComponent: Map instance created with user location');
                        },
                        (error) => {
                            console.warn('⚠️ Geolocation error:', error);
                            // Fall back to default center
                            const mapInstance = new google.maps.Map(mapRef.current!, {
                                center,
                                zoom,
                                mapId: 'SAFEPAW_MAP_ID',
                                styles: [
                                    {
                                        featureType: 'poi',
                                        elementType: 'labels',
                                        stylers: [{ visibility: 'off' }]
                                    },
                                    {
                                        featureType: 'poi.business',
                                        stylers: [{ visibility: 'off' }]
                                    }
                                ],
                                mapTypeControl: true,
                                streetViewControl: false,
                                fullscreenControl: true,
                            });

                            setMap(mapInstance);
                            setIsLoading(false);
                            console.log('✅ MapComponent: Map instance created with default center');
                        },
                        { timeout: 5000, enableHighAccuracy: true }
                    );
                } else {
                    // No geolocation support, use default center
                    const mapInstance = new google.maps.Map(mapRef.current!, {
                        center,
                        zoom,
                        mapId: 'SAFEPAW_MAP_ID',
                        styles: [
                            // Hide all POI labels
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            },
                            // Hide all POI icons (hotels, restaurants, etc.)
                            {
                                featureType: 'poi',
                                elementType: 'all',
                                stylers: [{ visibility: 'off' }]
                            },
                            // Hide business POIs
                            {
                                featureType: 'poi.business',
                                stylers: [{ visibility: 'off' }]
                            },
                            // Hide attractions
                            {
                                featureType: 'poi.attraction',
                                stylers: [{ visibility: 'off' }]
                            },
                            // Hide places of interest
                            {
                                featureType: 'poi.place_of_worship',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'poi.school',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'poi.sports_complex',
                                stylers: [{ visibility: 'off' }]
                            }
                        ],
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: true,
                    });

                    setMap(mapInstance);
                    setIsLoading(false);
                    console.log('✅ MapComponent: Map instance created with default center');
                }
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

    // Add incident markers to map (optimized with AdvancedMarkerElement)
    useEffect(() => {
        if (!map) return;

        // Check if AdvancedMarkerElement is available, otherwise fall back to Marker
        const useAdvancedMarkers = typeof google !== 'undefined' && 
                                   google.maps?.marker?.AdvancedMarkerElement;

        // Clear existing incident markers
        incidentMarkersRef.current.forEach(marker => {
            marker.map = null;
        });
        incidentMarkersRef.current = [];

        // Always show incidents

        console.log(`🗺️ Adding markers for ${incidents.length} incidents`);

        // Clear existing incident markers and info windows
        incidentMarkersRef.current.forEach(marker => {
            marker.map = null;
        });
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        incidentMarkersRef.current = [];

        if (incidents.length === 0) {
            console.log('⚠️ No incidents to display on map');
            return;
        }

        // Create new markers
        const newMarkers = incidents.map((incident, index) => {
            const severityColor = incident.severity === 'Severe' ? '#DC2626' :
                                 incident.severity === 'Moderate' ? '#F59E0B' : '#10B981';

            if (useAdvancedMarkers) {
                // Create custom dog icon marker for incidents
                const markerElement = document.createElement('div');
                markerElement.style.width = '40px';
                markerElement.style.height = '40px';
                markerElement.style.display = 'flex';
                markerElement.style.alignItems = 'center';
                markerElement.style.justifyContent = 'center';
                markerElement.style.backgroundColor = severityColor;
                markerElement.style.borderRadius = '50%';
                markerElement.style.border = '3px solid white';
                markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                markerElement.style.cursor = 'pointer';
                markerElement.style.transition = 'transform 0.2s';
                
                // Create SVG for dog icon
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '20');
                svg.setAttribute('height', '20');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'white');
                svg.setAttribute('stroke', 'white');
                svg.setAttribute('stroke-width', '2');
                svg.setAttribute('stroke-linecap', 'round');
                svg.setAttribute('stroke-linejoin', 'round');
                // Dog icon - simple circle with ears (dog head shape)
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', '12');
                circle.setAttribute('cy', '13');
                circle.setAttribute('r', '6');
                circle.setAttribute('fill', 'white');
                svg.appendChild(circle);
                // Ears
                const ear1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                ear1.setAttribute('cx', '8');
                ear1.setAttribute('cy', '10');
                ear1.setAttribute('rx', '2');
                ear1.setAttribute('ry', '3');
                ear1.setAttribute('fill', 'white');
                svg.appendChild(ear1);
                const ear2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                ear2.setAttribute('cx', '16');
                ear2.setAttribute('cy', '10');
                ear2.setAttribute('rx', '2');
                ear2.setAttribute('ry', '3');
                ear2.setAttribute('fill', 'white');
                svg.appendChild(ear2);
                // Eyes
                const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                eye1.setAttribute('cx', '10');
                eye1.setAttribute('cy', '12');
                eye1.setAttribute('r', '1');
                eye1.setAttribute('fill', severityColor);
                svg.appendChild(eye1);
                const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                eye2.setAttribute('cx', '14');
                eye2.setAttribute('cy', '12');
                eye2.setAttribute('r', '1');
                eye2.setAttribute('fill', severityColor);
                svg.appendChild(eye2);
                markerElement.appendChild(svg);
                
                markerElement.addEventListener('mouseenter', () => {
                    markerElement.style.transform = 'scale(1.1)';
                });
                markerElement.addEventListener('mouseleave', () => {
                    markerElement.style.transform = 'scale(1)';
                });

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: { lat: incident.lat, lng: incident.lng },
                    title: incident.location,
                    content: markerElement,
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

                // Add click listener - navigate to incident location and show info
                markerElement.addEventListener('click', () => {
                    // Center map on incident location
                    map.setCenter({ lat: incident.lat, lng: incident.lng });
                    map.setZoom(15);
                    
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

        incidentMarkersRef.current = newMarkers;
        console.log(`✅ Added ${newMarkers.length} incident markers to map`);
    }, [map, incidents, onMarkerClick]);

    // Search for nearby hospitals
    useEffect(() => {
        if (!map) {
            return;
        }

        const searchHospitals = () => {
            const center = map.getCenter();
            if (!center) return;

            const useAdvancedMarkers = typeof google !== 'undefined' && 
                                       google.maps?.marker?.AdvancedMarkerElement;

            // Use Places API to search for hospitals in India only (within 5km)
            const service = new google.maps.places.PlacesService(map);
            const request = {
                location: { lat: center.lat(), lng: center.lng() },
                radius: 5000, // 5km radius
                type: 'hospital',
                keyword: 'hospital emergency medical clinic',
                // Restrict to India (componentRestrictions doesn't work with nearbySearch, but we can filter results)
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    // Clear existing hospital markers
                    hospitalMarkersRef.current.forEach(marker => {
                        marker.map = null;
                    });
                    hospitalMarkersRef.current = [];

                    // Filter to only show hospitals in India (check address contains India/Indian cities)
                    const indiaKeywords = ['india', 'indian', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'in'];
                    const filteredResults = results.filter((place: any) => {
                        const address = (place.vicinity || place.formatted_address || '').toLowerCase();
                        const name = (place.name || '').toLowerCase();
                        // Include if address/name contains India keywords, or if no address specified (likely nearby in India)
                        return indiaKeywords.some(keyword => address.includes(keyword) || name.includes(keyword)) || !place.formatted_address;
                    });

                    const hospitalMarkers = filteredResults.slice(0, 15).map((place: any) => {
                        if (useAdvancedMarkers && place.geometry?.location) {
                            // Create custom hospital icon marker
                            const markerElement = document.createElement('div');
                            markerElement.style.width = '40px';
                            markerElement.style.height = '40px';
                            markerElement.style.display = 'flex';
                            markerElement.style.alignItems = 'center';
                            markerElement.style.justifyContent = 'center';
                            markerElement.style.backgroundColor = '#2563EB';
                            markerElement.style.borderRadius = '50%';
                            markerElement.style.border = '3px solid white';
                            markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                            markerElement.style.cursor = 'pointer';
                            markerElement.style.transition = 'transform 0.2s';
                            
                            // Create SVG for hospital/building icon
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('width', '20');
                            svg.setAttribute('height', '20');
                            svg.setAttribute('viewBox', '0 0 24 24');
                            svg.setAttribute('fill', 'white');
                            svg.setAttribute('stroke', 'white');
                            svg.setAttribute('stroke-width', '2');
                            svg.setAttribute('stroke-linecap', 'round');
                            svg.setAttribute('stroke-linejoin', 'round');
                            // Building/Hospital icon path
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z');
                            svg.appendChild(path);
                            markerElement.appendChild(svg);
                            
                            markerElement.addEventListener('mouseenter', () => {
                                markerElement.style.transform = 'scale(1.1)';
                            });
                            markerElement.addEventListener('mouseleave', () => {
                                markerElement.style.transform = 'scale(1)';
                            });

                            const marker = new google.maps.marker.AdvancedMarkerElement({
                                map,
                                position: {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng()
                                },
                                title: place.name,
                                content: markerElement,
                            });

                            const infoWindow = new google.maps.InfoWindow({
                                content: `
                                    <div style="padding: 8px; font-family: Inter, sans-serif; max-width: 250px;">
                                        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #2D2424;">
                                            ${place.name}
                                        </h3>
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                                            ${place.vicinity || place.formatted_address || 'Address not available'}
                                        </p>
                                        ${place.rating ? `
                                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                                                ⭐ ${place.rating} ${place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''}
                                            </p>
                                        ` : ''}
                                        ${place.formatted_phone_number ? `
                                            <p style="margin: 0; font-size: 12px; color: #2563EB;">
                                                📞 ${place.formatted_phone_number}
                                            </p>
                                        ` : ''}
                                    </div>
                                `,
                            });

                            markerElement.addEventListener('click', () => {
                                // Center map on hospital location
                                map.setCenter({
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng()
                                });
                                map.setZoom(15);
                                
                                infoWindowsRef.current.forEach(iw => iw.close());
                                infoWindow.open({
                                    anchor: marker,
                                    map,
                                });
                            });

                            infoWindowsRef.current.push(infoWindow);
                            return marker;
                        }
                        return null;
                    }).filter((m): m is google.maps.marker.AdvancedMarkerElement => m !== null);

                    hospitalMarkersRef.current = hospitalMarkers;
                    setHospitals(results);
                    console.log(`✅ Added ${hospitalMarkers.length} hospital markers to map`);
                } else {
                    console.warn('⚠️ Hospital search failed:', status);
                }
            });
        };

            // Search hospitals when map center changes (with debounce)
            const searchTimeout = setTimeout(searchHospitals, 500);
            return () => clearTimeout(searchTimeout);
        }, [map]);

    // Add user location marker
    useEffect(() => {
        if (!map || !userLocation) return;

        const useAdvancedMarkers = typeof google !== 'undefined' && 
                                   google.maps?.marker?.AdvancedMarkerElement;

        // Clear existing user location marker
        if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.map = null;
        }

        if (useAdvancedMarkers) {
            const userIcon = document.createElement('div');
            userIcon.style.width = '32px';
            userIcon.style.height = '32px';
            userIcon.style.borderRadius = '50%';
            userIcon.style.backgroundColor = '#2563EB';
            userIcon.style.border = '4px solid white';
            userIcon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            userIcon.style.cursor = 'pointer';

            const marker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: userLocation,
                title: 'Your Location',
                content: userIcon,
            });

            userLocationMarkerRef.current = marker;
        }
    }, [map, userLocation]);

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

            {/* Map Controls Overlay - Mobile Responsive */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-2 z-20">
                {/* Zoom Controls */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => map?.setZoom((map.getZoom() || 12) + 1)}
                        className="bg-white p-2 md:p-2.5 rounded-lg shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                        title="Zoom in"
                        aria-label="Zoom in"
                    >
                        <ZoomIn size={18} className="md:w-5 md:h-5 text-[#2D2424]" />
                    </button>
                    <button
                        onClick={() => map?.setZoom((map.getZoom() || 12) - 1)}
                        className="bg-white p-2 md:p-2.5 rounded-lg shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                        title="Zoom out"
                        aria-label="Zoom out"
                    >
                        <ZoomOut size={18} className="md:w-5 md:h-5 text-[#2D2424]" />
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
                                    setUserLocation(pos);
                                });
                            }
                        }}
                        className="bg-white p-2 md:p-2.5 rounded-lg shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                        title="Center on your location"
                        aria-label="My location"
                    >
                        <Navigation size={18} className="md:w-5 md:h-5 text-[#2563EB]" />
                    </button>
                </div>
            </div>

            {/* Legend - Mobile Responsive */}
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 flex flex-col gap-2 z-20 max-w-[calc(100%-80px)] md:max-w-none">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-full shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                            <span className="text-[#2D2424] font-medium">Severe</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-orange-500"></div>
                            <span className="text-[#2D2424] font-medium">Moderate</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                            <span className="text-[#2D2424] font-medium">Minor</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-500 flex items-center justify-center">
                                <Building2 size={12} className="md:w-4 md:h-4 text-white" />
                            </div>
                            <span className="text-[#2D2424] font-medium">Hospitals</span>
                        </div>
                    </div>
                </div>
                {userLocation && (
                    <div className="bg-blue-50/95 backdrop-blur-sm border border-blue-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-full shadow-lg">
                        <p className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                            <MapPin size={12} className="md:w-4 md:h-4" />
                            <span>Location detected</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapComponent;
export type { IncidentMarker, MapComponentProps };
