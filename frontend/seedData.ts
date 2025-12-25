import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { db } from './lib/firebase';

// Chennai coordinates: 13.0827° N, 80.2707° E
const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

// Famous Chennai locations for realistic addresses
const CHENNAI_LOCATIONS = [
    { name: 'T Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
    { name: 'Velachery', lat: 12.9750, lng: 80.2210 },
    { name: 'Adyar', lat: 13.0067, lng: 80.2575 },
    { name: 'Mylapore', lat: 13.0339, lng: 80.2619 },
    { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
    { name: 'Porur', lat: 13.0358, lng: 80.1559 },
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
    { name: 'Chromepet', lat: 12.9516, lng: 80.1462 },
    { name: 'Sholinganallur', lat: 12.9010, lng: 80.2279 },
    { name: 'OMR', lat: 12.9342, lng: 80.2369 },
    { name: 'ECR', lat: 12.8406, lng: 80.2446 },
    { name: 'Nungambakkam', lat: 13.0569, lng: 80.2424 },
    { name: 'Egmore', lat: 13.0732, lng: 80.2609 },
    { name: 'Royapettah', lat: 13.0524, lng: 80.2649 },
];

const SEVERITIES = ['Minor', 'Moderate', 'Severe'] as const;
const DOG_TYPES = ['Stray', 'Pet'] as const;
const ACTIVITIES = ['Walking', 'Jogging', 'Cycling', 'Standing', 'Playing'];
const PROVOCATIONS = ['Provoked', 'Unprovoked', 'Unknown'] as const;
const VICTIM_AGES = ['Child', 'Teen', 'Adult', 'Elderly'] as const;

// Generate random offset for coordinates (within ~2km radius)
function randomOffset() {
    return (Math.random() - 0.5) * 0.02; // ~2km radius
}

// Generate random date within last 30 days
function randomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return Timestamp.fromDate(date);
}

// Generate random incident
function generateIncident(index: number) {
    const location = CHENNAI_LOCATIONS[Math.floor(Math.random() * CHENNAI_LOCATIONS.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const dogType = DOG_TYPES[Math.floor(Math.random() * DOG_TYPES.length)];
    const isDetailed = Math.random() > 0.3; // 70% detailed reports

    const lat = location.lat + randomOffset();
    const lng = location.lng + randomOffset();

    const incident = {
        userId: 'seed_user_' + index,
        userName: `Citizen ${index}`,
        userPhone: '+91 98765 432' + String(10 + index).padStart(2, '0'),
        location: {
            address: `${location.name}, Chennai, Tamil Nadu`,
            coordinates: new GeoPoint(lat, lng)
        },
        dogType,
        severity,
        description: `Incident reported in ${location.name} area. ${severity === 'Severe' ? 'Immediate attention required.' :
                severity === 'Moderate' ? 'Dog showed aggressive behavior.' :
                    'Minor incident, dog was quickly controlled.'
            }`,
        photos: [],
        anonymous: Math.random() > 0.7, // 30% anonymous
        status: 'Reported',
        createdAt: randomDate(),
        updatedAt: randomDate(),
        reportMode: isDetailed ? 'detailed' : 'quick'
    };

    // Add detailed fields for 70% of reports
    if (isDetailed) {
        Object.assign(incident, {
            incidentDateTime: randomDate(),
            victimAge: VICTIM_AGES[Math.floor(Math.random() * VICTIM_AGES.length)],
            injuryLocation: ['Left arm', 'Right leg', 'Hand', 'Ankle'][Math.floor(Math.random() * 4)],
            medicalAttention: Math.random() > 0.5,
            activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
            provocation: PROVOCATIONS[Math.floor(Math.random() * PROVOCATIONS.length)],
            witnessPresent: Math.random() > 0.6,
            rabiesConcern: severity === 'Severe' && Math.random() > 0.7,
            repeatOffender: Math.random() > 0.8,
            childrenAtRisk: Math.random() > 0.7
        });
    }

    return incident;
}

// Seed the database
export async function seedIncidents(count: number = 20) {
    console.log(`🌱 Seeding ${count} incidents around Chennai...`);

    try {
        const incidentsRef = collection(db, 'incidents');

        for (let i = 0; i < count; i++) {
            const incident = generateIncident(i);
            await addDoc(incidentsRef, incident);
            console.log(`✅ Added incident ${i + 1}/${count} - ${incident.location.address} (${incident.severity})`);
        }

        console.log(`🎉 Successfully seeded ${count} incidents!`);
        console.log('📍 Locations spread across Chennai:');
        console.log('   - T Nagar, Anna Nagar, Velachery, Adyar, Mylapore');
        console.log('   - Guindy, Porur, Tambaram, Chromepet, Sholinganallur');
        console.log('   - OMR, ECR, Nungambakkam, Egmore, Royapettah');
        console.log('\n🗺️ Refresh your map to see the incidents!');

    } catch (error) {
        console.error('❌ Error seeding incidents:', error);
        throw error;
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedIncidents(20).then(() => {
        console.log('✨ Seeding complete!');
        process.exit(0);
    }).catch((error) => {
        console.error('Failed to seed:', error);
        process.exit(1);
    });
}
