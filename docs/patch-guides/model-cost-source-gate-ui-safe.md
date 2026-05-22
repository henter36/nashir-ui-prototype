# Model Routing + Cost Monitor Source Gate — UI-Safe Minimal Patch

## Goal

Prevent model routing policies, model registry, and cost limits from becoming separate local entities across:

- ModelRoutingPage
- CostMonitorPage
- SettingsPage

## Ownership

Internal only:

| Internal entity | Owner screen | UI wording |
|---|---|---|
| model registry | ModelRoutingPage | النماذج |
| model routing policy | ModelRoutingPage | مسارات التشغيل |
| cost monitor rows | CostMonitorPage | التكلفة والاستهلاك |
| AI summary settings | SettingsPage | ملخص فقط |

## Internal stores

Use:

```txt
nashir_mock_model_registry
nashir_mock_model_routing
nashir_mock_cost_monitor
```

## UI-Safe Rule

Do not show these as user-facing text:

```txt
مصدر الحقيقة
مصدر مشترك
الشاشة المالكة
modelId
routeId
costRowId
sourceSurface
ModelRoutingPage
CostMonitorPage
SettingsPage
```

Allowed user-facing wording:

```txt
نموذج نشط
مسار يحتاج مراجعة
تكلفة مرتفعة
ميزانية متبقية
جاهز للاستخدام
يتطلب مراجعة
```

## Scope

Allowed files:

```txt
src/utils/modelCostStore.js
src/pages/ModelRoutingPage.jsx
src/pages/CostMonitorPage.jsx
src/pages/SettingsPage.jsx
```

Do not edit App.jsx, Sidebar.jsx, routes, or styles.css unless build fails.

## Required patch

### 1. Create helper

Create:

```txt
src/utils/modelCostStore.js
```

Use the provided helper.

### 2. ModelRoutingPage.jsx

- Import useEffect if missing.
- Import:
  - readModelRegistry
  - upsertModel
  - deleteModel
  - readModelRoutes
  - upsertModelRoute
  - deleteModelRoute
  - deriveCostRowsFromRoutes
  - writeCostRows

- Replace local state:
  - MODEL_REGISTRY_SEED -> readModelRegistry(MODEL_REGISTRY_SEED)
  - ROUTES_SEED -> readModelRoutes(ROUTES_SEED)

- Add listeners:
  - focus
  - storage
  - nashir-model-registry-updated
  - nashir-model-routing-updated

- Any model edit/create/delete must write via model store helper.
- Any route edit/create/delete must write via route store helper.
- After route changes, update cost rows using deriveCostRowsFromRoutes, but do not display internal mapping.

### 3. CostMonitorPage.jsx

- Import useEffect if missing.
- Import:
  - readCostRows
  - upsertCostRow
  - deleteCostRow
  - deriveCostStatus
  - getCostUsage
  - getForecastUsage

- Replace local state:
  - initialRows -> readCostRows(initialRows)

- Add listeners:
  - focus
  - storage
  - nashir-cost-monitor-updated
  - nashir-model-routing-updated

- updateSelected, refreshCosts, blockSelected, unblockSelected, resetSelected must persist via upsertCostRow.
- Delete actions must use deleteCostRow if any exist.
- Keep UI labels unchanged unless they expose internal terms.

### 4. SettingsPage.jsx

Settings must not own model routing or detailed cost rows.

- Import:
  - getModelRoutingSummary
- Use it for summary values in overview / AI cost tab.
- Keep DEFAULT_AI_SETTINGS as general preferences only:
  - textProvider
  - imageProvider
  - videoProvider
  - requireHumanReview
  - redactCustomerData
- Do not use Settings as the detailed owner of route budgets or per-task model policies.
- If Settings displays maxMonthlyBudget, it must be a high-level preference/summary, not a separate detailed budget source.

## Verification

```bash
npm run build

grep -RIn \
  "مصدر الحقيقة\|مصدر مشترك\|الشاشة المالكة\|modelId\|routeId\|costRowId\|sourceSurface\|ModelRoutingPage\|CostMonitorPage\|SettingsPage" \
  src/pages src/components
```

Acceptable:
- imports
- component function names
- internal metadata not rendered

Not acceptable:
- visible JSX strings exposing these concepts.

## Commit

```bash
git add src/utils/modelCostStore.js src/pages/ModelRoutingPage.jsx src/pages/CostMonitorPage.jsx src/pages/SettingsPage.jsx
git commit -m "ui: share model routing and cost monitor state safely"
git push origin main
```
