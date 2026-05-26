# OpenAPI Slice 1 Review

## 1. Executive Decision

GO: Slice 1 accepted as OpenAPI baseline.

The Slice 1 OpenAPI file is parseable, scoped to Health, Products, Assets, and common components, and does not leak later resource families. It is safe to keep as the baseline before adding Slice 2. The findings below are non-blocking cleanup items that can be addressed opportunistically before or during Slice 2 planning.

## 2. Review Scope

This review covers:

- YAML parseability
- OpenAPI metadata
- scope containment
- Products endpoints
- Assets endpoints
- common components
- ErrorModel
- pagination
- idempotency
- concurrency headers
- response envelopes
- absence of Post-V1 leakage

## 3. Files Reviewed

- `docs/nashir_v1_openapi.yaml`
- `docs/executable_openapi_planning.md`
- `docs/api_contract_gate.md`
- `docs/api_contract_review.md`

## 4. YAML Parseability Review

Command used:

```bash
ruby -e "require 'yaml'; YAML.load_file('docs/nashir_v1_openapi.yaml'); puts 'yaml ok'"
```

Result:

```text
yaml ok
```

Validation passed. This confirms YAML parseability. It does not replace a full OpenAPI semantic linter, but it is sufficient for this review gate because package installation was not allowed.

## 5. Scope Containment Review

Included scope:

- Health
- Products
- Assets
- common parameters
- common headers
- ErrorModel
- PaginationMeta
- Warning
- Product schemas
- Asset schemas

Not included:

- StoreStrategicPlan
- Campaign
- CampaignContent
- ReviewFinding
- PublishingReadiness
- ModelProvider
- ModelRoute
- PromptTemplate
- WorkflowRun
- AITaskRun
- ConnectorRun
- RawSourcePayload
- NormalizedSignal
- SocialStoreIntelligence
- PublishingExecution

Verdict: pass. The file stays inside Slice 1.

## 6. Metadata Review

Verified:

- `openapi: 3.1.0`
- `title: Nashir V1 API`
- `version: 0.1.0`
- placeholder server only: `https://api.example.invalid`
- no production server URL
- tags limited to `Health`, `Products`, and `Assets`

Verdict: pass.

## 7. Path Review

| Path group | Review |
|---|---|
| `GET /health` | Has `operationId`, tag, summary, description, response model, and default error. Workspace parameter is correctly not required. |
| `GET /workspaces/{workspaceId}/products` | Has `operationId`, tag, summary, description, workspace path parameter, pagination/filter parameters, list envelope, and error responses. |
| `POST /workspaces/{workspaceId}/products` | Has `operationId`, tag, summary, description, workspace path parameter, required `Idempotency-Key`, request body, product response, and expected errors. |
| `GET /workspaces/{workspaceId}/products/{productId}` | Has `operationId`, tag, summary, description, workspace/product path parameters, response model, and 404/default errors. |
| `PUT /workspaces/{workspaceId}/products/{productId}` | Has `operationId`, tag, summary, description, workspace/product path parameters, concurrency headers, request body, response model, and 409 version conflict coverage. |
| `GET /workspaces/{workspaceId}/assets` | Has `operationId`, tag, summary, description, workspace path parameter, pagination/filter parameters, list envelope, and error responses. |
| `POST /workspaces/{workspaceId}/assets` | Has `operationId`, tag, summary, description, workspace path parameter, required `Idempotency-Key`, request body, asset response, and clear no-binary-upload wording. |
| `GET /workspaces/{workspaceId}/assets/{assetId}` | Has `operationId`, tag, summary, description, workspace/asset path parameters, response model, and 404/default errors. |
| `PUT /workspaces/{workspaceId}/assets/{assetId}` | Has `operationId`, tag, summary, description, workspace/asset path parameters, concurrency headers, request body, response model, and 409 coverage. |
| `POST /workspaces/{workspaceId}/assets/{assetId}/link-product` | Has `operationId`, tag, summary, description, workspace/asset path parameters, required `Idempotency-Key`, request body, asset response, and rights-safety wording. |

Verdict: pass.

## 8. Product Contract Review

Product schema includes:

- `productId`
- `workspaceId`
- `name`
- `category`
- `price`
- `sku`
- `stockStatus`
- `imageUrl`
- `videoUrl`
- `description`
- `readiness`
- `status`
- `createdAt`
- `updatedAt`
- `version`

Verified:

- `productId` is canonical identity.
- Product name is display-only.
- Create request requires `name`.
- Update request uses optional fields and `minProperties: 1`.
- List response includes `PaginationMeta`.
- Product status enum is limited to `draft`, `active`, and `archived`.
- Stock status enum is limited to `available`, `limited`, `out_of_stock`, and `unknown`.

Verdict: pass.

## 9. Asset Contract Review

Asset schema includes:

- `assetId`
- `workspaceId`
- `linkedProductId`
- `linkedName`
- `name`
- `type`
- `url`
- `previewUrl`
- `rightsStatus`
- `usageRights`
- `source`
- `quality`
- `readiness`
- `status`
- `createdAt`
- `updatedAt`
- `version`

Verified:

- `assetId` is canonical identity.
- Asset names/file names are display-only.
- Binary upload is explicitly not part of Slice 1.
- Rights approval is not automatic.
- `link-product` links metadata only.
- Asset type enum is limited to `image`, `video`, `document`, `audio`, and `other`.
- Rights status enum is limited to `needs_review`, `approved`, `rejected`, and `unknown`.
- Usage rights enum is limited to `owned`, `licensed`, `user_generated`, and `unknown`.

Verdict: pass.

## 10. Common Components Review

Verified common components:

- `WorkspaceIdPath`
- `ProductIdPath`
- `AssetIdPath`
- pagination query parameters
- `Idempotency-Key` header
- `If-Match` header
- `X-Resource-Version` header
- `X-Request-Id` header
- `ErrorModel`
- `PaginationMeta`
- `Warning`
- common error responses

Verdict: pass.

## 11. Idempotency Review

Verified:

- `POST createProduct` requires `Idempotency-Key`.
- `POST createAsset` requires `Idempotency-Key`.
- `POST linkAssetToProduct` requires `Idempotency-Key`.
- `idempotency.conflict` exists in the error enum.

Verdict: pass.

## 12. Concurrency Review

Verified:

- `PUT updateProduct` documents `If-Match` or `X-Resource-Version`.
- `PUT updateAsset` documents `If-Match` or `X-Resource-Version`.
- `conflict.version_mismatch` exists in the error enum.
- Both concurrency headers are modeled with `required: false`, so the YAML does not incorrectly require both simultaneously.

Verdict: pass.

Non-blocking note: OpenAPI cannot directly express "one of these two headers is required" using parameter required flags alone. The current description is acceptable for Slice 1; a later linter or governance rule can enforce it in prose or with vendor extensions.

## 13. Error Model Review

ErrorModel includes:

- `errorCode`
- `message`
- `details`
- `requestId`
- `retryable`
- `status`

Error codes include:

- `workspace.not_found`
- `resource.not_found`
- `validation.failed`
- `permission.denied`
- `conflict.version_mismatch`
- `idempotency.conflict`
- `rate_limit.exceeded`
- `review.required`
- `publishing.blocked`
- `provider.not_ready`
- `model_route.not_ready`
- `prompt_template.not_approved`
- `cost_policy.exceeded`

Verdict: pass.

Future-domain error codes are present but harmless as common reusable errors. They do not create future endpoints or resource schemas.

## 14. Response Envelope Review

Verified:

- `ProductResponse` uses `data` + `warnings`.
- `ProductListResponse` uses `data` + `meta` + `warnings`.
- `AssetResponse` uses `data` + `warnings`.
- `AssetListResponse` uses `data` + `meta` + `warnings`.
- Errors use `ErrorModel`.

Verdict: pass.

## 15. Forbidden Scope Leakage Review

Command used:

```bash
grep -RIn \
  "StoreStrategicPlan\|CampaignContent\|WorkflowRun\|AITaskRun\|ConnectorRun\|RawSourcePayload\|NormalizedSignal\|PublishingExecution\|SocialStoreIntelligence" \
  docs/nashir_v1_openapi.yaml
```

Result:

```text
no results
```

Additional terms checked:

- Campaign
- ReviewFinding
- PublishingReadiness
- ModelProvider
- ModelRoute
- PromptTemplate

Result:

```text
no results
```

Verdict: pass.

## 16. Required Signal Review

Required signals checked:

- `productId`
- `assetId`
- `workspaceId`
- `ErrorModel`
- `Idempotency-Key`
- `X-Resource-Version`
- `PaginationMeta`
- `linkAssetToProduct`

Result: all required signals are present.

## 17. Risks and Findings

| Severity | Issue | Evidence | Consequence | Recommended fix | Must fix before Slice 2? |
|---|---|---|---|---|---|
| Low | `PermissionDenied` response is defined but not used by current operations. | `components.responses.PermissionDenied` exists, but paths do not reference it. | No contract failure; unused component may trigger strict lint warnings later. | Either use it on protected endpoints in a later slice or leave as common reusable response. | No |
| Low | Header policy "If-Match or X-Resource-Version" is documented but not machine-enforced. | Both headers are optional parameters with descriptions. | Client generators will not enforce one-of header requirement. | Add prose rules now; consider vendor extension or request policy docs later. | No |
| Low | Full OpenAPI semantic lint was not run. | Only Ruby YAML parsing was required and available. | A semantic OpenAPI issue could remain undetected. | Run Redocly or Spectral in a future tooling gate if allowed. | No |

No Critical, High, or Medium findings.

## 18. Required Patch Decision

No patch required.

Optional future cleanup:

- Use `PermissionDenied` in endpoint responses once authentication/authorization conventions are introduced.
- Add a linter-backed policy for "If-Match or X-Resource-Version".
- Run a semantic OpenAPI linter before treating YAML as implementation-ready for generated SDKs.

## 19. Final Decision

GO to OpenAPI Slice 2 Planning.
