# OpenAPI Slice 2 Planning Gate — Campaign Content + Review/Preview

## 1. Executive Decision

Slice 2 candidate = Campaign Content + Review/Preview.

Status = Planning only.

OpenAPI implementation = NO-GO until this plan is reviewed.

Workflow/AI execution = explicitly out of scope.

## 2. Inputs

Slice 1 has been reviewed and accepted as the OpenAPI baseline for products and assets.

Current Slice 1 facts:

- `docs/nashir_v1_openapi.yaml` exists.
- Slice 1 covers product catalog and asset library.
- `productId` and `assetId` are canonical identifiers.
- Product names and asset names are display labels only.
- `linkAssetToProduct` exists.
- `ErrorModel`, `PaginationMeta`, `Idempotency-Key`, `X-Resource-Version`, `workspaceId`, `productId`, and `assetId` are established.
- Broader entities such as CampaignContent, WorkflowRun, AITaskRun, ConnectorRun, RawSourcePayload, NormalizedSignal, PublishingExecution, and SocialStoreIntelligence are not in executable OpenAPI yet.

Commercial journey flow for this slice:

```text
product + asset
-> campaign wizard
-> content studio
-> review/preview
```

## 3. Proposed Slice 2 Scope

Slice 2 should cover only:

- CampaignContent
- CampaignContentDraft or ContentDraft
- ReviewPreviewItem or ReviewState
- PreviewArtifact
- CampaignContentAssetLink if needed
- Status transitions for draft/review/approved/rejected only

The purpose is to define campaign content and review/preview contracts after products and assets are already available, without jumping into workflow execution, AI orchestration, publishing, connectors, or analytics.

## 4. Explicitly Out of Scope

Slice 2 must not include:

- WorkflowRun
- AITaskRun
- ConnectorRun
- RawSourcePayload
- NormalizedSignal
- PublishingExecution
- SocialStoreIntelligence
- AI model execution
- prompt execution
- real publishing
- social connector calls
- binary file upload
- asset rights approval automation
- campaign analytics
- AI Operations runtime

No endpoint in Slice 2 should imply live generation, model execution, scheduling, publishing, or external data pulling.

## 5. Candidate Resources

Candidate REST resources, planning only:

| Method | Path | Purpose |
|---|---|---|
| GET | `/workspaces/{workspaceId}/campaign-contents` | List campaign content records. |
| POST | `/workspaces/{workspaceId}/campaign-contents` | Create campaign content draft. |
| GET | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | Read campaign content. |
| PUT | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | Update campaign content draft or metadata. |
| POST | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}/submit-review` | Move content toward review. |
| POST | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}/approve` | Approve reviewed content as a review decision only. |
| POST | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}/reject` | Reject reviewed content and capture required changes. |
| GET | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts` | List preview artifacts for content. |
| POST | `/workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts` | Create preview artifact metadata. |

These endpoints should use Slice 1 conventions for response envelopes, errors, idempotency, workspace scoping, and concurrency.

## 6. Identity Model

Planning IDs:

- `workspaceId`
- `campaignContentId`
- `productId`
- `assetId`
- `previewArtifactId`
- `reviewerId` optional display/reference only if needed

Identity rules:

- `campaignContentId` is canonical for campaign content.
- `productId` links content to product.
- `assetId` links content to selected assets.
- `productName` and `assetName` are display snapshots only.
- No identity by names.
- `workspaceId` scopes every Slice 2 resource path.
- `previewArtifactId` is canonical for preview artifacts if persisted.
- `reviewerDisplayName` is display-only and must not replace `reviewerId` if reviewer identity is modeled.

## 7. Minimum Schema Planning

Candidate `CampaignContent` fields:

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

Candidate `PreviewArtifact` fields:

- `previewArtifactId`
- `workspaceId`
- `campaignContentId`
- `channel`
- `format`
- `displaySummary`
- `assetIds`
- `reviewStatus`
- `createdAt`

Candidate `ReviewState` fields:

- `reviewStatus`
- `submittedAt`
- `reviewedAt`
- `reviewerDisplayName`
- `rejectionReason`
- `requiredChanges`

Optional planning note:

- Slice 2 may include display snapshots such as `productSnapshot` and `assetSnapshots`, but only if they remain clearly secondary to `productId` and `assetId`.

## 8. Status Model

Use limited statuses:

- `draft`
- `ready_for_review`
- `in_review`
- `approved`
- `rejected`

Do not include:

- `published`
- `scheduled`
- `generated_by_ai`
- `executing`
- `failed_execution`

Rationale:

- Publishing belongs to a later publishing readiness/execution boundary.
- AI generation and execution belong to later workflow/AI operation slices.
- Scheduling is not part of Campaign Content + Review/Preview.

## 9. Reuse Slice 1 Conventions

Slice 2 should reuse:

- `ErrorModel`
- `PaginationMeta`
- `Warning`
- `Idempotency-Key` for POST operations
- `If-Match` or `X-Resource-Version` for PUT operations
- `workspaceId` path scoping
- response envelopes using `data`, `meta`, and `warnings`
- stable opaque IDs
- no raw internal IDs in user-facing descriptions
- no name-based identity

Additional Slice 2 convention:

- Review transition operations should be explicit action endpoints and should not imply publishing.

## 10. Risks and Gaps

- Need to avoid duplicating publishing queue responsibilities.
- Need to avoid implying AI generation or workflow execution.
- Need to decide whether preview artifact is persisted or derived.
- Need to decide whether selectedAssetIds must already exist in asset library.
- Need to decide whether productId is required for all campaign content.
- Need to define review transitions strictly before implementation.
- Need to decide whether approval can happen directly from `ready_for_review` or must pass through `in_review`.
- Need to decide whether rejected content returns to `draft` after edit or remains `rejected` until explicitly resubmitted.
- Need to define whether selected asset rights must be `approved` or only not `rejected` for review approval.

## 11. Recommended Implementation Order

1. Review this planning document.
2. Open OpenAPI Slice 2 Review Gate.
3. Then patch `docs/nashir_v1_openapi.yaml` only if approved.
4. Then validate YAML.
5. Then run build.
6. Then add review doc.

## 12. Final Decision

GO for planning document.

NO-GO for OpenAPI YAML implementation in this step.

Next gate should be:

OpenAPI Slice 2 Review Gate — Campaign Content + Review/Preview
