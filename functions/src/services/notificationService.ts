import * as twilio from 'twilio';
import * as nodemailer from 'nodemailer';
import { NotificationData } from '../types';

// Initialize Nodemailer transporter
const emailTransporter = process.env.EMAIL_HOST && process.env.EMAIL_USER
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    : null;
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
 * Get color for Slack/Mail based on priority
 */
function getPriorityColor(priority: number): string {
    if (priority >= 9) return '#FF0000'; // Red
    if (priority >= 7) return '#FFA500'; // Orange
    return '#FFFF00'; // Yellow

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
    if (!emailTransporter || !process.env.EMAIL_USER) {
        console.warn('⚠️ Email not configured, skipping email');
        return false;
    }

    try {
        const urgency = getUrgencyLevel(data.priority);
        const subject = `[SAFEPAW] ${urgency} Incident Alert: ${data.incidentId}`;

        const html = `
            <h2>⚠️ ${urgency} Incident Alert</h2>
            <p><strong>Incident ID:</strong> ${data.incidentId}</p>
            <p><strong>Severity:</strong> ${data.severity}</p>
            <p><strong>Priority:</strong> ${data.priority}/10</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Delayed:</strong> ${Math.round(data.hoursSinceLastAction)} hours</p>
            <br>
            <p><a href="https://safepaw.app/i/${data.incidentId}">View Incident Details</a></p>
        `;

        await emailTransporter.sendMail({
            from: `"SafePaw Alert" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: html,
        });

        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Email error for ${email}:`, error.message);
        return false;
    }
}

/**
 * Send Slack notification via Webhook
 */
export async function sendSlack(
    data: NotificationData
): Promise<boolean> {
    if (!process.env.SLACK_WEBHOOK_URL) {
        console.warn('⚠️ Slack Webhook not configured, skipping Slack');
        return false;
    }

    try {
        const emoji = getPriorityEmoji(data.severity, data.priority);
        const urgency = getUrgencyLevel(data.priority);
        const color = getPriorityColor(data.priority);

        const payload = {
            username: 'SafePaw Bot',
            icon_emoji: ':dog2:',
            attachments: [{
                color: color,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${emoji} ${urgency} ALERT: ${data.severity} Incident`
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*ID:*\n${data.incidentId}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Priority:*\n${data.priority}/10`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Location:*\n${data.location}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Delayed:*\n${Math.round(data.hoursSinceLastAction)}h`
                            }
                        ]
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: 'View Incident'
                                },
                                url: `https://safepaw.app/i/${data.incidentId}`,
                                style: 'danger'
                            }
                        ]
                    }
                ]
            }]
        };

        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }

        console.log('✅ Slack notification sent');
        return true;
    } catch (error: any) {
        console.error('❌ Slack error:', error.message);
        return false;
    }
}

/**
 * Send test notification (for testing purposes)
 */
export async function sendTestNotification(
    method: 'sms' | 'email' | 'slack',
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
    } else if (method === 'slack') {
        return await sendSlack(testData);
    } else {
        return await sendEmail(recipient, testData);
    }
}
