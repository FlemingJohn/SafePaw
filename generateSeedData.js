// Simple seed data generator for Firebase Firestore
// Copy this data and import it using Firebase Console

const seedData = [];

// Chennai locations
const locations = [
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

const severities = ['Minor', 'Moderate', 'Severe'];
const dogTypes = ['Stray', 'Pet'];

function randomOffset() {
    return (Math.random() - 0.5) * 0.02;
}

function randomDate() {
    const now = Date.now();
    const daysAgo = Math.floor(Math.random() * 30);
    return now - (daysAgo * 24 * 60 * 60 * 1000);
}

// Generate 20 incidents
for (let i = 0; i < 20; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const dogType = dogTypes[Math.floor(Math.random() * dogTypes.length)];

    const lat = location.lat + randomOffset();
    const lng = location.lng + randomOffset();
    const timestamp = randomDate();

    seedData.push({
        userId: `seed_user_${i}`,
        userName: `Citizen ${i}`,
        userPhone: `+91 98765 432${String(10 + i).padStart(2, '0')}`,
        location: {
            address: `${location.name}, Chennai, Tamil Nadu`,
            coordinates: {
                _latitude: lat,
                _longitude: lng
            }
        },
        dogType,
        severity,
        description: `Incident reported in ${location.name} area. ${severity === 'Severe' ? 'Immediate attention required.' :
                severity === 'Moderate' ? 'Dog showed aggressive behavior.' :
                    'Minor incident, dog was quickly controlled.'
            }`,
        photos: [],
        anonymous: Math.random() > 0.7,
        status: 'Reported',
        createdAt: {
            _seconds: Math.floor(timestamp / 1000),
            _nanoseconds: (timestamp % 1000) * 1000000
        },
        updatedAt: {
            _seconds: Math.floor(timestamp / 1000),
            _nanoseconds: (timestamp % 1000) * 1000000
        },
        reportMode: 'quick'
    });
}

console.log(JSON.stringify(seedData, null, 2));
