// AI Service - API client for multi-agent Cloud Functions

const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/safepaw-b4f5d/us-central1';

export interface AIAnalysisResult {
    success: boolean;
    incidentId: string;
    result: {
        priority?: {
            score: number;
            urgencyLevel: string;
            reasoning: string;
        };
        actions?: Array<{
            action: string;
            priority: string;
            estimatedTime: string;
        }>;
        resources?: Array<{
            resourceId: string;
            type: string;
            name: string;
            distance: string;
        }>;
        reasoning: string;
    };
    message: string;
}

export interface ContactResult {
    success: boolean;
    incidentId: string;
    contacted: number;
    failed: number;
    message: string;
}

/**
 * Trigger AI analysis for an incident
 */
export const triggerAIAnalysis = async (incidentId: string): Promise<AIAnalysisResult> => {
    try {
        const response = await fetch(`${FUNCTIONS_URL}/processIncidentWithAI`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ incidentId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error triggering AI analysis:', error);
        throw new Error(`Failed to trigger AI analysis: ${error.message}`);
    }
};

/**
 * Manually trigger government contact for escalated incident
 */
export const manualEscalation = async (incidentId: string): Promise<ContactResult> => {
    try {
        const response = await fetch(`${FUNCTIONS_URL}/autoContactGovernment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ incidentId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error triggering manual escalation:', error);
        throw new Error(`Failed to contact government agents: ${error.message}`);
    }
};

/**
 * Approve an AI recommendation
 */
export const approveAIAction = async (
    incidentId: string,
    recommendationId: string
): Promise<void> => {
    try {
        // Update recommendation status in Firestore
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');

        const incidentRef = doc(db, 'incidents', incidentId);

        // This is a simplified version - in production, you'd update the specific recommendation
        await updateDoc(incidentRef, {
            [`aiRecommendations`]: arrayUnion({
                id: recommendationId,
                status: 'approved',
                approvedAt: new Date(),
            }),
            updatedAt: new Date(),
        });

        console.log(`Approved recommendation ${recommendationId} for incident ${incidentId}`);
    } catch (error: any) {
        console.error('Error approving AI action:', error);
        throw new Error(`Failed to approve action: ${error.message}`);
    }
};

/**
 * Override an AI recommendation with reason
 */
export const overrideAIAction = async (
    incidentId: string,
    recommendationId: string,
    reason: string
): Promise<void> => {
    try {
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');

        const incidentRef = doc(db, 'incidents', incidentId);

        await updateDoc(incidentRef, {
            [`aiRecommendations`]: arrayUnion({
                id: recommendationId,
                status: 'overridden',
                overrideReason: reason,
                overriddenAt: new Date(),
            }),
            updatedAt: new Date(),
        });

        console.log(`Overridden recommendation ${recommendationId} for incident ${incidentId}`);
    } catch (error: any) {
        console.error('Error overriding AI action:', error);
        throw new Error(`Failed to override action: ${error.message}`);
    }
};
