# OpenAPI Slice 2 YAML Review

## 1. Executive Decision

GO for accepting the implemented Slice 2 YAML.

Slice 2 stayed limited to Campaign Content + Review/Preview. The implementation avoids WorkflowRun, AITaskRun, PublishingExecution, AI execution, connector runs, and analytics. No runtime behavior, backend implementation, publishing execution, prompt execution, social connector execution, or generated client behavior is introduced.

## 2. YAML Validity

YAML validation command:

```bash
ruby -e "require 'yaml'; YAML.load_file('docs/nashir_v1_openapi.yaml'); puts 'yaml ok'"
```

Result:

```text
yaml ok
```

The YAML parses successfully. The OpenAPI structure remains coherent at the documentation-contract level, and no immediate syntax blocker was found.

## 3. Scope Review

Slice 2 adds only:

- campaign content resources
- review transition resources
- preview artifact resources
- related schemas and parameters

Added scope is consistent with `docs/openapi_slice_2_planning.md` and `docs/openapi_slice_2_review.md`.

No out-of-scope resource family was found in the grep check:

- WorkflowRun
- AITaskRun
- ConnectorRun
- RawSourcePayload
- NormalizedSignal
- PublishingExecution
- SocialStoreIntelligence
- generated_by_ai
- failed_execution
- scheduled
- published

Verdict: pass.

## 4. Route Review

| Route group | Review |
|---|---|
| `GET /workspaces/{workspaceId}/campaign-contents` | Clear list route. Uses workspace scoping, pagination conventions, and does not imply publishing, AI generation, or workflow execution. |
| `POST /workspaces/{workspaceId}/campaign-contents` | Clear draft/content creation route. Requires `Idempotency-Key`. Description correctly says it does not execute AI, publish, schedule, upload binary assets, or approve rights. |
| `GET /workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | Clear read route using canonical `campaignContentId`. No name-based identity risk. |
| `PUT /workspaces/{workspaceId}/campaign-contents/{campaignContentId}` | Clear update route. Uses `If-Match` and `X-Resource-Version` convention. Description warns that updating approved content is policy-bound and does not imply publishing. |
| `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/submit-review` | Clear review transition route. Requires `Idempotency-Key` and documents current version expectation. Does not imply publishing, scheduling, or AI execution. |
| `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/approve` | Clear review decision route. Requires `Idempotency-Key` and includes concurrency headers. Does not imply publishing or asset-right approval. |
| `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/reject` | Clear review decision route. Requires `Idempotency-Key`, includes concurrency headers, and captures rejection data through `ReviewDecisionRequest`. |
| `GET /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts` | Clear list route for preview metadata. Does not imply rendered binary creation. |
| `POST /workspaces/{workspaceId}/campaign-contents/{campaignContentId}/preview-artifacts` | Clear metadata creation route. Requires `Idempotency-Key` and explicitly does not upload binaries, render final files, execute AI, publish, or schedule. |

Route naming is REST-consistent enough for the slice. The action routes for review transitions are acceptable because they represent state transitions, not subordinate resources.

## 5. Identity Model Review

Confirmed:

- `campaignContentId` is canonical.
- `workspaceId` scopes all campaign content and preview artifact resources.
- `productId` links content to Product.
- `selectedAssetIds` and `assetIds` link to existing Asset records.
- `previewArtifactId` is canonical for persisted preview artifacts.
- `productName` and `assetName` are only allowed in display snapshots.
- Name-based identity is explicitly rejected in descriptions.

Remaining name-based identity risk: low. The display snapshot schema names are explicit enough: `DisplayProductSnapshot` and `DisplayAssetSnapshot`.

## 6. Schema Review

Reviewed schemas:

- `CampaignContent`
- `CampaignContentCreateRequest`
- `CampaignContentUpdateRequest`
- `CampaignContentListResponse`
- `CampaignContentResponse`
- `ReviewState`
- `ReviewSubmitRequest`
- `ReviewDecisionRequest`
- `PreviewArtifact`
- `PreviewArtifactCreateRequest`
- `PreviewArtifactListResponse`
- `PreviewArtifactResponse`

Assessment:

- Required `CampaignContent` fields are sufficient for identity, ownership, content display, review status, versioning, and timestamps.
- `CampaignContentCreateRequest` correctly requires `productId`, `title`, `channel`, `contentType`, and `body`.
- `selectedAssetIds` are modeled as canonical asset identifiers.
- `productSnapshot` and `assetSnapshots` are optional and clearly display-only.
- `version`, `createdAt`, and `updatedAt` are present on `CampaignContent`.
- `ReviewState` has enough fields for submission/review timing, reviewer display label, rejection reason, and required changes.
- `ReviewDecisionRequest` supports approval/rejection notes and required changes.
- `PreviewArtifact` is scoped by `workspaceId` and `campaignContentId`, has its own `previewArtifactId`, and links assets through canonical `assetIds`.

Non-blocking note: `PreviewArtifact` has `createdAt` but not `updatedAt` or `version`. This is acceptable if preview artifacts are append-only metadata. If preview artifact updates are introduced later, add `updatedAt` and `version`.

## 7. Status Model Review

Confirmed status enum is limited to:

- `draft`
- `ready_for_review`
- `in_review`
- `approved`
- `rejected`

Confirmed these were not introduced:

- `published`
- `scheduled`
- `generated_by_ai`
- `executing`
- `failed_execution`

`reviewStatus` duplicates `status` at first glance, but it is justified for now because the API distinguishes overall content state and review-state display. This should remain aligned in implementation rules. If future slices add more content lifecycle statuses, `reviewStatus` may become more useful; if not, it can later be simplified.

## 8. Review Transition Review

Assessment:

- `submit-review` transition is clear and uses `campaignContentId`.
- `approve` transition is clear and does not imply publishing.
- `reject` transition is clear and supports `rejectionReason` / `requiredChanges`.
- Invalid transitions are expected to use `ErrorModel`, especially `validation.failed` or `conflict.version_mismatch`.
- `Idempotency-Key` is required on review action POSTs.
- `If-Match` and `X-Resource-Version` are included on review actions and documented as current version expectations.
- `approve` and `reject` use `ReviewDecisionRequest`, which is appropriate.
- `rejectionReason` and `requiredChanges` are adequate for Slice 2.

Non-blocking note: `approve` request body is optional and uses `ReviewDecisionRequest`. That is acceptable, but implementation should allow approval without a note while still recording actor/review metadata later.

## 9. PreviewArtifact Review

Assessment:

- `PreviewArtifact` is clearly metadata-only.
- It avoids binary upload implication.
- It avoids rendered preview execution.
- `assetIds` are canonical links.
- `PreviewArtifactCreateRequest` does not claim rendering or file generation.

`reviewStatus` on `PreviewArtifact` may duplicate CampaignContent review state. It is acceptable if a preview artifact can have an independent review display state. If preview artifacts always inherit content review status, this field can become derived in a later patch. This is not a blocker.

## 10. Slice 1 Convention Reuse

Confirmed reuse/alignment with:

- `ErrorModel`
- `PaginationMeta`
- `Idempotency-Key`
- `If-Match` or `X-Resource-Version`
- `workspaceId` path scoping
- no name-based identity
- standard response envelopes
- standard error responses

Slice 2 also keeps the same non-runtime documentation style established in Slice 1.

## 11. Risks and Issues

| Classification | Issue | Evidence | Consequence | Recommendation |
|---|---|---|---|---|
| Can defer | `reviewStatus` vs `status` duplication | Both exist on `CampaignContent`. | Possible future mismatch if implementation does not enforce alignment. | Define transition invariants before backend implementation. |
| Can defer | PreviewArtifact persisted vs derived ambiguity | `previewArtifactId` and POST route imply persistence. | If later treated as derived, schema may be too heavy. | Keep as persisted metadata for Slice 2; revisit only if preview rendering changes. |
| Should fix before backend, not before next slice | `selectedAssetIds` existence validation is descriptive only. | Schema says existing assets but cannot enforce cross-resource existence. | Runtime must validate references. | Document validation behavior in backend/API implementation notes. |
| No issue | `productId` requiredness | Create request requires `productId`. | Aligns with product-led commercial journey. | Keep. |
| No issue | concurrency on review actions | Review actions include `If-Match` and `X-Resource-Version`. | Stale decisions can be rejected by implementation. | Keep. |
| No issue | idempotency on review actions | Review action POSTs require `Idempotency-Key`. | Duplicate transitions can be controlled. | Keep. |
| No issue | avoiding publishing queue duplication | No publish/schedule routes or statuses added. | Slice remains focused. | Keep. |
| No issue | avoiding AI generation implication | No AI execution terms or generated statuses added. | Slice remains contract-only. | Keep. |

No blockers found.

## 12. Required Follow-Up

No YAML amendment is required for this review gate.

Recommended next gate:

OpenAPI Slice 2 Acceptance Gate

Before backend implementation, add implementation notes for:

- `status` and `reviewStatus` invariants
- cross-resource validation for `productId`, `selectedAssetIds`, and `assetIds`
- whether preview artifacts are append-only metadata
- actor/reviewer identity handling once auth/RBAC contracts exist

## 13. Verification Commands Run

YAML validation:

```bash
ruby -e "require 'yaml'; YAML.load_file('docs/nashir_v1_openapi.yaml'); puts 'yaml ok'"
```

Result:

```text
yaml ok
```

Slice 2 signal grep:

```bash
grep -RIn \
  "CampaignContent\|ReviewState\|PreviewArtifact\|campaignContentId\|submit-review\|preview-artifacts" \
  docs/nashir_v1_openapi.yaml
```

Result: positive results for all required Slice 2 signals.

Out-of-scope grep:

```bash
grep -RIn \
  "WorkflowRun\|AITaskRun\|ConnectorRun\|RawSourcePayload\|NormalizedSignal\|PublishingExecution\|SocialStoreIntelligence\|generated_by_ai\|failed_execution\|scheduled\|published" \
  docs/nashir_v1_openapi.yaml
```

Result:

```text
no results
```

Repository checks were run after creating this review document.
