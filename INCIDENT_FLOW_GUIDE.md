# Incident Reporting Flow - Implementation Guide

## 🔄 Complete Flow

```
Citizen Report Form
        ↓
   Firestore Save
        ↓
   AI Trigger (Cloud Function)
        ↓
   Multi-Agent Processing
   ├─ Priority Analyzer
   ├─ Action Coordinator
   ├─ Resource Manager
   └─ Escalation Monitor
        ↓
   Update Firestore with AI Results
        ↓
   Government Portal (Real-time)
```

## ✅ What's Implemented

### 1. Report Form (Dashboard.tsx)
- ✅ Location detection (GPS)
- ✅ Dog type selection (Stray/Pet)
- ✅ Severity selection (Minor/Moderate/Severe)
- ✅ Photo upload (UI ready)
- ✅ Description field
- ✅ Form validation
- ✅ Loading states
- ✅ Success feedback

### 2. Firestore Integration (incidentService.ts)
- ✅ Save incident to `incidents` collection
- ✅ Auto-generate document ID
- ✅ Set timestamps (createdAt, updatedAt)
- ✅ Set initial status: "Reported"
- ✅ User authentication check

### 3. AI Trigger (incidentService.ts)
- ✅ Automatic Cloud Function call
- ✅ Pass incident ID to AI agents
- ✅ Error handling (non-blocking)
- ✅ Logging for debugging

### 4. AI Agents (Already Implemented)
- ✅ Priority Analyzer - Scores 1-10
- ✅ Action Coordinator - Recommends actions
- ✅ Resource Manager - Assigns resources
- ✅ Escalation Monitor - Detects delays

### 5. Government Portal (GovDashboard.tsx)
- ✅ Real-time incident list
- ✅ AI recommendations display
- ✅ Priority badges
- ✅ Approve/Override actions

## 📊 Data Flow

### Incident Document Structure
```typescript
{
  id: "auto-generated",
  userId: "user-uid",
  userName: "John Doe",
  userPhone: "+91XXXXXXXXXX",
  location: {
    address: "lat, lng",
    coordinates: GeoPoint(lat, lng)
  },
  dogType: "Stray" | "Pet",
  severity: "Minor" | "Moderate" | "Severe",
  description: "Optional details",
  photos: ["url1", "url2"],
  status: "Reported",
  anonymous: false,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // AI-added fields (after processing)
  priority: {
    priority: 8,
    urgencyLevel: "high",
    reasoning: "..."
  },
  aiRecommendations: [
    {
      id: "rec-1",
      action: "Deploy rescue team",
      priority: "high",
      estimatedTime: "30 minutes",
      status: "pending"
    }
  ],
  assignedResources: [
    {
      type: "rescue_team",
      name: "Team Alpha",
      distance: "2.5 km",
      eta: "15 minutes"
    }
  ],
  escalationStatus: "normal"
}
```

## 🔧 Configuration Required

### 1. Environment Variables
Create `frontend/.env.local`:
```env
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-safepaw-27023.cloudfunctions.net
```

### 2. Firebase Rules (Already Set)
- ✅ Authenticated users can create incidents
- ✅ Government users can read all incidents
- ✅ AI agents have access via Cloud Functions

## 🧪 Testing the Flow

### Step 1: Submit Report
1. Go to Citizen Dashboard
2. Click "Report Incident"
3. Fill in the form:
   - Click GPS button for location
   - Select dog type
   - Select severity
   - Add description
4. Click "Submit Report"

### Step 2: Verify Firestore
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check `incidents` collection
4. Verify new document created

### Step 3: Check AI Processing
1. Check browser console for logs
2. Look for: "AI processing triggered successfully"
3. Wait 5-10 seconds for AI to process

### Step 4: View in Government Portal
1. Switch to Government Dashboard
2. Go to "Incident Management"
3. See new incident with:
   - Priority badge (1-10)
   - AI recommendations
   - Assigned resources

## 🐛 Troubleshooting

### Issue: "User must be authenticated"
**Solution**: Make sure you're logged in before submitting

### Issue: "AI processing failed"
**Solution**: 
- Check if Cloud Functions are deployed
- Verify VITE_FIREBASE_FUNCTIONS_URL is correct
- Check browser console for errors

### Issue: "Location detection failed"
**Solution**: 
- Allow location permissions in browser
- Or manually enter coordinates

### Issue: Incident not showing in Gov Portal
**Solution**:
- Check Firestore rules
- Verify government user is logged in
- Refresh the page

## 📝 Next Steps (Optional Enhancements)

### Photo Upload to Storage
```typescript
// In handleSubmit, before submitIncident:
const photoUrls: string[] = [];
for (const photo of photos) {
  const storageRef = ref(storage, `incidents/${user.uid}/${Date.now()}_${photo.name}`);
  await uploadBytes(storageRef, photo);
  const url = await getDownloadURL(storageRef);
  photoUrls.push(url);
}
```

### Geocoding (Address → Coordinates)
```typescript
// Use Google Maps Geocoding API
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=YOUR_API_KEY`
  );
  const data = await response.json();
  return data.results[0].geometry.location;
};
```

### Real-time Updates
```typescript
// Listen to incident updates
const unsubscribe = onSnapshot(
  doc(db, 'incidents', incidentId),
  (doc) => {
    console.log('Incident updated:', doc.data());
  }
);
```

## 🎯 Summary

The complete flow is now implemented:
1. ✅ Citizen submits report via form
2. ✅ Data saved to Firestore
3. ✅ AI agents automatically triggered
4. ✅ AI processes and adds recommendations
5. ✅ Government sees incident with AI insights
6. ✅ Government can approve/override AI actions

**Status**: READY TO TEST! 🚀
