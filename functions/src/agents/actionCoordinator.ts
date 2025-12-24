import type { Genkit } from 'genkit';
import { z } from 'zod';
import {
    IncidentInputSchema,
    ActionRecommendationSchema,
    type ActionPriority,
} from '../types';

/**
 * Action Coordinator Agent
 * Recommends specific government actions based on incident details
 */
export function createActionCoordinatorAgent(ai: Genkit) {
    return ai.defineTool(
        {
            name: 'recommendActionsTool',
            description: 'Recommend specific government actions for an incident based on severity and context',
            inputSchema: IncidentInputSchema.extend({
                priority: z.number().min(1).max(10).describe('Calculated priority score'),
            }),
            outputSchema: ActionRecommendationSchema,
        },
        async (input) => {
            const actions: Array<{ action: string; priority: ActionPriority; estimatedTime: string }> = [];

            // Determine actions based on severity and priority
            if (input.severity === 'Severe' || input.priority >= 8) {
                actions.push({
                    action: 'Dispatch emergency rescue team immediately',
                    priority: 'immediate',
                    estimatedTime: '15-30 minutes',
                });
                actions.push({
                    action: 'Alert nearby veterinary hospitals with rabies vaccine availability',
                    priority: 'immediate',
                    estimatedTime: '5 minutes',
                });
                actions.push({
                    action: 'Notify local animal control for area containment',
                    priority: 'urgent',
                    estimatedTime: '30-60 minutes',
                });
            } else if (input.severity === 'Moderate' || input.priority >= 5) {
                actions.push({
                    action: 'Assign field agent for assessment',
                    priority: 'urgent',
                    estimatedTime: '1-2 hours',
                });
                actions.push({
                    action: 'Check nearby shelter availability',
                    priority: 'standard',
                    estimatedTime: '30 minutes',
                });
            } else {
                actions.push({
                    action: 'Schedule routine inspection',
                    priority: 'standard',
                    estimatedTime: '24-48 hours',
                });
            }

            const reasoning = `Based on ${input.severity} severity and priority ${input.priority}/10, recommended ${actions.length} actions. ` +
                `Immediate response required: ${actions.some(a => a.priority === 'immediate') ? 'Yes' : 'No'}`;

            console.log(`📋 Action Recommendations: ${reasoning}`);

            return {
                actions,
                reasoning,
            };
        }
    );
}
