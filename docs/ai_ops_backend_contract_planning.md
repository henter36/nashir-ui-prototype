# AI Operations Backend Contract Planning Gate

## 1. Executive Decision

Contract planning = GO.

Backend implementation = NO-GO.

OpenAPI YAML patch = NO-GO in this gate.

Database/schema/migration = NO-GO.

Runtime execution = NO-GO.

Current gate = documentation-only PR.

## 2. Purpose

This document converts the shared AI Operations readiness model into backend contract planning requirements before any implementation.

The current repository remains a React/Vite UI prototype only. There is no backend, API, database, auth, real AI execution, real prompt execution, workflow engine, provider execution, connector execution, generated client, migration, or runtime scheduler.

## 3. Contract Principles

- contract-first
- workspace-scoped
- no raw secrets in API responses
- secret references only
- immutable audit for sensitive actions
- idempotent write/transition operations
- versioned prompts/routes/policies
- dry-run before execution
- human review before publishing or sensitive output
- no automatic publishing by default
- generated output must be reviewable
- cost and policy checks must be evaluated before execution

## 4. Canonical Backend Objects to Plan

| Object | Purpose | Owner screen today | Key references | Sensitive fields warning | Backend status |
| --- | --- | --- | --- | --- | --- |
| AiProvider | Represents an AI provider entry and supported capabilities. | SecretsAndKeysPage | workspaceId, provider credential ref, capabilities | Must never expose raw credentials. | planning only |
| AiProviderCredentialRef | Stores a reference to a provider secret managed in a vault. | SecretsAndKeysPage | workspaceId, providerId, secretRef | Secret value is never returned. | planning only |
| ModelRegistryEntry | Catalogs available models/capabilities per provider. | SecretsAndKeysPage / ModelRoutingPage | providerId, capability, status | Provider health may be sensitive operational metadata. | planning only |
| ModelRoutePolicy | Defines task-to-model routing, primary/fallback models, and route policy. | ModelRoutingPage | workspaceId, taskType, model refs, cost policy | Route policy changes require audit. | planning only |
| PromptTemplate | Defines prompt family, task, owner, governance state, and usage intent. | PromptGovernancePage | workspaceId, taskType, owner | Customer-visible output must not expose raw internal prompt text. | planning only |
| PromptVersion | Immutable version of prompt content and governance contract. | PromptGovernancePage | promptTemplateId, version, status | Raw prompt content must be protected and audited. | planning only |
| PromptUsageLink | Connects prompt version to workflow, step, task, and output route. | PromptGovernancePage / WorkflowRunsPage | promptVersionId, workflowDefinitionId, stepRef | Must not imply prompt execution. | planning only |
| CostPolicy | Defines cost caps, approval thresholds, and forecast guardrails. | CostMonitorPage | workspaceId, route policy, taskType | Cost approval changes require audit. | planning only |
| WorkflowDefinition | Defines workflow route, trigger, steps, input/output contracts, and policies. | WorkflowRunsPage | workspaceId, trigger, step definitions | Does not execute by itself. | planning only |
| WorkflowStepDefinition | Defines a workflow step input refs, processor intent, output contract, and next-route rules. | WorkflowRunsPage | workflowDefinitionId, prompt usage, route policy | Step policy must not expose hidden prompt internals. | planning only |
| WorkflowTrigger | Defines trigger type, event source, start condition, and permission requirements. | WorkflowRunsPage | workflowDefinitionId, event source, trigger context | Trigger registration requires audit and RBAC. | planning only |
| WorkflowRun | Represents a dry-run or future execution request state. | WorkflowRunsPage | workflowDefinitionId, actor, trigger context | Runtime execution remains out of scope here. | planning only |
| WorkflowRunStep | Represents per-step readiness/result state for a run. | WorkflowRunsPage | workflowRunId, stepDefinitionId | Must snapshot route/prompt context later. | planning only |
| RunArtifact | Stores reviewable snapshots and generated/review artifacts. | WorkflowRunsPage / Review surfaces | workflowRunId, stepRef, artifactType | Artifacts must avoid prompt/secret leakage. | planning only |
| ReadinessEvaluation | Captures readiness signal results, blockers, warnings, and actions. | Shared across AI Ops | workspaceId, signal, scopeRef | May contain operational risk details. | planning only |
| ReviewDecision | Records human review decisions for prompts, outputs, or run results. | ContentReviewPreviewUnifiedPage / PromptGovernancePage | actor, output/run/prompt refs | Must be auditable. | planning only |
| AuditEvent | Immutable audit record for sensitive actions and run transitions. | SystemAdminPage / backend audit | actor, workspaceId, target refs | Append-only; avoid secrets/raw prompt leakage. | planning only |
| DestinationConnectorRef | References output destination readiness or connector state. | DataSourcesHubPage / destination screens | workspaceId, connector/destination ref | Connector credentials remain secret references only. | planning only |

## 5. ReadinessEvaluation Contract Planning

Future readiness evaluation object fields:

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

This is contract planning only and must not be added to OpenAPI in this gate.

## 6. Reason Code Planning

| Reason code | Typical severity | Example classification |
| --- | --- | --- |
| PROVIDER_SECRET_MISSING | blocker | Provider has no vault secret reference. |
| PROVIDER_DISABLED | blocker | Provider is disabled for the workspace. |
| PROVIDER_HEALTH_STALE | warning | Last provider health check is stale. |
| MODEL_UNAVAILABLE | blocker | Selected primary model is unavailable. |
| ROUTE_MISSING_PRIMARY_MODEL | blocker | Route has no primary model. |
| ROUTE_FALLBACK_INCOMPLETE | warning | Primary exists but fallback chain is incomplete. |
| PROMPT_BLOCKED | blocker | Prompt is blocked by governance. |
| PROMPT_TESTING | warning | Prompt is still in testing. |
| PROMPT_OUTPUT_CONTRACT_MISSING | blocker | Prompt has no expected/allowed output contract. |
| PROMPT_INPUT_CONTEXT_MISSING | blocker | Prompt has no expected input context. |
| COST_APPROVAL_REQUIRED | blocker | Forecasted or actual cost needs approval. |
| COST_FORECAST_HIGH | warning | Forecasted cost is high but not blocked. |
| REVIEW_POLICY_MISSING | blocker | Human review is required but reviewer policy is missing. |
| DESTINATION_NOT_CONNECTED | blocker | Output destination is required but unavailable. |
| TRIGGER_MISSING | blocker | Non-manual workflow has no trigger. |
| INPUT_CONTEXT_MISSING | blocker | Workflow step input context is missing. |
| OUTPUT_DESTINATION_MISSING | blocker | Step output has no destination. |
| AUDIT_UNAVAILABLE | blocker | Sensitive action cannot be audited. |
| RBAC_DENIED | blocker | Actor lacks permission for the requested action. |

Informational examples:

- route has no recent run history
- optional review notes are empty
- destination supports output but has no recent sync
- prompt usage links are present but not used by recent runs

## 7. Reference Model

- providerReady is owned by provider/secret reference records.
- routeReady references provider/model registry and route policy.
- promptReady references prompt version and output contract.
- costReady references route/cost policy.
- reviewReady references global review policy and reviewer availability.
- destinationReady references connector/destination readiness.
- workflow run references immutable snapshots, not mutable live records only.

## 8. Workflow Dry-Run Contract Planning

Future dry-run request should include:

- workspaceId
- workflowDefinitionId
- triggerContext
- inputContextRefs
- selectedStepIds optional
- dryRunMode
- idempotencyKey

Future dry-run response should include:

- runIntentId or dryRunId
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

Dry-run does not execute models, connectors, publishing, or prompts.

## 9. Workflow Execution Contract Boundary

Real execution is out of scope.

Future execution must require:

- dry-run passed or explicit override policy
- providerReady
- routeReady
- promptReady
- costReady
- reviewReady where required
- destinationReady where output is sent
- auditReady
- RBAC permission
- idempotency key
- concurrency guard

## 10. Prompt Snapshot Contract

Each future real run must snapshot:

- promptVersionId
- prompt status at execution time
- expected input context
- internal prompt preview hash or safe reference, not raw exposure
- output contract
- required checks
- blocked patterns
- usage link
- model route used
- cost policy used
- reviewer policy used

## 11. RunArtifact Contract Planning

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

Artifacts must be reviewable and workspace-scoped.

## 12. Audit Event Contract Planning

Audit event categories:

| Event family | Actor | Workspace | Target type | Target reference | Before/after summary | Timestamp | Severity | Correlation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| provider.changed | user/service/system | required | provider | required | required | required | info/warning | correlationId |
| provider.secret_reference.changed | user/service/system | required | provider credential ref | required | required, no secret values | required | warning | correlationId |
| provider.test_requested | user/service/system | required | provider | required | optional | required | info | correlationId |
| model_registry.changed | user/service/system | required | model registry entry | required | required | required | info/warning | correlationId |
| route.changed | user/service/system | required | route policy | required | required | required | warning | correlationId |
| route.fallback.changed | user/service/system | required | route policy | required | required | required | info/warning | correlationId |
| prompt.changed | user/service/system | required | prompt template/version | required | required, redacted | required | warning | correlationId |
| prompt.version.created | user/service/system | required | prompt version | required | required, redacted | required | info | correlationId |
| prompt.approved | user/service/system | required | prompt version | required | required | required | warning | correlationId |
| prompt.rejected | user/service/system | required | prompt version | required | required | required | warning | correlationId |
| cost_policy.changed | user/service/system | required | cost policy | required | required | required | warning | correlationId |
| dry_run.evaluated | user/service/system | required | workflow dry-run | required | summary required | required | info/warning | correlationId |
| workflow.triggered | user/service/system | required | workflow definition/run | required | trigger context summary | required | info/warning | correlationId |
| workflow.execution_requested | user/service/system | required | workflow run | required | readiness summary | required | warning | correlationId |
| workflow.cancelled | user/service/system | required | workflow run | required | required | required | warning | correlationId |
| review.decision_recorded | user/service/system | required | review decision | required | required | required | warning | correlationId |
| output.sent_to_next_route | user/service/system | required | run artifact/output | required | summary required | required | warning | correlationId |
| destination.changed | user/service/system | required | destination connector ref | required | required | required | warning | correlationId |
| rbac.denied | user/service/system | required | requested action | required | reason summary | required | blocker | correlationId |
| idempotency.conflict | user/service/system | required | operation | required | conflict summary | required | warning | correlationId |

## 13. Security and Privacy Constraints

- no raw API keys
- no raw secret values
- no customer-visible raw internal prompts
- no hidden chain/policy exposure
- no connector payload exposure without redaction
- RBAC required for provider/prompt/route/cost changes
- audit required for sensitive changes
- logs must avoid prompt/secret leakage
- workspace isolation is mandatory

## 14. Backend Blockers

Hard blockers before implementation:

- Auth/workspace scoping
- RBAC
- secret vault
- immutable audit log
- provider registry persistence
- model registry persistence
- route policy persistence
- prompt version persistence
- cost policy persistence
- dry-run evaluator
- run artifact persistence
- output contract validation
- review decision persistence
- idempotency/concurrency support

## 15. Explicitly Out of Scope

- OpenAPI YAML patch
- DB schema
- migrations
- generated clients
- backend implementation
- real model execution
- real prompt execution
- real provider calls
- real connector execution
- publishing
- billing
- AI Gateway Overview
- Slice 3

## 16. Risk Classification

| Risk | Classification | Notes |
| --- | --- | --- |
| Settings ownership overlap | Resolved | Settings is no longer AI Ops authority. |
| Prompt input/output contract ambiguity | Resolved | PromptGovernancePage now distinguishes expected inputs, hidden prompt preview, and output contract. |
| Workflow input single-source limitation | Resolved | WorkflowRunsPage supports multi-source inputs. |
| Missing workflow trigger explanation | Resolved | WorkflowRunsPage shows trigger type, event source, and start condition. |
| Shared readiness model documented | Resolved | Shared readiness planning document exists. |
| Backend contract not yet formalized in OpenAPI | Backend blocker | This planning doc must be reviewed before OpenAPI. |
| Secret vault missing | Backend blocker | Required for provider readiness. |
| RBAC missing | Backend blocker | Required for sensitive operations. |
| immutable audit missing | Backend blocker | Required before runtime actions. |
| dry-run evaluator missing | Backend blocker | Required before execution planning. |
| run artifact model missing | Backend blocker | Required before durable run records. |
| finalize reason codes | Should fix before OpenAPI patch | Needed for stable errors and readiness mapping. |
| finalize readiness schema | Should fix before OpenAPI patch | Needed before executable contract. |
| finalize audit event names | Should fix before OpenAPI patch | Needed for audit contract. |
| finalize run lifecycle states | Should fix before OpenAPI patch | Needed before workflow API. |
| finalize prompt snapshot fields | Should fix before OpenAPI patch | Needed for execution safety. |
| finalize workflow dry-run request/response | Should fix before OpenAPI patch | Needed for dry-run API planning. |
| real-time streaming | Can defer | Requires runtime event transport. |
| visual node graph | Can defer | UI enhancement, not backend contract prerequisite. |
| advanced scheduler | Can defer | Depends on trigger engine design. |
| billing | Can defer | Out of V1 scope. |
| AI Gateway Overview | Can defer | Not approved for V1. |
| advanced retry/backoff UI | Can defer | Requires workflow engine behavior. |

## 17. Recommended Next Gate

Recommended next gate:

AI Operations Backend Contract Review Gate

Purpose:

- review this planning document before OpenAPI or implementation.

Then, only after review:

AI Operations OpenAPI Planning Gate

Do NOT recommend:

- implementation
- migrations
- generated clients
- Slice 3
- UI feature expansion

## 18. Final Decision

Backend contract planning document = GO if accepted.

Backend implementation = NO-GO.

OpenAPI patch = NO-GO until contract review gate.
