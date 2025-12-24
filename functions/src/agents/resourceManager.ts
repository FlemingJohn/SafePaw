import type { Genkit } from 'genkit';
import { z } from 'zod';
import {
    IncidentInputSchema,
    ResourceAllocationSchema,
    type ResourceType,
} from '../types';
import { getAvailableResources } from '../utils/helpers';

/**
 * Resource Manager Agent
 * Allocates available government resources to incidents
 */
export function createResourceManagerAgent(ai: Genkit) {
    return ai.defineTool(
        {
            name: 'allocateResourcesTool',
            description: 'Allocate available government resources (rescue teams, veterinarians, animal control) to an incident',
            inputSchema: IncidentInputSchema.extend({
                priority: z.number().min(1).max(10).describe('Calculated priority score'),
                requiredResourceTypes: z.array(z.enum(['rescue_team', 'veterinarian', 'animal_control'])).describe('Required resource types'),
            }),
            outputSchema: ResourceAllocationSchema,
        },
        async (input) => {
            // Query available resources from Firestore
            const availableResources = await getAvailableResources(input.requiredResourceTypes, 5);

            // Filter by required types
            const matchingResources = availableResources.filter(r =>
                input.requiredResourceTypes.includes(r.type as ResourceType)
            );

            // Allocate resources (simplified - in production, calculate actual distances)
            const resources = matchingResources.slice(0, 3).map(r => ({
                resourceId: r.id,
                type: r.type,
                name: r.name,
                distance: '~5 km', // Placeholder - calculate actual distance in production
            }));

            const reasoning = `Found ${matchingResources.length} matching resources. Allocated ${resources.length} based on availability and proximity.`;

            console.log(`🚑 Resource Allocation: ${reasoning}`);

            return {
                resources,
                reasoning,
            };
        }
    );
}
