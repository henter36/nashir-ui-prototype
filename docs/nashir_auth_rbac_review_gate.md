# Nashir Auth/RBAC Review Gate

| Field | Value |
|---|---|
| Gate type | Auth/RBAC review gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Reviews docs/nashir_auth_rbac_workspace_identity_gate.md before proceeding to OpenAPI Security Mapping, SQL Schema Planning, or any backend implementation |
| Prerequisite gate | `docs/nashir_auth_rbac_workspace_identity_gate.md` — merged as PR #51 |
| Document under review | `docs/nashir_auth_rbac_workspace_identity_gate.md` |
| Implementation approved | NO |
| OpenAPI YAML changes approved | NO |
| SQL schema / migrations approved | NO |
| Backend routes approved | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an Auth/RBAC review gate only.

**No implementation is approved by this document.**

**No OpenAPI YAML changes are approved.**

**No SQL schema or migrations are approved.**

**No backend routes are approved.**

**No auth middleware or RBAC implementation is approved.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> Is the Nashir Auth/RBAC and Workspace Identity model sufficiently consistent, complete, and implementation-safe to proceed to the Nashir OpenAPI Security Mapping Gate?

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; constraints confirmed |
| `package.json` | Frontend-only; no auth deps |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | **Document under review** — 20 sections; identity model, workspace isolation, 7 roles, 35 permission codes, role-to-permission matrix, operation security mapping for all 35 nashir_v1_openapi.yaml operations |
| `docs/nashir_openapi_source_of_truth_gate.md` | Current OpenAPI authority confirmed; operation security mapping required before migration |
| `docs/nashir_erd_reconciliation_gate.md` | ERD candidate complete; Auth/RBAC blocker B-ERD02 is this gate's remit |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os CONDITIONALLY VIABLE; RBAC partial; four existing codes confirmed |
| `docs/nashir_backend_home_decision.md` | marketing-os as backend candidate |
| `docs/nashir_v1_openapi.yaml` | 35 operations (including getHealth); placeholder bearer auth; no operation-level permissions yet |
| `docs/workspace_and_minimum_identity_decision.md` | V1: single workspace → single StoreProfile |
| `docs/creator_studio_api_boundary_gate.md` | Session owner or workspace admin only; no auto-creation |
| `docs/creator_studio_production_contract_planning.md` | creatorHandleRef must not be stored raw; platform OAuth deferred |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Awareness only |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO; RBAC operational |
| `AGENTS.md` | Documentation PRs must not modify src/rbac.js or guards.js |
| `src/rbac.js` | Seven roles: owner, admin, creator, reviewer, publisher, billing_admin, viewer; dot notation permissions; four existing Nashir codes confirmed |
| `src/guards.js` | Six guards/middlewares: authGuard, workspaceContextGuard, membershipCheck, nonDisclosingMembershipCheck, permissionGuard, rejectBodyWorkspaceId |
| `src/error-model.js` | AppError: status, code, message, userAction, correlationId |
| `test/nashir-rbac-permission-mapping.test.js` | **Verified:** machine-enforced test for four existing Nashir codes × 7 roles = 28 assertions; billing_admin has NO nashir.campaign.read (confirmed false in test); viewer HAS nashir.campaign.read (confirmed true in test) |
| `docs/nashir_role_permission_matrix.md` | Planning-level matrix: owner/admin/editor/viewer baseline; reviewer/evidence_reviewer optional overlays |
| `docs/nashir_rbac_implementation_scope_gate.md` | RBAC implementation still NO-GO; four codes planned, not yet implemented for new codes |

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os RBAC test suites beyond nashir-rbac-permission-mapping.test.js | Pattern awareness sufficient for review; detailed test strategy deferred to implementation |
| nashir_approval_state_machine_contract.md | Full content deferred to SQL gate; approval semantics reviewed at structural level |

### Key review finding from marketing-os test

`test/nashir-rbac-permission-mapping.test.js` confirms that `billing_admin` currently returns **false** for `nashir.campaign.read`. The Auth/RBAC gate assigns `nashir.campaign.read` as **Denied** for `billing_admin`. These are **consistent** — no conflict.

`viewer` currently returns **true** for `nashir.campaign.read`. The gate assigns it **Allowed** — **consistent**.

---

## 3. Review Question

**Is the Nashir Auth/RBAC and Workspace Identity model sufficiently consistent, complete, and implementation-safe to proceed to the Nashir OpenAPI Security Mapping Gate?**

**Review verdict: YES, with watch items.**

The document is comprehensive, internally consistent, and properly defers implementation. Sixteen non-blocking observations and three watch items are recorded. No blocking findings prevent progression to the OpenAPI Security Mapping Gate. Three clarifications are required as conditions for the SQL Schema Planning Gate.

---

## 4. Review Criteria Assessment

| Criterion | Status | Notes |
|---|---|---|
| Identity model completeness | **ACCEPT** | 12 identity concepts covered; correct V1/DEFER/OUT classification |
| Workspace/store isolation clarity | **ACCEPT** | All 17 domain objects workspace-scoped; workspace_id body rejection confirmed |
| Role model clarity | **ACCEPT WITH WATCH ITEM** | Seven roles defined; `creator` vs `editor` conflict resolved by selecting `creator`; reviewer authority separation clear |
| Permission code consistency (35 codes) | **ACCEPT WITH CLARIFICATION** | 35 codes listed; 33 active V1 + 2 DEFER; minor naming pattern description inconsistency found (Section 5 vs Section 8) — non-blocking |
| Role-to-permission matrix completeness | **ACCEPT WITH WATCH ITEM** | Matrix covers all 35 permissions; `billing_admin` product/asset/campaign read access and `reviewer` evidence.manage RA assignment need clarification before SQL seed data |
| Operation security mapping completeness | **ACCEPT** | All 35 operations covered including getHealth (public); self-approval prevention noted for service layer |
| Human review / approval boundary | **ACCEPT** | No automatic publishing; AI suggestions require human review; all protected actions explicitly listed |
| Secrets and sensitive operations | **ACCEPT** | No raw secrets in API; vault references only; OAuth deferred correctly |
| Audit/evidence requirements | **ACCEPT** | 14 sensitive action classes covered with AuditEvent requirements |
| marketing-os guard/RBAC compatibility | **ACCEPT** | Guard pattern directly adoptable; test confirms existing code alignment |
| Readiness for OpenAPI security mapping | **ACCEPT** | Operation-to-permission mapping complete; ready to be inserted as x-permission extensions |
| Readiness for SQL planning | **CONDITIONAL ACCEPT** | Three clarifications needed before SQL seed data can be written (see Section 16) |
| Risks of over-broad admin/system roles | **ACCEPT WITH WATCH ITEM** | `nashir.admin.manage` vs `workspace.manage` distinction needs documentation; owner/admin privilege level is intentionally broad and bounded by audit requirements |

---

## 5. Identity Model Review

| Identity Concept | Decision in Auth/RBAC Gate | Review Status | Risk | Required Action |
|---|---|---|---|---|
| User | IN; Persist (external auth provider or internal user table); userId reference only in Nashir DB | **ACCEPT** | MEDIUM — auth provider not selected | Carry to Backend Slice 0 Planning; do not block this gate |
| Workspace | IN; reuse marketing-os Workspace entity | **ACCEPT** | LOW | None |
| StoreProfile | IN; new entity; 1:1 with workspace in V1 | **ACCEPT** | LOW | Confirm storeProfileId available on Product/Asset for Post-V1 multi-store compatibility |
| WorkspaceMember | IN; reuse marketing-os WorkspaceMember entity | **ACCEPT** | LOW | None |
| Role | IN; reuse + extend; role_code canonical | **ACCEPT** | LOW | None |
| Permission | IN; reuse + extend; dot notation | **ACCEPT WITH CLARIFICATION** | LOW | Pattern description in Section 5 says `nashir_domain.action` (underscore); actual codes use `nashir.domain.action` (dots). Accept the codes as authoritative; update pattern description to `nashir.domain.action` at SQL gate |
| RolePermission | IN; reuse marketing-os entity | **ACCEPT** | LOW | None |
| Actor | IN (derived from authenticated request) | **ACCEPT** | LOW | None |
| Service/system actor | DEFER | **ACCEPT** | LOW | Correctly deferred; no automation in V1 |
| OAuth-connected account | DEFER | **ACCEPT** | LOW | Correctly deferred per creator_studio_api_boundary_gate.md |
| Creator handle reference | IN (session-scoped, opaque) | **ACCEPT** | HIGH | Opaque storage requirement carries correctly into SQL Schema Planning Gate |
| API key / secret reference | IN (reference only); external vault | **ACCEPT** | HIGH | Vault reference storage pattern must be specified at SQL gate (B-RBAC09) |

---

## 6. Workspace and Store Isolation Review

### Overall: ACCEPT

| Isolation Rule | Status | Finding |
|---|---|---|
| Every persisted object must carry workspaceId | **ACCEPT** | Confirmed for all 17 domain objects in table |
| Store-owned concepts carry or derive store context | **ACCEPT** | All store-adjacent objects listed as "implicit via workspace's single store" — V1 appropriate |
| Cross-workspace access is NO-GO | **ACCEPT** | Explicit |
| Creator Studio sessions are workspace-scoped | **ACCEPT** | Confirmed via OpenAPI workspaceId path param and creator_studio_api_boundary_gate.md |
| Integration connections workspace-owned | **ACCEPT** | Deferred to Post-V1 but scoping rule pre-decided — correct |
| Assets, campaigns, content, publishing, prompts, model routing, workflow, cost are workspace-scoped | **ACCEPT** | All 17 object types listed and confirmed |
| storeProfileId available for Post-V1 multi-store | **ACCEPT WITH WATCH ITEM** | Gate mentions this as a Post-V1 consideration; must be confirmed in SQL Schema Planning Gate column design |

### Minor editorial finding (non-blocking)

The object-level scoping table in Section 6 lists `Asset` twice (rows 7 and 12 — both say YES/Implicit). This is a duplication in the documentation table. Accept as-is; non-blocking; note for cleanup at SQL gate.

---

## 7. Role Model Review

### Overall: ACCEPT — role name conflict resolved, separation of duties confirmed

| Role | role_code | Scope Clarity | Privilege Risk | Separation-of-Duties | Human-Review Authority | Secrets/Integration Authority | Cost/Model-Routing | Recommendation |
|---|---|---|---|---|---|---|---|---|
| Owner | `owner` | Clear — highest workspace authority | MEDIUM — intentionally broad; bounded by audit | None — can do everything | YES | YES (admin gate noted) | YES | **ACCEPT** — bound by audit requirement |
| Admin | `admin` | Clear — operational management | MEDIUM — broad but cannot record system usage | Cannot record system usage separately from admin actions | YES | YES (admin gate noted) | YES | **ACCEPT** |
| Creator / Content Editor | `creator` | Clear — content preparation only | LOW | Cannot approve own content (service layer enforced) | NO | NO | NO | **ACCEPT — confirms `creator` as canonical role_code** |
| Reviewer / Approver | `reviewer` | Clear — review/approval only | LOW | Cannot create campaigns or manage members | YES (approval.decide) | NO | NO | **ACCEPT** |
| Publisher | `publisher` | Clear — manual publishing only | LOW | Cannot approve content; can only submit/manage evidence | NO (submit evidence only) | NO (connector read only) | NO | **ACCEPT** |
| Finance/Ops Viewer | `billing_admin` | Adequate — cost/budget focus | LOW | No content or publishing authority | NO | NO | YES (cost + budget management) | **ACCEPT WITH WATCH ITEM** — cannot read campaigns; clarify if billing context requires campaign cost visibility |
| Viewer | `viewer` | Clear — read-only | LOW | Cannot mutate anything | NO | NO | NO | **ACCEPT** |

### Resolution of B-RBAC02 — `creator` vs `editor` role name conflict

**Decision: adopt `creator` as the canonical role_code.**

Rationale:
1. marketing-os `src/rbac.js` already defines `creator` as a role_code used in the permission map. Renaming it to `editor` would require a marketing-os gate and a breaking change to existing Nashir RBAC tests.
2. `test/nashir-rbac-permission-mapping.test.js` is written against the `creator` role_code. Any change requires that test to be updated.
3. The nashir_role_permission_matrix.md's use of `editor` is a planning-level label, not an implemented role_code. The planning label can remain "Content Editor" in UI display (role_name) while the canonical role_code is `creator`.
4. Role_code `creator` and role_name `Content Editor` are compatible — role_code is implementation identity; role_name is display only.

**B-RBAC02 is resolved. No fix gate needed for this item.**

---

## 8. Permission Taxonomy Review

### Overall: ACCEPT — 35 codes, consistent naming, complete coverage

| Permission Group | Permission Codes | Review Status | Concern | Action |
|---|---|---|---|---|
| Workspace and team (4) | workspace.read, workspace.manage, workspace.manage_members, rbac.read | **ACCEPT** | None | Reuse marketing-os codes as-is |
| Store setup (2) | nashir.store.read, nashir.store.update | **ACCEPT** | `nashir.store.update` could also be `nashir.store.write` for consistency with product/asset | Accept as-is; update is semantically accurate for an update-only operation |
| Product catalog (2) | nashir.product.read, nashir.product.write | **ACCEPT** | None | Consistent with asset pattern |
| Asset library (3) | nashir.asset.read, nashir.asset.write, nashir.asset.link | **ACCEPT** | `nashir.asset.link` is a distinct action from write — correct design | None |
| Campaigns (2) | nashir.campaign.read, nashir.campaign.write | **ACCEPT** | Existing codes preserved — correct | None |
| Content Studio (5) | nashir.content.read, nashir.content.create, nashir.content.update, nashir.content.submit_review, nashir.approval.decide | **ACCEPT** | `nashir.approval.decide` is placed in the content group but is an approval action — placement is fine since it governs content approval | None |
| Creator Studio (2) | nashir.creator_studio.use, nashir.creator_studio.transfer.create | **ACCEPT** | Two-permission split (session vs transfer) is clean | None |
| Publishing queue (2) | nashir.publishing.queue.read, nashir.publishing.draft.receive | **ACCEPT** | None | None |
| Evidence (2) | nashir.evidence.submit, nashir.evidence.manage | **ACCEPT** | Existing submit code preserved; manage is new | None |
| Prompt governance (2) | nashir.prompt_governance.read, nashir.prompt_governance.manage | **ACCEPT** | manage covers create+update+approve — this is intentionally broad for V1 admin-only governance | None |
| Model routing (2) | nashir.model_routing.read, nashir.model_routing.manage | **ACCEPT** | Same as prompt governance — admin-only manage is appropriate | None |
| Cost monitor (2) | nashir.cost.read, nashir.cost.manage | **ACCEPT** | Consistent; not billing | None |
| Workflow runs (1) | nashir.workflow.read | **ACCEPT** | Advisory read only — no execute permission correct | None |
| Integration (2) | nashir.integration.connect, nashir.integration.manage | **ACCEPT (DEFER)** | Correctly deferred to Post-V1 | None |
| Audit (1) | audit.read | **ACCEPT** | Reuses marketing-os code | None |
| Admin (1) | nashir.admin.manage | **ACCEPT WITH CLARIFICATION** | Boundary between nashir.admin.manage and workspace.manage needs explicit differentiation | Define the boundary before Nashir SQL Schema Planning Gate |

### Permission count verification

Total codes in Section 8 table: **35** (33 IN + 2 DEFER). Count confirmed as correct.

### Naming pattern clarification (non-blocking)

Section 5 Identity table row for Permission describes the pattern as `nashir_domain.action` (underscore between nashir and domain). Section 8 uses `nashir.domain.action` (dots throughout) — e.g., `nashir.store.read`, `nashir.content.create`. The actual codes in Section 8 are authoritative. The pattern description in Section 5 is a typographic error.

**Accepted correction:** The canonical pattern is `nashir.domain.action` (dots only). This does not affect any permission code value.

---

## 9. Role-to-Permission Matrix Review

### Overall: ACCEPT — least privilege confirmed, with three watch items

| Dimension | Finding | Status |
|---|---|---|
| Least privilege | Viewer and billing_admin are narrowest; creator cannot approve; reviewer cannot create | **PASS** |
| Reviewer/approver separation | `creator` cannot have `nashir.approval.decide`; `reviewer` cannot have `nashir.content.create` | **PASS** |
| Publishing risk | Only publisher, admin, owner can receive publishing drafts and submit evidence; no role publishes externally in V1 | **PASS** |
| Prompt governance risk | Only owner and admin can manage prompt governance | **PASS** |
| Model routing risk | Only owner and admin can read/manage model routing; watch item: creator and reviewer cannot see model routing at all, which may limit readiness UI for these roles | **PASS — WATCH ITEM** |
| Integration/secrets risk | Integration permissions deferred; no role has integration management in V1 | **PASS** |
| Audit read access | Only owner and admin have audit.read — CORRECT for governance sensitivity | **PASS** |
| Cost monitor visibility | billing_admin + owner + admin can read cost; creator/reviewer/publisher/viewer cannot; watch item: billing_admin cannot see campaigns (nashir.campaign.read = D), which may limit billing context in some reporting scenarios | **PASS — WATCH ITEM** |
| reviewer `nashir.evidence.manage` RA | Reviewer is assigned RA (Requires additional approval) for evidence manage | **CLARIFICATION NEEDED** — what does RA mean in implementation? Is it a service-layer guard check or a separate approval workflow? This must be decided before SQL gate |

### Specific cells verified against marketing-os test

The marketing-os test `nashir-rbac-permission-mapping.test.js` tests four existing Nashir codes × 7 roles. Cross-referencing:
- `billing_admin` + `nashir.campaign.read` = false (test says false; matrix says D) — **CONSISTENT**
- `viewer` + `nashir.campaign.read` = true (test says true; matrix says A) — **CONSISTENT**
- `creator` + `nashir.approval.decide` = false (test says false; matrix says D) — **CONSISTENT**
- `publisher` + `nashir.evidence.submit` = true (test says true; matrix says A) — **CONSISTENT**

All existing codes in the matrix are consistent with the marketing-os machine-enforced test.

---

## 10. Operation Security Mapping Review

All 35 nashir_v1_openapi.yaml operations have been mapped in Section 10 of the Auth/RBAC gate. The review checks by operation group:

| Operation Group | Operations Covered | Required Permission | Review Status |
|---|---|---|---|
| Health | getHealth (1) | None — public | **READY** |
| Products | listProducts, createProduct, getProduct, updateProduct (4) | nashir.product.read / nashir.product.write | **READY** |
| Assets | listAssets, createAsset, getAsset, updateAsset, linkAssetToProduct (5) | nashir.asset.read / nashir.asset.write / nashir.asset.link | **READY** |
| Campaign Content | listCampaignContents, createCampaignContent, getCampaignContent, updateCampaignContent (4) | nashir.content.read / nashir.content.create / nashir.content.update | **READY** |
| Content review lifecycle | submitCampaignContentReview, approveCampaignContent, rejectCampaignContent (3) | nashir.content.submit_review / nashir.approval.decide | **READY — WATCH ITEM**: self-approval prevention is service-layer only; not expressible in OpenAPI |
| Preview artifacts | listCampaignContentPreviewArtifacts, createCampaignContentPreviewArtifact (2) | nashir.content.read / nashir.content.create | **READY** |
| AI Readiness | getWorkspaceReadiness, getWorkflowReadiness, getWorkflowStepReadiness (3) | nashir.workflow.read | **READY** |
| Provider/route/prompt readiness | getProviderReadiness, getModelRouteReadiness, getPromptReadiness (3) | nashir.model_routing.read / nashir.prompt_governance.read | **READY** |
| Creator Studio sessions | createCreatorStudioSession, getCreatorStudioSession (2) | nashir.creator_studio.use | **READY** |
| Creator context drafts | createCreatorContextDraft, getCreatorContextDraft (2) | nashir.creator_studio.transfer.create | **READY** |
| Creator readiness assessment | createCreatorReadinessAssessment (1) | nashir.creator_studio.transfer.create | **READY** |
| Creator transfer drafts | createCreatorContentStudioTransferDraft, createCreatorCampaignTransferDraft, createCreatorPublishingTransferDraft, createCreatorPromptGovernanceTransferDraft (4) | nashir.creator_studio.transfer.create (+ nashir.prompt_governance.read for prompt-governance transfer) | **READY** |
| Creator transfer draft read | getCreatorTransferDraft (1) | nashir.creator_studio.transfer.create | **READY** |

**Total operations reviewed: 35. All operations have permission mapping. No gaps found.**

**Guard chain assignments verified:**
- GET operations: authGuard → workspaceContextGuard → membershipCheck → permissionGuard
- POST operations: + rejectBodyWorkspaceId
- Creator Studio GET operations (session/draft/transfer by ID): nonDisclosingMembershipCheck replaces membershipCheck — verified correct per creator_studio_api_boundary_gate.md

---

## 11. Human Review Boundary Review

| Rule | Status | Finding |
|---|---|---|
| No automatic publishing in V1 | **CONFIRMED** | Explicitly stated; no role has automatic publishing authority |
| No automatic external platform posting | **CONFIRMED** | Platform OAuth deferred; no external post permission exists |
| AI suggestions require human review | **CONFIRMED** | Creator Studio advisory outputs require human confirmation before any downstream action |
| Creator Studio transfers require human review | **CONFIRMED** | Transfer drafts are `pending_review` state only; no automatic execution |
| Publishing scheduling requires approved content and correct role | **CONFIRMED** | publisher role required for nashir.publishing.draft.receive; approved CampaignContent reference required |
| Prompt governance changes are sensitive | **CONFIRMED** | nashir.prompt_governance.manage is owner/admin only |
| Model routing changes are sensitive | **CONFIRMED** | nashir.model_routing.manage is owner/admin only |
| Creator may not approve own content | **CONFIRMED** | creator does not have nashir.approval.decide; service-layer check additionally required |

---

## 12. Sensitive Operations and Secrets Review

| Rule | Status | Finding |
|---|---|---|
| No raw secret values in API responses | **CONFIRMED** | Explicitly stated in Section 12 and Section 16 |
| Secret values not stored in regular domain entities | **CONFIRMED** | External vault only; vault_ref (opaque ID) stored |
| OAuth/API key/provider tokens are reference-only | **CONFIRMED** | creatorHandleRef opaque; API key vault_ref only |
| Integration connect/disconnect requires audit | **CONFIRMED** | AuditLog entry required per Section 13 |
| Provider credential changes require restricted roles | **CONFIRMED** | owner/admin only per Section 12 table |
| Billing/cost access is constrained | **CONFIRMED** | billing_admin + owner + admin only |
| Team/permission changes require audit | **CONFIRMED** | AuditLog entry required per Section 13 |
| payloadSummary must not expose raw platform tokens or prompt text | **CONFIRMED** | Stated explicitly for Creator Studio operations |

**Vault reference storage pattern (B-RBAC09) remains as a SQL gate item** — not blocking this review.

---

## 13. Audit/Evidence Requirements Review

| Sensitive Action | Audit Required? | Actor Required? | Workspace/Store Context Required? | Review Status |
|---|---|---|---|---|
| Workspace membership add/remove/role change | YES | YES (admin/owner) | YES | **ACCEPT** |
| Integration connect/disconnect | YES (Post-V1) | YES (admin/owner) | YES | **ACCEPT** |
| Prompt governance version approve/deprecate | YES | YES (admin/owner) | YES | **ACCEPT** |
| Model routing rule create/update | YES | YES (admin/owner) | YES | **ACCEPT** |
| Campaign content review submitted | YES | YES (creator/admin/owner) | YES | **ACCEPT** |
| Campaign content approved/rejected | YES | YES (reviewer/admin/owner) | YES | **ACCEPT** |
| Publishing queue item created/updated | YES | YES | YES | **ACCEPT** |
| Publishing scheduled | YES | YES (publisher/admin/owner) | YES | **ACCEPT** |
| Creator Studio transfer draft created | YES | YES (creator/admin/owner) | YES — no raw handle/token in event body | **ACCEPT** |
| API key/secret created/rotated/deleted | YES | YES (admin/owner) | YES | **ACCEPT** |
| Cost threshold changed | YES | YES (billing_admin/admin/owner) | YES | **ACCEPT** |
| Team permission change | YES | YES (admin/owner) | YES | **ACCEPT** |
| Manual publishing evidence submitted | YES | YES (publisher/admin/owner) | YES | **ACCEPT** |
| Evidence accepted/invalidated | YES | YES (admin/owner) | YES | **ACCEPT** |

All 14 sensitive action classes have audit requirements. AuditLog entity reuse from marketing-os confirmed. No gaps found.

---

## 14. marketing-os Compatibility Review

| marketing-os Concept | Observed Role | Reuse Category | Adaptation Required | Risk |
|---|---|---|---|---|
| `src/rbac.js` — roles, permissions, hasPermission | Full RBAC authority; dot notation; seven roles | **Reuse after reconciliation** | Add 31 new permission codes; extend rolePermissions for all new codes; must not break existing 28 RBAC test assertions | MEDIUM |
| `src/guards.js` — six guards/middlewares | Guard pipeline for all protected routes | **Reuse after reconciliation** | No logic change needed; add new permission codes as arguments | LOW |
| `src/error-model.js` — AppError | Error handling with correlationId | **Reuse after reconciliation** | Bridge Nashir V1 ErrorCode enum to AppError code field; mapping table documented | MEDIUM |
| `test/nashir-rbac-permission-mapping.test.js` | Machine-enforced test for 4 codes × 7 roles | **Reuse after reconciliation** | Extend test to cover all new nashir.* codes when added | LOW |
| marketing-os seven-role set | Operational role_codes | **Reuse after reconciliation** | Adopt same role_codes; extend rolePermissions; `creator` confirmed as canonical | LOW |
| marketing-os WorkspaceMember / membership pattern | Team membership lookup | **Reuse after reconciliation** | Same pattern; extends to DB-backed at Slice 0 | LOW |
| marketing-os nonDisclosingMembershipCheck | 404 for non-members (prevents enumeration) | **Reuse after reconciliation** | Apply to Creator Studio GET operations explicitly | LOW |
| `docs/nashir_role_permission_matrix.md` | Planning-level roles (owner/admin/editor/viewer) | **Reference only** | editor → creator role_code resolution accepted; billing_admin role added | LOW |
| marketing-os prototype/ | Static UI surface | **Reject** | Not applicable | None |

**No code reuse is approved in this review gate.** All reuse is deferred to Backend Slice 0 Planning and marketing-os implementation PRs.

---

## 15. Findings

### Blocking findings

**None.**

No blocking findings prevent progression to the Nashir OpenAPI Security Mapping Gate.

### Non-blocking findings

| ID | Finding | Severity | Required Action |
|---|---|---|---|
| NB-RV01 | Permission pattern description in Section 5 uses `nashir_domain.action` (underscore); actual codes use `nashir.domain.action` (dots) | Documentation inconsistency | Correct pattern description to `nashir.domain.action` at SQL Schema Planning Gate; do not change permission codes |
| NB-RV02 | Object-level scoping table (Section 6) lists `Asset` twice — rows 7 and 12 are duplicates | Documentation duplication | Cleanup at SQL Schema Planning Gate |
| NB-RV03 | `nashir.admin.manage` vs `workspace.manage` boundary is not clearly differentiated in the document | Boundary ambiguity | Clarify before SQL seed data is written; see Section 16 condition |
| NB-RV04 | `reviewer` assigned RA for `nashir.evidence.manage` — what RA means in implementation is undefined | Implementation ambiguity | Define RA semantics before Backend Slice 0 Planning; see Section 16 condition |
| NB-RV05 | `billing_admin` cannot read products, assets, or campaigns (all Denied in matrix) — potential gap if billing context requires campaign cost traceability | Functional gap risk | Carry as watch item; evaluate during billing_admin role validation at Backend Slice 0 Planning |
| NB-RV06 | `creator` role cannot read model routing (nashir.model_routing.read = D) — this means the readiness advisory dashboard for creators will not show model route health | UX functional gap | Carry as watch item; evaluate if model_routing.read should be added for creator at SQL gate |
| NB-RV07 | `creator` role cannot read cost (nashir.cost.read = D) — creators cannot see AI cost impact of their workflows | UX functional gap | Acceptable for V1 separation; carry as watch item |
| NB-RV08 | Self-approval prevention is documented as service-layer only — no OpenAPI mechanism enforces it | Implementation note | Must be explicitly captured in Backend Slice 0 Planning as a service invariant |
| NB-RV09 | Auth provider selection is deferred to Backend Slice 0 Planning (B-RBAC01) — marketing-os currently uses X-User-Id header as a mock; production auth requires real provider | Design gap | Acceptable deferral; confirm decision before route implementation |
| NB-RV10 | Vault reference storage pattern (B-RBAC09) deferred to SQL Schema Planning Gate | Design gap | Acceptable deferral |
| NB-RV11 | The role-to-permission matrix assigns no permissions to Secrets/keys row — secrets are vault-managed with no permission code | Design decision | Correct — raw secret values must never be exposed; confirm at Backend Slice 0 Planning that vault interactions use a separate vault API |
| NB-RV12 | `nashir.workflow.read` is only accessible to owner and admin — creator/reviewer/publisher/viewer cannot read workflow advisory | Restrictive access | Creator and reviewer may benefit from workflow readiness visibility; evaluate at SQL gate |
| NB-RV13 | `audit.read` is only accessible to owner and admin — correct governance boundary | Governance choice | Confirmed correct; not a finding |
| NB-RV14 | The creator_studio.use permission is denied for reviewer and publisher — reviewer cannot initiate a Creator Studio session | Design choice | Confirmed correct; reviewers review content submitted to them |
| NB-RV15 | billing_admin has `nashir.cost.manage` — this means billing admin can update cost policy thresholds, which is sensitive | Privilege scope | Correct — billing_admin is specifically a cost management role; bounded by audit requirement |
| NB-RV16 | `storeProfileId` availability on Product and Asset for Post-V1 multi-store compatibility must be confirmed at SQL gate | Design note | Noted in gate; carry to SQL Schema Planning Gate |

### Watch items

| ID | Watch Item |
|---|---|
| W-RV01 | `billing_admin` cannot see campaigns. Monitor whether billing context requires campaign read access in practice. Add `nashir.campaign.read` to `billing_admin` if cost reporting needs campaign context. |
| W-RV02 | Self-approval prevention must appear as an explicit invariant in Backend Slice 0 Planning service layer design. |
| W-RV03 | The marketing-os RBAC test adds 28 assertions for 4 codes × 7 roles. Any extension of Nashir permission codes must add corresponding test assertions to keep machine-enforced coverage complete. |

---

## 16. Required Corrections

No blocking issues found. No fix gate required.

Three non-blocking conditions must be resolved before the **Nashir SQL Schema Planning Gate** may produce seed data for roles and permissions:

| Condition | Item | Resolution |
|---|---|---|
| C-RV01 | Clarify `nashir.admin.manage` boundary vs `workspace.manage` — define which actions fall under each permission | Document boundary in SQL Schema Planning Gate |
| C-RV02 | Define RA (Requires Additional Approval) implementation semantics for `reviewer` + `nashir.evidence.manage` | Document service-layer check in SQL Schema Planning Gate |
| C-RV03 | Confirm permission pattern description uses `nashir.domain.action` (dots) consistently everywhere | Correct Section 5 typo in a future documentation-only patch |

These conditions do not block the Nashir OpenAPI Security Mapping Gate, which only needs the operation-to-permission mapping (Section 10) and guard chain assignments.

---

## 17. Readiness Decision

| Dimension | Readiness Rating |
|---|---|
| Identity model | **READY** |
| Workspace/store isolation | **READY** |
| Role model (7 roles, `creator` confirmed) | **READY** |
| Permission taxonomy (35 codes, dot notation) | **READY WITH WATCH ITEMS** |
| Role-to-permission matrix | **READY WITH WATCH ITEMS** |
| Operation security mapping (all 35 operations) | **READY** |
| Human review model | **READY** |
| Secrets/sensitive operations boundary | **READY** |
| Audit/evidence requirements | **READY** |
| marketing-os guard/RBAC compatibility | **READY** |

**Overall readiness: READY WITH WATCH ITEMS**

The Nashir Auth/RBAC and Workspace Identity Gate is sufficient to proceed to the Nashir OpenAPI Security Mapping Gate. The three SQL gate conditions (C-RV01 through C-RV03) must be resolved before role/permission seed data is written, but do not block the OpenAPI gate.

---

## 18. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir OpenAPI Security Mapping Gate** | This review gate — READY | Inserts operation-level x-permission extensions into nashir_v1_openapi.yaml; maps 34 secured operations to permission codes from Section 10; replaces placeholder bearer auth descriptions with operation security notes |
| 2 | **Nashir SQL Schema Planning Gate** | Auth/RBAC Review Gate closed; C-RV01/C-RV02/C-RV03 resolved | Produces approved column-level schema for all V1 entities including role seed data, permission seed data, RolePermission seed data, workspaceId requirements, vault_ref storage |
| 3 | **Nashir Backend Slice 0 Planning** | OpenAPI Security Mapping Gate + SQL Schema Planning Gate | Plans first implementable backend slice; selects auth provider; wires guards; adds permission codes to marketing-os rbac.js; defines self-approval service invariant; names exact allowed/forbidden files |
| 4 | **Nashir OpenAPI Migration Planning Gate** | Nashir Backend Slice 0 Planning | Plans contract authority movement from nashir-ui-prototype to marketing-os after route ownership and security mapping are known |
| 5 | **Nashir Generated Types Input Update Gate** | Nashir OpenAPI Migration Planning Gate | Approves change to package.json generation script |
| 5 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**No Nashir Auth/RBAC Fix Gate is required.** The review found no blocking issues.

**OpenAPI Security Mapping Gate may proceed immediately** — this review is GO.

**SQL Schema Planning Gate** is conditional on three non-blocking clarifications (C-RV01, C-RV02, C-RV03) being resolved, but is otherwise unblocked by any auth/RBAC finding.

**OpenAPI Migration Planning Gate** remains blocked until Auth/RBAC Review Gate AND Backend Slice 0 Planning close (per nashir_openapi_source_of_truth_gate.md).

**UI API Integration** remains blocked until backend exists and contract authority is settled.

---

## 19. Decision

### Final decision

| Area | Status |
|---|---|
| **Review result** | **READY WITH WATCH ITEMS** |
| B-RBAC02 role name conflict (`creator` vs `editor`) | **RESOLVED — `creator` is canonical role_code** |
| Blocking findings | **NONE** |
| GO to Nashir OpenAPI Security Mapping Gate | **GO** |
| CONDITIONAL GO to Nashir SQL Schema Planning Gate | **CONDITIONAL GO — resolve C-RV01, C-RV02, C-RV03 before seed data** |
| Auth implementation (rbac.js, guards.js changes) | **NO-GO** |
| RBAC middleware added | **NO-GO** |
| Backend routes implemented | **NO-GO** |
| OpenAPI YAML changes in this slice | **NO-GO** |
| SQL schema / migrations | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |
| Nashir Auth/RBAC Fix Gate | **NOT REQUIRED** |

### Role name resolution record

| Previous state | Resolution |
|---|---|
| B-RBAC02: `creator` (marketing-os) vs `editor` (nashir_role_permission_matrix.md) | **CLOSED**: `creator` is the canonical role_code. `editor` was a planning label. The role_name display value may still be "Content Editor" in UI. |

### Next gate

**Nashir OpenAPI Security Mapping Gate**

That gate must:
- Insert `x-permission` extensions or operation-level security requirements into nashir_v1_openapi.yaml for all 34 secured operations (getHealth has no security requirement).
- Map each operation to the permission code defined in Section 10 of the Auth/RBAC gate.
- Document nonDisclosingMembershipCheck assignments in Creator Studio GET operation descriptions.
- Replace the global placeholder bearer auth description with operation-level security notes.
- Not implement any backend code.

Until that gate closes, no Nashir backend route may be implemented against nashir_v1_openapi.yaml.
