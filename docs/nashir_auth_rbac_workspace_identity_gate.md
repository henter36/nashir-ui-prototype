# Nashir Auth/RBAC and Workspace Identity Gate

| Field | Value |
|---|---|
| Gate type | Auth/RBAC and workspace identity decision gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Defines Nashir V1 identity model, workspace/store isolation, role model, permission taxonomy, operation security boundaries before any backend implementation, SQL schema, OpenAPI security, or API route work |
| Prerequisite gates | `docs/nashir_erd_reconciliation_gate.md` — merged; `docs/nashir_openapi_source_of_truth_gate.md` — merged |
| Implementation approved | NO |
| SQL schema / migrations approved | NO |
| OpenAPI YAML changes approved | NO |
| Backend routes implemented | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an Auth/RBAC and workspace identity decision gate only.

**No implementation is approved by this document.**

**No SQL schema or migrations are approved.**

**No OpenAPI YAML changes are approved.**

**No backend routes are implemented.**

**No auth middleware or RBAC implementation is approved.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice. No changes may be made to marketing-os.**

This gate answers:

> What is Nashir's V1 identity model, workspace/store isolation model, role model, permission model, and operation security model?

It does not authorize writing any auth code, RBAC middleware, SQL schema, or API endpoints.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; explicit constraints confirmed |
| `package.json` | Frontend-only; no auth deps |
| `docs/nashir_backend_home_decision.md` | marketing-os selected as backend candidate |
| `docs/nashir_production_architecture_boundary_gate.md` | Auth/RBAC identified as undecided |
| `docs/nashir_marketing_os_reconciliation_gate.md` | marketing-os RBAC partial; four permission codes exist |
| `docs/nashir_erd_reconciliation_gate.md` | Auth/RBAC identified as NOT RECONCILED blocker B-ERD02 |
| `docs/nashir_openapi_source_of_truth_gate.md` | Operation security mapping required; current OpenAPI has placeholder bearer auth; blocks migration until this gate closes |
| `docs/nashir_v1_openapi.yaml` | Operations use bearer auth placeholder; workspace-scoped paths throughout; Idempotency-Key, If-Match, X-Resource-Version patterns; no operation-level permission codes yet |
| `docs/workspace_and_minimum_identity_decision.md` | V1: single workspace → single StoreProfile; workspace is tenant boundary; multi-store deferred |
| `docs/creator_studio_api_boundary_gate.md` | Creator Studio session is workspace-scoped; session owner or workspace admin only; no auto-creation on page load; manual/user-initiated |
| `docs/creator_studio_production_contract_planning.md` | creatorHandleRef must not be stored raw; platform OAuth gated; consent required for platform data |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Awareness only; downstream artifact |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO; RBAC pattern operational |
| `AGENTS.md` | Stop on source conflict; documentation PRs must not touch src/rbac.js or guards.js |
| `src/rbac.js` | **Seven roles defined:** owner, admin, creator, reviewer, publisher, billing_admin, viewer — all workspace-scoped; role_scope: "workspace"; is_system_role: true. **Permissions use dot notation** (e.g., `nashir.campaign.read`, `workspace.manage`). **Four existing Nashir permission codes:** nashir.campaign.read, nashir.campaign.write, nashir.evidence.submit, nashir.approval.decide. Complete `rolePermissions` map with role→permission assignments |
| `src/guards.js` | **Five guard functions:** authGuard (X-User-Id header), workspaceContextGuard (workspaceId path param), membershipCheck (active membership), nonDisclosingMembershipCheck (404 on non-membership), permissionGuard (hasPermission check), rejectBodyWorkspaceId (rejects body workspace_id mismatch) |
| `src/error-model.js` | AppError class: status, code, message, userAction; correlationId via X-Correlation-Id header |
| `docs/nashir_role_permission_matrix.md` | Nashir Core V1 role model planning: owner, admin, editor, viewer baseline roles; reviewer/evidence_reviewer optional overlays; finance_admin/integration_admin Post-V1 only; 8 Core V1 role principles |
| `docs/source_of_truth_precedence_decision_record.md` | README > changelog > reports > ERD/OpenAPI contracts authority hierarchy |
| `docs/nashir_rbac_implementation_scope_gate.md` | RBAC implementation scope gate; four permission codes planned in PR #162/166; implementation still NO-GO |

### Not reviewed — require later slices

| Source | Reason |
|---|---|
| marketing-os test files for guards/RBAC | Pattern awareness covered by source; test details deferred to implementation planning |
| Full nashir_approval_state_machine_contract.md | Approval semantics covered at structural level; full document deferred to SQL gate |
| Full nashir_manual_publishing_evidence_contract.md | Evidence semantics covered at structural level; full document deferred to SQL gate |

### Verified key findings

- marketing-os uses **dot notation** for all permission codes: `domain.action` (e.g., `nashir.campaign.read`, `workspace.manage`, `cost.read`). This is the established convention in the marketing-os codebase.
- marketing-os has **seven workspace-scoped roles**: owner, admin, creator, reviewer, publisher, billing_admin, viewer.
- marketing-os's `nashir_role_permission_matrix.md` proposes **four Nashir Core V1 baseline roles**: owner, admin, editor, viewer — with reviewer and evidence_reviewer as optional overlays. This differs from the seven marketing-os roles; a reconciliation is required.
- The guard pattern (authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId) is fully operational and must be adopted for Nashir routes.
- nashir_v1_openapi.yaml currently has placeholder bearer auth security. Operation-level permission codes are not yet mapped. This gate provides the permission codes needed for a future OpenAPI security update.

---

## 3. Decision Question

**What is Nashir's V1 identity model, workspace/store isolation model, role model, permission model, and operation security model?**

**Summary:** Nashir V1 adopts the marketing-os workspace/tenant pattern with the five-guard pipeline. The role model is reconciled between marketing-os's seven roles and the Nashir-specific role matrix into seven Nashir V1 roles. Permissions use dot notation consistent with marketing-os. All domain objects must be workspace-scoped. Creator Studio sessions and store are workspace-scoped. No cross-workspace access is permitted in V1.

---

## 4. Current Authority Chain

- **nashir-ui-prototype** is the UI/prototype/contract artifact repository. It does not implement auth. All role/permission concepts in the UI are mock simulations.
- **marketing-os** is the preferred backend/governance candidate. Its guard pattern and permission system are the reference for Nashir's backend auth model.
- **`docs/nashir_v1_openapi.yaml`** remains the current Nashir V1 OpenAPI authority. The operation-level security model defined in this gate must be applied to nashir_v1_openapi.yaml via a future OpenAPI security update — not in this slice.
- **Generated types** are downstream artifacts. They do not imply authorization readiness (W-CONS-5).
- **Auth/RBAC decisions from this gate** must feed into: (1) OpenAPI security mapping gate, (2) SQL schema planning gate (permission/role tables), (3) Backend Slice 0 Planning (guard wiring).

---

## 5. Identity Model Decision

| Identity Concept | Purpose | V1 Status | Persistence Candidate | Privacy Sensitivity | Relationship Owner | Notes |
|---|---|---|---|---|---|---|
| User | A human actor with an account; identified by userId; may be a member of multiple workspaces | **IN** | Persist (external auth provider or internal user table) | **HIGH** — PII | Platform / auth provider | User identity details (email, name) should come from auth provider; Nashir stores userId reference only |
| Workspace | Top-level tenant boundary for all Nashir domain objects | **IN** | Persist (reuse marketing-os Workspace entity) | LOW | Platform/admin | All domain objects must carry workspaceId |
| StoreProfile | Commerce identity of a workspace; one per workspace in V1 | **IN** | Persist (new entity) | LOW–MEDIUM | Business user | 1:1 with workspace in V1; multi-store deferred |
| WorkspaceMember | Links a User to a Workspace with a role; represents team membership | **IN** | Persist (reuse marketing-os WorkspaceMember entity) | MEDIUM | Workspace admin | Active membership required for any workspace access |
| Role | Named set of permissions scoped to a workspace | **IN** | Persist (reuse marketing-os Role entity; extend with Nashir roles) | LOW | Platform/admin | role_code is canonical; role_name is display; workspace-scoped |
| Permission | Discrete authorization code for a controlled action | **IN** | Persist (reuse marketing-os Permission entity; add Nashir permission codes) | LOW | Platform/admin | Dot notation: `nashir_domain.action` pattern; see Section 8 |
| RolePermission | Maps a role to its set of permissions | **IN** | Persist (reuse marketing-os RolePermission entity) | LOW | Platform/admin | Many-to-many via role_code + permission_code |
| Actor | The human user or system entity associated with an auditable action | **IN (derived)** | Derived from authenticated request | MEDIUM | Platform/audit | For protected actions, actor must be a human with explicit authority |
| Service/system actor | Internal service calling another service (e.g., background job) | **DEFER** | N/A in V1 (no background service execution approved) | N/A | Platform | Automation and inter-service auth is Post-V1 |
| OAuth-connected account | External platform identity linked to a workspace or user (e.g., Instagram, TikTok) | **DEFER** | External provider; opaque reference only in V1 | **HIGH** | Platform / user consent | Platform OAuth out of V1 per creator_studio_api_boundary_gate.md |
| Creator handle reference | Opaque reference to a creator's platform handle within a Creator Studio session | **IN (session-scoped)** | Persist as opaque token only; never store raw handle | **HIGH** | Creator Studio | Raw creator handle must not be stored (confirmed in creator_studio_production_contract_planning.md) |
| API key / secret reference | Reference to a credential stored in a vault | **IN (reference only)** | External vault; only reference ID stored in Nashir DB | **HIGH** | Platform/admin | Raw secret values must never appear in Nashir domain entities or API responses |

---

## 6. Workspace and Store Isolation

### Confirmed decisions

| Decision | Status | Source |
|---|---|---|
| V1 is single-workspace-per-deployment for a given actor | **CONFIRMED** | docs/workspace_and_minimum_identity_decision.md |
| V1 is single-store-per-workspace (one StoreProfile per workspace) | **CONFIRMED** | docs/workspace_and_minimum_identity_decision.md |
| Every persisted business object must carry workspaceId | **CONFIRMED** | marketing-os db_backed_repository_architecture_contract.md; all repository methods receive workspaceId explicitly |
| workspace_id must never be trusted from request body | **CONFIRMED** | marketing-os guards.js (rejectBodyWorkspaceId); marketing-os non-negotiable implementation rule #4 |
| Cross-workspace access is NO-GO | **CONFIRMED** | Tenant isolation at repository layer required |
| Creator Studio sessions are workspace-scoped | **CONFIRMED** | creator_studio_api_boundary_gate.md; OpenAPI workspaceId path param on all creator-studio paths |
| Integration connections are workspace-owned | **CONFIRMED (V1 scope)** | Integration connections are deferred to Post-V1 but when implemented must be workspace-scoped |

### Object-level scoping decisions

| Domain Object | Workspace-scoped | Store-scoped | Notes |
|---|---|---|---|
| StoreProfile | YES (1:1 with workspace) | IS the store | Carried on workspace context |
| Product | YES | Implicit (via workspace's single store) | Store context derived from workspace in V1 |
| Asset | YES | Implicit | Same as product |
| Campaign | YES | Implicit | Campaigns belong to workspace; reference workspace's store/product |
| CampaignContent | YES | Implicit | Child of campaign |
| PreviewArtifact | YES | Implicit | Child of CampaignContent |
| Creator Studio session | YES | Implicit | Workspace-scoped per OpenAPI |
| Creator context draft | YES | Implicit | Child of session |
| Creator transfer draft | YES | Implicit | Child of context draft |
| Publishing queue item | YES | Implicit | References workspace's approved content |
| Asset | YES | Implicit | Workspace-scoped per OpenAPI |
| Prompt template | YES | — | Workspace-level governance object |
| Model routing rule | YES | — | Workspace-level AI operations object |
| AI provider | YES | — | Workspace-level ops object |
| Cost usage record | YES | — | Workspace-level advisory |
| Workflow definition | YES | — | Workspace-level advisory |
| Audit event | YES | — | All events carry workspaceId |
| WorkspaceMember / Role | YES | — | Membership is workspace-scoped |

### Multi-store readiness (Post-V1)

V1 uses single-store-per-workspace. For Post-V1 multi-store support: storeProfileId must be available on Product and Asset entities (even if not functionally used in V1), so that future scoping is possible without schema migration.

---

## 7. Role Model

Marketing-os has seven roles: owner, admin, creator, reviewer, publisher, billing_admin, viewer. The nashir_role_permission_matrix.md proposes four Nashir Core V1 baseline roles (owner, admin, editor, viewer) with optional overlays (reviewer, evidence_reviewer). These are reconciled below into a Nashir V1 role set aligned with the Nashir UI surface.

### Recommendation: adopt seven Nashir V1 roles, aligned with marketing-os role_codes

| Role | role_code | Purpose | Manage Members | Approve Content | Publish Manually | Manage Integrations/Secrets | View Cost/Model Routing | V1 Status |
|---|---|---|---|---|---|---|---|---|
| Owner | `owner` | Highest workspace role; all capabilities including member management, settings, billing view, and protected actions | YES | YES | YES | YES (admin gate) | YES | **IN** |
| Admin | `admin` | Operational management; workspace ops and most protected actions; cannot record system usage | YES | YES | YES | YES (admin gate) | YES | **IN** |
| Creator / Content Editor | `creator` | Campaign preparation, content creation, asset management, evidence submission; cannot approve or manage members | NO | NO | NO (submit only) | NO | NO | **IN** |
| Reviewer / Approver | `reviewer` | Human review and approval authority; can approve/reject content; cannot create campaigns or manage members | NO | YES | NO | NO | NO | **IN** |
| Publisher | `publisher` | Manual publishing execution; evidence submission and management; cannot approve content | NO | NO | YES (manual evidence only) | NO (connector read only) | NO | **IN** |
| Finance/Ops Viewer | `billing_admin` | Cost, budget, guardrail, and performance read access; no content or publishing authority | NO | NO | NO | NO | YES (cost/budget management) | **IN** |
| Viewer | `viewer` | Read-only across workspace content; no mutation, approval, evidence, or cost mutation | NO | NO | NO | NO | NO (read only) | **IN** |

**Note on reviewer vs creator role:** A creator may not approve their own content. Approval must be by a separate reviewer or admin. This must be enforced at the service layer, not just at the role layer.

**Note on Post-V1 roles:** integration_admin and finance_admin with payment authority are Post-V1 only.

---

## 8. Permission Taxonomy

### Naming convention decision

**Adopt dot notation** consistent with marketing-os (`domain.action`), not colon notation. Reasons:
- marketing-os `src/rbac.js` uses dots throughout: `nashir.campaign.read`, `workspace.manage`, `cost.read`.
- nashir_v1_openapi.yaml ErrorCode enum already uses dots: `workspace.not_found`, `creator_studio.session.not_found`.
- Consistent notation across permission codes, error codes, and audit events.

Pattern: `nashir_domain.action` for new Nashir-specific domains; `domain.action` for shared domains reused from marketing-os.

### Existing Nashir permission codes (verified in marketing-os src/rbac.js)

These four codes exist and must be preserved:
- `nashir.campaign.read`
- `nashir.campaign.write`
- `nashir.evidence.submit`
- `nashir.approval.decide`

### Proposed full Nashir V1 permission set

New codes are prefixed with `nashir.` to namespace within marketing-os. Reused codes that already exist in marketing-os use their existing names.

| Permission Code | Domain | Action | V1 Status | Notes |
|---|---|---|---|---|
| `workspace.read` | workspace | Read workspace metadata | **IN — reuse** | Existing in marketing-os |
| `workspace.manage` | workspace | Update workspace settings | **IN — reuse** | Existing in marketing-os |
| `workspace.manage_members` | workspace | Add/remove/change member roles | **IN — reuse** | Existing in marketing-os |
| `rbac.read` | rbac | Read role/permission definitions | **IN — reuse** | Existing in marketing-os |
| `nashir.store.read` | store | Read store profile | **IN — new** | |
| `nashir.store.update` | store | Update store profile | **IN — new** | |
| `nashir.product.read` | product | Read product catalog records | **IN — new** | |
| `nashir.product.write` | product | Create/update product records | **IN — new** | |
| `nashir.asset.read` | asset | Read asset metadata | **IN — new** | |
| `nashir.asset.write` | asset | Create/update asset metadata | **IN — new** | |
| `nashir.asset.link` | asset | Link asset to product | **IN — new** | |
| `nashir.campaign.read` | campaign | Read campaigns | **IN — existing** | Preserve existing code |
| `nashir.campaign.write` | campaign | Create/update campaigns | **IN — existing** | Preserve existing code |
| `nashir.content.read` | content | Read campaign content drafts | **IN — new** | |
| `nashir.content.create` | content | Create content drafts | **IN — new** | |
| `nashir.content.update` | content | Update content drafts | **IN — new** | |
| `nashir.content.submit_review` | content | Submit content for review | **IN — new** | |
| `nashir.approval.decide` | approval | Approve or reject reviewed content | **IN — existing** | Preserve existing code |
| `nashir.creator_studio.use` | creator_studio | Create and manage Creator Studio sessions | **IN — new** | |
| `nashir.creator_studio.transfer.create` | creator_studio | Create context drafts and transfer drafts | **IN — new** | |
| `nashir.publishing.queue.read` | publishing | Read publishing queue | **IN — new** | |
| `nashir.publishing.draft.receive` | publishing | Receive transfer draft into publishing queue | **IN — new** | |
| `nashir.evidence.submit` | evidence | Submit manual publishing evidence | **IN — existing** | Preserve existing code |
| `nashir.evidence.manage` | evidence | Accept, request correction, or invalidate evidence | **IN — new** | |
| `nashir.prompt_governance.read` | prompt_governance | Read prompt templates and versions | **IN — new** | |
| `nashir.prompt_governance.manage` | prompt_governance | Create/update/approve prompt templates | **IN — new** | Admin/owner only |
| `nashir.model_routing.read` | model_routing | Read model routing rules and provider snapshots | **IN — new** | |
| `nashir.model_routing.manage` | model_routing | Create/update model routing rules | **IN — new** | Admin/owner only |
| `nashir.cost.read` | cost | Read cost usage records and policies | **IN — reuse pattern** | Adapts marketing-os cost.read |
| `nashir.cost.manage` | cost | Update cost policy thresholds | **IN — new** | Admin/owner/billing_admin only |
| `nashir.workflow.read` | workflow | Read workflow definitions and advisory readiness | **IN — new** | |
| `nashir.integration.connect` | integration | Connect an external data source or integration | **DEFER** | Post-V1; integration execution gated |
| `nashir.integration.manage` | integration | Manage connected integrations | **DEFER** | Post-V1 |
| `audit.read` | audit | Read audit events and evidence | **IN — reuse** | Existing in marketing-os |
| `nashir.admin.manage` | admin | System-level admin actions for Nashir | **IN — new** | Owner/admin only |

---

## 9. Role-to-Permission Matrix

Legend: **A** = Allowed; **D** = Denied; **RA** = Requires additional approval (not just role); **AO** = Admin/Owner only; **Def** = Defer

| Permission | owner | admin | creator | reviewer | publisher | billing_admin | viewer |
|---|---|---|---|---|---|---|---|
| **Workspace and team** | | | | | | | |
| workspace.read | A | A | A | A | A | A | A |
| workspace.manage | A | A | D | D | D | D | D |
| workspace.manage_members | A | A | D | D | D | D | D |
| rbac.read | A | A | A | A | A | A | A |
| **Store setup** | | | | | | | |
| nashir.store.read | A | A | A | A | A | A | A |
| nashir.store.update | A | A | D | D | D | D | D |
| **Product catalog** | | | | | | | |
| nashir.product.read | A | A | A | A | A | D | A |
| nashir.product.write | A | A | A | D | D | D | D |
| **Asset library** | | | | | | | |
| nashir.asset.read | A | A | A | A | A | D | A |
| nashir.asset.write | A | A | A | D | D | D | D |
| nashir.asset.link | A | A | A | D | D | D | D |
| **Campaigns** | | | | | | | |
| nashir.campaign.read | A | A | A | A | A | D | A |
| nashir.campaign.write | A | A | A | D | D | D | D |
| **Content Studio** | | | | | | | |
| nashir.content.read | A | A | A | A | A | D | A |
| nashir.content.create | A | A | A | D | D | D | D |
| nashir.content.update | A | A | A | D | D | D | D |
| nashir.content.submit_review | A | A | A | D | D | D | D |
| nashir.approval.decide | A | A | D | A | D | D | D |
| **Creator Studio** | | | | | | | |
| nashir.creator_studio.use | A | A | A | D | D | D | D |
| nashir.creator_studio.transfer.create | A | A | A | D | D | D | D |
| **Publishing queue** | | | | | | | |
| nashir.publishing.queue.read | A | A | A | A | A | D | A |
| nashir.publishing.draft.receive | A | A | D | D | A | D | D |
| nashir.evidence.submit | A | A | D | D | A | D | D |
| nashir.evidence.manage | A | A | D | RA | D | D | D |
| **Data sources and integrations** | | | | | | | |
| nashir.integration.connect | Def | Def | Def | Def | Def | Def | Def |
| nashir.integration.manage | Def | Def | Def | Def | Def | Def | Def |
| **Prompt governance** | | | | | | | |
| nashir.prompt_governance.read | A | A | A | A | D | D | A |
| nashir.prompt_governance.manage | A | A | D | D | D | D | D |
| **Model routing** | | | | | | | |
| nashir.model_routing.read | A | A | D | D | D | D | D |
| nashir.model_routing.manage | A | A | D | D | D | D | D |
| **Cost monitor** | | | | | | | |
| nashir.cost.read | A | A | D | D | D | A | D |
| nashir.cost.manage | A | A | D | D | D | A | D |
| **Workflow runs** | | | | | | | |
| nashir.workflow.read | A | A | D | D | D | D | D |
| **Reviews and approvals** | | | | | | | |
| (see content approval above) | | | | | | | |
| **Audit and evidence** | | | | | | | |
| audit.read | A | A | D | D | D | D | D |
| **Secrets/keys** | | | | | | | |
| (secrets are vault-managed; no permission code exposes raw values) | AO | AO | D | D | D | D | D |
| **Admin** | | | | | | | |
| nashir.admin.manage | A | A | D | D | D | D | D |

---

## 10. Operation Security Mapping

This table maps Nashir V1 OpenAPI operations (from nashir_v1_openapi.yaml) to required permission codes. This is input to the future OpenAPI security update gate. **Do not modify OpenAPI YAML in this slice.**

| Operation (operationId) | HTTP | Path | Required Permission | Guard Chain |
|---|---|---|---|---|
| `getHealth` | GET | `/health` | None (public health check) | None |
| `listProducts` | GET | `/workspaces/{workspaceId}/products` | `nashir.product.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createProduct` | POST | `/workspaces/{workspaceId}/products` | `nashir.product.write` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `getProduct` | GET | `/workspaces/{workspaceId}/products/{productId}` | `nashir.product.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `updateProduct` | PUT | `/workspaces/{workspaceId}/products/{productId}` | `nashir.product.write` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `listAssets` | GET | `/workspaces/{workspaceId}/assets` | `nashir.asset.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createAsset` | POST | `/workspaces/{workspaceId}/assets` | `nashir.asset.write` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `getAsset` | GET | `/workspaces/{workspaceId}/assets/{assetId}` | `nashir.asset.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `updateAsset` | PUT | `/workspaces/{workspaceId}/assets/{assetId}` | `nashir.asset.write` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `linkAssetToProduct` | POST | `/workspaces/{workspaceId}/assets/{assetId}/link-product` | `nashir.asset.link` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `listCampaignContents` | GET | `/workspaces/{workspaceId}/campaign-contents` | `nashir.content.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCampaignContent` | POST | `/workspaces/{workspaceId}/campaign-contents` | `nashir.content.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `getCampaignContent` | GET | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | `nashir.content.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `updateCampaignContent` | PUT | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | `nashir.content.update` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId |
| `submitCampaignContentReview` | POST | `.../submit-review` | `nashir.content.submit_review` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `approveCampaignContent` | POST | `.../approve` | `nashir.approval.decide` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard; self-approval denied at service layer |
| `rejectCampaignContent` | POST | `.../reject` | `nashir.approval.decide` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `listCampaignContentPreviewArtifacts` | GET | `.../preview-artifacts` | `nashir.content.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCampaignContentPreviewArtifact` | POST | `.../preview-artifacts` | `nashir.content.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getWorkspaceReadiness` | GET | `/workspaces/{workspaceId}/readiness` | `nashir.workflow.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getWorkflowReadiness` | GET | `.../workflow-definitions/{workflowDefinitionId}/readiness` | `nashir.workflow.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getWorkflowStepReadiness` | GET | `.../workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness` | `nashir.workflow.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getProviderReadiness` | GET | `.../ai-providers/{providerId}/readiness` | `nashir.model_routing.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getModelRouteReadiness` | GET | `.../model-routes/{modelRouteId}/readiness` | `nashir.model_routing.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getPromptReadiness` | GET | `.../prompts/{promptId}/readiness` | `nashir.prompt_governance.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCreatorStudioSession` | POST | `.../creator-studio/sessions` | `nashir.creator_studio.use` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId; must not auto-create on page load |
| `getCreatorStudioSession` | GET | `.../creator-studio/sessions/{sessionId}` | `nashir.creator_studio.use` | authGuard → workspaceContextGuard → nonDisclosingMembershipCheck → permissionGuard; session owner or workspace admin only |
| `createCreatorContextDraft` | POST | `.../creator-studio/context-drafts` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getCreatorContextDraft` | GET | `.../creator-studio/context-drafts/{draftId}` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → nonDisclosingMembershipCheck → permissionGuard |
| `createCreatorReadinessAssessment` | POST | `.../creator-studio/readiness-assessments` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCreatorContentStudioTransferDraft` | POST | `.../transfer-drafts/content-studio` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCreatorCampaignTransferDraft` | POST | `.../transfer-drafts/campaign` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCreatorPublishingTransferDraft` | POST | `.../transfer-drafts/publishing` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `createCreatorPromptGovernanceTransferDraft` | POST | `.../transfer-drafts/prompt-governance` | `nashir.creator_studio.transfer.create` + `nashir.prompt_governance.read` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard |
| `getCreatorTransferDraft` | GET | `.../creator-studio/transfer-drafts/{transferId}` | `nashir.creator_studio.transfer.create` | authGuard → workspaceContextGuard → nonDisclosingMembershipCheck → permissionGuard |

---

## 11. Human Review and Approval Boundary

| Action | Human Approval Required | Who Can Approve | Never Automatic in V1 |
|---|---|---|---|
| CampaignContent approve/reject | **YES** | reviewer, admin, owner (not the content creator themselves) | **YES** |
| Creator Studio transfer drafts | **YES** (human confirms before any destination receives the draft) | creator, admin, owner | **YES** |
| Publishing scheduling | **YES** | publisher, admin, owner | **YES** |
| Publishing evidence submission | **YES** (human submits; system does not generate evidence) | publisher, admin | **YES** |
| Publishing evidence acceptance/invalidation | **YES** | admin, owner (evidence_reviewer overlay) | **YES** |
| Prompt governance version approval | **YES** | admin, owner | **YES** |
| Prompt governance version deprecation | **YES** | admin, owner | **YES** |
| Model routing rule creation/update | **YES** | admin, owner | **YES** |
| Secret/integration connection | **YES** | admin, owner | **YES** |
| AI-generated content in campaigns | **YES — must pass review before approval** | reviewer, admin, owner | **YES** |
| AI suggestions in Creator Studio | **YES — advisory only; must not auto-create records** | creator (selects), then reviewer/admin for downstream actions | **YES** |
| Team membership changes | **YES** | admin, owner | **YES** |
| Cost threshold changes | **YES** | admin, owner, billing_admin | **YES** |
| Any external platform action | **YES — platform OAuth gated; out of V1** | N/A | **YES** |

**Hard rules:**
- No automatic publishing in V1. No automatic external platform posting.
- AI suggestions never perform protected actions (no auto-approve, no auto-reject, no auto-publish, no auto-schedule).
- Readiness score does not authorize any action. Approval is separate.
- A creator may not approve their own content.
- Service/system actors may not perform human-only actions.

---

## 12. Sensitive Operations and Secrets Boundary

| Sensitive Domain | Role Required | Audit Required | Storage Rule |
|---|---|---|---|
| OAuth connections (Post-V1) | admin, owner | YES | External provider; only OAuth state/token reference in DB; never raw token |
| API keys / model provider credentials | admin, owner | YES | External vault only; Nashir DB stores vault_ref (opaque ID); no raw key value ever returned in API |
| Publishing credentials | admin, owner | YES | External vault; same rule as API keys |
| Integration tokens | admin, owner (Post-V1) | YES | External vault; opaque reference only |
| Creator handle reference | creator, admin, owner (within session) | YES | Stored as opaque handle_ref; never raw platform handle |
| Team membership changes | admin, owner | YES | Membership change recorded in AuditLog |
| Permission/role changes | admin, owner | YES | Role change recorded in AuditLog |
| Cost threshold changes | billing_admin, admin, owner | YES | AuditLog entry required |
| Prompt governance approval | admin, owner | YES | AuditLog + PromptGovernanceVersion approval record |
| Content approval decision | reviewer, admin, owner | YES | ApprovalDecision record + AuditLog |
| Publishing evidence acceptance | admin, owner (evidence_reviewer overlay) | YES | ManualPublishEvidence record + AuditLog |

**Hard rules:**
- Raw secret values must never appear in any Nashir domain entity, API response body, log entry, or generated type.
- Vault references (opaque IDs) are the only form in which credential handles appear in Nashir DB.
- `payloadSummary` in creator transfer drafts must not expose raw platform tokens or prompt text (per nashir_v1_openapi.yaml spec).
- API responses must never include raw credential values in any field.

---

## 13. Audit and Evidence Requirements

| Action Class | AuditEvent Required | Notes |
|---|---|---|
| User session / login | YES (if Nashir manages auth session; may be external) | Platform-level; defer to auth provider integration |
| Workspace membership add/remove/role change | **YES** | AuditLog entry with actor, role, timestamp |
| Integration connect/disconnect | **YES (Post-V1)** | AuditLog entry |
| Prompt governance version approve/deprecate | **YES** | PromptGovernanceVersion state change + AuditLog |
| Model routing rule create/update | **YES** | AuditLog entry |
| Campaign content review submitted | **YES** | AuditLog entry; status transition logged |
| Campaign content approved/rejected | **YES** | ApprovalDecision record + AuditLog |
| Publishing queue item created/updated | **YES** | AuditLog entry |
| Publishing scheduled | **YES** | AuditLog entry; human actor required |
| Creator Studio transfer draft created | **YES** | AuditLog entry; no raw handle/token in event body |
| API key/secret created/rotated/deleted | **YES** | AuditLog entry; no raw value logged |
| Cost threshold changed | **YES** | AuditLog entry |
| Team permission change | **YES** | AuditLog entry |
| Manual publishing evidence submitted | **YES** | ManualPublishEvidence record; AuditLog entry |
| Evidence accepted/invalidated | **YES** | ManualPublishEvidence state change + AuditLog |

---

## 14. marketing-os Reuse Assessment

| marketing-os Concept / File | Observed Role | Reuse Category | Nashir Adaptation Required | Risk |
|---|---|---|---|---|
| `src/rbac.js` — roles, permissions, rolePermissions, hasPermission | Full RBAC authority: roles (owner/admin/creator/reviewer/publisher/billing_admin/viewer), permissions (dot notation), role-permission assignments | **Reuse after reconciliation** | Add Nashir-specific permission codes (nashir.store.*, nashir.content.*, nashir.creator_studio.*, etc.); keep existing four nashir.* codes; extend rolePermissions map for each Nashir permission | Medium — must not break existing marketing-os permissions; additive only |
| `src/guards.js` — authGuard, workspaceContextGuard, membershipCheck, nonDisclosingMembershipCheck, permissionGuard, rejectBodyWorkspaceId | Guard pipeline for every protected route | **Reuse after reconciliation** | Apply same guard chain to all Nashir routes; no logic changes needed; add `nashir.creator_studio.use` etc. as permission codes passed to permissionGuard | Low — pattern is clean and directly applicable |
| `src/error-model.js` — AppError, correlationId, errorBody | Error handling with status, code, message, userAction, correlation_id | **Reuse after reconciliation** | Bridge Nashir V1 ErrorCode enum (nashir_v1_openapi.yaml) to AppError code field; map creator_studio.session.not_found → AppError 404/NOT_FOUND, etc. | Medium — requires explicit mapping table |
| marketing-os workspace/membership store pattern | Workspace, membership, role lookup from in-memory store | **Reuse after reconciliation** | Nashir uses same workspace/membership pattern; extend to DB-backed when Slice 0 is implemented | Low |
| `docs/nashir_role_permission_matrix.md` | Nashir Core V1 planning roles (owner/admin/editor/viewer + overlays) | **Reuse after reconciliation** | Reconcile with marketing-os seven roles; map editor → creator, evidence_reviewer → reviewer overlay; billing_admin and publisher are separate marketing-os roles | Medium — role name divergence (editor vs creator) must be resolved |
| marketing-os WorkspaceMember / membership store | Team membership lookup; member_status active check | **Reuse after reconciliation** | Nashir WorkspaceMember follows same pattern; extends to DB-backed at Slice 0 | Low |
| marketing-os nonDisclosingMembershipCheck | Returns 404 (not 403) for non-members to prevent workspace enumeration | **Reuse after reconciliation** | Apply to Creator Studio GET operations where session/draft owner scoping is required | Low |
| marketing-os seven-role set | Operational role codes used in rbac.js | **Reuse after reconciliation** | Adopt same role_codes for Nashir; extend rolePermissions to include all new nashir.* permissions | Low |
| marketing-os RBAC test patterns | Tests for permission codes and guard behavior | **Reference only** | Nashir tests must cover Nashir permission codes; adapt test patterns | Low |
| marketing-os billing_admin role | Cost/budget management role | **Reuse after reconciliation** | Maps to Nashir Finance/Ops Viewer; adapts to nashir.cost.read/manage permissions | Low |

---

## 15. Auth/RBAC Data Model Candidate

Conceptual entities only. No SQL DDL. No migrations.

**User**
- Purpose: Human actor; holds PII; may be workspace member.
- V1 status: IN
- Relationships: has many WorkspaceMember records across workspaces.
- Privacy: HIGH — PII owner; store userId reference only in Nashir DB; PII in auth provider.
- Notes: Auth provider integration (JWT/token) is separate from Nashir domain entities.

**Workspace**
- Purpose: Top-level tenant boundary.
- V1 status: IN — reuse marketing-os Workspace entity.
- Relationships: has one StoreProfile; has many WorkspaceMembers; owns all domain objects.
- Privacy: LOW.

**StoreProfile**
- Purpose: Commerce identity; one per workspace in V1.
- V1 status: IN — new entity.
- Relationships: 1:1 with Workspace.
- Privacy: LOW–MEDIUM.

**WorkspaceMember** (TeamMember)
- Purpose: Links User to Workspace with role.
- V1 status: IN — reuse marketing-os WorkspaceMember entity.
- Relationships: belongs to User; belongs to Workspace; references Role via role_code; has member_status.
- Privacy: MEDIUM — links user identity to workspace.

**Role**
- Purpose: Named permission bundle; workspace-scoped.
- V1 status: IN — reuse marketing-os Role entity; extend with Nashir permission assignments.
- Relationships: has many Permissions through RolePermission.
- Privacy: LOW.

**Permission**
- Purpose: Discrete authorization code.
- V1 status: IN — reuse marketing-os Permission entity; add all new nashir.* codes.
- Relationships: many-to-many with Role through RolePermission.
- Privacy: LOW.

**RolePermission**
- Purpose: Maps role_code to permission_code.
- V1 status: IN — reuse marketing-os RolePermission entity.
- Privacy: LOW.

**Actor** (derived at request time)
- Purpose: Identifies who performed an action; derived from authGuard + membershipCheck.
- V1 status: IN (derived) — no separate table needed in V1; actor context comes from authenticated request.
- Privacy: MEDIUM — actor identity associated with audit events.

**AuditEvent**
- Purpose: Append-only record of sensitive state transitions.
- V1 status: IN — reuse marketing-os AuditLog entity.
- Relationships: references domain object (polymorphic), actor (userId), workspace.
- Privacy: MEDIUM — governance record; append-only; never deleted.

**IntegrationConnection owner reference**
- Purpose: When integration connections are implemented (Post-V1), they must carry workspaceId and actor reference.
- V1 status: DEFER.
- Privacy: HIGH — OAuth tokens; vault references only.

---

## 16. OpenAPI Security Implications

| Implication | Detail |
|---|---|
| Current OpenAPI security scheme | nashir_v1_openapi.yaml has a global bearer auth placeholder (`bearerAuth`). No operation-level permission codes are documented in the current YAML. |
| Required future update | A future OpenAPI security update gate must add operation-level `x-permission` extensions or security requirement objects to each operation, mapping to the permission codes defined in Section 10. |
| Why this gate must close before migration | nashir_openapi_source_of_truth_gate.md explicitly states that operation-level security must be mapped before OpenAPI migration can be planned. This gate provides the mapping. |
| No OpenAPI YAML changes in this slice | nashir_v1_openapi.yaml must not be changed in this gate. The operation security mapping (Section 10) is input to a future Nashir OpenAPI Security Mapping Gate. |
| nonDisclosingMembershipCheck implication | Creator Studio GET operations (getCreatorStudioSession, getCreatorContextDraft, getCreatorTransferDraft) must use nonDisclosingMembershipCheck to return 404 rather than 403 for non-members. This prevents workspace enumeration and must be noted in the OpenAPI description text of those operations. |
| Self-approval prevention | approveCampaignContent must enforce that the approver is not the content creator. This is a service-layer check, not a permission check. The OpenAPI cannot express it; it must be documented in operation description and enforced at the service layer. |
| Secret exposure rule | No operation may return raw secret, vault token, creator handle, or platform OAuth credential in any response field. This applies to all operations and must be stated in server-level OpenAPI extensions. |

---

## 17. Blocking Findings

| ID | Finding | Severity | Resolution gate |
|---|---|---|---|
| B-RBAC01 | Final auth provider not selected — Nashir V1 requires a concrete auth mechanism (JWT, session token, API key); marketing-os uses X-User-Id header as a mock; production auth requires a real provider decision | **HIGH** | Nashir Backend Slice 0 Planning |
| B-RBAC02 | Role name reconciliation needed — marketing-os uses `creator` role; nashir_role_permission_matrix.md uses `editor` role; must pick one canonical role_code before implementation | **MEDIUM** | Nashir Auth/RBAC Review Gate |
| B-RBAC03 | Nashir permission codes not yet extended in marketing-os rbac.js — only four existing Nashir codes; all new nashir.* codes from Section 8 must be added in a separate implementation PR | **HIGH** | Nashir Backend Slice 0 Planning |
| B-RBAC04 | Operation-level security not mapped in nashir_v1_openapi.yaml — current contract has placeholder bearer auth only | **HIGH** | Nashir OpenAPI Security Mapping Gate |
| B-RBAC05 | Self-approval enforcement not captured — approveCampaignContent must prevent creator self-approval; no OpenAPI mechanism exists; service layer enforcement must be explicitly designed | **MEDIUM** | Nashir Backend Slice 0 Planning |
| B-RBAC06 | Workspace/store scoping confirmation — all domain objects must carry workspaceId; storeProfileId optionally for Post-V1 scoping; must be confirmed in SQL Schema Planning Gate schema | **MEDIUM** | Nashir SQL Schema Planning Gate |
| B-RBAC07 | nonDisclosingMembershipCheck vs membershipCheck assignment — Creator Studio GET ops must use nonDisclosingMembershipCheck; assignment must be explicitly stated in Backend Slice 0 Planning | **MEDIUM** | Nashir Backend Slice 0 Planning |
| B-RBAC08 | Audit event schema for Nashir-specific events — AuditLog column structure must support nashir_domain.action event types; must be confirmed at SQL Schema Planning Gate | **MEDIUM** | Nashir SQL Schema Planning Gate |
| B-RBAC09 | Secret/vault reference storage pattern not yet specified in SQL schema — how vault_ref is stored, what columns look like, and how the vault is referenced must be decided | **MEDIUM** | Nashir SQL Schema Planning Gate |

---

## 18. Non-blocking Findings / Watch Items

| ID | Finding | Action |
|---|---|---|
| W-RBAC01 | UI mock TeamCollaborationPage shows mock roles (Admin, Editor, Viewer in Arabic). These do not enforce real permissions. Mock roles may not exactly match V1 role_codes but are UI display concerns only. | No action required on UI; carry role_codes as canonical in backend |
| W-RBAC02 | Generated types (src/generated/creator-studio-openapi-types/index.d.ts) do not imply authorization readiness. Type annotations in JSDoc do not implement RBAC. | Carry W-CONS-5 forward |
| W-RBAC03 | marketing-os RBAC code (src/rbac.js) may only be reused after implementation planning. The rolePermissions map must be extended with all new nashir.* codes in an approved marketing-os PR. | Carry to Backend Slice 0 Planning |
| W-RBAC04 | Role list may need refinement after backend slice planning. Specifically, whether `publisher` and `billing_admin` as separate roles versus overlays is a UX decision that should be confirmed before SQL schema defines role seed data. | Carry to Auth/RBAC Review Gate |
| W-RBAC05 | marketing-os billing_admin role has no `nashir.campaign.read` permission in the existing rolePermissions map. If billing_admin needs to view campaign cost impact, nashir.campaign.read should be added. | Carry to Backend Slice 0 Planning |
| W-RBAC06 | Creator Studio sessions use `nonDisclosingMembershipCheck` to return 404 (not 403) for non-members. This design choice prevents workspace enumeration but may confuse legitimate session lookups. The session TTL behavior (410 Gone for expired sessions) must be clearly distinct from 404 Not Found. | Carry to OpenAPI Security Mapping Gate |
| W-RBAC07 | The dot notation decision (Section 8) aligns with marketing-os. If nashir_v1_openapi.yaml's ErrorCode enum format (also dots, e.g., `creator_studio.session.not_found`) is treated as consistent, the bridge mapping in Section 14 can use domain prefix matching. | Carry to OpenAPI Security Mapping Gate |

---

## 19. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir Auth/RBAC Review Gate** | This gate | Reviews and accepts the identity model, role model, permission taxonomy, and role-permission matrix defined here; may produce refinements before SQL/implementation work |
| 2 | **Nashir OpenAPI Security Mapping Gate** | Auth/RBAC Review Gate | Maps operation-level permission codes from Section 10 into nashir_v1_openapi.yaml as a YAML change; updates operation descriptions and security extensions; does not implement routes |
| 3 | **Nashir SQL Schema Planning Gate** | Auth/RBAC Review Gate | Produces approved column-level schema for all V1 entities including Role, Permission, WorkspaceMember, audit fields, workspaceId requirements, vault_ref storage pattern |
| 4 | **Nashir Backend Slice 0 Planning** | SQL Schema Planning Gate | Plans first implementable Nashir backend slice; wires guards; selects auth provider; adds permission codes to marketing-os rbac.js; identifies exact allowed/forbidden files |
| 5 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate (after Backend Slice 0) | Approves change to package.json generation script after OpenAPI moves to marketing-os |
| 6 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API; blocked until auth/backend exist |

**The Nashir OpenAPI Migration Planning Gate remains blocked until Auth/RBAC Review Gate and Backend Slice 0 Planning both close** (per nashir_openapi_source_of_truth_gate.md).

**SQL Schema Planning Gate is conditional on the Auth/RBAC Review Gate accepting the identity model and workspace scoping decisions in this document.**

**UI API Integration remains blocked until backend exists, contract authority is settled, and auth provider is operational.**

---

## 20. Decision

### Final decision

| Area | Status |
|---|---|
| Identity model defined | **COMPLETE — documentation only** |
| Workspace/store isolation model defined | **COMPLETE — documentation only** |
| V1 role model defined (seven roles) | **COMPLETE — documentation only** |
| Permission taxonomy defined (dot notation, 35 permission codes) | **COMPLETE — documentation only** |
| Role-to-permission matrix defined | **COMPLETE — documentation only** |
| Operation security mapping defined | **COMPLETE — input to OpenAPI security gate** |
| GO to Nashir Auth/RBAC Review Gate | **GO** |
| GO to Nashir OpenAPI Security Mapping Gate (after review gate accepts) | **GO — after Auth/RBAC Review Gate** |
| CONDITIONAL GO to Nashir SQL Schema Planning Gate | **CONDITIONAL GO — after Auth/RBAC Review Gate accepts this document** |
| Auth implementation (rbac.js, guards.js changes) | **NO-GO** |
| RBAC middleware added | **NO-GO** |
| Backend routes implemented | **NO-GO** |
| OpenAPI YAML changes | **NO-GO** |
| SQL schema / migrations | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |

### Identity summary

| Dimension | Decision |
|---|---|
| V1 workspace model | Single workspace per deployment for a given actor |
| V1 store model | Single StoreProfile per workspace |
| Workspace scoping | ALL domain objects must carry workspaceId |
| workspace_id from body | NEVER trusted — rejectBodyWorkspaceId enforced |
| Cross-workspace access | NO-GO |
| Permission notation | Dot notation: `nashir.domain.action` and `domain.action` |
| Role model | Seven roles: owner, admin, creator, reviewer, publisher, billing_admin, viewer |
| Auth provider | Not yet selected — required in Backend Slice 0 Planning |

### Next gate

**Nashir Auth/RBAC Review Gate**

That gate must:
- Review and accept the seven-role model and permission taxonomy defined here.
- Resolve the role name divergence (marketing-os `creator` vs nashir matrix `editor`).
- Confirm the role-to-permission matrix before it is implemented in marketing-os `src/rbac.js`.
- Confirm the operation security mapping as input to the OpenAPI Security Mapping Gate.
- Not authorize implementation. It is a documentation-only review gate.

Until the Auth/RBAC Review Gate closes and accepts this document, no auth implementation, RBAC middleware, SQL schema, or route implementation may begin.
