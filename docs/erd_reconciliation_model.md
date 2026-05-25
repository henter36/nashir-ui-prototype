# ERD Reconciliation Model

## 1. Executive Decision

**GO for conceptual ERD reconciliation.**

**NO-GO for SQL schema until this ERD model is reviewed.**

**NO-GO for API contracts until entity identity and relationship rules are reflected.**

This document is documentation-only. It converts the approved data flow, entity identity model, and UI prototype stabilization decisions into a database-oriented conceptual ERD for review.

## 2. Purpose

This document translates:

- Data flow architecture.
- Entity identity model.
- UI prototype stabilization decisions.

into a database-oriented conceptual ERD. It identifies candidate tables, relationships, snapshots, references, deferred entities, governance requirements, and open issues before SQL schemas, migrations, OpenAPI contracts, backend services, or connector execution are designed.

## 3. Authority and Inputs

Source documents:

- `docs/data_flow_processing_and_reuse_architecture.md`
- `docs/data_entity_and_identity_model.md`
- `docs/prototype_stabilization_closure_report.md`
- `docs/commercial_journey_e2e_acceptance_report/`

This document does not override implementation contracts; it prepares them. Final SQL, API, connector, and orchestration contracts must reconcile with this model before implementation.

## 4. V1 ERD Scope

### workspaces

- **Purpose:** Tenant boundary for store, products, assets, campaigns, AI operations, and audit.
- **Primary key:** `id`
- **Important fields:** workspace name, locale, timezone, plan/status, created/updated timestamps.
- **Foreign keys:** none for V1.
- **Relationship cardinality:** one workspace has many store profiles, products, assets, campaigns, model providers, model routes, prompt templates, workflow runs, cost policies, and audit events.
- **Snapshot fields:** none.
- **Notes / caveats:** one-store vs multi-store per workspace remains an open decision.

### store_profiles

- **Purpose:** Canonical store-level facts and setup data.
- **Primary key:** `id`
- **Important fields:** workspace reference, store name, URL, category, activity, language, tone, audience defaults, policy answers, preferred channels, setup status.
- **Foreign keys:** workspace.
- **Relationship cardinality:** belongs to one workspace; feeds many strategic plans and reports over time.
- **Snapshot fields:** policy/audience/channel configuration may be snapshotted into campaigns.
- **Notes / caveats:** should not own campaign execution or content outputs.

### products

- **Purpose:** Canonical product definitions.
- **Primary key:** `id`
- **Important fields:** workspace/store references, name, category, description, price, image URL, video URL, readiness, flags, claims, status.
- **Foreign keys:** workspace, store profile.
- **Relationship cardinality:** belongs to workspace/store; referenced by many campaigns, assets, product priorities, and asset gap reports.
- **Snapshot fields:** product name, price, category, and media state used in campaign context.
- **Notes / caveats:** product name is not identity.

### assets

- **Purpose:** Reusable media/content assets with rights and quality metadata.
- **Primary key:** `id`
- **Important fields:** workspace reference, optional product reference, name, type, URL, thumbnail URL, linked type, linked name snapshot, channel, rights status, quality, tags, notes, status.
- **Foreign keys:** workspace; optional product; optional campaign/content references later if needed.
- **Relationship cardinality:** belongs to workspace; optionally references product; may be referenced by campaign briefs and content outputs.
- **Snapshot fields:** linked product display name, asset label, rights status at review/schedule time where required.
- **Notes / caveats:** asset file name is not identity; real asset storage requires object storage design.

### store_strategic_plans

- **Purpose:** Store-level strategy derived from store setup, products, assets, social intelligence, policies, and later analytics.
- **Primary key:** `id`
- **Important fields:** workspace/store references, generated timestamp, readiness stage, identity strength, product clarity, asset readiness, channel readiness, risk level, audience strategy, channel strategy, messaging strategy, 30/60/90 plan, confidence, limitations.
- **Foreign keys:** workspace, store profile; optional source report/run references later.
- **Relationship cardinality:** belongs to workspace/store; consumed by dashboard and campaign creation; may have many product priorities and asset gap reports.
- **Snapshot fields:** campaign must snapshot selected strategy recommendations at creation.
- **Notes / caveats:** campaigns must not auto-mutate strategic plans.

### product_marketing_priorities

- **Purpose:** Product-level marketing priority and campaign suitability.
- **Primary key:** `id`
- **Important fields:** workspace/store/product references, priority level, reason, best channel, suggested content type, required gap, confidence, limitations, generated timestamp.
- **Foreign keys:** workspace, store profile, product, optional strategic plan.
- **Relationship cardinality:** belongs to product; many priorities may exist over time if versioned.
- **Snapshot fields:** selected priority reason and suggestion may be snapshotted into campaign.
- **Notes / caveats:** can be derived on demand or persisted; decision pending.

### asset_gap_reports

- **Purpose:** Missing or weak asset needs for products, campaigns, or social content.
- **Primary key:** `id`
- **Important fields:** workspace/store/product references, missing asset type, reason, priority, suggested channel, confidence, limitations, generated timestamp.
- **Foreign keys:** workspace, store profile, optional product, optional strategic plan.
- **Relationship cardinality:** belongs to workspace/store; may reference one product; consumed by asset library and content studio.
- **Snapshot fields:** campaign/content may snapshot selected asset gap.
- **Notes / caveats:** does not imply legal rights clearance.

### campaigns

- **Purpose:** Campaign container for objective, selected product, channels, status, content, review, and readiness.
- **Primary key:** `id`
- **Important fields:** workspace/store references, product reference, campaign name, objective, channel set, status, product snapshot, strategic recommendation snapshot, created/updated timestamps.
- **Foreign keys:** workspace, store profile, product.
- **Relationship cardinality:** belongs to workspace; references one product; has one campaign brief; has many content outputs; has publishing readiness.
- **Snapshot fields:** product name/price/category/media state, selected strategy recommendations, selected channel assumptions.
- **Notes / caveats:** campaign consumes strategy but does not mutate store strategy automatically.

### campaign_briefs

- **Purpose:** Structured campaign instructions and output requirements.
- **Primary key:** `id`
- **Important fields:** campaign reference, selected asset references, offer, CTA, age group, gender, language, channels, output types, readiness, created/updated timestamps.
- **Foreign keys:** campaign; optional assets through join table later.
- **Relationship cardinality:** belongs to one campaign; may be referenced by many campaign content outputs.
- **Snapshot fields:** selected strategy recommendations, product display values, channel assumptions, asset summaries.
- **Notes / caveats:** should not own product or asset canonical data.

### campaign_content_outputs

- **Purpose:** Editable campaign outputs such as captions, scripts, ad copy, story text, or other channel-ready drafts.
- **Primary key:** `id`
- **Important fields:** campaign reference, campaign brief reference, type, channel, content body, status, review status, prompt/template snapshot, model route snapshot, created/updated timestamps.
- **Foreign keys:** campaign, campaign brief; optional prompt template/model route references later.
- **Relationship cardinality:** belongs to campaign; references one brief; has many review findings.
- **Snapshot fields:** prompt/template version, generation context, model route metadata, source brief values.
- **Notes / caveats:** no hidden prompt or raw model details should leak to customer-facing UI.

### review_findings

- **Purpose:** Review decisions, requested changes, warnings, approvals, and rejection reasons.
- **Primary key:** `id`
- **Important fields:** content output reference, campaign reference, status, severity, finding text snapshot, reviewer reference, created/resolved timestamps, required action.
- **Foreign keys:** campaign content output; campaign can be denormalized/reference for querying.
- **Relationship cardinality:** belongs to one content output; feeds publishing readiness.
- **Snapshot fields:** finding text, status, reviewer decision, severity.
- **Notes / caveats:** review actions must be auditable.

### publishing_readiness

- **Purpose:** Scheduling/publishing readiness checklist and blocked/warning state.
- **Primary key:** `id`
- **Important fields:** campaign reference, content output reference, content approved, asset rights satisfied, channel connected, schedule ready, review status, blocked reasons, warnings, updated timestamp.
- **Foreign keys:** campaign, campaign content output; optional review finding references.
- **Relationship cardinality:** belongs to campaign/content output; consumes review findings and asset rights.
- **Snapshot fields:** readiness result at scheduling decision time.
- **Notes / caveats:** does not execute real publishing.

### model_providers

- **Purpose:** AI provider availability, access mode, credential reference, endpoint scope, capabilities, and configured available models.
- **Primary key:** `id`
- **Important fields:** workspace reference, provider type, delivery channel, environment, auth type, secret reference, base URL, scope fields, endpoint fields, capabilities, available model fields, webhook settings, readiness.
- **Foreign keys:** workspace.
- **Relationship cardinality:** belongs to workspace; referenced by model routes.
- **Snapshot fields:** provider readiness may be snapshotted into workflow runs.
- **Notes / caveats:** stores secret references only, never secret values.

### model_routes

- **Purpose:** Task-level model routing decisions.
- **Primary key:** `id`
- **Important fields:** workspace reference, task type, primary model/provider reference, fallback model references, retry policy, timeout, external tools allowed, human review required, route health, status.
- **Foreign keys:** workspace, model provider; optional cost policy.
- **Relationship cardinality:** belongs to workspace; references provider; used by workflow runs.
- **Snapshot fields:** route used by a workflow/content output should be snapshotted.
- **Notes / caveats:** model routing owns model selection, not Secrets/Keys.

### prompt_templates

- **Purpose:** Governed prompt/template versions used by workflow steps.
- **Primary key:** `id`
- **Important fields:** workspace reference, name, version, owner, task, status, required checks, blocked patterns, allowed outputs, usage links, review requirement.
- **Foreign keys:** workspace.
- **Relationship cardinality:** belongs to workspace; used by workflow runs and content generation context.
- **Snapshot fields:** prompt/template version used by content output or workflow step.
- **Notes / caveats:** raw hidden policy/prompt internals should not be customer-facing.

### workflow_runs

- **Purpose:** Future execution record for chained processing steps.
- **Primary key:** `id`
- **Important fields:** workspace reference, workflow type, input source, step list, artifact list, status, blocked reasons, warnings, cost estimate, action log, started/completed timestamps.
- **Foreign keys:** workspace; optional campaign/content/model route/prompt references depending workflow type.
- **Relationship cardinality:** belongs to workspace; can reference many routes/templates through step records or JSON-like conceptual structure.
- **Snapshot fields:** route health, prompt/template version, cost estimate, output destination, review requirement.
- **Notes / caveats:** V1 conceptual only; no real execution engine.

### cost_policies

- **Purpose:** Cost thresholds, approval requirements, forecast warnings, and throttling rules.
- **Primary key:** `id`
- **Important fields:** workspace reference, task type, model route reference, monthly budget, max cost per run, approval above, forecast, auto throttle, status.
- **Foreign keys:** workspace, optional model route.
- **Relationship cardinality:** belongs to workspace; may apply to one or more model routes depending final design.
- **Snapshot fields:** cost policy values used by workflow run.
- **Notes / caveats:** no real cost metering in prototype.

### audit_events

- **Purpose:** Record material state transitions and governance-relevant events.
- **Primary key:** `id`
- **Important fields:** workspace reference, actor reference, entity type, entity ID, action, severity, timestamp, metadata, result.
- **Foreign keys:** workspace.
- **Relationship cardinality:** belongs to workspace; polymorphic target reference by entity type and ID.
- **Snapshot fields:** event payload should capture before/after summary where appropriate.
- **Notes / caveats:** required for review, publishing, provider, routing, connector, and policy actions.

## 5. Post-V1 / Extended ERD Scope

### connector_configs

- **Why deferred:** requires backend connector execution, secrets, provider compliance, and API contracts.
- **Dependencies:** backend secret vault, provider contracts, compliance policy.
- **Consumer screens/features:** Data Sources Hub, Store Setup, Social Intelligence, Dashboard.
- **Governance caveats:** no frontend tokens; no unauthorized scraping.

### connector_runs

- **Why deferred:** depends on async job execution and provider status handling.
- **Dependencies:** connector configs, job runner, webhook/polling handling.
- **Consumer screens/features:** Data Sources Hub, Social Intelligence reports, audit.
- **Governance caveats:** run failures and compliance blocks must be auditable.

### raw_source_payloads

- **Why deferred:** needs retention policy and storage design.
- **Dependencies:** connector runs, object/blob storage, data classification.
- **Consumer screens/features:** normalization pipeline, audit/debug, social intelligence.
- **Governance caveats:** raw data must not be used directly in customer content.

### normalized_signals

- **Why deferred:** depends on agreed raw payload schemas and enrichment pipeline.
- **Dependencies:** raw payloads, classifiers, entity extraction, embeddings.
- **Consumer screens/features:** Social intelligence, Store strategy, Product priority, Asset gaps.
- **Governance caveats:** must include confidence and limitations.

### social_store_intelligence_reports

- **Why deferred:** depends on connector execution and normalized signals.
- **Dependencies:** connector runs, normalized signals, AI/report generation, compliance review.
- **Consumer screens/features:** Store Setup, Dashboard, Campaign Wizard, Asset Library, Content Studio.
- **Governance caveats:** must include source run, confidence, limitations, and no unsupported data claims.

### performance_summaries

- **Why deferred:** needs analytics ingestion and campaign/content identity finalization.
- **Dependencies:** publishing integrations, analytics sources, campaign/content IDs.
- **Consumer screens/features:** Dashboard, Analytics, Store strategy refresh.
- **Governance caveats:** simulated analytics must not be mixed with real metrics.

### scheduled_sync_jobs

- **Why deferred:** requires backend scheduler and connector execution.
- **Dependencies:** connector configs, job runner, retry policy, audit.
- **Consumer screens/features:** Data Sources Hub, Social Intelligence, Dashboard.
- **Governance caveats:** schedules must respect platform terms and rate limits.

### oauth_connections

- **Why deferred:** requires auth/security design and provider approval.
- **Dependencies:** OAuth app registration, redirect handling, token vault, permission scopes.
- **Consumer screens/features:** Data Sources Hub, Settings, channel connections.
- **Governance caveats:** tokens cannot be stored in frontend or exposed through UI.

### external_platform_accounts

- **Why deferred:** depends on official/external connector identity model.
- **Dependencies:** OAuth or connector provider mappings.
- **Consumer screens/features:** Social intelligence, publishing, analytics.
- **Governance caveats:** external IDs must remain separate from internal IDs.

### embedding_index_items

- **Why deferred:** requires vector storage and embedding policy.
- **Dependencies:** embeddings model, indexing pipeline, retention policy.
- **Consumer screens/features:** product/asset matching, content reuse, search.
- **Governance caveats:** embeddings must respect data retention and deletion rules.

### strategy_refresh_requests

- **Why deferred:** requires strategy versioning and human confirmation workflow.
- **Dependencies:** StoreStrategicPlan versioning, analytics/social reports, review workflow.
- **Consumer screens/features:** Store Setup, Dashboard, Campaign Wizard.
- **Governance caveats:** strategy refresh should not silently mutate campaign assumptions.

## 6. Relationship Map

```text
Workspace
-> StoreProfile
-> Products
-> Assets
-> StoreStrategicPlan
-> ProductMarketingPriorities
-> AssetGapReports
-> Campaigns
-> CampaignBrief
-> CampaignContentOutputs
-> ReviewFindings
-> PublishingReadiness

Workspace
-> ModelProviders
-> ModelRoutes
-> CostPolicies
-> WorkflowRuns

Workspace
-> PromptTemplates
-> WorkflowRuns
-> CampaignContentOutputs

Workspace
-> AuditEvents
```

Post-V1 connector relationship:

```text
ConnectorConfig
-> ConnectorRun
-> RawSourcePayload
-> NormalizedSignal
-> SocialStoreIntelligenceReport
-> StoreStrategicPlan / CampaignSuggestions / AssetGapReport
```

Required relationship statements:

- Workspace has one or many StoreProfile depending on open question.
- Workspace has many Products.
- Workspace has many Assets.
- Workspace has many Campaigns.
- Workspace has many ModelProviders.
- Workspace has many ModelRoutes.
- Workspace has many PromptTemplates.
- Workspace has many AuditEvents.
- StoreProfile belongs to Workspace.
- StoreProfile feeds StoreStrategicPlan.
- StoreProfile references Products and Assets through derived reports.
- Product belongs to Workspace/StoreProfile.
- Product is referenced by Campaign.
- Product is referenced by Asset when linked.
- Product is evaluated by ProductMarketingPriority.
- Asset belongs to Workspace.
- Asset optionally references Product.
- Asset is evaluated by AssetGapReport.
- Asset may be referenced by CampaignBrief or CampaignContentOutput.
- StoreStrategicPlan belongs to Workspace/StoreProfile.
- StoreStrategicPlan is derived from StoreProfile, Products, Assets, Social Intelligence, and policy inputs.
- StoreStrategicPlan feeds Dashboard and CampaignWizard.
- StoreStrategicPlan must not be auto-mutated by Campaign.
- Campaign belongs to Workspace.
- Campaign references Product.
- Campaign has one CampaignBrief.
- Campaign has many CampaignContentOutputs.
- Campaign has many ReviewFindings through content outputs.
- Campaign has PublishingReadiness.
- CampaignBrief belongs to Campaign.
- CampaignBrief snapshots selected strategy recommendations.
- CampaignBrief snapshots product name/price/channel assumptions where needed.
- CampaignContentOutput belongs to Campaign.
- CampaignContentOutput references CampaignBrief.
- CampaignContentOutput snapshots prompt/template version and generation context.
- ReviewFinding references CampaignContentOutput.
- ReviewFinding feeds PublishingReadiness.
- ConnectorRun references ConnectorConfig.
- ConnectorRun creates RawSourcePayload.
- ConnectorRun creates NormalizedSignal.
- ConnectorRun feeds SocialStoreIntelligenceReport.

## 7. Reference vs Snapshot Rules

- Product is referenced by ID, but product name/price used in a campaign must be snapshotted.
- Campaign snapshots strategic recommendations at creation time.
- Campaign must not mutate StoreStrategicPlan automatically.
- CampaignContentOutput snapshots prompt/template version.
- CampaignContentOutput snapshots model route and generation context where applicable.
- ReviewFinding snapshots finding text and status.
- SocialStoreIntelligenceReport includes sourceRunId, confidence, limitations.
- Raw payload must not be used directly in customer-facing content.
- PublishingReadiness references live review/asset/channel state but snapshots readiness at the scheduling decision.
- PerformanceSummary aggregates by campaignId/channel/time window and should preserve the reporting window.

## 8. Cardinality Summary Table

| Entity A | Relationship | Entity B | Cardinality | V1/Post-V1 | Notes |
|---|---|---|---|---|---|
| Workspace | has | StoreProfile | 1 to 1 or many | V1 | Multi-store unresolved |
| Workspace | has | Product | 1 to many | V1 | Product belongs to store context |
| Workspace | has | Asset | 1 to many | V1 | Asset may link to product |
| Workspace | has | Campaign | 1 to many | V1 | Campaign references product |
| Workspace | has | ModelProvider | 1 to many | V1 | Secret references only |
| Workspace | has | ModelRoute | 1 to many | V1 | Route owns model selection |
| Workspace | has | PromptTemplate | 1 to many | V1 | Versioned prompts |
| Workspace | has | AuditEvent | 1 to many | V1 | Governance trail |
| StoreProfile | feeds | StoreStrategicPlan | 1 to many | V1 | Versioning likely |
| Product | referenced by | Campaign | 1 to many | V1 | Campaign snapshots display values |
| Product | linked by | Asset | 1 to many optional | V1 | Asset can be general |
| Product | evaluated by | ProductMarketingPriority | 1 to many | V1 | Persisted or generated decision pending |
| Asset | evaluated by | AssetGapReport | many to many conceptual | V1 | Gaps can be product-level or general |
| StoreStrategicPlan | feeds | Campaign | 1 to many | V1 | Campaign snapshots recommendations |
| Campaign | has | CampaignBrief | 1 to 1 | V1 | One active brief for V1 |
| Campaign | has | CampaignContentOutput | 1 to many | V1 | Editable outputs |
| CampaignContentOutput | has | ReviewFinding | 1 to many | V1 | Review history |
| ReviewFinding | feeds | PublishingReadiness | many to 1 | V1 | Readiness consumes review status |
| CampaignContentOutput | has | PublishingReadiness | 1 to 1 or many | V1 | Per output or schedule item decision pending |
| ModelProvider | used by | ModelRoute | 1 to many | V1 | Provider availability supports route health |
| ModelRoute | governed by | CostPolicy | many to 1 or 1 to 1 | V1 | Final design pending |
| PromptTemplate | used by | WorkflowRun | many to many | V1 | Usually through workflow steps |
| ModelRoute | used by | WorkflowRun | many to many | V1 | Usually through workflow steps |
| ConnectorConfig | has | ConnectorRun | 1 to many | Post-V1 | Backend connector required |
| ConnectorRun | creates | RawSourcePayload | 1 to many | Post-V1 | Retention policy required |
| RawSourcePayload | normalizes to | NormalizedSignal | 1 to many | Post-V1 | Confidence required |
| NormalizedSignal | feeds | SocialStoreIntelligenceReport | many to 1 | Post-V1 | Source run/provenance required |
| PerformanceSummary | aggregates | CampaignContentOutput | many to many conceptual | Post-V1 | Analytics model later |

## 9. Table Candidate Details

Table: workspaces

- id
- workspace_name
- locale
- timezone
- plan_status
- created_at
- updated_at

Table: store_profiles

- id
- workspace_id
- store_name
- store_url
- category
- activity
- language
- tone
- audience_defaults
- policy_answers
- preferred_channels
- setup_status
- created_at
- updated_at

Table: products

- id
- workspace_id
- store_id
- product_name
- category
- description
- price
- image_url
- video_url
- readiness_status
- flags
- claims
- status
- created_at
- updated_at

Table: assets

- id
- workspace_id
- product_id
- asset_name
- asset_type
- url
- thumbnail_url
- linked_type
- linked_name_snapshot
- channel
- rights_status
- quality
- tags
- notes
- status
- created_at
- updated_at

Table: store_strategic_plans

- id
- workspace_id
- store_id
- generated_at
- readiness_stage
- identity_strength
- product_clarity
- asset_readiness
- channel_readiness
- risk_level
- audience_strategy
- channel_strategy
- messaging_strategy
- plan_30_60_90
- confidence
- limitations
- source_summary
- created_at
- updated_at

Table: product_marketing_priorities

- id
- workspace_id
- store_id
- product_id
- strategic_plan_id
- priority_level
- reason
- best_channel
- suggested_content_type
- required_gap
- confidence
- limitations
- generated_at

Table: asset_gap_reports

- id
- workspace_id
- store_id
- product_id
- strategic_plan_id
- missing_asset_type
- reason
- priority
- suggested_channel
- confidence
- limitations
- generated_at

Table: campaigns

- id
- workspace_id
- store_id
- product_id
- campaign_name
- objective
- channel_set
- status
- product_snapshot
- strategic_snapshot_json
- created_at
- updated_at

Table: campaign_briefs

- id
- campaign_id
- selected_asset_refs
- offer
- cta
- age_group
- gender
- language
- channels
- output_types
- readiness_status
- strategy_recommendation_snapshot
- product_assumption_snapshot
- created_at
- updated_at

Table: campaign_content_outputs

- id
- campaign_id
- campaign_brief_id
- output_type
- channel
- content_body
- status
- review_status
- prompt_template_snapshot
- model_route_snapshot
- generation_context_snapshot
- created_at
- updated_at

Table: review_findings

- id
- campaign_id
- content_output_id
- status
- severity
- finding_text_snapshot
- reviewer_id
- required_action
- created_at
- resolved_at

Table: publishing_readiness

- id
- campaign_id
- content_output_id
- content_approved
- asset_rights_satisfied
- channel_connected
- schedule_ready
- review_status
- blocked_reasons
- warnings
- readiness_snapshot
- updated_at

Table: model_providers

- id
- workspace_id
- provider_type
- delivery_channel
- environment
- auth_type
- secret_reference
- base_url
- credential_scope
- endpoint_scope
- capabilities
- available_models
- webhook_settings
- readiness_status
- created_at
- updated_at

Table: model_routes

- id
- workspace_id
- model_provider_id
- task_type
- primary_model
- fallback_models
- retry_policy
- timeout
- cost_policy_id
- external_tools_allowed
- human_review_required
- route_health_status
- created_at
- updated_at

Table: prompt_templates

- id
- workspace_id
- prompt_name
- version
- owner
- task
- status
- required_checks
- blocked_patterns
- allowed_outputs
- usage_links
- review_requirement
- created_at
- updated_at

Table: workflow_runs

- id
- workspace_id
- workflow_type
- input_source
- step_list
- artifact_list
- status
- blocked_reasons
- warnings
- cost_estimate
- action_log
- started_at
- completed_at
- created_at
- updated_at

Table: cost_policies

- id
- workspace_id
- model_route_id
- task_type
- monthly_budget
- max_cost_per_run
- approval_above
- forecast
- auto_throttle
- status
- created_at
- updated_at

Table: audit_events

- id
- workspace_id
- actor_id
- entity_type
- entity_id
- action
- severity
- event_timestamp
- metadata_snapshot
- result

## 10. Identity and Naming Rules

- Never use product name as identity.
- Never use asset file name as identity.
- User-facing labels are not canonical IDs.
- External platform IDs must be stored separately from internal IDs.
- Raw connector IDs must not leak into UI.
- IDs must be stable and opaque.
- Display names may be snapshotted for historical readability.
- Internal IDs should not be used as visible user-facing labels.
- Connector provider run references are external references, not Nashir IDs.
- Campaign/content identity must be stable before analytics, review, and publishing contracts are finalized.

## 11. Governance and Audit ERD Requirements

- `audit_events` should capture material state transitions.
- Review/publishing decisions must be auditable.
- Model route changes must be auditable.
- Provider/secret reference changes must be auditable.
- Connector runs and failures must be auditable in Post-V1.
- No secret values in database tables except secret references.
- Publishing readiness changes should preserve the reason for blocked/warning/approved states.
- Prompt/template status changes should preserve version and reviewer context.
- Cost policy changes should preserve thresholds before/after.
- Strategy refreshes should preserve generatedAt, source references, confidence, and limitations.

## 12. ERD Risks and Open Issues

- Single-store vs multi-store workspace is unresolved if not yet decided.
- Product import source handling is unresolved.
- Asset storage model needs object storage design.
- Social connector raw payload retention policy is unresolved.
- Analytics model needs later reconciliation.
- Campaign/content identity must be finalized before API contract.
- Strategy versioning may be required.
- ProductMarketingPriority and AssetGapReport persistence vs on-demand generation is not final.
- Publishing integration entities should wait for publishing contract.
- User/role/reviewer identity model needs a dedicated access-control reconciliation.

## 13. V1 NO-GO List

- No connector execution tables in V1 unless backend connector scope is approved.
- No raw payload storage without retention policy.
- No social scraping storage without compliance approval.
- No publishing execution table before publishing integration contract.
- No AI output writing directly to canonical facts without review.
- No storing secret values.
- No SQL schema until this conceptual ERD is reviewed.
- No OpenAPI contract until identity/reference/snapshot rules are reflected.
- No analytics ingestion schema until campaign/content identity is finalized.
- No object storage schema until asset storage design is approved.

## 14. Recommended Next Gates

1. API Contract Gate.
2. SQL Schema Planning Gate.
3. Connector Contract Gate.
4. AI Orchestration Contract Gate.
5. QA/Test Plan Gate.

## 15. Final Position

This ERD reconciliation model is suitable for review and planning.

It is not an executable database schema.

SQL must not be written until this model is reviewed and accepted.
