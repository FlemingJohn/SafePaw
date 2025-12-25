import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    GeoPoint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export type Severity = 'Minor' | 'Moderate' | 'Severe';
export type DogType = 'Stray' | 'Pet' | 'Unknown';
export type IncidentStatus = 'Reported' | 'Under Review' | 'Action Taken' | 'Resolved';

export interface IncidentReport {
    id?: string;
    userId: string;
    userName: string;
    userPhone?: string;
    location: {
        address: string;
        coordinates: GeoPoint;
    };
    dogType: DogType;
    severity: Severity;
    description: string;
    photos: string[]; // URLs
    status: IncidentStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    reviewedBy?: string; // Government user ID
    actionTaken?: string;
    anonymous: boolean;

    // Enhanced fields - Time & Date
    incidentDateTime?: Timestamp;

    // Enhanced fields - Victim Information
    victimAge?: 'Child' | 'Teen' | 'Adult' | 'Elderly';
    injuryLocation?: string;
    medicalAttention?: boolean;
    hospitalName?: string;

    // Enhanced fields - Incident Context
    activity?: string;
    provocation?: 'Provoked' | 'Unprovoked' | 'Unknown';
    witnessPresent?: boolean;
    witnessContact?: string;

    // Enhanced fields - Priority Indicators
    rabiesConcern?: boolean;
    repeatOffender?: boolean;
    childrenAtRisk?: boolean;

    // Enhanced fields - Report Mode
    reportMode?: 'quick' | 'detailed';

    // AI-powered fields
    priority?: number; // 1-10 scale
    aiRecommendations?: AIRecommendation[];
    assignedResources?: AssignedResource[];
    escalationStatus?: 'normal' | 'escalated' | 'auto_contacted';
    lastActionTimestamp?: Timestamp;
    escalatedAt?: Timestamp;
    autoContactedAgents?: string[];
}

// AI Recommendation interface
export interface AIRecommendation {
    id: string;
    agentType: 'priority' | 'action' | 'resource';
    recommendation: string;
    confidence: number;
    timestamp: Timestamp;
    status: 'pending' | 'approved' | 'overridden' | 'executed';
    overrideReason?: string;
}

// Assigned Resource interface
export interface AssignedResource {
    id: string;
    type: 'rescue_team' | 'veterinarian' | 'animal_control';
    name: string;
    assignedAt: Timestamp;
    status: 'assigned' | 'en_route' | 'on_site' | 'completed';
}

/**
 * Submit a new incident report
 * This will:
 * 1. Save to Firestore
 * 2. Trigger AI agents via Cloud Function
 * 3. Make it visible in Government portal
 */
export const submitIncident = async (
    incident: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'location' | 'photos'> & {
        location: { address: string; lat: number; lng: number };
        photos: File[];
    }
): Promise<string> => {
    try {
        // Upload photos to Firebase Storage
        const photoURLs: string[] = [];
        for (const photo of incident.photos) {
            const photoRef = ref(storage, `incidents/${incident.userId}/${Date.now()}_${photo.name}`);
            await uploadBytes(photoRef, photo);
            const url = await getDownloadURL(photoRef);
            photoURLs.push(url);
        }

        // Create incident document with all enhanced fields
        const incidentData: Omit<IncidentReport, 'id'> = {
            userId: incident.userId,
            userName: incident.userName,
            userPhone: incident.userPhone,
            location: {
                address: incident.location.address,
                coordinates: new GeoPoint(incident.location.lat, incident.location.lng),
            },
            dogType: incident.dogType,
            severity: incident.severity,
            description: incident.description,
            photos: photoURLs,
            anonymous: incident.anonymous,
            status: 'Reported',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),

            // Enhanced fields - Time & Date
            incidentDateTime: incident.incidentDateTime,

            // Enhanced fields - Victim Information
            victimAge: incident.victimAge,
            injuryLocation: incident.injuryLocation,
            medicalAttention: incident.medicalAttention,
            hospitalName: incident.hospitalName,

            // Enhanced fields - Incident Context
            activity: incident.activity,
            provocation: incident.provocation,
            witnessPresent: incident.witnessPresent,
            witnessContact: incident.witnessContact,

            // Enhanced fields - Priority Indicators
            rabiesConcern: incident.rabiesConcern,
            repeatOffender: incident.repeatOffender,
            childrenAtRisk: incident.childrenAtRisk,

            // Enhanced fields - Report Mode
            reportMode: incident.reportMode,
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'incidents'), incidentData);
        console.log('Incident saved to Firestore:', docRef.id);

        // Trigger AI processing via Cloud Function
        try {
            const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/safepaw-27023/us-central1';
            const response = await fetch(`${functionsUrl}/processIncidentWithAI`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ incidentId: docRef.id }),
            });

            if (response.ok) {
                console.log('AI processing triggered successfully');
            } else {
                console.warn('AI processing failed, but incident was saved');
            }
        } catch (aiError) {
            console.warn('Could not trigger AI processing:', aiError);
            // Don't fail the whole submission if AI fails
        }

        return docRef.id;
    } catch (error: any) {
        console.error('Error submitting incident:', error);
        throw new Error(`Failed to submit incident: ${error.message}`);
    }
};

// Get All Incidents (for map/heatmap)
export const getAllIncidents = async (): Promise<IncidentReport[]> => {
    try {
        const q = query(
            collection(db, 'incidents'),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));
    } catch (error: any) {
        throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
};

// Get User's Reports
export const getUserReports = async (userId: string): Promise<IncidentReport[]> => {
    try {
        const q = query(
            collection(db, 'incidents'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));
    } catch (error: any) {
        throw new Error(`Failed to fetch user reports: ${error.message}`);
    }
};

// Get Incident by ID
export const getIncidentById = async (incidentId: string): Promise<IncidentReport | null> => {
    try {
        const docRef = doc(db, 'incidents', incidentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as IncidentReport;
        }
        return null;
    } catch (error: any) {
        throw new Error(`Failed to fetch incident: ${error.message}`);
    }
};

// Update Incident Status (Government only)
export const updateIncidentStatus = async (
    incidentId: string,
    status: IncidentStatus,
    reviewedBy: string,
    actionTaken?: string
): Promise<void> => {
    try {
        const docRef = doc(db, 'incidents', incidentId);
        await updateDoc(docRef, {
            status,
            reviewedBy,
            actionTaken: actionTaken || '',
            updatedAt: Timestamp.now()
        });
    } catch (error: any) {
        throw new Error(`Failed to update incident: ${error.message}`);
    }
};

// Delete Incident
export const deleteIncident = async (incidentId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'incidents', incidentId));
    } catch (error: any) {
        throw new Error(`Failed to delete incident: ${error.message}`);
    }
};

// Get Incidents by Status (for Government Dashboard)
export const getIncidentsByStatus = async (status: IncidentStatus): Promise<IncidentReport[]> => {
    try {
        const q = query(
            collection(db, 'incidents'),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));
    } catch (error: any) {
        throw new Error(`Failed to fetch incidents by status: ${error.message}`);
    }
};

// Get Incidents by Severity
export const getIncidentsBySeverity = async (severity: Severity): Promise<IncidentReport[]> => {
    try {
        const q = query(
            collection(db, 'incidents'),
            where('severity', '==', severity),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));
    } catch (error: any) {
        throw new Error(`Failed to fetch incidents by severity: ${error.message}`);
    }
};

/**
 * Check for recent incidents near a location
 * Used for real-time validation and duplicate detection
 */
export const checkRecentIncidents = async (
    lat: number,
    lng: number,
    radiusKm: number = 0.5,
    hoursBack: number = 48
): Promise<IncidentReport[]> => {
    try {
        // Calculate time threshold
        const timeThreshold = new Date();
        timeThreshold.setHours(timeThreshold.getHours() - hoursBack);

        // Note: Firestore doesn't support geospatial queries natively
        // We'll fetch recent incidents and filter by distance client-side
        const q = query(
            collection(db, 'incidents'),
            where('createdAt', '>=', Timestamp.fromDate(timeThreshold)),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        const incidents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));

        // Filter by distance (Haversine formula)
        const nearbyIncidents = incidents.filter(incident => {
            const distance = calculateDistance(
                lat,
                lng,
                incident.location.coordinates.latitude,
                incident.location.coordinates.longitude
            );
            return distance <= radiusKm;
        });

        return nearbyIncidents;
    } catch (error: any) {
        console.error('Error checking recent incidents:', error);
        return []; // Return empty array on error to not block submission
    }
};

/**
 * Check if user has already reported from same location recently
 * Helps prevent duplicate reports
 */
export const checkDuplicateReport = async (
    userId: string,
    lat: number,
    lng: number,
    hoursBack: number = 24
): Promise<{ isDuplicate: boolean; existingReport?: IncidentReport }> => {
    try {
        const timeThreshold = new Date();
        timeThreshold.setHours(timeThreshold.getHours() - hoursBack);

        const q = query(
            collection(db, 'incidents'),
            where('userId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(timeThreshold)),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const userReports = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as IncidentReport));

        // Check if any report is from same location (within 100m)
        for (const report of userReports) {
            const distance = calculateDistance(
                lat,
                lng,
                report.location.coordinates.latitude,
                report.location.coordinates.longitude
            );

            if (distance <= 0.1) { // 100 meters
                return { isDuplicate: true, existingReport: report };
            }
        }

        return { isDuplicate: false };
    } catch (error: any) {
        console.error('Error checking duplicate:', error);
        return { isDuplicate: false }; // Don't block on error
    }
};

/**
 * Get nearby hospitals (mock data for now)
 * In production, integrate with Google Places API or maintain hospital database
 */
export interface Hospital {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    address: string;
    phone: string;
    distance?: number; // in km
    vaccineAvailable: boolean;
}

export const getNearbyHospitals = async (
    lat: number,
    lng: number,
    radiusKm: number = 5
): Promise<Hospital[]> => {
    // Mock hospital data - In production, fetch from Firestore or external API
    const mockHospitals: Hospital[] = [
        {
            id: '1',
            name: 'City General Hospital',
            location: { lat: lat + 0.01, lng: lng + 0.01 },
            address: '123 Main Street',
            phone: '+91 98765 43210',
            vaccineAvailable: true
        },
        {
            id: '2',
            name: 'SafeCare Medical Center',
            location: { lat: lat + 0.02, lng: lng - 0.01 },
            address: '456 Health Avenue',
            phone: '+91 98765 43211',
            vaccineAvailable: true
        },
        {
            id: '3',
            name: 'Metro Health Clinic',
            location: { lat: lat - 0.015, lng: lng + 0.02 },
            address: '789 Care Road',
            phone: '+91 98765 43212',
            vaccineAvailable: false
        }
    ];

    // Calculate distances and sort
    const hospitalsWithDistance = mockHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(lat, lng, hospital.location.lat, hospital.location.lng)
    })).filter(h => h.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

    return hospitalsWithDistance;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

