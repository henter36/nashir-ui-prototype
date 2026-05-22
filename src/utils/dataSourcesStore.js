const DATA_SOURCES_KEY = "nashir_mock_data_sources";
const STORE_SCAN_SNAPSHOT_KEY = "nashir_mock_store_scan_snapshot";

const DEFAULT_STORE_SCAN_PRODUCTS = [
  "سيروم عناية طبيعي",
  "باقة هدايا طبيعية",
  "كريم مرطب نيفيا",
];

function nowIso() {
  return new Date().toISOString();
}

function normalizeSource(source = {}) {
  return {
    id: source.id || `source_${Date.now()}`,
    name: source.name || "مصدر جديد",
    type: source.type || "Manual",
    status: source.status || "manual",
    confidence: Number.isFinite(Number(source.confidence)) ? Number(source.confidence) : 0,
    output: source.output || "غير محدد",
    last: source.last || "لم يبدأ",
    connectionMode: source.connectionMode || "manual_url",
    sourceUrl: source.sourceUrl || "",
    owner: source.owner || "Manual Intake",
    visibility: source.visibility || "reviewer_only",
    reviewRequired: source.reviewRequired !== false,
    sensitive: Boolean(source.sensitive),
    destinations: Array.isArray(source.destinations) ? source.destinations : [],
    fields: Array.isArray(source.fields) ? source.fields : [],
    warnings: Array.isArray(source.warnings) ? source.warnings : [],
    scanLog: Array.isArray(source.scanLog) ? source.scanLog : [],
    updatedAt: source.updatedAt || nowIso(),
    sourceSurface: source.sourceSurface || "unknown",
  };
}

function readStoredPayload(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredPayload(key, payload, eventName) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(payload));
  if (eventName) window.dispatchEvent(new Event(eventName));
}

function readDataSources(seed = []) {
  const parsed = readStoredPayload(DATA_SOURCES_KEY);
  const sources = Array.isArray(parsed) ? parsed : parsed?.sources;

  if (!Array.isArray(sources) || !sources.length) {
    writeDataSources(seed);
    return seed.map(normalizeSource);
  }

  return sources.map(normalizeSource);
}

function writeDataSources(sources = []) {
  const normalized = sources.map(normalizeSource);
  writeStoredPayload(
    DATA_SOURCES_KEY,
    {
      version: 1,
      source: "nashir_ui_prototype_data_sources",
      updatedAt: nowIso(),
      sources: normalized,
    },
    "nashir-data-sources-updated"
  );
  return normalized;
}

function upsertDataSource(source, seed = []) {
  const current = readDataSources(seed);
  const nextSource = normalizeSource({ ...source, updatedAt: nowIso() });
  const exists = current.some((item) => item.id === nextSource.id);
  const next = exists
    ? current.map((item) => (item.id === nextSource.id ? nextSource : item))
    : [nextSource, ...current];
  return writeDataSources(next);
}

function deleteDataSource(sourceId, seed = []) {
  const current = readDataSources(seed);
  const next = current.filter((source) => source.id !== sourceId);
  return writeDataSources(next.length ? next : seed);
}

function detectPlatform(storeUrl = "") {
  const lower = storeUrl.toLowerCase();
  if (lower.includes("salla")) return "Salla";
  if (lower.includes("shopify")) return "Shopify";
  if (lower.includes("zid")) return "Zid";
  return "Custom / Unknown";
}

function buildStoreScanSnapshot({ storeUrl = "", previousStatus = "scan_completed" } = {}) {
  const detectedPlatform = detectPlatform(storeUrl);
  const detectedProducts = DEFAULT_STORE_SCAN_PRODUCTS;
  const detectedCategories = ["عناية وجمال", "منتجات طبيعية", "هدايا"];
  const brandKeywords = ["طبيعي", "موثوق", "تجربة", "جودة"];
  const detectedTone = ["ودية", "موثوقة", "هادئة"];
  const suggestedChannels = ["Instagram", "TikTok", "WhatsApp Business", "Email"];
  const assetsNeedingReview = ["صورة المنتج الرئيسية", "شعار المتجر", "صورة باقة الهدايا"];
  const warnings = [
    "المنتجات المستخرجة تحتاج اعتمادًا قبل استخدامها في الحملات.",
    "الأصول المكتشفة تحتاج مراجعة حقوق قبل النشر.",
    "منصة المتجر مكتشفة بشكل تقديري وليست ربطًا رسميًا.",
  ];

  return {
    id: "store_scan_snapshot",
    sourceId: "website",
    status: previousStatus,
    confidence: 86,
    message: "تم جمع منتجات وتصنيف ونبرة وقنوات مبدئية من رابط المتجر.",
    storeUrl,
    detectedPlatform,
    detectedCategories,
    detectedProducts,
    brandKeywords,
    detectedTone,
    suggestedChannels,
    assetsNeedingReview,
    warnings,
    output: `${detectedProducts.length} منتجات، ${detectedCategories.length} تصنيفات، ${assetsNeedingReview.length} أصول`,
    updatedAt: nowIso(),
    sourceSurface: "shared_data_sources_store",
  };
}

function readStoreScanSnapshot(fallback = null) {
  const parsed = readStoredPayload(STORE_SCAN_SNAPSHOT_KEY);
  return parsed && typeof parsed === "object" ? parsed : fallback;
}

function writeStoreScanSnapshot(snapshot) {
  const next = {
    ...snapshot,
    updatedAt: nowIso(),
  };
  writeStoredPayload(STORE_SCAN_SNAPSHOT_KEY, next, "nashir-store-scan-updated");
  return next;
}

function buildWebsiteDataSourceFromSnapshot(snapshot, previous = {}) {
  return normalizeSource({
    ...previous,
    id: "website",
    name: "رابط المتجر",
    type: "Website",
    status: snapshot.status === "approved" ? "scan_completed" : snapshot.status || "scan_completed",
    confidence: snapshot.confidence || 86,
    output: snapshot.output || "تم فحص المتجر",
    last: "الآن",
    connectionMode: "public_url",
    sourceUrl: snapshot.storeUrl || previous.sourceUrl || "",
    owner: "Store Setup",
    visibility: "reviewer_only",
    reviewRequired: true,
    sensitive: false,
    destinations: ["storeSetup", "productCatalog", "assetLibrary"],
    fields: ["store_url", "product_candidates", "asset_candidates", "brand_insights"],
    warnings: snapshot.warnings || ["تحتاج المنتجات المستخرجة إلى اعتماد قبل استخدامها في الحملات."],
    scanLog: [
      "تم فحص رابط المتجر.",
      "تم استخراج المنتجات والتصنيفات.",
      "تم إرسال الأصول المرشحة إلى مكتبة الأصول.",
      ...(previous.scanLog || []),
    ],
    sourceSurface: "StoreSetupPage",
  });
}

function runMockStoreScan({ storeUrl = "", seedSources = [] } = {}) {
  const currentSources = readDataSources(seedSources);
  const previousWebsite = currentSources.find((source) => source.id === "website") || {};
  const snapshot = writeStoreScanSnapshot(buildStoreScanSnapshot({ storeUrl }));
  const websiteSource = buildWebsiteDataSourceFromSnapshot(snapshot, previousWebsite);
  const sources = upsertDataSource(websiteSource, seedSources);
  return { snapshot, source: websiteSource, sources };
}

function markStoreScanPending({ storeUrl = "", seedSources = [] } = {}) {
  const currentSources = readDataSources(seedSources);
  const previousWebsite = currentSources.find((source) => source.id === "website") || {};
  const pendingSnapshot = writeStoreScanSnapshot({
    id: "store_scan_snapshot",
    sourceId: "website",
    status: "pending_scan",
    confidence: 25,
    message: "جاري فحص المتجر وجمع التصنيف والمنتجات والنبرة الأولية...",
    storeUrl,
    detectedPlatform: "",
    detectedCategories: [],
    detectedProducts: [],
    brandKeywords: [],
    detectedTone: [],
    suggestedChannels: [],
    assetsNeedingReview: [],
    warnings: [],
    output: "جاري التحليل...",
    updatedAt: nowIso(),
    sourceSurface: "StoreSetupPage",
  });
  const pendingSource = buildWebsiteDataSourceFromSnapshot(pendingSnapshot, previousWebsite);
  const sources = upsertDataSource(pendingSource, seedSources);
  return { snapshot: pendingSnapshot, source: pendingSource, sources };
}

export {
  DATA_SOURCES_KEY,
  STORE_SCAN_SNAPSHOT_KEY,
  readDataSources,
  writeDataSources,
  upsertDataSource,
  deleteDataSource,
  readStoreScanSnapshot,
  writeStoreScanSnapshot,
  runMockStoreScan,
  markStoreScanPending,
};
