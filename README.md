# 🐾 SafePaw - Dog Bite Incident Tracking & Prevention Platform

**Real-time dog bite incident tracking and prevention platform for India**

SafePaw is a comprehensive web application that helps citizens report dog bite incidents, enables government bodies to manage and respond to reports, and provides legal aid resources for victims. Built with React, Firebase, and Google Maps.

---

## 🚨 Problem Statement

Dog bite incidents and rabies deaths remain a critical public health challenge in India. Despite prevention efforts, the numbers continue to rise, with vulnerable populations—children, elderly, and differently-abled citizens—being the worst affected.

### 2025 State-Specific Statistics

**Tamil Nadu**
- 5.25 lakh (525,000) dog bite cases reported
- 28 rabies deaths recorded
- Vulnerable groups: Children, elderly, and differently-abled citizens most affected

**Kerala**
- 23 rabies deaths in first 7 months of 2025
- Continuing trend of high incident rates

**Karnataka**
- Over 2.3 lakh (230,000) dog bite cases (January-June 2025)
- At least 19 confirmed rabies deaths
- Significant increase from previous years

**Maharashtra**
- Over 56,000 dog bite cases in January 2025 alone
- 30 rabies deaths reported (2021-2023 period)
- High-density urban areas most affected

### The Challenge

- **Delayed Response**: Many incidents go unreported or receive delayed government action
- **Resource Allocation**: Inefficient distribution of rescue teams and veterinary services
- **Lack of Coordination**: No centralized system for tracking and managing incidents
- **Prevention Gaps**: Insufficient data for identifying high-risk areas and implementing ABC programs
- **Victim Support**: Limited awareness of legal rights and compensation procedures

### SafePaw's Solution

SafePaw addresses these challenges through:
- **Real-time Incident Reporting** with GPS tracking and photo evidence
- **AI-Powered Prioritization** using multi-agent system for urgent case identification
- **Automated Escalation** for incidents delayed >24 hours
- **Resource Optimization** through intelligent allocation of government resources
- **Data-Driven Insights** for prevention and ABC program planning
- **Legal Aid Support** with compensation calculator and rights information

### For Citizens
- **📍 Report Incidents** - Quick incident reporting with GPS auto-detection, photo upload, and severity selection
- **🗺️ Risk Heatmap** - Interactive Google Maps showing color-coded incident locations
- **🚨 Emergency Help** - First aid guidance and nearest hospitals with rabies vaccine availability
- **⚖️ Legal Aid** - Compensation calculator based on Indian laws, rights information, and required documents
- **📊 My Reports** - Track all submitted reports with real-time status updates

### For Government Officials
- **📈 Dashboard** - Key metrics including total incidents, pending actions, resolution rates
- **🔍 Incident Management** - Review and update incident reports with filtering by status/severity
- **🤖 AI-Powered Prioritization** - Automatic incident priority scoring (1-10 scale) using multi-agent AI
- **📋 Smart Action Recommendations** - AI-suggested actions based on severity and context
- **🚑 Resource Allocation** - Automated assignment of rescue teams, vets, and animal control
- **⏰ Automatic Escalation** - Auto-contact system for incidents delayed >24 hours via SMS/Email
- **✂️ ABC Program Tracking** - Monitor Animal Birth Control sterilization statistics and drives
- **📊 Analytics & Reports** - Data insights, trends, and export functionality

### Core Features
- ✅ Role-based authentication (Citizen & Government)
- ✅ Anonymous incident reporting
- ✅ Real-time data synchronization
- ✅ Secure photo uploads to Firebase Storage
- ✅ Geolocation-based incident mapping
- ✅ Responsive design (mobile & desktop)
- ✅ Smooth animations and modern UI

### AI-Powered Features (Genkit AI)
- 🤖 **Multi-Agent AI System** - 4 specialized agents working together
- 🎯 **Smart Prioritization** - Automatic incident scoring (1-10 scale)
- 📋 **Action Recommendations** - AI-suggested government actions
- 🚑 **Resource Allocation** - Intelligent assignment of rescue teams, vets, animal control
- ⏰ **Auto-Escalation** - Detects incidents delayed >24 hours
- 📧 **Automated Notifications** - SMS/Email to government agents
- 📊 **AI Dashboard** - Real-time agent actions and history
- ✅ **Approve/Override** - Government can approve or override AI recommendations

---

## 🤖 Genkit AI Multi-Agent System

SafePaw uses **Google Genkit** with **Gemini AI** to power an intelligent multi-agent system:

### The 4 AI Agents

1. **Priority Analyzer Agent**
   - Calculates incident urgency (1-10 scale)
   - Considers: severity, location risk, time urgency, resource availability
   - Output: Priority score + urgency level (low/medium/high/critical)

2. **Action Coordinator Agent**
   - Recommends specific government actions
   - Based on: incident severity and priority
   - Output: List of actions with priority levels and estimated times

3. **Resource Manager Agent**
   - Allocates available resources
   - Resources: rescue teams, veterinarians, animal control
   - Output: Assigned resources with distance calculations

4. **Escalation Monitor Agent**
   - Monitors incidents for delays >24 hours
   - Triggers automatic escalation
   - Output: List of delayed incidents requiring attention

### How It Works

```
New Incident → Priority Analyzer → Action Coordinator → Resource Manager → Update Firestore
                                                                              ↓
                                                                    Government Dashboard
                                                                              ↓
                                                              Approve/Override AI Actions
```

**Automatic Escalation Flow:**
```
Hourly Check → Escalation Monitor → Detect Delays >24h → Update Status → Contact Agents (SMS/Email)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Google Maps JavaScript API
- **Fonts**: Fraunces, Inter
- **State Management**: React Hooks
- **Real-time Updates**: Firestore onSnapshot listeners

### Backend (Serverless)
- **Runtime**: Node.js (Firebase Functions v2)
- **Language**: TypeScript
- **Authentication**: Firebase Auth (Email/Password & Phone OTP)
- **Database**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage (Cloud Storage)
- **Analytics**: Firebase Analytics
- **Functions**: Firebase Cloud Functions v2
- **Scheduled Tasks**: Cloud Scheduler (hourly checks)

### AI & Machine Learning
- **AI Framework**: Google Genkit (v1.27.0)
- **AI Model**: Google Gemini AI (via Google AI Studio)
- **Multi-Agent System**: 4 specialized AI agents
  - Priority Analyzer Agent
  - Action Coordinator Agent
  - Resource Manager Agent
  - Escalation Monitor Agent
- **Schema Validation**: Zod (for AI tool inputs/outputs)
- **AI Features**:
  - Automatic incident priority scoring (1-10 scale)
  - Smart action recommendations
  - Resource allocation optimization
  - Automatic escalation detection (>24 hours)

### Communication & Notifications
- **SMS**: Twilio API
- **Email**: Nodemailer (SMTP)
- **Real-time**: Firestore real-time listeners

### Google Cloud Services
- **Firebase Platform**:
  - Firebase Authentication
  - Cloud Firestore
  - Cloud Storage for Firebase
  - Firebase Cloud Functions
  - Firebase Analytics
- **Google AI**:
  - Gemini AI (via Google AI Studio)
  - Genkit AI Framework
- **Google Maps Platform**:
  - Maps JavaScript API
  - Geocoding API (optional)
  - Places API (optional)

---

## 📁 Project Structure

```
SafePaw/
├── firebase.json                    # Firebase configuration
├── firestore.rules                  # Database security rules
├── storage.rules                    # Storage security rules
├── firestore.indexes.json           # Query optimization indexes
├── Guides/
│   ├── Project_Requirements.md      # Complete project requirements
│   ├── System_Architecture.html     # System architecture diagram
│   └── User_flow.html              # User flow diagrams
├── functions/                       # 🤖 AI Multi-Agent System
│   ├── src/
│   │   ├── agents/                 # AI Agent modules
│   │   │   ├── priorityAnalyzer.ts
│   │   │   ├── actionCoordinator.ts
│   │   │   ├── resourceManager.ts
│   │   │   └── escalationMonitor.ts
│   │   ├── services/               # Business logic
│   │   │   ├── orchestrator.ts
│   │   │   ├── contactService.ts
│   │   │   └── notificationService.ts
│   │   ├── types/                  # TypeScript types
│   │   ├── utils/                  # Helper functions
│   │   └── index.ts                # Cloud Functions
│   ├── package.json
│   ├── .env.example                # API keys template
│   ├── README.md                   # Functions documentation
│   └── ARCHITECTURE.md             # Architecture guide
└── frontend/
    ├── config/
    │   └── firebase.ts              # Firebase credentials
    ├── lib/
    │   └── firebase.ts              # Firebase initialization
    ├── services/
    │   ├── authService.ts           # Authentication logic
    │   └── incidentService.ts       # Database operations
    ├── components/
    │   ├── AuthPage.tsx             # Login & Signup pages
    │   ├── Dashboard.tsx            # Citizen Dashboard (6 pages)
    │   ├── GovDashboard.tsx         # Government Dashboard (4 pages)
    │   ├── MapComponent.tsx         # Google Maps integration
    │   ├── Navbar.tsx               # Navigation bar
    │   ├── Hero.tsx                 # Landing page hero
    │   └── Footer.tsx               # Footer
    ├── App.tsx                      # Main application
    ├── index.html                   # HTML entry point
    ├── package.json                 # Dependencies
    └── vite.config.ts               # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account
- Google Maps API key (optional, for maps)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SafePaw
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up Firebase**
   
   Follow the detailed guide in `firebase_setup_guide.md`:
   - Create Firebase project
   - Enable Authentication (Email/Password & Phone)
   - Create Firestore database
   - Enable Firebase Storage
   - Copy your Firebase configuration

4. **Add Firebase credentials**
   
   Update `frontend/config/firebase.ts`:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

5. **Deploy Firebase security rules**
   ```bash
   cd ..
   firebase login
   firebase init
   firebase deploy --only firestore:rules,storage:rules
   ```

6. **Add Google Maps API key (optional)**
   
   Update `frontend/components/MapComponent.tsx` line 85:
   ```typescript
   script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_KEY&libraries=places`;
   ```

7. **Run the development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 🔐 Authentication

### Citizen Signup
- Full Name
- Phone Number (10 digits)
- Email
- Password (minimum 6 characters)

### Government Signup
- Full Name
- Official Email
- Government ID Card Number
- Ward Number
- State
- City
- Gender
- Password (minimum 6 characters)

### Login
- Email + Password (works for both roles)

All data is securely stored in Firebase Firestore with role-based access control.

---

## 📊 Database Structure

### Collections

#### `users`
```typescript
{
  uid: string,
  email: string,
  phone?: string,
  role: 'citizen' | 'government' | 'ngo',
  name: string,
  createdAt: timestamp,
  // Government-specific fields
  govtId?: string,
  wardNo?: string,
  state?: string,
  city?: string,
  gender?: 'male' | 'female' | 'other',
  organization?: string
}
```

#### `incidents`
```typescript
{
  id: string,
  userId: string,
  userName: string,
  location: {
    address: string,
    coordinates: geopoint
  },
  dogType: 'Stray' | 'Pet' | 'Unknown',
  severity: 'Minor' | 'Moderate' | 'Severe',
  description: string,
  photos: string[],
  status: 'Reported' | 'Under Review' | 'Action Taken' | 'Resolved',
  createdAt: timestamp,
  updatedAt: timestamp,
  reviewedBy?: string,
  actionTaken?: string,
  anonymous: boolean
}
```

---

## 🔒 Security

### Firestore Security Rules
- Role-based access control
- Users can only edit their own reports
- Government officials can update any incident
- Anonymous reporting supported
- Authenticated-only access

### Storage Security Rules
- 5MB file size limit
- Image files only (.jpg, .png, .gif)
- User-specific upload paths
- Public read access for incident photos

---

## 🧪 Testing

### Test Accounts

After setting up Firebase, create test accounts:

**Citizen Account:**
- Email: `citizen@test.com`
- Password: `test123`

**Government Account:**
- Email: `govt@test.com`
- Password: `test123`

### Test Features
- ✅ Sign up with email/password
- ✅ Submit incident report with photo
- ✅ View incidents on map
- ✅ Calculate compensation (Legal Aid)
- ✅ Government: Update incident status
- ✅ Government: View analytics

---

## 📖 Documentation

- **Setup Guide**: `firebase_setup_guide.md`
- **Project Requirements**: `Guides/Project_Requirements.md`
- **System Architecture**: `Guides/System_Architecture.html`
- **User Flows**: `Guides/User_flow.html`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Google Maps** - Mapping services
- **Lucide** - Icon library
- **Framer Motion** - Animation library
- **Tailwind CSS** - Styling framework

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@safepaw.in (example)

---

## 🎯 Key Features Highlight

### Legal Aid Calculator
First-of-its-kind compensation calculator for dog bite victims in India, based on:
- IPC Section 289 (Negligent conduct with animal)
- IPC Section 337/338 (Causing hurt)
- Municipal Corporation liability
- National Rabies Control Programme

### Real-time Risk Heatmap
Color-coded incident visualization:
- 🔴 **Red** - Severe incidents
- 🟠 **Orange** - Moderate incidents
- 🟢 **Green** - Minor incidents

### Anonymous Reporting
Protect victim identity while still enabling government response.

---

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create `.env.local` in `frontend/` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## 🐛 Known Issues

- Google Maps requires API key to display (placeholder shown otherwise)
- Phone OTP requires reCAPTCHA setup
- Analytics only works in production

---

## 🌟 Star History

If you find SafePaw useful, please consider giving it a star ⭐

---

**Built with ❤️ for safer communities in India**

**SafePaw** - Making India safer, one report at a time. 🐾
