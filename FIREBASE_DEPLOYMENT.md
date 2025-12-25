# Firebase Functions Deployment Guide

## Prerequisites

1. **Firebase CLI** installed globally:
```bash
npm install -g firebase-tools
```

2. **Firebase Project** created at [console.firebase.google.com](https://console.firebase.google.com)

3. **Billing enabled** (Functions require Blaze plan for external API calls)

## Step 1: Login to Firebase

```bash
firebase login
```

This will open your browser for Google authentication.

## Step 2: Initialize Firebase (if not already done)

```bash
# From project root
firebase init functions
```

Select:
- Use existing project: Choose your SafePaw project
- Language: TypeScript
- ESLint: Yes
- Install dependencies: Yes

## Step 3: Configure Environment Variables

Create `.env` file in the `functions` folder (copy from `.env.example`):

```bash
cd functions
cp .env.example .env
```

Edit `functions/.env` with your actual API keys:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

**Set environment variables in Firebase:**
```bash
firebase functions:config:set gemini.api_key="your_actual_gemini_api_key"
firebase functions:config:set google.maps_api_key="your_actual_google_maps_api_key"
```

Verify:
```bash
firebase functions:config:get
```

## Step 4: Install Dependencies

```bash
cd functions
npm install
```

Required packages:
- `@genkit-ai/googleai` - Gemini AI
- `@google-cloud/functions-framework` - Functions runtime
- `firebase-admin` - Firebase SDK
- `firebase-functions` - Functions triggers

## Step 5: Build Functions

```bash
# From functions directory
npm run build
```

This compiles TypeScript to JavaScript in the `lib` folder.

## Step 6: Deploy Functions

### Deploy All Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:processIncidentWithAI
firebase deploy --only functions:searchNearbyHospitals
```

### Deploy with Force (if errors)
```bash
firebase deploy --only functions --force
```

## Step 7: Verify Deployment

After deployment, you'll see URLs like:
```
✔  functions[us-central1-processIncidentWithAI] 
   https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/processIncidentWithAI

✔  functions[us-central1-searchNearbyHospitals] 
   https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/searchNearbyHospitals
```

## Step 8: Update Frontend URLs

Update `frontend/services/incidentService.ts` with your function URL:
```typescript
const FIREBASE_FUNCTIONS_URL = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net';
```

## Testing Functions

### Test AI Processing Function
```bash
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/processIncidentWithAI \
  -H "Content-Type: application/json" \
  -d '{"incidentId": "test123"}'
```

### Test Hospital Search Function
```bash
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/searchNearbyHospitals \
  -H "Content-Type: application/json" \
  -d '{"latitude": 12.9716, "longitude": 77.5946, "radiusKm": 5}'
```

## Monitoring & Logs

### View Logs
```bash
firebase functions:log
```

### View Specific Function Logs
```bash
firebase functions:log --only processIncidentWithAI
```

### Real-time Logs
```bash
firebase functions:log --only processIncidentWithAI --stream
```

## Common Issues & Fixes

### 1. Missing API Keys
**Error:** `GEMINI_API_KEY is not defined`

**Fix:**
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase deploy --only functions
```

### 2. Billing Not Enabled
**Error:** `Firebase needs billing enabled`

**Fix:**
- Go to Firebase Console → Settings → Billing
- Upgrade to Blaze plan (pay-as-you-go)

### 3. Function Timeout
**Error:** `Function execution took too long`

**Fix:** Increase timeout in `functions/src/index.ts`:
```typescript
export const processIncidentWithAI = functions
  .runWith({ timeoutSeconds: 300 }) // 5 minutes
  .https.onCall(async (data, context) => {
    // ...
  });
```

### 4. CORS Errors
**Fix:** Already handled in functions with proper headers:
```typescript
response.set('Access-Control-Allow-Origin', '*');
```

## Cost Optimization

### Free Tier Limits (Blaze Plan)
- 2 million invocations/month
- 400,000 GB-seconds compute time
- 200,000 CPU-seconds
- 5GB outbound networking

### Tips to Stay in Free Tier
1. Use Firestore triggers instead of HTTP for internal ops
2. Cache API responses when possible
3. Implement rate limiting
4. Use appropriate timeouts

## Production Checklist

- [ ] Environment variables configured
- [ ] Billing enabled on Firebase project
- [ ] Functions deployed successfully
- [ ] Frontend URLs updated
- [ ] Test functions with real data
- [ ] Monitor logs for errors
- [ ] Set up error alerts
- [ ] Document function URLs for team

## Quick Deploy Script

Create `deploy.sh` in project root:
```bash
#!/bin/bash
cd functions
npm run build
cd ..
firebase deploy --only functions
echo "✅ Functions deployed successfully!"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

## Need Help?

- Firebase Docs: https://firebase.google.com/docs/functions
- Genkit Docs: https://firebase.google.com/docs/genkit
- Check logs: `firebase functions:log --stream`
