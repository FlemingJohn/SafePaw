# Security: Migrating to Firebase Secret Manager

## Why Migrate?

Currently, sensitive credentials (API keys, passwords) are stored in `.env` files which can be:
- Accidentally committed to git
- Exposed in logs
- Not encrypted at rest

## Migration Steps

### 1. Install Firebase CLI (if not already)
```bash
npm install -g firebase-tools
firebase login
```

### 2. Set Secrets

```bash
# Navigate to functions directory
cd functions

# Set Google AI API Key
firebase functions:secrets:set GOOGLE_AI_API_KEY
# When prompted, paste your API key

# Set Twilio credentials
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER

# Set Email credentials
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
```

### 3. Update functions/src/index.ts

Add at the top:
```typescript
import { defineSecret } from 'firebase-functions/params';

// Define secrets
const googleAIKey = defineSecret('GOOGLE_AI_API_KEY');
const twilioSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhone = defineSecret('TWILIO_PHONE_NUMBER');
const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');
```

Update Genkit initialization:
```typescript
const ai = genkit({
    plugins: [googleAI({ apiKey: googleAIKey.value() })],
});
```

Update function declarations to include secrets:
```typescript
exports.processIncidentWithAI = onRequest(
    {
        cors: { /* ... */ },
        secrets: [googleAIKey],  // Add this
        maxInstances: 10,
        timeoutSeconds: 60,
        memory: '512MiB'
    },
    async (req, res) => { /* ... */ }
);
```

### 4. Update notificationService.ts

```typescript
import { defineSecret } from 'firebase-functions/params';

const twilioSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhone = defineSecret('TWILIO_PHONE_NUMBER');
const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');

// Use in code:
const client = twilio(twilioSid.value(), twilioToken.value());
```

### 5. Deploy

```bash
firebase deploy --only functions
```

### 6. Clean Up

After successful deployment:
```bash
# Remove .env file (keep .env.example for reference)
rm .env

# Verify .gitignore includes .env
echo ".env" >> .gitignore
```

## Benefits

✅ **Encrypted at rest** - Secrets stored securely by Google  
✅ **No accidental commits** - Not in codebase  
✅ **Audit logging** - Track secret access  
✅ **Version control** - Secret versioning built-in  
✅ **Access control** - IAM-based permissions  

## Cost

- **Free tier**: 10,000 secret accesses/month
- **After**: $0.03 per 10,000 accesses

For SafePaw's usage, this will be **FREE**.

## Verification

After deployment, check:
```bash
firebase functions:secrets:access GOOGLE_AI_API_KEY
```

## Rollback

If issues occur:
```bash
# Temporarily use .env while debugging
cp .env.example .env
# Fill in values
# Redeploy
```

## Security Note

⚠️ **Never commit .env files to git**  
⚠️ **Rotate secrets if exposed**  
⚠️ **Use different secrets for dev/prod**
