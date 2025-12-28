import * as twilio from 'twilio';
import type { NotificationData } from '../types';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;


/**
 * Get priority emoji based on severity and priority score
 */
function getPriorityEmoji(severity: string, priority: number): string {
    if (severity === 'Severe' || priority >= 9) return '🔴';
    if (severity === 'Moderate' || priority >= 7) return '🟠';
    return '🟡';
}

/**
 * Get urgency level text
 */
function getUrgencyLevel(priority: number): string {
    if (priority >= 9) return 'CRITICAL';
    if (priority >= 7) return 'HIGH';
    if (priority >= 4) return 'MEDIUM';
    return 'LOW';
}

/**
 * Send SMS notification to government agent
 */
export async function sendSMS(
    phoneNumber: string,
    data: NotificationData
): Promise<boolean> {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('⚠️ Twilio not configured, skipping SMS');
        return false;
    }

    try {
        const emoji = getPriorityEmoji(data.severity, data.priority);
        const urgency = getUrgencyLevel(data.priority);

        const message = `${emoji} SAFEPAW ${urgency} ALERT\n\n` +
            `ID: ${data.incidentId.substring(0, 8)}\n` +
            `Severity: ${data.severity}\n` +
            `Priority: ${data.priority}/10\n` +
            `Location: ${data.location}\n` +
            `Delayed: ${Math.round(data.hoursSinceLastAction)}h\n\n` +
            `⚡ IMMEDIATE ACTION REQUIRED\n` +
            `View: safepaw.app/i/${data.incidentId.substring(0, 8)}`;

        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`✅ SMS sent to ${phoneNumber}`);
        return true;
    } catch (error: any) {
        console.error(`❌ SMS error for ${phoneNumber}:`, error.message);
        return false;
    }
}

/**
 * Send email notification to government agent
 * NOTE: Email notifications are disabled - using SMS only
 */
export async function sendEmail(
    email: string,
    data: NotificationData
): Promise<boolean> {
    console.warn('⚠️ Email notifications are disabled - using SMS only');
    return false;
}

/**
 * Send test notification (for testing purposes)
 */
export async function sendTestNotification(
    method: 'sms' | 'email',
    recipient: string
): Promise<boolean> {
    const testData: NotificationData = {
        incidentId: 'TEST_' + Date.now(),
        severity: 'Severe',
        location: 'Test Location, Chennai',
        hoursSinceLastAction: 25,
        priority: 9,
    };

    if (method === 'sms') {
        return await sendSMS(recipient, testData);
    } else {
        return await sendEmail(recipient, testData);
    }
}
