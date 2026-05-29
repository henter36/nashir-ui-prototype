# Creator Studio OpenAPI Fix Review Gate

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | OpenAPI contract fix review gate |
| OpenAPI YAML changes | NO-GO in this slice |
| Runtime / backend | NO-GO in this slice |
| Generated clients | NO-GO until this gate closes GO |
| UI API calls | NO-GO in this slice |

This document reviews the Creator Studio OpenAPI schema fixes from PR #35 against the blocking findings recorded in `docs/creator_studio_openapi_review_gate.md`. No changes are made to `docs/nashir_v1_openapi.yaml` in this slice.

---

## 2. Source Documents Reviewed

| Document | Role |
|---|---|
| `docs/creator_studio_openapi_review_gate.md` | Blocking findings B-1 through B-4 |
| `docs/creator_studio_openapi_planning.md` | Planning-stage naming and schema decisions |
| `docs/nashir_v1_openapi.yaml` | Contract under review |

---

## 3. B-1 Review — Transfer Draft Create Request Shape

### Evidence

`CreatorTransferDraftCreateRequest` exists at line 3351 as an explicit base schema requiring only `draftId`. Description states: "Specialized schemas extend this via allOf composition."

All four specialized schemas use `allOf` composition:

| Schema | Line | allOf base | Additional required | Overrides |
|---|---|---|---|---|
| `CreatorContentStudioTransferDraftCreateRequest` | 3364 | `CreatorTransferDraftCreateRequest` | `promptVersionId` | `CreatorContentStudioTransferOverrides` (optional) |
| `CreatorCampaignTransferDraftCreateRequest` | 3382 | `CreatorTransferDraftCreateRequest` | none beyond base | `CreatorCampaignTransferOverrides` (optional) |
| `CreatorPublishingTransferDraftCreateRequest` | 3393 | `CreatorTransferDraftCreateRequest` | `contentId` | `CreatorPublishingTransferOverrides` (optional) |
| `CreatorPromptGovernanceTransferDraftCreateRequest` | 3410 | `CreatorTransferDraftCreateRequest` | none beyond base | `CreatorPromptGovernanceTransferOverrides` (optional) |

`draftId` is defined once in the base (line 3360); no duplication in specialized schemas. All `overrides` are optional.

### Decision: B-1 CLOSED

---

## 4. B-2 Review — Transfer Payload Summary Shape

### Evidence

`CreatorTransferPayloadSummary` exists at line 3421. `additionalProperties: false` confirmed at line 3473.

Properties: `draftId`, `contentId`, `promptVersionId`, `destinationModule`, `selectedPlatform`, `targetContentType`, `campaignName`, `objective`, `targetPublishWindow`, `reviewReason`, `humanReviewRequired` — all typed, all optional. All use explicit types (`string`, `["string", "null"]`, `boolean`, or `$ref` to closed enum). No `additionalProperties: true`. No raw credential or platform token fields.

`CreatorTransferDraft.payloadSummary` references `$ref: "#/components/schemas/CreatorTransferPayloadSummary"` — the open object is gone.

### Decision: B-2 CLOSED

---

## 5. B-3 Review — Status / Readiness Enum Semantics

### Evidence

Three separate status enums exist:

| Enum | Line | Values | Scope |
|---|---|---|---|
| `CreatorStudioSessionStatus` | 2974 | `active`, `expired`, `blocked` | Session only — description explicitly states "Do not use this enum for context draft or transfer draft status" |
| `CreatorContextDraftStatus` | 2984 | `draft`, `incomplete`, `needs_consent`, `needs_platform_connection`, `needs_human_review`, `ready_for_transfer`, `blocked`, `expired` | Context draft only — description states "Do not use for session status" |
| `CreatorTransferDraftStatus` | 3000 | `pending_review`, `expired` | Transfer draft workflow state only |

Each resource uses its correct enum:
- `CreatorStudioSession.status` → `$ref: CreatorStudioSessionStatus` (line 3130)
- `CreatorContextDraft.status` → `$ref: CreatorContextDraftStatus`
- `CreatorTransferDraft.status` → `$ref: CreatorTransferDraftStatus`

`ready_for_transfer` remains in `CreatorContextDraftStatus` only — it is the context draft transfer gate. No `reviewed` state exists in any enum.

### Decision: B-3 CLOSED

---

## 6. B-4 Review — Manual Context Shape

### Evidence

`CreatorManualContext` exists at line 3052. `additionalProperties: false` confirmed at line 3082.

Properties: `title` (maxLength 200), `description` (maxLength 2000), `productOrService` (maxLength 200), `audience` (maxLength 500), `objective` (maxLength 500), `notes` (maxLength 2000) — all optional strings with explicit length caps.

Description states: "Must not contain OAuth tokens, private platform credentials, scraping output, or personal identifiers."

`CreatorStudioSessionCreateRequest.manualContext` at line 3100 references `$ref: "#/components/schemas/CreatorManualContext"` — the open object is replaced.

`CreatorStudioSession.manualContext` at line 3130 exposes the same `$ref` as optional in the response — consistent with what the create request accepts.

### Decision: B-4 CLOSED

---

## 7. Regression Checks

| Check | Result | Evidence |
|---|---|---|
| No `templateLinkId` | PASS | `grep` returns 0 matches outside prohibition descriptions |
| No `reviewed` readiness state | PASS | `grep` returns 0 problematic matches |
| `creatorHandle:` bare property absent | PASS | `grep -c "creatorHandle:"` → 0 |
| `selectedPlatform` required in session create | PASS | Line 3091 |
| `selectedPlatform` required in session response schema | PASS | Line 3112 |
| `creatorHandleRef` canonical in request and response | PASS | Lines 3097, 3125 |
| `manualContext` in session create request | PASS | Line 3100 |
| `manualContext` in session response schema | PASS | Line 3130 |
| `promptVersionId` required in Content Studio transfer | PASS | Line 3374 |
| `contentId` required in Publishing transfer | PASS | Lines 3401–3402 |
| `blockers` and `warnings` required in `CreatorReadinessAssessment` | PASS | Required list confirmed in prior review; not modified in this fix slice |
| `CreatorContextDraftCreateRequest` requires only `sessionId` | PASS | Not modified in this slice |
| Transfer endpoints require `ready_for_transfer` gate in descriptions | PASS | All four transfer endpoint descriptions state the requirement |
| No direct publishing endpoint | PASS | No `/publish` path added |
| No scraping endpoint | PASS | No scraping path added |
| No AI execution endpoint | PASS | No AI generation path added |
| `additionalProperties: true` in Creator Studio schemas | PASS | Only remaining match is `ErrorModel.details` at line 1563 — pre-existing shared error schema, not Creator Studio |

---

## 8. Generated Client Readiness Risk Review

### allOf composition risk

The `allOf` pattern used — `[base $ref, extension type:object]` — is the standard OpenAPI 3.x composition pattern. Modern generators (openapi-generator, hey-api, orval, kiota) handle this correctly. Campaign and Prompt Governance extensions have no `required` list in their extension object (only base `draftId` is required). This is valid OpenAPI and generates correct optional-only extension types.

**Risk: LOW**

### Closed object risks

`additionalProperties: false` on `CreatorManualContext` and `CreatorTransferPayloadSummary` produces strict client-side validation. Any unknown field will be rejected. This is the intended behavior and generates clean, safe types.

**Risk: BENEFICIAL**

### Enum naming stability

Three Creator Studio status enums (`CreatorStudioSessionStatus`, `CreatorContextDraftStatus`, `CreatorTransferDraftStatus`) are clearly named and scoped. Enum values are stable strings. No ambiguous overlap.

**Risk: LOW**

### Nullable / optional field clarity

`CreatorTransferPayloadSummary` optional-nullable fields are defined using `type: ["string", "null"]` (multi-type array syntax). OpenAPI 3.0.x does not support this syntax — nullable strings in 3.0.x must use `type: string` with `nullable: true`. The Nashir V1 contract declares `openapi: 3.1.0`, which does support array type syntax. However, most OpenAPI code generators targeted at V1 APIs still use 3.0.x-based toolchains and will fail to parse or incorrectly type these fields.

`payloadSummary` in `CreatorTransferDraft` is not in the required list — generated clients will treat it as optional.

**Risk: BLOCKING** — see B-5 in Section 9.

### Payload summary typing

Fully typed with `additionalProperties: false`. All 11 fields are explicit. Generated clients will have concrete field access.

**Risk: LOW**

---

## 9. Findings

### Blocking findings

**B-5 — OpenAPI 3.0 nullable syntax incompatibility in `CreatorTransferPayloadSummary`**

| Field | Value |
|---|---|
| Severity | Blocking before generated-client planning |
| Evidence | `CreatorTransferPayloadSummary` optional-nullable string fields use `type: ["string", "null"]` (OpenAPI 3.1 multi-type array syntax). The contract header declares `openapi: 3.1.0`, but most code generators (openapi-generator, kiota, orval) target OpenAPI 3.0.x toolchains and will fail to parse or produce incorrect types for these fields. |
| Risk | Generated nullable fields become untyped or generation fails outright on common 3.0-based toolchains. |
| Required fix | In Creator Studio OpenAPI YAML Fix Slice 2, update all nullable string fields in `CreatorTransferPayloadSummary` from `type: ["string", "null"]` to `type: string` with `nullable: true`; or explicitly evaluate and document a 3.1-native generator that handles array types, and include that decision in the generated-client planning gate before any code generation proceeds. |
| Owner | Creator Studio OpenAPI YAML Fix Slice 2 |

### Non-blocking findings

**NB-1 — `CreatorCampaignTransferDraftCreateRequest` and `CreatorPromptGovernanceTransferDraftCreateRequest` allOf extension has no required list**

| Field | Value |
|---|---|
| Severity | Non-blocking |
| Evidence | The `allOf` extension object for campaign and prompt-governance transfer requests has a `type: object` with `properties` but no `required` list. This is valid OpenAPI — draftId is required via the base. No extra required fields for these two destinations. |
| Assessment | Correct behavior. Generated clients will type these as having only optional extension fields beyond draftId. No functional impact. |
| Recommendation | No change needed. Document in generated-client planning that campaign and prompt-governance transfer requests require only draftId. |
| Owner | Generated-client planning gate |

### Watch items

**W-1 — `payloadSummary` is optional in `CreatorTransferDraft`**

| Field | Value |
|---|---|
| Severity | Watch |
| Evidence | `payloadSummary` is not in `CreatorTransferDraft.required`. Generated client code that unconditionally reads `payloadSummary` fields will need null guards. |
| Recommendation | Document in generated-client planning that callers must check for `payloadSummary` presence before accessing fields. |
| Owner | Generated-client planning gate |

**W-2 — `CreatorManualContext` closed shape may need extension path later**

| Field | Value |
|---|---|
| Severity | Watch |
| Evidence | `additionalProperties: false` correctly closes `CreatorManualContext`. If V2 needs additional context fields, a new YAML slice is required to extend the schema. |
| Recommendation | Document known V2 extension fields in the generated-client planning gate so the schema can be extended before code is frozen. |
| Owner | Generated-client planning gate |

---

## 10. Decision

B-1 CLOSED. B-2 CLOSED for closed payload shape; B-5 OPEN for nullable syntax compatibility. B-3 CLOSED. B-4 CLOSED. One new blocking finding: B-5.

**NO-GO to Creator Studio Generated Client Planning Gate.**

**GO to Creator Studio OpenAPI YAML Fix Slice 2.**

**NO-GO to runtime / backend implementation.**

**NO-GO to `docs/nashir_v1_openapi.yaml` changes** in this slice.

### Required fix for YAML Fix Slice 2

- **B-5**: Update nullable string fields in `CreatorTransferPayloadSummary` from `type: ["string", "null"]` to `type: string` + `nullable: true`; or evaluate and formally adopt a 3.1-native generator toolchain before code generation proceeds.

### GO conditions for resuming generated-client planning

- [ ] B-5 resolved: nullable syntax aligned with chosen generator toolchain
- [ ] Follow-up fix review confirms no new blocking findings

### Reference documents

- `docs/creator_studio_openapi_review_gate.md` — prior blocking gate (B-1 through B-4 closed; B-5 newly opened)
- `docs/creator_studio_openapi_planning.md`
- `docs/nashir_v1_openapi.yaml` — YAML Fix Slice 2 required before generated-client planning
