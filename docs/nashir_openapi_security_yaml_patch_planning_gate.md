# Nashir OpenAPI Security YAML Patch Planning Gate

| Field | Value |
|---|---|
| Gate type | OpenAPI Security YAML Patch Planning Gate — documentation only |
| Status date | 2026-05-31 |
| Scope | Defines the exact future YAML patch plan for applying OpenAPI security metadata to docs/nashir_v1_openapi.yaml; no YAML changes in this slice |
| Prerequisite gate | `docs/nashir_openapi_security_mapping_gate.md` — merged, READY |
| OpenAPI YAML changes made | NO |
| Generated files changed | NO |
| Backend routes implemented | NO |
| Auth/RBAC implementation approved | NO |
| SQL schema / migrations approved | NO |
| UI API integration approved | NO |
| marketing-os | Read-only in this slice |

---

## 1. Status and Scope

This is an OpenAPI Security YAML Patch Planning Gate only.

**No OpenAPI YAML changes are made in this slice.**

**No generated files are changed.**

**No backend routes are implemented.**

**No auth middleware or RBAC implementation is approved.**

**No SQL schema or migrations are approved.**

**No UI API integration is approved.**

**marketing-os is read-only in this slice.**

This gate answers:

> What exact OpenAPI YAML security metadata should be applied in a later implementation slice, and under what constraints?

The output of this gate is input to the future **Nashir OpenAPI Security YAML Patch Slice**, which will apply the actual YAML changes.

---

## 2. Source Inputs Reviewed

### Verified — nashir-ui-prototype (local)

| Source | Finding |
|---|---|
| `README.md` | UI prototype only; no backend; constraints confirmed |
| `package.json` | `generate:creator-studio-types` script; openapi-typescript ^7.13.0; no OpenAPI validation script |
| `docs/nashir_openapi_security_mapping_gate.md` | **Primary input** — all 35 operations mapped; 34 protected; permission mapping complete; READY; no blocking issues |
| `docs/nashir_auth_rbac_review_gate.md` | READY WITH WATCH ITEMS; B-RBAC02 resolved; `creator` role confirmed; 3 SQL gate conditions |
| `docs/nashir_auth_rbac_workspace_identity_gate.md` | 35 permissions (33 V1 + 2 DEFER); 7 roles; guard chain definitions; operation security mapping Section 10 |
| `docs/nashir_openapi_source_of_truth_gate.md` | Current authority: nashir_v1_openapi.yaml; no migration until Backend Slice 0 closes; YAML patch planning unblocked |
| `docs/nashir_v1_openapi.yaml` | OpenAPI 3.1.0 v0.1.0; global `security: [{bearerAuth: []}]`; global `bearerAuth` scheme defined as `type: http, scheme: bearer`; no operation-level x-extensions currently; placeholder server URL |
| `docs/creator_studio_api_boundary_gate.md` | GET ops: session owner or workspace admin only; no auto-creation; non-disclosing membership |
| `docs/creator_studio_production_contract_planning.md` | creatorHandleRef opaque; payloadSummary no raw tokens |
| `docs/creator_studio_openapi_review_gate.md` | All 10 Creator Studio paths confirmed present and reviewed |
| `docs/creator_studio_generated_types_consumption_planning_gate.md` | W-CONS-5: generated types do not authorize API integration |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Awareness only — openapi-typescript does not generate types from x-extensions; YAML extension patch will not affect generated types |

### Verified — henter36/marketing-os (local sibling clone, read-only)

| Source | Finding |
|---|---|
| `README.md` | Contract-first; Pilot/Production NO-GO |
| `AGENTS.md` | Documentation PRs must not modify src/rbac.js or guards.js |
| `src/rbac.js` | Seven roles; dot notation; four Nashir codes |
| `src/guards.js` | Six guards including nonDisclosingMembershipCheck |
| `docs/nashir_openapi_patch.yaml` | Nashir Slice 0 patch uses x-permission and x-audit-event as OpenAPI extensions — confirms extension pattern is compatible with OpenAPI 3.1 and marketing-os validation tooling |

### Assumption flags

> **ASSUMPTION-YP1:** OpenAPI x-extensions (`x-permission`, `x-workspace-scope`, etc.) are not parsed by openapi-typescript for type generation. Adding these extensions to nashir_v1_openapi.yaml will not alter the generated output of `npm run generate:creator-studio-types`. The generated artifact `src/generated/creator-studio-openapi-types/index.d.ts` should remain byte-for-byte identical after the YAML patch.

> **ASSUMPTION-YP2:** `nashir_openapi_patch.yaml` in marketing-os already uses `x-permission` extensions (e.g., `x-permission: nashir.campaign.read`). This confirms the extension naming convention is consistent and compatible with the marketing-os lint tooling.

> **ASSUMPTION-YP3:** Creator Studio GET-by-ID operations (`getCreatorContextDraft`, `getCreatorTransferDraft`) should require the read-appropriate permission `nashir.creator_studio.use` rather than the write-oriented `nashir.creator_studio.transfer.create`. Reading a draft does not require "transfer create" authority. This is a correction from the security mapping gate's Section 10 assignment, adopted in this planning gate.

---

## 3. Planning Question

**What exact OpenAPI YAML security metadata should be applied in a later implementation slice, and under what constraints?**

**Summary:** The YAML patch adds operation-level security overrides for public operations, seven custom x-extensions to each operation, and updates the global bearerAuth description. No schemas, operationIds, paths, parameters, or request/response bodies are changed. The patch is additive-only. Generated types will not change. The patch must pass `npm run build`, `npm run lint`, and `npm run generate:creator-studio-types` with no diff in the generated file.

---

## 4. Current Authority Chain

- **`docs/nashir_v1_openapi.yaml`**: current Nashir V1 OpenAPI authority; has global `bearerAuth` placeholder; no operation-level x-extensions; this gate plans what will be added.
- **`docs/nashir_openapi_security_mapping_gate.md`**: approved security mapping; defines per-operation permissions, guard chains, workspace scope, audit requirements.
- **`docs/nashir_auth_rbac_workspace_identity_gate.md`** and **`docs/nashir_auth_rbac_review_gate.md`**: approved permission codes, roles, and guard patterns.
- **Generated types**: will not change after YAML extension patch; openapi-typescript does not process x-extension fields.
- **marketing-os**: future backend/governance candidate; not OpenAPI authority; `nashir_openapi_patch.yaml` confirms x-extension pattern is valid.
- **OpenAPI migration**: remains blocked until Nashir OpenAPI Migration Planning Gate (after Backend Slice 0 Planning).

---

## 5. Proposed YAML Patch Strategy

The future YAML patch slice applies **additive-only** changes to `docs/nashir_v1_openapi.yaml`:

| Change type | Allowed in patch | Notes |
|---|---|---|
| Update global `bearerAuth` description | YES | Replace placeholder description with production-oriented description |
| Add operation-level `security: []` override for public ops | YES | Only for `getHealth` to explicitly override global security |
| Add `x-permission` to each operation | YES | Primary permission code from approved mapping |
| Add `x-workspace-scope` to each operation | YES | `route` for all authenticated ops; `none` for getHealth |
| Add `x-store-scope` to each operation | YES | `implicit` for store-adjacent ops; `none` for ops without store context |
| Add `x-human-review-required` to each operation | YES | Boolean |
| Add `x-audit-required` to each operation | YES | Boolean |
| Add `x-evidence-required` to operations requiring ManualPublishEvidence | YES | Boolean |
| Add `x-guard-chain` as documentation extension | YES | String; documents intended guard sequence |
| Add `x-sensitive-operation` to high-risk ops | YES | Boolean |
| Add `x-no-automatic-execution` to ops that must not auto-fire | YES | Boolean |
| Change operationId | **NO-GO** | Must not rename operations |
| Change paths | **NO-GO** | Must not rename paths |
| Change parameter names or types | **NO-GO** | Must not alter request contracts |
| Change schema names or fields | **NO-GO** | Must not alter response contracts |
| Change security scheme type/scheme | **CAUTION** | May update description only; must not change scheme value |

---

## 6. Extension Contract Proposal

| Extension | Type | Required On | Allowed Values | Purpose | Risk | Validation Expectation |
|---|---|---|---|---|---|---|
| `x-permission` | string | All protected operations (34) | Approved nashir.* or shared permission codes | Documents required primary permission; input to backend implementation | LOW — wrong code would be caught at implementation | openapi-lint may validate that code exists in rbac.js |
| `x-workspace-scope` | string | All operations | `route`, `none` | Documents workspaceId source | LOW | |
| `x-store-scope` | string | All operations | `implicit`, `explicit`, `none` | Documents store context derivation | LOW | |
| `x-human-review-required` | boolean | Operations requiring human review | `true`, `false` | Documents service-layer human approval requirement | LOW | |
| `x-audit-required` | boolean | All operations | `true`, `false` | Documents AuditEvent requirement | LOW | |
| `x-evidence-required` | boolean | Evidence-producing operations | `true`, `false` | Documents ManualPublishEvidence requirement | LOW | |
| `x-guard-chain` | string | All authenticated operations | Guard function names separated by ` → ` | Documents intended guard sequence; input to backend implementation | LOW — informational only | |
| `x-sensitive-operation` | boolean | High-risk operations | `true`, `false` | Flags operations requiring extra scrutiny | LOW | |
| `x-no-automatic-execution` | boolean | Operations that must not auto-fire | `true`, `false` | Prevents automatic page-load invocation | MEDIUM — must be enforced by frontend and backend | Frontend must check; backend guard should not be auto-triggered |

---

## 7. Security Scheme Proposal

### Current state (verified in nashir_v1_openapi.yaml)

The current YAML has:
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

And a global security requirement:
```yaml
security:
  - bearerAuth: []
```

### Planned update

The `bearerAuth` security scheme description should be updated to production-oriented language. The `type: http` and `scheme: bearer` values must NOT change. Only the `description` field is updated.

**Global security**: Retain `security: [{bearerAuth: []}]` globally — applies to all operations by default.

**getHealth override**: Add `security: []` at the operation level to explicitly override the global security for the public health endpoint.

**Operation-level security**: All other operations inherit the global `bearerAuth` requirement. Operation-level `x-permission` documents which permission code is additionally required — but this is an x-extension, not an OpenAPI security requirement, since OpenAPI security schemes cannot express role/permission granularity natively.

### Why x-extension for permissions

OpenAPI 3.1 `security` fields can reference security schemes (e.g., bearerAuth, apiKey, OAuth2 scopes) but cannot express fine-grained permission codes like `nashir.product.write`. The x-permission extension bridges the gap between the OpenAPI contract and the backend RBAC system. It is documentation for backend implementers and input to lint tooling.

This pattern is already used in marketing-os `nashir_openapi_patch.yaml` (`x-permission: nashir.campaign.read`), confirming its validity.

---

## 8. Operation Patch Inventory

Full per-operation patch plan. Corrections from security mapping gate are noted.

| Operation ID | Method + Path | Planned `security` | Planned `x-permission` | Planned `x-workspace-scope` | Planned `x-store-scope` | Planned `x-human-review-required` | Planned `x-audit-required` | Planned `x-evidence-required` | Planned `x-guard-chain` | Planned `x-sensitive-operation` | Planned `x-no-automatic-execution` | Patch Readiness |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `getHealth` | GET /health | `security: []` (override — public) | none | `none` | `none` | `false` | `false` | `false` | none | `false` | `false` | **READY** |
| `listProducts` | GET .../products | (inherit global) | `nashir.product.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `createProduct` | POST .../products | (inherit global) | `nashir.product.write` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `getProduct` | GET .../products/{productId} | (inherit global) | `nashir.product.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `updateProduct` | PUT .../products/{productId} | (inherit global) | `nashir.product.write` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `listAssets` | GET .../assets | (inherit global) | `nashir.asset.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `createAsset` | POST .../assets | (inherit global) | `nashir.asset.write` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `getAsset` | GET .../assets/{assetId} | (inherit global) | `nashir.asset.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `updateAsset` | PUT .../assets/{assetId} | (inherit global) | `nashir.asset.write` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `linkAssetToProduct` | POST .../assets/{assetId}/link-product | (inherit global) | `nashir.asset.link` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `listCampaignContents` | GET .../campaign-contents | (inherit global) | `nashir.content.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `createCampaignContent` | POST .../campaign-contents | (inherit global) | `nashir.content.create` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `getCampaignContent` | GET .../campaign-contents/{campaignContentId} | (inherit global) | `nashir.content.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `updateCampaignContent` | PUT .../campaign-contents/{campaignContentId} | (inherit global) | `nashir.content.update` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `submitCampaignContentReview` | POST .../submit-review | (inherit global) | `nashir.content.submit_review` | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `approveCampaignContent` | POST .../approve | (inherit global) | `nashir.approval.decide` | `route` | `implicit` | `true` | `true` | `true` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `rejectCampaignContent` | POST .../reject | (inherit global) | `nashir.approval.decide` | `route` | `implicit` | `true` | `true` | `true` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `listCampaignContentPreviewArtifacts` | GET .../preview-artifacts | (inherit global) | `nashir.content.read` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `createCampaignContentPreviewArtifact` | POST .../preview-artifacts | (inherit global) | `nashir.content.create` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `getWorkspaceReadiness` | GET .../readiness | (inherit global) | `nashir.workflow.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `getWorkflowReadiness` | GET .../workflow-definitions/{workflowDefinitionId}/readiness | (inherit global) | `nashir.workflow.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `getWorkflowStepReadiness` | GET .../steps/{stepKey}/readiness | (inherit global) | `nashir.workflow.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `getProviderReadiness` | GET .../ai-providers/{providerId}/readiness | (inherit global) | `nashir.model_routing.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `getModelRouteReadiness` | GET .../model-routes/{modelRouteId}/readiness | (inherit global) | `nashir.model_routing.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `getPromptReadiness` | GET .../prompts/{promptId}/readiness | (inherit global) | `nashir.prompt_governance.read` | `route` | `none` | `false` | `false` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard | `false` | `false` | **READY** |
| `createCreatorStudioSession` | POST .../creator-studio/sessions | (inherit global) | `nashir.creator_studio.use` | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `true` |  **READY** |
| `getCreatorStudioSession` | GET .../creator-studio/sessions/{sessionId} | (inherit global) | `nashir.creator_studio.use` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | `true` | `false` | **READY** |
| `createCreatorContextDraft` | POST .../creator-studio/context-drafts | (inherit global) | `nashir.creator_studio.transfer.create` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `getCreatorContextDraft` | GET .../creator-studio/context-drafts/{draftId} | (inherit global) | **`nashir.creator_studio.use`** ← corrected from `transfer.create` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | `false` | `false` | **READY — see Section 9** |
| `createCreatorReadinessAssessment` | POST .../creator-studio/readiness-assessments | (inherit global) | `nashir.creator_studio.transfer.create` | `route` | `implicit` | `false` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `false` | `false` | **READY** |
| `createCreatorContentStudioTransferDraft` | POST .../transfer-drafts/content-studio | (inherit global) | `nashir.creator_studio.transfer.create` | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `createCreatorCampaignTransferDraft` | POST .../transfer-drafts/campaign | (inherit global) | `nashir.creator_studio.transfer.create` | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `true` | **READY** |
| `createCreatorPublishingTransferDraft` | POST .../transfer-drafts/publishing | (inherit global) | `nashir.creator_studio.transfer.create` | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY** |
| `createCreatorPromptGovernanceTransferDraft` | POST .../transfer-drafts/prompt-governance | (inherit global) | `nashir.creator_studio.transfer.create` (primary) | `route` | `implicit` | `true` | `true` | `false` | authGuard → workspaceContextGuard → membershipCheck → permissionGuard → rejectBodyWorkspaceId | `true` | `false` | **READY — see Section 9** |
| `getCreatorTransferDraft` | GET .../creator-studio/transfer-drafts/{transferId} | (inherit global) | **`nashir.creator_studio.use`** ← corrected from `transfer.create` | `route` | `implicit` | `false` | `false` | `false` | authGuard → workspaceContextGuard → **nonDisclosingMembershipCheck** → permissionGuard | `true` | `false` | **READY — see Section 9** |

**All 35 operations: READY for patch.**

---

## 9. Creator Studio Special Handling

### Correction: GET read operations use `nashir.creator_studio.use`, not `nashir.creator_studio.transfer.create`

The following correction is adopted in this planning gate from the principle that GET read operations must not require create/write permission:

| Operation | Previous mapping (security mapping gate) | Corrected mapping (this gate) | Rationale |
|---|---|---|---|
| `getCreatorContextDraft` | `nashir.creator_studio.transfer.create` | **`nashir.creator_studio.use`** | Reading a draft does not require transfer-create authority; the session use permission is sufficient for read access |
| `getCreatorTransferDraft` | `nashir.creator_studio.transfer.create` | **`nashir.creator_studio.use`** | Reading a transfer draft for review does not require the create permission |

This correction does not invalidate the security mapping gate; it refines it. The security mapping gate's guard chain assignments (nonDisclosingMembershipCheck) for these operations are preserved.

### Dual-permission note for createCreatorPromptGovernanceTransferDraft

The security mapping gate identified that `createCreatorPromptGovernanceTransferDraft` requires both `nashir.creator_studio.transfer.create` (primary) and `nashir.prompt_governance.read` (secondary check). OpenAPI does not support AND-permission expressions natively. The YAML patch applies only the primary `x-permission: nashir.creator_studio.transfer.create`. The secondary `nashir.prompt_governance.read` check must be documented as a service-layer invariant. An additional x-extension `x-secondary-permission: nashir.prompt_governance.read` may be added as documentation only.

### Additional Creator Studio safeguards for the YAML patch

| Safeguard | Applied to | YAML extension |
|---|---|---|
| Must not be called automatically on page load | `createCreatorStudioSession` | `x-no-automatic-execution: true` |
| Must not auto-create campaigns | `createCreatorCampaignTransferDraft` | `x-no-automatic-execution: true` |
| Expired sessions return 410 Gone | `getCreatorStudioSession` | Document in operation description (not an x-extension) |
| Expired context drafts return 410 Gone | `getCreatorContextDraft` | Document in operation description |
| Expired transfer drafts return 410 Gone | `getCreatorTransferDraft` | Document in operation description |
| payloadSummary must not expose raw tokens or prompt text | `getCreatorTransferDraft`, `createCreator*TransferDraft` | `x-sensitive-operation: true` + existing description text |
| creatorHandleRef must not be stored raw | `createCreatorStudioSession` | `x-sensitive-operation: true` + existing description text |
| Destination service actor is deferred | All transfer draft creates | Not modeled in YAML; service-layer concern |

---

## 10. Human Review and No-Automation Patch Rules

| Operation Group | `x-human-review-required` | `x-no-automatic-execution` | Required Role/Permission | Evidence Requirement | Reason |
|---|---|---|---|---|---|
| `submitCampaignContentReview` | `true` | `false` | `nashir.content.submit_review` | No (state transition only) | Moves content toward human review gate |
| `approveCampaignContent` | `true` | `false` | `nashir.approval.decide` | YES (ApprovalDecision) | Human-only; self-approval denied at service layer |
| `rejectCampaignContent` | `true` | `false` | `nashir.approval.decide` | YES (ApprovalDecision) | Human-only; self-rejection denied at service layer |
| `createCreatorStudioSession` | `true` | `true` | `nashir.creator_studio.use` | No | Must not auto-fire on page load; requires explicit user intent |
| Creator Studio transfer drafts (all 4 create) | `true` | `true` (campaign) / `false` (others) | `nashir.creator_studio.transfer.create` | No (pending_review state) | Creates pending_review; human confirms before destination creates records |
| Publishing queue receive (future endpoint) | `true` | `false` | `nashir.publishing.draft.receive` | No | Publishing transfer must have human confirmation |
| Publishing schedule (future endpoint) | `true` | `false` | `nashir.publishing.draft.receive` | YES (ManualPublishEvidence) | Human confirms timing; no auto-schedule |
| Prompt governance changes (future endpoint) | `true` | `false` | `nashir.prompt_governance.manage` | No | Admin/owner only; version approval required |
| Model routing changes (future endpoint) | `true` | `false` | `nashir.model_routing.manage` | No | Admin/owner only |
| Integration/secret operations (future endpoint) | `true` | `false` | `nashir.integration.connect` (DEFER) | YES (AuditLog) | High sensitivity; deferred Post-V1 |

---

## 11. Workspace/Store Scope Patch Rules

| Operation Group | Planned `x-workspace-scope` | Planned `x-store-scope` | Body workspaceId Allowed | Guard Note | Risk |
|---|---|---|---|---|---|
| getHealth | `none` | `none` | N/A | No guards | LOW |
| All Products operations | `route` | `implicit` | NO — rejected by rejectBodyWorkspaceId on mutations | rejectBodyWorkspaceId on POST/PUT | LOW |
| All Assets operations | `route` | `implicit` | NO — rejected on mutations | rejectBodyWorkspaceId on POST/PUT | LOW |
| linkAssetToProduct | `route` | `implicit` | NO | rejectBodyWorkspaceId; productId must be workspace-owned at service layer | MEDIUM |
| All Campaign Content operations | `route` | `implicit` | NO | rejectBodyWorkspaceId on mutations; productId/assetIds workspace-validated at service layer | MEDIUM |
| AI Readiness (all 6) | `route` | `none` | N/A (GET only) | No body | LOW |
| Creator Studio sessions | `route` | `implicit` | NO — rejected | rejectBodyWorkspaceId | HIGH |
| Creator context drafts | `route` | `implicit` | NO | rejectBodyWorkspaceId; all ID references validated at service layer | MEDIUM |
| Creator transfer drafts | `route` | `implicit` | NO | rejectBodyWorkspaceId; draftId and contentId validated at service layer | HIGH |

**Cross-workspace access: NO-GO for all operations.**

**Store scope note:** No operation uses explicit storeId in V1. All store context is derived from workspace context (1:1 workspace/store in V1). storeProfileId is available as a future scoping field on Product and Asset entities.

---

## 12. Audit/Evidence Patch Rules

| Operation Group | `x-audit-required` | `x-evidence-required` | Actor Required | workspaceId Required | Retention Sensitivity | Notes |
|---|---|---|---|---|---|---|
| createProduct, updateProduct | `true` | `false` | YES | YES | LOW | Standard CRUD audit |
| createAsset, updateAsset, linkAssetToProduct | `true` | `false` | YES | YES | LOW | Standard CRUD audit |
| createCampaignContent, updateCampaignContent | `true` | `false` | YES | YES | LOW | |
| submitCampaignContentReview | `true` | `false` | YES | YES | MEDIUM | State transition |
| approveCampaignContent | `true` | `true` | YES (not self) | YES | HIGH | ApprovalDecision record; self-approval denied |
| rejectCampaignContent | `true` | `true` | YES (not self) | YES | HIGH | ApprovalDecision record |
| createCampaignContentPreviewArtifact | `true` | `false` | YES | YES | LOW | |
| createCreatorStudioSession | `true` | `false` | YES | YES | HIGH — handle opaque in event | |
| createCreatorContextDraft | `true` | `false` | YES | YES | MEDIUM | |
| createCreatorReadinessAssessment | `true` | `false` | YES | YES | LOW — advisory only | |
| createCreator*TransferDraft (all 4) | `true` | `false` | YES | YES | MEDIUM — no raw tokens in event | pending_review |
| All GET operations | `false` | `false` | N/A | YES | N/A | Reads do not create audit events |

---

## 13. Permission Coverage Before YAML Patch

Verifying that every planned `x-permission` exists in the approved 35 permission codes from `docs/nashir_auth_rbac_workspace_identity_gate.md`.

| Permission Code Planned | Used by Operations | Approved in Auth/RBAC Gate | Risk | Action |
|---|---|---|---|---|
| `nashir.product.read` | listProducts, getProduct | YES | LOW | None |
| `nashir.product.write` | createProduct, updateProduct | YES | LOW | None |
| `nashir.asset.read` | listAssets, getAsset | YES | LOW | None |
| `nashir.asset.write` | createAsset, updateAsset | YES | LOW | None |
| `nashir.asset.link` | linkAssetToProduct | YES | LOW | None |
| `nashir.content.read` | listCampaignContents, getCampaignContent, listCampaignContentPreviewArtifacts | YES | LOW | None |
| `nashir.content.create` | createCampaignContent, createCampaignContentPreviewArtifact | YES | LOW | None |
| `nashir.content.update` | updateCampaignContent | YES | LOW | None |
| `nashir.content.submit_review` | submitCampaignContentReview | YES | LOW | None |
| `nashir.approval.decide` | approveCampaignContent, rejectCampaignContent | YES | HIGH — self-approval prevention service layer | Document service invariant in operation description |
| `nashir.workflow.read` | getWorkspaceReadiness, getWorkflowReadiness, getWorkflowStepReadiness | YES | LOW | None |
| `nashir.model_routing.read` | getProviderReadiness, getModelRouteReadiness | YES | LOW | None |
| `nashir.prompt_governance.read` | getPromptReadiness | YES | LOW | None |
| `nashir.creator_studio.use` | createCreatorStudioSession, getCreatorStudioSession, **getCreatorContextDraft** (corrected), **getCreatorTransferDraft** (corrected) | YES | HIGH — handle privacy | None |
| `nashir.creator_studio.transfer.create` | createCreatorContextDraft, createCreatorReadinessAssessment, createCreatorContentStudioTransferDraft, createCreatorCampaignTransferDraft, createCreatorPublishingTransferDraft, createCreatorPromptGovernanceTransferDraft | YES | MEDIUM | Document dual-permission secondary for prompt governance transfer |

**All 15 permission codes planned for the patch are approved in the Auth/RBAC gate.**

**No unapproved permission codes are introduced.**

**No read operation is mapped to a write/create permission.** (The Section 9 correction resolves the GET operations that were previously mapped to `transfer.create`.)

---

## 14. Allowed Files for Future YAML Patch Slice

| File | Allowed Change | Notes |
|---|---|---|
| `docs/nashir_v1_openapi.yaml` | YES — additive x-extension metadata and operation-level security overrides only | No schema changes; no path changes; no operationId changes |
| `docs/nashir_openapi_security_yaml_patch_review_gate.md` | YES — create new review gate doc only | New gate document after YAML patch is applied |

### Generated types impact assessment

**`src/generated/creator-studio-openapi-types/index.d.ts` must NOT change after the YAML patch.**

Rationale: `openapi-typescript` generates types from `paths`, `components/schemas`, `components/parameters`, and `components/responses`. It does not process custom `x-*` extensions, operation-level security fields, or bearerAuth description changes. Adding `x-permission: nashir.product.read` to an operation will not alter the generated TypeScript output.

**Verification requirement:** After the YAML patch is applied, run `npm run generate:creator-studio-types` and confirm:
- `git diff src/generated/creator-studio-openapi-types/index.d.ts` produces NO output
- If the generated file changes, the YAML patch introduced an unintended schema change — roll back

---

## 15. Forbidden Files for Future YAML Patch Slice

| Forbidden File / Directory | Reason |
|---|---|
| `src/` | No UI or frontend changes |
| `package.json` | No dependency changes |
| `package-lock.json` | No lock file changes |
| Any backend/runtime files | Not yet approved |
| marketing-os files | Read-only |
| SQL/migration files | Not yet approved |
| `src/generated/creator-studio-openapi-types/index.d.ts` | Must not be manually edited; must remain identical after YAML patch |
| Any new OpenAPI YAML file | Only `docs/nashir_v1_openapi.yaml` may change |
| `jsconfig.json` or `tsconfig.json` | Not approved |
| UI API integration files | Not approved |

---

## 16. Verification Plan for Future YAML Patch Slice

Run in this exact order:

```sh
# 1. Whitespace check
git diff --check

# 2. Build — must pass unchanged
npm run build

# 3. Lint — must pass unchanged
npm run lint

# 4. Regenerate types — must produce identical output
npm run generate:creator-studio-types

# 5. Confirm only nashir_v1_openapi.yaml changed
git diff --name-only

# 6. Confirm src/ unchanged
git diff -- src/

# 7. Confirm package files unchanged
git diff -- package.json package-lock.json

# 8. Confirm generated types unchanged
git diff -- src/generated/creator-studio-openapi-types/index.d.ts

# 9. Confirm YAML was patched (should have output)
git diff -- docs/nashir_v1_openapi.yaml

# 10. Grep: confirm all 35 operation IDs still present
grep -c "operationId:" docs/nashir_v1_openapi.yaml
# Expected: 35

# 11. Grep: confirm x-permission appears on protected operations
grep -c "x-permission:" docs/nashir_v1_openapi.yaml
# Expected: 34 (all except getHealth)

# 12. Grep: confirm no new permissions introduced beyond approved set
grep "x-permission:" docs/nashir_v1_openapi.yaml | sort | uniq
# Expected: only approved nashir.* and shared permission codes

# 13. Grep: confirm no schema names changed
grep "^\s*type: object" docs/nashir_v1_openapi.yaml | wc -l
# Should match pre-patch count

# 14. Confirm no backend/src/package file touched
git diff -- src/ package.json package-lock.json
# Expected: no output

# 15. Final status
git status --short
# Expected: only docs/nashir_v1_openapi.yaml modified
# (plus new review gate doc if created in same slice)
```

---

## 17. Rollback Plan

| Situation | Rollback Action |
|---|---|
| `npm run generate:creator-studio-types` produces diff in generated file | **Immediate rollback** — the YAML patch introduced an unintended schema change; revert the YAML commit |
| `npm run build` fails after YAML patch | Investigate: the YAML patch may have accidentally introduced invalid YAML syntax; revert and re-examine with a YAML linter |
| `npm run lint` fails | ESLint does not lint YAML; this should not be triggered by a YAML-only patch; investigate for accidental file modification |
| operationId count drops below 35 | **Immediate rollback** — an operationId was accidentally removed or renamed |
| x-permission count differs from 34 | Investigate — a protected operation may be missing its x-permission, or getHealth may have incorrectly received one |
| Any src/ or package file diff found | **Immediate rollback** — the patch scope was violated |

**Rollback mechanism:** `git revert <patch-commit-sha>` — single-commit revert restoring previous YAML state. No generated file cleanup needed since generated file must be identical before and after.

---

## 18. Risks and Controls

| Risk | Severity | Control | Owner Gate |
|---|---|---|---|
| YAML extension typo (e.g., `x-permision` instead of `x-permission`) | MEDIUM | Post-patch grep validation check #11; confirm all 34 appear | YAML Patch Slice verification |
| Unsupported OpenAPI extension misuse | LOW | x-extensions are valid in OpenAPI 3.1; marketing-os uses same pattern | Review gate |
| Stale security mapping (permissions changed after mapping gate) | LOW | Permission codes are approved and stable; mapping gate is authoritative input | YAML Patch Review Gate |
| Missing permission on one operation | MEDIUM | grep count check #11; confirms 34 x-permission lines | YAML Patch Slice verification |
| Read operation mapped to write permission | LOW | Corrected in Section 9; getCreatorContextDraft and getCreatorTransferDraft now use `nashir.creator_studio.use` | YAML Patch Review Gate |
| Service actor ambiguity | LOW | Destination service actor deferred; not modeled in YAML | Backend Slice 0 Planning |
| Generated type drift | HIGH | Verification step: `git diff src/generated/...` must produce no output; rollback if diff found | YAML Patch Slice verification |
| OpenAPI validation gap (no openapi-lint in nashir-ui-prototype) | MEDIUM | no `openapi:lint` script in nashir-ui-prototype package.json; validate manually or add lint script in YAML patch slice or a separate lint gate | YAML Patch Review Gate — consider adding lint script |
| Future migration to marketing-os may require re-applying extensions | LOW | Extensions are additive; marketing-os openapi-lint already accepts x-extension pattern | OpenAPI Migration Planning Gate |
| Accidental backend coupling | HIGH | All backend files in forbidden list; git diff check enforced | YAML Patch Slice verification |
| Accidental UI API integration | HIGH | src/ in forbidden list; W-CONS-5 carries forward | YAML Patch Slice verification |

---

## 19. Required Follow-up Gates

| Priority | Gate | Dependency | Rationale |
|---:|---|---|---|
| 1 | **Nashir OpenAPI Security YAML Patch Slice** | This planning gate — READY | Applies the actual YAML patch to docs/nashir_v1_openapi.yaml; additive-only; verified against this plan |
| 2 | **Nashir OpenAPI Security YAML Patch Review Gate** | YAML Patch Slice committed | Reviews the applied YAML patch; confirms all 35 operations covered; validates no accidental schema changes |
| 3 | **Nashir SQL Schema Planning Gate** | Auth/RBAC Review Gate C-RV01/C-RV02/C-RV03 resolved | Produces approved column-level schema for V1 entities |
| 4 | **Nashir Backend Slice 0 Planning** | YAML Patch Review Gate + SQL Schema Planning Gate | Plans first implementable backend slice; wires guards; selects auth provider; extends marketing-os rbac.js |
| 5 | **Nashir OpenAPI Migration Planning Gate** | Backend Slice 0 Planning identifies routes | Plans migration of nashir_v1_openapi.yaml to marketing-os; resolves path naming conflict |
| 6 | **Nashir Generated Types Input Update Gate** | OpenAPI Migration Planning Gate | Approves package.json generation script update |
| 7 | **Nashir UI API Integration Planning Gate** | Backend Slice 0 exists and verified | Plans how nashir-ui-prototype calls the Nashir V1 API |

**YAML Patch Slice may proceed immediately** — this planning gate is READY.

**SQL Schema Planning** remains conditionally blocked on C-RV01/C-RV02/C-RV03 from the Auth/RBAC Review Gate — not on anything in this planning gate.

**OpenAPI Migration Planning** remains blocked until Backend Slice 0 Planning closes.

**UI API Integration** remains blocked until backend exists, contract authority is settled, and auth provider is operational.

---

## 20. Decision

### Final decision

| Area | Status |
|---|---|
| Patch planning complete | **COMPLETE — all 35 operations planned** |
| Blocking findings | **NONE** |
| Fix gate required | **NOT REQUIRED** |
| GET permission correction adopted | **ADOPTED — getCreatorContextDraft and getCreatorTransferDraft corrected to `nashir.creator_studio.use`** |
| GO to Nashir OpenAPI Security YAML Patch Slice | **GO** |
| OpenAPI YAML changes in this planning slice | **NO-GO** |
| Backend routes implemented | **NO-GO** |
| Auth middleware / RBAC implementation | **NO-GO** |
| SQL schema / migrations | **NO-GO** |
| Generated files changed | **NO-GO** |
| UI API integration | **NO-GO** |
| Production / Pilot | **NO-GO** |

### Patch scope summary

| Metric | Value |
|---|---|
| Operations receiving `security: []` override | 1 (getHealth only) |
| Operations receiving `x-permission` | 34 |
| Unique permission codes used | 15 |
| Operations with `x-human-review-required: true` | 9 |
| Operations with `x-audit-required: true` | 18 |
| Operations with `x-evidence-required: true` | 2 (approve + reject) |
| Operations with `x-sensitive-operation: true` | 8 |
| Operations with `x-no-automatic-execution: true` | 2 (createCreatorStudioSession, createCreatorCampaignTransferDraft) |
| Operations using nonDisclosingMembershipCheck | 3 (getCreatorStudioSession, getCreatorContextDraft, getCreatorTransferDraft) |

### Next gate

**Nashir OpenAPI Security YAML Patch Slice**

That slice must:
- Apply additive x-extension metadata to all 35 operations in `docs/nashir_v1_openapi.yaml`.
- Update global `bearerAuth` description.
- Add `security: []` override for `getHealth`.
- Confirm `npm run generate:creator-studio-types` produces no diff in the generated file.
- Use the operation patch inventory in Section 8 of this document as the authoritative input.
- Not change schemas, paths, operationIds, parameters, request bodies, or response structures.
- Create a companion review gate document (`docs/nashir_openapi_security_yaml_patch_review_gate.md`) or defer it to a separate slice.
