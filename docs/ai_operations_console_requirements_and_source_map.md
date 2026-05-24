# AI Operations Console Requirements and Source Map

## Executive decision

Decision: ready with conditions.

Direct UI work is GO only for later UI-only gates that clarify existing screens and do not introduce execution behavior. Implementation work is NO-GO until source ownership, shared readiness contracts, and cross-screen reflection rules are formalized.

The current prototype is strong enough to define future AI operations requirements. It is not ready to be treated as an executable AI operations system because provider readiness, route health, prompt usage, cost approval, and workflow step readiness are not yet connected through a single AI operations readiness model.

## Current findings from code inspection

### Existing strengths

- `SystemAdminPage` already represents workspace/system administration, feature flags, admin audit, platform health, integrations, and AI provider monitoring at a policy level.
- `SecretsAndKeysPage` defines provider presets, secret references, auth type, base URL, model capability fields, webhook metadata, connection test status, rotation status, and provider governance without storing raw keys.
- `ModelRoutingPage` owns model registry and task routing concepts, including task type, primary model, fallback models, retry policy, timeout, route cost policy, human review, route usage links, and test-routing logs. It also derives cost rows for `CostMonitorPage`.
- `PromptGovernancePage` owns prompt registry and governance concepts: prompt name, version, owner, task, status, review requirement, required checks, blocked patterns, allowed outputs, and workflow usage links.
- `CostMonitorPage` reads model routes and model registry through `modelCostStore`, derives route cost rows, and owns cost thresholds, forecast, approval limits, auto-throttle state, and warnings.
- `WorkflowRunsPage` already contains the strongest future execution representation: templates, input sources, workflow steps, processor types, model route summaries, output contracts, destinations, visibility, review requirements, next workflow links, run monitor, action log, and test-run validation.

### Gaps

- `SecretsAndKeysPage` is local-only state today. Provider readiness is not persisted or reflected into `ModelRoutingPage` or `WorkflowRunsPage`.
- `SystemAdminPage` feature flags are local UI state and do not currently reflect into route health, publishing readiness, or workflow output gates.
- `ModelRoutingPage` does not read provider readiness from `SecretsAndKeysPage`; route health is implied from route/model state and cost policy, not provider configuration.
- `PromptGovernancePage` stores usage links, but `WorkflowRunsPage` does not read prompt readiness from that registry.
- `CostMonitorPage` reflects model routes, but workflow run blocking/approval is not yet driven by cost rows.
- `WorkflowRunsPage` has local catalogs for route summaries and templates. These are acceptable for requirements representation but must not become independent truth for model registry, prompt registry, cost policy, or secret readiness.
- Several pages use prototype-only wording and local/mock actions. That is acceptable for UI prototype gates, but later implementation docs must distinguish target behavior from current non-executing state.

### Duplicated or implied ownership

- Provider readiness appears in `SecretsAndKeysPage` and is implied in `SystemAdminPage` AI provider monitoring, but ownership should remain with `SecretsAndKeysPage`.
- Model and route data appears in `ModelRoutingPage`, `CostMonitorPage`, and `WorkflowRunsPage`; ownership should remain with `ModelRoutingPage`, with cost thresholds owned by `CostMonitorPage` and route readiness displayed by `WorkflowRunsPage`.
- Prompt usage is owned by `PromptGovernancePage`, while `WorkflowRunsPage` currently displays prompt/template-like step requirements locally. Later gates must turn this into read-only reflection, not duplicate prompt ownership.
- Workflow templates and run artifacts are currently local in `WorkflowRunsPage`. That is acceptable for the prototype, but future implementation must make clear that run artifacts are produced by workflow execution and governed by prompt, route, cost, and review gates.

## Cross-screen source map

| Screen | Owns | Reads from | Writes to | Must reflect in | Must not own |
|---|---|---|---|---|---|
| `SystemAdminPage` | Workspace/system admin policies, feature flags, admin audit, global AI operations guardrails | Team/access store, later AI ops readiness summary | Admin audit and policy flag changes | `ModelRoutingPage`, `PromptGovernancePage`, `CostMonitorPage`, `WorkflowRunsPage`, publishing readiness | Model routes, provider secrets, prompt registry, run artifacts, cost rows |
| `SecretsAndKeysPage` | AI provider configuration, secret references, auth metadata, provider capabilities, test/rotation readiness | Future secure secret manager status, provider catalog presets | Provider readiness records and secret reference metadata only | `ModelRoutingPage`, `WorkflowRunsPage`, `SystemAdminPage` summary | Raw secret values, model routes, prompt definitions, cost policy, workflow artifacts |
| `ModelRoutingPage` | Model registry entries and task routes | Provider readiness from `SecretsAndKeysPage`, cost rows for sync, prompt task taxonomy if shared later | Model registry, model routes, derived route-cost rows | `CostMonitorPage`, `WorkflowRunsPage`, `SystemAdminPage` health summary | Secret values, prompt registry ownership, cost usage truth, workflow run artifacts |
| `PromptGovernancePage` | Prompt registry, versions, review status, required checks, blocked patterns, usage links | Workflow step catalog for usage linking, admin policy flags | Prompt registry entries and prompt-to-step usage links | `WorkflowRunsPage`, `SystemAdminPage` governance summary | Workflow builder, model routes, provider readiness, cost rows, run artifacts |
| `CostMonitorPage` | Cost rows, budget thresholds, forecast, approvals, auto-throttle policy by task/route/model | Model routes and model registry from `ModelRoutingPage` | Cost thresholds, cost row status, approval policy | `ModelRoutingPage`, `WorkflowRunsPage`, `SystemAdminPage` cost risk summary | Model registry, secrets, prompts, workflow execution artifacts |
| `WorkflowRunsPage` | Workflow requirements representation, chain-step display, run monitor UI, output contracts, readiness/test-run behavior | System policies, provider readiness, model routes, prompt registry, cost rows, asset/review readiness | Scheduling/run UI state, action log, future run artifacts after execution exists | Review queue, publishing queue, asset library, analytics, admin audit | Model registry, prompt registry, provider secrets, cost thresholds, global policy flags |

## Required AI operations concepts

| Concept | Minimum meaning | Owning screen |
|---|---|---|
| AI Provider | A configured provider endpoint and capability profile. | `SecretsAndKeysPage` |
| Secret Reference | A symbolic reference such as `OPENAI_API_KEY`; never a raw key value. | `SecretsAndKeysPage` |
| Model Registry Entry | A model identifier, provider, status, capabilities, quality/speed/cost tier, and governance flags. | `ModelRoutingPage` |
| Model Route | A task route with primary model, fallback models, retry, timeout, cost, human review, external tools, and health. | `ModelRoutingPage` |
| Prompt Registry Entry | A named and versioned prompt with owner, task, status, required checks, blocked patterns, allowed outputs, and usage links. | `PromptGovernancePage` |
| Prompt Chain Step | A workflow step that consumes inputs, applies prompt/model/tool/policy processing, emits an artifact, and may feed the next step. | `WorkflowRunsPage` |
| Run Artifact | A produced output from a workflow step with provenance, destination, visibility, review status, and consumers. | `WorkflowRunsPage` after execution exists |
| Route Health | Combined readiness of provider, secret, model, prompt, cost, policy, review, destination, asset rights, and external tool settings. | Derived/readiness model, displayed in `ModelRoutingPage` and `WorkflowRunsPage` |
| Cost Policy | Monthly budget, max cost per run, approval above threshold, forecast, throttling, and high-cost warnings. | `CostMonitorPage` |
| Review Gate | A required human or governance review before customer-visible output, publishing, or continuation. | `WorkflowRunsPage`, informed by System/Admin/Prompt/Route/Cost |
| Output Destination | The target surface for an artifact, such as review, content studio, asset library, publishing queue, analytics, or audit log. | `WorkflowRunsPage` contract, destination screen owns final object |

## Chain step contract

Minimum future shape:

```js
{
  stepId: "string",
  stepName: "string",
  inputArtifactIds: ["string"],
  inputSource: "store_url | campaign_brief | previous_step_output | approved_assets | manual_input | ...",
  promptId: "string",
  promptVersion: "string",
  modelRouteId: "string",
  processorType: "model_call | tool_call | policy_check | cost_check | asset_check | human_review | data_transform",
  outputArtifactType: "content_draft | risk_report | generated_asset | campaign_strategy | internal_prompt | ...",
  outputDestination: "content_studio | review | asset_library | publishing_queue | analytics | workflow_runs | ...",
  visibility: "customer_visible | internal_only | reviewer_only | admin_only",
  reviewRequired: true,
  costEstimate: 0,
  nextStepId: "string",
  nextWorkflowType: "campaign_generation | content_generation | risk_review | publishing | analytics_recommendation | ...",
  status: "ready | blocked | running | waiting_for_review | completed | failed",
  blockedReasons: ["string"]
}
```

Rules:

- `promptId` and `promptVersion` must reference `PromptGovernancePage` ownership when the processor uses a prompt.
- `modelRouteId` must reference `ModelRoutingPage` ownership when the processor calls a model.
- `costEstimate` must be evaluated against `CostMonitorPage` policy before run continuation.
- `visibility: "customer_visible"` must force `reviewRequired: true` unless an explicit reviewed exception exists.
- `nextWorkflowType` must not be triggered by an unreviewed artifact unless policy explicitly allows it.

## Artifact contract

Minimum future shape:

```js
{
  artifactId: "string",
  artifactType: "content_draft | risk_report | generated_asset | campaign_strategy | internal_prompt | customer_visible_brief | ...",
  sourceWorkflowId: "string",
  sourceStepId: "string",
  sourcePromptId: "string",
  sourceModelRouteId: "string",
  contentSummary: "string",
  destination: "content_studio | review | asset_library | publishing_queue | analytics | workflow_runs | ...",
  visibility: "customer_visible | internal_only | reviewer_only | admin_only",
  reviewStatus: "not_required | pending | approved | rejected | blocked",
  createdAt: "ISO-8601 timestamp",
  consumedByStepIds: ["string"]
}
```

Rules:

- Artifacts must carry provenance from workflow, step, prompt, and model route.
- Customer-visible artifacts must never expose hidden prompts, model-routing internals, secret references, or raw tool traces.
- Internal-only artifacts can feed later steps, but review policy decides whether they can feed a customer-visible output.
- Generated assets must be checked against asset rights before publishing or reuse.

## Route health formula

Route health should be derived from these inputs:

| Input | Source | Pass condition |
|---|---|---|
| `providerConfigured` | `SecretsAndKeysPage` | Provider exists and is enabled for the route's model provider. |
| `secretAvailable` | `SecretsAndKeysPage` | Secret reference exists, is not disabled, and last test is passing or acceptable. |
| `modelActive` | `ModelRoutingPage` | Primary model is active; fallback exists when required. |
| `promptApproved` | `PromptGovernancePage` | Required prompt version is active/approved and passes required checks. |
| `costWithinLimit` | `CostMonitorPage` | Estimate and forecast are within budget or approval is present. |
| `humanReviewSatisfied` | `WorkflowRunsPage` / review workflow | Required review is complete before continuation or publishing. |
| `outputDestinationAllowed` | System policy and destination screen | Destination is enabled and compatible with artifact visibility. |
| `assetRightsSatisfied` | Asset library / review readiness | Asset rights are allowed or explicitly approved. |
| `externalToolsAllowed` | `SystemAdminPage` and route policy | Global flag and route allow external tools where needed. |

Suggested score:

- Start at 100.
- Subtract 25 for missing provider or secret.
- Subtract 20 for inactive primary model without fallback.
- Subtract 20 for draft/blocked prompt.
- Subtract 15 for cost forecast over limit.
- Subtract 15 for unsatisfied human review.
- Subtract 10 for destination, asset rights, or external-tool warnings.

Suggested status:

- `ready`: score 85-100 and no blocking condition.
- `warning`: score 60-84 or recoverable missing review/approval.
- `blocked`: score below 60, missing secret/provider, inactive model without fallback, blocked prompt, or disallowed destination.

## Cross-screen reflection rules

- Secret disabled in `SecretsAndKeysPage` -> affected model routes in `ModelRoutingPage` become blocked/warning, and related steps in `WorkflowRunsPage` show blocked route health.
- Provider test fails in `SecretsAndKeysPage` -> model route health is downgraded until a passing readiness state exists.
- Model route cost changed in `ModelRoutingPage` -> `CostMonitorPage` updates the affected task row and recalculates approval/forecast status.
- Primary model disabled in `ModelRoutingPage` -> `WorkflowRunsPage` must either show fallback route use or block the step.
- Prompt moved to draft/testing/blocked in `PromptGovernancePage` -> affected workflow steps in `WorkflowRunsPage` warn or block based on visibility and review policy.
- Prompt output marked customer-visible -> `reviewRequired` must be true for all linked workflow steps.
- System admin disables auto publishing -> any workflow output destined for publishing queue requires review.
- System admin disables AI video generation -> video generation routes and workflow steps become blocked.
- System admin disables external integrations -> tool-call and external-destination steps warn or block.
- Cost threshold exceeded in `CostMonitorPage` -> affected workflow run requires approval before continuation.
- Workflow step feeds next workflow -> output artifact must be reviewed or explicitly allowed before becoming the next workflow input.
- Asset rights not satisfied -> generated or selected assets cannot move to publishing destinations.

## Required UI changes for later gates

### SystemAdminPage

- Show AI operations policy flags with their downstream impact: human review, auto publish, AI video generation, external integrations.
- Add read-only impact summaries for affected routes, workflow steps, and publishing gates.
- Keep admin audit as policy/audit only; do not add model route, prompt, secret, or artifact editors.

### SecretsAndKeysPage

- Persist provider readiness through a shared future AI provider readiness model.
- Replace local-only provider state with owned provider records and readiness events.
- Keep raw key values hidden; store only secret references and readiness metadata.
- Add provider readiness outputs that `ModelRoutingPage` and `WorkflowRunsPage` can display.

### ModelRoutingPage

- Reflect provider readiness from `SecretsAndKeysPage`.
- Add route health that includes secret, provider, model, cost, prompt, review, and external-tool constraints.
- Keep model registry and route editing here; do not copy prompt or secret ownership into this page.
- Emit route-health changes for `CostMonitorPage` and `WorkflowRunsPage`.

### PromptGovernancePage

- Strengthen usage-to-step linking so each workflow step can reference a prompt version.
- Show affected workflow steps when a prompt is draft/testing/blocked.
- Support prompt chaining by defining prompt outputs and allowed downstream consumers, without becoming the workflow builder.
- Keep prompt registry ownership here; do not own workflow run artifacts.

### CostMonitorPage

- Continue reflecting model routes and add route-health impact from budget and approval thresholds.
- Show approval-required, throttled, and blocked states in a way `WorkflowRunsPage` can consume.
- Keep cost thresholds and forecasts here; do not edit model registry or prompts.

### WorkflowRunsPage

- Refine chain view around: input artifact -> prompt/model/tool/policy processor -> output artifact -> next step -> final destination.
- Replace local route summaries with read-only route health from `ModelRoutingPage` when the shared readiness model exists.
- Read prompt readiness from `PromptGovernancePage` for prompt-backed steps.
- Read cost readiness from `CostMonitorPage` for cost-backed steps.
- Read provider readiness from `SecretsAndKeysPage` through route health, not directly as independent truth.
- Keep operational actions and run monitoring concepts, but continue to clarify that this prototype defines target behavior and does not execute workflows today.

## What not to implement now

- Real API calls.
- Real key storage.
- Real workflow execution.
- Real model invocation.
- Real webhooks.
- Real OAuth.
- Real cost metering.
- Real MCP/tool execution.
- Backend job runner.

## Recommended implementation order

1. Gate A: AI Ops source map document.
2. Gate B: shared AI ops readiness model, if needed.
3. Gate C: `WorkflowRunsPage` chain view refinement.
4. Gate D: `ModelRoutingPage` route health reflection.
5. Gate E: `PromptGovernancePage` usage-to-step readiness.
6. Gate F: `SecretsAndKeysPage` provider readiness reflection.
7. Gate G: `CostMonitorPage` budget reflection.

## Final decision

Next actionable gate: Gate B, define a shared AI operations readiness model before additional source-of-truth UI changes. This should remain requirements-first unless explicitly approved for implementation.

