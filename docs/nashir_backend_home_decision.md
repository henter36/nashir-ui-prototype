# Nashir Backend Home Decision

| Field | Value |
|---|---|
| Gate type | Backend home decision — planning/documentation only |
| Status date | 2026-05-31 |
| Scope | Decides where Nashir's production backend lives before any ERD, SQL, OpenAPI source-of-truth, API integration, auth/RBAC, runtime, or backend implementation work begins |
| Prerequisite gate | `docs/nashir_production_architecture_boundary_gate.md` — merged, GO |
| Implementation approved | NO |
| Repository migration approved | NO |
| Backend / database / auth / API integration approved | NO |

---

## 1. Status and Scope

This is a backend home decision document only.

**No implementation is approved by this document.**

**No repository migration is performed in this slice.**

**No backend, database, auth, or API integration work is approved.**

This document answers one question:

> Where should Nashir's production backend live?

It does not authorize any of the following:

- Writing backend code in any repository.
- Creating Nashir database schemas or migrations.
- Adding API routes, runtime logic, or server configuration.
- Importing generated types into UI files.
- Adding auth/RBAC implementation.
- Copying code from marketing-os.
- Modifying marketing-os from this repository.
- Connecting nashir-ui-prototype to any live API.
- Moving to Production or Pilot.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; explicit constraints confirmed |
| `package.json` | Frontend-only deps; React 19, Vite 8, lucide-react (runtime); no pg, no express |
| `docs/nashir_production_architecture_boundary_gate.md` | Boundary gate merged; GO to this Backend Home Decision Slice confirmed |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1 v0.1.0; placeholder server URL; four slices; Nashir-specific entity model |
| `docs/screen_map.md` | 20 active mock screens; all mock-only; no backend |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | Type consumption planning; W-CONS-5 blocks API integration |
| `docs/erd_reconciliation_model.md` | Conceptual Nashir ERD; NO-GO for SQL; entity candidates identified |
| `docs/workspace_and_minimum_identity_decision.md` | V1 single-workspace-single-store boundary |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Generated artifact; awareness only; not imported by UI |

### Verified — henter36/marketing-os (local sibling clone)

| Source | Finding |
|---|---|
| `README.md` | Contract-first backend; Node >=20; Sprint 0–4 verified; pg dependency; Pilot/Production NO-GO; 100+ Nashir planning docs present |
| `package.json` | Node >=20; pg ^8.20.0; migration/seed/lint/test/integration-test/verify scripts; no frontend deps |
| `docs/source_of_truth_precedence_decision_record.md` | Precedence hierarchy defined; consolidated PRD is strategic input only; non-authoritative sources listed |
| `docs/db_backed_repository_architecture_contract.md` | Repository interface pattern; mandatory workspaceId; transaction policy; repository boundary definitions |
| `docs/nashir_implementation_readiness_gate.md` | Nashir implementation preconditions defined; backend-only alignment path recommended; no implementation approved |
| `docs/nashir_backend_planning_contract_alignment_gate.md` | Backend alignment gate requirements; no implementation approved |
| `docs/marketing_os_v5_6_5_phase_0_1_erd.md` | Marketing OS entity model: MediaJob, MediaAsset, MediaAssetVersion, ApprovalDecision, BrandProfile, BrandVoiceRule — distinct from Nashir V1 entities |

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os `docs/marketing_os_consolidated_prd_expanded.md` | Flagged as non-authoritative per source-of-truth precedence record; strategic input only; defer |
| marketing-os 100+ nashir_* gate chain in full | Cannot be fully reconciled in a planning boundary document; require dedicated Marketing OS Reconciliation Gate |
| marketing-os SQL schema files (`marketing_os_v5_6_5_phase_0_1_schema.sql`, patch files) | Require ERD Reconciliation Gate before any SQL mapping can be evaluated |

### Assumption flags

> **ASSUMPTION-A:** marketing-os is the de-facto accumulated backend/governance context for Nashir based on 100+ Nashir-specific planning docs in its `docs/` directory. No formal handoff document from nashir-ui-prototype to marketing-os has been written. This is the primary rationale for selecting marketing-os as the candidate.

> **ASSUMPTION-B:** marketing-os entity naming constraints (do not use GenerationJob, Asset, Approval; use MediaJob, MediaAsset, ApprovalDecision) apply to the Marketing OS domain model. Nashir V1 uses different entity names (Product, Asset, CampaignContent). Whether Nashir must adopt Marketing OS naming or can maintain its own naming in the same repo requires the ERD Reconciliation Gate.

---

## 3. Decision Question

**Where should Nashir's production backend live?**

Candidate answers:

| Option | Description |
|---|---|
| A | marketing-os — use as backend/governance candidate after reconciliation |
| B | nashir-backend — create a new dedicated Nashir backend repository |
| C | nashir-ui-prototype — merge backend work here |
| D | Defer — do not decide now, block all backend work until a later slice |

---

## 4. Evaluation Criteria

Each option is evaluated against the following dimensions:

| Dimension | Weight |
|---|---|
| Contract-first governance | High |
| Existing backend baseline | High |
| Entity model compatibility | High |
| OpenAPI source-of-truth clarity | High |
| ERD/SQL ownership clarity | High |
| Auth/RBAC/workspace ownership | High |
| Deployment separation | Medium |
| Repository complexity | Medium |
| Speed to controlled path | Medium |
| Risk of UI/backend coupling | High |
| Risk of incompatible contract copying | High |
| AI/runtime workflow ownership | Medium |

---

## 5. Option A — Use marketing-os as Backend Home Candidate

### Pros

- **100+ Nashir planning docs already present.** marketing-os/docs contains extensive Nashir-specific gate documents, ERD patch proposals, RBAC gate documents, evidence lifecycle gates, campaign DB persistence gates, backend contract alignment gates, and status reports. This sunk governance context is large and would need to be migrated or duplicated if a separate repo is created.
- **Verified backend baseline.** Sprint 0–4 have passed strict verification. pg adapter, repository pattern, migration order, OpenAPI lint, test/integration test suites, and verification scripts are all operational.
- **Contract-first discipline proven.** marketing-os's gate-based governance model (planning → review → acceptance → implementation → verification) matches the discipline needed for Nashir backend slices.
- **Repository pattern established.** WorkspaceRepository, MembershipRepository, and tenancy enforcement patterns (workspaceId mandatory, no body workspace_id trust) are already verified and can be adapted for Nashir.
- **pg / migration tooling active.** db:migrate, db:seed, db:migrate:strict, and CI migration retry verification are working infrastructure.
- **Source-of-truth precedence model defined.** Conflict resolution hierarchy exists and is actionable.
- **No third repository required.** Fewer active repositories reduces coordination overhead at this stage.

### Risks

- **Entity naming conflict.** marketing-os enforces specific forbidden entity names (GenerationJob, Asset, Approval) and mandates use of MediaJob, MediaAsset, ApprovalDecision. Nashir V1 OpenAPI uses Product, Asset, CampaignContent, CreatorStudioSession — some names conflict. **This must be resolved at the ERD Reconciliation Gate before any SQL is written.**
- **Two OpenAPI contracts.** marketing-os owns `marketing_os_v5_6_5_phase_0_1_openapi.yaml`; nashir-ui-prototype owns `nashir_v1_openapi.yaml`. Both must coexist or be reconciled. A source-of-truth decision is required before backend routes are written.
- **marketing-os Pilot/Production is NO-GO.** Nashir inherits this NO-GO boundary until marketing-os's gate constraints are lifted. Nashir cannot achieve production readiness independently if it lives inside a NO-GO repository.
- **Risk of copying incompatible contracts.** marketing-os routes, store layers, and in-memory store logic are Marketing OS domain code. Direct copy into Nashir backend slices would import incompatible entity semantics.
- **governance overhead.** Nashir backend slices must follow marketing-os's gate discipline. This is correct, but it means every Nashir implementation slice must be reviewed against marketing-os's existing boundaries.
- **README constraint.** marketing-os README states "No frontend." Nashir UI integration events must not be mistakenly treated as marketing-os frontend work.

### Required conditions before any implementation in marketing-os

1. Nashir Marketing OS Reconciliation Gate must verify entity naming compatibility.
2. Nashir ERD Reconciliation Gate must produce an approved Nashir SQL entity map that respects marketing-os entity naming rules.
3. Nashir OpenAPI Source-of-Truth Gate must decide whether nashir_v1_openapi.yaml moves to marketing-os or remains in nashir-ui-prototype.
4. Nashir Auth/RBAC and Workspace Identity Gate must confirm how Nashir workspace/membership/RBAC maps to marketing-os's existing patterns.
5. Nashir Backend Slice 0 Planning must name exact allowed files, forbidden files, verification commands, and rollback criteria before any file is touched in marketing-os.

### What can be reused from marketing-os (approach only, not code copy)

- Gate discipline model.
- verify:strict script pattern.
- Repository interface approach (narrow methods, no raw SQL in routes).
- pg connection pool lifecycle approach.
- Mandatory workspaceId parameter pattern.
- Idempotency key + If-Match concurrency pattern (as defined in nashir_v1_openapi.yaml).
- Migration order approach (strict sequential).
- OpenAPI lint approach.
- Test + integration test separation approach.

### What cannot be assumed

- marketing-os SQL schema files are not Nashir schema. Do not copy.
- marketing-os routes are not Nashir routes. Do not copy.
- marketing-os entity names are Marketing OS entities. Do not assume Nashir entities are named identically.
- marketing-os is not production-approved. Nashir backend work in marketing-os inherits the same NO-GO gate.
- marketing-os prototype/ is not Nashir UI. Do not reference.

---

## 6. Option B — Create New nashir-backend Repository

### Pros

- **Clean entity model.** Nashir backend starts entirely from nashir_v1_openapi.yaml without inheriting any Marketing OS entity constraints or naming rules.
- **Independent production path.** Nashir backend can achieve its own production readiness gate independently of marketing-os's NO-GO boundaries.
- **Deployment clarity.** A dedicated backend repository has clear CI/CD, test, migration, and deployment boundaries from day one.
- **No entity collision risk.** Nashir entities (Product, Asset, CampaignContent, CreatorStudioSession) can be named exactly as defined in nashir_v1_openapi.yaml without conflict.
- **Cleaner OpenAPI ownership.** nashir_v1_openapi.yaml can be moved to the backend repo as the canonical contract authority, eliminating the dual-contract problem.

### Risks

- **Governance start from zero.** All verification scripts, migration tooling, repository patterns, OpenAPI lint, test strategy, and gate documentation must be bootstrapped from scratch. This is high overhead.
- **100+ Nashir planning docs in marketing-os become partially orphaned.** If backend work moves to a new repo, the planning context in marketing-os must be migrated or cross-referenced. This is an ongoing maintenance cost.
- **Premature repo creation before reconciliation.** Creating a third repository before entity model, auth model, workspace identity, and API surface are defined risks early drift and wasted structure.
- **Contract duplication before source-of-truth decision.** Without the OpenAPI source-of-truth gate, nashir_v1_openapi.yaml could exist in both nashir-ui-prototype and nashir-backend, creating divergence.
- **Coordination overhead.** Three active repositories (nashir-ui-prototype, marketing-os, nashir-backend) require coordinated branching, versioning, and cross-repo dependency management earlier than necessary.

### When Option B is better than Option A

Option B becomes the preferred choice if:

- The Nashir Marketing OS Reconciliation Gate finds that marketing-os entity naming rules are incompatible with Nashir V1 OpenAPI entities and reconciliation is not feasible.
- marketing-os's existing governance infrastructure cannot be extended to cover Nashir domain boundaries without compromising Marketing OS integrity.
- The Nashir production path requires a separate repository to achieve an independent Pilot/Production approval gate.

Until the Nashir Marketing OS Reconciliation Gate produces a formal finding, Option B remains deferred.

---

## 7. Option C — Put Backend inside nashir-ui-prototype

### Pros

- Single repository during early development.
- No cross-repo coordination.
- Simpler local dev for a small team during initial phases.

### Risks and reasons to reject

- **REJECT.** This option is strongly discouraged and should not be selected.

Specific reasons:

1. **Deployment boundary violation.** Vite produces a static frontend build. A Node.js/pg backend is a server process. They cannot share a `package.json`, build pipeline, or deployment artifact cleanly.
2. **Build toolchain conflict.** Adding pg, express, node server, migration scripts, and integration test suites to a Vite/React project creates an incoherent dependency graph that breaks `npm run build`, `npm run lint`, and `npm run generate:creator-studio-types`.
3. **Explicit prohibition.** nashir-ui-prototype README states: no backend, no API, no database. Adding a backend reverses this explicit constraint.
4. **Auth and security boundary collapse.** A backend in the UI repo means API keys, database credentials, JWT secrets, and server-side session logic exist alongside frontend React code. This is a security boundary failure.
5. **Test boundary collapse.** Frontend tests (vitest/jsdom) and backend tests (Node --test, pg integration) cannot share the same test runner configuration cleanly.
6. **Future migration cost.** Any backend work started in the UI repo must be extracted before production. This migration cost grows with every implementation slice.
7. **Precedent.** marketing-os README states "No frontend." nashir-ui-prototype README states "No backend." These are deliberate mirror constraints. Violating one violates the design discipline of both.

**Decision: NOT SELECTED. Do not place Nashir backend inside nashir-ui-prototype under any circumstances.**

---

## 8. Option D — Defer Backend Home Decision

### When deferral is acceptable

Deferral would be acceptable if:

- No backend planning work depends on knowing the backend home.
- The UI prototype phase is not yet complete and no gate is blocked.
- A discovery event (e.g., a major entity model conflict) requires more investigation before a selection can be made.

None of these conditions apply. UI stabilization is complete. The production architecture boundary gate has closed. Continuing without a backend home decision creates the following risks:

### Risks of deferring

- **UI drift.** Future UI mock data structures may diverge further from any backend entity model, increasing retrofit cost.
- **Planning doc accumulation without a home.** New Nashir backend planning slices cannot be assigned to a repository, creating governance ambiguity.
- **Blocked follow-up gates.** ERD Reconciliation, OpenAPI Source-of-Truth, Auth/RBAC, and Backend Slice 0 Planning all require a backend home to be resolved first. Deferring blocks all of them.
- **Developer confusion.** Without a declared backend home, contributors may start backend experiments in any available repo (most likely marketing-os or nashir-ui-prototype), creating unauthorized implementation drift.

### What remains blocked if deferred

All gates listed in Section 12 remain blocked. No backend, database, auth, API integration, or production work can proceed. Deferral is not a safe neutral state; it blocks progress on all implementation gates.

**Decision: Deferral is not recommended. The decision must be made now.**

---

## 9. Recommended Decision

**Recommendation:**

1. **nashir-ui-prototype** is and remains the UI prototype, OpenAPI artifact host, and frontend contract consumer. It must not receive backend code, database migrations, server-side logic, or runtime dependencies.

2. **marketing-os is selected as the preferred backend/governance candidate** for Nashir backend work, subject to reconciliation. The 100+ Nashir planning gates accumulated in marketing-os represent the most directly usable governance context available. Governance discipline, verification patterns, repository structure, and contract-first approach are already operational.

3. **marketing-os is not automatically production-approved for Nashir.** Selecting it as candidate does not lift its existing NO-GO boundaries. It does not mean backend implementation can begin. It does not approve copying marketing-os code into Nashir backend slices.

4. **New nashir-backend repository is deferred**, not permanently rejected. If the Nashir Marketing OS Reconciliation Gate produces a finding that marketing-os is incompatible with Nashir's entity model, a separate nashir-backend repository must be created at that point.

5. **No backend implementation until ERD, OpenAPI source-of-truth, auth/RBAC, and workspace identity gates close.** Selecting a backend home is necessary but not sufficient to start implementation.

---

## 10. Backend Home Decision

| Repository | Status | Conditions |
|---|---|---|
| **marketing-os** | **SELECTED AS CANDIDATE** | After Nashir Marketing OS Reconciliation Gate, ERD Reconciliation Gate, OpenAPI Source-of-Truth Gate, and Auth/RBAC Gate confirm compatibility |
| **nashir-backend (new repo)** | **DEFERRED** | Remains an option if marketing-os reconciliation fails or entity model incompatibility is confirmed at the Reconciliation Gate |
| **nashir-ui-prototype** | **NOT SELECTED** | Hard rejection. Backend must not live here under any circumstances |

---

## 11. Consequences of Decision

### Short-term

| Item | Consequence |
|---|---|
| Future Nashir backend planning docs | Should accumulate in marketing-os/docs/ under Nashir-prefixed gate names, consistent with the existing 100+ Nashir docs already there |
| ERD reconciliation | Should occur in marketing-os, aligning the Nashir conceptual ERD (nashir-ui-prototype/docs/erd_reconciliation_model.md) with marketing-os entity naming rules |
| OpenAPI source-of-truth | nashir_v1_openapi.yaml remains in nashir-ui-prototype as UI contract artifact until OpenAPI Source-of-Truth Gate decides whether it moves to marketing-os or coexists |
| nashir-ui-prototype | Continues as frontend/prototype/contract-consumer only; no change to its scope |
| Code copy | No code may be copied from marketing-os into any Nashir backend slice without explicit gate approval |
| marketing-os prototype/ | Remains static reference only; not used as Nashir UI or backend source |

### Long-term

| Boundary | Consequence of selecting marketing-os |
|---|---|
| Deployment | Nashir backend routes, migrations, and API will deploy from marketing-os; nashir-ui-prototype deploys as a static frontend only |
| Testing | Nashir backend tests follow marketing-os's Node --test + integration test pattern; frontend tests stay in nashir-ui-prototype |
| Migration ownership | Nashir SQL migrations live in marketing-os/scripts alongside existing marketing-os migrations; strict migration ordering must cover both domains |
| Security / auth ownership | Nashir RBAC, workspace guards, and session management live in marketing-os, adapting existing AuthGuard / WorkspaceContextGuard / MembershipCheck / PermissionGuard patterns |
| Generated types and client ownership | nashir_v1_openapi.yaml and its generated types currently live in nashir-ui-prototype; after OpenAPI source-of-truth gate, they may move to marketing-os or be generated from it |
| AI / workflow runtime | Any Nashir workflow or AI execution runtime will live in marketing-os; nashir-ui-prototype continues to simulate this locally only |
| OpenAPI lint | Nashir OpenAPI contract must pass marketing-os's openapi:lint pattern once it moves to marketing-os |

---

## 12. Required Follow-up Gates

Ranked by dependency order:

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir Marketing OS Reconciliation Gate** | This decision | Confirms that marketing-os is a viable backend home by mapping Nashir V1 entities to marketing-os entity naming rules, identifying gaps and conflicts, and producing a reconciliation plan |
| 2 | **Nashir ERD Reconciliation Gate** | Nashir Marketing OS Reconciliation Gate | Translates Nashir conceptual ERD into an approved SQL entity map inside marketing-os that respects both Nashir V1 OpenAPI entities and marketing-os naming constraints |
| 3 | **Nashir OpenAPI Source-of-Truth Gate** | This decision | Decides whether nashir_v1_openapi.yaml moves to marketing-os, remains in nashir-ui-prototype as UI artifact, or is duplicated with explicit source-of-truth ownership |
| 4 | **Nashir Auth/RBAC and Workspace Identity Gate** | Nashir ERD Reconciliation Gate | Designs Nashir-specific auth model, RBAC permission matrix, workspace/tenant isolation inside marketing-os patterns |
| 5 | **Nashir Backend Slice 0 Planning** | Nashir Auth/RBAC and Workspace Identity Gate | Plans first implementable Nashir backend slice in marketing-os; must name exact allowed files, forbidden files, verification commands, and rollback criteria |
| 6 | **Nashir UI API Integration Planning Gate** | Nashir Backend Slice 0 Planning | Plans how nashir-ui-prototype will consume the Nashir V1 API; must not begin before gates 1–5 close |

**UI API integration must not proceed before gates 1, 2, 3, and 4 close.**

---

## 13. Blocked Work

The following work remains blocked until the gate chain in Section 12 produces explicit authorizations:

| Work item | Blocked until |
|---|---|
| Backend implementation code | Nashir Backend Slice 0 Planning gate |
| Database migrations / SQL schema | Nashir ERD Reconciliation Gate |
| Runtime API routes | Nashir Backend Slice 0 Planning gate |
| UI API calls (fetch, axios, HTTP client) | Nashir UI API Integration Planning Gate |
| Auth / RBAC implementation | Nashir Auth/RBAC and Workspace Identity Gate |
| AI runtime orchestration | Separate AI execution gate (not yet planned) |
| Publishing integrations | Separate publishing integration gate (not yet planned) |
| Production launch | All preceding gates + explicit Pilot/Production approval |
| Pilot launch | Same as Production |
| Code copy from marketing-os | Nashir Marketing OS Reconciliation Gate + individual slice approval |
| Generated types imported into UI | Nashir UI API Integration Planning Gate |
| jsconfig.json or tsconfig.json added | Separate JS Type Checking Strategy Gate |

---

## 14. Risk Register

| Risk | Likelihood | Impact | Control / Mitigation |
|---|---|---|---|
| marketing-os entity naming conflicts with Nashir V1 OpenAPI entities | High (confirmed: "Asset" conflict exists) | High | Nashir Marketing OS Reconciliation Gate must explicitly resolve entity name mapping before any SQL |
| Duplicated OpenAPI contracts diverge | Medium | High | Nashir OpenAPI Source-of-Truth Gate; freeze both contracts until source-of-truth is decided |
| UI-driven backend design drift | Medium | High | Keep nashir-ui-prototype frozen at UI/prototype scope; no backend work enters this repo |
| Accidental backend code placed in nashir-ui-prototype | Low | High | Hard prohibition enforced by gate discipline and README; any PR adding server-side code must be rejected |
| Premature PostgreSQL approval without ERD | Medium | High | PostgreSQL is a candidate only; no Nashir SQL schema or migration may be written without the ERD Reconciliation Gate |
| Auth/RBAC underdesign | Medium | High | Dedicated Auth/RBAC and Workspace Identity Gate; do not reuse marketing-os RBAC code directly without Nashir-specific review |
| Workflow/AI execution scope creep | Low | High | All AI execution screens in nashir-ui-prototype are mock-only; no AI execution gate has been approved; block any AI runtime work |
| Generated types mistaken for live API readiness | Medium | Medium | W-CONS-5 must be carried into all future slices; type annotations do not authorize API calls |
| Copying marketing-os routes/store without reconciliation | Medium | High | Hard prohibition: no code copy from marketing-os without explicit gate authorization; no use of marketing-os prototype/ |
| marketing-os fails reconciliation, no fallback plan | Low | High | Mitigation: Option B (nashir-backend repo) is formally deferred, not rejected; if reconciliation fails, escalate to Option B decision |
| Nashir production readiness blocked by marketing-os NO-GO | Medium | Medium | Acknowledge marketing-os NO-GO boundaries; Nashir production gate must be pursued explicitly and independently; not assumed to inherit marketing-os approval |

---

## 15. Decision

### Final decision

| Area | Status |
|---|---|
| GO to Nashir Marketing OS Reconciliation Gate | **GO** |
| GO to Nashir ERD Reconciliation Gate (after reconciliation scope approved) | **GO — after gate 1 closes** |
| Backend implementation | **NO-GO** |
| Database migrations / SQL schema | **NO-GO** |
| Runtime API routes | **NO-GO** |
| UI API integration (fetch, HTTP client) | **NO-GO** |
| Auth / RBAC implementation | **NO-GO** |
| Production / Pilot launch | **NO-GO** |
| Backend code inside nashir-ui-prototype | **NO-GO — permanent** |
| Code copy from marketing-os without gate authorization | **NO-GO** |
| Use of marketing-os prototype/ as source of truth | **NO-GO — permanent** |

### Backend home selected

| Repository | Decision |
|---|---|
| marketing-os | **SELECTED AS CANDIDATE** — after Nashir Marketing OS Reconciliation Gate |
| nashir-backend (new repo) | **DEFERRED** — revisit only if marketing-os reconciliation fails |
| nashir-ui-prototype | **NOT SELECTED** — permanent rejection |

### Next gate

**Nashir Marketing OS Reconciliation Gate**

That gate must:

- Map Nashir V1 OpenAPI entities to marketing-os entity naming rules and identify all conflicts.
- Assess whether Nashir workspace/product/asset/campaign-content/creator-studio entity model can coexist with marketing-os's existing MediaJob/MediaAsset/BrandProfile model in a single repository.
- Produce a reconciliation plan or a formal finding that Option B (nashir-backend) must be activated.
- Not authorize implementation. It is a documentation-only reconciliation review.

Until that gate closes and is approved, no backend implementation work of any kind may begin for Nashir.
