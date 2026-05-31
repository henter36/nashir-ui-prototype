# Nashir SQL Schema Planning Gate

| Field | Value |
|---|---|
| Gate type | SQL Schema Planning Gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Translates approved ERD, Auth/RBAC, workspace isolation, OpenAPI security metadata, and marketing-os schema patterns into a V1 SQL schema candidate plan |
| Prerequisite gate | `docs/nashir_openapi_security_yaml_patch_review_gate.md` — merged, READY |
| SQL DDL created | NO |
| Migrations created | NO |
| Backend routes implemented | NO |
| Auth/RBAC implementation approved | NO |
| OpenAPI YAML changes approved in this slice | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is a SQL Schema Planning Gate only.

**No SQL DDL is created.**

**No migrations are created.**

**No backend routes are implemented.**

**No auth/RBAC implementation is approved.**

**No OpenAPI YAML change is approved in this slice.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> What future SQL schema should Nashir V1 use, which entities/tables are in scope, what relationships and constraints are required, and what must remain blocked before migration implementation?

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `docs/nashir_erd_reconciliation_gate.md` | V1 ERD candidate complete; Asset naming conflict documented; 27 IN-status entities |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | 35 permission codes (33 V1 + 2 DEFER); 7 roles; 3 SQL gate conditions (C-RV01/C-RV02/C-RV03) |
| `docs/nashir_auth_rbac_review_gate.md` | READY WITH WATCH ITEMS; C-RV01/C-RV02/C-RV03 are SQL-gate conditions |
| `docs/nashir_openapi_source_of_truth_gate.md` | nashir_v1_openapi.yaml is current authority; migration blocked until Backend Slice 0 |
| `docs/nashir_openapi_security_mapping_gate.md` | All 35 operations mapped; workspace scope confirmed via route for all |
| `docs/nashir_openapi_security_yaml_patch_planning_gate.md` | x-extension contract confirmed; guard chain patterns documented |
| `docs/nashir_openapi_security_yaml_patch_review_gate.md` | READY FOR SQL SCHEMA PLANNING; no blockers |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE; Asset naming B-R01 documented |
| `docs/nashir_backend_home_decision.md` | marketing-os SELECTED AS CANDIDATE |
| `docs/nashir_production_architecture_boundary_gate.md` | PostgreSQL candidate; backend/DB undecided at time of writing |
| `docs/workspace_and_minimum_identity_decision.md` | V1: one workspace → one StoreProfile; multi-store deferred |
| `docs/nashir_v1_openapi.yaml` | All operations; security metadata; entity schemas |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO; Sprint 5 NO-GO |
| `package.json` | pg ^8.20.0 confirmed |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` | **Base schema — key findings:** PostgreSQL with pgcrypto; tables: customer_accounts, users, roles, permissions, workspaces, role_permissions, workspace_members, brand_profiles, brand_voice_rules, prompt_templates, media_jobs, media_assets, media_asset_versions, review_tasks, approval_decisions, publish_jobs, manual_publish_evidence, audit_logs; append-only trigger on audit_logs |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_003.sql` | **Nashir evidence tables:** nashir_evidence (uuid PK, workspace_id FK, nashir_campaign_id, evidence_type, channel, status enum, actor FKs, timestamps, constraints); nashir_evidence_lifecycle_events (lifecycle event log) |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_004.sql` | **Nashir campaign table:** nashir_campaigns (uuid PK, workspace_id FK, campaign_name, nashir_campaign_status enum, created_by FK, timestamps, constraints, indexes) |
| `scripts/db-migrate.js` | Migration runner uses psql `\i` includes with pg_advisory_lock; strict sequential order; 5-file chain confirmed (base + patches 001-004) |

### Key verified findings

> **FINDING-SQL1 (CONFIRMED — not assumption):** PostgreSQL is the database engine. Evidence: marketing-os uses pgcrypto extension, UUID primary keys via `gen_random_uuid()`, `timestamptz`, `REFERENCES` foreign keys, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$` enum creation, `pg_advisory_lock`, psql `\i` include syntax.

> **FINDING-SQL2:** Existing marketing-os tables reusable for Nashir: `workspaces`, `users`, `roles`, `permissions`, `role_permissions`, `workspace_members`, `audit_logs`, `prompt_templates`. These are in the base schema already applied.

> **FINDING-SQL3:** Existing Nashir-specific tables in marketing-os: `nashir_campaigns` (Patch 004), `nashir_evidence` (Patch 003), `nashir_evidence_lifecycle_events` (Patch 003).

> **FINDING-SQL4:** Next Nashir SQL patch will be `schema_patch_005.sql` (and beyond). Migration numbering is sequential and cannot be skipped.

> **FINDING-SQL5:** marketing-os `prompt_templates` table type enum (`caption`, `ad_copy`, `image_prompt`, `video_script`, `report`, `reply`) does not align with Nashir's prompt governance model. Nashir prompt governance requires versioned, approval-state-bound templates with human review. A separate `nashir_prompt_templates` table or a reconciliation of the existing table is required.

---

## 3. Planning Question

**What future SQL schema should Nashir V1 use, which entities/tables are in scope, what relationships and constraints are required, and what must remain blocked before migration implementation?**

**Summary:** Nashir V1 SQL schema is PostgreSQL-based, extending the existing marketing-os migration chain with new Nashir-prefixed patch files. The workspace/RBAC/audit foundation is already in the base schema. Three existing Nashir tables (campaigns, evidence, evidence_lifecycle) are already in patches 003 and 004. Fourteen new Nashir-prefixed tables are needed for the full V1 surface. The migration ownership lives in marketing-os. No SQL implementation is approved in this gate.

---

## 4. Authority and Repository Boundary

- **nashir-ui-prototype** remains the planning/contract/UI prototype repository. No schema files are created here.
- **marketing-os** is the candidate future backend/schema home. Future SQL migrations belong in `marketing-os/docs/` as new numbered patch files (starting at `schema_patch_005.sql`).
- This document does not move schema ownership to marketing-os. The Backend Slice 0 Planning gate must formally approve the migration PR structure.
- No schema files are created in nashir-ui-prototype.
- No marketing-os files are modified.

---

## 5. Database Engine Assessment

**Database engine: PostgreSQL — CONFIRMED (not candidate)**

Evidence (from `marketing_os_v5_6_5_phase_0_1_schema.sql`):
- `CREATE EXTENSION IF NOT EXISTS pgcrypto` (PostgreSQL extension)
- `gen_random_uuid()` (PostgreSQL function)
- `timestamptz` (PostgreSQL type)
- `uuid` (PostgreSQL type)
- `jsonb` (PostgreSQL type)
- `pg_advisory_lock` (PostgreSQL advisory locking)
- `DO $$ BEGIN ... END $$` (PostgreSQL procedural block)
- psql `\i` include syntax in migration driver

**PostgreSQL version requirement:** marketing-os `package.json` specifies `node: ">=20"` for Node.js; `pg ^8.20.0` for the pg driver. PostgreSQL 14+ is implied by feature usage.

**DB-engine decision status:** RESOLVED — PostgreSQL is approved through marketing-os precedent and the decision to use marketing-os as the backend home.

**DB-engine blocks migration implementation?** No. DB engine is confirmed. What blocks migration implementation is: (1) Backend Slice 0 Planning gate, (2) SQL Schema Review Gate, (3) SQL Schema Implementation Planning Gate.

---

## 6. V1 Domain Groups

1. **Identity and tenancy** — Workspace, User, WorkspaceMember, Role, Permission, RolePermission
2. **Store and catalog** — StoreProfile, Product, Asset
3. **Campaign and content** — Campaign, CampaignContent, PreviewArtifact, Evidence
4. **Creator Studio** — Session, ContentIdea, CampaignAngle, AudienceSegment, PublishWindow, ContextDraft, TransferDraft, ReadinessAssessment
5. **Publishing** — PublishingQueueItem
6. **Governance and review** — PromptTemplate, PromptGovernanceVersion, ApprovalDecision
7. **AI operations and cost** — ModelRoutingRule, AIProvider, CostUsageRecord
8. **Integrations and data sources** — DataSource, IntegrationConnection (deferred)
9. **Audit and evidence** — AuditLog (reuse), Evidence (existing Patch 003)
10. **Workflow references** — WorkflowDefinition (advisory only, defer)

---

## 7. Candidate Table Inventory

| Candidate Table Name | Domain | Source Entity | V1 Status | Persistence Reason | Workspace Scoped | Store Scoped | Privacy | Lifecycle Owner | SQL Readiness |
|---|---|---|---|---|---|---|---|---|---|
| `workspaces` | Identity/tenancy | Workspace | **IN — REUSE** | Marketing-os base schema | — (IS the boundary) | — | LOW | Platform/admin | **READY** |
| `users` | Identity/tenancy | User | **IN — REUSE** | Marketing-os base schema | Multiple | — | HIGH | Auth provider | **READY** |
| `roles` | Identity/tenancy | Role | **IN — REUSE/EXTEND** | Marketing-os base schema | YES | — | LOW | Platform/admin | **READY** |
| `permissions` | Identity/tenancy | Permission | **IN — REUSE/EXTEND** | Marketing-os base schema; add 35 Nashir codes | YES | — | LOW | Platform/admin | **READY — needs seed data** |
| `role_permissions` | Identity/tenancy | RolePermission | **IN — REUSE/EXTEND** | Marketing-os base schema; add Nashir assignments | — | — | LOW | Platform/admin | **READY — needs seed data** |
| `workspace_members` | Identity/tenancy | WorkspaceMember | **IN — REUSE** | Marketing-os Slice 0 verified | YES | — | MEDIUM | Workspace admin | **READY** |
| `audit_logs` | Audit | AuditEvent | **IN — REUSE** | Marketing-os base schema; append-only trigger | YES | — | MEDIUM | Platform (append-only) | **READY** |
| `nashir_store_profiles` | Store/catalog | StoreProfile | **IN — NEW** | Commerce identity; 1:1 with workspace | YES | — | LOW–MEDIUM | Business user | **NEEDS CLARIFICATION** |
| `nashir_products` | Store/catalog | Product | **IN — NEW** | Catalog records; productId canonical | YES | Implicit | LOW | Business user | **NEEDS CLARIFICATION** |
| `nashir_assets` | Store/catalog | Asset (OpenAPI: `Asset`) | **IN — NEW** | Asset metadata; assetId canonical; SQL name ≠ OpenAPI name | YES | Implicit | LOW–MEDIUM | Content manager | **NEEDS CLARIFICATION** |
| `nashir_campaigns` | Campaign/content | Campaign | **IN — EXISTS (Patch 004)** | Campaign organizational unit | YES | — | LOW | Campaign manager | **READY** |
| `nashir_campaign_content_items` | Campaign/content | CampaignContent | **IN — NEW** | Content draft + review state; campaignContentId canonical | YES | Implicit | LOW–MEDIUM | Content creator | **NEEDS CLARIFICATION** |
| `nashir_preview_artifacts` | Campaign/content | PreviewArtifact | **IN — NEW** | Preview metadata only; no binary | YES | Implicit | LOW | Content creator | **NEEDS CLARIFICATION** |
| `nashir_evidence` | Evidence | Evidence/ManualPublishEvidence | **IN — EXISTS (Patch 003)** | User-provided publishing proof | YES | — | MEDIUM | Publisher | **READY** |
| `nashir_evidence_lifecycle_events` | Evidence | EvidenceLifecycleEvent | **IN — EXISTS (Patch 003)** | Evidence state history | YES | — | MEDIUM | Platform (append-only) | **READY** |
| `nashir_publishing_queue_items` | Publishing | PublishingQueueItem | **IN — NEW** | Scheduling metadata; references approved content | YES | Implicit | LOW | Publisher | **NEEDS CLARIFICATION** |
| `nashir_creator_studio_sessions` | Creator Studio | CreatorStudioSession | **IN — NEW** | TTL-managed; HIGH privacy | YES | Implicit | **HIGH** | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_content_ideas` | Creator Studio | ContentIdea | **IN — NEW** | Session-scoped; draft AI advisory | YES | Implicit | LOW–MEDIUM | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_campaign_angles` | Creator Studio | CampaignAngle | **IN — NEW** | Session-scoped; draft AI advisory | YES | Implicit | LOW | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_audience_segments` | Creator Studio | AudienceSegment | **IN — NEW** | Session-scoped; consent-gated | YES | Implicit | MEDIUM | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_publish_windows` | Creator Studio | PublishWindow | **IN — NEW** | Session-scoped; advisory | YES | Implicit | LOW | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_context_drafts` | Creator Studio | CreatorContextDraft | **IN — NEW** | TTL-managed; state machine | YES | Implicit | MEDIUM | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_transfer_drafts` | Creator Studio | CreatorTransferDraft | **IN — NEW** | TTL-managed; destination-typed | YES | Implicit | MEDIUM | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_creator_readiness_assessments` | Creator Studio | ReadinessAssessment | **IN — NEW** | Advisory snapshot; expires | YES | Implicit | LOW | Creator Studio | **NEEDS CLARIFICATION** |
| `nashir_prompt_templates` | Governance | PromptTemplate | **IN — NEW (or EVALUATE REUSE)** | Versioned; governance-critical; see FINDING-SQL5 | YES | — | MEDIUM | Prompt governance admin | **NEEDS CLARIFICATION** |
| `nashir_prompt_governance_versions` | Governance | PromptGovernanceVersion | **IN — NEW** | Version-bound; approval state | YES | — | MEDIUM | Prompt governance admin | **NEEDS CLARIFICATION** |
| `nashir_approval_decisions` | Governance | ReviewDecision/ApprovalDecision | **IN — NEW or EVALUATE REUSE** | Human approval record; content-version-bound | YES | Implicit | LOW | Reviewer/admin | **NEEDS CLARIFICATION** |
| `nashir_model_routing_rules` | AI ops | ModelRoutingRule | **IN — NEW** | Advisory snapshot; no live probe | YES | — | LOW | Platform/admin | **NEEDS CLARIFICATION** |
| `nashir_ai_providers` | AI ops | AIProvider | **IN — NEW** | Advisory snapshot; vault_ref only | YES | — | MEDIUM | Platform/admin | **NEEDS CLARIFICATION** |
| `nashir_cost_usage_records` | AI ops | CostUsageRecord | **IN — NEW (or EVALUATE reuse of cost_events)** | Advisory; not billing | YES | — | LOW | Platform/cost admin | **NEEDS CLARIFICATION** |
| `nashir_data_sources` | Integrations | DataSource | **DEFER** | V1: UI-only or minimal reference; connector execution deferred | YES | — | MEDIUM | Post-V1 | **DEFER** |
| `nashir_integration_connections` | Integrations | IntegrationConnection | **DEFER** | OAuth/connector management; deferred | YES | — | HIGH | Post-V1 | **DEFER** |
| `nashir_workflow_definitions` | Workflow | WorkflowDefinition | **DEFER** | Advisory metadata only; no execution | YES | — | LOW | Post-V1 | **DEFER** |

---

## 8. Entity-to-OpenAPI Mapping

| OpenAPI Operation Group | Candidate Tables | Read/Write | Required Permission | Workspace Scope Source | Audit/Evidence Req | Schema Readiness |
|---|---|---|---|---|---|---|
| Products | nashir_products | R/W | nashir.product.read / nashir.product.write | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Assets | nashir_assets | R/W + link | nashir.asset.read / nashir.asset.write / nashir.asset.link | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Campaign Content | nashir_campaign_content_items, nashir_preview_artifacts | R/W | nashir.content.* | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Content review/approval | nashir_campaign_content_items (status), nashir_approval_decisions, nashir_evidence | R/W | nashir.content.submit_review, nashir.approval.decide | route → workspace_id | REQUIRED: audit_logs + evidence | NEEDS CLARIFICATION |
| AI Readiness | nashir_workflow_definitions (advisory), nashir_ai_providers, nashir_model_routing_rules | R | nashir.workflow.read, nashir.model_routing.read, nashir.prompt_governance.read | route → workspace_id | None (advisory) | DEFER (workflow), NEEDS CLARIFICATION |
| Creator Studio sessions | nashir_creator_studio_sessions | R/W | nashir.creator_studio.use | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Creator context drafts | nashir_creator_context_drafts, nashir_creator_content_ideas etc. | R/W | nashir.creator_studio.transfer.create | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Creator transfer drafts | nashir_creator_transfer_drafts | R/W | nashir.creator_studio.use (GET) / nashir.creator_studio.transfer.create (POST) | route → workspace_id | W: audit_logs | NEEDS CLARIFICATION |
| Prompt readiness | nashir_prompt_templates, nashir_prompt_governance_versions | R | nashir.prompt_governance.read | route → workspace_id | None | NEEDS CLARIFICATION |
| Provider/model readiness | nashir_ai_providers, nashir_model_routing_rules | R | nashir.model_routing.read | route → workspace_id | None | NEEDS CLARIFICATION |

---

## 9. Identity/RBAC Schema Plan

### Approach: Extend existing marketing-os tables

The marketing-os base schema already has `roles`, `permissions`, `role_permissions`, `workspace_members`. These are proven (Slice 0 verified). Nashir extends them with:

**roles table** — add 7 Nashir role seed rows: owner, admin, creator, reviewer, publisher, billing_admin, viewer (all `role_scope: 'workspace'`, `is_system_role: true`). Some of these already exist in marketing-os; verify before inserting to avoid duplicates.

**permissions table** — add 33 Nashir-specific V1 permission codes (the 35 defined minus 2 DEFER integration codes). Use existing marketing-os insert pattern.

**role_permissions table** — add Nashir role-permission assignment rows per Section 9 of `docs/nashir_auth_rbac_workspace_identity_gate.md`.

### C-RV01 resolution: nashir.admin.manage vs workspace.manage

`workspace.manage` covers workspace settings updates. `nashir.admin.manage` is reserved for Nashir-specific system-level admin actions that go beyond workspace settings (e.g., bulk admin operations, system configuration specific to Nashir). Both are owner/admin only. The boundary in V1: `workspace.manage` for workspace metadata; `nashir.admin.manage` for Nashir-specific operational actions not covered by workspace.manage. This distinction must be explicit in the permission seed description field.

### C-RV02 resolution: RA (Requires Additional Approval) semantics for reviewer + nashir.evidence.manage

`RA` in the role-permission matrix means: the role holds the permission but the system must enforce an additional approval check at the service layer (not just RBAC). For `reviewer + nashir.evidence.manage`: reviewer can call evidence.manage operations, but the service must verify that the reviewer is not managing their own evidence record (similar to self-approval denial). This is a service invariant, not a RBAC gate. RA is documented as a service-layer flag, not a separate permission code.

### C-RV03 resolution: permission pattern description correction

The canonical pattern is `nashir.domain.action` (dots only). The Auth/RBAC gate's Section 5 Identity table had a typographic error (`nashir_domain.action` with underscore). The SQL seed data must use dots: `nashir.product.read`, `nashir.content.create`, etc. No underscore between nashir and domain.

### RBAC seed data plan

- No destination service actor in V1 RBAC seed data.
- No system admin role that bypasses workspace isolation (system admin must still operate within workspace scope in V1).
- Existing marketing-os roles (creator, reviewer, publisher, billing_admin, viewer, owner, admin) likely already exist in the base schema seed — verify and supplement, do not duplicate.
- Self-approval denial: NOT a RBAC gate. It is a service-layer invariant for `approveCampaignContent` and `rejectCampaignContent`. The rule: actor who created the content cannot be the approver. Enforced in service code, not in permission table.

---

## 10. Workspace and Store Isolation Plan

| Table | workspace_id Required | store_id / store_profile_id Required | Scope Derivation | Guard Dependency | Risk |
|---|---|---|---|---|---|
| workspaces | — (IS workspace) | — | Self | None | None |
| users | Via workspace_members join | — | Via membership | None | None |
| workspace_members | YES | — | Direct | workspaceContextGuard | LOW |
| roles / permissions / role_permissions | — (system global) | — | System-level | None | LOW |
| nashir_store_profiles | YES | — (1:1 with workspace) | Direct | workspaceContextGuard | LOW |
| nashir_products | YES | Implicit via workspace's store | Via workspace | workspaceContextGuard | LOW |
| nashir_assets | YES | Implicit | Via workspace | workspaceContextGuard | LOW |
| nashir_campaigns | YES | — | Direct | workspaceContextGuard | LOW |
| nashir_campaign_content_items | YES | Implicit | Via campaign | workspaceContextGuard | MEDIUM |
| nashir_preview_artifacts | YES | Implicit | Via content item | workspaceContextGuard | LOW |
| nashir_evidence | YES | — | Direct (Patch 003 confirmed) | workspaceContextGuard | LOW |
| nashir_publishing_queue_items | YES | Implicit | Via approved content | workspaceContextGuard | MEDIUM |
| nashir_creator_studio_sessions | YES | Implicit | Direct | workspaceContextGuard + nonDisclosingMembershipCheck | HIGH |
| nashir_creator_context_drafts | YES | Implicit | Via session | workspaceContextGuard | MEDIUM |
| nashir_creator_transfer_drafts | YES | Implicit | Via context draft | workspaceContextGuard | MEDIUM |
| nashir_creator_* advisory | YES | Implicit | Via session | workspaceContextGuard | LOW–MEDIUM |
| nashir_prompt_templates | YES | — | Direct | workspaceContextGuard | MEDIUM |
| nashir_model_routing_rules | YES | — | Direct | workspaceContextGuard | LOW |
| nashir_ai_providers | YES | — | Direct | workspaceContextGuard | LOW |
| nashir_cost_usage_records | YES | — | Direct | workspaceContextGuard | LOW |
| audit_logs | YES (existing) | — | Direct | workspaceContextGuard | LOW |

**Cross-workspace access: NO-GO.** All repository methods must include `workspace_id` explicitly. Body `workspace_id` is rejected by `rejectBodyWorkspaceId` guard (documented in nashir_v1_openapi.yaml x-guard-chain for all mutating operations).

**V1 store scope:** storeProfileId should be available as a nullable foreign key on `nashir_products` and `nashir_assets` even if not used functionally in V1, to enable Post-V1 multi-store scoping without schema migration.

---

## 11. Creator Studio Lifecycle and TTL Plan

| Entity/Table | TTL Required | Expiry Behavior | Cleanup Responsibility | Privacy Risk | Migration Note |
|---|---|---|---|---|---|
| `nashir_creator_studio_sessions` | YES — max 24h | Session expiry invalidates all child drafts; GET returns 410 Gone for expired | Background cleanup job or lazy expiry check | **HIGH** — creator handle must be opaque reference only; never store raw handle | TTL column: `expires_at timestamptz NOT NULL`; status includes `expired` |
| `nashir_creator_content_ideas` | YES — via session TTL | Deleted or expired with parent session | Same as session | LOW–MEDIUM | `session_id` FK; `expires_at` from parent |
| `nashir_creator_campaign_angles` | YES — via session TTL | Same | Same | LOW | `session_id` FK |
| `nashir_creator_audience_segments` | YES — via session TTL | Same; consent-gated data | Same | MEDIUM — aggregate only; no individual PII | `session_id` FK; `consent_ref` column |
| `nashir_creator_publish_windows` | YES — via session TTL | Same | Same | LOW | `session_id` FK |
| `nashir_creator_context_drafts` | YES — max 24h; capped by session TTL | GET returns 410 Gone; transfer endpoints must reject expired drafts | Background cleanup or lazy check | MEDIUM — references session (high-privacy parent) | `expires_at` from session; `status` includes `expired` |
| `nashir_creator_transfer_drafts` | YES — max 24h; capped by context draft TTL | GET returns 410 Gone | Same | MEDIUM | `expires_at` from context draft |
| `nashir_creator_readiness_assessments` | YES — max 24h | Must be re-evaluated before each use | Same | LOW | `expires_at` column |

**Creator handle storage rule:** `creator_handle_ref` in `nashir_creator_studio_sessions` must be stored as an opaque reference string only. It must never contain a raw platform handle, username, or OAuth token. This is a DDL-level column naming and application-layer enforcement requirement.

**Automatic creation prevention:** `createCreatorStudioSession` has `x-no-automatic-execution: true`. This must be enforced at both the frontend layer (no page-load API call) and the backend layer (guard/service validation). No database trigger should create sessions automatically.

**payloadSummary sensitivity:** `nashir_creator_transfer_drafts.payload_summary` (or equivalent JSON column) must not store raw platform tokens, raw prompt text, or credentials. Only opaque references and structured metadata.

**Destination service actor:** deferred. No destination service account row in V1 RBAC seed. Not modeled as a user or role in V1.

---

## 12. Campaign, Content, Review, and Publishing Plan

### nashir_campaigns (EXISTS — Patch 004)

Already defined with: `nashir_campaign_id`, `workspace_id`, `campaign_name`, `campaign_status` enum (draft/generated/in_review/approved/rejected/archived/requires_reapproval/blocked_until_review/published), `created_by_user_id`, timestamps.

**Gap:** Does not include `store_profile_id` for future store scoping. A future patch should add a nullable `store_profile_id` column.

### nashir_campaign_content_items (NEW)

Key conceptual columns: `campaign_content_id`, `workspace_id`, `campaign_id` (FK to nashir_campaigns), `product_id` (FK to nashir_products), `title`, `channel`, `content_type`, `body_content` (text), `review_status` (enum: draft/ready_for_review/in_review/approved/rejected), `version` (opaque string or integer), `created_by_user_id`, timestamps.

**Self-approval prevention:** must be enforced at service layer. No SQL constraint can express "approver ≠ creator" cleanly across tables without a trigger. Service must check: approver_user_id ≠ created_by_user_id. Document as service invariant.

**Optimistic concurrency:** `version` field (string or timestamp-based) supports If-Match / X-Resource-Version headers from nashir_v1_openapi.yaml.

### nashir_preview_artifacts (NEW)

Key conceptual columns: `preview_artifact_id`, `workspace_id`, `campaign_content_id` (FK), `channel`, `format`, `display_summary`, `review_status`, `created_at`.

### nashir_approval_decisions (NEW or EVALUATE REUSE)

`approval_decisions` exists in marketing-os base schema. Evaluate whether Nashir's content approval can reuse it (action: approve/reject on `nashir_campaign_content_items`). If the existing table's schema is too tightly coupled to `media_asset_versions`, create `nashir_approval_decisions` with: `approval_id`, `workspace_id`, `campaign_content_id` (FK), `decision` (approved/rejected/changes_requested), `decided_by_user_id` (must ≠ created_by_user_id on content), `decision_note`, `rejection_reason`, `required_changes` (text[]), `created_at`.

### nashir_publishing_queue_items (NEW)

Key conceptual columns: `queue_item_id`, `workspace_id`, `campaign_content_id` (FK — must be approved, non-expired, non-archived), `status` (pending/scheduled/published/cancelled), `scheduled_by_user_id`, `human_confirmed` (boolean, default false), timestamps.

**No automatic external publishing.** Publishing requires human confirmation (`human_confirmed = true` before any status transition to `scheduled`).

---

## 13. Product, Store, Asset, and Data Source Plan

### nashir_store_profiles (NEW)

Key conceptual columns: `store_profile_id`, `workspace_id` (UNIQUE — 1:1 in V1), `store_name`, `store_url`, `category`, `activity`, `language`, `tone`, `audience_defaults` (jsonb), `channel_preferences` (text[]), `setup_status` (enum: incomplete/ready), timestamps.

### nashir_products (NEW)

Key conceptual columns: `product_id`, `workspace_id`, `store_profile_id` (nullable FK — for future multi-store scoping), `name` (display only; not identity), `category`, `price` (numeric), `currency`, `sku`, `stock_status` (enum), `image_url`, `video_url`, `description`, `status` (draft/active/archived), `version` (optimistic concurrency), timestamps.

### nashir_assets (NEW — SQL name ≠ OpenAPI schema name)

**Confirmed naming:** SQL table is `nashir_assets`. OpenAPI schema name remains `Asset`. No renaming of generated types.

Key conceptual columns: `asset_id`, `workspace_id`, `linked_product_id` (nullable FK to nashir_products), `name` (display only), `asset_type` (enum: image/video/logo/document/text/design), `url` (metadata reference; not binary upload), `preview_url`, `rights_status` (enum: needs_review/approved/rejected/unknown), `usage_rights` (enum: owned/licensed/user_generated/unknown), `source`, `quality`, `status` (draft/active/archived), `version`, timestamps.

### nashir_data_sources (DEFER)

UI-only in V1. No persistence table in V1 SQL. Any minimal reference entity (name, type, status) may be deferred to a future gate.

### nashir_integration_connections (DEFER)

OAuth/connector execution deferred. No table in V1. Vault references for integration tokens: stored in external vault only; no raw token column.

---

## 14. Prompt Governance, Model Routing, and Cost Plan

### prompt_templates vs nashir_prompt_templates

**DECISION NEEDED before SQL Implementation:** The existing `prompt_templates` table has `template_type` enum (caption, ad_copy, image_prompt, video_script, report, reply) which does not align with Nashir prompt governance requirements. Nashir needs: versioned templates, human approval state, deprecated/active/draft governance states, workspace-scoped, referenced by `promptTemplateId` in OpenAPI.

**Recommendation (not final):** Create `nashir_prompt_templates` as a separate table to avoid conflicting semantics. Evaluate at SQL Schema Review Gate.

### nashir_prompt_governance_versions (NEW)

Key conceptual columns: `prompt_version_id`, `workspace_id`, `prompt_template_id` (FK), `version_number` (integer), `approval_status` (enum: draft/active/deprecated/blocked), `version_body` (text — internal; not exposed raw in API responses), `approved_by_user_id` (nullable), `approved_at` (nullable), timestamps.

### nashir_model_routing_rules (NEW)

Advisory snapshot only. Key conceptual columns: `model_route_id`, `workspace_id`, `route_name` (display only), `primary_model_id`, `fallback_model_ids` (text[]), `provider_id` (FK to nashir_ai_providers), `route_health` (enum), `route_policy` (jsonb), `score` (integer, advisory), `last_updated_at`, timestamps.

### nashir_ai_providers (NEW)

Advisory snapshot; no raw secrets. Key conceptual columns: `provider_id`, `workspace_id`, `provider_name` (display only), `health_status` (enum), `supported_capabilities` (text[]), `supported_models` (text[]), `secret_reference_name` (vault reference — NOT raw key), `score` (advisory), `last_tested_at`, timestamps.

### nashir_cost_usage_records (NEW or EVALUATE reuse of cost_events)

`cost_events` exists in marketing-os. Evaluate reuse. If column semantics differ, create `nashir_cost_usage_records` with: `cost_record_id`, `workspace_id`, `campaign_id` (nullable FK), `model_route_id` (nullable FK), `usage_type`, `amount` (numeric — NOT billing), `currency`, `is_advisory` (always true), `recorded_at`, timestamps.

**Not billing. Not invoice. Not payment.** This is advisory tracking only.

---

## 15. Audit and Evidence Schema Plan

### audit_logs (REUSE — already exists)

Key verified columns: `audit_log_id`, `workspace_id`, `customer_account_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `before_snapshot` (jsonb), `after_snapshot` (jsonb), `metadata` (jsonb), `correlation_id`, `occurred_at`. Has append-only trigger (no UPDATE or DELETE allowed).

**Nashir usage:** Add Nashir-specific `action` values using the format `nashir.domain.action` (e.g., `nashir.campaign_content.approved`, `nashir.creator_studio_session.created`). These are string values in the `action` column — no schema change needed if the existing `varchar(160)` is long enough.

**Immutable requirement:** The existing append-only trigger on `audit_logs` satisfies this requirement. No separate Nashir audit mechanism needed.

### nashir_evidence (REUSE — Patch 003)

Already defined. Append-only via business rule. Status enum: submitted/accepted/rejected/invalidated/superseded.

### nashir_evidence_lifecycle_events (REUSE — Patch 003)

Already defined. Lifecycle event log for evidence state transitions. actor_user_id, reason_code, reviewer_notes.

---

## 16. Column-Level Conceptual Plan

All groups below are conceptual only. No SQL DDL.

### Identity and tenancy (REUSE)

**workspaces:** workspace_id (uuid PK), workspace_name, workspace_status, created_at, updated_at — already exists.

**users:** user_id (uuid PK), email, user_status, created_at — already exists.

**roles:** role_id (uuid PK), role_code (unique string, e.g., `creator`), role_name (display), role_scope (workspace), is_system_role (boolean) — already exists; extend seed.

**permissions:** permission_id (uuid PK), permission_code (unique string, e.g., `nashir.product.read`), permission_name, domain — already exists; extend seed.

**role_permissions:** role_permission_id (uuid PK), role_code, permission_code — already exists; extend seed.

**workspace_members:** member_id (uuid PK), workspace_id (FK), user_id (FK), role_code, member_status (invited/active/disabled/removed), invited_at, joined_at — already exists.

### Store and catalog (NEW)

**nashir_store_profiles:** store_profile_id (uuid PK), workspace_id (uuid FK, UNIQUE), store_name (varchar NOT NULL), category, activity, language, tone, audience_defaults (jsonb), channel_preferences (text[]), setup_status (enum), created_at, updated_at. Indexes: workspace_id (unique).

**nashir_products:** product_id (uuid PK), workspace_id (uuid FK), store_profile_id (uuid FK nullable — Post-V1 multi-store), name (varchar NOT NULL — display only), category, price (numeric), currency (varchar(10)), sku, stock_status (enum), image_url (text), video_url (text), description (text), status (enum: draft/active/archived), version (varchar — optimistic concurrency), created_by (uuid FK users), created_at, updated_at. Indexes: (workspace_id), (workspace_id, status).

**nashir_assets:** asset_id (uuid PK), workspace_id (uuid FK), linked_product_id (uuid FK nullable → nashir_products), name (varchar NOT NULL — display only), asset_type (enum: image/video/logo/document/text/design), url (text), preview_url (text), rights_status (enum: needs_review/approved/rejected/unknown), usage_rights (enum), source, quality, status (enum: draft/active/archived), version (varchar), created_by (uuid FK users), created_at, updated_at. Indexes: (workspace_id), (workspace_id, status), (workspace_id, linked_product_id).

### Campaign and content (NEW + EXISTING)

**nashir_campaigns (EXISTING Patch 004):** nashir_campaign_id (uuid PK), workspace_id (uuid FK), campaign_name (varchar NOT NULL), campaign_status (enum), created_by (uuid FK users), created_at, updated_at. Future column: store_profile_id (nullable FK — add in Patch 005+).

**nashir_campaign_content_items:** campaign_content_id (uuid PK), workspace_id (uuid FK), campaign_id (uuid FK → nashir_campaigns nullable — CampaignContent may exist without a campaign parent in V1), product_id (uuid FK NOT NULL → nashir_products), title (varchar NOT NULL), channel (varchar NOT NULL), content_type (varchar NOT NULL), body_content (text), cta (text), audience_summary (text), offer_summary (text), review_status (enum: draft/ready_for_review/in_review/approved/rejected), version (varchar — optimistic concurrency), created_by (uuid FK users), created_at, updated_at. Indexes: (workspace_id), (workspace_id, review_status), (workspace_id, product_id).

**nashir_campaign_content_assets:** campaign_content_asset_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK → nashir_campaign_content_items), asset_id (uuid FK → nashir_assets), sort_order (integer nullable), created_at. Purpose: replaces `selected_asset_ids uuid[]` so PostgreSQL can enforce referential integrity, workspace alignment, and asset deletion behavior through foreign keys. Indexes: (workspace_id, campaign_content_id), (workspace_id, asset_id).

**nashir_preview_artifacts:** preview_artifact_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL), channel (varchar NOT NULL), format (varchar NOT NULL), display_summary (text NOT NULL), asset_ids (uuid[]), review_status (enum), created_at. Indexes: (workspace_id, campaign_content_id).

**nashir_approval_decisions:** approval_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL), decision (enum: approved/rejected/changes_requested), decided_by (uuid FK users — NOT NULL; must ≠ content creator; service-layer check), decision_note (text), rejection_reason (text), required_changes (text[]), created_at. Indexes: (workspace_id, campaign_content_id).

### Creator Studio (NEW)

**nashir_creator_studio_sessions:** session_id (uuid PK), workspace_id (uuid FK), actor_user_id (uuid FK users NOT NULL), selected_platform (enum: Instagram/TikTok/YouTube/X/Snapchat), creator_handle_ref (text — OPAQUE REFERENCE ONLY; never raw handle), source (enum: manual — V1 only), manual_context (jsonb), status (enum: active/expired/blocked), created_at, expires_at (timestamptz NOT NULL), transferred_at (nullable). Indexes: (workspace_id, actor_user_id), (expires_at) WHERE status = 'active'.

**nashir_creator_content_ideas:** idea_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK → nashir_creator_studio_sessions), title, content_type, platform, rationale, confidence_label, status (enum: draft/human_review_required/accepted), created_at, expires_at. Indexes: (workspace_id, session_id).

**nashir_creator_campaign_angles:** angle_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK), label, audience, rationale, confidence_label, status, created_at, expires_at. Indexes: (workspace_id, session_id).

**nashir_creator_audience_segments:** segment_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK), label, platform, share (numeric), confidence_label, data_source, consent_ref (opaque), created_at, expires_at. Indexes: (workspace_id, session_id).

**nashir_creator_publish_windows:** window_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK), day_of_week, time_range, note, platform, confidence_label, data_source, created_at, expires_at. Indexes: (workspace_id, session_id).

**nashir_creator_context_drafts:** draft_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK NOT NULL), idea_id (uuid FK nullable), angle_id (uuid FK nullable), segment_id (uuid FK nullable), window_id (uuid FK nullable), prompt_template_id (uuid FK nullable → nashir_prompt_templates), status (enum: draft/incomplete/needs_consent/needs_human_review/ready_for_transfer/blocked/expired), human_review_required (boolean default true), created_at, expires_at. Indexes: (workspace_id, session_id), (workspace_id, status), (expires_at) WHERE status NOT IN ('expired','blocked').

**nashir_creator_transfer_drafts:** transfer_id (uuid PK), workspace_id (uuid FK), context_draft_id (uuid FK NOT NULL), session_id (uuid FK NOT NULL), destination_module (enum: content_studio/campaign_wizard/publishing_queue/prompt_governance), status (enum: pending_review/expired), payload_summary (jsonb — NO raw tokens, NO raw prompt text, opaque refs only), human_review_required (boolean default true), created_at, expires_at. Indexes: (workspace_id, context_draft_id), (workspace_id, destination_module).

**nashir_creator_readiness_assessments:** assessment_id (uuid PK), workspace_id (uuid FK), draft_id (uuid FK NOT NULL), overall_status (enum), findings (jsonb), blockers (text[]), warnings (text[]), created_at, expires_at. Indexes: (workspace_id, draft_id).

### Prompt governance (NEW)

**nashir_prompt_templates:** prompt_template_id (uuid PK), workspace_id (uuid FK), template_name (varchar NOT NULL — display only; not identity), created_by (uuid FK users), status (enum: active/deprecated/archived), created_at, updated_at. Indexes: (workspace_id), (workspace_id, status).

**nashir_prompt_governance_versions:** prompt_version_id (uuid PK), workspace_id (uuid FK), prompt_template_id (uuid FK NOT NULL), version_number (integer NOT NULL), version_body (text NOT NULL — internal; not returned raw in API), approval_status (enum: draft/active/deprecated/blocked), approved_by (uuid FK users nullable), approved_at (nullable timestamptz), created_at. Indexes: (workspace_id, prompt_template_id), (workspace_id, approval_status).

### AI ops (NEW)

**nashir_ai_providers:** provider_id (uuid PK), workspace_id (uuid FK), health_status (enum), supported_capabilities (text[]), supported_models (text[]), secret_reference_name (text — vault ref only, NOT raw secret), score (integer advisory), last_tested_at (nullable), updated_at. Indexes: (workspace_id).

**nashir_model_routing_rules:** model_route_id (uuid PK), workspace_id (uuid FK), primary_model_id (text NOT NULL), fallback_model_ids (text[]), provider_id (uuid FK nullable → nashir_ai_providers), route_health (enum), route_policy (jsonb), score (integer advisory), updated_at. Indexes: (workspace_id).

**nashir_cost_usage_records:** cost_record_id (uuid PK), workspace_id (uuid FK), campaign_id (uuid nullable FK), model_route_id (uuid nullable FK), usage_type (varchar NOT NULL), amount (numeric NOT NULL), currency (varchar(10) NOT NULL), is_advisory (boolean default true), recorded_at (timestamptz NOT NULL), created_at. Indexes: (workspace_id, recorded_at), (workspace_id, campaign_id).

### Publishing (NEW)

**nashir_publishing_queue_items:** queue_item_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL — must be approved, non-expired, non-archived), status (enum: pending/scheduled/cancelled), scheduled_by (uuid FK users NOT NULL), human_confirmed (boolean default false), created_at, updated_at. Indexes: (workspace_id, status), (workspace_id, campaign_content_id).

---

## 17. Relationships and Cardinality

| Parent Entity | Child Entity | Relationship | Cardinality | Cascade/Delete | Audit Impact | Risk |
|---|---|---|---|---|---|---|
| Workspace | StoreProfile (nashir_store_profiles) | Has | 1:1 in V1 | No cascade delete in V1 (store must be deactivated, not deleted) | YES — workspace changes | LOW |
| Workspace | WorkspaceMembers | Has | 1:N | Soft delete (member_status = removed) | YES — membership changes | MEDIUM |
| Workspace | Products (nashir_products) | Has | 1:N | No cascade delete | YES — product create/update | LOW |
| StoreProfile | Products | Has (nullable in V1) | 1:N (future) | No cascade delete | NO | LOW |
| Workspace | Assets (nashir_assets) | Has | 1:N | No cascade delete | YES — asset create/update | LOW |
| Product | Assets | Referenced by | 1:N (via linked_product_id) | No cascade | NO | LOW |
| Workspace | Campaigns (nashir_campaigns) | Has | 1:N | No cascade delete (archive only) | YES — campaign create | LOW |
| Campaign | CampaignContentItems | Has | 1:N | No cascade delete (content archived) | YES — content create/update | MEDIUM |
| CampaignContent | PreviewArtifacts | Has | 1:N | No cascade delete | NO | LOW |
| CampaignContent | ApprovalDecisions | Has | 1:N | No cascade delete (append-only decision history) | YES — approval/rejection | HIGH |
| ApprovedContent | PublishingQueueItems | Referenced by | 1:N | No cascade delete | YES — queue item create | MEDIUM |
| PublishingQueueItem | Evidence | Has (via nashir_evidence) | 1:N | No cascade delete | YES | MEDIUM |
| Workspace | CreatorStudioSessions | Has | 1:N (TTL-managed) | Expiry (not hard delete) | YES — session create | HIGH |
| Session | ContentIdeas, Angles, Segments, Windows | Has | 1:N (session-scoped) | Expire with session | NO | LOW |
| Session | ContextDrafts | Has | 1:N (TTL-managed) | Expire with session | YES — draft create | MEDIUM |
| ContextDraft | TransferDrafts | Has | 1:N (TTL-managed) | Expire with context draft | YES — transfer create | MEDIUM |
| ContextDraft | ReadinessAssessments | Has | 1:N | Expire | NO | LOW |
| Workspace | PromptTemplates | Has | 1:N | No cascade delete (deprecate only) | YES — template governance | MEDIUM |
| PromptTemplate | PromptGovernanceVersions | Has | 1:N | No cascade delete | YES — version approve | MEDIUM |
| Entity (any) | AuditLogs | Has | 1:N (append-only) | No delete | N/A (IS audit) | LOW |
| ModelRoutingRule | AuditLogs | Referenced by | Via action/entity_id | No delete | YES | LOW |
| IntegrationConnection (deferred) | AuditLogs (deferred) | Referenced by | Via action/entity_id | Deferred | Deferred | DEFER |

---

## 18. Status and Lifecycle Values

| Entity | Candidate Status Values | V1 Status | Notes |
|---|---|---|---|
| Campaign (nashir_campaigns) | draft, generated, in_review, approved, rejected, archived, requires_reapproval, blocked_until_review, published | **IN (Patch 004)** | Already defined |
| CampaignContent | draft, ready_for_review, in_review, approved, rejected | **IN** | From nashir_v1_openapi.yaml |
| ApprovalDecision | approved, rejected, changes_requested | **IN** | Service-layer decision, not a status field on content |
| PublishingQueueItem | pending, scheduled, cancelled | **IN** | Human confirmation required before `scheduled` |
| CreatorStudioSession | active, expired, blocked | **IN** | TTL-managed |
| CreatorContextDraft | draft, incomplete, needs_consent, needs_human_review, ready_for_transfer, blocked, expired | **IN** | From nashir_v1_openapi.yaml |
| CreatorTransferDraft | pending_review, expired | **IN** | From nashir_v1_openapi.yaml |
| Evidence (nashir_evidence) | submitted, accepted, rejected, invalidated, superseded | **IN (Patch 003)** | Already defined |
| IntegrationConnection | — | **DEFER** | Post-V1 |
| PromptGovernanceVersion | draft, active, deprecated, blocked | **IN** | Human approval required for `active` |
| WorkflowDefinition | — | **DEFER** | Advisory metadata only if created |

---

## 19. Index and Constraint Planning

**Index naming convention (matching marketing-os pattern):** `idx_<table>_<columns_or_purpose>`

**Primary key:** uuid PKs everywhere (`gen_random_uuid()`).

**Core indexes required for V1:**
- Every workspace-scoped table: `(workspace_id)` — covers list queries
- Every workspace-scoped table with status: `(workspace_id, status)` — covers filtered list queries
- Creator Studio TTL entities: table-specific partial indexes on `(expires_at)` for non-terminal TTL statuses; examples: `WHERE status = 'active'` for sessions and `WHERE status = 'pending_review'` for transfer drafts. Do not use `WHERE expires_at > now()` in PostgreSQL partial index predicates; cleanup jobs should compare `expires_at` at runtime.
- Evidence: `(workspace_id, nashir_campaign_id, evidence_id)` — tenant isolation + lookup
- AuditLog: existing indexes cover workspace, entity, actor, correlation
- Session/draft foreign keys: `(workspace_id, session_id)`, `(workspace_id, context_draft_id)`

**Unique constraints:**
- `nashir_store_profiles.workspace_id` — UNIQUE PARTIAL for active/non-archived rows only (1:1 with workspace in V1; avoid soft-delete conflicts)
- `nashir_prompt_governance_versions.(workspace_id, prompt_template_id, version_number)` — UNIQUE PARTIAL for active/non-archived rows only (avoid conflicts with archived versions)

**Check constraints (pattern from marketing-os):**
- `name_not_empty`: `length(trim(column)) > 0` for all name/title columns
- `expires_at > created_at` for all TTL entities
- `human_review_required IS TRUE` for transfer drafts (always true in V1)

**Soft delete vs hard delete:** Prefer status-based soft delete (archived/deprecated/expired/removed) over hard deletes for all business entities. Hard deletes only allowed for expired TTL records after retention window.

**Optimistic concurrency:** `version` column (varchar or integer) on entities with If-Match / X-Resource-Version patterns (Products, Assets, CampaignContent, etc.).

---

## 20. Migration Sequencing Plan

Future Nashir migrations are numbered after the existing Patch 004:

| Patch | Scope | Dependencies | V1 Priority |
|---|---|---|---|
| **Patch 005** | Identity seed extension: add Nashir permission codes (33 V1 codes) + role seed rows to existing `roles`/`permissions`/`role_permissions` tables | Patch 004 applied | **HIGHEST** |
| **Patch 006** | StoreProfile, Products, Assets tables | Patch 005 applied | HIGH |
| **Patch 007** | CampaignContentItems, PreviewArtifacts, ApprovalDecisions | Patch 006 applied | HIGH |
| **Patch 008** | PublishingQueueItems | Patch 007 applied | MEDIUM |
| **Patch 009** | Creator Studio tables (sessions, ideas, angles, segments, windows, context drafts, transfer drafts, readiness assessments) | Patch 006 applied | MEDIUM |
| **Patch 010** | PromptTemplates, PromptGovernanceVersions | Patch 005 applied | MEDIUM |
| **Patch 011** | ModelRoutingRules, AIProviders, CostUsageRecords | Patch 005 applied | LOW |
| **Patch 012** | Workflow definitions (advisory metadata only, if approved) | Patch 005 applied | LOW |

**Migration ownership:** All patches live in `marketing-os/docs/` following the naming pattern `marketing_os_v5_6_5_phase_0_1_schema_patch_NNN.sql`. The `scripts/db-migrate.js` array must be extended with each new patch file.

**Actual migrations are blocked** until the Nashir SQL Schema Implementation Planning Gate approves the exact allowed files, verification commands, and rollback criteria.

---

## 21. Seed Data Plan

**What seed data is needed:**

| Seed category | Content | Location |
|---|---|---|
| Role seed | 7 rows: owner, admin, creator, reviewer, publisher, billing_admin, viewer (verify which already exist in base schema before inserting) | Patch 005 or existing role seed |
| Permission seed | 33 rows: all V1-active Nashir permission codes from `docs/nashir_auth_rbac_workspace_identity_gate.md` Section 8 | Patch 005 |
| RolePermission seed | Assignments per the role-to-permission matrix (Section 9 of Auth/RBAC gate) | Patch 005 |
| Default workspace | NO — no production workspace seed; test workspace only in CI seed | `scripts/db-seed.js` |
| Secrets | NO — never in seed data | N/A |
| External tokens | NO | N/A |
| User production data | NO — no real user data in seed | N/A |

**C-RV03 canonical naming:** All permission codes in seed data must use dot notation: `nashir.product.read`, `nashir.content.create`, etc. (dots throughout; no underscore between nashir and domain).

---

## 22. Privacy and Data Governance

| Data Domain | Sensitivity | Retention Risk | Encryption/Secret Handling | Audit Need | Human Review Need | V1 Decision |
|---|---|---|---|---|---|---|
| Creator handles (creator_handle_ref) | **HIGH** | HIGH — must expire with session; opaque reference only | Must not be stored raw; opaque token only | YES | YES — consent before any persistence | Opaque column only; never decrypt to raw handle |
| Social profiles (creator profile snapshots) | **HIGH** | HIGH — platform data; consent required | External vault; ephemeral | YES | YES | DEFER to Post-V1 (OAuth/consent gate) |
| AI suggestions (ideas, angles) | LOW–MEDIUM | LOW — expires with session | No encryption needed | YES (source provenance) | YES — human review before use | Short-lived; expire with session |
| Campaign content body | MEDIUM | LOW–MEDIUM | No special encryption; application access control | YES | YES — review/approval flow | Stored in body_content column |
| Publishing schedules | LOW | LOW | None | YES | YES — human confirmation | stored in publishing_queue_items |
| API keys / model provider secrets | **HIGH** | HIGH — vault only | Vault storage; DB stores secret_reference_name only | YES | YES | Column name: secret_reference_name (never raw key) |
| Team/user permissions | MEDIUM | MEDIUM | No encryption; RBAC enforced | YES — all role changes | YES — admin/owner only | Standard RBAC tables |
| Audit/evidence records | MEDIUM | HIGH — append-only; must not be deleted | No encryption; immutable trigger | SELF-AUDIT | N/A | Reuse audit_logs; append-only trigger |
| Cost usage records | LOW | LOW | None | YES (advisory) | NO | Advisory column: is_advisory always true |
| Publishing payload summaries | MEDIUM | MEDIUM — must not expose raw tokens | No raw tokens/prompts in payload_summary jsonb | YES | YES | Column constraint: raw platform tokens prohibited |

---

## 23. marketing-os Reuse and Conflict Assessment

| marketing-os Pattern/File | Relevance | Reuse Category | Required Adaptation | Risk |
|---|---|---|---|---|
| Migration chain (`schema_patch_NNN.sql` pattern) | Direct pattern for Nashir migrations | **Reuse after reconciliation** | Add Patch 005+ files following same naming, transaction, advisory-lock pattern | LOW |
| PostgreSQL DDL patterns (uuid PK, timestamptz, idempotent enum creation) | Column patterns, constraint patterns | **Reuse after reconciliation** | Apply same patterns to Nashir tables | LOW |
| `workspaces`, `users`, `workspace_members` tables | Workspace/tenant foundation | **Reuse as-is** | Nashir uses same workspace_id FK pattern (Slice 0 verified) | LOW |
| `roles`, `permissions`, `role_permissions` tables | RBAC authority | **Reuse after reconciliation** | Extend seed data with Nashir codes; verify role deduplication | MEDIUM |
| `audit_logs` table | Audit authority (append-only) | **Reuse as-is** | Add Nashir action strings to `action` column; no schema change needed | LOW |
| `prompt_templates` table | Possible partial reuse | **Reuse after reconciliation** | Evaluate whether `template_type` enum can accommodate Nashir prompt governance; likely need `nashir_prompt_templates` | MEDIUM (see FINDING-SQL5) |
| `nashir_campaigns` table (Patch 004) | Campaign foundation | **Reuse as-is** | Extend with nullable store_profile_id in a future patch | LOW |
| `nashir_evidence` table (Patch 003) | Evidence foundation | **Reuse as-is** | Already Nashir-specific; extend if needed | LOW |
| Repository pattern (narrow interface, workspaceId mandatory) | Service/repository architecture | **Reuse after reconciliation** | Nashir repositories follow same pattern | LOW |
| `scripts/db-migrate.js` | Migration runner | **Reuse after reconciliation** | Add new patch filenames to migrations array | LOW |
| `scripts/verify-sprint0.js` + openapi-lint | Verification pattern | **Reuse after reconciliation** | Nashir verification script may extend this | LOW |
| marketing-os prototype/ | Prototype surface | **Reject** | Not applicable | None |
| marketing-os existing campaigns/media/approval tables | Marketing OS domain | **Reference only** | Do not map Nashir content to media_asset_versions; separate entity models | MEDIUM |

---

## 24. Future Allowed Files for SQL Implementation Slice

**Location:** `marketing-os/docs/` only (verified as the SQL artifact directory).

**Candidate file names:**
- `marketing_os_v5_6_5_phase_0_1_schema_patch_005.sql` — RBAC seed extension
- `marketing_os_v5_6_5_phase_0_1_schema_patch_006.sql` — Store/Product/Asset tables
- `marketing_os_v5_6_5_phase_0_1_schema_patch_007.sql` — CampaignContent/Preview/Approval
- `marketing_os_v5_6_5_phase_0_1_schema_patch_008.sql` — PublishingQueue
- `marketing_os_v5_6_5_phase_0_1_schema_patch_009.sql` — Creator Studio tables
- `marketing_os_v5_6_5_phase_0_1_schema_patch_010.sql` — PromptTemplates/Versions
- `marketing_os_v5_6_5_phase_0_1_schema_patch_011.sql` — ModelRouting/AIProviders/Cost
- `scripts/db-migrate.js` — extend migrations array with Patch 005+ filenames
- `docs/07_database_schema.sql` — update schema wrapper doc to include new patches
- Repository test files for new Nashir repositories (TBD after Backend Slice 0 Planning)

**All changes to marketing-os require a separate marketing-os implementation PR under marketing-os gate discipline.**

---

## 25. Future Forbidden Files

| Forbidden File / Category | Reason |
|---|---|
| `nashir-ui-prototype/src/` | No backend changes in this repo |
| `nashir-ui-prototype/package.json`, `package-lock.json` | No dependency changes in this repo |
| `nashir-ui-prototype/src/generated/` | No manual edits; generated only |
| `nashir-ui-prototype/docs/nashir_v1_openapi.yaml` | No schema changes in this slice |
| UI API integration files | Not approved |
| Backend route implementation files | Blocked until Backend Slice 0 Planning |
| `marketing-os/prototype/` | Not a source of truth |
| `.env` files or any secrets file | Never commit secrets |
| Direct production schema changes without migration | Must use numbered migration files |
| Skipping migration sequence numbers | Migration order is strict; no gaps |

---

## 26. Verification Plan for Future SQL Implementation

```sh
# 1. Whitespace check
git diff --check

# 2. Only allowed files changed
git diff --name-only

# 3. Confirm no nashir-ui-prototype src/ or package changes
git diff -- <nashir-ui-prototype-path>/src/
git diff -- <nashir-ui-prototype-path>/package.json package-lock.json

# 4. Migration validation (strict mode)
npm run db:migrate:strict

# 5. Node test suite
npm test

# 6. Integration tests
npm run test:integration

# 7. OpenAPI lint
npm run openapi:lint:strict

# 8. Full strict verification
npm run verify:strict

# 9. RBAC test for Nashir permission codes
# Confirm nashir-rbac-permission-mapping.test.js passes with all new codes

# 10. Count migration files matches db-migrate.js array
grep -c "schema_patch" scripts/db-migrate.js

# 11. Confirm no raw secrets in seed files
grep -i "password\|secret\|token\|key" docs/*patch*.sql | grep -v "secret_reference_name"

# 12. Git status clean
git status --short
```

---

## 27. Rollback Plan

- If a migration patch fails CI: revert the patch file commit in marketing-os before it reaches any test database.
- Do not run partial migrations in production without a migration record.
- If seed data causes conflict (duplicate role/permission): use `DO $$ BEGIN INSERT ... ON CONFLICT DO NOTHING; END $$` pattern consistent with marketing-os idempotent CREATE statements.
- Generated/UI files in nashir-ui-prototype are unaffected by SQL migrations.
- No production data exists to migrate; V1 is a greenfield schema.
- A separate rollback migration (Patch N+1) that drops the tables should be prepared alongside each forward migration for the first implementation PR.

---

## 28. Blocking Findings

| ID | Finding | Severity | Resolution |
|---|---|---|---|
| B-SQL01 | Exact migration file paths and PR scope for marketing-os not approved — Backend Slice 0 Planning gate required | **HIGH** | Nashir Backend Slice 0 Planning Gate |
| B-SQL02 | `prompt_templates` reuse vs `nashir_prompt_templates` decision unresolved — FINDING-SQL5 | **MEDIUM** | Nashir SQL Schema Review Gate |
| B-SQL03 | Final role seed verification needed: which of the 7 Nashir roles already exist in marketing-os base schema to avoid duplicate inserts | **MEDIUM** | Nashir SQL Schema Review Gate |
| B-SQL04 | Approval decisions entity decision: reuse existing `approval_decisions` table or create `nashir_approval_decisions` | **MEDIUM** | Nashir SQL Schema Review Gate |
| B-SQL05 | Cost tracking entity: reuse `cost_events` table or create `nashir_cost_usage_records` | **LOW** | Nashir SQL Schema Review Gate |
| B-SQL06 | TTL cleanup job ownership and mechanism not defined (background job, lazy check, or scheduled task) | **MEDIUM** | Nashir Backend Slice 0 Planning Gate |
| B-SQL07 | Integration secret storage vault pattern not formally specified (external vault service name/API) | **MEDIUM** | Nashir Backend Slice 0 Planning Gate |
| B-SQL08 | Audit/evidence retention policy not formally approved (how long are audit_log records kept) | **LOW** | Future governance gate |
| B-SQL09 | marketing-os Pilot/Production NO-GO inherited — Nashir production path not independent | **MEDIUM** | Future Nashir Production Readiness Gate |

---

## 29. Non-blocking Findings / Watch Items

| ID | Finding | Action |
|---|---|---|
| W-SQL01 | Advanced analytics and ROI modeling remain Post-V1; `nashir_cost_usage_records` is advisory only in V1 | Carry to Backend Slice 0 |
| W-SQL02 | Model routing and AI provider tables are advisory snapshots only; no live AI execution in V1 | Carry to Backend Slice 0 |
| W-SQL03 | Integration execution remains deferred; nashir_data_sources and nashir_integration_connections are DEFER | Post-V1 gate |
| W-SQL04 | Generated types in nashir-ui-prototype are unaffected by SQL planning | Confirmed; no action |
| W-SQL05 | OpenAPI migration to marketing-os remains blocked until Backend Slice 0 Planning | Carry forward |
| W-SQL06 | storeProfileId nullable FK on nashir_products and nashir_assets must be included in Patch 006 even if unused in V1, to avoid a schema migration for multi-store Post-V1 | Carry to SQL Schema Review Gate |
| W-SQL07 | nashir_campaigns (Patch 004) needs a nullable `store_profile_id` column added in a future patch (Patch 006 or separate patch) | Carry to SQL Schema Review Gate |
| W-SQL08 | The marketing-os `audit_logs` action column is `varchar(160)` — confirm Nashir action strings like `nashir.creator_studio_session.created` fit within 160 chars | Verify at SQL Schema Review Gate |

---

## 30. Readiness Assessment

| Dimension | Rating |
|---|---|
| Identity/RBAC seed model | **READY WITH WATCH ITEMS** — existing tables confirmed; seed verification needed |
| Workspace/store isolation | **READY** — all scoping decisions confirmed |
| Campaign/content schema | **READY WITH WATCH ITEMS** — candidate columns defined; approval decision entity TBD |
| Creator Studio TTL schema | **READY WITH WATCH ITEMS** — candidate columns defined; TTL cleanup mechanism TBD |
| Audit/evidence schema | **READY** — audit_logs reuse confirmed; evidence tables exist |
| Integration/secret handling | **READY** — vault reference approach confirmed; vault service deferred |
| marketing-os migration readiness | **READY WITH WATCH ITEMS** — patch 005+ pattern identified; Backend Slice 0 must approve PR |
| DB engine readiness | **READY** — PostgreSQL confirmed |
| Backend dependency readiness | **NEEDS CLARIFICATION** — Backend Slice 0 Planning gate required |

**Overall readiness: READY WITH WATCH ITEMS**

The V1 SQL schema plan is sufficiently defined for a schema review gate. Nine blocking findings are documented; all are addressable. The schema cannot be implemented until the SQL Schema Review Gate and SQL Schema Implementation Planning Gate close.

---

## 31. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir SQL Schema Review Gate** | This planning gate — READY WITH WATCH ITEMS | Reviews this planning document; resolves B-SQL02/03/04/05 (prompt_templates, role dedup, approval decisions, cost tracking); confirms column-level conceptual plan |
| 2 | **Nashir SQL Schema Implementation Planning Gate** | SQL Schema Review Gate | Produces exact allowed files, migration file names, DB seed files, verification commands, rollback criteria for marketing-os migration PRs |
| 3 | **Nashir Backend Slice 0 Planning** | SQL Schema Implementation Planning Gate | Plans first implementable backend slice; wires guards; selects auth provider; approves migration PR structure; resolves B-SQL01/06/07 |
| 4 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning | Plans migration of nashir_v1_openapi.yaml to marketing-os |
| 5 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves package.json generation script update |
| 6 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**SQL Schema Review Gate may proceed immediately** — this planning gate is READY WITH WATCH ITEMS.

**SQL implementation** is blocked until SQL Schema Implementation Planning Gate closes.

**Backend Slice 0** is blocked until SQL Schema Review Gate and SQL Schema Implementation Planning Gate close.

---

## 32. Decision

### Final decision

| Area | Status |
|---|---|
| SQL schema planning complete | **COMPLETE — READY WITH WATCH ITEMS** |
| Blocking findings | 9 (all addressable; none prevent review gate) |
| DB engine | **CONFIRMED — PostgreSQL** |
| GO to Nashir SQL Schema Review Gate | **GO** |
| CONDITIONAL GO to SQL Schema Implementation Planning Gate | **CONDITIONAL — after SQL Schema Review Gate** |
| SQL DDL implementation | **NO-GO** |
| Migrations | **NO-GO** |
| Backend routes | **NO-GO** |
| Auth middleware / RBAC implementation | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |

### V1 candidate table groups summary

| Status | Tables |
|---|---|
| REUSE (already in marketing-os base) | workspaces, users, roles, permissions, role_permissions, workspace_members, audit_logs |
| REUSE EVALUATE (may need extension) | prompt_templates |
| EXISTS (Nashir patches 003 + 004) | nashir_campaigns, nashir_evidence, nashir_evidence_lifecycle_events |
| NEW (patches 005–011) | nashir_store_profiles, nashir_products, nashir_assets, nashir_campaign_content_items, nashir_preview_artifacts, nashir_approval_decisions, nashir_publishing_queue_items, nashir_creator_studio_sessions, nashir_creator_content_ideas, nashir_creator_campaign_angles, nashir_creator_audience_segments, nashir_creator_publish_windows, nashir_creator_context_drafts, nashir_creator_transfer_drafts, nashir_creator_readiness_assessments, nashir_prompt_templates, nashir_prompt_governance_versions, nashir_model_routing_rules, nashir_ai_providers, nashir_cost_usage_records |
| DEFER (Post-V1) | nashir_data_sources, nashir_integration_connections, nashir_workflow_definitions |

### Next gate

**Nashir SQL Schema Review Gate**

That gate must:
- Review the conceptual column definitions in Section 16 of this document.
- Resolve B-SQL02 (prompt_templates reuse decision).
- Resolve B-SQL03 (role seed deduplication — inspect existing marketing-os role seed).
- Resolve B-SQL04 (approval decisions entity choice).
- Resolve B-SQL05 (cost tracking entity choice).
- Confirm W-SQL06 (storeProfileId nullable FK on products/assets).
- Confirm W-SQL07 (store_profile_id column addition to nashir_campaigns).
- Confirm W-SQL08 (audit_logs action varchar(160) capacity).
- Not authorize SQL implementation. Documentation-only review gate.

**Asset relationship decision:** `linked_product_id` on `nashir_assets` represents a 1:N Product → Assets relationship. Any future true N:M product-asset relationship requires a separate junction table and review gate.
