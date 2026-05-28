# OpenAPI Planning Gate — Shared Readiness Contract Surface

## 1. Executive Decision

| Subject | Decision |
|---|---|
| Status | Planning only |
| OpenAPI YAML implementation | NO-GO |
| Backend implementation | NO-GO |
| Generated clients | NO-GO |
| Scope | Candidate future contract surfaces only |
| Next required gate | OpenAPI Shared Readiness Contract Surface Review Gate |

This document defines candidate OpenAPI resource groups, endpoint paths, and schema shapes for the accepted AI Operations Shared Readiness Model. Nothing here is approved for implementation. No YAML file may be edited or created from this document until a dedicated Review Gate accepts the proposed surface.

## 2. Purpose

The Backend Readiness Acceptance Gate confirmed that the shared readiness model is accepted with conditions, and that the correct backend pattern is:

```
Owner module → Shared backend contract / API → Consumer module
```

For that pattern to work in a real backend, the shared readiness contract must be exposed through a versioned, governed API surface rather than page-local state. This planning document answers the question: which API resources, schemas, and identities will that surface eventually need?

The goal is an ordered, reviewable candidate list — not a YAML file. A Review Gate must evaluate and accept this list before any OpenAPI YAML is written.

## 3. Inputs

This planning document draws on the following accepted sources. No source document is edited by this gate.

- `docs/backend_readiness_ai_ops_shared_readiness_model_acceptance.md` — Acceptance gate defining the canonical readiness dimensions, ownership model, aggregate shape, and backend blockers.
- `docs/backend_readiness_ai_ops_shared_readiness_model_review.md` — Review gate confirming the model is sufficient to proceed to planning.
- `docs/workflow_runs_design_reconciliation.md` — Accepted WorkflowRunsPage capabilities and the structured trigger, input, output, and destination field model.
- `docs/ai_ops_external_review_reconciliation.md` — Reconciled ownership boundaries and remaining backend-readiness conditions.
- Existing OpenAPI Slice 1/2 conventions in `docs/nashir_v1_openapi.yaml` — referenced as conventions to reuse; the file must not be edited in this gate.

## 4. Contract-First Principle

The following rules govern how this planned API surface relates to UI pages.

- OpenAPI should expose shared readiness contracts, not page-local state. A page's UI state is never the API response.
- Owner modules produce domain readiness and write it to a shared backend contract.
- Consumer modules read normalized readiness contracts through the API; they must not read another module's local state directly.
- WorkflowRunsPage should consume readiness and workflow step contracts only. It must not own provider readiness, model routing policy, prompt governance, or cost policy.
- In backend implementation, no page may directly depend on another page's local UI state. The correct path is always through the shared contract/API layer.

Correct pattern:
```
SecretsAndKeysPage → provider readiness record → API → WorkflowRunsPage reads readiness
```

Incorrect pattern:
```
WorkflowRunsPage reads ModelRoutingPage's local React state directly
```

## 5. Candidate Resource Groups

All resource groups below are **planning only**. None are approved for implementation in this gate.

---

### A. Readiness Snapshots

Candidate resources exposing evaluated readiness state at workspace, workflow, and step granularity.

| Candidate resource | Description |
|---|---|
| Workspace readiness summary | Aggregate readiness across all active workflow definitions in a workspace. |
| Workflow readiness snapshot | Per-workflow readiness covering all dimensions for all steps. |
| Workflow step readiness snapshot | Per-step readiness with per-dimension status, blockers, warnings, checks, next actions, evidence summary, and timestamp. |
| Provider readiness snapshot | Point-in-time snapshot of provider status as evaluated for a given workflow step or run. |
| Route readiness snapshot | Point-in-time snapshot of model route health and policy as evaluated for a given step. |
| Prompt readiness snapshot | Point-in-time snapshot of prompt version, approval status, and output contract as evaluated. |
| Cost readiness snapshot | Point-in-time snapshot of budget cap, approval threshold, and forecast risk as evaluated. |
| Data source readiness snapshot | Point-in-time snapshot of connector availability and governance state as evaluated. |

---

### B. Provider Health / Readiness

Candidate resources owned by the SecretsAndKeysPage domain.

| Candidate resource | Description |
|---|---|
| Provider identity | Persistent provider record with stable `providerId`. |
| Provider status | Current administrative status: active, disabled, deprecated. |
| Provider health | Last evaluated health state: healthy, degraded, unavailable, unknown. |
| Last tested at | Timestamp of most recent health probe. |
| Supported capabilities / models | Declared list of capabilities and model identifiers the provider supports. |
| Secret reference name | Name or reference key used to retrieve the credential from the secret vault. No secret value is returned in any API response. |

---

### C. Model Route Readiness

Candidate resources owned by the ModelRoutingPage domain.

| Candidate resource | Description |
|---|---|
| Task route | Binding of a task type to a primary model and route policy. |
| Provider reference | `providerId` reference linking the route to a provider identity. Route is not ready if the referenced provider is not ready. |
| Primary model | Identifier of the primary model for the route. |
| Fallback models | Ordered list of fallback model identifiers. |
| Route health | Current health state of the route. |
| Timeout / retry policy snapshot | Captured at execution time; planned for runtime snapshot only, not editable through run endpoint. |

---

### D. Prompt Readiness

Candidate resources owned by the PromptGovernancePage domain.

| Candidate resource | Description |
|---|---|
| Prompt version | Specific versioned prompt record with stable `promptVersionId`. |
| Approval status | Current approval state: active, testing, draft, blocked. |
| Required checks | List of checks that must pass before the prompt can be used. |
| Allowed outputs | Declared list of permitted output types. |
| Blocked patterns | List of patterns that must not appear in outputs. |
| Input / output schema references | References to JSON schema records; schema versioning planned for a later gate. |

---

### E. Cost Readiness

Candidate resources owned by the CostMonitorPage domain.

| Candidate resource | Description |
|---|---|
| Route / task cost policy | Budget cap, per-run cost limit, and throttling policy for a given task type or route. |
| Budget cap | Monthly or per-period budget ceiling. |
| Approval threshold | Cost level above which human approval is required before execution. |
| Forecast risk | Derived risk level based on projected cost vs. cap. |
| Provider usage / metering reference | Reference to a future metering data feed from the provider; static estimates are not sufficient for real cost readiness. |

---

### F. Workflow Definitions

Candidate resources representing the workflow shape accepted by WorkflowRunsPage.

| Candidate resource | Description |
|---|---|
| Workflow definition | Named, versioned workflow with trigger, steps, and status. |
| Workflow trigger | Configured trigger type, start condition, event source, start-when condition, and update policy. |
| Workflow step contract | Per-step record with input refs, output contract, model route reference, prompt reference, cost policy reference, and review requirement. |
| Multi-source inputs | Step input references spanning multiple source domains and fields. |
| Structured outputs | Output contract specifying type, format, destination page, destination field, visibility, and review requirement. |
| Next-route chaining | Whether and how an output opens a subsequent workflow, including transition condition and inputs forwarded. |
| Prompt sent with output | Optional prompt reference passed alongside an output to the next route. |

---

### G. Input / Output Schema Contracts

Candidate resources for governed schema versioning. Planned for a later schema versioning gate.

| Candidate resource | Description |
|---|---|
| Input schema | JSON schema defining the fields required or optional for a step's input context. |
| Output schema | JSON schema defining the expected shape of a step's output. |
| Schema version | Stable version identifier for a given schema record. |
| Required / optional fields | Declared field list with required/optional distinction. |
| Validation result | Result of validating an input or output against its schema; planned for runtime only. |

---

### H. Run Artifacts

Candidate resources representing outputs produced during a workflow run.

| Candidate resource | Description |
|---|---|
| Run artifact | Output artifact produced by a workflow step run, with stable `artifactId`. |
| Output artifact | Typed artifact (content draft, analysis result, image prompt, etc.) with visibility and review status. |
| Product analysis result artifact | Artifact containing product snapshot, prompt snapshot, route snapshot, result summary, and campaign suggestions. |
| Preview / result artifact | Customer-facing or reviewer-facing artifact with controlled visibility. |
| Artifact review status | Current review state of an artifact: needs_review, approved, rejected. |

---

### I. Run Audits

Candidate audit event types. All audit events must be backend append-only and immutable.

| Candidate event | Description |
|---|---|
| `readiness_evaluated` | Readiness was evaluated for a workflow step or run. |
| `dry_run_executed` | A dry-run readiness check was executed for a workflow definition. |
| `trigger_changed` | The workflow trigger configuration was changed. |
| `input_output_contract_changed` | A step's input or output contract was modified. |
| `output_approved` | A workflow output artifact was approved by a reviewer. |
| `output_rejected` | A workflow output artifact was rejected. |
| `provider_health_checked` | A provider health probe was executed. |
| `route_changed` | A model route was updated. |
| `prompt_approved` | A prompt version was approved. |
| `prompt_rejected` | A prompt version was rejected or blocked. |
| `cost_threshold_changed` | A cost approval threshold or budget cap was changed. |

---

### J. Product Analysis Results

Candidate resources for governed product analysis owned by ProductAnalysis Studio.

| Candidate resource | Description |
|---|---|
| Product snapshot | Immutable snapshot of the product record at analysis time. |
| Analysis result | Full result record with stable `productAnalysisResultId`. |
| Readiness score | Advisory score derived from dimension coverage; not an execution guarantee. |
| Strengths | Identified product strengths from analysis. |
| Improvements | Identified improvement areas from analysis. |
| Campaign suggestions | Derived campaign direction suggestions. |
| Linked artifact / result summary | Reference to the associated run artifact or result artifact. |

---

## 6. Candidate Endpoint Paths

All paths below are **candidates only**. They require review before any OpenAPI YAML is written. All are NO-GO for implementation in this gate.

### Readiness

```
GET  /workspaces/{workspaceId}/readiness
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness
```

### Providers

```
GET  /workspaces/{workspaceId}/ai-providers
GET  /workspaces/{workspaceId}/ai-providers/{providerId}
GET  /workspaces/{workspaceId}/ai-providers/{providerId}/readiness
POST /workspaces/{workspaceId}/ai-providers/{providerId}/test-connection
```

### Model Routes

```
GET  /workspaces/{workspaceId}/model-routes
GET  /workspaces/{workspaceId}/model-routes/{modelRouteId}
GET  /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness
```

### Prompts

```
GET  /workspaces/{workspaceId}/prompts
GET  /workspaces/{workspaceId}/prompts/{promptId}
GET  /workspaces/{workspaceId}/prompts/{promptId}/readiness
GET  /workspaces/{workspaceId}/prompts/{promptId}/versions/{promptVersionId}
```

### Cost Policy

```
GET  /workspaces/{workspaceId}/cost-policies
GET  /workspaces/{workspaceId}/cost-policies/{costPolicyId}/readiness
```

### Workflow Definitions

```
GET  /workspaces/{workspaceId}/workflow-definitions
POST /workspaces/{workspaceId}/workflow-definitions
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}
PUT  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}
```

### Workflow Dry Run

```
POST /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/dry-run
```

### Data Sources

```
GET  /workspaces/{workspaceId}/data-sources
GET  /workspaces/{workspaceId}/data-sources/{dataSourceId}/readiness
```

### Run Artifacts

```
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/artifacts
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/artifacts/{artifactId}
```

### Run Audit Events

```
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/audit-events
GET  /workspaces/{workspaceId}/audit-events
```

### Product Analysis

```
GET  /workspaces/{workspaceId}/products/{productId}/analysis-results
POST /workspaces/{workspaceId}/products/{productId}/analysis-results
GET  /workspaces/{workspaceId}/products/{productId}/analysis-results/{productAnalysisResultId}
```

These are candidate paths. They require a Review Gate before any YAML implementation begins.

## 7. Candidate Schemas

All schemas below are **planning only**. None are implemented or validated in this gate.

---

### `ReadinessStatus` enum

```
ready
warning
blocked
unknown
not_applicable
```

Rule: `unknown` must not be treated as `ready` for real execution. An unresolvable state is not a passing state.

---

### `ReadinessSignal`

```
ReadinessSignal {
  status:          ReadinessStatus
  score:           integer (0–100, advisory only)
  blockers:        string[]
  warnings:        string[]
  checks:          string[]
  owner:           string
  updatedAt:       ISO8601
  evidenceSummary: string
  nextAction:      string | null
}
```

---

### `WorkflowStepReadiness`

```
WorkflowStepReadiness {
  workflowKey:      string
  stepKey:          string
  triggerReady:     ReadinessSignal
  inputReady:       ReadinessSignal
  providerReady:    ReadinessSignal
  routeReady:       ReadinessSignal
  promptReady:      ReadinessSignal
  costReady:        ReadinessSignal
  reviewReady:      ReadinessSignal
  outputReady:      ReadinessSignal
  destinationReady: ReadinessSignal
  dataSourceReady:  ReadinessSignal
  overallStatus:    ReadinessStatus
  blockers:         string[]
  warnings:         string[]
  checks:           string[]
  nextActions:      string[]
  evidenceSummary:  string
  updatedAt:        ISO8601
}
```

---

### `WorkflowDefinition`

```
WorkflowDefinition {
  workflowDefinitionId: string
  workspaceId:          string
  name:                 string
  trigger:              WorkflowTrigger
  steps:                WorkflowStepContract[]
  status:               string (draft | active | archived)
  version:              string
  createdAt:            ISO8601
  updatedAt:            ISO8601
}
```

---

### `WorkflowTrigger`

```
WorkflowTrigger {
  triggerType:    string
  startWhen:      string
  startCondition: string
  eventSource:    string
  updatePolicy:   string | null
}
```

---

### `WorkflowStepContract`

```
WorkflowStepContract {
  stepKey:        string
  name:           string
  inputRefs:      InputRef[]
  outputContract: OutputContract
  modelRouteRef:  string | null  (modelRouteId)
  promptRef:      string | null  (promptVersionId)
  costPolicyRef:  string | null  (costPolicyId)
  reviewRequired: boolean
}
```

---

### `InputRef`

```
InputRef {
  sourceDomain:    string
  fieldKey:        string
  fieldLabel:      string (display only)
  required:        boolean
  schemaRef:       string | null  (inputSchemaId)
  snapshotRequired: boolean
}
```

---

### `OutputContract`

```
OutputContract {
  outputName:             string
  outputType:             string
  outputFormat:           string
  destination:            string (destinationPage key)
  destinationPage:        string (display label, snapshot only)
  destinationField:       string | null
  visibility:             string (customer_visible | reviewer_only | internal | admin_only)
  reviewRequired:         boolean
  usableAsNextInput:      boolean
  nextWorkflow:           string | null
  nextStep:               string | null
  transitionCondition:    string | null
  promptToSendWithOutput: string | null  (promptVersionId)
}
```

---

### `ProviderReadiness`

```
ProviderReadiness {
  providerId:              string
  status:                  string (active | disabled | deprecated)
  healthStatus:            string (healthy | degraded | unavailable | unknown)
  lastTestedAt:            ISO8601 | null
  supportedCapabilities:   string[]
  supportedModels:         string[]
  secretReferenceName:     string
  // secretValue is never included in any response
}
```

---

### `ProductAnalysisResult`

```
ProductAnalysisResult {
  productAnalysisResultId: string
  productId:               string
  productSnapshot:         object (immutable product record at analysis time)
  promptVersionSnapshot:   object (snapshot of prompt version used)
  routeSnapshot:           object (snapshot of model route used)
  costPolicySnapshot:      object (snapshot of cost policy at execution time)
  resultSummary:           string
  strengths:               string[]
  improvements:            string[]
  campaignSuggestions:     string[]
  readinessScore:          integer (advisory only)
  createdAt:               ISO8601
}
```

---

## 8. Identity Model

The following identifiers are planned as stable canonical identifiers. Names and labels are display-only; no name-based identity is permitted.

| Identifier | Owner domain |
|---|---|
| `workspaceId` | Workspace |
| `providerId` | SecretsAndKeysPage domain |
| `modelRouteId` | ModelRoutingPage domain |
| `promptId` | PromptGovernancePage domain |
| `promptVersionId` | PromptGovernancePage domain |
| `costPolicyId` | CostMonitorPage domain |
| `workflowDefinitionId` | WorkflowRunsPage / workflow engine |
| `workflowRunId` | WorkflowRunsPage / workflow engine |
| `workflowStepKey` | Per-workflow step identifier (stable within a definition version) |
| `artifactId` | Run artifact store |
| `auditEventId` | Immutable audit log |
| `productAnalysisResultId` | ProductAnalysis Studio domain |
| `productId` | ProductCatalogPage domain |
| `dataSourceId` | DataSourcesHubPage domain |

Rules:

- All identifiers are canonical opaque strings.
- Display names are snapshots only and must not be used as identifiers.
- Secret values are never returned in any API response; only `secretReferenceName` is exposed.
- `productName` and `assetName` may appear as display snapshots inside result artifacts but must not serve as identity keys.

## 9. Security and Governance Planning

The future API must require the following controls before any endpoint is implemented. These are planned requirements, not current implementations.

- **Secret Vault integration.** All provider credential retrieval must go through a real secret vault. No raw credential values may appear in request or response bodies.
- **RBAC.** Admin, Owner, Reviewer, and Editor role distinctions must be enforced before any sensitive endpoint is exposed. Sensitive actions include provider configuration, prompt approval, cost policy changes, and workflow execution.
- **Immutable audit log.** All sensitive changes — provider config, route changes, prompt approval/rejection, cost threshold changes, trigger changes, and output approval/rejection — must produce an append-only, tamper-evident audit event.
- **Idempotency.** Trigger execution, dry-run requests, and any mutating action where replay could cause duplicate effects must accept and honor an idempotency key.
- **No raw secret values in any context.** Request bodies, response bodies, logs, and error messages must never contain raw API keys or credentials.
- **No generated clients until Review Gate.** No client code may be generated from this planning document. Generated clients require a reviewed and accepted OpenAPI YAML first.
- **Audit events for sensitive changes.** Each sensitive action must produce an identifiable, timestamped audit event with actor identity, resource identity, change summary, and before/after state where applicable.

## 10. Runtime Blockers

Real runtime execution remains blocked. The following prerequisites must all be resolved before any endpoint described in this document can go live.

| Blocker | Reason |
|---|---|
| Secret Vault | Provider credentials cannot be accessed safely without a real secret manager. |
| RBAC | Sensitive endpoint access cannot be authorized without defined and enforced roles. |
| Immutable Audit Log | Policy and execution events cannot be recorded without an append-only backend log. |
| Workflow Engine | Workflow definitions cannot be executed without a real execution engine. |
| Trigger Execution Policy | Trigger registration, event ingestion, idempotency, retry, and failure escalation must be designed. |
| Idempotency / Retry / Failure Policy | Mutating actions must be safe to retry without duplicate effects. |
| Input / Output Schema Validation | Step inputs and outputs cannot be validated without defined and versioned JSON schemas. |
| Runtime Snapshots | Prompt, route, provider, cost, and schema state must be captured at execution time for each run. |
| Provider Usage / Cost Metering | Real cost readiness requires live provider usage data, not static estimates. |
| Artifact / Result Persistence | Run outputs cannot be stored or referenced without a defined artifact identity and persistence model. |

## 11. Relationship to Existing OpenAPI

- Existing OpenAPI Slice 1 and Slice 2 remain accepted. This planning document does not edit `docs/nashir_v1_openapi.yaml`.
- Future readiness contract resources must reuse existing Slice 1/2 conventions where applicable:
  - `ErrorModel` for all error responses.
  - `PaginationMeta` for list responses.
  - `Idempotency-Key` header for applicable mutating actions.
  - `If-Match` or `X-Resource-Version` for optimistic concurrency where state may conflict.
  - `workspaceId` path scoping for all workspace-scoped resources.
  - Standard `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500` error response shapes.
  - No name-based resource identity; all resources use stable opaque ID fields.
- OpenAPI Slice 3 remains NO-GO. It must not be opened until this planning document has been reviewed and accepted, and a separate implementation gate has been opened.

## 12. Explicitly Out of Scope

This gate does not approve and explicitly prohibits:

- OpenAPI YAML implementation
- Backend runtime
- Real workflow execution
- Real trigger execution
- Real AI/model calls
- Real prompt execution
- Real connector calls
- Real analytics integration
- Generated clients
- Database migrations
- Tests
- Billing or subscription scope
- AI Gateway Overview

## 13. Risks and Gaps

The following risks are identified for the Review Gate to assess.

| Risk | Description |
|---|---|
| Readiness score misuse | Score may be misread as an execution authorization signal. Rule: blockers, not score, determine denial. |
| `unknown` treated as `ready` | Consumers may default `unknown` to passing. Rule: `unknown` must be treated as non-passing for real execution. |
| Page-local state leaking into backend contract | If owner pages write to localStorage and consumer pages read it, the contract-first pattern is violated. |
| Output destinations without field-level target | A destination page alone is insufficient; the destination field must be captured in `OutputContract.destinationField`. |
| Trigger execution without idempotency/audit | Trigger activation without idempotency keys and audit events risks duplicate runs and undetectable failures. |
| Product analysis without snapshots | Analysis results without prompt/route/cost snapshots cannot be reproduced or audited. |
| Provider health without secret vault | Provider health checks that access credentials without a vault violate the security model. |
| Cost readiness without provider metering | Static per-run estimates are not sufficient; real cost readiness requires live metering data. |
| WorkflowRunsPage becoming owner | If WorkflowRunsPage holds authoritative routing, prompt, or cost state in its local catalogs during backend wiring, it becomes an owner instead of a consumer — violating the accepted ownership model. |

## 14. Recommended Next Gate

**OpenAPI Shared Readiness Contract Surface Review Gate**

This gate must:

- Review each candidate resource group for completeness, correctness, and scope.
- Review each candidate endpoint path for consistency with Slice 1/2 conventions.
- Review each candidate schema for identity model compliance and security rules.
- Confirm which resource groups are prioritized for Slice 3 and which are deferred.
- Produce a reviewed and ordered list of approved API surface candidates.
- Explicitly confirm or reject OpenAPI YAML implementation readiness.

This gate must not:

- Implement OpenAPI YAML.
- Implement backend.
- Generate clients.
- Open Slice 3 implementation.

## 15. Final Decision

| Subject | Decision |
|---|---|
| Planning | GO |
| OpenAPI YAML | NO-GO |
| Backend implementation | NO-GO |
| Generated clients | NO-GO |
| Next gate | OpenAPI Shared Readiness Contract Surface Review Gate |
