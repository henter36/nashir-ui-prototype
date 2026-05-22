# Content Review + Preview Source Gate — UI-Safe Minimal Patch

## Goal

Prevent `ContentReviewPreviewUnifiedPage` from owning independent campaigns or content.

The page should only handle:

- review
- preview
- approval
- request changes
- rejection

It must consume campaigns and content from the existing stores.

## Existing internal stores

```txt
nashir_mock_campaigns
nashir_mock_campaign_content
```

## New internal store

```txt
nashir_mock_review_preview_items
```

This stores review/preview state only.

## Ownership

| Entity | Owner | UI wording |
|---|---|---|
| campaigns | CampaignsUnifiedPage | الحملات |
| content | ContentStudioPage | المحتوى |
| review/preview state | ContentReviewPreviewUnifiedPage | المراجعة والمعاينة |

## UI-Safe Rule

Do not show these as user-facing text:

```txt
مصدر الحقيقة
مصدر مشترك
الشاشة المالكة
campaignId
contentId
reviewItemId
sourceSurface
ContentStudioPage
CampaignsUnifiedPage
ContentReviewPreviewUnifiedPage
```

Allowed user-facing wording:

```txt
الحملة
المحتوى
مراجعة
معاينة
معتمد
مرفوض
طلب تعديل
جاهز للمراجعة
```

## Scope

Allowed files:

```txt
src/utils/reviewPreviewStore.js
src/pages/ContentReviewPreviewUnifiedPage.jsx
```

Do not edit App.jsx, Sidebar.jsx, global routes, or styles.css unless build fails.

## Required patch

### 1. Create helper

Create:

```txt
src/utils/reviewPreviewStore.js
```

Use the provided helper.

### 2. ContentReviewPreviewUnifiedPage.jsx

- Import useEffect if missing.
- Import:
  - readCampaigns from `../utils/campaignAnalyticsStore.js`
  - readCampaignContent from `../utils/campaignContentStore.js`
  - refreshReviewItemsFromSources
  - readReviewPreviewItems
  - updateReviewContent
  - updateReviewStatus
  from `../utils/reviewPreviewStore.js`

### State changes

Replace local campaign usage:

```js
CAMPAIGNS
```

with campaign state:

```js
const [campaignList, setCampaignList] = useState(() => readCampaigns(CAMPAIGNS));
```

Replace local content state:

```js
const [contentItems, setContentItems] = useState(CONTENT_ITEMS);
```

with review items derived from content:

```js
const [contentItems, setContentItems] = useState(() =>
  refreshReviewItemsFromSources({
    contentSeed: CONTENT_ITEMS,
    campaignSeed: CAMPAIGNS,
    reviewSeed: CONTENT_ITEMS,
  })
);
```

### Listener

Add listeners for:

```txt
focus
storage
nashir-campaigns-updated
nashir-campaign-content-updated
nashir-review-preview-updated
```

Refresh campaignList and contentItems from stores.

### Editing content

`saveEdit` or equivalent must call:

```js
const next = updateReviewContent(selectedContent, editorText, {
  contentSeed: CONTENT_ITEMS,
  reviewSeed: CONTENT_ITEMS,
});
setContentItems(next);
```

### Review decision

`updateStatus` or equivalent must call:

```js
const next = updateReviewStatus(selectedContent, status, reviewNote, {
  contentSeed: CONTENT_ITEMS,
  reviewSeed: CONTENT_ITEMS,
});
setContentItems(next);
setReviewNote("");
```

### Campaign lookup

Any lookup like:

```js
CAMPAIGNS.find(...)
```

must use:

```js
campaignList.find(...)
```

### UI

Preserve existing UI layout and labels unless they expose internal terms.

Do not display:

```txt
campaignId
contentId
reviewItemId
sourceSurface
```

## Verification

```bash
npm run build

grep -RIn \
  "مصدر الحقيقة\|مصدر مشترك\|الشاشة المالكة\|campaignId\|contentId\|reviewItemId\|sourceSurface\|ContentReviewPreviewUnifiedPage\|ContentStudioPage\|CampaignsUnifiedPage" \
  src/pages/ContentReviewPreviewUnifiedPage.jsx
```

Acceptable:
- imports
- component function names
- internal variables not rendered

Not acceptable:
- visible JSX strings exposing internal architecture.

## Commit

```bash
git add src/utils/reviewPreviewStore.js src/pages/ContentReviewPreviewUnifiedPage.jsx docs/patch-guides/content-review-preview-source-gate-ui-safe.md
git commit -m "ui: share content review and preview state safely"
git push origin main
```
