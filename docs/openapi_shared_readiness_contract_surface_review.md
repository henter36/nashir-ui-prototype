# OpenAPI Shared Readiness Contract Surface Review Gate

## 1. Executive Decision

| Subject | Decision |
|---|---|
| Overall verdict | GO with conditions |
| Next gate | OpenAPI Shared Readiness Contract Surface Acceptance Gate |
| OpenAPI YAML implementation | NO-GO |
| Backend implementation | NO-GO |
| Generated clients | NO-GO |
| OpenAPI Slice 3 | NO-GO |
| Gate type | Review only |

The planning document is fundamentally sound. The contract-first principle, ownership model, security rules, and readiness dimensions are correctly stated and consistent with the acceptance gate. The conditions below are not planning-patch-level defects; they are precision requirements the Acceptance Gate must carry and which must be reflected before any YAML implementation gate is opened. No new planning gate is required.

---

## 2. Scope Review

**Verdict: Clean. No scope creep identified.**

The planning document correctly limits itself to candidate contract surfaces. A point-by-point check:

| Prohibited item | Present in planning? | Assessment |
|---|---|---|
| OpenAPI YAML | No | Clean |
| Backend runtime | No | Clean |
| Generated clients | No | Clean |
| Real workflow execution | No | Clean |
| Real AI / model calls | No | Clean |
| Real connector / analytics integration | No | Clean |
| Real trigger execution | No | Clean |
| Real prompt execution | No | Clean |
| Migrations or tests | No | Clean |
| Billing / subscription | No | Clean |
| AI Gateway Overview | No | Clean |

The planning document correctly marks all proposed resources as "planning only" and all endpoint paths as "candidates only." It explicitly prohibits implementation in the out-of-scope section. The gate did not edit any existing YAML or source file.

---

## 3. Candidate Resource Group Review

### A. Readiness Snapshots

**Verdict: Accepted for Slice 3. Core of the planned surface.**

Workspace, workflow, and step readiness snapshots are the primary consumer-facing contract. All eight resources belong in the shared OpenAPI surface. Workspace readiness summary and workflow readiness snapshot are appropriate rollups. The step readiness snapshot is the most critical resource: it is what WorkflowRunsPage should eventually read instead of its local static catalogs.

Overlap with existing Slice 1/2: Slice 1/2 already defines a `Readiness` schema (score / label / issues). The new `ReadinessSignal` and `WorkflowStepReadiness` schemas must be explicitly positioned as superseding or extending the existing `Readiness` schema — not conflicting with it. **This relationship must be documented before acceptance.**

Provider, route, prompt, cost, and data-source readiness snapshots are point-in-time reads. They are safe as read-only GET endpoints. None imply execution.

**Condition A1:** Clarify how `ReadinessSignal` / `WorkflowStepReadiness` relate to the existing `Readiness` schema in Slice 1/2 before acceptance.

---

### B. Provider Health / Readiness

**Verdict: Accepted for Slice 3 (read endpoints only). `test-connection` must be deferred.**

Provider identity, status, health, and supported capabilities are appropriate read-only resources. They reflect state owned by SecretsAndKeysPage and consumed by ModelRoutingPage and WorkflowRunsPage. No execution is implied by GET endpoints.

`secretReferenceName` is correctly included; secret value is correctly excluded.

`POST /ai-providers/{providerId}/test-connection` is a problem. This endpoint initiates a real network call to a provider, which requires a live credential retrieved from a Secret Vault. The Secret Vault is a confirmed runtime blocker. This endpoint must be **deferred** until the Secret Vault blocker is resolved. Including it in Slice 3 risks implementing a path that cannot be secured.

**Condition B1:** `POST /test-connection` must be explicitly deferred from Slice 3 and flagged as requiring Secret Vault to be resolved first.

---

### C. Model Route Readiness

**Verdict: Accepted for Slice 3 (read endpoints only).**

Task route, provider reference, primary model, fallback models, and route health are appropriate read-only resources. The provider reference binding (`routeReady` depends on `providerReady`) is correctly stated.

Timeout/retry policy snapshot is correctly noted as runtime-only. No execution is implied by the planned GET endpoints.

No deferred items beyond the test-connection issue already noted under Group B.

---

### D. Prompt Readiness

**Verdict: Accepted for Slice 3 (read endpoints only).**

Prompt version, approval status, required checks, allowed outputs, and blocked patterns are correct. The `promptVersionId` hierarchy under `promptId` is correctly modelled (`GET /prompts/{promptId}/versions/{promptVersionId}`).

Input/output schema references are correctly deferred to a later schema versioning gate.

No execution is implied by the planned GET endpoints.

---

### E. Cost Readiness

**Verdict: Accepted for Slice 3 (read endpoints only).**

Budget cap, approval threshold, and forecast risk are read-only policy reads. No execution is implied.

Provider usage/metering reference is correctly noted as a future data feed, not a static estimate. The `costPolicyId` identity is correct.

No deferred items beyond the general metering blocker already captured in the runtime blockers section.

---

### F. Workflow Definitions

**Verdict: Read endpoints accepted for Slice 3. Write endpoints must be deferred.**

`GET /workflow-definitions` and `GET /workflow-definitions/{workflowDefinitionId}` are safe read-only endpoints and correct for Slice 3.

`POST /workflow-definitions` and `PUT /workflow-definitions/{workflowDefinitionId}` create or mutate workflow definitions. These are write operations that require the Workflow Engine blocker to be resolved before they have production meaning. Including them in Slice 3 implies a write surface without a real execution engine to validate or enforce the contracts. They must be deferred to a later implementation slice.

`POST /workflow-definitions/{workflowDefinitionId}/dry-run` raises an additional concern (addressed below under endpoint review, Section 6).

**Condition F1:** `POST /workflow-definitions` and `PUT /workflow-definitions/{workflowDefinitionId}` must be deferred from Slice 3. Rationale: write endpoints require a Workflow Engine to validate and enforce contracts; read endpoints do not.

---

### G. Input / Output Schema Contracts

**Verdict: Correctly deferred. Exclude from Slice 3.**

The planning document correctly notes these are planned for a later schema versioning gate. Input and output schema contracts require JSON schema validation infrastructure and schema version persistence before they can be safely exposed. Confirm that these are excluded from Slice 3 at the Acceptance Gate.

---

### H. Run Artifacts

**Verdict: Deferred. Exclude from Slice 3.**

Run artifacts require `workflowRunId`, which implies workflow runs exist and can be retrieved. `workflowRunId` requires a Workflow Engine and run persistence model. Both are confirmed runtime blockers. Neither is resolved.

Including run artifact endpoints in Slice 3 would imply a path segment (`workflow-runs/{workflowRunId}`) that cannot be resolved until workflow execution exists. This is premature.

**Condition H1:** Run artifact endpoints (`GET /workflow-runs/{workflowRunId}/artifacts`, `GET /workflow-runs/{workflowRunId}/artifacts/{artifactId}`) must be explicitly excluded from Slice 3.

---

### I. Run Audits

**Verdict: Deferred. Exclude from Slice 3.**

Run audit events require an immutable, append-only audit log. This is a confirmed runtime blocker. The workspace-level audit events endpoint (`GET /workspaces/{workspaceId}/audit-events`) is slightly less dependent on run identity, but it still requires the immutable audit backend to exist before it can return meaningful records. Both audit endpoints should be deferred from Slice 3.

**Condition I1:** Run audit event endpoints must be explicitly excluded from Slice 3.

---

### J. Product Analysis Results

**Verdict: Deferred. Exclude from Slice 3.**

Product analysis results require product snapshots, prompt version snapshots, route snapshots, cost policy snapshots, and artifact persistence. All of these dependencies are unresolved runtime blockers. `POST /products/{productId}/analysis-results` implies executing an analysis, which requires AI model execution. This must be deferred.

The `GET` endpoint for retrieving existing results is less problematic in principle, but without the persistence model and artifact identity resolved, it has no data to serve. Both endpoints should be deferred.

**Condition J1:** Product analysis result endpoints must be explicitly excluded from Slice 3.

---

## 4. Slice Strategy Review

**Assessed options:**

| Option | Scope | Assessment |
|---|---|---|
| A: Readiness Snapshots only | Step readiness read | Too narrow — step readiness requires provider/route/prompt/cost domain records to exist before it can be computed |
| B: Readiness Snapshots + Provider Health | Adds provider read | Better, but leaves route/prompt/cost readiness without any backing records |
| C: Readiness Snapshots + Workflow Step Contracts | Adds workflow step contracts | Correct pairing — step contracts define what to evaluate; readiness reports the result |
| D: Full readiness + workflow definitions + artifacts | Full surface | Too broad — includes execution endpoints, artifacts, and audits before blockers are resolved |

**Recommendation: Option B extended (Slice 3 candidate surface)**

The correct first implementation slice is:

- All readiness snapshot read endpoints (Groups A — step, workflow, workspace)
- Provider identity and health read endpoints (Group B, GET only)
- Model route readiness read endpoints (Group C, GET only)
- Prompt readiness read endpoints (Group D, GET only)
- Cost policy readiness read endpoints (Group E, GET only)
- Workflow definition read endpoints (Group F, GET only)
- Data source readiness read endpoints (Group G data-sources, GET only)

This surface is the minimum that gives a consumer (WorkflowRunsPage) everything it needs to read step readiness across all owner domains without requiring execution, run identity, artifacts, audits, write operations, or schema validation infrastructure.

Excluded from Slice 3:

- `POST /test-connection`
- `POST /workflow-definitions`
- `PUT /workflow-definitions/{workflowDefinitionId}`
- `POST /workflow-definitions/{workflowDefinitionId}/dry-run`
- All run artifact endpoints
- All run audit endpoints
- All product analysis endpoints
- All input/output schema contract endpoints

Rationale: the smallest executable contract surface that unblocks consumer readiness consumption. Do not introduce execution paths, run identity, or artifact persistence before they are planned.

---

## 5. Candidate Endpoint Review

### Readiness

```
GET  /workspaces/{workspaceId}/readiness                                         ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness  ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness  ✓ Accept for Slice 3
```

Naming: consistent, workspace-scoped, uses stable IDs. Correct.

---

### Providers

```
GET  /workspaces/{workspaceId}/ai-providers                                      ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/ai-providers/{providerId}                         ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/ai-providers/{providerId}/readiness               ✓ Accept for Slice 3
POST /workspaces/{workspaceId}/ai-providers/{providerId}/test-connection         ✗ Defer — requires Secret Vault
```

`POST /test-connection` initiates a real credential-authenticated probe against a live provider endpoint. This cannot be safely implemented without the Secret Vault blocker resolved. The naming is clear but the endpoint must be deferred.

---

### Model Routes

```
GET  /workspaces/{workspaceId}/model-routes                                      ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/model-routes/{modelRouteId}                       ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness             ✓ Accept for Slice 3
```

Naming: correct. No execution implied.

---

### Prompts

```
GET  /workspaces/{workspaceId}/prompts                                           ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/prompts/{promptId}                                ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/prompts/{promptId}/readiness                      ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/prompts/{promptId}/versions/{promptVersionId}     ✓ Accept for Slice 3
```

Naming: correct. The hierarchical path `prompts/{promptId}/versions/{promptVersionId}` correctly models the version relationship. No execution implied.

---

### Cost Policy

```
GET  /workspaces/{workspaceId}/cost-policies                                     ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/cost-policies/{costPolicyId}/readiness            ✓ Accept for Slice 3
```

Naming: correct. Read-only. No execution implied.

---

### Workflow Definitions

```
GET  /workspaces/{workspaceId}/workflow-definitions                              ✓ Accept for Slice 3
POST /workspaces/{workspaceId}/workflow-definitions                              ✗ Defer — requires Workflow Engine
GET  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}       ✓ Accept for Slice 3
PUT  /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}       ✗ Defer — requires Workflow Engine + If-Match
```

The PUT endpoint will require `If-Match` or `X-Resource-Version` per Slice 1/2 conventions. Both write endpoints must be deferred until the Workflow Engine blocker is resolved.

---

### Workflow Dry Run

```
POST /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/dry-run   ✗ Defer — requires clarification
```

This endpoint is ambiguous. If it simulates readiness evaluation only (as the planning intends), the response must return a typed `DryRunResult` — not a `WorkflowRun` artifact, not an execution receipt. The current planning does not define a `DryRunResult` schema, which creates a risk: an implementer could wire this to a real execution path if the response shape is undefined.

Additionally, dry-run is a state-changing simulation (it logs, it evaluates blockers, it may have side effects in a real system). It should accept an `Idempotency-Key`. This is not mentioned in the planning.

Until a `DryRunResult` schema is defined and the endpoint is explicitly marked as a readiness-only simulation with no execution side effects, this endpoint must be deferred.

**Condition DR1:** `POST /dry-run` must define a `DryRunResult` response schema and explicitly state it simulates readiness only — no execution, no run artifact created, no trigger fired. Add `Idempotency-Key` requirement. Defer from Slice 3 until this is defined.

---

### Data Sources

```
GET  /workspaces/{workspaceId}/data-sources                                      ✓ Accept for Slice 3
GET  /workspaces/{workspaceId}/data-sources/{dataSourceId}/readiness             ✓ Accept for Slice 3
```

Naming: correct. Read-only. No execution implied.

---

### Run Artifacts

```
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/artifacts           ✗ Defer — requires workflowRunId
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/artifacts/{artifactId}  ✗ Defer — requires workflowRunId
```

These paths use `workflowRunId` as a path segment. `workflowRunId` requires a Workflow Engine and run persistence model. Both blockers are unresolved. Both endpoints are deferred.

---

### Run Audit Events

```
GET  /workspaces/{workspaceId}/workflow-runs/{workflowRunId}/audit-events        ✗ Defer — requires workflowRunId + immutable audit
GET  /workspaces/{workspaceId}/audit-events                                      ✗ Defer — requires immutable audit backend
```

The workspace-scoped audit events endpoint is the more defensible of the two, but it still requires an immutable, append-only backend. That blocker is unresolved. Both deferred.

---

### Product Analysis

```
GET  /workspaces/{workspaceId}/products/{productId}/analysis-results             ✗ Defer — requires artifact persistence
POST /workspaces/{workspaceId}/products/{productId}/analysis-results             ✗ Defer — requires AI execution + snapshots
GET  /workspaces/{workspaceId}/products/{productId}/analysis-results/{productAnalysisResultId}  ✗ Defer — requires artifact persistence
```

`POST` implies initiating an analysis, which requires AI model execution. All three endpoints are deferred.

---

## 6. Schema Review

### `ReadinessStatus` enum

**Verdict: Accepted.**

The five states (ready / warning / blocked / unknown / not_applicable) are correct and consistent with the acceptance gate. The rule that `unknown` must not be treated as `ready` is stated. No missing states identified.

---

### `ReadinessSignal`

**Verdict: Accepted with one condition.**

Fields are sufficient. `score` is marked advisory. `owner`, `evidenceSummary`, and `nextAction` provide the governance trail and remediation signal a consumer needs.

**Condition S1:** The `score` field comment "(0–100, advisory only)" should be elevated to a formal schema constraint — not just a comment — at YAML time. The field must carry a `description` that states it is advisory and must not be used as an execution gate.

One gap: `ReadinessSignal` has no `dimension` discriminator field indicating which readiness dimension this signal represents when the signal appears outside the context of `WorkflowStepReadiness`. When a signal is returned standalone (e.g., from `GET /ai-providers/{providerId}/readiness`), consumers need to know which dimension they are reading. Consider adding `dimension: ReadinessDimension` (an enum of the ten dimensions) to `ReadinessSignal`.

**Condition S2:** Add a `dimension` field to `ReadinessSignal` (enum: providerReady, routeReady, promptReady, costReady, reviewReady, destinationReady, inputReady, outputReady, triggerReady, dataSourceReady) for standalone signal use.

---

### `WorkflowStepReadiness`

**Verdict: Accepted.**

All ten dimensions are present. `overallStatus`, `blockers[]`, `warnings[]`, `checks[]`, `nextActions[]`, `evidenceSummary`, and `updatedAt` are all correct.

Gap: no `evaluatedAt` or `validFor` TTL field. Readiness is point-in-time. A consumer must know when the snapshot was evaluated and whether it is still within a valid window. `updatedAt` partially serves this but does not communicate cache policy. This is a deferred concern, not a Slice 3 blocker.

---

### `WorkflowDefinition`

**Verdict: Accepted with one condition.**

Fields are correct. `version` is a plain string — this is consistent with the planning's intent and acceptable.

**Condition S3:** The `version` field in `WorkflowDefinition` should use the same versioning convention as existing Slice 1/2 resources (integer `version` used in Product and Asset schemas) or explicitly document why a string version is preferred. Consistency with existing conventions must be confirmed at YAML time.

---

### `WorkflowTrigger`

**Verdict: Accepted.**

Fields are correct and consistent with the accepted WorkflowRunsPage trigger model (type, startWhen, startCondition, eventSource, updatePolicy). No execution is implied by the schema itself.

---

### `WorkflowStepContract`

**Verdict: Accepted with one condition.**

Fields are correct. External references (`modelRouteRef`, `promptRef`, `costPolicyRef`) correctly use IDs, not embedded objects.

**Condition S4:** The stability scope of `stepKey` must be explicitly documented. The planning states it is "stable within a definition version." This must be strengthened: `stepKey` is stable within the composite `(workflowDefinitionId, version)` scope only. Consumers must not use `stepKey` alone as a durable cross-version identifier. This must be stated in the schema description.

---

### `InputRef`

**Verdict: Accepted.**

Fields are correct. `fieldLabel` is correctly marked display-only. `snapshotRequired` is a useful flag. `schemaRef` correctly anticipates a future schema versioning gate.

---

### `OutputContract`

**Verdict: Accepted.**

The inclusion of `destinationField` is correct — this was an identified gap in earlier planning and is now resolved. `visibility` enum values are consistent with the accepted UI model. `promptToSendWithOutput` correctly uses a `promptVersionId` reference.

---

### `ProviderReadiness`

**Verdict: Accepted with one condition.**

Fields are correct. The secret exclusion rule is important.

**Condition S5:** The comment `// secretValue is never included in any response` must be converted to a formal schema constraint at YAML time — not a code comment. This should be an explicit `x-never-returned` extension or a `description` stating the field does not exist in this schema and must never be added.

---

### `ProductAnalysisResult`

**Verdict: Deferred. Schema is premature for Slice 3.**

The schema is conceptually correct. However, `productSnapshot`, `promptVersionSnapshot`, `routeSnapshot`, and `costPolicySnapshot` are all typed as `object` (unstructured). This is too loose for a versioned API contract. These fields should reference typed snapshot schemas (`ProductSnapshot`, `PromptVersionSnapshot`, `RouteSnapshot`, `CostPolicySnapshot`) before the schema is implemented.

Since this resource group is deferred from Slice 3 anyway, this is not a blocking condition for the acceptance gate, but it must be resolved before the product analysis endpoints are opened.

**Condition S6 (deferred):** `ProductAnalysisResult` snapshot fields must reference typed schemas before implementation. `object` is not sufficient for a versioned API contract.

---

## 7. Identity Model Review

**Verdict: Accepted with two conditions.**

All fourteen identifiers are correct and appropriately assigned to owner domains. No name-based identity is present. The rule that display names are snapshots only is correct.

**Condition ID1:** `workflowStepKey` stability must be strengthened. The current description "stable within a definition version" is ambiguous — it could be read as stable within a single version string, or stable as long as the definition exists. It must be documented as: `stepKey` is stable within the composite `(workflowDefinitionId, version)` tuple. Consumers must not use `stepKey` across definition versions as a durable reference.

**Condition ID2:** `artifactId` and `auditEventId` are correctly included in the identity model as forward-looking planned identifiers. However, they must be explicitly marked as deferred from Slice 3 in the Acceptance Gate to avoid implementers adding path segments that depend on unresolved runtime infrastructure.

---

## 8. Security and Governance Review

**Verdict: Mostly accepted. Two gaps.**

| Control | Planned? | Assessment |
|---|---|---|
| Secret Vault integration | Yes | Correctly required |
| RBAC | Yes | Correctly required |
| Immutable audit log | Yes | Correctly required |
| Idempotency | Yes | Stated for triggers and dry-run |
| No raw secret values | Yes | Correctly prohibited |
| No generated clients before acceptance | Yes | Correctly prohibited |
| Audit events for sensitive changes | Yes | Correctly required |
| Workspace scoping | Yes (via conventions) | Correct |
| Standard error behavior | Yes (via ErrorModel) | Correct |
| Optimistic concurrency | Yes (If-Match / X-Resource-Version) | Correct for write endpoints |

**Gap G1:** The planning does not mention the `RequestIdHeader` convention present in Slice 1/2. All endpoints should accept and propagate a request ID for correlation and debugging. This should be noted in the Acceptance Gate.

**Gap G2:** The `Idempotency-Key` requirement for dry-run is stated in the security section but not carried through to the dry-run endpoint path description. The endpoint review above (Condition DR1) addresses this but the gap should be noted here too.

---

## 9. Runtime Blocker Review

**Verdict: Confirmed. All ten blockers remain unresolved.**

| Blocker | Correctly stated? | Implies early execution risk? |
|---|---|---|
| Secret Vault | Yes | Yes — `POST /test-connection` implies this |
| RBAC | Yes | No early execution risk in read endpoints |
| Immutable Audit Log | Yes | Yes — audit event endpoints imply this |
| Workflow Engine | Yes | Yes — POST/PUT workflow definition + dry-run imply this |
| Trigger Execution Policy | Yes | No endpoint directly triggers today |
| Idempotency / Retry / Failure Policy | Yes | Applies to dry-run and write endpoints |
| Input / Output Schema Validation | Yes | No early execution risk in read endpoints |
| Runtime Snapshots | Yes | Required before dry-run and write workflows |
| Provider Usage / Cost Metering | Yes | No early execution risk in read endpoints |
| Artifact / Result Persistence | Yes | Yes — run artifact endpoints imply this |

The planning document correctly lists all ten blockers. The Acceptance Gate must carry the endpoint deferral decisions (Conditions B1, F1, H1, I1, J1, DR1) as the mechanism that keeps Slice 3 safe of these blockers.

---

## 10. Relationship to Existing OpenAPI

**Verdict: Accepted with one condition.**

| Convention | Referenced in planning? | Assessment |
|---|---|---|
| `ErrorModel` | Yes | Correct |
| `PaginationMeta` | Yes | Correct |
| `Idempotency-Key` | Yes | Correct |
| `If-Match` / `X-Resource-Version` | Yes | Correct |
| `workspaceId` path scoping | Yes | Correct |
| Standard error responses | Yes | Correct |
| No name-based identity | Yes | Correct |
| `RequestIdHeader` | No | Gap (see Gap G1) |
| Existing `Readiness` schema | Not addressed | Gap (see Condition A1) |

Existing Slice 1/2 must remain untouched. The planning document correctly states this. The existing `Readiness` schema in Slice 1/2 (score/label/issues) is a simpler variant. The new `ReadinessSignal` is a superset. The Acceptance Gate must document the supersession or extension relationship explicitly to avoid schema name conflicts in future YAML.

---

## 11. Risks and Gaps

| Risk | Classification |
|---|---|
| Surface too broad for first implementation slice — run artifacts, audit events, product analysis, dry-run, and write endpoints included | Should fix before acceptance: carry Conditions B1, F1, H1, I1, J1, DR1 as explicit Slice 3 exclusions |
| Readiness score misuse as execution approval | Should fix before acceptance: elevate advisory rule to formal schema constraint (Condition S1) |
| `unknown` treated as `ready` | Accepted risk — correctly stated in planning; must be repeated in YAML schema description |
| Page-local state leaking into backend contract | Planning risk, not a YAML risk yet; correctly identified in planning; must be enforced architecturally |
| Output destinations without field-level target | Resolved — `destinationField` is present in `OutputContract` |
| Workflow definition write endpoints implying execution too early | Should fix before acceptance: defer POST/PUT (Condition F1) |
| `POST /dry-run` implying execution too early | Should fix before acceptance: define `DryRunResult` schema and defer (Condition DR1) |
| `POST /test-connection` requiring Secret Vault | Should fix before acceptance: defer (Condition B1) |
| Product analysis results requiring snapshots and artifact persistence | Should fix before acceptance: defer (Condition J1, S6) |
| Run artifacts requiring `workflowRunId` identity | Should fix before acceptance: defer (Condition H1) |
| Run audits requiring immutable backend audit | Should fix before acceptance: defer (Condition I1) |
| `workflowStepKey` stability ambiguity | Should fix before acceptance: tighten stability rule (Conditions ID1, S4) |
| Existing `Readiness` schema conflict with new `ReadinessSignal` | Should fix before acceptance: document relationship (Condition A1) |
| `ProductAnalysisResult` snapshot fields typed as `object` | Can defer — resource is deferred from Slice 3 (Condition S6) |
| Missing `RequestIdHeader` mention | Can defer — gap in governance text, not a structural defect |
| No `dimension` field on standalone `ReadinessSignal` | Should fix before acceptance: add discriminator (Condition S2) |
| `secretValue` exclusion expressed as code comment, not schema constraint | Should fix before acceptance: elevate to formal constraint (Condition S5) |

---

## 12. Required Changes Before Acceptance

The following conditions must be addressed in the Acceptance Gate. No new planning patch gate is required. These are precision requirements only.

| Condition | Required change |
|---|---|
| **A1** | Document the relationship between the existing Slice 1/2 `Readiness` schema and the new `ReadinessSignal` / `WorkflowStepReadiness` schemas. State that `ReadinessSignal` supersedes `Readiness` for AI operations readiness contracts; Slice 1/2 `Readiness` remains as-is for existing resources. |
| **B1** | `POST /ai-providers/{providerId}/test-connection` must be explicitly deferred from Slice 3. Requires Secret Vault blocker to be resolved first. |
| **F1** | `POST /workflow-definitions` and `PUT /workflow-definitions/{workflowDefinitionId}` must be explicitly deferred from Slice 3. Requires Workflow Engine blocker to be resolved first. |
| **H1** | Run artifact endpoints must be explicitly excluded from Slice 3. Require `workflowRunId` and Workflow Engine + artifact persistence. |
| **I1** | Run audit event endpoints must be explicitly excluded from Slice 3. Require immutable audit backend. |
| **J1** | Product analysis result endpoints must be explicitly excluded from Slice 3. Require AI execution + artifact persistence + snapshot model. |
| **DR1** | `POST /dry-run` must define a `DryRunResult` response schema and be explicitly marked as readiness-simulation only (no execution, no run artifact, no trigger). Requires `Idempotency-Key`. Defer from Slice 3 until `DryRunResult` is defined. |
| **S1** | Elevate the `score` advisory rule from a comment to a formal schema description at YAML time. |
| **S2** | Add `dimension` field to `ReadinessSignal` as a discriminator for standalone use. |
| **S3** | Align `WorkflowDefinition.version` with existing Slice 1/2 versioning convention (integer) or explicitly document why a string version is used. |
| **S4** | Strengthen `workflowStepKey` stability rule: stable within `(workflowDefinitionId, version)` composite scope only. |
| **S5** | Elevate the `secretValue` exclusion from a code comment to a formal schema constraint. |
| **ID1** | Document `workflowStepKey` composite scope in the identity model. |
| **ID2** | Mark `artifactId` and `auditEventId` as deferred-from-Slice-3 in the identity model section. |

---

## 13. Recommended First Implementation Slice

**Slice name:** OpenAPI Slice 3 — Shared Readiness Read Surface

**Include:**

- `GET /workspaces/{workspaceId}/readiness`
- `GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness`
- `GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness`
- `GET /workspaces/{workspaceId}/ai-providers`
- `GET /workspaces/{workspaceId}/ai-providers/{providerId}`
- `GET /workspaces/{workspaceId}/ai-providers/{providerId}/readiness`
- `GET /workspaces/{workspaceId}/model-routes`
- `GET /workspaces/{workspaceId}/model-routes/{modelRouteId}`
- `GET /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness`
- `GET /workspaces/{workspaceId}/prompts`
- `GET /workspaces/{workspaceId}/prompts/{promptId}`
- `GET /workspaces/{workspaceId}/prompts/{promptId}/readiness`
- `GET /workspaces/{workspaceId}/prompts/{promptId}/versions/{promptVersionId}`
- `GET /workspaces/{workspaceId}/cost-policies`
- `GET /workspaces/{workspaceId}/cost-policies/{costPolicyId}/readiness`
- `GET /workspaces/{workspaceId}/workflow-definitions`
- `GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}`
- `GET /workspaces/{workspaceId}/data-sources`
- `GET /workspaces/{workspaceId}/data-sources/{dataSourceId}/readiness`
- Schemas: `ReadinessStatus`, `ReadinessSignal` (with Conditions S1, S2 applied), `WorkflowStepReadiness`, `WorkflowDefinition` (with Condition S3 applied), `WorkflowTrigger`, `WorkflowStepContract` (with Condition S4 applied), `InputRef`, `OutputContract`, `ProviderReadiness` (with Condition S5 applied)

**Exclude:**

- `POST /test-connection`
- `POST /workflow-definitions`
- `PUT /workflow-definitions/{workflowDefinitionId}`
- `POST /workflow-definitions/{workflowDefinitionId}/dry-run`
- All `workflow-runs/{workflowRunId}/*` paths
- All `audit-events` paths
- All `products/{productId}/analysis-results` paths
- `ProductAnalysisResult` schema
- Input/output schema contract resources
- `artifactId`, `auditEventId` as implemented path segments

**Rationale:**

This surface gives consumers the full read interface for all ten readiness dimensions without requiring execution, run identity, artifact persistence, audit infrastructure, secret vault access, or workflow engine. It is the minimum viable API surface to replace WorkflowRunsPage's local static catalogs with real backend readiness contracts.

**Required preconditions:**

- Conditions A1, B1, F1, H1, I1, J1, DR1, S1–S5, ID1–ID2 must be addressed in the Acceptance Gate.
- Secret Vault, RBAC, and Immutable Audit Log must be planned (even if not fully implemented) before any endpoint goes live.
- Existing Slice 1/2 conventions must be applied to all new schemas and paths.
- `RequestIdHeader` must be added to all new endpoints.
- No generated clients until YAML is reviewed and accepted.

---

## 14. Final Decision

| Subject | Decision |
|---|---|
| Overall verdict | GO with conditions |
| Next gate | OpenAPI Shared Readiness Contract Surface Acceptance Gate |
| OpenAPI YAML implementation | NO-GO |
| Backend implementation | NO-GO |
| OpenAPI Slice 3 | NO-GO until Acceptance Gate resolves conditions |
| Generated clients | NO-GO |
