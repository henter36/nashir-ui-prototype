# OpenAPI Slice 3 Planning Gate — Readiness Snapshots Only

## 1. Task Classification

| Field | Value |
|---|---|
| Gate type | Documentation-only planning gate |
| Repository | nashir-ui-prototype |
| Status | Planning only — no runtime, no API, no YAML, no generated-client changes |
| YAML changes | NO-GO in this gate |
| Backend implementation | NO-GO in this gate |
| UI changes | NO-GO in this gate |
| Generated clients | NO-GO in this gate |

This gate produces one planning document. It does not touch `docs/nashir_v1_openapi.yaml`, `src/`, or any generated file. The document narrows the candidate surface defined by prior gates to the smallest safe read-only slice: readiness snapshots only.

---

## 2. Inputs

### Closed upstream gates

| Gate | Status |
|---|---|
| Backend Readiness Planning Gate | Closed |
| Backend Readiness Review Gate | GO with conditions / Closed |
| Backend Readiness Acceptance Gate | GO with conditions / Closed |
| OpenAPI Shared Readiness Contract Surface Planning Gate | Closed |
| OpenAPI Shared Readiness Contract Surface Review Gate | GO with conditions / Closed |
| OpenAPI Shared Readiness Contract Surface Acceptance Gate | GO with conditions / Closed |

### Accepted constraints carried into this gate

From the Shared Readiness Contract Surface Acceptance Gate:

- Slice 3 candidate surface = Readiness Snapshots Only.
- All endpoints are read-only in this slice.
- `POST /test-connection` is deferred (requires Secret Vault).
- `POST /workflow-definitions` and `PUT /workflow-definitions/{workflowDefinitionId}` are deferred (require Workflow Engine).
- `POST /dry-run` is deferred (requires `DryRunResult` schema and no-execution guarantee).
- Run artifacts, run audits, and product analysis result creation are deferred.
- Thirteen review conditions (A1, B1, F1, H1, I1, J1, DR1, S1–S5, ID1–ID2, RequestIdHeader) must be respected.
- `RequestIdHeader` (`X-Request-Id`) is an established Slice 1/2 component; every Slice 3 endpoint must carry it.
- `ReadinessSignal` must carry a `dimension` discriminator field.
- `workflowStepKey` is stable within `(workflowDefinitionId, version)` composite scope only.
- Secret values are formally forbidden from any schema field.
- Readiness score is advisory only; blockers, not score, determine execution denial.
- `unknown` is not `ready`.

### Relevant Slice 1/2 conventions in use

From `docs/nashir_v1_openapi.yaml`:

- `workspaceId` path scoping on all workspace-scoped resources.
- `ErrorModel` component used for all error responses.
- `PaginationMeta` component used for list responses.
- `RequestIdHeader` (`X-Request-Id`, optional) applied to every endpoint.
- `Idempotency-Key` header used for mutating transitions; not applicable to Slice 3 read-only surface.
- `If-Match` / `X-Resource-Version` used for optimistic concurrency on mutable PUT endpoints; not applicable to Slice 3 read-only surface.
- Standard error responses: `400`, `401`, `403`, `404`, `429`, `500`.
- No name-based identity; all resources use stable opaque ID fields.
- An existing simplified `Readiness` schema (score / label / issues) is present in Slice 1/2. `ReadinessSignal` is the expanded normalized form for AI Operations contracts; it does not replace the Slice 1/2 `Readiness` schema until a future reconciliation gate.

---

## 3. Decision Summary

| Subject | Decision |
|---|---|
| Slice 3 scope | GO — plan as Readiness Snapshots Only |
| OpenAPI YAML implementation | NO-GO — requires separate review and acceptance gates |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| UI changes | NO-GO |
| Next required gate | OpenAPI Slice 3 Review Gate — Readiness Snapshots Only |

The Slice 3 candidate surface is narrowed to read-only readiness snapshot endpoints. This is the minimum viable contract that allows consumer modules to read domain readiness from owner modules without touching execution paths, artifact storage, audit infrastructure, write operations, or any confirmed runtime blocker.

---

## 4. Scope — Included in Slice 3 Planning

All items below are planning-level only. None are implemented or approved for YAML in this gate.

### Readiness snapshot resources

| Resource | Description |
|---|---|
| Workspace readiness summary | Aggregate readiness status across all active workflow definitions in a workspace; advisory rollup only |
| Workflow readiness snapshot | Per-workflow readiness covering all ten dimensions across all steps |
| Workflow step readiness snapshot | Per-step readiness with per-dimension status, blockers, warnings, checks, next actions, evidence summary, and timestamp |
| Provider readiness snapshot | Read-only snapshot of provider status, health, capabilities, and secret reference as evaluated at a point in time |
| Route readiness snapshot | Read-only snapshot of model route health, provider binding, and policy as evaluated for a step |
| Prompt readiness snapshot | Read-only snapshot of prompt version, approval status, output contract, and checks as evaluated |
| Cost readiness snapshot | Read-only snapshot of budget cap, approval threshold, and forecast risk as evaluated |
| Data source readiness snapshot | Read-only snapshot of connector availability and governance state as evaluated |

### Core schemas (planning only)

- `ReadinessStatus` enum: `ready`, `warning`, `blocked`, `unknown`, `not_applicable`
- `ReadinessSignal`: normalized per-dimension signal carrying status, score, blockers, warnings, checks, owner, evidenceSummary, nextAction, updatedAt, and `dimension` discriminator
- `WorkflowStepReadiness`: aggregate of all ten `ReadinessSignal` instances plus overallStatus, blockers, warnings, checks, nextActions, evidenceSummary, and updatedAt
- `WorkspaceReadinessSummary`: workspace-level rollup of workflow readiness statuses
- `WorkflowReadinessSnapshot`: per-workflow collection of step readiness signals

---

## 5. Scope — Explicitly Excluded

The following are out of scope for Slice 3 planning and must not be introduced.

| Excluded item | Reason |
|---|---|
| Workflow definition write endpoints (`POST`, `PUT`) | Require Workflow Engine and definition governance (Condition F1) |
| Trigger execution or registration | Require idempotency, event ingestion, audit, and failure policy |
| Dry-run execution endpoint | Requires `DryRunResult` schema, no-execution guarantee, and idempotency (Condition DR1) |
| Provider test-connection | Requires Secret Vault and credential access (Condition B1) |
| Run artifacts | Require `workflowRunId`, artifact persistence, and lifecycle model (Condition H1) |
| Run audit endpoints | Require immutable append-only audit backend (Condition I1) |
| Product analysis result creation | Requires AI execution, product/prompt/route/cost snapshots, and artifact persistence (Condition J1) |
| Input / output schema contracts | Deferred to schema versioning gate |
| Generated clients | Require reviewed and accepted YAML first |
| Backend runtime | All confirmed runtime blockers remain unresolved |
| Billing or subscription | Out of scope for all V1 gates |
| AI Gateway Overview | Deferred post-V1 |

---

## 6. Contract Principles

The following principles are non-negotiable. They must be applied at every level: planning, schema definition, YAML implementation, and consumer integration.

**Readiness score is advisory only.**
`ReadinessSignal.score` (0–100) reflects the proportion of satisfied checks. It is not an operational guarantee. It must not gate execution. Execution denial is determined by the presence of items in `blockers[]`, not by score threshold.

**`unknown` is never ready.**
A dimension with status `unknown` must not be treated as `ready` by any consumer. When a dimension state cannot be resolved, it is `unknown`. Any consumer that defaults `unknown` to passing violates the readiness contract.

**Blockers prevent operation; score does not.**
A step with `overallStatus: blocked` must not be executed regardless of its readiness score. Score is a display and triage aid. Blockers are the enforcement signal.

**`ReadinessSignal` must carry a `dimension` discriminator.**
When a `ReadinessSignal` is returned as a standalone response — outside the embedded context of `WorkflowStepReadiness` — it must include a `dimension` field identifying which of the ten readiness dimensions it represents:
`providerReady | routeReady | promptReady | costReady | reviewReady | destinationReady | inputReady | outputReady | triggerReady | dataSourceReady`

**`secretValue` is formally forbidden in any schema.**
No schema, request body, response body, error, log, or header may contain a raw secret value, raw API key, or raw credential string. `ProviderReadinessSnapshot` exposes only `secretReferenceName`. Any schema that includes a `secretValue` field is invalid and must be rejected.

**`workflowStepKey` must be stable within a workflow definition version.**
`workflowStepKey` is stable within the composite scope `(workflowDefinitionId, version)`. It is not a user-facing display label. Consumers must not use `workflowStepKey` alone as a durable cross-version reference. The durable reference is the tuple `(workflowDefinitionId, version, stepKey)`.

**Run artifacts and run audits are deferred.**
`artifactId` and `auditEventId` are forward-looking identifiers only. No path segment relying on `workflowRunId`, `artifactId`, or `auditEventId` may appear in Slice 3.

**`RequestIdHeader` (`X-Request-Id`) must be carried on every Slice 3 endpoint.**
The `RequestIdHeader` component is established in Slice 1/2 and is applied to every existing endpoint. Slice 3 endpoints must apply it as a reused `$ref` to `#/components/parameters/RequestIdHeader`.

**No page may depend directly on another page's local state.**
The correct ownership pattern in backend implementation is:

```
Owner module → Shared backend contract / API → Consumer module
```

The incorrect pattern — where a consumer reads another page's local React state or localStorage directly — must not be reproduced in backend design. This planning document addresses backend API shape only; no UI files are changed.

---

## 7. Candidate Read-Only Surface

All paths below are **proposed** at planning level only. Path names, operationIds, and parameter names require the next Review Gate before any YAML edits. All are read-only GET endpoints.

### Workspace readiness

```
GET /workspaces/{workspaceId}/readiness
```

Returns `WorkspaceReadinessSummary`. Aggregates readiness across all active workflow definitions. Advisory only.

### Workflow readiness

```
GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness
```

Returns `WorkflowReadinessSnapshot`. Per-workflow rollup covering all steps and all dimensions.

### Workflow step readiness

```
GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness
```

Returns `WorkflowStepReadiness`. Per-step detail with all ten dimension signals.

### Provider readiness

```
GET /workspaces/{workspaceId}/ai-providers/{providerId}/readiness
```

Returns `ProviderReadinessSnapshot`. Read-only; no credential value exposed. `dimension: providerReady`.

### Model route readiness

```
GET /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness
```

Returns `RouteReadinessSnapshot`. `dimension: routeReady`.

### Prompt readiness

```
GET /workspaces/{workspaceId}/prompts/{promptId}/readiness
```

Returns `PromptReadinessSnapshot`. `dimension: promptReady`.

### Cost policy readiness (candidate — may be covered by workflow step snapshot)

```
GET /workspaces/{workspaceId}/cost-policies/{costPolicyId}/readiness
```

Returns `CostReadinessSnapshot`. `dimension: costReady`. To be confirmed by Review Gate: this endpoint may be redundant if cost readiness is fully surfaced through the step readiness snapshot. Review Gate must decide whether to include or omit.

### Data source readiness (candidate — may be covered by workflow step snapshot)

```
GET /workspaces/{workspaceId}/data-sources/{dataSourceId}/readiness
```

Returns `DataSourceReadinessSnapshot`. `dimension: dataSourceReady`. Subject to same Review Gate confirmation as cost policy readiness.

---

All proposed endpoints share the following parameter requirements (to be confirmed by Review Gate at YAML time):

- `$ref: "#/components/parameters/WorkspaceIdPath"` — workspace scoping
- `$ref: "#/components/parameters/RequestIdHeader"` — request correlation
- Standard error responses: `401`, `403`, `404`, `429`, `500` using existing `ErrorModel` `$ref` components

No request body is required for any read-only snapshot endpoint. No `Idempotency-Key` header is required for read-only endpoints.

---

## 8. Candidate Schema Planning

All schemas below are planning-level only. Fields and names require Review Gate confirmation before YAML definition.

---

### `ReadinessStatus`

Enum. Five states:

| Value | Meaning |
|---|---|
| `ready` | Dimension fully satisfied |
| `warning` | Dimension partially satisfied; issue exists but does not block |
| `blocked` | Hard requirement unmet; execution must be denied |
| `unknown` | Dimension state cannot be resolved; must not be treated as ready |
| `not_applicable` | Dimension does not apply to this step type |

---

### `ReadinessSignal`

Normalized per-dimension readiness signal. Used both as an embedded field in aggregate schemas and as the standalone response type for domain-specific readiness endpoints.

| Field | Type | Constraint |
|---|---|---|
| `dimension` | string enum | Required when returned standalone; discriminator identifying which of the ten readiness dimensions this signal represents |
| `status` | `ReadinessStatus` | Required |
| `score` | integer 0–100 | Advisory only; must not gate execution; must carry description stating this in YAML |
| `blockers` | string[] | Non-empty array means dimension is blocked; drives execution denial |
| `warnings` | string[] | Surfaced to user; do not block dry-run display |
| `checks` | string[] | Explanatory passing checks; not execution conditions |
| `owner` | string | Domain name of the owning module; not a UI page reference |
| `evidenceSummary` | string | Human-readable summary; must not contain raw secrets, keys, or credentials |
| `nextAction` | string or null | User-facing remediation guidance |
| `updatedAt` | ISO8601 | Timestamp of evaluation |

`secretValue` must not appear in this schema under any circumstances.

---

### `WorkflowStepReadiness`

Aggregate readiness for a single workflow step across all ten dimensions.

| Field | Type | Notes |
|---|---|---|
| `workflowKey` | string | Workflow definition reference |
| `stepKey` | string | Stable within `(workflowDefinitionId, version)` only |
| `triggerReady` | `ReadinessSignal` | `dimension` field omitted when embedded (field name is discriminator) |
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
| `updatedAt` | ISO8601 | |

---

### `WorkspaceReadinessSummary`

Rollup of all active workflow definition readiness states within a workspace.

| Field | Type | Notes |
|---|---|---|
| `workspaceId` | string | |
| `overallStatus` | `ReadinessStatus` | Advisory; worst status across active workflows |
| `totalActiveWorkflows` | integer | |
| `blockedWorkflows` | integer | Workflows with at least one blocked step |
| `warningWorkflows` | integer | Workflows with at least one warning and no blocked steps |
| `readyWorkflows` | integer | Workflows with all steps ready |
| `unknownWorkflows` | integer | Workflows with at least one unknown dimension |
| `updatedAt` | ISO8601 | |

---

### `WorkflowReadinessSnapshot`

Per-workflow readiness covering all steps.

| Field | Type | Notes |
|---|---|---|
| `workflowDefinitionId` | string | |
| `workflowVersion` | string | Version string of the definition; aligned with existing Slice 1/2 version convention |
| `overallStatus` | `ReadinessStatus` | Worst status across all steps |
| `stepReadiness` | `WorkflowStepReadiness[]` | One entry per step |
| `blockers` | string[] | Aggregate |
| `warnings` | string[] | Aggregate |
| `updatedAt` | ISO8601 | |

---

### `ProviderReadinessSnapshot`

Read-only provider health and readiness signal. No secret values.

| Field | Type | Notes |
|---|---|---|
| `providerId` | string | Stable canonical identifier |
| `dimension` | string | `providerReady` |
| `status` | `ReadinessStatus` | |
| `healthStatus` | string | `healthy \| degraded \| unavailable \| unknown` |
| `lastTestedAt` | ISO8601 or null | Null if never tested |
| `supportedCapabilities` | string[] | Declared capabilities |
| `supportedModels` | string[] | Declared model identifiers |
| `secretReferenceName` | string | Vault reference name only |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 | |

`secretValue` must not appear in this schema. The YAML description must state this explicitly.

---

### `RouteReadinessSnapshot`

Read-only model route health and readiness signal.

| Field | Type | Notes |
|---|---|---|
| `modelRouteId` | string | |
| `dimension` | string | `routeReady` |
| `status` | `ReadinessStatus` | |
| `primaryModelId` | string | Stable identifier |
| `fallbackModelIds` | string[] | Ordered list |
| `providerReady` | `ReadinessStatus` | Derived from referenced provider; route is not ready if provider is not ready |
| `routeHealth` | string | `healthy \| degraded \| unavailable \| unknown` |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 | |

---

### `PromptReadinessSnapshot`

Read-only prompt version readiness signal.

| Field | Type | Notes |
|---|---|---|
| `promptId` | string | |
| `promptVersionId` | string | Stable versioned identifier |
| `dimension` | string | `promptReady` |
| `status` | `ReadinessStatus` | |
| `approvalStatus` | string | `active \| testing \| draft \| blocked` |
| `requiredChecks` | string[] | Checks that must pass before use |
| `allowedOutputs` | string[] | Permitted output types |
| `blockedPatterns` | string[] | Patterns that must not appear in outputs |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 | |

---

### `CostReadinessSnapshot`

Read-only cost policy readiness signal.

| Field | Type | Notes |
|---|---|---|
| `costPolicyId` | string | |
| `dimension` | string | `costReady` |
| `status` | `ReadinessStatus` | |
| `budgetCap` | number | Monthly or per-period budget ceiling |
| `approvalThreshold` | number | Cost above which human approval is required |
| `forecastRisk` | string | `ok \| watch \| risk \| blocked` |
| `throttlingActive` | boolean | Whether throttling policy is currently active |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 | |

---

### `DataSourceReadinessSnapshot`

Read-only data source / connector readiness signal.

| Field | Type | Notes |
|---|---|---|
| `dataSourceId` | string | |
| `dimension` | string | `dataSourceReady` |
| `status` | `ReadinessStatus` | |
| `connectorStatus` | string | `available \| unavailable \| degraded \| unknown` |
| `governed` | boolean | Whether data source governance rules are applied |
| `redactionActive` | boolean | Whether redaction rules are in effect |
| `score` | integer 0–100 | Advisory only |
| `blockers` | string[] | |
| `warnings` | string[] | |
| `updatedAt` | ISO8601 | |

---

### `ReadinessBlocker`

Structured blocker representation. Proposed as a candidate for a future schema versioning pass; may remain as `string` in Slice 3 for simplicity.

| Field | Type | Notes |
|---|---|---|
| `code` | string | Machine-readable blocker code |
| `message` | string | Human-readable description |
| `dimension` | string | Which readiness dimension owns this blocker |
| `owner` | string | Domain module responsible for resolving this blocker |

If the Review Gate decides to keep `blockers[]` as `string[]` in Slice 3, `ReadinessBlocker` is deferred. This is a proposed option, not a required schema.

---

### `ReadinessUnknownReason` (proposed, optional)

A structured reason why a dimension returned `unknown`. Proposed for a future schema versioning gate. Defer from Slice 3 unless the Review Gate determines a structured unknown reason is required for consumer disambiguation.

| Field | Type | Notes |
|---|---|---|
| `reason` | string | Machine-readable reason code |
| `message` | string | Human-readable explanation |
| `dimension` | string | Which dimension is unknown |

---

## 9. Consumer Impact

The following UI pages are expected future consumers of the Slice 3 readiness snapshot API. This gate makes no changes to any of these files. The consumer impact section describes intended backend behavior only.

| Consumer | Expected use |
|---|---|
| `WorkflowRunsPage.jsx` | Primary consumer; reads `WorkflowReadinessSnapshot` and `WorkflowStepReadiness` to replace its local static `MODEL_ROUTE_CATALOG` and prompt catalogs with live backend readiness contracts |
| `CampaignWizardPage.jsx` | Reads campaign-level readiness summary and step readiness to show output generation readiness |
| `StoreSetupPage.jsx` | May read workspace readiness summary for high-level AI readiness indicators |
| `ProductIntelligencePage.jsx` | Reads prompt readiness and route readiness for product analysis step readiness |
| `ProductCatalogPage.jsx` | Reads product-related input readiness to confirm product data sufficiency before analysis |
| `SecretsAndKeysPage.jsx` | Owner of `providerReady`; writes provider readiness records; reads `ProviderReadinessSnapshot` to show current provider health |
| `ModelRoutingPage.jsx` | Owner of `routeReady`; writes route readiness records; reads `RouteReadinessSnapshot` to show current route health |
| `PromptGovernancePage.jsx` | Owner of `promptReady`; writes prompt readiness records; reads `PromptReadinessSnapshot` to show current approval and check status |
| `CostMonitorPage.jsx` | Owner of `costReady`; writes cost policy records; reads `CostReadinessSnapshot` to show forecast risk and budget status |
| `SystemAdminPage.jsx` | Reads workspace readiness summary for global AI operations health view |
| `DataSourcesHubPage.jsx` | Owner of `dataSourceReady`; writes connector readiness records; reads `DataSourceReadinessSnapshot` |

**This gate makes no changes to any of these files.** No `src/` file is modified. No UI logic is changed. The consumer impact section is informational only, describing how the API will be consumed when backend implementation eventually proceeds.

---

## 10. Risks and Gaps

| Risk | Classification |
|---|---|
| **False confidence from readiness scores.** A consumer may use `score >= 80` as an execution approval signal instead of checking `blockers[]`. This could allow blocked steps to proceed in a real system. | Must prevent: schema description must state score is advisory and must not gate execution |
| **Ambiguous ownership of readiness dimensions.** If more than one module writes to the same dimension's record, the contract loses consistency. For example, both ModelRoutingPage and WorkflowRunsPage currently carry route data locally. | Must clarify at YAML time: each dimension has exactly one owner; the API enforces write access by owner module only |
| **Leakage risk if secret values appear in schemas.** Adding a `secretValue` field to `ProviderReadinessSnapshot` or any schema — even accidentally during YAML authoring — violates the security model. | Must prevent: schema reviews must grep for `secretValue` before any YAML is accepted |
| **Unstable `workflowStepKey` risk.** If consumers store `stepKey` without the `(workflowDefinitionId, version)` composite and the definition is later versioned, they will resolve the wrong step. | Must document: stepKey stability rule must be in schema description |
| **Hidden coupling between UI pages.** If backend implementation mirrors the current React-local pattern (one page reading another page's useState or localStorage), the contract-first ownership model is violated even if the API exists. | Must state clearly: owner module writes to API; consumer reads from API; no page-to-page direct reads |
| **Premature runtime / YAML implementation risk.** If a developer interprets the planning endpoints as ready to implement without waiting for the Review Gate, they may introduce execution semantics or incomplete security controls. | Must state clearly: all endpoints are proposed; YAML must not be edited until Review Gate completes |
| **Blocker semantics vs score semantics confusion.** Consumers may attempt to derive blocked state from a low score rather than from the presence of non-empty `blockers[]`. | Must state: `overallStatus: blocked` and non-empty `blockers[]` are the authoritative signals; score is a triage aid only |
| **`unknown`-state interpretation risk.** A consumer that defaults `unknown` to `ready` would allow unresolvable states to pass execution gates. | Must state: `unknown` is not `ready`; any evaluation chain that cannot resolve a dimension must surface `unknown` and block accordingly |

---

## 11. Review Gate Requirements

The next gate — **OpenAPI Slice 3 Review Gate — Readiness Snapshots Only** — must verify the following before any YAML implementation is permitted.

### Endpoint boundary verification

- Confirm the eight proposed readiness snapshot endpoints are all read-only GET.
- Confirm no execution path, mutating operation, or side effect is embedded in any endpoint.
- Confirm `GET /cost-policies/{costPolicyId}/readiness` and `GET /data-sources/{dataSourceId}/readiness` are necessary and not fully covered by the step readiness snapshot rollup.
- Confirm path parameter names (`workflowDefinitionId`, `stepKey`, `providerId`, `modelRouteId`, `promptId`, `costPolicyId`, `dataSourceId`) are consistent with the planned identity model.
- Confirm all paths use `workspaceId` scoping.

### Schema discriminator and dimension model

- Confirm `ReadinessSignal.dimension` field is required on standalone responses and may be omitted on embedded signals.
- Confirm the ten dimension enum values are complete and correctly named.
- Confirm `unknown` is explicitly documented as non-ready in all relevant schema descriptions.
- Confirm `score` description states it is advisory only and must not gate execution.

### Stable key verification

- Confirm `workflowStepKey` stability rule is stated in schema description as stable within `(workflowDefinitionId, version)` composite scope only.
- Confirm `workflowStepKey` is documented as not user-facing.

### Convention alignment

- Confirm `ErrorModel` `$ref` is used for all error responses.
- Confirm `PaginationMeta` `$ref` is used if any list endpoint is included.
- Confirm `RequestIdHeader` (`X-Request-Id`) component `$ref` is applied to every endpoint.
- Confirm standard error response codes `401`, `403`, `404`, `429`, `500` are declared on each endpoint.
- Confirm the existing Slice 1/2 `Readiness` schema is not replaced or modified by Slice 3.
- Confirm `ReadinessSignal` is defined as a new, distinct schema in Slice 3 with no naming conflict.

### Secret exclusion verification

- Confirm no schema field named `secretValue`, `apiKey`, `credential`, `rawKey`, or similar appears in any Slice 3 schema.
- Confirm `ProviderReadinessSnapshot` description explicitly states secret values are never returned.
- Confirm `secretReferenceName` is the only secret-related field and carries a description of its vault reference nature.

### No execution semantics

- Confirm no endpoint description uses language implying execution (`run`, `execute`, `trigger`, `invoke`, `fire`).
- Confirm no endpoint description implies model calls, connector calls, or prompt execution.
- Confirm `ProviderReadinessSnapshot` endpoint description explicitly states it is read-only and does not probe the provider.

### Generated client and runtime preconditions

- Confirm no generated client code exists or is committed alongside YAML.
- Confirm at least RBAC and `RequestIdHeader` security preconditions are assessed before opening an implementation gate.

---

## 12. Outputs

| Output | Path |
|---|---|
| Planning document | `docs/nashir_openapi_slice_3_readiness_snapshots_planning_gate.md` |
| Decision log | Not updated — `docs/03_decision_log.md` does not exist in this repository |
| Change log | Not updated — `docs/17_change_log.md` does not exist in this repository |
| YAML file | Not modified |
| Source files | Not modified |
| Generated clients | Not created |

---

## 13. GO / NO-GO

| Subject | Decision |
|---|---|
| Planning document | GO — this document is the planning gate output |
| `docs/nashir_v1_openapi.yaml` implementation | NO-GO |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| UI changes | NO-GO |
| Workflow execution | NO-GO |
| Dry-run execution | NO-GO |
| Provider test-connection | NO-GO |
| Run artifacts | NO-GO |
| Run audits | NO-GO |
| Product analysis result creation | NO-GO |
| Billing or subscription | NO-GO |
| AI Gateway Overview | NO-GO |

---

## 14. Next Step

The next required gate is:

**OpenAPI Slice 3 Review Gate — Readiness Snapshots Only**

No OpenAPI YAML edit is allowed before that review gate is complete. The review gate must:

- Verify all endpoint boundaries, schema fields, discriminator model, key stability, convention alignment, and secret exclusion requirements defined in Section 11.
- Produce a reviewed and accepted list of endpoint paths, operationIds, and schema definitions ready for YAML authoring.
- Explicitly confirm or reject readiness for a YAML implementation gate.

The review gate must not:

- Edit `docs/nashir_v1_openapi.yaml`.
- Implement backend.
- Generate clients.
- Add workflow write endpoints, dry-run, test-connection, artifacts, audits, or product analysis.
