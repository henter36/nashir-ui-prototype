# OpenAPI Slice 2 Review

## 1. Executive Decision

GO with conditions for implementing Slice 2 YAML after this review.

Campaign Content + Review/Preview is the right Slice 2. It is the next commercial journey layer after Slice 1 Products + Assets and matches the current product flow:

```text
product + asset
-> campaign wizard
-> content studio
-> review/preview
```

WorkflowRun, AITaskRun, PublishingExecution, AI execution, connector runs, and analytics remain out of scope.

## 2. Scope Validation

The plan correctly limits Slice 2 to:

- CampaignContent
- ContentDraft or CampaignContentDraft
- ReviewState
- PreviewArtifact
- CampaignContentAssetLink if needed
- draft/review/approved/rejected transitions

The plan correctly excludes workflow execution, AI execution, publishing execution, connector execution, analytics, social intelligence, binary upload, and automated asset rights approval.

Verdict: pass.

## 3. Identity Validation

The planned IDs are sufficient:

- `workspaceId`
- `campaignContentId`
- `productId`
- `assetId`
- `previewArtifactId`

Confirmed rules:

- `campaignContentId` is canonical for campaign content.
- `productId` and `assetId` remain canonical links.
- `productName` and `assetName` may only be display snapshots.
- No name-based identity is allowed.
- `previewArtifactId` is canonical if preview artifacts are persisted.

Condition before YAML implementation:

- If preview artifacts are derived rather than persisted, avoid making `previewArtifactId` required. If persisted, include it as canonical identity.

## 4. Route Validation

Candidate routes reviewed:

- `GET /workspaces/{workspaceId}/campaign-contents`
- `POST /workspaces/{workspaceId}/campaign-contents`
- `GET /workspaces/{workspaceId}/campaign-contents/{campaignContentId}`
- `PUT /workspaces/{workspaceId}/campaign-contents/{campaignContentId}`
- `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/submit-review`
- `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/approve`
- `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/reject`
- `GET /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts`
- `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts`

Route decisions:

- Keep all proposed routes.
- Do not add `/publish`, `/schedule`, `/generate`, `/run`, or workflow/AI routes.
- Do not add nested campaign routes in Slice 2 unless a Campaign resource exists in executable OpenAPI. Since Campaign is not in Slice 1, the flat `campaign-contents` collection is acceptable for this slice.
- Keep review actions as explicit action endpoints.

Condition before YAML implementation:

- Review action endpoints should require either `Idempotency-Key`, `If-Match`, or both depending on action semantics. Recommended: use `Idempotency-Key` for action POSTs and `If-Match` or `X-Resource-Version` to prevent stale approvals/rejections.

## 5. Schema Validation

Proposed schemas reviewed:

- CampaignContent
- PreviewArtifact
- ReviewState

CampaignContent fields are mostly correct:

- `campaignContentId`
- `workspaceId`
- `productId`
- `title`
- `channel`
- `contentType`
- `status`
- `selectedAssetIds`
- `body`
- `cta`
- `audienceSummary`
- `offerSummary`
- `reviewStatus`
- `version`
- `createdAt`
- `updatedAt`

Recommended YAML additions:

- `productSnapshot` optional display snapshot.
- `assetSnapshots` optional display snapshots.
- `warnings` at response envelope level, not inside the core resource.
- `reviewState` object instead of duplicating many review fields at the top level.

PreviewArtifact fields are appropriate:

- `previewArtifactId`
- `workspaceId`
- `campaignContentId`
- `channel`
- `format`
- `displaySummary`
- `assetIds`
- `reviewStatus`
- `createdAt`

Recommended YAML addition:

- `previewArtifactId` should be required only if preview artifacts are persisted.

ReviewState fields are appropriate:

- `reviewStatus`
- `submittedAt`
- `reviewedAt`
- `reviewerDisplayName`
- `rejectionReason`
- `requiredChanges`

Recommended YAML addition:

- Include `reviewerId` only if it remains a reference field and does not become a user-facing identity substitute.

## 6. Status Transition Review

Validated limited statuses:

- `draft`
- `ready_for_review`
- `in_review`
- `approved`
- `rejected`

Confirmed out-of-scope statuses:

- `published`
- `scheduled`
- `generated_by_ai`
- `executing`
- `failed_execution`

Required transition rules before YAML:

- Create starts as `draft` unless explicitly submitted.
- `submit-review` moves `draft` or `rejected` to `ready_for_review` or `in_review`.
- `approve` should only apply to `ready_for_review` or `in_review`.
- `reject` should only apply to `ready_for_review` or `in_review`.
- Updating approved content should either be blocked or move it back to `draft`; this must be documented before implementation.

## 7. Slice 1 Convention Reuse

Slice 2 should reuse:

- `ErrorModel`
- `PaginationMeta`
- `Idempotency-Key` for POST
- `If-Match` or `X-Resource-Version` for PUT
- `workspaceId` path scoping
- no name-based identity
- `data`, `meta`, `warnings` response envelopes
- stable opaque IDs

Verdict: pass.

## 8. Risks and Blockers

| Risk | Review | Required before YAML? |
|---|---|---|
| PreviewArtifact persisted vs derived | The plan names a `previewArtifactId`, which implies persistence. | Yes. Decide persisted for Slice 2 or make ID optional. |
| selectedAssetIds existence validation | Slice 2 depends on Slice 1 assets. | Yes. Require asset IDs to reference existing workspace assets, at least conceptually. |
| whether productId must be required | Campaign content without product can exist in some systems, but Nashir commercial journey is product-led. | Yes. Make `productId` required for Slice 2 unless a deliberate generic content mode is added later. |
| avoiding publishing queue duplication | The plan excludes publishing. | No blocker; keep no publish/schedule statuses. |
| avoiding AI generation implication | The plan excludes AI generation. | No blocker; do not use generated_by_ai status. |
| strict review transitions | Needs explicit allowed transitions. | Yes. Define in endpoint descriptions. |
| optimistic concurrency on approve/reject/submit-review | Stale approvals are risky. | Yes. Require version header or equivalent. |
| whether review actions need idempotency | Repeated approve/reject submissions can duplicate review actions. | Yes. Use `Idempotency-Key` on action POSTs. |

## 9. Required Changes Before YAML Implementation

No planning document rewrite is required, but the YAML implementation must apply these corrections:

- Treat `productId` as required for CampaignContent create.
- Treat `selectedAssetIds` as references to existing Asset records in the same workspace.
- Include optional `productSnapshot` and `assetSnapshots` only as display snapshots, never identity.
- Decide persisted `PreviewArtifact` for Slice 2. Recommended: persist preview artifact metadata, because the plan includes create/list preview artifact endpoints.
- Require `Idempotency-Key` on create and review action POSTs.
- Require `If-Match` or `X-Resource-Version` on PUT and review transition action endpoints.
- Define the allowed status transitions in endpoint descriptions.
- Do not add published, scheduled, generated_by_ai, executing, or failed_execution statuses.
- Do not add Campaign, WorkflowRun, AITaskRun, PublishingExecution, connector, analytics, or AI schemas.

## 10. Final Decision

GO with conditions.

Recommended next gate:

OpenAPI Slice 2 YAML Implementation Gate — Campaign Content + Review/Preview
