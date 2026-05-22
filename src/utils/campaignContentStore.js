const CAMPAIGN_CONTENT_KEY = "nashir_mock_campaign_content";
const PUBLISHING_QUEUE_KEY = "nashir_mock_publishing_queue";
const MULTI_PLATFORM_READINESS_KEY = "nashir_mock_multi_platform_readiness";

function nowIso() {
  return new Date().toISOString();
}

function normalizeContentItem(item = {}) {
  const id = String(item.id || item.contentId || `content_${Date.now()}_${Math.random().toString(16).slice(2)}`);

  return {
    id,
    contentId: id,
    title: item.title || "مخرج محتوى بدون عنوان",
    type: item.type || item.contentType || "محتوى",
    channel: item.channel || "General",
    status: item.status || "draft",
    content: item.content || item.preview || "",
    campaign: item.campaign || "حملة تجريبية",
    owner: item.owner || "Content Studio",
    source: item.source || "content_studio",
    sourceSurface: item.sourceSurface || "ContentStudioPage",
    approval: item.approval || (item.status === "ready" ? "approved" : "needs_review"),
    risk: item.risk || "medium",
    updatedAt: item.updatedAt || nowIso(),
    createdAt: item.createdAt || item.updatedAt || nowIso(),
    metadata: item.metadata || {},
  };
}

function normalizeQueueItem(item = {}) {
  const id = String(item.id || item.scheduleId || `schedule_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  const contentId = item.contentId || item.id || "";

  return {
    id,
    scheduleId: id,
    contentId,
    title: item.title || "عنصر نشر بدون عنوان",
    channel: item.channel || "General",
    date: item.date || "2026-05-24",
    time: item.time || "09:00",
    status: item.status || "draft",
    approval: item.approval || "needs_review",
    campaign: item.campaign || "حملة تجريبية",
    owner: item.owner || "Publishing Queue",
    contentType: item.contentType || item.type || "Post",
    risk: item.risk || "medium",
    preview: item.preview || item.content || "",
    checklist: {
      contentApproved: Boolean(item.checklist?.contentApproved),
      assetRights: item.checklist?.assetRights ?? true,
      linkChecked: Boolean(item.checklist?.linkChecked),
      channelReady: item.checklist?.channelReady ?? true,
    },
    source: item.source || "publishing_queue",
    sourceSurface: item.sourceSurface || "PublishingQueuePage",
    updatedAt: item.updatedAt || nowIso(),
    createdAt: item.createdAt || item.updatedAt || nowIso(),
  };
}

function normalizeReadinessItem(item = {}) {
  const id = String(item.id || item.readinessId || `readiness_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  return {
    id,
    readinessId: id,
    contentId: item.contentId || "",
    platform: item.platform || item.channel || "General",
    size: item.size || "",
    type: item.type || item.contentType || "Content",
    status: item.status || "needs_review",
    issue: item.issue || "يحتاج مراجعة قبل النشر.",
    approval: item.approval || "needs_review",
    source: item.source || "multi_platform",
    sourceSurface: item.sourceSurface || "MultiPlatformPage",
    updatedAt: item.updatedAt || nowIso(),
  };
}

function readJsonStore(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      writeJsonStore(key, fallback);
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;

    if (key === CAMPAIGN_CONTENT_KEY && Array.isArray(parsed?.items)) return parsed.items;
    if (key === PUBLISHING_QUEUE_KEY && Array.isArray(parsed?.items)) return parsed.items;
    if (key === MULTI_PLATFORM_READINESS_KEY && Array.isArray(parsed?.items)) return parsed.items;

    return fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStore(key, items) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      source:
        key === CAMPAIGN_CONTENT_KEY
          ? "nashir_ui_prototype_campaign_content"
          : key === PUBLISHING_QUEUE_KEY
            ? "nashir_ui_prototype_publishing_queue"
            : "nashir_ui_prototype_multi_platform_readiness",
      updatedAt: nowIso(),
      items,
    })
  );

  const eventName =
    key === CAMPAIGN_CONTENT_KEY
      ? "nashir-campaign-content-updated"
      : key === PUBLISHING_QUEUE_KEY
        ? "nashir-publishing-queue-updated"
        : "nashir-multi-platform-readiness-updated";

  window.dispatchEvent(new Event(eventName));
}

export function readCampaignContent(seed = []) {
  return readJsonStore(CAMPAIGN_CONTENT_KEY, seed.map(normalizeContentItem)).map(normalizeContentItem);
}

export function writeCampaignContent(items = []) {
  writeJsonStore(CAMPAIGN_CONTENT_KEY, items.map(normalizeContentItem));
}

export function upsertCampaignContentItem(item, seed = []) {
  const current = readCampaignContent(seed);
  const normalized = normalizeContentItem(item);
  const exists = current.some((candidate) => candidate.contentId === normalized.contentId || candidate.id === normalized.id);

  const next = exists
    ? current.map((candidate) =>
        candidate.contentId === normalized.contentId || candidate.id === normalized.id
          ? { ...candidate, ...normalized, updatedAt: nowIso() }
          : candidate
      )
    : [...current, { ...normalized, createdAt: nowIso(), updatedAt: nowIso() }];

  writeCampaignContent(next);
  return readCampaignContent(seed);
}

export function deleteCampaignContentItem(contentId, seed = []) {
  const next = readCampaignContent(seed).filter((item) => item.contentId !== contentId && item.id !== contentId);
  writeCampaignContent(next.length ? next : seed.map(normalizeContentItem));
  return readCampaignContent(seed);
}

export function readPublishingQueue(seed = []) {
  return readJsonStore(PUBLISHING_QUEUE_KEY, seed.map(normalizeQueueItem)).map(normalizeQueueItem);
}

export function writePublishingQueue(items = []) {
  writeJsonStore(PUBLISHING_QUEUE_KEY, items.map(normalizeQueueItem));
}

export function upsertPublishingQueueItem(item, seed = []) {
  const current = readPublishingQueue(seed);
  const normalized = normalizeQueueItem(item);
  const exists = current.some((candidate) => candidate.scheduleId === normalized.scheduleId || candidate.id === normalized.id);

  const next = exists
    ? current.map((candidate) =>
        candidate.scheduleId === normalized.scheduleId || candidate.id === normalized.id
          ? { ...candidate, ...normalized, updatedAt: nowIso() }
          : candidate
      )
    : [...current, { ...normalized, createdAt: nowIso(), updatedAt: nowIso() }];

  writePublishingQueue(next);
  return readPublishingQueue(seed);
}

export function deletePublishingQueueItem(scheduleId, seed = []) {
  const next = readPublishingQueue(seed).filter((item) => item.scheduleId !== scheduleId && item.id !== scheduleId);
  writePublishingQueue(next);
  return readPublishingQueue(seed);
}

export function createQueueItemFromContent(contentItem, overrides = {}) {
  const content = normalizeContentItem(contentItem);

  return normalizeQueueItem({
    contentId: content.contentId,
    title: content.title,
    channel: content.channel,
    campaign: content.campaign,
    contentType: content.type,
    preview: content.content,
    approval: content.approval,
    status: content.status === "ready" ? "ready" : "review",
    risk: content.risk,
    checklist: {
      contentApproved: content.approval === "approved" || content.status === "ready",
      assetRights: true,
      linkChecked: false,
      channelReady: true,
    },
    source: "campaign_content",
    sourceSurface: "ContentStudioPage",
    ...overrides,
  });
}

export function readMultiPlatformReadiness(seed = []) {
  return readJsonStore(MULTI_PLATFORM_READINESS_KEY, seed.map(normalizeReadinessItem)).map(normalizeReadinessItem);
}

export function writeMultiPlatformReadiness(items = []) {
  writeJsonStore(MULTI_PLATFORM_READINESS_KEY, items.map(normalizeReadinessItem));
}

export function upsertMultiPlatformReadinessItem(item, seed = []) {
  const current = readMultiPlatformReadiness(seed);
  const normalized = normalizeReadinessItem(item);
  const exists = current.some((candidate) => candidate.readinessId === normalized.readinessId || candidate.id === normalized.id);

  const next = exists
    ? current.map((candidate) =>
        candidate.readinessId === normalized.readinessId || candidate.id === normalized.id
          ? { ...candidate, ...normalized, updatedAt: nowIso() }
          : candidate
      )
    : [...current, { ...normalized, updatedAt: nowIso() }];

  writeMultiPlatformReadiness(next);
  return readMultiPlatformReadiness(seed);
}

export function buildReadinessFromContent(contentItems = [], existingReadiness = []) {
  const existingByContentPlatform = new Map(
    existingReadiness.map((item) => [`${item.contentId}:${item.platform}`, item])
  );

  return contentItems.map((content) => {
    const normalized = normalizeContentItem(content);
    const platform = normalized.channel.split("/")[0].trim() || normalized.channel;
    const key = `${normalized.contentId}:${platform}`;
    const existing = existingByContentPlatform.get(key);

    return normalizeReadinessItem({
      ...(existing || {}),
      id: existing?.id || `readiness_${normalized.contentId}_${platform.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      contentId: normalized.contentId,
      platform,
      type: normalized.type,
      status: normalized.status === "ready" ? "ready" : "needs_review",
      approval: normalized.approval,
      issue:
        normalized.status === "ready"
          ? "جاهز مبدئيًا بعد مراجعة المحتوى."
          : "المحتوى يحتاج مراجعة قبل تكييفه للقناة.",
      source: "campaign_content",
      sourceSurface: "ContentStudioPage",
    });
  });
}

export {
  CAMPAIGN_CONTENT_KEY,
  PUBLISHING_QUEUE_KEY,
  MULTI_PLATFORM_READINESS_KEY,
};
