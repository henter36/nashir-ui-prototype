# UI Readiness Consumption Mapping — Prototype Only

## 1. Task Classification

| Field | Value |
|---|---|
| Document type | Documentation-only UI consumption mapping |
| Repository | nashir-ui-prototype |
| Prototype status | React/Vite UI prototype only — no real backend, no real API, no real AI execution |
| UI implementation | NO-GO in this step |
| API integration | NO-GO in this step |
| Backend runtime | NO-GO in this step |
| Generated clients | NO-GO in this step |
| OpenAPI YAML changes | NO-GO in this step |

This document maps how readiness data from the accepted OpenAPI Slice 3 surface should conceptually appear across prototype UI pages. It does not implement any UI change, API call, or mock execution. No `src/` file is modified by this document.

---

## 2. Inputs

### Merged OpenAPI Slice 3 surface

`docs/nashir_v1_openapi.yaml` — Six read-only GET readiness snapshot endpoints accepted and merged (PR #13):

| operationId | Path |
|---|---|
| `getWorkspaceReadiness` | `GET /workspaces/{workspaceId}/readiness` |
| `getWorkflowReadiness` | `GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/readiness` |
| `getWorkflowStepReadiness` | `GET /workspaces/{workspaceId}/workflow-definitions/{workflowDefinitionId}/steps/{stepKey}/readiness` |
| `getProviderReadiness` | `GET /workspaces/{workspaceId}/ai-providers/{providerId}/readiness` |
| `getModelRouteReadiness` | `GET /workspaces/{workspaceId}/model-routes/{modelRouteId}/readiness` |
| `getPromptReadiness` | `GET /workspaces/{workspaceId}/prompts/{promptId}/readiness` |

### Merged Slice 3 gate documents

| Gate | Document |
|---|---|
| Planning Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_planning_gate.md` |
| Review Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_review_gate.md` |
| Acceptance Gate | `docs/nashir_openapi_slice_3_readiness_snapshots_acceptance_gate.md` |
| YAML Implementation Scope Gate | `docs/nashir_openapi_slice_3_yaml_implementation_scope_gate.md` |

### Current page inventory

All pages reside in `src/pages/`. The eleven pages in scope for this mapping:

`WorkflowRunsPage.jsx`, `CampaignWizardPage.jsx`, `StoreSetupPage.jsx`, `ProductIntelligencePage.jsx`, `ProductCatalogPage.jsx`, `SecretsAndKeysPage.jsx`, `ModelRoutingPage.jsx`, `PromptGovernancePage.jsx`, `CostMonitorPage.jsx`, `SystemAdminPage.jsx`, `DataSourcesHubPage.jsx`

### Project constraints

- React/Vite prototype only. No real backend.
- No database, no auth, no AI execution, no prompt execution, no publishing, no analytics.
- Readiness data is currently represented as local UI state across pages.
- This mapping describes the intended future consumption pattern once a backend is available; it does not change the prototype's current behavior.

---

## 3. Mapping Decision

| Subject | Decision |
|---|---|
| Map readiness consumption across pages | GO |
| Implement UI changes | NO-GO |
| Integrate API calls | NO-GO |
| Add mock runtime execution | NO-GO |
| Generate clients | NO-GO |
| Edit OpenAPI YAML | NO-GO |

---

## 4. Core UX Rules

The following rules are binding on all future readiness UI work in this prototype and in any eventual real implementation. They must be respected at the component, page, and integration layer.

### Readiness score is advisory only

A readiness score (0–100) is a convenience summary. It must be accompanied by copy that makes clear it is advisory. It must never appear as a standalone pass/fail indicator. Acceptable: "نسبة الاكتمال: 72٪ — راجع العوائق أدناه." Unacceptable: a green checkmark or "جاهز" label derived from a score threshold alone.

### `unknown` is never ready

A dimension with status `unknown` must not be displayed as passing, ready, or neutral. It must be surfaced as a distinct state requiring attention. Suggested label: "غير معروف — يحتاج مراجعة." A grey or amber indicator is acceptable; a green indicator is not.

### Blockers override score

If `blockers[]` is non-empty or `overallStatus` is `blocked`, the UI must prominently display the blocker list regardless of score. A high score with active blockers is a blocked step. The blocker list must not be hidden behind an accordion unless a summary badge is always visible.

### Readiness must not imply execution permission

Displaying a "ready" badge on a workflow step does not authorize, trigger, or simulate execution. Copy near readiness indicators must not say "جاهز للتشغيل" (ready to run) unless all of the following are true: no dimension has `blocked` status, no dimension has `unknown` status, and all required blockers are absent. Preferred wording: "متطلبات الجاهزية مكتملة" (readiness requirements met).

### No page depends directly on another page's local state

In any future implementation, pages must not read another page's `useState`, `useRef`, `localStorage`, or Zustand store as a source of truth for readiness. The correct pattern:

```
Owner module → Shared backend contract / API → Consumer module
```

In the prototype, a shared fixture store is acceptable as a temporary substitute. A direct import of one page's state into another page is not.

### Five distinct readiness states must be visually distinguished

| State | Meaning | Suggested visual |
|---|---|---|
| `ready` | All requirements met | Green badge or icon |
| `warning` | Partial; does not block | Amber badge |
| `blocked` | Hard requirement unmet | Red badge + blocker list |
| `unknown` | Cannot be resolved | Grey badge + "غير معروف" label |
| `not_applicable` | Does not apply | Neutral; may be hidden |

---

## 5. Readiness Data Sources

The following conceptual mapping describes which OpenAPI endpoint would supply data to which page category. In the prototype, these endpoints are not called from a real API. A future UI integration PR would replace prototype fixture data with API calls to these endpoints.

| Endpoint | Conceptual data | Prototype substitute |
|---|---|---|
| `getWorkspaceReadiness` | Workspace-level advisory rollup across all workflows | Static fixture or computed local summary |
| `getWorkflowReadiness` | Per-workflow step readiness rollup | Static per-workflow fixture |
| `getWorkflowStepReadiness` | Per-step all-ten-dimension signals | Static step fixture |
| `getProviderReadiness` | Provider health, capabilities, secret reference | Static provider health fixture in `SecretsAndKeysPage` |
| `getModelRouteReadiness` | Route health, fallback models, provider binding status | Static route fixture in `ModelRoutingPage` |
| `getPromptReadiness` | Prompt version, approval status, blocked patterns | Static prompt fixture in `PromptGovernancePage` |

**Prototype note:** `CostReadinessSnapshot` and `DataSourceReadinessSnapshot` are schema-only in Slice 3. Their data surfaces are embedded within `WorkflowStepReadiness` via `costReady` and `dataSourceReady` dimension signals. No standalone endpoint exists. Prototype fixtures for these dimensions must be embedded in the step readiness fixture, not displayed as independent API results.

---

## 6. Page-by-Page Consumption Mapping

---

### `WorkflowRunsPage.jsx`

**Role:** Primary consumer of workflow and step readiness data.

| Dimension | Detail |
|---|---|
| May consume | `getWorkflowReadiness`, `getWorkflowStepReadiness` |
| May display | Per-step readiness panel showing all ten dimension signals; overall step status badge; blocker list per step; advisory score caption; next-action hints |
| Must not display | Execution controls implied to be unlocked by readiness; a "run" button that appears active when readiness is high |
| Must not do | Execute a step or workflow; call a real AI endpoint; simulate a dry run; read readiness state directly from `ModelRoutingPage`, `SecretsAndKeysPage`, or any other page's local state |
| Allowed UI pattern | Per-step readiness table; collapsible dimension panel; blocker badge always visible; "عرض تفاصيل الجاهزية" (show readiness details) expand action |
| Risk if misused | Step appears executable when blockers exist; users interpret a ready badge as authorization to run |

---

### `CampaignWizardPage.jsx`

**Role:** Consumer of campaign-level and step readiness for output generation readiness display.

| Dimension | Detail |
|---|---|
| May consume | `getWorkflowReadiness` (for the campaign workflow); step-level `outputReady`, `reviewReady`, `destinationReady` signals |
| May display | Campaign readiness summary chip; which outputs are ready; which destinations are configured; review requirement indicator |
| Must not display | A "generate" or "publish" button implied as authorized by readiness; raw provider or route detail — those belong to owner pages |
| Must not do | Mutate readiness source modules; call provider endpoints; read `SecretsAndKeysPage` or `ModelRoutingPage` state directly |
| Allowed UI pattern | Campaign readiness summary section; per-output readiness chip; advisory note: "الجاهزية مؤشر فقط وليست إذنًا بالتشغيل" |
| Risk if misused | Users interpret campaign readiness as a publishing gate; output generation is triggered based on a readiness badge |

---

### `StoreSetupPage.jsx`

**Role:** Consumer of workspace-level AI readiness for a high-level health indicator only.

| Dimension | Detail |
|---|---|
| May consume | `getWorkspaceReadiness` — advisory workspace rollup only |
| May display | A small workspace AI readiness chip or notice: "X من Y مسارات العمل جاهزة" (X of Y workflows ready); link to `WorkflowRunsPage` for detail |
| Must not display | Per-dimension signal detail — that belongs to specialist pages; any readiness indicator implying the store AI features are active or executing |
| Must not do | Own readiness state; write readiness records; read readiness from other pages' local state |
| Allowed UI pattern | One-line readiness notice in a status bar or summary card; advisory only |
| Risk if misused | Workspace readiness chip is misread as "store is live with AI" |

---

### `ProductIntelligencePage.jsx`

**Role:** Consumer of prompt and route readiness for product analysis step readiness display.

| Dimension | Detail |
|---|---|
| May consume | `getPromptReadiness` (for the analysis prompt), `getModelRouteReadiness` (for the analysis route) |
| May display | Analysis readiness status: whether the prompt is approved, whether the route is healthy; blocker list if either is not ready; advisory score |
| Must not display | An "analyze" button implied as authorized by readiness alone; raw provider credential detail |
| Must not do | Execute a prompt; call a model; read prompt state from `PromptGovernancePage` local state directly |
| Allowed UI pattern | Readiness panel before the analysis trigger area; "متطلبات التحليل" (analysis requirements) checklist showing promptReady and routeReady status |
| Risk if misused | Analysis button appears active when prompt is not approved or route is unhealthy |

---

### `ProductCatalogPage.jsx`

**Role:** Consumer of input readiness to confirm product data sufficiency before analysis.

| Dimension | Detail |
|---|---|
| May consume | Embedded `inputReady` signal from `getWorkflowStepReadiness` for analysis steps involving this product |
| May display | A small input readiness indicator on the product card: "البيانات المطلوبة مكتملة" or "بيانات ناقصة" |
| Must not display | Full readiness panel — that belongs to `WorkflowRunsPage`; provider or route detail |
| Must not do | Own step readiness state; read step readiness from `WorkflowRunsPage` local state |
| Allowed UI pattern | Small input status badge on product card; tooltip with missing field names if `inputReady` has warnings |
| Risk if misused | Product card badge is read as "ready to analyze" rather than "input data is present" |

---

### `SecretsAndKeysPage.jsx`

**Role:** Owner of `providerReady` dimension. Reads `ProviderReadinessSnapshot` to show current provider health.

| Dimension | Detail |
|---|---|
| May consume | `getProviderReadiness` for each configured provider |
| May display | Provider health chip: `healthy / degraded / unavailable / unknown`; supported capabilities list; secret reference name (never secret value); last-tested timestamp; blockers if any |
| Must not display | Raw secret values, API keys, or credential strings — ever; a "test connection" button that implies live probing (live provider probing and provider test-connection remain deferred by the Slice 3 planning, review, and acceptance gates) |
| Must not do | Write readiness to another page's state; provide readiness data directly to consumer pages; expose any credential value |
| Allowed UI pattern | Provider card with readiness chip; health status icon; `secretReferenceName` shown as vault reference label only; blocker badge if provider is not ready |
| Risk if misused | Secret value leaks into the UI; provider health chip is misread as authorization to use the provider in a real call |

---

### `ModelRoutingPage.jsx`

**Role:** Owner of `routeReady` dimension. Reads `RouteReadinessSnapshot` to show current route health.

| Dimension | Detail |
|---|---|
| May consume | `getModelRouteReadiness` for each configured route |
| May display | Route health chip: `healthy / degraded / unavailable / unknown`; primary model identifier; fallback model list; provider binding readiness status (derived `ReadinessStatus` scalar, not a full signal); blockers if route is not ready |
| Must not display | Route invocation controls; a "test route" button that implies a live model call |
| Must not do | Own provider readiness — that belongs to `SecretsAndKeysPage`; write route readiness to consumer pages |
| Allowed UI pattern | Route card with health chip; provider binding status as a secondary indicator; blocker list accordion |
| Risk if misused | Route health chip is misread as "route is executing successfully"; route binding status is confused with provider test result |

---

### `PromptGovernancePage.jsx`

**Role:** Owner of `promptReady` dimension. Reads `PromptReadinessSnapshot` to show approval and check status.

| Dimension | Detail |
|---|---|
| May consume | `getPromptReadiness` for each governed prompt version |
| May display | Prompt approval status chip: `active / testing / draft / blocked`; required checks list; allowed output types; blocked pattern count; advisory score; blockers if not approved |
| Must not display | Prompt text content or raw input/output templates in the readiness panel — those belong to the prompt editor; an "execute prompt" action implied as authorized by `active` status |
| Must not do | Own route or provider readiness; write prompt readiness to consumer pages directly |
| Allowed UI pattern | Prompt version card with approval status badge; checklist of required checks; "الأنماط المحظورة: N" (blocked patterns: N) summary |
| Risk if misused | `active` approval status is misread as prompt is safe to execute without further review |

---

### `CostMonitorPage.jsx`

**Role:** Owner of `costReady` dimension. Cost readiness surfaces embedded in step readiness; no standalone endpoint.

| Dimension | Detail |
|---|---|
| May consume | `costReady` embedded signal from `getWorkflowStepReadiness`; its own local cost policy configuration |
| May display | Budget cap and approval threshold for each policy; forecast risk chip: `ok / watch / risk / blocked`; throttling status; advisory cost readiness summary |
| Must not display | A standalone readiness endpoint result — `CostReadinessSnapshot` has no standalone GET path in Slice 3; any readiness signal implying cost has been approved for a real spend |
| Must not do | Write cost readiness directly to consumer pages; use cost readiness as a billing gate |
| Allowed UI pattern | Policy card with forecast risk chip; budget utilization bar; advisory note: "تقدير التكلفة — ليس فاتورة فعلية" (cost estimate — not actual billing) |
| Risk if misused | Forecast risk `ok` is misread as spend approval; cost policy readiness is used as a billing authorization signal |

---

### `SystemAdminPage.jsx`

**Role:** Consumer of workspace readiness summary for global AI operations health view.

| Dimension | Detail |
|---|---|
| May consume | `getWorkspaceReadiness` — workspace-level advisory rollup |
| May display | Global AI operations readiness overview: total workflows, blocked count, warning count, ready count, unknown count; link to `WorkflowRunsPage` for step detail |
| Must not display | Per-step dimension detail — that belongs to `WorkflowRunsPage`; any indicator implying system is in production |
| Must not do | Own step or dimension readiness; write global readiness policy |
| Allowed UI pattern | Summary stats panel: "X مسارات محجوبة" (X workflows blocked), "Y بحاجة للمراجعة" (Y need review); status traffic light |
| Risk if misused | Global readiness overview is misread as a system health dashboard for a live production environment |

---

### `DataSourcesHubPage.jsx`

**Role:** Owner of `dataSourceReady` dimension. Data source readiness surfaces embedded in step readiness; no standalone endpoint.

| Dimension | Detail |
|---|---|
| May consume | `dataSourceReady` embedded signal from `getWorkflowStepReadiness`; its own connector configuration |
| May display | Connector status chip: `available / unavailable / degraded / unknown`; governance flag; redaction-active indicator; blockers if connector is not ready |
| Must not display | A standalone `DataSourceReadinessSnapshot` endpoint result — no standalone GET path exists in Slice 3; connector credentials or raw data samples |
| Must not do | Call a real connector; write data source readiness to consumer pages; expose data that should be redacted |
| Allowed UI pattern | Connector card with status chip; governance badge; redaction indicator; blocker list if connector is unavailable |
| Risk if misused | Connector `available` status is misread as data is safe to use without governance review; redaction flag is ignored |

---

## 7. Proposed UI Patterns

The following patterns are proposed for future prototype UI work. None are implemented. All are advisory.

| Pattern | Description | Pages |
|---|---|---|
| **Readiness badge** | A small colored chip displaying one of five states (`ready`, `warning`, `blocked`, `unknown`, `not_applicable`) | All pages |
| **Blocker list** | An inline or accordion list of human-readable blocker strings from `blockers[]`; always visible if non-empty | `WorkflowRunsPage`, `CampaignWizardPage`, `SecretsAndKeysPage`, `ModelRoutingPage`, `PromptGovernancePage` |
| **Unknown state hint** | A grey badge with tooltip: "لا يمكن تحديد الحالة — يحتاج مراجعة" (state cannot be determined — review needed) | All pages where `unknown` may appear |
| **Advisory score caption** | A score display always accompanied by Arabic copy stating it is advisory: "نسبة الاكتمال (استرشادي فقط)" | `WorkflowRunsPage`, `CampaignWizardPage` |
| **Readiness panel** | An expandable panel showing all ten dimension signals for a step with their status, blockers, and next-action hints | `WorkflowRunsPage` |
| **Per-step readiness table** | A table row per step with dimension status columns: trigger, input, provider, route, prompt, cost, review, output, destination, data-source | `WorkflowRunsPage` |
| **Provider readiness chip** | A small chip on a provider card: `healthy / degraded / unavailable / unknown`; does not imply connection test | `SecretsAndKeysPage` |
| **Prompt readiness warning** | An inline warning near a prompt if `approvalStatus` is not `active` or if `blockedPatterns` count is non-zero | `PromptGovernancePage`, `ProductIntelligencePage` |
| **Route readiness status** | A health indicator on a route card derived from `routeHealth` enum | `ModelRoutingPage` |
| **Cost embedded signal display** | Forecast risk chip derived from `forecastRisk` enum; accompanied by advisory copy | `CostMonitorPage` |
| **Data source embedded signal display** | Connector status chip; redaction and governance badges | `DataSourcesHubPage` |
| **Input readiness badge** | A small badge on a product card or campaign step showing whether required input data is present | `ProductCatalogPage`, `CampaignWizardPage` |

---

## 8. Page Ownership Boundaries

The following ownership rules are binding for all future UI and backend work.

| Page | Owns | Must not own |
|---|---|---|
| `StoreSetupPage` | Store configuration UI only | Provider readiness, route readiness, any AI operations domain |
| `SecretsAndKeysPage` | Provider / secret configuration UI; `providerReady` visibility | Route readiness, prompt readiness, cost policy |
| `ModelRoutingPage` | Model route visibility; `routeReady` display | Provider credentials, prompt approval, cost policy |
| `PromptGovernancePage` | Prompt readiness visibility; `promptReady` display | Route health, provider health, cost policy |
| `CostMonitorPage` | Cost policy readiness visibility; `costReady` display | Provider credentials, route decisions, prompt approval |
| `DataSourcesHubPage` | Connector readiness visibility; `dataSourceReady` display | Step execution, campaign content, AI model routing |
| `CampaignWizardPage` | Campaign step readiness summary display | Direct mutation of readiness source modules; provider/route/prompt state |
| `WorkflowRunsPage` | Workflow-level and step-level readiness display | Execution authorization; real step triggering; readiness state from other pages' local state |
| `SystemAdminPage` | Workspace readiness summary view | Per-step dimension authority |
| `ProductCatalogPage` | Input readiness badge per product | Step readiness detail; provider or route data |
| `ProductIntelligencePage` | Analysis step readiness display (promptReady + routeReady) | Prompt execution; model invocation |

---

## 9. Prototype Data Strategy

Until a real backend and API are available, the prototype must represent readiness using one of the following strategies. Strategies are listed in order of preference.

| Strategy | Description | Acceptable |
|---|---|---|
| **Static fixture per page** | Each owner page defines a local static fixture for its domain readiness data. Consumer pages receive a copy via prop or shared context. | Acceptable for initial prototype |
| **Centralized prototype fixture store** | A shared in-memory or localStorage fixture store provides readiness data to all pages. Owner pages write to their domain key; consumer pages read from it. This is acceptable if the store is clearly marked as a prototype-only substitute and does not resemble a generated API client. | Acceptable if clearly labelled |
| **Direct page-to-page state import** | One page imports and reads another page's `useState` or Zustand state directly. | **Not acceptable** |
| **Fake API client** | A module that looks like a production HTTP client but returns static data. | **Not acceptable** — this pattern creates misleading impressions about production readiness |
| **Generated client from YAML** | A client generated from `docs/nashir_v1_openapi.yaml` and connected to a stub server. | **Not acceptable** — requires separate approval |

---

## 10. Risks and Controls

| Risk | Control |
|---|---|
| **False confidence from readiness scores.** A user sees a score of 80/100 and assumes the workflow is safe to run. | All score displays must carry the advisory caption. Score must never appear as the only readiness indicator. |
| **`unknown` read as ready.** A user sees an empty or grey state and assumes the dimension is passing. | `unknown` must always render as a distinct grey badge with explanatory label. It must never render the same as `ready`. |
| **Blockers hidden behind score.** Blockers exist but are folded into a collapsed section; the score is prominently displayed. | Blocker badge must always be visible when `blockers[]` is non-empty, regardless of accordion state. A collapsed detail section must still show a blocker count in the summary. |
| **Pages coupled through local state.** A consumer page imports readiness from an owner page's `useState`. | Section 8 ownership boundaries are enforced. A shared fixture store is the only acceptable inter-page data pattern in the prototype. |
| **Prototype looks like real API integration.** A fake API client module is introduced and later assumed to be wired to a real backend. | Prototype data strategy in Section 9 prohibits fake API clients. Any future real API wiring must be separately gated. |
| **Readiness becomes an execution gate.** A "run" or "generate" button becomes active when readiness score crosses a threshold. | Readiness must not gate execution in the prototype. Buttons may reference readiness for display but must be clearly labelled as prototype-only actions. |
| **Secret leakage in UI.** A `secretValue`, raw API key, or credential string appears in a readiness panel. | The `SecretsAndKeysPage` ownership rules (Section 6) and prototype data strategy (Section 9) prohibit any credential display. `SecretsAndKeysPage` must display only `secretReferenceName`. Prototype fixtures must not contain real or simulated credential strings. |
| **Cost / data-source endpoint confusion.** A developer introduces standalone readiness API calls for cost or data-source dimensions. | Section 5 explicitly states these are schema-only in Slice 3 with no standalone endpoint. Any standalone endpoint addition requires a new planning and review cycle. |
| **`stepKey` instability.** A consumer page stores `stepKey` alone as a durable identifier across workflow versions. | The durable workflow step reference `(workflowDefinitionId, workflowVersion, stepKey)` is inherited from the accepted OpenAPI Slice 3 readiness contract and YAML implementation scope. Prototype fixtures must store all three fields. |
| **Inconsistent labels across pages.** One page labels a `blocked` state "غير جاهز" and another labels it "محجوب". | Section 4 defines five distinct state labels. All pages must use the same label set for each `ReadinessStatus` value. A shared label constant is recommended. |

---

## 11. Acceptance Criteria for Future UI Implementation

A future UI prototype implementation PR must satisfy all of the following before being considered for review.

| Criterion | Requirement |
|---|---|
| Separately scoped | UI changes must be on their own branch and PR; not bundled with YAML, documentation, or backend work |
| `src/` only | Only `src/` files may change; `docs/nashir_v1_openapi.yaml` and gate documents must not be touched |
| No real API calls | No `fetch`, `axios`, or HTTP client call to a real server; prototype data comes from fixtures |
| No generated clients | No client generated from the OpenAPI YAML unless separately approved |
| Shared fixture if inter-page | If readiness data must cross page boundaries, use a shared prototype fixture store — clearly labelled, not resembling a production client |
| Advisory language near scores | Every score display must carry the advisory caption defined in Section 4 |
| Blockers always visible | Any component showing readiness must surface the blocker count in its summary even when detail is collapsed |
| `unknown` distinctly styled | `unknown` state must render with a distinct grey badge and label; it must never render as `ready` |
| No page-to-page state import | No direct import of one page's state into another |
| OpenAPI semantics preserved | Field names used in fixture data must match `ReadinessStatus` enum values and `ReadinessSignal` field names from the accepted YAML |
| Lint and build pass | `npm run lint` and `npm run build` must pass before the PR is marked ready for review |

---

## 12. Explicitly Out of Scope

The following are out of scope for this mapping document and for any UI prototype implementation PR derived from it, unless separately approved.

- `src/` changes (not in this document; future PR only)
- `docs/nashir_v1_openapi.yaml` changes
- Backend runtime
- Generated clients
- Real API integration
- Authentication and authorization
- Database
- AI execution, prompt execution
- Content publishing
- Analytics integration
- Workflow execution
- Dry-run execution
- Provider test-connection
- Run artifacts and audits
- Billing or subscription

---

## 13. GO / NO-GO

| Subject | Decision |
|---|---|
| Mapping document | GO — this document is the mapping output |
| UI implementation | NO-GO — requires a separately scoped and reviewed UI implementation PR |
| API integration | NO-GO |
| Backend runtime | NO-GO |
| Generated clients | NO-GO |
| OpenAPI YAML edits | NO-GO |

---

## 14. Next Step

The next step after this mapping is reviewed and accepted is:

**UI Readiness Prototype Implementation Slice — scoped page-by-page**

That implementation must not start automatically. It requires:

- Explicit user authorization to begin.
- A separate branch and PR targeting `src/` only.
- A decision on which pages to implement first (recommended order: `SecretsAndKeysPage` → `ModelRoutingPage` → `PromptGovernancePage` → `WorkflowRunsPage`).
- Agreement on the prototype data strategy from Section 9 (static fixture vs. centralized store).
- Confirmation that `npm run lint` and `npm run build` pass before review.
