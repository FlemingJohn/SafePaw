# Escalation Monitor Setup Guide

## Overview

The SafePaw escalation monitor automatically detects delayed incidents and sends notifications to government agents via **Twilio SMS** and **Gmail email**.

---

## Prerequisites

1. **Twilio Account** (Free trial available)
2. **Gmail Account** with App Password
3. **Firebase Project** with Functions enabled

---

## Step 1: Configure Twilio

### 1.1 Create Twilio Account
1. Visit https://www.twilio.com/try-twilio
2. Sign up for a free trial account
3. Verify your phone number

### 1.2 Get Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. Copy your **Account SID**
3. Copy your **Auth Token**
4. Get a Twilio phone number:
   - Go to Phone Numbers → Buy a Number
   - Select a number (free with trial)
   - Note the phone number (format: +1234567890)

### 1.3 Add to Environment
Create `functions/.env` file:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Step 2: Configure Gmail

### 2.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### 2.2 Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other" → Enter "SafePaw Functions"
4. Click "Generate"
5. Copy the 16-character password

### 2.3 Add to Environment
Add to `functions/.env`:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## Step 3: Install Dependencies

The required packages are already in `package.json`:
- `twilio`: ^4.20.0
- `nodemailer`: ^6.9.7

Install them:
```bash
cd functions
npm install
```

Install type definitions (fixes lint errors):
```bash
npm install --save-dev @types/nodemailer
```

---

## Step 4: Test Notifications

### 4.1 Start Firebase Emulators
```bash
cd functions
npm run serve
```

### 4.2 Test SMS
```bash
curl -X POST http://127.0.0.1:5001/safepaw-1a9e5/us-central1/testNotification \
  -H "Content-Type: application/json" \
  -d '{
    "method": "sms",
    "recipient": "+1234567890"
  }'
```

### 4.3 Test Email
```bash
curl -X POST http://127.0.0.1:5001/safepaw-1a9e5/us-central1/testNotification \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email",
    "recipient": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com",
  "method": "email",
  "recipient": "test@example.com"
}
```

---

## Step 5: Seed Government Agents

Create sample government agents in Firestore:

```javascript
// Run in Firebase Console → Firestore
db.collection('governmentAgents').add({
  name: 'John Doe',
  role: 'Animal Control Officer',
  availability: 'on_duty',
  contactInfo: {
    phone: '+1234567890',
    email: 'john.doe@government.gov',
    preferredMethod: 'both'  // 'sms', 'email', or 'both'
  },
  assignedZone: 'North Chennai',
  createdAt: new Date()
});
```

---

## Step 6: Deploy to Production

### 6.1 Set Environment Variables
```bash
firebase functions:config:set \
  twilio.account_sid="ACxxxxxxxx" \
  twilio.auth_token="your_token" \
  twilio.phone_number="+1234567890" \
  email.host="smtp.gmail.com" \
  email.port="587" \
  email.user="your.email@gmail.com" \
  email.password="xxxx xxxx xxxx xxxx"
```

### 6.2 Deploy Functions
```bash
firebase deploy --only functions
```

---

## How It Works

### Automatic Escalation Flow

1. **Scheduled Check** (Every Hour)
   - Cloud Function `checkDelayedIncidents` runs
   - Queries incidents with status "Reported" or "Under Review"
   - Checks if `lastActionTimestamp` > 24 hours old

2. **Escalation Trigger**
   - If incident is delayed > 24 hours:
     - Updates `escalationStatus` to "escalated"
     - Calls `contactGovernmentAgents(incidentId)`

3. **Notification Delivery**
   - Queries on-duty government agents
   - Sends SMS via Twilio (if preferred)
   - Sends Email via Gmail (if preferred)
   - Updates incident with `autoContactedAgents` list

4. **Agent Receives**
   - **SMS**: Short alert with incident ID, severity, location
   - **Email**: Rich HTML with full details, priority banner, action button

---

## Notification Templates

### SMS Template
```
🔴 SAFEPAW CRITICAL ALERT

ID: abc12345
Severity: Severe
Priority: 9/10
Location: Anna Nagar, Chennai
Delayed: 25h

⚡ IMMEDIATE ACTION REQUIRED
View: safepaw.app/i/abc12345
```

### Email Template
- **Header**: Gradient SafePaw branding
- **Urgency Banner**: Color-coded (Red/Orange/Yellow)
- **Incident Details**: Table with all information
- **Action Button**: Direct link to government portal
- **Footer**: Explanation and branding

---

## Monitoring & Logs

### View Logs
```bash
firebase functions:log
```

### Check Notification Status
Look for these log messages:
- `✅ SMS sent to +1234567890`
- `✅ Email sent to agent@gov.com`
- `❌ SMS error: [error message]`
- `⚠️ Twilio not configured, skipping SMS`

---

## Troubleshooting

### SMS Not Sending

**Issue**: `⚠️ Twilio not configured`
- **Fix**: Check `.env` file has all Twilio credentials
- **Fix**: Restart emulators after adding `.env`

**Issue**: `Error: The number +XXXX is unverified`
- **Fix**: With Twilio trial, you can only send to verified numbers
- **Fix**: Verify recipient number in Twilio Console
- **Fix**: Upgrade to paid account for unrestricted sending

### Email Not Sending

**Issue**: `⚠️ Email not configured`
- **Fix**: Check `.env` file has Gmail credentials
- **Fix**: Ensure App Password is correct (16 characters, no spaces)

**Issue**: `Invalid login: 535-5.7.8 Username and Password not accepted`
- **Fix**: Regenerate Gmail App Password
- **Fix**: Ensure 2FA is enabled on Gmail account

**Issue**: `Error: self signed certificate in certificate chain`
- **Fix**: This is usually a network/firewall issue
- **Fix**: Try different network or disable SSL scanning

---

## Cost Estimates

### Twilio (Free Trial)
- **Free Credits**: $15.50
- **SMS Cost**: $0.0079 per message
- **Messages with trial**: ~1,962 messages

### Gmail
- **Cost**: FREE
- **Limits**: 500 emails/day (more than enough)

### Firebase Functions
- **Free Tier**: 2M invocations/month
- **Escalation checks**: 24/day × 30 = 720/month
- **Well within free tier**

---

## Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use Firebase Functions config** for production
3. **Rotate credentials** every 90 days
4. **Monitor logs** for suspicious activity
5. **Rate limit** notification endpoints

---

## Next Steps

1. ✅ Test notifications locally
2. ✅ Seed government agents in Firestore
3. ✅ Deploy to production
4. 📊 Monitor escalation effectiveness
5. 🔄 Adjust escalation threshold if needed

---

## Support

For issues:
1. Check Firebase Functions logs
2. Verify environment variables
3. Test with `testNotification` endpoint
4. Check Twilio/Gmail dashboards for delivery status
