# Executable OpenAPI Planning

## 1. Executive Decision

GO for executable OpenAPI planning.

NO-GO for writing executable OpenAPI YAML until this plan is reviewed.

NO-GO for backend implementation.

NO-GO for SQL schema.

This document is documentation-only.

## 2. Purpose

This document prepares Nashir V1 API contracts for executable OpenAPI by defining:

- OpenAPI file strategy
- schema grouping
- endpoint slice order
- reusable components
- error model
- idempotency and concurrency rules
- V1/Post-V1 boundaries
- first YAML slice recommendation

It converts the reviewed API Contract Gate into a practical implementation plan without writing YAML, backend code, SQL, migrations, AI execution, or connector behavior.

## 3. Authority and Inputs

Reviewed sources:

- `docs/api_contract_gate.md`
- `docs/api_contract_review.md`
- `docs/data_flow_processing_and_reuse_architecture.md`
- `docs/data_entity_and_identity_model.md`
- `docs/erd_reconciliation_model.md`
- `docs/workspace_and_minimum_identity_decision.md`
- `docs/strategy_data_sufficiency_and_ai_task_contract.md`

This plan prepares executable OpenAPI but does not implement it. If executable YAML later conflicts with these planning documents, the conflict must be reviewed before implementation proceeds.

## 4. OpenAPI File Strategy

Options:

| Option | File strategy | Benefits | Cost |
|---|---|---|---|
| A | Single file: `docs/nashir_v1_openapi.yaml` | Simple review, easy first pass, fewer moving parts. | Can grow large. |
| B | Staged single file: `docs/nashir_v1_openapi.yaml` with only the first approved slice initially | Keeps one canonical file while allowing incremental delivery. | Requires disciplined slice boundaries. |
| C | Split components later: `docs/openapi/nashir_v1.yaml`, `docs/openapi/components/schemas.yaml`, `docs/openapi/components/responses.yaml`, `docs/openapi/components/parameters.yaml` | Better for large contracts and generated clients. | More structure than the current prototype needs. |

Recommendation:

Start with one file:

- `docs/nashir_v1_openapi.yaml`

Use a staged single-file approach for the first executable slice. Split into `docs/openapi/` components only if the file becomes too large or review friction increases.

## 5. OpenAPI Version and Metadata

Planned metadata:

- `openapi`: `3.1.0`
- `title`: `Nashir V1 API`
- `version`: `0.1.0`
- `description`: `Contract-first API for Nashir V1`
- `servers`: placeholder only, no production URL
- `tags`: grouped by resource family

Server guidance:

- Use a placeholder such as `https://api.example.invalid` or a clearly non-production local placeholder.
- Do not include production infrastructure details before deployment architecture is approved.

## 6. Global API Rules

- All routes are workspace-scoped.
- Route base is `/workspaces/{workspaceId}`.
- `workspaceId` is a required path parameter.
- IDs are stable and opaque.
- User-facing names are display fields only.
- API responses must not expose raw secret values.
- V1 does not expose raw connector payload APIs.
- V1 does not include real publishing endpoints.
- V1 does not include multi-store endpoints.
- Review gates must exist before publishing readiness can become ready.
- AI outputs require confidence and limitations.
- Campaigns do not auto-mutate StoreStrategicPlan.
- Social intelligence does not auto-mutate StoreProfile.
- Raw external data must be normalized or summarized before AI use.

## 7. Planned Tags

OpenAPI tags:

- StoreProfile
- StoreStrategicPlans
- Products
- Assets
- Campaigns
- CampaignBriefs
- CampaignContent
- ReviewFindings
- PublishingReadiness
- ModelProviders
- ModelRoutes
- PromptTemplates
- WorkflowRuns
- AITaskRuns
- CostPolicies
- AuditEvents

## 8. Common Parameters

Reusable path parameters:

- `workspaceId`
- `storeProfileId` if needed
- `productId`
- `assetId`
- `planId`
- `campaignId`
- `campaignBriefId`
- `contentOutputId`
- `reviewFindingId`
- `providerId`
- `modelRouteId`
- `promptTemplateId`
- `workflowRunId`
- `aiTaskRunId`
- `costPolicyId`
- `auditEventId`

Reusable query parameters:

- `limit`
- `cursor`
- `status`
- `updatedAfter`
- `sort`

## 9. Common Headers

Request headers:

- `Idempotency-Key` for POST create/run endpoints.
- `If-Match` or `X-Resource-Version` for update endpoints.
- `X-Request-Id` for optional client request tracking.

Response headers:

- `X-Request-Id`
- `ETag` or `X-Resource-Version` where applicable.

Do not over-specify runtime implementation. The first executable YAML should define the contract expectation without choosing storage, queue, or gateway internals.

## 10. Common Response Envelope Decision

Options:

| Option | Shape | Review |
|---|---|---|
| A | Raw resource object | Simple, but weak for metadata and warnings. |
| B | Envelope: `{ data, meta, warnings }` | Best for list, operational, and readiness responses. |
| C | Mixed | Practical if used consistently. |

Recommendation:

Use a mixed model:

- Simple resource read: `{ data }`
- List responses: `{ data, meta, warnings }`
- Operational responses such as readiness checks, review actions, or run creation: `{ data, meta, warnings }`
- Errors: `ErrorModel`

## 11. Error Model

Planned `ErrorModel`:

- `errorCode`
- `message`
- `details`
- `requestId`
- `retryable`
- `status`

Required error codes:

- `workspace.not_found`
- `resource.not_found`
- `validation.failed`
- `permission.denied`
- `conflict.version_mismatch`
- `review.required`
- `publishing.blocked`
- `model_route.not_ready`
- `prompt_template.not_approved`
- `cost_policy.exceeded`
- `provider.not_ready`
- `idempotency.conflict`
- `rate_limit.exceeded`

Recommended additional error codes from the review gate:

- `asset_rights.review_required`
- `output_schema.validation_failed`
- `ai_task.duplicate_in_progress`
- `workflow.duplicate_in_progress`
- `audit_event.immutable`
- `secret_reference.missing`

## 12. Pagination, Filtering, and Sorting

Default list convention:

- Cursor pagination.
- `limit` caps page size.
- `cursor` requests the next page.
- `status` filters status-capable resources.
- `updatedAfter` supports incremental sync and UI refresh.
- `sort` supports stable ordering.

Response `meta`:

- `nextCursor`
- `count`
- `hasMore`

Apply to:

- products
- assets
- campaigns
- content outputs
- review findings
- workflow runs
- AI task runs
- audit events

For the first OpenAPI slice, list endpoints should include pagination even if backend implementation later begins with simple in-memory or database defaults.

## 13. Resource Schema Groups

Core:

- WorkspaceRef
- StoreProfile
- StoreStrategicPlan
- Product
- Asset

Commercial Journey:

- Campaign
- CampaignBrief
- CampaignContentOutput
- ReviewFinding
- PublishingReadiness

AI Operations:

- ModelProvider
- ModelRoute
- PromptTemplate
- WorkflowRun
- AITaskRun
- CostPolicy

Governance:

- AuditEvent
- ErrorModel
- ReviewDecision
- ApprovalStatus
- ConfidenceScore
- Limitation
- SnapshotRef

## 14. Snapshot Schema Planning

Reusable snapshot schemas:

- ProductSnapshot
- AssetSnapshot
- StrategySnapshot
- CampaignSnapshot
- PromptVersionSnapshot
- ModelExecutionSnapshot

Rules:

- Snapshots preserve historical context.
- References remain by ID.
- Display snapshots never replace canonical IDs.
- Campaign snapshots product and strategy data at creation.
- Campaign content snapshots asset, prompt, and campaign context where needed.
- AI task runs snapshot the input and model/prompt execution context needed for audit.

## 15. StoreProfile and StoreStrategicPlan OpenAPI Slice

Planned endpoints:

- `GET /workspaces/{workspaceId}/store-profile`
- `PUT /workspaces/{workspaceId}/store-profile`
- `GET /workspaces/{workspaceId}/store-strategic-plans/latest`
- `GET /workspaces/{workspaceId}/store-strategic-plans/{planId}`
- `POST /workspaces/{workspaceId}/store-strategic-plans`
- `POST /workspaces/{workspaceId}/store-strategic-plans/{planId}/review`
- `POST /workspaces/{workspaceId}/store-strategic-plans/{planId}/approve`

Planned schemas:

- StoreProfile
- StoreProfileUpdateRequest
- StoreStrategicPlan
- StoreStrategicPlanCreateRequest
- StoreStrategicPlanReviewRequest
- StoreStrategicPlanApprovalRequest
- ConfidenceScore
- Limitation
- StrategySnapshot

Why this should be first or second slice:

- It is central to the strategy-first product journey.
- It depends on Product and Asset summaries, so it is a strong second slice after foundational Product/Asset contracts.
- If strategy work must start first, it can be first, but Products + Assets are lower-risk and better for proving common components.

## 16. Products and Assets OpenAPI Slice

Product endpoints:

- `GET /workspaces/{workspaceId}/products`
- `POST /workspaces/{workspaceId}/products`
- `GET /workspaces/{workspaceId}/products/{productId}`
- `PUT /workspaces/{workspaceId}/products/{productId}`

Asset endpoints:

- `GET /workspaces/{workspaceId}/assets`
- `POST /workspaces/{workspaceId}/assets`
- `GET /workspaces/{workspaceId}/assets/{assetId}`
- `PUT /workspaces/{workspaceId}/assets/{assetId}`
- `POST /workspaces/{workspaceId}/assets/{assetId}/link-product`

Planned schemas:

- Product
- ProductCreateRequest
- ProductUpdateRequest
- ProductSnapshot
- Asset
- AssetCreateRequest
- AssetUpdateRequest
- AssetLinkProductRequest
- AssetSnapshot
- PaginationMeta
- ErrorModel

Why this is likely the first executable OpenAPI slice:

- Products and assets are stable V1 entities.
- They have low execution risk.
- They are foundational for campaigns, strategy, content, review, and publishing readiness.
- They exercise the most important common components: workspace scoping, opaque IDs, pagination, idempotency, optimistic concurrency, snapshots, and error responses.

## 17. Campaigns and Content OpenAPI Slice

Planned endpoints:

- `GET /workspaces/{workspaceId}/campaigns`
- `POST /workspaces/{workspaceId}/campaigns`
- `GET /workspaces/{workspaceId}/campaigns/{campaignId}`
- `PUT /workspaces/{workspaceId}/campaigns/{campaignId}`
- `GET /workspaces/{workspaceId}/campaigns/{campaignId}/brief`
- `PUT /workspaces/{workspaceId}/campaigns/{campaignId}/brief`
- `GET /workspaces/{workspaceId}/campaigns/{campaignId}/content`
- `POST /workspaces/{workspaceId}/campaigns/{campaignId}/content`
- `GET /workspaces/{workspaceId}/campaign-content/{contentOutputId}`
- `PUT /workspaces/{workspaceId}/campaign-content/{contentOutputId}`

Planned schemas:

- Campaign
- CampaignCreateRequest
- CampaignUpdateRequest
- CampaignSnapshot
- CampaignBrief
- CampaignBriefUpdateRequest
- CampaignContentOutput
- CampaignContentCreateRequest
- CampaignContentUpdateRequest
- ProductSnapshot
- AssetSnapshot
- StrategySnapshot
- PromptVersionSnapshot

This slice should follow Products + Assets and StoreProfile + StoreStrategicPlan because it depends on product, asset, and strategy snapshots.

## 18. Review and Publishing Readiness OpenAPI Slice

Planned endpoints:

- `GET /workspaces/{workspaceId}/review-findings`
- `POST /workspaces/{workspaceId}/campaign-content/{contentOutputId}/review-findings`
- `POST /workspaces/{workspaceId}/review-findings/{reviewFindingId}/resolve`
- `GET /workspaces/{workspaceId}/campaigns/{campaignId}/publishing-readiness`
- `POST /workspaces/{workspaceId}/campaigns/{campaignId}/publishing-readiness/check`

Planned schemas:

- ReviewFinding
- ReviewFindingCreateRequest
- ReviewFindingResolveRequest
- PublishingReadiness
- PublishingReadinessCheckRequest
- ReviewDecision
- ApprovalStatus

Boundary:

- Readiness check does not publish.
- Real publishing is Post-V1.
- V1 must not include a `publish` operation.

## 19. AI Operations OpenAPI Slice

ModelProviders:

- `GET /workspaces/{workspaceId}/model-providers`
- `POST /workspaces/{workspaceId}/model-providers`
- `PUT /workspaces/{workspaceId}/model-providers/{providerId}`

ModelRoutes:

- `GET /workspaces/{workspaceId}/model-routes`
- `POST /workspaces/{workspaceId}/model-routes`
- `PUT /workspaces/{workspaceId}/model-routes/{routeId}`

PromptTemplates:

- `GET /workspaces/{workspaceId}/prompt-templates`
- `POST /workspaces/{workspaceId}/prompt-templates`
- `PUT /workspaces/{workspaceId}/prompt-templates/{promptTemplateId}`
- `POST /workspaces/{workspaceId}/prompt-templates/{promptTemplateId}/review`
- `POST /workspaces/{workspaceId}/prompt-templates/{promptTemplateId}/approve`

WorkflowRuns:

- `GET /workspaces/{workspaceId}/workflow-runs`
- `POST /workspaces/{workspaceId}/workflow-runs`
- `GET /workspaces/{workspaceId}/workflow-runs/{workflowRunId}`

AITaskRuns:

- `POST /workspaces/{workspaceId}/ai-task-runs`
- `GET /workspaces/{workspaceId}/ai-task-runs/{aiTaskRunId}`

Planning notes:

- ModelProvider responses use secret references only.
- PromptTemplate list responses may omit full prompt text if role or view restrictions require it later.
- AITaskRun is a contract boundary. Real AI invocation behavior requires a separate backend/orchestration gate.
- WorkflowRun is a run/state contract. It is not proof that real backend execution exists.

## 20. Cost and Audit OpenAPI Slice

Planned endpoints:

- `GET /workspaces/{workspaceId}/cost-policies`
- `PUT /workspaces/{workspaceId}/cost-policies/{costPolicyId}`
- `GET /workspaces/{workspaceId}/audit-events`
- `POST /workspaces/{workspaceId}/audit-events`

Planning notes:

- Audit write may be internal-only later.
- Expose audit reads carefully depending on role.
- Audit events should be immutable once created.
- CostPolicy scope must be explicit in executable YAML: workspace, taskType, route, or mixed.

## 21. Recommended First Executable OpenAPI Slice

Recommendation:

Start with Products + Assets + common components.

Reason:

- Products and assets are stable entities.
- They have low execution risk.
- They are foundational for the commercial journey.
- They validate workspace scoping, opaque IDs, response envelopes, pagination, errors, idempotency, update concurrency, and snapshot schemas.
- They avoid AI execution, connector execution, publishing execution, and complex review workflows in the first YAML pass.

Recommended slice order:

1. Products + Assets + common components.
2. StoreProfile + StoreStrategicPlan.
3. Campaigns + Content.
4. Review + PublishingReadiness.
5. AI Operations.
6. Cost + Audit.

## 22. What Must Not Enter First YAML Slice

Exclude:

- real connector execution
- raw payload APIs
- normalized signal APIs
- social intelligence execution
- scheduled sync
- webhooks
- publishing execution
- multi-store routes
- full RBAC implementation
- actual AI provider invocation
- OAuth flows
- file/object storage implementation details
- SQL-specific schema design

## 23. OpenAPI Quality Gates

Before accepting executable YAML:

- `npm run build` still passes.
- YAML parses.
- Every operation has `operationId`.
- Every path uses `workspaceId`.
- Common `ErrorModel` is used.
- Schemas use stable opaque IDs.
- List endpoints define pagination.
- POST endpoints document idempotency.
- PUT endpoints document concurrency/version conflict.
- No raw secrets appear in schemas.
- No Post-V1 paths are included.
- No real publishing endpoint exists in V1.
- No connector execution endpoint exists in V1.
- No raw payload or normalized signal endpoint exists in V1.

## 24. Risks and Open Questions

- Whether to use OpenAPI 3.1 strict JSON Schema features or keep schemas conservative for tooling compatibility.
- Whether response envelope should be universal or mixed.
- Whether audit write should be public, internal-only, or service-only.
- Whether AI task `inputSnapshot` should be fully modeled or a loose object in the first slice.
- Whether ProductMarketingPriority and AssetGapReport get endpoints in the first OpenAPI pass or remain derived embedded outputs.
- Whether prompt text editing is V1 API or admin-only.
- Whether archive/delete behavior is intentionally omitted or should be represented as status changes.
- Whether status enums should be centralized globally or per resource.

## 25. Final Position

This planning document clears the path to the first executable OpenAPI YAML only after review.

Recommended next gate:

Executable OpenAPI Slice 1 — Products and Assets + Common Components.

Backend implementation and SQL schema remain NO-GO.
