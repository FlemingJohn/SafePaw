// Run with: node seedViaAdmin.js
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./safepaw-27023-firebase-adminsdk.json'); // You'll need to download this

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const incidents = [
    { name: 'T Nagar', lat: 13.0418, lng: 80.2341, severity: 'Moderate', dogType: 'Stray' },
    { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, severity: 'Severe', dogType: 'Pet' },
    { name: 'Velachery', lat: 12.9750, lng: 80.2210, severity: 'Minor', dogType: 'Stray' },
    { name: 'Ekkaduthangal', lat: 13.0206, lng: 80.2035, severity: 'Moderate', dogType: 'Stray' },
    { name: 'Adyar', lat: 13.0067, lng: 80.2575, severity: 'Severe', dogType: 'Pet' },
    { name: 'Guindy', lat: 13.0067, lng: 80.2206, severity: 'Minor', dogType: 'Stray' },
    { name: 'Mylapore', lat: 13.0339, lng: 80.2619, severity: 'Moderate', dogType: 'Stray' },
    { name: 'Porur', lat: 13.0358, lng: 80.1559, severity: 'Severe', dogType: 'Pet' },
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000, severity: 'Minor', dogType: 'Stray' },
    { name: 'Sholinganallur', lat: 12.9010, lng: 80.2279, severity: 'Moderate', dogType: 'Stray' }
];

async function seedData() {
    console.log('🌱 Seeding incidents...');

    const batch = db.batch();

    incidents.forEach((loc, i) => {
        const docRef = db.collection('incidents').doc();
        batch.set(docRef, {
            userId: `seed_${Date.now()}_${i}`,
            userName: `Test User ${i + 1}`,
            location: {
                address: `${loc.name}, Chennai, Tamil Nadu`,
                coordinates: new admin.firestore.GeoPoint(loc.lat, loc.lng)
            },
            dogType: loc.dogType,
            severity: loc.severity,
            description: `Test incident in ${loc.name}`,
            photos: [],
            anonymous: false,
            status: 'Reported',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            reportMode: 'quick'
        });
        console.log(`✅ Prepared ${i + 1}/10 - ${loc.name}`);
    });

    await batch.commit();
    console.log('🎉 All 10 incidents added to Firestore!');
    process.exit(0);
}

seedData().catch(console.error);
