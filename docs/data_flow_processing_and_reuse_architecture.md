# Data Flow, Processing, and Reuse Architecture

## 1. Executive Decision

**GO for architecture documentation.**

**NO-GO for backend implementation until data flow, ERD, and API contracts are reconciled.**

This document defines the intended data movement, processing order, connector responsibilities, AI processing boundaries, reuse rules, and governance requirements for Nashir. It is a planning artifact for implementation readiness and does not authorize backend work by itself.

## 2. Purpose

This document defines how Nashir should handle:

- Data sources.
- Ingestion patterns.
- Processing stages.
- External connectors.
- AI tasks.
- Deterministic rules.
- Processed outputs.
- Reuse across product surfaces.
- Governance and safety controls.
- V1 implementation boundaries.

The goal is to prevent each screen or workflow from inventing its own data ownership model. Store setup, product catalog, asset library, campaign creation, content review, publishing readiness, analytics, and social intelligence must share a consistent architecture before backend/API/database implementation begins.

## 3. Data Source Categories

Nashir data sources fall into these categories:

- **User-entered store data:** store name, activity, category, audience, language, tone, policies, claims, preferred channels, and setup readiness.
- **Product catalog:** product names, categories, descriptions, prices, image/video URLs, readiness, and campaign suitability.
- **Asset library:** reusable images, videos, logos, documents, text assets, usage channel, quality, rights status, and product linkage.
- **Campaign data:** campaign brief, selected product, selected assets, offer, CTA, audience controls, channels, requested outputs, and campaign status.
- **Content/review data:** generated or drafted content outputs, edits, review status, preview state, approval notes, rejection reasons, and publishing readiness.
- **Social sources:** Instagram, TikTok, TikTok Shop, and Meta/Instagram Shop.
- **Website/ecommerce sources:** public store pages, product pages, ecommerce catalogs, landing pages, checkout/policy pages, and website metadata.
- **Analytics sources:** campaign metrics, content performance, publishing results, product engagement, channel performance, and dashboard summaries.
- **External connector providers:** Official APIs, Apify, PhantomBuster, Firecrawl, Browserless, Bright Data / Enterprise, and Custom Connector.

## 4. Data Flow Overview

The target data flow is:

**Source -> Connector -> Raw Payload -> Normalization -> Enrichment -> Intelligence Output -> Review/Governance -> Reuse**

The flow should be interpreted as:

1. A source provides user-entered, platform, website, product, asset, campaign, or analytics data.
2. A connector or UI input captures the data through an approved ingestion pattern.
3. The system stores the raw payload for traceability where legally allowed.
4. The system normalizes the payload into internal data contracts.
5. Enrichment adds classification, extracted entities, product/asset links, risk flags, summaries, and confidence.
6. Intelligence outputs are generated as reusable reports or structured recommendations.
7. Review and governance controls decide which outputs can be reused, shown, edited, published, or escalated.
8. Approved outputs become inputs to downstream screens and workflows.

## 5. Ingestion Patterns

Nashir should support these ingestion patterns:

- **Manual user input:** store setup, products, assets, campaign brief, review notes, and policy answers entered by users.
- **Official API connector:** approved platform API integration with explicit permissions, scoped credentials, and documented rate limits.
- **External connector provider:** provider-based ingestion through Apify, PhantomBuster, Firecrawl, Browserless, Bright Data / Enterprise, or Custom Connector, subject to compliance review.
- **File/asset upload:** user-provided images, videos, documents, product media, thumbnails, and brand materials.
- **Scheduled sync:** backend-scheduled connector runs for approved sources.
- **Webhook callback:** provider status updates, run completion, delivery events, and async result notifications.
- **Polling result:** backend polling for connector jobs where webhook callbacks are unavailable or unreliable.

The frontend must not execute real scraping, hold platform tokens, store credential values, run connector jobs directly, or bypass platform rules. Any real connector execution belongs to a backend service with secret storage, audit logging, compliance rules, and rate-limit controls.

## 6. Connector Execution Flow

The target connector execution flow is:

1. **Create connector config:** user selects platform, provider, operation type, schedule, output map, compliance level, and secret reference.
2. **Validate secret reference:** backend confirms the referenced credential exists and is usable without exposing the value to the frontend.
3. **Start connector run:** backend creates a run against the official API or approved external provider.
4. **Receive status/webhook:** backend receives progress, success, failure, rate-limit, or compliance status.
5. **Fetch dataset/result:** backend retrieves provider results, datasets, screenshots, extracted pages, or API responses.
6. **Store raw payload:** raw input is stored with provenance, timestamp, connector run metadata, and retention policy.
7. **Normalize:** raw data is converted into platform-neutral contracts for accounts, posts, products, comments, media, questions, campaigns, or metrics.
8. **Enrich:** classification, summaries, product matching, asset gap detection, risk flags, and confidence scoring are applied.
9. **Generate report:** intelligence outputs such as SocialStoreIntelligenceReport or AssetGapReport are created.
10. **Publish result to UI state/API response:** approved or review-ready outputs become available to Store Setup, Dashboard, Campaign Wizard, Asset Library, Content Studio, and other product surfaces.

## 7. Processing Pipeline

The processing pipeline should run in this order unless a workflow explicitly defines a different dependency:

1. **Raw ingestion:** capture source data, connector metadata, timestamps, and provenance.
2. **Validation:** check source completeness, permissions, schema shape, file type, size, and allowed processing policy.
3. **Deduplication:** remove duplicate products, repeated assets, duplicated posts, repeated comments, repeated runs, or identical payload fragments.
4. **Normalization:** map raw fields into internal contracts with stable naming and platform-neutral structure.
5. **Classification:** classify product categories, content type, platform, media format, message intent, campaign objective, and risk level.
6. **Entity extraction:** extract product names, prices, claims, questions, objections, URLs, channels, handles, hashtags, and policy references.
7. **Vision analysis:** inspect images/videos for product visibility, brand fit, quality, thumbnail suitability, content type, and rights-sensitive signals.
8. **Embeddings/linking:** link products to assets, comments to products, campaign outputs to source products, and repeated concepts across sources.
9. **Risk review:** detect unsupported claims, rights issues, unsafe outputs, customer-visible content risks, missing approvals, and policy gaps.
10. **Strategic/report generation:** produce strategy, social intelligence, product priority, asset gaps, campaign brief suggestions, publishing readiness, and performance summaries.
11. **Human review:** review customer-visible outputs, publishing actions, high-risk claims, external integrations, and any output that feeds another workflow.

## 8. Tool and Model Mapping

| Task | Primary tool/model | Alternatives | Deterministic fallback | Human review required |
|---|---|---|---|---|
| Store strategy and reasoning | gpt-5.5 | gpt-5.4-mini for concise summaries | Rule-based readiness scoring | Yes for launch recommendations |
| Campaign brief generation | gpt-5.5 | gpt-5.4-mini for variants | Template-based brief rows | Yes before publishing |
| Content draft generation | gpt-5.5 | gpt-5.4-mini for low-risk copy | Static campaign templates | Yes for customer-visible output |
| Classification and summaries | gpt-5.4-mini | gpt-5.5 for complex cases | Keyword/rule classifier | Review for risky categories |
| Image/video understanding | Vision model | Provider-specific vision model | Manual asset metadata | Yes for rights-sensitive or customer-visible assets |
| Product/asset matching | Embeddings | gpt-5.4-mini semantic matching | Exact name/category matching | Review when confidence is low |
| Readiness, cost, approval rules | Rule engine | Workflow policy evaluator | Static checklist | Yes when blocked or high-risk |
| Official/social/web data ingestion | Connectors | Custom Connector | Manual user input | Compliance review required |
| Async orchestration | Scheduler/queue | Provider job runner | Manual run trigger | Review for external actions |
| Publishing readiness | Rule engine | gpt-5.5 for explanation | Checklist status | Yes before real publishing |

## 9. Core Data Products

### StoreStrategicPlan

- **Inputs:** store setup, category, products, channels, policies, audience, simulated or real scan results, and analytics when available.
- **Processing:** readiness scoring, product prioritization, channel grouping, messaging strategy, risk/gap detection, and 30/60/90 plan generation.
- **Consumers:** StoreSetupPage, DashboardPage, CampaignWizardPage, ProductCatalogPage, AssetLibraryPage.
- **Reuse rules:** feeds suggestions and summaries only; campaigns do not automatically rewrite the store plan.
- **Refresh trigger:** store setup changes, product catalog changes, channel readiness changes, policy updates, or approved analytics refresh.

### SocialStoreIntelligenceReport

- **Inputs:** approved social connector outputs, account metadata, posts, comments, product mentions, media, questions, and platform metrics.
- **Processing:** account strength, bio/link clarity, content format detection, product visibility, FAQ extraction, objection extraction, asset gap detection, campaign opportunity ranking, and confidence/limitations.
- **Consumers:** StoreSetupPage, DashboardPage, CampaignWizardPage, AssetLibraryPage, ContentStudioPage.
- **Reuse rules:** informs suggestions and gaps; does not prove live social performance unless connected to verified data.
- **Refresh trigger:** scheduled connector sync, manual approved sync, webhook completion, or user-requested refresh.

### ProductMarketingPriority

- **Inputs:** product catalog fields, category, image/video availability, product flags, readiness, sales/analytics later, and social intelligence later.
- **Processing:** priority level, reason, best channel, suggested content type, and missing data/assets.
- **Consumers:** ProductCatalogPage, CampaignWizardPage, DashboardPage, StoreSetupPage.
- **Reuse rules:** guides campaign creation; does not force campaign selection.
- **Refresh trigger:** product create/update, media changes, asset linkage changes, strategy refresh, or analytics refresh.

### AssetGapReport

- **Inputs:** asset library, product catalog, product priorities, campaign needs, social intelligence report, and rights/quality status.
- **Processing:** missing image/video/thumbnail/UGC-style asset detection, product linkage, priority, reason, and channel suitability.
- **Consumers:** AssetLibraryPage, CampaignWizardPage, ContentStudioPage, StoreSetupPage.
- **Reuse rules:** suggests asset creation/linking; does not imply legal clearance.
- **Refresh trigger:** asset upload/update, product media update, campaign output requirements, social report refresh, or rights review changes.

### CampaignBrief

- **Inputs:** selected product, store strategy, product priority, selected assets, CTA, audience controls, channels, and campaign objective.
- **Processing:** structured brief, output requirements, readiness checks, asset coverage, and review requirements.
- **Consumers:** CampaignWizardPage, CampaignsUnifiedPage, ContentStudioPage, ContentReviewPreviewUnifiedPage.
- **Reuse rules:** campaign-owned plan; can reference store strategy but does not mutate it.
- **Refresh trigger:** campaign draft save, selected product change, asset selection change, or output requirements change.

### CampaignContentOutput

- **Inputs:** CampaignBrief, selected channels, output types, approved assets, product metadata, and content templates/model outputs.
- **Processing:** draft generation, editable text/media output, channel formatting, review readiness, and status transitions.
- **Consumers:** ContentStudioPage, ContentReviewPreviewUnifiedPage, PublishingQueuePage, CampaignsUnifiedPage.
- **Reuse rules:** can be edited and reviewed; should not be published without explicit approval.
- **Refresh trigger:** campaign output generation, content edit, review request, approval, rejection, or campaign update.

### ReviewFinding

- **Inputs:** campaign content output, asset rights, product claims, policies, platform rules, review comments, and governance checks.
- **Processing:** approval status, requested changes, blocked reasons, warnings, and reviewer notes.
- **Consumers:** ContentReviewPreviewUnifiedPage, PublishingQueuePage, CampaignsUnifiedPage, DashboardPage.
- **Reuse rules:** review findings gate publishing readiness and can inform campaign/content revisions.
- **Refresh trigger:** review action, content edit, asset rights update, policy update, or publishing readiness check.

### PublishingReadiness

- **Inputs:** approved content, review findings, asset rights, channel readiness, scheduling state, and policy controls.
- **Processing:** checklist status, blocked reasons, warnings, schedule readiness, and required approvals.
- **Consumers:** PublishingQueuePage, CampaignsUnifiedPage, DashboardPage.
- **Reuse rules:** determines scheduling/publishing readiness; does not execute publishing by itself.
- **Refresh trigger:** content approval, asset rights update, channel connection update, schedule change, or policy change.

### PerformanceSummary

- **Inputs:** campaign metrics, content metrics, channel metrics, product analytics, publishing results, and cost data later.
- **Processing:** trend summaries, best/worst performers, opportunities, risks, and strategy refresh inputs.
- **Consumers:** DashboardPage, AnalyticsPage, StoreSetupPage strategy refresh, CampaignsUnifiedPage.
- **Reuse rules:** informs future strategy and optimization; should not automatically alter campaigns without confirmation.
- **Refresh trigger:** analytics ingestion, scheduled report, campaign completion, or manual refresh.

## 10. Reuse Rules

- The strategic plan feeds campaign suggestions, but campaigns do not auto-update the strategic plan.
- Social intelligence feeds content suggestions and asset gaps.
- Product priority feeds Campaign Wizard product suggestions and Product Catalog marketing priority.
- Asset gaps feed Asset Library, Campaign Wizard, and Content Studio.
- Review findings feed Publishing Queue readiness.
- Analytics feed strategy refresh later, but refresh should require clear user confirmation for meaningful plan changes.
- Raw connector data must not be used directly in customer-facing outputs.
- Normalized and enriched data should carry confidence, provenance, timestamp, and limitations.
- AI-generated outputs must be editable and reviewable before downstream use.
- Customer-visible or publishing-bound outputs must pass review and policy gates.

## 11. Governance and Safety

Nashir must follow these governance rules:

- No unauthorized scraping.
- Official APIs are preferred when permissions are available.
- External connector providers require compliance review.
- No secrets in frontend code, UI state, browser storage, or client-visible payloads.
- No raw data directly used in customer outputs.
- AI output requires confidence, limitations, and review status.
- Publishing requires human review.
- Tokens are stored only in a backend secret vault later.
- Audit logs are required for connector runs, AI processing, review actions, policy changes, and publishing actions.
- External integrations require explicit approval and scoped permissions.
- Data retention and deletion policies must be defined before production ingestion.
- Customer-visible claims must be traceable to product data, policy answers, or approved user input.

## 12. V1 Scope

V1 should include:

- Document contracts for source data, raw payloads, normalized records, intelligence outputs, and review states.
- UI references that clearly distinguish prototype state from production execution.
- Connector configuration model.
- Raw payload model.
- Normalized data model.
- Intelligence report model.
- Review and governance state model.
- Reuse rules between store strategy, social intelligence, products, assets, campaigns, content, review, publishing, and analytics.
- No real connector execution until backend approval.
- No real token handling until backend secret vault and auth contracts exist.
- No real publishing until platform integrations, approval gates, and audit logs are implemented.

## 13. Post-V1 / Extended Scope

Post-V1 can include:

- Official OAuth connectors.
- Scheduled sync.
- Webhook processing.
- Media pipeline for image/video storage, thumbnailing, transcoding, and rights metadata.
- Embeddings search for product/asset/content matching.
- Advanced analytics feedback loop.
- Automated strategy refresh with human confirmation.
- Cross-platform social intelligence benchmarking.
- Multi-tenant connector governance.
- Cost-aware AI orchestration.
- Full audit and observability layer.

## 14. Open Questions

- Which connector providers are approved?
- Which platforms enter V1 first?
- What data can be legally collected?
- What retention policy is required?
- What confidence threshold allows campaign suggestions?
- Which outputs need human approval?
- Which raw payloads must be stored, and which should be discarded after normalization?
- What is the minimum identity model for store, product, asset, campaign, content, connector run, and artifact?
- Which analytics sources are required for the first production feedback loop?
- What user roles can configure connectors, approve outputs, and trigger publishing?

## 15. Next Gates

1. Data Entity and Identity Model Gate.
2. ERD Reconciliation Gate.
3. API Contract Gate.
4. Connector Contract Gate.
5. AI Orchestration Contract Gate.
6. QA/Test Plan Gate.
