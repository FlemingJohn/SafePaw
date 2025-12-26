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
            userPhone: incident.userPhone || null,
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
            incidentDateTime: incident.incidentDateTime || null,

            // Enhanced fields - Victim Information
            victimAge: incident.victimAge || null,
            injuryLocation: incident.injuryLocation || null,
            medicalAttention: incident.medicalAttention ?? null,
            hospitalName: incident.hospitalName || null,

            // Enhanced fields - Incident Context
            activity: incident.activity || null,
            provocation: incident.provocation || null,
            witnessPresent: incident.witnessPresent ?? null,
            witnessContact: incident.witnessContact || null,

            // Enhanced fields - Priority Indicators
            rabiesConcern: incident.rabiesConcern ?? null,
            repeatOffender: incident.repeatOffender ?? null,
            childrenAtRisk: incident.childrenAtRisk ?? null,

            // Enhanced fields - Report Mode
            reportMode: incident.reportMode || 'quick',
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
        console.error('Firestore error fetching incidents:', error);
        const msg = error?.message || String(error);
        const match = msg.match(/https?:\/\/[^\s]+/);
        if (msg.includes('requires an index') && match) {
            throw new Error(`Failed to fetch incidents: query requires an index. Create it here: ${match[0]}`);
        }
        throw new Error(`Failed to fetch incidents: ${msg}`);
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
        console.error('Firestore error fetching user reports:', error);
        const umsg = error?.message || String(error);
        const umatch = umsg.match(/https?:\/\/[^\s]+/);
        if (umsg.includes('requires an index') && umatch) {
            throw new Error(`Failed to fetch user reports: query requires an index. Create it here: ${umatch[0]}`);
        }
        throw new Error(`Failed to fetch user reports: ${umsg}`);
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
        console.error('Firestore error fetching incidents by status:', error);
        const smsg = error?.message || String(error);
        const smatch = smsg.match(/https?:\/\/[^\s]+/);
        if (smsg.includes('requires an index') && smatch) {
            throw new Error(`Failed to fetch incidents by status: query requires an index. Create it here: ${smatch[0]}`);
        }
        throw new Error(`Failed to fetch incidents by status: ${smsg}`);
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
        console.error('Firestore error fetching incidents by severity:', error);
        const vmsg = error?.message || String(error);
        const vmatch = vmsg.match(/https?:\/\/[^\s]+/);
        if (vmsg.includes('requires an index') && vmatch) {
            throw new Error(`Failed to fetch incidents by severity: query requires an index. Create it here: ${vmatch[0]}`);
        }
        throw new Error(`Failed to fetch incidents by severity: ${vmsg}`);
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
        const msg = error?.message || String(error);
        const match = msg.match(/https?:\/\/[^\s]+/);
        if (msg.includes('requires an index') && match) {
            console.error('Firestore query requires an index. Create it here:', match[0]);
        }
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
        const msg = error?.message || String(error);
        const match = msg.match(/https?:\/\/[^\s]+/);
        if (msg.includes('requires an index') && match) {
            console.error('Firestore query requires an index. Create it here:', match[0]);
        }
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
}

export const getNearbyHospitals = async (
    lat: number,
    lng: number,
    radiusKm: number = 50 // Increased radius to show more hospitals
): Promise<Hospital[]> => {
    // Real major hospitals across South India with rabies treatment facilities
    const southIndiaHospitals: Hospital[] = [
        // Chennai Hospitals
        {
            id: 'chennai-1',
            name: 'Government General Hospital, Chennai',
            location: { lat: 13.0827, lng: 80.2707 },
            address: 'EVR Periyar Salai, Park Town, Chennai - 600003',
            phone: '+91 44 2536 1000'
        },
        {
            id: 'chennai-2',
            name: 'Apollo Hospital, Chennai',
            location: { lat: 13.0569, lng: 80.2433 },
            address: '21, Greams Lane, Off Greams Road, Chennai - 600006',
            phone: '+91 44 2829 3333'
        },
        {
            id: 'chennai-3',
            name: 'Stanley Medical College Hospital',
            location: { lat: 13.0732, lng: 80.2609 },
            address: 'No.1, Old Jail Road, Chennai - 600001',
            phone: '+91 44 2528 2981'
        },
        {
            id: 'chennai-4',
            name: 'Rajiv Gandhi Government General Hospital',
            location: { lat: 13.0091, lng: 80.2095 },
            address: 'EVR Salai, Poonamallee High Road, Chennai - 600003',
            phone: '+91 44 2535 6356'
        },

        // Bangalore Hospitals
        {
            id: 'bangalore-1',
            name: 'Victoria Hospital, Bangalore',
            location: { lat: 12.9698, lng: 77.5981 },
            address: 'Fort, Chamarajpet, Bangalore - 560002',
            phone: '+91 80 2670 1150'
        },
        {
            id: 'bangalore-2',
            name: 'Bowring and Lady Curzon Hospital',
            location: { lat: 12.9866, lng: 77.6101 },
            address: 'Shivaji Nagar, Bangalore - 560001',
            phone: '+91 80 2286 4006'
        },
        {
            id: 'bangalore-3',
            name: 'KC General Hospital',
            location: { lat: 12.9592, lng: 77.5826 },
            address: 'Malleswaram, Bangalore - 560003',
            phone: '+91 80 2334 0476'
        },
        {
            id: 'bangalore-4',
            name: 'Manipal Hospital, Bangalore',
            location: { lat: 12.9850, lng: 77.5982 },
            address: '98, HAL Old Airport Road, Bangalore - 560017',
            phone: '+91 80 2502 4444'
        },

        // Hyderabad Hospitals
        {
            id: 'hyderabad-1',
            name: 'Gandhi Hospital, Hyderabad',
            location: { lat: 17.4485, lng: 78.4861 },
            address: 'Musheerabad, Hyderabad - 500020',
            phone: '+91 40 2774 0146'
        },
        {
            id: 'hyderabad-2',
            name: 'Osmania General Hospital',
            location: { lat: 17.3753, lng: 78.4815 },
            address: 'Afzal Gunj, Hyderabad - 500012',
            phone: '+91 40 2461 1103'
        },
        {
            id: 'hyderabad-3',
            name: 'Yashoda Hospital, Hyderabad',
            location: { lat: 17.4239, lng: 78.4738 },
            address: 'Somajiguda, Hyderabad - 500082',
            phone: '+91 40 2344 4444'
        },

        // Coimbatore Hospitals
        {
            id: 'coimbatore-1',
            name: 'Coimbatore Medical College Hospital',
            location: { lat: 11.0015, lng: 76.9662 },
            address: 'Avinashi Road, Coimbatore - 641014',
            phone: '+91 422 222 0407'
        },
        {
            id: 'coimbatore-2',
            name: 'PSG Hospital, Coimbatore',
            location: { lat: 11.0221, lng: 76.9350 },
            address: 'Peelamedu, Coimbatore - 641004',
            phone: '+91 422 257 1212'
        },

        // Kochi Hospitals
        {
            id: 'kochi-1',
            name: 'Ernakulam General Hospital',
            location: { lat: 9.9812, lng: 76.2838 },
            address: 'NH Bypass Road, Palarivattom, Kochi - 682025',
            phone: '+91 484 251 8200'
        },
        {
            id: 'kochi-2',
            name: 'Amrita Institute of Medical Sciences',
            location: { lat: 10.0410, lng: 76.3369 },
            address: 'Ponekkara P.O, Kochi - 682041',
            phone: '+91 484 280 1234'
        },

        // Madurai Hospitals
        {
            id: 'madurai-1',
            name: 'Government Rajaji Hospital, Madurai',
            location: { lat: 9.9252, lng: 78.1198 },
            address: 'Panagal Road, Madurai - 625020',
            phone: '+91 452 253 3333'
        },

        // Vijayawada Hospitals
        {
            id: 'vijayawada-1',
            name: 'Government General Hospital, Vijayawada',
            location: { lat: 16.5062, lng: 80.6480 },
            address: 'DNo. 29-26-87, Gunadala, Vijayawada - 520004',
            phone: '+91 866 257 8333'
        },

        // Mangalore Hospitals
        {
            id: 'mangalore-1',
            name: 'KMC Hospital, Mangalore',
            location: { lat: 12.9141, lng: 74.8560 },
            address: 'Ambedkar Circle, Mangalore - 575001',
            phone: '+91 824 242 1000'
        },
        {
            id: 'mangalore-2',
            name: 'Wenlock District Hospital',
            location: { lat: 12.8786, lng: 74.8433 },
            address: 'Hampankatta Road, Mangalore - 575001',
            phone: '+91 824 244 5252'
        }
    ];

    // Calculate distances and filter by radius
    const hospitalsWithDistance = southIndiaHospitals.map(hospital => ({
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

