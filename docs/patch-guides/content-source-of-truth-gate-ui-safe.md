# Content Source of Truth Gate — UI-Safe Minimal Patch

## Correction

Single Source of Truth is an internal architecture rule.

It must not appear as a customer-facing UI concept.

The user should not see:

- source of truth
- owner screen
- sourceSurface
- entity ownership
- backend table name
- which screen owns the field
- contentId as a visible label
- "this content comes from ContentStudioPage"

The user should see only operational labels such as:

- جاهز
- يحتاج مراجعة
- معتمد
- مجدول
- محظور
- القناة غير جاهزة
- المحتوى يحتاج اعتماد

## Internal Source of Truth

Use:

```txt
nashir_mock_campaign_content
```

as the internal source for content.

Use:

```txt
nashir_mock_publishing_queue
```

for schedule metadata only.

Use:

```txt
nashir_mock_multi_platform_readiness
```

for platform readiness metadata only.

## Ownership — Internal Only

| Internal Entity | Internal Owner | Customer-facing wording |
|---|---|---|
| CampaignContent | ContentStudioPage | المحتوى |
| PublishingQueue | PublishingQueuePage | الجدولة |
| MultiPlatformReadiness | MultiPlatformPage | جاهزية القنوات |
| contentId | Internal reference | لا يعرض |
| sourceSurface | Internal audit/debug metadata | لا يعرض |

## Required Minimal Changes

### 1. Add helper

Create:

```txt
src/utils/campaignContentStore.js
```

Use the provided helper.

It contains internal fields like `contentId` and `sourceSurface`, but they must not be rendered in the UI.

### 2. ContentStudioPage.jsx

Keep the current design.

Add import:

```js
import {
  readCampaignContent,
  upsertCampaignContentItem,
  getContentStatusLabel,
  getApprovalLabel,
} from "../utils/campaignContentStore.js";
```

Replace local content state source:

```js
const [items, setItems] = useState(initialItems);
```

with:

```js
const [items, setItems] = useState(() => readCampaignContent(initialItems));
```

Add refresh listener:

```js
React.useEffect(() => {
  const refresh = () => setItems(readCampaignContent(initialItems));

  window.addEventListener("focus", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("nashir-campaign-content-updated", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nashir-campaign-content-updated", refresh);
  };
}, []);
```

When editing or changing status, write through:

```js
const next = upsertCampaignContentItem(updatedItem, initialItems);
setItems(next);
```

UI rule:

Do not display `contentId`, `source`, or `sourceSurface`.

### 3. PublishingQueuePage.jsx

Keep the current design.

Add import:

```js
import {
  readCampaignContent,
  readPublishingQueue,
  upsertPublishingQueueItem,
  deletePublishingQueueItem,
  createQueueItemFromContent,
  getContentStatusLabel,
} from "../utils/campaignContentStore.js";
```

Replace local queue-only state:

```js
const [items, setItems] = useState(initialItems);
```

with:

```js
const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
const [items, setItems] = useState(() => readPublishingQueue(initialItems));
```

Add refresh listeners:

```js
React.useEffect(() => {
  const refresh = () => {
    setContentItems(readCampaignContent([]));
    setItems(readPublishingQueue(initialItems));
  };

  window.addEventListener("focus", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("nashir-campaign-content-updated", refresh);
  window.addEventListener("nashir-publishing-queue-updated", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nashir-campaign-content-updated", refresh);
    window.removeEventListener("nashir-publishing-queue-updated", refresh);
  };
}, []);
```

When adding a queue item:

```js
const sourceContent = contentItems.find((content) => content.status === "ready") || contentItems[0];

if (!sourceContent) {
  // Keep current UI behavior but show a user-facing warning:
  // "لا يوجد محتوى جاهز للجدولة."
  return;
}

const scheduleItem = createQueueItemFromContent(sourceContent, {
  date: newItem.date,
  time: newItem.time,
  channel: newItem.channel,
  contentType: newItem.contentType,
});

const next = upsertPublishingQueueItem(scheduleItem, initialItems);
setItems(next);
```

UI rule:

Show:
- عنوان المحتوى
- القناة
- الموعد
- الحالة
- يحتاج اعتماد / جاهز / محظور

Do not show:
- contentId
- sourceSurface
- "من ContentStudioPage"

### 4. MultiPlatformPage.jsx

Keep the current design.

Add import:

```js
import {
  readCampaignContent,
  readMultiPlatformReadiness,
  writeMultiPlatformReadiness,
  buildReadinessFromContent,
} from "../utils/campaignContentStore.js";
```

Replace independent assets/readiness source:

```js
const [assets, setAssets] = useState(initialAssets);
```

with:

```js
const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
const [assets, setAssets] = useState(() => {
  const stored = readMultiPlatformReadiness(initialAssets);
  const derived = buildReadinessFromContent(readCampaignContent([]), stored);
  const next = derived.length ? derived : stored;
  writeMultiPlatformReadiness(next);
  return next;
});
```

Add refresh listeners:

```js
React.useEffect(() => {
  const refresh = () => {
    const latestContent = readCampaignContent([]);
    const stored = readMultiPlatformReadiness(initialAssets);
    const derived = buildReadinessFromContent(latestContent, stored);
    const next = derived.length ? derived : stored;

    setContentItems(latestContent);
    setAssets(next);
    writeMultiPlatformReadiness(next);
  };

  window.addEventListener("focus", refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("nashir-campaign-content-updated", refresh);
  window.addEventListener("nashir-multi-platform-readiness-updated", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("nashir-campaign-content-updated", refresh);
    window.removeEventListener("nashir-multi-platform-readiness-updated", refresh);
  };
}, []);
```

UI rule:

Show:
- جاهز للقناة
- يحتاج مقاس
- يحتاج مراجعة
- القناة غير جاهزة
- الأصل يحتاج مراجعة

Do not show:
- MultiPlatformReadiness
- sourceSurface
- CampaignContent reference
- contentId

## Acceptance Test

1. Edit content in ContentStudio.
2. Mark it ready.
3. Open PublishingQueue.
4. Add/schedule using an existing ready content item.
5. The UI must not show `contentId`.
6. Internally, the queue item must include `contentId`.
7. Open MultiPlatform.
8. Readiness should reflect the content status.
9. The UI must show only operational readiness labels.
10. No screen should create independent campaign content.

## Forbidden UI Text

Remove or avoid any user-facing text containing:

```txt
مصدر الحقيقة
مصدر مشترك
sourceSurface
contentId
ContentStudioPage
PublishingQueuePage
MultiPlatformPage
مالك المحتوى
الشاشة المالكة
جدول المحتوى
كيان المحتوى
```

These terms may exist only in docs, code comments, or internal metadata.
