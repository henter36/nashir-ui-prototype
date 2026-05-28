# OpenAPI Shared Readiness Contract Surface Acceptance Gate

## 1. Executive Decision

| Subject | Decision |
|---|---|
| Status | Accepted with conditions |
| Planning surface | Accepted as future contract direction |
| OpenAPI YAML implementation | NO-GO |
| Backend implementation | NO-GO |
| Generated clients | NO-GO |
| OpenAPI Slice 3 implementation | NO-GO until a separate YAML implementation gate |
| Planning patch required | No |

The planning document and review conditions are accepted. No new planning patch gate is required. All conditions identified by the review gate are carried and resolved below. The contract direction is accepted; none of it is approved for YAML implementation in this gate.

---

## 2. Sources

| Source | Role |
|---|---|
| `docs/openapi_shared_readiness_contract_surface_planning.md` | Planning gate — candidate resources, schemas, endpoints, and identity model |
| `docs/openapi_shared_readiness_contract_surface_review.md` | Review gate — GO with conditions; 13 named conditions to resolve |
| `docs/backend_readiness_ai_ops_shared_readiness_model_acceptance.md` | Upstream acceptance gate — canonical readiness dimensions, ownership model, blockers |
| `docs/nashir_v1_openapi.yaml` | Convention reference only; not edited in this gate |

---

## 3. Accepted Scope

The following resource groups are accepted as future contract direction. Acceptance of direction does not equal YAML approval. None of these groups are approved for implementation in this gate.

| Resource group | Accepted direction |
|---|---|
| Readiness snapshots | Workspace, workflow, and step readiness snapshots across all ten dimensions |
| Provider readiness / health | Provider identity, status, health, capabilities, and secret reference |
| Model route readiness | Task route, provider reference, primary/fallback models, and route health |
| Prompt readiness | Prompt version, approval status, required checks, allowed outputs, and blocked patterns |
| Cost readiness | Budget cap, approval threshold, forecast risk, and throttling policy |
| Workflow definitions | Workflow shape: trigger, steps, status, version |
| Workflow triggers | Trigger type, start condition, event source, start-when, update policy |
| Workflow step contracts | Per-step input refs, output contract, route/prompt/cost references, review requirement |
| Input / output schema contracts | JSON schemas, schema version, required/optional fields; deferred to a later schema versioning gate |
| Run artifacts | Typed run outputs with artifact identity and review status; deferred until artifact persistence is planned |
| Run audits | Append-only audit event types for policy, execution, and review actions; deferred until immutable audit backend is designed |
| Product analysis results | Product snapshot, prompt/route/cost snapshots, result summary, campaign suggestions; deferred until artifact persistence and AI execution model are planned |

These groups are not all approved for the first implementation slice. Acceptance of direction is not YAML approval.

---

## 4. First Future Implementation Slice Decision

**Slice 3 Candidate — Readiness Snapshots Only**

### Include

- Workspace readiness summary
- Workflow readiness snapshot
- Workflow step readiness snapshot
- Provider readiness snapshot (read endpoint, no test-connection)
- Route readiness snapshot
- Prompt readiness snapshot
- Cost readiness snapshot
- Data source readiness snapshot
- `ReadinessStatus` enum
- `ReadinessSignal` schema (with dimension discriminator; see Condition S2)
- `WorkflowStepReadiness` schema
- `WorkspaceReadinessSummary` schema
- `WorkflowReadinessSnapshot` schema

### Exclude from Slice 3

| Excluded item | Reason |
|---|---|
| Workflow definition write endpoints (POST / PUT) | Require Workflow Engine and workflow definition governance |
| Workflow trigger execution | Requires trigger registration, idempotency, audit, and event ingestion |
| `POST /dry-run` | Requires `DryRunResult` schema, idempotency, audit, and no-execution guarantee |
| `POST /test-connection` | Requires Secret Vault, credential access, and failure policy |
| Run artifacts | Require `workflowRunId`, artifact persistence, and artifact lifecycle |
| Run audit endpoints | Require immutable backend audit design |
| Product analysis result creation | Requires AI execution, snapshots, and artifact persistence |
| Generated clients | Require reviewed and accepted YAML first |
| Backend runtime | All confirmed runtime blockers unresolved |

### Rationale

This is the smallest safe executable contract surface. It gives consumers the full read interface for all ten readiness dimensions without touching execution paths, run identity, artifact persistence, audit infrastructure, Secret Vault access, or the Workflow Engine. It unblocks WorkflowRunsPage from depending on local static catalogs by giving it a real API surface to read domain readiness from owner modules.

---

## 5. Accepted Conditions

All thirteen conditions from the review gate are carried and resolved here.

---

### Condition A1 — Existing `Readiness` schema relationship

Existing Slice 1/2 defines a simple `Readiness` schema (score / label / issues). This schema remains untouched in the existing YAML and continues to serve existing resources in Slice 1/2.

`ReadinessSignal` is a future expanded normalized readiness contract for AI Operations. It is not a rename of the existing `Readiness` schema. When a YAML implementation gate opens Slice 3, the implementer must:

- Leave the existing `Readiness` schema in Slice 1/2 unchanged.
- Define `ReadinessSignal` as a new schema in Slice 3 with an explicit description stating it is the normalized AI Operations readiness contract.
- If the existing `Readiness` schema is later reconciled into `ReadinessSignal`, that reconciliation requires a separate migration/versioning gate and must not be done implicitly.

---

### Condition B1 — Provider `test-connection` deferred

`POST /workspaces/{workspaceId}/ai-providers/{providerId}/test-connection` is deferred from Slice 3.

Reason: this endpoint initiates a real authenticated network probe against a live provider. It requires:
- Secret Vault to retrieve provider credentials safely.
- Idempotency/audit to record the health probe event.
- Failure policy to handle probe timeouts and credential errors.

None of these are resolved. The endpoint may be reconsidered in a future slice after the Secret Vault blocker is resolved.

---

### Condition F1 — Workflow definition write endpoints deferred

`POST /workspaces/{workspaceId}/workflow-definitions` and `PUT /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}` are deferred from Slice 3.

Reason: write operations against workflow definitions imply:
- A Workflow Engine that validates definitions on creation and update.
- Optimistic concurrency (`If-Match` / `X-Resource-Version`) for PUT.
- Idempotency for POST.
- Audit events for definition changes.

The Workflow Engine is a confirmed runtime blocker. Read endpoints for workflow definitions (`GET`) remain accepted for Slice 3 and are not affected by this deferral.

---

### Condition H1 — Run artifacts deferred

All endpoints under `/workspaces/{workspaceId}/workflow-runs/{workflowRunId}/artifacts` are deferred from Slice 3.

Reason: these endpoints use `workflowRunId` as a path segment. `workflowRunId` requires:
- A Workflow Engine to create and identify runs.
- Artifact persistence and artifact lifecycle model.
- Artifact review status enforcement.

All three are unresolved. `workflowRunId` and `artifactId` remain forward-looking identifiers in the identity model but are not implemented in Slice 3.

---

### Condition I1 — Run audit endpoints deferred

`GET /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/audit-events` and `GET /workspaces/{workspaceId}/audit-events` are deferred from Slice 3.

Reason: audit event endpoints require an immutable, append-only backend audit log. That infrastructure is a confirmed runtime blocker and is not yet designed. Without it, these endpoints would return empty or inconsistent data. `auditEventId` remains a forward-looking identifier in the identity model but is not implemented in Slice 3.

---

### Condition J1 — Product analysis result creation deferred

`POST /workspaces/{workspaceId}/products/{productId}/analysis-results` and all product analysis read endpoints are deferred from Slice 3.

Reason: product analysis result creation requires:
- AI/model execution to produce the analysis.
- Product snapshot at analysis time.
- Prompt version snapshot, route snapshot, and cost policy snapshot.
- Artifact/result persistence and `productAnalysisResultId` identity.

All are unresolved. Product analysis results may be reconsidered in a future slice after the artifact persistence model and AI execution planning are complete.

---

### Condition DR1 — Dry-run endpoint deferred

`POST /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/dry-run` is deferred from Slice 3.

Reason: the dry-run endpoint is ambiguous without a defined `DryRunResult` schema. Without it, an implementer may wire this endpoint to a real execution path. Before this endpoint can be included in any slice it must:

- Be defined with a typed `DryRunResult` response schema that clearly indicates readiness simulation only.
- Carry an explicit constraint: no model execution, no trigger fired, no run artifact created, no backend side effects beyond evaluation.
- Require an `Idempotency-Key` header.
- Produce an audit event of type `dry_run_executed` (once audit infrastructure exists).

A future separate planning gate must define `DryRunResult` before this endpoint may be reconsidered.

---

### Condition S1 — Readiness score is advisory only

`ReadinessSignal.score` is an integer (0–100). It is advisory only. It must never be used as an execution approval signal.

When implemented in YAML, the `score` field must carry a `description` that states:

> This score is advisory only. It reflects the proportion of readiness dimensions that are satisfied. It must not be used as an execution gate. Execution denial is determined by the presence of blockers in the `blockers` array, not by score threshold alone.

The score may be used for display, progress indication, and dashboard summaries. It must not gate execution.

---

### Condition S2 — Dimension discriminator on `ReadinessSignal`

`ReadinessSignal` must include a `dimension` field when returned as a standalone response (outside the context of `WorkflowStepReadiness`). Without it, a consumer reading `GET /ai-providers/{providerId}/readiness` cannot identify which readiness dimension the signal represents.

Accepted discriminator:

```
dimension: providerReady
         | routeReady
         | promptReady
         | costReady
         | reviewReady
         | destinationReady
         | inputReady
         | outputReady
         | triggerReady
         | dataSourceReady
```

The `dimension` field may be omitted when `ReadinessSignal` is embedded as a named field inside `WorkflowStepReadiness` (the field name is already the discriminator). It must be present in standalone signal responses.

---

### Condition S3 — Schema versioning

Future readiness schemas must support versioning where needed. At YAML implementation time, the implementer must confirm that `WorkflowDefinition.version`, `WorkflowStepReadiness`, and snapshot schemas carry version fields consistent with existing Slice 1/2 conventions. The existing convention in Slice 1/2 uses an integer `version` field for optimistic concurrency on mutable resources. Readiness snapshots are point-in-time and immutable by nature; they do not require optimistic concurrency versioning but must carry an `updatedAt` timestamp for staleness detection.

---

### Condition S4 / ID1 — `workflowStepKey` stability scope

`workflowStepKey` is stable within the composite scope of `(workflowDefinitionId, version)`. It must not be used as a durable cross-version identity.

Rules:

- `workflowStepKey` identifies a step within a specific version of a workflow definition.
- If the workflow definition is updated and the version changes, the same `stepKey` string in the new version is not the same step as in the previous version unless explicitly preserved by the implementer.
- Consumers must not store `workflowStepKey` alone as a durable reference. The durable reference is the tuple `(workflowDefinitionId, version, stepKey)`.
- `workflowStepKey` is not a user-facing display label. It is an internal stable key for API routing and readiness lookup.

---

### Condition S5 — Secret values formally excluded

`ProviderReadiness` and all API responses must formally exclude `secretValue` and any raw credential value. This exclusion must be expressed as a schema constraint at YAML implementation time, not as a code comment.

At YAML time, the implementer must:

- Confirm that `secretValue` does not appear anywhere in the `ProviderReadiness` schema or any response schema.
- Add an explicit `description` note to `ProviderReadiness` stating: "Secret values are never returned. Only the secret reference name is exposed. The vault key must not be used to reconstruct credentials."
- Consider an OpenAPI extension (`x-never-returned: true`) if the YAML toolchain supports it.

This applies to all endpoints: no secret value, no raw API key, no credential string may appear in any request body, response body, header, log, or error message returned by the API.

---

### Condition ID2 — `artifactId` and `auditEventId` deferred from Slice 3

`artifactId` and `auditEventId` are accepted as forward-looking identifiers in the identity model. They are not implemented in Slice 3.

At the Acceptance Gate they are carried as planned future identifiers. The Acceptance Gate does not remove them from the identity model. They will be reconsidered when:

- `artifactId`: artifact persistence model, artifact lifecycle, and Workflow Engine are designed.
- `auditEventId`: immutable audit backend is designed and the audit event schema is finalized.

No path segment using `workflowRunId`, `artifactId`, or `auditEventId` may appear in Slice 3.

---

### Condition: RequestIdHeader

The existing Slice 1/2 YAML includes a `RequestIdHeader` parameter convention for request correlation and debugging. Future readiness endpoints in Slice 3 should carry this header where consistent with existing conventions.

This is not a blocking condition. It is a convention alignment requirement for the YAML implementation gate. The implementer must check whether `RequestIdHeader` is already defined as a reusable parameter component in Slice 1/2 and apply it to Slice 3 endpoints.

---

## 6. Accepted Candidate Schemas for Future Slice 3

The following schemas are accepted as planning direction for Slice 3. None are YAML-implemented in this gate.

### `ReadinessStatus` enum

```
ready
warning
blocked
unknown
not_applicable
```

Rules:
- `unknown` is not `ready`. An unresolvable dimension state must not be treated as passing.
- `not_applicable` may be used for optional dimensions that do not apply to a given step type.

### `ReadinessSignal`

Required fields and constraints:
- `status`: `ReadinessStatus`
- `score`: integer 0–100, advisory only, must not gate execution (see Condition S1)
- `blockers`: `string[]` — drives execution denial; any non-empty array makes the dimension blocked
- `warnings`: `string[]` — surfaced to user but do not block prototype dry-run display
- `checks`: `string[]` — explanatory passing checks, not execution conditions
- `owner`: string — identifies the owning module by domain name, not by UI page source-of-truth
- `evidenceSummary`: string — summary only; must not contain raw secrets, internal keys, or data source credentials
- `nextAction`: `string | null` — user-facing guidance for resolving a blocker or warning
- `updatedAt`: ISO8601 timestamp
- `dimension`: discriminator enum (required for standalone signals; see Condition S2)

### `WorkflowStepReadiness`

Required fields:
- `workflowKey`: string
- `stepKey`: string (stable within `(workflowDefinitionId, version)` composite scope)
- One `ReadinessSignal` per dimension: `triggerReady`, `inputReady`, `providerReady`, `routeReady`, `promptReady`, `costReady`, `reviewReady`, `outputReady`, `destinationReady`, `dataSourceReady`
- `overallStatus`: `ReadinessStatus` — `blocked` if any required dimension has blockers
- `blockers`: `string[]` — aggregate of all dimension blockers
- `warnings`: `string[]` — aggregate of all dimension warnings
- `checks`: `string[]` — aggregate of all dimension checks
- `nextActions`: `string[]` — user-facing guidance
- `evidenceSummary`: string
- `updatedAt`: ISO8601

### `WorkspaceReadinessSummary`

Required fields (candidate):
- `workspaceId`: string
- `overallStatus`: `ReadinessStatus`
- `blockedWorkflows`: integer
- `warningWorkflows`: integer
- `readyWorkflows`: integer
- `activeWorkflowCount`: integer
- `updatedAt`: ISO8601

### `WorkflowReadinessSnapshot`

Required fields (candidate):
- `workflowDefinitionId`: string
- `workflowVersion`: string
- `overallStatus`: `ReadinessStatus`
- `stepReadiness`: `WorkflowStepReadiness[]`
- `blockers`: `string[]`
- `warnings`: `string[]`
- `updatedAt`: ISO8601

---

## 7. Accepted Candidate Endpoints for Future Slice 3

The following endpoints are accepted as planning direction. None are YAML-implemented in this gate. All are read-only GET endpoints.

### Accepted for Slice 3

```
GET /workspaces/{workspaceId}/readiness
GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness
GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness
GET /workspaces/{workspaceId}/ai-providers/{providerId}/readiness
GET /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness
GET /workspaces/{workspaceId}/prompts/{promptId}/readiness
```

### Optional / to be confirmed during Slice 3 planning

Whether cost and data source readiness signals need standalone endpoints or are sufficiently surfaced through the workspace and step readiness rollups is a question for the Slice 3 Planning Gate. These are candidates, not confirmed:

```
GET /workspaces/{workspaceId}/cost-policies/{costPolicyId}/readiness     (candidate — may be covered by step snapshot)
GET /workspaces/{workspaceId}/data-sources/{dataSourceId}/readiness      (candidate — may be covered by step snapshot)
```

### Explicitly deferred

| Endpoint | Reason |
|---|---|
| `POST /ai-providers/{providerId}/test-connection` | Requires Secret Vault (Condition B1) |
| `POST /workflow-definitions` | Requires Workflow Engine (Condition F1) |
| `PUT /workflow-definitions/{workflowDefinitionId}` | Requires Workflow Engine + If-Match (Condition F1) |
| `POST /workflow-definitions/{workflowDefinitionId}/dry-run` | Requires `DryRunResult` schema + no-execution guarantee (Condition DR1) |
| `GET /workflow-runs/{workflowRunId}/artifacts` | Requires `workflowRunId` + artifact persistence (Condition H1) |
| `GET /workflow-runs/{workflowRunId}/audit-events` | Requires immutable audit (Condition I1) |
| `POST /products/{productId}/analysis-results` | Requires AI execution + snapshots (Condition J1) |
| `GET /products/{productId}/analysis-results` | Requires artifact persistence (Condition J1) |
| `GET /workspaces/{workspaceId}/audit-events` | Requires immutable audit (Condition I1) |

---

## 8. Security and Governance Acceptance

Future YAML implementation of Slice 3 must preserve the following requirements from Slice 1/2 conventions and the review gate.

| Requirement | Rule |
|---|---|
| `workspaceId` path scoping | All workspace-scoped resources use `/workspaces/{workspaceId}/` prefix |
| No name-based identity | All resources use stable opaque ID fields; display names are display-only snapshots |
| No raw secrets | No `secretValue`, raw API key, or credential string in any request/response body, header, log, or error message |
| `ErrorModel` reuse | All error responses use the existing `ErrorModel` component from Slice 1/2 |
| `PaginationMeta` reuse | All list endpoints that return collections use the existing `PaginationMeta` component from Slice 1/2 |
| `Idempotency-Key` | Required for mutating endpoints when they are eventually added; not applicable to Slice 3 read-only surface |
| `If-Match` / `X-Resource-Version` | Required for PUT operations when they are eventually added; not applicable to Slice 3 read-only surface |
| Standard error responses | All endpoints declare `400`, `401`, `403`, `404`, `429`, `500` responses using existing error response components |
| `RequestIdHeader` | Carry existing `RequestIdHeader` convention to Slice 3 endpoints for request correlation (Condition: RequestIdHeader) |
| No generated clients | No client code may be generated until YAML is reviewed and accepted |
| `unknown` is not `ready` | Enforced in schema descriptions; no consumer may treat `unknown` as a passing readiness state |
| Score is advisory only | Enforced in schema descriptions; score must not gate execution (Condition S1) |

---

## 9. Runtime Blockers Carried Forward

Runtime implementation of any endpoint in this acceptance document remains blocked by all ten confirmed blockers. No blocker has been resolved by this gate.

| Blocker | Status |
|---|---|
| Secret Vault | Unresolved |
| RBAC | Unresolved |
| Immutable Audit Log | Unresolved |
| Workflow Engine | Unresolved |
| Trigger Execution Policy | Unresolved |
| Idempotency / Retry / Failure Policy | Unresolved |
| Input / Output Schema Validation | Unresolved |
| Runtime Snapshots | Unresolved |
| Provider Usage / Cost Metering | Unresolved |
| Artifact / Result Persistence | Unresolved |

Even the Slice 3 read-only surface requires RBAC and ErrorModel at minimum before any endpoint can safely serve production traffic. The YAML implementation gate must not be opened until the security preconditions for the target slice are assessed.

---

## 10. Explicitly Not Approved

This gate does not approve and explicitly prohibits:

- OpenAPI YAML implementation
- Backend runtime
- Real workflow execution
- Real trigger execution
- Real AI/model calls
- Real prompt execution
- Real connector execution
- Real analytics integration
- Generated clients
- Database migrations
- Tests
- AI Gateway Overview
- Billing or subscription scope

---

## 11. Next Recommended Gate

**OpenAPI Slice 3 Planning Gate — Readiness Snapshots Only**

This gate must:
- Be planning only; it must not edit YAML.
- Narrow the implementation surface to the accepted Slice 3 read-only readiness snapshot endpoints.
- Define the exact schema shapes for `ReadinessStatus`, `ReadinessSignal` (with dimension field), `WorkflowStepReadiness`, `WorkspaceReadinessSummary`, and `WorkflowReadinessSnapshot` in enough detail that a YAML implementation gate can proceed without further planning.
- Confirm which security preconditions (RBAC, RequestIdHeader, ErrorModel wiring) must be resolved before the YAML implementation gate.
- Confirm whether `cost-policies/{costPolicyId}/readiness` and `data-sources/{dataSourceId}/readiness` are included or covered by rollup snapshots.

This gate must not:
- Edit `docs/nashir_v1_openapi.yaml`.
- Include workflow definition write endpoints, dry-run, test-connection, run artifacts, run audits, or product analysis.
- Generate clients.
- Implement backend.

---

## 12. Final Decision

| Subject | Decision |
|---|---|
| OpenAPI shared readiness contract surface direction | Accepted with conditions |
| First future slice | Readiness Snapshots Only |
| OpenAPI YAML implementation | NO-GO |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| Next gate | OpenAPI Slice 3 Planning Gate — Readiness Snapshots Only |
