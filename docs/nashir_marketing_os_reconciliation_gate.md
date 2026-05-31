# Nashir Marketing OS Reconciliation Gate

| Field | Value |
|---|---|
| Gate type | Cross-repository reconciliation gate — planning/documentation only |
| Status date | 2026-05-31 |
| Scope | Evaluates whether henter36/marketing-os can serve as Nashir's backend/governance home before any ERD, SQL, API integration, auth/RBAC, or implementation work |
| Prerequisite gate | `docs/nashir_backend_home_decision.md` — merged, GO, marketing-os selected as candidate |
| Implementation approved | NO |
| Code copy from marketing-os | NO |
| Backend / database / API / auth approved | NO |
| Repository migration | NO |

---

## 1. Status and Scope

This is a reconciliation gate only.

**No implementation is approved by this document.**

**No backend, database, API integration, auth/RBAC, migration, or code migration is approved.**

**No code is copied from marketing-os in this slice.**

**marketing-os is evaluated here as a candidate, not assumed as production-ready.**

This gate answers one question:

> Can marketing-os be used as Nashir's backend/governance home, and under what constraints?

It does not answer: is the backend implementation ready? It does not authorize writing Nashir backend code, SQL schema, routes, or API endpoints.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; explicit constraints confirmed |
| `package.json` | Frontend-only deps; React 19, Vite 8, lucide-react; no pg, no server deps |
| `docs/nashir_backend_home_decision.md` | marketing-os selected as candidate; follow-up gates required |
| `docs/nashir_production_architecture_boundary_gate.md` | GO to this reconciliation gate confirmed |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1 v0.1.0; four slices; entities: Product, Asset, CampaignContent, CreatorStudio; placeholder server |
| `docs/screen_map.md` | 20 active mock screens; all mock-only |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | W-CONS-5: type annotations do not authorize API integration |
| `docs/erd_reconciliation_model.md` | Conceptual Nashir ERD; NO-GO for SQL; workspace, store_profile, product, asset, campaign candidates |
| `docs/workspace_and_minimum_identity_decision.md` | V1: one workspace → one store_profile |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Generated artifact; awareness only |
| `src/utils/productCatalogStore.js` | UI mock: product fields — id, name, category, price, currency, imageUrl, videoUrl, readiness, status, assets, source, flags, claims |
| `src/utils/campaignContentStore.js` | UI mock: campaign content and publishing queue fields — contentId, campaignSnapshot, productSnapshot, selectedAssets, channel, publishStatus |
| `src/utils/assetLibraryStore.js` | UI mock: asset fields — id, name, type (image/video/logo/document/text/design), rightsStatus, quality |
| `src/utils/promptTemplateStore.js` | UI mock: prompt governance and template engine fields |
| `src/utils/modelCostStore.js` | UI mock: model registry, model routing, cost monitor fields |
| `src/utils/dataSourcesStore.js` | UI mock: data sources, store scan snapshot fields |
| `src/utils/teamAccessStore.js` | UI mock: workspace members, roles, activity log, collaboration comments |

### Verified — henter36/marketing-os (local sibling clone)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Node >=20; Sprint 0–4 verified; Pilot/Production NO-GO; 100+ Nashir planning docs; Nashir minimal static UI slice is standalone only |
| `package.json` | pg ^8.20.0; migration/seed/lint/test/integration-test/verify scripts; no frontend deps |
| `docs/source_of_truth_precedence_decision_record.md` | Conflict resolution hierarchy defined; non-authoritative sources enumerated |
| `docs/db_backed_repository_architecture_contract.md` | Repository interface pattern; workspaceId mandatory; transaction policy; tenant isolation per method |
| `docs/nashir_store_entities_implementation_gate.md` | `nashirCampaigns` array added to `src/store.js`; campaign runtime uses `nashir_campaign_id`; evidence runtime mode gated |
| `docs/nashir_rbac_implementation_scope_gate.md` | RBAC permission codes for Nashir in `src/rbac.js`: nashir.campaign.read/write, nashir.evidence.submit, nashir.approval.decide |
| `docs/nashir_campaign_db_persistence_gate.md` | Candidate table `nashir_campaigns`; candidate repository `NashirCampaignRepository`; campaign runtime mode `NASHIR_CAMPAIGN_RUNTIME_MODE` |
| `docs/nashir_erd_patch_planning_gate.md` | ERD planning candidates identified; Marketing OS ERD entity naming rules apply; `Asset` standalone forbidden |
| `docs/nashir_role_permission_matrix.md` | Planning-level Nashir roles and permissions; workspace-scoped; human approval required; AI cannot approve, reject, or publish |
| `docs/nashir_implementation_readiness_gate.md` | Implementation preconditions listed; backend-only alignment path recommended |
| `docs/marketing_os_v5_6_5_phase_0_1_erd.md` | Marketing OS entities: MediaJob, MediaAsset, MediaAssetVersion, ApprovalDecision, BrandProfile, BrandVoiceRule; standalone Asset/Approval/GenerationJob forbidden |
| `src/repositories/nashir-campaign-repository.js` | Nashir campaign repository implementation exists — verified present |
| `src/repositories/nashir-evidence-lifecycle-repository.js` | Nashir evidence lifecycle repository implementation exists — verified present |
| `src/nashir/backend-slice0-planning.js` | Nashir backend Slice 0 planning file exists |
| `src/nashir/backend-slice0-repository.js` | Nashir backend Slice 0 repository exists |
| `src/nashir/backend-slice0-service.js` | Nashir backend Slice 0 service exists |
| `src/router.js` | Nashir routes registered: GET/POST nashir-campaigns, GET nashir-campaign by id, readiness, evidence list/get/create |
| `src/rbac.js` | Four Nashir permission codes present: nashir.campaign.read, nashir.campaign.write, nashir.evidence.submit, nashir.approval.decide |
| `src/store.js` | `nashirCampaigns` seed with `nashir_campaign_id` (snake_case), `nashirEvidence` array — Nashir entities are in the marketing-os store layer |

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os `docs/marketing_os_consolidated_prd_expanded.md` | Non-authoritative per source-of-truth precedence record; defer to ERD gate |
| marketing-os SQL schema files (base + patch 001 + patch 002) | Cannot be evaluated without ERD Reconciliation Gate |
| marketing-os full 100+ Nashir gate chain in detail | Too large for a single reconciliation doc; covered at the structural and entity level here |

### Assumption flags

> **ASSUMPTION-R1:** marketing-os `nashir_campaign_id` (snake_case, the `nashirCampaigns` in-memory entity) represents a *campaign record* in the Marketing OS Nashir model. Nashir V1 OpenAPI's `CampaignContent` entity (camelCase, `campaignContentId`) represents *campaign content* — a related but distinct concept. The mapping between these is not 1:1 and requires explicit ERD reconciliation.

> **ASSUMPTION-R2:** marketing-os `src/nashir/backend-slice0-*.js` files implement the in-memory Nashir campaign/evidence path only. They do not cover Products, Assets, Creator Studio, Prompt Governance, Model Routing, Cost Monitor, Data Sources, or the full Nashir V1 OpenAPI surface. The scope of existing marketing-os Nashir implementation is narrow.

> **ASSUMPTION-R3:** marketing-os entity naming rule "do not create standalone Asset table; use MediaAsset" is interpreted here as a Marketing OS domain constraint. Whether Nashir's `Asset` entity (in nashir_v1_openapi.yaml) can coexist in marketing-os under a different name or requires its own reconciliation is the primary blocker identified by this gate.

---

## 3. Reconciliation Question

**Can marketing-os be used as Nashir's backend/governance home, and under what constraints?**

**Answer: CONDITIONALLY YES.**

marketing-os is viable as Nashir's backend/governance home under three mandatory conditions:

1. The entity naming conflict for `Asset` must be resolved — either Nashir's `Asset` entity is renamed in the backend (not in the OpenAPI contract), or the naming rule is explicitly scoped to the Marketing OS domain only.
2. The Nashir V1 OpenAPI entity surface (Products, Assets, Creator Studio, Prompt Governance, Model Routing, Cost Monitor, Data Sources, Publishing Queue) must be mapped to the marketing-os repo structure before any implementation.
3. Nashir's production readiness gate must be pursued independently of marketing-os's NO-GO/Pilot/Production gate.

---

## 4. Nashir V1 Surface Inventory

| Module / Entity | Nashir Source | Current Maturity | Backend Readiness | Mapping Requirement |
|---|---|---|---|---|
| Workspace | `docs/nashir_v1_openapi.yaml`, `docs/workspace_and_minimum_identity_decision.md`, `docs/erd_reconciliation_model.md` | OpenAPI contract + conceptual ERD | marketing-os has workspace infrastructure (WorkspaceRepository, Slice 0) | Map to marketing-os workspace entity; COMPATIBLE with existing pattern |
| Store / StoreProfile | `docs/workspace_and_minimum_identity_decision.md`, `docs/erd_reconciliation_model.md`, `src/utils/dataSourcesStore.js` | UI mock + conceptual ERD | marketing-os has BrandProfile (not StoreProfile) | PARTIAL MATCH — BrandProfile covers brand/voice; StoreProfile covers commerce identity; require ERD mapping |
| Product catalog | `docs/nashir_v1_openapi.yaml` (Product schema), `src/utils/productCatalogStore.js` | OpenAPI contract + generated type + UI mock | No equivalent in marketing-os | MISSING — must be created in marketing-os via ERD/SQL gate |
| Product intelligence (readiness scoring) | `docs/nashir_v1_openapi.yaml` (Readiness schema), `src/pages/ProductIntelligencePage.jsx` | OpenAPI contract (advisory readiness) | `nashir_campaign_readiness_scoring_contract.md` covers campaign readiness | PARTIAL — readiness model exists for campaigns; product readiness is separate |
| Asset library | `docs/nashir_v1_openapi.yaml` (Asset schema), `src/utils/assetLibraryStore.js` | OpenAPI contract + generated type + UI mock | **NAMING CONFLICT** — marketing-os forbids standalone `Asset` table; must use `MediaAsset` | CONFLICT — `Asset` in Nashir V1 OpenAPI conflicts with marketing-os naming rules; ERD gate must resolve |
| Campaign | `src/utils/campaignContentStore.js`, marketing-os `nashirCampaigns` store | UI mock + marketing-os in-memory entity | marketing-os has `nashirCampaigns`, `NashirCampaignRepository`, campaign routes, RBAC | PARTIAL MATCH — marketing-os campaign model (`nashir_campaign_id`) is not identical to Nashir V1 `CampaignContent`; mapping required |
| Campaign content | `docs/nashir_v1_openapi.yaml` (CampaignContent schema) | OpenAPI contract + generated type | No direct equivalent in marketing-os | PARTIAL — marketing-os campaign concept overlaps; `CampaignContent` is a distinct entity covering content drafts, review state, and preview artifacts |
| Preview artifacts | `docs/nashir_v1_openapi.yaml` (PreviewArtifact schema) | OpenAPI contract + generated type | No equivalent in marketing-os | MISSING — must be created |
| Creator Studio session | `docs/nashir_v1_openapi.yaml` (CreatorStudioSession schema) | OpenAPI contract + generated type + UI mock | No equivalent in marketing-os | MISSING — must be created |
| Context draft | `docs/nashir_v1_openapi.yaml` (CreatorContextDraft schema) | OpenAPI contract + generated type | No equivalent in marketing-os | MISSING — must be created |
| Transfer draft | `docs/nashir_v1_openapi.yaml` (CreatorTransferDraft schemas) | OpenAPI contract + generated type | No equivalent in marketing-os | MISSING — must be created |
| Publishing queue | `src/utils/campaignContentStore.js` (PUBLISHING_QUEUE_KEY), `docs/nashir_v1_openapi.yaml` (transfer drafts) | UI mock (queue) + transfer draft in OpenAPI | marketing-os has PublishJob concept but no Nashir publishing queue entity | PARTIAL MATCH — marketing-os ManualPublishEvidence contract covers evidence of external publishing; not a queue manager |
| AI readiness snapshots | `docs/nashir_v1_openapi.yaml` (Readiness, ReadinessSignal, WorkflowStepReadiness schemas) | OpenAPI contract + generated type | marketing-os campaign readiness scoring is planning-level only | PARTIAL MATCH — readiness model concept exists; 10-dimension signal model (providerReady, routeReady, etc.) has no implementation |
| Prompt template / governance | `docs/nashir_v1_openapi.yaml` (promptId parameter), `src/utils/promptTemplateStore.js` | UI mock + OpenAPI parameter reference | No prompt template entity in marketing-os | MISSING — must be created |
| Model routing | `docs/nashir_v1_openapi.yaml` (modelRouteId parameter, RouteReadinessSnapshotResponse), `src/utils/modelCostStore.js` | OpenAPI contract + UI mock | No model routing entity in marketing-os | MISSING — must be created |
| Cost monitor / cost policy | `docs/nashir_v1_openapi.yaml` (CostReadinessSnapshot schema), `src/utils/modelCostStore.js` | OpenAPI contract + UI mock | marketing-os has CostEvent concept but not a cost policy or monitor entity for Nashir | PARTIAL MATCH — CostEvent in marketing-os ERD is not billing; Nashir cost monitor is a policy/advisory surface |
| Workflow runs / definitions | `docs/nashir_v1_openapi.yaml` (workflowDefinitionId parameter, WorkflowReadinessSnapshotResponse) | OpenAPI contract + UI mock | No workflow definition entity in marketing-os | MISSING — must be created |
| Data sources / integrations | `src/utils/dataSourcesStore.js`, `src/utils/integrationConnectionsStore.js` | UI mock | No data source entity in marketing-os | MISSING — must be created |
| Team / workspace members / roles | `src/utils/teamAccessStore.js` | UI mock | marketing-os has WorkspaceRepository, MembershipRepository, RBAC permission codes | COMPATIBLE — workspace/membership/RBAC pattern can be adapted for Nashir team management |
| Audit / evidence / review readiness | `docs/nashir_v1_openapi.yaml` (review states, approval states) | OpenAPI contract + marketing-os planning docs | marketing-os has evidence lifecycle repository, manual publishing evidence contract | PARTIAL MATCH — evidence concept exists; Nashir's review workflow (CampaignContent review) differs from marketing-os's approval flow |
| Secrets / keys | `src/pages/SecretsAndKeysPage.jsx` | UI mock only | No secrets management entity | OUT OF SCOPE for V1 backend; external vault required |
| Settings | `src/pages/SettingsPage.jsx` | UI mock only | General config; workspace settings overlap with workspace entity | DEFER to settings gate |

---

## 5. marketing-os Capability Inventory

| Capability | marketing-os Evidence | Reuse Classification | Notes |
|---|---|---|---|
| Governance model (gate-based planning → review → acceptance → implementation → verification) | 100+ Nashir gate docs; verified sprint chain | **Reuse now (approach)** | Adopt the gate discipline; do not copy document templates verbatim |
| Source-of-truth precedence model | `docs/source_of_truth_precedence_decision_record.md` | **Reuse now** | Apply same precedence hierarchy to Nashir backend slices |
| Backend runtime baseline (Node.js HTTP, guards, error model) | `src/server.js`, `src/guards.js`, `src/error-model.js`, `src/router.js` | **Reuse after reconciliation** | Node.js pattern can be adopted for Nashir routes; must not copy Marketing OS domain routes into Nashir namespace |
| Repository pattern (narrow interface, workspaceId mandatory, domain error mapping) | `src/repositories/workspace-repository.js`, `src/repositories/nashir-campaign-repository.js` | **Reuse after reconciliation** | Pattern applies directly; entity-specific methods must derive from Nashir ERD |
| pg / migration tooling | `scripts/db-migrate.js`, `scripts/db-migrate-retry.js`; strict 3-file migration order | **Reuse after reconciliation** | Migration approach and script structure can be adapted; Nashir SQL files must be separate and Nashir-specific |
| OpenAPI lint workflow | `scripts/openapi-lint.js`; `openapi:lint:strict` script | **Reuse after reconciliation** | Nashir V1 OpenAPI must pass the same lint gate once moved to marketing-os |
| Test + integration test separation | `npm test` (unit) + `npm run test:integration` + `npm run verify:strict` | **Reuse after reconciliation** | Test discipline applies; Nashir test cases must match Nashir contracts |
| Workspace / tenant infrastructure (WorkspaceRepository, MembershipRepository, Slice 0 verified) | `src/repositories/workspace-repository.js`, `src/repositories/membership-repository.js` | **Reuse after reconciliation** | Nashir workspace boundary must align with the existing workspace entity; do not create a second workspace table |
| RBAC / auth concepts (AuthGuard, WorkspaceContextGuard, MembershipCheck, PermissionGuard) | `src/guards.js`, `src/rbac.js` | **Reuse after reconciliation** | Four Nashir permission codes already in `src/rbac.js`; must be expanded for full Nashir V1 RBAC gate |
| Nashir campaign infrastructure (in-memory + repository mode) | `src/nashir/`, `src/repositories/nashir-campaign-repository.js`, Nashir routes | **Reuse after reconciliation** | Existing campaign/evidence model is a starting point; must be reconciled with Nashir V1 OpenAPI `CampaignContent` before relying on it |
| Nashir evidence lifecycle | `src/repositories/nashir-evidence-lifecycle-repository.js` | **Reuse after reconciliation** | Evidence model exists; must reconcile with Nashir V1 review states |
| ErrorModel | `src/error-model.js` | **Reuse after reconciliation** | Nashir V1 OpenAPI defines its own `ErrorCode` enum with Nashir-specific codes; ErrorModel bridge mapping required |
| BrandProfile / BrandVoiceRule repositories | `src/repositories/brand-profile-repository.js`, `src/repositories/brand-voice-rule-repository.js` | **Reference only** | Marketing OS brand concepts; Nashir uses StoreProfile / store identity; do not conflate |
| AI/workflow runtime concepts | Marketing OS Patch 002 connector/notification concepts; no AI execution | **Reference only** | No AI execution pattern exists in marketing-os; Nashir AI readiness endpoints are advisory-only; do not copy Patch 002 runtime |
| Template/content entities | Not present in marketing-os | **N/A** | Must be created for Nashir |
| prototype/ directory | `prototype/` in marketing-os | **Reject** | Static reference only; not a source of truth for any Nashir UI or backend contract |
| UI artifacts (nashir static UI surface) | `ui/nashir/` in marketing-os | **Reject as source of truth** | marketing-os's static Nashir UI is a standalone read-only surface; nashir-ui-prototype is the authoritative UI |

---

## 6. Entity Mapping Matrix

| Nashir Concept | marketing-os Closest Concept | Match Type | Required Action | Risk | Next Gate Owner |
|---|---|---|---|---|---|
| workspace | workspace (WorkspaceRepository, Slice 0) | **Exact** | Accept — use existing workspace entity; do not create second workspace table | Low | Nashir Backend Slice 0 Planning |
| store / StoreProfile | BrandProfile (brand identity, voice rules) | **Partial** | Map — StoreProfile is Nashir's commerce identity; BrandProfile covers voice/brand rules; decide whether StoreProfile is a new table or extends workspace | Medium | Nashir ERD Reconciliation Gate |
| product | No equivalent in marketing-os ERD | **Missing** | Create new — `nashir_products` table candidate; derive from Nashir V1 OpenAPI Product schema | Medium | Nashir ERD Reconciliation Gate |
| product intelligence / readiness score | Campaign readiness scoring contract (advisory) | **Partial** | Map — readiness is advisory in both; product readiness model must extend Nashir readiness schema | Low | Nashir ERD Reconciliation Gate |
| asset (Nashir V1 OpenAPI `Asset` entity) | MediaAsset (marketing-os forbids standalone `Asset` table) | **CONFLICT** | Rename in backend persistence layer — Nashir V1 OpenAPI keeps `Asset` as the external schema name; the SQL table must use a different name (candidate: `nashir_assets` or `nashir_media_assets`); generated types and OpenAPI schema must NOT change | **High** | Nashir ERD Reconciliation Gate — PRIORITY BLOCKER |
| campaign | nashirCampaigns / NashirCampaignRepository (in-memory + repository) | **Partial** | Map — marketing-os `nashir_campaign_id` is an existing backend concept; Nashir V1 OpenAPI does not expose campaigns as a top-level resource but uses `productId` and `campaignContentId`; full mapping needed | Medium | Nashir ERD Reconciliation Gate |
| campaign content (CampaignContent) | No direct equivalent (closest: campaign brief) | **Partial** | Create new or extend — `nashir_campaign_contents` candidate table; review/approval state machine from marketing-os planning docs | Medium | Nashir ERD Reconciliation Gate |
| preview artifact (PreviewArtifact) | No equivalent | **Missing** | Create new — `nashir_preview_artifacts` candidate | Low | Nashir ERD Reconciliation Gate |
| creator studio session (CreatorStudioSession) | No equivalent | **Missing** | Create new — `nashir_creator_studio_sessions` candidate; TTL-managed; no raw platform credentials | Medium | Nashir ERD Reconciliation Gate |
| context draft (CreatorContextDraft) | No equivalent | **Missing** | Create new — `nashir_creator_context_drafts` candidate; TTL-managed; status state machine | Medium | Nashir ERD Reconciliation Gate |
| transfer draft (CreatorTransferDraft) | No equivalent | **Missing** | Create new — `nashir_creator_transfer_drafts` candidate; pending_review state; 4 destination types | Medium | Nashir ERD Reconciliation Gate |
| publishing queue | ManualPublishEvidence / PublishJob (marketing-os planning) | **Partial** | Map — marketing-os evidence model covers manual publishing proof; Nashir publishing queue is a scheduling/readiness surface; require explicit boundary | Medium | Nashir ERD Reconciliation Gate |
| AI workspace readiness | WorkspaceReadinessSummaryResponse (advisory) | **Missing** | Create new — advisory snapshot only; no execution | Low | Nashir ERD Reconciliation Gate |
| workflow definition / step readiness | WorkflowStepReadiness (10-dimension model) | **Missing** | Create new — advisory snapshot model; no workflow execution | Low | Nashir ERD Reconciliation Gate |
| AI provider readiness | ProviderReadinessSnapshotResponse | **Missing** | Create new — read-only stored snapshot; no live provider probing | Low | Nashir ERD Reconciliation Gate |
| model route readiness | RouteReadinessSnapshotResponse | **Missing** | Create new — policy/health snapshot | Low | Nashir ERD Reconciliation Gate |
| prompt readiness | PromptReadinessSnapshotResponse | **Missing** | Create new — ties to prompt template entity | Low | Nashir ERD Reconciliation Gate |
| prompt template | No SQL entity in marketing-os | **Missing** | Create new — `nashir_prompt_templates` candidate | Medium | Nashir ERD Reconciliation Gate |
| model routing policy | No SQL entity in marketing-os | **Missing** | Create new — `nashir_model_routes` candidate | Medium | Nashir ERD Reconciliation Gate |
| cost policy / cost monitor | CostEvent concept in marketing-os ERD | **Partial** | Map with boundary — CostEvent is not billing; Nashir cost policy governs AI execution budget; separate entities likely needed | Medium | Nashir ERD Reconciliation Gate |
| workflow run | No equivalent | **Missing** | Create new — `nashir_workflow_runs` candidate | Medium | Nashir ERD Reconciliation Gate |
| data source / integration connection | No equivalent | **Missing** | Create new — `nashir_data_sources` candidate | Medium | Nashir ERD Reconciliation Gate |
| workspace member / role | Workspace + Membership + RBAC (Slice 0 verified) | **Compatible** | Accept — Nashir team/role surface maps to marketing-os workspace/membership/RBAC layer; extend RBAC with full Nashir permission matrix | Low | Nashir Auth/RBAC and Workspace Identity Gate |
| audit / evidence | nashirEvidence array + evidence lifecycle repository | **Partial** | Map — marketing-os has manual evidence concept; Nashir review states (draft → ready_for_review → in_review → approved → rejected) must map to existing approval state machine | Medium | Nashir ERD Reconciliation Gate |
| activity log / collaboration comments | No SQL entity | **Missing** | Create new or derive from AuditLog | Low | Nashir ERD Reconciliation Gate |

---

## 7. Naming and Contract Conflicts

### Confirmed conflicts

| Conflict | Severity | Description | Resolution approach |
|---|---|---|---|
| `Asset` entity name | **HIGH — BLOCKER** | Nashir V1 OpenAPI uses `Asset` as the external schema name for asset library records. marketing-os forbids a standalone `Asset` SQL table and requires `MediaAsset`. The OpenAPI schema must not be renamed; the SQL table name must differ. | SQL table must use `nashir_assets` or `nashir_media_assets`. The nashir_v1_openapi.yaml `Asset` schema name is preserved unchanged. A mapping between OpenAPI schema name and SQL table name is documented in the ERD Reconciliation Gate. |
| `campaign` vs `CampaignContent` | **MEDIUM** | marketing-os's `nashirCampaigns` entity (with `nashir_campaign_id`) represents a Nashir campaign. Nashir V1 OpenAPI's `CampaignContent` entity (with `campaignContentId`) represents campaign content drafts. These are related but distinct: a campaign may own multiple content drafts. | Map explicitly at ERD gate. Do not rename existing marketing-os `nashir_campaign_id`. Define `nashir_campaign_contents` as a separate child entity linked by `nashirCampaignId`. |
| `Approval` table name | **MEDIUM** | marketing-os forbids a standalone `Approval` table; uses `ApprovalDecision`. Nashir V1 OpenAPI uses review states (approved, rejected, in_review) on `CampaignContent` — not a separate Approval entity. | Nashir review state is a status field on `CampaignContent`, not a separate table. No conflict if review status stays embedded. If a separate approval record is needed, use `nashir_approval_decisions`, not `nashir_approvals`. |
| `GenerationJob` table name | **LOW** | marketing-os forbids `GenerationJob`; uses `MediaJob`. Nashir V1 does not define a GenerationJob entity. | No conflict currently. If Nashir ever needs a generation job concept, it must use `nashir_media_jobs`, not `nashir_generation_jobs`. |

### Names that must be preserved from Nashir V1 OpenAPI

The following names are part of the external contract (nashir_v1_openapi.yaml) and must not be renamed in generated types or OpenAPI schema, even if SQL table names differ:

- `Product`, `ProductStatus`, `StockStatus` — external schema names
- `Asset`, `AssetType`, `RightsStatus`, `UsageRights`, `AssetStatus` — external schema names
- `CampaignContent`, `CampaignContentStatus`, `ReviewStatus`, `ReviewState` — external schema names
- `PreviewArtifact` — external schema name
- `CreatorStudioSession`, `CreatorContextDraft`, `CreatorTransferDraft` — external schema names
- `ReadinessSignal`, `WorkflowStepReadiness`, `WorkspaceReadinessSummaryResponse` — external schema names
- All `ErrorCode` values (workspace.not_found, creator_studio.session.not_found, etc.) — external error codes

### Names that can be mapped internally (SQL ≠ API)

These names may differ between SQL table names and OpenAPI schema names, provided the mapping is documented:

- `Asset` (OpenAPI) → `nashir_assets` or `nashir_media_assets` (SQL)
- `CampaignContent` (OpenAPI) → `nashir_campaign_contents` (SQL)
- `PreviewArtifact` (OpenAPI) → `nashir_preview_artifacts` (SQL)
- `CreatorStudioSession` (OpenAPI) → `nashir_creator_studio_sessions` (SQL)
- `CreatorContextDraft` (OpenAPI) → `nashir_creator_context_drafts` (SQL)

### Generated type compatibility risks

- The `Asset` naming conflict does not affect generated types because types are generated from nashir_v1_openapi.yaml schema names, not SQL table names. The generated type will continue to use `Asset`.
- Any SQL migration or backend repository that internally uses `nashir_assets` or `nashir_media_assets` must map to the OpenAPI `Asset` name at the service/response layer. This mapping must be explicit and documented.
- Do not rename any schema in nashir_v1_openapi.yaml to satisfy SQL naming rules. The OpenAPI contract is the external-facing contract.

---

## 8. Data Ownership and Persistence Boundary

This is a planning-level classification. No SQL schema is approved. Items marked "DEFER to ERD gate" require the Nashir ERD Reconciliation Gate.

| Nashir Domain | Persistence Classification | Notes |
|---|---|---|
| workspace | Backend DB (existing in marketing-os) | Reuse marketing-os Workspace entity |
| StoreProfile / store identity | Backend DB | New entity; one per workspace in V1 |
| product catalog | Backend DB | New `nashir_products` candidate |
| product readiness score | Backend DB (advisory, computed or stored snapshot) | Stored advisory snapshot; not execution authorization |
| asset library | Backend DB | New entity; naming must avoid SQL `Asset` conflict |
| campaign | Backend DB (partially exists in marketing-os as nashirCampaigns) | Extend existing marketing-os campaign model |
| campaign content | Backend DB | New entity; linked to campaign |
| preview artifact | Backend DB | New entity; metadata only, no binary upload |
| creator studio session | Backend DB | TTL-managed; no raw platform credentials stored |
| context draft | Backend DB | TTL-managed; child of session |
| transfer draft | Backend DB | TTL-managed; child of context draft; four destination types |
| publishing queue | Backend DB (advisory/scheduling state only) | Not a publishing execution engine |
| AI workspace readiness | Backend DB (stored snapshot; advisory) | Updated on demand; not live-probed |
| prompt template | Backend DB | New entity |
| model route | Backend DB | New entity |
| workflow definition + step readiness | Backend DB (stored snapshots; advisory) | Not workflow execution engine |
| cost policy / cost events | Backend DB | CostEvent pattern from marketing-os; policy is separate |
| evidence / audit records | Backend DB (append-only) | Extend marketing-os evidence lifecycle pattern |
| team members / roles | Backend DB (existing in marketing-os) | Extend marketing-os membership/RBAC |
| data sources / integration connections | Backend DB or external-provider backed | Manual intake mode is UI mock; connector execution is out of scope for V1 |
| secrets / API keys | External vault | Never stored in Nashir DB directly; reference only |
| settings (workspace-level preferences) | Backend DB (workspace entity extension) | Defer detail to settings gate |
| UI mock state (localStorage stores) | UI-only | Not backed by DB; will be replaced by real API calls after UI API integration gate |
| all ERD detail | **DEFER to Nashir ERD Reconciliation Gate** | No table definitions, column definitions, or constraints are approved here |

---

## 9. OpenAPI Alignment

### Current situation (verified)

- nashir-ui-prototype owns `docs/nashir_v1_openapi.yaml` v0.1.0 — four slices, Nashir-specific entities, placeholder server URL (`https://api.example.invalid`).
- marketing-os owns `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` and patch 002 — Marketing OS entities, separate domain model, separate server.
- marketing-os has `docs/nashir_openapi_patch.yaml` — a Nashir-specific OpenAPI patch for Nashir routes implemented within marketing-os. This coexists with the marketing-os main contract as an addendum.

### Analysis

Both nashir_v1_openapi.yaml (in nashir-ui-prototype) and nashir_openapi_patch.yaml (in marketing-os) define Nashir API surface. These are two partially overlapping contracts. The nashir_v1_openapi.yaml covers Slices 1–4 (Products, Assets, Campaign Content, AI Readiness, Creator Studio). The marketing-os patch covers in-memory campaign and evidence routes under the `/workspaces/{workspaceId}/nashir-campaigns/` path.

These must be reconciled. They cannot both be authoritative without a source-of-truth decision.

### Decision on OpenAPI in this gate

**Do not move or modify nashir_v1_openapi.yaml in this slice.**

Keep it in nashir-ui-prototype as the UI contract artifact and type generation source.

**Require a dedicated Nashir OpenAPI Source-of-Truth Gate** to decide:

- Which contract is the single source of truth for Nashir V1 API endpoints.
- Whether nashir_openapi_patch.yaml in marketing-os is superseded by nashir_v1_openapi.yaml.
- Whether nashir_v1_openapi.yaml moves to marketing-os or remains in nashir-ui-prototype.
- How type generation adapts to the chosen authority.

Until that gate closes:

- nashir-ui-prototype generates types from nashir_v1_openapi.yaml only.
- No backend is expected to implement nashir_v1_openapi.yaml endpoints.
- No API client is generated or used by the UI.

---

## 10. Backend Home Viability Assessment

| Dimension | Rating | Evidence | Required Before Implementation |
|---|---|---|---|
| Governance / gate model | **READY** | 100+ Nashir gate docs; verified sprint chain; source-of-truth precedence defined | None — adopt pattern immediately |
| Backend runtime baseline (Node.js, HTTP, guards, error model) | **READY** | Sprint 0–4 verified; guards, error-model, rbac, server operational | None for baseline; Nashir domain wiring requires separate gate |
| Workspace / tenant infrastructure | **READY** | WorkspaceRepository, Slice 0 verified; workspaceId mandatory pattern confirmed | None — reuse as-is |
| RBAC / auth foundations | **CONDITIONALLY READY** | Four Nashir permission codes in rbac.js; AuthGuard/WorkspaceContextGuard/MembershipCheck/PermissionGuard operational | Nashir Auth/RBAC and Workspace Identity Gate must expand permission matrix for full Nashir V1 surface |
| Campaign / evidence infrastructure | **CONDITIONALLY READY** | nashir-campaign-repository.js, nashir-evidence-lifecycle-repository.js, Nashir routes, in-memory store entities | Must reconcile marketing-os `nashir_campaign_id` model with Nashir V1 `CampaignContent` model at ERD gate |
| Entity naming compliance | **NOT READY** | `Asset` naming conflict confirmed; marketing-os forbids standalone `Asset` table | ERD Reconciliation Gate must produce explicit SQL-to-API name mapping for `Asset` |
| Products, Creator Studio, Prompt Governance, Model Routing, Cost Monitor, Data Sources | **NOT READY** | No marketing-os entities for any of these | ERD Reconciliation Gate + SQL gate + Nashir Backend Slice 0+ planning |
| OpenAPI source-of-truth | **NOT READY** | Two partial Nashir OpenAPI contracts coexist (nashir_v1_openapi.yaml and nashir_openapi_patch.yaml) | Nashir OpenAPI Source-of-Truth Gate |
| Database schema for Nashir | **NOT READY** | No approved Nashir SQL schema; campaign DB persistence is gated but not executed | Nashir ERD Reconciliation Gate |
| Production / Pilot | **NOT READY** | marketing-os is NO-GO for Pilot/Production; Nashir must pursue its own production gate | Separate Nashir Production Readiness Gate (future) |

**Overall viability: CONDITIONALLY READY**

marketing-os is viable as Nashir's backend/governance home. The baseline infrastructure, governance model, and partial Nashir implementation are real assets. The entity naming conflict, missing entities, dual OpenAPI contract, and NO-GO production boundary are real blockers that must be resolved in sequence before any implementation can proceed.

---

## 11. Reuse Decision Table

| marketing-os Artifact | Decision | Condition |
|---|---|---|
| Governance model / gate discipline | **Reuse now** | Adopt approach; do not copy document templates |
| Source-of-truth precedence model | **Reuse now** | Apply directly to Nashir planning chain |
| Node.js backend baseline | **Reuse after reconciliation** | Nashir domain code must be namespaced and gated separately |
| Repository pattern (narrow interface, workspaceId, domain errors) | **Reuse after reconciliation** | Adopt for Nashir repositories; derive from Nashir ERD |
| pg / migration approach | **Reuse after reconciliation** | Nashir SQL files separate from Marketing OS SQL files |
| OpenAPI lint approach | **Reuse after reconciliation** | Nashir OpenAPI must pass lint after source-of-truth gate |
| Test + integration test structure | **Reuse after reconciliation** | Nashir-specific test cases must match Nashir contracts |
| Workspace / Membership / RBAC infrastructure | **Reuse after reconciliation** | Existing workspace entity is shared; Nashir RBAC extends existing permission system |
| Campaign / evidence infrastructure (nashir- prefixed files) | **Reuse after reconciliation** | Starting point only; reconcile with Nashir V1 OpenAPI before relying on current entity model |
| ErrorModel | **Reuse after reconciliation** | Nashir V1 ErrorCode enum must be bridged to marketing-os ErrorModel |
| BrandProfile / BrandVoiceRule repositories | **Reference only** | Marketing OS brand concepts; do not conflate with Nashir StoreProfile |
| AI/workflow/runtime patterns (Patch 002 connectors) | **Reference only** | No Nashir AI execution pattern exists; do not copy connector runtime |
| prototype/ directory | **Reject** | Not a source of truth for Nashir UI or backend |
| marketing-os static Nashir UI (`ui/nashir/`) | **Reject as source of truth** | nashir-ui-prototype is the authoritative UI |
| Marketing OS SQL schema (base + patch 001 + patch 002) | **Do not copy** | Nashir SQL schema must be derived from Nashir ERD and entity mapping |
| Marketing OS OpenAPI contract | **Do not copy** | Nashir V1 OpenAPI is a separate contract; reconcile at source-of-truth gate |

---

## 12. Blocking Findings

The following must be resolved before any Nashir backend implementation may begin in marketing-os:

| ID | Finding | Severity | Resolution |
|---|---|---|---|
| B-R01 | `Asset` entity naming conflict — marketing-os forbids standalone `Asset` SQL table; Nashir V1 OpenAPI uses `Asset` as external schema name | **HIGH — BLOCKER** | Nashir ERD Reconciliation Gate must produce explicit SQL name (`nashir_assets` candidate) and document OpenAPI-to-SQL mapping |
| B-R02 | marketing-os `nashir_campaign_id` model vs Nashir V1 OpenAPI `CampaignContent` model are related but distinct; no approved mapping | **HIGH** | Nashir ERD Reconciliation Gate |
| B-R03 | No Nashir SQL schema approved; existing marketing-os schema covers Marketing OS entities only | **HIGH** | Nashir ERD Reconciliation Gate |
| B-R04 | Two partial Nashir OpenAPI contracts coexist: nashir_v1_openapi.yaml (nashir-ui-prototype) and nashir_openapi_patch.yaml (marketing-os) | **HIGH** | Nashir OpenAPI Source-of-Truth Gate |
| B-R05 | Products, Creator Studio, Prompt Governance, Model Routing, Cost Monitor, Workflow Definitions, Data Sources have no marketing-os entities | **HIGH** | Nashir ERD Reconciliation Gate |
| B-R06 | Auth/RBAC is partial — four permission codes exist; full Nashir V1 permission matrix not mapped | **MEDIUM** | Nashir Auth/RBAC and Workspace Identity Gate |
| B-R07 | StoreProfile / store identity has no approved mapping to marketing-os BrandProfile or a new entity | **MEDIUM** | Nashir ERD Reconciliation Gate |
| B-R08 | marketing-os Pilot/Production is NO-GO; Nashir has no independent production gate | **MEDIUM** | Future Nashir Production Readiness Gate |
| B-R09 | No approved Nashir backend vertical slice with allowed files, forbidden files, verification commands, and rollback criteria | **MEDIUM** | Nashir Backend Slice 0 Planning gate |
| B-R10 | Environment/config strategy for Nashir-specific runtime modes (NASHIR_CAMPAIGN_RUNTIME_MODE, NASHIR_EVIDENCE_RUNTIME_MODE) not extended to cover full Nashir surface | **LOW** | Nashir Backend Slice 0 Planning gate |

---

## 13. Non-blocking Findings

| ID | Finding | Action |
|---|---|---|
| NB-R01 | nashir_v1_openapi.yaml uses `Asset` as the external schema name consistently. The naming conflict is at the SQL layer only, not at the OpenAPI/generated-type layer. No change to the OpenAPI contract is needed to resolve this conflict. | Carry into ERD Reconciliation Gate as a constraint |
| NB-R02 | marketing-os `nashir-campaign-repository.js` and `nashir-evidence-lifecycle-repository.js` are real artifacts. They represent a starting point for Nashir backend work but may need refactoring once the Nashir V1 entity model is reconciled. | Do not delete; evaluate at ERD gate |
| NB-R03 | The Nashir V1 OpenAPI uses `workspaceId` path parameter throughout, consistent with marketing-os's existing workspace-scoped route pattern. No conflict on workspace identity routing. | Confirmed compatibility — carry as positive signal |
| NB-R04 | The Nashir V1 OpenAPI includes idempotency key, If-Match/ETag, and X-Resource-Version headers — consistent with marketing-os concurrency patterns. No conflict on concurrency model. | Confirmed compatibility |
| NB-R05 | marketing-os campaign readiness scoring contract and approval state machine contract exist as planning documents. These provide useful input for Nashir CampaignContent review states but must be reviewed and adapted, not copied. | Carry into ERD gate as reference input |
| NB-R06 | Four Nashir permission codes already present in marketing-os `src/rbac.js`. These are a positive asset for the Auth/RBAC gate but require expansion for the full Nashir V1 surface (products, assets, creator studio, prompts, model routes). | Carry into Auth/RBAC gate |
| NB-R07 | The Nashir V1 ErrorCode enum includes creator_studio.* error codes not present in marketing-os's ErrorModel. A bridge mapping is needed. This is not a blocker for the reconciliation gate but must be resolved before Creator Studio routes are implemented. | Carry into ERD gate and Backend Slice 0 Planning |

---

## 14. Recommended Next Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir ERD Reconciliation Gate** | This gate (conditionally viable confirmed) | Produces approved Nashir SQL entity map; resolves Asset naming conflict; maps all Nashir V1 OpenAPI entities to SQL; no SQL may be written without it |
| 2 | **Nashir OpenAPI Source-of-Truth Gate** | Can run in parallel with ERD gate as planning | Resolves dual-contract risk; decides whether nashir_v1_openapi.yaml moves to marketing-os or remains as UI contract; must close before backend routes implement nashir_v1_openapi.yaml |
| 3 | **Nashir Auth/RBAC and Workspace Identity Gate** | ERD gate (needs entity definitions) | Expands four existing Nashir permission codes to full Nashir V1 RBAC matrix; maps workspace, membership, tenant isolation for all Nashir entities |
| 4 | **Nashir Backend Slice 0 Planning** | Auth/RBAC gate | Plans first implementable Nashir backend slice in marketing-os with exact allowed files, forbidden files, verification commands, rollback criteria |
| 5 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API; blocked until gates 1–4 close |

If marketing-os later fails ERD reconciliation (entity conflict cannot be resolved), escalate to:

- **Nashir Backend Repository Alternative Decision Gate** — activates Option B (new nashir-backend repo)

**UI API integration must not proceed before gates 1, 2, and 3 close.**

---

## 15. Decision

### Final decision

| Area | Status |
|---|---|
| marketing-os as Nashir backend/governance home | **CONDITIONALLY VIABLE — CONFIRMED** |
| GO to Nashir ERD Reconciliation Gate | **GO** |
| GO to Nashir OpenAPI Source-of-Truth Gate (planning only, no migration) | **GO — planning in parallel** |
| Backend implementation | **NO-GO** |
| Database migrations / SQL schema | **NO-GO** |
| UI API integration | **NO-GO** |
| Auth/RBAC implementation | **NO-GO** |
| Code copy from marketing-os | **NO-GO** |
| Production / Pilot | **NO-GO** |
| Using marketing-os prototype/ as source of truth | **NO-GO — permanent** |
| Renaming nashir_v1_openapi.yaml schema names to satisfy SQL rules | **NO-GO** |

### marketing-os viability decision

| Repository | Decision |
|---|---|
| marketing-os | **CONDITIONALLY VIABLE** as Nashir backend/governance home — subject to B-R01 (Asset naming), B-R03 (SQL schema), B-R04 (OpenAPI source-of-truth), and B-R05 (missing entities) being resolved at their respective gates |
| nashir-backend (new repo) | **DEFERRED** — remain on standby; activate only if marketing-os ERD reconciliation fails |
| nashir-ui-prototype | **NOT SELECTED** — permanent; no backend code enters this repo |

### Next gate

**Nashir ERD Reconciliation Gate**

That gate must:

- Produce an approved Nashir SQL entity map covering all Nashir V1 OpenAPI entities.
- Resolve the `Asset` naming conflict explicitly (SQL name ≠ OpenAPI schema name mapping).
- Map existing marketing-os `nashirCampaigns` to Nashir V1 `CampaignContent` or document the parent/child relationship.
- Identify all new tables required, candidate column sets, and tenant isolation requirements.
- Not authorize implementation. It is a documentation-only ERD planning and review gate.

Until that gate closes, no Nashir backend SQL schema, migration, or table definition may be written.
