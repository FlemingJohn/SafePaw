import { getFirestore } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import type { AISuggestion, RealtimeSuggestionRequest } from '../types/suggestion.types';
import { generateId } from '../utils/helpers';

const db = getFirestore();

// Simple in-memory cache for common scenarios
const suggestionCache = new Map<string, { suggestions: AISuggestion[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from request
 */
function getCacheKey(request: RealtimeSuggestionRequest): string {
    const { severity, rabiesConcern, repeatOffender, childrenAtRisk, recentIncidents } = request;
    return `${severity || 'none'}_${rabiesConcern}_${repeatOffender}_${childrenAtRisk}_${recentIncidents || 0}`;
}

/**
 * Generate real-time AI suggestions based on form state
 */
export async function generateRealtimeSuggestions(
    ai: Genkit,
    request: RealtimeSuggestionRequest
): Promise<{ suggestions: AISuggestion[]; cached: boolean }> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = getCacheKey(request);
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('✅ Returning cached suggestions');
        return { suggestions: cached.suggestions, cached: true };
    }

    const suggestions: AISuggestion[] = [];

    // 1. SAFETY ALERTS - Based on severity
    if (request.severity === 'Severe') {
        suggestions.push({
            id: generateId('safety'),
            type: 'safety',
            title: '🚨 Severe Bite Detected - Immediate Action Required',
            message: 'Seek medical attention within 24 hours for rabies vaccine. Wash wound with soap and water for 15 minutes immediately.',
            confidence: 0.95,
            priority: 'critical',
            actionable: true,
            action: {
                label: 'Find Nearest Hospital',
                url: '#emergency'
            }
        });
    } else if (request.severity === 'Moderate') {
        suggestions.push({
            id: generateId('safety'),
            type: 'safety',
            title: '⚠️ Medical Attention Recommended',
            message: 'Consider visiting a doctor for wound assessment and tetanus shot if needed. Monitor for signs of infection.',
            confidence: 0.85,
            priority: 'high',
            actionable: false
        });
    }

    // 2. PRIORITY ALERTS - Based on risk indicators
    if (request.rabiesConcern) {
        suggestions.push({
            id: generateId('priority'),
            type: 'priority',
            title: '🔴 CRITICAL: Rabies Concern',
            message: 'This is a high-priority incident. Rabies is fatal if untreated. Immediate medical attention and animal control notification required.',
            confidence: 0.98,
            priority: 'critical',
            actionable: true,
            action: {
                label: 'Emergency Contacts',
                phone: '108'
            }
        });
    }

    if (request.childrenAtRisk) {
        suggestions.push({
            id: generateId('priority'),
            type: 'priority',
            title: '👶 Children at Risk Alert',
            message: 'Incident near school/playground area. This will be escalated for immediate action to protect children in the vicinity.',
            confidence: 0.90,
            priority: 'high',
            actionable: false
        });
    }

    if (request.repeatOffender) {
        suggestions.push({
            id: generateId('priority'),
            type: 'priority',
            title: '🔁 Repeat Offender Detected',
            message: 'This dog has been reported before. Animal control will be notified for immediate containment and assessment.',
            confidence: 0.88,
            priority: 'high',
            actionable: false
        });
    }

    // 3. SIMILAR INCIDENTS - Based on location and recent reports
    if (request.recentIncidents && request.recentIncidents > 0) {
        const incidentWord = request.recentIncidents === 1 ? 'incident' : 'incidents';
        const priority = request.recentIncidents >= 3 ? 'high' : 'medium';

        suggestions.push({
            id: generateId('similar'),
            type: 'similar',
            title: `📊 ${request.recentIncidents} Recent ${incidentWord.charAt(0).toUpperCase() + incidentWord.slice(1)} in Area`,
            message: `${request.recentIncidents} ${incidentWord} reported in this area in the last 48 hours. This area may require increased monitoring.`,
            confidence: 0.92,
            priority: priority as 'high' | 'medium',
            actionable: false
        });
    }

    // 4. RESOURCE RECOMMENDATIONS - Based on location
    if (request.location && request.severity !== 'Minor') {
        suggestions.push({
            id: generateId('resource'),
            type: 'resource',
            title: '🏥 Nearby Medical Resources',
            message: 'Hospitals with rabies vaccine availability have been identified near your location. Check the list below the form.',
            confidence: 0.85,
            priority: 'medium',
            actionable: false
        });
    }

    // 5. GUIDANCE TIPS - Based on form completeness
    if (request.severity && !request.location) {
        suggestions.push({
            id: generateId('guidance'),
            type: 'guidance',
            title: '💡 Tip: Add Location for Better Response',
            message: 'Detecting your location helps us find nearby hospitals and identify high-risk areas. Click the location button to auto-detect.',
            confidence: 0.75,
            priority: 'low',
            actionable: false
        });
    }

    // 6. DOG TYPE SPECIFIC GUIDANCE
    if (request.dogType === 'Stray' && request.severity !== 'Minor') {
        suggestions.push({
            id: generateId('guidance'),
            type: 'guidance',
            title: '🐕 Stray Dog Protocol',
            message: 'Stray dog incidents are prioritized for animal control intervention. The dog will be located and assessed for rabies risk.',
            confidence: 0.80,
            priority: 'medium',
            actionable: false
        });
    }

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Cache the results
    suggestionCache.set(cacheKey, {
        suggestions,
        timestamp: Date.now()
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Generated ${suggestions.length} suggestions in ${processingTime}ms`);

    return { suggestions, cached: false };
}

/**
 * Get recent incidents count for a location
 */
export async function getRecentIncidentsCount(
    lat: number,
    lng: number,
    radiusKm: number = 0.5,
    hoursBack: number = 48
): Promise<number> {
    try {
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

        // Query incidents in the area
        const incidentsRef = db.collection('incidents');
        const snapshot = await incidentsRef
            .where('createdAt', '>=', cutoffTime)
            .get();

        // Filter by distance (simple approximation)
        let count = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.location?.coordinates) {
                const incidentLat = data.location.coordinates._latitude || data.location.coordinates.latitude;
                const incidentLng = data.location.coordinates._longitude || data.location.coordinates.longitude;

                // Simple distance check (rough approximation)
                const latDiff = Math.abs(lat - incidentLat);
                const lngDiff = Math.abs(lng - incidentLng);
                const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                // Rough conversion: 1 degree ≈ 111 km
                if (distance * 111 <= radiusKm) {
                    count++;
                }
            }
        });

        return count;
    } catch (error) {
        console.error('Error getting recent incidents count:', error);
        return 0;
    }
}
