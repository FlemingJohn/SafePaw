import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import type { AgentResponse } from '../types';
import { createPriorityAnalyzerAgent } from '../agents/priorityAnalyzer';
import { createActionCoordinatorAgent } from '../agents/actionCoordinator';
import { createResourceManagerAgent } from '../agents/resourceManager';
import { createEscalationMonitorAgent } from '../agents/escalationMonitor';
import { generateId } from '../utils/helpers';

const db = getFirestore();

/**
 * Multi-Agent Orchestrator
 * Coordinates all agents to process an incident
 */
export async function coordinateMultiAgentResponse(
    ai: Genkit,
    incidentId: string
): Promise<AgentResponse> {
    try {
        console.log(`🤖 Starting multi-agent coordination for incident ${incidentId}`);

        // Fetch incident data
        const incidentRef = db.collection('incidents').doc(incidentId);
        const incidentDoc = await incidentRef.get();

        if (!incidentDoc.exists) {
            throw new Error(`Incident ${incidentId} not found`);
        }

        const incidentData = incidentDoc.data()!;

        // Prepare input for AI tools
        const incidentInput = {
            incidentId,
            severity: incidentData.severity,
            location: {
                lat: incidentData.location.coordinates._latitude,
                lng: incidentData.location.coordinates._longitude,
                address: incidentData.location.address,
            },
            createdAt: incidentData.createdAt.toDate().toISOString(),
            description: incidentData.description,
        };

        // AGENT 1: Priority Analyzer
        console.log('🎯 Agent 1: Priority Analyzer');
        const priorityAgent = createPriorityAnalyzerAgent(ai);
        const priorityResult = await priorityAgent(incidentInput);

        // AGENT 2: Action Coordinator
        console.log('📋 Agent 2: Action Coordinator');
        const actionAgent = createActionCoordinatorAgent(ai);
        const actionsResult = await actionAgent({
            ...incidentInput,
            priority: priorityResult.priority,
        });

        // AGENT 3: Resource Manager
        console.log('🚑 Agent 3: Resource Manager');
        const resourceAgent = createResourceManagerAgent(ai);

        // Determine required resource types based on severity
        let requiredResourceTypes: Array<'rescue_team' | 'veterinarian' | 'animal_control'> = [];
        if (incidentData.severity === 'Severe') {
            requiredResourceTypes = ['rescue_team', 'veterinarian', 'animal_control'];
        } else if (incidentData.severity === 'Moderate') {
            requiredResourceTypes = ['rescue_team', 'animal_control'];
        } else {
            requiredResourceTypes = ['animal_control'];
        }

        const resourcesResult = await resourceAgent({
            ...incidentInput,
            priority: priorityResult.priority,
            requiredResourceTypes,
        });

        // Update Firestore with AI recommendations
        await incidentRef.update({
            priority: priorityResult.priority,
            aiRecommendations: [
                {
                    id: generateId('priority'),
                    agentType: 'priority',
                    recommendation: priorityResult.reasoning,
                    confidence: 0.85,
                    timestamp: Timestamp.now(),
                    status: 'pending',
                },
                {
                    id: generateId('action'),
                    agentType: 'action',
                    recommendation: actionsResult.reasoning,
                    confidence: 0.80,
                    timestamp: Timestamp.now(),
                    status: 'pending',
                },
                {
                    id: generateId('resource'),
                    agentType: 'resource',
                    recommendation: resourcesResult.reasoning,
                    confidence: 0.75,
                    timestamp: Timestamp.now(),
                    status: 'pending',
                },
            ],
            assignedResources: resourcesResult.resources.map(r => ({
                id: r.resourceId,
                type: r.type,
                name: r.name,
                assignedAt: Timestamp.now(),
                status: 'assigned',
            })),
            escalationStatus: 'normal',
            lastActionTimestamp: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Multi-agent coordination complete');

        return {
            priority: {
                priority: priorityResult.priority,
                urgencyLevel: priorityResult.urgencyLevel,
                reasoning: priorityResult.reasoning,
            },
            actions: actionsResult.actions,
            resources: resourcesResult.resources,
            reasoning: `Multi-agent analysis complete. Priority: ${priorityResult.priority}/10 (${priorityResult.urgencyLevel}). ` +
                `Recommended ${actionsResult.actions.length} actions and allocated ${resourcesResult.resources.length} resources.`,
        };
    } catch (error: any) {
        console.error('❌ Multi-agent coordination error:', error);
        throw new Error(`Multi-agent coordination failed: ${error.message}`);
    }
}

/**
 * Process delayed incidents and escalate
 */
export async function processDelayedIncidents(ai: Genkit): Promise<string[]> {
    const escalatedIds: string[] = [];

    try {
        console.log('⏰ Checking for delayed incidents...');

        // Check for delayed incidents
        const escalationAgent = createEscalationMonitorAgent(ai);
        const result = await escalationAgent({ checkAll: true });

        console.log(`Found ${result.delayedIncidents.length} delayed incidents`);

        for (const delayed of result.delayedIncidents) {
            if (delayed.shouldEscalate) {
                // Update incident status to escalated
                const incidentRef = db.collection('incidents').doc(delayed.incidentId);
                await incidentRef.update({
                    escalationStatus: 'escalated',
                    escalatedAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });

                escalatedIds.push(delayed.incidentId);
                console.log(`⚠️ Escalated incident ${delayed.incidentId} (${delayed.hoursSinceLastAction} hours delayed)`);
            }
        }

        return escalatedIds;
    } catch (error: any) {
        console.error('❌ Error processing delayed incidents:', error);
        throw error;
    }
}
