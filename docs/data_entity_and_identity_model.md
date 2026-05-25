# Data Entity and Identity Model

## 1. Executive Decision

**GO for entity/identity modeling.**

**NO-GO for ERD/API/backend until this model is reviewed.**

This document is conceptual and documentation-only. It builds on `docs/data_flow_processing_and_reuse_architecture.md` by defining the entities, identities, ownership boundaries, and reuse rules needed before database schemas, API contracts, connector contracts, or backend services are designed.

## 2. Purpose

This document defines:

- Official entities.
- Canonical identifiers.
- Ownership boundaries.
- Relationships.
- References vs copies.
- Reuse rules.
- V1 scope.
- Post-V1 scope.

The goal is to prevent prototype UI state, display names, or temporary local data structures from becoming production identity models by accident.

## 3. Entity Groups

### A. Workspace and Account

- Workspace
- AuditEvent

### B. Store and Strategy

- StoreProfile
- StoreStrategicPlan

### C. Product and Asset

- Product
- Asset
- ProductMarketingPriority
- AssetGapReport

### D. Campaign and Content

- Campaign
- CampaignBrief
- CampaignContentOutput

### E. Review and Publishing

- ReviewFinding
- PublishingReadiness

### F. Social Intelligence and Connectors

- ConnectorConfig
- ConnectorRun
- RawSourcePayload
- NormalizedSignal
- SocialStoreIntelligenceReport

### G. Analytics and Performance

- PerformanceSummary

### H. AI Operations and Governance

- ModelProvider
- ModelRoute
- PromptTemplate
- WorkflowRun
- CostPolicy

## 4. Core Entity Definitions

### Workspace

- **Purpose:** Tenant-level boundary for store, users, policies, integrations, campaigns, assets, analytics, and AI operations.
- **Canonical ID:** `workspaceId`
- **Owned by:** Account/workspace administration.
- **Key fields:** name, locale, timezone, plan, status, createdAt, updatedAt.
- **References:** users, stores, policies, audit events.
- **Consumers:** all product areas.
- **V1 status:** conceptual contract.

### StoreProfile

- **Purpose:** Canonical store-level facts and setup data.
- **Canonical ID:** `storeId`
- **Owned by:** Store setup.
- **Key fields:** workspaceId, name, url, category, activity, audienceDefaults, language, tone, policyAnswers, preferredChannels, setupStatus.
- **References:** workspaceId.
- **Consumers:** StoreStrategicPlan, Dashboard, CampaignWizard, ProductCatalog, SocialStoreIntelligenceReport.
- **V1 status:** conceptual contract.

### Product

- **Purpose:** Canonical product definition used by campaign creation, catalog readiness, asset linking, and product priority.
- **Canonical ID:** `productId`
- **Owned by:** Product catalog.
- **Key fields:** workspaceId, storeId, name, category, description, price, imageUrl, videoUrl, readiness, flags, claims, status.
- **References:** workspaceId, storeId.
- **Consumers:** ProductMarketingPriority, Asset, CampaignBrief, CampaignWizard, Dashboard.
- **V1 status:** conceptual contract.

### Asset

- **Purpose:** Reusable image, video, logo, document, text, or design asset with rights and quality metadata.
- **Canonical ID:** `assetId`
- **Owned by:** Asset library.
- **Key fields:** workspaceId, name, type, url, thumbnailUrl, linkedType, linkedEntityId, linkedNameSnapshot, channel, rightsStatus, quality, tags, notes, updatedAt.
- **References:** workspaceId, productId when linked to a product, campaignId or contentOutputId when later linked to campaign/content.
- **Consumers:** AssetGapReport, CampaignWizard, ContentStudio, PublishingReadiness.
- **V1 status:** conceptual contract.

### StoreStrategicPlan

- **Purpose:** Store-level marketing strategy derived from setup data, products, assets, social intelligence, policy inputs, and later analytics.
- **Canonical ID:** `storeStrategicPlanId`
- **Owned by:** Strategy generation/service layer, reviewed from StoreSetup.
- **Key fields:** storeId, generatedAt, readinessStage, identityStrength, productClarity, assetReadiness, channelReadiness, riskLevel, audienceStrategy, channelStrategy, messagingStrategy, thirtySixtyNinetyPlan, limitations.
- **References:** storeId, sourceRunId where applicable, productIds, assetIds, reportIds.
- **Consumers:** Dashboard, CampaignWizard, ProductCatalog, AssetLibrary.
- **V1 status:** conceptual contract.

### SocialStoreIntelligenceReport

- **Purpose:** Structured report from approved social source analysis.
- **Canonical ID:** `socialStoreIntelligenceReportId`
- **Owned by:** Social intelligence processing.
- **Key fields:** storeId, platform, generatedAt, sourceRunId, accountStrength, bioClarity, visibleProducts, contentOpportunities, repeatedQuestions, repeatedObjections, assetGaps, campaignOpportunities, confidence, limitations.
- **References:** storeId, connectorRunId, rawPayloadIds, normalizedSignalIds.
- **Consumers:** StoreStrategicPlan, Dashboard, CampaignWizard, AssetGapReport, ContentStudio.
- **V1 status:** post-V1 unless manually simulated as UI-only output.

### ProductMarketingPriority

- **Purpose:** Derived product-level marketing priority and campaign suitability.
- **Canonical ID:** `productMarketingPriorityId`
- **Owned by:** Strategy/product intelligence layer.
- **Key fields:** productId, storeId, priorityLevel, reason, bestChannel, suggestedContentType, requiredGap, generatedAt, confidence, limitations.
- **References:** productId, storeId, storeStrategicPlanId, socialStoreIntelligenceReportId when applicable.
- **Consumers:** ProductCatalog, CampaignWizard, Dashboard.
- **V1 status:** conceptual contract.

### AssetGapReport

- **Purpose:** Derived report of missing or weak assets needed for products, campaigns, or social content.
- **Canonical ID:** `assetGapReportId`
- **Owned by:** Asset intelligence layer.
- **Key fields:** storeId, productId, missingAssetType, reason, priority, channel, generatedAt, confidence, limitations.
- **References:** storeId, productId, assetIds, storeStrategicPlanId, socialStoreIntelligenceReportId.
- **Consumers:** AssetLibrary, CampaignWizard, ContentStudio, StoreSetup.
- **V1 status:** conceptual contract.

### Campaign

- **Purpose:** Campaign-level container for objective, selected product, channels, status, brief, content, review, and publishing readiness.
- **Canonical ID:** `campaignId`
- **Owned by:** Campaign creation and campaign management.
- **Key fields:** workspaceId, storeId, name, objective, productId, productSnapshot, channels, status, createdAt, updatedAt, strategySnapshot.
- **References:** workspaceId, storeId, productId, storeStrategicPlanId.
- **Consumers:** Campaigns, ContentStudio, ReviewPreview, PublishingQueue, Analytics.
- **V1 status:** conceptual contract.

### CampaignBrief

- **Purpose:** Structured campaign instructions generated or assembled for content output creation.
- **Canonical ID:** `campaignBriefId`
- **Owned by:** Campaign.
- **Key fields:** campaignId, selectedAssetIds, offer, cta, ageGroup, gender, language, channels, outputTypes, readiness, createdAt, updatedAt.
- **References:** campaignId, assetIds, productId through campaign.
- **Consumers:** ContentStudio, WorkflowRun, PromptTemplate usage, ReviewPreview.
- **V1 status:** conceptual contract.

### CampaignContentOutput

- **Purpose:** Editable campaign output such as post copy, video script, caption, story text, email copy, or ad copy.
- **Canonical ID:** `contentOutputId`
- **Owned by:** Campaign content.
- **Key fields:** campaignId, campaignBriefId, type, channel, content, status, reviewStatus, promptTemplateSnapshot, modelRouteSnapshot, createdAt, updatedAt.
- **References:** campaignId, campaignBriefId, assetIds, promptTemplateId where applicable.
- **Consumers:** ContentStudio, ReviewPreview, PublishingReadiness, Analytics.
- **V1 status:** conceptual contract.

### ReviewFinding

- **Purpose:** Review decision, warning, requested change, approval, or rejection tied to content output.
- **Canonical ID:** `reviewFindingId`
- **Owned by:** Review/preview workflow.
- **Key fields:** contentOutputId, status, severity, findingTextSnapshot, reviewerId, createdAt, resolvedAt, requiredAction.
- **References:** contentOutputId, campaignId through content output.
- **Consumers:** PublishingReadiness, ContentStudio, Campaigns, AuditEvent.
- **V1 status:** conceptual contract.

### PublishingReadiness

- **Purpose:** Scheduling and publishing readiness checklist for approved content.
- **Canonical ID:** `publishingReadinessId`
- **Owned by:** Publishing queue/readiness workflow.
- **Key fields:** campaignId, contentOutputId, contentApproved, assetRightsSatisfied, channelConnected, scheduleReady, blockedReasons, warnings, updatedAt.
- **References:** campaignId, contentOutputId, reviewFindingIds, assetIds.
- **Consumers:** PublishingQueue, Campaigns, Dashboard.
- **V1 status:** conceptual contract.

### ConnectorConfig

- **Purpose:** Configuration for approved external or official data connector.
- **Canonical ID:** `connectorConfigId`
- **Owned by:** Data sources/connectors.
- **Key fields:** workspaceId, storeId, platform, provider, operationType, secretReference, schedule, outputMap, complianceLevel, status.
- **References:** workspaceId, storeId, secret reference in backend secret vault later.
- **Consumers:** ConnectorRun, SocialStoreIntelligenceReport, RawSourcePayload.
- **V1 status:** post-V1.

### ConnectorRun

- **Purpose:** Individual execution attempt for a connector config.
- **Canonical ID:** `connectorRunId`
- **Owned by:** Connector execution service.
- **Key fields:** connectorConfigId, status, startedAt, completedAt, providerRunReference, resultReference, errorSummary, complianceStatus.
- **References:** connectorConfigId.
- **Consumers:** RawSourcePayload, SocialStoreIntelligenceReport, AuditEvent.
- **V1 status:** post-V1.

### RawSourcePayload

- **Purpose:** Stored raw connector response or uploaded source payload before normalization.
- **Canonical ID:** `rawPayloadId`
- **Owned by:** Ingestion layer.
- **Key fields:** connectorRunId, sourceType, payloadLocation, payloadHash, capturedAt, retentionPolicy, schemaVersion.
- **References:** connectorRunId.
- **Consumers:** NormalizedSignal, audit/debug workflows.
- **V1 status:** post-V1.

### NormalizedSignal

- **Purpose:** Platform-neutral extracted signal from raw payload.
- **Canonical ID:** `normalizedSignalId`
- **Owned by:** Normalization/enrichment pipeline.
- **Key fields:** rawPayloadId, signalType, entityType, entityText, normalizedValue, confidence, sourceTimestamp, limitations.
- **References:** rawPayloadId, productId/assetId/campaignId when linked.
- **Consumers:** SocialStoreIntelligenceReport, StoreStrategicPlan, ProductMarketingPriority, AssetGapReport.
- **V1 status:** post-V1.

### PerformanceSummary

- **Purpose:** Aggregated performance view by campaign, product, channel, content, and time window.
- **Canonical ID:** `performanceSummaryId`
- **Owned by:** Analytics/performance.
- **Key fields:** workspaceId, storeId, campaignId, productId, channel, timeWindow, metrics, trend, forecast, generatedAt.
- **References:** workspaceId, storeId, campaignId, productId, contentOutputIds.
- **Consumers:** Dashboard, Analytics, StoreStrategicPlan refresh, Campaigns.
- **V1 status:** conceptual contract.

### ModelProvider

- **Purpose:** Provider readiness and capability declaration for future AI operations.
- **Canonical ID:** `modelProviderId`
- **Owned by:** Secrets and keys/provider configuration.
- **Key fields:** providerType, deliveryChannel, environment, authType, secretReference, baseUrl, scope fields, capabilities, availableModels, webhookConfig, readiness.
- **References:** backend secret reference later.
- **Consumers:** ModelRoute, WorkflowRun readiness.
- **V1 status:** conceptual contract.

### ModelRoute

- **Purpose:** Task-level model routing decision including primary model, alternatives, policy, and route health.
- **Canonical ID:** `modelRouteId`
- **Owned by:** Model routing.
- **Key fields:** taskType, primaryModel, fallbackModels, retryPolicy, timeout, costPolicyId, humanReviewRequired, externalToolsAllowed, routeHealth.
- **References:** modelProviderId, costPolicyId.
- **Consumers:** WorkflowRun, CostMonitor, PromptTemplate readiness.
- **V1 status:** conceptual contract.

### PromptTemplate

- **Purpose:** Governed prompt/template version used by AI steps.
- **Canonical ID:** `promptTemplateId`
- **Owned by:** Prompt governance.
- **Key fields:** name, version, owner, task, status, requiredChecks, blockedPatterns, allowedOutputs, usageLinks, reviewRequirement.
- **References:** workflow step references later.
- **Consumers:** WorkflowRun, CampaignContentOutput generation metadata, review readiness.
- **V1 status:** conceptual contract.

### WorkflowRun

- **Purpose:** Future execution record for chained processing steps.
- **Canonical ID:** `workflowRunId`
- **Owned by:** Workflow runs/execution orchestration.
- **Key fields:** workflowType, inputSource, steps, artifacts, status, blockedReasons, costEstimate, actionLog, startedAt, completedAt.
- **References:** modelRouteIds, promptTemplateIds, campaignId/contentOutputId where applicable.
- **Consumers:** WorkflowRunsPage, AuditEvent, CampaignContentOutput, SocialStoreIntelligenceReport.
- **V1 status:** conceptual contract.

### CostPolicy

- **Purpose:** Cost thresholds, approval requirements, forecast warnings, and throttling rules.
- **Canonical ID:** `costPolicyId`
- **Owned by:** Cost monitor.
- **Key fields:** taskType, modelRouteId, monthlyBudget, maxCostPerRun, approvalAbove, forecast, autoThrottle, status.
- **References:** modelRouteId.
- **Consumers:** ModelRoute, WorkflowRun readiness, CostMonitor.
- **V1 status:** conceptual contract.

### AuditEvent

- **Purpose:** Record of important configuration, review, workflow, connector, policy, and publishing actions.
- **Canonical ID:** `auditEventId`
- **Owned by:** System administration/governance.
- **Key fields:** workspaceId, actorId, entityType, entityId, action, severity, timestamp, metadata, result.
- **References:** workspaceId and target entity ID.
- **Consumers:** SystemAdmin, compliance reports, debugging, security review.
- **V1 status:** conceptual contract.

## 5. Canonical Identity Rules

- Every entity has a stable ID.
- User-facing names are not identifiers.
- Campaign references `productId`, not `productName`.
- Asset references `productId` when linked to a product.
- Content output references `campaignId`.
- Review finding references `contentOutputId`.
- Connector run references `connectorConfigId`.
- Raw payload references `connectorRunId`.
- Normalized signal references `rawPayloadId`.
- Reports must include `generatedAt`, `sourceRunId`, `confidence`, and `limitations` where applicable.
- Display names may be snapshotted for readability, but cannot replace canonical IDs.
- External platform IDs should be stored as external references, not reused as Nashir canonical IDs.
- Deleting or archiving a source entity should not erase historical campaign/content snapshots needed for audit and reporting.

## 6. Ownership Boundaries

- StoreProfile owns store-level facts.
- StoreStrategicPlan is derived from StoreProfile, Product, Asset, SocialIntelligence, and policy inputs.
- Campaign consumes strategy recommendations but does not mutate StoreStrategicPlan automatically.
- CampaignBrief belongs to Campaign.
- CampaignContentOutput belongs to Campaign and may reference CampaignBrief.
- ContentReview does not own Campaign.
- AssetLibrary owns assets and rights metadata.
- SocialStoreIntelligenceReport does not mutate StoreProfile automatically.
- ModelRouting owns model selection.
- Secrets/Keys owns provider availability, not routing decisions.
- CostMonitor owns cost thresholds and approval policies.
- PromptGovernance owns prompt versions and approval status, not workflow structure.
- WorkflowRuns owns execution requirements and run state, not model registry, prompt registry, or provider secrets.
- PublishingReadiness owns scheduling readiness, not real platform publishing.

## 7. Relationship Map

Primary commercial relationship:

```text
Workspace
-> StoreProfile
-> Products
-> Assets
-> StoreStrategicPlan
-> Campaigns
-> CampaignBrief
-> CampaignContentOutputs
-> ReviewFindings
-> PublishingReadiness
```

Connector and intelligence relationship:

```text
ConnectorConfig
-> ConnectorRun
-> RawSourcePayload
-> NormalizedSignal
-> SocialStoreIntelligenceReport
-> StoreStrategicPlan / CampaignSuggestions / AssetGapReport
```

AI operations relationship:

```text
ModelProvider
-> ModelRoute
-> CostPolicy
-> WorkflowRun

PromptTemplate
-> WorkflowRun
-> CampaignContentOutput / SocialStoreIntelligenceReport / StoreStrategicPlan
```

Audit relationship:

```text
Workspace
-> AuditEvent
-> Entity type + Entity ID
```

## 8. Reference vs Snapshot Rules

### Reference Live Entity

Use live references when downstream behavior must reflect the current canonical state:

- Asset rights status for publishing readiness.
- Channel connection status for scheduling readiness.
- Model provider readiness for route readiness.
- Cost policy for workflow execution readiness.
- Prompt status for workflow step readiness.

### Take Snapshot

Use snapshots when historical context must remain stable:

- Campaign should snapshot strategy recommendations at creation time.
- Campaign should reference Product by ID but snapshot product name/price used in the campaign.
- Campaign should snapshot selected channel labels and CTA at creation time.
- ContentOutput should snapshot prompt/template version used.
- ContentOutput should snapshot model route metadata used for generation or planned execution.
- ReviewFinding should reference contentOutput and snapshot finding text/status.
- PerformanceSummary should aggregate by campaignId/channel/time window.
- Connector-derived reports should snapshot confidence, limitations, source run, and generatedAt.

### Mixed Reference and Snapshot

Some entities require both:

- Campaign references `productId` but stores product display snapshot.
- Asset references `productId` but stores linked product name snapshot.
- CampaignContentOutput references `campaignBriefId` but snapshots the prompt/template version.
- PublishingReadiness references live asset rights but snapshots readiness results at schedule decision time.

## 9. Reuse Rules

- StoreStrategicPlan feeds Dashboard and CampaignWizard.
- ProductMarketingPriority feeds ProductCatalog and CampaignWizard.
- AssetGapReport feeds AssetLibrary and ContentStudio.
- SocialStoreIntelligenceReport feeds StoreSetup, Dashboard, CampaignWizard, ContentStudio.
- ReviewFinding feeds PublishingReadiness.
- PerformanceSummary feeds Analytics and future strategy refresh.
- CampaignBrief feeds CampaignContentOutput.
- CampaignContentOutput feeds ReviewFinding and PublishingReadiness.
- ModelProvider readiness feeds ModelRoute readiness.
- ModelRoute, PromptTemplate, and CostPolicy feed WorkflowRun readiness.
- WorkflowRun artifacts can produce intelligence reports or campaign content only after review rules are satisfied.

## 10. V1 Scope

V1 entities:

- Workspace
- StoreProfile
- Product
- Asset
- StoreStrategicPlan
- Campaign
- CampaignBrief
- CampaignContentOutput
- ReviewFinding
- PublishingReadiness
- ModelProvider
- ModelRoute
- PromptTemplate
- WorkflowRun
- CostPolicy
- AuditEvent

These are conceptual contracts, not implemented backend entities yet. V1 should focus on stable identity, ownership, references, snapshots, and API/ERD readiness before real persistence or orchestration is built.

## 11. Extended / Post-V1 Scope

Post-V1 entities and capabilities:

- ConnectorConfig
- ConnectorRun
- RawSourcePayload
- NormalizedSignal
- SocialStoreIntelligenceReport
- Advanced analytics feedback loop.
- Scheduled sync.
- Official OAuth connectors.
- External connector providers.
- Embedding search.
- Automated strategy refresh with human confirmation.
- Media processing pipeline.
- Webhook processing.
- Connector compliance review workflow.
- Multi-source attribution and confidence scoring.

## 12. Anti-Patterns / NO-GO

- Using `productName` as product identity.
- Using asset file name as asset identity.
- Campaign mutating StoreStrategicPlan automatically.
- AI writing directly to canonical facts without review.
- Storing secret values in frontend.
- Raw connector payload used directly in customer content.
- Social connector data used without confidence/limitations.
- Approval or publishing without human review.
- Reusing external platform IDs as Nashir canonical IDs.
- Treating UI prototype local state as production storage design.
- Letting Review/Preview own campaign creation.
- Letting Secrets/Keys own routing decisions.
- Letting CostMonitor own model provider setup.
- Letting WorkflowRuns duplicate prompt, model, or provider registries as independent truth.

## 13. Open Questions

- What is the tenant/workspace boundary?
- Is there one store per workspace or multiple stores?
- How are products imported from ecommerce platforms?
- What IDs come from external platforms?
- How long are raw payloads retained?
- Which reports require versioning?
- What requires human approval?
- What is the minimum identity model for users, roles, and reviewers?
- Should ProductMarketingPriority and AssetGapReport be persisted or generated on demand?
- Which snapshots are required for legal/audit history?
- Which entities need soft delete vs hard delete?

## 14. Next Gates

1. ERD Reconciliation Gate.
2. API Contract Gate.
3. Connector Contract Gate.
4. AI Orchestration Contract Gate.
5. QA/Test Plan Gate.
