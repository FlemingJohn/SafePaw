// Import AI test data to Firestore using Firebase Admin SDK
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// You need to download your service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in the root directory

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.log('\n📝 To get your service account key:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Select your SafePaw project');
    console.log('3. Click the gear icon ⚙️ > Project Settings');
    console.log('4. Go to "Service Accounts" tab');
    console.log('5. Click "Generate New Private Key"');
    console.log('6. Save the downloaded file as "serviceAccountKey.json" in the root directory');
    console.log('7. Run this script again\n');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importAITestData() {
    console.log('🚀 Starting AI test data import...\n');

    try {
        // Read the generated test data
        const testData = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai_test_data.json'), 'utf8'));

        console.log(`📊 Found ${testData.length} incidents to import\n`);

        // Import each incident
        for (let i = 0; i < testData.length; i++) {
            const incident = testData[i];

            // Convert timestamp objects to Firestore Timestamps
            const processedIncident = {
                ...incident,
                createdAt: admin.firestore.Timestamp.fromMillis(incident.createdAt._seconds * 1000),
                updatedAt: admin.firestore.Timestamp.fromMillis(incident.updatedAt._seconds * 1000),
                location: {
                    ...incident.location,
                    coordinates: new admin.firestore.GeoPoint(
                        incident.location.coordinates._latitude,
                        incident.location.coordinates._longitude
                    )
                },
                aiRecommendations: incident.aiRecommendations.map(rec => ({
                    ...rec,
                    timestamp: admin.firestore.Timestamp.fromMillis(rec.timestamp._seconds * 1000)
                }))
            };

            // Add to Firestore
            const docRef = await db.collection('incidents').add(processedIncident);

            console.log(`✅ Imported incident ${i + 1}/${testData.length}`);
            console.log(`   ID: ${docRef.id}`);
            console.log(`   Location: ${incident.location.address}`);
            console.log(`   Severity: ${incident.severity}`);
            console.log(`   Priority: ${incident.priority}`);
            console.log(`   AI Recommendations: ${incident.aiRecommendations.length}`);
            console.log('');
        }

        console.log('🎉 Successfully imported all AI test data!');
        console.log('\n📊 Summary:');
        console.log(`   Total incidents: ${testData.length}`);
        console.log(`   Total AI recommendations: ${testData.reduce((sum, inc) => sum + inc.aiRecommendations.length, 0)}`);
        console.log('\n🚀 You can now test the AI Actions page in the government portal!');
        console.log('   Navigate to: Government Portal > AI Actions\n');

    } catch (error) {
        console.error('❌ Error importing data:', error);
        process.exit(1);
    }

    process.exit(0);
}

importAITestData();
