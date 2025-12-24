# SafePaw Functions - Modular Architecture

## 📁 Folder Structure

```
functions/src/
├── agents/                    # AI Agent Modules
│   ├── priorityAnalyzer.ts   # Priority calculation agent
│   ├── actionCoordinator.ts  # Action recommendation agent
│   ├── resourceManager.ts    # Resource allocation agent
│   └── escalationMonitor.ts  # Delayed incident detection agent
│
├── services/                  # Business Logic Services
│   ├── orchestrator.ts       # Multi-agent coordination
│   ├── contactService.ts     # Government agent contact management
│   └── notificationService.ts # SMS/Email notifications
│
├── types/                     # TypeScript Types & Schemas
│   └── index.ts              # All interfaces, enums, Zod schemas
│
├── utils/                     # Utility Functions
│   └── helpers.ts            # Priority calc, time utils, formatters
│
└── index.ts                   # Cloud Functions entry point
```

## 🤖 Agent Modules

### Priority Analyzer (`agents/priorityAnalyzer.ts`)
- **Purpose**: Calculate incident priority (1-10 scale)
- **Inputs**: Incident data (severity, location, time)
- **Outputs**: Priority score, urgency level, reasoning
- **Algorithm**: Weighted scoring based on severity, location risk, time urgency

### Action Coordinator (`agents/actionCoordinator.ts`)
- **Purpose**: Recommend specific government actions
- **Inputs**: Incident data + priority score
- **Outputs**: List of actions with priority levels
- **Logic**: Severity-based action selection (immediate/urgent/standard)

### Resource Manager (`agents/resourceManager.ts`)
- **Purpose**: Allocate available resources
- **Inputs**: Incident data + required resource types
- **Outputs**: List of allocated resources with distances
- **Integration**: Queries Firestore `governmentResources` collection

### Escalation Monitor (`agents/escalationMonitor.ts`)
- **Purpose**: Detect delayed incidents (>24 hours)
- **Inputs**: Check all incidents or specific ID
- **Outputs**: List of delayed incidents with hours delayed
- **Trigger**: Used by scheduled function

## 🔧 Service Modules

### Orchestrator (`services/orchestrator.ts`)
- **`coordinateMultiAgentResponse()`**: Runs all 3 agents sequentially
- **`processDelayedIncidents()`**: Checks and escalates delayed incidents
- **Flow**: Priority → Actions → Resources → Update Firestore

### Contact Service (`services/contactService.ts`)
- **`contactGovernmentAgents()`**: Manages agent notifications
- **Logic**: Queries on-duty agents, sends SMS/Email, logs attempts
- **Updates**: Sets `escalationStatus` to 'auto_contacted'

### Notification Service (`services/notificationService.ts`)
- **`sendSMS()`**: Twilio SMS integration
- **`sendEmail()`**: Nodemailer email with HTML templates
- **Configuration**: Uses environment variables

## 📦 Types Module (`types/index.ts`)

**Centralized type definitions:**
- Interfaces: `IncidentData`, `GovernmentAgent`, `AgentResponse`, etc.
- Enums: `Severity`, `ResourceType`, `EscalationStatus`, etc.
- Zod Schemas: Input/output validation for all AI tools

## 🛠️ Utils Module (`utils/helpers.ts`)

**Helper functions:**
- `calculatePriorityScore()` - Priority algorithm
- `calculateTimeUrgency()` - Time-based urgency
- `isIncidentDelayed()` - Check if >24 hours
- `getAvailableAgents()` - Query on-duty agents
- `formatDuration()` - Human-readable time formatting

## 🚀 Main Entry Point (`index.ts`)

**5 Cloud Functions:**
1. `processIncidentWithAI` - HTTP endpoint for manual analysis
2. `onIncidentCreated` - Firestore trigger for auto-processing
3. `checkDelayedIncidents` - Scheduled function (hourly)
4. `autoContactGovernment` - HTTP endpoint for manual escalation
5. `searchNearbyHospitals` - Hospital finder

## 🎯 Benefits of Modular Architecture

✅ **Separation of Concerns**: Each agent in its own file  
✅ **Reusability**: Utility functions shared across modules  
✅ **Testability**: Easy to unit test individual agents  
✅ **Maintainability**: Clear folder structure, easy to navigate  
✅ **Type Safety**: Centralized types prevent inconsistencies  
✅ **Scalability**: Easy to add new agents or services  

## 📝 Import Examples

```typescript
// Import specific agent
import { createPriorityAnalyzerAgent } from './agents/priorityAnalyzer';

// Import service
import { coordinateMultiAgentResponse } from './services/orchestrator';

// Import types
import type { AgentResponse, IncidentData } from './types';

// Import utilities
import { calculatePriorityScore } from './utils/helpers';
```

## 🔄 Migration from Old Structure

**Old files (can be deleted):**
- ❌ `agentTools.ts` → Split into `agents/` folder
- ❌ `agentOrchestrator.ts` → Moved to `services/orchestrator.ts`
- ❌ `notificationService.ts` → Moved to `services/notificationService.ts`

**New structure:**
- ✅ `agents/` - 4 separate agent files
- ✅ `services/` - 3 service files
- ✅ `types/` - Centralized types
- ✅ `utils/` - Helper functions

## 🧪 Testing Individual Modules

```typescript
// Test priority analyzer
import { createPriorityAnalyzerAgent } from './agents/priorityAnalyzer';
const agent = createPriorityAnalyzerAgent(ai);
const result = await agent({ incidentId, severity, location, ... });

// Test orchestrator
import { coordinateMultiAgentResponse } from './services/orchestrator';
const response = await coordinateMultiAgentResponse(ai, 'incident_123');
```

## 📚 Next Steps

1. Delete old files: `agentTools.ts`, `agentOrchestrator.ts`
2. Run `npm run build` to compile TypeScript
3. Test individual modules
4. Deploy with `npm run deploy`
