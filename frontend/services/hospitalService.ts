// Hospital Search Service using Firebase Functions + Vertex AI

export interface HospitalSearchRequest {
    query?: string;
    latitude: number;
    longitude: number;
}

export interface MapLink {
    title: string;
    uri: string;
}

export interface HospitalSearchResponse {
    text: string;
    mapLinks: MapLink[];
    success: boolean;
    error?: string;
}

export const searchNearbyHospitals = async (
    request: HospitalSearchRequest
): Promise<HospitalSearchResponse> => {
    try {
        const response = await fetch(
            'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/searchNearbyHospitals',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: HospitalSearchResponse = await response.json();
        return data;
    } catch (error: any) {
        console.error('Hospital search error:', error);
        return {
            text: 'Failed to search hospitals. Please try again.',
            mapLinks: [],
            success: false,
            error: error.message,
        };
    }
};
