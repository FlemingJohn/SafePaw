# SafePaw Multi-Agent Incident Response System

## Overview

An AI-powered multi-agent system for SafePaw that automatically prioritizes and manages animal incidents using Google's Gemini AI. The system features automatic escalation when incidents are delayed more than 24 hours, with automated SMS/email notifications to government agents.

## Architecture

### 3 Specialized AI Agents

1. **Priority Analyzer** - Calculates incident urgency (1-10 scale) based on:
   - Severity level (Minor/Moderate/Severe)
   - Location risk
   - Time urgency
   - Resource availability

2. **Action Coordinator** - Recommends specific government actions:
   - Emergency rescue dispatch
   - Veterinary hospital alerts
   - Animal control coordination
   - Shelter availability checks

3. **Resource Manager** - Allocates available resources:
   - Rescue teams
   - Veterinarians
   - Animal control units

### Cloud Functions

| Function | Type | Description |
|----------|------|-------------|
| `processIncidentWithAI` | HTTP | Manually trigger AI analysis for an incident |
| `onIncidentCreated` | Firestore Trigger | Automatically process new incidents |
| `checkDelayedIncidents` | Scheduled (hourly) | Detect and escalate incidents delayed >24 hours |
| `autoContactGovernment` | HTTP | Manually trigger government agent notifications |
| `searchNearbyHospitals` | HTTP | Find nearby hospitals with rabies vaccine |

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required API keys:
- **Google AI API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Twilio** (for SMS): Get from [Twilio Console](https://www.twilio.com/console)
- **Email** (Gmail SMTP): Use app-specific password

### 3. Deploy to Firebase

```bash
# Build TypeScript
npm run build

# Deploy all functions
npm run deploy

# Or deploy specific function
firebase deploy --only functions:processIncidentWithAI
```

### 4. Set up Firestore Collections

Create these collections in Firebase Console:

#### `governmentAgents`
```json
{
  "name": "John Doe",
  "role": "supervisor",
  "contactInfo": {
    "phone": "+1234567890",
    "email": "john@example.com",
    "preferredMethod": "both"
  },
  "availability": "on_duty",
  "jurisdiction": { "_latitude": 12.9716, "_longitude": 77.5946 },
  "maxConcurrentIncidents": 5,
  "currentIncidents": []
}
```

#### `governmentResources`
```json
{
  "type": "rescue_team",
  "name": "Emergency Rescue Team Alpha",
  "location": { "_latitude": 12.9716, "_longitude": 77.5946 },
  "availability": "available",
  "capabilities": ["rescue", "first_aid", "transport"],
  "contactInfo": {
    "phone": "+1234567890",
    "email": "rescue@example.com"
  }
}
```

## Usage

### Automatic Processing

When a new incident is reported, the system automatically:
1. Analyzes priority (Priority Analyzer Agent)
2. Recommends actions (Action Coordinator Agent)
3. Allocates resources (Resource Manager Agent)
4. Updates Firestore with AI recommendations

### Manual Processing

Trigger AI analysis via HTTP:

```bash
curl -X POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/processIncidentWithAI \
  -H "Content-Type: application/json" \
  -d '{"incidentId": "abc123"}'
```

### Automatic Escalation

The `checkDelayedIncidents` function runs every hour:
- Identifies incidents with no action for >24 hours
- Updates `escalationStatus` to 'escalated'
- Contacts on-duty government agents via SMS/Email
- Logs all contact attempts

### Manual Escalation

Trigger government contact manually:

```bash
curl -X POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/autoContactGovernment \
  -H "Content-Type: application/json" \
  -d '{"incidentId": "abc123"}'
```

## Firestore Schema Updates

### Incident Document (New Fields)

```typescript
{
  // Existing fields...
  priority: number,              // 1-10 scale (AI-calculated)
  aiRecommendations: [
    {
      id: string,
      agentType: 'priority' | 'action' | 'resource',
      recommendation: string,
      confidence: number,
      timestamp: Timestamp,
      status: 'pending' | 'approved' | 'overridden' | 'executed'
    }
  ],
  assignedResources: [
    {
      id: string,
      type: 'rescue_team' | 'veterinarian' | 'animal_control',
      name: string,
      assignedAt: Timestamp,
      status: 'assigned' | 'en_route' | 'on_site' | 'completed'
    }
  ],
  escalationStatus: 'normal' | 'escalated' | 'auto_contacted',
  lastActionTimestamp: Timestamp,
  escalatedAt?: Timestamp,
  autoContactedAgents?: string[]
}
```

## Testing

### Local Emulator

```bash
cd functions
npm run serve
```

Then test with:
```bash
# Create test incident in Firestore emulator
# Watch logs for automatic processing
```

### Production Testing

1. Create a test incident via SafePaw frontend
2. Check Firebase Console → Firestore → incidents
3. Verify AI recommendations appear
4. Wait 24+ hours or manually trigger escalation
5. Check SMS/Email delivery

## Monitoring

View function logs:
```bash
npm run logs
```

Or in Firebase Console:
- Functions → Logs
- Filter by function name

## Cost Considerations

- **Google AI (Gemini)**: Free tier available
- **Twilio SMS**: ~$0.0075 per SMS
- **Email**: Free (using Gmail SMTP)
- **Cloud Functions**: Free tier: 2M invocations/month
- **Scheduled Functions**: Runs 24 times/day = 720/month (well within free tier)

## Troubleshooting

### SMS not sending
- Check Twilio credentials in `.env`
- Verify phone number format (+1234567890)
- Check Twilio account balance

### Email not sending
- Use Gmail app-specific password (not regular password)
- Enable "Less secure app access" if needed
- Check EMAIL_HOST and EMAIL_PORT

### AI tools failing
- Verify GOOGLE_AI_API_KEY is set
- Check API quota limits
- Review function logs for errors

## Security Notes

- Never commit `.env` file to git
- Use Firebase environment config for production:
  ```bash
  firebase functions:config:set google.ai_key="YOUR_KEY"
  ```
- Restrict Cloud Function access with authentication
- Use Firestore security rules to protect data

## Next Steps

1. ✅ Backend implementation complete
2. 🔄 Frontend integration (government dashboard)
3. 🔄 Testing and verification
4. 🔄 Production deployment

## Support

For issues or questions, check:
- Implementation plan: `implementation_plan.md`
- Task checklist: `task.md`
- Firebase Functions logs
