# Dashboard + Analytics + Campaigns Source Gate — UI-Safe Minimal Patch

## Goal

Prevent dashboard KPIs, campaign lists, and campaign metrics from becoming separate local entities across:

- DashboardPage
- AnalyticsUnifiedPage
- CampaignsUnifiedPage

## Internal Ownership

| Entity | Owner | UI wording |
|---|---|---|
| campaigns | CampaignsUnifiedPage | الحملات |
| campaign metrics | AnalyticsUnifiedPage | مؤشرات الأداء |
| dashboard summary | DashboardPage | ملخص تنفيذي |

## Internal stores

```txt
nashir_mock_campaigns
nashir_mock_campaign_metrics
nashir_mock_dashboard_summary
```

## UI-Safe Rule

Do not show these as user-facing text:

```txt
مصدر الحقيقة
مصدر مشترك
الشاشة المالكة
campaignId
metricId
summaryId
sourceSurface
DashboardPage
AnalyticsUnifiedPage
CampaignsUnifiedPage
```

Allowed user-facing wording:

```txt
حملة نشطة
قيد المراجعة
مؤشر تقديري
أداء مراجع
ملخص تنفيذي
جاهزية الحملة
```

## Scope

Allowed files:

```txt
src/utils/campaignAnalyticsStore.js
src/pages/DashboardPage.jsx
src/pages/AnalyticsUnifiedPage.jsx
src/pages/CampaignsUnifiedPage.jsx
```

Do not edit App.jsx, Sidebar.jsx, routes, or global styles unless build fails.

## Required patch

### 1. Create helper

Create:

```txt
src/utils/campaignAnalyticsStore.js
```

Use the provided helper.

### 2. CampaignsUnifiedPage.jsx

CampaignsUnifiedPage owns campaigns.

- Import useEffect if missing.
- Import:
  - readCampaigns
  - upsertCampaign
  - deleteCampaign
  - deriveMetricsFromCampaigns
  - writeCampaignMetrics
  - refreshDashboardSummary

- Replace local `CAMPAIGNS` usage in state/filtering with `readCampaigns(CAMPAIGNS)`.
- If the page currently only selects campaigns, preserve that.
- Any create/update/delete must persist through campaign helper.
- After campaign updates, refresh derived metrics and dashboard summary.

### 3. AnalyticsUnifiedPage.jsx

AnalyticsUnifiedPage owns campaign metrics.

- Import useEffect if missing.
- Import:
  - readCampaigns
  - readCampaignMetrics
  - writeCampaignMetrics
  - upsertCampaignMetric
  - deriveMetricsFromCampaigns
  - refreshDashboardSummary

- Replace local `campaigns` metric source with `readCampaignMetrics(campaigns)`.
- Use campaign names/channels from campaign store where available.
- Any metric update must persist through `upsertCampaignMetric`.
- Refresh dashboard summary after metric changes.
- Keep UI labels unchanged unless they expose internal terms.

### 4. DashboardPage.jsx

DashboardPage must be summary-only.

- Import useEffect if missing.
- Import:
  - getDashboardSnapshot
  - refreshDashboardSummary
  - formatCompactNumber

- Replace local dashboard campaigns/KPIs/performance numbers with snapshot-derived values.
- Keep quick actions and layout.
- Dashboard should not create or own campaigns/metrics.
- Dashboard may display recent campaigns and summarized KPIs only.

## Verification

```bash
npm run build

grep -RIn \
  "مصدر الحقيقة\|مصدر مشترك\|الشاشة المالكة\|campaignId\|metricId\|summaryId\|sourceSurface\|DashboardPage\|AnalyticsUnifiedPage\|CampaignsUnifiedPage" \
  src/pages src/components
```

Acceptable:
- imports
- component function names
- internal code identifiers not rendered

Not acceptable:
- visible JSX strings exposing internal architecture.

## Commit

```bash
git add src/utils/campaignAnalyticsStore.js src/pages/DashboardPage.jsx src/pages/AnalyticsUnifiedPage.jsx src/pages/CampaignsUnifiedPage.jsx docs/patch-guides/campaign-analytics-dashboard-source-gate-ui-safe.md
git commit -m "ui: share campaign analytics and dashboard summary state safely"
git push origin main
```
