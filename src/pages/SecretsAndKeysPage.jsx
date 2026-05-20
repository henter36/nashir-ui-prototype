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

const AUTH_TYPES = [
  ["bearer_token", "Bearer Token"],
  ["api_key_header", "API Key Header"],
  ["oauth", "OAuth"],
  ["custom_headers", "Custom Headers"],
];

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

  return {
    id: `${type}-${Date.now()}`,
    providerType: preset.providerType,
    displayName: preset.displayName,
    category: preset.category,
    status: "draft",
    authType: preset.authType,
    headerName: preset.headerName,
    tokenPrefix: preset.tokenPrefix,
    secretName: preset.secretName,
    apiKeyPreview: "",
    baseUrl: preset.baseUrl,
    apiVersion: preset.apiVersion || "",
    organizationId: preset.organizationId || "",
    projectId: preset.projectId || "",
    googleCloudProject: preset.googleCloudProject || "",
    region: preset.region || "",
    textModel: preset.textModel || "",
    imageModel: preset.imageModel || "",
    videoModel: preset.videoModel || "",
    embeddingModel: preset.embeddingModel || "",
    fallbackModel: preset.fallbackModel || "",
    customHeaders: preset.customHeaders || "",
    capabilities: { ...preset.capabilities },
    limits: { ...preset.limits },
    governance: {
      humanReviewRequired: true,
      autoPublishAllowed: false,
      allowSensitiveContentGeneration: false,
      logAllRequests: true,
      redactInputs: true,
    },
    webhooks: { ...preset.webhooks },
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
    status: "connected",
    apiKeyPreview: "••••••••A9x2",
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
    status: "missing_required_fields",
    apiKeyPreview: "",
  }),
  createProviderFromPreset("replicate", {
    id: "replicate-images",
    displayName: "Replicate - Image/Video",
    status: "pending_test",
    apiKeyPreview: "••••••••K41p",
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

export default function SecretsAndKeysPage() {
  const [providers, setProviders] = useState(initialProviders);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviders[0].id);
  const [draftPreset, setDraftPreset] = useState("openai");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [testLog, setTestLog] = useState([]);

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) || providers[0];

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
      autoPublishUnsafe: providers.filter((p) => p.governance.autoPublishAllowed).length,
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
        ...selectedProvider[section],
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
      apiKeyPreview: "",
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

    provider.requiredFields.forEach((field) => {
      if (field === "webhookSecretName") {
        if (!provider.webhooks.secretName) missing.push("webhook_secret_name");
        return;
      }

      if (!String(provider[field] || "").trim()) {
        missing.push(field);
      }
    });

    if (provider.governance.autoPublishAllowed) {
      missing.push("auto_publish_must_remain_disabled");
    }

    return missing;
  };

  const testConnection = (provider = selectedProvider) => {
    const missing = validateProvider(provider);

    if (missing.length) {
      updateProvider(provider.id, { status: "failed" });
      setTestLog((prev) => [
        {
          id: Date.now(),
          provider: provider.displayName,
          status: "failed",
          message: `فشل الاختبار. الحقول/الشروط الناقصة: ${missing.join(", ")}`,
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
        status: "success",
        message:
          "تم اختبار الاتصال كمحاكاة. الاختبار الحقيقي يجب أن يتم من Backend باستخدام secret_name.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const rotateKey = (provider) => {
    updateProvider(provider.id, {
      status: "pending_test",
      apiKeyPreview: "••••••••NEW",
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
        message: "تم تدوير المفتاح كمحاكاة. يجب اختبار الاتصال بعد التدوير.",
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
        message: "تم حفظ إعدادات الجدول محليًا فقط. لا توجد أسرار حقيقية محفوظة.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  return (
    <main className="secrets-table-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <KeyRound size={15} />
            الأسرار والمفاتيح
          </div>
          <h1>إدارة مزودي الذكاء الاصطناعي بنموذج موحّد</h1>
          <p>
            جدول موحد لكل المزودين مع Provider Presets. نفس النموذج يُستخدم
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
            الواجهة لا تحفظ API keys حقيقية. الحقل الأساسي هو Secret Name الذي
            يشير لاحقًا إلى Backend/KMS/Secret Manager. أي اختبار أو تدوير هنا
            محاكاة فقط.
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
            إضافة من Preset
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
              <span>Provider</span>
              <span>Type</span>
              <span>Status</span>
              <span>Default Model</span>
              <span>Budget</span>
              <span>Capabilities</span>
              <span>Actions</span>
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
                label="Provider preset"
                value={selectedProvider.providerType}
                options={PROVIDER_TYPES}
                onChange={changeProviderType}
              />

              <Field
                label="Display name"
                value={selectedProvider.displayName}
                onChange={(value) => updateSelected("displayName", value)}
                required
              />

              <SelectField
                label="Auth type"
                value={selectedProvider.authType}
                options={AUTH_TYPES}
                onChange={(value) => updateSelected("authType", value)}
              />

              <Field
                label="Header name"
                value={selectedProvider.headerName}
                onChange={(value) => updateSelected("headerName", value)}
              />

              <SelectField
                label="Token prefix"
                value={selectedProvider.tokenPrefix}
                options={[
                  ["Bearer", "Bearer"],
                  ["Token", "Token"],
                  ["None", "None"],
                ]}
                onChange={(value) => updateSelected("tokenPrefix", value)}
              />

              <Field
                label="Secret name"
                value={selectedProvider.secretName}
                onChange={(value) => updateSelected("secretName", value)}
                required
                helper="اسم السر في Backend/KMS وليس المفتاح نفسه."
              />

              <Field
                label="API key preview"
                value={selectedProvider.apiKeyPreview}
                onChange={(value) => updateSelected("apiKeyPreview", value)}
                helper="مثال: ••••••••A9x2 فقط للعرض بعد الحفظ."
              />

              <Field
                label="Base URL"
                value={selectedProvider.baseUrl}
                onChange={(value) => updateSelected("baseUrl", value)}
                required={selectedProvider.requiredFields.includes("baseUrl")}
              />

              <Field
                label="API version"
                value={selectedProvider.apiVersion}
                onChange={(value) => updateSelected("apiVersion", value)}
                required={selectedProvider.requiredFields.includes("apiVersion")}
              />

              {selectedProvider.providerType === "openai" ? (
                <>
                  <Field
                    label="Organization ID"
                    value={selectedProvider.organizationId}
                    onChange={(value) => updateSelected("organizationId", value)}
                  />
                  <Field
                    label="Project ID"
                    value={selectedProvider.projectId}
                    onChange={(value) => updateSelected("projectId", value)}
                  />
                </>
              ) : null}

              {selectedProvider.providerType === "gemini" ? (
                <>
                  <Field
                    label="Google Cloud Project"
                    value={selectedProvider.googleCloudProject}
                    onChange={(value) => updateSelected("googleCloudProject", value)}
                    required
                  />
                  <Field
                    label="Region"
                    value={selectedProvider.region}
                    onChange={(value) => updateSelected("region", value)}
                  />
                </>
              ) : null}

              <Field
                label="Text model"
                value={selectedProvider.textModel}
                onChange={(value) => updateSelected("textModel", value)}
                required={selectedProvider.requiredFields.includes("textModel")}
              />

              <Field
                label="Image model"
                value={selectedProvider.imageModel}
                onChange={(value) => updateSelected("imageModel", value)}
              />

              <Field
                label="Video model"
                value={selectedProvider.videoModel}
                onChange={(value) => updateSelected("videoModel", value)}
                required={selectedProvider.requiredFields.includes("videoModel")}
              />

              <Field
                label="Embedding model"
                value={selectedProvider.embeddingModel}
                onChange={(value) => updateSelected("embeddingModel", value)}
              />

              <Field
                label="Fallback model"
                value={selectedProvider.fallbackModel}
                onChange={(value) => updateSelected("fallbackModel", value)}
              />

              <Field
                label="Monthly soft limit"
                value={selectedProvider.limits.monthlySoftLimit}
                onChange={(value) => updateNested("limits", "monthlySoftLimit", value)}
              />

              <Field
                label="Monthly hard limit"
                value={selectedProvider.limits.monthlyHardLimit}
                onChange={(value) => updateNested("limits", "monthlyHardLimit", value)}
              />

              <Field
                label="RPM limit"
                value={selectedProvider.limits.rpm}
                onChange={(value) => updateNested("limits", "rpm", value)}
              />

              <Field
                label="TPM limit"
                value={selectedProvider.limits.tpm}
                onChange={(value) => updateNested("limits", "tpm", value)}
              />

              <Field
                label="Max job duration seconds"
                value={selectedProvider.limits.maxJobDurationSeconds}
                onChange={(value) => updateNested("limits", "maxJobDurationSeconds", value)}
              />

              <TextArea
                label="Custom headers / metadata"
                value={selectedProvider.customHeaders}
                onChange={(value) => updateSelected("customHeaders", value)}
                wide
              />
            </div>

            <Section title="Capabilities">
              <ToggleGrid
                source={selectedProvider.capabilities}
                onChange={(key, value) => updateNested("capabilities", key, value)}
              />
            </Section>

            <Section title="Governance">
              <ToggleGrid
                source={selectedProvider.governance}
                onChange={(key, value) => updateNested("governance", key, value)}
                dangerKeys={["autoPublishAllowed", "allowSensitiveContentGeneration"]}
              />
            </Section>

            <Section title="Webhooks">
              <div className="form-grid">
                <Toggle
                  label="Enabled"
                  checked={selectedProvider.webhooks.enabled}
                  onChange={(value) => updateNested("webhooks", "enabled", value)}
                />
                <Field
                  label="Webhook secret name"
                  value={selectedProvider.webhooks.secretName}
                  onChange={(value) => updateNested("webhooks", "secretName", value)}
                  required={selectedProvider.requiredFields.includes("webhookSecretName")}
                />
                <Field
                  label="Callback URL"
                  value={selectedProvider.webhooks.callbackUrl}
                  onChange={(value) => updateNested("webhooks", "callbackUrl", value)}
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
                تدوير المفتاح
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
          <Checklist ok label="Secret Name بدل المفتاح الخام" />
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
            <li>لا تحفظ المفتاح الخام في React أو LocalStorage.</li>
            <li>لا ترسل المفتاح مباشرة من المتصفح إلى المزود.</li>
            <li>لا تعرض المفتاح الحقيقي بعد حفظه.</li>
            <li>لا تفعّل النشر التلقائي بدون Backend وصلاحيات.</li>
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
  const capabilities = Object.entries(provider.capabilities)
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

      <span>{provider.limits.monthlyHardLimit || "—"}</span>

      <div className="capability-pills">
        {capabilities.slice(0, 3).map((capability) => (
          <small key={capability}>{capability}</small>
        ))}
        {capabilities.length > 3 ? <small>+{capabilities.length - 3}</small> : null}
      </div>

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

function capabilityLabel(key) {
  const labels = {
    textGeneration: "Text",
    imageGeneration: "Image",
    videoGeneration: "Video",
    embeddings: "Embeddings",
    vision: "Vision",
    audio: "Audio",
    functionCalling: "Tools",
    structuredOutput: "JSON",
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
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
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
  grid-template-columns: minmax(220px, 1.2fr) 90px 105px 150px 85px 160px 260px;
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
    min-width: 1240px;
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
  .toggle-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
`;
