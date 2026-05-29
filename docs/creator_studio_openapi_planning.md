# Creator Studio OpenAPI Planning Slice

## 1. Status and Scope

| Field | Value |
|---|---|
| Gate type | Documentation-only OpenAPI planning |
| YAML changes | NO-GO in this slice |
| Runtime / backend | NO-GO in this slice |
| Generated clients | NO-GO in this slice |
| UI changes | NO-GO in this slice |

This document defines the future OpenAPI YAML scope, path contracts, schema candidates, operationIds, states, permissions, and validation rules for Creator Studio. No changes are made to `docs/nashir_v1_openapi.yaml` in this slice.

The next slice may edit `docs/nashir_v1_openapi.yaml` only after this planning document is reviewed and accepted.

---

## 2. Source of Truth

| Document | Role |
|---|---|
| `docs/creator_studio_api_boundary_gate.md` | V1 scope authority — controls which endpoints, entities, permissions, and states are in V1 |
| `docs/creator_studio_production_contract_planning.md` | Full entity, payload, privacy, transfer contract, and risk planning |
| `docs/nashir_v1_openapi.yaml` | Existing API convention reference — not modified in this slice |

The API Boundary Gate controls V1 scope. Any endpoint not listed there is deferred.

---

## 3. Path Convention Alignment

Existing V1 paths use `/workspaces/{workspaceId}/...` workspace scoping (e.g., `/workspaces/{workspaceId}/products`). Creator Studio paths follow this convention. The boundary gate listed short paths for readability; YAML implementation will use the full scoped form.

| Short form (boundary gate) | YAML path |
|---|---|
| `POST /creator-studio/sessions` | `POST /workspaces/{workspaceId}/creator-studio/sessions` |
| `GET /creator-studio/sessions/{sessionId}` | `GET /workspaces/{workspaceId}/creator-studio/sessions/{sessionId}` |
| `POST /creator-studio/context-drafts` | `POST /workspaces/{workspaceId}/creator-studio/context-drafts` |
| `GET /creator-studio/context-drafts/{draftId}` | `GET /workspaces/{workspaceId}/creator-studio/context-drafts/{draftId}` |
| `POST /creator-studio/readiness-assessments` | `POST /workspaces/{workspaceId}/creator-studio/readiness-assessments` |
| `POST /creator-studio/transfer-drafts/content-studio` | `POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/content-studio` |
| `POST /creator-studio/transfer-drafts/campaign` | `POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/campaign` |
| `POST /creator-studio/transfer-drafts/publishing` | `POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/publishing` |
| `POST /creator-studio/transfer-drafts/prompt-governance` | `POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/prompt-governance` |
| `GET /creator-studio/transfer-drafts/{transferId}` | `GET /workspaces/{workspaceId}/creator-studio/transfer-drafts/{transferId}` |

`workspaceId` is a path parameter on all endpoints. All resource IDs are workspace-scoped; cross-workspace access must fail with `403 workspace_mismatch`.

---

## 4. Approved V1 Paths — Endpoint Planning

### POST /workspaces/{workspaceId}/creator-studio/sessions

| Field | Value |
|---|---|
| operationId | `createCreatorStudioSession` |
| Tag | `Creator Studio` |
| Purpose | Create a Creator Studio session for a workspace actor |
| Request schema | `CreatorStudioSessionCreateRequest` |
| Response schema | `CreatorStudioSessionResponse` |
| Permission | `creator_studio:session:create` |
| Readiness gate | Workspace must exist; `selectedPlatform` must be a supported enum value if provided |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `invalid_override` |
| NO-GO | Must not auto-create on page load. Must not store raw creator handle. Must not fetch platform data before explicit user action. |

### GET /workspaces/{workspaceId}/creator-studio/sessions/{sessionId}

| Field | Value |
|---|---|
| operationId | `getCreatorStudioSession` |
| Tag | `Creator Studio` |
| Purpose | Retrieve the current state of a Creator Studio session |
| Request schema | Path params only — no request body |
| Response schema | `CreatorStudioSessionResponse` |
| Permission | `creator_studio:session:read` (session owner or workspace admin only) |
| Readiness gate | Session must not be expired; workspace must match |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired` |
| NO-GO | Must not expose raw creator handle or platform token. Must not return platform performance data without confidence labels. |

### POST /workspaces/{workspaceId}/creator-studio/context-drafts

| Field | Value |
|---|---|
| operationId | `createCreatorContextDraft` |
| Tag | `Creator Studio` |
| Purpose | Persist user-selected context references for a session before transfer |
| Request schema | `CreatorContextDraftCreateRequest` |
| Response schema | `CreatorContextDraftResponse` |
| Permission | `creator_studio:context_draft:create` |
| Readiness gate | Session must be valid and not expired; session must not be in `blocked` status |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired`, `blocked_by_governance`, `invalid_state` |
| NO-GO | Must not create real destination records. Must not trigger AI generation. Draft `status` is always `needs_human_review` until explicitly promoted. |

### GET /workspaces/{workspaceId}/creator-studio/context-drafts/{draftId}

| Field | Value |
|---|---|
| operationId | `getCreatorContextDraft` |
| Tag | `Creator Studio` |
| Purpose | Retrieve a workspace-scoped `CreatorContextDraft` by `draftId` |
| Request schema | Path params only — no request body |
| Response schema | `CreatorContextDraftResponse` |
| Permission | `creator_studio:context_draft:read` (session owner or workspace admin only) |
| Readiness gate | `draftId` must resolve to a non-expired draft in the same workspace |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired` |
| NO-GO | Must not create records or execute transfer on retrieval. Return `410 Gone` with `expired` error code if draft is past TTL (see Section 9 for expired state convention). |

### POST /workspaces/{workspaceId}/creator-studio/readiness-assessments

| Field | Value |
|---|---|
| operationId | `createCreatorReadinessAssessment` |
| Tag | `Creator Studio` |
| Purpose | Evaluate and record the production-readiness state of a context draft |
| Request schema | `CreatorReadinessAssessmentCreateRequest` |
| Response schema | `CreatorReadinessAssessmentResponse` |
| Permission | `creator_studio:readiness:create` |
| Readiness gate | None — assessment may be triggered at any point |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found` |
| NO-GO | Must not treat result as a binding gate. Assessment is advisory only. Must not auto-block or auto-approve a context draft. |

### POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/content-studio

| Field | Value |
|---|---|
| operationId | `createCreatorContentStudioTransferDraft` |
| Tag | `Creator Studio` |
| Purpose | Create a draft transfer payload addressed to Content Studio |
| Request schema | `CreatorTransferDraftCreateRequest` with `overrides: CreatorContentStudioTransferOverrides` |
| Response schema | `CreatorTransferDraftResponse` |
| Permission | `creator_studio:transfer:create`, `content_studio:draft:receive` |
| Readiness gate | `CreatorContextDraft` status must be `ready_for_transfer`; governance template must reference an approved `PromptVersion` |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired`, `invalid_state`, `blocked_by_governance`, `invalid_override` |
| NO-GO | Must not accept raw selection fields. Must not auto-generate content. Must not bypass `PromptTemplate` governance. Must not transfer competitor-derived content. |

### POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/campaign

| Field | Value |
|---|---|
| operationId | `createCreatorCampaignTransferDraft` |
| Tag | `Creator Studio` |
| Purpose | Create a draft transfer payload addressed to Campaign Wizard |
| Request schema | `CreatorTransferDraftCreateRequest` with `overrides: CreatorCampaignTransferOverrides` |
| Response schema | `CreatorTransferDraftResponse` |
| Permission | `creator_studio:transfer:create`, `campaign:draft:receive` |
| Readiness gate | `CreatorContextDraft` status must be `ready_for_transfer`; Campaign Wizard session must be user-initiated |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired`, `invalid_state`, `blocked_by_governance`, `invalid_override` |
| NO-GO | Must not accept raw selection fields. Must not auto-launch campaigns. Must not auto-set budget or targeting. |

### POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/publishing

| Field | Value |
|---|---|
| operationId | `createCreatorPublishingTransferDraft` |
| Tag | `Creator Studio` |
| Purpose | Create a draft transfer payload addressed to Publishing Queue |
| Request schema | `CreatorTransferDraftCreateRequest` with `contentId` (required) and `overrides: CreatorPublishingTransferOverrides` |
| Response schema | `CreatorTransferDraftResponse` |
| Permission | `creator_studio:transfer:create`, `publishing:draft:receive` |
| Readiness gate | `CreatorContextDraft` status must be `ready_for_transfer`; `contentId` must resolve to an approved, non-expired, non-archived Content Studio item in the same workspace |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired`, `invalid_state`, `blocked_by_governance`, `content_not_approved`, `content_archived_or_expired`, `duplicate_scheduling_not_supported`, `invalid_override` |
| NO-GO | Must not accept unapproved, archived, expired, or cross-workspace `contentId`. Must not auto-schedule. Must not publish without explicit user confirmation and governance approval. |

### POST /workspaces/{workspaceId}/creator-studio/transfer-drafts/prompt-governance

| Field | Value |
|---|---|
| operationId | `createCreatorPromptGovernanceTransferDraft` |
| Tag | `Creator Studio` |
| Purpose | Create a draft transfer payload addressed to Prompt Governance for template review |
| Request schema | `CreatorTransferDraftCreateRequest` with `overrides: CreatorPromptGovernanceTransferOverrides` |
| Response schema | `CreatorTransferDraftResponse` |
| Permission | `creator_studio:transfer:create`, `prompt_governance:draft:receive` |
| Readiness gate | `CreatorContextDraft` status must be `ready_for_transfer`; referenced `PromptTemplate` must exist and not be deprecated |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired`, `invalid_state`, `blocked_by_governance`, `invalid_override` |
| NO-GO | Must not accept raw selection fields. Must not create or modify `PromptTemplate` autonomously. Transfer is advisory reference only. |

### GET /workspaces/{workspaceId}/creator-studio/transfer-drafts/{transferId}

| Field | Value |
|---|---|
| operationId | `getCreatorTransferDraft` |
| Tag | `Creator Studio` |
| Purpose | Retrieve a workspace-scoped `CreatorTransferDraft` by `transferId` for destination module review |
| Request schema | Path params only — no request body |
| Response schema | `CreatorTransferDraftResponse` |
| Permission | `creator_studio:transfer:read` (session owner, destination module service account, or workspace admin only) |
| Readiness gate | `transferId` must resolve to a non-expired draft in the same workspace |
| Error conditions | `unauthorized`, `forbidden`, `workspace_mismatch`, `not_found`, `expired` |
| NO-GO | Must not create destination records or execute transfer on retrieval. Return `410 Gone` with `expired` error code if draft is past TTL. |

---

## 5. Schema Candidates

Planning only. No YAML implementation in this slice.

### CreatorStudioSessionCreateRequest

- **Purpose**: Request body for creating a new Creator Studio session.
- **Required fields**: `source` (enum: `manual` — V1 only)
- **Optional fields**: `selectedPlatform` (enum), `creatorHandle` (opaque string ref — not stored raw), `manualContext` (free-form object for user-provided notes)
- **Sensitive fields**: `creatorHandle` — must be stored as reference only, never raw; `manualContext` — must not contain OAuth tokens or credentials
- **Validation notes**: `source` must be `manual` in V1. `selectedPlatform` must match supported platform enum if provided.

### CreatorStudioSessionResponse

- **Purpose**: Response for session creation or retrieval.
- **Required fields**: `sessionId`, `workspaceId`, `status`, `createdAt`, `expiresAt`
- **Optional fields**: `selectedPlatform`, `creatorHandleRef` (opaque reference, not raw handle), `snapshotRef` (deferred)
- **Sensitive fields**: Must not expose raw creator handle, platform tokens, or OAuth state.
- **TTL/lifecycle**: `expiresAt` is mandatory. Expired sessions return `expired` status or `410 Gone` — see Section 9.

### CreatorContextDraftCreateRequest

- **Purpose**: Request body for persisting user-selected context references.
- **Required fields**: `sessionId`, `ideaId`, `angleId`, `segmentId`, `windowId`, `promptTemplateId`
- **Optional fields**: none in V1
- **Sensitive fields**: All fields are reference IDs — no raw values, labels, or platform data.
- **Validation notes**: All IDs must resolve to known fixture/catalog entries within the workspace. `promptTemplateId` must reference a non-deprecated entry.

### CreatorContextDraftResponse

- **Purpose**: Response for context draft creation or retrieval.
- **Required fields**: `draftId`, `sessionId`, `workspaceId`, `ideaId`, `angleId`, `segmentId`, `windowId`, `promptTemplateId`, `status`, `humanReviewRequired`, `createdAt`, `expiresAt`
- **Optional fields**: none in V1
- **Sensitive fields**: None — all fields are IDs and status.
- **TTL/lifecycle**: `expiresAt` is mandatory; capped by parent session `expiresAt`.

### CreatorReadinessAssessmentCreateRequest

- **Purpose**: Request body for triggering a readiness assessment.
- **Required fields**: `draftId`
- **Optional fields**: none in V1
- **Validation notes**: `draftId` must resolve to a valid, non-expired `CreatorContextDraft` in the same workspace.

### CreatorReadinessAssessmentResponse

- **Purpose**: Response for readiness assessment creation.
- **Required fields**: `assessmentId`, `draftId`, `workspaceId`, `overallStatus`, `findings`, `createdAt`, `expiresAt`
- **Optional fields**: `blockers`, `warnings`
- **Sensitive fields**: None — advisory result only.
- **Validation notes**: `overallStatus` uses `CreatorReadinessStatus` enum. `findings` is an array of `CreatorComplianceFinding`. Assessment is advisory; must not auto-block or auto-approve.

### CreatorTransferDraftCreateRequest

- **Purpose**: Base request body for all transfer draft creation endpoints. Extended per destination.
- **Required fields**: `draftId` (references `CreatorContextDraft`)
- **Optional fields**: `overrides` (destination-specific override object — see per-destination override schemas)
- **Sensitive fields**: None — ID and overrides only.
- **Validation notes**: `draftId` must be in `ready_for_transfer` status. Overrides must be validated; overrides that change the approved transfer context require re-review before the draft is accepted.

### CreatorTransferDraftResponse

- **Purpose**: Response for all transfer draft creation and retrieval endpoints.
- **Required fields**: `transferId`, `sessionId`, `contextDraftId`, `workspaceId`, `destinationModule`, `status`, `humanReviewRequired`, `createdAt`, `expiresAt`
- **Optional fields**: `payload` (summary only — must not expose raw platform data, credentials, or prompt text)
- **Sensitive fields**: `payload` — must not include raw platform tokens, raw prompt text, or raw scraping output.
- **TTL/lifecycle**: `expiresAt` mandatory; capped by parent session and context draft `expiresAt`.

### CreatorContentStudioTransferOverrides

- **Purpose**: Optional destination-specific overrides for Content Studio transfer.
- **Required fields**: none
- **Optional fields**: `targetContentType` (enum)
- **Validation notes**: If provided, `targetContentType` must be a valid content type for the selected platform. Override changes that alter the approved transfer context require re-review.

### CreatorCampaignTransferOverrides

- **Purpose**: Optional destination-specific overrides for Campaign Wizard transfer.
- **Required fields**: none
- **Optional fields**: `campaignName` (string, max length TBD), `objective` (enum)
- **Validation notes**: `objective` must match a supported campaign objective enum. These are additive annotations only and must not contradict the ready_for_transfer context draft.

### CreatorPublishingTransferOverrides

- **Purpose**: Optional destination-specific overrides for Publishing Queue transfer.
- **Required fields**: none (but `contentId` is required on the request, not in overrides)
- **Optional fields**: `targetPublishWindow` (string — ISO 8601 datetime or structured window object TBD)
- **Validation notes**: `targetPublishWindow` must be validated against platform policy. Changing the window from the context draft's `windowId` triggers re-review.

### CreatorPromptGovernanceTransferOverrides

- **Purpose**: Optional destination-specific overrides for Prompt Governance transfer.
- **Required fields**: none
- **Optional fields**: `reviewReason` (string — free-text annotation for the governance reviewer, not a selection override)
- **Validation notes**: `reviewReason` is informational only and does not alter the ready_for_transfer context. Max length TBD.

### CreatorComplianceFinding

- **Purpose**: Individual compliance or readiness finding within a `CreatorReadinessAssessmentResponse`.
- **Required fields**: `findingId`, `rule`, `status`, `severity`, `message`
- **Optional fields**: `requiredAction`, `resolvedAt`
- **Sensitive fields**: None.
- **Validation notes**: `severity` enum: `blocker`, `warning`, `info`. `status` enum: `open`, `resolved`.

### CreatorProfileSnapshotRef

- **Purpose**: Deferred — included for schema naming reservation only. Represents an opaque reference to a creator profile snapshot. Not implemented in V1.
- **Required fields**: `snapshotRef` (opaque ID)
- **Optional fields**: `platform`, `snapshotAt`, `confidenceLabel`, `dataSource`
- **Sensitive fields**: Must never include raw platform API payload, individual audience member data, or OAuth tokens.
- **TTL/lifecycle**: Deferred to extended V1. TTL suggest 6 hours when implemented.

### Error Model

Use the existing shared `ErrorModel` from `docs/nashir_v1_openapi.yaml` if present. If no shared model exists, define `CreatorErrorModel` as:
- **Required fields**: `error` (object with `code` (string), `message` (string))
- **Optional fields**: `error.details` (array of field-level errors), `error.requestId` (string)
- **Consistent with**: existing `DefaultError` / `BadRequest` response convention in the YAML.

---

## 6. Naming Decisions

The following names are frozen for all future YAML work:

| Decision | Frozen value |
|---|---|
| Prompt template reference field | `promptTemplateId` (not `templateLinkId`) |
| `draftId` | ID of `CreatorContextDraft` |
| `transferId` | ID of `CreatorTransferDraft` |
| `contentId` | Required on publishing transfer only; references approved Content Studio item |
| Context draft status field | `status` using `CreatorContextDraftStatus` enum |
| Readiness state set | See Section 9 — no `reviewed` state in V1 |
| Workspace scoping | Mandatory on all resource IDs — `workspaceId` is a path parameter |
| Session field name | `creatorHandleRef`, never `creatorHandle` in responses |
| Tag | `Creator Studio` |

---

## 7. Request Payload Planning

Minimum V1 request bodies:

### POST .../sessions
```
{
  source: "manual",                    // required; enum: manual
  selectedPlatform?: string,           // optional; enum: Instagram | TikTok | YouTube | X | Snapchat
  creatorHandle?: string,              // optional; stored as opaque ref only
  manualContext?: object               // optional; free-form user notes
}
```

### POST .../context-drafts
```
{
  sessionId: string,                   // required
  ideaId: string,                      // required
  angleId: string,                     // required
  segmentId: string,                   // required
  windowId: string,                    // required
  promptTemplateId: string             // required
}
```

### POST .../readiness-assessments
```
{
  draftId: string                      // required; references CreatorContextDraft
}
```

### POST .../transfer-drafts/content-studio
```
{
  draftId: string,                     // required; references CreatorContextDraft
  overrides?: {
    targetContentType?: string         // optional enum
  }
}
```

### POST .../transfer-drafts/campaign
```
{
  draftId: string,                     // required; references CreatorContextDraft
  overrides?: {
    campaignName?: string,             // optional
    objective?: string                 // optional enum
  }
}
```

### POST .../transfer-drafts/publishing
```
{
  draftId: string,                     // required; references CreatorContextDraft
  contentId: string,                   // required; references approved Content Studio item
  overrides?: {
    targetPublishWindow?: string       // optional; ISO 8601 or structured TBD
  }
}
```

### POST .../transfer-drafts/prompt-governance
```
{
  draftId: string,                     // required; references CreatorContextDraft
  overrides?: {
    reviewReason?: string              // optional; annotation for governance reviewer
  }
}
```

### GET endpoints
Path parameters only. No request body.

---

## 8. Response Payload Planning

Response principles for all Creator Studio endpoints:

- Always return `workspaceId` and relevant resource ID.
- Always return `status` using the appropriate status enum.
- Always return `expiresAt` for any resource with a TTL.
- Always return `humanReviewRequired: true` on all transfer draft responses.
- Return `complianceFindings` array only where blocking findings exist — do not suppress blockers.
- Return `destinationModule` on all transfer draft responses.
- Return `payload` summary on transfer draft response only where safe — must not expose raw platform tokens, raw prompt text, or raw scraping output.
- Do not return raw creator handle in any response; return `creatorHandleRef` (opaque ref).
- Do not return raw platform API payload in any response.
- Include `requestId` in all responses (consistent with `X-Request-Id` header convention from existing YAML slices).

---

## 9. Readiness States

The following status enum is carried forward from the boundary gate. No additional states are introduced in V1.

| Status | Meaning |
|---|---|
| `draft` | Session or draft created; selections incomplete |
| `incomplete` | Required selections missing |
| `needs_consent` | Platform connection or user consent not obtained |
| `needs_platform_connection` | Platform not connected in workspace |
| `needs_human_review` | Context draft exists but awaiting review |
| `ready_for_transfer` | Human review complete; all gates passed; eligible for transfer |
| `blocked` | Compliance or governance finding blocks progress |
| `expired` | Session or draft has passed TTL |

Notes:
- Transfer endpoints require `CreatorContextDraft` status `ready_for_transfer`.
- There is no `reviewed` state in V1. Drafts transition directly from `needs_human_review` to `ready_for_transfer` on approval, or to `blocked` if a governance finding is raised.
- For GET endpoints on expired resources: return `HTTP 410 Gone` with `error.code: "expired"`. Do not return `404 Not Found` for expired resources that existed — use `410` to distinguish "never existed" (`404`) from "existed but expired" (`410`).
- The UI must not infer `ready_for_transfer` from local state. Backend is authoritative.

---

## 10. Permissions

Carry forward exactly from boundary gate. No new permissions are introduced in V1.

| Permission | Scope |
|---|---|
| `creator_studio:session:create` | Create a Creator Studio session |
| `creator_studio:session:read` | Read session state (owner or workspace admin only) |
| `creator_studio:context_draft:create` | Persist context draft selections |
| `creator_studio:context_draft:read` | Read a context draft by `draftId` |
| `creator_studio:readiness:create` | Trigger readiness assessment |
| `creator_studio:transfer:create` | Create a transfer draft to any destination |
| `creator_studio:transfer:read` | Read a transfer draft by `transferId` |
| `content_studio:draft:receive` | Accept a transfer draft in Content Studio |
| `campaign:draft:receive` | Accept a transfer draft in Campaign Wizard |
| `publishing:draft:receive` | Accept a transfer draft in Publishing Queue |
| `prompt_governance:draft:receive` | Accept a transfer draft in Prompt Governance |

---

## 11. Error Conditions

Reusable error codes for all Creator Studio endpoints. To be referenced as enum values in `error.code`.

| Error code | HTTP status | Meaning |
|---|---|---|
| `unauthorized` | 401 | Authentication missing or invalid |
| `forbidden` | 403 | Actor lacks required permission |
| `workspace_mismatch` | 403 | Resource belongs to a different workspace |
| `not_found` | 404 | Resource does not exist |
| `expired` | 410 | Resource existed but has passed TTL |
| `blocked_by_governance` | 422 | Context draft or transfer blocked by a compliance finding |
| `missing_consent` | 422 | Required user consent not obtained |
| `missing_platform_connection` | 422 | Platform not connected in workspace |
| `invalid_state` | 422 | Resource status does not permit the requested operation |
| `invalid_override` | 422 | Override field failed validation or contradicts the ready_for_transfer context |
| `content_not_approved` | 422 | `contentId` does not resolve to an approved Content Studio item |
| `content_archived_or_expired` | 422 | `contentId` resolves to an archived or expired item |
| `duplicate_scheduling_not_supported` | 422 | Content item is already scheduled and rescheduling is not supported |

---

## 12. Lifecycle and TTL

| Resource | Max TTL | Cap rule |
|---|---|---|
| `CreatorStudioSession` | 24 hours (configurable) | Parent — no cap |
| `CreatorContextDraft` | 24 hours | Capped by parent session `expiresAt` |
| `CreatorTransferDraft` | 24 hours | Capped by parent session and context draft `expiresAt` |
| `CreatorReadinessAssessment` | 24 hours | Tied to session |
| `CreatorProfileSnapshot` | 6 hours (deferred) | Tied to session |

Lifecycle rule: No child draft may outlive its parent `CreatorStudioSession`. If a session expires, all associated `CreatorContextDraft` and `CreatorTransferDraft` records become expired immediately. Backend must enforce this cascade on session expiry. OpenAPI YAML must document this lifecycle constraint in the session endpoint description.

---

## 13. Security and Privacy Notes for OpenAPI

These constraints must be reflected in YAML descriptions and not just documentation:

- All endpoints are workspace-scoped. `workspaceId` is a required path parameter.
- No platform token, OAuth credential, or secret value may appear in any response schema field.
- No raw scraping output or raw platform API payload in V1.
- `humanReviewRequired: true` must appear in all transfer draft response schemas.
- Destination transfers create draft records only — no final publishing, no AI execution, no real campaign creation.
- No automatic publishing endpoint exists in V1.
- Audit fields (`createdAt`, `expiresAt`, `requestId`) are recommended on all resources.
- `creatorHandleRef` in responses is an opaque reference — raw handle must not be returned.

---

## 14. Explicitly Deferred from OpenAPI V1

The following must not appear in the V1 YAML slice. Any PR that introduces these requires a new boundary gate.

| Capability | Reason |
|---|---|
| OAuth ingestion endpoints | Requires platform policy and legal review |
| `POST .../profile-snapshots` | Requires OAuth, consent gate, and privacy review |
| Autonomous scraping | Requires platform API policy review |
| AI content generation execution | Requires AI task envelope and governance approval |
| Direct platform posting | Requires OAuth, governance, and publishing gate |
| Automated campaign orchestration | Requires campaign engine and human review gate |
| Cross-channel identity stitching | Requires identity model extension |
| ROI / uplift prediction | Requires analytics model and data confidence gate |
| Generated client / SDK | Deferred until OpenAPI is stable and reviewed |
| `reviewed` readiness state | Not defined in V1; requires separate approval |
| Cross-session audience promotion | Requires audience model extension |

---

## 15. OpenAPI YAML Implementation Gate

### GO conditions for next slice (YAML implementation)

GO to Creator Studio OpenAPI YAML slice only if all of the following are confirmed:

- [ ] This planning document reviewed and accepted
- [ ] Path list (Section 3) approved including workspace-scoped form
- [ ] All operationIds (Section 4) approved
- [ ] All schema candidates (Section 5) approved
- [ ] Naming decisions (Section 6) confirmed — especially `promptTemplateId`
- [ ] Request payloads (Section 7) approved
- [ ] Response principles (Section 8) approved
- [ ] Readiness states (Section 9) approved — no `reviewed` state in V1
- [ ] Permission list (Section 10) approved
- [ ] Error code strategy (Section 11) approved — `410` for expired, `404` for not-found
- [ ] Lifecycle TTL caps (Section 12) approved
- [ ] Security and privacy notes (Section 13) accepted
- [ ] Deferred scope (Section 14) accepted
- [ ] No unresolved Gemini or Sonar review comments on planning docs

### NO-GO conditions

Until the YAML PR is reviewed and accepted:

- No runtime implementation.
- No generated clients.
- No backend controllers or service layer.
- No API calls added to UI.
- No `docs/nashir_v1_openapi.yaml` patch.

---

## 16. Final Decision

GO to **Creator Studio OpenAPI YAML Slice** only after this planning PR is reviewed and accepted.

NO-GO to runtime implementation.

NO-GO to `docs/nashir_v1_openapi.yaml` patch until the YAML slice is separately reviewed and accepted.

### Reference documents

- `docs/creator_studio_api_boundary_gate.md` — V1 scope authority
- `docs/creator_studio_production_contract_planning.md` — full contract planning
- `docs/nashir_v1_openapi.yaml` — existing convention reference (not modified in this slice)
