# Content Source of Truth Gate — Minimal Patch Guide

## Decision

Do not redesign the screens.

The goal is only to prevent duplicated content entities across:

- ContentStudioPage
- PublishingQueuePage
- MultiPlatformPage

## Source of Truth

Use:

```txt
nashir_mock_campaign_content
```

as the single source for campaign content.

Use:

```txt
nashir_mock_publishing_queue
```

only for scheduling metadata.

Use:

```txt
nashir_mock_multi_platform_readiness
```

only for per-platform readiness metadata.

## Ownership

| Screen | Ownership |
|---|---|
| ContentStudioPage | Owns campaign content |
| PublishingQueuePage | Owns schedule only; references contentId |
| MultiPlatformPage | Owns platform readiness only; references contentId |
| Dashboard | Read-only summaries only |

## Required Minimal Changes

### 1. Add helper

Create:

```txt
src/utils/campaignContentStore.js
```

Use the provided file.

### 2. ContentStudioPage.jsx

Keep the design.

Change only the data layer:

```js
import {
  readCampaignContent,
  upsertCampaignContentItem,
  CAMPAIGN_CONTENT_KEY,
} from "../utils/campaignContentStore.js";
```

Replace:

```js
const [items, setItems] = useState(initialItems);
```

with:

```js
const [items, setItems] = useState(() => readCampaignContent(initialItems));
```

Add listener:

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

In `updateActiveContent`, after building the updated item, call:

```js
const next = upsertCampaignContentItem(updatedItem, initialItems);
setItems(next);
```

In `updateStatus`, call:

```js
const next = upsertCampaignContentItem(updatedItem, initialItems);
setItems(next);
```

In `resetContent`, call:

```js
const next = upsertCampaignContentItem(original, initialItems);
setItems(next);
```

Do not change UI.

### 3. PublishingQueuePage.jsx

Keep the design.

Add:

```js
import {
  readCampaignContent,
  readPublishingQueue,
  upsertPublishingQueueItem,
  deletePublishingQueueItem,
  createQueueItemFromContent,
} from "../utils/campaignContentStore.js";
```

Replace:

```js
const [items, setItems] = useState(initialItems);
```

with:

```js
const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
const [items, setItems] = useState(() => readPublishingQueue(initialItems));
```

Add listeners for:

```txt
nashir-campaign-content-updated
nashir-publishing-queue-updated
```

In `addItem`, do not create independent content. Either:
- create a queue item from selected campaign content, or
- create a schedule-only item with `contentId: ""` and clear warning.

Preferred:

```js
const sourceContent = contentItems.find((content) => content.title === title) || contentItems[0];
const item = createQueueItemFromContent(sourceContent, {
  date: newItem.date,
  time: newItem.time,
  channel: newItem.channel,
  contentType: newItem.contentType,
});
const next = upsertPublishingQueueItem(item, initialItems);
setItems(next);
```

In `deleteSelected`:

```js
const next = deletePublishingQueueItem(selected.scheduleId || selected.id, initialItems);
setItems(next);
```

In `updateSelected` and `updateChecklist`, after updating the schedule item, call `upsertPublishingQueueItem`.

Do not change UI.

### 4. MultiPlatformPage.jsx

Keep the design.

Add:

```js
import {
  readCampaignContent,
  readMultiPlatformReadiness,
  writeMultiPlatformReadiness,
  buildReadinessFromContent,
} from "../utils/campaignContentStore.js";
```

Replace the assets state source:

```js
const [assets, setAssets] = useState(initialAssets);
```

with:

```js
const [contentItems, setContentItems] = useState(() => readCampaignContent([]));
const [assets, setAssets] = useState(() => {
  const stored = readMultiPlatformReadiness(initialAssets);
  const contentDerived = buildReadinessFromContent(readCampaignContent([]), stored);
  const next = contentDerived.length ? contentDerived : stored;
  writeMultiPlatformReadiness(next);
  return next;
});
```

Add listeners for:

```txt
nashir-campaign-content-updated
nashir-multi-platform-readiness-updated
```

In `updateAsset`, write to `nashir_mock_multi_platform_readiness`.

Do not create new content here.

## Acceptance Test

1. Open Content Studio.
2. Edit content text.
3. Mark it ready.
4. Open Publishing Queue.
5. Add/schedule an item based on the existing content.
6. The queue item must reference contentId.
7. Open MultiPlatform.
8. Readiness should be based on the same campaign content.
9. Changing content status in Content Studio should affect readiness after refresh/focus.
10. No screen should create a separate campaign content entity.

## Forbidden

- New content object inside PublishingQueue without contentId.
- New content object inside MultiPlatform.
- Copying content text as source of truth.
- Manual sync buttons.
- Redesigning the UI while applying this gate.
