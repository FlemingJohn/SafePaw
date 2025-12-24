# SafePaw - Product Requirements Document

## 1. Executive Summary

**App Name:** SafePaw  
**Tagline:** Real-time dog bite incident tracking and prevention platform  
**Version:** 1.0  
**Platform:** Web Application (Progressive Web App)  
**Backend:** Firebase  
**Framework:** React + Vite

**One-Line Pitch:**  
A real-time public safety app to report, track, and prevent dog bite incidents while ensuring humane stray dog management and government accountability.

---

## 2. Problem Statement

### Current Challenges
- **20,000+ annual dog bite deaths** in India (rabies-related)
- No centralized incident tracking system
- Citizens unaware of high-risk zones
- Municipal corporations lack data for action
- Delayed rabies treatment due to poor hospital info
- Zero accountability in government response

### Impact
- Lives lost due to lack of timely intervention
- Families face trauma without legal support
- Ineffective stray dog management

---

## 3. Target Users

### Primary Users
1. **General Public** (Citizens, parents, students)
   - Report incidents
   - Check risk zones before traveling
   - Find emergency help

2. **Government Bodies** (Municipal Corporations, Health Dept)
   - Monitor hotspots
   - Track ABC program effectiveness
   - Allocate resources

3. **NGOs & Animal Welfare Organizations**
   - Coordinate sterilization drives
   - Track stray dog populations

4. **Victims & Legal Aid**
   - Document incidents for compensation claims
   - Access legal resources

---

## 4. Core Features

### 4.1 Incident Reporting (MVP)
- **Quick Report**: One-tap incident logging with GPS
- **Details Capture**: 
  - Type: Stray/Pet
  - Severity: Minor/Moderate/Severe
  - Photo/Video upload
  - Victim details (optional)
- **Anonymous Reporting**: Option to report without identity
- **Offline Support**: Queue reports when no internet

### 4.2 Live Risk Heatmap (MVP)
- **Color-coded zones**:
  - Red: High risk (5+ incidents/month)
  - Orange: Medium risk (2-4 incidents/month)
  - Green: Safe zones
- **Filter by timeframe**: 7 days, 30 days, 6 months
- **Cluster visualization**: Show incident density

### 4.3 Emergency Rabies Help (MVP)
- **Nearest Hospitals**: Government + private with rabies vaccine
- **Vaccine Availability**: Real-time stock status
- **First Aid Guide**: WHO-recommended steps
- **One-tap Call**: Direct dial emergency numbers

### 4.4 Government Action Tracking (MVP)
- **Status Updates**: Reported → Under Review → Action Taken → Closed
- **ABC Program Data**: Sterilization stats by area
- **Response Time Metrics**: Average time to action

### 4.5 Legal & Compensation Support (Phase 2)
- **Eligibility Checker**: Can you claim compensation?
- **Document Checklist**: Medical reports, FIR, photos
- **Case Precedents**: Past successful claims
- **Lawyer Connect**: Directory of legal aid

### 4.6 AI-Powered Features (Phase 2)
- **Predictive Risk Zones**: ML model predicts future hotspots
- **Fake Report Detection**: Flags suspicious patterns
- **Smart Alerts**: Notify users entering high-risk areas

---

## 5. User Flows

### Flow 1: Incident Reporting (Citizen)
```
1. User opens SafePaw app
2. Taps "Report Incident" button (prominent on home screen)
3. Auto-detects GPS location (or manual pin drop)
4. Fills quick form:
   - Dog Type: Stray/Pet (radio buttons)
   - Severity: Minor/Bleeding/Severe (visual scale)
   - Upload Photo/Video (optional)
   - Add description (optional)
5. Reviews location on mini-map
6. Taps "Submit Report"
7. Success confirmation + Incident ID generated
8. Option to share report with municipal authorities
9. Notification: "We've alerted local authorities"
```

### Flow 2: Checking Risk Before Travel (Parent)
```
1. User opens SafePaw app
2. Views live heatmap on home screen
3. Searches destination address (or enters manually)
4. App shows:
   - Risk level (Red/Orange/Green badge)
   - Recent incidents count
   - Safe alternative routes (if high-risk)
5. User taps on red zone cluster
6. Sees list of recent incidents with details
7. Option to set up "Route Alerts" for daily commute
```

### Flow 3: Emergency Help After Bite (Victim)
```
1. User/Helper opens app in panic
2. Big red "EMERGENCY" button on home screen
3. One tap opens Emergency Screen:
   - First Aid Steps (large, clear text)
   - "Find Nearest Hospital" button
4. Taps hospital search
5. List of hospitals with:
   - Distance (sorted nearest first)
   - Vaccine availability (In Stock/Out of Stock)
   - Contact number (one-tap call)
   - Navigation button
6. User calls hospital or navigates via Google Maps
7. Option to report incident simultaneously
```

### Flow 4: Government Dashboard Access (Municipal Officer)
```
1. Officer logs in with government ID
2. Lands on Admin Dashboard:
   - Total incidents (today/week/month)
   - Pending actions count
   - Heatmap with severity filters
3. Taps on "Pending Incidents" tab
4. Sees list with:
   - Location, severity, date
   - Status: Reported/Under Review/Closed
5. Selects an incident
6. Reviews details + photos
7. Updates status:
   - "Mark Under Review" → "ABC team dispatched"
   - "Mark Resolved" → Add notes (e.g., "3 dogs sterilized")
8. Citizen gets notification: "Action taken on your report"
```

### Flow 5: NGO Coordination (Animal Welfare)
```
1. NGO logs in with verified account
2. Views heatmap filtered by "High Stray Population"
3. Identifies area needing ABC drive
4. Taps "Plan Sterilization Drive"
5. Fills form:
   - Target area (auto-filled from map)
   - Planned date
   - Number of dogs targeted
6. Submits plan
7. Municipality receives notification for approval
8. After drive, updates: "20 dogs sterilized"
9. Data reflects on public heatmap (reduces risk score over time)
```

---

## 6. Technical Architecture

### 6.1 Tech Stack

**Frontend (React Web)**
- **Framework**: React 18+ with Vite
- **Navigation**: React Router v6
- **State Management**: Context API + React Query
- **Maps**: Leaflet / Google Maps JavaScript API
- **Location**: Browser Geolocation API
- **Image Upload**: HTML5 File API with drag-and-drop
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **UI Components**: Custom component library

**Backend (Firebase)**
- **Authentication**: Firebase Auth (Phone OTP)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (images/videos)
- **Cloud Functions**: Node.js (for triggers, notifications)
- **Hosting**: Firebase Hosting (admin web dashboard)
- **Analytics**: Firebase Analytics
- **Push Notifications**: Firebase Cloud Messaging (FCM)

**Additional Services**
- **Maps API**: Google Maps JavaScript API / Leaflet with OpenStreetMap
- **ML**: TensorFlow.js (client-side image moderation)
- **Monitoring**: Firebase Performance Monitoring
- **PWA**: Service Workers for offline support
- **CDN**: Firebase Hosting with global CDN

---

### 6.2 Firebase Database Schema (Firestore)

```
/incidents (collection)
  /{incidentId} (document)
    - id: string
    - userId: string (reporter ID, null if anonymous)
    - location: geopoint
    - address: string
    - dogType: "stray" | "pet"
    - severity: "minor" | "moderate" | "severe"
    - description: string
    - photoURLs: array<string>
    - timestamp: timestamp
    - status: "reported" | "under_review" | "action_taken" | "closed"
    - governmentNotes: string
    - actionTimestamp: timestamp
    - upvotes: number (community verification)
    - isVerified: boolean

/users (collection)
  /{userId} (document)
    - uid: string
    - phoneNumber: string
    - name: string
    - role: "citizen" | "government" | "ngo"
    - email: string (optional)
    - createdAt: timestamp
    - reportCount: number

/hospitals (collection)
  /{hospitalId} (document)
    - name: string
    - location: geopoint
    - address: string
    - contactNumber: string
    - type: "government" | "private"
    - rabiesVaccineAvailable: boolean
    - lastUpdated: timestamp

/government_actions (collection)
  /{actionId} (document)
    - incidentId: string (reference)
    - municipality: string
    - action: "abc_drive" | "relocation" | "awareness_camp"
    - dogsAffected: number
    - notes: string
    - timestamp: timestamp
    - officerId: string

/risk_zones (collection) - Auto-generated by Cloud Function
  /{zoneId} (document)
    - geohash: string (for efficient geo queries)
    - incidentCount: number (last 30 days)
    - riskLevel: "high" | "medium" | "low"
    - lastUpdated: timestamp

/legal_resources (collection)
  /{resourceId} (document)
    - title: string
    - content: string
    - caseLinks: array<string>
    - category: "compensation" | "rights" | "procedures"
```

---

### 6.3 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Web Application                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Citizen  │  │Government│  │   NGO    │  │  Legal   │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                          │                                   │
│              React Context + React Query                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Firebase   │  │  Firestore   │  │   Storage    │     │
│  │     Auth     │  │   Database   │  │ (Images/Vids)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Cloud     │  │     FCM      │  │  Analytics   │     │
│  │  Functions   │  │(Push Notifs) │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Google Maps │  │   Geocoding  │  │  ML Kit      │     │
│  │     API      │  │     API      │  │ (Moderation) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.4 Cloud Functions (Firebase)

**Function 1: onIncidentCreate**
```javascript
// Triggered when new incident is reported
exports.onIncidentCreate = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    
    // 1. Update risk zone calculation
    await updateRiskZone(incident.location);
    
    // 2. Notify nearby users (within 2km)
    await notifyNearbyUsers(incident);
    
    // 3. Alert municipal authorities
    await notifyGovernment(incident);
    
    // 4. Check for image moderation
    if (incident.photoURLs.length > 0) {
      await moderateImages(incident.photoURLs);
    }
  });
```

**Function 2: calculateRiskZones**
```javascript
// Scheduled function (runs every 6 hours)
exports.calculateRiskZones = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    // Fetch incidents from last 30 days
    // Group by geohash (500m x 500m grid)
    // Calculate risk score based on:
    //   - Incident count
    //   - Severity weights
    //   - Time decay
    // Update risk_zones collection
  });
```

**Function 3: sendActionNotification**
```javascript
// Triggered when government updates incident status
exports.sendActionNotification = functions.firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status && after.status === 'action_taken') {
      // Send FCM notification to reporter
      await sendPushNotification(after.userId, {
        title: "Action Taken!",
        body: "Municipal authorities acted on your report."
      });
    }
  });
```

---

### 6.5 API Endpoints (Cloud Functions HTTP)

```
POST /api/report-incident
  - Body: { location, dogType, severity, photos, userId }
  - Returns: { incidentId, status: "success" }

GET /api/risk-zones?lat=28.7041&lng=77.1025&radius=5
  - Returns: Array of risk zones within radius (km)

GET /api/hospitals/nearest?lat=28.7041&lng=77.1025
  - Returns: Array of hospitals sorted by distance

POST /api/government/update-status
  - Body: { incidentId, status, notes, officerId }
  - Auth: Required (government role)
  - Returns: { success: true }

GET /api/incidents?status=pending&municipality=delhi-south
  - Auth: Required (government role)
  - Returns: Array of filtered incidents
```

---

## 7. Security & Privacy

### Authentication
- **Phone OTP** via Firebase Auth (primary)
- **Government Login**: Email + role verification
- **NGO Login**: Email + verification badge

### Data Privacy
- **Anonymous Reporting**: No user ID stored if opted
- **Location Fuzzing**: Exact GPS only visible to government
- **Photo Moderation**: Auto-blur faces using ML Kit
- **GDPR Compliance**: User data deletion on request

### Authorization Rules (Firestore)
```javascript
// Citizens: Can create incidents, read public data
// Government: Can update incident status, read all data
// NGOs: Can read data, create action plans
match /incidents/{incidentId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth.token.role == "government";
}
```

---

## 8. Success Metrics (KPIs)

### User Engagement
- Daily Active Users (DAU)
- Incidents reported per day
- Heatmap views per user session

### Impact Metrics
- Response time: Reported → Action Taken
- % of incidents resolved within 7 days
- Reduction in repeat incidents (same area)

### Government Accountability
- % of incidents with status updates
- Average government response time
- ABC drives conducted per month

### Safety Outcomes
- Reduction in dog bite deaths (annual comparison)
- User safety rating (pre/post using app)

---

## 9. Development Roadmap

### Phase 1 - MVP (Weeks 1-4)
- ✅ User authentication (Phone OTP)
- ✅ Incident reporting with GPS + photos
- ✅ Basic heatmap (last 30 days)
- ✅ Emergency hospital finder
- ✅ Government dashboard (basic)

### Phase 2 - Core Features (Weeks 5-8)
- ✅ Real-time notifications
- ✅ Government action tracking
- ✅ Risk zone calculations (Cloud Functions)
- ✅ NGO coordination module
- ✅ Offline incident queue

### Phase 3 - Advanced (Weeks 9-12)
- ✅ AI predictive zones
- ✅ Legal resource library
- ✅ Multi-language support (Hindi, Tamil, Bengali)
- ✅ Voice-based reporting (accessibility)

### Phase 4 - Scale (Post-Launch)
- Integration with municipal systems
- Government API for official data
- Expansion to other animal incidents (snakes, monkeys)

---

## 10. Hackathon Demo Script

### Opening (30 seconds)
"Every year, 20,000 Indians die from rabies after dog bites. There's no system to track these incidents or prevent them. Meet SafePaw."

### Live Demo (2 minutes)
1. **Show incident reporting**: "A bite happens → report in 30 seconds"
2. **Show heatmap**: "Parents check safe routes before school"
3. **Show emergency help**: "Victim finds nearest hospital with vaccine"
4. **Show government dashboard**: "Officials track and act on reports"

### Impact Statement (30 seconds)
"SafePaw creates accountability, saves lives, and respects animal welfare. It's already built and ready to deploy."

---

## 11. Future Enhancements

- **WhatsApp Integration**: Report via WhatsApp Bot
- **Blockchain**: Immutable incident records for legal cases
- **Wearable Alerts**: Smartwatch vibrations in high-risk zones
- **Community Patrol**: Gamification for local area monitoring
- **Pet Registry**: Track vaccinated pets to reduce false alarms

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** SafePaw Team

