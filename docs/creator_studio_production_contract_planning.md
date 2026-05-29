# Creator Studio Production Contract Planning

## 1. Executive Decision

Contract planning = GO.

Backend implementation = NO-GO.

OpenAPI YAML patch = NO-GO in this gate.

Database / schema / migration = NO-GO.

Real AI execution = NO-GO.

Real platform scraping or ingestion = NO-GO.

Real publishing = NO-GO.

Current gate = documentation-only planning slice.

---

## 2. Status and Scope

Creator Studio (`/creator-studio`) is a React/Vite prototype page only.

No backend exists. No API is connected. No database, auth, real AI execution, real scraping, real analytics ingestion, or real record creation has occurred.

All data displayed in the page — creator profiles, performance scores, audience segments, content ideas, campaign angles, publish windows, governance templates, competitor summaries, strategic signals — is static fixture data hardcoded in:

- `src/pages/CreatorStudioPage.jsx`
- `src/data/creatorStudioFlowFixture.js`

The "transfer context preview" (`buildDestinationMapping`) is a pure UI derivation with no persistence, no real transfer, and no record creation.

The production-readiness checklist displayed in the page is advisory UI only. It does not reflect real gate completion.

This document defines what production implementation would require before any backend work begins.

---

## 3. Current Prototype Inputs

The following inputs are collected locally in component state only. Nothing is persisted.

| Input | UI control | State var | Type | Persisted | Source |
| --- | --- | --- | --- | --- | --- |
| Platform | Chip selector | `selectedPlatform` | enum string | No | User selection |
| Creator handle | Text input | `handleInput` | string | No | User entry |
| Content idea | Chip selector | `selectedIdeaId` | fixture id | No | `ctxContentIdeas` fixture |
| Campaign angle | Chip selector | `selectedAngleId` | fixture id | No | `ctxCampaignAngles` fixture |
| Audience segment | Chip selector | `selectedSegmentId` | fixture id | No | `ctxAudienceSegments` fixture |
| Publish window | Chip selector | `selectedWindowId` | fixture id | No | `ctxPublishWindows` fixture |
| Governance template | Chip selector | `selectedTemplateId` | fixture id | No | `ctxGovernanceTemplates` fixture |

No API call is triggered when any input changes. The "تحليل — نموذج تجريبي" button fires a local state change only; it does not submit to any endpoint.

---

## 4. Production Data Boundary

Each prototype input maps to a production data boundary classification:

| Prototype input | Production classification | Source in production | Storage |
| --- | --- | --- | --- |
| Platform | User-selected enum | User selection, verified via OAuth | Session-scoped |
| Creator handle | User-entered identifier | Must be validated against platform API | Session-scoped; never auto-stored |
| Creator profile snapshot | Platform-connected data | Platform API (OAuth-gated) | Ephemeral snapshot only; not retained without consent |
| Performance scores | AI-derived or platform-derived | Platform Insights API + AI confidence layer | Advisory only; confidence required |
| Audience segments | Platform-connected data | Platform Insights API | Advisory only; user-owned; consent required |
| Content idea | AI-derived suggestion | AI generation with evidence pack | Draft only; requires human review |
| Campaign angle | AI-derived suggestion | AI generation with evidence pack | Draft only; requires human review |
| Publish window | Platform-derived suggestion | Engagement analytics + AI scheduling | Advisory only; human must confirm timing |
| Governance template | Human-approved decision | `PromptTemplate` from PromptGovernancePage | Must reference an approved PromptVersion |
| Transfer context | System-generated draft | Derived from above selections | Transient; not persisted automatically |
| Production readiness assessment | System-evaluated state | Gate check against all required conditions | Persisted as `CreatorReadinessAssessment` |

---

## 5. Proposed Production Entities

Planning only. Not implemented. Each entity below is a candidate for future data model work.

### CreatorStudioSession

- **Purpose**: Tracks one user-initiated Creator Studio session lifecycle from handle entry through transfer or abandonment.
- **Key fields**: `sessionId`, `workspaceId`, `actorId`, `platform`, `creatorHandleRef`, `status`, `startedAt`, `expiresAt`, `transferredAt`
- **Source**: User-initiated; created on explicit intent, not on page load.
- **Persistence**: Short-lived; should expire. Not a permanent record.
- **Privacy sensitivity**: HIGH — creator handle is a third-party identifier; platform OAuth token is sensitive.
- **Owner module**: Creator Studio

### CreatorProfileSnapshot

- **Purpose**: Immutable snapshot of creator profile data at the time of a session. Not a live mirror.
- **Key fields**: `snapshotId`, `sessionId`, `platform`, `handleRef`, `followersCount`, `engagementRate`, `contentTypeSummary`, `audienceCountrySummary`, `snapshotAt`, `dataSources`, `confidenceLabel`
- **Source**: Platform API (OAuth-gated) or user-provided.
- **Persistence**: Ephemeral; expires with session unless explicitly retained with consent.
- **Privacy sensitivity**: HIGH — third-party creator data; requires explicit consent and platform policy review.
- **Owner module**: Creator Studio

### CreatorContentIdea

- **Purpose**: A draft content idea associated with a session. AI-generated or human-entered.
- **Key fields**: `ideaId`, `sessionId`, `title`, `contentType`, `platform`, `rationale`, `confidenceLabel`, `status`, `humanReviewRequired`, `createdAt`
- **Source**: AI suggestion (draft only) or user input.
- **Persistence**: Draft; requires human approval before use in production workflows.
- **Privacy sensitivity**: LOW for AI-generated; MEDIUM if derived from third-party platform data.
- **Owner module**: Creator Studio → Content Studio handoff

### CreatorCampaignAngle

- **Purpose**: A draft campaign angle associated with a session.
- **Key fields**: `angleId`, `sessionId`, `label`, `audience`, `rationale`, `confidenceLabel`, `status`, `humanReviewRequired`, `createdAt`
- **Source**: AI suggestion (draft only).
- **Persistence**: Draft; requires human approval.
- **Privacy sensitivity**: LOW.
- **Owner module**: Creator Studio → Campaign Wizard handoff

### CreatorAudienceSegment

- **Purpose**: An audience segment description associated with a session.
- **Key fields**: `segmentId`, `sessionId`, `label`, `platform`, `share`, `confidenceLabel`, `dataSource`, `consentRef`, `createdAt`
- **Source**: Platform Insights API (consent-gated) or user-entered.
- **Persistence**: Ephemeral; tied to session; not retained as standalone audience definition without explicit promotion.
- **Privacy sensitivity**: MEDIUM — aggregate demographic data; must not expose individual user data.
- **Owner module**: Creator Studio → Campaign Wizard handoff

### CreatorPublishWindow

- **Purpose**: A suggested publish timing window for a session.
- **Key fields**: `windowId`, `sessionId`, `dayOfWeek`, `timeRange`, `note`, `platform`, `confidenceLabel`, `dataSource`, `createdAt`
- **Source**: Engagement analytics or AI scheduling suggestion.
- **Persistence**: Advisory only; human must confirm before any scheduling action.
- **Privacy sensitivity**: LOW.
- **Owner module**: Creator Studio → Publishing Queue handoff

### CreatorPromptGovernanceTemplate

- **Purpose**: Links a Creator Studio session to an approved `PromptTemplate` / `PromptVersion` for content generation governance.
- **Key fields**: `linkId`, `sessionId`, `promptTemplateId`, `promptVersionId`, `contentType`, `audienceLabel`, `toneLabel`, `governanceStatus`, `approvedAt`, `approvedBy`
- **Source**: References an existing approved `PromptTemplate` from PromptGovernancePage. Must not create a new PromptTemplate autonomously.
- **Persistence**: References only; does not duplicate the prompt.
- **Privacy sensitivity**: MEDIUM — prompt text must remain internal.
- **Owner module**: Creator Studio → Prompt Governance handoff

### CreatorContextDraft

- **Purpose**: Persists the user's selected context references for a session before any transfer is initiated. Represents the output of `POST /creator-studio/context-drafts` and is the input to all transfer endpoints via `draftId`.
- **Key fields**: `draftId`, `sessionId`, `ideaId`, `angleId`, `segmentId`, `windowId`, `templateLinkId`, `status`, `humanReviewRequired`, `createdAt`, `expiresAt`
- **Source**: User selections within a `CreatorStudioSession`; created on explicit user action only.
- **Persistence**: Short-lived; must expire at or before the parent session's expiry. Not promoted to a permanent record automatically.
- **Privacy sensitivity**: MEDIUM — references creator handle (via session) and AI-derived selection IDs.
- **Owner module**: Creator Studio

### CreatorTransferDraft

- **Purpose**: Packages a `CreatorContextDraft` into a destination-addressed payload for transfer. Not a real record in the destination. Created from a `draftId`; does not re-accept raw selection fields already persisted in the context draft.
- **Key fields**: `transferId`, `sessionId`, `contextDraftId`, `destinationModule`, `payload`, `status`, `humanReviewRequired`, `createdAt`, `expiresAt`
- **Source**: Derived from an approved/reviewed `CreatorContextDraft` on explicit user transfer action.
- **Persistence**: Short-lived; must expire at or before the parent session and context draft expiry. Transfer to destination creates a record in the destination only after human review.
- **Privacy sensitivity**: MEDIUM — payload contains creator handle ref and AI suggestions.
- **Owner module**: Creator Studio

### CreatorReadinessAssessment

- **Purpose**: Records the result of a production-readiness gate check for a session.
- **Key fields**: `assessmentId`, `sessionId`, `workspaceId`, `overallStatus`, `findings[]`, `blockers[]`, `warnings[]`, `assessedAt`, `expiresAt`
- **Source**: System-evaluated against checklist conditions (API contract, consent, human review, governance approval, data confidence, platform compliance).
- **Persistence**: Tied to session; advisory record.
- **Privacy sensitivity**: LOW.
- **Owner module**: Creator Studio

### CreatorComplianceFinding

- **Purpose**: Individual compliance finding within a readiness assessment.
- **Key fields**: `findingId`, `assessmentId`, `rule`, `status`, `severity`, `message`, `requiredAction`, `resolvedAt`
- **Source**: System-evaluated.
- **Persistence**: Tied to assessment.
- **Privacy sensitivity**: LOW.
- **Owner module**: Creator Studio

---

## 6. API Candidate Surface

Planning only. Do not implement. Do not patch `nashir_v1_openapi.yaml` in this gate.

All endpoints are workspace-scoped. All require authentication. All sensitive outputs must not expose raw secrets or raw prompt text.

### POST /creator-studio/sessions

- **Purpose**: Create a new Creator Studio session for a workspace actor.
- **Request summary**: `{ workspaceId, platform, creatorHandleRef }` — handle is a reference, not stored raw.
- **Response summary**: `{ sessionId, status, expiresAt }` — no profile data at creation.
- **Required permissions**: `creator_studio:session:create`
- **Readiness gate**: Workspace must have platform connection configured.
- **Human-review requirement**: None at session creation.
- **NO-GO conditions**: Do not auto-create sessions on page load. Do not store handle without explicit user action. Do not fetch platform data before user confirms intent.

### GET /creator-studio/sessions/{sessionId}

- **Purpose**: Retrieve the current state of a Creator Studio session.
- **Request summary**: `sessionId` path param.
- **Response summary**: `{ sessionId, platform, status, snapshotRef, selections, readinessRef, expiresAt }` — no raw platform data inline.
- **Required permissions**: `creator_studio:session:read` (session owner or workspace admin only)
- **Readiness gate**: Valid session; not expired.
- **Human-review requirement**: None for read.
- **NO-GO conditions**: Do not expose raw creator handle or platform token in response. Do not return performance data without confidence labels.

### POST /creator-studio/profile-snapshots

- **Purpose**: Request a platform profile snapshot for a session. Requires OAuth consent.
- **Request summary**: `{ sessionId, consentRef }` — consent token must be pre-obtained.
- **Response summary**: `{ snapshotId, status, confidenceLabel, dataSource }` — no raw platform payload inline.
- **Required permissions**: `creator_studio:snapshot:create`
- **Readiness gate**: Platform OAuth connected; explicit consent obtained.
- **Human-review requirement**: Advisory confidence label required in response.
- **NO-GO conditions**: Do not auto-snapshot. Do not store raw platform API response. Do not expose individual audience member data. Aggregate only.

### POST /creator-studio/context-drafts

- **Purpose**: Persist the current transfer context as a named draft for later review.
- **Request summary**: `{ sessionId, ideaId, angleId, segmentId, windowId, templateLinkId }` — all refs, no raw values.
- **Response summary**: `{ draftId, status, humanReviewRequired, expiresAt }`
- **Required permissions**: `creator_studio:draft:create`
- **Readiness gate**: Session must have at least one confirmed selection; readiness assessment must not be in `blocked` status.
- **Human-review requirement**: Draft status is always `pending_review` until explicitly approved.
- **NO-GO conditions**: Do not create real destination records. Do not trigger any AI generation at this step.

### POST /creator-studio/readiness-assessments

- **Purpose**: Evaluate and record the production-readiness state of a session.
- **Request summary**: `{ sessionId }`.
- **Response summary**: `{ assessmentId, overallStatus, findings[], blockers[], warnings[], expiresAt }`
- **Required permissions**: `creator_studio:readiness:evaluate`
- **Readiness gate**: None; assessment can be triggered at any time.
- **Human-review requirement**: Assessment result is advisory only; does not auto-block or auto-approve.
- **NO-GO conditions**: Do not treat assessment result as a binding gate without human confirmation.

Transfer endpoints resolve selected idea, angle, segment, window, and template from the `CreatorContextDraft` referenced by `draftId`. Destination-specific fields are overrides only and require validation. Overrides that change the reviewed meaning of the context draft require re-review before the transfer draft is accepted.

### POST /creator-studio/transfer-drafts/content-studio

- **Purpose**: Create a draft transfer payload addressed to Content Studio. Selections are resolved from `CreatorContextDraft`; only destination-specific overrides are accepted in the request body.
- **Request summary**: `{ draftId, overrides?: { targetContentType? } }` — `draftId` references `CreatorContextDraft`; `targetContentType` override must be validated and triggers re-review if it changes reviewed meaning.
- **Response summary**: `{ transferId, destinationModule: "content_studio", status: "pending_review", payload, humanReviewRequired: true, expiresAt }`.
- **Required permissions**: `creator_studio:transfer:create`, `content_studio:draft:receive`
- **Readiness gate**: `CreatorContextDraft` must be in `reviewed` status. Governance template must reference an approved PromptVersion.
- **Human-review requirement**: MANDATORY. Content Studio must not auto-accept the payload.
- **NO-GO conditions**: Do not accept raw selection fields in the request body. Do not auto-generate content on transfer. Do not bypass PromptTemplate governance. Do not transfer competitor-derived content.

### POST /creator-studio/transfer-drafts/campaign

- **Purpose**: Create a draft transfer payload addressed to Campaign Wizard. Selections resolved from `CreatorContextDraft`.
- **Request summary**: `{ draftId, overrides?: { campaignName?, objective? } }` — `draftId` references `CreatorContextDraft`; overrides must be validated; changes to reviewed meaning require re-review.
- **Response summary**: `{ transferId, destinationModule: "campaign_wizard", status: "pending_review", payload, humanReviewRequired: true, expiresAt }`.
- **Required permissions**: `creator_studio:transfer:create`, `campaign:draft:receive`
- **Readiness gate**: Context draft reviewed. Campaign Wizard session must be initiated by user, not auto-created.
- **Human-review requirement**: MANDATORY.
- **NO-GO conditions**: Do not accept raw selection fields in the request body. Do not auto-launch campaigns. Do not auto-set budget or targeting from transfer payload.

### POST /creator-studio/transfer-drafts/publishing

- **Purpose**: Create a draft transfer payload addressed to Publishing Queue. Selections resolved from `CreatorContextDraft`; the specific approved content item to schedule is supplied explicitly.
- **Request summary**: `{ draftId, contentId, overrides?: { targetPublishWindow? } }` — `draftId` references `CreatorContextDraft`; `contentId` references the approved Content Studio item to schedule; `targetPublishWindow` is an optional scheduling override validated against platform policy and triggers re-review if it changes the reviewed timing.
- **Response summary**: `{ transferId, destinationModule: "publishing_queue", status: "pending_review", payload, humanReviewRequired: true, expiresAt }`.
- **Required permissions**: `creator_studio:transfer:create`, `publishing:draft:receive`
- **Readiness gate**: Context draft reviewed. `contentId` must resolve to a Content Studio item in the same workspace. Content item must be in `approved` status. Content item must not be expired, archived, or already scheduled (unless rescheduling is explicitly supported by the workspace configuration).
- **Human-review requirement**: MANDATORY. No auto-scheduling.
- **NO-GO conditions**: Do not accept raw selection fields in the request body. Do not accept a `contentId` that resolves to unapproved, archived, expired, or cross-workspace content. Do not auto-schedule. Do not publish without explicit user confirmation and governance approval.

### POST /creator-studio/transfer-drafts/prompt-governance

- **Purpose**: Create a draft transfer payload addressed to Prompt Governance for template review. Selections resolved from `CreatorContextDraft`.
- **Request summary**: `{ draftId, overrides?: { reviewReason? } }` — `draftId` references `CreatorContextDraft`; `reviewReason` is a free-text annotation for the governance reviewer, not a selection override.
- **Response summary**: `{ transferId, destinationModule: "prompt_governance", status: "pending_review", payload, humanReviewRequired: true, expiresAt }`.
- **Required permissions**: `creator_studio:transfer:create`, `prompt_governance:review:receive`
- **Readiness gate**: Context draft reviewed. Referenced PromptTemplate must exist and not be deprecated.
- **Human-review requirement**: MANDATORY. Prompt Governance must evaluate independently.
- **NO-GO conditions**: Do not accept raw selection fields in the request body. Do not create or modify PromptTemplates autonomously. Transfer is advisory reference only.

---

## 7. Readiness States

| State | Meaning | UI allowed actions |
| --- | --- | --- |
| `draft` | Session created; selections incomplete. | Show inputs; allow editing. |
| `incomplete` | Required selections missing. | Show which fields are missing; block transfer. |
| `needs_consent` | Platform connection or user consent not obtained. | Prompt for OAuth / consent flow. |
| `needs_platform_connection` | Platform not connected in workspace. | Show connect action; block snapshot. |
| `needs_human_review` | Context draft exists but not reviewed. | Show review required notice; block transfer to destinations. |
| `ready_for_transfer` | Human review complete; all gates passed. | Enable transfer draft creation. |
| `blocked` | A compliance or governance finding blocks progress. | Show blocker detail; disable transfer. |
| `expired` | Session has passed its expiry window. | Show expired notice; require new session. |

The UI must never infer `ready_for_transfer` status without an authoritative assessment from the backend. Prototype UI shows the checklist as advisory; production UI must not auto-derive readiness from local state.

---

## 8. Governance and Human Review

The following rules apply to all production implementation:

- No automatic publishing from Creator Studio outputs. Human must confirm every publish action independently in Publishing Queue.
- No copying or re-using competitor content or phrasing, even if source is labeled as public data.
- No unsupported performance promises. All metrics must carry a confidence label and data source.
- No private creator data ingestion (audience demographics, DMs, private posts) without platform OAuth and explicit user consent.
- AI content suggestions must remain in `draft` / `pending_review` status until a human explicitly approves them.
- Confidence and limitations must be surfaced in all AI-derived suggestions. Zero-confidence or unsupported claims must not be displayed without a disclaimer.
- Platform terms of service and regional legal compliance must be verified before any production deployment. In particular: Instagram Graph API restrictions, TikTok API policy, X API policy changes.
- Audit trail required for all session transitions, transfer draft creation, and human review decisions.

---

## 9. Privacy, Consent, and Platform Policy

### What requires OAuth / platform permission

- Creator profile data (followers, engagement, audience demographics)
- Publishing insights (reach, impressions, conversions)
- Scheduling / posting via API

### What requires explicit user consent

- Storing any creator handle or profile snapshot beyond session expiry
- Sharing creator data with AI processing pipelines
- Retaining session data for analytics or training purposes

### What must never be stored

- Raw platform API tokens or OAuth secrets (use credential vault reference only)
- Individual audience member identities
- Private or non-public creator content

### What must be redacted

- Creator handle in audit logs (use opaque handle reference only)
- AI prompt text in API responses (return prompt reference only)
- Raw platform payload in any customer-facing API response

### What must expire

- Sessions: configurable TTL; suggest 24 hours default
- Context drafts (`CreatorContextDraft`): must expire at or before parent session expiry; suggest 24 hours — aligns with session to prevent orphaned drafts referencing an expired session
- Transfer drafts (`CreatorTransferDraft`): must expire at or before the parent session and context draft expiry; suggest 24 hours — a transfer draft referencing an expired context draft cannot be resolved
- Readiness assessments: suggest 24 hours (must be re-evaluated for each use)
- Profile snapshots: suggest 6 hours (stale data risk)

Lifecycle rule: No child draft may outlive its parent `CreatorStudioSession`. If a session expires, all associated `CreatorContextDraft` and `CreatorTransferDraft` records become expired immediately. Backend must enforce this cascade; UI must surface the expired state and prompt the user to start a new session.

### Audit trail required for

- Session creation and termination
- Profile snapshot requests
- Transfer draft creation
- Human review decisions
- Any state transition to `ready_for_transfer` or `blocked`
- Any platform connection action

---

## 10. Transfer Contracts

### → Content Studio

| Dimension | Rule |
| --- | --- |
| Can transfer | Selected idea (draft), content type, platform, audience ref, governance template ref |
| Must remain draft | All content until human review in Content Studio |
| Cannot transfer | Raw competitor content, unapproved AI output, platform raw payload |
| Validation required | Session reviewed; governance template approved; content type valid for platform |
| UI warning required | "هذا المحتوى مسودة — يتطلب مراجعة بشرية كاملة قبل النشر" |

### → Campaign Wizard

| Dimension | Rule |
| --- | --- |
| Can transfer | Campaign angle (draft), audience ref, platform ref, content idea title ref |
| Must remain draft | Campaign angle; budget, targeting, and schedule must be set manually |
| Cannot transfer | Performance metrics as guarantees; audience PII; unapproved AI output |
| Validation required | Session reviewed; audience ref valid; platform selected |
| UI warning required | "الزاوية المقترحة مسودة — لا تعكس أداء حقيقيًا ولا تُعتمد تلقائيًا" |

### → Publishing Queue

| Dimension | Rule |
| --- | --- |
| Can transfer | `draftId` (context selections), `contentId` (approved Content Studio item), resolved platform/channel, suggested publish window |
| Must remain draft | Publish window is advisory only; scheduling requires explicit user action |
| Cannot transfer | Unapproved content; content missing `contentId`; archived or expired content; content from a different workspace; content already scheduled (unless rescheduling explicitly supported) |
| Validation required | `contentId` resolves to an approved, non-expired, non-archived Content Studio item in the same workspace; context draft reviewed; publish window within platform policy |
| UI warning required | "الجدولة تتطلب موافقة يدوية صريحة — لا يُجدوَل المحتوى تلقائيًا" |

### → Prompt Governance

| Dimension | Rule |
| --- | --- |
| Can transfer | Reference to suggested PromptTemplate + PromptVersion, content type ref, tone ref |
| Must remain draft | Template selection is advisory; Prompt Governance must evaluate independently |
| Cannot transfer | Raw prompt text inline; prompt modifications |
| Validation required | PromptTemplate exists and is not deprecated; session reviewed |
| UI warning required | "القالب المقترح مرجعي فقط — يتطلب مراجعة حوكمة مستقلة" |

---

## 11. Risks and Failure Modes

| Risk | Description | Mitigation |
| --- | --- | --- |
| Misleading analytics | Static fixture data may be mistaken for real platform metrics | All metrics require confidence label and "نموذج توضيحي" notice |
| AI hallucination | AI content ideas or campaign angles may be factually incorrect | Draft-only status; mandatory human review; confidence label required |
| Platform compliance | Platform API terms may restrict data usage or automation | Legal + platform policy review required before any production deployment |
| Privacy risk | Creator handle or audience data retained without consent | Session expiry; consent gate; vault-only credential storage |
| Over-automation | Transfer drafts may be mistaken for final approved records | All transfers must carry `humanReviewRequired: true`; UI must display review notice |
| Duplicated content | AI-generated ideas may duplicate existing published content | Governance review must include originality check before approval |
| Weak attribution | Suggestions with no stated data source or confidence may be treated as factual | Confidence label and data source required on all AI-derived fields |
| Prototype misread | Users may interpret prototype UI behavior as production behavior | Prototype notices must remain visible; production readiness gate must be enforced before launch |

---

## 12. Backlog

### V1 Required

- Session creation endpoint (`POST /creator-studio/sessions`)
- Manual handle/input (no auto-scraping in V1)
- User-provided or user-confirmed profile data first
- Static fixture replaced by user-entered data or approved data sources
- Context draft persistence (`POST /creator-studio/context-drafts`)
- Readiness assessment endpoint (`POST /creator-studio/readiness-assessments`)
- Transfer draft to Content Studio (`POST /creator-studio/transfer-drafts/content-studio`) — human review mandatory
- PromptTemplate reference (must use existing approved PromptVersion from PromptGovernancePage)
- Session expiry enforcement
- Audit events for session creation, draft creation, review decisions

### Extended V1

- Platform OAuth connection (Instagram Graph API first)
- Profile snapshot from platform API (`POST /creator-studio/profile-snapshots`)
- AI-generated content idea suggestions (draft only)
- Transfer draft to Campaign Wizard
- Transfer draft to Publishing Queue (content must be approved first)
- Transfer draft to Prompt Governance for template review
- Confidence label pipeline for AI-derived suggestions

### Post V1

- Multi-platform session support
- Real engagement analytics integration
- AI-optimized publish window suggestion
- Automated compliance pre-check
- Cross-session audience segment reuse
- Competitor landscape analysis (requires legal/platform policy review)
- AI campaign angle generation with evidence pack
- Creator Studio session analytics for workspace admins

---

## 13. Open Questions / Required Decisions

| Question | Why it matters | Status |
| --- | --- | --- |
| Which platform(s) first in V1? | Determines OAuth scope, API policy review, and session data model. | Open |
| Is platform OAuth required in V1 or user-entered data first? | Affects session creation complexity, consent model, and timeline. | Open |
| What creator data can be stored, and for how long? | Determines retention policy, consent flow, and audit requirements. | Open |
| What is the session expiry policy? | Affects UX and stale data risk. | Open |
| Which user role can approve a transfer draft? | Determines RBAC model for Creator Studio. | Open |
| What AI confidence threshold is acceptable for suggestions? | Determines when AI output is surfaced vs suppressed. | Open |
| What legal and platform policy review is required before production? | Mandatory before any platform API integration. | Open |
| Is the `CreatorProfileSnapshot` a separate privacy-gated resource? | Affects consent model and API design. | Open |
| Should `CreatorTransferDraft` expire automatically or require explicit cancellation? | Affects cleanup, storage, and UX. | Open |
| Does the prototype production-readiness checklist map 1:1 to backend gate conditions? | Determines whether the UI checklist drives or reflects backend state. | Open |

---

## 14. Implementation Gate

### GO to OpenAPI planning only if all of the following are approved:

- [ ] Proposed entities (Section 5) reviewed and approved
- [ ] Transfer contract payloads (Section 10) reviewed and approved
- [ ] Readiness states (Section 7) reviewed and approved
- [ ] Consent and privacy model (Section 8) reviewed and approved
- [ ] Transfer destination rules (Section 10) reviewed and approved
- [ ] V1 scope (Section 12 — V1 Required) reviewed and approved
- [ ] Open questions (Section 13) answered or explicitly deferred with documented reason

### NO-GO to runtime implementation until:

- OpenAPI contract patched, reviewed, and accepted in a separate gate
- Data model / SQL schema reviewed in a separate gate
- Backend service architecture reviewed in a separate gate
- Authentication and RBAC model confirmed
- Platform API legal / terms of service review completed
- Human review workflow implemented and tested in staging

### Reference documents

- `docs/api_contract_gate.md` — API contract principles and workspace scoping
- `docs/data_entity_and_identity_model.md` — canonical entity and identity model
- `docs/strategy_data_sufficiency_and_ai_task_contract.md` — AI task envelope and evidence pack contracts
- `docs/ai_ops_backend_contract_planning.md` — AI operations backend contract planning
- `docs/nashir_ui_readiness_consumption_mapping_prototype_only.md` — UI readiness consumption mapping
- `docs/nashir_v1_openapi.yaml` — current V1 OpenAPI contract (not patched in this gate)
