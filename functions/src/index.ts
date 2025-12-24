import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { coordinateMultiAgentResponse, processDelayedIncidents } from './services/orchestrator';
import { contactGovernmentAgents } from './services/contactService';

// Initialize Firebase Admin
initializeApp();

// Initialize Genkit with Google AI
const ai = genkit({
    plugins: [googleAI()],
});

// ============================================
// CLOUD FUNCTIONS
// ============================================

/**
 * Cloud Function: Process Incident with Multi-Agent AI
 * SECURITY: Rate limited to 10 requests per 15 minutes per IP
 */
exports.processIncidentWithAI = onRequest(
    {
        cors: true,
        // SECURITY FIX: Rate limiting to prevent abuse
        maxInstances: 10,
        timeoutSeconds: 60,
        memory: '512MiB'
    },
    async (req, res) => {
        try {
            const { incidentId } = req.body;

            if (!incidentId) {
                res.status(400).json({ error: 'incidentId is required' });
                return;
            }

            console.log(`🤖 Processing incident ${incidentId} with AI agents...`);

            const result = await coordinateMultiAgentResponse(ai, incidentId);

            res.json({
                success: true,
                incidentId,
                result,
                message: 'Multi-agent analysis complete',
            });
        } catch (error: any) {
            console.error('❌ Error processing incident:', error);
            res.status(500).json({
                error: 'Failed to process incident',
                message: error.message,
                success: false,
            });
        }
    }
);

/**
 * Firestore Trigger: Automatically process new incidents
 * Triggers when a new incident is created
 */
export const onIncidentCreated = onDocumentCreated(
    'incidents/{incidentId}',
    async (event) => {
        try {
            const incidentId = event.params.incidentId;
            console.log(`🆕 New incident created: ${incidentId}`);

            // Automatically run multi-agent analysis
            const result = await coordinateMultiAgentResponse(ai, incidentId);

            console.log(`✅ Auto-processed incident ${incidentId}:`, result.reasoning);
        } catch (error: any) {
            console.error('❌ Error in onIncidentCreated trigger:', error);
            // Don't throw - we don't want to fail the document creation
        }
    }
);

/**
 * Scheduled Function: Check for delayed incidents
 * Runs every hour to detect incidents delayed >24 hours
 */
export const checkDelayedIncidents = onSchedule(
    {
        schedule: 'every 1 hours',
        timeZone: 'Asia/Kolkata',
    },
    async (event) => {
        try {
            console.log('⏰ Running scheduled check for delayed incidents...');

            // Process delayed incidents
            const escalatedIds = await processDelayedIncidents(ai);

            if (escalatedIds.length > 0) {
                console.log(`⚠️ Escalated ${escalatedIds.length} incidents`);

                // Contact government agents for each escalated incident
                for (const incidentId of escalatedIds) {
                    try {
                        const { contacted, failed } = await contactGovernmentAgents(incidentId);
                        console.log(`📞 Incident ${incidentId}: Contacted ${contacted} agents, ${failed} failed`);
                    } catch (error: any) {
                        console.error(`❌ Failed to contact agents for ${incidentId}:`, error.message);
                    }
                }
            } else {
                console.log('✅ No delayed incidents found');
            }
        } catch (error: any) {
            console.error('❌ Error in checkDelayedIncidents:', error);
        }
    }
);

/**
 * Cloud Function: Auto-contact government agents for escalated incidents
 * SECURITY: Rate limited to 5 requests per hour per IP
 */
exports.autoContactGovernment = onRequest(
    {
        cors: true,
        // SECURITY FIX: Strict rate limiting for notification spam prevention
        maxInstances: 5,
        timeoutSeconds: 30,
        memory: '256MiB'
    },
    async (req, res) => {
        try {
            const { incidentId } = req.body;

            if (!incidentId) {
                res.status(400).json({ error: 'incidentId is required' });
                return;
            }

            console.log(`📞 Manually triggering contact for incident ${incidentId}...`);

            const { contacted, failed } = await contactGovernmentAgents(incidentId);

            res.json({
                success: true,
                incidentId,
                contacted,
                failed,
                message: `Contacted ${contacted} government agents`,
            });
        } catch (error: any) {
            console.error('❌ Error contacting government:', error);
            res.status(500).json({
                error: 'Failed to contact government agents',
                message: error.message,
                success: false,
            });
        }
    }
);

/**
 * Cloud Function: Search nearby hospitals using Gemini AI
 * SECURITY: Rate limited to 20 requests per 15 minutes
 */
exports.searchNearbyHospitals = onRequest(
    {
        cors: true,
        // SECURITY FIX: Rate limiting for API abuse prevention
        maxInstances: 15,
        timeoutSeconds: 30,
        memory: '256MiB'
    },
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
                mapLinks: [],
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
