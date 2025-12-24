import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { genkit } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Firebase Admin
initializeApp();

// Initialize Genkit with Google AI (Vertex AI)
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

            // Use Genkit to call Gemini with Google Maps grounding
            const result = await ai.generate({
                model: 'googleai/gemini-2.0-flash-exp',
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

            // Extract grounding metadata (Google Maps links)
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

            const mapLinks = groundingChunks
                .filter((chunk: any) => chunk.web?.uri)
                .map((chunk: any) => ({
                    title: chunk.web.title || 'Location',
                    uri: chunk.web.uri,
                }));

            res.json({
                text: result.text || 'No results found',
                mapLinks,
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
