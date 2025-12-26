# AI Actions Demo Setup

## Quick Start: Add AI Recommendations to Incidents

To populate the AI Actions page with demo data, run:

```bash
node addAIRecommendations.js
```

## What This Does

The script adds realistic AI recommendations to your existing incidents, simulating what the backend Firebase Function would do. Each incident gets:

### 1. **Priority Analyzer** 
- Calculates priority score (1-10) based on severity
- Factors: severity, location risk, time urgency
- Confidence: ~92%

### 2. **Action Coordinator**
- Recommends specific government actions
- Varies by severity (immediate dispatch vs scheduled visit)
- Confidence: ~85-88%

### 3. **Resource Manager**
- Assigns nearest animal control unit
- Allocates veterinarian resources
- Estimates response time
- Confidence: ~91%

### 4. **Escalation Monitor** (for severe cases)
- Auto-escalates high-priority incidents
- Triggers supervisor/health department notifications
- Confidence: ~95%

## AI Recommendation Structure

Each recommendation includes:
```json
{
  "id": "incident_id_agentType",
  "agentType": "priority|action|resource|escalation",
  "recommendation": "Human-readable action text",
  "status": "pending|approved|executed|overridden",
  "confidence": 0.85,
  "timestamp": "Firestore Timestamp",
  "metadata": {
    // Agent-specific data
  }
}
```

## Status Types

- **pending** - Awaiting government review (gray badge)
- **processing** - AI analysis in progress (blue badge)
- **approved** - Approved by official (green badge)
- **overridden** - Official chose different action (orange badge)
- **executed** - Action completed (green badge)

## Viewing the Demo

1. Run the script to add AI recommendations
2. Open Government Portal → AI Actions
3. You'll see:
   - Total Actions count
   - Approved/Pending/Overridden stats
   - Action history cards with agent details
   - Confidence scores
   - Incident references

## Customizing Recommendations

Edit `addAIRecommendations.js` to:
- Change priority calculations
- Modify action recommendations
- Adjust confidence scores
- Add new agent types
- Customize metadata

## Resetting Data

To remove AI recommendations and start fresh:
```javascript
// Delete aiRecommendations field from incidents
await db.collection('incidents').get().then(snapshot => {
  snapshot.forEach(doc => {
    doc.ref.update({
      aiRecommendations: admin.firestore.FieldValue.delete()
    });
  });
});
```
