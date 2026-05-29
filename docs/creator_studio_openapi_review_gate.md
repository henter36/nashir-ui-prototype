# Creator Studio OpenAPI Review Gate

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | OpenAPI contract review gate |
| OpenAPI YAML changes | NO-GO in this slice |
| Runtime / backend | NO-GO in this slice |
| Generated clients | NO-GO until this gate closes GO |
| UI API calls | NO-GO in this slice |

This document reviews the Creator Studio V1 OpenAPI contract merged in PR #33 against the planning documents. No changes are made to `docs/nashir_v1_openapi.yaml` in this slice.

---

## 2. Source Documents Reviewed

| Document | Role |
|---|---|
| `docs/creator_studio_production_contract_planning.md` | Entity, privacy, transfer contract, and risk planning |
| `docs/creator_studio_api_boundary_gate.md` | V1 scope authority — approved paths, entities, permissions |
| `docs/creator_studio_openapi_planning.md` | operationIds, schema candidates, naming decisions, payload rules |
| `docs/nashir_v1_openapi.yaml` | Contract under review |

---

## 3. Path Coverage Review

All 10 approved V1 paths are present. Lines confirmed by `grep`.

| Path | Line | operationId | Request schema | Response schema | Status |
|---|---|---|---|---|---|
| `POST .../creator-studio/sessions` | 828 | `createCreatorStudioSession` | `CreatorStudioSessionCreateRequest` | `CreatorStudioSessionResponse` | PRESENT |
| `GET .../creator-studio/sessions/{sessionId}` | 870 | `getCreatorStudioSession` | path param only | `CreatorStudioSessionResponse` | PRESENT |
| `POST .../creator-studio/context-drafts` | 903 | `createCreatorContextDraft` | `CreatorContextDraftCreateRequest` | `CreatorContextDraftResponse` | PRESENT |
| `GET .../creator-studio/context-drafts/{draftId}` | 950 | `getCreatorContextDraft` | path param only | `CreatorContextDraftResponse` | PRESENT |
| `POST .../creator-studio/readiness-assessments` | 984 | `createCreatorReadinessAssessment` | `CreatorReadinessAssessmentCreateRequest` | `CreatorReadinessAssessmentResponse` | PRESENT |
| `POST .../transfer-drafts/content-studio` | 1024 | `createCreatorContentStudioTransferDraft` | `CreatorContentStudioTransferDraftCreateRequest` | `CreatorTransferDraftResponse` | PRESENT |
| `POST .../transfer-drafts/campaign` | 1072 | `createCreatorCampaignTransferDraft` | `CreatorCampaignTransferDraftCreateRequest` | `CreatorTransferDraftResponse` | PRESENT |
| `POST .../transfer-drafts/publishing` | 1120 | `createCreatorPublishingTransferDraft` | `CreatorPublishingTransferDraftCreateRequest` | `CreatorTransferDraftResponse` | PRESENT |
| `POST .../transfer-drafts/prompt-governance` | 1168 | `createCreatorPromptGovernanceTransferDraft` | `CreatorPromptGovernanceTransferDraftCreateRequest` | `CreatorTransferDraftResponse` | PRESENT |
| `GET .../transfer-drafts/{transferId}` | 1216 | `getCreatorTransferDraft` | path param only | `CreatorTransferDraftResponse` | PRESENT |

All Creator Studio paths are workspace-scoped under `/workspaces/{workspaceId}/creator-studio/...`, matching the V1 workspace-scoped pattern established by existing modules (Products, Assets, Campaign Content, AI Readiness). Transfer draft paths are correctly nested under `/workspaces/{workspaceId}/creator-studio/transfer-drafts/...` — not at a flat `/transfer-drafts/` root. This is consistent with the V1 convention.

---

## 4. OperationId Review

All 10 operationIds are present and unique. No collision with existing YAML operationIds.

| operationId | Present | Unique |
|---|---|---|
| `createCreatorStudioSession` | YES (L830) | YES |
| `getCreatorStudioSession` | YES (L872) | YES |
| `createCreatorContextDraft` | YES (L905) | YES |
| `getCreatorContextDraft` | YES (L952) | YES |
| `createCreatorReadinessAssessment` | YES (L986) | YES |
| `createCreatorContentStudioTransferDraft` | YES (L1026) | YES |
| `createCreatorCampaignTransferDraft` | YES (L1074) | YES |
| `createCreatorPublishingTransferDraft` | YES (L1122) | YES |
| `createCreatorPromptGovernanceTransferDraft` | YES (L1170) | YES |
| `getCreatorTransferDraft` | YES (L1218) | YES |

---

## 5. Schema Coverage Review

### Planning-required schemas

| Schema | Line | Status | Notes |
|---|---|---|---|
| `CreatorStudioSessionCreateRequest` | 3041 | PRESENT | |
| `CreatorStudioSessionResponse` | 3099 | PRESENT | |
| `CreatorContextDraftCreateRequest` | 3111 | PRESENT | |
| `CreatorContextDraftResponse` | 3197 | PRESENT | |
| `CreatorReadinessAssessmentCreateRequest` | 3209 | PRESENT | |
| `CreatorReadinessAssessmentResponse` | 3265 | PRESENT | |
| `CreatorTransferDraftCreateRequest` | — | ABSENT as generic schema | See finding NB-1 |
| `CreatorTransferDraftResponse` | 3427 | PRESENT | |
| `CreatorContentStudioTransferOverrides` | 3277 | PRESENT | |
| `CreatorCampaignTransferOverrides` | 3284 | PRESENT | |
| `CreatorPublishingTransferOverrides` | 3294 | PRESENT | |
| `CreatorPromptGovernanceTransferOverrides` | 3301 | PRESENT | |
| `CreatorComplianceFinding` | 3009 | PRESENT | |
| `CreatorProfileSnapshotRef` | 3439 | PRESENT | Deferred; reserved only |

### Additional schemas added (beyond planning requirements)

`CreatorStudioPlatform`, `CreatorStudioSessionSource`, `CreatorContextDraftStatus`, `CreatorTransferDraftStatus`, `CreatorTransferDestinationModule`, `CreatorComplianceFindingSeverity`, `CreatorStudioSession`, `CreatorContextDraft`, `CreatorReadinessAssessment`, `CreatorTransferDraft`, `CreatorContentStudioTransferDraftCreateRequest`, `CreatorCampaignTransferDraftCreateRequest`, `CreatorPublishingTransferDraftCreateRequest`, `CreatorPromptGovernanceTransferDraftCreateRequest`

No duplicate or conflicting schema names introduced.

---

## 6. Naming and Status Consistency Review

| Check | Result | Evidence |
|---|---|---|
| `promptTemplateId` used (not `templateLinkId`) | PASS | `templateLinkId` appears only in prohibition descriptions ("not a valid field") |
| `creatorHandle:` bare property absent | PASS | `grep -c "creatorHandle:"` → 0 |
| `creatorHandleRef` used in request and response | PASS | Lines 837, 3045, 3055, 3085 |
| `draftId` = `CreatorContextDraft` id | PASS | Used consistently across all draft schemas |
| `transferId` = `CreatorTransferDraft` id | PASS | Line 3390 in required list |
| `contextDraftId` links transfer to context draft | PASS | Line 3392 |
| `contentId` required on publishing transfer | PASS | Line 3358–3360 in required list |
| `selectedPlatform` required in session create request | PASS | Line 3049 |
| `selectedPlatform` required in session response schema | PASS | Line 3072 |
| `ready_for_transfer` used as transfer gate (not `reviewed`) | PASS | `CreatorContextDraftStatus` enum; endpoint descriptions reference `ready_for_transfer` explicitly |
| No `reviewed` readiness state in enum | PASS | `CreatorContextDraftStatus` enum has 8 values; `reviewed` is not one of them |
| No unsupported readiness state | PASS | Enum is closed: `draft`, `incomplete`, `needs_consent`, `needs_platform_connection`, `needs_human_review`, `ready_for_transfer`, `blocked`, `expired` |

---

## 7. Required Field Review

| Check | Result | Evidence |
|---|---|---|
| `CreatorStudioSessionCreateRequest` requires `source` | PASS | Line 3048 |
| `CreatorStudioSessionCreateRequest` requires `selectedPlatform` | PASS | Line 3049 |
| `CreatorStudioSession` requires `selectedPlatform` | PASS | Line 3072 |
| `CreatorContextDraftCreateRequest` requires only `sessionId` (partial allowed) | PASS | Required list at line 3116 contains only `sessionId`; selection IDs are optional with descriptions clarifying gate requirement |
| Selection IDs documented as required before `ready_for_transfer` | PASS | Each optional field description states "Required before draft can reach ready_for_transfer status" |
| `CreatorContentStudioTransferDraftCreateRequest` requires `draftId` and `promptVersionId` | PASS | Lines 3318 required list |
| `CreatorCampaignTransferDraftCreateRequest` requires `draftId`; `overrides` optional | PASS | Lines 3324 required list; `overrides` is not in required |
| `CreatorPublishingTransferDraftCreateRequest` requires `draftId` and `contentId` | PASS | Lines 3358 required list |
| `CreatorPromptGovernanceTransferDraftCreateRequest` requires `draftId`; `overrides` optional | PASS | Lines 3370 required list; `overrides` is not in required |
| `CreatorReadinessAssessment` requires `blockers` and `warnings` | PASS | Lines 3231–3232 |
| `humanReviewRequired` required in `CreatorTransferDraft` | PASS | Line 3396 |
| Transfer endpoints describe `ready_for_transfer` gate | PASS | All four POST transfer-draft endpoint descriptions explicitly state the requirement |

> **Review-document correction note (§3 and §7):** The path scoping wording and two required-field rows (campaign and prompt-governance transfer requests) were added in response to automated review comments on this gate document. These are documentation clarifications only — the YAML contract itself passes both checks. No new OpenAPI contract findings are introduced by these corrections.

---

## 8. Lifecycle and TTL Review

| Check | Result | Evidence |
|---|---|---|
| Session `expiresAt` required | PASS | `CreatorStudioSession` required list, L3073 |
| Session description states max 24h and invalidation of child drafts | PASS | L3096–3097 |
| Context draft `expiresAt` required and capped by session | PASS | `CreatorContextDraft` required list; description at L3193 states "capped by parent session expiresAt" |
| Transfer draft `expiresAt` required and capped by parent session and context draft | PASS | `CreatorTransferDraft` required list; description at L3425 states "capped by parent session and context draft expiresAt" |
| Assessment `expiresAt` required | PASS | `CreatorReadinessAssessment` required list, L3234 |
| Child draft lifecycle rule stated | PASS | Session description states: "expired session invalidates all child context and transfer drafts" |

---

## 9. Error Model and Response Review

| Check | Result | Evidence |
|---|---|---|
| Uses shared `ErrorModel` | PASS | All error responses reference `$ref: "#/components/schemas/ErrorModel"` |
| `Gone` (410) response defined | PASS | Added to `components/responses`; used on GET endpoints for expired resources |
| `Unauthorized` (401) | PASS | Present on all endpoints |
| `PermissionDenied` (403) | PASS | Present on all endpoints; covers `workspace_mismatch` |
| `NotFound` (404) | PASS | Present on all endpoints |
| `Gone` (410) for expired | PASS | Present on GET sessions, GET context-drafts, POST context-drafts, and GET transfer-drafts |
| `Conflict` (409) | PASS | Present on write endpoints; covers `blocked_by_governance`, `duplicate_scheduling` |
| `ValidationFailed` (422) | PASS | Present on write endpoints; covers `invalid_state`, `invalid_override`, `content_not_approved` |
| `BadRequest` (400) | PASS | Present on write endpoints |
| Creator Studio-specific error codes in `ErrorCode` enum | PASS | 16 `creator_studio.*` codes added: session, draft, transfer, content, workspace, governance, consent, platform, scheduling, override |
| No raw credentials or tokens in response schemas | PASS | `creatorHandleRef` is opaque reference; `payloadSummary` description prohibits raw tokens/credentials |
| GET expired convention documented | PASS | `Gone` response description: "distinguishes from 404 (never existed)" |

---

## 10. Security / Governance Review

| Check | Result | Evidence |
|---|---|---|
| No scraping endpoint | PASS | No `/scrape` or platform-ingestion path exists |
| No AI execution endpoint | PASS | No `/generate`, `/execute`, or equivalent path exists |
| No direct publishing endpoint | PASS | No `/publish`, `/schedule`, or equivalent path exists |
| Transfer endpoints create drafts only | PASS | All four POST transfer descriptions state "Creates a pending_review draft only" |
| `humanReviewRequired` visible in transfer draft | PASS | Required field; description: "Always true. Destination module must not auto-accept the payload." |
| Platform token exposure prohibited | PASS | Session description, `creatorHandleRef` description, and `payloadSummary` description all prohibit raw token exposure |
| Workspace scoping on every path | PASS | All 10 paths use `/workspaces/{workspaceId}/creator-studio/...` |
| `IdempotencyKeyHeader` on all POST create operations | PASS | Present on all 8 POST endpoints |
| `RequestIdHeader` on all operations | PASS | Present on all 10 endpoints |

---

## 11. Diff Hygiene Review

| Check | Result |
|---|---|
| Only `docs/nashir_v1_openapi.yaml` changed by PR #33 | VERIFIED — `git diff --name-only` on the branch shows only the YAML |
| No `src/` changes | VERIFIED |
| No `package.json` or lock file changes | VERIFIED |
| No generated client added | VERIFIED |
| No planning docs modified in YAML slice | VERIFIED |

---

## 12. Findings

### Rationale for blocking classification

Generated-client planning must not start while schema-shape risks remain unresolved. Generated clients freeze the contract into downstream code — weak or ambiguous schemas become typed interfaces that are expensive to change after code generation. All four findings below must be resolved in the YAML before any generated-client work begins.

### Blocking findings

**B-1 — `CreatorTransferDraftCreateRequest` generic schema absent**

| Field | Value |
|---|---|
| Severity | Blocking |
| Evidence | Planning doc `creator_studio_openapi_planning.md` lists `CreatorTransferDraftCreateRequest` as a required schema. YAML instead has 4 destination-specific schemas; no generic base exists. |
| Impact | Generated clients cannot share a common transfer-creation interface. If the design intent is destination-specific schemas only, this must be explicitly documented in the YAML and the planning doc corrected before code generation. |
| Required fix | Either: (a) add `CreatorTransferDraftCreateRequest` as a shared base with `allOf` composition in each destination request; or (b) explicitly declare destination-specific-only design in the YAML and update the planning doc. Decision must be made before generated-client planning. |
| Next slice | Creator Studio OpenAPI YAML Fix Slice |

**B-2 — `payloadSummary` uses unrestricted `additionalProperties: true`**

| Field | Value |
|---|---|
| Severity | Blocking |
| Evidence | `CreatorTransferDraft.payloadSummary` is `type: object, additionalProperties: true`. |
| Impact | Generated clients will type this as `Record<string, unknown>` — no field safety. Risk of inadvertently accepting raw tokens or credentials in the payload surface. This field is in the primary transfer response schema, so the weakness propagates to all four transfer destinations. |
| Required fix | Either: (a) define a safe typed `CreatorTransferPayloadSummary` schema with explicit allowed fields per destination and remove `additionalProperties: true`; or (b) formally declare it opaque and document that callers must treat the object as an advisory blob with no field expectations. |
| Next slice | Creator Studio OpenAPI YAML Fix Slice |

**B-3 — `CreatorContextDraftStatus` enum shared between session and draft, mixing semantics**

| Field | Value |
|---|---|
| Severity | Blocking |
| Evidence | `CreatorStudioSession.status` and `CreatorContextDraft.status` both reference `CreatorContextDraftStatus`. Values such as `draft` and `incomplete` are not semantically valid session states. |
| Impact | Generated client uses the same type for two distinct resources. Invalid status values pass compile-time type checks. Backend implementations may diverge on which values are valid per resource, causing inconsistent behavior. |
| Required fix | Introduce `CreatorStudioSessionStatus` as a separate enum with values valid only for sessions (e.g., `active`, `expired`, `blocked`). Update `CreatorStudioSession.status` to reference the new enum. |
| Next slice | Creator Studio OpenAPI YAML Fix Slice |

**B-4 — `manualContext` is open and untyped**

| Field | Value |
|---|---|
| Severity | Blocking |
| Evidence | `CreatorStudioSessionCreateRequest.manualContext` is `type: object, additionalProperties: true`. |
| Impact | Generated clients cannot validate or type the contents. Callers may pass OAuth tokens, credentials, or PII into this field without any schema-level rejection. This is a privacy and security boundary risk at the API layer. |
| Required fix | Define `CreatorManualContext` schema with explicit allowed fields (e.g., `notes`, `tags`) and replace the inline open object with `$ref: "#/components/schemas/CreatorManualContext"`. No `additionalProperties: true` on security-boundary inputs. |
| Next slice | Creator Studio OpenAPI YAML Fix Slice |

---

## 13. Decision

Four blocking findings. See Section 12.

**NO-GO to Creator Studio Generated Client Planning Gate.**

**GO to Creator Studio OpenAPI YAML Fix Slice.**

**NO-GO to runtime / backend implementation.**

**NO-GO to `docs/nashir_v1_openapi.yaml` changes** in this slice.

### Required fixes for the OpenAPI YAML Fix Slice

- **B-1**: Add `CreatorTransferDraftCreateRequest` as a shared base schema, or explicitly declare destination-specific-only design and correct the planning doc.
- **B-2**: Constrain `payloadSummary` — define `CreatorTransferPayloadSummary` with typed fields, or formally declare it opaque with a documented contract.
- **B-3**: Introduce `CreatorStudioSessionStatus` enum; update `CreatorStudioSession.status` to reference it.
- **B-4**: Define `CreatorManualContext` schema with explicit allowed fields; replace the open object in `CreatorStudioSessionCreateRequest`.

### GO conditions for resuming generated-client planning

Generated-client planning may resume only after all four blocking findings are resolved and a follow-up review confirms:

- [ ] B-1 resolved: transfer schema structure decided and documented
- [ ] B-2 resolved: `payloadSummary` is typed or formally declared opaque
- [ ] B-3 resolved: session and draft status enums are separated
- [ ] B-4 resolved: `manualContext` is typed or removed

### Reference documents

- `docs/creator_studio_production_contract_planning.md`
- `docs/creator_studio_api_boundary_gate.md`
- `docs/creator_studio_openapi_planning.md`
- `docs/nashir_v1_openapi.yaml` — reviewed contract (YAML Fix Slice required)
