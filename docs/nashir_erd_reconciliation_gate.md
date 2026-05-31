# Nashir ERD Reconciliation Gate

| Field | Value |
|---|---|
| Gate type | ERD reconciliation gate — planning/documentation only |
| Status date | 2026-05-31 |
| Scope | Maps Nashir V1 concepts to production ERD candidates aligned with marketing-os; does not create SQL, migrations, or backend code |
| Prerequisite gate | `docs/nashir_marketing_os_reconciliation_gate.md` — merged, CONDITIONALLY VIABLE |
| SQL schema approved | NO |
| Migrations created | NO |
| Backend implementation approved | NO |
| API integration approved | NO |
| Auth/RBAC implementation approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an ERD reconciliation gate only.

**No SQL schema is approved by this document.**

**No database migrations are created.**

**No backend implementation is approved.**

**No API integration is approved.**

**No auth/RBAC implementation is approved.**

**marketing-os is read-only in this slice. No changes may be made to marketing-os from this document.**

This gate answers:

> Which Nashir V1 concepts should become backend-persisted entities, how do they map to marketing-os concepts, and what remains unresolved before SQL/migration work?

It does not authorize writing any SQL DDL, creating any migration files, implementing any repository method, or connecting any UI to a backend.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; explicit constraints confirmed |
| `package.json` | Frontend-only dependencies; no pg, no server |
| `docs/nashir_backend_home_decision.md` | marketing-os selected as candidate; gates required |
| `docs/nashir_production_architecture_boundary_gate.md` | GO to this ERD gate confirmed |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE; Asset naming conflict confirmed; GO to this gate |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1 v0.1.0; four slices; entities: Product, Asset, CampaignContent, PreviewArtifact, CreatorStudio* entities; AI Readiness snapshot schemas |
| `docs/screen_map.md` | 20 active mock screens; mock-only |
| `docs/workspace_and_minimum_identity_decision.md` | V1: one workspace → one StoreProfile |
| `docs/erd_reconciliation_model.md` | Conceptual Nashir ERD; NO-GO for SQL; workspace, store_profile, product, asset, campaign candidates |
| `docs/creator_studio_production_contract_planning.md` | CreatorStudioSession, CreatorProfileSnapshot, CreatorContentIdea, CreatorCampaignAngle, CreatorAudienceSegment, CreatorPublishWindow, CreatorPromptGovernanceTemplate, CreatorContextDraft, CreatorTransferDraft — production candidate entities; privacy classifications |
| `docs/creator_studio_api_boundary_gate.md` | V1 API boundary confirmed; Platform OAuth out of V1; advisory entities only for session-scoped outputs |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | W-CONS-5: no API integration approved |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Generated type artifact; awareness only |
| `src/utils/productCatalogStore.js` | Product fields: id, name, category, price, currency, imageUrl, videoUrl, readiness, status, assets, source, flags, claims |
| `src/utils/campaignContentStore.js` | Campaign content, publishing queue, multi-platform readiness fields |
| `src/utils/assetLibraryStore.js` | Asset fields: id, name, type (image/video/logo/document/text/design), rightsStatus, quality |
| `src/utils/promptTemplateStore.js` | Prompt governance and template engine fields |
| `src/utils/modelCostStore.js` | Model registry, model routing, cost monitor fields |
| `src/utils/dataSourcesStore.js` | Data sources, store scan snapshot fields |
| `src/utils/teamAccessStore.js` | Workspace members, roles, activity log, collaboration comments |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Node >=20; Sprint 0–4 verified; Pilot/Production NO-GO; 100+ Nashir planning docs |
| `AGENTS.md` | Contract-first discipline; stop on source conflict; documentation-only PRs must not modify src/SQL/OpenAPI |
| `package.json` | pg ^8.20.0; migration/seed/lint/test/verify scripts |
| `docs/source_of_truth_precedence_decision_record.md` | Conflict resolution hierarchy; README > changelog > reports > ERD/SQL/OpenAPI |
| `docs/db_backed_repository_architecture_contract.md` | Repository interface; workspaceId mandatory; transaction policy |
| `docs/marketing_os_v5_6_5_phase_0_1_erd.md` | Approved Marketing OS entities (see Section 6 for full list) |
| `docs/nashir_erd_patch_planning_gate.md` | ERD planning candidates; reuse-first principles; Asset standalone forbidden |
| `docs/nashir_erd_patch_proposal.md` | Minimum viable ERD proposal; existing entity reuse candidates; new/deferred candidates |
| `docs/nashir_role_permission_matrix.md` | Nashir RBAC planning; workspace-scoped; human approval required |
| `docs/nashir_campaign_db_persistence_gate.md` | Candidate table `nashir_campaigns`; `NASHIR_CAMPAIGN_RUNTIME_MODE` |
| `src/store.js` | `nashirCampaigns` with `nashir_campaign_id`, `nashirEvidence` array |
| `src/repositories/nashir-campaign-repository.js` | Campaign repository implementation (for awareness) |
| `src/repositories/nashir-evidence-lifecycle-repository.js` | Evidence lifecycle repository (for awareness) |
| `src/rbac.js` | Four Nashir permission codes: nashir.campaign.read/write, nashir.evidence.submit, nashir.approval.decide |

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os SQL schema files (base + patch 001 + patch 002) | Require SQL Schema Planning Gate; not needed for ERD candidate mapping |
| marketing-os `docs/marketing_os_consolidated_prd_expanded.md` | Non-authoritative per source-of-truth precedence; strategic input only |
| marketing-os full 100+ Nashir gate chain in detail | Covered at structural level; full chain deferred to implementation slices |

### Assumption flags

> **ASSUMPTION-E1:** marketing-os approved ERD entities listed in `docs/nashir_erd_patch_proposal.md` section 5 are accepted as the canonical reuse-first baseline: Campaign, CampaignStateTransition, BriefVersion, MediaJob, MediaAsset, MediaAssetVersion, ReviewTask, ApprovalDecision, PublishJob, ManualPublishEvidence, TrackedLink, Workspace, WorkspaceMember, Role, Permission, RolePermission, UsageMeter, CostEvent, ClientReportSnapshot, OnboardingProgress, SetupChecklistItem, AuditLog.

> **ASSUMPTION-E2:** Nashir V1 `Product` has no direct equivalent in marketing-os ERD. It is a new entity for Nashir, not a conflict — marketing-os does not define a Product entity.

> **ASSUMPTION-E3:** marketing-os `Campaign` is not the same as Nashir V1 `CampaignContent`. marketing-os Campaign is the campaign record; Nashir CampaignContent is the content draft attached to a campaign. The two may coexist as parent/child, but this requires explicit ERD gate mapping.

> **ASSUMPTION-E4:** Nashir `StoreProfile` (one per workspace, per `docs/workspace_and_minimum_identity_decision.md`) may have partial overlap with marketing-os `BrandProfile` (brand identity, voice rules) but covers different concerns. They are treated as separate entities in this gate.

---

## 3. Reconciliation Question

**Which Nashir V1 concepts should become backend-persisted entities, how do they map to marketing-os concepts, and what remains unresolved before SQL/migration work?**

**Summary answer:** Most Nashir identity, catalog, campaign, and governance entities can be either reused directly from marketing-os or mapped to new Nashir-prefixed entities. The Creator Studio domain requires the most new entities and the most governance care due to TTL management and privacy sensitivity. The `Asset` naming conflict is resolvable via SQL table name divergence from OpenAPI schema name. Authentication and RBAC depend on a separate gate. No SQL may be written until the OpenAPI source-of-truth and Auth/RBAC gates close.

---

## 4. ERD Reconciliation Principles

The following principles govern all entity decisions in this gate:

1. **Preserve accepted Nashir module names** in OpenAPI and generated types. Internal SQL table names may differ where naming rules require it — these divergences must be documented explicitly.
2. **Separate UI-only mock state from production persistence.** Not every `localStorage` mock key becomes a SQL table.
3. **Prefer V1 minimum viable entities.** One entity with fewer fields is better than three entities that can be merged.
4. **Reuse marketing-os approved entities before creating new ones.** If an existing entity covers the concept, extend it; do not create a parallel table.
5. **Defer non-essential analytics/AI-derived entities.** Readiness snapshots, derived summaries, and AI suggestion histories are not V1 persistence requirements unless they serve governance, audit, or review workflows.
6. **Treat audit/readiness/evidence as governance-critical.** These are not UI decoration. AuditLog, ManualPublishEvidence, and ApprovalDecision must be respected as first-class governance objects.
7. **Do not assume every OpenAPI schema becomes a table.** Response schemas, pagination wrappers, warning objects, and advisory snapshots are not persistence entities.
8. **Do not assume every UI store becomes a table.** UI localStorage stores exist for prototype convenience; they inform entity discovery but do not mandate persistence.
9. **Do not approve a DB engine in this gate.** PostgreSQL is the implied candidate through marketing-os precedent but is not formally approved here.
10. **No entity enters SQL until ownership, lifecycle, privacy, and permissions are mapped.** All three dimensions must be documented before the SQL Schema Planning Gate.

---

## 5. Nashir Concept Inventory

| Nashir Concept / Module | Source | Candidate Persistence Status | V1 Inclusion | Rationale |
|---|---|---|---|---|
| Workspace | OpenAPI (workspaceId path param), docs/workspace_and_minimum_identity_decision.md | **Persist** | **IN** | Top-level tenant boundary; exists in marketing-os; reuse |
| StoreProfile | docs/workspace_and_minimum_identity_decision.md, dataSourcesStore.js | **Persist** | **IN** | Commerce identity per workspace; no direct marketing-os equivalent; new entity |
| Brand identity / Brand voice | — | **Derived / Reference** | **DEFER** | Partially covered by BrandProfile in marketing-os; Nashir StoreProfile is not the same as brand voice; defer brand voice to Post-V1 or integrate via BrandProfile reuse |
| Product | OpenAPI (Product schema), productCatalogStore.js | **Persist** | **IN** | Core catalog entity; no marketing-os equivalent; new entity |
| Product intelligence / readiness score | OpenAPI (Readiness schema embedded in Product), productCatalogStore.js | **Derived** | **IN (derived)** | Advisory score derived from product completeness; prefer computed state over stored snapshot in V1 |
| Data source | dataSourcesStore.js | **Persist** | **DEFER** | Manual intake mode is UI-only in V1; connector execution is out of scope; defer to Post-V1 or a separate gate |
| Store scan snapshot | dataSourcesStore.js | **UI-only** | **OUT** | Prototype-only scan feature; no live connector in V1; UI-only |
| Integration connection | integrationConnectionsStore.js | **Persist (minimal)** | **DEFER** | OAuth/connector management; deferred until connector execution gate |
| Campaign | src/utils/campaignContentStore.js, marketing-os nashirCampaigns | **Persist** | **IN** | Reuse/extend marketing-os Campaign; primary organizational unit |
| Campaign content (draft + review) | OpenAPI (CampaignContent schema), campaignContentStore.js | **Persist** | **IN** | New entity; child of Campaign; draft/review/approval state machine |
| Preview artifact | OpenAPI (PreviewArtifact schema) | **Persist** | **IN** | Metadata record only; no binary upload; linked to CampaignContent |
| Content Studio item | campaignContentStore.js (contentId field) | **Persist** | **IN** | Effectively CampaignContent in approved/reviewed state; may be the same entity with status progression |
| Creator Studio session | OpenAPI (CreatorStudioSession schema), creator_studio_production_contract_planning.md | **Persist** | **IN** | Short-lived; TTL-managed; HIGH privacy |
| Creator idea (ContentIdea) | creator_studio_production_contract_planning.md | **Persist (session-scoped)** | **IN** | Draft; human review required; expires with session |
| Creator campaign angle | creator_studio_production_contract_planning.md | **Persist (session-scoped)** | **IN** | Draft; AI-derived; expires with session |
| Creator profile snapshot | creator_studio_production_contract_planning.md | **Persist (ephemeral)** | **DEFER** | HIGH privacy; requires OAuth + consent model; V1 is manual-only; defer platform API ingestion |
| Audience segment | creator_studio_production_contract_planning.md | **Persist (session-scoped)** | **IN** | Advisory; aggregate only; consent-gated; expires with session |
| Publish window | creator_studio_production_contract_planning.md | **Persist (session-scoped)** | **IN** | Advisory; human confirmation required before scheduling |
| Governance template link | creator_studio_production_contract_planning.md | **Reference only** | **IN** | References existing PromptTemplate; does not duplicate it |
| Context draft | OpenAPI (CreatorContextDraft schema), creator_studio_production_contract_planning.md | **Persist** | **IN** | Child of session; TTL-managed; state machine (needs_human_review → ready_for_transfer) |
| Transfer draft | OpenAPI (CreatorTransferDraft schemas — four types), creator_studio_production_contract_planning.md | **Persist** | **IN** | Child of context draft; TTL-managed; pending_review state; destination-addressed |
| Publishing queue item | campaignContentStore.js (PUBLISHING_QUEUE_KEY), OpenAPI transfer-drafts/publishing | **Persist** | **IN** | References approved CampaignContent; scheduling metadata; human confirmation required |
| Asset | OpenAPI (Asset schema), assetLibraryStore.js | **Persist** | **IN** | Core asset metadata; SQL table name must differ from "Asset" — see Section 11 |
| Prompt template | promptTemplateStore.js, OpenAPI (promptId parameter) | **Persist** | **IN** | Governance-critical; versioned; approved versions required before Creator Studio use |
| Prompt governance version | promptTemplateStore.js | **Persist** | **IN** | Version-bound; approval state; embedded in PromptTemplate entity or child table |
| Model routing rule / AI provider | OpenAPI (modelRouteId, providerId parameters), modelCostStore.js | **Persist** | **IN (minimal)** | Policy/snapshot entity; read-only advisory; no live provider probing in V1 |
| Cost usage record / cost policy | OpenAPI (CostReadinessSnapshot), modelCostStore.js | **Persist (minimal)** | **IN (advisory only)** | Advisory cost policy; not billing; UsageMeter/CostEvent from marketing-os ERD are reference candidates |
| Workflow run / definition | OpenAPI (workflowDefinitionId, WorkflowReadinessSnapshotResponse), workflowRuns screen | **Persist (advisory)** | **DEFER** | Advisory snapshots; no workflow execution in V1; defer execution runtime; persist definition metadata only |
| Team member (workspace member/role) | teamAccessStore.js | **Persist** | **IN** | Reuse marketing-os WorkspaceMember, Role, Permission, RolePermission |
| Role / permission | teamAccessStore.js, rbac.js | **Persist** | **IN** | Reuse marketing-os RBAC entities; extend with Nashir permission codes |
| Review / approval decision | OpenAPI (review states on CampaignContent) | **Persist** | **IN** | Reuse ApprovalDecision pattern; human-only; version-bound |
| Readiness assessment (AI advisor) | OpenAPI (ReadinessSignal, WorkflowStepReadiness), creator_studio_production_contract_planning.md (CreatorReadinessAssessment) | **Persist (stored snapshot)** | **IN (advisory only)** | Advisory; does not gate execution; stored for explanation and audit |
| Evidence / audit event | campaignContentStore.js (review states), AuditLog in marketing-os | **Persist** | **IN** | Reuse AuditLog + ManualPublishEvidence from marketing-os |
| Campaign analytics | campaignAnalyticsStore.js | **Derived / External** | **DEFER** | Derived or external data; no analytics ingestion in V1 |
| Store strategic plan | storeStrategicPlanStore.js | **Persist (minimal)** | **DEFER** | Strategic planning surface; may be a BriefVersion extension; defer until store setup gate |
| Collaboration comments | teamAccessStore.js | **Persist** | **DEFER** | Optional V1 feature; extend AuditLog or add a lightweight comment entity; defer to team collaboration gate |
| Notification / alert | — | **UI-only** | **OUT** | No persistent notification model in V1; UI-only state |

---

## 6. marketing-os Entity / Pattern Inventory

| marketing-os Concept / Pattern | Evidence Source | Reuse Category | Relevance to Nashir | Gap |
|---|---|---|---|---|
| Workspace | WorkspaceRepository, Slice 0 verified | **Reuse after reconciliation** | Top-level tenant boundary; Nashir uses same concept | Confirm Nashir adds no second workspace table |
| WorkspaceMember | MembershipRepository, Slice 0 verified | **Reuse after reconciliation** | Team member management | Extend with Nashir-specific role codes |
| Role, Permission, RolePermission | `src/rbac.js`, ERD authority | **Reuse after reconciliation** | RBAC authority; Nashir adds domain permission codes | Four Nashir codes exist; full matrix not yet implemented |
| Campaign | Marketing OS in-memory + nashirCampaigns | **Reuse after reconciliation** | Campaign organization record | Reconcile Marketing OS Campaign with Nashir CampaignContent parent |
| CampaignStateTransition | ERD authority | **Reuse after reconciliation** | Campaign lifecycle history | May not cover CampaignContent review states; evaluate |
| BriefVersion | ERD authority | **Reuse after reconciliation** | Versioned brief/intake content | Nashir CampaignContent body may map here or require its own table |
| MediaAsset | ERD authority (MediaAsset not Asset) | **Reuse after reconciliation** | Asset metadata grouping entity | Nashir SQL must not use standalone "Asset"; candidate: nashir_assets maps to MediaAsset pattern |
| MediaAssetVersion | ERD authority | **Reuse after reconciliation** | Version-bound content with hash | Nashir PreviewArtifact / content version may map here |
| ReviewTask | ERD authority | **Reuse after reconciliation** | Review workflow reference | Nashir CampaignContent review states may extend or reference ReviewTask |
| ApprovalDecision | ERD authority | **Reuse after reconciliation** | Human approval truth; version-bound | Nashir approval must remain human; reuse ApprovalDecision pattern |
| ManualPublishEvidence | ERD authority; evidence lifecycle repository | **Reuse after reconciliation** | User-provided proof of manual external publishing | Nashir evidence model must reuse before creating new evidence types |
| PublishJob | ERD authority | **Reuse after reconciliation** | Manual/semi-manual publishing (approval-gated) | Nashir PublishingQueueItem may map here or be a new entity referencing approved CampaignContent |
| TrackedLink | ERD authority | **Reuse after reconciliation** | UTM Tracking Lite | Nashir can reuse for tracking links without attribution |
| AuditLog | ERD authority | **Reuse after reconciliation** | Append-only sensitive write traceability | Reuse for all governance-critical state transitions in Nashir |
| OnboardingProgress, SetupChecklistItem | ERD authority | **Reuse after reconciliation** | Setup/readiness adjacency | Nashir workspace readiness surface may reuse these for setup tracking |
| UsageMeter, CostEvent | ERD authority | **Reference only** | Cost advisory model reference | Nashir cost policy is advisory; CostEvent is not billing; adapt pattern, not entities |
| ClientReportSnapshot | ERD authority | **Reference only** | Frozen performance review snapshots | Nashir campaign analytics may follow this pattern; not V1 |
| pg / migration tooling | `scripts/db-migrate.js`, strict migration order | **Reuse after reconciliation** | DB migration infrastructure | Nashir SQL migrations must be separate files; added to existing strict order |
| Repository pattern (narrow interface, workspaceId mandatory) | `src/repositories/`, `docs/db_backed_repository_architecture_contract.md` | **Reuse after reconciliation** | Repository structure for Nashir | Derive Nashir repository methods from Nashir ERD |
| OpenAPI lint workflow | `scripts/openapi-lint.js` | **Reuse after reconciliation** | Nashir OpenAPI must pass lint after source-of-truth gate | Nashir OpenAPI source-of-truth unresolved |
| Test + verification pattern | `npm run verify:strict`; Sprint 0-4 CI | **Reuse after reconciliation** | Verification discipline | Nashir-specific test cases required |
| ErrorModel | `src/error-model.js` | **Reuse after reconciliation** | Nashir V1 error codes must bridge to ErrorModel | Nashir ErrorCode enum is Nashir-specific and requires mapping |
| BrandProfile, BrandVoiceRule | Brand Slice 1 repositories | **Reference only** | Brand identity / voice — partial overlap with Nashir StoreProfile | Nashir StoreProfile is different from BrandProfile; do not conflate |
| MediaJob (MediaJob not GenerationJob) | ERD authority | **Reference only** | AI media generation job entity | Nashir does not define AI generation jobs in V1; defer |
| prototype/ directory | marketing-os static prototype | **Reject** | Not source of truth for Nashir UI or backend |
| Patch 002 connector/notification/runtime | marketing-os runtime | **Reject** | Marketing OS domain runtime; not applicable to Nashir |

---

## 7. ERD Mapping Matrix

| Nashir Entity Candidate | marketing-os Closest Concept | Match Type | Proposed Action | V1 Status | Risk | Next Gate Owner |
|---|---|---|---|---|---|---|
| Workspace | Workspace | **Exact** | Accept — reuse existing Workspace entity; no second workspace table | **IN** | Low | Nashir Auth/RBAC Gate |
| StoreProfile | BrandProfile (partial) | **Partial** | Create new — `nashir_store_profiles` candidate; one per workspace in V1; StoreProfile is commerce identity, not brand voice | **IN** | Medium | Nashir SQL Schema Planning Gate |
| BrandProfile (voice) | BrandProfile, BrandVoiceRule | **Partial** | Defer or reference — Nashir does not need a brand voice layer in V1; StoreProfile serves commerce identity | **DEFER** | Low | Post-V1 |
| Product | No equivalent | **Missing** | Create new — `nashir_products` candidate; workspace-scoped; productId is canonical identity | **IN** | Medium | Nashir SQL Schema Planning Gate |
| ProductIntelligenceSnapshot | OnboardingProgress, SetupChecklistItem, Readiness schema | **Partial** | Derived first — compute readiness from product completeness; defer persisted snapshot unless audit requires it | **IN (derived)** | Low | Nashir SQL Schema Planning Gate |
| DataSource | No equivalent | **Missing** | Defer — connector execution out of V1; UI-only or minimal reference entity | **DEFER** | Low | Post-V1 gate |
| IntegrationConnection | No equivalent | **Missing** | Defer — OAuth/connector scope; not V1 | **DEFER** | Medium | Post-V1 gate |
| Campaign | Campaign + nashirCampaigns | **Partial** | Map — extend existing Campaign entity or `nashir_campaigns` as parent; campaign groups content drafts; reconcile nashir_campaign_id with Nashir V1 API campaign reference | **IN** | Medium | Nashir SQL Schema Planning Gate |
| CampaignContent | BriefVersion (partial) | **Partial** | Create new — `nashir_campaign_contents` candidate; child of Campaign; carries draft/review/approval state machine; body content, channel, contentType, review state, version | **IN** | Medium | Nashir SQL Schema Planning Gate |
| PreviewArtifact | MediaAssetVersion (partial) | **Partial** | Create new or extend — `nashir_preview_artifacts` candidate; metadata only; linked to CampaignContent; may align with MediaAssetVersion pattern | **IN** | Low | Nashir SQL Schema Planning Gate |
| ContentStudioItem | CampaignContent (same entity, different status) | **Partial** | Map — ContentStudio surface is CampaignContent in approved/in-review state; no separate table needed | **IN (same entity)** | Low | Nashir SQL Schema Planning Gate |
| CreatorStudioSession | No equivalent | **Missing** | Create new — `nashir_creator_studio_sessions` candidate; TTL-managed; HIGH privacy | **IN** | High (privacy) | Nashir SQL Schema Planning Gate |
| CreatorContentIdea | BriefVersion (partial) | **Partial** | Create new or embed — `nashir_creator_ideas` candidate; session-scoped; draft; expires with session | **IN** | Medium | Nashir SQL Schema Planning Gate |
| CreatorCampaignAngle | BriefVersion (partial) | **Partial** | Create new or embed — `nashir_creator_angles` candidate; session-scoped; draft | **IN** | Medium | Nashir SQL Schema Planning Gate |
| CreatorProfileSnapshot | No equivalent | **Missing** | Defer — HIGH privacy; OAuth required; V1 is manual-only | **DEFER** | High (privacy + OAuth) | Post-V1 platform gate |
| CreatorAudienceSegment | No equivalent | **Missing** | Create new — `nashir_creator_segments` candidate; session-scoped; advisory; consent-gated | **IN** | Medium (privacy) | Nashir SQL Schema Planning Gate |
| CreatorPublishWindow | No equivalent | **Missing** | Create new — `nashir_creator_publish_windows` candidate; session-scoped; advisory | **IN** | Low | Nashir SQL Schema Planning Gate |
| CreatorContextDraft | No equivalent | **Missing** | Create new — `nashir_creator_context_drafts` candidate; TTL-managed; state machine | **IN** | Medium | Nashir SQL Schema Planning Gate |
| CreatorTransferDraft | No equivalent | **Missing** | Create new — `nashir_creator_transfer_drafts` candidate; TTL-managed; destination-typed | **IN** | Medium | Nashir SQL Schema Planning Gate |
| PublishingQueueItem | PublishJob | **Partial** | Map — Nashir publishing queue may extend or reference PublishJob; requires approved CampaignContent reference; human confirmation required | **IN** | Medium | Nashir SQL Schema Planning Gate |
| Asset (OpenAPI schema name) | MediaAsset | **CONFLICT (naming)** | **Rename SQL only** — SQL table must use `nashir_assets` or align with `MediaAsset` pattern; OpenAPI schema name `Asset` is preserved unchanged; no renaming of generated types | **IN** | **High (naming)** | **Nashir SQL Schema Planning Gate — PRIORITY** |
| PromptTemplate | No SQL equivalent in marketing-os | **Missing** | Create new — `nashir_prompt_templates` candidate; versioned; approval state | **IN** | Medium | Nashir SQL Schema Planning Gate |
| PromptGovernanceVersion | No SQL equivalent | **Missing** | Create new or embed — version record inside PromptTemplate entity; approved/deprecated states | **IN** | Medium | Nashir SQL Schema Planning Gate |
| ModelRoutingRule | No equivalent | **Missing** | Create new — `nashir_model_routes` candidate; policy + health snapshot; read-only advisory | **IN** | Low | Nashir SQL Schema Planning Gate |
| AIProvider | No equivalent | **Missing** | Create new — `nashir_ai_providers` candidate; snapshot; no live probing | **IN** | Low | Nashir SQL Schema Planning Gate |
| CostUsageRecord | UsageMeter, CostEvent | **Partial** | Map pattern — CostEvent is not billing; Nashir cost policy advisory surface; adapt UsageMeter/CostEvent pattern for Nashir AI cost tracking | **IN (advisory)** | Low | Nashir SQL Schema Planning Gate |
| WorkflowDefinition | No equivalent | **Missing** | Create new (minimal) — `nashir_workflow_definitions` candidate; metadata + advisory readiness snapshot only | **DEFER (advisory only)** | Low | Nashir SQL Schema Planning Gate |
| WorkflowRun | No equivalent | **Missing** | Defer — no workflow execution in V1; advisory readiness snapshots only | **DEFER** | Low | Post-V1 |
| WorkspaceMember | WorkspaceMember | **Exact** | Accept — reuse marketing-os WorkspaceMember | **IN** | Low | Nashir Auth/RBAC Gate |
| Role | Role | **Exact** | Accept — reuse; extend with Nashir roles | **IN** | Low | Nashir Auth/RBAC Gate |
| Permission | Permission | **Exact** | Accept — reuse; add Nashir permission codes | **IN** | Low | Nashir Auth/RBAC Gate |
| RolePermission | RolePermission | **Exact** | Accept — approved in marketing-os ERD | **IN** | Low | Nashir Auth/RBAC Gate |
| ReviewDecision | ApprovalDecision | **Partial** | Map — Nashir review states on CampaignContent differ from ApprovalDecision; embed review status on CampaignContent entity; use ApprovalDecision for final approval record | **IN** | Medium | Nashir SQL Schema Planning Gate |
| ReadinessAssessment | OnboardingProgress, CampaignReadinessSnapshot (candidate) | **Partial** | Create new — `nashir_readiness_assessments` for Creator Studio advisory; prefer derived state for simpler domains; persist only where audit/governance requires | **IN (advisory)** | Low | Nashir SQL Schema Planning Gate |
| AuditEvent / Evidence | AuditLog + ManualPublishEvidence | **Partial** | Accept and extend — reuse AuditLog for governance writes; reuse ManualPublishEvidence for publishing evidence; extend where Nashir-specific evidence types are needed | **IN** | Low | Nashir SQL Schema Planning Gate |
| CollaborationComment | No equivalent | **Missing** | Create new or defer — `nashir_comments` candidate; linked to CampaignContent or WorkflowRun | **DEFER** | Low | Team collaboration gate |
| StoreStrategicPlan | No equivalent | **Missing** | Defer — strategic planning surface; may be BriefVersion extension | **DEFER** | Low | Store setup gate |
| CampaignAnalytics | ClientReportSnapshot | **Partial** | Defer — no analytics ingestion in V1; manual review snapshot only | **DEFER** | High (scope creep) | Post-V1 |

---

## 8. Proposed V1 ERD Candidate

This is documentation-only. No SQL DDL is provided or approved.

### 8.1 Identity and Tenancy

**Workspace**
- Purpose: Top-level tenant boundary for all Nashir entities.
- Required relationships: owns StoreProfile, WorkspaceMember, all domain entities.
- Lifecycle owner: Platform/admin
- Privacy sensitivity: LOW
- V1 status: **IN — reuse marketing-os Workspace entity**

**WorkspaceMember**
- Purpose: Links a user to a workspace with a role.
- Required relationships: belongs to Workspace; references Role.
- Lifecycle owner: Workspace admin
- Privacy sensitivity: MEDIUM (user identity)
- V1 status: **IN — reuse marketing-os WorkspaceMember**

**Role, Permission, RolePermission**
- Purpose: RBAC authority; maps roles to permission codes.
- Required relationships: Role has many Permissions through RolePermission; WorkspaceMember references Role.
- Lifecycle owner: Platform/admin
- Privacy sensitivity: LOW
- V1 status: **IN — reuse marketing-os entities; extend with Nashir permission codes**

---

### 8.2 Store and Catalog

**StoreProfile**
- Purpose: Commerce identity of a workspace. One per workspace in V1. Contains store name, category, selling context, channel preferences, audience defaults, setup state.
- Required relationships: belongs to Workspace (1:1 in V1).
- Lifecycle owner: Business user (store setup)
- Privacy sensitivity: LOW–MEDIUM
- V1 status: **IN — new entity**

**Product**
- Purpose: Product catalog record. Workspace-scoped. productId is canonical identity; name is display-only.
- Required relationships: belongs to Workspace; has many Assets; referenced by CampaignContent.
- Lifecycle owner: Business user (product catalog)
- Privacy sensitivity: LOW
- V1 status: **IN — new entity**

**Asset** (SQL: `nashir_assets` or `nashir_media_assets`)
- Purpose: Asset metadata record. assetId is canonical identity; name and fileName are display-only. No binary upload in V1.
- Required relationships: belongs to Workspace; may link to Product; referenced by CampaignContent.
- Lifecycle owner: Content/asset manager
- Privacy sensitivity: LOW–MEDIUM (licensed content)
- V1 status: **IN — new entity; SQL name diverges from OpenAPI schema name; see Section 11**

---

### 8.3 Campaign and Content

**Campaign** (reuse/extend marketing-os `nashir_campaigns`)
- Purpose: Primary campaign organizational unit. Groups content drafts and context for a product.
- Required relationships: belongs to Workspace; references Product (optional in V1); has many CampaignContents.
- Lifecycle owner: Campaign manager
- Privacy sensitivity: LOW
- V1 status: **IN — extend existing marketing-os campaign entity**

**CampaignContent**
- Purpose: Content draft with editable body, channel, contentType, review state, and version. campaignContentId is canonical identity.
- Required relationships: belongs to Campaign (and Workspace); references Product (via productId); may reference Assets (selectedAssetIds); has many PreviewArtifacts; has ReviewState.
- Lifecycle owner: Content creator / reviewer
- Privacy sensitivity: LOW–MEDIUM (marketing content)
- V1 status: **IN — new entity**

**PreviewArtifact**
- Purpose: Preview metadata for campaign content. Metadata contract only; no binary upload.
- Required relationships: belongs to CampaignContent; references Assets.
- Lifecycle owner: Content creator
- Privacy sensitivity: LOW
- V1 status: **IN — new entity**

---

### 8.4 Creator Studio

**CreatorStudioSession**
- Purpose: One user-initiated Creator Studio session lifecycle. Manual/user-entered only in V1.
- Required relationships: belongs to Workspace; has many CreatorContextDrafts; references actor (WorkspaceMember or userId).
- Lifecycle owner: Creator Studio
- Privacy sensitivity: **HIGH** — creator handle is a third-party identifier; must not be stored raw
- V1 status: **IN — new entity; TTL-managed; no auto-creation on page load**

**CreatorContentIdea, CreatorCampaignAngle, CreatorAudienceSegment, CreatorPublishWindow**
- Purpose: Session-scoped advisory objects. AI-derived or user-entered. Require human review.
- Required relationships: belong to CreatorStudioSession; expire with session.
- Lifecycle owner: Creator Studio (advisory only)
- Privacy sensitivity: LOW–MEDIUM (audience segment data)
- V1 status: **IN — new entities (session-scoped)**

**CreatorContextDraft**
- Purpose: Persists user-selected context references for a session. Child of session. State machine: needs_human_review → ready_for_transfer.
- Required relationships: belongs to CreatorStudioSession; references Idea, Angle, Segment, Window, PromptTemplate via ID references.
- Lifecycle owner: Creator Studio
- Privacy sensitivity: MEDIUM — references session (high-privacy parent)
- V1 status: **IN — new entity; TTL-managed**

**CreatorTransferDraft**
- Purpose: Packages a CreatorContextDraft into a destination-addressed payload. pending_review state. Does not create real destination records.
- Required relationships: belongs to CreatorContextDraft; typed by destination (content_studio / campaign / publishing / prompt_governance).
- Lifecycle owner: Creator Studio → destination module
- Privacy sensitivity: MEDIUM
- V1 status: **IN — new entity; TTL-managed**

**CreatorReadinessAssessment**
- Purpose: Advisory readiness snapshot for a context draft. Does not gate transfer.
- Required relationships: belongs to CreatorContextDraft.
- Lifecycle owner: Creator Studio
- Privacy sensitivity: LOW
- V1 status: **IN — new entity; advisory only**

---

### 8.5 Publishing

**PublishingQueueItem** (map to / extend PublishJob)
- Purpose: Scheduling/readiness state for content to be manually published. References approved CampaignContent. Human confirmation required before any scheduling action.
- Required relationships: belongs to Workspace; references approved CampaignContent; referenced by ManualPublishEvidence.
- Lifecycle owner: Publishing queue manager
- Privacy sensitivity: LOW
- V1 status: **IN — map to PublishJob or new entity aligned with PublishJob pattern**

**ManualPublishEvidence** (reuse marketing-os)
- Purpose: User-provided proof of external manual publishing. Append-only.
- Required relationships: belongs to Workspace; references PublishingQueueItem.
- Lifecycle owner: Publisher (evidence actor)
- Privacy sensitivity: LOW
- V1 status: **IN — reuse marketing-os entity**

---

### 8.6 Governance and Review

**PromptTemplate**
- Purpose: Versioned prompt governance record. Versioned; must have at least one approved version before use in Creator Studio.
- Required relationships: belongs to Workspace; has many PromptGovernanceVersions.
- Lifecycle owner: Prompt governance admin
- Privacy sensitivity: MEDIUM (prompt text is internal)
- V1 status: **IN — new entity**

**PromptGovernanceVersion**
- Purpose: A specific version of a prompt template with approval state (approved/deprecated).
- Required relationships: belongs to PromptTemplate; referenced by CreatorContextDraft.
- Lifecycle owner: Prompt governance admin
- Privacy sensitivity: MEDIUM
- V1 status: **IN — new entity or embedded in PromptTemplate**

**ReviewDecision / ApprovalDecision** (map to ApprovalDecision)
- Purpose: Human approval record for CampaignContent review. Version-bound; human-only.
- Required relationships: belongs to CampaignContent; references reviewer (WorkspaceMember); version-bound.
- Lifecycle owner: Reviewer
- Privacy sensitivity: LOW
- V1 status: **IN — map to ApprovalDecision pattern; extend as needed**

---

### 8.7 AI Operations and Cost

**ModelRoutingRule**
- Purpose: Policy and health snapshot for an AI model route. Read-only advisory; no live probing.
- Required relationships: belongs to Workspace; references AIProvider.
- Lifecycle owner: Platform/admin
- Privacy sensitivity: LOW (no secret values in snapshots)
- V1 status: **IN (advisory snapshot only)**

**AIProvider**
- Purpose: Stored snapshot of AI provider health, capabilities, vault reference. No secret values returned.
- Required relationships: belongs to Workspace.
- Lifecycle owner: Platform/admin
- Privacy sensitivity: MEDIUM (vault references must not expose raw keys)
- V1 status: **IN (advisory snapshot only)**

**CostUsageRecord** (adapt UsageMeter / CostEvent pattern)
- Purpose: Advisory cost tracking for AI operations. Not billing.
- Required relationships: belongs to Workspace; may reference Campaign or WorkflowRun.
- Lifecycle owner: Cost monitor admin
- Privacy sensitivity: LOW
- V1 status: **IN (advisory only) — adapt marketing-os CostEvent pattern**

---

### 8.8 Integrations and Data Sources

**DataSource** — **DEFER to Post-V1**
- Purpose: Data source registration for connector execution. Out of scope V1.

**IntegrationConnection** — **DEFER to Post-V1**
- Purpose: OAuth/connector management. Out of scope V1.

---

### 8.9 Audit and Evidence

**AuditLog** (reuse marketing-os)
- Purpose: Append-only record of sensitive state transitions. Not a business state source.
- Required relationships: references domain object and actor.
- Lifecycle owner: Platform (append-only)
- Privacy sensitivity: MEDIUM
- V1 status: **IN — reuse marketing-os AuditLog**

---

## 9. Relationship Map

### Required V1 relationships

```
Workspace
  └── 1:1 StoreProfile
  └── 1:N WorkspaceMember (via Role)
  └── 1:N Product
  └── 1:N Asset (nashir_assets)
  └── 1:N Campaign
  └── 1:N PromptTemplate
  └── 1:N ModelRoutingRule
  └── 1:N AIProvider
  └── 1:N CreatorStudioSession
  └── 1:N AuditLog (all domain events)

Product
  └── 1:N Asset links (via linkedProductId on Asset)
  └── referenced by CampaignContent (productId)

Campaign
  └── belongs to Workspace
  └── 1:N CampaignContent

CampaignContent
  └── belongs to Campaign (and Workspace)
  └── references Product (productId)
  └── references N Assets (selectedAssetIds)
  └── 1:N PreviewArtifact
  └── 0:1 ReviewDecision / ApprovalDecision
  └── 1:1 ReviewState (embedded status fields)

CampaignContent (approved)
  └── referenced by PublishingQueueItem

PublishingQueueItem
  └── references approved CampaignContent
  └── 0:N ManualPublishEvidence (user-provided proof)

CreatorStudioSession
  └── belongs to Workspace
  └── 0:N CreatorContentIdea
  └── 0:N CreatorCampaignAngle
  └── 0:N CreatorAudienceSegment
  └── 0:N CreatorPublishWindow
  └── 0:N CreatorContextDraft

CreatorContextDraft
  └── belongs to CreatorStudioSession
  └── references CreatorContentIdea, CreatorCampaignAngle, CreatorAudienceSegment, CreatorPublishWindow (by ID)
  └── references PromptTemplate (via promptTemplateId / promptVersionId)
  └── 0:N CreatorTransferDraft
  └── 0:N CreatorReadinessAssessment

PromptTemplate
  └── belongs to Workspace
  └── 1:N PromptGovernanceVersion
  └── referenced by CreatorContextDraft (approved version required)
```

### Optional V1 relationships

```
CostUsageRecord
  └── belongs to Workspace
  └── may reference Campaign or ModelRoutingRule

ModelRoutingRule
  └── references AIProvider
```

### Deferred relationships

```
DataSource → Workspace (Post-V1)
IntegrationConnection → Workspace (Post-V1)
WorkflowRun → WorkflowDefinition (Post-V1 execution)
CollaborationComment → CampaignContent (team collaboration gate)
CampaignAnalytics → Campaign (Post-V1)
StoreStrategicPlan → StoreProfile (store setup gate)
```

---

## 10. Boundary Decisions

### Persisted in V1

Workspace, StoreProfile, Product, Asset (renamed SQL), Campaign, CampaignContent, PreviewArtifact, CreatorStudioSession, CreatorContentIdea, CreatorCampaignAngle, CreatorAudienceSegment, CreatorPublishWindow, CreatorContextDraft, CreatorTransferDraft, CreatorReadinessAssessment, PublishingQueueItem, ManualPublishEvidence, PromptTemplate, PromptGovernanceVersion, ModelRoutingRule, AIProvider, CostUsageRecord, WorkspaceMember, Role, Permission, RolePermission, AuditLog.

### UI-only for now (not persisted in V1)

UI `localStorage` mock keys (nashir_mock_product_catalog, nashir_mock_campaign_content, etc.) — these are prototype state only and will be replaced by real API responses after UI API integration gate.

Store scan snapshot — prototype-only; no live connector in V1.

Notification/alert state — UI-only.

### Derived / read-model only

ProductIntelligenceSnapshot — computed from product completeness fields; persist only if audit requires a point-in-time record.

Workspace readiness summary — computed from child entity states; advisory only.

### External / provider-owned

CreatorProfileSnapshot — platform API data; requires OAuth + consent; DEFER.

Campaign analytics data — external platform analytics; no ingestion in V1.

Payment/billing — out of V1 scope.

### Event / audit-backed

All sensitive state transitions (CampaignContent review state changes, ApprovalDecision events, PublishingQueueItem state changes, PromptTemplate approval events) must produce AuditLog records.

ManualPublishEvidence is the authority for publishing proof; not inferred from system state.

### Deferred to Post-V1

DataSource, IntegrationConnection, WorkflowRun execution, CollaborationComment, StoreStrategicPlan, CampaignAnalytics, CreatorProfileSnapshot, automated scheduling, OAuth, external publishing execution, AI workflow orchestration, attribution, ROI modeling, multi-modal generation.

---

## 11. Key Conflicts and Gaps

| ID | Conflict / Gap | Severity | Resolution approach |
|---|---|---|---|
| C-E01 | `Asset` entity name — marketing-os forbids standalone `Asset` SQL table | **HIGH — CONFIRMED BLOCKER** | SQL table uses `nashir_assets`; OpenAPI `Asset` schema name is preserved unchanged; mapping documented in SQL Schema Planning Gate |
| C-E02 | `Campaign` vs `CampaignContent` — marketing-os `nashir_campaign_id` is a campaign record; Nashir V1 `CampaignContent` is a content draft | **MEDIUM** | Campaign is the parent; CampaignContent is a child entity; reconcile at SQL Schema Planning Gate |
| C-E03 | `StoreProfile` not in marketing-os ERD — partial overlap with BrandProfile | **MEDIUM** | Create new `nashir_store_profiles` entity; do not conflate with BrandProfile |
| C-E04 | `PromptTemplate` not in marketing-os ERD (explicitly deferred per nashir_erd_patch_proposal.md) | **MEDIUM** | Nashir needs PromptTemplate for Creator Studio governance; create as Nashir-specific entity; confirm it is not blocked by marketing-os template-generation deferral |
| C-E05 | Dual OpenAPI contracts: nashir_v1_openapi.yaml (nashir-ui-prototype) and nashir_openapi_patch.yaml (marketing-os) | **HIGH — UNRESOLVED** | Nashir OpenAPI Source-of-Truth Gate must close before backend routes implement any endpoint |
| C-E06 | Creator Studio TTL management — session/draft/transfer entities expire; no TTL pattern in marketing-os ERD | **MEDIUM** | SQL Schema Planning Gate must specify TTL column, cleanup job, and 410-Gone response behavior |
| C-E07 | Auth/RBAC model partial — four Nashir permission codes exist; full matrix not mapped | **MEDIUM** | Nashir Auth/RBAC and Workspace Identity Gate |
| C-E08 | marketing-os Pilot/Production is NO-GO — Nashir production path is not independent | **MEDIUM** | Nashir must pursue its own production readiness gate; confirm independence from marketing-os NO-GO |
| C-E09 | Creator Studio `creatorHandleRef` — must not be stored raw; requires opaque reference handling | **HIGH (privacy)** | SQL Schema Planning Gate must specify how handle ref is stored (opaque token, not raw value) |
| C-E10 | `Product` has no marketing-os equivalent — "reuse-first" principle has no candidate to reuse | **LOW** | Create new; no conflict, just a gap to fill |
| C-E11 | OpenAPI `Approval` naming — Nashir uses review status on CampaignContent, not a standalone Approval table; aligned with marketing-os constraint | **LOW — ALREADY RESOLVED** | No standalone Approval table; review state is embedded on CampaignContent |

---

## 12. Data Governance and Privacy

| Domain | Privacy Sensitivity | Retention Risk | Audit Required | Human Review Required |
|---|---|---|---|---|
| Creator handles | **HIGH** — third-party identifier | HIGH — must expire with session; must not be stored raw | YES — any access must be logged | YES — consent required before any persistence |
| Creator profile snapshot | **HIGH** — platform data, PII risk | HIGH — ephemeral; platform policy; consent required | YES | YES — consent gate required |
| AI suggestions (ideas, angles) | LOW (AI-derived) — MEDIUM if platform-derived | LOW — draft only; expires with session | YES (source provenance) | YES — human review required before use |
| Campaign content body | MEDIUM — marketing content | LOW–MEDIUM | YES (review state transitions) | YES — review/approval flow |
| Audience segments | MEDIUM — aggregate demographic | MEDIUM — consent-gated; tied to session | YES | YES — consent required |
| Publish windows | LOW | LOW | NO | YES — human confirmation before scheduling |
| API keys / secrets references | **HIGH** — never stored; vault references only | HIGH | YES — any vault reference access | YES |
| Team/user permissions | MEDIUM | MEDIUM | YES — all role/permission changes | YES — admin-only |
| Audit/evidence records | MEDIUM — governance sensitive | HIGH — append-only; must not be deleted | SELF-AUDIT | N/A (audit is the review) |
| Prompt templates | MEDIUM — internal operational | LOW | YES — approval state changes | YES — human approval required |
| Publishing schedules | LOW | LOW | YES | YES — human confirmation |
| Cost usage records | LOW | LOW | YES (advisory) | NO |

---

## 13. V1 vs Post-V1 Scope

### V1 ERD candidate includes

- Workspace, StoreProfile, WorkspaceMember, Role, Permission, RolePermission
- Product (with advisory readiness derived state)
- Asset (SQL: `nashir_assets`)
- Campaign, CampaignContent, PreviewArtifact
- CreatorStudioSession, CreatorContentIdea, CreatorCampaignAngle, CreatorAudienceSegment, CreatorPublishWindow
- CreatorContextDraft, CreatorTransferDraft, CreatorReadinessAssessment
- PublishingQueueItem, ManualPublishEvidence
- PromptTemplate, PromptGovernanceVersion
- ModelRoutingRule, AIProvider
- CostUsageRecord (advisory)
- AuditLog

### Post-V1 / deferred

- DataSource, IntegrationConnection (connector execution)
- WorkflowRun execution (execution runtime)
- CollaborationComment (team collaboration gate)
- StoreStrategicPlan (store setup gate)
- CampaignAnalytics, ClientReportSnapshot (Post-V1 analytics)
- CreatorProfileSnapshot (platform OAuth + consent gate)
- Advanced attribution, uplift modeling, ROI prediction
- Automated campaign orchestration
- External publishing execution
- Multi-touch analytics
- Advanced personalization
- Multi-modal generation
- Long-term AI learning loop
- Scheduling entities (direct scheduling execution)
- Social OAuth entities
- Payment/billing entities

---

## 14. SQL Readiness Assessment

| Domain | Rating | Reason |
|---|---|---|
| Workspace / WorkspaceMember / RBAC | **NEEDS RECONCILIATION** | Workspace entity exists; RBAC extension needed for full Nashir permission matrix; Auth/RBAC gate required first |
| StoreProfile | **NEEDS RECONCILIATION** | New entity; lifecycle, fields, and workspace identity mapping need Auth/RBAC gate confirmation |
| Product | **NEEDS RECONCILIATION** | New entity; no conflict; field-level schema requires OpenAPI source-of-truth gate to confirm authority |
| Asset (SQL name) | **NEEDS RECONCILIATION** | Entity is clear; SQL naming conflict must be formally resolved at SQL Schema Planning Gate; one explicit decision required |
| Campaign / CampaignContent | **NEEDS RECONCILIATION** | Parent/child mapping with existing marketing-os Campaign entity; field-level reconciliation needed |
| PreviewArtifact | **NEEDS RECONCILIATION** | New entity; clear purpose; depends on CampaignContent schema being confirmed |
| Creator Studio entities | **NOT READY** | TTL management pattern, creator handle opaque storage, session expiry, and privacy handling all require explicit SQL gate decisions |
| Publishing / ManualPublishEvidence | **NEEDS RECONCILIATION** | marketing-os evidence entity exists; Nashir usage must be explicitly reconciled |
| PromptTemplate / PromptGovernanceVersion | **NEEDS RECONCILIATION** | New entities; confirm marketing-os PromptTemplate deferral applies only to template-backed generation, not prompt governance |
| ModelRoutingRule / AIProvider / CostUsageRecord | **NEEDS RECONCILIATION** | New entities; advisory-only in V1; field-level schema requires OpenAPI gate |
| AuditLog | **NEEDS RECONCILIATION** | marketing-os AuditLog exists; confirm Nashir-specific event types and columns align with existing schema |
| Auth / RBAC | **NOT READY** | Requires dedicated Auth/RBAC and Workspace Identity Gate |
| OpenAPI source-of-truth | **NOT READY** | Dual contracts unresolved; blocks all backend implementation |

**No domain is READY FOR SQL PLANNING until the OpenAPI source-of-truth and Auth/RBAC gates close.**

---

## 15. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir OpenAPI Source-of-Truth Gate** | This gate (ERD candidate complete) | Resolves dual-contract risk; decides whether nashir_v1_openapi.yaml moves to marketing-os; required before any backend route implements Nashir V1 endpoints |
| 2 | **Nashir Auth/RBAC and Workspace Identity Gate** | ERD candidate complete | Designs full Nashir permission matrix; confirms workspace/tenant isolation for all V1 entities; extends existing marketing-os RBAC with Nashir codes |
| 3 | **Nashir SQL Schema Planning Gate** | Gates 1 and 2 closed | Produces approved Nashir SQL entity definitions with column-level schema, constraints, and naming decisions; Asset SQL name conflict formally resolved; Creator Studio TTL pattern approved |
| 4 | **Nashir Backend Slice 0 Planning** | Gate 3 closed | Plans first implementable Nashir backend slice in marketing-os with exact allowed files, forbidden files, verification commands, rollback criteria |
| 5 | **Nashir UI API Integration Planning Gate** | Gate 4 verified | Plans how nashir-ui-prototype calls the Nashir V1 API; blocked until gates 1–4 close |

If PromptTemplate conflict with marketing-os template-generation deferral is confirmed as blocking, add:

- **Nashir PromptTemplate Scope Clarification Gate** before SQL Schema Planning.

---

## 16. Blocking Findings

| ID | Finding | Severity | Resolution gate |
|---|---|---|---|
| B-ERD01 | OpenAPI source-of-truth unresolved — two partial Nashir OpenAPI contracts coexist | **HIGH** | Nashir OpenAPI Source-of-Truth Gate |
| B-ERD02 | Auth/RBAC and workspace identity not fully mapped — four permission codes exist; full matrix missing | **HIGH** | Nashir Auth/RBAC and Workspace Identity Gate |
| B-ERD03 | `Asset` SQL naming conflict — formal SQL name decision required before schema is written | **HIGH** | Nashir SQL Schema Planning Gate |
| B-ERD04 | Creator Studio TTL management pattern not defined — session/draft/transfer expiry behavior, cleanup, and 410-Gone response semantics | **HIGH** | Nashir SQL Schema Planning Gate |
| B-ERD05 | `creatorHandleRef` storage — must be opaque reference, never raw; storage mechanism not defined | **HIGH (privacy)** | Nashir SQL Schema Planning Gate |
| B-ERD06 | PromptTemplate scope ambiguity — marketing-os explicitly defers template-backed generation; Nashir needs prompt governance; confirm these are distinct | **MEDIUM** | Nashir SQL Schema Planning Gate |
| B-ERD07 | marketing-os Pilot/Production NO-GO inherited — Nashir production gate not independent | **MEDIUM** | Future Nashir Production Readiness Gate |
| B-ERD08 | No approved Nashir backend vertical slice with allowed/forbidden files, verification commands, rollback criteria | **MEDIUM** | Nashir Backend Slice 0 Planning |
| B-ERD09 | Migration ownership in marketing-os — Nashir SQL migration files must be ordered after existing migrations; ordering strategy not formalized | **MEDIUM** | Nashir SQL Schema Planning Gate |

---

## 17. Non-blocking Findings / Watch Items

| ID | Finding | Action |
|---|---|---|
| W-ERD01 | `CampaignContent` review states (draft → ready_for_review → in_review → approved → rejected) are already defined in nashir_v1_openapi.yaml. These align with marketing-os approval state machine concepts. No conflict. | Carry into SQL gate as a positive signal |
| W-ERD02 | Idempotency-Key and If-Match/X-Resource-Version patterns in nashir_v1_openapi.yaml are consistent with marketing-os concurrency model. No conflict. | Confirmed compatibility |
| W-ERD03 | marketing-os `nashirEvidence` array and `nashir-evidence-lifecycle-repository.js` are existing Nashir-specific infrastructure. These may be aligned with Nashir V1 review states. | Carry into SQL gate for evidence lifecycle reconciliation |
| W-ERD04 | `Product` has no conflict with marketing-os naming rules. It is a clean new entity. | Low-risk new entity; design freely |
| W-ERD05 | CreatorTransferDraft has four destination types (content_studio, campaign, publishing, prompt_governance). Each may require a destination-type discriminator column or separate tables. | Evaluate at SQL gate; prefer discriminator column over separate tables in V1 |
| W-ERD06 | `WorkflowRun` and `WorkflowDefinition` as advisory-only entities (no execution) are low risk if scoped to metadata + readiness snapshots only. Execution runtime is out of V1. | Mark as advisory-only metadata; no execution columns |
| W-ERD07 | `CostUsageRecord` adapted from CostEvent is low risk if explicitly scoped as advisory and never used as billing or invoice state. | Carry marketing-os CostEvent disclaimer into Nashir cost entity docs |
| W-ERD08 | `StoreProfile` 1:1 with Workspace in V1 is clean. Post-V1 multi-store support must be designed into IDs and foreign keys without appearing in V1 API behavior. | Ensure storeProfileId is available on relevant entities for future scoping |
| W-ERD09 | `AuditLog` reuse requires confirming that Nashir-specific event types (creator_studio.session.expired, campaign_content.review_submitted, etc.) can be represented in the existing AuditLog column structure. | Evaluate at SQL gate; prefer extending event_type enum |

---

## 18. Decision

### Final decision

| Area | Status |
|---|---|
| ERD reconciliation complete (candidate level) | **COMPLETE — documentation only** |
| GO to Nashir OpenAPI Source-of-Truth Gate | **GO** |
| GO to Nashir Auth/RBAC and Workspace Identity Gate | **GO — as planning** |
| CONDITIONAL GO to Nashir SQL Schema Planning Gate | **CONDITIONAL GO — after OpenAPI source-of-truth AND Auth/RBAC gates close** |
| SQL schema implementation | **NO-GO** |
| Database migrations | **NO-GO** |
| Backend implementation | **NO-GO** |
| UI API integration | **NO-GO** |
| Copying marketing-os code | **NO-GO** |
| Production / Pilot | **NO-GO** |
| Renaming nashir_v1_openapi.yaml schema names | **NO-GO** |

### ERD reconciliation status per domain

| Domain | Status |
|---|---|
| Identity / Tenancy | Reconciled — reuse confirmed |
| Store / Catalog (Product, StoreProfile, Asset) | Reconciled candidate — Asset naming conflict documented; SQL name TBD |
| Campaign / Content | Reconciled candidate — Campaign/CampaignContent parent-child mapping confirmed |
| Creator Studio | Reconciled candidate — TTL management and privacy handling require SQL gate |
| Publishing / Evidence | Reconciled candidate — ManualPublishEvidence reuse confirmed |
| Governance (PromptTemplate, Approvals) | Partially reconciled — PromptTemplate scope requires confirmation |
| AI Operations (ModelRoute, AIProvider, Cost) | Reconciled candidate — advisory-only scope confirmed |
| Audit | Reconciled — AuditLog reuse confirmed |
| Auth/RBAC | **NOT RECONCILED** — requires dedicated gate |
| OpenAPI source-of-truth | **NOT RECONCILED** — requires dedicated gate |

### Next gate

**Nashir OpenAPI Source-of-Truth Gate** and **Nashir Auth/RBAC and Workspace Identity Gate** may proceed in parallel.

The **Nashir SQL Schema Planning Gate** is blocked until both close.

No Nashir SQL schema, migration, backend code, or API endpoint may be written until the SQL Schema Planning Gate produces explicit allowed files, forbidden files, verification commands, and rollback criteria.
