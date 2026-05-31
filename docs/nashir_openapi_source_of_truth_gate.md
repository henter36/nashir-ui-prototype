# Nashir OpenAPI Source-of-Truth Gate

| Field | Value |
|---|---|
| Gate type | OpenAPI source-of-truth decision gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Determines the authoritative source for Nashir V1 OpenAPI contracts before any backend route implementation, OpenAPI migration, generated client consumption, SQL planning, or UI API integration |
| Prerequisite gate | `docs/nashir_erd_reconciliation_gate.md` — merged; OpenAPI source-of-truth identified as unresolved blocker B-ERD01 |
| OpenAPI files changed | NO |
| OpenAPI files moved | NO |
| Backend routes implemented | NO |
| Generated files changed | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an OpenAPI source-of-truth decision gate only.

**No OpenAPI files are changed in this slice.**

**No OpenAPI migration is performed.**

**No backend routes are implemented.**

**No generated files are changed.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice. No changes may be made to marketing-os.**

This gate answers:

> Which repository/file is the authoritative source for Nashir V1 OpenAPI today, and what is the future authority path when backend implementation begins?

It does not authorize moving any contract, changing any OpenAPI YAML, implementing any route, or updating any generated artifact.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; explicit constraints confirmed |
| `package.json` | `generate:creator-studio-types` script: `openapi-typescript docs/nashir_v1_openapi.yaml -o src/generated/creator-studio-openapi-types/index.d.ts` |
| `docs/nashir_backend_home_decision.md` | marketing-os selected as backend candidate; gates required |
| `docs/nashir_production_architecture_boundary_gate.md` | GO to gate chain confirmed |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE; dual contract identified as B-R04 |
| `docs/nashir_erd_reconciliation_gate.md` | B-ERD01: OpenAPI source-of-truth unresolved; blocks SQL Schema Planning Gate |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1.0 v0.1.0; four slices: Products/Assets, Campaign Content, AI Readiness, Creator Studio; server URL `https://api.example.invalid` (placeholder); generated types depend on this file |
| `docs/creator_studio_openapi_review_gate.md` | All 10 Creator Studio paths confirmed present; PR #33 merged; review gate closed GO |
| `docs/creator_studio_openapi_fix_review_gate.md` | Creator Studio schema fixes (B-1 through B-4) confirmed; PR #35 merged |
| `docs/nashir_openapi_slice_3_readiness_snapshots_acceptance_gate.md` | Slice 3 (AI Readiness) acceptance gate closed GO; YAML implementation PR authorized |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | W-CONS-5: type annotations do not authorize API integration; types are downstream artifact |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Downstream generated artifact only; generated from nashir_v1_openapi.yaml; not an authority source |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; not production-ready; nashir_openapi_patch.yaml listed as part of verified status chain |
| `AGENTS.md` | stop on source conflict; no contracts may be modified without explicit approval |
| `docs/nashir_openapi_patch.yaml` | OpenAPI 3.1.0 v0.1.0-nashir-slice0; Title: "Marketing OS — Nashir Slice 0 OpenAPI Patch"; covers `/workspaces/{workspaceId}/nashir-campaigns` (list + create) and evidence/readiness sub-paths; uses `nashir-campaigns` path prefix, not `/campaign-contents` or `/products`; has x-contract-rules with AuthGuard/WorkspaceContextGuard/MembershipCheck/PermissionGuard requirements; validated by `scripts/openapi-lint.js` in strict mode |
| `docs/nashir_openapi_audit_naming_reconciliation_gate.md` | Known divergence: runtime audit event is `nashir_campaign.created` (underscore); OpenAPI patch has `x-audit-event: nashir.campaign.created` (dot); divergence recorded as governance gate; not resolved in that PR |
| `docs/nashir_openapi_activation_planning_gate.md` | Blocker 3 addressed at planning level only; OpenAPI activation remains NO-GO; all four runtime blockers must be resolved before route registration |
| `docs/nashir_openapi_implementation_scope_gate.md` | Defines prerequisites before any Nashir OpenAPI implementation PR |
| `scripts/openapi-lint.js` | In strict mode, validates `marketing_os_v5_6_5_phase_0_1_openapi.yaml` (main), sprint3 patch, patch 002, and `nashir_openapi_patch.yaml`; Nashir patch is part of marketing-os verification chain |
| `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` | Marketing OS main OpenAPI contract; covers Marketing OS domain entities only; separate from Nashir V1 contract |

### Key divergence finding — verified

`nashir_v1_openapi.yaml` and `nashir_openapi_patch.yaml` are **not duplicates**. They cover different surfaces with different path naming conventions:

| Dimension | nashir_v1_openapi.yaml (nashir-ui-prototype) | nashir_openapi_patch.yaml (marketing-os) |
|---|---|---|
| Version | 0.1.0 | 0.1.0-nashir-slice0 |
| Path prefix for campaigns | `/workspaces/{workspaceId}/campaign-contents` | `/workspaces/{workspaceId}/nashir-campaigns` |
| Products | YES (Slice 1) | NO |
| Assets | YES (Slice 1) | NO |
| Campaign content (drafts/review) | YES (Slice 2) | NO (different entity model) |
| AI Readiness | YES (Slice 3) | NO |
| Creator Studio | YES (Slice 4) | NO |
| Campaign intake/list | YES (`/campaign-contents`) | YES (`/nashir-campaigns`) — different path |
| Evidence lifecycle | NO (not in nashir_v1_openapi.yaml) | YES (`/nashir-campaigns/{id}/evidence`) |
| Security model | Bearer auth (placeholder) | x-contract-rules with explicit guards |
| audit event format | Not defined | `x-audit-event: nashir.campaign.created` (naming divergence documented) |

This is a structural divergence: the two contracts define overlapping domain (campaigns) with incompatible path naming. They cannot be merged without a formal path reconciliation decision.

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os `docs/nashir_openapi_runtime_reconciliation_gate.md` | Details inside marketing-os context; covered at structural level here; defer full read to OpenAPI Migration Planning Gate |
| marketing-os `docs/nashir_openapi_patch_planning_gate.md` | Nashir OpenAPI patch planning context; defer to migration gate |
| marketing-os `docs/nashir_openapi_patch_proposal.md` | Proposal artifacts; defer to migration gate |
| nashir-ui-prototype full Slice 1/2/3 planning/review gate chain | Gate chain context already established; individual docs not re-read |

### Assumption flags

> **ASSUMPTION-OA1:** `nashir_openapi_patch.yaml` in marketing-os covers a Slice 0 marketing-os-internal Nashir campaign/evidence surface. Its path naming (`nashir-campaigns`) was designed to be namespaced within marketing-os and avoid collision with the existing `campaigns` array. This naming does not match the Nashir V1 OpenAPI contract in nashir-ui-prototype which uses `/campaign-contents`. The two cannot be merged by appending one to the other without a path reconciliation decision.

> **ASSUMPTION-OA2:** marketing-os `openapi-lint.js` validates `nashir_openapi_patch.yaml` as part of the strict verification chain. This means the Nashir patch is a first-class verified artifact in marketing-os's own CI pipeline. It cannot be simply discarded without a marketing-os gate.

---

## 3. Decision Question

**Which repository/file is the authoritative source for Nashir V1 OpenAPI today, and what is the future authority path when backend implementation begins?**

**Summary answer:**
- **Today:** `docs/nashir_v1_openapi.yaml` in nashir-ui-prototype is the current Nashir V1 OpenAPI authority. It is the only contract that covers the full Nashir V1 surface (Products, Assets, Campaign Content, AI Readiness, Creator Studio).
- **marketing-os `nashir_openapi_patch.yaml`:** is a Slice 0 historical artifact covering a narrow campaign/evidence surface with path naming incompatible with nashir_v1_openapi.yaml. It must be classified and its future disposition decided.
- **Future:** marketing-os becomes the production OpenAPI authority after a formal OpenAPI Migration Planning Gate, but the path naming divergence must be resolved before that migration occurs.

---

## 4. Current OpenAPI Inventory

| Contract Artifact | Repository | Path | OpenAPI Version | Current Role | Generated Artifacts Depending On It | Authority Status | Risk |
|---|---|---|---|---|---|---|---|
| `docs/nashir_v1_openapi.yaml` | nashir-ui-prototype | `docs/nashir_v1_openapi.yaml` | 3.1.0 v0.1.0 | Nashir V1 full surface contract: Products, Assets, Campaign Content, AI Readiness, Creator Studio. Four reviewed and accepted slices. | `src/generated/creator-studio-openapi-types/index.d.ts` | **CURRENT AUTHORITY** | Risk if moved without migration plan |
| `src/generated/creator-studio-openapi-types/index.d.ts` | nashir-ui-prototype | `src/generated/creator-studio-openapi-types/index.d.ts` | N/A (generated) | Downstream type artifact. Generated from nashir_v1_openapi.yaml. Not a source of truth. Not imported by UI yet. | None (leaf artifact) | **NOT AUTHORITY — downstream artifact** | Type drift if YAML changes without regeneration |
| `docs/nashir_openapi_patch.yaml` | marketing-os | `docs/nashir_openapi_patch.yaml` | 3.1.0 v0.1.0-nashir-slice0 | Slice 0 campaign/evidence surface contract. Covers `/nashir-campaigns` paths only. In marketing-os's openapi-lint strict verification chain. Audit event naming divergence documented. | marketing-os openapi-lint strict validation; marketing-os route tests (indirectly) | **HISTORICAL CANDIDATE — narrow surface, incompatible path naming** | Path naming conflicts with nashir_v1_openapi.yaml; audit naming divergence unresolved |
| `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` | marketing-os | `docs/marketing_os_v5_6_5_phase_0_1_openapi.yaml` | 3.1.0 (confirmed by lint script) | Marketing OS domain contract (not Nashir). Not a Nashir authority. | marketing-os openapi-lint; marketing-os test suite | **NOT NASHIR AUTHORITY — separate domain contract** | None for Nashir specifically |
| `docs/marketing_os_v5_6_5_phase_0_1_openapi_patch_002.yaml` | marketing-os | `docs/marketing_os_v5_6_5_phase_0_1_openapi_patch_002.yaml` | N/A (patch) | Marketing OS Patch 002 additions. Not Nashir. | marketing-os openapi-lint | **NOT NASHIR AUTHORITY** | None for Nashir |
| marketing-os openapi-lint.js (validation workflow) | marketing-os | `scripts/openapi-lint.js` | N/A (tooling) | Validates Marketing OS main + sprint3 patch + patch 002 + nashir_openapi_patch.yaml in strict mode | N/A | **CANDIDATE VALIDATION TOOLING** | If nashir_v1_openapi.yaml moves to marketing-os, it must be added to this lint chain |

---

## 5. Existing Authority Chain

### Verified facts

- `docs/nashir_v1_openapi.yaml` in nashir-ui-prototype is the only contract that covers all four Nashir V1 slices. It has been through a documented review and fix review gate chain (Slices 1, 2, 3 acceptance, Creator Studio review + fix review).
- The `generate:creator-studio-types` script in `package.json` explicitly names `docs/nashir_v1_openapi.yaml` as the single input. Generated types are a downstream artifact, not an authority.
- The UI does not call any API yet. The generated types are used for JSDoc type annotations only (per W-CONS-5). No generated runtime client exists.
- `nashir_openapi_patch.yaml` in marketing-os was written for the marketing-os Slice 0 campaign/evidence runtime path. It is a different surface from nashir_v1_openapi.yaml and uses different path naming.
- marketing-os's `openapi-lint.js` validates `nashir_openapi_patch.yaml` in strict mode. It is part of marketing-os's CI verification chain.
- No backend has implemented nashir_v1_openapi.yaml endpoints. The placeholder server URL (`https://api.example.invalid`) confirms no production backend exists.
- Any marketing-os Nashir patch must be treated as a historical/partial candidate until formally reconciled with nashir_v1_openapi.yaml.

### Authority chain today

```
nashir_v1_openapi.yaml (nashir-ui-prototype)
  ↓ generates
src/generated/creator-studio-openapi-types/index.d.ts (nashir-ui-prototype)
  ↓ (not consumed yet — UI API integration blocked)
nashir-ui-prototype React/Vite UI
```

marketing-os `nashir_openapi_patch.yaml` is in a separate chain:

```
nashir_openapi_patch.yaml (marketing-os)
  ↓ validated by
scripts/openapi-lint.js (marketing-os)
  ↓ covers
/nashir-campaigns routes (in-memory + repository mode)
```

These two chains do not intersect today. The intersection will be forced when backend routes must implement nashir_v1_openapi.yaml endpoints — at which point a source-of-truth migration and path reconciliation are required.

---

## 6. Source-of-Truth Options

### Option A — Keep nashir_v1_openapi.yaml in nashir-ui-prototype as current authority until backend routes exist

**Pros:**
- No change required. Zero risk of contract breakage in this slice.
- Generated types remain reproducible and stable.
- UI prototype continues to use the contract it was built against.
- Full four-slice coverage (Products, Assets, Campaign Content, AI Readiness, Creator Studio) is only in this file.
- Reviewed and accepted via multiple gate documents.

**Risks:**
- Contract lives in a frontend prototype repo while backend work accumulates in marketing-os. Ownership divergence grows over time.
- If backend implementation begins in marketing-os without formally adopting nashir_v1_openapi.yaml, routes may drift from the contract.
- Path naming discrepancy with marketing-os's existing `nashir-campaigns` paths could harden into a permanent split.

**Conditions:**
- Must be paired with a clear movement trigger: once Nashir Backend Slice 0 Planning identifies routes, the OpenAPI Migration Planning Gate must begin.
- All backend route implementations in marketing-os must reference nashir_v1_openapi.yaml (not the patch) for new endpoints.
- No new Nashir routes in marketing-os may deviate from nashir_v1_openapi.yaml naming without a reconciliation gate.

---

### Option B — Move Nashir OpenAPI authority to marketing-os now

**Pros:**
- Consolidates governance in the planned backend home.
- marketing-os's openapi-lint.js would validate the full Nashir V1 contract immediately.
- Reduces the temporal window of ownership divergence.

**Risks:**
- **Too early.** Auth/RBAC gate not closed. SQL Schema Planning Gate not closed. Backend Slice 0 Planning not started. Moving the contract without a backend to implement it creates governance without enforcement.
- marketing-os `openapi-lint.js` is currently scoped to Marketing OS contracts + Nashir patch. Adding nashir_v1_openapi.yaml requires changes to the lint script — those changes require a marketing-os gate.
- The `generate:creator-studio-types` script in nashir-ui-prototype would need to be updated to point to a different file path — a package.json or script change that is currently NO-GO.
- The path naming conflict between `/nashir-campaigns` (marketing-os) and `/campaign-contents` (nashir_v1_openapi.yaml) remains unresolved. Moving the contract without resolving this creates an inconsistent marketing-os state.
- The marketing-os gate discipline requires exact allowed/forbidden files for any PR that touches OpenAPI. No such gate has been written for this migration.

**Expected caution: NOT NOW.** Backend route planning and validation ownership are not yet ready.

---

### Option C — Maintain duplicate OpenAPI contracts in both repositories

**Pros:**
- Each repository retains its own contract immediately.
- No migration work required.

**Risks:**
- **REJECT.** Duplication creates unavoidable drift. The two contracts already have incompatible path naming for the campaign domain. Maintaining both as live authorities guarantees that backend implementations will diverge from the UI contract.
- Any change to nashir_v1_openapi.yaml must be manually replicated to marketing-os (or vice versa), with no automation enforcing consistency.
- Generated types would reflect one contract; backend routes would implement the other. This is the drift scenario the source-of-truth gate is designed to prevent.

**Expected recommendation: REJECT.**

---

### Option D — Keep nashir-ui-prototype as UI contract artifact now; select marketing-os as future production authority after backend slice planning

**Pros:**
- **Safest transitional model.** Authority remains with the file that is currently reviewed and accepted. No disruption to generated types or UI prototype toolchain.
- Provides a clear trigger for migration: Backend Slice 0 Planning identifies which routes are implemented, and only then does the OpenAPI Migration Planning Gate open.
- Aligns with the marketing-os gate discipline: migration requires an explicit PR with allowed/forbidden files and verification commands.
- Gives time for path naming reconciliation (`/nashir-campaigns` vs `/campaign-contents`) to be decided as part of Backend Slice 0 Planning.

**Risks:**
- Ownership divergence continues until migration is complete. Must be actively managed via the "no new Nashir routes deviate from nashir_v1_openapi.yaml" policy below.

**Conditions:**
- marketing-os must not implement new Nashir routes using path patterns not in nashir_v1_openapi.yaml without a reconciliation gate.
- `nashir_openapi_patch.yaml` in marketing-os must be formally classified (see Section 11) and its relationship to nashir_v1_openapi.yaml documented.
- The movement trigger is explicit: when Nashir Backend Slice 0 Planning approves first routes, the OpenAPI Migration Planning Gate must be initiated concurrently.

**Expected recommendation: SELECT Option D.**

---

## 7. Recommended Authority Model

**Current authority:** `docs/nashir_v1_openapi.yaml` in nashir-ui-prototype.

**Future production authority candidate:** marketing-os, after the following gates complete in sequence:
1. Nashir Auth/RBAC and Workspace Identity Gate
2. Nashir Backend Slice 0 Planning (identifies first routes)
3. Nashir OpenAPI Migration Planning Gate (exact migration PR plan, path naming reconciliation, lint integration, generated types update plan)

**Generated types:** Downstream artifact only. Generation command and input file remain unchanged. Generated types are not an authority and must not be manually edited.

**No duplicate live contracts.** Until migration occurs, nashir_v1_openapi.yaml is the only authoritative Nashir V1 contract. marketing-os `nashir_openapi_patch.yaml` is classified as a historical partial artifact (see Section 11).

**Enforcement policy:** No backend route implementation in marketing-os may use endpoint paths, schema names, or operationIds that deviate from nashir_v1_openapi.yaml for Nashir V1 domain entities (Products, Assets, Campaign Content, AI Readiness, Creator Studio), without a reconciliation gate explicitly approving the deviation.

---

## 8. Contract Movement Policy

OpenAPI authority may move from nashir-ui-prototype to marketing-os **only when all of the following are confirmed:**

| Condition | Status |
|---|---|
| Backend home confirmed: marketing-os selected | CONFIRMED |
| ERD reconciliation complete at candidate level | CONFIRMED |
| Auth/RBAC and Workspace Identity Gate closed | NOT YET |
| Backend Slice 0 Planning: routes identified, allowed/forbidden files defined | NOT YET |
| Path naming reconciliation: `/nashir-campaigns` vs Nashir V1 path naming resolved | NOT YET |
| OpenAPI validation/lint workflow: nashir_v1_openapi.yaml added to marketing-os lint script | NOT YET |
| Generated types input update: `package.json` generation script updated in approved gate | NOT YET |
| PR plan: exact files moved/changed, verification commands, rollback criteria named | NOT YET |
| No duplicate canonical contracts remain after migration | NOT YET |
| marketing-os CI passes with nashir_v1_openapi.yaml under lint | NOT YET |

Until all conditions are met, **no OpenAPI migration PR may open.**

---

## 9. Generated Types Impact

### Current state (unchanged by this gate)

| Dimension | Value |
|---|---|
| Generation command | `npm run generate:creator-studio-types` |
| Input file | `docs/nashir_v1_openapi.yaml` |
| Output file | `src/generated/creator-studio-openapi-types/index.d.ts` |
| Tool | `openapi-typescript ^7.13.0` |
| Reproducibility | Confirmed — generates identical output on each run |
| Authority | Downstream artifact only; not imported by UI; JSDoc annotation reference only |

### What changes if authority moves to marketing-os

- `package.json` `generate:creator-studio-types` script input path would change from `docs/nashir_v1_openapi.yaml` to a path in marketing-os (e.g., a local clone path or a different repo reference).
- This is a `package.json` change — currently NO-GO in this repo.
- A **Nashir Generated Types Input Update Gate** must be opened separately to approve the input path change and verify that the same types are generated from the new location.
- No changes to `src/generated/` or `package.json` are approved in this gate.

### No changes in this slice

Generated types are not changed. Generation command is not changed. Package scripts are not changed.

---

## 10. Contract Drift Controls

The following controls must be enforced from this gate forward:

| Control | Rule |
|---|---|
| One canonical source | `docs/nashir_v1_openapi.yaml` is the only Nashir V1 canonical contract until the OpenAPI Migration Planning Gate closes |
| Downstream artifacts only | `src/generated/creator-studio-openapi-types/index.d.ts` is generated from the canonical source; it is not an authority; do not edit manually |
| No duplicated route definitions | No new Nashir V1 routes may be defined in `nashir_openapi_patch.yaml` or any other marketing-os file that are also in nashir_v1_openapi.yaml, without a reconciliation gate |
| PR checks for OpenAPI diff | Any PR that modifies nashir_v1_openapi.yaml must regenerate types and verify the diff |
| Validation/lint requirement | Any future migration to marketing-os must include adding nashir_v1_openapi.yaml to the marketing-os openapi-lint.js validation chain |
| No UI API integration against non-authoritative contract | UI must not call any API endpoint that is not defined in nashir_v1_openapi.yaml |
| No marketing-os implementation against stale patch | marketing-os must not implement new Nashir routes using only nashir_openapi_patch.yaml without first reconciling with nashir_v1_openapi.yaml |
| Audit event naming consistency | The divergence between `nashir_campaign.created` (runtime) and `nashir.campaign.created` (OpenAPI x-extension) must be resolved at the OpenAPI Migration Planning Gate |
| No server URL approval | The placeholder server URL (`https://api.example.invalid`) must not be used for real requests. A production server URL requires a separate environment/config gate |

---

## 11. marketing-os Patch Classification

### nashir_openapi_patch.yaml

| Dimension | Classification |
|---|---|
| Authority status | **HISTORICAL PARTIAL ARTIFACT — NOT SUPERSEDED, NOT AUTHORITY** |
| Surface covered | Nashir Slice 0 campaign/evidence only: `/nashir-campaigns`, `/nashir-campaigns/{id}`, `/nashir-campaigns/{id}/readiness`, `/nashir-campaigns/{id}/evidence/...` |
| Overlap with nashir_v1_openapi.yaml | PARTIAL — campaign domain is present in both but with incompatible path naming. nashir_v1_openapi.yaml does not cover evidence lifecycle routes; the patch does |
| Path naming compatibility | **INCOMPATIBLE** — patch uses `/nashir-campaigns`; nashir_v1_openapi.yaml uses `/campaign-contents`. These cannot be silently reconciled |
| Audit event naming | **DIVERGENT** — runtime uses `nashir_campaign.created` (underscore); patch uses `nashir.campaign.created` (dot); documented in `nashir_openapi_audit_naming_reconciliation_gate.md` |
| Validation status | Validated by marketing-os `openapi-lint.js` in strict mode — is part of marketing-os CI chain |
| Future disposition | Must be formally reconciled with nashir_v1_openapi.yaml at the Nashir OpenAPI Migration Planning Gate. Cannot be removed from marketing-os without a marketing-os gate. Cannot be adopted as a Nashir V1 authority without path naming reconciliation |
| Action required | Carry to Nashir OpenAPI Migration Planning Gate for explicit path reconciliation decision. Until then, treat as a historical Slice 0 artifact |

### marketing-os main OpenAPI contracts (not Nashir)

`marketing_os_v5_6_5_phase_0_1_openapi.yaml`, `_sprint3_patch.yaml`, `_patch_002.yaml` — these are Marketing OS domain contracts. They are not Nashir authority sources. No classification action needed for Nashir purposes.

---

## 12. OpenAPI Ownership Boundaries

| Dimension | Before backend implementation | After backend implementation |
|---|---|---|
| Contract changes | Owned by nashir-ui-prototype (must follow gate discipline; any change requires regeneration verification) | Owned by marketing-os (production authority after migration gate) |
| Generated types production | nashir-ui-prototype (`npm run generate:creator-studio-types`) | nashir-ui-prototype (updated input path after Generated Types Input Update Gate) or marketing-os (if generation moves with contract) |
| API docs review | nashir-ui-prototype docs gate chain (review gate → fix review → acceptance) | marketing-os gate discipline (PR review with lint validation) |
| Route implementation reference | No routes implemented yet; must reference nashir_v1_openapi.yaml when started | marketing-os routes must reference the production OpenAPI authority |
| UI consumption reference | nashir-ui-prototype (UI API Integration Planning Gate) | nashir-ui-prototype (UI calls backend routes; types align with production authority) |

---

## 13. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir Auth/RBAC and Workspace Identity Gate** | This gate closed | Designs full Nashir permission matrix; confirms operation-level security model for all Nashir V1 operations; required before any route can be implemented |
| 2 | **Nashir SQL Schema Planning Gate** | Auth/RBAC gate closed | Produces approved column-level schema for V1 entities; required before database migrations |
| 3 | **Nashir Backend Slice 0 Planning** | SQL Schema Planning Gate | Plans first implementable Nashir backend slice with exact allowed/forbidden files and verification commands; must identify which routes are in scope, enabling the migration gate |
| 4 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning identifies routes | Plans migration of nashir_v1_openapi.yaml to marketing-os; resolves `/nashir-campaigns` vs V1 path naming; adds nashir_v1_openapi.yaml to marketing-os lint chain; approves generated types input update |
| 5 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves change to `package.json` generation script input path after contract moves to marketing-os |
| 6 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified; production server URL approved | Plans how nashir-ui-prototype calls the Nashir V1 API; blocked until backend exists and contract migration is complete |

**The Nashir OpenAPI Migration Planning Gate is blocked until Nashir Backend Slice 0 Planning identifies which routes are in scope.** Route ownership must be known before migration can be planned.

---

## 14. Blocking Findings

| ID | Finding | Severity | Resolution gate |
|---|---|---|---|
| B-OA01 | Path naming incompatibility: `nashir_openapi_patch.yaml` uses `/nashir-campaigns`; nashir_v1_openapi.yaml uses `/campaign-contents` — incompatible for merge without reconciliation | **HIGH** | Nashir OpenAPI Migration Planning Gate |
| B-OA02 | Audit event naming divergence in marketing-os: runtime `nashir_campaign.created` vs OpenAPI `nashir.campaign.created` — documented but unresolved | **MEDIUM** | Nashir OpenAPI Migration Planning Gate |
| B-OA03 | Auth/RBAC model not reflected in nashir_v1_openapi.yaml security model — current contract has placeholder bearer auth only; operation-level permission codes not mapped | **HIGH** | Nashir Auth/RBAC and Workspace Identity Gate |
| B-OA04 | ERD conceptual mapping not yet SQL-backed — nashir_v1_openapi.yaml endpoint schemas are not yet validated against a real SQL schema | **HIGH** | Nashir SQL Schema Planning Gate |
| B-OA05 | Generated types tied to current contract location — changing contract location requires a `package.json` update gate | **MEDIUM** | Nashir Generated Types Input Update Gate |
| B-OA06 | No backend route is wired to nashir_v1_openapi.yaml — contract has no enforcement downstream; drift is possible without the no-deviation policy | **MEDIUM** | Nashir Backend Slice 0 Planning |
| B-OA07 | No production server URL approved — placeholder URL (`https://api.example.invalid`) must not be used for real requests | **MEDIUM** | Nashir Backend Slice 0 Planning or environment/config gate |
| B-OA08 | marketing-os lint script does not validate nashir_v1_openapi.yaml — full Nashir V1 contract is outside marketing-os CI today | **MEDIUM** | Nashir OpenAPI Migration Planning Gate |
| B-OA09 | nashir_openapi_patch.yaml cannot be silently removed from marketing-os — it is part of the marketing-os CI chain; removal requires a marketing-os gate | **LOW** | Nashir OpenAPI Migration Planning Gate (marketing-os side) |

---

## 15. Non-blocking Findings / Watch Items

| ID | Finding | Action |
|---|---|---|
| W-OA01 | Current generated types reproducibility is confirmed. `npm run generate:creator-studio-types` produces identical output each run. This is not impacted by this gate. | No action required; continue monitoring after YAML changes |
| W-OA02 | OpenAPI 3.1.0 is acceptable throughout the chain. Both nashir_v1_openapi.yaml and nashir_openapi_patch.yaml use OpenAPI 3.1.0. No version compatibility issue. | Confirm tooling supports 3.1.0 at the lint gate |
| W-OA03 | Nullable syntax in nashir_v1_openapi.yaml uses the OpenAPI 3.1 `type: ["string", "null"]` form consistently. This is correct for 3.1.0. Do not change to OpenAPI 3.0 `nullable: true` form. | Carry into all future YAML changes |
| W-OA04 | nashir_v1_openapi.yaml already uses workspace-scoped paths (`/workspaces/{workspaceId}/...`) consistent with marketing-os patterns. This is a positive compatibility signal. | Carry as positive signal to migration gate |
| W-OA05 | nashir_v1_openapi.yaml includes Idempotency-Key, If-Match, and X-Resource-Version patterns matching marketing-os concurrency model. No conflict. | Carry as positive signal |
| W-OA06 | The UI contract may remain a useful transitional authority even after migration — the UI prototype can continue generating types from nashir_v1_openapi.yaml until the Generated Types Input Update Gate approves the input change. | No immediate action; track at migration gate |
| W-OA07 | nashir_openapi_patch.yaml defines error codes (PERMISSION_DENIED, WORKSPACE_ACCESS_DENIED, TENANT_CONTEXT_MISMATCH, NASHIR_IDEMPOTENCY_CONFLICT, NASHIR_PROCESS_BLOCKED, NASHIR_INVALID_STATE_TRANSITION) that must be reconciled with nashir_v1_openapi.yaml ErrorCode enum at migration gate. | Carry to migration gate |

---

## 16. Decision

### Final decision

| Area | Status |
|---|---|
| **CURRENT AUTHORITY: docs/nashir_v1_openapi.yaml in nashir-ui-prototype** | **CONFIRMED** |
| **FUTURE AUTHORITY CANDIDATE: marketing-os** (after migration gate) | **CONFIRMED** |
| **GENERATED TYPES: downstream artifact only** | **CONFIRMED** |
| OpenAPI migration in this slice | **NO-GO** |
| Changes to docs/nashir_v1_openapi.yaml | **NO-GO (in this slice)** |
| Changes to src/generated/ | **NO-GO** |
| Backend route implementation | **NO-GO** |
| UI API integration | **NO-GO** |
| Duplicate canonical OpenAPI contracts | **NO-GO — rejected permanently; Option C rejected** |
| Code copy from marketing-os | **NO-GO** |
| Production / Pilot | **NO-GO** |
| GO to Nashir Auth/RBAC and Workspace Identity Gate | **GO** |
| CONDITIONAL GO to Nashir OpenAPI Migration Planning Gate | **CONDITIONAL GO — after Auth/RBAC AND Backend Slice 0 Planning close** |

### Option D selected

**Option D** — keep nashir-ui-prototype as current authority; select marketing-os as future production authority after backend slice planning — is the selected transitional model.

| Repository | OpenAPI Authority Status |
|---|---|
| nashir-ui-prototype | **CURRENT AUTHORITY** — docs/nashir_v1_openapi.yaml |
| marketing-os | **FUTURE PRODUCTION AUTHORITY CANDIDATE** — after migration gate |

### marketing-os nashir_openapi_patch.yaml classification

**HISTORICAL PARTIAL ARTIFACT.** Not superseded. Not authority. Not a duplicate. Covers a narrow campaign/evidence surface with incompatible path naming. Must be formally reconciled with nashir_v1_openapi.yaml at the Nashir OpenAPI Migration Planning Gate.

### Next gate

**Nashir Auth/RBAC and Workspace Identity Gate**

That gate must:

- Design the full Nashir V1 permission matrix covering all operations in nashir_v1_openapi.yaml.
- Map operation-level security to existing marketing-os guard patterns (AuthGuard, WorkspaceContextGuard, MembershipCheck, PermissionGuard).
- Replace the placeholder bearer auth security model with an operation-level permission requirement that can be validated at lint time.
- Not authorize implementation. It is a documentation-only planning and design gate.

The **Nashir OpenAPI Migration Planning Gate** is blocked until Auth/RBAC AND Backend Slice 0 Planning both close. No Nashir V1 API routes may be implemented until the migration gate produces an explicit contract authority decision.
