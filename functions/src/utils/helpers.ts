import { getFirestore } from 'firebase-admin/firestore';

/**
 * Get Firestore instance (lazy initialization)
 * This prevents initialization order issues
 */
function getDb() {
    return getFirestore();
}

// ============================================
// PRIORITY CALCULATION
// ============================================

/**
 * Calculate priority score based on multiple factors
 */
export function calculatePriorityScore(
    severity: 'Minor' | 'Moderate' | 'Severe',
    locationRisk: number,
    timeUrgency: number,
    resourceAvailability: number
): number {
    const severityWeight = severity === 'Severe' ? 3 : severity === 'Moderate' ? 2 : 1;
    const priority = (severityWeight * 4) + (locationRisk * 3) + (timeUrgency * 2) + (resourceAvailability * 1);
    return Math.min(10, Math.max(1, priority));
}

/**
 * Calculate time urgency based on incident age
 */
export function calculateTimeUrgency(createdAt: Date): number {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) return 3; // Critical - over 1 day old
    if (hoursSinceCreation > 12) return 2; // Urgent - over 12 hours
    return 1; // Standard - recent
}

// ============================================
// INCIDENT HELPERS
// ============================================

/**
 * Check if incident is delayed (>24 hours with no action)
 */
export async function isIncidentDelayed(incidentId: string): Promise<boolean> {
    const incidentRef = getDb().collection('incidents').doc(incidentId);
    const incident = await incidentRef.get();

    if (!incident.exists) return false;

    const data = incident.data();
    const lastAction = data?.lastActionTimestamp?.toDate() || data?.createdAt?.toDate();

    if (!lastAction) return false;

    const hoursSinceAction = (Date.now() - lastAction.getTime()) / (1000 * 60 * 60);
    return hoursSinceAction > 24;
}

/**
 * Calculate hours since last action
 */
export function calculateHoursSinceAction(lastActionDate: Date): number {
    return Math.round((Date.now() - lastActionDate.getTime()) / (1000 * 60 * 60));
}

// ============================================
// RESOURCE HELPERS
// ============================================

/**
 * Get available government agents in jurisdiction
 */
export async function getAvailableAgents(location?: any): Promise<any[]> {
    const agentsRef = getDb().collection('governmentAgents');
    const snapshot = await agentsRef
        .where('availability', '==', 'on_duty')
        .get();

    // TODO: Filter by jurisdiction proximity to location
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get available government resources
 */
export async function getAvailableResources(
    types?: string[],
    limit: number = 5
): Promise<any[]> {
    const resourcesRef = getDb().collection('governmentResources');
    let query = resourcesRef.where('availability', '==', 'available');

    if (types && types.length > 0) {
        query = query.where('type', 'in', types);
    }

    const snapshot = await query.limit(limit).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format duration in human-readable format
 */
export function formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days} days ${remainingHours} hours` : `${days} days`;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
