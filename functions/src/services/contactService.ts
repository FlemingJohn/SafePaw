import { getFirestore } from 'firebase-admin/firestore';
import type { NotificationData } from '../types';
import { sendSMS, sendEmail } from './notificationService';
import { calculateHoursSinceAction } from '../utils/helpers';

const db = getFirestore();

/**
 * Contact government agents for escalated incident
 */
export async function contactGovernmentAgents(
    incidentId: string
): Promise<{ contacted: number; failed: number }> {
    try {
        console.log(`📞 Contacting government agents for incident ${incidentId}...`);

        // Fetch incident data
        const incidentRef = db.collection('incidents').doc(incidentId);
        const incidentDoc = await incidentRef.get();

        if (!incidentDoc.exists) {
            throw new Error(`Incident ${incidentId} not found`);
        }

        const incidentData = incidentDoc.data()!;

        // Get available government agents
        const agentsRef = db.collection('governmentAgents');
        const snapshot = await agentsRef
            .where('availability', '==', 'on_duty')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.warn('⚠️ No on-duty government agents found');
            return { contacted: 0, failed: 0 };
        }

        // Calculate hours since last action
        const lastAction = incidentData.lastActionTimestamp?.toDate() || incidentData.createdAt?.toDate();
        const hoursSinceLastAction = calculateHoursSinceAction(lastAction);

        // Prepare notification data
        const notificationData: NotificationData = {
            incidentId,
            severity: incidentData.severity,
            location: incidentData.location.address,
            hoursSinceLastAction,
            priority: incidentData.priority || 5,
        };

        let contacted = 0;
        let failed = 0;
        const contactedAgentIds: string[] = [];

        // Contact each agent
        for (const agentDoc of snapshot.docs) {
            const agent = agentDoc.data();
            const agentId = agentDoc.id;

            let success = false;

            // Send based on preferred method
            if (agent.contactInfo.preferredMethod === 'sms' || agent.contactInfo.preferredMethod === 'both') {
                const smsSuccess = await sendSMS(agent.contactInfo.phone, notificationData);
                success = success || smsSuccess;
            }

            if (agent.contactInfo.preferredMethod === 'email' || agent.contactInfo.preferredMethod === 'both') {
                const emailSuccess = await sendEmail(agent.contactInfo.email, notificationData);
                success = success || emailSuccess;
            }

            if (success) {
                contacted++;
                contactedAgentIds.push(agentId);
            } else {
                failed++;
            }
        }

        // Update incident with contacted agents
        await incidentRef.update({
            escalationStatus: 'auto_contacted',
            autoContactedAgents: contactedAgentIds,
            updatedAt: new Date(),
        });

        console.log(`✅ Contacted ${contacted} agents, ${failed} failed`);

        return { contacted, failed };
    } catch (error: any) {
        console.error('❌ Error contacting government agents:', error);
        throw error;
    }
}
