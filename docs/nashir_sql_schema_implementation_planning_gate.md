# Nashir SQL Schema Implementation Planning Gate

| Field | Value |
|---|---|
| Gate type | SQL Schema Implementation Planning Gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Translates approved SQL Schema Planning/Review gates into an exact future implementation plan: target repository, allowed files, migration sequencing, seed strategy, verification commands, rollback criteria, and unresolved blockers |
| Prerequisite gates | `docs/nashir_sql_schema_review_gate.md` — merged, READY; `docs/nashir_sql_schema_planning_gate.md` — merged |
| SQL DDL created | NO |
| Migrations created | NO |
| Backend routes implemented | NO |
| Auth/RBAC implementation approved | NO |
| OpenAPI YAML changes approved | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is a SQL Schema Implementation Planning Gate only.

**No SQL DDL is created.**

**No migrations are created.**

**No backend routes are implemented.**

**No auth/RBAC implementation is approved.**

**No OpenAPI YAML change is approved in this slice.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> What exact future implementation plan should be used for Nashir SQL schema, what repository and files are expected to be touched later, what remains unresolved, and what must be verified before actual migrations are written?

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `docs/nashir_sql_schema_review_gate.md` | **Primary input** — READY FOR SQL SCHEMA IMPLEMENTATION PLANNING; 4 blockers resolved (B-SQL02/03/04/05); 8 watch items; corrected ordering W-SQL-R06 noted |
| `docs/nashir_sql_schema_planning_gate.md` | 32 sections; candidate tables; migration sequencing; seed plan |
| `docs/nashir_openapi_security_yaml_patch_review_gate.md` | READY FOR SQL SCHEMA PLANNING; security metadata confirmed |
| `docs/nashir_openapi_security_mapping_gate.md` | 34 operations; workspace scope route-derived; guard chain documented |
| `docs/nashir_auth_rbac_review_gate.md` | READY WITH WATCH ITEMS; 7 roles; 35 permission codes; upsert pattern confirmed |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | 35 permission codes; 7 roles; dot notation confirmed |
| `docs/nashir_erd_reconciliation_gate.md` | ERD candidate; Asset naming B-R01 documented |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE |
| `docs/nashir_backend_home_decision.md` | marketing-os SELECTED AS CANDIDATE |
| `docs/nashir_v1_openapi.yaml` | 35 operations; security metadata; entity schemas |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO; Sprint 5 NO-GO |
| `package.json` | pg ^8.20.0; node >=20; `npm run db:migrate:strict`, `npm run db:seed`, `npm run verify:strict` |
| `AGENTS.md` | Documentation PRs must not modify src/rbac.js without separate approval; gate discipline required |
| `scripts/db-migrate.js` | Migration runner: pg_advisory_lock; strict sequential; 5-file chain (base + patches 001-004); migrations array must be extended for Patches 005+ |
| `scripts/db-seed.js` | **KEY FINDING — VERIFIED:** Imports roles/permissions/rolePermissions from `src/rbac.js`; builds SQL dynamically; roles/permissions use ON CONFLICT upsert; **role_permissions uses DELETE all system-role rows + full re-INSERT** — fully idempotent; seed driven from rbac.js source of truth |
| `scripts/verify-sprint0.js` | Verification script run as part of `npm run verify:strict` |
| `src/rbac.js` | Seven roles; permissions array; rolePermissions map; four existing Nashir permission codes |
| `src/guards.js` | Five guards: authGuard, workspaceContextGuard, membershipCheck, nonDisclosingMembershipCheck, permissionGuard, rejectBodyWorkspaceId |
| `test/nashir-rbac-permission-mapping.test.js` | 28 assertions for 4 Nashir codes × 7 roles; must be extended with all new codes |
| `test/nashir-campaign-repository.test.js` | Nashir campaign repository tests; pattern for new Nashir repository tests |
| `test/nashir-evidence-lifecycle-repository.test.js` | Evidence lifecycle repository tests; pattern for evidence table tests |
| `test/nashir-store-entities.test.js` | Store entity seed tests |
| `test/integration/db-backed-slice0.integration.test.js` | DB-backed integration test pattern (PostgreSQL required) |
| `docs/07_database_schema.sql` | Schema wrapper doc; must be updated with Patch 005+ file references |

### Key verified implementation facts

> **IMPL-FACT-1:** RBAC seed is driven by `src/rbac.js`. Adding Nashir permission codes to `src/rbac.js`'s `permissions` array and `rolePermissions` map automatically includes them in the next `npm run db:seed` execution. The seed script handles deletion and full re-insertion of role_permissions idempotently.

> **IMPL-FACT-2:** Future migration files must be added to the `migrations` array in `scripts/db-migrate.js` and referenced in `docs/07_database_schema.sql` to be included in the verified migration chain.

> **IMPL-FACT-3:** The corrected patch ordering (from SQL Schema Review Gate W-SQL-R06) places prompt templates/governance versions BEFORE Creator Studio tables to avoid nullable FK dependency.

---

## 3. Planning Question

**What exact future implementation plan should be used for Nashir SQL schema, what repository and files are expected to be touched later, what remains unresolved, and what must be verified before actual migrations are written?**

**Summary:** The implementation slice lives in marketing-os. It modifies `src/rbac.js` for RBAC seed, adds `schema_patch_005.sql` through `schema_patch_012.sql` in `marketing-os/docs/`, extends `scripts/db-migrate.js`, updates `docs/07_database_schema.sql`, extends the RBAC test, and adds Nashir repository tests. No backend routes, auth middleware, or UI changes are included. The implementation is blocked until B-SQL01 (Backend Slice 0 approval) and B-SQL06/07 are resolved, but the planning is sufficiently defined to authorize the implementation slice if those blockers are cleared.

---

## 4. Repository and Ownership Decision

- **nashir-ui-prototype** remains the planning/contract/UI prototype repository. No schema files, SQL files, or migrations are created here.
- **marketing-os** is the candidate backend/schema home. All future SQL implementation must happen in marketing-os only after a formally approved implementation slice.
- This gate does not move ownership. It defines what must happen in marketing-os when an implementation slice is approved.
- No marketing-os files are modified in this slice.
- nashir-ui-prototype SQL/migration files are permanently forbidden.

---

## 5. DB Engine and Migration Pattern Verification

| Dimension | Status | Evidence |
|---|---|---|
| DB engine: PostgreSQL | **VERIFIED** | pgcrypto, gen_random_uuid(), timestamptz, uuid, jsonb, pg_advisory_lock, psql \i — confirmed from marketing-os base schema |
| Migration folder/files exist | **VERIFIED** | `docs/marketing_os_v5_6_5_phase_0_1_schema.sql` + patches 001-004 in `marketing-os/docs/` |
| Migration naming convention | **VERIFIED** | `marketing_os_v5_6_5_phase_0_1_schema_patch_NNN.sql` |
| Migration runner exists | **VERIFIED** | `scripts/db-migrate.js` with advisory lock, sequential order, strict mode |
| Migration retry exists | **VERIFIED** | `scripts/db-migrate-retry.js` |
| Seed pattern exists | **VERIFIED** | `scripts/db-seed.js` — imports from rbac.js; idempotent; ON CONFLICT upsert |
| Test database setup | **VERIFIED** | Integration tests require live PostgreSQL; `DATABASE_URL` env var |
| RBAC tests exist | **VERIFIED** | `test/nashir-rbac-permission-mapping.test.js` — must be extended |
| Repository tests exist | **VERIFIED** | `test/nashir-campaign-repository.test.js`, `test/nashir-evidence-lifecycle-repository.test.js` — pattern for new tests |
| Verification command | **VERIFIED** | `npm run verify:strict` runs verify-sprint0 + openapi:lint:strict + test + test:integration + db:seed + db:migrate:strict |
| Implementation blocks if DB engine/migration unresolved | **N/A** | Both are verified; no engine uncertainty block |

---

## 6. Future Implementation Scope

The SQL implementation slice covers exactly:

| In Scope | Out of Scope |
|---|---|
| SQL migration files (Patches 005–011) in marketing-os/docs/ | Backend routes or API handlers |
| RBAC seed update in src/rbac.js (add permission codes + role assignments) | Auth middleware or guard changes |
| scripts/db-migrate.js migration array extension | UI integration or frontend changes |
| docs/07_database_schema.sql wrapper update | OpenAPI migration |
| RBAC test extension (nashir-rbac-permission-mapping.test.js) | Generated client updates |
| New Nashir repository tests (pattern from existing campaign/evidence tests) | nashir-ui-prototype package or src changes |
| Integration test extension if required by new DB tables | Production/pilot readiness |

---

## 7. Future Allowed Files

All files in **marketing-os repository only**.

| File | Category | Status |
|---|---|---|
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_005.sql` | Migration: RBAC seed tables (see Section 9) | **READY** |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_006.sql` | Migration: store profiles, products, assets | **READY** |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_007.sql` | Migration: campaigns update + content/review/publishing | **READY** |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_008.sql` | Migration: prompt templates + governance versions | **READY** (corrected order — before Creator Studio) |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_009.sql` | Migration: Creator Studio tables | **READY** (after prompt templates) |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_010.sql` | Migration: model routing, AI providers, cost usage | **READY** |
| `docs/marketing_os_v5_6_5_phase_0_1_schema_patch_011.sql` | Migration: workflow definitions (advisory metadata, if approved) | **WATCH** — defer if advisory-only workflow not needed in V1 |
| `docs/07_database_schema.sql` | Schema wrapper doc update | **READY** — add \i lines for patches 005-011 |
| `scripts/db-migrate.js` | Migration runner array extension | **READY** — add patch 005-011 filenames to migrations array |
| `src/rbac.js` | RBAC permission codes + role-permission assignments | **READY** — add 33 nashir.* permission codes; extend rolePermissions map |
| `test/nashir-rbac-permission-mapping.test.js` | RBAC test extension | **READY** — add assertions for all new Nashir permission codes × 7 roles |
| `test/nashir-store-entities.test.js` (or new file) | Store entity tests | **READY** — pattern from existing test |
| New repository test files for Nashir domains | Repository tests | **TBD** — named in Backend Slice 0 Planning |
| `test/integration/db-backed-nashir-patch-005.integration.test.js` (or equivalent) | Integration test for new patches | **TBD** — pattern from db-backed-slice0 |

---

## 8. Future Forbidden Files

| Forbidden File / Category | Reason |
|---|---|
| Any file in nashir-ui-prototype | No SQL/migration/backend in UI repo |
| nashir-ui-prototype/src/ | UI only |
| nashir-ui-prototype/package.json, package-lock.json | No dep changes |
| nashir-ui-prototype/src/generated/ | Not a migration artifact |
| docs/nashir_v1_openapi.yaml | Separate OpenAPI gate required |
| marketing-os/prototype/ | Not a source of truth |
| Backend route files in marketing-os | Backend Slice 0 must approve separately |
| Auth middleware files (guards.js, error-model.js) | Auth/RBAC Implementation Gate must approve |
| UI API integration files | UI API Integration Planning Gate must approve |
| .env / secrets / credential files | Never committed |
| Generated clients | Separate gate required |
| Any other file not in the allowed list above | Out of scope |

---


**Patch numbering consistency rule:** Future implementation must preserve the 12-patch sequence defined in Section 9. Section 7 allowed files, Section 18 verification commands, and Section 23 readiness language must all reference patches 001-012 consistently.

## 9. Migration Sequencing Plan

Corrected order (resolving W-SQL-R06 from SQL Schema Review Gate: prompt templates precede Creator Studio):

| Patch | File Name | Content | Dependencies | Priority |
|---|---|---|---|---|
| **005** | `schema_patch_005.sql` | RBAC permission codes INSERT (33 new nashir.* codes) into `permissions`; role-permission assignment INSERT for all 7 roles into `role_permissions` (via subselect). **Note:** Actual seed is driven by db-seed.js from rbac.js — this patch adds any schema-level permission enum/rows that cannot go through the seed script | Patches 001-004 applied | **HIGHEST** |
| **006** | `schema_patch_006.sql` | `nashir_store_profiles`; `nashir_products` (with nullable store_profile_id); `nashir_assets` (with nullable store_profile_id); store_profile_id nullable FK added to `nashir_campaigns` (Patch 004) via ALTER TABLE | Patch 005 | HIGH |
| **007** | `schema_patch_007.sql` | `nashir_campaign_content_items`; `nashir_campaign_content_assets` (composite PK); `nashir_preview_artifacts`; `nashir_approval_decisions` | Patch 006 | HIGH |
| **008** | `schema_patch_008.sql` | `nashir_publishing_queue_items` | Patch 007 (requires approved content FK) | HIGH |
| **009** | `schema_patch_009.sql` | **`nashir_prompt_templates`; `nashir_prompt_governance_versions`** | Patch 005 | MEDIUM — **MUST precede Patch 010** |
| **010** | `schema_patch_010.sql` | All Creator Studio tables: `nashir_creator_studio_sessions`, `nashir_creator_content_ideas`, `nashir_creator_campaign_angles`, `nashir_creator_audience_segments`, `nashir_creator_publish_windows`, `nashir_creator_context_drafts` (with prompt_template_id FK → Patch 009), `nashir_creator_transfer_drafts`, `nashir_creator_readiness_assessments` | Patch 009 (prompt_template_id FK dependency resolved) | MEDIUM |
| **011** | `schema_patch_011.sql` | `nashir_model_routing_rules`; `nashir_ai_providers`; `nashir_cost_usage_records` | Patch 005 | LOW |
| **012** (optional) | `schema_patch_012.sql` | `nashir_workflow_definitions` (advisory metadata only, if approved) | Patch 005 | LOW — evaluate necessity |

**W-SQL-R06 resolution confirmed:** Prompt templates (Patch 009) precede Creator Studio (Patch 010). No nullable FK workaround needed.

---

## 10. Table Implementation Plan

No SQL DDL. Conceptual column summaries only.

### Patch 005 — RBAC Extension

**src/rbac.js + db-seed.js (not a SQL migration)**
- Add 33 Nashir permission codes to `permissions` array (dot notation: `nashir.domain.action`)
- Add role-permission assignments to `rolePermissions` map for all 7 roles
- `db-seed.js` handles the DELETE + full re-INSERT of role_permissions idempotently
- No new SQL tables; reuses existing `roles`, `permissions`, `role_permissions` tables
- Test: extend `nashir-rbac-permission-mapping.test.js` to cover all 33 new codes × 7 roles
- **Status: READY** — db-seed.js pattern fully verified

### Patch 006 — Store, Product, Asset

**nashir_store_profiles**
- Key columns: store_profile_id (uuid PK), workspace_id (uuid FK, PARTIAL UNIQUE WHERE status = 'active'), store_name (NOT NULL), category, activity, language, tone, audience_defaults (jsonb), channel_preferences (text[]), setup_status (enum: incomplete/ready), created_at, updated_at
- Indexes: unique partial index on workspace_id WHERE status = 'active'
- Privacy: LOW–MEDIUM | Workspace: YES | Status: **READY**

**nashir_products**
- Key columns: product_id (uuid PK), workspace_id (uuid FK), store_profile_id (uuid FK nullable), name (NOT NULL), category, price (numeric), currency, sku, stock_status (enum), image_url, video_url, description, status (enum: draft/active/archived), version (varchar), created_by (uuid FK), created_at, updated_at
- Indexes: (workspace_id), (workspace_id, status), (workspace_id, store_profile_id) WHERE store_profile_id IS NOT NULL
- Privacy: LOW | Workspace: YES | Status: **READY**

**nashir_assets** (OpenAPI schema name: `Asset`)
- Key columns: asset_id (uuid PK), workspace_id (uuid FK), store_profile_id (uuid FK nullable), linked_product_id (uuid FK nullable), name (NOT NULL — display only), asset_type (enum: image/video/logo/document/text/design), url, preview_url, rights_status (enum), usage_rights (enum), source, quality, status (enum: draft/active/archived), version (varchar), created_by (uuid FK), created_at, updated_at
- Indexes: (workspace_id), (workspace_id, status), (workspace_id, linked_product_id)
- Privacy: LOW–MEDIUM | Workspace: YES | **Naming rule: SQL table = nashir_assets; OpenAPI = Asset** | Status: **READY**

**ALTER TABLE nashir_campaigns** (Patch 004 extension)
- Add: store_profile_id uuid REFERENCES nashir_store_profiles(store_profile_id) — nullable; Post-V1 multi-store prep
- Watch: Confirm this ALTER is idempotent (IF NOT EXISTS column syntax or conditional)
- Status: **READY — WATCH column add syntax**

**nashir_product_intelligence_snapshots** — **DEFER**: computed/derived in V1; no table needed

**nashir_data_sources** — **DEFER to Post-V1**

**nashir_integration_connections** — **DEFER to Post-V1**

### Patch 007 — Campaign Content + Review + Publishing

**nashir_campaign_content_items**
- Key columns: campaign_content_id (uuid PK), workspace_id (uuid FK), campaign_id (uuid FK nullable → nashir_campaigns), product_id (uuid FK NOT NULL → nashir_products), title (NOT NULL), channel (NOT NULL), content_type (NOT NULL), body_content (text), cta, audience_summary, offer_summary, review_status (enum: draft/ready_for_review/in_review/approved/rejected), version (varchar), created_by (uuid FK), created_at, updated_at
- Indexes: (workspace_id), (workspace_id, review_status), (workspace_id, product_id)
- Unique: none on content items (status-based lifecycle, no unique title constraint)
- Privacy: LOW–MEDIUM | Workspace: YES | Status: **READY**

**nashir_campaign_content_assets** (junction table)
- **Composite PK:** (campaign_content_id, asset_id) — enforces uniqueness without separate surrogate key
- Key columns: campaign_content_id (uuid FK NOT NULL → nashir_campaign_content_items), asset_id (uuid FK NOT NULL → nashir_assets), workspace_id (uuid FK NOT NULL), sort_order (integer nullable), created_at
- Constraint: workspace alignment check (content and asset must share workspace_id) — service-layer or trigger responsibility
- Indexes: (workspace_id, campaign_content_id), (workspace_id, asset_id)
- Privacy: LOW | Workspace: YES | Status: **READY**

**nashir_preview_artifacts**
- Key columns: preview_artifact_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL), channel (NOT NULL), format (NOT NULL), display_summary (NOT NULL), review_status (enum), created_at
- Asset references: resolved through nashir_campaign_content_assets (no local asset_ids column)
- Indexes: (workspace_id, campaign_content_id)
- Privacy: LOW | Workspace: YES | Status: **READY**

**nashir_approval_decisions**
- Key columns: approval_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL), decision (enum: approved/rejected/changes_requested), decided_by (uuid FK users NOT NULL), content_version (varchar), decision_note, rejection_reason, required_changes (text[]), created_at
- Constraint: decided_by ≠ content created_by — service-layer invariant (not SQL constraint)
- Indexes: (workspace_id, campaign_content_id), (workspace_id, decided_by)
- Privacy: LOW | Workspace: YES | Status: **READY**

**nashir_publishing_queue_items**
- Key columns: queue_item_id (uuid PK), workspace_id (uuid FK), campaign_content_id (uuid FK NOT NULL — must be approved), status (enum: pending/scheduled/cancelled), scheduled_by (uuid FK NOT NULL), human_confirmed (boolean default false), created_at, updated_at
- Constraint: no automatic scheduling; human_confirmed must be true before status = 'scheduled'
- Indexes: (workspace_id, status), (workspace_id, campaign_content_id)
- Privacy: LOW | Workspace: YES | Status: **READY**

### Patch 008 — Publishing Queue

(See nashir_publishing_queue_items above — may be merged into Patch 007 for efficiency)

### Patch 009 — Prompt Templates + Governance Versions (BEFORE Creator Studio)

**nashir_prompt_templates**
- Key columns: prompt_template_id (uuid PK), workspace_id (uuid FK), template_name (NOT NULL — display only; not identity), status (enum: active/deprecated/archived), created_by (uuid FK), created_at, updated_at
- Partial unique: (workspace_id, template_name) WHERE status = 'active' — prevents name conflicts on active templates; allows re-creation after deprecation
- Indexes: (workspace_id), (workspace_id, status)
- Privacy: MEDIUM | Workspace: YES | Status: **READY**

**nashir_prompt_governance_versions**
- Key columns: prompt_version_id (uuid PK), workspace_id (uuid FK), prompt_template_id (uuid FK NOT NULL), version_number (integer NOT NULL), version_body (text NOT NULL — internal; not exposed raw in API), approval_status (enum: draft/active/deprecated/blocked), approved_by (uuid FK nullable), approved_at (nullable), created_at
- Partial unique: (workspace_id, prompt_template_id, version_number) WHERE approval_status = 'active' — allows version number reuse after deprecation
- Indexes: (workspace_id, prompt_template_id), (workspace_id, approval_status)
- Privacy: MEDIUM | Workspace: YES | Status: **READY**

### Patch 010 — Creator Studio (after Patch 009 establishes prompt_template_id FK target)

**nashir_creator_studio_sessions**
- Key columns: session_id (uuid PK), workspace_id (uuid FK), actor_user_id (uuid FK NOT NULL), selected_platform (enum), creator_handle_ref (text — **OPAQUE reference only; NEVER raw handle**), source (enum: manual), manual_context (jsonb), status (enum: active/expired/blocked), created_at, expires_at (timestamptz NOT NULL), transferred_at (nullable)
- Indexes: (workspace_id, actor_user_id), (expires_at) **WHERE status = 'active'**
- TTL: expires_at enforced at application layer; cleanup job compares expires_at at runtime
- Privacy: **HIGH** | Workspace: YES | Status: **READY — handle_ref column naming critical**

**nashir_creator_content_ideas, nashir_creator_campaign_angles, nashir_creator_audience_segments, nashir_creator_publish_windows**
- Common pattern: entity_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK), content/status fields, created_at, expires_at (derived from session TTL)
- Indexes: (workspace_id, session_id) on each
- Privacy: LOW–MEDIUM (segments: MEDIUM — consent_ref column)
- Status: **READY**

**nashir_creator_context_drafts**
- Key columns: draft_id (uuid PK), workspace_id (uuid FK), session_id (uuid FK NOT NULL), idea_id (nullable FK), angle_id (nullable FK), segment_id (nullable FK), window_id (nullable FK), **prompt_template_id (uuid FK nullable → nashir_prompt_templates — FK now valid after Patch 009)**, status (enum), human_review_required (boolean default true), created_at, expires_at
- Indexes: (workspace_id, session_id), (workspace_id, status), (expires_at) **WHERE status NOT IN ('expired', 'blocked')**
- Privacy: MEDIUM | Workspace: YES | Status: **READY — prompt_template_id FK dependency resolved**

**nashir_creator_transfer_drafts**
- Key columns: transfer_id (uuid PK), workspace_id (uuid FK), context_draft_id (uuid FK NOT NULL), session_id (uuid FK NOT NULL), destination_module (enum), status (enum: pending_review/expired), payload_summary (**jsonb — NO raw tokens, NO raw prompt text**), human_review_required (boolean default true), created_at, expires_at
- Indexes: (workspace_id, context_draft_id), (workspace_id, destination_module), (expires_at) **WHERE status = 'pending_review'**
- Privacy: MEDIUM | Workspace: YES | Status: **READY**

**nashir_creator_readiness_assessments**
- Key columns: assessment_id (uuid PK), workspace_id (uuid FK), draft_id (uuid FK NOT NULL), overall_status (enum), findings (jsonb), blockers (text[]), warnings (text[]), created_at, expires_at
- Indexes: (workspace_id, draft_id)
- Privacy: LOW | Workspace: YES | Status: **READY**

### Patch 011 — AI Ops

**nashir_model_routing_rules**
- Key columns: model_route_id (uuid PK), workspace_id (uuid FK), primary_model_id (NOT NULL), fallback_model_ids (text[]), provider_id (uuid FK nullable → nashir_ai_providers), route_health (enum), route_policy (jsonb), score (integer advisory), updated_at
- Indexes: (workspace_id)
- Privacy: LOW | Workspace: YES | Status: **READY**

**nashir_ai_providers**
- Key columns: provider_id (uuid PK), workspace_id (uuid FK), health_status (enum), supported_capabilities (text[]), supported_models (text[]), **secret_reference_name (text — vault ref; NOT raw secret)**, score (integer advisory), last_tested_at (nullable), updated_at
- Indexes: (workspace_id)
- Privacy: MEDIUM | Workspace: YES | Status: **READY**

**nashir_cost_usage_records**
- Key columns: cost_record_id (uuid PK), workspace_id (uuid FK), campaign_id (uuid nullable FK), model_route_id (uuid nullable FK), usage_type (NOT NULL), amount (numeric NOT NULL), currency (char(3) NOT NULL), **is_advisory (boolean default true)**, recorded_at (NOT NULL), created_at
- Indexes: (workspace_id, recorded_at), (workspace_id, campaign_id)
- Privacy: LOW | Workspace: YES | Status: **READY** — **NOT billing; NOT invoice**

**nashir_workflow_definitions** (advisory metadata, Patch 012 if approved)
- DEFER — evaluate necessity before Patch 012 is written

**nashir_audit_events** — REUSE `audit_logs` (existing, append-only trigger)
**nashir_evidence_records** — REUSE `nashir_evidence` + `nashir_evidence_lifecycle_events` (existing Patch 003)

---

## 11. RBAC Seed Implementation Plan

### Implementation approach (verified from db-seed.js pattern)

1. **Modify `src/rbac.js`** (requires marketing-os implementation PR):
   - Add all 33 V1-active Nashir permission codes to `permissions` array (dot notation)
   - Add role-permission assignments to `rolePermissions` map for all 7 roles

2. **db-seed.js** handles seed generation automatically:
   - Roles: ON CONFLICT (role_code) DO UPDATE — idempotent
   - Permissions: ON CONFLICT (permission_code) DO UPDATE — idempotent
   - Role_permissions: DELETE all is_system_role = true rows + full re-INSERT — idempotent

3. **No separate seed SQL migration file needed for RBAC** — the seed script generates SQL from rbac.js

4. **Extend `test/nashir-rbac-permission-mapping.test.js`**:
   - Current: 4 codes × 7 roles = 28 assertions
   - After: 37 codes × 7 roles = 259 assertions (33 new + 4 existing)

### Rules enforced in this plan

- No unapproved permission codes (integration.connect and integration.manage remain DEFER)
- No destination service actor in V1 RBAC seed
- C-RV03: all permission codes use dot notation (`nashir.domain.action`)
- C-RV01 boundary: nashir.admin.manage (Nashir-specific ops) ≠ workspace.manage (workspace settings)
- C-RV02: RA (reviewer + nashir.evidence.manage) is a service-layer flag, not a separate permission
- RBAC runtime enforcement remains blocked until Backend Slice 0 wires guards to routes

---

## 12. Workspace/Store Isolation Implementation Plan

| Table | workspace_id Column | store_profile_id Column | FK Constraint | Test Requirement |
|---|---|---|---|---|
| nashir_store_profiles | YES — FK REFERENCES workspaces(workspace_id) | IS the store | UNIQUE partial on workspace_id WHERE status = 'active' | Verify 1:1 enforcement |
| nashir_products | YES — FK | nullable FK → nashir_store_profiles | Standard FK | Verify list query scopes to workspace |
| nashir_assets | YES — FK | nullable FK | Standard FK | Verify list query scopes |
| nashir_campaigns | YES — existing | nullable FK (ADD via ALTER) | Standard FK | Verify no cross-workspace campaign |
| nashir_campaign_content_items | YES — FK | Implicit | Standard FK | Verify product FK workspace alignment |
| nashir_campaign_content_assets | YES — FK | Implicit | Composite FK | Verify asset and content share workspace |
| All Creator Studio tables | YES — FK | Implicit | Standard FK | Verify session/draft FK alignment |
| nashir_prompt_templates | YES — FK | — | Standard FK | Verify template scoped to workspace |
| nashir_model_routing_rules | YES — FK | — | Standard FK | Verify advisory ops scoped |
| nashir_cost_usage_records | YES — FK | — | Standard FK | Verify cost records scoped |

**API-layer responsibility:** `rejectBodyWorkspaceId` guard prevents untrusted body workspace_id at API layer. SQL FK constraints enforce workspace alignment at persistence layer. Both are required; neither is optional.

**Cross-workspace access: NO-GO** — enforced by workspace_id FK on ALL tables, confirmed in every repository method.

---

## 13. Referential Integrity Implementation Plan

| Rule | Implementation Approach | Status |
|---|---|---|
| No FK-like uuid[] arrays | junction table `nashir_campaign_content_assets` with composite PK (campaign_content_id, asset_id) | **CONFIRMED** |
| Campaign content assets normalized | Composite PK junction table; no asset_ids column on content items | **CONFIRMED** |
| Preview artifacts asset refs via junction | No local asset_ids column; resolve through nashir_campaign_content_assets | **CONFIRMED** |
| Product → Assets cardinality 1:N | linked_product_id nullable FK on nashir_assets; no junction table in V1 | **CONFIRMED** |
| True N:M associations have junction tables | Only content-asset is N:M in V1; junction table present | **CONFIRMED** |
| Creator context draft → prompt_template FK | prompt_template_id uuid FK nullable → nashir_prompt_templates; Patch 009 before Patch 010 ensures FK target exists | **CONFIRMED — W-SQL-R06 resolved** |
| Evidence replacement self-reference | Existing Patch 003 handles this correctly with composite FK | **CONFIRMED** |
| campaign_content_assets workspace alignment | All three of (campaign_content_id, asset_id, workspace_id) must belong to same workspace; service-layer validation | **CONFIRMED** |

---

## 14. TTL and Expiry Implementation Plan

| Table | expires_at Column | TTL Index | Cleanup Mechanism | 410 Gone Behavior |
|---|---|---|---|---|
| nashir_creator_studio_sessions | YES — NOT NULL | `(expires_at) WHERE status = 'active'` | Background job or lazy check (B-SQL06 — Backend Slice 0) | API layer: check status = 'active' AND expires_at > now(); return 410 if expired |
| nashir_creator_content_ideas | YES — from session | `(expires_at) WHERE status IN (active states)` | Same as session | Via session status |
| nashir_creator_campaign_angles | YES | Same | Same | Via session status |
| nashir_creator_audience_segments | YES | Same | Same | Via session status |
| nashir_creator_publish_windows | YES | Same | Same | Via session status |
| nashir_creator_context_drafts | YES — NOT NULL | `(expires_at) WHERE status NOT IN ('expired', 'blocked')` | Background job or lazy check | API layer: check status + expires_at; return 410 |
| nashir_creator_transfer_drafts | YES — NOT NULL | `(expires_at) WHERE status = 'pending_review'` | Same | API layer: return 410 |
| nashir_creator_readiness_assessments | YES — max 24h | `(expires_at)` WHERE not expired | Same | Re-evaluation required |

**Critical PostgreSQL constraint:** Partial index predicates MUST use static enum comparisons (`WHERE status = 'active'`). NEVER use `WHERE expires_at > now()` as a partial index predicate — `now()` is volatile and PostgreSQL will reject it with ERROR: functions in index predicate must be marked IMMUTABLE.

---

## 15. Soft Delete and Uniqueness Implementation Plan

| Table | Soft Delete Column | Active Unique Constraint | Partial Index Predicate |
|---|---|---|---|
| nashir_store_profiles | status enum (active/inactive) | workspace_id UNIQUE WHERE status = 'active' | `WHERE status = 'active'` |
| nashir_products | status enum (draft/active/archived) | No unique name constraint (name is display only) | N/A |
| nashir_campaign_content_items | review_status enum | No unique constraint | N/A |
| nashir_prompt_templates | status enum (active/deprecated/archived) | (workspace_id, template_name) UNIQUE WHERE status = 'active' | `WHERE status = 'active'` |
| nashir_prompt_governance_versions | approval_status enum | (workspace_id, prompt_template_id, version_number) UNIQUE WHERE approval_status = 'active' | `WHERE approval_status = 'active'` |
| nashir_creator_studio_sessions | status enum (active/expired/blocked) | No unique constraint | TTL index uses `WHERE status = 'active'` |

**Standard unique constraints vs partial unique:** Never apply a standard (non-partial) unique constraint where soft-deleted/archived/expired records would block recreation of an active record with the same identity fields. Partial unique indexes on `WHERE status = 'active'` prevent this class of conflict.

---

## 16. Audit and Evidence Implementation Plan

### Reuse audit_logs (existing in marketing-os base schema)

- `audit_logs` has workspace_id, actor_user_id, action (varchar 160), entity_type (varchar 120), entity_id (uuid), before_snapshot (jsonb), after_snapshot (jsonb), metadata (jsonb), correlation_id, occurred_at
- Append-only trigger: confirmed present in marketing-os base schema
- Nashir usage: `action` column values use `nashir.domain.action` format (e.g., `nashir.campaign_content.approved`)
- Verify: all planned Nashir action strings are ≤ 160 chars (W-SQL-R04 — confirmed safe based on review)
- No new audit table needed for V1

### Reuse nashir_evidence + nashir_evidence_lifecycle_events (Patch 003)

- Already defined; status enum: submitted/accepted/rejected/invalidated/superseded
- Append-only via business rule (no UPDATE trigger on evidence; lifecycle events log all transitions)
- Evidence records must not contain raw tokens, credentials, or platform OAuth payloads

### Actor/action context in audit events

Every sensitive operation must produce an audit_logs row with:
- `workspace_id` from route context
- `actor_user_id` from authGuard
- `action` in `nashir.domain.action` format
- `entity_type` = Nashir table name (e.g., `nashir_campaign_content_items`)
- `entity_id` = the entity uuid
- `metadata` = permission code used (e.g., `{"permission": "nashir.approval.decide"}`)

---

## 17. Secret and Integration Storage Plan

| Domain | Storage Rule | Vault Pattern Status |
|---|---|---|
| Model provider credentials (nashir_ai_providers.secret_reference_name) | Column stores vault reference name only — never raw API key or credential | **CONFIRMED** — column naming enforces intent |
| Integration connection tokens | Deferred; when implemented: vault reference only in DB | **BLOCKED (B-SQL07)** — vault service not specified |
| OAuth platform tokens (Creator Studio) | NEVER stored; V1 is manual-only (OAuth deferred) | **CONFIRMED** |
| Transfer draft payloadSummary | jsonb column: no raw tokens, no raw prompt text, opaque refs only | **CONFIRMED** — application-layer enforcement |
| creator_handle_ref | Opaque text column: stored as reference only, never raw platform handle | **CONFIRMED** |

**B-SQL07 (vault pattern not formally specified) remains blocked.** Until the Backend Slice 0 Planning Gate names the vault service/API, `nashir_ai_providers.secret_reference_name` is a placeholder text column. The implementation slice may proceed with the column definition but must NOT populate it with real secrets.

---

## 18. Test and Verification Plan

### Commands for future SQL implementation slice

```sh
# 1. Confirm only allowed files changed
git diff --check
git diff --name-only
# Expected: marketing-os/docs/schema_patch_005.sql through 011.sql,
#           marketing-os/scripts/db-migrate.js,
#           marketing-os/docs/07_database_schema.sql,
#           marketing-os/src/rbac.js,
#           marketing-os/test/nashir-rbac-permission-mapping.test.js,
#           any new repository test files

# 2. Verify no nashir-ui-prototype files changed
git diff -- <nashir-ui-prototype-path>/
# Expected: no output

# 3. Apply migrations (strict mode)
npm run db:migrate:strict
# Expected: all patches 001-012 apply cleanly

# 4. Apply seed (will rebuild RBAC from rbac.js)
npm run db:seed
# Expected: roles/permissions upserted; role_permissions refreshed

# 5. Run unit tests
npm test
# Expected: all 30+ tests pass; nashir-rbac-permission-mapping.test.js covers all 33 new codes

# 6. Run integration tests
npm run test:integration
# Expected: db-backed integration tests pass with new Nashir tables

# 7. Run OpenAPI lint
npm run openapi:lint:strict
# Expected: no new OpenAPI changes; nashir_openapi_patch.yaml still passes

# 8. Full strict verification
npm run verify:strict
# Expected: all checks pass

# 9. Count permission codes in rbac.js
grep -c "nashir\." src/rbac.js
# Expected: 33+ (existing 4 + 29 new active codes)

# 10. Confirm no raw secrets in migration files
grep -i "secret\|password\|token\|key" docs/schema_patch_005.sql docs/schema_patch_006.sql ... | grep -v "secret_reference_name\|permission_code\|role_code"
# Expected: no raw credential values

# 11. Git status clean
git status --short
# Expected: only the allowed files listed above
```

---

## 19. Rollback Plan

| Situation | Rollback Action |
|---|---|
| A migration patch fails in CI | Revert the failing patch file commit; re-examine DDL for syntax errors; do NOT partially apply remaining patches |
| Seed fails due to constraint violation | Investigate specific constraint; ON CONFLICT pattern is idempotent for roles/permissions; role_permissions DELETE+re-INSERT handles mismatches |
| RBAC test failure after permission codes added | Verify all new assertions match rolePermissions map in rbac.js exactly |
| nashir_campaign_content_assets composite PK conflict | Check for duplicate (campaign_content_id, asset_id) rows before applying Patch 007 |
| TTL partial index predicate rejected by PostgreSQL | Verify predicate uses enum comparison; never uses volatile function |
| Prompt_template_id FK fails in Patch 010 | Verify Patch 009 was applied first; check migration array order in db-migrate.js |
| Any migration produces unexpected diff in nashir-ui-prototype | STOP — SQL migrations must not affect nashir-ui-prototype; diagnose root cause |
| Rollback migration | Create a DROP/ALTER undo patch (Patch N+1) rather than modifying the original patch history |

---

## 20. Risk Register

| Risk | Severity | Control | Blocking Before Implementation? | Owner Gate |
|---|---|---|---|---|
| DB engine unresolved | LOW — mitigated | PostgreSQL confirmed; no residual risk | NO | Already resolved |
| Migration paths unresolved | LOW | marketing-os/docs/ confirmed; numbering 005-011 confirmed | NO — all confirmed | This gate |
| Prompt table order dependency (W-SQL-R06) | MEDIUM — mitigated | Corrected: Patch 009 (prompt) before Patch 010 (creator studio) | NO — resolved | This gate |
| RBAC seed mismatch | LOW | db-seed.js DELETE + re-INSERT; idempotent; fully mitigated | NO | This gate |
| Soft delete uniqueness conflict | LOW | Partial unique indexes documented; no standard unique on re-creatable fields | NO | SQL Implementation Slice |
| TTL cleanup ownership (B-SQL06) | MEDIUM | Backend Slice 0 must define job; tables don't break without cleanup; lazy check viable | **YES for cleanup job** | Backend Slice 0 |
| Secret vault pattern unresolved (B-SQL07) | MEDIUM | Column definition safe; real value population blocked | **YES for populating vault_ref** | Backend Slice 0 |
| Audit/evidence retention policy (B-SQL08) | LOW | Append-only trigger prevents deletion; retention clock doesn't start yet | NO | Future governance |
| Workspace alignment drift | MEDIUM | workspace_id FK on all tables; service-layer validation; repository pattern enforces scope | NO | SQL Implementation Slice tests |
| Backend/auth guard dependency | HIGH — expected | SQL schema does not implement auth; guards wired separately in Backend Slice 0 | **YES for route implementation** | Backend Slice 0 |
| OpenAPI migration dependency | MEDIUM — expected | OpenAPI stays in nashir-ui-prototype until migration planning gate; blocked | **YES for API serving** | OpenAPI Migration Gate |
| nashir_campaigns store_profile_id ALTER | MEDIUM | ALTER TABLE is additive with nullable column; must be idempotent | NO | SQL Implementation Slice |
| nashir_campaign_content_assets composite PK | LOW | Composite PK is standard; no surrogate key needed; simpler than planning gate suggested | NO | SQL Implementation Slice |

---

## 21. Implementation Blockers

| ID | Blocker | Severity | Blocks Implementation Slice? |
|---|---|---|---|
| B-SQL01 | Exact migration PR structure in marketing-os not formally approved; Backend Slice 0 Planning gate required | **HIGH** | **YES — formally** |
| B-SQL06 | TTL cleanup job ownership/mechanism not defined | MEDIUM | YES for cleanup; NO for schema definition |
| B-SQL07 | Integration secret storage vault service not formally specified | MEDIUM | YES for populating vault_ref; NO for column definition |
| B-SQL08 | Audit/evidence retention policy not approved | LOW | NO — append-only trigger prevents early deletion anyway |
| B-SQL09 | marketing-os Pilot/Production NO-GO inherited | MEDIUM | NO — implementation slice is not pilot/production |

**Summary:** B-SQL01 formally blocks the implementation slice from opening without Backend Slice 0 approval. B-SQL06 and B-SQL07 block specific aspects (cleanup job, vault population) but do not block schema column definitions. B-SQL08 and B-SQL09 do not block the implementation slice.

---

## 22. Non-blocking Watch Items

| ID | Watch Item | Gate |
|---|---|---|
| W-SQL-R01 | workspace_members uses role_id FK (not role_code); seed uses subselect to resolve | SQL Implementation Slice |
| W-SQL-R02 | nashir_products and nashir_assets need nullable store_profile_id FK; included in Patch 006 | SQL Implementation Slice |
| W-SQL-R03 | nashir_campaigns needs nullable store_profile_id column; ALTER TABLE in Patch 006 | SQL Implementation Slice |
| W-SQL-R04 | audit_logs.action varchar(160) capacity; Nashir action strings confirmed ≤ 80 chars | SQL Implementation Slice verification |
| W-SQL-R05 | nashir_prompt_governance_versions: partial unique on active version_number | SQL Implementation Slice |
| W-SQL-R07 | role_permissions seed uses subselect IDs; verify subselect resolves correctly for new Nashir codes | SQL Implementation Slice test |
| W-SQL-R08 | Advanced analytics, workflow execution remain Post-V1; confirm not in Patches 005-011 | SQL Implementation Slice review |
| W-IMP-01 | db-migrate.js migrations array must be extended — forgetting this would cause migration skip | SQL Implementation Slice |
| W-IMP-02 | docs/07_database_schema.sql wrapper must add \i lines — document coherence | SQL Implementation Slice |
| W-IMP-03 | nashir_campaign_content_assets composite PK — verify no surrogate key is used | SQL Implementation Slice |
| W-IMP-04 | Patch 012 (workflow definitions) should be deferred unless advisory metadata is explicitly required for V1 | SQL Implementation Slice |

---

## 23. Readiness Assessment

| Dimension | Rating |
|---|---|
| Table plan (12-patch sequence, 21 new tables) | **READY** — tables, columns, PKs, FKs, indexes all documented |
| Migration order (W-SQL-R06 resolved) | **READY** — Patch 009 (prompt) before Patch 010 (creator studio) confirmed |
| Referential integrity | **READY** — junction table; no uuid[]; FK targets in correct patch order |
| Workspace/store isolation | **READY** — workspace_id FK on all tables; partial unique on store_profile |
| RBAC seed readiness | **READY** — db-seed.js pattern verified; 33 codes to add to rbac.js |
| TTL readiness | **READY** — correct enum-based partial indexes; no volatile function |
| Audit/evidence readiness | **READY** — audit_logs reuse confirmed; evidence Patch 003 reuse confirmed |
| Secret/vault pattern | **READY WITH WATCH ITEMS** — column definition ready; vault service selection blocked (B-SQL07) |
| marketing-os path readiness | **READY** — migration files, scripts, and test patterns all verified |
| DB engine readiness | **READY** — PostgreSQL confirmed |
| Test readiness | **READY WITH WATCH ITEMS** — patterns verified; exact test file names for new repos TBD in Backend Slice 0 |
| B-SQL01 implementation approval | **BLOCKED** — formally requires Backend Slice 0 Planning Gate |

**Overall readiness: READY WITH WATCH ITEMS — formally blocked pending B-SQL01 (Backend Slice 0 Planning Gate approval)**

The planning is complete and coherent. The implementation slice cannot formally open without Backend Slice 0 Planning Gate approval (B-SQL01), but the plan is otherwise sufficiently defined for implementation to proceed immediately once that gate closes.

---

## 24. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir Backend Slice 0 Planning** | This implementation planning gate | Plans first implementable backend slice in marketing-os; approves exact migration PR structure; wires guards; selects auth provider; resolves B-SQL01/06/07; must happen before SQL implementation slice formally opens |
| 2 | **Nashir SQL Schema Implementation Slice** | Backend Slice 0 Planning (for B-SQL01) | Applies migration files 005-011 in marketing-os; extends rbac.js; updates db-migrate.js; extends tests; follows this plan |
| 3 | **Nashir SQL Schema Implementation Review Gate** | SQL Schema Implementation Slice | Reviews the applied migrations; confirms referential integrity, workspace isolation, RBAC seed, TTL indexes |
| 4 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning closes | Plans migration of nashir_v1_openapi.yaml to marketing-os |
| 5 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves package.json generation script update |
| 6 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**SQL implementation slice** is blocked until Backend Slice 0 Planning Gate (B-SQL01) formally approves the migration PR structure.

**Backend Slice 0** is blocked until SQL Schema Implementation Review Gate closes.

**OpenAPI Migration Planning** is blocked until Backend Slice 0 Planning closes.

**UI API Integration** is blocked until backend exists and contract authority is settled.

---

## 25. Decision

### Final decision

| Area | Status |
|---|---|
| SQL schema implementation planning complete | **COMPLETE — READY WITH WATCH ITEMS** |
| Blocking implementation slice blocker (B-SQL01) | **PRESENT — Backend Slice 0 Planning Gate required** |
| Other blockers (B-SQL06/07/08/09) | **Deferred — do not prevent implementation planning completeness** |
| GO to Nashir Backend Slice 0 Planning Gate | **GO** |
| CONDITIONAL GO to Nashir SQL Schema Implementation Slice | **CONDITIONAL — after Backend Slice 0 Planning Gate approves migration PR** |
| SQL DDL implementation | **NO-GO (in this slice)** |
| Migrations | **NO-GO (in this slice)** |
| Backend routes | **NO-GO** |
| Auth middleware / RBAC implementation | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |
| Nashir SQL Schema Implementation Planning Fix Gate | **NOT REQUIRED** |

### Implementation plan confirmed decisions

| Decision | Confirmed |
|---|---|
| PostgreSQL is the DB engine | YES |
| Migration files live in marketing-os/docs/ | YES |
| RBAC seed is driven by src/rbac.js via db-seed.js | YES |
| role_permissions seed uses DELETE + re-INSERT (idempotent) | YES |
| Prompt templates (Patch 009) precede Creator Studio (Patch 010) | YES — W-SQL-R06 resolved |
| nashir_campaign_content_assets uses composite PK (campaign_content_id, asset_id) | YES |
| TTL partial indexes use enum predicates, not expires_at > now() | YES |
| nashir_assets SQL table name ≠ OpenAPI schema name Asset | YES — SQL = nashir_assets; OpenAPI = Asset |
| 33 V1-active Nashir permission codes added to rbac.js | YES |
| No destination service actor in V1 | YES |

### Next gate

**Nashir Backend Slice 0 Planning Gate**

That gate must:
- Formally approve the marketing-os migration PR structure (resolves B-SQL01).
- Select and document the production auth provider (replaces X-User-Id mock).
- Wire guards (authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId) to first Nashir routes.
- Define the TTL cleanup job mechanism (resolves B-SQL06).
- Name the vault service/API for secret_reference_name (resolves B-SQL07).
- Produce exact allowed files, forbidden files, verification commands, and rollback criteria.
- Not implement any code. Documentation-only planning gate.

Once Backend Slice 0 Planning Gate closes, the SQL Schema Implementation Slice may formally open with the plan defined in this document.
