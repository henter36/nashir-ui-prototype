import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CircleAlert,
  DollarSign,
  FileText,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  MessageCircle,
  PlayCircle,
  RefreshCw,
  Save,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { getModelRoutingSummary } from "../utils/modelCostStore.js";
import { getWorkspaceTeamSummary } from "../utils/teamAccessStore.js";

const INTEGRATION_CONNECTIONS_KEY = "nashir_mock_integration_connections";

const OAUTH_PROVIDERS = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    description: "ربط حساب Instagram لاستخدامه في تجهيز المحتوى والرؤى لاحقًا.",
    authUrl: "https://www.instagram.com/accounts/login/",
    scopes: ["profile", "content_read_later", "insights_later"],
    owner: "Marketing",
    icon: Globe2,
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    description: "ربط TikTok لتجهيز فيديوهات قصيرة ومراجعة جاهزية القناة.",
    authUrl: "https://www.tiktok.com/login",
    scopes: ["profile", "video_read_later", "content_planning"],
    owner: "Content",
    icon: PlayCircle,
  },
  snapchat: {
    id: "snapchat",
    name: "Snapchat",
    description: "ربط Snapchat كقناة مستقبلية للحملات والرسائل القصيرة.",
    authUrl: "https://accounts.snapchat.com/",
    scopes: ["profile", "ads_later"],
    owner: "Marketing",
    icon: Sparkles,
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "ربط WhatsApp Business لاستخدامه لاحقًا في حملات الرسائل.",
    authUrl: "https://business.facebook.com/",
    scopes: ["business_profile", "message_templates_later"],
    owner: "Sales",
    icon: MessageCircle,
  },
  email: {
    id: "email",
    name: "Email",
    description: "ربط البريد/مزود الرسائل لاستخدامه في الحملات البريدية لاحقًا.",
    authUrl: "https://accounts.google.com/",
    scopes: ["sender_profile", "drafts_later"],
    owner: "CRM",
    icon: Mail,
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    description: "ربط قناة YouTube لتجهيز المحتوى المرئي لاحقًا.",
    authUrl: "https://accounts.google.com/",
    scopes: ["channel_profile", "video_planning"],
    owner: "Content",
    icon: PlayCircle,
  },
  google_ads: {
    id: "google_ads",
    name: "Google Ads",
    description: "ربط Google Ads لاحقًا للقراءة والتحليلات وليس للنشر التلقائي.",
    authUrl: "https://accounts.google.com/",
    scopes: ["ads_profile_later", "reporting_later"],
    owner: "Ads",
    icon: Globe2,
  },
  meta_ads: {
    id: "meta_ads",
    name: "Meta Ads",
    description: "ربط Meta Ads لاحقًا للقراءة والتحليلات وليس للنشر التلقائي.",
    authUrl: "https://business.facebook.com/",
    scopes: ["ads_profile_later", "reporting_later"],
    owner: "Ads",
    icon: Globe2,
  },
  salla: {
    id: "salla",
    name: "Salla",
    description: "ربط المتجر لاحقًا لجلب المنتجات وبيانات التجارة بطريقة آمنة.",
    authUrl: "https://s.salla.sa/",
    scopes: ["store_profile", "products_read_later"],
    owner: "Store",
    icon: Store,
  },
};

const DEFAULT_WORKSPACE = {
  workspaceName: "ناشر",
  ownerName: "أحمد السعيد",
  defaultMarket: "السعودية",
  businessMode: "متجر إلكتروني",
};

const DEFAULT_AI_SETTINGS = {
  textProvider: "OpenAI",
  imageProvider: "غير محدد",
  videoProvider: "غير محدد",
  maxMonthlyBudget: "250",
  requireHumanReview: true,
  allowAutoGeneration: true,
  requireFallbackModel: true,
  redactCustomerData: true,
};

const DEFAULT_GOVERNANCE = {
  blockAutoPublish: true,
  requireApprovalBeforeSend: true,
  keepReviewLog: true,
  riskLevel: "متوسط",
  requireClaimsReview: true,
  requireAssetRightsReview: true,
  requirePromptVersioning: true,
};

const DEFAULT_OUTPUT_SETTINGS = {
  defaultLanguage: "العربية",
  defaultTone: "ودية",
  textLength: "متوسط",
  includeHashtags: true,
  includeCTA: true,
  generateVariants: true,
  requireCustomerSafeSummary: true,
};

const providerOptions = [
  "غير محدد",
  "OpenAI",
  "Anthropic",
  "Google",
  "Runway",
  "Replicate",
  "مزود داخلي لاحقًا",
];

const toneOptions = ["ودية", "رسمية", "فاخرة", "شبابية", "عملية", "جريئة", "هادئة"];
const languageOptions = ["العربية", "الإنجليزية", "العربية والإنجليزية"];
const riskLevels = ["منخفض", "متوسط", "مرتفع"];

const TABS = [
  ["overview", "نظرة عامة"],
  ["workspace", "مساحة العمل"],
  ["channels", "القنوات"],
  ["ai", "الذكاء الاصطناعي والتكلفة"],
  ["governance", "الحوكمة"],
  ["outputs", "المخرجات"],
  ["audit", "سجل الإعدادات"],
];

function safeNormalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace("whatsapp business", "whatsapp")
    .replace("googleads", "google_ads")
    .replace("metaads", "meta_ads")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getProviderKey(channel) {
  return safeNormalize(channel.providerId || channel.id || channel.name || channel);
}

function normalizeConnectionStatus(value) {
  const raw = typeof value === "string" ? value : value?.status || value?.mode || "";

  if (["connected", "connected_mock", "approved", "linked"].includes(raw)) {
    return "connected";
  }

  if (["pending", "pending_oauth", "pending_connection", "waiting"].includes(raw)) {
    return "pending_oauth";
  }

  if (["failed", "error"].includes(raw)) {
    return "failed";
  }

  return "disconnected";
}

function readSharedIntegrationConnections() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(INTEGRATION_CONNECTIONS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.reduce((acc, item) => {
        const key = getProviderKey(item);
        if (!key) return acc;
        acc[key] = item;
        return acc;
      }, {});
    }

    if (parsed?.connections && typeof parsed.connections === "object") {
      return Object.entries(parsed.connections).reduce((acc, [key, value]) => {
        const normalizedKey = safeNormalize(key);
        acc[normalizedKey] =
          value && typeof value === "object"
            ? {
                ...value,
                providerId: value.providerId || normalizedKey,
                status: normalizeConnectionStatus(value),
                updatedAt: value.updatedAt || parsed.updatedAt || "حالة محفوظة",
              }
            : {
                providerId: normalizedKey,
                status: normalizeConnectionStatus(value),
                updatedAt: parsed.updatedAt || "حالة محفوظة",
              };
        return acc;
      }, {});
    }

    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).reduce((acc, [key, value]) => {
        if (["version", "source", "updatedAt", "preferredChannels", "connections"].includes(key)) {
          return acc;
        }

        const normalizedKey = safeNormalize(key);
        acc[normalizedKey] =
          value && typeof value === "object"
            ? {
                ...value,
                providerId: value.providerId || normalizedKey,
                status: normalizeConnectionStatus(value),
              }
            : {
                providerId: normalizedKey,
                status: normalizeConnectionStatus(value),
              };

        return acc;
      }, {});
    }

    return {};
  } catch {
    return {};
  }
}

function writeSharedIntegrationConnections(nextConnections) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    INTEGRATION_CONNECTIONS_KEY,
    JSON.stringify({
      version: 1,
      source: "nashir_ui_prototype_shared_oauth_mock",
      updatedAt: new Date().toISOString(),
      connections: nextConnections,
    })
  );

  window.dispatchEvent(new Event("nashir-integration-connections-updated"));
}

function buildDefaultChannels(sharedConnections = {}) {
  return Object.values(OAUTH_PROVIDERS).map((provider) => {
    const existing = sharedConnections[provider.id] || {};
    const status = normalizeConnectionStatus(existing);

    return {
      ...provider,
      enabled: status !== "disconnected" || ["instagram", "whatsapp", "email"].includes(provider.id),
      status,
      accountName: existing.accountName || "",
      authorizationUrl: existing.authorizationUrl || provider.authUrl,
      requestedScopes: existing.requestedScopes || provider.scopes,
      updatedAt: existing.updatedAt || "",
      sourceSurface: existing.sourceSurface || "",
      lastAction: existing.lastAction || "",
      fromSharedConnection: Boolean(sharedConnections[provider.id]),
    };
  });
}

function applySharedConnections(channels, sharedConnections = {}) {
  return channels.map((channel) => {
    const key = getProviderKey(channel);
    const shared = sharedConnections[key] || {};
    const provider = OAUTH_PROVIDERS[key] || channel;
    const status = normalizeConnectionStatus(shared);

    return {
      ...channel,
      ...provider,
      enabled: channel.enabled || status !== "disconnected",
      status,
      accountName: shared.accountName || "",
      authorizationUrl: shared.authorizationUrl || provider.authUrl || channel.authorizationUrl,
      requestedScopes: shared.requestedScopes || provider.scopes || channel.requestedScopes || [],
      updatedAt: shared.updatedAt || "",
      sourceSurface: shared.sourceSurface || "",
      lastAction: shared.lastAction || "",
      fromSharedConnection: Boolean(sharedConnections[key]),
    };
  });
}

function buildWarnings({ channels, aiSettings, governance, outputSettings, workspace, sharedConnections }) {
  const warnings = [];

  if (!workspace.workspaceName.trim()) {
    warnings.push({
      id: "workspace_name_missing",
      tone: "red",
      title: "اسم مساحة العمل فارغ",
      message: "غياب اسم مساحة العمل يضعف وضوح الإعدادات والتقارير.",
    });
  }

  if (!workspace.ownerName.trim()) {
    warnings.push({
      id: "owner_missing",
      tone: "amber",
      title: "مالك الإعدادات غير محدد",
      message: "يجب وجود مسؤول واضح عن تغيير الإعدادات قبل التنفيذ الحقيقي.",
    });
  }

  if (!channels.some((channel) => channel.enabled)) {
    warnings.push({
      id: "no_channels",
      tone: "red",
      title: "لا توجد قناة مفعلة",
      message: "لن تكون مخرجات الحملة ذات معنى تشغيلي إذا لم توجد قناة مستهدفة.",
    });
  }

  if (channels.some((channel) => channel.status === "pending_oauth")) {
    warnings.push({
      id: "pending_oauth",
      tone: "amber",
      title: "يوجد ربط OAuth بانتظار الإكمال",
      message: "القنوات التي بدأت الربط ولم تكمله لا يجب اعتبارها جاهزة للنشر.",
    });
  }

  if (channels.some((channel) => channel.status === "connected")) {
    warnings.push({
      id: "mock_connections",
      tone: "amber",
      title: "يوجد ربط OAuth Mock",
      message: "الربط الظاهر للتجربة فقط. التنفيذ الحقيقي يحتاج Backend يحفظ Tokens مشفرة.",
    });
  }

  const sharedConnectionCount = Object.keys(sharedConnections || {}).length;
  const reflectedCount = channels.filter((channel) => channel.fromSharedConnection).length;

  if (sharedConnectionCount > 0 && reflectedCount === 0) {
    warnings.push({
      id: "shared_connections_not_reflected",
      tone: "amber",
      title: "حالة الربط لا تظهر في القنوات",
      message: "راجع مفاتيح القنوات حتى تطابق Provider IDs المعتمدة.",
    });
  }

  const monthlyBudget = Number(aiSettings.maxMonthlyBudget);

  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
    warnings.push({
      id: "bad_budget",
      tone: "red",
      title: "حد التكلفة غير صالح",
      message: "يجب أن يكون حد التكلفة رقمًا موجبًا حتى لا يصبح التحكم المالي شكليًا.",
    });
  }

  if (monthlyBudget > 1000) {
    warnings.push({
      id: "high_budget",
      tone: "amber",
      title: "حد التكلفة مرتفع",
      message: "ارفع السقف لاحقًا فقط بعد وجود مراقبة تكلفة وتنبيهات واعتمادات.",
    });
  }

  if (aiSettings.allowAutoGeneration && !aiSettings.requireHumanReview) {
    warnings.push({
      id: "generation_without_review",
      tone: "red",
      title: "توليد بلا مراجعة بشرية",
      message: "هذا يخلق خطر مخرجات غير دقيقة أو مخالفة قبل الاعتماد.",
    });
  }

  if (aiSettings.textProvider === "غير محدد") {
    warnings.push({
      id: "text_provider_missing",
      tone: "amber",
      title: "مزود النصوص غير محدد",
      message: "اختيار مزود النصوص ضروري لاحقًا لتوجيه النماذج والتكلفة.",
    });
  }

  if (!aiSettings.requireFallbackModel) {
    warnings.push({
      id: "fallback_disabled",
      tone: "amber",
      title: "Fallback غير مفعل",
      message: "تعطيل النموذج البديل قد يسبب توقفًا كاملًا عند فشل المزود الأساسي.",
    });
  }

  if (!aiSettings.redactCustomerData) {
    warnings.push({
      id: "redaction_disabled",
      tone: "red",
      title: "إخفاء بيانات العملاء غير مفعل",
      message: "لا يجوز استخدام بيانات عملاء حساسة في المطالبات دون ضوابط واضحة.",
    });
  }

  if (!governance.blockAutoPublish) {
    warnings.push({
      id: "auto_publish_not_blocked",
      tone: "red",
      title: "النشر التلقائي غير محظور",
      message: "هذا مخالف لاتجاه البروتوتايب الحالي: لا نشر تلقائي ولا إرسال حقيقي.",
    });
  }

  if (!governance.requireApprovalBeforeSend) {
    warnings.push({
      id: "approval_disabled",
      tone: "red",
      title: "الإرسال بلا اعتماد",
      message: "أي قناة خارجية يجب أن تمر باعتماد واضح قبل التنفيذ الحقيقي.",
    });
  }

  if (!governance.keepReviewLog) {
    warnings.push({
      id: "review_log_disabled",
      tone: "amber",
      title: "سجل المراجعة غير مفعل",
      message: "غياب سجل المراجعة سيضعف المساءلة والتتبع.",
    });
  }

  if (!governance.requireClaimsReview) {
    warnings.push({
      id: "claims_review_disabled",
      tone: "red",
      title: "مراجعة الادعاءات غير مفعلة",
      message: "المحتوى التسويقي قد يتضمن وعودًا أو ادعاءات تحتاج تحققًا قبل النشر.",
    });
  }

  if (!governance.requireAssetRightsReview) {
    warnings.push({
      id: "asset_rights_review_disabled",
      tone: "amber",
      title: "مراجعة حقوق الأصول غير مفعلة",
      message: "استخدام الصور أو الفيديوهات دون تحقق حقوقي خطر تشغيلي وسمعة.",
    });
  }

  if (!governance.requirePromptVersioning) {
    warnings.push({
      id: "prompt_versioning_disabled",
      tone: "amber",
      title: "إصدارات المطالبات غير مفعلة",
      message: "بدون versioning لن نستطيع معرفة أي مطالبة أنتجت أي مخرج.",
    });
  }

  if (!outputSettings.requireCustomerSafeSummary) {
    warnings.push({
      id: "customer_summary_disabled",
      tone: "amber",
      title: "ملخص العميل الآمن غير مفعل",
      message: "يجب فصل المطالبة الداخلية عن النص المرئي للعميل.",
    });
  }

  return warnings;
}

function calculateScore(warnings) {
  const red = warnings.filter((warning) => warning.tone === "red").length;
  const amber = warnings.filter((warning) => warning.tone === "amber").length;
  return Math.max(0, Math.min(100, 100 - red * 18 - amber * 8));
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sharedConnections, setSharedConnections] = useState(() => readSharedIntegrationConnections());
  const [channels, setChannels] = useState(() =>
    buildDefaultChannels(readSharedIntegrationConnections())
  );
  const [modelRoutingSummary, setModelRoutingSummary] = useState(() => getModelRoutingSummary());
  const [workspaceTeamSummary, setWorkspaceTeamSummary] = useState(() => getWorkspaceTeamSummary());
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [auditLog, setAuditLog] = useState([
    {
      id: "audit-001",
      event: "تحميل الإعدادات الافتراضية",
      actor: "Prototype",
      time: "الآن",
      severity: "info",
    },
  ]);

  const [workspace, setWorkspace] = useState(DEFAULT_WORKSPACE);
  const [aiSettings, setAiSettings] = useState(DEFAULT_AI_SETTINGS);
  const [governance, setGovernance] = useState(DEFAULT_GOVERNANCE);
  const [outputSettings, setOutputSettings] = useState(DEFAULT_OUTPUT_SETTINGS);

  const refreshSharedConnections = () => {
    const latest = readSharedIntegrationConnections();
    setSharedConnections(latest);
    setChannels((prev) => applySharedConnections(prev, latest));
  };

  useEffect(() => {
    refreshSharedConnections();

    const handleRefresh = () => refreshSharedConnections();
    const handleVisibility = () => {
      if (!document.hidden) refreshSharedConnections();
    };
    const handleStorage = (event) => {
      if (!event.key || event.key === INTEGRATION_CONNECTIONS_KEY) {
        refreshSharedConnections();
      }
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("nashir-integration-connections-updated", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("nashir-integration-connections-updated", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const refreshWorkspaceTeamSummary = () => {
      setWorkspaceTeamSummary(getWorkspaceTeamSummary());
    };

    window.addEventListener("focus", refreshWorkspaceTeamSummary);
    window.addEventListener("storage", refreshWorkspaceTeamSummary);
    window.addEventListener("nashir-workspace-members-updated", refreshWorkspaceTeamSummary);
    window.addEventListener("nashir-workspace-roles-updated", refreshWorkspaceTeamSummary);
    window.addEventListener("nashir-collaboration-comments-updated", refreshWorkspaceTeamSummary);
    window.addEventListener("nashir-activity-log-updated", refreshWorkspaceTeamSummary);

    return () => {
      window.removeEventListener("focus", refreshWorkspaceTeamSummary);
      window.removeEventListener("storage", refreshWorkspaceTeamSummary);
      window.removeEventListener("nashir-workspace-members-updated", refreshWorkspaceTeamSummary);
      window.removeEventListener("nashir-workspace-roles-updated", refreshWorkspaceTeamSummary);
      window.removeEventListener("nashir-collaboration-comments-updated", refreshWorkspaceTeamSummary);
      window.removeEventListener("nashir-activity-log-updated", refreshWorkspaceTeamSummary);
    };
  }, []);

  useEffect(() => {
    const refreshModelRoutingSummary = () => {
      setModelRoutingSummary(getModelRoutingSummary());
    };

    window.addEventListener("focus", refreshModelRoutingSummary);
    window.addEventListener("storage", refreshModelRoutingSummary);
    window.addEventListener("nashir-model-registry-updated", refreshModelRoutingSummary);
    window.addEventListener("nashir-model-routing-updated", refreshModelRoutingSummary);
    window.addEventListener("nashir-cost-monitor-updated", refreshModelRoutingSummary);

    return () => {
      window.removeEventListener("focus", refreshModelRoutingSummary);
      window.removeEventListener("storage", refreshModelRoutingSummary);
      window.removeEventListener("nashir-model-registry-updated", refreshModelRoutingSummary);
      window.removeEventListener("nashir-model-routing-updated", refreshModelRoutingSummary);
      window.removeEventListener("nashir-cost-monitor-updated", refreshModelRoutingSummary);
    };
  }, []);

  const sharedConnectionCount = useMemo(
    () => Object.keys(sharedConnections || {}).length,
    [sharedConnections]
  );

  const warnings = useMemo(
    () => buildWarnings({ channels, aiSettings, governance, outputSettings, workspace, sharedConnections }),
    [channels, aiSettings, governance, outputSettings, workspace, sharedConnections]
  );

  const governanceScore = useMemo(() => calculateScore(warnings), [warnings]);

  const enabledChannelsCount = useMemo(
    () => channels.filter((channel) => channel.enabled).length,
    [channels]
  );

  const connectedOAuthCount = useMemo(
    () => channels.filter((channel) => channel.status === "connected").length,
    [channels]
  );

  const pendingOAuthCount = useMemo(
    () => channels.filter((channel) => channel.status === "pending_oauth").length,
    [channels]
  );

  const reflectedConnectionCount = useMemo(
    () => channels.filter((channel) => channel.fromSharedConnection).length,
    [channels]
  );

  const activeWarnings = useMemo(
    () => ({
      red: warnings.filter((warning) => warning.tone === "red").length,
      amber: warnings.filter((warning) => warning.tone === "amber").length,
    }),
    [warnings]
  );

  const recordChange = (event, severity = "info") => {
    setDirty(true);
    setSaved(false);
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        event,
        actor: "مدير البروتوتايب",
        time: "الآن",
        severity,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const updateWorkspace = (key, value) => {
    setWorkspace((prev) => ({ ...prev, [key]: value }));
    recordChange(`تعديل إعداد مساحة العمل: ${key}`);
  };

  const updateAi = (key, value) => {
    setAiSettings((prev) => ({ ...prev, [key]: value }));
    recordChange(`تعديل إعداد الذكاء الاصطناعي: ${key}`, key.includes("redact") ? "warning" : "info");
  };

  const updateGovernance = (key, value) => {
    setGovernance((prev) => ({ ...prev, [key]: value }));
    recordChange(`تعديل قاعدة حوكمة: ${key}`, value === false ? "warning" : "info");
  };

  const updateOutput = (key, value) => {
    setOutputSettings((prev) => ({ ...prev, [key]: value }));
    recordChange(`تعديل إعداد المخرجات: ${key}`);
  };

  const updateChannelEnabled = (id, enabled) => {
    setChannels((prev) =>
      prev.map((channel) => (channel.id === id ? { ...channel, enabled } : channel))
    );
    recordChange(`${enabled ? "تفعيل" : "تعطيل"} قناة ${OAUTH_PROVIDERS[id]?.name || id}`);
  };

  const persistSharedConnection = (providerId, status, extra = {}) => {
    const provider = OAUTH_PROVIDERS[providerId];

    if (!provider) return;

    const nextConnections = {
      ...sharedConnections,
      [providerId]: {
        providerId,
        providerName: provider.name,
        status,
        authorizationUrl: provider.authUrl,
        requestedScopes: provider.scopes,
        accountName:
          extra.accountName ||
          sharedConnections[providerId]?.accountName ||
          "",
        updatedAt: new Date().toISOString(),
        sourceSurface: "SettingsPage",
        ...extra,
      },
    };

    setSharedConnections(nextConnections);
    setChannels((prev) => applySharedConnections(prev, nextConnections));
    writeSharedIntegrationConnections(nextConnections);
  };

  const startOAuthConnection = (channel) => {
    const provider = OAUTH_PROVIDERS[channel.id];
    if (!provider) return;

    persistSharedConnection(channel.id, "pending_oauth", {
      lastAction: "oauth_started",
    });
    recordChange(`بدء ربط OAuth لقناة ${provider.name}`, "info");

    if (provider.authUrl && provider.authUrl !== "about:blank") {
      window.open(provider.authUrl, "_blank", "noopener,noreferrer");
    }
  };

  const mockOAuthSuccess = (channel) => {
    const provider = OAUTH_PROVIDERS[channel.id];
    if (!provider) return;

    const accountName =
      sharedConnections[channel.id]?.accountName ||
      `@${provider.name.toLowerCase().replace(/\s+/g, "_")}_account`;

    persistSharedConnection(channel.id, "connected", {
      accountName,
      lastAction: "oauth_callback_mocked",
    });

    recordChange(`اكتمل ربط OAuth Mock لقناة ${provider.name}`, "info");
  };

  const disconnectOAuth = (channel) => {
    const provider = OAUTH_PROVIDERS[channel.id];
    if (!provider) return;

    persistSharedConnection(channel.id, "disconnected", {
      accountName: "",
      lastAction: "oauth_disconnected",
    });

    recordChange(`تم قطع ربط قناة ${provider.name}`, "warning");
  };

  const saveLocalSettings = () => {
    setSaved(true);
    setDirty(false);
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        event: "حفظ الإعدادات محليًا داخل الواجهة",
        actor: "مدير البروتوتايب",
        time: "الآن",
        severity: "success",
      },
      ...prev.slice(0, 9),
    ]);
    setTimeout(() => setSaved(false), 2400);
  };

  const resetSettings = () => {
    const latest = readSharedIntegrationConnections();
    setSharedConnections(latest);
    setChannels(buildDefaultChannels(latest));
    setWorkspace(DEFAULT_WORKSPACE);
    setAiSettings(DEFAULT_AI_SETTINGS);
    setGovernance(DEFAULT_GOVERNANCE);
    setOutputSettings(DEFAULT_OUTPUT_SETTINGS);
    setSaved(false);
    setDirty(false);
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        event: "إعادة الإعدادات إلى القيم الافتراضية مع إبقاء حالة الربط المحفوظة",
        actor: "مدير البروتوتايب",
        time: "الآن",
        severity: "warning",
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <main className="settings-page" dir="rtl">
      <style>{styles}</style>

      <section className="settings-hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Settings size={16} />
            إعدادات المنصة
          </div>

          <h1>مركز إعدادات ناشر قبل التشغيل الحقيقي</h1>

          <p>
            هذه الصفحة تضبط مساحة العمل، القنوات، مزودي الذكاء الاصطناعي، حدود
            التكلفة، وسياسات المراجعة. حالة ربط القنوات محفوظة محليًا وتظهر في
            إعداد المتجر والإعدادات.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={saveLocalSettings}>
              <Save size={17} />
              حفظ محلي
            </button>

            <button type="button" className="secondary-button" onClick={resetSettings}>
              <RefreshCw size={17} />
              إعادة الضبط
            </button>
          </div>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              لا تضع مفاتيح API حقيقية هنا. زر OAuth في هذا البروتوتايب يعرض
              المسار فقط؛ التنفيذ الحقيقي يجب أن يتم عبر Backend آمن يحفظ Tokens
              مشفرة ويعرض الحالة للواجهة فقط.
            </span>
          </div>
        </div>

        <div className="settings-score-card">
          <div className="score-icon">
            <Shield size={26} />
          </div>

          <span>جاهزية الإعدادات</span>
          <strong>{governanceScore}%</strong>

          <div className="mini-progress">
            <div style={{ width: `${governanceScore}%` }} />
          </div>

          <p>
            {activeWarnings.red
              ? "يوجد خطر حوكمة يجب إصلاحه قبل اعتماد التصور."
              : activeWarnings.amber
                ? "الإعدادات قابلة للمراجعة مع وجود ملاحظات متوسطة."
                : "الإعدادات الحالية آمنة كبروتوتايب."}
          </p>

          <div className="score-meta">
            <span>تحذيرات عالية: {activeWarnings.red}</span>
            <span>تحذيرات متوسطة: {activeWarnings.amber}</span>
          </div>
        </div>
      </section>

      <section className="settings-tabs" aria-label="تبويبات الإعدادات">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="settings-layout">
        <section className="settings-main">
          {activeTab === "overview" && (
            <>
              <section className="metrics-grid">
                <Metric title="القنوات المفعلة" value={enabledChannelsCount} note={`من أصل ${channels.length}`} />
                <Metric title="مرتبط OAuth Mock" value={connectedOAuthCount} note={`${pendingOAuthCount} بانتظار OAuth`} />
                <Metric title="حالة ربط محفوظة" value={reflectedConnectionCount} note={`${sharedConnectionCount} سجل محفوظ`} />
                <Metric title="حالة التغييرات" value={dirty ? "غير محفوظة" : "محفوظة"} note="داخل الواجهة فقط" />
              </section>

              <SettingsCard
                icon={Globe2}
                title="حالة ربط القنوات المشتركة"
                description="تقرأ هذه البطاقة حالة OAuth Mock المحفوظة محليًا."
              >
                <SharedConnectionSummary channels={channels} sharedConnectionCount={sharedConnectionCount} />
              </SettingsCard>

              <SettingsCard
                icon={AlertTriangle}
                title="تنبيهات الحوكمة"
                description="هذه التنبيهات تمنع أن تصبح الإعدادات شكلية أو مضللة عند الانتقال للتنفيذ الحقيقي."
              >
                <WarningsList warnings={warnings} />
              </SettingsCard>

              <SettingsCard
                icon={SlidersHorizontal}
                title="ملخص التشغيل"
                description="قراءة سريعة لما سيؤثر على إنشاء الحملات والمحتوى."
              >
                <div className="summary-list inline">
                  <SummaryRow label="مساحة العمل" value={workspace.workspaceName || "غير محدد"} />
                  <SummaryRow label="السوق الافتراضي" value={workspace.defaultMarket || "غير محدد"} />
                  <SummaryRow label="مراجعة بشرية" value={aiSettings.requireHumanReview ? "مفعلة" : "غير مفعلة"} />
                  <SummaryRow label="النشر التلقائي" value={governance.blockAutoPublish ? "ممنوع" : "غير مضبوط"} />
                  <SummaryRow label="مراجعة الادعاءات" value={governance.requireClaimsReview ? "مفعلة" : "غير مفعلة"} />
                  <SummaryRow label="اللغة والنبرة" value={`${outputSettings.defaultLanguage} · ${outputSettings.defaultTone}`} />
                  <SummaryRow label="مسارات الذكاء الاصطناعي" value={modelRoutingSummary.routes || "غير محدد"} />
                  <SummaryRow label="استهلاك التكلفة" value={`${modelRoutingSummary.usage || 0}%`} />
                  <SummaryRow label="أعضاء الفريق" value={workspaceTeamSummary.members || 0} />
                  <SummaryRow label="تعليقات مفتوحة" value={workspaceTeamSummary.openComments || 0} />
                </div>
              </SettingsCard>
            </>
          )}

          {activeTab === "workspace" && (
            <SettingsCard
              icon={Store}
              title="إعدادات مساحة العمل"
              description="بيانات عامة تؤثر على الافتراضات داخل النظام."
            >
              <div className="form-grid">
                <Field
                  label="اسم مساحة العمل"
                  value={workspace.workspaceName}
                  onChange={(value) => updateWorkspace("workspaceName", value)}
                />

                <Field
                  label="اسم المسؤول"
                  value={workspace.ownerName}
                  onChange={(value) => updateWorkspace("ownerName", value)}
                />

                <Field
                  label="السوق الافتراضي"
                  value={workspace.defaultMarket}
                  onChange={(value) => updateWorkspace("defaultMarket", value)}
                />

                <Field
                  label="نمط النشاط"
                  value={workspace.businessMode}
                  onChange={(value) => updateWorkspace("businessMode", value)}
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === "channels" && (
            <SettingsCard
              icon={Globe2}
              title="القنوات والربط OAuth"
              description="نفس طريقة الربط المختصرة الموجودة في إعداد المتجر: قناة ثابتة، زر OAuth، حالة واحدة مشتركة."
            >
              <div className="source-note">
                <Store size={18} />
                <div>
                  <strong>حالة ربط واحدة</strong>
                  <span>
                    إعداد المتجر والإعدادات يعرضان نفس حالة الربط المحفوظة
                    محليًا. لا توجد مزامنة يدوية ولا سجل قناة منفصل.
                  </span>
                </div>
              </div>

              <div className="channels-grid">
                {channels.map((channel) => {
                  const Icon = channel.icon || Globe2;
                  const isConnected = channel.status === "connected";
                  const isPending = channel.status === "pending_oauth";

                  return (
                    <div
                      key={channel.id}
                      className={channel.fromSharedConnection ? "channel-card from-shared" : "channel-card"}
                    >
                      <div className="channel-header">
                        <div className="channel-title">
                          <div className="channel-icon">
                            <Icon size={21} />
                          </div>

                          <div>
                            <h3>{channel.name}</h3>
                            <p>{channel.description}</p>
                          </div>
                        </div>

                        <Switch
                          checked={channel.enabled}
                          onChange={(value) => updateChannelEnabled(channel.id, value)}
                        />
                      </div>

                      <div className="connection-badges">
                        <ConnectionBadge status={channel.status} />
                        {channel.fromSharedConnection && (
                          <span className="shared-badge">حالة محفوظة</span>
                        )}
                      </div>

                      <div className="oauth-summary">
                        <SummaryRow
                          label="الحالة"
                          value={
                            isConnected
                              ? "مرتبط OAuth Mock"
                              : isPending
                                ? "بانتظار موافقة OAuth"
                                : channel.status === "failed"
                                  ? "فشل الربط"
                                  : "غير مرتبط"
                          }
                        />
                        <SummaryRow
                          label="الحساب"
                          value={channel.accountName || "لم يتم إكمال الربط"}
                        />
                        <SummaryRow
                          label="المالك التشغيلي"
                          value={channel.owner || "غير محدد"}
                        />
                        <SummaryRow
                          label="آخر تحديث"
                          value={channel.updatedAt || "لا يوجد"}
                        />
                      </div>

                      <div className="scope-list">
                        <strong>الصلاحيات المطلوبة لاحقًا</strong>
                        <div>
                          {(channel.requestedScopes || []).map((scope) => (
                            <span key={scope}>{scope}</span>
                          ))}
                        </div>
                      </div>

                      <div className="oauth-actions">
                        <button
                          type="button"
                          onClick={() => startOAuthConnection(channel)}
                        >
                          ربط OAuth
                        </button>

                        <button
                          type="button"
                          onClick={() => mockOAuthSuccess(channel)}
                        >
                          محاكاة إتمام الموافقة
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => disconnectOAuth(channel)}
                        >
                          قطع الربط
                        </button>
                      </div>

                      <div className="connection-state">
                        <Lock size={16} />
                        <span>
                          {isConnected
                            ? "مرتبط كـ OAuth Mock داخل البروتوتايب."
                            : isPending
                              ? "تم بدء مسار OAuth وينتظر إتمام الموافقة."
                              : "غير مرتبط. اضغط ربط OAuth لبدء المسار."}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SettingsCard>
          )}

          {activeTab === "ai" && (
            <SettingsCard
              icon={Bot}
              title="إعدادات أدوات الذكاء الاصطناعي والتكلفة"
              description="اختيارات مزودي الخدمة وحدود التكلفة بشكل مبدئي."
            >
              <div className="form-grid">
                <SelectField
                  label="مزود النصوص"
                  value={aiSettings.textProvider}
                  options={providerOptions}
                  onChange={(value) => updateAi("textProvider", value)}
                />

                <SelectField
                  label="مزود الصور"
                  value={aiSettings.imageProvider}
                  options={providerOptions}
                  onChange={(value) => updateAi("imageProvider", value)}
                />

                <SelectField
                  label="مزود الفيديو"
                  value={aiSettings.videoProvider}
                  options={providerOptions}
                  onChange={(value) => updateAi("videoProvider", value)}
                />

                <Field
                  label="حد التكلفة الشهري التقريبي بالدولار"
                  value={aiSettings.maxMonthlyBudget}
                  onChange={(value) => updateAi("maxMonthlyBudget", value)}
                />
              </div>

              <div className="toggle-grid">
                <ToggleRow
                  title="مراجعة بشرية قبل اعتماد المخرجات"
                  description="لا تعتمد المحتوى الناتج من AI دون مراجعة."
                  checked={aiSettings.requireHumanReview}
                  onChange={(value) => updateAi("requireHumanReview", value)}
                />

                <ToggleRow
                  title="السماح بالتوليد التلقائي للمسودات"
                  description="توليد مسودات فقط، وليس نشرًا أو إرسالًا."
                  checked={aiSettings.allowAutoGeneration}
                  onChange={(value) => updateAi("allowAutoGeneration", value)}
                />

                <ToggleRow
                  title="تفعيل نموذج بديل عند فشل المزود"
                  description="يقلل توقف التجربة عند فشل مزود واحد."
                  checked={aiSettings.requireFallbackModel}
                  onChange={(value) => updateAi("requireFallbackModel", value)}
                />

                <ToggleRow
                  title="إخفاء بيانات العملاء قبل إرسال المطالبات"
                  description="ضروري قبل أي تنفيذ حقيقي."
                  checked={aiSettings.redactCustomerData}
                  onChange={(value) => updateAi("redactCustomerData", value)}
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === "governance" && (
            <SettingsCard
              icon={Shield}
              title="الحوكمة والمراجعة"
              description="ضوابط تمنع النشر أو الإرسال غير الآمن."
            >
              <div className="form-grid">
                <SelectField
                  label="مستوى المخاطر الافتراضي"
                  value={governance.riskLevel}
                  options={riskLevels}
                  onChange={(value) => updateGovernance("riskLevel", value)}
                />
              </div>

              <div className="toggle-grid">
                <ToggleRow
                  title="منع النشر التلقائي"
                  description="النشر الحقيقي يجب أن يبقى محظورًا في هذه المرحلة."
                  checked={governance.blockAutoPublish}
                  onChange={(value) => updateGovernance("blockAutoPublish", value)}
                />

                <ToggleRow
                  title="طلب اعتماد قبل الإرسال"
                  description="أي قناة خارجية تحتاج موافقة بشرية."
                  checked={governance.requireApprovalBeforeSend}
                  onChange={(value) => updateGovernance("requireApprovalBeforeSend", value)}
                />

                <ToggleRow
                  title="الاحتفاظ بسجل مراجعة"
                  description="ضروري للمساءلة لاحقًا."
                  checked={governance.keepReviewLog}
                  onChange={(value) => updateGovernance("keepReviewLog", value)}
                />

                <ToggleRow
                  title="مراجعة الادعاءات التسويقية"
                  description="يمنع وعودًا أو ادعاءات غير قابلة للتحقق."
                  checked={governance.requireClaimsReview}
                  onChange={(value) => updateGovernance("requireClaimsReview", value)}
                />

                <ToggleRow
                  title="مراجعة حقوق الأصول"
                  description="قبل استخدام صور أو فيديوهات أو مواد خارجية."
                  checked={governance.requireAssetRightsReview}
                  onChange={(value) => updateGovernance("requireAssetRightsReview", value)}
                />

                <ToggleRow
                  title="إصدارات المطالبات"
                  description="ربط كل مخرج بإصدار المطالبة لاحقًا."
                  checked={governance.requirePromptVersioning}
                  onChange={(value) => updateGovernance("requirePromptVersioning", value)}
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === "outputs" && (
            <SettingsCard
              icon={FileText}
              title="إعدادات المخرجات"
              description="افتراضات المحتوى التي ترثها الشاشات الأخرى."
            >
              <div className="form-grid">
                <SelectField
                  label="اللغة الافتراضية"
                  value={outputSettings.defaultLanguage}
                  options={languageOptions}
                  onChange={(value) => updateOutput("defaultLanguage", value)}
                />

                <SelectField
                  label="النبرة الافتراضية"
                  value={outputSettings.defaultTone}
                  options={toneOptions}
                  onChange={(value) => updateOutput("defaultTone", value)}
                />

                <SelectField
                  label="طول النص"
                  value={outputSettings.textLength}
                  options={["قصير", "متوسط", "طويل"]}
                  onChange={(value) => updateOutput("textLength", value)}
                />
              </div>

              <div className="toggle-grid">
                <ToggleRow
                  title="إضافة Hashtags"
                  description="إضافة وسوم عند الحاجة."
                  checked={outputSettings.includeHashtags}
                  onChange={(value) => updateOutput("includeHashtags", value)}
                />

                <ToggleRow
                  title="إضافة CTA"
                  description="تضمين دعوة للفعل في المخرجات."
                  checked={outputSettings.includeCTA}
                  onChange={(value) => updateOutput("includeCTA", value)}
                />

                <ToggleRow
                  title="توليد بدائل متعددة"
                  description="يساعد في A/B Testing لاحقًا."
                  checked={outputSettings.generateVariants}
                  onChange={(value) => updateOutput("generateVariants", value)}
                />

                <ToggleRow
                  title="ملخص آمن للعميل"
                  description="يفصل المنطق الداخلي عن النص المرئي للعميل."
                  checked={outputSettings.requireCustomerSafeSummary}
                  onChange={(value) => updateOutput("requireCustomerSafeSummary", value)}
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === "audit" && (
            <SettingsCard
              icon={KeyRound}
              title="سجل الإعدادات"
              description="سجل محلي غير ملزم، ولا يمثل Audit Log حقيقيًا."
            >
              <div className="audit-list">
                {auditLog.map((item) => (
                  <div key={item.id} className={`audit-row ${item.severity}`}>
                    <div className="audit-icon">
                      {item.severity === "success" ? <CheckCircle2 size={16} /> : <KeyRound size={16} />}
                    </div>

                    <div>
                      <strong>{item.event}</strong>
                      <span>{item.actor} · {item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}
        </section>

        <aside className="settings-side">
          <SettingsCard
            icon={Shield}
            title="قرار الحوكمة"
            description="ملخص سريع قبل اعتماد الإعدادات."
          >
            <div className="decision-box">
              <strong>
                {governanceScore >= 80
                  ? "GO كبروتوتايب"
                  : governanceScore >= 55
                    ? "GO مشروط"
                    : "NO-GO"}
              </strong>
              <span>
                {governanceScore >= 80
                  ? "الإعدادات مناسبة كتصور واجهة."
                  : governanceScore >= 55
                    ? "توجد ملاحظات يجب إغلاقها قبل التنفيذ الحقيقي."
                    : "المخاطر عالية ولا تصلح كإعدادات مرجعية."}
              </span>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Globe2}
            title="حالة ربط القنوات"
            description="قراءة مختصرة لحالة OAuth Mock في البروتوتايب."
          >
            <div className="summary-list">
              <SummaryRow label="سجلات الربط" value={sharedConnectionCount} />
              <SummaryRow label="ظاهرة في الإعدادات" value={reflectedConnectionCount} />
              <SummaryRow label="مرتبطة" value={connectedOAuthCount} />
              <SummaryRow label="بانتظار OAuth" value={pendingOAuthCount} />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={DollarSign}
            title="التكلفة"
            description="ملخص عالي المستوى من إعدادات التوجيه ومراقبة التكلفة."
          >
            <div className="summary-list">
              <SummaryRow label="الحد الشهري" value={`$${aiSettings.maxMonthlyBudget}`} />
              <SummaryRow label="مزود النصوص" value={aiSettings.textProvider} />
              <SummaryRow label="مزود الصور" value={aiSettings.imageProvider} />
              <SummaryRow label="مزود الفيديو" value={aiSettings.videoProvider} />
              <SummaryRow label="النماذج النشطة" value={modelRoutingSummary.activeModels || 0} />
              <SummaryRow label="مسارات المراجعة" value={modelRoutingSummary.reviewRoutes || 0} />
              <SummaryRow label="توقع التكلفة" value={`${modelRoutingSummary.forecastUsage || 0}%`} />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Users}
            title="الفريق"
            description="ملخص قراءة فقط لحالة الأعضاء والتعليقات."
          >
            <div className="summary-list">
              <SummaryRow label="الأعضاء النشطون" value={workspaceTeamSummary.activeMembers || 0} />
              <SummaryRow label="الدعوات المعلقة" value={workspaceTeamSummary.invitedMembers || 0} />
              <SummaryRow label="الأدوار" value={workspaceTeamSummary.roles || 0} />
              <SummaryRow label="تعليقات مفتوحة" value={workspaceTeamSummary.openComments || 0} />
            </div>
          </SettingsCard>
        </aside>
      </section>

      {saved && (
        <div className="settings-toast">
          <CheckCircle2 size={18} />
          تم حفظ الإعدادات محليًا داخل الواجهة فقط.
        </div>
      )}
    </main>
  );
}

function SettingsCard({ icon: Icon, title, description, children, action }) {
  return (
    <section className="settings-card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <Icon size={20} />
          </div>

          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {action || null}
      </div>

      {children}
    </section>
  );
}

function Metric({ title, value, note }) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WarningsList({ warnings }) {
  if (!warnings.length) {
    return (
      <div className="empty-state success">
        <CheckCircle2 size={18} />
        لا توجد تحذيرات حرجة في الإعدادات الحالية.
      </div>
    );
  }

  return (
    <div className="warnings-list">
      {warnings.map((warning) => (
        <div key={warning.id} className={`warning-row ${warning.tone}`}>
          <AlertTriangle size={18} />
          <div>
            <strong>{warning.title}</strong>
            <span>{warning.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SharedConnectionSummary({ channels, sharedConnectionCount }) {
  const reflected = channels.filter((channel) => channel.fromSharedConnection);

  if (!sharedConnectionCount) {
    return (
      <div className="empty-state">
        <CircleAlert size={18} />
        لا توجد حالة ربط محفوظة بعد. استخدم زر OAuth من إعداد المتجر أو من الإعدادات.
      </div>
    );
  }

  return (
    <div className="shared-connection-summary">
      {reflected.map((channel) => (
        <div key={channel.id} className="shared-connection-row">
          <ConnectionBadge status={channel.status} />
          <div>
            <strong>{channel.name}</strong>
            <span>{channel.accountName || "لم يتم إكمال الربط"}</span>
          </div>
        </div>
      ))}

      {!reflected.length && (
        <div className="empty-state">
          <CircleAlert size={18} />
          توجد بيانات محفوظة في مصدر الربط، لكنها لا تطابق معرفات القنوات الحالية.
        </div>
      )}
    </div>
  );
}

function ConnectionBadge({ status }) {
  if (status === "connected") {
    return <span className="connection-badge connected">مرتبط OAuth Mock</span>;
  }

  if (status === "pending_oauth") {
    return <span className="connection-badge pending">بانتظار OAuth</span>;
  }

  if (status === "failed") {
    return <span className="connection-badge failed">فشل الربط</span>;
  }

  return <span className="connection-badge manual">غير مرتبط</span>;
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={checked ? "switch active" : "switch"}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

const styles = `
.settings-page{
  min-height:calc(100vh - 80px);
  padding:24px;
  background:#f7f8f4;
  color:#1f241d;
  font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif;
}

.settings-hero,
.settings-tabs,
.settings-card{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:24px;
  box-shadow:0 8px 26px rgba(24,38,18,.035);
}

.settings-hero{
  padding:20px;
  display:grid;
  grid-template-columns:minmax(0,1fr)320px;
  gap:18px;
  margin-bottom:16px;
}

.eyebrow{
  width:fit-content;
  min-height:30px;
  padding:0 11px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#176b2c;
  background:#eef7e9;
  font-size:12px;
  font-weight:900;
  margin-bottom:10px;
}

.settings-hero h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.04em;
}

.settings-hero p{
  max-width:850px;
  margin:8px 0 0;
  color:#6f746b;
  line-height:1.8;
}

.hero-actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:16px;
}

.primary-button,
.secondary-button{
  min-height:42px;
  border-radius:16px;
  padding:0 16px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  font-family:inherit;
  font-size:13px;
  font-weight:900;
  cursor:pointer;
}

.primary-button{
  border:0;
  color:#fff;
  background:#176b2c;
}

.secondary-button{
  border:1px solid #e4e7df;
  color:#1f241d;
  background:#fff;
}

.hero-alert{
  margin-top:14px;
  border:1px solid #fde68a;
  background:#fff7e6;
  color:#92400e;
  border-radius:18px;
  padding:13px;
  display:flex;
  gap:8px;
  line-height:1.8;
  font-size:12px;
  font-weight:800;
}

.settings-score-card{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:22px;
  padding:18px;
  display:grid;
  align-content:start;
  gap:8px;
}

.score-icon{
  width:54px;
  height:54px;
  border-radius:18px;
  display:grid;
  place-items:center;
  background:#176b2c;
  color:#fff;
}

.settings-score-card span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.settings-score-card strong{
  font-size:38px;
  line-height:1;
}

.settings-score-card p{
  margin:0;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.mini-progress{
  height:9px;
  border-radius:999px;
  background:#e4e7df;
  overflow:hidden;
}

.mini-progress div{
  height:100%;
  border-radius:inherit;
  background:#176b2c;
}

.score-meta{
  display:grid;
  gap:6px;
  margin-top:6px;
}

.settings-tabs{
  padding:8px;
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:16px;
}

.settings-tabs button{
  min-height:38px;
  border-radius:999px;
  border:1px solid transparent;
  background:transparent;
  padding:0 13px;
  font-family:inherit;
  font-weight:900;
  cursor:pointer;
}

.settings-tabs button.active{
  color:#176b2c;
  background:#eef7e9;
  border-color:#d9ead7;
}

.settings-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr)330px;
  gap:16px;
  align-items:start;
}

.settings-main,
.settings-side{
  display:grid;
  gap:16px;
}

.settings-side{
  position:sticky;
  top:96px;
}

.settings-card{
  padding:18px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  gap:14px;
  align-items:flex-start;
  margin-bottom:14px;
}

.card-title{
  display:flex;
  gap:12px;
  align-items:flex-start;
}

.card-icon{
  width:42px;
  height:42px;
  border-radius:15px;
  display:grid;
  place-items:center;
  background:#eef7e9;
  color:#176b2c;
  flex:0 0 auto;
}

.card-header h2{
  margin:0;
  font-size:18px;
}

.card-header p{
  margin:5px 0 0;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.metrics-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
}

.metric-card{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:22px;
  padding:16px;
  box-shadow:0 8px 26px rgba(24,38,18,.025);
}

.metric-card span{
  color:#6f746b;
  font-size:13px;
  font-weight:900;
}

.metric-card strong{
  display:block;
  margin-top:8px;
  font-size:28px;
}

.metric-card small{
  display:block;
  margin-top:5px;
  color:#8a9185;
  font-size:12px;
  font-weight:800;
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}

.field{
  display:grid;
  gap:7px;
}

.field span{
  color:#1f241d;
  font-size:12px;
  font-weight:950;
}

.field input,
.field select{
  width:100%;
  min-height:42px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:15px;
  padding:0 12px;
  font-family:inherit;
  font-weight:800;
  outline:none;
}

.summary-list{
  display:grid;
  gap:8px;
}

.summary-list.inline{
  grid-template-columns:repeat(2,minmax(0,1fr));
}

.summary-row{
  min-height:44px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:15px;
  padding:10px 12px;
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
}

.summary-row span{
  color:#6f746b;
  font-size:12px;
  font-weight:900;
}

.summary-row strong{
  overflow-wrap:anywhere;
}

.warnings-list{
  display:grid;
  gap:10px;
}

.warning-row,
.empty-state{
  border-radius:18px;
  padding:13px;
  display:flex;
  gap:9px;
  align-items:flex-start;
  line-height:1.8;
  font-size:12px;
  font-weight:800;
}

.warning-row.red{
  border:1px solid #fecaca;
  background:#fef2f2;
  color:#991b1b;
}

.warning-row.amber{
  border:1px solid #fde68a;
  background:#fff7e6;
  color:#92400e;
}

.warning-row strong,
.warning-row span{
  display:block;
}

.warning-row span{
  margin-top:2px;
  color:inherit;
  opacity:.88;
}

.empty-state{
  border:1px dashed #cbd5c0;
  background:#f7f8f4;
  color:#6f746b;
}

.empty-state.success{
  border-color:#bbf7d0;
  background:#f0fdf4;
  color:#166534;
}

.shared-connection-summary{
  display:grid;
  gap:10px;
}

.shared-connection-row{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:16px;
  padding:12px;
  display:flex;
  align-items:flex-start;
  gap:10px;
}

.shared-connection-row strong,
.shared-connection-row span{
  display:block;
}

.shared-connection-row span{
  color:#6f746b;
  margin-top:3px;
  font-size:12px;
}

.source-note{
  border:1px solid #d9ead7;
  background:#eef7e9;
  color:#176b2c;
  border-radius:18px;
  padding:13px;
  display:flex;
  align-items:flex-start;
  gap:9px;
  margin-bottom:14px;
}

.source-note strong,
.source-note span{
  display:block;
}

.source-note span{
  margin-top:4px;
  color:#52604c;
  line-height:1.7;
  font-size:12px;
}

.source-note code{
  direction:ltr;
  unicode-bidi:plaintext;
  font-weight:900;
}

.channels-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
}

.channel-card{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:22px;
  padding:15px;
}

.channel-card.from-shared{
  border-color:#bbf7d0;
  background:#f5fbf2;
}

.channel-header{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.channel-title{
  display:flex;
  gap:10px;
  align-items:flex-start;
}

.channel-icon{
  width:40px;
  height:40px;
  border-radius:14px;
  display:grid;
  place-items:center;
  background:#fff;
  color:#176b2c;
  flex:0 0 auto;
}

.channel-title h3{
  margin:0;
  font-size:16px;
}

.channel-title p{
  margin:5px 0 0;
  color:#6f746b;
  line-height:1.7;
  font-size:12px;
}

.connection-badges{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin:12px 0;
}

.connection-badge,
.shared-badge{
  width:fit-content;
  min-height:28px;
  border-radius:999px;
  padding:0 9px;
  display:inline-flex;
  align-items:center;
  font-size:11px;
  font-weight:900;
}

.connection-badge.connected{
  color:#166534;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
}

.connection-badge.pending{
  color:#92400e;
  background:#fffbeb;
  border:1px solid #fde68a;
}

.connection-badge.failed{
  color:#991b1b;
  background:#fef2f2;
  border:1px solid #fecaca;
}

.connection-badge.manual{
  color:#475569;
  background:#f8fafc;
  border:1px solid #e2e8f0;
}

.shared-badge{
  color:#176b2c;
  background:#eef7e9;
  border:1px solid #d9ead7;
}

.oauth-summary{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:8px;
  margin-top:12px;
}

.scope-list{
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:10px;
  margin-top:12px;
}

.scope-list strong{
  display:block;
  font-size:12px;
  margin-bottom:8px;
}

.scope-list div{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.scope-list span{
  border:1px solid #d9ead7;
  background:#eef7e9;
  color:#176b2c;
  border-radius:999px;
  padding:4px 8px;
  font-size:10px;
  font-weight:900;
}

.oauth-actions{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:12px;
}

.oauth-actions button{
  min-height:36px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:14px;
  padding:0 12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-family:inherit;
  font-size:12px;
  font-weight:900;
  cursor:pointer;
}

.oauth-actions button.danger{
  color:#991b1b;
  background:#fef2f2;
  border-color:#fecaca;
}

.connection-state{
  margin-top:12px;
  border:1px solid #e4e7df;
  background:#fff;
  border-radius:16px;
  padding:10px;
  display:flex;
  gap:8px;
  align-items:flex-start;
  color:#6f746b;
  line-height:1.6;
  font-size:12px;
  font-weight:800;
}

.toggle-grid{
  display:grid;
  gap:10px;
  margin-top:14px;
}

.toggle-row{
  min-height:66px;
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:12px;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
}

.toggle-row strong,
.toggle-row span{
  display:block;
}

.toggle-row span{
  margin-top:4px;
  color:#6f746b;
  line-height:1.6;
  font-size:12px;
}

.switch{
  width:50px;
  height:28px;
  border:0;
  border-radius:999px;
  padding:3px;
  background:#cbd5c0;
  display:flex;
  align-items:center;
  cursor:pointer;
  flex:0 0 auto;
}

.switch span{
  width:22px;
  height:22px;
  border-radius:50%;
  background:#fff;
  box-shadow:0 2px 6px rgba(15,23,42,.18);
  transition:.18s ease;
}

.switch.active{
  background:#176b2c;
}

.switch.active span{
  transform:translateX(-22px);
}

.audit-list{
  display:grid;
  gap:10px;
}

.audit-row{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:12px;
  display:flex;
  gap:10px;
  align-items:flex-start;
}

.audit-row.success{
  border-color:#bbf7d0;
  background:#f0fdf4;
  color:#166534;
}

.audit-row.warning{
  border-color:#fde68a;
  background:#fff7e6;
  color:#92400e;
}

.audit-icon{
  width:30px;
  height:30px;
  border-radius:11px;
  display:grid;
  place-items:center;
  background:#fff;
  color:inherit;
  flex:0 0 auto;
}

.audit-row strong,
.audit-row span{
  display:block;
}

.audit-row span{
  margin-top:4px;
  color:inherit;
  opacity:.78;
  font-size:12px;
}

.decision-box{
  border:1px solid #e4e7df;
  background:#f7f8f4;
  border-radius:18px;
  padding:14px;
}

.decision-box strong,
.decision-box span{
  display:block;
}

.decision-box strong{
  color:#176b2c;
  font-size:22px;
}

.decision-box span{
  margin-top:5px;
  color:#6f746b;
  line-height:1.7;
  font-size:13px;
}

.settings-toast{
  position:fixed;
  left:22px;
  bottom:22px;
  min-height:44px;
  border-radius:16px;
  padding:0 14px;
  display:flex;
  align-items:center;
  gap:8px;
  color:#166534;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  box-shadow:0 16px 34px rgba(15,23,42,.12);
  font-size:13px;
  font-weight:900;
}

@media(max-width:1200px){
  .settings-hero,
  .settings-layout{
    grid-template-columns:1fr;
  }

  .settings-side{
    position:static;
  }

  .metrics-grid,
  .channels-grid{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}

@media(max-width:760px){
  .settings-page{
    padding:16px;
  }

  .metrics-grid,
  .channels-grid,
  .form-grid,
  .summary-list.inline,
  .oauth-summary{
    grid-template-columns:1fr;
  }

  .card-header,
  .channel-header,
  .toggle-row{
    flex-direction:column;
    align-items:stretch;
  }

  .primary-button,
  .secondary-button{
    width:100%;
  }
}
`;
