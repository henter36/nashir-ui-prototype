import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileSearch,
  Gauge,
  ImageIcon,
  Layers,
  ListChecks,
  PlayCircle,
  Plus,
  RefreshCw,
  Route,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  TestTube2,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  deriveCostRowsFromRoutes,
  readCostRows,
  readModelRegistry,
  readModelRoutes,
  upsertModel,
  upsertModelRoute,
  writeCostRows,
} from "../utils/modelCostStore.js";

const MODEL_REGISTRY_SEED = [
  {
    id: "model-store-reader",
    displayName: "Gemini Store Reader",
    provider: "Gemini",
    modelIdentifier: "gemini-store-reader",
    status: "active",
    qualityTier: "high",
    speedTier: "balanced",
    costTier: "medium",
    capabilities: ["Text", "Vision", "Long Context", "Structured Output"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: true,
      allowAssets: true,
      allowExternalTools: false,
      logRequests: true,
    },
  },
  {
    id: "model-gpt-analysis",
    displayName: "GPT Analysis",
    provider: "OpenAI",
    modelIdentifier: "gpt-analysis-main",
    status: "active",
    qualityTier: "premium",
    speedTier: "balanced",
    costTier: "high",
    capabilities: ["Text", "Tools", "Structured Output", "Long Context"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: true,
      allowAssets: false,
      allowExternalTools: true,
      logRequests: true,
    },
  },
  {
    id: "model-claude-reviewer",
    displayName: "Claude Risk Reviewer",
    provider: "Anthropic",
    modelIdentifier: "claude-risk-review",
    status: "active",
    qualityTier: "premium",
    speedTier: "balanced",
    costTier: "high",
    capabilities: ["Text", "Long Context", "Risk Review"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: true,
      allowAssets: false,
      allowExternalTools: false,
      logRequests: true,
    },
  },
  {
    id: "model-gpt-writer",
    displayName: "GPT Campaign Writer",
    provider: "OpenAI",
    modelIdentifier: "gpt-writer-main",
    status: "active",
    qualityTier: "high",
    speedTier: "fast",
    costTier: "medium",
    capabilities: ["Text", "Structured Output", "Tools"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: true,
      allowAssets: false,
      allowExternalTools: false,
      logRequests: true,
    },
  },
  {
    id: "model-flux-image",
    displayName: "Flux Image",
    provider: "Replicate",
    modelIdentifier: "black-forest-labs/flux-pro",
    status: "testing",
    qualityTier: "high",
    speedTier: "slow",
    costTier: "high",
    capabilities: ["Image Generation"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: false,
      allowAssets: true,
      allowExternalTools: false,
      logRequests: true,
    },
  },
  {
    id: "model-runway-video",
    displayName: "Runway Video",
    provider: "Runway",
    modelIdentifier: "gen-video",
    status: "testing",
    qualityTier: "premium",
    speedTier: "slow",
    costTier: "high",
    capabilities: ["Video Generation"],
    governance: {
      humanReviewRequired: true,
      allowCustomerData: false,
      allowAssets: true,
      allowExternalTools: false,
      logRequests: true,
    },
  },
];

const TASK_TYPES = [
  ["store_reading", "قراءة المتجر وتحليل صفحاته", "Store Setup", Store],
  ["product_extraction", "استخراج المنتجات والتصنيفات", "Store Setup", FileSearch],
  ["social_analysis", "تحليل حسابات التواصل", "Store Setup", Search],
  ["competitor_analysis", "تحليل المنافسين", "Market", BarChart3],
  ["campaign_strategy", "تحليل وتخطيط الحملة", "Campaign Intake", Wand2],  ["ad_copy_generation", "توليد النصوص الإعلانية", "Content Studio", Wand2],
  ["content_rewrite", "إعادة صياغة المحتوى", "Content Studio", Sparkles],
  ["image_generation", "توليد الصور", "Asset / Content", ImageIcon],
  ["video_script_generation", "كتابة سكربت الفيديو", "Content Studio", PlayCircle],
  ["video_generation", "توليد الفيديو", "Video", PlayCircle],
  ["risk_review", "مراجعة المخاطر والادعاءات", "Review", ShieldCheck],
  ["platform_preview", "تهيئة المحتوى لكل منصة", "Live Preview", Layers],
  ["analytics_summary", "تلخيص الأداء", "Analytics", BarChart3],
  ["ai_recommendations", "توصيات التحسين", "Smart Analytics", Sparkles],
];

const ROUTES_SEED = [
  {
    id: "route-store-reading",
    taskType: "store_reading",
    primaryModelId: "model-store-reader",
    fallbackModelIds: ["model-gpt-analysis"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: true,
      maxRetries: 2,
      timeoutSeconds: 90,
    },
    cost: {
      maxCostPerRun: "0.35",
      monthlyBudgetLimit: "150",
      requireApprovalAboveCost: "1.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: true,
    },
  },
  {
    id: "route-product-extraction",
    taskType: "product_extraction",
    primaryModelId: "model-store-reader",
    fallbackModelIds: ["model-gpt-analysis"],
    policy: {
      useCheapestFirst: true,
      useBestQuality: false,
      retryOnFailure: true,
      maxRetries: 2,
      timeoutSeconds: 60,
    },
    cost: {
      maxCostPerRun: "0.20",
      monthlyBudgetLimit: "100",
      requireApprovalAboveCost: "0.75",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: true,
    },
  },
  {
    id: "route-campaign-strategy",
    taskType: "campaign_strategy",
    primaryModelId: "model-gpt-analysis",
    fallbackModelIds: ["model-claude-reviewer"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: true,
      maxRetries: 1,
      timeoutSeconds: 90,
    },
    cost: {
      maxCostPerRun: "0.50",
      monthlyBudgetLimit: "250",
      requireApprovalAboveCost: "1.50",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: true,
    },
  },
  {
    id: "route-ad-copy",
    taskType: "ad_copy_generation",
    primaryModelId: "model-gpt-writer",
    fallbackModelIds: ["model-claude-reviewer"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: true,
      maxRetries: 2,
      timeoutSeconds: 45,
    },
    cost: {
      maxCostPerRun: "0.25",
      monthlyBudgetLimit: "300",
      requireApprovalAboveCost: "1.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: false,
    },
  },
  {
    id: "route-image",
    taskType: "image_generation",
    primaryModelId: "model-flux-image",
    fallbackModelIds: ["model-store-reader"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: false,
      maxRetries: 0,
      timeoutSeconds: 180,
    },
    cost: {
      maxCostPerRun: "1.50",
      monthlyBudgetLimit: "400",
      requireApprovalAboveCost: "1.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: false,
    },
  },
  {
    id: "route-video",
    taskType: "video_generation",
    primaryModelId: "model-runway-video",
    fallbackModelIds: ["model-flux-image"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: false,
      maxRetries: 0,
      timeoutSeconds: 1200,
    },
    cost: {
      maxCostPerRun: "8.00",
      monthlyBudgetLimit: "700",
      requireApprovalAboveCost: "3.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: false,
    },
  },
  {
    id: "route-risk",
    taskType: "risk_review",
    primaryModelId: "model-claude-reviewer",
    fallbackModelIds: ["model-gpt-analysis"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: true,
      maxRetries: 1,
      timeoutSeconds: 90,
    },
    cost: {
      maxCostPerRun: "0.40",
      monthlyBudgetLimit: "200",
      requireApprovalAboveCost: "1.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: true,
    },
  },
  {
    id: "route-analytics",
    taskType: "ai_recommendations",
    primaryModelId: "model-gpt-analysis",
    fallbackModelIds: ["model-store-reader"],
    policy: {
      useCheapestFirst: false,
      useBestQuality: true,
      retryOnFailure: true,
      maxRetries: 1,
      timeoutSeconds: 60,
    },
    cost: {
      maxCostPerRun: "0.30",
      monthlyBudgetLimit: "180",
      requireApprovalAboveCost: "1.00",
    },
    governance: {
      humanReviewRequired: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      includeSourceCitations: true,
    },
  },
];


const WORKFLOW_USAGE_SEED = [
  {
    taskType: "store_reading",
    workflow: "Store Intelligence",
    workflowId: "store_intelligence",
    steps: ["analyze_store_brand"],
    source: "Store Setup",
  },
  {
    taskType: "product_extraction",
    workflow: "Store Intelligence",
    workflowId: "store_intelligence",
    steps: ["extract_products"],
    source: "Store Setup",
  },
  {
    taskType: "campaign_strategy",
    workflow: "Campaign Generation",
    workflowId: "campaign_generation",
    steps: ["build_campaign_strategy"],
    source: "Campaign Wizard",
  },
  {
    taskType: "ad_copy_generation",
    workflow: "Campaign Generation",
    workflowId: "campaign_generation",
    steps: ["generate_content_plan"],
    source: "Campaign Wizard",
  },
  {
    taskType: "content_rewrite",
    workflow: "Content Regeneration",
    workflowId: "content_generation",
    steps: ["rewrite_content"],
    source: "Content Studio",
  },
  {
    taskType: "video_script_generation",
    workflow: "Video Generation",
    workflowId: "video_generation",
    steps: ["write_customer_video_brief", "write_internal_video_prompt"],
    source: "Content Studio",
  },
  {
    taskType: "video_generation",
    workflow: "Video Generation",
    workflowId: "video_generation",
    steps: ["generate_video_asset"],
    source: "Content Studio",
  },
  {
    taskType: "risk_review",
    workflow: "Video Generation",
    workflowId: "video_generation",
    steps: ["review_video_prompt"],
    source: "Review Gate",
  },
];

const STATUS_META = {
  active: ["نشط", "green"],
  testing: ["تجريبي", "amber"],
  disabled: ["معطل", "slate"],
  deprecated: ["Deprecated", "red"],
};

const TABS = [
  ["models", "النماذج المتاحة"],
  ["routes", "توجيه المهام"],
  ["fallback", "سلاسل fallback"],
  ["cost", "التكلفة والحدود"],
  ["test", "الاختبار والسجل"],
];

function findTask(taskType) {
  return TASK_TYPES.find(([id]) => id === taskType);
}

function modelName(models, id) {
  return models.find((model) => model.id === id)?.displayName || "غير محدد";
}


function getWorkflowUsage(taskType) {
  return WORKFLOW_USAGE_SEED.filter((usage) => usage.taskType === taskType);
}

function getWorkflowUsageLabel(taskType) {
  const usage = getWorkflowUsage(taskType);
  if (!usage.length) return "غير مستخدم";
  const stepCount = usage.reduce((sum, item) => sum + item.steps.length, 0);
  return `${usage.length} Workflow · ${stepCount} خطوة`;
}

export default function ModelRoutingPage() {
  const [models, setModels] = useState(() => readModelRegistry(MODEL_REGISTRY_SEED));
  const [routes, setRoutes] = useState(() => readModelRoutes(ROUTES_SEED));
  const [activeTab, setActiveTab] = useState("routes");
  const [selectedRouteId, setSelectedRouteId] = useState(ROUTES_SEED[0].id);
  const [testTask, setTestTask] = useState("store_reading");
  const [testInput, setTestInput] = useState("https://store.example.com");
  const [testLog, setTestLog] = useState([]);

  const selectedRoute = routes.find((route) => route.id === selectedRouteId) || routes[0];

  useEffect(() => {
    const reloadRouting = () => {
      setModels(readModelRegistry(MODEL_REGISTRY_SEED));
      setRoutes(readModelRoutes(ROUTES_SEED));
    };

    window.addEventListener("focus", reloadRouting);
    window.addEventListener("storage", reloadRouting);
    window.addEventListener("nashir-model-registry-updated", reloadRouting);
    window.addEventListener("nashir-model-routing-updated", reloadRouting);

    return () => {
      window.removeEventListener("focus", reloadRouting);
      window.removeEventListener("storage", reloadRouting);
      window.removeEventListener("nashir-model-registry-updated", reloadRouting);
      window.removeEventListener("nashir-model-routing-updated", reloadRouting);
    };
  }, []);

  const stats = useMemo(
    () => ({
      models: models.length,
      activeModels: models.filter((model) => model.status === "active").length,
      routes: routes.length,
      highCostRoutes: routes.filter((route) => Number(route.cost.maxCostPerRun) >= 1).length,
    }),
    [models, routes]
  );

  const syncRouteCosts = (nextRoutes, nextModels = models) => {
    const currentRows = readCostRows([]);
    const derivedRows = deriveCostRowsFromRoutes(nextRoutes, currentRows, nextModels);
    writeCostRows(derivedRows);
  };

  const updateRoute = (routeId, patch) => {
    const route = routes.find((item) => item.id === routeId);

    if (!route) return;

    const updatedRoute = {
      ...route,
      ...patch,
    };
    const next = upsertModelRoute(updatedRoute, ROUTES_SEED);

    setRoutes(next);
    syncRouteCosts(next);
  };

  const updateRouteNested = (routeId, section, key, value) => {
    const route = routes.find((item) => item.id === routeId);

    if (!route) return;

    const updatedRoute = {
      ...route,
      [section]: {
        ...route[section],
        [key]: value,
      },
    };
    const next = upsertModelRoute(updatedRoute, ROUTES_SEED);

    setRoutes(next);
    syncRouteCosts(next);
  };

  const updateModelStatus = (modelId, status) => {
    const model = models.find((item) => item.id === modelId);

    if (!model) return;

    const next = upsertModel({ ...model, status }, MODEL_REGISTRY_SEED);

    setModels(next);
    syncRouteCosts(routes, next);
  };

  const addFallback = (routeId, modelId) => {
    const route = routes.find((item) => item.id === routeId);

    if (!route || !modelId || route.fallbackModelIds.includes(modelId)) return;

    const updatedRoute = {
      ...route,
      fallbackModelIds: [...route.fallbackModelIds, modelId],
    };
    const next = upsertModelRoute(updatedRoute, ROUTES_SEED);

    setRoutes(next);
    syncRouteCosts(next);
  };

  const removeFallback = (routeId, modelId) => {
    const route = routes.find((item) => item.id === routeId);

    if (!route) return;

    const updatedRoute = {
      ...route,
      fallbackModelIds: route.fallbackModelIds.filter((id) => id !== modelId),
    };
    const next = upsertModelRoute(updatedRoute, ROUTES_SEED);

    setRoutes(next);
    syncRouteCosts(next);
  };

  const runTest = () => {
    const route = routes.find((item) => item.taskType === testTask);
    const task = findTask(testTask);
    const primary = route ? modelName(models, route.primaryModelId) : "غير محدد";
    const fallback = route?.fallbackModelIds?.length
      ? route.fallbackModelIds.map((id) => modelName(models, id)).join(" → ")
      : "لا يوجد";

    const estimatedCost = route?.cost?.maxCostPerRun || "0.00";
    const routeBlocked = !route || route.governance.blockAutoPublish !== true;

    setTestLog((prev) => [
      {
        id: Date.now(),
        task: task?.[1] || testTask,
        status: routeBlocked ? "warning" : "success",
        input: testInput,
        primary,
        fallback,
        estimatedCost,
        message: routeBlocked
          ? "المسار يحتاج مراجعة حوكمة أو غير موجود."
          : "تمت محاكاة التوجيه بنجاح. لم يتم استدعاء أي نموذج فعلي.",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  return (
    <main className="model-routing-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow">
            <Route size={15} />
            Model Routing
          </div>
          <h1>إدارة توجيه النماذج</h1>
          <p>
            هذه الصفحة لمدير النظام فقط. المستخدم النهائي لا يرى ولا يعرف النموذج
            المستخدم، بل يرى فقط: فحص المتجر، توليد حملة، تحليل أداء، أو مراجعة
            مخاطر.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button">
            <RefreshCw size={16} />
            تحديث السياسات
          </button>
          <button type="button" className="primary-button">
            <Save size={16} />
            حفظ محلي
          </button>
        </div>
      </section>

      <section className="admin-only-alert">
        <ShieldCheck size={20} />
        <div>
          <strong>صلاحية مدير النظام فقط</strong>
          <p>
            اختيار النماذج وتوجيه المهام يجب أن يبقى في إدارة النظام. لا يظهر
            اختيار GPT أو Claude أو Gemini للمستخدم أو التاجر داخل صفحات الحملات.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="النماذج المسجلة" value={stats.models} icon={Bot} tone="blue" />
        <Stat title="النماذج النشطة" value={stats.activeModels} icon={CheckCircle2} tone="green" />
        <Stat title="مسارات التوجيه" value={stats.routes} icon={Route} tone="teal" />
        <Stat title="مسارات عالية التكلفة" value={stats.highCostRoutes} icon={AlertTriangle} tone="amber" />
      </section>

      <section className="tabs">
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

      {activeTab === "models" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Model Registry</h2>
              <p>النماذج المتاحة داخليًا لمدير النظام فقط.</p>
            </div>
            <button type="button" className="secondary-button">
              <Plus size={16} />
              إضافة نموذج
            </button>
          </div>

          <div className="model-grid">
            {models.map((model) => (
              <article key={model.id} className="model-card">
                <div className="model-head">
                  <div className="model-icon">
                    <Bot size={19} />
                  </div>
                  <div>
                    <h3>{model.displayName}</h3>
                    <p>{model.provider}</p>
                  </div>
                  <Status value={model.status} />
                </div>

                <div className="capability-list">
                  {model.capabilities.map((capability) => (
                    <span key={capability}>{capability}</span>
                  ))}
                </div>

                <div className="model-meta">
                  <Info label="الجودة" value={model.qualityTier} />
                  <Info label="السرعة" value={model.speedTier} />
                  <Info label="التكلفة" value={model.costTier} />
                </div>

                <div className="model-actions">
                  <select
                    value={model.status}
                    onChange={(event) => updateModelStatus(model.id, event.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="testing">testing</option>
                    <option value="disabled">disabled</option>
                    <option value="deprecated">deprecated</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "routes" && (
        <section className="routes-layout">
          <article className="card routes-table-card">
            <div className="card-header">
              <div>
                <h2>Task Routing</h2>
                <p>حدد النموذج الأساسي والبديل لكل مهمة تشغيلية.</p>
              </div>
            </div>

            <div className="routes-table">
              <div className="table-head">
                <span>المهمة</span>
                <span>المجال</span>
                <span>النموذج الأساسي</span>
                <span>Fallback</span>
                <span>الاستخدام</span>
                <span>المراجعة</span>
                <span>التكلفة</span>
              </div>

              {routes.map((route) => {
                const task = findTask(route.taskType);
                return (
                  <button
                    key={route.id}
                    type="button"
                    className={`table-row ${selectedRouteId === route.id ? "selected" : ""}`}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <span>
                      <strong>{task?.[1] || route.taskType}</strong>
                      <small>{route.taskType}</small>
                    </span>
                    <span>{task?.[2] || "—"}</span>
                    <span>{modelName(models, route.primaryModelId)}</span>
                    <span>{route.fallbackModelIds.length}</span>
                    <span>{getWorkflowUsageLabel(route.taskType)}</span>
                    <span>{route.governance.humanReviewRequired ? "مطلوبة" : "غير مطلوبة"}</span>
                    <span>{route.cost.maxCostPerRun}$ / run</span>
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="card route-editor">
            <h2>تعديل مسار المهمة</h2>
            <p>{findTask(selectedRoute.taskType)?.[1]}</p>

            <label className="field">
              <span>النموذج الأساسي</span>
              <select
                value={selectedRoute.primaryModelId}
                onChange={(event) =>
                  updateRoute(selectedRoute.id, { primaryModelId: event.target.value })
                }
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.displayName}</option>
                ))}
              </select>
            </label>

            <div className="fallback-box">
              <strong>النماذج البديلة</strong>
              {selectedRoute.fallbackModelIds.map((modelId) => (
                <div key={modelId} className="fallback-row">
                  <span>{modelName(models, modelId)}</span>
                  <button type="button" onClick={() => removeFallback(selectedRoute.id, modelId)}>حذف</button>
                </div>
              ))}
              <select onChange={(event) => addFallback(selectedRoute.id, event.target.value)} value="">
                <option value="">إضافة fallback</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.displayName}</option>
                ))}
              </select>
            </div>

            <WorkflowUsagePanel route={selectedRoute} />

            <div className="editor-grid">
              <Field
                label="Max retries"
                value={selectedRoute.policy.maxRetries}
                onChange={(value) => updateRouteNested(selectedRoute.id, "policy", "maxRetries", Number(value))}
              />
              <Field
                label="Timeout seconds"
                value={selectedRoute.policy.timeoutSeconds}
                onChange={(value) => updateRouteNested(selectedRoute.id, "policy", "timeoutSeconds", Number(value))}
              />
              <Field
                label="Max cost/run"
                value={selectedRoute.cost.maxCostPerRun}
                onChange={(value) => updateRouteNested(selectedRoute.id, "cost", "maxCostPerRun", value)}
              />
              <Field
                label="Monthly budget"
                value={selectedRoute.cost.monthlyBudgetLimit}
                onChange={(value) => updateRouteNested(selectedRoute.id, "cost", "monthlyBudgetLimit", value)}
              />
            </div>

            <div className="toggle-list">
              <Toggle
                label="Use cheapest first"
                checked={selectedRoute.policy.useCheapestFirst}
                onChange={(value) => updateRouteNested(selectedRoute.id, "policy", "useCheapestFirst", value)}
              />
              <Toggle
                label="Use best quality"
                checked={selectedRoute.policy.useBestQuality}
                onChange={(value) => updateRouteNested(selectedRoute.id, "policy", "useBestQuality", value)}
              />
              <Toggle
                label="Retry on failure"
                checked={selectedRoute.policy.retryOnFailure}
                onChange={(value) => updateRouteNested(selectedRoute.id, "policy", "retryOnFailure", value)}
              />
              <Toggle
                label="Human review required"
                checked={selectedRoute.governance.humanReviewRequired}
                onChange={(value) => updateRouteNested(selectedRoute.id, "governance", "humanReviewRequired", value)}
              />
              <Toggle
                label="Block auto publish"
                checked={selectedRoute.governance.blockAutoPublish}
                onChange={(value) => updateRouteNested(selectedRoute.id, "governance", "blockAutoPublish", value)}
              />
              <Toggle
                label="Redact sensitive data"
                checked={selectedRoute.governance.redactSensitiveData}
                onChange={(value) => updateRouteNested(selectedRoute.id, "governance", "redactSensitiveData", value)}
              />
            </div>
          </aside>
        </section>
      )}

      {activeTab === "fallback" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>سلاسل Fallback</h2>
              <p>ترتيب استخدام النماذج عند فشل النموذج الأساسي أو تجاوز التكلفة.</p>
            </div>
          </div>

          <div className="fallback-grid">
            {routes.map((route) => {
              const task = findTask(route.taskType);
              return (
                <article key={route.id} className="fallback-card">
                  <h3>{task?.[1]}</h3>
                  <div className="fallback-chain">
                    <span>{modelName(models, route.primaryModelId)}</span>
                    {route.fallbackModelIds.map((modelId) => (
                      <React.Fragment key={modelId}>
                        <b>→</b>
                        <span>{modelName(models, modelId)}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="usage-mini-row">
                    <ListChecks size={14} />
                    <span>{getWorkflowUsageLabel(route.taskType)}</span>
                  </div>
                  <p>
                    {route.policy.retryOnFailure ? "Retry مفعّل" : "Retry غير مفعّل"} ·{" "}
                    {route.cost.maxCostPerRun}$ كحد أقصى للتشغيل
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "cost" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>التكلفة والحدود</h2>
              <p>ضبط التكلفة حسب المهمة وليس حسب الصفحة.</p>
            </div>
          </div>

          <div className="cost-grid">
            {routes.map((route) => {
              const task = findTask(route.taskType);
              const highCost = Number(route.cost.maxCostPerRun) >= 1;
              return (
                <article key={route.id} className={`cost-card ${highCost ? "high" : ""}`}>
                  <h3>{task?.[1]}</h3>
                  <Info label="Max cost/run" value={`${route.cost.maxCostPerRun}$`} />
                  <Info label="Monthly budget" value={`${route.cost.monthlyBudgetLimit}$`} />
                  <Info label="Approval above" value={`${route.cost.requireApprovalAboveCost}$`} />
                  <Info label="Timeout" value={`${route.policy.timeoutSeconds}s`} />
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "test" && (
        <section className="test-layout">
          <article className="card">
            <div className="card-header">
              <div>
                <h2>اختبار التوجيه</h2>
                <p>اختبار محلي يوضح أي نموذج سيُستخدم بدون استدعاء فعلي.</p>
              </div>
            </div>

            <div className="test-form">
              <label className="field">
                <span>نوع المهمة</span>
                <select value={testTask} onChange={(event) => setTestTask(event.target.value)}>
                  {TASK_TYPES.map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>مدخل الاختبار</span>
                <textarea value={testInput} onChange={(event) => setTestInput(event.target.value)} />
              </label>

              <button type="button" className="primary-button" onClick={runTest}>
                <TestTube2 size={16} />
                اختبار التوجيه
              </button>
            </div>
          </article>

          <article className="card">
            <h2>سجل الاختبار</h2>
            <div className="test-log">
              {testLog.length ? (
                testLog.map((log) => (
                  <div key={log.id} className={`test-row ${log.status}`}>
                    <strong>{log.task}</strong>
                    <span>{log.message}</span>
                    <small>Primary: {log.primary}</small>
                    <small>Fallback: {log.fallback}</small>
                    <small>Estimated max cost: {log.estimatedCost}$</small>
                    <small>{log.time}</small>
                  </div>
                ))
              ) : (
                <p className="empty-log">لم يتم تنفيذ أي اختبار بعد.</p>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}


function WorkflowUsagePanel({ route }) {
  const usage = getWorkflowUsage(route.taskType);

  return (
    <section className={`workflow-usage-box ${usage.length ? "linked" : "orphan"}`}>
      <div className="usage-box-head">
        <ListChecks size={16} />
        <strong>Workflow Usage</strong>
      </div>

      {usage.length ? (
        <div className="usage-list">
          {usage.map((item) => (
            <div key={`${item.workflowId}-${item.taskType}`} className="usage-item">
              <div>
                <strong>{item.workflow}</strong>
                <span>{item.source} · {item.workflowId}</span>
              </div>
              <div className="usage-steps">
                {item.steps.map((step) => (
                  <code key={step}>{step}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="usage-warning">
          <AlertTriangle size={16} />
          <span>
            هذا المسار غير مستخدم في أي Workflow ظاهر داخل النموذج الحالي. لا تحذفه الآن، لكنه يحتاج قرار لاحق: ربطه، إخفاؤه، أو وسمه كمستقبلي.
          </span>
        </div>
      )}
    </section>
  );
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

function Status({ value }) {
  const [label, tone] = STATUS_META[value] || STATUS_META.testing;
  return <span className={`status ${tone}`}>{label}</span>;
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button type="button" className={`switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
        <i />
      </button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.model-routing-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.admin-only-alert,
.stat-card,
.tabs,
.card {
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
  color: #176b2c;
  background: #eef7e9;
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
  border: 0;
  background: #176b2c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.secondary-button {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
}

.admin-only-alert {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #176b2c;
  background: #eef7e9;
  border-color: #d9ead7;
}

.admin-only-alert strong {
  display: block;
  margin-bottom: 4px;
}

.admin-only-alert p {
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
  justify-content: space-between;
  gap: 12px;
  align-items: center;
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

.stat-card.green .stat-icon,
.stat-card.teal .stat-icon {
  color: #176b2c;
  background: #eef7e9;
}

.stat-card.blue .stat-icon {
  color: #2563eb;
  background: #eff6ff;
}

.stat-card.amber .stat-icon {
  color: #92400e;
  background: #fffbeb;
}

.tabs {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tabs button {
  min-height: 38px;
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 0 14px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.tabs button.active {
  color: #fff;
  background: #176b2c;
}

.card {
  padding: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-header h2,
.card h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.7;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.model-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
}

.model-head {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.model-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #176b2c;
  background: #eef7e9;
}

.model-head h3 {
  margin: 0;
  font-size: 15px;
}

.model-head p {
  margin: 4px 0 0;
  color: #6f746b;
  font-size: 11px;
}

.status {
  min-height: 26px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 900;
}

.status.green {
  color: #166534;
  background: #f0fdf4;
}

.status.amber {
  color: #92400e;
  background: #fffbeb;
}

.status.slate {
  color: #475569;
  background: #f8fafc;
}

.status.red {
  color: #991b1b;
  background: #fef2f2;
}

.capability-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.capability-list span {
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 900;
}

.model-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.model-actions {
  margin-top: 12px;
}

.model-actions select,
.field select,
.field input,
.field textarea,
.fallback-box select {
  width: 100%;
  min-height: 40px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 0 12px;
  font-family: inherit;
  outline: 0;
}

.routes-layout,
.test-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.routes-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) 130px 170px 80px 130px 110px 100px;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
}

.table-head {
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.table-row {
  width: 100%;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
  font-size: 12px;
}

.table-row.selected {
  background: #fbfdf9;
}

.table-row strong,
.table-row small {
  display: block;
}

.table-row small {
  margin-top: 3px;
  color: #6f746b;
}

.route-editor {
  position: sticky;
  top: 96px;
}


.workflow-usage-box {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  padding: 12px;
  margin: 14px 0;
  background: #fbfdf9;
}

.workflow-usage-box.orphan {
  border-color: #fed7aa;
  background: #fff7ed;
}

.usage-box-head,
.usage-mini-row {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  font-size: 12px;
  font-weight: 900;
}

.usage-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.usage-item {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.usage-item strong,
.usage-item span {
  display: block;
}

.usage-item span {
  color: #6f746b;
  font-size: 12px;
  margin-top: 3px;
}

.usage-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.usage-steps code {
  direction: ltr;
  background: #f7f8f4;
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 4px 7px;
  font-size: 11px;
  color: #374151;
}

.usage-warning {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  color: #9a3412;
  font-size: 12px;
  line-height: 1.8;
  margin-top: 8px;
}

.usage-mini-row {
  margin-top: 12px;
  color: #374151;
}

.route-editor p {
  color: #6f746b;
  font-size: 13px;
  line-height: 1.7;
}

.field {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.field span {
  font-size: 12px;
  font-weight: 900;
}

.field textarea {
  min-height: 130px;
  padding: 12px;
  resize: vertical;
  line-height: 1.8;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.fallback-box {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  margin-top: 14px;
}

.fallback-box > strong {
  display: block;
  margin-bottom: 10px;
}

.fallback-row {
  min-height: 36px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid #e4e7df;
}

.fallback-row button {
  border: 0;
  color: #991b1b;
  background: transparent;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.fallback-box select {
  margin-top: 10px;
}

.toggle-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.toggle-row {
  min-height: 40px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.toggle-row span {
  font-size: 12px;
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
  background: #176b2c;
}

.switch.on i {
  transform: translateX(-22px);
}

.fallback-grid,
.cost-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.fallback-card,
.cost-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
}

.cost-card.high {
  border-color: #fde68a;
  background: #fff7e6;
}

.fallback-card h3,
.cost-card h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.fallback-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.fallback-chain span {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

.fallback-chain b {
  color: #176b2c;
}

.fallback-card p {
  margin: 10px 0 0;
  color: #6f746b;
  font-size: 12px;
}

.info-row {
  min-height: 38px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.info-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.test-form {
  display: grid;
  gap: 12px;
}

.test-log {
  display: grid;
  gap: 10px;
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

@media (max-width: 1280px) {
  .stats-grid,
  .model-grid,
  .fallback-grid,
  .cost-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .routes-layout,
  .test-layout {
    grid-template-columns: 1fr;
  }

  .route-editor {
    position: static;
  }

  .routes-table {
    overflow: auto;
  }

  .table-head,
  .table-row {
    min-width: 1040px;
  }
}

@media (max-width: 760px) {
  .model-routing-page {
    padding: 16px;
  }

  .page-title,
  .title-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .stats-grid,
  .model-grid,
  .fallback-grid,
  .cost-grid,
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
`;
