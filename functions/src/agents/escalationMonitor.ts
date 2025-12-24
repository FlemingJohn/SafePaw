import type { Genkit } from 'genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { DelayedIncidentSchema } from '../types';
import { isIncidentDelayed, calculateHoursSinceAction } from '../utils/helpers';

const db = getFirestore();

/**
 * Escalation Monitor Agent
 * Checks for delayed incidents and triggers escalation
 */
export function createEscalationMonitorAgent(ai: Genkit) {
    return ai.defineTool(
        {
            name: 'checkDelayedIncidentsTool',
            description: 'Check if incidents have been delayed more than 24 hours without action',
            inputSchema: z.object({
                checkAll: z.boolean().describe('Whether to check all incidents or specific one'),
                incidentId: z.string().optional().describe('Specific incident ID to check'),
            }),
            outputSchema: DelayedIncidentSchema,
        },
        async (input) => {
            const delayedIncidents: Array<{ incidentId: string; hoursSinceLastAction: number; shouldEscalate: boolean }> = [];

            if (input.checkAll) {
                // Query all non-resolved incidents
                const incidentsRef = db.collection('incidents');
                const snapshot = await incidentsRef
                    .where('status', 'in', ['Reported', 'Under Review'])
                    .get();

                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    const lastAction = data.lastActionTimestamp?.toDate() || data.createdAt?.toDate();

                    if (lastAction) {
                        const hoursSinceAction = calculateHoursSinceAction(lastAction);

                        if (hoursSinceAction > 24) {
                            delayedIncidents.push({
                                incidentId: doc.id,
                                hoursSinceLastAction: hoursSinceAction,
                                shouldEscalate: true,
                            });
                        }
                    }
                }
            } else if (input.incidentId) {
                const isDelayed = await isIncidentDelayed(input.incidentId);
                if (isDelayed) {
                    const incidentRef = db.collection('incidents').doc(input.incidentId);
                    const incident = await incidentRef.get();
                    const data = incident.data();
                    const lastAction = data?.lastActionTimestamp?.toDate() || data?.createdAt?.toDate();
                    const hoursSinceAction = calculateHoursSinceAction(lastAction!);

                    delayedIncidents.push({
                        incidentId: input.incidentId,
                        hoursSinceLastAction: hoursSinceAction,
                        shouldEscalate: true,
                    });
                }
            }

            console.log(`⏰ Escalation Check: Found ${delayedIncidents.length} delayed incidents`);

            return { delayedIncidents };
        }
    );
}
