# Incident Severity and Priority Logic

In the **SafePaw** project, "Severity" and "Priority" are handled as two distinct but related concepts. This guide explains how they are determined and used.

## 1. Incident Severity (User-Selected)
Incident **Severity** is a manual selection made by the citizen when reporting an incident. There is no automated calculation that *determines* the severity level; instead, the user chooses from three levels based on the nature of the event.

| Severity Level | Icon | Rationale (Guidance) |
| :--- | :---: | :--- |
| **Minor** | ✅ | Scratches, nips, or near-misses with no significant injury. |
| **Moderate** | ⚠️ | Bites that cause bruising or shallow wounds; medical attention recommended. |
| **Severe** | 🚨 | Deep wounds, bleeding, or multiple bites; immediate action required. |

> [!NOTE]
> While the user selects the severity, the **AI Priority Analyzer** uses this selection as the primary weight for further calculations.

---

## 2. Priority Score Calculation (Automated)
Once an incident is reported, the backend calculates a **Priority Score** (1-10) using a multi-agent AI system. This score determines how quickly government agents are notified and how resources are allocated.

### The Weighted Formula
The score is calculated using the following weights:

```typescript
Priority = (SeverityWeight × 4) + (LocationRisk × 3) + (TimeUrgency × 2) + (ResourceAvailability × 1)
```

### Factor Breakdown:

| Factor | Weight | Calculation Logic |
| :--- | :---: | :--- |
| **Severity Weight** | **4** | **Severe: 3** | **Moderate: 2** | **Minor: 1** |
| **Location Risk** | **3** | Increases if the incident is near schools, hospitals, or high-density areas. |
| **Time Urgency** | **2** | Based on incident age: **>24h: 3** | **>12h: 2** | **Recent: 1**. |
| **Resource Availability** | **1** | Based on currently on-duty government agents and rescue teams. |

> [!TIP]
> The final score is always capped between **1 and 10** for standardized handling across the dashboard.

---

## 3. Urgency Levels & Automated Response
The Priority Score is mapped to an **Urgency Level**, which triggers different automated responses from the government portal.

| Priority Score | Urgency Level | Action Taken |
| :--- | :---: | :--- |
| **9 - 10** | **Critical** | Immediate dispatch of all resources (Rescue, Vet, Animal Control). |
| **7 - 8** | **High** | Escalated to supervisors; immediate animal control dispatch. |
| **4 - 6** | **Medium** | Standard investigation within 12-24 hours. |
| **1 - 3** | **Low** | Logged for monitoring and future risk assessment. |

---

## Technical Reference
- **Frontend Form**: [EnhancedReportPage.tsx](file:///d:/Projects/SafePaw/frontend/components/EnhancedReportPage.tsx)
- **Priority Logic**: [helpers.ts](file:///d:/Projects/SafePaw/functions/src/utils/helpers.ts)
- **AI Agent**: [priorityAnalyzer.ts](file:///d:/Projects/SafePaw/functions/src/agents/priorityAnalyzer.ts)
