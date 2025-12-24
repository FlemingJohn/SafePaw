import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Firebase Admin
initializeApp();

// Initialize Genkit with Google AI
const ai = genkit({
    plugins: [googleAI()],
});

// Define the hospital search function
export const searchNearbyHospitals = onRequest(
    { cors: true },
    async (req, res) => {
        try {
            const { query, latitude, longitude } = req.body;

            if (!latitude || !longitude) {
                res.status(400).json({ error: 'Location coordinates required' });
                return;
            }

            // Use Genkit to call Gemini with location context
            const result = await ai.generate({
                model: googleAI.model('gemini-1.5-flash'),
                prompt: `Find ${query || 'hospitals with rabies vaccine'} near coordinates ${latitude}, ${longitude}. 
        
        Provide:
        1. Hospital name and full address
        2. Distance from location
        3. Whether they have rabies vaccine (24/7 availability)
        4. Contact phone number
        5. Emergency services availability
        
        Format as a clear, structured list with the most relevant hospitals first.`,
                config: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                },
            });

            // Extract text response
            const responseText = result.text || 'No results found';

            res.json({
                text: responseText,
                mapLinks: [], // Google Maps grounding will be added when available
                success: true,
            });
        } catch (error: any) {
            console.error('Hospital search error:', error);
            res.status(500).json({
                error: 'Failed to search hospitals',
                message: error.message,
                success: false,
            });
        }
    }
);
