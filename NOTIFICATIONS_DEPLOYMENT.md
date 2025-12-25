# Twilio SMS & Email Notification System - Deployment Guide

## Overview

The SafePaw notification system sends SMS and email alerts to government officials when incidents are escalated (delayed >24 hours). It uses:
- **Twilio** - SMS notifications
- **Nodemailer** - Email notifications (Gmail SMTP)

## Prerequisites

### 1. Twilio Account (for SMS)
1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial account
3. Get $15 free credit (good for ~500 SMS in India)
4. Verify your phone number

### 2. Gmail App Password (for Email)
1. Use existing Gmail or create new one
2. Enable 2-Factor Authentication
3. Generate App Password (not your regular password)

## Step 1: Get Twilio Credentials

### Get Account SID & Auth Token
1. Go to [Twilio Console](https://console.twilio.com)
2. Dashboard shows:
   - **Account SID** - Copy this
   - **Auth Token** - Click "View" and copy

### Get Twilio Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select Country: **India** (+91)
3. Check "SMS" capability
4. Buy number (free with trial credit)
5. Copy your Twilio phone number (format: +91xxxxxxxxxx)

## Step 2: Get Gmail App Password

### Enable 2-Factor Authentication
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "Signing in to Google", enable **2-Step Verification**

### Generate App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other** (name it "SafePaw Functions")
4. Click **Generate**
5. Copy the 16-character password (no spaces)

## Step 3: Configure Environment Variables

### Update `.env` file
```bash
cd functions
nano .env
```

Add your credentials:
```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_char_auth_token
TWILIO_PHONE_NUMBER=+918012345678

# Gmail Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Google AI for incident analysis
GOOGLE_AI_API_KEY=your_gemini_api_key

# Escalation settings
ESCALATION_THRESHOLD_HOURS=24
ESCALATION_RECHECK_HOURS=6
```

### Set Firebase Config Variables
```bash
# Twilio
firebase functions:config:set twilio.account_sid="ACxxxxxxxxxxxxxxxx"
firebase functions:config:set twilio.auth_token="your_auth_token"
firebase functions:config:set twilio.phone_number="+918012345678"

# Email
firebase functions:config:set email.host="smtp.gmail.com"
firebase functions:config:set email.port="587"
firebase functions:config:set email.user="youremail@gmail.com"
firebase functions:config:set email.password="your_app_password"

# Google AI
firebase functions:config:set google.ai_api_key="your_gemini_key"
```

Verify configuration:
```bash
firebase functions:config:get
```

## Step 4: Install Dependencies

```bash
cd functions
npm install twilio nodemailer
npm install --save-dev @types/nodemailer
```

## Step 5: Deploy Notification Functions

### Build
```bash
npm run build
```

### Deploy
```bash
firebase deploy --only functions
```

Or deploy specific functions:
```bash
firebase deploy --only functions:escalationMonitor
firebase deploy --only functions:processIncidentWithAI
```

## Step 6: Test Notifications

### Test SMS
Create a test script `testSMS.js`:
```javascript
const twilio = require('twilio');

const client = twilio(
  'YOUR_ACCOUNT_SID',
  'YOUR_AUTH_TOKEN'
);

client.messages.create({
  body: '🚨 SAFEPAW TEST: Notification system working!',
  from: '+918012345678', // Your Twilio number
  to: '+919876543210'    // Your phone number
})
.then(msg => console.log('✅ SMS sent:', msg.sid))
.catch(err => console.error('❌ Error:', err));
```

Run:
```bash
node testSMS.js
```

### Test Email
Create `testEmail.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'youremail@gmail.com',
    pass: 'your_app_password'
  }
});

transporter.sendMail({
  from: 'youremail@gmail.com',
  to: 'recipient@gmail.com',
  subject: '🚨 SafePaw Test Alert',
  html: '<h1>Notification system working!</h1>'
})
.then(() => console.log('✅ Email sent'))
.catch(err => console.error('❌ Error:', err));
```

Run:
```bash
node testEmail.js
```

## How Notifications Work

### When Triggered
1. **Escalation Monitor** runs every 6 hours (scheduled Cloud Function)
2. Checks incidents delayed >24 hours without action
3. Sends SMS + Email to government agents

### Notification Content

**SMS:**
```
🚨 SAFEPAW ALERT

Incident ID: XYZ123
Severity: Severe
Priority: 9/10
Location: MG Road, Bangalore
Delayed: 26 hours

Action required immediately.
```

**Email:**
- HTML formatted alert with incident details
- "View Incident Details" button linking to dashboard
- Professional styling with color-coded severity

## Cost Breakdown

### Twilio (SMS)
- **Free Trial:** $15 credit (~500 SMS in India)
- **After Trial:** ₹0.60 per SMS (~$0.007)
- **Monthly estimate:** 100 alerts = ₹60/month

### Gmail (Email)
- **Free:** Unlimited with your Gmail account
- No additional cost

### Firebase Functions
- **Free Tier:** 2M invocations/month
- Notifications well within free limit

## Production Setup

### Add Government Contact Numbers

Update `functions/src/services/contactService.ts`:
```typescript
export const getGovernmentContacts = (): Contact[] => {
  return [
    {
      id: 'agent1',
      name: 'Municipal Officer - Zone 1',
      phoneNumber: '+919876543210',
      email: 'officer1@municipal.gov.in',
      role: 'senior_officer',
      zones: ['zone1', 'zone2']
    },
    {
      id: 'agent2',
      name: 'Animal Control Supervisor',
      phoneNumber: '+919876543211',
      email: 'supervisor@animal-control.gov.in',
      role: 'supervisor',
      zones: ['all']
    }
    // Add more contacts
  ];
};
```

### Configure Escalation Rules

Edit `functions/.env`:
```env
# Send alerts after 24 hours of inaction
ESCALATION_THRESHOLD_HOURS=24

# Check every 6 hours for delayed incidents
ESCALATION_RECHECK_HOURS=6
```

## Troubleshooting

### SMS Not Sending

**Error: "Phone number not verified"**
- **Trial accounts** can only send to verified numbers
- Add recipient to Twilio verified numbers
- OR upgrade to paid account

**Error: "Invalid phone number format"**
- Use E.164 format: `+91XXXXXXXXXX`
- Include `+91` country code

**Error: "Insufficient funds"**
- Check Twilio balance: [console.twilio.com/billing](https://console.twilio.com/billing)
- Add credit or upgrade plan

### Email Not Sending

**Error: "Invalid login"**
- Use **App Password**, not regular password
- Ensure 2FA enabled on Gmail
- Regenerate app password if needed

**Error: "SMTP timeout"**
- Check `EMAIL_HOST=smtp.gmail.com`
- Check `EMAIL_PORT=587`
- Firewall may be blocking port 587

**Error: "Less secure app access"**
- Gmail removed this option
- **MUST use App Password** now

### Functions Not Triggering

**Check deployment:**
```bash
firebase functions:list
```

**View logs:**
```bash
firebase functions:log --only escalationMonitor
firebase functions:log --stream
```

**Manually trigger test:**
```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/escalationMonitor
```

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use App Passwords** - Not your main Gmail password
3. **Limit Twilio number access** - Only verified numbers in trial
4. **Monitor usage** - Check Twilio console monthly
5. **Rotate credentials** - Change App Password every 90 days

## Monitoring & Logs

### View notification logs
```bash
firebase functions:log --only escalationMonitor
```

Look for:
- `✅ SMS sent to +91xxxxxxxxxx`
- `✅ Email sent to email@example.com`
- `⚠️ Twilio not configured` - Missing credentials

### Twilio logs
- Dashboard: [console.twilio.com/monitor/logs/messages](https://console.twilio.com/monitor/logs/messages)
- See delivery status, errors

## Quick Reference

```bash
# Set up credentials
cd functions
firebase functions:config:set twilio.account_sid="ACxxxxx"
firebase functions:config:set twilio.auth_token="xxxxx"
firebase functions:config:set twilio.phone_number="+91xxxxx"
firebase functions:config:set email.user="youremail@gmail.com"
firebase functions:config:set email.password="app_password"

# Deploy
npm run build
firebase deploy --only functions

# Test
node testSMS.js
node testEmail.js

# Monitor
firebase functions:log --stream
```

## Support

- Twilio Docs: [twilio.com/docs/sms](https://www.twilio.com/docs/sms)
- Gmail App Passwords: [support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)
- Nodemailer: [nodemailer.com](https://nodemailer.com)
