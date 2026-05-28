# OpenAPI Slice 3 YAML Implementation Scope Gate — Readiness Snapshots Only

## 1. Task Classification

| Field | Value |
|---|---|
| Gate type | Documentation-only YAML implementation scope gate |
| Repository | nashir-ui-prototype |
| Status | Scope definition only — no YAML edited, no runtime, no generated clients, no UI |
| YAML changes | NO-GO in this gate |
| Backend implementation | NO-GO in this gate |
| Generated clients | NO-GO in this gate |
| UI changes | NO-GO in this gate |
| Workflow execution | NO-GO in this gate |
| Dry-run execution | NO-GO in this gate |
| Provider test-connection | NO-GO in this gate |
| Run artifacts | NO-GO in this gate |
| Run audits | NO-GO in this gate |
| Product analysis result creation | NO-GO in this gate |

This gate defines the exact boundary a future YAML implementation PR may touch. It does not edit `docs/nashir_v1_openapi.yaml`, `src/`, or any generated file. No implementation is authorized under this gate.

---

## 2. Inputs

### Closed upstream gates

| Gate | Document | Status |
|---|---|---|
| Backend Readiness Acceptance Gate | `docs/backend_readiness_ai_ops_shared_readiness_model_acceptance.md` | GO with conditions / Closed |
| OpenAPI Shared Readiness Contract Surface Acceptance Gate | `docs/openapi_shared_readiness_contract_surface_acceptance.md` | GO with conditions / Closed |
| OpenAPI Slice 3 Planning Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_planning_gate.md` | Closed (PR #9) |
| OpenAPI Slice 3 Review Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_review_gate.md` | GO with conditions / Closed (PR #10) |
| OpenAPI Slice 3 Acceptance Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_acceptance_gate.md` | GO with conditions / Closed (PR #11) |

### Inherited NO-GO boundaries

The following prohibitions are inherited from all upstream gates and remain in force throughout this scope gate and any future implementation PR derived from it.

| Prohibition | Source |
|---|---|
| No `secretValue`, `apiKey`, `rawKey`, or credential payload in any schema | Condition S3 |
| No backend runtime implementation | Backend Readiness Acceptance Gate |
| No YAML edits without explicit separate authorization | Slice 3 Acceptance Gate |
| No workflow execution, trigger execution, or dry-run | Conditions F1, DR1 |
| No provider test-connection | Conditions A1, B1 |
| No run artifacts or run audit endpoints | Conditions H1, I1 |
| No product analysis result creation | Condition J1 |
| No generated clients without accepted YAML | Slice 3 Review Gate |
| No `unknown` treated as `ready` | Condition S4 |
| No score used as execution gate | Condition S1, S5 |
| No page-to-page direct state dependency in backend design | Backend Readiness Acceptance Gate |

### Twenty-one conditions inherited

All fifteen upstream conditions (A1, B1, F1, H1, I1, J1, DR1, S1–S5, ID1–ID2, RequestIdHeader) and all six review gate conditions (R1–R6) remain in force and are referenced across Sections 6, 8, 9, and 14.

### Existing YAML conventions (read-only context)

From `docs/nashir_v1_openapi.yaml`:

| Convention | Value |
|---|---|
| `RequestIdHeader` component | `name: X-Request-Id`, `in: header`, `required: false`, type `string` |
| `ErrorModel` component | Object with required fields: `errorCode`, `message`, `requestId`, `retryable`, `status` |
| `PaginationMeta` component | Exists; not required for Slice 3 (no paginated list responses) |
| Existing `Readiness` schema | Simple advisory schema: `score`, `label`, `issues`; must not be replaced or renamed |
| `operationId` convention | camelCase: verb + resource noun, e.g. `getProduct`, `listProducts`, `createAsset` |
| Path scoping | All workspace-scoped resources use `/workspaces/{workspaceId}/` prefix |
| Error response codes | `400`, `401`, `403`, `404`, `429`, `500` |
| `Idempotency-Key` header | Used on mutating transitions only; not applicable to read-only endpoints |
| `If-Match` / `X-Resource-Version` | Used on mutable PUT endpoints only; not applicable to read-only endpoints |

---

## 3. Scope Decision

| Subject | Decision |
|---|---|
| Define future YAML implementation scope | GO |
| Edit `docs/nashir_v1_openapi.yaml` in this gate | NO-GO |
| Implement backend runtime | NO-GO |
| Create generated clients | NO-GO |
| Modify `src/` | NO-GO |

This gate defines the boundary. A future YAML implementation PR remains blocked until explicit separate authorization is granted per Section 13.

---

## 4. Accepted Future YAML Target

A future YAML implementation PR may touch the following areas of `docs/nashir_v1_openapi.yaml` only:

| YAML area | Permitted change |
|---|---|
| `paths` | Add the six accepted read-only readiness snapshot GET paths (Section 5) |
| `components.schemas` | Add the accepted readiness snapshot schemas (Section 7) |
| `components.parameters` | Reuse existing `RequestIdHeader` and `WorkspaceIdPath` via `$ref` only; do not introduce new parameters under this scope |
| `components.headers` | No new headers; reuse existing conventions only |

No other area of `docs/nashir_v1_openapi.yaml` may be touched by a Slice 3 YAML implementation PR.

---

## 5. Future Endpoint Inventory

A future YAML implementation PR **may add** only the following six read-only GET endpoints. All are accepted by the Slice 3 Acceptance Gate (PR #11). No mutation endpoints, write operations, or execution semantics may be introduced.

### Endpoint 1 — Workspace Readiness Summary

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/readiness` |
| Method | `GET` |
| operationId direction | `getWorkspaceReadiness` |
| Response schema | `WorkspaceReadinessSummary` |
| Purpose | Advisory rollup of readiness status across all active workflow definitions in a workspace |
| Parameters | `WorkspaceIdPath` (`$ref`), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not imply execution; must not gate workflow dispatch; advisory only |

### Endpoint 2 — Workflow Readiness Snapshot

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness` |
| Method | `GET` |
| operationId direction | `getWorkflowReadiness` |
| Response schema | `WorkflowReadinessSnapshot` |
| Purpose | Per-workflow readiness covering all steps across all ten dimensions |
| Parameters | `WorkspaceIdPath` (`$ref`), `workflowDefinitionId` (path), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not describe workflow execution; must not imply definition creation or mutation |

### Endpoint 3 — Workflow Step Readiness Snapshot

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness` |
| Method | `GET` |
| operationId direction | `getWorkflowStepReadiness` |
| Response schema | `WorkflowStepReadiness` |
| Purpose | Per-step readiness with all ten dimension signals, blockers, warnings, checks, next actions, evidence summary, and timestamp |
| Parameters | `WorkspaceIdPath` (`$ref`), `workflowDefinitionId` (path), `stepKey` (path), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not imply step execution; must not accept a request body |

### Endpoint 4 — Provider Readiness Snapshot

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/ai-providers/{providerId}/readiness` |
| Method | `GET` |
| operationId direction | `getProviderReadiness` |
| Response schema | `ProviderReadinessSnapshot` |
| Purpose | Read-only snapshot of provider health, capabilities, and secret reference; does not probe the live provider |
| Parameters | `WorkspaceIdPath` (`$ref`), `providerId` (path), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not imply provider testing (`POST /test-connection` remains deferred — Conditions A1, B1); must not expose `secretValue`; description must state endpoint reads a stored snapshot and does not call the provider |

### Endpoint 5 — Route Readiness Snapshot

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness` |
| Method | `GET` |
| operationId direction | `getModelRouteReadiness` |
| Response schema | `RouteReadinessSnapshot` |
| Purpose | Read-only snapshot of model route health, provider binding, and policy as evaluated |
| Parameters | `WorkspaceIdPath` (`$ref`), `modelRouteId` (path), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not imply route invocation or model call; description must clarify this is a readiness snapshot |

### Endpoint 6 — Prompt Readiness Snapshot

| Field | Value |
|---|---|
| Path | `/workspaces/{workspaceId}/prompts/{promptId}/readiness` |
| Method | `GET` |
| operationId direction | `getPromptReadiness` |
| Response schema | `PromptReadinessSnapshot` |
| Purpose | Read-only snapshot of prompt version approval status, required checks, allowed outputs, and blocked patterns |
| Parameters | `WorkspaceIdPath` (`$ref`), `promptId` (path), `RequestIdHeader` (`$ref`) |
| Error responses | `401`, `403`, `404`, `429`, `500` via `ErrorModel` `$ref` |
| Exclusions | Must not imply prompt execution; must not include prompt content or input/output text in the response |

### Omitted endpoints (confirmed by Slice 3 Acceptance Gate)

| Endpoint | Reason omitted |
|---|---|
| `GET .../cost-policies/{costPolicyId}/readiness` | Condition R1 — covered by step readiness rollup; no confirmed standalone use case |
| `GET .../data-sources/{dataSourceId}/readiness` | Condition R1 — covered by step readiness rollup; no confirmed standalone use case |

`CostReadinessSnapshot` and `DataSourceReadinessSnapshot` schemas remain accepted for embedded use within `WorkflowStepReadiness`. If a confirmed consumer use case for standalone cost or data-source readiness emerges, a new planning and review cycle is required before those paths are added.

---

## 6. Endpoint Naming Constraints

Future YAML route names, operationIds, path segments, tag names, summary strings, and description text must not use or imply any of the following:

| Forbidden term / concept | Reason |
|---|---|
| `execute`, `run`, `invoke`, `fire`, `trigger` | No execution semantics in Slice 3 |
| `dry-run`, `dryRun`, `simulate`, `preview` (as request action) | `POST /dry-run` is deferred (Condition DR1) |
| `test`, `ping`, `probe`, `check-connection` | Provider test-connection is deferred (Conditions A1, B1) |
| `create-artifact`, `artifact`, `auditEvent` | Run artifacts and audits are deferred (Conditions H1, I1) |
| `analyze`, `generate`, `produce`, `publish` | Product analysis and content generation are out of scope |
| `billing`, `subscription`, `charge` | Out of scope all V1 gates |
| `gateway`, `ai-gateway` | AI Gateway Overview deferred post-V1 |

Permitted operationId pattern: `get` + resource noun in PascalCase. Examples: `getWorkspaceReadiness`, `getWorkflowReadiness`, `getWorkflowStepReadiness`, `getProviderReadiness`, `getModelRouteReadiness`, `getPromptReadiness`.

---

## 7. Accepted Future Schema Inventory

A future YAML implementation PR **may add** the following schemas to `components.schemas`. All are accepted by the Slice 3 Acceptance Gate (PR #11). Field names, types, and constraints below are the accepted starting point. Deviation from these definitions requires a new review cycle.

### `ReadinessStatus`

Enum with five accepted values:

| Value | Meaning |
|---|---|
| `ready` | Dimension fully satisfied |
| `warning` | Partially satisfied; issue does not block |
| `blocked` | Hard requirement unmet; execution must be denied |
| `unknown` | Cannot be resolved; must not be treated as `ready` |
| `not_applicable` | Dimension does not apply to this step type |

YAML description must explicitly state that `unknown` is not equivalent to `ready`.

### `ReadinessSignal`

Normalized per-dimension readiness signal.

| Field | Type | Constraint |
|---|---|---|
| `dimension` | string enum | Required on standalone responses; may be omitted on embedded signals where field name acts as discriminator (Condition S2) |
| `status` | `ReadinessStatus` | Required |
| `score` | integer 0–100 | Advisory only; YAML description must state score must not gate execution (Condition S1) |
| `blockers` | string[] | Non-empty means dimension is blocked; drives execution denial (Condition S5) |
| `warnings` | string[] | Surfaced to user; do not block dry-run display |
| `checks` | string[] | Passing checks; not execution conditions |
| `owner` | string | Domain module name; not a UI page reference |
| `evidenceSummary` | string | Human-readable summary; must not contain raw secrets |
| `nextAction` | string or null | User-facing remediation guidance |
| `updatedAt` | ISO8601 string | Timestamp of evaluation |

`secretValue` must not appear in this schema under any circumstances (Condition S3).

### `WorkflowStepReadiness`

Aggregate readiness for a single workflow step across all ten dimensions.

| Field | Type | Notes |
|---|---|---|
| `workflowDefinitionId` | string | Workflow definition identifier |
| `workflowVersion` | string | Version of the definition; must be named `workflowVersion`, not bare `version` |
| `stepKey` | string | Stable within `(workflowDefinitionId, workflowVersion)` only (Conditions ID1, ID2) |
| `triggerReady` | `ReadinessSignal` | `dimension` field omitted on embedded form |
| `inputReady` | `ReadinessSignal` | |
| `providerReady` | `ReadinessSignal` | |
| `routeReady` | `ReadinessSignal` | |
| `promptReady` | `ReadinessSignal` | |
| `costReady` | `ReadinessSignal` | |
| `reviewReady` | `ReadinessSignal` | |
| `outputReady` | `ReadinessSignal` | |
| `destinationReady` | `ReadinessSignal` | |
| `dataSourceReady` | `ReadinessSignal` | |
| `overallStatus` | `ReadinessStatus` | `blocked` if any required dimension has blockers |
| `blockers` | string[] | Aggregate of all dimension blockers |
| `warnings` | string[] | Aggregate of all dimension warnings |
| `checks` | string[] | Aggregate of all dimension passing checks |
| `nextActions` | string[] | User-facing remediation guidance |
| `evidenceSummary` | string | Summary only; no secrets |
| `updatedAt` | ISO8601 string | |

YAML description for `stepKey` must state its stability is scoped to `(workflowDefinitionId, workflowVersion)` (Conditions ID1, ID2).

### `WorkspaceReadinessSummary`

| Field | Type | Notes |
|---|---|---|
| `workspaceId` | string | |
| `overallStatus` | `ReadinessStatus` | Advisory; worst status across active workflows |
| `totalActiveWorkflows` | integer | |
| `blockedWorkflows` | integer | Workflows with at least one blocked step |
| `warningWorkflows` | integer | Workflows with at least one warning and no blocked steps |
| `readyWorkflows` | integer | Workflows with all steps ready |
| `unknownWorkflows` | integer | Workflows with at least one unknown dimension |
| `updatedAt` | ISO8601 string | |

### `WorkflowReadinessSnapshot`

| Field | Type | Notes |
|---|---|---|
| `workflowDefinitionId` | string | |
| `workflowVersion` | string | Must be `workflowVersion`; consistent with `WorkflowStepReadiness` |
| `overallStatus` | `ReadinessStatus` | Worst status across all steps |
| `stepReadiness` | `WorkflowStepReadiness[]` | One entry per step; not a paginated list resource |
| `blockers` | string[] | Aggregate |
| `warnings` | string[] | Aggregate |
| `updatedAt` | ISO8601 string | |

### `ProviderReadinessSnapshot`

| Field | Type | Notes |
|---|---|---|
| `providerId` | string | Stable canonical identifier |
| `dimension` | string | Fixed value `providerReady` |
| `status` | `ReadinessStatus` | |
| `healthStatus` | string enum | `healthy \| degraded \| unavailable \| unknown` |
| `lastTestedAt` | ISO8601 string or null | Null if never tested |
| `supportedCapabilities` | string[] | Declared capabilities |
| `supportedModels` | string[] | Declared model identifiers |
| `secretReferenceName` | string | Vault reference name only; YAML description must state secret values are never returned (Condition S3) |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 string | |

`secretValue` must not appear in this schema. YAML description must state this explicitly (Condition S3).

### `RouteReadinessSnapshot`

| Field | Type | Notes |
|---|---|---|
| `modelRouteId` | string | |
| `dimension` | string | Fixed value `routeReady` |
| `status` | `ReadinessStatus` | |
| `primaryModelId` | string | Stable identifier |
| `fallbackModelIds` | string[] | Ordered list |
| `providerReady` | `ReadinessStatus` | Scalar derived status — intentional; not a full embedded `ReadinessSignal` (Condition R4) |
| `routeHealth` | string enum | `healthy \| degraded \| unavailable \| unknown` |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 string | |

### `PromptReadinessSnapshot`

| Field | Type | Notes |
|---|---|---|
| `promptId` | string | |
| `promptVersionId` | string | Stable versioned identifier; distinct from `promptId` |
| `dimension` | string | Fixed value `promptReady` |
| `status` | `ReadinessStatus` | |
| `approvalStatus` | string enum | `active \| testing \| draft \| blocked` |
| `requiredChecks` | string[] | Checks that must pass before use |
| `allowedOutputs` | string[] | Permitted output types |
| `blockedPatterns` | string[] | Patterns that must not appear in outputs |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 string | |

### `CostReadinessSnapshot` and `DataSourceReadinessSnapshot`

Both schemas are accepted and may be added to `components.schemas` for embedded use within `WorkflowStepReadiness`. Their standalone GET endpoints are omitted from Slice 3 (Condition R1). A future YAML PR must not add standalone paths for these two schemas unless a new planning and review cycle explicitly reintroduces them.

**`CostReadinessSnapshot` fields:** `costPolicyId`, `dimension` (fixed `costReady`), `status`, `budgetCap` (number), `approvalThreshold` (number), `forecastRisk` (enum: `ok | watch | risk | blocked`), `throttlingActive` (boolean), `score`, `blockers`, `warnings`, `updatedAt`.

**`DataSourceReadinessSnapshot` fields:** `dataSourceId`, `dimension` (fixed `dataSourceReady`), `status`, `connectorStatus` (enum: `available | unavailable | degraded | unknown`), `governed` (boolean), `redactionActive` (boolean), `score`, `blockers`, `warnings`, `updatedAt`.

### Deferred schemas — must not be introduced in Slice 3 YAML PR

| Schema | Status | Reason |
|---|---|---|
| `ReadinessBlocker` | DEFERRED (Condition R2) | `blockers[]` remains `string[]` in Slice 3; structured blocker deferred to schema versioning gate |
| `ReadinessUnknownReason` | DEFERRED (Condition R3) | No confirmed consumer disambiguation requirement in Slice 3 |

---

## 8. Schema Field Constraints

The following constraints are binding on all schemas in any future Slice 3 YAML PR.

| Constraint | Requirement |
|---|---|
| No `secretValue` | No schema, request body, response, error, or header field may be named `secretValue`, `apiKey`, `rawKey`, `credential`, or any synonymous term (Condition S3) |
| No raw secret values | `evidenceSummary`, `message`, `description`, and any string field must not carry raw credentials |
| `unknown` is not `ready` | `ReadinessStatus` YAML description must explicitly state `unknown` must not be treated as `ready` (Condition S4) |
| Blockers override score | `ReadinessSignal.score` YAML description must state it is advisory only and must not gate execution (Conditions S1, S5) |
| `ReadinessSignal` dimension discriminator | `dimension` field required on standalone responses; ten accepted values listed in Section 7 (Condition S2) |
| `workflowVersion` not bare `version` | Composite identity fields must be `workflowDefinitionId` + `workflowVersion` + `stepKey`; bare `version` must not be used where the version component of a workflow composite key is intended (Conditions ID1, ID2) |
| `stepKey` stability stated | YAML description for `WorkflowStepReadiness.stepKey` must state stability is scoped to `(workflowDefinitionId, workflowVersion)` only |
| No prompt content in responses | `PromptReadinessSnapshot` must not include prompt text, system message content, or raw input/output templates |
| No execution request body | No read-only GET endpoint may carry a request body that accepts execution parameters |

---

## 9. Request / Response Constraints

| Constraint | Requirement |
|---|---|
| Read-only GET behavior | All six Slice 3 endpoints are GET; no POST, PUT, PATCH, DELETE may be added under this scope |
| No request bodies | No GET endpoint in Slice 3 may carry a request body unless an existing Slice 1/2 convention explicitly requires it (none does) |
| No execution request model | No schema named `ExecutionRequest`, `RunRequest`, `DryRunRequest`, `TriggerRequest`, or equivalent may be introduced |
| No dry-run request model | `DryRunResult` is deferred (Condition DR1); no dry-run schema may appear |
| No provider test request model | `POST /test-connection` is deferred (Conditions A1, B1); no provider probe schema may appear |
| No artifact or audit result creation | `artifactId` and `auditEventId` are forward-looking identifiers only; no path segment relying on `workflowRunId`, `artifactId`, or `auditEventId` may appear (Conditions H1, I1) |
| Responses preserve advisory semantics | All response schemas must reinforce that readiness results are advisory; descriptions must not imply operational guarantees |

---

## 10. ErrorModel and RequestIdHeader Constraints

### ErrorModel

A future Slice 3 YAML PR must use the existing `ErrorModel` component via `$ref: "#/components/schemas/ErrorModel"` for all error responses. The existing `ErrorModel` shape (`errorCode`, `message`, `details`, `requestId`, `retryable`, `status`) must not be modified or replaced. If a Slice 3 error response requires additional fields, those must be accommodated within the existing `ErrorModel.details` object, not by introducing a new error schema.

### RequestIdHeader

A future Slice 3 YAML PR must apply the existing `RequestIdHeader` component via `$ref: "#/components/parameters/RequestIdHeader"` on every Slice 3 endpoint. The component is defined in Slice 1/2 as:

- `name: X-Request-Id`
- `in: header`
- `required: false`
- `type: string`

A Slice 3 YAML PR must not redefine, rename, or mark this header as `required: true`. It must not introduce a new header component for request correlation.

### Existing `Readiness` schema

The existing `Readiness` schema in `components.schemas` (fields: `score`, `label`, `issues`) is a Slice 1/2 schema used by existing endpoints. A Slice 3 YAML PR must not replace, rename, or modify it. `ReadinessSignal` is a new, separate schema added alongside the existing `Readiness` schema. There must be no naming conflict.

---

## 11. Consumer Boundary

The following UI pages are the expected future consumers of the Slice 3 readiness snapshot API. A Slice 3 YAML PR must not modify any of these files. Consumer page wiring to the Slice 3 API is a future task scoped to a separate implementation and review cycle.

| Consumer page | Expected role |
|---|---|
| `WorkflowRunsPage.jsx` | Primary consumer; reads step and workflow readiness snapshots to replace local static catalogs |
| `CampaignWizardPage.jsx` | Reads campaign-level and step readiness for output generation readiness display |
| `StoreSetupPage.jsx` | Reads workspace readiness summary for high-level AI readiness indicators |
| `ProductIntelligencePage.jsx` | Reads prompt and route readiness for product analysis step readiness |
| `ProductCatalogPage.jsx` | Reads input readiness to confirm product data sufficiency before analysis |
| `SecretsAndKeysPage.jsx` | Owner of `providerReady`; reads `ProviderReadinessSnapshot` for current provider health |
| `ModelRoutingPage.jsx` | Owner of `routeReady`; reads `RouteReadinessSnapshot` for current route health |
| `PromptGovernancePage.jsx` | Owner of `promptReady`; reads `PromptReadinessSnapshot` for approval and check status |
| `CostMonitorPage.jsx` | Owner of `costReady`; reads cost readiness via step snapshot |
| `SystemAdminPage.jsx` | Reads workspace readiness summary for global AI operations health view |
| `DataSourcesHubPage.jsx` | Owner of `dataSourceReady`; reads data source readiness via step snapshot |

Future consumer implementations must follow the accepted ownership pattern:

```
Owner module → Shared backend contract / API → Consumer module
```

Consumer pages must not read another page's local React state or localStorage as a substitute for the shared backend API.

---

## 12. Explicitly Out of Scope

The following are out of scope for any Slice 3 YAML implementation PR derived from this gate. Any item below requires a separate planning and review cycle before it may be introduced.

| Out-of-scope item | Reason |
|---|---|
| Editing `docs/nashir_v1_openapi.yaml` in this gate | This gate is scope definition only; YAML edits require explicit separate authorization |
| `src/` changes | No UI changes in any Slice 3 gate |
| Backend runtime | All confirmed runtime blockers unresolved |
| Generated clients | Require accepted YAML and separate approval |
| Workflow definition write endpoints | Condition F1 — require Workflow Engine |
| Trigger execution or registration | No trigger execution policy defined |
| Dry-run execution (`POST /dry-run`) | Condition DR1 |
| Provider test-connection (`POST /test-connection`) | Conditions A1, B1 |
| Run artifacts | Condition H1 |
| Run audit endpoints | Condition I1 |
| Product analysis result creation | Condition J1 |
| Standalone cost policy readiness endpoint | Condition R1 |
| Standalone data source readiness endpoint | Condition R1 |
| `ReadinessBlocker` structured schema | Condition R2 — deferred to schema versioning gate |
| `ReadinessUnknownReason` schema | Condition R3 — deferred |
| Billing or subscription | Out of scope all V1 gates |
| AI Gateway Overview | Deferred post-V1 |

---

## 13. Preconditions for Future YAML Implementation PR

A future YAML implementation PR may proceed only after all of the following preconditions are satisfied and explicitly confirmed.

| Precondition | Requirement |
|---|---|
| Separate branch | Future YAML PR must run on its own branch; not in this gate's branch |
| Explicit user authorization | Must receive a separate "go ahead with YAML" instruction; this gate does not constitute that authorization |
| File scope declared | PR description must list `docs/nashir_v1_openapi.yaml` as the only changed file |
| No `src/` changes | Unless separately gated with its own planning and review cycle |
| No generated clients | Unless separately approved after YAML is accepted |
| Validation commands | PR must run lint / validation against the YAML file per any available repository scripts; if no scripts exist, note explicitly that validation was performed manually |
| Secret exclusion grep | PR author must grep for `secretValue`, `apiKey`, `rawKey`, `credential` in the YAML diff before marking the PR ready for review |
| Reviewer checklist | PR must include a checklist for Gemini/CodeRabbit reviewers covering: no execution semantics, no secret values, `unknown` not `ready`, blockers authoritative over score, `workflowVersion` used consistently, `RequestIdHeader` applied as `$ref`, `ErrorModel` used as `$ref`, no new incompatible error shape, existing `Readiness` schema unchanged |
| RBAC precondition acknowledged | PR description must acknowledge that RBAC read roles for readiness snapshot endpoints are a live-backend precondition (Condition R6); their absence must be noted as a known gap for any eventual live backend wiring |

---

## 14. Risk Controls

| Risk | Control |
|---|---|
| **Accidental runtime authorization.** A developer may interpret acceptance of the YAML scope gate as authorization to begin backend implementation. | This gate explicitly prohibits implementation. Section 3 states NO-GO for runtime. Section 12 lists runtime as out of scope. |
| **YAML scope creep.** A YAML PR introduces endpoints or schemas beyond the six accepted paths. | Section 5 defines the exact accepted endpoint inventory. Section 7 defines the exact accepted schema inventory. Any addition requires a new planning and review cycle. |
| **operationId implying execution.** An operationId such as `runWorkflow`, `executeStep`, or `triggerProvider` signals execution semantics. | Section 6 lists all forbidden terms. Future YAML PR reviewer checklist (Section 13) must verify operationIds follow `get` + resource noun pattern only. |
| **Schema leak of secret values.** A `secretValue` or synonymous field is introduced accidentally during YAML authoring. | Condition S3 is unconditional and permanent. Section 13 requires a grep for `secretValue` and synonyms before PR review. |
| **`unknown` treated as `ready`.** A `ReadinessStatus` YAML description omits the `unknown` warning. | Constraint in Section 8. Reviewer checklist in Section 13 must verify the YAML description states `unknown` is not `ready`. |
| **Score treated as execution guarantee.** A `ReadinessSignal.score` description omits the advisory-only constraint. | Constraint in Section 8. Reviewer checklist must verify score description states it must not gate execution. |
| **Blockers ignored in favor of score.** Consumer or schema description implies that a passing score is sufficient for execution. | `WorkflowStepReadiness.overallStatus` and `blockers[]` are the authoritative execution denial signals per Conditions S1 and S5. Schema descriptions must state this. |
| **`workflowStepKey` instability.** A schema description omits the composite key scope rule; consumers store `stepKey` alone. | Constraint in Section 8. YAML description for `WorkflowStepReadiness.stepKey` must state stability is scoped to `(workflowDefinitionId, workflowVersion)` only. |
| **Hidden UI-to-UI coupling.** Backend implementation mirrors React-local state reading between pages. | Section 11 ownership rule is binding. Consumer boundary documentation in Section 11 must be cited in any future consumer implementation gate. |
| **Cost / Data Source scope ambiguity.** A future YAML PR reintroduces the omitted standalone cost or data source endpoints. | Condition R1 is binding. Section 5 explicitly lists both endpoints as omitted. Section 12 lists them as out of scope. A new planning and review cycle is required before they may be added. |
| **Deferred schemas accidentally reintroduced.** `ReadinessBlocker` or `ReadinessUnknownReason` appear in a future YAML PR without re-entering the review cycle. | Conditions R2 and R3 are binding. Section 7 lists both schemas as deferred. Section 12 lists them as out of scope. |

---

## 15. GO / NO-GO

| Subject | Decision |
|---|---|
| YAML implementation scope document | GO — this document is the scope gate output |
| Slice 3 planning, review, and acceptance gates | Accepted / Closed |
| Future separate YAML implementation PR (six GET endpoints + accepted schemas) | GO — allowed only after explicit separate authorization per Section 13 |
| `docs/nashir_v1_openapi.yaml` edits in this gate | NO-GO |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| UI changes (`src/`) | NO-GO |
| Workflow execution | NO-GO |
| Dry-run execution | NO-GO |
| Provider test-connection | NO-GO |
| Run artifacts | NO-GO |
| Run audits | NO-GO |
| Product analysis result creation | NO-GO |
| Billing or subscription | NO-GO |
| AI Gateway Overview | NO-GO |

---

## 16. Next Step

The next step after this gate is **not automatic YAML implementation**.

The next step requires explicit separate authorization for:

**OpenAPI Slice 3 YAML Implementation — Readiness Snapshots Only**

That authorization must:

- Confirm the implementer has read and understood this scope gate document in full.
- Confirm that only `docs/nashir_v1_openapi.yaml` will be modified.
- Confirm that no `src/` files, generated clients, or runtime code will be touched.
- Confirm that the six accepted GET endpoints (Section 5) and accepted schema inventory (Section 7) are the complete input to YAML authoring.
- Confirm that all preconditions in Section 13 are met or will be met before the PR is marked ready for review.
- Confirm that the `RequestIdHeader`, `ErrorModel`, and existing `Readiness` schema conventions are preserved.
- Confirm that the secret exclusion grep will be run before review.

Until that authorization is explicitly granted, `docs/nashir_v1_openapi.yaml` must not be edited.
