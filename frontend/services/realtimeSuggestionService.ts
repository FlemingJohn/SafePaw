import type { AISuggestion, RealtimeSuggestionRequest } from '../types/suggestion.types';

const FIREBASE_FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://127.0.0.1:5001/safepaw-1a9e5/us-central1';

/**
 * Fetch real-time AI suggestions from Cloud Function
 */
export async function fetchRealtimeSuggestions(
    request: RealtimeSuggestionRequest
): Promise<{ suggestions: AISuggestion[]; processingTime: number; cached: boolean }> {
    try {
        const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/getRealtimeSuggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch suggestions');
        }

        return {
            suggestions: data.suggestions || [],
            processingTime: data.processingTime || 0,
            cached: data.cached || false,
        };
    } catch (error: any) {
        console.error('Error fetching real-time suggestions:', error);
        throw error;
    }
}
