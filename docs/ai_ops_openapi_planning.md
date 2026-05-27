# AI Operations OpenAPI Planning Gate

## 1. Executive Decision

OpenAPI planning = GO.

OpenAPI YAML patch = NO-GO.

Backend implementation = NO-GO.

Database/schema/migration = NO-GO.

Generated clients = NO-GO.

Runtime execution = NO-GO.

Current gate = documentation-only PR.

## 2. Purpose

This document plans the future OpenAPI surface for AI Operations before writing or modifying any OpenAPI YAML.

It translates the accepted shared readiness model, backend contract planning, and backend contract review conclusions into future endpoint and schema candidates.

This document does not implement endpoints, runtime behavior, OpenAPI YAML, backend code, database schema, migrations, generated clients, tests, or UI changes.

## 3. Planning Principles

- contract-first
- workspace-scoped endpoints
- no raw secrets
- no raw internal prompts exposed to customers
- secret references only
- immutable audit for sensitive actions
- dry-run before real execution
- human review before publishing or sensitive output
- idempotency for write/transition requests
- RBAC-aware operations
- generated output must be reviewable
- no automatic publishing by default
- OpenAPI must not encode runtime behavior prematurely

## 4. Proposed Endpoint Groups

These are endpoint candidates only. Do not write YAML in this gate.

### A. Provider Readiness

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/providers` | List provider entries and readiness summaries without raw secrets. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/providers/{providerId}` | Read provider capability/readiness metadata. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/providers/{providerId}/test-connection` | Request a future readiness test without exposing secrets. | Deferred unless separately approved |
| GET | `/workspaces/{workspaceId}/ai/providers/{providerId}/readiness` | Read providerReady evaluation. | Candidate for OpenAPI Planning |

### B. Model Registry and Routing

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/models` | List model registry entries and capabilities. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/model-routes` | List task-to-model route policies and route readiness. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/model-routes/{routeId}` | Read a route policy and safe readiness summary. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/model-routes/{routeId}/evaluate-readiness` | Evaluate routeReady without executing a model. | Candidate for OpenAPI Planning |

### C. Prompt Governance

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/prompts` | List prompt templates and readiness summaries. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/prompts/{promptTemplateId}` | Read prompt family metadata without unsafe prompt exposure. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/prompts/{promptTemplateId}/versions/{promptVersionId}` | Read prompt version metadata and governed contract. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/prompts/{promptTemplateId}/readiness` | Read promptReady status. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/prompts/{promptTemplateId}/evaluate-readiness` | Evaluate prompt readiness without executing prompts. | Candidate for OpenAPI Planning |

### D. Cost Policy

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/cost-policies` | List cost policies and readiness summaries. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/cost-policies/{costPolicyId}` | Read cost policy metadata. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/cost-policies/{costPolicyId}/evaluate-readiness` | Evaluate costReady without execution. | Candidate for OpenAPI Planning |

### E. Workflow Definitions and Dry-Run

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/workflows` | List workflow definitions and readiness summaries. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/workflows/{workflowDefinitionId}` | Read workflow trigger, step, input, output, and policy definitions. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/workflows/{workflowDefinitionId}/dry-run` | Evaluate readiness without executing models, prompts, connectors, or publishing. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/workflows/{workflowDefinitionId}/readiness` | Read workflow readiness summary. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/workflows/{workflowDefinitionId}/execute` | Future real execution endpoint. | Deferred / NO-GO until runtime implementation gate |

### F. Workflow Runs Planning

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/workflow-runs` | List dry-run or future run records. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/workflow-runs/{workflowRunId}` | Read run status, readiness, and artifact links. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/workflow-runs/{workflowRunId}/cancel` | Future cancellation transition. | Deferred until workflow run lifecycle is approved |

### G. Readiness Evaluations

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/readiness-evaluations` | List readiness evaluations by signal, scope, or correlationId. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/readiness-evaluations/{readinessEvaluationId}` | Read a readiness evaluation. | Candidate for OpenAPI Planning |

### H. Run Artifacts

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/workflow-runs/{workflowRunId}/artifacts` | List reviewable run artifacts. | Candidate for OpenAPI Planning |
| GET | `/workspaces/{workspaceId}/ai/workflow-runs/{workflowRunId}/artifacts/{artifactId}` | Read a reviewable artifact without exposing secrets/raw prompts. | Candidate for OpenAPI Planning |

### I. Review Decisions

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/review-decisions` | List review decisions for prompts, outputs, or run artifacts. | Candidate for OpenAPI Planning |
| POST | `/workspaces/{workspaceId}/ai/review-decisions` | Record a future review decision. | Deferred until review authority and RBAC are finalized |

### J. Audit Events

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/workspaces/{workspaceId}/ai/audit-events` | Read audit events for AI Operations. | Candidate for OpenAPI Planning |

## 5. Explicit Endpoint Status

Candidate for OpenAPI Planning:

- read/list endpoints
- readiness evaluation endpoints
- dry-run endpoint
- audit event read endpoint
- artifact read endpoint
- prompt/model/provider/route/cost readiness read endpoints

Deferred:

- execute workflow
- connector execution
- publishing
- provider mutation endpoints except test/readiness planning
- secret creation/update endpoints
- workflow run cancellation until lifecycle transitions are finalized
- review decision writes until RBAC and review authority are finalized

NO-GO:

- raw secret value API
- raw internal prompt exposure API
- automatic publishing API
- real model execution endpoint in this planning gate
- billing endpoints
- connector execution endpoints
- generated client endpoints or implementation assumptions

## 6. Core Schema Candidates

Plan these schemas only. Do not write YAML in this gate.

- AiProvider
- AiProviderCredentialRef
- ModelRegistryEntry
- ModelRoutePolicy
- PromptTemplate
- PromptVersion
- PromptUsageLink
- CostPolicy
- WorkflowDefinition
- WorkflowStepDefinition
- WorkflowTrigger
- WorkflowDryRunRequest
- WorkflowDryRunResponse
- WorkflowRun
- WorkflowRunStep
- RunArtifact
- ReadinessEvaluation
- ReviewDecision
- AuditEvent
- DestinationConnectorRef
- ErrorModel extension if needed

## 7. ReadinessEvaluation Schema Planning

Future `ReadinessEvaluation` fields:

- readinessEvaluationId
- workspaceId
- scopeType
- scopeRef
- signal
- status
- severity
- reasonCode
- message
- requiredAction
- ownerSurface
- affectedWorkflow
- affectedStep
- evaluatedAt
- evaluatedBy
- correlationId
- sourceVersionRefs

Allowed status:

- ready
- warning
- blocked
- unknown
- not_applicable

Allowed severity:

- blocker
- warning
- info
- pass

This schema is for future OpenAPI planning and must not be added to YAML in this gate.

## 8. Dry-Run Request/Response Planning

`WorkflowDryRunRequest` should include:

- workspaceId
- workflowDefinitionId
- actor
- triggerContext
- inputContextRefs
- selectedStepIds optional
- dryRunMode
- idempotencyKey

`WorkflowDryRunResponse` should include:

- dryRunId
- readinessSummary
- stepReadiness
- blockers
- warnings
- estimatedCost
- requiredApprovals
- promptSnapshots planned
- routeSnapshots planned
- outputContractSummary
- auditPreview
- correlationId

Dry-run does not execute models, prompts, connectors, or publishing.

## 9. Prompt Snapshot Planning

Future prompt snapshot fields:

- promptTemplateId
- promptVersionId
- promptStatusAtEvaluation
- expectedInputContext
- internalPromptPreviewRef or hash only
- outputContract
- requiredChecks
- blockedPatterns
- usageLink
- modelRouteUsed
- costPolicyUsed
- reviewerPolicyUsed

No raw internal prompt should be customer-visible or exposed without explicit privileged contract.

## 10. RunArtifact Planning

Future artifact types:

- input_context_snapshot
- prompt_snapshot
- model_route_snapshot
- output_contract_snapshot
- generated_output
- review_report
- cost_estimate
- audit_reference
- destination_payload_preview

Artifacts must be workspace-scoped and reviewable.

## 11. Audit Event Planning

Plan these audit event families:

- provider.changed
- provider.secret_reference.changed
- provider.test_requested
- model_registry.changed
- route.changed
- route.fallback.changed
- prompt.changed
- prompt.version.created
- prompt.approved
- prompt.rejected
- cost_policy.changed
- dry_run.evaluated
- workflow.triggered
- workflow.execution_requested
- workflow.cancelled
- review.decision_recorded
- output.sent_to_next_route
- destination.changed
- rbac.denied
- idempotency.conflict

Future `AuditEvent` fields:

- auditEventId
- workspaceId
- actor
- action
- targetType
- targetRef
- beforeSummary
- afterSummary
- severity
- correlationId
- createdAt

## 12. Reason Code Planning

| Reason code | Likely classification |
| --- | --- |
| PROVIDER_SECRET_MISSING | blocker |
| PROVIDER_DISABLED | blocker |
| PROVIDER_HEALTH_STALE | warning |
| MODEL_UNAVAILABLE | blocker |
| ROUTE_MISSING_PRIMARY_MODEL | blocker |
| ROUTE_FALLBACK_INCOMPLETE | warning |
| PROMPT_BLOCKED | blocker |
| PROMPT_TESTING | warning |
| PROMPT_OUTPUT_CONTRACT_MISSING | blocker |
| PROMPT_INPUT_CONTEXT_MISSING | blocker |
| COST_APPROVAL_REQUIRED | blocker |
| COST_FORECAST_HIGH | warning |
| REVIEW_POLICY_MISSING | blocker |
| DESTINATION_NOT_CONNECTED | blocker |
| TRIGGER_MISSING | blocker |
| INPUT_CONTEXT_MISSING | blocker |
| OUTPUT_DESTINATION_MISSING | blocker |
| AUDIT_UNAVAILABLE | blocker |
| RBAC_DENIED | blocker |
| IDEMPOTENCY_CONFLICT | warning |

Reason code enum values should be finalized before executable OpenAPI YAML.

## 13. Security/Privacy Rules for OpenAPI

- No raw API keys in request/response bodies.
- No raw secret values returned.
- Secret references only.
- No customer-visible raw internal prompts.
- Logs and audit previews must not expose secrets or internal prompts.
- Workspace isolation required.
- RBAC required for provider, prompt, route, cost, and review actions.
- Idempotency required for write/transition operations.
- Sensitive APIs must produce audit events.

## 14. Error Model Planning

Plan common error cases:

- 400 invalid input context
- 401 unauthenticated
- 403 RBAC denied
- 404 workspace/resource not found
- 409 idempotency conflict
- 422 readiness blocked
- 429 provider/cost/rate limit
- 500 internal error

Do not modify ErrorModel YAML in this gate.

## 15. OpenAPI Slice Recommendation

Recommended next gate:

AI Operations OpenAPI Slice 1 Planning Gate.

Recommended Slice 1 scope should be read-only and dry-run only:

- read/list provider readiness
- read/list model routes
- read/list prompt readiness
- dry-run workflow readiness evaluation
- read readiness evaluations
- read audit events

Explicitly exclude:

- workflow execution
- provider mutation except test readiness if separately approved
- secret mutation
- publishing
- connector execution
- billing
- generated clients

## 16. Risk Classification

| Risk | Classification | Decision |
| --- | --- | --- |
| Backend contract review completed | Resolved | AI Operations Backend Contract Review Gate is GO with conditions. |
| Shared readiness model documented | Resolved | Canonical readiness signals and ownership are defined. |
| Prompt input/output contract ambiguity resolved | Resolved | Prompt governance distinguishes expected input context and output contract. |
| Workflow trigger/readiness concepts documented | Resolved | Workflow trigger, dry-run, and readiness concepts are documented. |
| OpenAPI blocker | N/A | None identified. |
| Final endpoint names | Should fix before OpenAPI YAML | Freeze endpoint paths during Slice 1 Planning and Review. |
| Final schema names | Should fix before OpenAPI YAML | Freeze schema group names before YAML. |
| Final reason code enum values | Should fix before OpenAPI YAML | Confirm enum casing and membership. |
| Final dry-run request/response fields | Should fix before OpenAPI YAML | Validate field names and required/optional split. |
| Final audit event names | Should fix before OpenAPI YAML | Freeze event family enum values. |
| ErrorModel alignment | Should fix before OpenAPI YAML | Align with existing common ErrorModel strategy. |
| Pagination conventions | Should fix before OpenAPI YAML | Apply existing cursor pagination where list endpoints are used. |
| Auth/RBAC response conventions | Should fix before OpenAPI YAML | Align 401/403 behavior with broader API contract. |
| Workflow execution API | Can defer | Runtime execution is NO-GO. |
| Connector execution API | Can defer | Connector execution is NO-GO. |
| Publishing API | Can defer | Publishing is NO-GO. |
| Billing API | Can defer | Billing is out of V1 scope. |
| Visual node graph | Can defer | UI enhancement only. |
| Real-time streaming | Can defer | Requires runtime event transport. |
| Generated clients | Can defer | Not before executable OpenAPI acceptance. |

## 17. Final Decision

AI Operations OpenAPI Planning Gate = GO if accepted.

OpenAPI YAML patch = NO-GO until Slice 1 Planning Gate and Review Gate.

Backend implementation = NO-GO.
