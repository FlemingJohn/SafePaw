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

// Submit Incident Report
export const submitIncidentReport = async (
    userId: string,
    userName: string,
    data: {
        location: { address: string; lat: number; lng: number };
        dogType: DogType;
        severity: Severity;
        description: string;
        photos: File[];
        anonymous: boolean;
    }
): Promise<string> => {
    try {
        // Upload photos to Firebase Storage
        const photoURLs: string[] = [];
        for (const photo of data.photos) {
            const photoRef = ref(storage, `incidents/${userId}/${Date.now()}_${photo.name}`);
            await uploadBytes(photoRef, photo);
            const url = await getDownloadURL(photoRef);
            photoURLs.push(url);
        }

        // Create incident document
        const incidentData: Omit<IncidentReport, 'id'> = {
            userId: data.anonymous ? 'anonymous' : userId,
            userName: data.anonymous ? 'Anonymous' : userName,
            location: {
                address: data.location.address,
                coordinates: new GeoPoint(data.location.lat, data.location.lng)
            },
            dogType: data.dogType,
            severity: data.severity,
            description: data.description,
            photos: photoURLs,
            status: 'Reported',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            anonymous: data.anonymous
        };

        const docRef = await addDoc(collection(db, 'incidents'), incidentData);
        return docRef.id;
    } catch (error: any) {
        throw new Error(`Failed to submit report: ${error.message}`);
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
