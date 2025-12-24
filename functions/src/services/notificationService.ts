import * as twilio from 'twilio';
import * as nodemailer from 'nodemailer';
import type { NotificationData } from '../types';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Initialize email transporter
const emailTransporter = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    : null;

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
        const message = `🚨 SAFEPAW ALERT\n\n` +
            `Incident ID: ${data.incidentId}\n` +
            `Severity: ${data.severity}\n` +
            `Priority: ${data.priority}/10\n` +
            `Location: ${data.location}\n` +
            `Delayed: ${data.hoursSinceLastAction} hours\n\n` +
            `Action required immediately.`;

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
 */
export async function sendEmail(
    email: string,
    data: NotificationData
): Promise<boolean> {
    if (!emailTransporter) {
        console.warn('⚠️ Email not configured, skipping email');
        return false;
    }

    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d32f2f;">🚨 SafePaw Incident Alert</h2>
                <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #ff9800;">
                    <h3>Escalated Incident Requires Immediate Attention</h3>
                    <table style="width: 100%; margin-top: 15px;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Incident ID:</td>
                            <td style="padding: 8px;">${data.incidentId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Severity:</td>
                            <td style="padding: 8px;"><span style="color: ${data.severity === 'Severe' ? '#d32f2f' : '#ff9800'};">${data.severity}</span></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Priority:</td>
                            <td style="padding: 8px;">${data.priority}/10</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Location:</td>
                            <td style="padding: 8px;">${data.location}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Time Delayed:</td>
                            <td style="padding: 8px;"><strong>${data.hoursSinceLastAction} hours</strong></td>
                        </tr>
                    </table>
                </div>
                <p style="margin-top: 20px;">This incident has been automatically escalated due to inaction. Please review and take appropriate action immediately.</p>
                <a href="https://safepaw.app/incidents/${data.incidentId}" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Incident Details</a>
            </div>
        `;

        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🚨 SafePaw Alert: Escalated ${data.severity} Incident - ${data.incidentId}`,
            html: htmlContent,
        });

        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Email error for ${email}:`, error.message);
        return false;
    }
}
