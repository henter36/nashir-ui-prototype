const CAMPAIGNS_KEY = "nashir_mock_campaigns";
const CAMPAIGN_METRICS_KEY = "nashir_mock_campaign_metrics";
const DASHBOARD_SUMMARY_KEY = "nashir_mock_dashboard_summary";

const DEFAULT_CAMPAIGNS = [
  {
    id: "cmp-001",
    name: "إطلاق مجموعة الصيف",
    goal: "Launch",
    product: "عطر أرابيان أود",
    status: "active",
    stage: "مراجعة المحتوى",
    readiness: 84,
    channels: ["Instagram", "TikTok", "WhatsApp"],
    budget: "5,000 SAR",
    updatedAt: "منذ ساعتين",
    owner: "أحمد",
    period: "10 مارس → 15 مارس",
    performance: { reach: "38K", conversions: "124", roi: "2.4x", cpa: "18 SAR" },
  },
  {
    id: "cmp-002",
    name: "عودة إلى المدرسة",
    goal: "Sales",
    product: "حذاء رياضي نايك",
    status: "review",
    stage: "بانتظار الاعتماد",
    readiness: 68,
    channels: ["Snapchat", "Instagram"],
    budget: "3,500 SAR",
    updatedAt: "منذ 5 ساعات",
    owner: "سارة",
    period: "01 أغسطس → 10 أغسطس",
    performance: { reach: "21K", conversions: "86", roi: "1.8x", cpa: "24 SAR" },
  },
  {
    id: "cmp-003",
    name: "عرض نهاية الأسبوع",
    goal: "Retention",
    product: "كريم مرطب نيفيا",
    status: "draft",
    stage: "استكمال البيانات",
    readiness: 46,
    channels: ["WhatsApp", "Email"],
    budget: "1,200 SAR",
    updatedAt: "منذ يوم",
    owner: "محمد",
    period: "الخميس → السبت",
    performance: { reach: "12K", conversions: "44", roi: "1.2x", cpa: "31 SAR" },
  },
  {
    id: "cmp-004",
    name: "خصومات العيد",
    goal: "Awareness",
    product: "ساعة كاسيو",
    status: "approved",
    stage: "جاهزة للنشر اليدوي",
    readiness: 92,
    channels: ["Instagram", "Twitter(X)", "Email"],
    budget: "7,000 SAR",
    updatedAt: "منذ يومين",
    owner: "أحمد",
    period: "عيد الأضحى",
    performance: { reach: "46K", conversions: "168", roi: "3.1x", cpa: "15 SAR" },
  },
];

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const text = String(value).replace(/,/g, "").trim().toLowerCase();
  const number = Number.parseFloat(text);

  if (!Number.isFinite(number)) return 0;
  if (text.includes("k")) return Math.round(number * 1000);
  return number;
}

function parseBudget(value) {
  return toNumber(String(value || "").replace(/[^\d.]/g, ""));
}

function readJsonStore(key, seed, normalizer) {
  if (typeof window === "undefined") return seed.map(normalizer);

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      const seeded = seed.map(normalizer);
      writeJsonStore(key, seeded);
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
    // Replace invalid local payloads with the normalized payload below.
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      updatedAt: nowIso(),
      items,
    })
  );

  const eventName =
    key === CAMPAIGNS_KEY
      ? "nashir-campaigns-updated"
      : key === CAMPAIGN_METRICS_KEY
        ? "nashir-campaign-metrics-updated"
        : "nashir-dashboard-summary-updated";

  window.dispatchEvent(new Event(eventName));
}

function normalizeStatus(status) {
  const map = {
    نشطة: "active",
    "تحتاج مراجعة": "review",
    مسودة: "draft",
    معتمدة: "approved",
  };

  return map[status] || status || "draft";
}

function normalizeCampaign(item = {}) {
  const campaignId = String(item.campaignId || item.id || makeId("campaign"));
  const status = normalizeStatus(item.status);
  const performance = item.performance || {};

  return {
    ...item,
    id: campaignId,
    campaignId,
    name: item.name || "حملة بدون اسم",
    goal: item.goal || "Awareness",
    product: item.product || "منتج غير محدد",
    status,
    stage: item.stage || getCampaignStatusLabel(status),
    readiness: Number(item.readiness ?? 0),
    channels: Array.isArray(item.channels) ? item.channels : item.channel ? [item.channel] : [],
    channel: item.channel || (Array.isArray(item.channels) ? item.channels[0] : ""),
    budget: item.budget || "0 SAR",
    updatedAt: item.updatedAt || item.updated || "الآن",
    owner: item.owner || "الفريق",
    period: item.period || "",
    tone: item.tone || getCampaignTone(status),
    performance: {
      reach: performance.reach || item.reach || "0",
      conversions: performance.conversions || item.conversions || "0",
      roi: performance.roi || item.roi || "0x",
      cpa: performance.cpa || item.cpa || "0 SAR",
    },
    outputs: Array.isArray(item.outputs) ? item.outputs : [],
    edits: Array.isArray(item.edits) ? item.edits : [],
    createdAt: item.createdAt || nowIso(),
    updatedAtIso: item.updatedAtIso || nowIso(),
  };
}

function normalizeMetric(item = {}) {
  const metricId = String(item.metricId || item.id || item.campaignId || makeId("metric"));
  const campaignId = String(item.campaignId || item.id || metricId);
  const spend = Number(item.spend ?? parseBudget(item.budget));
  const reach = Number(item.reach ?? toNumber(item.performance?.reach));
  const clicks = Number(item.clicks ?? Math.round(reach * 0.075));
  const conversions = Number(item.conversions ?? toNumber(item.performance?.conversions));
  const revenue = Number(item.revenue ?? Math.round(spend * toNumber(item.performance?.roi || item.roi)));
  const roi = Number(item.roi ?? (spend ? revenue / spend : toNumber(item.performance?.roi)));
  const cpa = Number(item.cpa ?? (conversions ? spend / conversions : toNumber(item.performance?.cpa)));

  return {
    id: metricId,
    metricId,
    campaignId,
    name: item.name || "حملة بدون اسم",
    channel: item.channel || (Array.isArray(item.channels) ? item.channels[0] : "غير محدد"),
    spend,
    reach,
    clicks,
    conversions,
    revenue,
    roi: Number.isFinite(roi) ? Number(roi.toFixed(2)) : 0,
    cpa: Number.isFinite(cpa) ? Math.round(cpa) : 0,
    trend: item.trend || (roi >= 2 ? "+12%" : "-3%"),
    status: item.status || deriveMetricStatus({ roi, cpa }),
    createdAt: item.createdAt || nowIso(),
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeSummary(item = {}) {
  const summaryId = String(item.summaryId || item.id || "dashboard_summary");

  return {
    id: summaryId,
    summaryId,
    activeCampaigns: Number(item.activeCampaigns || 0),
    reviewCampaigns: Number(item.reviewCampaigns || 0),
    draftCampaigns: Number(item.draftCampaigns || 0),
    approvedCampaigns: Number(item.approvedCampaigns || 0),
    totalCampaigns: Number(item.totalCampaigns || 0),
    avgReadiness: Number(item.avgReadiness || 0),
    reach: Number(item.reach || 0),
    conversions: Number(item.conversions || 0),
    revenue: Number(item.revenue || 0),
    spend: Number(item.spend || 0),
    roi: Number(item.roi || 0),
    cpa: Number(item.cpa || 0),
    topChannel: item.topChannel || "غير محدد",
    updatedAt: item.updatedAt || nowIso(),
  };
}

function getCampaignTone(status) {
  const map = {
    active: "green",
    review: "amber",
    draft: "slate",
    approved: "blue",
  };

  return map[status] || "slate";
}

function deriveMetricStatus(metric = {}) {
  if (Number(metric.roi || 0) >= 2.2) return "strong";
  if (Number(metric.roi || 0) >= 1.5) return "good";
  return "weak";
}

export function readCampaigns(seed = DEFAULT_CAMPAIGNS) {
  return readJsonStore(CAMPAIGNS_KEY, seed, normalizeCampaign);
}

export function writeCampaigns(items = []) {
  writeJsonStore(CAMPAIGNS_KEY, items.map(normalizeCampaign));
}

export function upsertCampaign(item, seed = DEFAULT_CAMPAIGNS) {
  const current = readCampaigns(seed);
  const normalized = normalizeCampaign({ ...item, updatedAtIso: nowIso() });
  const next = current.some((candidate) => candidate.campaignId === normalized.campaignId || candidate.id === normalized.id)
    ? current.map((candidate) =>
        candidate.campaignId === normalized.campaignId || candidate.id === normalized.id
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeCampaigns(next);
  return readCampaigns(seed);
}

export function deleteCampaign(campaignId, seed = DEFAULT_CAMPAIGNS) {
  const next = readCampaigns(seed).filter(
    (item) => item.campaignId !== campaignId && item.id !== campaignId
  );

  writeCampaigns(next);
  return readCampaigns(seed);
}

export function readCampaignMetrics(seed = []) {
  const fallback = seed.length ? seed : deriveMetricsFromCampaigns(readCampaigns());
  return readJsonStore(CAMPAIGN_METRICS_KEY, fallback, normalizeMetric);
}

export function writeCampaignMetrics(items = []) {
  writeJsonStore(CAMPAIGN_METRICS_KEY, items.map(normalizeMetric));
}

export function upsertCampaignMetric(item, seed = []) {
  const current = readCampaignMetrics(seed);
  const normalized = normalizeMetric({ ...item, updatedAt: nowIso() });
  const next = current.some((candidate) => candidate.metricId === normalized.metricId || candidate.campaignId === normalized.campaignId)
    ? current.map((candidate) =>
        candidate.metricId === normalized.metricId || candidate.campaignId === normalized.campaignId
          ? { ...candidate, ...normalized }
          : candidate
      )
    : [normalized, ...current];

  writeCampaignMetrics(next);
  return readCampaignMetrics(seed);
}

export function deleteCampaignMetric(metricId, seed = []) {
  const next = readCampaignMetrics(seed).filter(
    (item) => item.metricId !== metricId && item.id !== metricId && item.campaignId !== metricId
  );

  writeCampaignMetrics(next);
  return readCampaignMetrics(seed);
}

export function deriveMetricsFromCampaigns(campaigns = []) {
  return campaigns.map((campaign) => normalizeMetric(normalizeCampaign(campaign)));
}

export function readDashboardSummary(seed = []) {
  const fallback = seed.length ? seed : [deriveDashboardSummary(readCampaigns(), readCampaignMetrics())];
  return readJsonStore(DASHBOARD_SUMMARY_KEY, fallback, normalizeSummary);
}

export function writeDashboardSummary(summary) {
  const items = Array.isArray(summary) ? summary : [summary];
  writeJsonStore(DASHBOARD_SUMMARY_KEY, items.map(normalizeSummary));
}

export function deriveDashboardSummary(campaigns = [], metrics = []) {
  const normalizedCampaigns = campaigns.map(normalizeCampaign);
  const normalizedMetrics = metrics.map(normalizeMetric);
  const spend = normalizedMetrics.reduce((sum, metric) => sum + metric.spend, 0);
  const revenue = normalizedMetrics.reduce((sum, metric) => sum + metric.revenue, 0);
  const reach = normalizedMetrics.reduce((sum, metric) => sum + metric.reach, 0);
  const conversions = normalizedMetrics.reduce((sum, metric) => sum + metric.conversions, 0);
  const channelTotals = normalizedMetrics.reduce((acc, metric) => {
    acc[metric.channel] = (acc[metric.channel] || 0) + metric.revenue;
    return acc;
  }, {});
  const topChannel =
    Object.entries(channelTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "غير محدد";

  return normalizeSummary({
    id: "dashboard_summary",
    totalCampaigns: normalizedCampaigns.length,
    activeCampaigns: normalizedCampaigns.filter((campaign) => campaign.status === "active").length,
    reviewCampaigns: normalizedCampaigns.filter((campaign) => campaign.status === "review").length,
    draftCampaigns: normalizedCampaigns.filter((campaign) => campaign.status === "draft").length,
    approvedCampaigns: normalizedCampaigns.filter((campaign) => campaign.status === "approved").length,
    avgReadiness: normalizedCampaigns.length
      ? Math.round(normalizedCampaigns.reduce((sum, campaign) => sum + campaign.readiness, 0) / normalizedCampaigns.length)
      : 0,
    reach,
    conversions,
    revenue,
    spend,
    roi: spend ? Number((revenue / spend).toFixed(1)) : 0,
    cpa: conversions ? Math.round(spend / conversions) : 0,
    topChannel,
  });
}

export function refreshDashboardSummary(campaignSeed = DEFAULT_CAMPAIGNS, metricSeed = []) {
  const campaigns = readCampaigns(campaignSeed);
  const metrics = readCampaignMetrics(metricSeed.length ? metricSeed : deriveMetricsFromCampaigns(campaigns));
  const summary = deriveDashboardSummary(campaigns, metrics);
  writeDashboardSummary(summary);
  return summary;
}

export function getDashboardSnapshot() {
  const campaigns = readCampaigns();
  const metrics = readCampaignMetrics(deriveMetricsFromCampaigns(campaigns));
  const summary = refreshDashboardSummary(campaigns, metrics);

  return {
    campaigns,
    metrics,
    summary,
    recentCampaigns: campaigns.slice(0, 4),
    topMetrics: metrics.slice(0, 4),
  };
}

export function getCampaignStatusLabel(status) {
  const map = {
    active: "نشطة",
    review: "تحتاج مراجعة",
    draft: "مسودة",
    approved: "معتمدة",
  };

  return map[status] || status || "مسودة";
}

export function getMetricStatusLabel(status) {
  const map = {
    strong: "قوي",
    good: "جيد",
    weak: "يحتاج تحسين",
    watch: "مراقبة",
  };

  return map[status] || status || "جيد";
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export { CAMPAIGNS_KEY, CAMPAIGN_METRICS_KEY, DASHBOARD_SUMMARY_KEY };
