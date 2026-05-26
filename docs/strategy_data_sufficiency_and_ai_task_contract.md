# Strategy Data Sufficiency and AI Task Contract

## 1. Executive Decision

GO for documenting strategy data sufficiency and AI task contracts.

NO-GO for API Contract Gate until this document is reviewed.

This document is documentation-only.

No backend, API, SQL, or AI execution is implemented here.

## 2. Purpose

This document defines the minimum data needed for `StoreStrategicPlan`, the required and optional V1 strategic fields, the AI task taxonomy, inference parameter requirements, the future `PromptTemplate` contract, output schema requirements, governance and review constraints, and the V1 vs Extended/Post-V1 boundaries.

It connects the product UX prototype to the implementation planning layer so API contracts can be written against explicit strategy and AI task requirements rather than inferred UI behavior.

## 3. Current Resolved Pre-API Blockers

The following blockers are now closed or mitigated:

- StoreStrategicPlan persistence.
- Campaign `productId` and `productSnapshot`.
- CampaignContentOutput `campaignId` and `campaignSnapshot`.
- AssetLibrary write consistency.
- Dashboard prototype store reflection.
- Workspace single-store V1 decision.
- Minimum identity model.

## 4. Strategic Plan Data Sufficiency

A useful store strategy requires enough data to distinguish facts from assumptions, identify product/channel priorities, detect gaps, and produce reviewable recommendations.

### A. Required V1 Fields

- `storeName`
- `businessCategory`
- `storeType`
- `primarySalesChannel`
- `targetAudience`
- `audienceLocation`
- `brandTone`
- `preferredChannels`
- products summary
- assets summary
- policies summary
- `businessGoal`
- `monthlyMarketingBudget` range
- `averageOrderValue` range
- `currentConversionRate` range or unknown
- `deliverySpeed`
- `returnsPolicy`

### B. Optional V1 Fields

- `competitorUrls`
- `topSellingProducts`
- gross margin band
- seasonality notes
- current follower count
- engagement rate estimate
- existing campaign notes

### C. Extended/Post-V1 Fields

- verified analytics performance
- social intelligence report
- connector-derived competitor data
- historical revenue trend
- full attribution
- ROI prediction
- automated strategy refresh

## 5. Field Classification Table

| Field | Purpose | Required in V1? | Source | Used by | Risk if missing | Notes |
|---|---|---:|---|---|---|---|
| `storeName` | Identifies the commercial store in strategy and outputs. | Yes | StoreProfile | StoreStrategicPlan, CampaignBrief | Generic outputs and weak brand context. | Display label, not identity. |
| `businessCategory` | Defines market/category assumptions. | Yes | StoreProfile | Strategy, product priorities, messaging | Poor channel and messaging recommendations. | Should use controlled categories later. |
| `storeType` | Determines acquisition method and strategy context. | Yes | StoreProfile | Data acquisition, strategy | Wrong connector and evidence assumptions. | Examples: independent ecommerce, Instagram-first, TikTok Shop. |
| `primarySalesChannel` | Defines main conversion destination. | Yes | StoreProfile | Channel strategy, CTA, publishing readiness | Campaign recommendations may target the wrong channel. | Must remain editable. |
| `businessGoal` | Frames the strategic objective. | Yes | StoreProfile / user input | Strategy, campaign suggestions | Plan may optimize for the wrong outcome. | Examples: sales, awareness, retention. |
| `monthlyMarketingBudget` | Sets channel and campaign scale. | Yes | StoreProfile / user input | Strategy, cost policy planning | Recommendations may be unrealistic. | Use ranges, not exact finance claims in V1. |
| `averageOrderValue` | Helps estimate campaign scale and CTA urgency. | Yes | StoreProfile / user input | Strategy, budget guidance | Weak prioritization and budget logic. | Range or unknown is acceptable. |
| `currentConversionRate` | Indicates funnel health. | Yes, may be unknown | User input / analytics later | Diagnosis, risk, next action | If missing, plan must state limitation. | Unknown is valid but lowers confidence. |
| `targetAudience` | Defines buyer segment. | Yes | StoreProfile | Audience strategy, messaging | Generic content and poor offer fit. | V1 may use controlled age/gender/location plus notes. |
| `audienceLocation` | Determines language, shipping, and channel context. | Yes | StoreProfile | Strategy, publishing readiness | Delivery and channel assumptions may be wrong. | Can be country/region/city band. |
| `brandTone` | Controls language style. | Yes | StoreProfile | Messaging, content generation | Content may violate brand voice. | Must be passed to content tasks. |
| `deliverySpeed` | Supports conversion risk and CTA promises. | Yes | StoreProfile policies | Risk review, messaging | AI may make unsafe delivery claims. | Must constrain outputs. |
| `returnsPolicy` | Controls trust and claims. | Yes | StoreProfile policies | Risk review, messaging | Unsafe return/guarantee statements. | Must be summarized in evidence pack. |
| `competitorUrls` | Provides comparison context. | Optional V1 | User input | Strategy, positioning | Less precise differentiation. | Connector-derived competitor data is Post-V1. |
| `preferredChannels` | Sets campaign and content channels. | Yes | StoreProfile | Channel strategy, CampaignWizard | Campaign suggestions may not match user intent. | Channel readiness still needs review. |
| products summary | Defines what can be marketed. | Yes | ProductCatalog | Product priorities, campaign suggestions | Strategy may recommend nonexistent products. | Include product count, categories, media readiness, gaps. |
| assets summary | Defines media readiness. | Yes | AssetLibrary | Asset gaps, campaign readiness | Campaigns may be recommended without usable media. | Rights status must remain review-gated. |
| policies summary | Defines what claims/actions are allowed. | Yes | StoreProfile policies | Risk review, messaging, publishing readiness | Unsafe claims or unsupported offers. | Must be included in evidence pack. |
| social intelligence summary | Adds social context and content signals. | No, Post-V1 automation | SocialStoreIntelligenceReport later | Strategy refresh, content suggestions | Lower confidence for social-first stores. | V1 can show planning only. |
| analytics performance summary | Adds performance feedback. | Optional display in V1, Post-V1 for auto refresh | Analytics later | Strategy refresh, budget guidance | Strategy cannot learn from real performance. | No automatic strategy mutation in V1. |

## 6. Strategy Output Contract

`StoreStrategicPlan` output sections:

- diagnosis
- audience strategy
- product priorities
- channel strategy
- messaging strategy
- asset gaps
- campaign suggestions
- 30/60/90 day plan
- risks and limitations
- next action
- confidence scores
- sourceInputs summary
- generatedAt
- version
- status

`StoreStrategicPlan` must not mutate `StoreProfile` automatically.

Campaigns must snapshot recommendations when created.

Strategy refresh requires human confirmation.

## 7. AI Task Taxonomy

| Task | Purpose | Primary Input | Output | Model Capability Needed | Human Review Required? | V1/Post-V1 Status |
|---|---|---|---|---|---|---|
| `store_strategy_generation` | Generate store-level strategic plan. | Evidence pack from store/products/assets/policies. | StoreStrategicPlan. | Strategy/reasoning model. | Yes. | V1 contract. |
| `campaign_brief_generation` | Convert strategy/product/channel into campaign brief. | StoreStrategicPlan snapshot, product snapshot, campaign inputs. | CampaignBrief. | Strategy/content model. | Yes. | V1 contract. |
| `ad_copy_generation` | Draft ad copy. | CampaignBrief, brand tone, constraints. | CampaignContentOutput. | Content generation model. | Yes. | V1 contract. |
| `caption_generation` | Draft social captions. | CampaignBrief, channel, CTA. | Caption output. | Content generation model. | Yes. | V1 contract. |
| `content_rewrite` | Rewrite/edit content. | Existing content, requested change, constraints. | Revised content. | Content model. | Yes. | V1 contract. |
| `risk_review` | Detect unsafe claims or readiness blockers. | Content output, policies, rights status. | ReviewFinding. | Rules + classification model. | Yes. | V1 contract. |
| `brand_tone_check` | Check content against brand tone. | Content, brandTone. | Tone finding. | Fast classification model. | Sometimes. | V1 contract. |
| `content_classification` | Classify type/status/channel suitability. | Content item. | Labels and readiness flags. | Fast classification model. | No for internal labels; yes for blocking decisions. | V1 contract. |
| `asset_gap_detection` | Detect missing asset needs. | Product summary, asset summary, campaign plan. | AssetGapReport. | Rules + reasoning model. | Yes. | V1 contract. |
| `product_marketing_priority` | Rank products for campaign suitability. | Product summary, strategy, readiness. | ProductMarketingPriority. | Reasoning model + rules. | Yes. | V1 contract. |
| `analytics_summary` | Summarize performance. | Analytics summary. | PerformanceSummary text. | Summary model. | Yes before strategy mutation. | Post-V1 for feedback loop. |
| `customer_summary` | Produce customer-facing summaries. | Approved content or product facts. | Customer-visible text. | Content model. | Yes. | V1 contract. |
| `product_description_generation` | Draft product descriptions. | Product facts, policies, tone. | Product description draft. | Content model. | Yes. | V1 contract. |
| `image_prompt_generation` | Draft image generation prompt. | CampaignBrief, product/media constraints. | Image prompt. | Content/reasoning model. | Yes. | V1 contract, no real image generation required. |
| `video_script_generation` | Draft video script. | CampaignBrief, channel, duration. | Video script. | Content/reasoning model. | Yes. | V1 contract. |
| `embedding_generation` | Generate vectors for matching/search. | Product/asset/content summaries. | Embeddings. | Embeddings model. | No direct customer output. | Post-V1 unless needed for V1 matching. |

## 8. Model and Tool Mapping

| Task | Primary model/tool | Alternatives | Deterministic fallback | Human review required |
|---|---|---|---|---|
| Strategy generation | Strategy/reasoning model, example: gpt-5.5 | Another approved reasoning model | Template strategy from rules and completeness checks | Yes |
| Campaign brief generation | Strategy/content model, example: gpt-5.5 | Approved content model | Brief template from selected product/channel/CTA | Yes |
| Ad copy/caption/content | Content generation model, example: gpt-5.5 | Smaller approved content model | Channel-specific copy templates | Yes |
| Classification/summaries | Fast classification model, example: gpt-5.4-mini | Rules engine | Deterministic labels from fields/status | Sometimes |
| Image/video understanding | Vision-capable model | Human reviewer | Metadata-only readiness checks | Yes |
| Product/asset matching | Embeddings model | Keyword matcher | Product name/category/tag matching | No for matching; yes for campaign use |
| Risk and publishing gates | Rules engine | Fast classification model | Deterministic policy checklist | Yes |
| Output validation | Formatter/validator | Rules engine | Schema validation and default fallbacks | No, unless blocking |
| Final approval | Human review | Reviewer workflow | No automatic fallback | Yes |

Examples are illustrative and must remain provider-agnostic in contracts:

- gpt-5.5 for reasoning, strategy, and content.
- gpt-5.4-mini for classification and summaries.
- vision-capable model for image/video analysis.
- embeddings model for product/asset matching.
- rules engine for readiness and publishing gates.

## 9. Inference Parameters Contract

| Field | Purpose | Required/Optional | Default Policy | Stricter Tasks |
|---|---|---|---|---|
| `temperature` | Controls creativity. | Required | Lower for strategy/risk, moderate for creative content. | risk_review, classification, customer_summary |
| `top_p` | Controls sampling diversity. | Optional but recommended | Use route default. | customer-visible outputs |
| `max_tokens` | Prevents runaway output and cost spikes. | Required | Set per task/output schema. | store_strategy_generation, campaign_brief_generation |
| `context_window` | Ensures evidence pack fits route/model. | Required in route config | Must exceed input snapshot + expected output. | strategy and long content tasks |
| `response_format` | Enforces structured output. | Required for structured tasks | JSON/schema for strategy, review, classification. | strategy, review, risk, classification |
| `stop_sequences` | Stops unwanted continuation. | Optional | Empty unless prompt requires. | Template-heavy tasks |
| `retry_policy` | Defines retry count/backoff. | Required | Low retry for deterministic tasks. | connector summaries, structured output tasks |
| `timeout_ms` | Prevents hanging jobs. | Required | Route-specific limit. | all AI tasks |
| `cost_limit` | Caps expected spend. | Required | Task/route budget threshold. | strategy, video script, long generation |
| `confidence_threshold` | Defines minimum acceptable confidence. | Required for decisioning tasks | Higher for strategy/risk/review. | strategy, risk_review, product priority |

Tasks needing stricter settings include `risk_review`, `brand_tone_check`, `content_classification`, `store_strategy_generation`, `campaign_brief_generation`, and any customer-visible output.

## 10. PromptTemplate Contract

Future `PromptTemplate` must include:

- `promptTemplateId`
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
- `owner`
- `reviewStatus`
- `createdAt`
- `updatedAt`

PromptGovernance must govern actual prompt text, not only metadata.

Prompt templates must be versioned.

Output schemas are required for structured AI outputs.

Prompt status must affect WorkflowRuns readiness. Draft, blocked, or unapproved prompts should warn or block depending on task risk.

## 11. AI Task Envelope

Conceptual `AITaskEnvelope`:

- `taskType`
- `workspaceId`
- `storeProfileId`
- `campaignId` when applicable
- `productId` when applicable
- `contentOutputId` when applicable
- `modelRouteId`
- `promptTemplateId`
- `inputSnapshot`
- `evidencePack`
- `constraints`
- `outputSchema`
- `confidenceRequired`
- `limitationsRequired`
- `humanReviewRequired`

AI must consume structured input, not raw unfiltered payloads.

Secrets and tokens must never be included.

Raw connector payloads must be normalized or summarized before AI use.

The task envelope should be traceable through WorkflowRun, AITaskRun, and AuditEvent later.

## 12. Evidence Pack Requirements

Evidence pack contents:

- store profile summary
- product summary
- asset summary
- channel readiness
- policy summary
- social signals when available
- analytics summary when available
- limitations
- freshness
- confidence

Evidence pack is the bridge between normalized data and AI task.

It should be stored or traceable later for audit.

Evidence packs must distinguish verified facts, user-entered data, derived recommendations, and assumptions.

## 13. Analytics Feedback Boundary

Analytics feedback into strategy is important but not required for V1 launch.

In V1, analytics can be displayed and summarized.

Strategy refresh from analytics is Extended/Post-V1 unless manually confirmed.

There must be no automatic strategy mutation from analytics.

## 14. Social Intelligence Boundary

`SocialStoreIntelligenceReport` automated generation is Extended/Post-V1.

V1 may show UI planning and connector design only.

If used in strategy later, it must include `sourceRunId`, confidence, limitations, and compliance status.

No unauthorized scraping.

External connector providers require governance and compliance review before execution.

## 15. Product and Asset Intelligence Boundaries

`ProductMarketingPriority` can be V1 as a derived recommendation.

`AssetGapReport` can be V1 as a derived recommendation from product and asset readiness.

Neither should be treated as final truth without review.

Asset rights must require human review.

Product and asset intelligence may guide CampaignWizard suggestions, but campaigns should snapshot recommendations rather than mutate source entities.

## 16. Governance and Safety Rules

- No AI writes directly to canonical store facts without review.
- No raw data directly used in customer-facing outputs.
- No secret values in AI prompts.
- No publishing without human review.
- Confidence and limitations are required.
- Output schemas are required for strategic and campaign outputs.
- Audit event is required later for material decisions.
- Customer-visible outputs must pass review gates.
- Asset rights and policy constraints must be represented in the evidence pack.

## 17. V1 Scope Decision

V1 includes:

- strategy data sufficiency fields
- stored StoreStrategicPlan
- product and asset readiness inputs
- campaign brief generation contract
- content generation contract
- review/risk contract
- model routing contract
- prompt template contract planning

V1 excludes:

- automated analytics-driven strategy refresh
- automated social connector execution
- full attribution
- ROI prediction
- autonomous publishing
- multi-store workspace
- full RBAC enforcement

## 18. Required API Contract Implications

API Contract Gate should include later:

- StoreProfile update/read
- StoreStrategicPlan create/read/latest
- Product read/write
- Asset read/write
- Campaign create/read
- CampaignContentOutput create/read
- ReviewFinding create/read
- PublishingReadiness read/update
- ModelProvider read/write
- ModelRoute read/write
- PromptTemplate read/write
- WorkflowRun create/read
- AITaskRun create/read
- AuditEvent read/create

Do not write OpenAPI in this document.

API contracts must preserve workspace identity, store profile identity, campaign/product/content references, snapshots where required, prompt template versioning, and review/audit boundaries.

## 19. Open Questions

- What exact monthly marketing budget range options should V1 expose?
- What exact average order value range options should V1 expose?
- Are competitor URLs V1 optional or Extended/Post-V1?
- Is prompt text editable in UI V1, or managed only by admin/governance screens?
- Is `outputSchema` JSON Schema or an internal simplified schema?
- Are embeddings V1 or Post-V1?
- Which AI providers are approved for V1?
- What minimum confidence threshold blocks campaign suggestions?
- Which strategy outputs require reviewer approval before appearing in CampaignWizard?
- Which analytics fields are allowed to influence strategy after manual confirmation?

## 20. Final Position

This document closes the strategy data sufficiency and AI task contract planning gate.

After review, Nashir may proceed to API Contract Gate.

API Contract must not start if these strategy fields and AI task contracts are ignored.
