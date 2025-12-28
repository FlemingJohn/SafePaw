#!/usr/bin/env node

/**
 * Test Notification System
 * Tests Twilio SMS and Gmail email delivery
 * 
 * Usage:
 *   node testNotifications.js sms +1234567890
 *   node testNotifications.js email test@example.com
 */

const https = require('https');

const FUNCTIONS_URL = process.env.FUNCTIONS_URL || 'http://127.0.0.1:5001/safepaw-1a9e5/us-central1';

async function testNotification(method, recipient) {
    const data = JSON.stringify({
        method: method,
        recipient: recipient
    });

    const url = new URL(`${FUNCTIONS_URL}/testNotification`);

    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const protocol = url.protocol === 'https:' ? https : require('http');
        const req = protocol.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Invalid JSON response: ' + responseData));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage:');
        console.log('  node testNotifications.js sms +1234567890');
        console.log('  node testNotifications.js email test@example.com');
        process.exit(1);
    }

    const method = args[0];
    const recipient = args[1];

    if (method !== 'sms' && method !== 'email') {
        console.error('Error: Method must be "sms" or "email"');
        process.exit(1);
    }

    console.log(`\n🧪 Testing ${method.toUpperCase()} notification...`);
    console.log(`📧 Recipient: ${recipient}`);
    console.log(`🔗 Endpoint: ${FUNCTIONS_URL}/testNotification\n`);

    try {
        const result = await testNotification(method, recipient);

        if (result.success) {
            console.log('✅ SUCCESS!');
            console.log(`📨 ${result.message}`);
            console.log('\n📋 Details:');
            console.log(`   Method: ${result.method}`);
            console.log(`   Recipient: ${result.recipient}`);
        } else {
            console.log('❌ FAILED!');
            console.log(`Error: ${result.error}`);
            console.log(`Message: ${result.message}`);
        }
    } catch (error) {
        console.log('❌ ERROR!');
        console.error(`Failed to send test notification: ${error.message}`);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Firebase emulators are running: npm run serve');
        console.log('   2. Check your .env file has correct credentials');
        console.log('   3. For Twilio trial, verify the recipient phone number');
        console.log('   4. For Gmail, ensure App Password is correct');
    }

    console.log('\n');
}

main();
