/**
 * Script to add demo AI recommendations to incidents
 * Run this to populate the AI Actions page with sample data
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// AI Agent types
const AGENTS = {
    PRIORITY: 'priority',
    ACTION: 'action',
    RESOURCE: 'resource',
    ESCALATION: 'escalation'
};

// Generate AI recommendations based on incident severity
function generateRecommendations(incident) {
    const recommendations = [];
    const timestamp = admin.firestore.Timestamp.now();

    // Priority Analyzer
    const priority = incident.severity === 'Severe' ? 9 : incident.severity === 'Moderate' ? 6 : 3;
    recommendations.push({
        id: `${incident.id}_priority`,
        agentType: AGENTS.PRIORITY,
        recommendation: `Priority Level: ${priority}/10 - ${priority >= 8 ? 'CRITICAL - Immediate action required' :
                priority >= 5 ? 'HIGH - Action needed within 24 hours' :
                    'MEDIUM - Schedule for review'
            }`,
        status: 'pending',
        confidence: 0.92,
        timestamp: timestamp,
        metadata: {
            priorityScore: priority,
            factors: ['severity', 'location_risk', 'time_urgency']
        }
    });

    // Action Coordinator
    if (incident.severity === 'Severe') {
        recommendations.push({
            id: `${incident.id}_action`,
            agentType: AGENTS.ACTION,
            recommendation: 'Dispatch animal control unit immediately. Alert nearby hospitals. Issue public safety warning for the area. Coordinate with rescue team for victim support.',
            status: 'pending',
            confidence: 0.88,
            timestamp: timestamp,
            metadata: {
                actions: ['dispatch_control', 'hospital_alert', 'safety_warning', 'rescue_team'],
                urgency: 'immediate'
            }
        });
    } else if (incident.severity === 'Moderate') {
        recommendations.push({
            id: `${incident.id}_action`,
            agentType: AGENTS.ACTION,
            recommendation: 'Schedule animal control visit within 24 hours. Monitor area for additional incidents. Coordinate with local veterinarian for dog assessment.',
            status: 'pending',
            confidence: 0.85,
            timestamp: timestamp,
            metadata: {
                actions: ['schedule_visit', 'area_monitoring', 'vet_consultation'],
                urgency: 'high'
            }
        });
    } else {
        recommendations.push({
            id: `${incident.id}_action`,
            agentType: AGENTS.ACTION,
            recommendation: 'Add to routine patrol schedule. Assess for ABC program inclusion. Document for pattern analysis.',
            status: 'pending',
            confidence: 0.79,
            timestamp: timestamp,
            metadata: {
                actions: ['patrol_schedule', 'abc_assessment', 'documentation'],
                urgency: 'normal'
            }
        });
    }

    // Resource Manager
    recommendations.push({
        id: `${incident.id}_resource`,
        agentType: AGENTS.RESOURCE,
        recommendation: `Assign nearest animal control unit (Unit-3, 2.1 km away). Available veterinarian: Dr. Sharma (City Clinic). Estimated response time: ${incident.severity === 'Severe' ? '15 minutes' : '2-4 hours'
            }`,
        status: 'pending',
        confidence: 0.91,
        timestamp: timestamp,
        metadata: {
            resources: {
                unit: 'Unit-3',
                distance: '2.1 km',
                veterinarian: 'Dr. Sharma',
                facility: 'City Clinic'
            }
        }
    });

    // Escalation Monitor (only for severe or if needed)
    if (incident.severity === 'Severe' || incident.rabiesConcern) {
        recommendations.push({
            id: `${incident.id}_escalation`,
            agentType: AGENTS.ESCALATION,
            recommendation: `ESCALATED: ${incident.rabiesConcern ? 'Rabies concern detected - immediate health department notification required.' :
                    'Severe incident - supervisor notification sent. Municipal health officer alerted.'
                }`,
            status: 'approved',
            confidence: 0.95,
            timestamp: timestamp,
            metadata: {
                escalationReason: incident.rabiesConcern ? 'rabies_concern' : 'severity',
                notified: ['supervisor', 'health_department']
            }
        });
    }

    return recommendations;
}

async function addAIRecommendations() {
    try {
        console.log('🤖 Starting AI Recommendations Generator...\n');

        // Get all incidents without AI recommendations
        const incidentsSnapshot = await db.collection('incidents')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        if (incidentsSnapshot.empty) {
            console.log('❌ No incidents found. Please add some incidents first.');
            return;
        }

        let processedCount = 0;
        let skippedCount = 0;

        for (const doc of incidentsSnapshot.docs) {
            const incident = { id: doc.id, ...doc.data() };

            // Skip if already has AI recommendations
            if (incident.aiRecommendations && incident.aiRecommendations.length > 0) {
                console.log(`⏭️  Skipping ${doc.id} - already has AI recommendations`);
                skippedCount++;
                continue;
            }

            // Generate recommendations
            const recommendations = generateRecommendations(incident);

            // Update the document
            await doc.ref.update({
                aiRecommendations: recommendations,
                aiProcessedAt: admin.firestore.Timestamp.now(),
                aiVersion: '1.0'
            });

            console.log(`✅ Added ${recommendations.length} AI recommendations to incident: ${doc.id}`);
            console.log(`   Severity: ${incident.severity} | Priority: ${recommendations[0].metadata.priorityScore}/10`);
            console.log(`   Recommendations: ${recommendations.map(r => r.agentType).join(', ')}\n`);

            processedCount++;
        }

        console.log('\n🎉 AI Recommendations Generation Complete!');
        console.log(`   Processed: ${processedCount} incidents`);
        console.log(`   Skipped: ${skippedCount} incidents (already had recommendations)`);
        console.log('\n📊 Visit the AI Actions page in the Government Portal to see the results!');

    } catch (error) {
        console.error('❌ Error adding AI recommendations:', error);
    } finally {
        process.exit();
    }
}

// Run the script
addAIRecommendations();
