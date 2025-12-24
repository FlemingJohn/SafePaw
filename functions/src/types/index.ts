import { z } from 'zod';
import { Timestamp, GeoPoint } from 'firebase-admin/firestore';

// ============================================
// ENUMS
// ============================================

export type Severity = 'Minor' | 'Moderate' | 'Severe';
export type IncidentStatus = 'Reported' | 'Under Review' | 'Action Taken' | 'Resolved';
export type EscalationStatus = 'normal' | 'escalated' | 'auto_contacted';
export type ResourceType = 'rescue_team' | 'veterinarian' | 'animal_control';
export type AgentRole = 'supervisor' | 'field_agent' | 'coordinator';
export type ContactMethod = 'sms' | 'email' | 'both';
export type AgentType = 'priority' | 'action' | 'resource';
export type RecommendationStatus = 'pending' | 'approved' | 'overridden' | 'executed';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionPriority = 'immediate' | 'urgent' | 'standard';

// ============================================
// INTERFACES
// ============================================

export interface IncidentLocation {
    address: string;
    coordinates: GeoPoint;
}

export interface AIRecommendation {
    id: string;
    agentType: AgentType;
    recommendation: string;
    confidence: number;
    timestamp: Timestamp;
    status: RecommendationStatus;
}

export interface AssignedResource {
    id: string;
    type: ResourceType;
    name: string;
    assignedAt: Timestamp;
    status: 'assigned' | 'en_route' | 'on_site' | 'completed';
}

export interface AutomatedAction {
    id: string;
    action: string;
    executedAt: Timestamp;
    executedBy: 'ai' | 'government_user';
    result: string;
}

export interface IncidentData {
    id?: string;
    userId: string;
    userName: string;
    location: IncidentLocation;
    severity: Severity;
    description: string;
    photos: string[];
    status: IncidentStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    priority?: number;
    aiRecommendations?: AIRecommendation[];
    assignedResources?: AssignedResource[];
    automatedActions?: AutomatedAction[];
    escalationStatus?: EscalationStatus;
    lastActionTimestamp?: Timestamp;
    escalatedAt?: Timestamp;
    autoContactedAgents?: string[];
}

export interface GovernmentAgent {
    id: string;
    name: string;
    role: AgentRole;
    contactInfo: {
        phone: string;
        email: string;
        preferredMethod: ContactMethod;
    };
    availability: 'on_duty' | 'off_duty';
    jurisdiction: GeoPoint;
    maxConcurrentIncidents: number;
    currentIncidents: string[];
}

export interface GovernmentResource {
    id: string;
    type: ResourceType;
    name: string;
    location: GeoPoint;
    availability: 'available' | 'busy' | 'offline';
    currentAssignment?: string;
    capabilities: string[];
    contactInfo: {
        phone: string;
        email: string;
    };
}

export interface NotificationData {
    incidentId: string;
    severity: string;
    location: string;
    hoursSinceLastAction: number;
    priority: number;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const IncidentInputSchema = z.object({
    incidentId: z.string().describe('The incident ID from Firestore'),
    severity: z.enum(['Minor', 'Moderate', 'Severe']).describe('Incident severity level'),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string()
    }).describe('Incident location'),
    createdAt: z.string().describe('ISO timestamp when incident was created'),
    description: z.string().describe('Incident description'),
});

export const PriorityResultSchema = z.object({
    priority: z.number().min(1).max(10).describe('Priority score from 1-10'),
    reasoning: z.string().describe('Explanation of priority calculation'),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Urgency classification'),
});

export const ActionRecommendationSchema = z.object({
    actions: z.array(z.object({
        action: z.string().describe('Specific action to take'),
        priority: z.enum(['immediate', 'urgent', 'standard']).describe('Action priority'),
        estimatedTime: z.string().describe('Estimated time to complete'),
    })).describe('List of recommended actions'),
    reasoning: z.string().describe('Explanation for recommendations'),
});

export const ResourceAllocationSchema = z.object({
    resources: z.array(z.object({
        resourceId: z.string().describe('Resource ID'),
        type: z.enum(['rescue_team', 'veterinarian', 'animal_control']).describe('Resource type'),
        name: z.string().describe('Resource name'),
        distance: z.string().describe('Distance from incident'),
    })).describe('Allocated resources'),
    reasoning: z.string().describe('Explanation for resource allocation'),
});

export const DelayedIncidentSchema = z.object({
    delayedIncidents: z.array(z.object({
        incidentId: z.string(),
        hoursSinceLastAction: z.number(),
        shouldEscalate: z.boolean(),
    })),
});

// ============================================
// AGENT RESPONSE TYPES
// ============================================

export interface PriorityAnalysis {
    priority: number;
    urgencyLevel: UrgencyLevel;
    reasoning: string;
}

export interface ActionRecommendation {
    action: string;
    priority: ActionPriority;
    estimatedTime: string;
}

export interface ResourceAllocation {
    resourceId: string;
    type: ResourceType;
    name: string;
    distance: string;
}

export interface AgentResponse {
    priority?: PriorityAnalysis;
    actions?: ActionRecommendation[];
    resources?: ResourceAllocation[];
    reasoning: string;
}
