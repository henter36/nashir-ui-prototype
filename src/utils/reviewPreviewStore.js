import { readCampaigns } from "./campaignAnalyticsStore.js";
import {
  readCampaignContent,
  upsertCampaignContentItem,
} from "./campaignContentStore.js";

const REVIEW_PREVIEW_KEY = "nashir_mock_review_preview_items";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readJsonStore(seed, normalizer) {
  if (typeof window === "undefined") return seed.map(normalizer);

  try {
    const raw = window.localStorage.getItem(REVIEW_PREVIEW_KEY);

    if (!raw) {
      const seeded = seed.map(normalizer);
      writeReviewPreviewItems(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;

    if (!Array.isArray(items)) return seed.map(normalizer);

    return items.map(normalizer);
  } catch {
    return seed.map(normalizer);
  }
}

function normalizeReviewStatus(status) {
  const map = {
    needs_review: "review",
    ready: "ready",
    approved: "approved",
    rejected: "rejected",
    draft: "draft",
  };

  return map[status] || status || "draft";
}

function normalizeReviewItem(item = {}) {
  const reviewItemId = String(item.reviewItemId || item.id || item.contentId || makeId("review"));

  return {
    ...item,
    id: reviewItemId,
    reviewItemId,
    contentId: item.contentId || item.id || reviewItemId,
    campaignId: item.campaignId || item.metadata?.campaignId || "",
    title: item.title || "محتوى بدون عنوان",
    type: item.type || item.contentType || "محتوى",
    channel: item.channel || "عام",
    platform: item.platform || item.channel || "عام",
    status: normalizeReviewStatus(item.status),
    risk: item.risk || "low",
    icon: item.icon,
    content: item.content || item.preview || "",
    notes: Array.isArray(item.notes) ? item.notes : ["يحتاج مراجعة قبل الاعتماد"],
    updatedAt: item.updatedAt || nowIso(),
  };
}

function mergeSeedViewFields(items, seed = []) {
  const seedById = new Map(seed.map((item) => [String(item.id || item.contentId), item]));

  return items.map((item) => {
    const seedItem = seedById.get(String(item.contentId || item.id));
    return seedItem
      ? {
          ...item,
          icon: item.icon || seedItem.icon,
          notes: item.notes?.length ? item.notes : seedItem.notes,
          platform: item.platform || seedItem.platform,
        }
      : item;
  });
}

export function readReviewPreviewItems(seed = []) {
  return mergeSeedViewFields(readJsonStore(seed, normalizeReviewItem), seed);
}

export function writeReviewPreviewItems(items = []) {
  if (typeof window === "undefined") return;

  const normalized = items.map(normalizeReviewItem);

  try {
    const raw = window.localStorage.getItem(REVIEW_PREVIEW_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const currentItems = Array.isArray(parsed) ? parsed : parsed?.items;

    if (Array.isArray(currentItems) && JSON.stringify(currentItems) === JSON.stringify(normalized)) {
      return;
    }
  } catch {
    // Invalid local payloads are replaced by the normalized payload below.
  }

  window.localStorage.setItem(
    REVIEW_PREVIEW_KEY,
    JSON.stringify({
      version: 1,
      updatedAt: nowIso(),
      items: normalized,
    })
  );
  window.dispatchEvent(new Event("nashir-review-preview-updated"));
}

export function upsertReviewPreviewItem(item, seed = []) {
  const current = readReviewPreviewItems(seed);
  const normalized = normalizeReviewItem({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.reviewItemId === normalized.reviewItemId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.reviewItemId === normalized.reviewItemId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeReviewPreviewItems(next);
  return readReviewPreviewItems(seed);
}

export function deleteReviewPreviewItem(reviewItemId, seed = []) {
  const next = readReviewPreviewItems(seed).filter(
    (item) => item.reviewItemId !== reviewItemId && item.id !== reviewItemId
  );

  writeReviewPreviewItems(next);
  return readReviewPreviewItems(seed);
}

export function deriveReviewItemsFromContent(contentItems = [], campaigns = [], reviewSeed = []) {
  const campaignByName = new Map(campaigns.map((campaign) => [campaign.name, campaign]));
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const seedById = new Map(reviewSeed.map((item) => [String(item.id || item.contentId), item]));

  return contentItems.map((content) => {
    const seedItem = seedById.get(String(content.contentId || content.id));
    const campaign =
      campaignById.get(content.campaignId) ||
      campaignByName.get(content.campaign) ||
      campaignById.get(seedItem?.campaignId);

    return normalizeReviewItem({
      ...(seedItem || {}),
      id: content.contentId || content.id,
      contentId: content.contentId || content.id,
      campaignId: campaign?.id || seedItem?.campaignId || "",
      title: content.title,
      type: content.type || content.contentType,
      channel: content.channel,
      platform: seedItem?.platform || content.channel,
      status: content.status,
      risk: content.risk || seedItem?.risk || "low",
      icon: seedItem?.icon || content.icon,
      content: content.content,
      notes: seedItem?.notes || ["مستورد للمراجعة التشغيلية"],
    });
  });
}

export function refreshReviewItemsFromSources({
  contentSeed = [],
  campaignSeed = [],
  reviewSeed = [],
} = {}) {
  const campaigns = readCampaigns(campaignSeed);
  const content = readCampaignContent(contentSeed);
  const stored = readReviewPreviewItems(reviewSeed);
  const storedByContent = new Map(stored.map((item) => [String(item.contentId || item.id), item]));
  const derived = deriveReviewItemsFromContent(content, campaigns, reviewSeed);
  const next = derived.length
    ? derived.map((item) => ({
        ...item,
        ...(storedByContent.get(String(item.contentId || item.id)) || {}),
        icon: item.icon || storedByContent.get(String(item.contentId || item.id))?.icon,
        notes: storedByContent.get(String(item.contentId || item.id))?.notes || item.notes,
      }))
    : stored;

  writeReviewPreviewItems(next);
  return readReviewPreviewItems(reviewSeed);
}

export function updateReviewContent(reviewItemId, content, seed = []) {
  const current = readReviewPreviewItems(seed);
  const item = current.find((candidate) => candidate.reviewItemId === reviewItemId || candidate.id === reviewItemId);

  if (!item) return current;

  const updated = {
    ...item,
    content,
    status: item.status === "approved" ? "review" : item.status,
  };
  const next = upsertReviewPreviewItem(updated, seed);

  upsertCampaignContentItem(
    {
      ...updated,
      id: updated.contentId,
      contentId: updated.contentId,
    },
    []
  );

  return next;
}

export function updateReviewStatus(reviewItemId, status, content, seed = []) {
  const current = readReviewPreviewItems(seed);
  const item = current.find((candidate) => candidate.reviewItemId === reviewItemId || candidate.id === reviewItemId);

  if (!item) return current;

  const updated = {
    ...item,
    status: normalizeReviewStatus(status),
    content: content ?? item.content,
  };
  const next = upsertReviewPreviewItem(updated, seed);

  upsertCampaignContentItem(
    {
      ...updated,
      id: updated.contentId,
      contentId: updated.contentId,
    },
    []
  );

  return next;
}

export function getReviewStatusLabel(status) {
  const map = {
    draft: "مسودة",
    review: "تحتاج مراجعة",
    ready: "جاهز للمراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
  };

  return map[status] || "مسودة";
}

export { REVIEW_PREVIEW_KEY };
