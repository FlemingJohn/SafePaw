// Quick seed script - Run this in browser console on your app
// Go to http://localhost:3000, open DevTools console, and paste this

async function quickSeed() {
    const { collection, addDoc, Timestamp, GeoPoint } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { db } = await import('./lib/firebase.js');

    const locations = [
        { name: 'T Nagar', lat: 13.0418, lng: 80.2341 },
        { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
        { name: 'Velachery', lat: 12.9750, lng: 80.2210 },
        { name: 'Adyar', lat: 13.0067, lng: 80.2575 },
        { name: 'Ekkaduthangal', lat: 13.0206, lng: 80.2035 },
    ];

    const severities = ['Minor', 'Moderate', 'Severe'];
    const dogTypes = ['Stray', 'Pet'];

    console.log('🌱 Starting to seed incidents...');

    for (let i = 0; i < 10; i++) {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const incident = {
            userId: `seed_${i}`,
            userName: `Test User ${i}`,
            location: {
                address: `${loc.name}, Chennai, Tamil Nadu`,
                coordinates: new GeoPoint(
                    loc.lat + (Math.random() - 0.5) * 0.01,
                    loc.lng + (Math.random() - 0.5) * 0.01
                )
            },
            dogType: dogTypes[Math.floor(Math.random() * 2)],
            severity,
            description: `Test incident in ${loc.name}`,
            photos: [],
            anonymous: false,
            status: 'Reported',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            reportMode: 'quick'
        };

        await addDoc(collection(db, 'incidents'), incident);
        console.log(`✅ Added incident ${i + 1}/10 - ${loc.name} (${severity})`);
    }

    console.log('🎉 Seeding complete! Refresh the map.');
}

quickSeed();
