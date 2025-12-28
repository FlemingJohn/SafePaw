# Testing the Notification System

## Quick Start

### 1. Start Firebase Emulators
```bash
cd functions
npm run serve
```

Wait for: `✔  functions[us-central1-testNotification]: http function initialized`

### 2. Test Email Notification
```bash
node testNotifications.js email YOUR_EMAIL@gmail.com
```

### 3. Test SMS Notification
```bash
node testNotifications.js sms +1234567890
```

---

## What You Should See

### ✅ Successful Email Test
```
🧪 Testing EMAIL notification...
📧 Recipient: test@example.com
🔗 Endpoint: http://127.0.0.1:5001/safepaw-1a9e5/us-central1/testNotification

✅ SUCCESS!
📨 Test email sent successfully to test@example.com

📋 Details:
   Method: email
   Recipient: test@example.com
```

**Check your inbox for:**
- Subject: `🚨 CRITICAL PRIORITY: Severe Incident Escalated - TEST_xxx`
- Beautiful HTML email with SafePaw branding
- Incident details table
- Action button

### ✅ Successful SMS Test
```
🧪 Testing SMS notification...
📧 Recipient: +1234567890
🔗 Endpoint: http://127.0.0.1:5001/safepaw-1a9e5/us-central1/testNotification

✅ SUCCESS!
📨 Test sms sent successfully to +1234567890

📋 Details:
   Method: sms
   Recipient: +1234567890
```

**Check your phone for:**
```
🔴 SAFEPAW CRITICAL ALERT

ID: TEST_xxx
Severity: Severe
Priority: 9/10
Location: Test Location, Chennai
Delayed: 25h

⚡ IMMEDIATE ACTION REQUIRED
View: safepaw.app/i/TEST_xxx
```

---

## Troubleshooting

### ❌ Email Failed

**Error: "Email not configured"**
```
⚠️ Email not configured, skipping email
```
**Fix:**
1. Check `functions/.env` has:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```
2. Restart emulators: `Ctrl+C` then `npm run serve`

**Error: "Invalid login: 535-5.7.8"**
```
❌ Email error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Fix:**
1. Regenerate Gmail App Password: https://myaccount.google.com/apppasswords
2. Ensure 2FA is enabled on Gmail
3. Copy the 16-character password (no spaces)
4. Update `.env` file

### ❌ SMS Failed

**Error: "Twilio not configured"**
```
⚠️ Twilio not configured, skipping SMS
```
**Fix:**
1. Check `functions/.env` has:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
2. Restart emulators

**Error: "The number +XXXX is unverified"**
```
❌ SMS error: The number +1234567890 is unverified
```
**Fix (Twilio Trial):**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new Caller ID"
3. Verify your phone number
4. Try again with verified number

**Fix (Production):**
- Upgrade Twilio account to remove verification requirement

---

## Testing with Real Incident

### 1. Create Test Incident in Firestore

Go to Firebase Console → Firestore → Add Document:

**Collection:** `incidents`

**Document Data:**
```json
{
  "userId": "test_user_123",
  "userName": "Test User",
  "userPhone": "+1234567890",
  "location": {
    "address": "Anna Nagar, Chennai, Tamil Nadu",
    "coordinates": {
      "_latitude": 13.0827,
      "_longitude": 80.2707
    }
  },
  "severity": "Severe",
  "dogType": "Stray",
  "description": "Aggressive stray dog near school",
  "priority": 9,
  "status": "Reported",
  "createdAt": "2025-12-27T10:00:00Z",
  "lastActionTimestamp": "2025-12-27T10:00:00Z",
  "escalationStatus": "normal"
}
```

### 2. Create Test Government Agent

**Collection:** `governmentAgents`

**Document Data:**
```json
{
  "name": "Your Name",
  "role": "Test Officer",
  "availability": "on_duty",
  "contactInfo": {
    "phone": "+1234567890",
    "email": "your.email@gmail.com",
    "preferredMethod": "both"
  },
  "assignedZone": "Chennai",
  "createdAt": "2025-12-28T00:00:00Z"
}
```

### 3. Manually Trigger Escalation

```bash
curl -X POST http://127.0.0.1:5001/safepaw-1a9e5/us-central1/autoContactGovernment \
  -H "Content-Type: application/json" \
  -d '{"incidentId": "YOUR_INCIDENT_ID"}'
```

Replace `YOUR_INCIDENT_ID` with the actual document ID from Firestore.

**Expected Response:**
```json
{
  "success": true,
  "incidentId": "abc123",
  "contacted": 1,
  "failed": 0,
  "message": "Contacted 1 government agents"
}
```

---

## Production Deployment

Once testing is successful:

### 1. Deploy Functions
```bash
firebase deploy --only functions
```

### 2. Set Production Environment Variables
```bash
firebase functions:config:set \
  twilio.account_sid="ACxxxxxxxx" \
  twilio.auth_token="your_token" \
  twilio.phone_number="+1234567890" \
  email.user="your.email@gmail.com" \
  email.password="your_app_password"
```

### 3. Verify Deployment
```bash
firebase functions:log --only testNotification
```

### 4. Test Production Endpoint
```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/testNotification \
  -H "Content-Type: application/json" \
  -d '{"method":"email","recipient":"test@example.com"}'
```

---

## Monitoring

### View Logs
```bash
# Local
firebase emulators:start --only functions

# Production
firebase functions:log
```

### Check Twilio Dashboard
- https://console.twilio.com/us1/monitor/logs/sms
- View sent messages, delivery status, errors

### Check Gmail Sent Folder
- Verify emails are being sent from your account
- Check for bounce-backs or errors

---

## Success Criteria

✅ Email test returns `success: true`  
✅ Email arrives in inbox within 10 seconds  
✅ Email has proper formatting and branding  
✅ SMS test returns `success: true`  
✅ SMS arrives on phone within 30 seconds  
✅ SMS has correct format and shortened URL  
✅ Real incident escalation contacts agents  
✅ Firestore updates with `autoContactedAgents`  

---

## Next Steps

1. ✅ Test notifications locally
2. ✅ Verify email/SMS delivery
3. 📊 Monitor escalation effectiveness
4. 🚀 Deploy to production
5. 🔄 Set up monitoring alerts
