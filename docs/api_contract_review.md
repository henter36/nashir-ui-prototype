# API Contract Review

## 1. Executive Decision

Conditional GO with required fixes.

The API Contract Gate is materially complete enough to proceed toward executable OpenAPI planning, but not directly to executable OpenAPI YAML. The contract defines the right V1 resource boundaries, workspace scoping, identity rules, snapshots, AI task boundaries, review gates, and Post-V1 exclusions. The remaining gaps are small but important: derived report endpoints, DELETE/archive semantics, list pagination/filtering conventions, status enums, and explicit OpenAPI-level requirements for idempotency, optimistic concurrency, and validation errors.

## 2. Review Scope

This review covers:

- V1 API resource completeness
- workspace scoping
- identity and reference rules
- snapshot rules
- request/response conceptual readiness
- AI task and prompt contracts
- review/publishing boundaries
- error model
- idempotency and concurrency
- V1 vs Post-V1 separation

## 3. Authority Inputs

Reviewed documents:

- `docs/api_contract_gate.md`
- `docs/data_flow_processing_and_reuse_architecture.md`
- `docs/data_entity_and_identity_model.md`
- `docs/erd_reconciliation_model.md`
- `docs/workspace_and_minimum_identity_decision.md`
- `docs/strategy_data_sufficiency_and_ai_task_contract.md`
- `docs/prototype_stabilization_closure_report.md`
- `docs/commercial_journey_e2e_acceptance_report/`

## 4. V1 Resource Coverage Review

| Resource | Present in API Contract? | Enough for OpenAPI planning? | Missing decisions | Verdict |
|---|---:|---:|---|---|
| StoreProfile | Yes | Yes | Status enum and validation rules need explicit definition. | Pass with minor detail |
| StoreStrategicPlan | Yes | Yes | Review/approval request body and version conflict behavior need detail. | Pass with minor detail |
| Product | Yes | Yes | DELETE/archive behavior and product readiness enum are missing. | Conditional |
| Asset | Yes | Yes | Upload/storage boundary is clear, but DELETE/archive and rights status enum need detail. | Conditional |
| ProductMarketingPriority | Yes | Partial | Resource exists, but endpoint candidates are not defined. | Needs fix |
| AssetGapReport | Yes | Partial | Resource exists, but endpoint candidates are not defined. | Needs fix |
| Campaign | Yes | Yes | Status enum and create idempotency must be explicit. | Pass with minor detail |
| CampaignBrief | Yes | Yes | One-brief vs multiple-versioned-brief decision should be stated. | Pass with minor detail |
| CampaignContentOutput | Yes | Yes | Status transitions and review reset rule need detail. | Pass with minor detail |
| ReviewFinding | Yes | Yes | Severity/status enums need explicit definition. | Pass with minor detail |
| PublishingReadiness | Yes | Yes | Deterministic check inputs and no-publish boundary are clear; response shape needs details. | Pass with minor detail |
| ModelProvider | Yes | Yes | Provider status/capability enums and secretReference constraints need detail. | Pass with minor detail |
| ModelRoute | Yes | Yes | Inference parameter schema should reference AI task contract explicitly. | Pass |
| PromptTemplate | Yes | Yes | Prompt list redaction vs detail endpoint behavior should be explicit. | Pass with minor detail |
| WorkflowRun | Yes | Yes | Run status enum and no-real-execution V1 behavior need precise OpenAPI notes. | Pass |
| AITaskRun | Yes | Yes | Execution mode/status and validation output shape need detail. | Pass |
| CostPolicy | Yes | Yes | Scope model needs one explicit choice: taskType, route, workspace, or mixed. | Conditional |
| AuditEvent | Yes | Yes | POST should likely be service-side only; immutability should be explicit. | Pass with minor detail |

## 5. Endpoint Coverage Review

| Endpoint group | Review |
|---|---|
| read/update StoreProfile | Sufficient. |
| create/read/review/approve StoreStrategicPlan | Sufficient, with review/approve body details needed in OpenAPI planning. |
| CRUD-like Product | Incomplete because delete/archive is not addressed. Acceptable for V1 if intentionally omitted. |
| CRUD-like Asset | Incomplete because delete/archive is not addressed. Upload/storage is correctly excluded. |
| product-asset linking | Sufficient. |
| Campaign create/read/update | Sufficient. |
| CampaignBrief read/update | Sufficient, but versioning/one-active-brief should be clarified. |
| CampaignContentOutput create/read/update | Sufficient. |
| ReviewFinding create/resolve | Sufficient. |
| PublishingReadiness check/read | Sufficient. |
| ModelProvider create/update/read | Sufficient. |
| ModelRoute create/update/read | Sufficient. |
| PromptTemplate create/update/review/approve | Sufficient. |
| WorkflowRun create/read | Sufficient as a V1 contract, not runtime execution. |
| AITaskRun create/read | Sufficient as a V1 contract, not real AI execution. |
| CostPolicy read/update | Sufficient, but create/delete policy lifecycle is not addressed. |
| AuditEvent read/create | Risky. POST should be restricted to service/system actors in implementation planning, not arbitrary client writes. |

Derived resources `ProductMarketingPriority` and `AssetGapReport` are present in the resource inventory but lack explicit endpoint candidates. This is the main coverage gap before OpenAPI planning.

## 6. Workspace Scoping Review

Workspace scoping is consistent. All endpoint candidates use `/workspaces/{workspaceId}/...`, and the document correctly reflects the V1 decision that one Workspace has one StoreProfile.

No multi-store route shape leaks into V1. `storeProfileId` appears where conceptually needed for StoreStrategicPlan, but it does not force a multi-store route model.

Ambiguity: the contract should explicitly state whether `storeProfileId` is returned in all StoreProfile/StoreStrategicPlan responses even though StoreProfile is singular in V1. The recommended answer is yes, to preserve future compatibility.

## 7. Identity and Reference Review

The contract correctly rejects user-facing names as identifiers and uses stable opaque IDs:

- product name is not identity
- asset file/name is not identity
- campaign name is not identity
- content output references `campaignId`
- review finding references `contentOutputId`
- publishing readiness references `campaignId` and optional `contentOutputId`
- model routes reference `providerId`
- prompt templates use `promptTemplateId` and `version`
- audit events reference `entityType` and `entityId`

Missing reference rules:

- `AssetGapReport` should state whether it references `productId`, `assetId`, both, or only a plan/report scope.
- `ProductMarketingPriority` should explicitly reference `planId` when derived from a strategic plan.
- `CampaignContentOutput.selectedAssets` should prefer `assetId` plus `assetSnapshot`, not only snapshots.

## 8. Snapshot Rules Review

Snapshot rules are mostly ready:

- Campaign snapshots product data at creation.
- Campaign snapshots strategy recommendations at creation.
- ContentOutput snapshots prompt/template version.
- ContentOutput can include selected asset snapshots.
- ReviewFinding snapshots finding text/status.
- AITaskRun records model route, prompt, input snapshot, evidence pack, confidence, and limitations.
- PublishingReadiness stores check result and does not publish.

Missing snapshots required before OpenAPI:

- Campaign should snapshot selected strategy recommendation source, including `planId` and `planVersion`.
- CampaignContentOutput should snapshot selected asset details while still retaining `assetId` when available.
- PublishingReadiness should snapshot the policy/check version used for the readiness result.

## 9. AI / Prompt / ModelRoute Contract Review

The AI contract is directionally sound:

- AITaskRun contract is present.
- EvidencePack concept is represented.
- PromptTemplate includes `systemPrompt`, `developerPolicyPrompt`, `userPromptTemplate`, `inputVariables`, and `outputSchema`.
- ModelRoute includes `inferenceParameters`.
- ModelProvider excludes raw secret values and uses `secretReference`.
- AI outputs include `confidence` and `limitations`.
- `humanReviewRequired` is represented.

Must become explicit in OpenAPI planning:

- exact `taskType` enum
- `response_format` / `outputSchema` representation
- inference parameter schema and defaults
- AITaskRun lifecycle statuses
- validation failure response for schema mismatch
- which prompt fields are returned in list responses vs detail responses

## 10. Review and Publishing Boundary Review

The boundary is correct:

- ReviewFinding is separate from ContentOutput.
- PublishingReadiness is separate from publishing execution.
- PublishingReadiness does not imply actual publishing.
- Human review is required before publishing.
- Publishing integrations are Post-V1.

OpenAPI planning should preserve this by avoiding any endpoint named `publish` in V1. If a future publishing endpoint is added, it belongs to a separate integration gate.

## 11. Error Model Review

The conceptual error model is enough for OpenAPI planning:

- `errorCode`
- `message`
- `details`
- `requestId`
- `retryable`
- `status`

Covered common errors:

- `workspace.not_found`
- `resource.not_found`
- `validation.failed`
- `permission.denied`
- `conflict.version_mismatch`
- `review.required`
- `publishing.blocked`
- `model_route.not_ready`
- `prompt_template.not_approved`
- `cost_policy.exceeded`
- `provider.not_ready`

Missing errors recommended before OpenAPI:

- `asset_rights.review_required`
- `idempotency.conflict`
- `output_schema.validation_failed`
- `ai_task.duplicate_in_progress`
- `workflow.duplicate_in_progress`
- `audit_event.immutable`
- `secret_reference.missing`

## 12. Idempotency and Concurrency Review

The contract says the right things, but OpenAPI planning must make them explicit:

- POST create endpoints should accept an idempotency key.
- PUT endpoints should include version or `updatedAt` conflict checks.
- WorkflowRun and AITaskRun creation should prevent duplicate execution for the same input/ref combination.
- PublishingReadiness checks should be repeatable and deterministic.

OpenAPI should represent this with headers or fields, response codes, and the `conflict.version_mismatch` / `idempotency.conflict` errors.

## 13. V1 vs Post-V1 Boundary Review

The V1 boundary is clean. V1 excludes:

- real connector execution
- raw source payload APIs
- normalized signal APIs
- automated social intelligence execution
- scheduled sync
- webhooks
- real publishing integration
- multi-store workspace
- full RBAC enforcement

No major accidental leakage into V1 was found. The only area to watch is `AITaskRun`: it is included in V1 as a contract, but the document must keep clear whether `POST /ai-task-runs` creates a planned task record, starts a real task, or both. For V1 planning, it should be a contract boundary with execution behavior defined later.

## 14. Missing or Risky Areas

| Severity | Issue | Consequence | Recommended fix | Must fix before OpenAPI? |
|---|---|---|---|---|
| High | Derived report resources lack endpoint candidates. | ProductMarketingPriority and AssetGapReport may be omitted or modeled inconsistently in OpenAPI. | Add conceptual endpoints or mark them embedded/read-only under strategic plan. | Yes |
| High | Create/update idempotency and concurrency are principles but not endpoint-level requirements. | OpenAPI may miss headers, conflict responses, and duplicate-run protections. | Add an OpenAPI planning rule for idempotency keys and version checks. | Yes |
| Medium | Status enums are not enumerated for most resources. | OpenAPI schemas may drift across implementation teams. | Define initial enum candidates for plan, campaign, content, review, publishing, provider, route, workflow, and AI task statuses. | Yes |
| Medium | AuditEvent POST semantics are under-specified. | Clients may be allowed to forge audit events if implemented naively. | State that audit event creation is service/system controlled, even if exposed internally. | Yes |
| Medium | DELETE/archive lifecycle is not addressed. | Product/asset/campaign deletion behavior may become inconsistent. | Decide V1 archive-only or no delete. | Yes |
| Low | Pagination/filtering/sorting conventions are absent. | List endpoint OpenAPI will need repeated design decisions. | Add a shared list response convention. | No |
| Low | Prompt list/detail redaction behavior is not explicit. | Sensitive prompt text could be overexposed by list endpoints. | Specify list responses may omit full prompt text. | No |

## 15. Required Adjustments Before OpenAPI

- Decide whether `ProductMarketingPriority` and `AssetGapReport` get explicit endpoints or are embedded/read-only derived sections of StoreStrategicPlan.
- Add shared list conventions: pagination, filters, sort, and empty responses.
- Add status enum candidates for all major resources.
- Add idempotency-key and optimistic concurrency requirements at the planning level.
- Clarify archive/delete behavior for Product, Asset, Campaign, PromptTemplate, ModelProvider, and ModelRoute.
- Clarify AuditEvent write restrictions.
- Clarify AITaskRun POST behavior as task record creation vs execution trigger.
- Add missing error codes: `asset_rights.review_required`, `idempotency.conflict`, `output_schema.validation_failed`, `ai_task.duplicate_in_progress`, `workflow.duplicate_in_progress`, `audit_event.immutable`, and `secret_reference.missing`.

## 16. OpenAPI Planning Readiness

The contract is ready to be converted to `docs/openapi_planning.md`.

It should not go directly to `docs/nashir_v1_openapi.yaml` yet. The current document is complete at the conceptual gate level, but executable OpenAPI needs one more planning pass to lock shared schema conventions, enums, idempotency/concurrency rules, derived report endpoint choices, and archive/delete behavior.

## 17. Final Decision

Conditional GO after small documentation patch.
