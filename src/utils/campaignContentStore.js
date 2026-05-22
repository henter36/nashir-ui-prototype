const CAMPAIGN_CONTENT_KEY = "nashir_mock_campaign_content";
const PUBLISHING_QUEUE_KEY = "nashir_mock_publishing_queue";
const MULTI_PLATFORM_READINESS_KEY = "nashir_mock_multi_platform_readiness";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Internal-only metadata rule:
 * - contentId, sourceSurface, source, and ownership metadata are for data consistency only.
 * - Do not render them directly in the customer/user UI.
 */
function normalizeContentItem(item = {}) {
  const id = String(item.contentId || item.id || makeId("content"));

  return {
    id,
    contentId: id,
    title: item.title || "محتوى بدون عنوان",
    type: item.type || item.contentType || "محتوى",
    channel: item.channel || "عام",
    status: item.status || "draft",
    content: item.content || item.preview || "",
    campaign: item.campaign || "حملة تجريبية",
    owner: item.owner || "فريق المحتوى",
    approval: item.approval || (item.status === "ready" ? "approved" : "needs_review"),
    risk: item.risk || "medium",
    icon: item.icon,
    createdAt: item.createdAt || item.updatedAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),

    // Internal-only fields. Never display these as user-facing labels.
    source: item.source || "content_studio",
    sourceSurface: item.sourceSurface || "ContentStudioPage",
    metadata: item.metadata || {},
  };
}

function normalizeQueueItem(item = {}) {
  const scheduleId = String(item.scheduleId || item.id || makeId("schedule"));

  return {
    id: scheduleId,
    scheduleId,
    contentId: item.contentId || "",
    title: item.title || "عنصر نشر بدون عنوان",
    channel: item.channel || "عام",
    date: item.date || "",
    time: item.time || "",
    status: item.status || "draft",
    approval: item.approval || "needs_review",
    campaign: item.campaign || "حملة تجريبية",
    owner: item.owner || "فريق النشر",
    contentType: item.contentType || item.type || "منشور",
    risk: item.risk || "medium",
    preview: item.preview || item.content || "",
    checklist: {
      contentApproved: Boolean(item.checklist?.contentApproved),
      assetRights: item.checklist?.assetRights ?? true,
      linkChecked: Boolean(item.checklist?.linkChecked),
      channelReady: item.checklist?.channelReady ?? true,
    },
    createdAt: item.createdAt || item.updatedAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),

    // Internal-only fields. Never display these as user-facing labels.
    source: item.source || "publishing_queue",
    sourceSurface: item.sourceSurface || "PublishingQueuePage",
  };
}

function normalizeReadinessItem(item = {}) {
  const readinessId = String(item.readinessId || item.id || makeId("readiness"));

  return {
    id: readinessId,
    readinessId,
    contentId: item.contentId || "",
    name: item.name || item.title || item.platform || "مخرج قناة",
    platform: item.platform || item.channel || "عام",
    size: item.size || "",
    type: item.type || item.contentType || "محتوى",
    status: item.status || "needs_review",
    issue: item.issue || "يحتاج مراجعة قبل النشر.",
    approval: item.approval || "needs_review",
    updatedAt: item.updatedAt || nowIso(),

    // Internal-only fields. Never display these as user-facing labels.
    source: item.source || "multi_platform",
    sourceSurface: item.sourceSurface || "MultiPlatformPage",
  };
}

function readJsonStore(key, fallbackItems, normalizer) {
  if (typeof window === "undefined") return fallbackItems.map(normalizer);

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      writeJsonStore(key, fallbackItems.map(normalizer));
      return fallbackItems.map(normalizer);
    }

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;

    if (!Array.isArray(items)) {
      return fallbackItems.map(normalizer);
    }

    return items.map(normalizer);
  } catch {
    return fallbackItems.map(normalizer);
  }
}

function writeJsonStore(key, items) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    const currentItems = Array.isArray(parsed) ? parsed : parsed?.items;

    if (Array.isArray(currentItems) && JSON.stringify(currentItems) === JSON.stringify(items)) {
      return;
    }
  } catch {
    // Continue with a clean write if the stored payload is invalid.
  }

  const source =
    key === CAMPAIGN_CONTENT_KEY
      ? "nashir_ui_prototype_campaign_content"
      : key === PUBLISHING_QUEUE_KEY
        ? "nashir_ui_prototype_publishing_queue"
        : "nashir_ui_prototype_multi_platform_readiness";

  window.localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      source,
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
  const seedById = new Map(
    seed.map((item) => [String(item.contentId || item.id), item])
  );

  return readJsonStore(CAMPAIGN_CONTENT_KEY, seed, normalizeContentItem).map((item) => {
    const seedItem = seedById.get(String(item.contentId || item.id));

    return seedItem
      ? {
          ...item,
          icon: item.icon || seedItem.icon,
        }
      : item;
  });
}

export function writeCampaignContent(items = []) {
  writeJsonStore(CAMPAIGN_CONTENT_KEY, items.map(normalizeContentItem));
}

export function upsertCampaignContentItem(item, seed = []) {
  const current = readCampaignContent(seed);
  const normalized = normalizeContentItem({
    ...item,
    updatedAt: nowIso(),
  });

  const exists = current.some(
    (candidate) => candidate.contentId === normalized.contentId || candidate.id === normalized.id
  );

  const next = exists
    ? current.map((candidate) =>
        candidate.contentId === normalized.contentId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [...current, normalized];

  writeCampaignContent(next);
  return readCampaignContent(seed);
}

export function deleteCampaignContentItem(contentId, seed = []) {
  const next = readCampaignContent(seed).filter(
    (item) => item.contentId !== contentId && item.id !== contentId
  );

  writeCampaignContent(next.length ? next : seed.map(normalizeContentItem));
  return readCampaignContent(seed);
}

export function readPublishingQueue(seed = []) {
  return readJsonStore(PUBLISHING_QUEUE_KEY, seed, normalizeQueueItem);
}

export function writePublishingQueue(items = []) {
  writeJsonStore(PUBLISHING_QUEUE_KEY, items.map(normalizeQueueItem));
}

export function upsertPublishingQueueItem(item, seed = []) {
  const current = readPublishingQueue(seed);
  const normalized = normalizeQueueItem({
    ...item,
    updatedAt: nowIso(),
  });

  const exists = current.some(
    (candidate) => candidate.scheduleId === normalized.scheduleId || candidate.id === normalized.id
  );

  const next = exists
    ? current.map((candidate) =>
        candidate.scheduleId === normalized.scheduleId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [...current, normalized];

  writePublishingQueue(next);
  return readPublishingQueue(seed);
}

export function deletePublishingQueueItem(scheduleId, seed = []) {
  const next = readPublishingQueue(seed).filter(
    (item) => item.scheduleId !== scheduleId && item.id !== scheduleId
  );

  writePublishingQueue(next);
  return readPublishingQueue(seed);
}

export function createQueueItemFromContent(contentItem, overrides = {}) {
  const content = normalizeContentItem(contentItem);

  return normalizeQueueItem({
    contentId: content.contentId,
    title: content.title,
    channel: overrides.channel || content.channel,
    campaign: content.campaign,
    contentType: overrides.contentType || content.type,
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
  return readJsonStore(MULTI_PLATFORM_READINESS_KEY, seed, normalizeReadinessItem);
}

export function writeMultiPlatformReadiness(items = []) {
  writeJsonStore(MULTI_PLATFORM_READINESS_KEY, items.map(normalizeReadinessItem));
}

export function upsertMultiPlatformReadinessItem(item, seed = []) {
  const current = readMultiPlatformReadiness(seed);
  const normalized = normalizeReadinessItem({
    ...item,
    updatedAt: nowIso(),
  });

  const exists = current.some(
    (candidate) => candidate.readinessId === normalized.readinessId || candidate.id === normalized.id
  );

  const next = exists
    ? current.map((candidate) =>
        candidate.readinessId === normalized.readinessId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [...current, normalized];

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
      name: normalized.title,
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

/**
 * UI-safe display helpers.
 * These functions intentionally expose user-facing labels only.
 */
export function getContentStatusLabel(status) {
  const map = {
    draft: "مسودة",
    review: "قيد المراجعة",
    ready: "جاهز",
    approved: "معتمد",
    scheduled: "مجدول",
    blocked: "محظور",
    needs_review: "يحتاج مراجعة",
  };

  return map[status] || "يحتاج مراجعة";
}

export function getApprovalLabel(approval) {
  const map = {
    approved: "معتمد",
    needs_review: "يحتاج مراجعة",
    rejected: "مرفوض",
  };

  return map[approval] || "يحتاج مراجعة";
}

export function getRiskLabel(risk) {
  const map = {
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
  };

  return map[risk] || "متوسط";
}

export function toContentDisplayModel(item = {}) {
  const normalized = normalizeContentItem(item);

  return {
    id: normalized.contentId,
    title: normalized.title,
    type: normalized.type,
    channel: normalized.channel,
    statusLabel: getContentStatusLabel(normalized.status),
    approvalLabel: getApprovalLabel(normalized.approval),
    riskLabel: getRiskLabel(normalized.risk),
    content: normalized.content,
    updatedAt: normalized.updatedAt,
  };
}

export {
  CAMPAIGN_CONTENT_KEY,
  PUBLISHING_QUEUE_KEY,
  MULTI_PLATFORM_READINESS_KEY,
};
