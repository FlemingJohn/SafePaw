# 🐾 SafePaw - Dog Bite Incident Tracking & Prevention Platform

**Real-time dog bite incident tracking and prevention platform for India**

SafePaw is a comprehensive web application that helps citizens report dog bite incidents, enables government bodies to manage and respond to reports, and provides legal aid resources for victims. Built with React, Firebase, and Google Maps.

---

## 🌟 Features

### For Citizens
- **📍 Report Incidents** - Quick incident reporting with GPS auto-detection, photo upload, and severity selection
- **🗺️ Risk Heatmap** - Interactive Google Maps showing color-coded incident locations
- **🚨 Emergency Help** - First aid guidance and nearest hospitals with rabies vaccine availability
- **⚖️ Legal Aid** - Compensation calculator based on Indian laws, rights information, and required documents
- **📊 My Reports** - Track all submitted reports with real-time status updates

### For Government Officials
- **📈 Dashboard** - Key metrics including total incidents, pending actions, resolution rates
- **🔍 Incident Management** - Review and update incident reports with filtering by status/severity
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

### Backend (Serverless)
- **Authentication**: Firebase Auth (Email/Password & Phone OTP)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (optional)
- **Analytics**: Firebase Analytics

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

## 🎨 Design System

### Colors
- **Primary Brown**: `#8B4513`
- **Dark Brown**: `#2D2424`
- **Golden**: `#E9C46A`
- **Light Brown**: `#BC6C25`
- **Green**: `#8AB17D`
- **Cream Background**: `#FDFBF4`

### Typography
- **Headings**: Fraunces (serif)
- **Body**: Inter (sans-serif)

### Design Principles
- Brownish color theme throughout
- Smooth animations with Framer Motion
- Rounded corners and organic shapes
- Mobile-first responsive design
- Accessible and user-friendly

---

## 📱 Pages

### Citizen Dashboard (6 Pages)
1. **Home** - Overview with stats, activity feed, quick actions
2. **Report Incident** - GPS location, photo upload, severity selection
3. **Risk Heatmap** - Interactive map with color-coded markers
4. **Emergency Help** - First aid steps + hospital finder
5. **Legal Aid** - Compensation calculator, rights, documents
6. **My Reports** - Track submitted reports

### Government Dashboard (4 Pages)
1. **Home** - Key metrics and overview
2. **Incident Management** - Review and update reports
3. **ABC Program** - Sterilization tracking
4. **Analytics & Reports** - Data insights and exports

---

## 🌍 Deployment

### Firebase Hosting

1. **Build the app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   cd ..
   firebase deploy
   ```

3. **Your app is live!**
   ```
   https://your-project.web.app
   ```

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

## 🗺️ Roadmap

### Phase 1 ✅ (Complete)
- [x] Citizen Dashboard
- [x] Government Dashboard
- [x] Firebase Backend
- [x] Authentication System
- [x] Google Maps Integration
- [x] Legal Aid Calculator

### Phase 2 🚧 (Future)
- [ ] NGO Dashboard
- [ ] SMS/Email Notifications
- [ ] Advanced Analytics
- [ ] Mobile App (React Native)
- [ ] Multi-language Support
- [ ] Dark Mode

### Phase 3 💡 (Planned)
- [ ] AI-powered incident prediction
- [ ] Community forums
- [ ] Veterinary services integration
- [ ] Government API integration
- [ ] Blockchain-based verification

---

## 📊 Statistics

- **Total Pages**: 10+ pages
- **Lines of Code**: 3,500+
- **Components**: 15+
- **Services**: 2 (Auth + Incidents)
- **Security Rules**: 2 (Firestore + Storage)

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
