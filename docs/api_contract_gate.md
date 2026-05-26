# API Contract Gate

## 1. Executive Decision

GO for API contract planning.

NO-GO for backend implementation.

NO-GO for SQL schema.

NO-GO for executable OpenAPI until this planning document is reviewed.

This document is documentation-only.

## 2. Purpose

This document defines V1 API resource boundaries, workspace scoping, endpoint candidates, conceptual request/response shapes, identity and reference rules, snapshot rules, AI task contract boundaries, review and publishing boundaries, and V1 vs Post-V1 API scope.

It prepares Nashir for executable OpenAPI planning without implementing backend services, database schema, migrations, or real AI execution.

## 3. Authority and Inputs

Approved source documents:

- `docs/data_flow_processing_and_reuse_architecture.md`: defines ingestion, processing, reuse, connector boundaries, evidence packs, and governance.
- `docs/data_entity_and_identity_model.md`: defines official entities, canonical identifiers, ownership, reference vs snapshot rules, and reuse rules.
- `docs/erd_reconciliation_model.md`: translates the identity model into conceptual database-oriented entity planning.
- `docs/workspace_and_minimum_identity_decision.md`: resolves V1 as one Workspace with one StoreProfile and defines minimum identity.
- `docs/strategy_data_sufficiency_and_ai_task_contract.md`: defines strategic plan data sufficiency, AI task taxonomy, PromptTemplate contracts, evidence packs, and AI task envelopes.
- `docs/prototype_stabilization_closure_report.md`: records the stable UI prototype baseline and remaining production blockers.
- `docs/commercial_journey_e2e_acceptance_report/`: provides commercial journey evidence and acceptance context.

This document prepares API contracts but does not override implementation contracts. Executable OpenAPI, SQL schema, backend services, and authentication remain separate gates.

## 4. API Design Principles

- Endpoints are workspace-scoped.
- One Workspace has one StoreProfile in V1.
- IDs are stable and opaque.
- User-facing names are not identifiers.
- Resources reference other resources by ID and snapshot display facts where historical context is needed.
- API responses must not include raw secret values.
- Raw connector payloads must not be used directly in customer-facing outputs.
- AI outputs require confidence and limitations.
- Human review gates are required before publishing.
- Campaigns do not auto-mutate StoreStrategicPlan.
- Social intelligence does not auto-mutate StoreProfile.
- Publishing readiness is separate from publishing execution.
- AI tasks consume structured evidence packs, not raw unfiltered payloads.

## 5. Workspace and Identity Scoping

V1:

- Workspace is the top-level tenant boundary.
- One Workspace has one StoreProfile.
- Core resources are scoped by `workspaceId`.
- Minimum identity for planning:
  - `workspaceId`
  - `storeProfileId`
  - `userId`
  - `roleId`
  - `actorType`: `user` / `service` / `system`

Route shape:

- `/workspaces/{workspaceId}/...`

`workspaceId` must be included in route path or request context for every V1 resource.

## 6. V1 API Resource Inventory

| Resource | Purpose | Owner/scope | Primary identifier | Key references | Read/write needs | V1 status | Notes/caveats |
|---|---|---|---|---|---|---|---|
| StoreProfile | Canonical store facts and commercial identity. | Workspace | `storeProfileId` | `workspaceId` | Read/update | V1 | One per Workspace in V1. |
| StoreStrategicPlan | Derived strategy output. | Workspace + StoreProfile | `planId` | `workspaceId`, `storeProfileId` | Create/read/review/approve | V1 | Does not mutate StoreProfile automatically. |
| Product | Product catalog entity. | Workspace | `productId` | `workspaceId` | Create/read/update | V1 | Campaigns reference product and snapshot facts. |
| Asset | Reusable media/content asset. | Workspace | `assetId` | `workspaceId`, optional `productId` | Create/read/update/link | V1 | Rights are not auto-approved. |
| ProductMarketingPriority | Derived product ranking. | Workspace | `priorityId` | `workspaceId`, `productId`, optional `planId` | Read/create as derived report | V1 | Recommendation, not canonical truth. |
| AssetGapReport | Derived asset needs. | Workspace | `assetGapReportId` | `workspaceId`, optional `productId`, `planId` | Read/create as derived report | V1 | Review required before operational use. |
| Campaign | Campaign container. | Workspace | `campaignId` | `workspaceId`, `productId` | Create/read/update | V1 | Stores product and strategy snapshots. |
| CampaignBrief | Structured campaign brief. | Campaign | `campaignBriefId` | `workspaceId`, `campaignId`, `productId` | Read/update | V1 | Belongs to Campaign. |
| CampaignContentOutput | Generated or edited campaign content output. | Campaign | `contentOutputId` | `workspaceId`, `campaignId`, optional `campaignBriefId` | Create/read/update | V1 | Requires review before publishing. |
| ReviewFinding | Review/risk finding for content. | Workspace/content | `reviewFindingId` | `workspaceId`, `contentOutputId`, `campaignId` | Create/read/resolve | V1 | Feeds PublishingReadiness. |
| PublishingReadiness | Readiness/check result before publishing. | Workspace/campaign/content | `publishingReadinessId` | `workspaceId`, `campaignId`, optional `contentOutputId` | Read/check/update | V1 | Does not publish. |
| ModelProvider | AI provider availability/config metadata. | Workspace | `providerId` | `workspaceId` | Create/read/update | V1 | Secret references only. |
| ModelRoute | Task-to-model routing policy. | Workspace | `modelRouteId` | `workspaceId`, `providerId`, `costPolicyId` | Create/read/update | V1 | Owns model selection. |
| PromptTemplate | Versioned governed prompt. | Workspace | `promptTemplateId` | `workspaceId` | Create/read/update/review/approve | V1 | Must include prompt text and output schema. |
| WorkflowRun | Workflow execution requirement/run state. | Workspace | `workflowRunId` | `workspaceId`, input/output refs | Create/read | V1 | Prototype planning only until backend execution gate. |
| AITaskRun | AI task invocation record. | Workspace | `aiTaskRunId` | `workspaceId`, `modelRouteId`, `promptTemplateId` | Create/read | V1 contract | No real AI execution in prototype. |
| CostPolicy | Cost thresholds and approval rules. | Workspace | `costPolicyId` | `workspaceId` | Read/update | V1 | Used by ModelRoute and WorkflowRun readiness. |
| AuditEvent | Material action history. | Workspace | `auditEventId` | `workspaceId`, `actorId`, `entityId` | Create/read | V1 contract | Required for production planning. |

## 7. Core Endpoint Candidate Map

| Method | Path | Purpose | Request summary | Response summary | V1 status | Notes |
|---|---|---|---|---|---|---|
| GET | `/workspaces/{workspaceId}/store-profile` | Read StoreProfile. | Workspace path. | StoreProfile. | V1 | One StoreProfile per Workspace. |
| PUT | `/workspaces/{workspaceId}/store-profile` | Update StoreProfile. | StoreProfile fields. | Updated StoreProfile. | V1 | AI must not mutate without review. |
| GET | `/workspaces/{workspaceId}/store-strategic-plans/latest` | Read latest plan. | Workspace path. | Latest StoreStrategicPlan. | V1 | Empty state if none. |
| GET | `/workspaces/{workspaceId}/store-strategic-plans/{planId}` | Read plan by ID. | Plan path. | StoreStrategicPlan. | V1 | Versioned. |
| POST | `/workspaces/{workspaceId}/store-strategic-plans` | Create strategy plan. | Evidence pack or structured input snapshot. | Created StoreStrategicPlan. | V1 | Derived output. |
| POST | `/workspaces/{workspaceId}/store-strategic-plans/{planId}/review` | Mark/send plan for review. | Review metadata. | Updated status. | V1 | No auto-approval. |
| POST | `/workspaces/{workspaceId}/store-strategic-plans/{planId}/approve` | Approve plan. | Actor/review decision. | Approved plan. | V1 | Auditable. |
| GET | `/workspaces/{workspaceId}/products` | List products. | Filters optional. | Product list. | V1 | Workspace scoped. |
| POST | `/workspaces/{workspaceId}/products` | Create product. | Product fields. | Created Product. | V1 | Opaque `productId`. |
| GET | `/workspaces/{workspaceId}/products/{productId}` | Read product. | Product path. | Product. | V1 | Display name is not identity. |
| PUT | `/workspaces/{workspaceId}/products/{productId}` | Update product. | Product fields/version. | Updated Product. | V1 | Conflict checks later. |
| GET | `/workspaces/{workspaceId}/assets` | List assets. | Filters optional. | Asset list. | V1 | Rights status included. |
| POST | `/workspaces/{workspaceId}/assets` | Create asset metadata. | Asset fields. | Created Asset. | V1 | Upload/storage separate future contract. |
| GET | `/workspaces/{workspaceId}/assets/{assetId}` | Read asset. | Asset path. | Asset. | V1 | No raw storage secrets. |
| PUT | `/workspaces/{workspaceId}/assets/{assetId}` | Update asset metadata. | Asset fields/version. | Updated Asset. | V1 | Rights not auto-approved. |
| POST | `/workspaces/{workspaceId}/assets/{assetId}/link-product` | Link asset to product. | `productId`. | Updated Asset. | V1 | Product link optional. |
| GET | `/workspaces/{workspaceId}/campaigns` | List campaigns. | Filters optional. | Campaign list. | V1 | Workspace scoped. |
| POST | `/workspaces/{workspaceId}/campaigns` | Create campaign. | Campaign input with `productId`, snapshots. | Created Campaign. | V1 | Snapshots strategy/product facts. |
| GET | `/workspaces/{workspaceId}/campaigns/{campaignId}` | Read campaign. | Campaign path. | Campaign. | V1 | Includes snapshots. |
| PUT | `/workspaces/{workspaceId}/campaigns/{campaignId}` | Update campaign. | Campaign fields/version. | Updated Campaign. | V1 | No plan mutation. |
| GET | `/workspaces/{workspaceId}/campaigns/{campaignId}/brief` | Read brief. | Campaign path. | CampaignBrief. | V1 | One active brief expected. |
| PUT | `/workspaces/{workspaceId}/campaigns/{campaignId}/brief` | Update brief. | Brief fields. | Updated CampaignBrief. | V1 | Auditable if material. |
| GET | `/workspaces/{workspaceId}/campaigns/{campaignId}/content` | List campaign content. | Campaign path. | Content output list. | V1 | Uses campaignId explicitly. |
| POST | `/workspaces/{workspaceId}/campaigns/{campaignId}/content` | Create content output. | Content body/channel/type and snapshots. | Created CampaignContentOutput. | V1 | Review required. |
| GET | `/workspaces/{workspaceId}/campaign-content/{contentOutputId}` | Read content output. | Content path. | CampaignContentOutput. | V1 | Belongs to campaign. |
| PUT | `/workspaces/{workspaceId}/campaign-content/{contentOutputId}` | Update content output. | Body/status/version. | Updated CampaignContentOutput. | V1 | Review status may reset. |
| GET | `/workspaces/{workspaceId}/review-findings` | List review findings. | Filters optional. | ReviewFinding list. | V1 | Filter by campaign/content/status. |
| POST | `/workspaces/{workspaceId}/campaign-content/{contentOutputId}/review-findings` | Create finding. | Finding fields. | Created ReviewFinding. | V1 | Auditable. |
| POST | `/workspaces/{workspaceId}/review-findings/{reviewFindingId}/resolve` | Resolve finding. | Resolution decision. | Updated ReviewFinding. | V1 | Actor required later. |
| GET | `/workspaces/{workspaceId}/campaigns/{campaignId}/publishing-readiness` | Read readiness. | Campaign path. | PublishingReadiness. | V1 | Does not publish. |
| POST | `/workspaces/{workspaceId}/campaigns/{campaignId}/publishing-readiness/check` | Run readiness check. | Optional content/channel scope. | Readiness result. | V1 | Deterministic/repeatable. |
| GET | `/workspaces/{workspaceId}/model-providers` | List providers. | Workspace path. | ModelProvider list. | V1 | Secret references only. |
| POST | `/workspaces/{workspaceId}/model-providers` | Create provider config. | Provider metadata. | Created ModelProvider. | V1 | No secret values. |
| PUT | `/workspaces/{workspaceId}/model-providers/{providerId}` | Update provider. | Provider metadata/version. | Updated ModelProvider. | V1 | Auditable. |
| GET | `/workspaces/{workspaceId}/model-routes` | List routes. | Filters optional. | ModelRoute list. | V1 | Task routing. |
| POST | `/workspaces/{workspaceId}/model-routes` | Create route. | Route config. | Created ModelRoute. | V1 | References provider/cost. |
| PUT | `/workspaces/{workspaceId}/model-routes/{routeId}` | Update route. | Route config/version. | Updated ModelRoute. | V1 | Auditable. |
| GET | `/workspaces/{workspaceId}/prompt-templates` | List prompts. | Filters optional. | PromptTemplate list. | V1 | May omit full prompt text in list. |
| POST | `/workspaces/{workspaceId}/prompt-templates` | Create prompt template. | Prompt contract fields. | Created PromptTemplate. | V1 | Review required before active use. |
| PUT | `/workspaces/{workspaceId}/prompt-templates/{promptTemplateId}` | Update prompt. | Prompt fields/version. | Updated PromptTemplate. | V1 | Versioning required. |
| POST | `/workspaces/{workspaceId}/prompt-templates/{promptTemplateId}/review` | Submit prompt for review. | Review metadata. | Updated status. | V1 | Governance gate. |
| POST | `/workspaces/{workspaceId}/prompt-templates/{promptTemplateId}/approve` | Approve prompt. | Approval decision. | Approved PromptTemplate. | V1 | Auditable. |
| GET | `/workspaces/{workspaceId}/workflow-runs` | List workflow runs. | Filters optional. | WorkflowRun list. | V1 | Requirement/run state. |
| POST | `/workspaces/{workspaceId}/workflow-runs` | Create workflow run record. | Workflow type/input refs. | Created WorkflowRun. | V1 contract | No real execution until backend gate. |
| GET | `/workspaces/{workspaceId}/workflow-runs/{workflowRunId}` | Read workflow run. | Run path. | WorkflowRun. | V1 | Includes blockers/log summary. |
| POST | `/workspaces/{workspaceId}/ai-task-runs` | Create AI task run record. | AITaskEnvelope. | AITaskRun. | V1 contract | Execution later. |
| GET | `/workspaces/{workspaceId}/ai-task-runs/{aiTaskRunId}` | Read AI task run. | Task path. | AITaskRun. | V1 contract | Includes confidence/limitations. |
| GET | `/workspaces/{workspaceId}/cost-policies` | List cost policies. | Workspace path. | CostPolicy list. | V1 | Scope by task/route. |
| PUT | `/workspaces/{workspaceId}/cost-policies/{costPolicyId}` | Update cost policy. | Threshold fields/version. | Updated CostPolicy. | V1 | Auditable. |
| GET | `/workspaces/{workspaceId}/audit-events` | List audit events. | Filters optional. | AuditEvent list. | V1 contract | Immutable in implementation. |
| POST | `/workspaces/{workspaceId}/audit-events` | Create audit event. | Event details. | Created AuditEvent. | V1 contract | Usually service-side. |

## 8. StoreProfile Contract

Conceptual request/response shape:

- `storeProfileId`
- `workspaceId`
- `storeName`
- `businessCategory`
- `storeType`
- `primarySalesChannel`
- `targetAudience`
- `audienceLocation`
- `brandTone`
- `preferredChannels`
- `businessGoal`
- `monthlyMarketingBudgetRange`
- `averageOrderValueRange`
- `currentConversionRateRange`
- `deliverySpeed`
- `returnsPolicy`
- optional `competitorUrls`
- `status`
- `createdAt`
- `updatedAt`

StoreProfile is canonical store facts.

AI must not mutate StoreProfile without review.

## 9. StoreStrategicPlan Contract

Conceptual shape:

- `planId`
- `workspaceId`
- `storeProfileId`
- `version`
- `status`: `draft` / `ready_for_review` / `approved` / `archived`
- `diagnosis`
- `audienceStrategy`
- `productPriorities`
- `channelStrategy`
- `messagingStrategy`
- `assetGaps`
- `campaignSuggestions`
- `thirtySixtyNinetyPlan`
- `risks`
- `limitations`
- `nextAction`
- `confidenceScores`
- `sourceInputsSummary`
- `generatedAt`
- `approvedBy`
- `approvedAt`

StoreStrategicPlan is derived.

Campaigns snapshot plan recommendations at creation time.

Campaigns do not mutate StoreStrategicPlan automatically.

## 10. Product and Asset Contracts

Product conceptual shape:

- `productId`
- `workspaceId`
- `name`
- `category`
- `price`
- optional `sku`
- optional `stockStatus`
- `imageUrl`
- `videoUrl`
- `description`
- `readiness`
- `createdAt`
- `updatedAt`

Asset conceptual shape:

- `assetId`
- `workspaceId`
- optional `linkedProductId`
- `name`
- `type`
- `url` / `preview`
- `rightsStatus`
- optional `usageRights`
- optional `source`
- `quality` / `readiness`
- `createdAt`
- `updatedAt`

Asset rights are not approved automatically.

Campaigns snapshot asset data when selected.

## 11. Campaign and CampaignBrief Contracts

Campaign conceptual shape:

- `campaignId`
- `workspaceId`
- `productId`
- `productSnapshot`
- `strategySnapshot`
- `campaignName`
- `objective`
- `channelSet`
- `status`
- `createdBy`
- `createdAt`
- `updatedAt`

CampaignBrief conceptual shape:

- `campaignBriefId`
- `workspaceId`
- `campaignId`
- `productId`
- `productSnapshot`
- `strategySnapshot`
- `audience`
- `offer`
- `channels`
- `contentDirection`
- `constraints`
- `createdAt`
- `updatedAt`

Product is referenced by `productId`.

`productSnapshot` preserves product facts at campaign creation time.

`strategySnapshot` preserves plan recommendation at campaign creation time.

## 12. CampaignContentOutput Contract

Conceptual shape:

- `contentOutputId`
- `workspaceId`
- `campaignId`
- `campaignSnapshot`
- optional `campaignBriefId`
- `productId`
- `productSnapshot`
- `selectedAssets` / `assetSnapshots`
- `contentType`
- `channel`
- `title`
- `body`
- `status`
- `promptTemplateId`
- `promptTemplateVersion`
- `modelRouteId`
- optional `aiTaskRunId`
- `createdAt`
- `updatedAt`

ContentOutput belongs to Campaign.

It does not own Campaign.

It must preserve `campaignId` explicitly.

Content output requires review before publishing.

## 13. ReviewFinding and PublishingReadiness Contracts

ReviewFinding conceptual shape:

- `reviewFindingId`
- `workspaceId`
- `contentOutputId`
- `campaignId`
- `findingType`
- `severity`
- `findingText`
- `status`
- `reviewerId` / `actorId`
- `createdAt`
- `resolvedAt`

PublishingReadiness conceptual shape:

- `publishingReadinessId`
- `workspaceId`
- `campaignId`
- optional `contentOutputId`
- `channelReadiness`
- `contentReviewStatus`
- `assetRightsStatus`
- `policyChecks`
- `blockers`
- `status`
- `checkedAt`

ReviewFinding feeds PublishingReadiness.

PublishingReadiness does not publish.

Publishing requires a separate future integration contract.

## 14. ModelProvider and ModelRoute Contracts

ModelProvider:

- `providerId`
- `workspaceId`
- `providerName`
- `providerType`
- `deliveryChannel`
- `secretReference`
- optional `baseUrl`
- optional `apiVersion`
- `capabilities`
- `operationalSupport`
- `status`
- `createdAt`
- `updatedAt`

ModelRoute:

- `modelRouteId`
- `workspaceId`
- `taskType`
- `primaryProviderId`
- `primaryModel`
- `fallbackModels`
- `inferenceParameters`
- `costPolicyId`
- `governancePolicy`
- `status`

Secrets page owns provider availability.

ModelRouting owns model selection.

No raw secret values in responses.

## 15. PromptTemplate Contract

PromptTemplate:

- `promptTemplateId`
- `workspaceId`
- `name`
- `version`
- `taskType`
- `status`
- `systemPrompt`
- `developerPolicyPrompt`
- `userPromptTemplate`
- `inputVariables`
- `outputSchema`
- `requiredChecks`
- `blockedPatterns`
- `allowedOutputs`
- `examples`
- `ownerId`
- `reviewStatus`
- `createdAt`
- `updatedAt`

Prompt templates must be versioned.

Output schema is required for structured tasks.

Prompt text requires review before use in production.

## 16. WorkflowRun and AITaskRun Contracts

WorkflowRun:

- `workflowRunId`
- `workspaceId`
- `workflowType`
- `status`
- `currentStep`
- `inputRefs`
- `outputRefs`
- `blockers`
- `startedBy` / `actorId`
- `startedAt`
- `completedAt`

AITaskRun:

- `aiTaskRunId`
- `workspaceId`
- `taskType`
- `modelRouteId`
- `promptTemplateId`
- `inputSnapshot`
- `evidencePack`
- `outputJson`
- `confidence`
- `limitations`
- `status`
- `humanReviewRequired`
- `createdAt`
- `completedAt`

AI tasks consume structured evidence packs, not raw payloads.

AI outputs require validation before reuse.

## 17. CostPolicy and AuditEvent Contracts

CostPolicy:

- `costPolicyId`
- `workspaceId`
- `taskType` or scope
- `budgetLimit`
- `perRunLimit`
- `approvalRequired`
- `alertThreshold`
- `status`

AuditEvent:

- `auditEventId`
- `workspaceId`
- `actorId`
- `actorType`
- optional `roleId`
- `action`
- `entityType`
- `entityId`
- `beforeSummary`
- `afterSummary`
- `result`
- `timestamp`

Audit events required for:

- strategic plan save/approve
- campaign create/update
- content review decision
- publishing readiness check
- model route change
- provider/secret reference change
- prompt template approval
- cost policy change
- workflow run start/fail/complete
- AI task run start/fail/complete

## 18. Snapshot and Reference Rules

- Product is referenced by `productId`, but campaign snapshots product name, price, and category at creation.
- Asset is referenced by `assetId`, but campaign/content snapshots selected asset details.
- StoreStrategicPlan is referenced by `planId`, but campaign snapshots recommendations.
- PromptTemplate is referenced by `promptTemplateId`, but content snapshots prompt version.
- ModelRoute is referenced by `modelRouteId`, but AI task records model used.
- ReviewFinding references `contentOutputId` and snapshots finding text/status.
- PublishingReadiness references `campaignId` and/or `contentOutputId`.

## 19. Error Model Planning

Conceptual API error model:

- `errorCode`
- `message`
- `details`
- `requestId`
- `retryable`
- `status`

Common errors:

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

## 20. Idempotency and Concurrency Planning

- POST create endpoints should support an idempotency key later.
- Update endpoints should support version or `updatedAt` conflict checks.
- AI task runs and workflow runs must prevent duplicate execution.
- Publishing readiness checks should be repeatable and deterministic.

## 21. V1 Scope

V1 includes:

- workspace-scoped resource contracts
- store profile
- products
- assets
- strategic plans
- campaigns
- campaign briefs
- content outputs
- review findings
- publishing readiness
- model providers
- model routes
- prompt templates
- workflow runs
- AI task runs
- cost policies
- audit events

V1 excludes:

- real connector execution
- raw source payload APIs
- normalized signal APIs
- automated social intelligence execution
- scheduled sync
- webhooks
- real publishing integration
- multi-store workspace
- full RBAC enforcement

## 22. Post-V1 / Extended API Scope

Post-V1 / Extended API scope includes:

- `connector_configs`
- `connector_runs`
- `raw_source_payloads`
- `normalized_signals`
- `social_store_intelligence_reports`
- `performance_summaries`
- `scheduled_sync_jobs`
- `oauth_connections`
- `external_platform_accounts`
- `embedding_index_items`
- `strategy_refresh_requests`
- publishing integrations
- multi-store workspace endpoints

## 23. API Contract Review Checklist

- Are all routes workspace-scoped?
- Are IDs stable and opaque?
- Are display names not used as identity?
- Are snapshot rules reflected?
- Are review gates represented?
- Are publishing actions separated from readiness checks?
- Are AI task inputs structured?
- Are prompts versioned?
- Are model routes separated from providers?
- Are audit events defined?
- Are Post-V1 items excluded from V1?

## 24. Final Position

This API Contract Gate document is suitable for review.

After review and acceptance, Nashir may proceed to executable OpenAPI planning.

Backend implementation and SQL schema remain NO-GO until OpenAPI and schema gates are separately approved.
