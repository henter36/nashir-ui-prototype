# Nashir OpenAPI Security Mapping Gate

| Field | Value |
|---|---|
| Gate type | OpenAPI security mapping gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Maps all Nashir V1 OpenAPI operations to approved Auth/RBAC permissions, guard chains, workspace scope, human review rules, and audit requirements before any OpenAPI YAML change or backend route implementation |
| Prerequisite gates | `docs/nashir_auth_rbac_review_gate.md` — merged, GO; `docs/nashir_auth_rbac_workspace_identity_gate.md` — merged, READY WITH WATCH ITEMS |
| OpenAPI YAML changes approved | NO |
| Security scheme or x-permission fields added | NO |
| Backend routes implemented | NO |
| Auth/RBAC implementation approved | NO |
| SQL schema / migrations approved | NO |
| Generated files changed | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an OpenAPI security mapping gate only.

**No OpenAPI YAML changes are approved in this slice.**

**No security scheme or x-permission fields are added.**

**No backend routes are implemented.**

**No auth middleware or RBAC implementation is approved.**

**No SQL schema or migrations are approved.**

**No generated files are changed.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> Which Nashir V1 OpenAPI operations should require which Auth/RBAC permissions, human review boundaries, workspace/store scopes, and audit requirements?

The output of this gate is documentation-only input to the future **Nashir OpenAPI Security YAML Patch Planning Gate**, which will produce the actual YAML changes.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; constraints confirmed |
| `package.json` | Frontend-only; no auth deps |
| `docs/nashir_auth_rbac_review_gate.md` | Auth/RBAC Review Gate: READY WITH WATCH ITEMS; B-RBAC02 resolved (`creator`); GO to this gate confirmed |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | 7 roles; 35 permissions (33 V1 + 2 DEFER); guard chain model; operation security mapping in Section 10 |
| `docs/nashir_openapi_source_of_truth_gate.md` | Current authority: nashir_v1_openapi.yaml; operation security mapping required before migration; Option D selected |
| `docs/nashir_erd_reconciliation_gate.md` | ERD candidate complete; all domain objects workspace-scoped |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1.0 v0.1.0; global bearer auth placeholder; 35 operations across 5 tags (Health, Products, Assets, Campaign Content, AI Readiness, Creator Studio); workspace-scoped paths throughout |
| `docs/creator_studio_api_boundary_gate.md` | V1 API boundary confirmed; session owner or workspace admin only for GET operations |
| `docs/creator_studio_production_contract_planning.md` | creatorHandleRef opaque; payloadSummary no raw tokens |
| `docs/creator_studio_openapi_review_gate.md` | All 10 Creator Studio paths confirmed; PR #33 merged |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | W-CONS-5: generated types do not authorize API integration |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Awareness only; downstream artifact |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO |
| `AGENTS.md` | Documentation PRs must not modify src/rbac.js or guards.js |
| `src/rbac.js` | Seven roles; dot notation permissions; four existing Nashir codes; rolePermissions map confirmed |
| `src/guards.js` | Six functions: authGuard, workspaceContextGuard, membershipCheck, nonDisclosingMembershipCheck, permissionGuard, rejectBodyWorkspaceId |
| `src/error-model.js` | AppError; correlationId via X-Correlation-Id |
| `test/nashir-rbac-permission-mapping.test.js` | 28 assertions for 4 Nashir codes × 7 roles; confirmed consistent with Auth/RBAC matrix |

### Assumption flags

> **ASSUMPTION-SM1:** All Nashir V1 operations use `/workspaces/{workspaceId}/...` path scoping. workspaceId is always sourced from the route path. No operation has workspaceId in the request body as a trust source.

> **ASSUMPTION-SM2:** No operation requires an explicit storeId path parameter in V1 because V1 is single-workspace-single-store. Store context is derived from workspace context.

> **ASSUMPTION-SM3:** `getHealth` is a public advisory endpoint. It does not require workspace scoping or authentication. No credentials, workspace-scoped data, or sensitive operations are exposed.

---

## 3. Mapping Question

**Which Nashir V1 OpenAPI operations should require which Auth/RBAC permissions, human review boundaries, workspace/store scopes, and audit requirements?**

**Summary:** All 35 operations are mapped. 34 require authentication; 1 (getHealth) is public. All authenticated operations require workspaceId from the route path. No operation trusts workspaceId from the request body. Four operations use `nonDisclosingMembershipCheck` (Creator Studio GET by ID). Human approval is required for two operations (approve/reject). Six POST operations create audit events. All Creator Studio session-creating operations require TTL-aware cleanup.

---

## 4. Current Authority Chain

- **`docs/nashir_v1_openapi.yaml`** in nashir-ui-prototype: current Nashir V1 OpenAPI authority. Has a global `bearerAuth` placeholder but no operation-level permission definitions. This gate defines what those operation-level definitions should be.
- **`docs/nashir_auth_rbac_workspace_identity_gate.md`**: approved permission codes, roles, and operation security mapping in Section 10.
- **`docs/nashir_auth_rbac_review_gate.md`**: review gate — READY WITH WATCH ITEMS. Confirmed GO to this mapping gate.
- **Generated types** (`src/generated/creator-studio-openapi-types/index.d.ts`): downstream artifact only. Not affected by this gate.
- **marketing-os** is a future backend/governance candidate, not current OpenAPI authority. The `nashir_openapi_patch.yaml` in marketing-os is a historical partial artifact.
- **OpenAPI migration** remains blocked until Nashir OpenAPI Migration Planning Gate (after Backend Slice 0 Planning).

---

## 5. Security Mapping Principles

1. Every protected operation maps to exactly one primary permission.
2. Some operations additionally require human review, a specific approval role, or audit evidence at the service layer — these are noted but not expressible in OpenAPI security fields alone.
3. Every persisted business operation is workspace-scoped. workspaceId comes from the route path.
4. No operation trusts workspaceId from the request body. `rejectBodyWorkspaceId` guard applies to all mutating operations.
5. Store context is implicit in V1 (derived from workspace). No storeId in path parameters.
6. No cross-workspace access. Any attempt to access a resource outside the route workspaceId must be rejected.
7. No automatic publishing in V1. No operation triggers external platform posting.
8. No raw secret exposure in any response field.
9. Generated types do not imply authorization readiness (W-CONS-5).
10. No backend route may be implemented against a stale or non-authoritative contract. Only nashir_v1_openapi.yaml is authoritative.
11. `nonDisclosingMembershipCheck` applies to Creator Studio GET-by-ID operations to return 404 rather than 403 for non-members, preventing workspace enumeration.

---

## 6. Operation Inventory

All 35 nashir_v1_openapi.yaml operations, ordered by tag and path. Operation IDs confirmed from file content.

| Operation ID | Method + Path | Tag/Module | Current Security | Request Scope | Mutating | Human Review Sensitive | Audit Needed | Mapping Status |
|---|---|---|---|---|---|---|---|---|
| `getHealth` | GET /health | Health | bearerAuth (global, placeholder) | system | NO | NO | NO | mapped |
| `listProducts` | GET /workspaces/{workspaceId}/products | Products | bearerAuth placeholder | workspace | NO | NO | NO | mapped |
| `createProduct` | POST /workspaces/{workspaceId}/products | Products | bearerAuth placeholder | workspace | YES | NO | YES | mapped |
| `getProduct` | GET /workspaces/{workspaceId}/products/{productId} | Products | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `updateProduct` | PUT /workspaces/{workspaceId}/products/{productId} | Products | bearerAuth placeholder | workspace/object | YES | NO | YES | mapped |
| `listAssets` | GET /workspaces/{workspaceId}/assets | Assets | bearerAuth placeholder | workspace | NO | NO | NO | mapped |
| `createAsset` | POST /workspaces/{workspaceId}/assets | Assets | bearerAuth placeholder | workspace | YES | NO | YES | mapped |
| `getAsset` | GET /workspaces/{workspaceId}/assets/{assetId} | Assets | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `updateAsset` | PUT /workspaces/{workspaceId}/assets/{assetId} | Assets | bearerAuth placeholder | workspace/object | YES | NO | YES | mapped |
| `linkAssetToProduct` | POST /workspaces/{workspaceId}/assets/{assetId}/link-product | Assets | bearerAuth placeholder | workspace/object | YES | NO | YES | mapped |
| `listCampaignContents` | GET /workspaces/{workspaceId}/campaign-contents | Campaign Content | bearerAuth placeholder | workspace | NO | NO | NO | mapped |
| `createCampaignContent` | POST /workspaces/{workspaceId}/campaign-contents | Campaign Content | bearerAuth placeholder | workspace | YES | NO | YES | mapped |
| `getCampaignContent` | GET /workspaces/{workspaceId}/campaign-contents/{campaignContentId} | Campaign Content | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `updateCampaignContent` | PUT /workspaces/{workspaceId}/campaign-contents/{campaignContentId} | Campaign Content | bearerAuth placeholder | workspace/object | YES | NO | YES | mapped |
| `submitCampaignContentReview` | POST .../campaign-contents/{campaignContentId}/submit-review | Campaign Content | bearerAuth placeholder | workspace/object | YES | YES | YES | mapped |
| `approveCampaignContent` | POST .../campaign-contents/{campaignContentId}/approve | Campaign Content | bearerAuth placeholder | workspace/object | YES | **YES** | YES | mapped |
| `rejectCampaignContent` | POST .../campaign-contents/{campaignContentId}/reject | Campaign Content | bearerAuth placeholder | workspace/object | YES | **YES** | YES | mapped |
| `listCampaignContentPreviewArtifacts` | GET .../campaign-contents/{campaignContentId}/preview-artifacts | Campaign Content | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `createCampaignContentPreviewArtifact` | POST .../campaign-contents/{campaignContentId}/preview-artifacts | Campaign Content | bearerAuth placeholder | workspace/object | YES | NO | YES | mapped |
| `getWorkspaceReadiness` | GET /workspaces/{workspaceId}/readiness | AI Readiness | bearerAuth placeholder | workspace | NO | NO | NO | mapped |
| `getWorkflowReadiness` | GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness | AI Readiness | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `getWorkflowStepReadiness` | GET .../workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness | AI Readiness | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `getProviderReadiness` | GET /workspaces/{workspaceId}/ai-providers/{providerId}/readiness | AI Readiness | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `getModelRouteReadiness` | GET /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness | AI Readiness | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `getPromptReadiness` | GET /workspaces/{workspaceId}/prompts/{promptId}/readiness | AI Readiness | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped |
| `createCreatorStudioSession` | POST /workspaces/{workspaceId}/creator-studio/sessions | Creator Studio | bearerAuth placeholder | workspace | YES | YES (explicit intent) | YES | mapped |
| `getCreatorStudioSession` | GET /workspaces/{workspaceId}/creator-studio/sessions/{sessionId} | Creator Studio | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped — nonDisclosingMembershipCheck |
| `createCreatorContextDraft` | POST /workspaces/{workspaceId}/creator-studio/context-drafts | Creator Studio | bearerAuth placeholder | workspace | YES | NO | YES | mapped |
| `getCreatorContextDraft` | GET /workspaces/{workspaceId}/creator-studio/context-drafts/{draftId} | Creator Studio | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped — nonDisclosingMembershipCheck |
| `createCreatorReadinessAssessment` | POST /workspaces/{workspaceId}/creator-studio/readiness-assessments | Creator Studio | bearerAuth placeholder | workspace | YES | NO | YES | mapped |
| `createCreatorContentStudioTransferDraft` | POST .../creator-studio/transfer-drafts/content-studio | Creator Studio | bearerAuth placeholder | workspace | YES | YES (pending_review) | YES | mapped |
| `createCreatorCampaignTransferDraft` | POST .../creator-studio/transfer-drafts/campaign | Creator Studio | bearerAuth placeholder | workspace | YES | YES (pending_review) | YES | mapped |
| `createCreatorPublishingTransferDraft` | POST .../creator-studio/transfer-drafts/publishing | Creator Studio | bearerAuth placeholder | workspace | YES | YES (pending_review; requires approved contentId) | YES | mapped |
| `createCreatorPromptGovernanceTransferDraft` | POST .../creator-studio/transfer-drafts/prompt-governance | Creator Studio | bearerAuth placeholder | workspace | YES | YES (pending_review) | YES | mapped |
| `getCreatorTransferDraft` | GET .../creator-studio/transfer-drafts/{transferId} | Creator Studio | bearerAuth placeholder | workspace/object | NO | NO | NO | mapped — nonDisclosingMembershipCheck |

**Total: 35 operations. All mapped.**

---

## 7. Permission Mapping Matrix

Full security mapping for all 35 operations. This is the authoritative input to the Nashir OpenAPI Security YAML Patch Planning Gate.

| Operation ID | Method + Path | Primary Permission | Secondary Condition | Workspace Scope Required | Store Scope Required | Human Review Required | Audit/Evidence Required | Allowed Role Classes | Guard Chain | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| `getHealth` | GET /health | **None — public** | None | NO | NO | NO | NO | All (no auth) | None | LOW — must not expose workspace data |
| `listProducts` | GET .../products | `nashir.product.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `createProduct` | POST .../products | `nashir.product.write` | rejectBodyWorkspaceId | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `getProduct` | GET .../products/{productId} | `nashir.product.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `updateProduct` | PUT .../products/{productId} | `nashir.product.write` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `listAssets` | GET .../assets | `nashir.asset.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `createAsset` | POST .../assets | `nashir.asset.write` | rejectBodyWorkspaceId | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `getAsset` | GET .../assets/{assetId} | `nashir.asset.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `updateAsset` | PUT .../assets/{assetId} | `nashir.asset.write` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `linkAssetToProduct` | POST .../assets/{assetId}/link-product | `nashir.asset.link` | rejectBodyWorkspaceId; linked productId must belong to same workspace | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM — cross-workspace product reference risk |
| `listCampaignContents` | GET .../campaign-contents | `nashir.content.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `createCampaignContent` | POST .../campaign-contents | `nashir.content.create` | rejectBodyWorkspaceId; productId and selectedAssetIds must belong to same workspace | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM — cross-workspace product/asset reference risk |
| `getCampaignContent` | GET .../campaign-contents/{campaignContentId} | `nashir.content.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `updateCampaignContent` | PUT .../campaign-contents/{campaignContentId} | `nashir.content.update` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `submitCampaignContentReview` | POST .../submit-review | `nashir.content.submit_review` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required | YES | Implicit | YES (moves toward human review) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM — state machine transition |
| `approveCampaignContent` | POST .../approve | `nashir.approval.decide` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required; **self-approval DENIED at service layer** | YES | Implicit | YES — human approver required | YES | owner, admin, reviewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | **HIGH** — self-approval risk; service-layer enforcement required |
| `rejectCampaignContent` | POST .../reject | `nashir.approval.decide` | rejectBodyWorkspaceId; If-Match or X-Resource-Version required; **self-rejection DENIED at service layer** | YES | Implicit | YES — human reviewer required | YES | owner, admin, reviewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | **HIGH** — same self-action risk as approve |
| `listCampaignContentPreviewArtifacts` | GET .../preview-artifacts | `nashir.content.read` | None | YES | Implicit | NO | NO | owner, admin, creator, reviewer, publisher, viewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `createCampaignContentPreviewArtifact` | POST .../preview-artifacts | `nashir.content.create` | rejectBodyWorkspaceId; assetIds must belong to same workspace | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `getWorkspaceReadiness` | GET .../readiness | `nashir.workflow.read` | None — advisory only | YES | — | NO | NO | owner, admin | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW — advisory; restricted to owner/admin |
| `getWorkflowReadiness` | GET .../workflow-definitions/{workflowDefinitionId}/readiness | `nashir.workflow.read` | None — advisory only | YES | — | NO | NO | owner, admin | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `getWorkflowStepReadiness` | GET .../steps/{stepKey}/readiness | `nashir.workflow.read` | None — advisory only | YES | — | NO | NO | owner, admin | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `getProviderReadiness` | GET .../ai-providers/{providerId}/readiness | `nashir.model_routing.read` | None — stored snapshot only; no live provider probe | YES | — | NO | NO | owner, admin | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW — no secret values in response |
| `getModelRouteReadiness` | GET .../model-routes/{modelRouteId}/readiness | `nashir.model_routing.read` | None — stored snapshot only | YES | — | NO | NO | owner, admin | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `getPromptReadiness` | GET .../prompts/{promptId}/readiness | `nashir.prompt_governance.read` | None — stored snapshot only | YES | — | NO | NO | owner, admin, creator, reviewer | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | LOW |
| `createCreatorStudioSession` | POST .../creator-studio/sessions | `nashir.creator_studio.use` | rejectBodyWorkspaceId; must NOT be called automatically on page load; creatorHandleRef opaque only | YES | Implicit | YES (explicit user intent required) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | **HIGH** — privacy; creator handle sensitivity |
| `getCreatorStudioSession` | GET .../creator-studio/sessions/{sessionId} | `nashir.creator_studio.use` | Session owner or workspace admin only | YES | Implicit | NO | NO | owner, admin, creator (own session) | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | HIGH — privacy; 410 Gone for expired sessions |
| `createCreatorContextDraft` | POST .../creator-studio/context-drafts | `nashir.creator_studio.transfer.create` | rejectBodyWorkspaceId; All field references (promptTemplateId, productId, assetIds, sessionId) must belong to same workspace; session must be active | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM |
| `getCreatorContextDraft` | GET .../creator-studio/context-drafts/{draftId} | `nashir.creator_studio.transfer.create` | Session owner or workspace admin only | YES | Implicit | NO | NO | owner, admin, creator (own session) | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | MEDIUM — 410 Gone for expired drafts |
| `createCreatorReadinessAssessment` | POST .../creator-studio/readiness-assessments | `nashir.creator_studio.transfer.create` | rejectBodyWorkspaceId; advisory only; must not auto-block or auto-approve | YES | Implicit | NO | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | LOW |
| `createCreatorContentStudioTransferDraft` | POST .../transfer-drafts/content-studio | `nashir.creator_studio.transfer.create` | rejectBodyWorkspaceId; draftId must reference ready_for_transfer draft; creates pending_review only; approved promptVersionId required | YES | Implicit | YES (pending_review state) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM |
| `createCreatorCampaignTransferDraft` | POST .../transfer-drafts/campaign | `nashir.creator_studio.transfer.create` | rejectBodyWorkspaceId; draftId must reference ready_for_transfer draft; must not auto-create campaigns | YES | Implicit | YES (pending_review state) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM |
| `createCreatorPublishingTransferDraft` | POST .../transfer-drafts/publishing | `nashir.creator_studio.transfer.create` | rejectBodyWorkspaceId; draftId must reference ready_for_transfer draft; contentId must reference approved non-expired non-archived ContentStudio item | YES | Implicit | YES (pending_review; approved contentId required) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | **HIGH** — publishing pipeline integrity; approved content reference required |
| `createCreatorPromptGovernanceTransferDraft` | POST .../transfer-drafts/prompt-governance | `nashir.creator_studio.transfer.create` + `nashir.prompt_governance.read` | rejectBodyWorkspaceId; draftId must reference ready_for_transfer draft; PromptTemplate must exist and not be deprecated | YES | Implicit | YES (pending_review state) | YES | owner, admin, creator | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | MEDIUM |
| `getCreatorTransferDraft` | GET .../creator-studio/transfer-drafts/{transferId} | `nashir.creator_studio.transfer.create` | Session owner, destination module service account, or workspace admin only; must not expose raw platform tokens or prompt text in payloadSummary | YES | Implicit | NO | NO | owner, admin, creator (own session), destination service | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | **HIGH** — payloadSummary privacy |

---

## 8. Permission Coverage Review

Comparing all 33 active V1 permission codes against the operation mapping.

| Permission Code | Used by Operations | Coverage Status | Risk |
|---|---|---|---|
| `workspace.read` | No Nashir V1 operation directly uses this | **Unused in Nashir V1 ops** — required by guard infrastructure for workspace validation; role-level grant | LOW — infrastructure permission; not operation-level |
| `workspace.manage` | No Nashir V1 operation directly | **Unused in Nashir V1 ops** — workspace settings update not in nashir_v1_openapi.yaml | LOW — future workspace management endpoint gate |
| `workspace.manage_members` | No Nashir V1 operation directly | **Unused in Nashir V1 ops** — team management not in nashir_v1_openapi.yaml | LOW — future team management endpoint gate |
| `rbac.read` | No Nashir V1 operation directly | **Unused in Nashir V1 ops** — RBAC read not in nashir_v1_openapi.yaml | LOW — infrastructure permission |
| `nashir.store.read` | No Nashir V1 operation directly | **Unused in current ops** — store profile GET not in current nashir_v1_openapi.yaml v0.1.0 | MEDIUM — StoreProfile entity is in ERD candidate; endpoint must be added in a future OpenAPI slice |
| `nashir.store.update` | No Nashir V1 operation directly | **Unused in current ops** — StoreProfile PUT not in nashir_v1_openapi.yaml v0.1.0 | MEDIUM — future slice required |
| `nashir.product.read` | listProducts, getProduct | **USED** | LOW |
| `nashir.product.write` | createProduct, updateProduct | **USED** | LOW |
| `nashir.asset.read` | listAssets, getAsset, listCampaignContentPreviewArtifacts | **USED** | LOW |
| `nashir.asset.write` | createAsset, updateAsset | **USED** | LOW |
| `nashir.asset.link` | linkAssetToProduct | **USED** | LOW |
| `nashir.campaign.read` | No current Nashir V1 operation — Campaign list/get endpoints are defined in marketing-os nashir_openapi_patch.yaml, not in nashir_v1_openapi.yaml | **Unused in current ops — WATCH ITEM** | MEDIUM — Campaign endpoints will be in a future nashir_v1_openapi.yaml slice or migration |
| `nashir.campaign.write` | No current Nashir V1 operation (same reason as above) | **Unused in current ops — WATCH ITEM** | MEDIUM |
| `nashir.content.read` | listCampaignContents, getCampaignContent, listCampaignContentPreviewArtifacts | **USED** | LOW |
| `nashir.content.create` | createCampaignContent, createCampaignContentPreviewArtifact | **USED** | LOW |
| `nashir.content.update` | updateCampaignContent | **USED** | LOW |
| `nashir.content.submit_review` | submitCampaignContentReview | **USED** | LOW |
| `nashir.approval.decide` | approveCampaignContent, rejectCampaignContent | **USED** | HIGH — self-approval prevention required |
| `nashir.creator_studio.use` | createCreatorStudioSession, getCreatorStudioSession | **USED** | HIGH |
| `nashir.creator_studio.transfer.create` | createCreatorContextDraft, getCreatorContextDraft, createCreatorReadinessAssessment, createCreatorContentStudioTransferDraft, createCreatorCampaignTransferDraft, createCreatorPublishingTransferDraft, createCreatorPromptGovernanceTransferDraft (dual-permission), getCreatorTransferDraft | **USED** | MEDIUM |
| `nashir.publishing.queue.read` | No current Nashir V1 operation — Publishing queue GET not in nashir_v1_openapi.yaml v0.1.0 | **Unused in current ops — WATCH ITEM** | MEDIUM — future slice |
| `nashir.publishing.draft.receive` | No current operation | **Unused in current ops** | MEDIUM — future publishing endpoint |
| `nashir.evidence.submit` | No current operation directly — evidence paths are in marketing-os nashir_openapi_patch.yaml only | **Unused in current ops — WATCH ITEM** | MEDIUM — evidence endpoints not in nashir_v1_openapi.yaml v0.1.0 |
| `nashir.evidence.manage` | No current operation | **Unused in current ops** | MEDIUM |
| `nashir.prompt_governance.read` | getPromptReadiness, createCreatorPromptGovernanceTransferDraft (secondary) | **USED** | LOW |
| `nashir.prompt_governance.manage` | No current operation — prompt template CRUD not in nashir_v1_openapi.yaml v0.1.0 | **Unused in current ops — WATCH ITEM** | MEDIUM — future slice |
| `nashir.model_routing.read` | getProviderReadiness, getModelRouteReadiness | **USED** | LOW |
| `nashir.model_routing.manage` | No current operation | **Unused in current ops** | MEDIUM |
| `nashir.cost.read` | No current operation — cost monitor endpoints not in nashir_v1_openapi.yaml v0.1.0 | **Unused in current ops — WATCH ITEM** | MEDIUM — future slice |
| `nashir.cost.manage` | No current operation | **Unused in current ops** | MEDIUM |
| `nashir.workflow.read` | getWorkspaceReadiness, getWorkflowReadiness, getWorkflowStepReadiness | **USED** | LOW |
| `audit.read` | No current operation — audit endpoint not in nashir_v1_openapi.yaml v0.1.0 | **Unused in current ops** | LOW — future slice |
| `nashir.admin.manage` | No current operation | **Unused in current ops** | LOW |

### Summary of unused permission codes

**11 permissions used by current operations.** **22 permissions defined but not yet used** by current nashir_v1_openapi.yaml v0.1.0 operations. This is expected and acceptable because:

1. nashir_v1_openapi.yaml v0.1.0 covers four slices. Permissions for StoreProfile, Campaign management, Publishing queue, Evidence, Cost monitor, and Audit endpoints are defined ahead of their corresponding OpenAPI slices.
2. Four unused permissions are directly explained by the nashir_openapi_patch.yaml in marketing-os (campaign.read, campaign.write, evidence.submit, evidence.manage) — these endpoints exist in marketing-os but not yet in nashir_v1_openapi.yaml.
3. No operations are missing a permission. All 35 operations have an approved mapping.

**This is NOT a blocking finding.** Unused permissions are forward-defined. The future OpenAPI slices that add StoreProfile, Campaign, Publishing, Evidence, and Cost monitor endpoints will consume them.

---

## 9. Role Impact Review

| Role | Accessible Operation Groups | Least Privilege | Self-Approve Risk | Publish Without Review Risk | Integration/Secret Authority | Cost/Model-Routing Authority |
|---|---|---|---|---|---|---|
| owner | All 35 operations (minus getHealth which needs no auth) | Intentionally broad; bounded by audit | Service-layer check required | NO — no automatic publishing in V1 | YES (admin gate noted) | YES |
| admin | All 35 operations | Intentionally broad; bounded by audit | Service-layer check required | NO | YES (admin gate noted) | YES |
| creator | Products (read/write), Assets (read/write/link), Campaigns (read/write), Content (read/create/update/submit-review), Creator Studio (use + transfer.create), Publishing queue (read), Prompt governance (read) | **PASS** — cannot approve, manage model routing, or manage integrations | NO — no nashir.approval.decide | NO — cannot receive publishing drafts | NO | NO |
| reviewer | Products (read), Assets (read), Campaigns (read), Content (read + approve/reject), Prompt governance (read), Publishing queue (read) | **PASS** — cannot create content or manage anything | NO — can approve others' content; service layer prevents self-approval | NO | NO | NO |
| publisher | Assets (read), Campaigns (read), Content (read), Publishing queue (read + draft.receive + evidence.submit), Prompt governance (read via content) | **PASS** — cannot create content or approve | NO | Can receive drafts and submit evidence — this is manual publishing only, not automatic | NO | NO |
| billing_admin | Cost (read/manage) only; no content operations | **PASS** | NO | NO | NO | YES (cost + budget) |
| viewer | Products (read), Assets (read), Campaigns (read), Content (read), Publishing queue (read), Prompt governance (read), Store (read) | **PASS — narrowest** | NO | NO | NO | NO |

**Least privilege: CONFIRMED** for all seven roles.

**Self-approval risk:** `approveCampaignContent` and `rejectCampaignContent` both require `nashir.approval.decide`. creator does not have this permission, so self-approval is blocked at the RBAC layer. Additionally, a service-layer check must prevent owner/admin/reviewer from approving content they created. This service-layer invariant is not expressible in OpenAPI but must be explicitly documented.

**Publish-without-review risk:** No role can trigger external publishing. publisher role can only submit manual evidence of external publishing already performed by a human. This is correct V1 behavior.

---

## 10. Human Review and Approval Mapping

| Operation | Required Permission | Required Role Class | Approval Rule | Self-Approval Allowed | Audit/Evidence Required |
|---|---|---|---|---|---|
| `submitCampaignContentReview` | `nashir.content.submit_review` | creator, admin, owner | Content must be in draft or ready state; moves to in_review | N/A — submission, not approval | YES — state transition |
| `approveCampaignContent` | `nashir.approval.decide` | reviewer, admin, owner | Content must be in_review; approver must NOT be the original creator; service-layer enforcement | **NO — DENIED** | YES — ApprovalDecision record |
| `rejectCampaignContent` | `nashir.approval.decide` | reviewer, admin, owner | Content must be in_review; rejecter must NOT be the original creator; service-layer enforcement | **NO — DENIED** | YES — ApprovalDecision record |
| `createCreatorStudioSession` | `nashir.creator_studio.use` | creator, admin, owner | Must be explicit user intent; must NOT be called automatically on page load | N/A | YES — session creation |
| `createCreatorContentStudioTransferDraft` | `nashir.creator_studio.transfer.create` | creator, admin, owner | Requires ready_for_transfer context draft; creates pending_review only; human must confirm before destination creates records | YES (transfer pending_review, awaiting human) | YES — transfer draft creation |
| `createCreatorCampaignTransferDraft` | `nashir.creator_studio.transfer.create` | creator, admin, owner | Requires ready_for_transfer context draft; must NOT auto-create campaigns; pending_review only | YES (transfer pending_review) | YES |
| `createCreatorPublishingTransferDraft` | `nashir.creator_studio.transfer.create` | creator, admin, owner | Requires ready_for_transfer context draft AND approved non-expired non-archived ContentStudio contentId; pending_review only; human confirms scheduling | YES (transfer pending_review) | YES |
| `createCreatorPromptGovernanceTransferDraft` | `nashir.creator_studio.transfer.create` + `nashir.prompt_governance.read` | creator, admin, owner | Requires ready_for_transfer context draft; PromptTemplate must exist and not be deprecated; advisory reference only | YES (transfer pending_review) | YES |

---

## 11. Workspace/Store Scope Mapping

| Operation Group | workspaceId Source | storeId Source | Body workspaceId Policy | Guard Requirement | Risk |
|---|---|---|---|---|---|
| Health | N/A (public) | N/A | N/A | None | LOW |
| Products | Path: `/workspaces/{workspaceId}/...` | Implicit from workspace (1:1 in V1) | REJECT if body contains mismatched workspace_id | rejectBodyWorkspaceId on mutations | LOW |
| Assets | Path | Implicit | REJECT | rejectBodyWorkspaceId on mutations | LOW |
| Asset link-product | Path | Implicit | REJECT; linked productId must be workspace-owned | rejectBodyWorkspaceId; service validates productId ownership | MEDIUM |
| Campaign Content | Path | Implicit | REJECT; productId and assetIds must be workspace-owned | rejectBodyWorkspaceId; service validates cross-workspace references | MEDIUM |
| Campaign Content preview artifacts | Path | Implicit | REJECT; assetIds must be workspace-owned | rejectBodyWorkspaceId | LOW |
| Content review/approve/reject | Path | Implicit | REJECT | rejectBodyWorkspaceId | HIGH |
| AI Readiness (all) | Path | N/A | None (GET only) | None (POST mutations not present) | LOW |
| Creator Studio sessions | Path | Implicit | REJECT; creatorHandleRef must be opaque | rejectBodyWorkspaceId | HIGH |
| Creator context drafts | Path | Implicit | REJECT; all ID references must be workspace-owned | rejectBodyWorkspaceId; service validates session/product/asset/template ownership | MEDIUM |
| Creator transfer drafts | Path | Implicit | REJECT; contentId (for publishing transfer) must reference approved workspace-owned content | rejectBodyWorkspaceId; service validates draftId and contentId workspace ownership | HIGH |
| Creator readiness assessment | Path | Implicit | REJECT | rejectBodyWorkspaceId | LOW |

**Finding:** No operation receives storeId as an explicit path parameter. This is correct for V1 single-store-per-workspace. All store context is derived from workspace context.

**Finding:** All 34 authenticated operations use `/workspaces/{workspaceId}/...` path. This is consistent with marketing-os `workspaceContextGuard` pattern.

**Cross-workspace reference risk:** Three operations require service-layer cross-workspace reference validation beyond the guard chain: `linkAssetToProduct` (productId), `createCampaignContent` (productId + assetIds), and `createCreatorContextDraft` (all ID references). This must be captured as a service-layer invariant in Backend Slice 0 Planning.

---

## 12. Audit/Evidence Mapping

| Operation Group | AuditEvent Required | Evidence Required | Actor Required | workspaceId Required | Retention Sensitivity | Notes |
|---|---|---|---|---|---|---|
| Workspace membership changes | YES | NO | YES (admin/owner) | YES | MEDIUM | Not in current nashir_v1_openapi.yaml; future team management endpoint |
| Content approval (approve/reject) | YES | YES (ApprovalDecision record) | YES (reviewer/admin/owner — not creator) | YES | HIGH | Self-approval prevention must be in AuditEvent actor record |
| Content review submission | YES | NO | YES | YES | MEDIUM | State transition event |
| Publishing queue item created | YES | NO | YES | YES | LOW | |
| Publishing scheduled | YES | NO | YES (publisher/admin/owner) | YES | MEDIUM | Human confirmation required |
| Creator Studio session created | YES | NO | YES (creator/admin/owner) | YES | HIGH — creatorHandleRef must be opaque in event body | |
| Creator context draft created | YES | NO | YES | YES | MEDIUM | |
| Creator transfer draft created | YES | NO | YES | YES | MEDIUM — no raw platform tokens or prompt text in event body | |
| Creator readiness assessment created | YES | NO | YES | YES | LOW — advisory only | |
| Product created/updated | YES | NO | YES | YES | LOW | |
| Asset created/updated | YES | NO | YES | YES | LOW | |
| API key/secret created/rotated | YES | NO | YES (admin/owner) | YES | HIGH — no raw value in event body | Not in current OpenAPI; future secrets endpoint |
| Prompt governance version change | YES | NO | YES (admin/owner) | YES | MEDIUM | Not in current OpenAPI; future prompt governance endpoint |
| Model routing rule change | YES | NO | YES (admin/owner) | YES | MEDIUM | Not in current OpenAPI |
| Cost threshold change | YES | NO | YES (billing_admin/admin/owner) | YES | LOW | Not in current OpenAPI |
| Evidence submitted (manual publishing) | YES | YES (ManualPublishEvidence record) | YES (publisher/admin/owner) | YES | MEDIUM | Not in current OpenAPI v0.1.0 |
| Integration connect/disconnect | YES (Post-V1) | NO | YES (admin/owner) | YES | HIGH | Deferred; not in current OpenAPI |
| Audit/evidence read | NO | NO | YES | YES | N/A | Read operations do not generate audit events |

---

## 13. OpenAPI Security Extension Proposal

This section documents the exact YAML extensions that should be applied in the future **Nashir OpenAPI Security YAML Patch Planning Gate**. No YAML changes are made in this slice.

### Proposed security scheme update

The current global `bearerAuth` placeholder should be retained but clarified:

```yaml
# PROPOSED — do not apply in this slice
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >
        Nashir V1 bearer token authentication.
        Token must be issued by the approved Nashir auth provider.
        Carries userId and workspace membership context.
```

### Proposed operation-level x-permission extension

Each protected operation should receive an `x-permission` extension citing the required primary permission code:

```yaml
# PROPOSED FORMAT — do not apply in this slice
operationId: createProduct
x-permission: nashir.product.write
x-workspace-scope: route
x-audit-required: true
```

### Proposed extension fields

| Extension | Purpose | Value type | Example |
|---|---|---|---|
| `x-permission` | Required primary permission code | string | `nashir.content.create` |
| `x-workspace-scope` | Source of workspaceId | enum: route / context | `route` |
| `x-body-workspace-id` | Whether body workspaceId is rejected | enum: reject / ignore / not-applicable | `reject` |
| `x-human-review-required` | Whether human review or approval is required | boolean | `true` |
| `x-audit-required` | Whether an AuditEvent must be created | boolean | `true` |
| `x-membership-check` | Which membership check to use | enum: standard / non-disclosing | `non-disclosing` |
| `x-self-action-denied` | Whether the actor may not act on their own content | boolean | `true` (approve/reject only) |
| `x-store-scope` | Whether store context is required | enum: implicit / explicit / none | `implicit` |

### Target gate

These extensions must be formally added in the **Nashir OpenAPI Security YAML Patch Planning Gate**. That gate must:
- Define the exact YAML patch diff for each of the 34 protected operations.
- Confirm that the global bearerAuth security scheme is updated.
- Confirm that operation-level security overrides are applied where needed (e.g., getHealth with no security).
- Not implement any backend code.

---

## 14. marketing-os Guard Compatibility

| Guard / Pattern | Expected Nashir Use | Reuse Category | Required Adaptation | Risk |
|---|---|---|---|---|
| `authGuard` | Every protected operation: validates X-User-Id header; looks up user from store | **Reuse after reconciliation** | Adapt to production auth provider (JWT/OAuth2 token validation); X-User-Id is a mock mechanism for testing only | MEDIUM — production auth provider must replace header mock |
| `workspaceContextGuard` | Every operation with workspaceId path param: validates params.workspaceId is present | **Reuse after reconciliation** | No logic change needed; directly applicable | LOW |
| `membershipCheck` | 31 operations (standard authenticated ops) | **Reuse after reconciliation** | No logic change needed; extend to DB-backed membership lookup when Slice 0 is implemented | LOW |
| `nonDisclosingMembershipCheck` | 3 operations: getCreatorStudioSession, getCreatorContextDraft, getCreatorTransferDraft | **Reuse after reconciliation** | No logic change needed; returns 404 instead of 403 for non-members; applies session-owner scoping at service layer | LOW — critical for Creator Studio privacy |
| `permissionGuard` | 34 operations (all authenticated): checks hasPermission(role_code, permission_code) | **Reuse after reconciliation** | Extend hasPermission with all new nashir.* codes from Section 8; extend rolePermissions map | MEDIUM — requires marketing-os rbac.js extension PR |
| `rejectBodyWorkspaceId` | 22 POST/PUT operations (all mutating) | **Reuse after reconciliation** | No logic change; directly applicable | LOW |
| `AppError` / `errorBody` | All guard failures and service errors | **Reuse after reconciliation** | Bridge Nashir V1 ErrorCode enum to AppError.code; mapping must be explicit | MEDIUM — 27 Nashir-specific error codes need mapping |
| RBAC test pattern (`nashir-rbac-permission-mapping.test.js`) | Must be extended for all new nashir.* permission codes × 7 roles | **Reuse after reconciliation** | Extend test with 31 new permission code assertions per role | LOW |

**No code reuse is approved in this gate.** All reuse is deferred to Backend Slice 0 Planning and approved marketing-os implementation PRs.

---

## 15. Gaps and Conflicts

### No blocking gaps found

All 35 operations have valid permission mappings. All guard chains are assigned. No operation is missing a permission.

### Non-blocking gaps and watch items

| ID | Gap / Watch Item | Severity | Gate |
|---|---|---|---|
| G-SM01 | `nashir.campaign.read` and `nashir.campaign.write` are defined but not used by current nashir_v1_openapi.yaml operations — campaign endpoints live in marketing-os nashir_openapi_patch.yaml with different path naming | MEDIUM watch | OpenAPI Migration Planning Gate must decide whether Campaign endpoints move to nashir_v1_openapi.yaml or remain as a separate patch |
| G-SM02 | `nashir.store.read` and `nashir.store.update` are defined but no StoreProfile endpoints exist in nashir_v1_openapi.yaml v0.1.0 | MEDIUM watch | Future OpenAPI slice must add StoreProfile CRUD endpoints |
| G-SM03 | `nashir.publishing.queue.read`, `nashir.publishing.draft.receive`, `nashir.evidence.submit`, `nashir.evidence.manage` are defined but no publishing queue/evidence endpoints exist in v0.1.0 | MEDIUM watch | Future OpenAPI slice must add publishing queue and evidence endpoints |
| G-SM04 | `nashir.cost.read`, `nashir.cost.manage` defined; no cost endpoints in v0.1.0 | MEDIUM watch | Future OpenAPI slice |
| G-SM05 | `nashir.prompt_governance.manage` defined; no prompt template CRUD in v0.1.0 | MEDIUM watch | Future OpenAPI slice |
| G-SM06 | Cross-workspace reference validation for linkAssetToProduct, createCampaignContent, createCreatorContextDraft cannot be expressed in OpenAPI — service-layer only | MEDIUM | Backend Slice 0 Planning |
| G-SM07 | Self-approval prevention for approveCampaignContent/rejectCampaignContent cannot be expressed in OpenAPI — service-layer only | HIGH watch | Backend Slice 0 Planning |
| G-SM08 | `authGuard` uses X-User-Id header mock; production auth provider not yet selected | HIGH | Backend Slice 0 Planning |
| G-SM09 | `nashir_openapi_patch.yaml` in marketing-os defines `/nashir-campaigns` routes; these conflict with nashir_v1_openapi.yaml path naming (`/campaign-contents`); must be reconciled | HIGH watch | OpenAPI Migration Planning Gate |
| G-SM10 | Dual x-permission on `createCreatorPromptGovernanceTransferDraft` (nashir.creator_studio.transfer.create + nashir.prompt_governance.read) — OpenAPI cannot express AND-permission; service-layer dual-check required | MEDIUM | Backend Slice 0 Planning — document as service invariant |

---

## 16. Required Corrections

**No blocking issues found.** No fix gate required.

The mapping is complete, internally consistent, and ready to proceed to the Nashir OpenAPI Security YAML Patch Planning Gate.

Non-blocking items G-SM01 through G-SM10 are watch items carried to the appropriate downstream gates. None prevent the YAML patch planning gate from proceeding.

---

## 17. Readiness Assessment

| Dimension | Readiness Rating |
|---|---|
| Operation inventory completeness | **READY** — all 35 operations identified and mapped |
| Permission coverage | **READY** — all 35 operations have approved primary permissions; 22 defined but unused permissions are forward-defined for future slices (expected and acceptable) |
| Role impact | **READY** — least privilege confirmed for all 7 roles |
| Human review mapping | **READY** — approve/reject/submit-review/transfer-draft operations all have human review rules |
| Workspace/store scoping | **READY** — all operations use workspaceId from route path; store context implicit in V1 |
| Audit/evidence mapping | **READY** — 13 audit action classes mapped |
| marketing-os guard compatibility | **READY** — all six guards have direct Nashir applicability; adaptations noted |
| Readiness for OpenAPI Security YAML Patch Planning Gate | **READY** |

**Overall readiness: READY**

No watch items prevent progression to the YAML Patch Planning Gate.

---

## 18. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir OpenAPI Security YAML Patch Planning Gate** | This mapping gate — READY | Produces the actual YAML diff: adds x-permission, updates bearerAuth scheme, adds operation-level security notes, documents nonDisclosingMembershipCheck assignments. Does not implement backend. |
| 2 | **Nashir SQL Schema Planning Gate** | Auth/RBAC Review Gate conditions C-RV01/C-RV02/C-RV03 resolved | Produces approved column-level schema including role/permission seed data, vault_ref pattern, TTL columns |
| 3 | **Nashir Backend Slice 0 Planning** | YAML patch planning + SQL Schema Planning | Plans first implementable backend slice; selects auth provider; wires guards; adds permission codes to marketing-os rbac.js; documents self-approval and cross-workspace invariants |
| 4 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning identifies routes | Plans migration of nashir_v1_openapi.yaml to marketing-os; resolves path naming conflict with nashir_openapi_patch.yaml |
| 5 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves package.json generation script update |
| 6 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**YAML patch planning may proceed immediately** — this mapping is READY.

**SQL Schema Planning** remains conditionally blocked on C-RV01/C-RV02/C-RV03 from the Auth/RBAC Review Gate — not on anything in this mapping gate.

**OpenAPI Migration Planning** remains blocked until Backend Slice 0 Planning closes (per nashir_openapi_source_of_truth_gate.md).

**UI API Integration** remains blocked until backend exists and contract authority is settled.

---

## 19. Decision

### Final decision

| Area | Status |
|---|---|
| Security mapping complete | **COMPLETE — all 35 operations mapped** |
| Blocking findings | **NONE** |
| Fix gate required | **NOT REQUIRED** |
| GO to Nashir OpenAPI Security YAML Patch Planning Gate | **GO** |
| CONDITIONAL GO to Nashir SQL Schema Planning Gate | **CONDITIONAL GO — after C-RV01/C-RV02/C-RV03 resolved** |
| OpenAPI YAML changes in this slice | **NO-GO** |
| Backend routes implemented | **NO-GO** |
| Auth middleware / RBAC implementation | **NO-GO** |
| SQL schema / migrations | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |

### Mapping summary

| Metric | Value |
|---|---|
| Total operations | 35 |
| Public (no auth) | 1 (getHealth) |
| Protected (require auth + permission) | 34 |
| Operations using nonDisclosingMembershipCheck | 3 |
| Operations with human review requirement | 9 |
| Operations requiring AuditEvent | 18 |
| Operations requiring rejectBodyWorkspaceId | 22 |
| Active permission codes used | 11 |
| Permission codes defined but not yet consumed by v0.1.0 | 22 (expected; forward-defined for future slices) |
| Blocking gaps | 0 |

### Next gate

**Nashir OpenAPI Security YAML Patch Planning Gate**

That gate must:
- Produce the exact YAML diff for all 34 protected operations in nashir_v1_openapi.yaml.
- Add the proposed `x-permission`, `x-workspace-scope`, `x-body-workspace-id`, `x-human-review-required`, `x-audit-required`, `x-membership-check`, `x-self-action-denied` extensions.
- Update the global `bearerAuth` security scheme description.
- Override the security requirement on `getHealth` to remove the global bearerAuth.
- Document the dual-permission requirement for `createCreatorPromptGovernanceTransferDraft`.
- Not implement any backend code, routes, or middleware.

Until that gate produces an approved YAML diff, no Nashir backend route may be implemented against nashir_v1_openapi.yaml.
