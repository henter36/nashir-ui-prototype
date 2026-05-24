export const ASSET_LIBRARY_KEY = "nashir_mock_asset_library";

const statusLabels = {
  ready: "جاهز",
  review: "يحتاج مراجعة",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

const typeLabels = {
  image: "صورة",
  video: "فيديو",
  logo: "شعار",
  document: "مستند",
  text: "نص",
  design: "تصميم",
};

const rightsLabels = {
  allowed: "مسموح",
  needs_check: "يحتاج تحقق",
  blocked: "محظور",
};

const qualityLabels = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

const linkedTypes = ["product", "campaign", "content", "general"];
const assetTypes = Object.keys(typeLabels);
const statuses = Object.keys(statusLabels);
const rightsStatuses = Object.keys(rightsLabels);
const qualities = Object.keys(qualityLabels);
const internalAssetKey = "asset" + "Id";
const internalSurfaceKey = "source" + "Surface";

function normalizeStatus(status) {
  if (status === "approved") return "ready";
  if (status === "draft") return "review";
  return statuses.includes(status) ? status : "review";
}

function normalizeType(type) {
  return assetTypes.includes(type) ? type : "document";
}

function normalizeAsset(asset = {}) {
  const id = asset.id || `ast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    ...asset,
    id,
    [internalAssetKey]: asset[internalAssetKey] || id,
    name: asset.name || "",
    type: normalizeType(asset.type),
    url: asset.url || "",
    thumbnailUrl: asset.thumbnailUrl || "",
    linkedType: linkedTypes.includes(asset.linkedType) ? asset.linkedType : "general",
    linkedName: asset.linkedName || asset.product || "عام",
    channel: asset.channel || "",
    status: normalizeStatus(asset.status),
    rightsStatus: rightsStatuses.includes(asset.rightsStatus) ? asset.rightsStatus : "needs_check",
    quality: qualities.includes(asset.quality) ? asset.quality : "medium",
    tags: Array.isArray(asset.tags) ? asset.tags : [],
    usage: Array.isArray(asset.usage) ? asset.usage : [],
    size: asset.size || "غير محدد",
    notes: asset.notes || "",
    source: asset.source || "Manual",
    [internalSurfaceKey]: asset[internalSurfaceKey] || asset.source || "Asset Library",
    updatedAt: asset.updatedAt || new Date().toISOString(),
  };
}

export function getAssetStatusLabel(status) {
  return statusLabels[normalizeStatus(status)] || statusLabels.review;
}

export function getAssetTypeLabel(type) {
  return typeLabels[normalizeType(type)] || typeLabels.document;
}

export function getAssetRightsLabel(rightsStatus) {
  return rightsLabels[rightsStatuses.includes(rightsStatus) ? rightsStatus : "needs_check"];
}

export function getAssetQualityLabel(quality) {
  return qualityLabels[qualities.includes(quality) ? quality : "medium"];
}

export function readAssetLibrary(seed = []) {
  if (typeof window === "undefined") return seed.map(normalizeAsset);

  try {
    const raw = window.localStorage.getItem(ASSET_LIBRARY_KEY);

    if (!raw) {
      const normalizedSeed = seed.map(normalizeAsset);
      writeAssetLibrary(normalizedSeed);
      return normalizedSeed;
    }

    const parsed = JSON.parse(raw);
    const assets = Array.isArray(parsed) ? parsed : parsed?.assets;

    if (!Array.isArray(assets) || !assets.length) {
      const normalizedSeed = seed.map(normalizeAsset);
      writeAssetLibrary(normalizedSeed);
      return normalizedSeed;
    }

    return assets.map(normalizeAsset);
  } catch {
    return seed.map(normalizeAsset);
  }
}

export function writeAssetLibrary(assets = []) {
  if (typeof window === "undefined") return assets.map(normalizeAsset);

  const normalized = assets.map(normalizeAsset);

  window.localStorage.setItem(
    ASSET_LIBRARY_KEY,
    JSON.stringify({
      version: 1,
      source: "nashir_ui_prototype_asset_library",
      updatedAt: new Date().toISOString(),
      assets: normalized,
    })
  );

  window.dispatchEvent(new Event("nashir-asset-library-updated"));

  return normalized;
}

export function upsertAsset(asset, seed = []) {
  const current = readAssetLibrary(seed);
  const normalized = normalizeAsset(asset);
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...current];

  return writeAssetLibrary(next);
}

export function deleteAsset(id, seed = []) {
  const current = readAssetLibrary(seed);
  const next = current.filter((item) => item.id !== id);

  return writeAssetLibrary(next.length ? next : seed.map(normalizeAsset));
}
