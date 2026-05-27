# AI Operations Backend Contract Review Gate

## 1. Executive Decision

Decision: GO with conditions.

The AI Operations Backend Contract Planning document is sufficient to proceed to the AI Operations OpenAPI Planning Gate.

The conditions are documentation/planning conditions for the next gate, not blockers for starting OpenAPI planning:

- stabilize final reason code naming before any executable OpenAPI YAML.
- keep readiness schema fields consistent with the shared readiness model.
- convert dry-run, prompt snapshot, run artifact, and audit concepts into explicit schema groups during OpenAPI planning.
- keep backend implementation, database work, runtime execution, and generated clients as NO-GO.

## 2. Review Scope

This review covers:

- readiness schema planning
- backend object planning
- dry-run contract planning
- workflow execution boundary
- prompt snapshot contract
- run artifact planning
- audit event planning
- security/privacy constraints
- backend blockers
- OpenAPI readiness

## 3. What Is Accepted

The following areas are sufficiently defined in `docs/ai_ops_backend_contract_planning.md` for OpenAPI planning:

| Area | Review result |
| --- | --- |
| ReadinessEvaluation planning | Accepted. Fields include workspace, scope, signal, status, severity, reasonCode, action, owner, affected workflow/step, correlationId, evaluation metadata, and sourceVersionRefs. |
| Reason code families | Accepted for planning. Provider, route, prompt, cost, review, destination, trigger, input, output, audit, and RBAC reason codes are represented. |
| Canonical backend objects | Accepted. Provider, credentials, model registry, route policy, prompt template/version, usage links, cost policy, workflow definitions, runs, artifacts, readiness, review, audit, and destination refs are identified. |
| Dry-run request/response concept | Accepted. Request includes workspace, workflow definition, trigger context, input refs, selected steps, mode, idempotency key, and actor. Response includes readiness, blockers, warnings, cost, approvals, snapshots, output contract summary, and audit preview. |
| Prompt snapshot requirement | Accepted. Includes promptTemplateId, promptVersionId, status, expected input context, safe prompt reference/hash, output contract, required checks, blocked patterns, usage link, route, cost policy, and reviewer policy. |
| RunArtifact planning | Accepted. Artifact families are named and scoped to reviewable, workspace-scoped records. |
| Audit event families | Accepted for planning. Sensitive provider, route, prompt, cost, dry-run, workflow, review, destination, RBAC, and idempotency events are covered. |
| Security/privacy constraints | Accepted. No raw secrets, no raw customer-visible internal prompts, redaction, RBAC, audit, safe logs, and workspace isolation are clear. |
| Backend blockers | Accepted. Auth, RBAC, secret vault, immutable audit, registry persistence, dry-run evaluator, artifacts, validation, review persistence, idempotency, and concurrency are identified. |
| Explicit NO-GO boundaries | Accepted. OpenAPI YAML, DB schema, migrations, generated clients, backend implementation, model execution, prompt execution, provider calls, connectors, publishing, billing, AI Gateway Overview, and Slice 3 remain out of scope. |

## 4. Gaps Before OpenAPI

| Question | Review answer | Impact |
| --- | --- | --- |
| Are reason codes stable enough for OpenAPI planning? | Yes for planning, not yet final for executable YAML. Naming is coherent but should be frozen in the next gate. | Should fix before OpenAPI YAML. |
| Are readiness statuses and severities stable enough? | Yes. `ready`, `warning`, `blocked`, `unknown`, `not_applicable` and `blocker`, `warning`, `info`, `pass` are stable enough. | No blocker. |
| Are object references clear enough? | Mostly yes. Future schemas should standardize `scopeRef`, `sourceVersionRefs`, workflow refs, step refs, prompt refs, route refs, and artifact refs. | Should fix during OpenAPI planning. |
| Is dry-run request/response defined enough? | Yes for planning. It needs schema names and envelope decisions in the next gate. | No blocker. |
| Are audit events named consistently? | Mostly yes. Event families use dotted names consistently, but target type/reference naming should be finalized. | Should fix before OpenAPI YAML. |
| Are prompt snapshots sufficiently specified? | Yes. The recent `promptTemplateId` and `promptVersionId` additions make traceability adequate for planning. | No blocker. |
| Are run lifecycle states sufficient? | Sufficient from the shared readiness model. The backend contract planning doc references execution boundary but should carry lifecycle states forward explicitly in OpenAPI planning. | Should fix during OpenAPI planning. |
| Are RBAC/security constraints clear enough? | Yes for planning. Implementation-level role/action matrices are still future work. | No blocker. |
| Are workspace boundaries clear? | Yes. Contract principles and object references are workspace-scoped. | No blocker. |
| Are no-secret/no-raw-prompt constraints clear? | Yes. They appear in principles, object warnings, prompt snapshot, artifacts, audit, and security sections. | No blocker. |

## 5. Risk Classification

| Risk | Classification | Review decision |
| --- | --- | --- |
| Settings ownership overlap | Resolved | Closed by Settings ownership cleanup and external review reconciliation. |
| Prompt input/output contract ambiguity | Resolved | Prompt governance now distinguishes expected inputs, hidden prompt preview, output contract, required checks, blocked patterns, and usage links. |
| Workflow input single-source limitation | Resolved | WorkflowRunsPage supports multi-source inputs. |
| Missing trigger explanation | Resolved | Workflow trigger model is documented and reflected in the UI prototype. |
| Shared readiness model documented | Resolved | Shared readiness planning document defines canonical signals and ownership. |
| Backend contract planning merged | Resolved | Planning document exists and includes review-remediation fields such as `correlationId`, `actor`, `promptTemplateId`, and `promptVersionId`. |
| OpenAPI blocker | N/A | None identified. |
| Reason code naming may drift | Should fix before OpenAPI | Freeze reason code enum names during AI Operations OpenAPI Planning. |
| Reference naming ambiguity | Should fix before OpenAPI | Standardize `scopeRef`, workflow/step refs, prompt refs, route refs, policy refs, and artifact refs. |
| Dry-run object names need finalization | Should fix before OpenAPI | Choose canonical schema names such as `WorkflowDryRunRequest`, `WorkflowDryRunResponse`, and `ReadinessSummary`. |
| Audit event families are broad | Should fix before OpenAPI | Keep broad families, but define enum values and target reference fields clearly. |
| Prompt snapshot fields need schema grouping | Should fix before OpenAPI | Convert planning fields into `PromptSnapshot`, `ModelRouteSnapshot`, and `OutputContractSnapshot` concepts. |
| Real backend implementation | Can defer | Explicitly out of scope. |
| DB schema | Can defer | Separate future gate. |
| Migrations | Can defer | Separate future gate. |
| Generated clients | Can defer | Not before executable OpenAPI acceptance. |
| Real model execution | Can defer | Requires runtime and provider contracts. |
| Real workflow execution | Can defer | Requires workflow engine, dry-run evaluator, artifacts, audit, RBAC, and idempotency. |
| Billing | Can defer | Post-V1. |
| AI Gateway Overview | Can defer | Not approved for V1. |
| Advanced visual workflow graph | Can defer | UI enhancement, not backend contract prerequisite. |
| Real-time run streaming | Can defer | Requires runtime event transport. |

## 6. OpenAPI Planning Recommendation

Recommended next gate:

AI Operations OpenAPI Planning Gate.

The next gate must remain documentation-only and should plan endpoints and schemas before YAML. It should not patch `docs/nashir_v1_openapi.yaml`.

The OpenAPI Planning Gate should produce:

- proposed resource groups for providers, model registry, routes, prompts, cost policies, workflow definitions, dry-runs, readiness evaluations, run artifacts, review decisions, and audit events.
- schema naming decisions for readiness, reason codes, snapshots, dry-run request/response, artifacts, lifecycle states, and audit events.
- route boundary decisions using workspace scoping.
- idempotency and concurrency rules for write/transition operations.
- explicit exclusions for runtime execution, provider calls, connector execution, publishing, billing, and generated clients.

## 7. Explicit NO-GO

This review gate does not approve:

- OpenAPI YAML patch
- backend implementation
- database schema
- migrations
- generated clients
- runtime behavior
- UI changes
- real workflow execution
- real AI/model calls
- real prompt execution
- connector execution
- publishing
- billing
- AI Gateway Overview
- Slice 3

## 8. Final Decision

The project may proceed to AI Operations OpenAPI Planning Gate.

Decision: GO with conditions.

Conditions must be handled in the OpenAPI Planning Gate before any executable OpenAPI YAML or backend implementation begins.
