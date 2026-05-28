# OpenAPI Slice 3 Acceptance Gate — Readiness Snapshots Only

## 1. Task Classification

| Field | Value |
|---|---|
| Gate type | Documentation-only acceptance gate |
| Repository | nashir-ui-prototype |
| Status | Acceptance only — no runtime, no API, no YAML, no generated-client changes |
| YAML changes | NO-GO in this gate |
| Backend implementation | NO-GO in this gate |
| UI changes | NO-GO in this gate |
| Generated clients | NO-GO in this gate |
| Workflow execution | NO-GO in this gate |
| Dry-run execution | NO-GO in this gate |
| Provider test-connection | NO-GO in this gate |
| Run artifacts | NO-GO in this gate |
| Run audits | NO-GO in this gate |
| Product analysis result creation | NO-GO in this gate |

This gate accepts the planning and review documents produced for OpenAPI Slice 3 — Readiness Snapshots Only. It does not touch `docs/nashir_v1_openapi.yaml`, `src/`, or any generated file. It closes the planning and review gate cycle and authorizes a separately scoped and separately approved YAML implementation PR as the next step.

---

## 2. Inputs Reviewed

### Closed upstream gates

| Gate | Document | Status |
|---|---|---|
| Backend Readiness Planning Gate | `docs/backend_readiness_ai_ops_shared_readiness_model.md` | Closed |
| Backend Readiness Review Gate | `docs/backend_readiness_ai_ops_shared_readiness_model_review.md` | GO with conditions / Closed |
| Backend Readiness Acceptance Gate | `docs/backend_readiness_ai_ops_shared_readiness_model_acceptance.md` | GO with conditions / Closed |
| OpenAPI Shared Readiness Contract Surface Planning Gate | `docs/openapi_shared_readiness_contract_surface_planning.md` | Closed |
| OpenAPI Shared Readiness Contract Surface Review Gate | `docs/openapi_shared_readiness_contract_surface_review.md` | GO with conditions / Closed |
| OpenAPI Shared Readiness Contract Surface Acceptance Gate | `docs/openapi_shared_readiness_contract_surface_acceptance.md` | GO with conditions / Closed |
| OpenAPI Slice 3 Planning Gate — Readiness Snapshots Only | `docs/nashir_openapi_slice_3_readiness_snapshots_planning_gate.md` | Closed (PR #9) |
| OpenAPI Slice 3 Review Gate — Readiness Snapshots Only | `docs/nashir_openapi_slice_3_readiness_snapshots_review_gate.md` | GO with conditions / Closed (PR #10) |

### Current NO-GO constraints carried in

The following prohibitions are inherited from all upstream gates and remain in force through this acceptance gate and beyond.

| Prohibition | Source |
|---|---|
| No `secretValue` in any schema, response, log, or header | Condition S3 |
| No backend runtime implementation | Backend Readiness Acceptance Gate |
| No OpenAPI YAML edits without a separate approved implementation gate | Shared Readiness Acceptance Gate |
| No workflow execution, trigger execution, or dry-run | Conditions F1, DR1 |
| No provider test-connection | Conditions A1, B1 |
| No run artifacts or run audit endpoints | Conditions H1, I1 |
| No product analysis result creation | Condition J1 |
| No generated clients without accepted YAML | Review Gate |
| No page-to-page direct state dependency in backend design | Backend Readiness Acceptance Gate |

### Twenty-one conditions carried in

All fifteen upstream conditions (A1, B1, F1, H1, I1, J1, DR1, S1–S5, ID1–ID2, RequestIdHeader) and all six review gate conditions (R1–R6) are carried into this acceptance gate. They are enumerated across Sections 3, 5, 6, and 9.

---

## 3. Acceptance Decision

| Subject | Decision |
|---|---|
| Planning gate document | Accepted |
| Review gate document | Accepted |
| Slice 3 scope (Readiness Snapshots Only) | Accepted |
| Confirmed endpoint inventory (6 read-only GET endpoints) | Accepted |
| Confirmed schema inventory (8 snapshot schemas + 2 core schemas) | Accepted |
| Cost policy standalone endpoint | Accepted as OMITTED — covered by step readiness rollup (Condition R1) |
| Data source standalone endpoint | Accepted as OMITTED — covered by step readiness rollup (Condition R1) |
| `ReadinessBlocker` schema | Accepted as DEFERRED — `blockers[]` remains `string[]` in Slice 3 (Condition R2) |
| `ReadinessUnknownReason` schema | Accepted as DEFERRED (Condition R3) |
| `RouteReadinessSnapshot.providerReady` as `ReadinessStatus` | Accepted as intentional (Condition R4) |
| `PaginationMeta` not required | Accepted — no paginated list endpoints (Condition R5) |
| RBAC read roles as implementation precondition | Accepted — must be defined before any live backend gate (Condition R6) |
| OpenAPI YAML implementation | NO-GO in this gate — requires a separately approved implementation PR |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| UI changes | NO-GO |

### Acceptance conditions

The following conditions govern all work that follows from this acceptance gate.

1. **OpenAPI YAML implementation requires a separate implementation PR.** This acceptance gate closes the planning and review cycle. No YAML is written under this gate. A future YAML implementation PR must be separately scoped, separately reviewed, and explicitly approved before any edits to `docs/nashir_v1_openapi.yaml` are permitted.

2. **That implementation PR must be limited to the accepted readiness snapshots surface.** Only the six confirmed read-only GET endpoints and the accepted schema inventory (Section 7) may enter the YAML implementation PR. No additional endpoints, write operations, or out-of-scope schemas may be introduced without a new planning and review cycle.

3. **No generated clients unless separately approved.** Generated client code requires its own review and approval after YAML is accepted. Generating clients from unreviewed YAML is not permitted.

4. **No backend runtime under Slice 3 acceptance.** This acceptance gate governs API surface planning and documentation only. No execution logic, middleware, database schema, or runtime code is approved by this gate.

5. **No UI changes under Slice 3 acceptance.** No `src/` file may be changed. Consumer page wiring to the Slice 3 API is a future task scoped to its own implementation and review cycle.

6. **No workflow execution, dry-run, provider test-connection, artifact, or audit semantics.** These remain deferred per Conditions F1, DR1, A1, B1, H1, and I1. They must not be introduced into YAML or runtime under any version of Slice 3.

7. **No `secretValue` in any schema.** This prohibition is unconditional and permanent for all Slice 3 artifacts. Any YAML reviewer must grep for `secretValue`, `apiKey`, `rawKey`, and synonymous terms before accepting any schema addition.

8. **`unknown` must not be treated as `ready`.** Any evaluation chain that cannot resolve a readiness dimension must surface `unknown` and block accordingly. This must be stated in schema descriptions in the YAML implementation.

9. **Blockers must remain operationally decisive over readiness score.** The presence of non-empty `blockers[]` and `overallStatus: blocked` are the authoritative execution denial signals. A readiness score below any threshold is not an authoritative denial signal and must not be used as one.

---

## 4. Accepted Slice 3 Scope

The following resources are accepted at planning level for Slice 3 — Readiness Snapshots Only. Acceptance at this gate is planning-level acceptance only. YAML implementation is not approved here.

### Accepted read-only endpoints (6 confirmed)

| Path | Method | Response schema |
|---|---|---|
| `/workspaces/{workspaceId}/readiness` | GET | `WorkspaceReadinessSummary` |
| `/workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness` | GET | `WorkflowReadinessSnapshot` |
| `/workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness` | GET | `WorkflowStepReadiness` |
| `/workspaces/{workspaceId}/ai-providers/{providerId}/readiness` | GET | `ProviderReadinessSnapshot` |
| `/workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness` | GET | `RouteReadinessSnapshot` |
| `/workspaces/{workspaceId}/prompts/{promptId}/readiness` | GET | `PromptReadinessSnapshot` |

### Accepted schema inventory

- `ReadinessStatus` — five-value enum (`ready`, `warning`, `blocked`, `unknown`, `not_applicable`)
- `ReadinessSignal` — normalized per-dimension readiness signal with `dimension` discriminator
- `WorkflowStepReadiness` — aggregate of all ten dimension signals for a single step
- `WorkspaceReadinessSummary` — advisory workspace-level rollup
- `WorkflowReadinessSnapshot` — per-workflow collection of step readiness signals
- `ProviderReadinessSnapshot` — read-only provider health snapshot; no secret values
- `RouteReadinessSnapshot` — read-only route health snapshot; `providerReady` typed as `ReadinessStatus`
- `PromptReadinessSnapshot` — read-only prompt version readiness snapshot
- `CostReadinessSnapshot` — schema accepted; standalone endpoint OMITTED (Condition R1)
- `DataSourceReadinessSnapshot` — schema accepted; standalone endpoint OMITTED (Condition R1)
- `ReadinessBlocker` — schema DEFERRED; `blockers[]` remains `string[]` in Slice 3 (Condition R2)

### Shared parameter requirements (all confirmed endpoints)

- `$ref: "#/components/parameters/WorkspaceIdPath"` — workspace scoping on all paths
- `$ref: "#/components/parameters/RequestIdHeader"` — request correlation on all endpoints
- Standard error responses: `401`, `403`, `404`, `429`, `500` via existing `ErrorModel` `$ref`
- No request body on any read-only snapshot endpoint
- No `Idempotency-Key` or `If-Match` headers required

---

## 5. Explicitly Rejected Scope

The following are rejected from Slice 3 and must not be introduced in any YAML implementation PR, runtime implementation, or generated client derived from Slice 3 acceptance.

| Rejected item | Condition |
|---|---|
| Workflow definition write endpoints (`POST`, `PUT`) | F1 — require Workflow Engine |
| Trigger execution or registration | No trigger execution policy |
| Dry-run execution endpoint (`POST /dry-run`) | DR1 — requires `DryRunResult` schema and no-execution guarantee |
| Provider test-connection (`POST /test-connection`) | A1, B1 — require Secret Vault |
| Run artifacts | H1 — require `workflowRunId`, artifact persistence, lifecycle model |
| Run audit endpoints | I1 — require immutable append-only audit backend |
| Product analysis result creation | J1 — require AI execution, snapshots, artifact model |
| Input / output schema contracts | Deferred to schema versioning gate |
| Cost policy standalone readiness endpoint | R1 — covered by step readiness rollup |
| Data source standalone readiness endpoint | R1 — covered by step readiness rollup |
| `ReadinessBlocker` structured schema in Slice 3 | R2 — deferred to schema versioning gate |
| `ReadinessUnknownReason` schema | R3 — deferred |
| Generated clients | Require accepted YAML and separate approval |
| Backend runtime | All confirmed runtime blockers unresolved |
| Billing or subscription | Out of scope all V1 gates |
| AI Gateway Overview | Deferred post-V1 |

---

## 6. Accepted Contract Rules

The following rules are accepted as binding for all Slice 3 work — planning, YAML implementation, consumer integration, and runtime.

### Readiness score is advisory only

`ReadinessSignal.score` (0–100) reflects the proportion of satisfied checks. It is a display and triage aid. It must not gate execution. YAML schema descriptions must state this explicitly. Any system that denies execution based solely on a score threshold violates this contract (Condition S1, S5).

### `unknown` is never ready

A dimension with status `unknown` must not be treated as `ready` by any consumer, schema validator, or execution engine. When a dimension state cannot be resolved, it surfaces as `unknown`. This must be stated in schema descriptions for `ReadinessStatus` and `ReadinessSignal` (Condition S4).

### Blockers prevent operation; score does not

A workflow step with `overallStatus: blocked` must not be executed regardless of its readiness score. The presence of non-empty `blockers[]` is the authoritative execution denial signal. `overallStatus` is derived from the union of all dimension blockers (Condition S5).

### `ReadinessSignal` requires a `dimension` discriminator

When `ReadinessSignal` is returned as a standalone response — outside the embedded context of `WorkflowStepReadiness` — it must include a `dimension` field identifying which of the ten readiness dimensions it represents:

`providerReady | routeReady | promptReady | costReady | reviewReady | destinationReady | inputReady | outputReady | triggerReady | dataSourceReady`

When `ReadinessSignal` is embedded as a named field inside `WorkflowStepReadiness`, the field name itself acts as discriminator and the `dimension` field may be omitted (Condition S2).

### `secretValue` is formally forbidden

No schema, request body, response body, error payload, log entry, or header may contain a raw secret value, raw API key, or raw credential string. `ProviderReadinessSnapshot` exposes only `secretReferenceName`. Any schema containing a `secretValue`, `apiKey`, `rawKey`, or synonymous field is invalid and must be rejected at review time (Condition S3).

### `workflowStepKey` / `stepKey` stability

`stepKey` is stable within the composite scope `(workflowDefinitionId, workflowVersion)`. It is not a user-facing display label. Consumers must not use `stepKey` alone as a durable cross-version reference. The durable reference is the tuple `(workflowDefinitionId, workflowVersion, stepKey)`. This rule must appear in the YAML schema description for `WorkflowStepReadiness` (Conditions ID1, ID2).

### Run artifacts and audits are deferred

`artifactId` and `auditEventId` are forward-looking identifiers only. No path segment relying on `workflowRunId`, `artifactId`, or `auditEventId` may appear in Slice 3 (Conditions H1, I1).

### `RequestIdHeader` must remain consistent with Slice 1/2

The `RequestIdHeader` component (`X-Request-Id`, optional) is established in Slice 1/2. Every Slice 3 endpoint must apply it as a reused `$ref` to `#/components/parameters/RequestIdHeader`. It must not be redefined, renamed, or introduced as required (RequestIdHeader condition).

### No page-to-page direct state dependency

The correct ownership pattern in backend implementation is:

```
Owner module → Shared backend contract / API → Consumer module
```

Consumer pages must read shared backend readiness contracts; they must not read another page's local React state or localStorage. This rule applies at the backend layer and must be respected by any future wiring of consumer pages to the Slice 3 API.

---

## 7. Accepted Schema Direction

The following schema definitions are accepted at planning level. Field names, types, and constraints listed here are the accepted starting point for a future YAML implementation PR. Any deviation from these definitions requires a new review cycle before YAML authoring proceeds.

### `ReadinessStatus`

Enum. Five accepted values: `ready`, `warning`, `blocked`, `unknown`, `not_applicable`. YAML description must state that `unknown` is not equivalent to `ready`.

### `ReadinessSignal`

Ten accepted fields: `dimension` (string enum, required on standalone responses), `status` (`ReadinessStatus`, required), `score` (integer 0–100, advisory only), `blockers` (string[]), `warnings` (string[]), `checks` (string[]), `owner` (string, domain module name), `evidenceSummary` (string, no secrets), `nextAction` (string or null), `updatedAt` (ISO8601). `secretValue` must not appear.

### `WorkflowStepReadiness`

Accepted fields: `workflowDefinitionId`, `workflowVersion`, `stepKey` (stable within composite scope), ten embedded `ReadinessSignal` fields (one per dimension, `dimension` field omitted on embedded form), `overallStatus` (`ReadinessStatus`), `blockers` (string[]), `warnings` (string[]), `checks` (string[]), `nextActions` (string[]), `evidenceSummary` (string), `updatedAt` (ISO8601).

### `WorkspaceReadinessSummary`

Accepted fields: `workspaceId`, `overallStatus`, `totalActiveWorkflows`, `blockedWorkflows`, `warningWorkflows`, `readyWorkflows`, `unknownWorkflows`, `updatedAt`. Advisory rollup only; must not gate execution.

### `WorkflowReadinessSnapshot`

Accepted fields: `workflowDefinitionId`, `workflowVersion`, `overallStatus`, `stepReadiness` (`WorkflowStepReadiness[]`), `blockers` (string[]), `warnings` (string[]), `updatedAt`. Seven fields total.

### `ProviderReadinessSnapshot`

Accepted fields: `providerId`, `dimension` (`providerReady`), `status`, `healthStatus` (enum: `healthy | degraded | unavailable | unknown`), `lastTestedAt` (ISO8601 or null), `supportedCapabilities` (string[]), `supportedModels` (string[]), `secretReferenceName` (vault reference only), `score`, `blockers`, `warnings`, `updatedAt`. YAML description must explicitly state that secret values are never returned.

### `RouteReadinessSnapshot`

Accepted fields: `modelRouteId`, `dimension` (`routeReady`), `status`, `primaryModelId`, `fallbackModelIds` (string[], ordered), `providerReady` (`ReadinessStatus` — scalar derived status, not embedded `ReadinessSignal`), `routeHealth` (enum: `healthy | degraded | unavailable | unknown`), `score`, `blockers`, `warnings`, `updatedAt`.

### `PromptReadinessSnapshot`

Accepted fields: `promptId`, `promptVersionId`, `dimension` (`promptReady`), `status`, `approvalStatus` (enum: `active | testing | draft | blocked`), `requiredChecks` (string[]), `allowedOutputs` (string[]), `blockedPatterns` (string[]), `score`, `blockers`, `warnings`, `updatedAt`.

### `CostReadinessSnapshot`

Schema accepted. Standalone endpoint OMITTED (Condition R1). Accepted fields: `costPolicyId`, `dimension` (`costReady`), `status`, `budgetCap` (number), `approvalThreshold` (number), `forecastRisk` (enum: `ok | watch | risk | blocked`), `throttlingActive` (boolean), `score`, `blockers`, `warnings`, `updatedAt`.

### `DataSourceReadinessSnapshot`

Schema accepted. Standalone endpoint OMITTED (Condition R1). Accepted fields: `dataSourceId`, `dimension` (`dataSourceReady`), `status`, `connectorStatus` (enum: `available | unavailable | degraded | unknown`), `governed` (boolean), `redactionActive` (boolean), `score`, `blockers`, `warnings`, `updatedAt`.

### `ReadinessBlocker`

DEFERRED (Condition R2). `blockers[]` remains `string[]` in Slice 3. `ReadinessBlocker` as a structured schema is deferred to a future schema versioning gate.

### `ReadinessUnknownReason`

DEFERRED (Condition R3). Not introduced in Slice 3. A future gate may introduce a structured unknown reason if consumer disambiguation requires it.

---

## 8. Conditions for Any Future OpenAPI YAML Implementation PR

A future YAML implementation PR may proceed only after explicit authorization by a separate scope approval. The following conditions are binding on that PR.

| Condition | Requirement |
|---|---|
| Separate from this gate | No YAML is written under this acceptance gate |
| Scope limited to accepted surface | Only the six confirmed GET endpoints and accepted schema inventory (Section 7) |
| `docs/nashir_v1_openapi.yaml` only | No `src/`, no generated clients, no runtime code |
| No additional endpoints | Any endpoint not in Section 4 requires a new planning and review cycle |
| No write operations | Only read-only GET endpoints are accepted in Slice 3 |
| No execution semantics | Route names, operationIds, request bodies, and schema names must not imply model calls, connector calls, prompt execution, trigger firing, or any side effect |
| `RequestIdHeader` via `$ref` | `#/components/parameters/RequestIdHeader` on every Slice 3 endpoint |
| `ErrorModel` via `$ref` | All error responses must use existing `ErrorModel` component |
| `PaginationMeta` not introduced | No paginated list responses in Slice 3 (Condition R5) |
| No `secretValue` | Grep for `secretValue`, `apiKey`, `rawKey`, `credential` before accepting any schema |
| Existing `Readiness` schema preserved | `ReadinessSignal` is a new distinct schema; the Slice 1/2 `Readiness` schema must not be replaced or renamed |
| RBAC precondition acknowledged | YAML PR description must acknowledge that RBAC read roles are a live-backend precondition (Condition R6) |
| `unknown` never ready | Schema description for `ReadinessStatus` must state `unknown` is not `ready` |
| `score` advisory only | Schema description for `ReadinessSignal.score` must state it must not gate execution |
| `stepKey` stability stated | Schema description for `WorkflowStepReadiness.stepKey` must state stability is scoped to `(workflowDefinitionId, workflowVersion)` |

---

## 9. Risk Closure

The following risks were identified during the planning and review gates. This acceptance gate closes each risk with a stated control.

| Risk | Control |
|---|---|
| **False confidence from readiness scores.** A consumer may use `score >= N` as an execution approval signal. | Score descriptions in YAML must explicitly state score is advisory and must not gate execution. Acceptance condition 9 in Section 3 is binding. |
| **`unknown`-state misinterpretation.** A consumer that defaults `unknown` to `ready` would allow unresolvable states to pass execution gates. | `ReadinessStatus` and `ReadinessSignal` YAML descriptions must state `unknown` is not `ready`. Acceptance condition 8 in Section 3 is binding. |
| **Blocker vs score semantics confusion.** Consumers may derive blocked state from a low score rather than from `blockers[]`. | `WorkflowStepReadiness.overallStatus` and `blockers[]` are the authoritative signals. Schema descriptions must state this. Acceptance condition 9 in Section 3 is binding. |
| **Readiness dimension ownership ambiguity.** If more than one module writes to the same dimension's record, the contract loses consistency. | Ownership model accepted: each dimension has exactly one owner module. Section 6 ownership rule is binding. YAML write-path authorization must enforce single-owner writes when runtime is eventually implemented. |
| **Secret leakage risk.** A `secretValue` field added accidentally during YAML authoring would violate the security model. | `secretValue` prohibition is stated in five places in the planning and review gates. All future YAML PRs must grep for `secretValue` and synonyms before acceptance. Acceptance condition 7 in Section 3 is unconditional and permanent. |
| **`workflowStepKey` instability.** Consumers storing `stepKey` alone without the composite key may resolve the wrong step after a definition version change. | Stability rule accepted: `stepKey` is stable within `(workflowDefinitionId, workflowVersion)` only. YAML description for `WorkflowStepReadiness.stepKey` must state this. |
| **UI-to-UI coupling.** Backend implementation mirrors the current React-local pattern of one page reading another page's state. | Owner module → Shared backend contract/API → Consumer module pattern is accepted as binding. Section 6 ownership rule is non-negotiable. |
| **Premature runtime / YAML implementation.** A developer interprets planning acceptance as authorization to implement. | This gate explicitly prohibits YAML edits. Section 8 lists the conditions for any future YAML PR. The next step (Section 12) requires a separate implementation scope authorization before any YAML is written. |

---

## 10. Outputs

| Output | Path | Status |
|---|---|---|
| Acceptance gate document | `docs/nashir_openapi_slice_3_readiness_snapshots_acceptance_gate.md` | Created — this document |
| `docs/nashir_v1_openapi.yaml` | — | Not modified |
| `src/` | — | Not modified |
| Generated clients | — | Not created |
| `docs/03_decision_log.md` | — | Does not exist; not created |
| `docs/17_change_log.md` | — | Does not exist; not created |

---

## 11. GO / NO-GO

| Subject | Decision |
|---|---|
| Acceptance gate document | GO — this document is the acceptance gate output |
| Slice 3 planning document | Accepted / Closed |
| Slice 3 review document | Accepted / Closed |
| Slice 3 planning-level scope (6 GET endpoints + schema inventory) | Accepted |
| Future separate OpenAPI YAML implementation PR | GO — allowed only after explicit separate scope authorization |
| `docs/nashir_v1_openapi.yaml` implementation in this gate | NO-GO |
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

## 12. Next Step

The next step after this acceptance gate is **not automatic implementation**.

The next step is a separately authorized and separately reviewed:

**OpenAPI Slice 3 YAML Implementation Scope — Readiness Snapshots Only**

That scope authorization must:

- Define which of the six accepted GET endpoints enter the YAML PR and in what order.
- Confirm that the accepted schema inventory in Section 7 is the complete input to YAML authoring.
- Confirm that no out-of-scope endpoints, write operations, or execution semantics are introduced.
- Confirm that all conditions in Section 8 are understood and accepted by the implementer.
- Confirm that RBAC read roles (Condition R6) have been reviewed and their absence is acceptable at the time of the YAML PR (or that a stub permission scheme is in place).
- Confirm that the existing `Readiness` schema in Slice 1/2 will not be disturbed.

Only after that scope authorization is granted may `docs/nashir_v1_openapi.yaml` be edited.
