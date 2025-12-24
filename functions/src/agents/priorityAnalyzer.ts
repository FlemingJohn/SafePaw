import type { Genkit } from 'genkit';
import {
    IncidentInputSchema,
    PriorityResultSchema,
    type UrgencyLevel,
} from '../types';
import {
    calculatePriorityScore,
    calculateTimeUrgency,
} from '../utils/helpers';

/**
 * Priority Analyzer Agent
 * Analyzes incident and calculates priority score (1-10)
 */
export function createPriorityAnalyzerAgent(ai: Genkit) {
    return ai.defineTool(
        {
            name: 'analyzePriorityTool',
            description: 'Analyze an incident and calculate its priority score (1-10) based on severity, location risk, time urgency, and resource availability',
            inputSchema: IncidentInputSchema,
            outputSchema: PriorityResultSchema,
        },
        async (input) => {
            // Calculate time urgency
            const createdAt = new Date(input.createdAt);
            const timeUrgency = calculateTimeUrgency(createdAt);

            // Estimate location risk (simplified - in production, check proximity to schools, hospitals, etc.)
            const locationRisk = input.severity === 'Severe' ? 3 : 2;

            // Estimate resource availability (simplified)
            const resourceAvailability = 2;

            // Calculate priority
            const priority = calculatePriorityScore(
                input.severity,
                locationRisk,
                timeUrgency,
                resourceAvailability
            );

            // Determine urgency level
            let urgencyLevel: UrgencyLevel;
            if (priority >= 9) urgencyLevel = 'critical';
            else if (priority >= 7) urgencyLevel = 'high';
            else if (priority >= 4) urgencyLevel = 'medium';
            else urgencyLevel = 'low';

            const reasoning = `Priority ${priority}/10: ${input.severity} severity (weight: ${input.severity === 'Severe' ? 3 : input.severity === 'Moderate' ? 2 : 1}), ` +
                `location risk: ${locationRisk}/3, time urgency: ${timeUrgency}/3 (${Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))} hours old), ` +
                `resource availability: ${resourceAvailability}/3`;

            console.log(`🎯 Priority Analysis: ${reasoning}`);

            return {
                priority,
                reasoning,
                urgencyLevel,
            };
        }
    );
}
