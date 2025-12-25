// Script to add test incidents with AI recommendations for testing AI Actions page
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config - update with your actual config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "safepaw-27023.firebaseapp.com",
    projectId: "safepaw-27023",
    storageBucket: "safepaw-27023.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testIncidentsWithAI = [
    {
        userId: "test-user-1",
        userName: "John Doe",
        userPhone: "+91 98765 43210",
        location: {
            address: "MG Road, Bangalore",
            coordinates: {
                latitude: 12.9716,
                longitude: 77.5946
            }
        },
        dogType: "Stray",
        severity: "Severe",
        description: "Large aggressive dog attacked a child. Immediate medical attention required.",
        photos: [],
        status: "Under Review",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        anonymous: false,
        victimAge: "Child",
        medicalAttention: true,
        rabiesConcern: true,
        childrenAtRisk: true,
        priority: 9,
        aiRecommendations: [
            {
                id: "rec-1",
                agentType: "priority",
                recommendation: "HIGH PRIORITY: Severe incident with child victim. Rabies concern detected. Immediate response required.",
                confidence: 0.95,
                status: "approved",
                timestamp: Timestamp.now()
            },
            {
                id: "rec-2",
                agentType: "action",
                recommendation: "DISPATCH: Emergency rescue team and animal control. Alert nearest hospital with rabies vaccine.",
                confidence: 0.92,
                status: "executed",
                timestamp: Timestamp.now()
            },
            {
                id: "rec-3",
                agentType: "resource",
                recommendation: "ASSIGNED: Rescue Team Alpha (2.3km away), Dr. Sharma (Veterinarian), City Hospital notified.",
                confidence: 0.88,
                status: "approved",
                timestamp: Timestamp.now()
            }
        ]
    },
    {
        userId: "test-user-2",
        userName: "Priya Sharma",
        location: {
            address: "Koramangala, Bangalore",
            coordinates: {
                latitude: 12.9352,
                longitude: 77.6245
            }
        },
        dogType: "Pet",
        severity: "Moderate",
        description: "Neighbor's dog bit me while I was jogging. Minor injury but concerned about rabies.",
        photos: [],
        status: "Action Taken",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
        updatedAt: Timestamp.now(),
        anonymous: false,
        victimAge: "Adult",
        medicalAttention: true,
        rabiesConcern: true,
        priority: 6,
        aiRecommendations: [
            {
                id: "rec-4",
                agentType: "priority",
                recommendation: "MEDIUM PRIORITY: Pet dog incident with rabies concern. Schedule follow-up within 24 hours.",
                confidence: 0.78,
                status: "approved",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 3500000))
            },
            {
                id: "rec-5",
                agentType: "action",
                recommendation: "COORDINATE: Contact pet owner for vaccination records. Schedule victim for rabies prophylaxis.",
                confidence: 0.82,
                status: "approved",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 3400000))
            },
            {
                id: "rec-6",
                agentType: "resource",
                recommendation: "ASSIGNED: Animal Control Officer to verify pet vaccination status. Hospital appointment scheduled.",
                confidence: 0.75,
                status: "pending",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 3300000))
            }
        ]
    },
    {
        userId: "test-user-3",
        userName: "Anonymous User",
        location: {
            address: "Indiranagar, Bangalore",
            coordinates: {
                latitude: 12.9719,
                longitude: 77.6412
            }
        },
        dogType: "Stray",
        severity: "Minor",
        description: "Stray dog barking aggressively at people in the park. No bites yet but concerning behavior.",
        photos: [],
        status: "Pending",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 7200000)), // 2 hours ago
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 7200000)),
        anonymous: true,
        priority: 4,
        aiRecommendations: [
            {
                id: "rec-7",
                agentType: "priority",
                recommendation: "LOW PRIORITY: Preventive action recommended. Monitor situation for 48 hours.",
                confidence: 0.65,
                status: "pending",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 7100000))
            },
            {
                id: "rec-8",
                agentType: "action",
                recommendation: "MONITOR: Schedule patrol in area. Consider ABC (Animal Birth Control) program enrollment.",
                confidence: 0.70,
                status: "overridden",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 7000000))
            }
        ]
    },
    {
        userId: "test-user-4",
        userName: "Rahul Kumar",
        location: {
            address: "Whitefield, Bangalore",
            coordinates: {
                latitude: 12.9698,
                longitude: 77.7500
            }
        },
        dogType: "Stray",
        severity: "Severe",
        description: "Pack of stray dogs attacked elderly person. Multiple bite wounds. Ambulance called.",
        photos: [],
        status: "Pending",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 90000000)), // 25 hours ago (should trigger escalation)
        updatedAt: Timestamp.fromDate(new Date(Date.now() - 90000000)),
        anonymous: false,
        victimAge: "Elderly",
        medicalAttention: true,
        rabiesConcern: true,
        repeatOffender: true,
        priority: 10,
        escalationStatus: "escalated",
        aiRecommendations: [
            {
                id: "rec-9",
                agentType: "priority",
                recommendation: "CRITICAL PRIORITY: Elderly victim, pack attack, multiple wounds. Maximum urgency.",
                confidence: 0.98,
                status: "approved",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 89900000))
            },
            {
                id: "rec-10",
                agentType: "escalation",
                recommendation: "ESCALATED: Incident pending for >24 hours. Auto-contacted senior officials. SMS sent to district coordinator.",
                confidence: 0.99,
                status: "executed",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 3600000)) // Escalated 1 hour ago
            },
            {
                id: "rec-11",
                agentType: "resource",
                recommendation: "EMERGENCY DISPATCH: All available units. Veterinary team for pack capture. Hospital coordination active.",
                confidence: 0.95,
                status: "approved",
                timestamp: Timestamp.fromDate(new Date(Date.now() - 89800000))
            }
        ]
    }
];

async function seedAITestData() {
    console.log('🤖 Starting AI Actions test data seeding...\n');

    try {
        for (const incident of testIncidentsWithAI) {
            const docRef = await addDoc(collection(db, 'incidents'), incident);
            console.log(`✅ Added incident: ${docRef.id}`);
            console.log(`   - Severity: ${incident.severity}`);
            console.log(`   - Priority: ${incident.priority}`);
            console.log(`   - AI Recommendations: ${incident.aiRecommendations.length}`);
            console.log('');
        }

        console.log('🎉 Successfully seeded AI test data!');
        console.log('\n📊 Summary:');
        console.log(`   - Total incidents: ${testIncidentsWithAI.length}`);
        console.log(`   - Total AI recommendations: ${testIncidentsWithAI.reduce((sum, inc) => sum + inc.aiRecommendations.length, 0)}`);
        console.log('\n🚀 You can now test the AI Actions page in the government portal!');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }

    process.exit(0);
}

seedAITestData();
