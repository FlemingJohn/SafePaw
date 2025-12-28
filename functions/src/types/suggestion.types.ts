export interface AISuggestion {
    id: string;
    type: 'safety' | 'priority' | 'resource' | 'similar' | 'guidance';
    title: string;
    message: string;
    confidence: number; // 0-1
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionable?: boolean;
    action?: {
        label: string;
        url?: string;
        phone?: string;
    };
}

export interface RealtimeSuggestionRequest {
    severity?: 'Minor' | 'Moderate' | 'Severe';
    location?: { lat: number; lng: number; address: string };
    dogType?: 'Stray' | 'Pet';
    rabiesConcern?: boolean;
    repeatOffender?: boolean;
    childrenAtRisk?: boolean;
    recentIncidents?: number;
}

export interface RealtimeSuggestionResponse {
    suggestions: AISuggestion[];
    processingTime: number;
    cached: boolean;
}
