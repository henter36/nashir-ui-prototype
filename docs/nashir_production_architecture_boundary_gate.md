# Nashir Production Architecture Boundary Gate

| Field | Value |
|---|---|
| Gate type | Production architecture and repository boundary planning gate |
| Status date | 2026-05-31 |
| Scope | Nashir production architecture boundary before any backend, database, API integration, auth, runtime, or repository migration work |
| Implementation approved | NO |
| Repository migration approved | NO |
| Backend / database / auth / API integration approved | NO |

---

## 1. Status and Scope

This is a planning and decision gate only.

**No implementation is approved by this document.**

**No repository migration is approved by this document.**

**No backend, database, auth, or API integration work is approved by this document.**

This gate must be resolved before any of the following can proceed:

- Backend implementation for Nashir.
- Database schema or migrations for Nashir.
- API integration from nashir-ui-prototype to any backend.
- Auth / RBAC implementation for Nashir.
- Repository migration or merging of nashir-ui-prototype into any other repository.
- Code copy from marketing-os into nashir-ui-prototype.
- Any runtime client or fetch integration in nashir-ui-prototype.

The scope is strictly: deciding the production architecture boundary and repository home for Nashir's backend work before that work begins.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Role | Status |
|---|---|---|
| `README.md` | Explicit constraints, current state, screen list, UI stabilization gate | Verified |
| `package.json` | Dependency inventory, script inventory | Verified |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1 contract v0.1.0, four slices: Products/Assets, Campaign Content, AI Readiness, Creator Studio | Verified |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | Type consumption planning, consumption boundary rules | Verified |
| `docs/screen_map.md` | 20 approved screens, mock-only, no backend | Verified |
| `docs/erd_reconciliation_model.md` | Conceptual ERD for Nashir entities, NO-GO for SQL | Verified |
| `docs/workspace_and_minimum_identity_decision.md` | V1 single-workspace-single-store boundary decision | Verified |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Generated type artifact, awareness only, not imported | Verified |

### Verified — henter36/marketing-os (local clone at ~/workspace/marketing-os)

| Source | Role | Status |
|---|---|---|
| `README.md` | Full repository status, verified sprints, NO-GO boundaries, DB-backed status | Verified |
| `package.json` | Node >=20, pg ^8.20.0, migration/seed/lint/test/verify scripts | Verified |
| `docs/source_of_truth_precedence_decision_record.md` | Conflict resolution order, non-authoritative sources list | Verified |
| `docs/db_backed_repository_architecture_contract.md` | Repository interface pattern, workspaceId handling, transaction policy | Verified |
| `docs/nashir_implementation_readiness_gate.md` | Nashir implementation preconditions, backend-only alignment path | Verified |
| `docs/nashir_backend_planning_contract_alignment_gate.md` | Nashir backend alignment gate requirements | Verified |
| `docs/marketing_os_v5_6_5_phase_0_1_erd.md` | Marketing OS V5.6.5 ERD (MediaAsset, MediaJob, BrandProfile entity model) | Verified — entity names differ from Nashir OpenAPI entities |

### Not reviewed — require a later slice

| Source | Reason |
|---|---|
| marketing-os `docs/marketing_os_consolidated_prd_expanded.md` | Long strategic document; flagged as non-authoritative per source-of-truth precedence record; defer to planning slice |
| marketing-os `docs/nashir_erd_patch_planning_gate.md` and related ERD patch docs | Require dedicated ERD Reconciliation Gate; cannot be resolved in this boundary gate |
| marketing-os full Nashir gate chain (100+ docs) | Require Nashir Backend Home Decision Slice to reconcile with nashir-ui-prototype state |

### Assumption flag

> **ASSUMPTION-1:** marketing-os is treating itself as the planned backend home for Nashir, based on the presence of 100+ Nashir-specific planning docs in `marketing-os/docs/`. This has not been formally approved in nashir-ui-prototype and constitutes an unresolved repository boundary. This assumption drives the recommendation in Section 6.

---

## 3. Current Nashir State

Verified facts from nashir-ui-prototype:

- **Runtime:** React 19 + Vite 8 UI prototype only.
- **Data:** Mock and seed data only, inside frontend JSX files. No persistence layer.
- **Routing:** Local screen state inside `src/App.jsx`. Not React Router.
- **Backend:** None. Explicitly forbidden per README.
- **API:** None. No fetch, axios, or HTTP client in any file.
- **Database:** None. No pg, no ORM, no migration tooling.
- **Auth / RBAC:** None. No authentication, no authorization, no session management.
- **AI generation:** None. All AI-related screens are local simulations only.
- **Publishing:** None. All publishing screens are local simulations only.
- **OpenAPI contract:** `docs/nashir_v1_openapi.yaml` v0.1.0, OpenAPI 3.1, 4 slices. Entities: workspace, product, asset, campaign-content, AI readiness, Creator Studio session/draft/transfer. Server URL is a placeholder (`https://api.example.invalid`).
- **Generated types:** `src/generated/creator-studio-openapi-types/index.d.ts` exists, reproducible, not imported by any UI file.
- **UI API integration:** Not approved. Blocked by type consumption gate (W-CONS-5).
- **Screens:** 20 active mock screens. 7 screens previously removed.
- **UI stabilization:** Complete per README and prototype_stabilization_closure_report.
- **Dependencies:** React, react-dom, lucide-react (runtime). openapi-typescript, vite, eslint, typescript (devDependencies only).
- **No backend dependencies:** No pg, no express, no node:http, no database driver.

---

## 4. Current Marketing OS State

Verified facts from henter36/marketing-os:

- **Classification:** Contract-first backend/governance repository. Phase 0/1 execution baseline.
- **Runtime:** Node >=20. In-memory store default for product routes.
- **Database:** pg ^8.20.0. DB-backed is Slice 0 (Workspace/Membership/RBAC read paths) and Brand Slice 1 (BrandProfileRepository, BrandVoiceRuleRepository repository-only, no HTTP routes switched).
- **Migrations:** Strict three-file migration order (base schema, patch 001, patch 002). Migration retry verification in CI.
- **OpenAPI:** `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` and patch 002. Separate from Nashir's `nashir_v1_openapi.yaml`. Entities differ.
- **ERD:** `docs/marketing_os_v5_6_5_phase_0_1_erd.md` covers Marketing OS entities (MediaJob, MediaAsset, MediaAssetVersion, ApprovalDecision, BrandProfile, BrandVoiceRule, etc.). Does not directly map to Nashir V1 OpenAPI entities.
- **Tests:** Node `--test` unit + integration suites. Sprint 0-4 verified. OpenAPI alignment tests present.
- **Verification scripts:** `verify:strict` runs verify-sprint0 + openapi:lint:strict + test + test:integration + db:seed + db:migrate:strict.
- **Nashir planning docs:** 100+ Nashir-specific gate/planning/status docs in `docs/`. The repo has been accumulating Nashir backend planning but no Nashir runtime/SQL/API implementation is approved.
- **prototype/ directory:** Static clickable prototype reference only. Not a source of truth for Nashir UI or backend contracts.
- **Production / Pilot:** NO-GO explicitly per README. Sprint 5 coding: NO-GO.
- **Gated boundaries:** Brand-only repository mode gated. All other HTTP/runtime product routes remain in-memory.
- **Source-of-truth precedence:** README > change log > verification reports > ERD/SQL/OpenAPI contracts > named planning docs > consolidated PRD (strategic input only).
- **Entity naming rules:** Do not create tables named GenerationJob, Asset, or Approval. Use MediaJob, MediaAsset, ApprovalDecision.
- **Frontend rule (from README):** "No frontend." marketing-os does not serve the Nashir UI as a production frontend.
- **Nashir static UI surface:** marketing-os merged a standalone static read-only UI slice only (not routed or served by the backend).

---

## 5. Repository Boundary Options

### Option A — Keep nashir-ui-prototype as UI-only; use marketing-os as backend/governance base (after reconciliation)

**Pros:**
- marketing-os already contains 100+ Nashir-specific planning docs, ERD patches, evidence lifecycle gates, campaign DB gates, RBAC gates, and backend contract alignment gates. A governance context already exists there.
- marketing-os has a verified Node backend baseline (Sprint 0–4), pg adapter, repository pattern, migration tooling, OpenAPI lint, and test/integration test infrastructure.
- Keeps nashir-ui-prototype clean as a UI/prototype/contract-consumer repository. Clear separation of concerns.
- Avoids creating a third repository before reconciliation is complete.
- The contract-first discipline and verification scripts in marketing-os can be reused as an approach (not as code).

**Risks:**
- marketing-os entity model (MediaJob, MediaAsset, BrandProfile, etc.) does not directly map to Nashir V1 OpenAPI entities (Product, Asset, CampaignContent, CreatorStudioSession). ERD reconciliation is required.
- marketing-os OpenAPI contract differs from nashir_v1_openapi.yaml. Two conflicting OpenAPI contracts exist across the repos. Source-of-truth must be resolved.
- marketing-os is explicitly NO-GO for Production and Pilot. Nashir's production readiness is therefore still blocked even if backend work continues there.
- Risk of entity naming collisions or governance overhead from two distinct domain models in one repo.
- marketing-os README states "No frontend." UI contract alignment must be explicit, not assumed.

**Conditions for this option:**
- Nashir ERD Reconciliation Gate must reconcile marketing-os entity model with Nashir V1 OpenAPI entities before SQL begins.
- Nashir OpenAPI Source-of-Truth Gate must decide which OpenAPI file governs Nashir V1.
- Formal backend home decision must be recorded in a dedicated slice.
- No code copy from marketing-os prototype/ or existing marketing-os routes.
- No direct SQL copy from marketing-os schema files without ERD alignment.

---

### Option B — Create a separate nashir-backend repository

**Pros:**
- Clean separation: nashir-ui-prototype (frontend/contract consumer), marketing-os (Marketing OS governance), nashir-backend (Nashir production backend).
- No entity naming conflicts. Nashir can define its own entity model from the Nashir V1 OpenAPI without inheriting Marketing OS entity constraints.
- Avoids coupling Nashir's production readiness to marketing-os's NO-GO/Pilot/Production gate.
- Cleaner CI/CD, test, and deployment boundaries.

**Risks:**
- Creates a third repository before the entity model, OpenAPI source-of-truth, auth model, and workspace identity are decided. Risk of duplication and divergence.
- Duplicates governance overhead: verification scripts, migration tooling, repository patterns, OpenAPI lint, and test strategies must be set up from scratch.
- marketing-os's 100+ Nashir planning docs become orphaned across repos unless mirrored or referenced.
- Adds coordination overhead before any single vertical slice is implemented.

**Conditions for this option:**
- Only viable after: ERD Reconciliation Gate, OpenAPI Source-of-Truth Gate, Auth/RBAC Gate, and a formal Backend Home Decision Slice.
- Requires a migration plan for Nashir planning docs currently in marketing-os.
- Requires explicit governance bootstrap plan.

---

### Option C — Merge Nashir backend work into nashir-ui-prototype

**Pros:**
- Single repository. No cross-repo coordination during early implementation.
- Simpler local dev setup for a small team.

**Risks:**
- **STRONGLY DISCOURAGED.** Mixing a React/Vite UI prototype with a Node.js/pg backend in a single repository violates deployment, build, and test boundary assumptions.
- nashir-ui-prototype's `package.json` contains frontend dependencies only. Adding pg, express, node server, migration scripts would fundamentally alter the repository's purpose.
- UI prototype and production backend have different build, lint, test, and deployment toolchains. They should not share a `package.json`.
- Increases blast radius of any backend-side change on the UI prototype (and vice versa).
- Violates the explicit constraint in nashir-ui-prototype README: no backend in this repo.
- Creates a deployment problem: Vite builds a static frontend; a Node backend serves API routes. These are different processes.
- Makes it harder to separate UI freeze/gate logic from backend gate logic.
- Precedent: marketing-os explicitly says "No frontend" as a hard constraint in its README.

**Expected recommendation:** REJECT.

---

### Option D — Use marketing-os as reference only; do not use it as implementation base

**Pros:**
- Eliminates entity model conflict risk entirely. Nashir backend starts fresh from Nashir V1 OpenAPI.
- No dependency on marketing-os's production/pilot NO-GO state.
- Governance patterns (repository pattern, verification scripts, migration approach, OpenAPI lint, test strategy) can be studied from marketing-os without importing code.

**Risks:**
- Loses the benefit of the 100+ Nashir planning docs already in marketing-os.
- Must still create a backend home (either marketing-os or a new repo).
- Does not resolve the fundamental question of where the backend lives.
- "Reference only" is not a complete answer to the backend home question; it only answers what cannot be copied.

**Conditions for this option:**
- Valid as a constraint modifier for any of Option A or Option B, not a standalone option.
- Combined with Option A: marketing-os is the backend home but all implementation starts from Nashir V1 OpenAPI contracts, not from marketing-os runtime code.
- Combined with Option B: a new nashir-backend repo starts from Nashir V1 OpenAPI, using marketing-os only as a governance and pattern reference.

---

## 6. Recommended Repository Boundary

**Recommendation:**

1. **nashir-ui-prototype** remains the UI prototype, frontend contract consumer, and OpenAPI artifact host. It must not receive any backend code, database migrations, API calls, auth implementation, runtime dependencies (pg, express, etc.), or server-side logic.

2. **marketing-os** is the preferred backend and governance candidate for Nashir backend work, but only after ERD reconciliation and OpenAPI source-of-truth resolution. The 100+ Nashir-specific planning gates already present in marketing-os represent significant sunk governance context. Option A is the recommended starting point.

3. **No direct code copy from marketing-os** into nashir-ui-prototype or any other Nashir backend target. Entity names, routes, and SQL must derive from Nashir V1 OpenAPI entities and the Nashir ERD reconciliation model, not from Marketing OS entity contracts.

4. **marketing-os prototype/ is not a source of truth** for any Nashir UI or backend implementation. It is a static reference only.

5. **The final decision between Option A (marketing-os as backend home) and Option B (new nashir-backend repo)** must be made in a dedicated Nashir Backend Home Decision Slice. This boundary gate does not make that final decision; it documents the options and preconditions.

6. **UI API integration remains blocked** until backend home, ERD, OpenAPI source-of-truth, and auth model are resolved. No fetch or HTTP client may be added to nashir-ui-prototype before these gates close.

---

## 7. Technology Decision Status

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 19 + Vite 8 | Accepted for prototype UI and frontend contract consumer role |
| OpenAPI | 3.1 (nashir_v1_openapi.yaml v0.1.0) | Accepted for current Nashir UI contract artifact |
| Generated types | openapi-typescript ^7.13.0 | Accepted for type artifact only; not consumed at runtime |
| Backend runtime | Undecided | Not approved. Node.js is a candidate (consistent with marketing-os) but not selected |
| Database engine | Undecided | Not approved. PostgreSQL is a strong candidate (marketing-os uses pg ^8.20.0) but not approved for Nashir until ERD/SQL gate |
| Auth / RBAC | Undecided | Not approved. Candidate patterns may be studied from marketing-os (AuthGuard, WorkspaceContextGuard, MembershipCheck, PermissionGuard) but not implemented |
| Workflow / AI runtime | Undecided | Not approved. No AI execution may occur |
| Publishing integrations | Undecided | Not approved. No external publishing may occur |
| Observability / audit | Undecided | Not approved. AuditLog pattern from marketing-os may be referenced; not implemented |
| Test strategy | Undecided | Node `--test` + integration tests in marketing-os are a reference pattern; Nashir test strategy requires its own gate |
| Migration tooling | Undecided | marketing-os db-migrate scripts are a reference pattern; Nashir migrations require ERD + SQL gate |

---

## 8. Database Boundary

The following are hard NO-GO until explicitly approved by subsequent gates:

- Do not create Nashir database tables.
- Do not write Nashir SQL migrations.
- Do not assume the Nashir ERD is final. `docs/erd_reconciliation_model.md` is a conceptual review document, not an approved SQL schema.
- Do not copy marketing-os SQL schema files as a starting point for Nashir.

Required before any Nashir SQL work begins:

1. **Nashir ERD Reconciliation Gate** — must align `docs/erd_reconciliation_model.md` Nashir entity concepts with `nashir_v1_openapi.yaml` entity contracts. Must resolve entity naming differences between Nashir V1 (Product, Asset, CampaignContent, CreatorStudioSession) and Marketing OS (MediaAsset, MediaJob, BrandProfile, ApprovalDecision).
2. **Identity and ownership decisions** — workspace, store_profile, product, asset, campaign_content, creator_studio_session, prompt_template, workflow_definition, model_route, audit_event, publishing ownership must be explicitly mapped to SQL tables.
3. **Tenant isolation decision** — workspaceId scoping at the repository layer must be confirmed before any schema is written.

**PostgreSQL** may be recommended as the database candidate (marketing-os precedent, pg ^8.20.0 already verified), but this is a direction signal only. It is not approved for Nashir until the ERD/SQL gate explicitly approves it.

---

## 9. OpenAPI Ownership Boundary

**Current situation (verified):**

- nashir-ui-prototype owns `docs/nashir_v1_openapi.yaml` v0.1.0 (OpenAPI 3.1, 4 slices, Nashir-specific entities).
- marketing-os owns `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` (Marketing OS entities, separate domain model).
- These are two different contracts for two different domain models. They should not be merged without a formal reconciliation.

**Decision on OpenAPI ownership:**

Keep `docs/nashir_v1_openapi.yaml` in nashir-ui-prototype as the current Nashir UI contract artifact until the backend home is decided.

Do not fork or duplicate the contract across repositories without a formal source-of-truth decision.

Once the backend home is decided (Option A or B), an **OpenAPI Source-of-Truth Gate** must decide:

- Does nashir-ui-prototype remain the OpenAPI source-of-truth (frontend-driven contract)?
- Does the backend repository become the OpenAPI source-of-truth (backend-driven contract)?
- Does a shared contract registry or monorepo approach apply?

Until that gate closes:

- nashir-ui-prototype generates types from its own OpenAPI file.
- No backend is expected to implement nashir_v1_openapi.yaml endpoints.
- No API client is generated or used by the UI.
- The OpenAPI file is a UI planning and type generation artifact only.

---

## 10. Marketing OS Reuse Boundary

| Marketing OS Artifact | Reuse Classification | Notes |
|---|---|---|
| Governance gate model (planning/review/acceptance gate discipline) | Reuse as-is (approach only) | Adopt the gate discipline pattern; do not copy document content |
| Verification script approach (verify:strict running lint + test + integration + migrate) | Reuse as-is (approach only) | Adopt the pattern; write Nashir-specific scripts from scratch |
| Repository pattern (WorkspaceRepository, MembershipRepository) | Reuse after reconciliation | Adapt to Nashir entity model after ERD gate; do not copy marketing-os code directly |
| pg / migration approach | Reuse after reconciliation | PostgreSQL is a candidate; migration scripts must be Nashir-specific; do not copy marketing-os SQL |
| RBAC / tenant isolation concepts (AuthGuard, WorkspaceContextGuard, MembershipCheck, PermissionGuard, workspaceId enforcement) | Reference only | Study the pattern; implement from Nashir-specific contracts after Auth/RBAC gate |
| OpenAPI lint approach | Reuse after reconciliation | openapi-lint script approach can be adapted; the Nashir OpenAPI is a separate contract |
| Test strategy (Node --test, unit + integration suites) | Reference only | Adopt the testing discipline; Nashir test cases must match Nashir contracts |
| Source-of-truth precedence model | Reuse as-is | Apply the same precedence hierarchy to nashir-ui-prototype and the future Nashir backend repo |
| DB-backed architecture contract (repository interface, workspaceId mandatory, transaction policy) | Reuse after reconciliation | Principles apply to Nashir backend; adapt to Nashir entities |
| prototype/ directory | Do not reuse | Static reference only; not source of truth for Nashir UI or backend |
| marketing-os entity names (MediaJob, MediaAsset, BrandProfile, BrandVoiceRule, ApprovalDecision) | Do not reuse | These are Marketing OS entities. Nashir uses Product, Asset, CampaignContent, CreatorStudioSession. Do not import Marketing OS entity names into Nashir backend without explicit ERD reconciliation decision |
| marketing-os routes and store layers | Do not reuse | In-memory product routes are Marketing OS domain logic; not applicable to Nashir V1 domain |
| marketing-os OpenAPI contract | Do not reuse | Different domain model. Nashir V1 OpenAPI is the Nashir contract authority |
| existing brand/product/template entities in marketing-os | Do not reuse | Marketing OS entities do not map directly to Nashir entities. Must reconcile at ERD gate |

---

## 11. Production Readiness Gaps

The following gaps block Nashir production readiness. None may be filled without explicit gate approval.

| Gap | Description |
|---|---|
| Backend home unresolved | No approved decision on which repository hosts the Nashir backend |
| ERD missing for Nashir | `docs/erd_reconciliation_model.md` is a conceptual model; no approved SQL schema exists for Nashir |
| OpenAPI source-of-truth unresolved | nashir_v1_openapi.yaml is a UI artifact; no backend has been designated to implement it |
| Database engine not approved | PostgreSQL is a candidate; not yet approved for Nashir |
| Entity naming reconciliation required | Nashir V1 entities differ from Marketing OS entities; ERD alignment required before SQL |
| Auth / RBAC model missing | No Nashir-specific auth design exists; marketing-os RBAC pattern requires adaptation |
| Tenant / workspace model not mapped to SQL | Workspace model documented conceptually; not yet translated to Nashir SQL schema |
| Audit / event model missing | AuditLog pattern referenced from marketing-os; no Nashir audit schema approved |
| AI execution boundaries missing | All AI-related features are mock; no AI execution contract, provider binding, or cost policy implemented |
| Publishing integration boundaries missing | All publishing features are mock; no publishing connector, channel, or scheduling contract |
| Secrets / keys handling missing | SecretsAndKeysPage is a UI mock; no vault, environment config, or secrets management designed for Nashir |
| Environment / config strategy missing | No environment variable strategy, .env.example, or config validation for Nashir backend |
| Test strategy not mapped to Nashir | No Nashir-specific test plan; marketing-os test approach is a reference only |
| Data migration from mock UI to backend not defined | UI mock data structures do not directly map to backend persistence schema; migration path not planned |
| UI API integration not approved | No fetch or API client may be added until backend home + ERD + OpenAPI source-of-truth are resolved |
| CI / CD pipeline missing for Nashir backend | No GitHub Actions workflow for Nashir backend; marketing-os CI is for Marketing OS only |

---

## 12. Recommended Next Gates

Ranked from most to least urgent:

| Priority | Gate | Rationale |
|---:|---|---|
| 1 | **Nashir Backend Home Decision Slice** | Unblocks everything else. Must formally decide between Option A (marketing-os) and Option B (new nashir-backend repo). Cannot begin any backend implementation without this decision. |
| 2 | **Nashir ERD Reconciliation Gate** | Translates `docs/erd_reconciliation_model.md` into an approved Nashir SQL schema. Must reconcile Nashir V1 OpenAPI entities with any entity naming constraints from the chosen backend home. NO-GO for SQL migrations without this gate. |
| 3 | **Nashir OpenAPI Source-of-Truth Gate** | Decides whether nashir_v1_openapi.yaml remains UI-owned or moves to the backend home. Resolves dual-contract risk. Required before any backend implements Nashir V1 API endpoints. |
| 4 | **Nashir Auth/RBAC and Workspace Identity Gate** | Designs Nashir-specific auth model, RBAC permission matrix, workspace/tenant isolation, and session handling. Required before any authenticated route can be implemented. |
| 5 | **Nashir Backend Vertical Slice 0 Planning** | Plans the first implementable Nashir backend slice (candidate: Workspace + StoreProfile repository read path, mirroring marketing-os Slice 0 discipline). Must name allowed files, forbidden files, verification commands, and rollback criteria. |
| 6 | **Nashir UI API Integration Planning Gate** | Plans how nashir-ui-prototype will call the Nashir V1 API once a backend exists. Must not be attempted before gates 1–5 produce approved outputs. Blocked until backend home + ERD + OpenAPI source-of-truth + auth model are resolved. |

**UI API integration must not proceed before gates 1, 2, and 3 close.**

---

## 13. Short-Term / Long-Term Consequences

| Scenario | Short-term consequence | Long-term consequence |
|---|---|---|
| Continue UI work without architecture decision | UI mock data, screen interactions, and routing continue to stabilize with no backend alignment | UI drift: mock data structures diverge from future backend schema; expensive retrofit to align UI state with real API responses |
| Copy marketing-os routes/entities blindly into Nashir backend | Quick start, but Marketing OS entities (MediaJob, BrandProfile) conflict with Nashir V1 OpenAPI entities (Product, Asset) immediately | Entity / route / auth conflicts at integration time; either marketing-os or Nashir V1 OpenAPI must be rewritten to reconcile |
| Put Nashir backend inside nashir-ui-prototype | Avoids a third repository for a short period | Mixed build toolchains, broken deployment pipeline, impossible to CI-gate UI and backend independently, violates explicit README constraint |
| Create a separate nashir-backend repo too early (before ERD/OpenAPI gates) | Clean separation but governance starts from zero | Duplicated governance overhead; 100+ Nashir planning docs in marketing-os become orphaned without a migration plan; reconciliation work increases |
| Use marketing-os after reconciliation (Option A, controlled path) | Requires ERD + OpenAPI source-of-truth gates first; slightly slower start | Fastest controlled path to a verified Nashir backend if contract fit is confirmed at ERD and OpenAPI gates; leverages existing governance discipline |
| Ignore the OpenAPI source-of-truth gap | UI continues to use nashir_v1_openapi.yaml as types; appears fine for now | Backend eventually implements a different API surface; UI integration requires a full re-alignment sprint |

---

## 14. Decision

### Final decision

| Decision area | Status |
|---|---|
| GO to Nashir Backend Home Decision Slice | **GO** |
| Backend implementation | **NO-GO** |
| Database implementation (SQL, migrations, schema) | **NO-GO** |
| UI API integration (fetch, HTTP client, runtime client) | **NO-GO** |
| marketing-os code migration or copy to any Nashir target | **NO-GO** |
| marketing-os prototype/ as source of truth | **NO-GO** |
| Pilot readiness | **NO-GO** |
| Production readiness | **NO-GO** |
| Repository migration of nashir-ui-prototype | **NO-GO** |
| Auth / RBAC implementation | **NO-GO** |
| AI execution or publishing execution | **NO-GO** |

### What remains blocked

All backend, database, auth, API integration, AI execution, publishing execution, repository migration, and UI API integration work remains blocked until the Nashir Backend Home Decision Slice produces explicit allowed files, forbidden files, verification commands, and rollback criteria.

### Next gate

**Nashir Backend Home Decision Slice**

That slice must decide:

- Option A (marketing-os as Nashir backend home after reconciliation) or Option B (new nashir-backend repository).
- Formal allowed files and forbidden files for the first backend implementation slice.
- Which OpenAPI file governs Nashir V1 backend routes.
- Whether ERD reconciliation precedes or runs in parallel with backend home formalization.

Until that slice closes and is approved, no implementation work of any kind may begin for Nashir's backend, database, auth, or API integration.
