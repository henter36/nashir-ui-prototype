import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CircleAlert,
  Copy,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Trash2,
  Wand2,
  X,
} from "lucide-react";

const PROVIDER_PRESETS = {
  openai: {
    providerType: "openai",
    displayName: "OpenAI",
    category: "Text / Vision / Audio",
    authType: "bearer_token",
    headerName: "Authorization",
    tokenPrefix: "Bearer",
    secretName: "OPENAI_API_KEY",
    baseUrl: "https://api.openai.com/v1",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "gpt-5.5",
    imageModel: "gpt-image-1",
    videoModel: "",
    embeddingModel: "text-embedding-3-large",
    fallbackModel: "",
    capabilities: {
      textGeneration: true,
      imageGeneration: true,
      videoGeneration: false,
      embeddings: true,
      vision: true,
      audio: true,
      functionCalling: true,
      structuredOutput: true,
    },
    limits: {
      monthlySoftLimit: "500",
      monthlyHardLimit: "900",
      rpm: "120",
      tpm: "300000",
      maxJobDurationSeconds: "",
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
    },
    requiredFields: ["secretName", "baseUrl", "textModel"],
  },
  anthropic: {
    providerType: "anthropic",
    displayName: "Anthropic Claude",
    category: "Text / Agents",
    authType: "api_key_header",
    headerName: "x-api-key",
    tokenPrefix: "None",
    secretName: "ANTHROPIC_API_KEY",
    baseUrl: "https://api.anthropic.com",
    apiVersion: "2023-06-01",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "claude-sonnet-latest",
    imageModel: "",
    videoModel: "",
    embeddingModel: "",
    fallbackModel: "",
    capabilities: {
      textGeneration: true,
      imageGeneration: false,
      videoGeneration: false,
      embeddings: false,
      vision: true,
      audio: false,
      functionCalling: true,
      structuredOutput: true,
    },
    limits: {
      monthlySoftLimit: "300",
      monthlyHardLimit: "600",
      rpm: "80",
      tpm: "200000",
      maxJobDurationSeconds: "",
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
    },
    requiredFields: ["secretName", "baseUrl", "apiVersion", "textModel"],
  },
  gemini: {
    providerType: "gemini",
    displayName: "Google Gemini",
    category: "Text / Vision / Video / Tools",
    authType: "api_key_header",
    headerName: "x-goog-api-key",
    tokenPrefix: "None",
    secretName: "GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    googleCloudProject: "",
    region: "global",
    textModel: "gemini-3.5-pro",
    imageModel: "",
    videoModel: "",
    embeddingModel: "gemini-embedding",
    fallbackModel: "",
    capabilities: {
      textGeneration: true,
      imageGeneration: true,
      videoGeneration: true,
      embeddings: true,
      vision: true,
      audio: true,
      functionCalling: true,
      structuredOutput: true,
    },
    limits: {
      monthlySoftLimit: "400",
      monthlyHardLimit: "800",
      rpm: "90",
      tpm: "250000",
      maxJobDurationSeconds: "600",
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
    },
    requiredFields: ["secretName", "baseUrl", "googleCloudProject", "textModel"],
  },
  replicate: {
    providerType: "replicate",
    displayName: "Replicate",
    category: "Image / Video / Open Models",
    authType: "bearer_token",
    headerName: "Authorization",
    tokenPrefix: "Bearer",
    secretName: "REPLICATE_API_TOKEN",
    baseUrl: "https://api.replicate.com/v1",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "",
    imageModel: "black-forest-labs/flux-pro",
    videoModel: "",
    embeddingModel: "",
    fallbackModel: "",
    capabilities: {
      textGeneration: false,
      imageGeneration: true,
      videoGeneration: true,
      embeddings: false,
      vision: false,
      audio: false,
      functionCalling: false,
      structuredOutput: false,
    },
    limits: {
      monthlySoftLimit: "250",
      monthlyHardLimit: "500",
      rpm: "40",
      tpm: "",
      maxJobDurationSeconds: "900",
    },
    webhooks: {
      enabled: true,
      secretName: "REPLICATE_WEBHOOK_SECRET",
      callbackUrl: "/api/webhooks/replicate",
    },
    requiredFields: ["secretName", "baseUrl", "imageModel"],
  },
  mistral: {
    providerType: "mistral",
    displayName: "Mistral AI",
    category: "Text / Embeddings",
    authType: "bearer_token",
    headerName: "Authorization",
    tokenPrefix: "Bearer",
    secretName: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "mistral-large-latest",
    imageModel: "",
    videoModel: "",
    embeddingModel: "mistral-embed",
    fallbackModel: "",
    capabilities: {
      textGeneration: true,
      imageGeneration: false,
      videoGeneration: false,
      embeddings: true,
      vision: false,
      audio: false,
      functionCalling: true,
      structuredOutput: true,
    },
    limits: {
      monthlySoftLimit: "250",
      monthlyHardLimit: "500",
      rpm: "80",
      tpm: "200000",
      maxJobDurationSeconds: "",
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
    },
    requiredFields: ["secretName", "baseUrl", "textModel"],
  },
  runway: {
    providerType: "runway",
    displayName: "Runway",
    category: "Video Generation",
    authType: "api_key_header",
    headerName: "Authorization",
    tokenPrefix: "Bearer",
    secretName: "RUNWAY_API_KEY",
    baseUrl: "https://api.dev.runwayml.com",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "",
    imageModel: "",
    videoModel: "gen-3",
    embeddingModel: "",
    fallbackModel: "",
    capabilities: {
      textGeneration: false,
      imageGeneration: false,
      videoGeneration: true,
      embeddings: false,
      vision: false,
      audio: false,
      functionCalling: false,
      structuredOutput: false,
    },
    limits: {
      monthlySoftLimit: "150",
      monthlyHardLimit: "300",
      rpm: "20",
      tpm: "",
      maxJobDurationSeconds: "1200",
    },
    webhooks: {
      enabled: true,
      secretName: "RUNWAY_WEBHOOK_SECRET",
      callbackUrl: "/api/webhooks/runway",
    },
    requiredFields: ["secretName", "baseUrl", "videoModel", "webhookSecretName"],
  },
  custom: {
    providerType: "custom",
    displayName: "Custom Provider",
    category: "Configurable",
    authType: "custom_headers",
    headerName: "Authorization",
    tokenPrefix: "Bearer",
    secretName: "CUSTOM_AI_PROVIDER_KEY",
    baseUrl: "",
    apiVersion: "",
    organizationId: "",
    projectId: "",
    region: "",
    textModel: "",
    imageModel: "",
    videoModel: "",
    embeddingModel: "",
    fallbackModel: "",
    customHeaders: "",
    capabilities: {
      textGeneration: true,
      imageGeneration: false,
      videoGeneration: false,
      embeddings: false,
      vision: false,
      audio: false,
      functionCalling: false,
      structuredOutput: false,
    },
    limits: {
      monthlySoftLimit: "",
      monthlyHardLimit: "",
      rpm: "",
      tpm: "",
      maxJobDurationSeconds: "",
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
    },
    requiredFields: ["secretName", "baseUrl"],
  },
};

const DELIVERY_CHANNELS = [
  ["direct_api", "API مباشر"],
  ["cloud_platform", "منصة سحابية"],
  ["openai_compatible", "متوافق مع OpenAI"],
  ["gateway", "بوابة موحدة"],
  ["proxy", "وسيط Proxy"],
  ["self_hosted", "مستضاف ذاتيًا"],
];

const ENVIRONMENTS = [
  ["sandbox", "تجريبي"],
  ["staging", "اختبار"],
  ["production", "إنتاج"],
];

const AUTH_TYPES = [
  ["bearer_token", "Bearer Token"],
  ["api_key_header", "API Key Header"],
  ["oauth_bearer", "OAuth Bearer"],
  ["workload_identity", "هوية عمل / Workload Identity"],
  ["service_account", "حساب خدمة"],
  ["custom_headers", "ترويسات مخصصة"],
  ["no_auth_local", "بدون مصادقة محليًا"],
];

const DEFAULT_CAPABILITIES = {
  textGeneration: false,
  structuredOutput: false,
  visionInput: false,
  imageGeneration: false,
  videoGeneration: false,
  embeddings: false,
  toolCalling: false,
  streaming: false,
  batch: false,
  files: false,
  webhooks: false,
};

const DEFAULT_OPERATIONAL_SUPPORT = {
  requestIdSupport: false,
  rateLimitHeadersSupport: false,
  usageHeadersSupport: false,
  tokenCountingSupport: false,
};

const PROVIDER_TYPES = [
  ["openai", "OpenAI"],
  ["anthropic", "Anthropic"],
  ["gemini", "Gemini"],
  ["replicate", "Replicate"],
  ["mistral", "Mistral"],
  ["runway", "Runway"],
  ["custom", "Custom"],
];

function createProviderFromPreset(type, override = {}) {
  const preset = PROVIDER_PRESETS[type] || PROVIDER_PRESETS.custom;
  const legacyCapabilities = preset.capabilities || {};
  const capabilities = {
    ...DEFAULT_CAPABILITIES,
    textGeneration: Boolean(legacyCapabilities.textGeneration),
    structuredOutput: Boolean(legacyCapabilities.structuredOutput),
    visionInput: Boolean(legacyCapabilities.visionInput || legacyCapabilities.vision),
    imageGeneration: Boolean(legacyCapabilities.imageGeneration),
    videoGeneration: Boolean(legacyCapabilities.videoGeneration),
    embeddings: Boolean(legacyCapabilities.embeddings),
    toolCalling: Boolean(legacyCapabilities.toolCalling || legacyCapabilities.functionCalling),
    streaming: Boolean(legacyCapabilities.streaming || legacyCapabilities.textGeneration),
    batch: Boolean(legacyCapabilities.batch),
    files: Boolean(legacyCapabilities.files),
    webhooks: Boolean(legacyCapabilities.webhooks || preset.webhooks?.enabled),
  };
  const operationalSupport = {
    ...DEFAULT_OPERATIONAL_SUPPORT,
    ...(preset.operationalSupport || {}),
    requestIdSupport: preset.operationalSupport?.requestIdSupport ?? true,
    rateLimitHeadersSupport: preset.operationalSupport?.rateLimitHeadersSupport ?? true,
    usageHeadersSupport: preset.operationalSupport?.usageHeadersSupport ?? Boolean(capabilities.textGeneration || capabilities.embeddings),
    tokenCountingSupport: preset.operationalSupport?.tokenCountingSupport ?? Boolean(capabilities.textGeneration || capabilities.embeddings),
  };

  return {
    id: `${type}-${Date.now()}`,
    providerType: preset.providerType,
    displayName: preset.displayName,
    category: preset.category,
    status: "draft",
    deliveryChannel: preset.deliveryChannel || (preset.providerType === "gemini" ? "cloud_platform" : "direct_api"),
    environment: preset.environment || "sandbox",
    authType: preset.providerType === "gemini" ? "workload_identity" : preset.authType,
    headerName: preset.headerName,
    tokenPrefix: preset.tokenPrefix,
    secretName: preset.secretName,
    baseUrl: preset.baseUrl,
    apiVersion: preset.apiVersion || "",
    organizationId: preset.organizationId || "",
    projectId: preset.projectId || preset.googleCloudProject || "",
    workspaceId: preset.workspaceId || "",
    serviceAccountRef: preset.serviceAccountRef || (preset.providerType === "gemini" ? "GCP_AI_SERVICE_ACCOUNT" : ""),
    googleCloudProject: preset.googleCloudProject || "",
    region: preset.region || "",
    location: preset.location || preset.region || "",
    deploymentName: preset.deploymentName || "",
    textModel: preset.textModel || "",
    imageModel: preset.imageModel || "",
    videoModel: preset.videoModel || "",
    embeddingModel: preset.embeddingModel || "",
    fallbackModel: preset.fallbackModel || "",
    customHeaders: preset.customHeaders || "",
    capabilities,
    operationalSupport,
    limits: { ...preset.limits },
    governance: {
      humanReviewRequired: true,
      autoPublishAllowed: false,
      allowSensitiveContentGeneration: false,
      logAllRequests: true,
      redactInputs: true,
    },
    webhooks: {
      enabled: false,
      secretName: "",
      callbackUrl: "",
      eventTypes: "",
      lastDeliveryStatus: "",
      ...preset.webhooks,
    },
    metadata: {
      createdAt: "اليوم",
      updatedAt: "الآن",
      lastTestedAt: "",
      lastRotationAt: "",
      ownerRole: "System Admin",
    },
    requiredFields: [...preset.requiredFields],
    ...override,
  };
}

const initialProviders = [
  createProviderFromPreset("openai", {
    id: "openai-main",
    displayName: "OpenAI - Production",
    environment: "production",
    status: "connected",
    metadata: {
      createdAt: "2026-05-01",
      updatedAt: "اليوم",
      lastTestedAt: "منذ ساعة",
      lastRotationAt: "قبل 12 يوم",
      ownerRole: "System Admin",
    },
  }),
  createProviderFromPreset("anthropic", {
    id: "anthropic-review",
    environment: "production",
    status: "missing_required_fields",
  }),
  createProviderFromPreset("replicate", {
    id: "replicate-images",
    displayName: "Replicate - Image/Video",
    environment: "production",
    status: "pending_test",
  }),
];

const statusMap = {
  draft: ["مسودة", "slate"],
  missing_required_fields: ["حقول ناقصة", "amber"],
  pending_test: ["بانتظار الاختبار", "blue"],
  connected: ["متصل", "green"],
  failed: ["فشل", "red"],
  disabled: ["معطل", "slate"],
};

function getReadinessLabel(status) {
  const labels = {
    ready: "جاهز",
    warning: "يحتاج ضبط",
    blocked: "محظور",
  };

  return labels[status] || "يحتاج ضبط";
}

function getRequiredFieldLabel(field) {
  const labels = {
    secretName: "مرجع السر",
    baseUrl: "العنوان الأساسي",
    textModel: "نموذج النصوص",
    imageModel: "نموذج الصور",
    videoModel: "نموذج الفيديو",
    embeddingModel: "نموذج التضمين",
    webhookSecretName: "سر Webhook",
    apiVersion: "إصدار API",
    organizationId: "معرف المنظمة",
    projectId: "معرف المشروع",
    workspaceId: "معرف مساحة العمل",
    serviceAccountRef: "مرجع حساب الخدمة",
    region: "المنطقة",
    location: "الموقع",
    deploymentName: "اسم النشر",
    googleCloudProject: "معرف المشروع",
  };

  return labels[field] || field;
}

function getOptionLabel(options, value) {
  return options.find(([id]) => id === value)?.[1] || value || "غير محدد";
}

function normalizeCapabilities(capabilities = {}) {
  return {
    ...DEFAULT_CAPABILITIES,
    textGeneration: Boolean(capabilities.textGeneration),
    structuredOutput: Boolean(capabilities.structuredOutput),
    visionInput: Boolean(capabilities.visionInput || capabilities.vision),
    imageGeneration: Boolean(capabilities.imageGeneration),
    videoGeneration: Boolean(capabilities.videoGeneration),
    embeddings: Boolean(capabilities.embeddings),
    toolCalling: Boolean(capabilities.toolCalling || capabilities.functionCalling),
    streaming: Boolean(capabilities.streaming),
    batch: Boolean(capabilities.batch),
    files: Boolean(capabilities.files),
    webhooks: Boolean(capabilities.webhooks),
  };
}

function getCredentialScope(provider = {}) {
  const values = [
    provider.organizationId ? "معرف المنظمة" : "",
    provider.projectId || provider.googleCloudProject ? "معرف المشروع" : "",
    provider.workspaceId ? "معرف مساحة العمل" : "",
    provider.serviceAccountRef ? "مرجع حساب الخدمة" : "",
  ].filter(Boolean);

  return values.length ? values.join("، ") : "غير محدد";
}

function authRequiresSecret(authType) {
  return ["bearer_token", "api_key_header", "oauth_bearer", "custom_headers"].includes(authType);
}

function isCloudStyleProvider(provider = {}) {
  const providerType = String(provider.providerType || "").toLowerCase();
  return ["google", "vertex", "gemini", "google_vertex"].includes(providerType);
}

function getConfiguredModels(provider = {}) {
  return [
    provider.textModel,
    provider.imageModel,
    provider.videoModel,
    provider.embeddingModel,
    provider.fallbackModel,
  ].filter(Boolean);
}

function buildProviderReadiness(provider) {
  const checks = [];
  const warnings = [];
  const blockedReasons = [];

  if (!provider) {
    return {
      status: "blocked",
      score: 0,
      checks: [],
      warnings: [],
      blockedReasons: ["لا يوجد مزود محدد."],
    };
  }

  const capabilities = normalizeCapabilities(provider.capabilities);
  const governance = provider.governance || {};
  const webhooks = provider.webhooks || {};
  const requiredFields = Array.isArray(provider.requiredFields) ? provider.requiredFields : [];
  const enabledCapabilities = Object.entries(capabilities).filter(([, enabled]) => Boolean(enabled));
  const configuredModels = getConfiguredModels(provider);

  checks.push("المزود موجود.");

  if (provider.providerType) checks.push("نوع المزود محدد.");
  else blockedReasons.push("نوع المزود غير محدد.");

  if (provider.deliveryChannel) checks.push("قناة الوصول محددة.");
  else blockedReasons.push("قناة الوصول غير محددة.");

  if (provider.environment) checks.push("البيئة محددة.");
  else blockedReasons.push("البيئة غير محددة.");

  if (provider.authType) checks.push("طريقة المصادقة محددة.");
  else blockedReasons.push("طريقة المصادقة غير محددة.");

  if (authRequiresSecret(provider.authType)) {
    if (String(provider.secretName || "").trim()) checks.push("مرجع السر محدد.");
    else blockedReasons.push("مرجع السر مطلوب.");
  } else {
    checks.push("طريقة المصادقة لا تتطلب مرجع سر مباشر.");
  }

  if (requiredFields.includes("baseUrl")) {
    if (String(provider.baseUrl || "").trim()) checks.push("العنوان الأساسي محدد.");
    else blockedReasons.push("العنوان الأساسي مطلوب.");
  } else if (!String(provider.baseUrl || "").trim()) {
    warnings.push("العنوان الأساسي غير محدد.");
  }

  if (requiredFields.includes("apiVersion")) {
    if (String(provider.apiVersion || "").trim()) checks.push("إصدار API محدد.");
    else blockedReasons.push("إصدار API مطلوب لهذا المزود.");
  }

  if (provider.deliveryChannel === "cloud_platform" && isCloudStyleProvider(provider)) {
    if (String(provider.projectId || provider.googleCloudProject || "").trim()) checks.push("معرف المشروع محدد.");
    else blockedReasons.push("معرف المشروع مطلوب لقناة المنصة السحابية.");

    if (String(provider.location || provider.region || "").trim()) checks.push("الموقع أو المنطقة محددة.");
    else blockedReasons.push("الموقع مطلوب لقناة المنصة السحابية.");
  }

  if (["service_account", "workload_identity"].includes(provider.authType)) {
    if (String(provider.serviceAccountRef || "").trim()) checks.push("مرجع حساب الخدمة محدد.");
    else blockedReasons.push("مرجع حساب الخدمة مطلوب لطريقة المصادقة الحالية.");
  }

  if (provider.providerType === "openai" && provider.environment === "production" && !String(provider.projectId || "").trim()) {
    warnings.push("يفضل تحديد معرف المشروع لمزود OpenAI في بيئة الإنتاج.");
  }

  if (provider.providerType === "anthropic" && provider.environment === "production" && !String(provider.workspaceId || "").trim()) {
    warnings.push("يفضل تحديد معرف مساحة العمل لمزود Anthropic في بيئة الإنتاج.");
  }

  const modelRequirements = [
    ["textModel", "textGeneration", "نموذج النصوص"],
    ["imageModel", "imageGeneration", "نموذج الصور"],
    ["videoModel", "videoGeneration", "نموذج الفيديو"],
    ["embeddingModel", "embeddings", "نموذج التضمين"],
  ];

  modelRequirements.forEach(([field, capability, label]) => {
    const required = requiredFields.includes(field) || capabilities[capability];
    if (!required) return;
    if (String(provider[field] || "").trim()) checks.push(`${label} مهيأ.`);
    else blockedReasons.push(`${label} مطلوب عند تفعيل القدرة المرتبطة.`);
  });

  if (configuredModels.length) checks.push("يوجد نموذج واحد مهيأ على الأقل.");
  else blockedReasons.push("يجب تهيئة نموذج واحد على الأقل لاستخدامه في التوجيه.");

  if (webhooks.enabled || requiredFields.includes("webhookSecretName")) {
    if (String(webhooks.secretName || "").trim()) checks.push("سر Webhook محدد.");
    else blockedReasons.push("سر Webhook مطلوب عند تفعيل Webhook.");
  }

  if (enabledCapabilities.length) checks.push("يوجد على الأقل قدرة مفعلة.");
  else blockedReasons.push("لا توجد قدرات مفعلة للمزود.");

  if (governance.autoPublishAllowed) {
    blockedReasons.push("النشر التلقائي غير آمن لهذا المزود.");
  } else {
    checks.push("النشر التلقائي غير مفعل.");
  }

  if (provider.metadata?.lastTestedAt) {
    checks.push("آخر اختبار موجود.");
  } else if (provider.environment === "production") {
    warnings.push("مزود الإنتاج يحتاج تسجيل اختبار قبل الاعتماد.");
  } else {
    warnings.push("لم يتم تسجيل آخر اختبار بعد.");
  }

  if (provider.status === "disabled") {
    blockedReasons.push("المزود معطل.");
  } else if (provider.status === "failed") {
    blockedReasons.push("آخر اختبار للمزود فشل.");
  } else if (provider.status === "pending_test" || provider.status === "draft") {
    warnings.push("المزود يحتاج اختبارًا أو استكمال ضبط.");
  } else if (provider.status === "missing_required_fields") {
    warnings.push("هناك حقول مطلوبة تحتاج استكمالًا.");
  }

  const score = Math.max(0, 100 - blockedReasons.length * 35 - warnings.length * 8);
  const status = blockedReasons.length ? "blocked" : warnings.length ? "warning" : "ready";

  return {
    status,
    score,
    checks,
    warnings,
    blockedReasons,
  };
}

export default function SecretsAndKeysPage() {
  const [providers, setProviders] = useState(initialProviders);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviders[0].id);
  const [draftPreset, setDraftPreset] = useState("openai");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [testLog, setTestLog] = useState([]);

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) ||
    providers[0] ||
    createProviderFromPreset("custom", { id: "empty-provider", displayName: "مزود غير محدد" });

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) =>
      `${provider.displayName} ${provider.providerType} ${provider.category}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [providers, query]);

  const stats = useMemo(() => {
    return {
      total: providers.length,
      connected: providers.filter((p) => p.status === "connected").length,
      missing: providers.filter((p) => p.status === "missing_required_fields").length,
      autoPublishUnsafe: providers.filter((p) => p.governance?.autoPublishAllowed).length,
    };
  }, [providers]);

  const updateProvider = (id, patch) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === id
          ? {
              ...provider,
              ...patch,
              metadata: {
                ...provider.metadata,
                updatedAt: "الآن",
              },
            }
          : provider
      )
    );
  };

  const updateSelected = (key, value) => {
    updateProvider(selectedProvider.id, {
      [key]: value,
      status: selectedProvider.status === "connected" ? "pending_test" : selectedProvider.status,
    });
  };

  const updateNested = (section, key, value) => {
    updateProvider(selectedProvider.id, {
      [section]: {
        ...(selectedProvider[section] || {}),
        [key]: value,
      },
      status: selectedProvider.status === "connected" ? "pending_test" : selectedProvider.status,
    });
  };

  const changeProviderType = (type) => {
    const presetProvider = createProviderFromPreset(type, {
      id: selectedProvider.id,
      status: "draft",
      metadata: {
        ...selectedProvider.metadata,
        updatedAt: "الآن",
      },
    });

    updateProvider(selectedProvider.id, presetProvider);
  };

  const addProvider = () => {
    const next = createProviderFromPreset(draftPreset);
    setProviders((prev) => [next, ...prev]);
    setSelectedProviderId(next.id);
    setDrawerOpen(true);
  };

  const removeProvider = (id) => {
    if (providers.length === 1) return;
    const next = providers.filter((provider) => provider.id !== id);
    setProviders(next);
    if (selectedProviderId === id) {
      setSelectedProviderId(next[0].id);
    }
  };

  const duplicateProvider = (provider) => {
    const copy = {
      ...provider,
      id: `${provider.providerType}-${Date.now()}`,
      displayName: `${provider.displayName} نسخة`,
      status: "draft",
      metadata: {
        createdAt: "اليوم",
        updatedAt: "الآن",
        lastTestedAt: "",
        lastRotationAt: "",
        ownerRole: "System Admin",
      },
    };

    setProviders((prev) => [copy, ...prev]);
    setSelectedProviderId(copy.id);
  };

  const validateProvider = (provider) => {
    const missing = [];
    const requiredFields = Array.isArray(provider?.requiredFields) ? provider.requiredFields : [];
    const readiness = buildProviderReadiness(provider);

    requiredFields.forEach((field) => {
      if (field === "secretName" && !authRequiresSecret(provider.authType)) {
        return;
      }

      if (field === "webhookSecretName") {
        if (!provider.webhooks?.secretName) missing.push(getRequiredFieldLabel(field));
        return;
      }

      if (field === "googleCloudProject") {
        if (!String(provider.projectId || provider.googleCloudProject || "").trim()) {
          missing.push(getRequiredFieldLabel("projectId"));
        }
        return;
      }

      if (!String(provider[field] || "").trim()) {
        missing.push(getRequiredFieldLabel(field));
      }
    });

    return [...new Set([...missing, ...readiness.blockedReasons])];
  };

  const testConnection = (provider = selectedProvider) => {
    const readiness = buildProviderReadiness(provider);
    const missing = validateProvider(provider);

    if (readiness.status === "blocked" || missing.length) {
      updateProvider(provider.id, { status: "failed" });
      setTestLog((prev) => [
        {
          id: Date.now(),
          provider: provider.displayName,
          status: "failed",
          message: `محظور: ${readiness.blockedReasons[0] || missing.join("، ")}`,
          time: "الآن",
        },
        ...prev,
      ]);
      return;
    }

    updateProvider(provider.id, {
      status: "connected",
      metadata: {
        ...provider.metadata,
        lastTestedAt: "الآن",
        updatedAt: "الآن",
      },
    });

    setTestLog((prev) => [
      {
        id: Date.now(),
        provider: provider.displayName,
        status: readiness.status === "warning" ? "warning" : "success",
        message: readiness.status === "warning"
          ? `يحتاج ضبط: ${readiness.warnings[0] || "راجع إعدادات المزود."}`
          : "جاهز: تم فحص الإعدادات محليًا دون تنفيذ اتصال حقيقي.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const rotateKey = (provider) => {
    updateProvider(provider.id, {
      status: "pending_test",
      metadata: {
        ...provider.metadata,
        lastRotationAt: "الآن",
        updatedAt: "الآن",
      },
    });

    setTestLog((prev) => [
      {
        id: Date.now(),
        provider: provider.displayName,
        status: "warning",
        message: "تم تحديث مرجع السر كمحاكاة. يجب اختبار المزود بعد التحديث.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const saveLocal = () => {
    setTestLog((prev) => [
      {
        id: Date.now(),
        provider: "System",
        status: "success",
        message: "تم حفظ إعدادات الجدول في النموذج الأولي. لا توجد قيم مفاتيح محفوظة.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  return (
    <main className="secrets-unified-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <KeyRound size={15} />
            الأسرار والمفاتيح
          </div>
          <h1>إدارة مزودي الذكاء الاصطناعي بنموذج موحّد</h1>
          <p>
            جدول موحد لكل المزودين مع إعدادات جاهزة. نفس النموذج يُستخدم
            للجميع، وتظهر الحقول المطلوبة حسب نوع المزود.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button" onClick={saveLocal}>
            <Save size={16} />
            حفظ محلي
          </button>
          <button type="button" className="primary-button" onClick={addProvider}>
            <Plus size={16} />
            إضافة مزود
          </button>
        </div>
      </section>

      <section className="governance-alert">
        <CircleAlert size={20} />
        <div>
          <strong>قاعدة أمان إلزامية</strong>
          <p>
            هذه الشاشة تحفظ أسماء مراجع الأسرار فقط، ولا تحفظ أو تعرض قيم المفاتيح.
            أي اختبار أو تدوير هنا محلي داخل النموذج الأولي.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="إجمالي المزودين" value={stats.total} icon={Bot} tone="blue" />
        <Stat title="متصل" value={stats.connected} icon={CheckCircle2} tone="green" />
        <Stat title="حقول ناقصة" value={stats.missing} icon={AlertTriangle} tone="amber" />
        <Stat title="نشر تلقائي مخالف" value={stats.autoPublishUnsafe} icon={Lock} tone="red" />
      </section>

      <section className="toolbar-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            placeholder="ابحث باسم المزود أو النوع..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="add-provider-inline">
          <select value={draftPreset} onChange={(event) => setDraftPreset(event.target.value)}>
            {PROVIDER_TYPES.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          <button type="button" className="secondary-button" onClick={addProvider}>
            <Plus size={16} />
            إضافة من إعداد جاهز
          </button>
        </div>
      </section>

      <section className="main-layout">
        <article className="providers-table-card">
          <div className="card-header">
            <div>
              <h2>جدول المزودين</h2>
              <p>كل مزود يستخدم نفس النموذج، مع حقول مطلوبة حسب نوعه.</p>
            </div>

            <button type="button" className="secondary-button" onClick={() => setDrawerOpen((value) => !value)}>
              <SlidersHorizontal size={16} />
              {drawerOpen ? "إخفاء النموذج" : "إظهار النموذج"}
            </button>
          </div>

          <div className="providers-table">
            <div className="table-head">
              <span>المزود</span>
              <span>النوع</span>
              <span>الحالة</span>
              <span>النموذج</span>
              <span>الميزانية</span>
              <span>القدرات</span>
              <span>جاهزية المزود</span>
              <span>الإجراءات</span>
            </div>

            {filteredProviders.map((provider) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                selected={provider.id === selectedProvider.id}
                onSelect={() => {
                  setSelectedProviderId(provider.id);
                  setDrawerOpen(true);
                }}
                onTest={() => testConnection(provider)}
                onRotate={() => rotateKey(provider)}
                onDuplicate={() => duplicateProvider(provider)}
                onDelete={() => removeProvider(provider.id)}
              />
            ))}
          </div>
        </article>

        {drawerOpen ? (
          <aside className="drawer-card">
            <div className="drawer-header">
              <div>
                <h2>نموذج المزود الموحد</h2>
                <p>{selectedProvider.displayName}</p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <SelectField
                label="نوع المزود"
                value={selectedProvider.providerType}
                options={PROVIDER_TYPES}
                onChange={changeProviderType}
              />

              <SelectField
                label="قناة الوصول"
                value={selectedProvider.deliveryChannel || "direct_api"}
                options={DELIVERY_CHANNELS}
                onChange={(value) => updateSelected("deliveryChannel", value)}
              />

              <SelectField
                label="البيئة"
                value={selectedProvider.environment || "sandbox"}
                options={ENVIRONMENTS}
                onChange={(value) => updateSelected("environment", value)}
              />

              <Field
                label="اسم العرض"
                value={selectedProvider.displayName}
                onChange={(value) => updateSelected("displayName", value)}
                required
              />

              <SelectField
                label="طريقة المصادقة"
                value={selectedProvider.authType || "bearer_token"}
                options={AUTH_TYPES}
                onChange={(value) => updateSelected("authType", value)}
              />

              <Field
                label="اسم الترويسة"
                value={selectedProvider.headerName}
                onChange={(value) => updateSelected("headerName", value)}
              />

              <SelectField
                label="بادئة المصادقة"
                value={selectedProvider.tokenPrefix}
                options={[
                  ["Bearer", "Bearer"],
                  ["Token", "Token"],
                  ["None", "None"],
                ]}
                onChange={(value) => updateSelected("tokenPrefix", value)}
              />

              <Field
                label="اسم مرجع السر"
                value={selectedProvider.secretName}
                onChange={(value) => updateSelected("secretName", value)}
                required
                helper="اسم مرجع السر فقط، وليس قيمة المفتاح."
              />

              <Field
                label="العنوان الأساسي"
                value={selectedProvider.baseUrl}
                onChange={(value) => updateSelected("baseUrl", value)}
                required={(selectedProvider.requiredFields || []).includes("baseUrl")}
              />

              <Field
                label="إصدار API"
                value={selectedProvider.apiVersion}
                onChange={(value) => updateSelected("apiVersion", value)}
                required={(selectedProvider.requiredFields || []).includes("apiVersion")}
              />

              <div className="form-subsection wide">
                <strong>نطاق الاعتماد</strong>
                <small>حقول اختيارية لتقسيم المزود حسب منظمة أو مشروع أو مساحة عمل.</small>
              </div>

              <Field
                label="معرف المنظمة"
                value={selectedProvider.organizationId}
                onChange={(value) => updateSelected("organizationId", value)}
              />

              <Field
                label="معرف المشروع"
                value={selectedProvider.projectId || selectedProvider.googleCloudProject}
                onChange={(value) => updateSelected("projectId", value)}
                required={(selectedProvider.requiredFields || []).includes("projectId") || selectedProvider.deliveryChannel === "cloud_platform"}
              />

              <Field
                label="معرف مساحة العمل"
                value={selectedProvider.workspaceId}
                onChange={(value) => updateSelected("workspaceId", value)}
              />

              <Field
                label="مرجع حساب الخدمة"
                value={selectedProvider.serviceAccountRef}
                onChange={(value) => updateSelected("serviceAccountRef", value)}
                required={["service_account", "workload_identity"].includes(selectedProvider.authType)}
                helper="مرجع فقط، وليس ملف اعتماد أو قيمة سرية."
              />

              <Field
                label="المنطقة"
                value={selectedProvider.region}
                onChange={(value) => updateSelected("region", value)}
              />

              <Field
                label="الموقع"
                value={selectedProvider.location}
                onChange={(value) => updateSelected("location", value)}
                required={(selectedProvider.requiredFields || []).includes("location") || selectedProvider.deliveryChannel === "cloud_platform"}
              />

              <Field
                label="اسم النشر"
                value={selectedProvider.deploymentName}
                onChange={(value) => updateSelected("deploymentName", value)}
              />

              <div className="form-subsection wide">
                <strong>النماذج المهيأة</strong>
                <small>هذه ليست قائمة كل نماذج المزود؛ بل النماذج المختارة للاستخدام داخل التوجيه والتشغيل.</small>
              </div>

              <Field
                label="نموذج النصوص"
                value={selectedProvider.textModel}
                onChange={(value) => updateSelected("textModel", value)}
                required={(selectedProvider.requiredFields || []).includes("textModel")}
              />

              <Field
                label="نموذج الصور"
                value={selectedProvider.imageModel}
                onChange={(value) => updateSelected("imageModel", value)}
              />

              <Field
                label="نموذج الفيديو"
                value={selectedProvider.videoModel}
                onChange={(value) => updateSelected("videoModel", value)}
                required={(selectedProvider.requiredFields || []).includes("videoModel")}
              />

              <Field
                label="نموذج التضمين"
                value={selectedProvider.embeddingModel}
                onChange={(value) => updateSelected("embeddingModel", value)}
              />

              <Field
                label="النموذج البديل"
                value={selectedProvider.fallbackModel}
                onChange={(value) => updateSelected("fallbackModel", value)}
              />

              <Field
                label="الحد الشهري المرن"
                value={selectedProvider.limits?.monthlySoftLimit}
                onChange={(value) => updateNested("limits", "monthlySoftLimit", value)}
              />

              <Field
                label="الحد الشهري الصارم"
                value={selectedProvider.limits?.monthlyHardLimit}
                onChange={(value) => updateNested("limits", "monthlyHardLimit", value)}
              />

              <Field
                label="حد الطلبات في الدقيقة"
                value={selectedProvider.limits?.rpm}
                onChange={(value) => updateNested("limits", "rpm", value)}
              />

              <Field
                label="حد الرموز في الدقيقة"
                value={selectedProvider.limits?.tpm}
                onChange={(value) => updateNested("limits", "tpm", value)}
              />

              <Field
                label="أقصى مدة تشغيل بالثواني"
                value={selectedProvider.limits?.maxJobDurationSeconds}
                onChange={(value) => updateNested("limits", "maxJobDurationSeconds", value)}
              />

              <TextArea
                label="بيانات تعريف إضافية"
                value={selectedProvider.customHeaders}
                onChange={(value) => updateSelected("customHeaders", value)}
                wide
              />
            </div>

            <ProviderReadinessPanel provider={selectedProvider} />

            <RoutingImpactPanel />

            <Section title="القدرات">
              <ToggleGrid
                source={normalizeCapabilities(selectedProvider.capabilities)}
                onChange={(key, value) => updateNested("capabilities", key, value)}
              />
            </Section>

            <Section title="دعم التشغيل والمراقبة">
              <ToggleGrid
                source={{ ...DEFAULT_OPERATIONAL_SUPPORT, ...(selectedProvider.operationalSupport || {}) }}
                onChange={(key, value) => updateNested("operationalSupport", key, value)}
              />
            </Section>

            <Section title="الحوكمة">
              <ToggleGrid
                source={selectedProvider.governance || {}}
                onChange={(key, value) => updateNested("governance", key, value)}
                dangerKeys={["autoPublishAllowed", "allowSensitiveContentGeneration"]}
              />
            </Section>

            <Section title="Webhook">
              <div className="form-grid">
                <Toggle
                  label="Webhook مفعّل"
                  checked={Boolean(selectedProvider.webhooks?.enabled)}
                  onChange={(value) => updateNested("webhooks", "enabled", value)}
                />
                <Field
                  label="مرجع سر Webhook"
                  value={selectedProvider.webhooks?.secretName}
                  onChange={(value) => updateNested("webhooks", "secretName", value)}
                  required={(selectedProvider.requiredFields || []).includes("webhookSecretName")}
                />
                <Field
                  label="رابط الاستدعاء"
                  value={selectedProvider.webhooks?.callbackUrl}
                  onChange={(value) => updateNested("webhooks", "callbackUrl", value)}
                />
                <TextArea
                  label="أنواع الأحداث"
                  value={selectedProvider.webhooks?.eventTypes}
                  onChange={(value) => updateNested("webhooks", "eventTypes", value)}
                />
                <Field
                  label="آخر حالة تسليم"
                  value={selectedProvider.webhooks?.lastDeliveryStatus}
                  onChange={(value) => updateNested("webhooks", "lastDeliveryStatus", value)}
                />
              </div>
            </Section>

            <div className="drawer-actions">
              <button type="button" className="secondary-button" onClick={() => duplicateProvider(selectedProvider)}>
                <Copy size={16} />
                نسخ المزود
              </button>
              <button type="button" className="secondary-button" onClick={() => rotateKey(selectedProvider)}>
                <RefreshCw size={16} />
                تحديث مرجع السر
              </button>
              <button type="button" className="primary-button" onClick={() => testConnection(selectedProvider)}>
                <TestTube2 size={16} />
                اختبار الاتصال
              </button>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="audit-grid">
        <article className="side-card">
          <div className="side-icon">
            <ShieldCheck size={22} />
          </div>
          <h3>قواعد الحوكمة المطبقة</h3>
          <Checklist ok label="نموذج موحد لكل المزودين" />
          <Checklist ok label="مرجع السر بدل قيمة المفتاح" />
          <Checklist ok label="النشر التلقائي مغلق افتراضيًا" />
          <Checklist ok label="مراجعة بشرية مفعلة" />
          <Checklist ok label="حدود تكلفة واستخدام" />
        </article>

        <article className="side-card">
          <div className="side-icon warning">
            <AlertTriangle size={22} />
          </div>
          <h3>ممنوعات أمان</h3>
          <ul>
            <li>لا تحفظ قيمة المفتاح داخل الواجهة.</li>
            <li>لا ترسل المفتاح مباشرة من المتصفح إلى المزود.</li>
            <li>لا تعرض المفتاح الحقيقي بعد حفظه.</li>
            <li>لا تفعّل النشر التلقائي بدون صلاحيات وحوكمة تشغيل.</li>
          </ul>
        </article>

        <article className="side-card">
          <h3>سجل الاختبار</h3>
          <div className="test-log">
            {testLog.length ? (
              testLog.map((log) => (
                <div key={log.id} className={`test-row ${log.status}`}>
                  <strong>{log.provider}</strong>
                  <span>{log.message}</span>
                  <small>{log.time}</small>
                </div>
              ))
            ) : (
              <p className="empty-log">لم يتم اختبار أي مزود بعد.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

function ProviderRow({
  provider,
  selected,
  onSelect,
  onTest,
  onRotate,
  onDuplicate,
  onDelete,
}) {
  const [statusText, statusTone] = statusMap[provider.status] || statusMap.draft;
  const readiness = buildProviderReadiness(provider);
  const capabilities = Object.entries(normalizeCapabilities(provider.capabilities))
    .filter(([, enabled]) => enabled)
    .map(([key]) => capabilityLabel(key));

  const defaultModel =
    provider.textModel ||
    provider.imageModel ||
    provider.videoModel ||
    provider.embeddingModel ||
    "—";

  return (
    <div className={`table-row ${selected ? "selected" : ""}`}>
      <button type="button" className="provider-main" onClick={onSelect}>
        <div className="provider-avatar">
          <Bot size={18} />
        </div>
        <div>
          <strong>{provider.displayName}</strong>
          <span>{provider.category}</span>
        </div>
      </button>

      <span>{provider.providerType}</span>

      <span className={`status-badge ${statusTone}`}>{statusText}</span>

      <span className="model-cell">{defaultModel}</span>

      <span>{provider.limits?.monthlyHardLimit || "—"}</span>

      <div className="capability-pills">
        {capabilities.slice(0, 3).map((capability) => (
          <small key={capability}>{capability}</small>
        ))}
        {capabilities.length > 3 ? <small>+{capabilities.length - 3}</small> : null}
      </div>

      <ReadinessBadge status={readiness.status} />

      <div className="row-actions">
        <button type="button" onClick={onSelect}>تعديل</button>
        <button type="button" onClick={onTest}>اختبار</button>
        <button type="button" onClick={onRotate}>تدوير</button>
        <button type="button" onClick={onDuplicate}>نسخ</button>
        <button type="button" className="danger" onClick={onDelete}>حذف</button>
      </div>
    </div>
  );
}

function ReadinessBadge({ status }) {
  return <span className={`readiness-badge ${status}`}>{getReadinessLabel(status)}</span>;
}

function ProviderReadinessPanel({ provider }) {
  const readiness = buildProviderReadiness(provider);
  const configuredModels = getConfiguredModels(provider);
  const capabilities = Object.entries(normalizeCapabilities(provider.capabilities)).filter(([, enabled]) => enabled);
  const lastTest = provider.metadata?.lastTestedAt || "لم يتم الاختبار";

  return (
    <section className={`provider-readiness-panel ${readiness.status}`}>
      <div className="readiness-head">
        <div>
          <strong>جاهزية المزود</strong>
          <span>جاهزية المزود تكمل جاهزية المسار والتكلفة والمطالبة. · {readiness.score}%</span>
        </div>
        <ReadinessBadge status={readiness.status} />
      </div>

      <div className="readiness-grid">
        <Info label="حالة الجاهزية" value={getReadinessLabel(readiness.status)} />
        <Info label="الدرجة" value={`${readiness.score}%`} />
        <Info label="نوع المزود" value={provider.providerType} />
        <Info label="قناة الوصول" value={getOptionLabel(DELIVERY_CHANNELS, provider.deliveryChannel)} />
        <Info label="البيئة" value={getOptionLabel(ENVIRONMENTS, provider.environment)} />
        <Info label="طريقة المصادقة" value={getOptionLabel(AUTH_TYPES, provider.authType)} />
        <Info label="مرجع السر" value={provider.secretName || "غير محدد"} />
        <Info label="نطاق الاعتماد" value={getCredentialScope(provider)} />
        <Info label="العنوان الأساسي" value={provider.baseUrl || "غير محدد"} />
        <Info label="النماذج المهيأة" value={configuredModels.length ? `${configuredModels.length}` : "غير مهيأة"} />
        <Info label="القدرات" value={capabilities.length ? `${capabilities.length}` : "غير مفعلة"} />
        <Info label="Webhook" value={provider.webhooks?.enabled ? "مفعل" : "غير مفعل"} />
        <Info label="آخر اختبار" value={lastTest} />
        <Info label="أثره على توجيه النماذج" value="يؤثر على جاهزية المسار قبل التشغيل" />
      </div>

      <div className="readiness-notes blocked-notes">
        <strong>أسباب الحظر</strong>
        {readiness.blockedReasons.length
          ? readiness.blockedReasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))
          : <span>لا توجد أسباب حظر</span>}
      </div>

      <div className="readiness-notes warning-notes">
        <strong>تحذيرات</strong>
        {readiness.warnings.length
          ? readiness.warnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))
          : <span>لا توجد تحذيرات</span>}
      </div>

      <div className="readiness-notes check-notes">
        <strong>الفحوصات الناجحة</strong>
        {readiness.checks.slice(0, 5).map((check) => (
          <span key={check}>{check}</span>
        ))}
      </div>
    </section>
  );
}

function RoutingImpactPanel() {
  return (
    <section className="routing-impact-panel">
      <h3>قابلية الربط</h3>
      <p>هذه الحقول تحدد كيف يمكن ربط المزود لاحقًا بمسارات النماذج والتكلفة والتشغيلات دون حفظ أي قيمة سرية.</p>
      <div className="link-readiness-grid">
        <Info label="توجيه النماذج" value="يعتمد على نوع المزود، النماذج، والقدرات" />
        <Info label="مراقبة التكلفة" value="تعتمد على البيئة ودعم ترويسات الاستهلاك" />
        <Info label="تشغيلات النظام" value="تعتمد على قناة الوصول وجاهزية المراجعة" />
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-cell">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function capabilityLabel(key) {
  const labels = {
    textGeneration: "توليد النصوص",
    structuredOutput: "مخرجات منظمة",
    visionInput: "إدخال بصري",
    imageGeneration: "توليد الصور",
    videoGeneration: "توليد الفيديو",
    embeddings: "التضمين",
    toolCalling: "استدعاء الأدوات",
    streaming: "البث",
    batch: "المعالجة الدُفعية",
    files: "الملفات",
    webhooks: "Webhooks",
  };
  return labels[key] || key;
}

function Stat({ title, value, icon: Icon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-icon">
        <Icon size={21} />
      </div>
    </article>
  );
}

function Field({ label, value, onChange, required, helper }) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? <b>مطلوب</b> : null}
      </span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function TextArea({ label, value, onChange, wide }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {options.map(([id, labelText]) => (
          <option key={id} value={id}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="config-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ToggleGrid({ source, onChange, dangerKeys = [] }) {
  return (
    <div className="toggle-grid">
      {Object.entries(source).map(([key, value]) => (
        <Toggle
          key={key}
          label={formatKey(key)}
          checked={Boolean(value)}
          onChange={(next) => onChange(key, next)}
          danger={dangerKeys.includes(key)}
        />
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange, danger }) {
  return (
    <div className={`toggle-row ${danger ? "danger" : ""}`}>
      <span>{label}</span>
      <button type="button" className={`switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
        <i />
      </button>
    </div>
  );
}

function formatKey(key) {
  const labels = {
    textGeneration: "توليد النصوص",
    structuredOutput: "مخرجات منظمة",
    visionInput: "إدخال بصري",
    imageGeneration: "توليد الصور",
    videoGeneration: "توليد الفيديو",
    embeddings: "التضمين",
    toolCalling: "استدعاء الأدوات",
    streaming: "البث",
    batch: "المعالجة الدُفعية",
    files: "الملفات",
    webhooks: "Webhooks",
    requestIdSupport: "يدعم معرف الطلب",
    rateLimitHeadersSupport: "يدعم ترويسات حدود الاستخدام",
    usageHeadersSupport: "يدعم ترويسات الاستهلاك",
    tokenCountingSupport: "يدعم حساب الرموز",
    humanReviewRequired: "مراجعة بشرية",
    autoPublishAllowed: "السماح بالنشر التلقائي",
    allowSensitiveContentGeneration: "السماح بالمحتوى الحساس",
    logAllRequests: "تسجيل الطلبات",
    redactInputs: "إخفاء المدخلات الحساسة",
  };

  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function Checklist({ ok, label }) {
  return (
    <div className="check-row">
      {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{label}</span>
    </div>
  );
}

const styles = `
.secrets-unified-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.governance-alert,
.stat-card,
.toolbar-card,
.providers-table-card,
.drawer-card,
.side-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.page-title {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.eyebrow {
  width: fit-content;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 7px 0 0;
  max-width: 850px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.title-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  color: #fff;
  border: 0;
  background: #1d4ed8;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.16);
}

.secondary-button {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.governance-alert {
  margin-bottom: 16px;
  border-color: #fde68a;
  background: #fff7e6;
  color: #92400e;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.governance-alert strong {
  display: block;
  margin-bottom: 4px;
}

.governance-alert p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 104px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card span {
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
}

.stat-card.green .stat-icon {
  color: #166534;
  background: #f0fdf4;
}

.stat-card.amber .stat-icon {
  color: #92400e;
  background: #fffbeb;
}

.stat-card.blue .stat-icon {
  color: #1d4ed8;
  background: #eff6ff;
}

.stat-card.red .stat-icon {
  color: #991b1b;
  background: #fef2f2;
}

.toolbar-card {
  min-height: 72px;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  height: 44px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font-family: inherit;
  background: transparent;
}

.add-provider-inline {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-provider-inline select {
  min-height: 42px;
  border: 1px solid #e4e7df;
  border-radius: 16px;
  padding: 0 12px;
  font-family: inherit;
}

.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 16px;
  align-items: start;
}

.providers-table-card,
.drawer-card,
.side-card {
  padding: 18px;
}

.card-header,
.drawer-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.card-header h2,
.drawer-header h2,
.side-card h3,
.config-section h3 {
  margin: 0;
  font-size: 18px;
}

.card-header p,
.drawer-header p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
}

.drawer-header button {
  width: 36px;
  height: 36px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.providers-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(210px, 1.1fr) 85px 95px 135px 75px 145px 105px 240px;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
}

.table-head {
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.table-row {
  border-top: 1px solid #e4e7df;
  background: #fff;
  font-size: 12px;
}

.table-row.selected {
  background: #f8fbff;
}

.provider-main {
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.provider-avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #1d4ed8;
  background: #eff6ff;
  flex: 0 0 auto;
}

.provider-main strong,
.provider-main span,
.model-cell {
  display: block;
}

.provider-main strong {
  font-size: 13px;
}

.provider-main span {
  margin-top: 3px;
  color: #6f746b;
  font-size: 11px;
}

.status-badge {
  width: fit-content;
  min-height: 27px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.status-badge.green {
  color: #166534;
  background: #f0fdf4;
}

.status-badge.amber {
  color: #92400e;
  background: #fffbeb;
}

.status-badge.blue {
  color: #1d4ed8;
  background: #eff6ff;
}

.status-badge.slate {
  color: #475569;
  background: #f8fafc;
}

.status-badge.red {
  color: #991b1b;
  background: #fef2f2;
}

.readiness-badge {
  width: fit-content;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 1000;
  white-space: nowrap;
}

.readiness-badge.ready {
  color: #166534;
  background: #dcfce7;
}

.readiness-badge.warning {
  color: #92400e;
  background: #fef3c7;
}

.readiness-badge.blocked {
  color: #991b1b;
  background: #fee2e2;
}

.capability-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.capability-pills small {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 900;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.row-actions button {
  min-height: 28px;
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
  border-radius: 999px;
  padding: 0 8px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}

.row-actions button.danger {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}

.drawer-card {
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: grid;
  gap: 7px;
}

.field.wide {
  grid-column: 1 / -1;
}

.form-subsection {
  grid-column: 1 / -1;
  border: 1px solid #e4e7df;
  background: #f8fafc;
  border-radius: 14px;
  padding: 10px 12px;
}

.form-subsection strong {
  display: block;
  font-size: 13px;
}

.form-subsection small {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  line-height: 1.7;
  font-size: 11px;
  font-weight: 800;
}

.field span {
  font-size: 12px;
  font-weight: 900;
}

.field span b {
  color: #dc2626;
  margin-inline-start: 5px;
  font-size: 10px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e4e7df;
  border-radius: 14px;
  background: #fff;
  color: #1f241d;
  outline: 0;
  font-family: inherit;
}

.field input,
.field select {
  min-height: 40px;
  padding: 0 11px;
}

.field textarea {
  min-height: 88px;
  padding: 12px;
  resize: vertical;
  line-height: 1.7;
}

.config-section {
  margin-top: 16px;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  background: #f7f8f4;
  padding: 14px;
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.toggle-row {
  min-height: 44px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.toggle-row.danger {
  border-color: #fecaca;
  background: #fffafa;
}

.toggle-row span {
  font-size: 11px;
  font-weight: 900;
}

.switch {
  width: 48px;
  height: 26px;
  border: 0;
  border-radius: 999px;
  background: #cbd5e1;
  padding: 3px;
  cursor: pointer;
}

.switch i {
  width: 20px;
  height: 20px;
  display: block;
  border-radius: 999px;
  background: #fff;
  transform: translateX(0);
  transition: 0.18s ease;
}

.switch.on {
  background: #1d4ed8;
}

.switch.on i {
  transform: translateX(-22px);
}

.drawer-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.provider-readiness-panel,
.routing-impact-panel {
  border: 1px solid #d9ead7;
  background: #fbfdf9;
  border-radius: 18px;
  padding: 14px;
  margin-top: 16px;
}

.provider-readiness-panel.warning {
  border-color: #fde68a;
  background: #fffaf0;
}

.provider-readiness-panel.blocked {
  border-color: #fecaca;
  background: #fff5f5;
}

.readiness-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.readiness-head strong,
.routing-impact-panel h3 {
  display: block;
  margin: 0;
  color: #1f241d;
  font-size: 15px;
}

.readiness-head span,
.routing-impact-panel p {
  display: block;
  margin: 4px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.7;
}

.readiness-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.link-readiness-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
}

.info-cell {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
}

.info-cell span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
}

.info-cell strong {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.readiness-notes {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.readiness-notes strong {
  display: block;
  color: #1f241d;
  font-size: 12px;
}

.readiness-notes span {
  border-radius: 12px;
  padding: 7px 9px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.6;
}

.blocked-notes span {
  color: #991b1b;
  background: #fee2e2;
}

.warning-notes span {
  color: #92400e;
  background: #ffedd5;
}

.check-notes span {
  color: #166534;
  background: #ecfdf5;
}

.audit-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 320px 320px minmax(0, 1fr);
  gap: 16px;
}

.side-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  color: #fff;
  background: #1d4ed8;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
}

.side-icon.warning {
  background: #f59e0b;
}

.check-row {
  min-height: 36px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  font-size: 12px;
  font-weight: 900;
}

.side-card ul {
  margin: 12px 0 0;
  padding-inline-start: 18px;
  color: #92400e;
  line-height: 1.9;
  font-size: 13px;
}

.test-log {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.empty-log {
  color: #6f746b;
  font-size: 13px;
}

.test-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.test-row.success {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.test-row.failed {
  border-color: #fecaca;
  background: #fef2f2;
}

.test-row.warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.test-row strong,
.test-row span,
.test-row small {
  display: block;
}

.test-row span {
  margin-top: 4px;
  line-height: 1.6;
  font-size: 12px;
}

.test-row small {
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
}

@media (max-width: 1400px) {
  .main-layout,
  .audit-grid {
    grid-template-columns: 1fr;
  }

  .drawer-card {
    position: static;
    max-height: none;
  }

  .providers-table {
    overflow: auto;
  }

  .table-head,
  .table-row {
    min-width: 1340px;
  }
}

@media (max-width: 760px) {
  .secrets-unified-page {
    padding: 16px;
  }

  .page-title,
  .title-actions,
  .toolbar-card,
  .add-provider-inline {
    align-items: stretch;
    flex-direction: column;
    display: flex;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid,
  .form-grid,
  .readiness-grid,
  .toggle-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
`;
