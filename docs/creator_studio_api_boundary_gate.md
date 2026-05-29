# Creator Studio API Boundary Gate

## 1. Task Classification

| Field | Value |
|---|---|
| Gate type | Documentation-only API boundary gate |
| Repository | nashir-ui-prototype |
| Status | Planning only — no runtime, no OpenAPI YAML, no generated-client changes |
| YAML changes | NO-GO in this gate |
| Backend implementation | NO-GO in this gate |
| UI changes | NO-GO in this gate |
| Generated clients | NO-GO in this gate |

This gate converts the merged Creator Studio production contract planning into an approved V1 API/OpenAPI planning scope. It does not touch `docs/nashir_v1_openapi.yaml`, `src/`, or any generated file.

---

## 2. Inputs

### Source document

`docs/creator_studio_production_contract_planning.md` — Creator Studio Production Contract Planning (PR #30, merged).

### Current prototype state

Creator Studio is a React/Vite prototype page only. No backend, API, database, auth, real AI execution, real scraping, real platform publishing, or real record creation exists.

### Upstream conventions in use

From `docs/api_contract_gate.md`:
- Endpoints are workspace-scoped.
- IDs are stable and opaque.
- API responses must not include raw secret values.
- Human review gates are required before publishing.
- AI outputs require confidence and limitations labels.

---

## 3. V1 API Boundary Decision

### In V1

- Manual / user-provided Creator Studio session creation (no auto-creation on page load).
- Context draft creation from explicit user selections.
- Readiness assessment evaluation (advisory; does not auto-block).
- Transfer draft creation to Content Studio, Campaign Wizard, Publishing Queue, and Prompt Governance — draft only; no final destination records created.

### Out of V1

- Platform OAuth ingestion (deferred — requires platform policy review).
- Creator profile snapshot from platform API (deferred — requires OAuth and consent model).
- Autonomous scraping or platform data polling.
- Direct AI content generation pipeline.
- Real platform posting or scheduling.
- Automated campaign orchestration.
- Cross-channel identity stitching.
- ROI / uplift prediction.
- Cross-session audience segment promotion.
- Competitor landscape analysis.

---

## 4. Approved V1 Candidate Endpoints

The following endpoints are approved for OpenAPI planning only. No implementation is approved in this gate.

### POST /creator-studio/sessions

| Field | Value |
|---|---|
| Purpose | Create a Creator Studio session for a workspace actor |
| Minimum request | `{ workspaceId, platform, creatorHandleRef }` |
| Minimum response | `{ sessionId, status, expiresAt }` |
| Permission | `creator_studio:session:create` |
| Readiness gate | Workspace must exist; platform is a supported enum value |
| NO-GO | Do not auto-create on page load. Do not store raw handle. Do not fetch platform data before explicit user action. |

### GET /creator-studio/sessions/{sessionId}

| Field | Value |
|---|---|
| Purpose | Retrieve current state of a Creator Studio session |
| Minimum request | `sessionId` path parameter |
| Minimum response | `{ sessionId, platform, status, expiresAt }` |
| Permission | `creator_studio:session:read` (session owner or workspace admin only) |
| Readiness gate | Valid session; not expired |
| NO-GO | Do not expose raw creator handle or platform token. Do not return performance data without confidence labels. |

### POST /creator-studio/context-drafts

| Field | Value |
|---|---|
| Purpose | Persist user-selected context references for a session before transfer |
| Minimum request | `{ sessionId, ideaId, angleId, segmentId, windowId, promptTemplateId }` — all IDs, no raw values |
| Minimum response | `{ draftId, status, humanReviewRequired, expiresAt }` |
| Permission | `creator_studio:context_draft:create` |
| Readiness gate | Session valid and not expired; session not in `blocked` status |
| NO-GO | Do not create real destination records. Do not trigger AI generation. Draft status is always `pending_review` until explicitly approved. |

### GET /creator-studio/context-drafts/{draftId}

| Field | Value |
|---|---|
| Purpose | Retrieve a workspace-scoped `CreatorContextDraft` by `draftId` |
| Minimum request | `draftId` path parameter |
| Minimum response | `{ draftId, sessionId, ideaId, angleId, segmentId, windowId, promptTemplateId, status, humanReviewRequired, expiresAt }` |
| Permission | `creator_studio:context_draft:read` (session owner or workspace admin only) |
| Readiness gate | `draftId` must resolve to a non-expired draft in the same workspace |
| NO-GO | Must fail if expired, workspace mismatch, unauthorized, blocked, or not found. Must not create records or execute transfer on retrieval. |

### POST /creator-studio/readiness-assessments

| Field | Value |
|---|---|
| Purpose | Evaluate production-readiness state of a session |
| Minimum request | `{ sessionId }` |
| Minimum response | `{ assessmentId, overallStatus, findings[], blockers[], warnings[], expiresAt }` |
| Permission | `creator_studio:readiness:create` |
| Readiness gate | None — assessment may be triggered at any point in the session |
| NO-GO | Do not treat result as a binding gate without human confirmation. Assessment is advisory only. |

### POST /creator-studio/transfer-drafts/content-studio

| Field | Value |
|---|---|
| Purpose | Create a draft transfer payload addressed to Content Studio |
| Minimum request | `{ draftId, overrides?: { targetContentType? } }` — `draftId` references `CreatorContextDraft` |
| Minimum response | `{ transferId, destinationModule: "content_studio", status: "pending_review", humanReviewRequired: true, expiresAt }` |
| Permission | `creator_studio:transfer:create`, `content_studio:draft:receive` |
| Readiness gate | `CreatorContextDraft` status is `ready_for_transfer`; governance template references an approved `PromptVersion` |
| NO-GO | Do not accept raw selection fields. Do not auto-generate content. Do not bypass PromptTemplate governance. Do not transfer competitor-derived content. |

### POST /creator-studio/transfer-drafts/campaign

| Field | Value |
|---|---|
| Purpose | Create a draft transfer payload addressed to Campaign Wizard |
| Minimum request | `{ draftId, overrides?: { campaignName?, objective? } }` — `draftId` references `CreatorContextDraft` |
| Minimum response | `{ transferId, destinationModule: "campaign_wizard", status: "pending_review", humanReviewRequired: true, expiresAt }` |
| Permission | `creator_studio:transfer:create`, `campaign:draft:receive` |
| Readiness gate | `CreatorContextDraft` status is `ready_for_transfer`; Campaign Wizard session must be user-initiated |
| NO-GO | Do not accept raw selection fields. Do not auto-launch campaigns. Do not auto-set budget or targeting. |

### POST /creator-studio/transfer-drafts/publishing

| Field | Value |
|---|---|
| Purpose | Create a draft transfer payload addressed to Publishing Queue |
| Minimum request | `{ draftId, contentId, overrides?: { targetPublishWindow? } }` — `draftId` references `CreatorContextDraft`; `contentId` references approved Content Studio item |
| Minimum response | `{ transferId, destinationModule: "publishing_queue", status: "pending_review", humanReviewRequired: true, expiresAt }` |
| Permission | `creator_studio:transfer:create`, `publishing:draft:receive` |
| Readiness gate | `CreatorContextDraft` status is `ready_for_transfer`; `contentId` resolves to an approved, non-expired, non-archived Content Studio item in the same workspace |
| NO-GO | Do not accept unapproved, archived, expired, or cross-workspace `contentId`. Do not auto-schedule. Do not publish without explicit user confirmation and governance approval. |

### POST /creator-studio/transfer-drafts/prompt-governance

| Field | Value |
|---|---|
| Purpose | Create a draft transfer payload addressed to Prompt Governance for template review |
| Minimum request | `{ draftId, overrides?: { reviewReason? } }` — `draftId` references `CreatorContextDraft`; `reviewReason` is a free-text annotation only |
| Minimum response | `{ transferId, destinationModule: "prompt_governance", status: "pending_review", humanReviewRequired: true, expiresAt }` |
| Permission | `creator_studio:transfer:create`, `prompt_governance:draft:receive` |
| Readiness gate | `CreatorContextDraft` status is `ready_for_transfer`; referenced `PromptTemplate` exists and is not deprecated |
| NO-GO | Do not accept raw selection fields. Do not create or modify `PromptTemplate` autonomously. Transfer is advisory reference only. |

### GET /creator-studio/transfer-drafts/{transferId}

| Field | Value |
|---|---|
| Purpose | Retrieve a workspace-scoped `CreatorTransferDraft` payload by `transferId` so destination modules can fetch the draft for review |
| Minimum request | `transferId` path parameter |
| Minimum response | `{ transferId, sessionId, contextDraftId, destinationModule, status, humanReviewRequired, payload, expiresAt }` |
| Permission | `creator_studio:transfer:read` (session owner, destination module service account, or workspace admin only) |
| Readiness gate | `transferId` must resolve to a non-expired draft in the same workspace |
| NO-GO | Must fail if expired, workspace mismatch, unauthorized, blocked, or not found. Must not create destination records or execute transfer on retrieval. |

---

## 5. Required Payload Principles

- All resources are workspace-scoped (`workspaceId`).
- IDs are stable and opaque; user-facing names are not identifiers.
- `draftId` always references a `CreatorContextDraft`, not a session directly.
- `contentId` in the publishing transfer endpoint must reference an approved Content Studio item in the same workspace.
- `overrides` are optional; must be validated server-side; overrides that change reviewed meaning require re-review before the transfer draft is accepted.
- No child draft (`CreatorContextDraft`, `CreatorTransferDraft`) may outlive its parent `CreatorStudioSession`.
- All four transfer endpoints create destination draft records only — no final records, no real publishing, no real AI execution.
- All transfer drafts carry `humanReviewRequired: true` in the response.
- API responses must not expose raw credentials, platform tokens, raw prompt text, or raw platform API payloads.

---

## 6. Approved V1 Entities for OpenAPI Planning

| Entity | Persistence | TTL | Sensitivity | Owner |
|---|---|---|---|---|
| `CreatorStudioSession` | Short-lived; explicit user action | 24 hours default | HIGH — creator handle ref, platform token ref | Creator Studio |
| `CreatorContextDraft` | Short-lived; at or before session expiry | Max 24 hours (capped by parent session TTL) | MEDIUM — AI-derived selection IDs, handle ref via session | Creator Studio |
| `CreatorTransferDraft` | Short-lived; at or before session and context draft expiry | Max 24 hours (capped by parent session and context draft TTL) | MEDIUM — payload contains handle ref and AI suggestions | Creator Studio |
| `CreatorReadinessAssessment` | Tied to session; advisory record | 24 hours | LOW | Creator Studio |
| `CreatorComplianceFinding` | Tied to assessment | Inherits assessment TTL | LOW | Creator Studio |
| `CreatorProfileSnapshot` | Ephemeral; consent-gated | 6 hours (stale data risk) | HIGH — third-party creator data; requires explicit consent | Creator Studio (deferred to post-V1 or extended V1) |

`CreatorProfileSnapshot` is listed for awareness only. It is deferred until OAuth and consent model are approved.

Lifecycle rule: No child draft may outlive its parent `CreatorStudioSession`. If the session expires, all associated `CreatorContextDraft` and `CreatorTransferDraft` records become expired immediately. Backend must enforce this cascade on session expiry.

---

## 7. Readiness States for OpenAPI Planning

| State | Meaning |
|---|---|
| `draft` | Session created; selections incomplete |
| `incomplete` | Required selections missing |
| `needs_consent` | Platform connection or user consent not obtained |
| `needs_platform_connection` | Platform not connected in workspace |
| `needs_human_review` | Context draft exists but not reviewed |
| `ready_for_transfer` | Human review complete; all gates passed |
| `blocked` | Compliance or governance finding blocks progress |
| `expired` | Session or draft has passed TTL |

The UI must not infer `ready_for_transfer` from local state. Backend must be the authoritative source for all state transitions.

---

## 8. Permissions

| Permission string | Scope |
|---|---|
| `creator_studio:session:create` | Create a Creator Studio session |
| `creator_studio:session:read` | Read session state (owner or workspace admin only) |
| `creator_studio:context_draft:create` | Persist context draft selections |
| `creator_studio:context_draft:read` | Read a context draft by `draftId` (owner or workspace admin only) |
| `creator_studio:readiness:create` | Trigger readiness assessment |
| `creator_studio:transfer:create` | Create a transfer draft to any destination |
| `creator_studio:transfer:read` | Read a transfer draft by `transferId` (owner, destination module service account, or workspace admin only) |
| `content_studio:draft:receive` | Accept a transfer draft in Content Studio |
| `campaign:draft:receive` | Accept a transfer draft in Campaign Wizard |
| `publishing:draft:receive` | Accept a transfer draft in Publishing Queue |
| `prompt_governance:draft:receive` | Accept a transfer draft in Prompt Governance |

---

## 9. Deferred Scope

The following capabilities are explicitly out of scope for V1 OpenAPI planning. They may not be implemented or implied in any V1 endpoint.

| Capability | Reason deferred |
|---|---|
| Platform OAuth ingestion | Requires platform policy and legal review per platform |
| `POST /creator-studio/profile-snapshots` | Requires OAuth, consent model, and privacy gate |
| Autonomous scraping or platform data polling | Requires platform API policy review and compliance gate |
| Direct AI content generation | Requires AI task envelope, evidence pack, and governance approval |
| Real platform posting | Requires OAuth, governance approval, and publishing gate |
| Automated campaign orchestration | Requires campaign engine and human review gate |
| Cross-channel identity stitching | Requires identity model extension |
| ROI / uplift prediction | Requires analytics model and data confidence gate |
| Generated client / SDK | Deferred until OpenAPI is stable and reviewed |
| Cross-session audience segment promotion | Requires audience model extension |
| Competitor landscape analysis | Requires platform API policy and legal review |

---

## 10. OpenAPI Planning Gate

### GO conditions

GO to "Creator Studio OpenAPI Planning Slice" only if all of the following are confirmed:

- [ ] V1 candidate endpoints (Section 4) approved, including read endpoints (`GET /creator-studio/context-drafts/{draftId}`, `GET /creator-studio/transfer-drafts/{transferId}`)
- [ ] Payload principles (Section 5) approved
- [ ] V1 entities (Section 6) approved, including TTL caps and lifecycle cascade rule
- [ ] `promptTemplateId` field naming approved
- [ ] Permissions (Section 8) approved, including read permissions
- [ ] Readiness states (Section 7) approved; `ready_for_transfer` confirmed as the gate state for all transfer endpoints
- [ ] Deferred scope (Section 9) accepted
- [ ] NO-GO conditions in Section 4 accepted per endpoint

### NO-GO conditions

- No runtime implementation until OpenAPI slice is reviewed and accepted in a separate gate.
- No generated client until OpenAPI YAML is stable and reviewed.
- No publishing integration until governance and consent states are implemented and tested.
- No platform OAuth connection until platform policy and legal review are complete.
- No AI execution pipeline until AI task envelope and governance are approved.

---

## 11. Final Decision

GO to **Creator Studio OpenAPI Planning Slice**.

NO-GO to runtime implementation.

NO-GO to OpenAPI YAML patch (`docs/nashir_v1_openapi.yaml`) until the OpenAPI planning slice is written, reviewed, and accepted.

### Reference documents

- `docs/creator_studio_production_contract_planning.md` — source contract (PR #30)
- `docs/api_contract_gate.md` — API contract principles and workspace scoping
- `docs/data_entity_and_identity_model.md` — canonical entity and identity model
- `docs/nashir_v1_openapi.yaml` — current V1 OpenAPI contract (not patched in this gate)
