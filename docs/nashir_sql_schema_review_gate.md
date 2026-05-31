# Nashir SQL Schema Review Gate

| Field | Value |
|---|---|
| Gate type | SQL Schema Review Gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Reviews docs/nashir_sql_schema_planning_gate.md before any SQL implementation, migrations, backend routes, auth middleware, RBAC implementation, or UI API integration |
| Document under review | `docs/nashir_sql_schema_planning_gate.md` (PR #57) |
| Prerequisite gate | `docs/nashir_sql_schema_planning_gate.md` — merged, READY WITH WATCH ITEMS |
| SQL DDL created | NO |
| Migrations created | NO |
| Backend routes implemented | NO |
| Auth/RBAC implementation approved | NO |
| OpenAPI YAML changes approved | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is a SQL Schema Review Gate only.

**No SQL DDL is created.**

**No migrations are created.**

**No backend routes are implemented.**

**No auth/RBAC implementation is approved.**

**No OpenAPI YAML change is approved in this slice.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> Is the Nashir SQL Schema Planning Gate sufficiently complete, internally consistent, referentially safe, workspace/store isolated, and implementation-ready to proceed to SQL Schema Implementation Planning Gate?

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `docs/nashir_sql_schema_planning_gate.md` | **Document under review** — 32 sections; candidate table inventory, column plans, relationships, migration sequencing, seed data, blockers |
| `docs/nashir_openapi_security_yaml_patch_review_gate.md` | READY FOR SQL SCHEMA PLANNING; no blockers; inputs to this review |
| `docs/nashir_openapi_security_mapping_gate.md` | 34 operations with permissions; workspace scope route-derived |
| `docs/nashir_auth_rbac_review_gate.md` | READY WITH WATCH ITEMS; B-RBAC02 resolved; C-RV01/C-RV02/C-RV03 conditions |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | 35 permission codes; 7 roles; guard chain model |
| `docs/nashir_erd_reconciliation_gate.md` | ERD candidate complete; Asset naming conflict B-R01 documented |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE |
| `docs/nashir_backend_home_decision.md` | marketing-os SELECTED AS CANDIDATE |
| `docs/nashir_v1_openapi.yaml` | 35 operations; security metadata confirmed |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding for B-SQL02/03/04/05 resolution |
|---|---|
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `approval_decisions` | **B-SQL04 resolved:** `approval_decisions` has `review_task_id` + `media_asset_version_id` FKs and `approved_content_hash` field — tightly coupled to MediaAssetVersion; incompatible with Nashir campaign content items. Must create `nashir_approval_decisions` |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `cost_events` | **B-SQL05 resolved:** `cost_events` requires `customer_account_id` FK (not in Nashir domain model) and `media_job_id` FK (Nashir has no media_job entity). Must create `nashir_cost_usage_records` |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `prompt_templates` | **B-SQL02 resolved:** `prompt_templates` has `template_type` enum (caption/ad_copy/image_prompt/video_script/report/reply) — incompatible with Nashir prompt governance model which needs approval-state and version semantics. Must create `nashir_prompt_templates` |
| `scripts/db-seed.js` — roles seed | **B-SQL03 resolved:** seed uses `ON CONFLICT (role_code) DO UPDATE SET role_name = EXCLUDED.role_name, ...` — idempotent upsert; no duplicate insertion risk. Role deduplication is NOT a blocker |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `workspace_members` | Uses `role_id uuid FK → roles(role_id)` (not role_code). Planning gate describes "role_code" in membership context — documentation discrepancy, not implementation blocker |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `workspaces` | Has `customer_account_id` FK. Nashir domain tables correctly use workspace_id only without customer_account_id — consistent with Nashir workspace model |
| `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` — `role_permissions` | Uses `role_id + permission_id` (FK-based, not code-based). `db-seed.js` resolves role_code/permission_code to IDs via subselect — consistent with schema |

### Resolutions from this review

> **REVIEW-R01 (B-SQL02 RESOLVED):** `nashir_prompt_templates` must be a new table. The existing `prompt_templates` table's `template_type` enum is incompatible with Nashir prompt governance semantics.

> **REVIEW-R02 (B-SQL03 RESOLVED):** Role seed deduplication is not a risk. The marketing-os `db-seed.js` uses `ON CONFLICT (role_code) DO UPDATE` — idempotent upsert semantics prevent duplicate rows.

> **REVIEW-R03 (B-SQL04 RESOLVED):** `nashir_approval_decisions` must be a new table. The existing `approval_decisions` table requires `media_asset_version_id` and `review_task_id` FKs that do not exist in the Nashir domain model.

> **REVIEW-R04 (B-SQL05 RESOLVED):** `nashir_cost_usage_records` must be a new table. The existing `cost_events` table requires `customer_account_id` FK which is not part of the Nashir workspace-scoped domain model.

> **REVIEW-R05 (New finding — non-blocking):** The planning gate describes `workspace_members` role membership using "role_code" in conceptual columns. The actual `workspace_members` SQL table uses `role_id uuid FK → roles(role_id)`. The implementation must use role_id FK, not role_code. Document this in SQL Schema Implementation Planning Gate.

---

## 3. Review Question

**Is the Nashir SQL Schema Planning Gate sufficiently complete, internally consistent, referentially safe, workspace/store isolated, and implementation-ready to proceed to SQL Schema Implementation Planning Gate?**

**Review verdict: YES, READY WITH WATCH ITEMS.**

The planning document is documentation-only, internally consistent, referentially sound, and correctly structured. Four planning-gate blockers (B-SQL02/03/04/05) are resolved in this review. Five remaining blockers (B-SQL01/06/07/08/09) are correctly deferred to Backend Slice 0 Planning or later governance gates — none prevent the SQL Schema Implementation Planning Gate from proceeding. Three non-blocking watch items are recorded.

---

## 4. Planning Scope Review

| Scope Check | Result |
|---|---|
| Planning document is documentation-only | **PASS** — no DDL, no migrations, no schema files created |
| No actual SQL DDL introduced | **PASS** — column descriptions use plain text, not CREATE TABLE syntax |
| No migrations created | **PASS** |
| No schema files added to nashir-ui-prototype | **PASS** |
| No backend route ownership approved | **PASS** |
| No marketing-os mutation approved | **PASS** |
| Plan remains future schema plan, not implementation | **PASS** |

---

## 5. Database Engine Review

| Check | Result | Notes |
|---|---|---|
| PostgreSQL stated as candidate or verified | **PASS — VERIFIED** | Planning gate Section 5 confirms PostgreSQL via 7 specific evidence items from marketing-os base schema (pgcrypto, gen_random_uuid(), timestamptz, uuid, jsonb, pg_advisory_lock, psql \i syntax) |
| DB engine implementation not blocked by engine uncertainty | **PASS** | PostgreSQL is confirmed through marketing-os precedent and backend home decision |
| Implementation blocked for other valid reasons | **PASS** | Backend Slice 0, SQL Schema Implementation Planning, not DB engine uncertainty |

**DB engine review: PASS**

---

## 6. Candidate Table Inventory Review

| Candidate Table | Domain | V1 Status | Workspace Scoped | Store Scoped | Referential Integrity | Privacy | Review Status |
|---|---|---|---|---|---|---|---|
| workspaces | Identity | IN — REUSE | — (IS boundary) | — | marketing-os base; verified | LOW | **PASS** |
| users | Identity | IN — REUSE | Via membership | — | marketing-os base; verified | HIGH | **PASS** |
| roles | Identity | IN — REUSE/EXTEND | System global | — | marketing-os base; upsert-safe | LOW | **PASS** |
| permissions | Identity | IN — REUSE/EXTEND | System global | — | marketing-os base; upsert-safe | LOW | **PASS** |
| role_permissions | Identity | IN — REUSE/EXTEND | System global | — | marketing-os base; upsert-safe | LOW | **PASS — WATCH: use role_id FK not role_code** |
| workspace_members | Identity | IN — REUSE | YES | — | Slice 0 verified | MEDIUM | **PASS** |
| audit_logs | Audit | IN — REUSE | YES | — | Append-only trigger verified | MEDIUM | **PASS** |
| nashir_store_profiles | Store | IN — NEW | YES (UNIQUE) | — | uuid PK; workspace FK | LOW–MEDIUM | **PASS — WATCH: partial unique for soft-delete** |
| nashir_products | Store | IN — NEW | YES | Implicit + nullable store FK | uuid PK; workspace FK | LOW | **PASS** |
| nashir_assets | Store | IN — NEW | YES | Implicit | uuid PK; workspace FK; linked_product nullable | LOW–MEDIUM | **PASS** |
| nashir_campaigns | Campaign | IN — EXISTS Patch 004 | YES | — | Verified in Patch 004 | LOW | **PASS — WATCH: add nullable store_profile_id in Patch 005/006** |
| nashir_campaign_content_items | Campaign | IN — NEW | YES | Implicit | uuid PK; workspace FK; product FK; nullable campaign FK documented | LOW–MEDIUM | **PASS** |
| nashir_campaign_content_assets | Campaign | IN — NEW (junction) | YES | Implicit | uuid PK; workspace FK; content FK; asset FK | LOW | **PASS — junction table present; resolves uuid[] concern** |
| nashir_preview_artifacts | Campaign | IN — NEW | YES | Implicit | Asset refs via junction table (not uuid[]); content FK | LOW | **PASS** |
| nashir_approval_decisions | Governance | IN — NEW | YES | Implicit | uuid PK; workspace FK; content FK; decided_by FK | LOW | **PASS (B-SQL04 resolved: create new, not reuse)** |
| nashir_publishing_queue_items | Publishing | IN — NEW | YES | Implicit | References approved content; human_confirmed field | LOW | **PASS** |
| nashir_evidence | Evidence | IN — EXISTS Patch 003 | YES | — | Verified in Patch 003 | MEDIUM | **PASS** |
| nashir_evidence_lifecycle_events | Evidence | IN — EXISTS Patch 003 | YES | — | Verified in Patch 003 | MEDIUM | **PASS** |
| nashir_creator_studio_sessions | Creator Studio | IN — NEW | YES | Implicit | TTL; opaque handle; expires_at | **HIGH** | **PASS — WATCH: handle ref must be opaque; no automated creation** |
| nashir_creator_content_ideas | Creator Studio | IN — NEW | YES | Implicit | session FK; expires via session | LOW–MEDIUM | **PASS** |
| nashir_creator_campaign_angles | Creator Studio | IN — NEW | YES | Implicit | session FK | LOW | **PASS** |
| nashir_creator_audience_segments | Creator Studio | IN — NEW | YES | Implicit | session FK; consent_ref | MEDIUM | **PASS** |
| nashir_creator_publish_windows | Creator Studio | IN — NEW | YES | Implicit | session FK | LOW | **PASS** |
| nashir_creator_context_drafts | Creator Studio | IN — NEW | YES | Implicit | TTL; session FK; child ID FKs nullable | MEDIUM | **PASS** |
| nashir_creator_transfer_drafts | Creator Studio | IN — NEW | YES | Implicit | TTL; context_draft FK; destination_module enum | MEDIUM | **PASS — payload_summary must not contain raw tokens** |
| nashir_creator_readiness_assessments | Creator Studio | IN — NEW | YES | Implicit | draft FK; advisory | LOW | **PASS** |
| nashir_prompt_templates | Governance | IN — NEW | YES | — | uuid PK; workspace FK | MEDIUM | **PASS (B-SQL02 resolved: create new)** |
| nashir_prompt_governance_versions | Governance | IN — NEW | YES | — | template FK; version_number uniqueness | MEDIUM | **PASS — WATCH: partial unique for deprecated versions** |
| nashir_model_routing_rules | AI ops | IN — NEW | YES | — | provider FK nullable; advisory snapshot | LOW | **PASS** |
| nashir_ai_providers | AI ops | IN — NEW | YES | — | secret_reference_name (vault ref only) | MEDIUM | **PASS — vault ref enforced** |
| nashir_cost_usage_records | AI ops | IN — NEW | YES | — | campaign FK nullable; model_route FK nullable | LOW | **PASS (B-SQL05 resolved: create new; no customer_account_id)** |
| nashir_data_sources | Integrations | DEFER | — | — | — | MEDIUM | **PASS — correctly deferred** |
| nashir_integration_connections | Integrations | DEFER | — | — | — | HIGH | **PASS — correctly deferred** |
| nashir_workflow_definitions | Workflow | DEFER | — | — | — | LOW | **PASS — correctly deferred** |

**All tables: PASS or PASS WITH WATCH ITEMS. No blocking findings in table inventory.**

---

## 7. Referential Integrity Review

| Check | Result | Classification |
|---|---|---|
| uuid[] arrays used for FK-like references | **PASS** — junction table `nashir_campaign_content_assets` replaces uuid[]; preview artifacts use junction | None |
| Campaign content assets are normalized via junction table | **PASS** — `nashir_campaign_content_assets` explicitly defined in Section 16 | None |
| Preview artifacts asset_ids resolved via junction | **PASS** — planning gate explicitly states: "Asset references must be resolved through `nashir_campaign_content_assets`, not a local uuid[] column" | None |
| Product → Assets cardinality (1:N via linked_product_id) | **PASS** — 1:N is documented; true N:M deferred to separate gate | None |
| True N:M relationships have junction tables | **PASS** — content-asset N:M is the only N:M identified; junction table present | None |
| Creator content idea session FK | **PASS** — `session_id uuid FK → nashir_creator_studio_sessions` | None |
| nullable campaign_id in content items | **PASS** — intentional and justified: CampaignContent is workspace-scoped at `/workspaces/{workspaceId}/campaign-contents`; campaign parent is optional; documented | None |
| workspace_members uses role_id FK (not role_code) | **WATCH** — planning gate description uses "role_code" but actual schema uses role_id FK. Implementation must use role_id via subselect as shown in db-seed.js | Watch item W-SQL-R01 |
| Patch 003 nashir_evidence FK to workspace_id | **PASS** — verified from actual SQL |
| Patch 004 nashir_campaigns FK to workspace_id | **PASS** — verified from actual SQL |
| nashir_store_profiles UNIQUE workspace_id | **PASS** — 1:1 V1 constraint; should be partial unique for soft-delete compatibility |
| Self-referential FK in nashir_evidence (replacement) | **PASS** — Patch 003 handles this correctly with composite FK |
| Creator context draft expiry capped by session | **PASS** — documented; enforced at application layer |

**Referential integrity: PASS — no blocking findings.**

---

## 8. Workspace and Store Isolation Review

| Table | workspace_id Required | store_id / store_profile_id | Derivation Source | Risk | Review Status |
|---|---|---|---|---|---|
| workspaces | — (IS boundary) | — | Self | None | **PASS** |
| users | Via workspace_members | — | Membership join | None | **PASS** |
| workspace_members | YES | — | Direct | LOW | **PASS** |
| nashir_store_profiles | YES (UNIQUE) | — (IS the store) | Direct | LOW | **PASS** |
| nashir_products | YES | nullable store_profile_id (Post-V1) | Direct + future store scope | LOW | **PASS — W-SQL-R02: must confirm nullable FK included in Patch 006** |
| nashir_assets | YES | nullable store_profile_id (Post-V1) | Direct + future store scope | LOW | **PASS — W-SQL-R02 applies** |
| nashir_campaigns | YES | nullable store_profile_id (future) | Direct | LOW | **PASS — W-SQL-R03: add nullable store_profile_id in Patch 005 or 006** |
| nashir_campaign_content_items | YES | Implicit via product | Via workspace + product FK | MEDIUM | **PASS** |
| nashir_campaign_content_assets | YES | Implicit | Via content item | LOW | **PASS** |
| nashir_preview_artifacts | YES | Implicit | Via content item | LOW | **PASS** |
| nashir_approval_decisions | YES | Implicit | Via content item | LOW | **PASS** |
| nashir_publishing_queue_items | YES | Implicit | Via approved content | MEDIUM | **PASS** |
| nashir_creator_studio_sessions | YES | Implicit | Direct | HIGH | **PASS** |
| All creator advisory tables | YES | Implicit | Via session | MEDIUM | **PASS** |
| nashir_prompt_templates | YES | — | Direct | MEDIUM | **PASS** |
| nashir_model_routing_rules | YES | — | Direct | LOW | **PASS** |
| nashir_ai_providers | YES | — | Direct | MEDIUM | **PASS** |
| nashir_cost_usage_records | YES | — | Direct | LOW | **PASS** |
| audit_logs | YES | — | Direct (existing) | LOW | **PASS** |
| nashir_evidence | YES | — | Direct (Patch 003) | LOW | **PASS** |

**Cross-workspace access: NO-GO** — confirmed by workspace_id FK on all tables. Guard chain (rejectBodyWorkspaceId) remains API-layer responsibility.

**Note on `customer_account_id`:** marketing-os tables like `cost_events` and `approval_decisions` include `customer_account_id`. Nashir domain tables correctly omit `customer_account_id` since Nashir operates at workspace scope. This is intentional and consistent.

---

## 9. RBAC Seed and Permission Model Review

| Check | Result | Notes |
|---|---|---|
| 33 V1-active permission codes represented conceptually | **PASS** | Planning gate Section 21 explicitly references all 33 active codes from Auth/RBAC gate |
| No unapproved permission codes introduced | **PASS** | No new codes introduced in planning gate |
| 2 deferred integration codes excluded from V1 seed | **PASS** | nashir.integration.connect + nashir.integration.manage correctly marked DEFER |
| Role-permission seed plan exists (Patch 005) | **PASS** | Documented in Section 20 and Section 21 |
| System admin boundary explicit | **PASS** | C-RV01 resolved: nashir.admin.manage for Nashir-specific ops; workspace.manage for workspace settings |
| Destination service actor deferred | **PASS** | Explicitly confirmed in Section 9: "No destination service actor in V1 RBAC seed data" |
| Self-approval denial representable | **PASS** | Service-layer invariant documented; no SQL constraint needed; C-RV02 resolved |
| Audit events can record actor, permission, action | **PASS** — WATCH | `audit_logs.action varchar(160)` — verify Nashir action strings fit in 160 chars (W-SQL-R04) |
| Role seed uses idempotent upsert | **PASS** | db-seed.js `ON CONFLICT (role_code) DO UPDATE` confirmed; B-SQL03 resolved |
| role_permissions uses role_id FK (not role_code) | **WATCH** | Implementation must use role_id subselect as in db-seed.js; W-SQL-R01 |
| C-RV03 dot notation confirmed | **PASS** | Permission pattern: `nashir.domain.action` throughout planning gate seed section |

---

## 10. Creator Studio TTL Review

| Check | Result | Notes |
|---|---|---|
| Sessions/context drafts/transfer drafts have expiry concepts | **PASS** | `expires_at timestamptz NOT NULL` on all three entities |
| 410 Gone behavior preserved as API/runtime dependency | **PASS** | Explicitly documented: "GET returns 410 Gone for expired sessions/drafts" |
| TTL partial indexes use static enum predicates | **PASS** | Planning gate explicitly says: "Do not use `WHERE expires_at > now()` in PostgreSQL partial index predicates" |
| Sessions use `WHERE status = 'active'` index | **PASS** | Confirmed in planning gate Section 16 |
| Transfer drafts with pending_review are covered | **PASS** | Documented as status = 'pending_review' with expiry |
| Cleanup ownership still unresolved | **WATCH** | B-SQL06 deferred to Backend Slice 0 — acceptable; not a planning document blocker |
| payloadSummary privacy controlled | **PASS** | "payload_summary (jsonb — NO raw tokens, NO raw prompt text, opaque refs only)" |
| creator_handle_ref opaque | **PASS** | "OPAQUE REFERENCE ONLY; never raw handle" — documented as column constraint |
| No automated session creation on page load | **PASS** | `x-no-automatic-execution: true` on createCreatorStudioSession; documented as backend enforcement |
| TTL child cascade behavior documented | **PASS** | "Expire with session" pattern documented throughout |

---

## 11. Campaign, Content, Review, Publishing Review

| Check | Result | Notes |
|---|---|---|
| Campaign/content model supports V1 flows | **PASS** | nashir_campaigns + nashir_campaign_content_items parent/child; campaign nullable on content items |
| Content can exist without campaign parent | **PASS** | nullable campaign_id is intentional; CampaignContent is workspace-scoped via OpenAPI |
| Product reference rule is clear | **PASS** | `product_id uuid FK NOT NULL → nashir_products`; productId is canonical identity |
| Content review/approval state representable | **PASS** | Status enum on content items + nashir_approval_decisions table |
| Self-approval denial representable | **PASS** | `decided_by_user_id ≠ created_by_user_id` enforced at service layer (C-RV02 pattern) |
| Publishing queue requires approved content | **PASS** | planning gate: "campaign_content_id FK NOT NULL — must be approved, non-expired, non-archived" |
| Evidence requirement representable | **PASS** | nashir_evidence links to publishing operations |
| No automatic external publishing implied | **PASS** | x-no-automatic-execution + human_confirmed boolean on publishing queue |
| Optimistic concurrency via version field | **PASS** | version column on products, assets, campaign content items for If-Match/X-Resource-Version |

---

## 12. Product, Asset, Data Source, Integration Review

| Check | Result | Notes |
|---|---|---|
| Store profile vs brand profile boundary | **PASS** | nashir_store_profiles is commerce identity; BrandProfile is marketing OS brand voice — separate domains |
| Products workspace/store scoped correctly | **PASS** | workspace_id required; store_profile_id nullable FK for future multi-store |
| Product intelligence snapshots | **PASS** — Note | Not a separate table in V1 (computed/derived); planning gate correctly uses advisory readiness from product fields |
| Assets referentially safe | **PASS** | nashir_assets with workspace_id FK; linked_product_id nullable FK |
| Campaign content asset junction table | **PASS** | `nashir_campaign_content_assets` explicitly included |
| Integrations use secret references only | **PASS** | secret_reference_name in nashir_ai_providers; integration connections deferred |
| No raw secrets in domain tables | **PASS** | Documented: vault reference only; column name `secret_reference_name` never stores raw key |
| V1 data sources | **PASS** | Correctly deferred to Post-V1 |

---

## 13. Prompt, Model Routing, Cost Review

| Check | Result | Notes |
|---|---|---|
| nashir_prompt_templates separate from marketing-os prompt_templates | **PASS** | B-SQL02 resolved: new table required; incompatible type_enum |
| Prompt governance versions uniqueness | **PASS — WATCH** | `(workspace_id, prompt_template_id, version_number)` unique constraint; if versions can be deprecated and re-used with same number, a partial unique index is needed: `WHERE approval_status NOT IN ('deprecated', 'blocked')`. Note as W-SQL-R05 |
| Model routing rules admin-controlled | **PASS** | x-permission: nashir.model_routing.manage; owner/admin only per RBAC matrix |
| Cost usage records billing/admin read boundary | **PASS** | billing_admin + admin + owner only; is_advisory column documented |
| Cost records not billing | **PASS** | "is_advisory (boolean default true)" and "NOT billing. NOT invoice. NOT payment." |
| Audit requirements for governance ops | **PASS** | nashir_model_routing.manage and nashir_prompt_governance.manage both have x-audit-required: true in OpenAPI |

---

## 14. Audit and Evidence Review

| Check | Result | Notes |
|---|---|---|
| Audit events immutable conceptually | **PASS** | Reuses marketing-os `audit_logs` with append-only trigger (verified in base schema) |
| Evidence records scoped | **PASS** | nashir_evidence.workspace_id FK; Patch 003 verified |
| Actor/action/workspace context captured | **PASS** | audit_logs.action (varchar 160), entity_type, entity_id, actor_user_id, workspace_id, correlation_id |
| Sensitive operations map to audit | **PASS** | 18 operations have x-audit-required: true in OpenAPI (confirmed PR #55 review) |
| Retention sensitivity acknowledged | **PASS** | B-SQL08 documented; append-only trigger prevents deletion |
| Payload restrictions documented | **PASS** | "Must not expose raw tokens, handles, or prompt text" documented in multiple sections |
| audit_logs.action varchar(160) capacity | **WATCH** | W-SQL-R04: verify `nashir.creator_studio_session.created` (35 chars) + other Nashir action strings fit within 160 chars. All planned action strings appear to be ≤ 80 chars; confirm at Implementation Planning |

---

## 15. Soft Delete and Uniqueness Review

| Check | Result | Notes |
|---|---|---|
| Status-based soft delete strategy consistent | **PASS** | "Prefer status-based soft delete over hard deletes for all business entities" documented in Section 19 |
| nashir_store_profiles workspace_id UNIQUE handles soft-delete | **PASS** | Planning gate Section 19 explicitly says: "UNIQUE PARTIAL for active/non-archived rows only (1:1 with workspace in V1; avoid soft-delete conflicts)" |
| nashir_prompt_governance_versions soft-delete | **WATCH** | If version numbers are recycled after deprecation, a partial unique on active versions is needed: `UNIQUE (workspace_id, prompt_template_id, version_number) WHERE approval_status = 'active'`. W-SQL-R05 |
| Standard unique constraints avoid archived record conflicts | **PASS** | Partial unique index guidance explicitly included in planning gate |
| nashir_campaign_content_items with archived content | **PASS** | Status enum includes rejected/archived; no content identity constraint that would conflict with re-creation |

---

## 16. Index and Constraint Review

| Check | Result | Notes |
|---|---|---|
| Workspace indexes planned | **PASS** | All tables include workspace_id indexes |
| Store indexes planned | **PASS** | Product and asset tables include store_profile_id indexes where applicable |
| Status indexes planned | **PASS** | (workspace_id, status) composite indexes throughout |
| TTL indexes planned with correct predicate | **PASS** | `WHERE status = 'active'` and `WHERE status NOT IN (...)` — correct; no volatile function predicates |
| Audit/evidence indexes planned | **PASS** | Existing marketing-os indexes carry forward |
| Role/permission uniqueness | **PASS** | `uq_roles_code`, `uq_permissions_code` already in base schema |
| No implementation SQL written | **PASS** — confirmed | All column plans use plain text, not DDL syntax |

---

## 17. Migration Sequencing Review

| Patch | Scope | Dependencies | Review Status |
|---|---|---|---|
| Patch 005 | RBAC seed extension: Nashir permission codes, role assignments | Patch 004 applied | **PASS** — seed before all domain tables; ON CONFLICT safe |
| Patch 006 | nashir_store_profiles, nashir_products, nashir_assets | Patch 005 | **PASS** — catalog foundation; store before products |
| Patch 007 | nashir_campaign_content_items, nashir_campaign_content_assets, nashir_preview_artifacts, nashir_approval_decisions | Patch 006 | **PASS** — junction table in same patch as content items |
| Patch 008 | nashir_publishing_queue_items | Patch 007 | **PASS** — depends on approved content FKs |
| Patch 009 | All Creator Studio tables | Patch 006 | **PASS** — prompt_template_id FK requires Patch 010; make nullable until Patch 010 or reorder |
| Patch 010 | nashir_prompt_templates, nashir_prompt_governance_versions | Patch 005 | **WATCH** — W-SQL-R06: Patch 009 context drafts reference prompt_template_id. If Patch 009 precedes Patch 010, prompt_template_id FK must be nullable in context_drafts until Patch 010 is applied, or patches 009 and 010 must be merged |
| Patch 011 | nashir_model_routing_rules, nashir_ai_providers, nashir_cost_usage_records | Patch 005 | **PASS** |
| Future | nashir_data_sources, nashir_integration_connections, nashir_workflow_definitions | Post-V1 | **PASS — correctly deferred** |

**Overall sequencing: PASS WITH WATCH ITEM W-SQL-R06 (Patch 009/010 ordering dependency).**

---

## 18. marketing-os Readiness Review

| Dimension | Status | Evidence |
|---|---|---|
| Marketing-os has migration pattern | **READY** | 5-file chain; db-migrate.js; psql \i; advisory lock; verified and operational |
| Exact future allowed files identified | **READY** | Patch 005 through 011 names defined; `scripts/db-migrate.js` extension identified |
| Database scripts exist and operational | **READY** | db-migrate.js, db-seed.js, db-migrate-retry.js verified |
| Tests exist for repo/database/RBAC | **READY** | nashir-rbac-permission-mapping.test.js, nashir-campaign-repository.test.js, nashir-evidence-lifecycle-repository.test.js, integration tests verified |
| Backend home still candidate status | **CONDITIONALLY VIABLE** | marketing-os CONDITIONALLY VIABLE per marketing-os reconciliation gate |
| Implementation ownership still unresolved | **B-SQL01 pending** | B-SQL01 deferred to Backend Slice 0 Planning — acceptable |

**marketing-os implementation readiness: READY WITH WATCH ITEMS**

---

## 19. Blocking Findings

### Resolved by this review (no longer blocking)

| ID | Finding | Resolution |
|---|---|---|
| B-SQL02 | prompt_templates reuse decision | **RESOLVED:** Create `nashir_prompt_templates`; existing table's template_type enum incompatible |
| B-SQL03 | Role seed deduplication risk | **RESOLVED:** db-seed.js uses ON CONFLICT DO UPDATE; idempotent upsert; no risk |
| B-SQL04 | Approval decisions entity choice | **RESOLVED:** Create `nashir_approval_decisions`; existing approval_decisions requires media_asset_version_id FK incompatible with Nashir |
| B-SQL05 | Cost tracking entity choice | **RESOLVED:** Create `nashir_cost_usage_records`; existing cost_events requires customer_account_id FK not in Nashir model |

### Remaining blockers (correctly deferred — do not block Implementation Planning Gate)

| ID | Finding | Deferred To |
|---|---|---|
| B-SQL01 | Migration PR structure in marketing-os not approved | Nashir Backend Slice 0 Planning Gate |
| B-SQL06 | TTL cleanup job ownership and mechanism | Nashir Backend Slice 0 Planning Gate |
| B-SQL07 | Integration secret storage vault pattern | Nashir Backend Slice 0 Planning Gate |
| B-SQL08 | Audit/evidence retention policy | Future governance gate |
| B-SQL09 | Nashir production path independence from marketing-os NO-GO | Future production readiness gate |

**None of the remaining blockers prevent SQL Schema Implementation Planning Gate from proceeding.**

---

## 20. Non-blocking Findings / Watch Items

| ID | Finding | Action |
|---|---|---|
| W-SQL-R01 | `workspace_members` uses `role_id uuid FK` in actual schema; planning gate description says "role_code". Implementation must use role_id FK via subselect (as in db-seed.js pattern) | Document in SQL Schema Implementation Planning Gate |
| W-SQL-R02 | `nashir_products` and `nashir_assets` need nullable `store_profile_id` FK in Patch 006 even if unused in V1; planning gate documents this as W-SQL06 | Confirm in SQL Schema Implementation Planning Gate |
| W-SQL-R03 | `nashir_campaigns` needs nullable `store_profile_id` column added (Patch 005 or 006); planning gate documents as W-SQL07 | Confirm in SQL Schema Implementation Planning Gate |
| W-SQL-R04 | `audit_logs.action varchar(160)` capacity for Nashir action strings — all reviewed strings appear ≤ 80 chars; verify at Implementation Planning | Verify longest Nashir action string ≤ 160 chars |
| W-SQL-R05 | `nashir_prompt_governance_versions` version_number uniqueness — if versions are recycled after deprecation, need partial unique index: `UNIQUE (workspace_id, prompt_template_id, version_number) WHERE approval_status = 'active'` | Confirm in SQL Schema Implementation Planning Gate |
| W-SQL-R06 | Patch 009 (Creator Studio) references `nashir_prompt_templates` via prompt_template_id FK, but Patch 010 defines `nashir_prompt_templates`. Either: (a) make prompt_template_id nullable in context_drafts until Patch 010 applied, or (b) merge Patches 009 and 010. Must be decided before migration implementation | Confirm in SQL Schema Implementation Planning Gate |
| W-SQL-R07 | role_permissions seed: db-seed.js resolves role_code and permission_code to IDs via subselect. Patch 005 seed must use same pattern (INSERT ... WHERE role_code = ... AND permission_code = ...) rather than hardcoded UUIDs | Carry to SQL Schema Implementation Planning Gate |
| W-SQL-R08 | Advanced analytics, ROI modeling, workflow execution remain Post-V1; not blocked but confirm not accidentally included in V1 patches | Carry to SQL Schema Implementation Planning Gate |

---

## 21. Required Corrections

**No Nashir SQL Schema Planning Fix Gate is required.**

The planning document has no internal blockers that prevent the Implementation Planning Gate from proceeding. The four planning-gate blockers (B-SQL02/03/04/05) are resolved in this review. The remaining blockers (B-SQL01/06/07/08/09) are correctly deferred and do not require a planning fix.

The eight watch items above (W-SQL-R01 through W-SQL-R08) must be addressed in the SQL Schema Implementation Planning Gate before any migration file is written.

---

## 22. Readiness Assessment

| Dimension | Rating |
|---|---|
| Candidate table inventory | **READY** — 33 tables inventoried; all IN/DEFER correctly classified |
| Referential integrity | **READY** — junction table present; no uuid[] FK arrays; FKs documented correctly |
| Workspace/store isolation | **READY** — all tables workspace-scoped; store nullable FK pattern confirmed |
| RBAC seed readiness | **READY** — B-SQL02/03/04/05 resolved; upsert pattern confirmed |
| Creator Studio TTL readiness | **READY WITH WATCH ITEMS** — W-SQL-R06 (patch ordering) must be resolved |
| Audit/evidence readiness | **READY** — audit_logs reuse confirmed; append-only trigger verified |
| Soft delete/unique index readiness | **READY WITH WATCH ITEMS** — W-SQL-R05 (prompt version partial unique) must be confirmed |
| Migration sequencing | **READY WITH WATCH ITEMS** — W-SQL-R06 (Patch 009/010 ordering) must be resolved |
| marketing-os implementation readiness | **READY WITH WATCH ITEMS** — B-SQL01 deferred; migration pattern confirmed |
| DB engine readiness | **READY** — PostgreSQL confirmed |

**Overall readiness: READY FOR SQL SCHEMA IMPLEMENTATION PLANNING**

---

## 23. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir SQL Schema Implementation Planning Gate** | This review gate — READY | Produces exact allowed migration files, column definitions, SQL DDL planning (not implementation), constraint specifications, seed SQL, verification commands, rollback criteria for marketing-os migration PRs |
| 2 | **Nashir Backend Slice 0 Planning** | SQL Schema Implementation Planning Gate | Plans first implementable backend slice; wires guards; selects auth provider; approves migration PR structure; resolves B-SQL01/06/07 |
| 3 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning | Plans migration of nashir_v1_openapi.yaml to marketing-os |
| 4 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves package.json generation script update |
| 5 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**SQL implementation** remains blocked until SQL Schema Implementation Planning Gate closes.

**Backend Slice 0** remains blocked until SQL Schema Implementation Planning closes.

**OpenAPI Migration Planning** remains blocked until Backend Slice 0 Planning closes.

**UI API Integration** remains blocked until backend exists and contract authority is settled.

---

## 24. Decision

### Final decision

| Area | Status |
|---|---|
| Review result | **READY FOR SQL SCHEMA IMPLEMENTATION PLANNING** |
| Planning document blockers resolved in this review | **4 (B-SQL02/03/04/05)** |
| Remaining blockers | **5 (B-SQL01/06/07/08/09 — all deferred; do not block implementation planning)** |
| Blocking findings in planning document | **NONE** |
| SQL Schema Planning Fix Gate required | **NOT REQUIRED** |
| GO to Nashir SQL Schema Implementation Planning Gate | **GO** |
| SQL DDL implementation | **NO-GO** |
| Migrations | **NO-GO** |
| Backend routes | **NO-GO** |
| Auth middleware / RBAC implementation | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |

### Resolution summary for SQL Schema Implementation Planning Gate

The following decisions are confirmed and must be carried into the Implementation Planning Gate:

| Decision | Confirmed |
|---|---|
| PostgreSQL is the database engine | YES (confirmed) |
| Create `nashir_prompt_templates` (not reuse marketing-os prompt_templates) | YES |
| Create `nashir_approval_decisions` (not reuse marketing-os approval_decisions) | YES |
| Create `nashir_cost_usage_records` (not reuse marketing-os cost_events) | YES |
| Role seed uses ON CONFLICT DO UPDATE (idempotent upsert) | YES |
| role_permissions seed uses role_id subselect, not hardcoded UUIDs | YES |
| Junction table `nashir_campaign_content_assets` is IN V1 | YES |
| No uuid[] columns for FK-like references | YES (eliminated) |
| TTL partial indexes use status enum predicates, not `expires_at > now()` | YES |
| Patch 009 / 010 ordering must be decided before migration files are written | YES (W-SQL-R06) |

### Next gate

**Nashir SQL Schema Implementation Planning Gate**

That gate must:
- Produce the exact migration file contents (column-level DDL, constraints, indexes, enums) for Patches 005 through 011.
- Resolve W-SQL-R06 (Patch 009/010 ordering for prompt_template_id FK).
- Confirm nullable `store_profile_id` on products, assets, and campaigns.
- Confirm partial unique index for `nashir_store_profiles.workspace_id`.
- Confirm partial unique for `nashir_prompt_governance_versions.version_number`.
- Specify seed SQL (ON CONFLICT pattern) for Patch 005.
- Define verification commands for marketing-os CI.
- Define rollback plan per migration patch.
- Not implement any migration. Documentation-only planning gate.
