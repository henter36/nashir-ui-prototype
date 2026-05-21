import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Eye,
  FileSearch,
  GitBranch,
  ListChecks,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Workflow,
  XCircle,
} from "lucide-react";

const WORKFLOW_TEMPLATES = [
  {
    id: "store_intelligence",
    name: "Store Intelligence",
    description: "فحص رابط المتجر ثم استخراج المنتجات والأصول وتحليل العلامة.",
    triggerScreen: "store_setup",
    triggerAction: "فحص المتجر",
    inputSources: ["store_url", "workspace_id", "language_hint"],
    outputsTo: ["store_profile", "product_catalog", "asset_library", "data_sources"],
    steps: [
      {
        id: "crawl_store_pages",
        name: "زحف صفحات المتجر",
        inputFrom: ["store_url"],
        processorType: "tool_call",
        processor: "store_crawler",
        outputKey: "store_raw_snapshot",
        outputType: "raw_store_snapshot",
        destination: "workflow_runs",
        visibility: "admin_only",
        reviewRequired: false,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "extract_products",
        name: "استخراج المنتجات",
        inputFrom: ["store_raw_snapshot"],
        processorType: "model_call",
        processor: "product_extraction",
        outputKey: "product_candidates",
        outputType: "product_candidates",
        destination: "product_catalog",
        visibility: "reviewer_only",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "campaign_generation",
      },
      {
        id: "detect_assets",
        name: "رصد الأصول والصور",
        inputFrom: ["store_raw_snapshot"],
        processorType: "tool_call",
        processor: "asset_detector",
        outputKey: "asset_candidates",
        outputType: "asset_candidates",
        destination: "asset_library",
        visibility: "reviewer_only",
        reviewRequired: true,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "analyze_store_brand",
        name: "تحليل هوية المتجر",
        inputFrom: ["store_raw_snapshot", "product_candidates"],
        processorType: "model_call",
        processor: "store_reading",
        outputKey: "brand_insights",
        outputType: "brand_insights",
        destination: "store_setup",
        visibility: "customer_visible",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "campaign_generation",
      },
    ],
  },
  {
    id: "campaign_generation",
    name: "Campaign Generation",
    description: "تحويل Brief الحملة إلى استراتيجية ومخرجات أولية.",
    triggerScreen: "campaign_intake",
    triggerAction: "توليد الحملة",
    inputSources: ["campaign_brief", "store_context", "product_context", "asset_context", "governance_context"],
    outputsTo: ["campaign_detail", "content_studio", "review"],
    steps: [
      {
        id: "validate_campaign_brief",
        name: "فحص اكتمال الـ Brief",
        inputFrom: ["campaign_brief", "product_context"],
        processorType: "policy_check",
        processor: "brief_validation",
        outputKey: "brief_validation_report",
        outputType: "risk_report",
        destination: "review",
        visibility: "reviewer_only",
        reviewRequired: false,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "build_campaign_strategy",
        name: "بناء استراتيجية الحملة",
        inputFrom: ["campaign_brief", "brand_insights", "product_candidates"],
        processorType: "model_call",
        processor: "campaign_strategy",
        outputKey: "campaign_strategy",
        outputType: "campaign_strategy",
        destination: "campaign_detail",
        visibility: "customer_visible",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "content_generation",
      },
      {
        id: "generate_content_plan",
        name: "تجهيز خطة المخرجات",
        inputFrom: ["campaign_strategy", "selected_channels"],
        processorType: "model_call",
        processor: "ad_copy_generation",
        outputKey: "content_plan",
        outputType: "content_draft",
        destination: "content_studio",
        visibility: "customer_visible",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "risk_review",
      },
    ],
  },
  {
    id: "content_generation",
    name: "Content Regeneration",
    description: "إعادة توليد محتوى محدد من Content Studio.",
    triggerScreen: "content_studio",
    triggerAction: "إعادة توليد",
    inputSources: ["content_id", "campaign_brief", "selected_assets", "output_type"],
    outputsTo: ["content_studio", "review"],
    steps: [
      {
        id: "load_content_context",
        name: "تحميل سياق المحتوى",
        inputFrom: ["content_id", "campaign_brief"],
        processorType: "tool_call",
        processor: "content_context_loader",
        outputKey: "content_context",
        outputType: "raw_store_snapshot",
        destination: "workflow_runs",
        visibility: "admin_only",
        reviewRequired: false,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "rewrite_content",
        name: "إعادة صياغة المحتوى",
        inputFrom: ["content_context", "brand_insights"],
        processorType: "model_call",
        processor: "content_rewrite",
        outputKey: "content_draft",
        outputType: "content_draft",
        destination: "content_studio",
        visibility: "customer_visible",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "risk_review",
      },
    ],
  },
  {
    id: "video_generation",
    name: "Video Generation",
    description: "سيناريو ظاهر للعميل، مطالبة داخلية، مراجعة مخاطر، ثم توليد فيديو.",
    triggerScreen: "content_studio",
    triggerAction: "توليد فيديو",
    inputSources: ["campaign_brief", "product_context", "approved_assets", "channel_specs", "governance_context"],
    outputsTo: ["content_studio", "asset_library", "review", "workflow_runs"],
    steps: [
      {
        id: "write_customer_video_brief",
        name: "كتابة شرح الفيديو للعميل",
        inputFrom: ["campaign_brief", "product_context"],
        processorType: "model_call",
        processor: "video_script_generation",
        outputKey: "customer_video_brief",
        outputType: "customer_visible_brief",
        destination: "content_studio",
        visibility: "customer_visible",
        reviewRequired: true,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "write_internal_video_prompt",
        name: "كتابة مطالبة الفيديو الداخلية",
        inputFrom: ["customer_video_brief", "approved_assets", "brand_rules"],
        processorType: "model_call",
        processor: "video_script_generation",
        outputKey: "internal_video_prompt",
        outputType: "internal_prompt",
        destination: "workflow_runs",
        visibility: "internal_only",
        reviewRequired: true,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "review_video_prompt",
        name: "مراجعة المخاطر والادعاءات",
        inputFrom: ["internal_video_prompt", "customer_video_brief", "approved_assets"],
        processorType: "model_call",
        processor: "risk_review",
        outputKey: "risk_clearance",
        outputType: "risk_report",
        destination: "review",
        visibility: "reviewer_only",
        reviewRequired: true,
        feedsNextWorkflow: false,
        nextWorkflowType: "",
      },
      {
        id: "generate_video_asset",
        name: "إرسال إلى نموذج الفيديو",
        inputFrom: ["risk_clearance", "internal_video_prompt", "approved_assets"],
        processorType: "model_call",
        processor: "video_generation",
        outputKey: "generated_video_asset",
        outputType: "generated_asset",
        destination: "asset_library",
        visibility: "reviewer_only",
        reviewRequired: true,
        feedsNextWorkflow: true,
        nextWorkflowType: "publishing",
      },
    ],
  },
];

const PROCESSOR_TYPES = [
  ["tool_call", "استدعاء أداة"],
  ["model_call", "استدعاء نموذج"],
  ["human_review", "مراجعة بشرية"],
  ["asset_check", "فحص أصول"],
  ["cost_check", "فحص تكلفة"],
  ["policy_check", "فحص سياسة"],
  ["data_transform", "تحويل بيانات"],
];

const PROCESSORS = [
  ["store_crawler", "Store Crawler"],
  ["social_analyzer", "Social Analyzer"],
  ["product_extraction", "Product Extraction"],
  ["asset_detector", "Asset Detector"],
  ["store_reading", "Store Reading Model"],
  ["campaign_strategy", "Campaign Strategy Model"],
  ["ad_copy_generation", "Ad Copy Model"],
  ["content_rewrite", "Content Rewrite Model"],
  ["video_script_generation", "Video Script Model"],
  ["image_generation", "Image Generation Model"],
  ["video_generation", "Video Generation Model"],
  ["risk_review", "Risk Review Model"],
  ["analytics_summary", "Analytics Summary Model"],
  ["ai_recommendations", "AI Recommendations Model"],
  ["brief_validation", "Brief Validation"],
  ["content_context_loader", "Content Context Loader"],
];

const INPUT_SOURCES = [
  "store_url",
  "social_account",
  "campaign_brief",
  "store_context",
  "product_context",
  "product_candidates",
  "asset_context",
  "approved_assets",
  "selected_assets",
  "channel_specs",
  "governance_context",
  "analytics_metrics",
  "content_id",
  "manual_input",
  "previous_step_output",
];

const OUTPUT_TYPES = [
  "raw_store_snapshot",
  "product_candidates",
  "asset_candidates",
  "brand_insights",
  "audience_insights",
  "campaign_strategy",
  "customer_visible_brief",
  "internal_prompt",
  "content_draft",
  "risk_report",
  "generated_asset",
  "analytics_recommendation",
  "publishing_item",
];

const DESTINATIONS = [
  "store_setup",
  "store_profile",
  "data_sources",
  "product_catalog",
  "asset_library",
  "campaign_detail",
  "content_studio",
  "review",
  "publishing_queue",
  "analytics",
  "workflow_runs",
  "audit_log",
];

const VISIBILITY = [
  ["customer_visible", "ظاهر للعميل"],
  ["internal_only", "داخلي فقط"],
  ["reviewer_only", "للمراجع فقط"],
  ["admin_only", "للمدير فقط"],
];

const NEXT_WORKFLOWS = [
  ["", "لا يفتح Workflow آخر"],
  ["store_intelligence", "Store Intelligence"],
  ["campaign_generation", "Campaign Generation"],
  ["content_generation", "Content Generation"],
  ["image_generation", "Image Generation"],
  ["video_generation", "Video Generation"],
  ["risk_review", "Risk Review"],
  ["publishing", "Publishing"],
  ["analytics_recommendation", "Analytics Recommendation"],
];

const TABS = [
  ["builder", "Workflow Builder"],
  ["map", "Data Flow Map"],
  ["contracts", "Output Contracts"],
  ["runs", "Runs Monitor"],
  ["test", "Test Run"],
];


const MODEL_ROUTE_CATALOG = {
  store_reading: {
    taskLabel: "قراءة المتجر وتحليل صفحاته",
    primaryModel: "Gemini Store Reader",
    fallback: ["GPT Analysis"],
    maxCostPerRun: "0.35",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  product_extraction: {
    taskLabel: "استخراج المنتجات والتصنيفات",
    primaryModel: "Gemini Store Reader",
    fallback: ["GPT Analysis"],
    maxCostPerRun: "0.20",
    approvalAbove: "0.75",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  campaign_strategy: {
    taskLabel: "تحليل وتخطيط الحملة",
    primaryModel: "GPT Analysis",
    fallback: ["Claude Risk Reviewer"],
    maxCostPerRun: "0.50",
    approvalAbove: "1.50",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  ad_copy_generation: {
    taskLabel: "توليد النصوص الإعلانية",
    primaryModel: "GPT Campaign Writer",
    fallback: ["Claude Risk Reviewer"],
    maxCostPerRun: "0.25",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  content_rewrite: {
    taskLabel: "إعادة صياغة المحتوى",
    primaryModel: "GPT Campaign Writer",
    fallback: ["Claude Risk Reviewer"],
    maxCostPerRun: "0.25",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  video_script_generation: {
    taskLabel: "كتابة سكربت الفيديو",
    primaryModel: "GPT Campaign Writer",
    fallback: ["Claude Risk Reviewer"],
    maxCostPerRun: "0.40",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  video_generation: {
    taskLabel: "توليد الفيديو",
    primaryModel: "Runway Video",
    fallback: ["Flux Image"],
    maxCostPerRun: "8.00",
    approvalAbove: "3.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  risk_review: {
    taskLabel: "مراجعة المخاطر والادعاءات",
    primaryModel: "Claude Risk Reviewer",
    fallback: ["GPT Analysis"],
    maxCostPerRun: "0.40",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  image_generation: {
    taskLabel: "توليد الصور",
    primaryModel: "Flux Image",
    fallback: ["Gemini Store Reader"],
    maxCostPerRun: "1.50",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
  ai_recommendations: {
    taskLabel: "توصيات التحسين",
    primaryModel: "GPT Analysis",
    fallback: ["Gemini Store Reader"],
    maxCostPerRun: "0.30",
    approvalAbove: "1.00",
    humanReviewRequired: true,
    blockAutoPublish: true,
    status: "linked",
  },
};

const RUNS = [
  {
    id: "wf-001",
    workflowType: "store_intelligence",
    title: "فحص متجر النمو",
    status: "completed",
    currentStep: "user_review",
    modelUsed: "Gemini Store Reader",
    cost: 0.18,
    duration: "38s",
    owner: "System",
    source: "Store Setup",
    createdAt: "منذ 12 دقيقة",
    inputSummary: "store_url + workspace_id + language_hint",
    outputSummary: "store_profile + product_catalog + asset_library",
    warnings: ["حقوق بعض الصور تحتاج مراجعة", "تم إخفاء أي بيانات حساسة من العرض"],
    error: "",
    steps: [
      ["queued", "إدخال المهمة للطابور", "0s", "completed"],
      ["crawl_store_pages", "زحف صفحات المتجر", "6s", "completed"],
      ["extract_products", "استخراج المنتجات", "14s", "completed"],
      ["detect_assets", "رصد الأصول والصور", "9s", "completed"],
      ["user_review", "بوابة مراجعة بشرية", "9s", "waiting_for_review"],
    ],
  },
  {
    id: "wf-002",
    workflowType: "campaign_generation",
    title: "توليد حملة عطر X",
    status: "running",
    currentStep: "content_plan",
    modelUsed: "GPT Campaign Writer",
    cost: 0.32,
    duration: "1m 12s",
    owner: "أحمد",
    source: "Campaign Wizard",
    createdAt: "منذ 6 دقائق",
    inputSummary: "campaign_brief + selected_products + channels + cta",
    outputSummary: "قيد توليد content_plan وchannel_variants",
    warnings: [],
    error: "",
    steps: [
      ["queued", "إدخال المهمة للطابور", "0s", "completed"],
      ["build_prompt", "بناء Prompt داخلي", "8s", "completed"],
      ["content_plan", "بناء خطة المحتوى", "55s", "running"],
      ["risk_review", "مراجعة المخاطر", "—", "waiting_for_review"],
    ],
  },
  {
    id: "wf-003",
    workflowType: "video_generation",
    title: "فيديو Reel قصير",
    status: "waiting_for_review",
    currentStep: "risk_review",
    modelUsed: "Runway Video",
    cost: 3.7,
    duration: "2m 40s",
    owner: "محمد",
    source: "Content Studio",
    createdAt: "منذ 22 دقيقة",
    inputSummary: "video_script + product_image + duration=15s",
    outputSummary: "video_draft يحتاج مراجعة قبل الجدولة",
    warnings: ["تكلفة التشغيل مرتفعة", "النشر التلقائي غير مسموح"],
    error: "",
    steps: [
      ["queued", "إدخال المهمة للطابور", "0s", "completed"],
      ["validate_assets", "فحص الأصول", "10s", "completed"],
      ["submit_video_job", "إرسال طلب التوليد", "38s", "completed"],
      ["risk_review", "مراجعة المخاطر", "1m 52s", "waiting_for_review"],
    ],
  },
  {
    id: "wf-004",
    workflowType: "asset_analysis",
    title: "تحليل أصول حملة العيد",
    status: "failed",
    currentStep: "rights_review",
    modelUsed: "Gemini Store Reader",
    cost: 0.22,
    duration: "44s",
    owner: "System",
    source: "Asset Library",
    createdAt: "منذ 45 دقيقة",
    inputSummary: "4 images + brand_logo + product_description",
    outputSummary: "فشل بسبب أصل يحتاج مراجعة حقوق",
    warnings: ["صورة تحتوي شخصًا واضحًا وقد تحتاج موافقة"],
    error: "ASSET_RIGHTS_REVIEW_REQUIRED",
    steps: [
      ["queued", "إدخال المهمة للطابور", "0s", "completed"],
      ["detect_dimensions", "قراءة المقاسات", "9s", "completed"],
      ["quality_check", "فحص الجودة", "16s", "completed"],
      ["rights_review", "مراجعة حقوق الاستخدام", "19s", "failed"],
    ],
  },
];

const STATUS_META = {
  running: ["قيد التشغيل", "blue"],
  waiting_for_review: ["بانتظار مراجعة", "amber"],
  completed: ["مكتمل", "green"],
  failed: ["فشل", "red"],
  cancelled: ["ملغي", "slate"],
};


function getModelRouteSummary(processor) {
  return MODEL_ROUTE_CATALOG[processor] || null;
}

function getModelRouteWarnings(step, route) {
  if (step.processorType !== "model_call") return [];

  const warnings = [];

  if (!route) {
    warnings.push("لا يوجد Model Route مطابق لهذا المعالج في شاشة توجيه النماذج.");
    return warnings;
  }

  if (!route.fallback.length) warnings.push("لا توجد سلسلة Fallback معرفة لهذا المعالج.");
  if (!route.humanReviewRequired) warnings.push("المسار لا يفرض مراجعة بشرية.");
  if (!route.blockAutoPublish) warnings.push("المسار لا يمنع النشر التلقائي.");
  if (Number(route.maxCostPerRun) >= 1) warnings.push("مسار عالي التكلفة ويحتاج مراقبة قبل التشغيل الحقيقي.");
  if (step.visibility === "customer_visible" && !step.reviewRequired) warnings.push("المخرج ظاهر للعميل بدون Review Gate في خطوة الـ Workflow.");

  return warnings;
}

function cloneTemplate(template) {
  return {
    workflowType: template.id,
    name: template.name,
    description: template.description,
    triggerScreen: template.triggerScreen,
    triggerAction: template.triggerAction,
    inputSources: [...template.inputSources],
    outputsTo: [...template.outputsTo],
    steps: template.steps.map((step) => ({ ...step, inputFrom: [...step.inputFrom] })),
    policies: {
      requireHumanReview: true,
      blockAutoPublish: true,
      redactSensitiveData: true,
      logAllSteps: true,
      stopOnAssetRightsIssue: true,
      stopOnCostLimit: true,
    },
  };
}

export default function WorkflowRunsPage() {
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedTemplateId, setSelectedTemplateId] = useState("video_generation");
  const [workflowDraft, setWorkflowDraft] = useState(() =>
    cloneTemplate(WORKFLOW_TEMPLATES.find((template) => template.id === "video_generation"))
  );
  const [selectedRunId, setSelectedRunId] = useState(RUNS[0].id);
  const [testLog, setTestLog] = useState([]);
  const [runActionLog, setRunActionLog] = useState([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [testInput, setTestInput] = useState({
    sourceScreen: "Store Setup",
    samplePayload:
      "{\n  \"store_url\": \"https://store.example.com\",\n  \"workspace_id\": \"ws_demo\",\n  \"language_hint\": \"ar\"\n}",
    mode: "dry_run",
  });
  const [dryRunResult, setDryRunResult] = useState(null);

  const selectedRun = RUNS.find((run) => run.id === selectedRunId) || RUNS[0];

  const selectTemplate = (id) => {
    const template = WORKFLOW_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    setSelectedTemplateId(id);
    setWorkflowDraft(cloneTemplate(template));
    setSelectedStepIndex(0);
  };

  const updateStep = (index, key, value) => {
    setWorkflowDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step, idx) => (idx === index ? { ...step, [key]: value } : step)),
    }));
  };

  const updateStepInput = (index, source) => {
    setWorkflowDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step, idx) => {
        if (idx !== index) return step;
        return {
          ...step,
          inputFrom: step.inputFrom.includes(source)
            ? step.inputFrom.filter((item) => item !== source)
            : [...step.inputFrom, source],
        };
      }),
    }));
  };

  const addStep = () => {
    setWorkflowDraft((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step_${Date.now()}`,
          name: "خطوة جديدة",
          inputFrom: ["previous_step_output"],
          processorType: "model_call",
          processor: "ad_copy_generation",
          outputKey: `output_${Date.now()}`,
          outputType: "content_draft",
          destination: "content_studio",
          visibility: "reviewer_only",
          reviewRequired: true,
          feedsNextWorkflow: false,
          nextWorkflowType: "",
        },
      ],
    }));
    setSelectedStepIndex(workflowDraft.steps.length);
  };

  const removeStep = (index) => {
    setWorkflowDraft((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, idx) => idx !== index),
    }));
    setSelectedStepIndex(0);
  };

  const togglePolicy = (key) => {
    setWorkflowDraft((prev) => ({
      ...prev,
      policies: { ...prev.policies, [key]: !prev.policies[key] },
    }));
  };

  const runLocalTest = () => {
    const missingInputs = workflowDraft.steps.flatMap((step) =>
      step.inputFrom.length ? [] : [`${step.name}: لا يوجد Input source`]
    );

    const unsafeOutputs = workflowDraft.steps.flatMap((step) => {
      const issues = [];

      if (step.visibility === "customer_visible" && !step.reviewRequired) {
        issues.push(`${step.name}: مخرج ظاهر للعميل بدون مراجعة`);
      }

      if (step.feedsNextWorkflow && !step.reviewRequired) {
        issues.push(`${step.name}: يفتح Workflow آخر بدون Review Gate`);
      }

      if (step.destination === "publishing_queue" && !step.reviewRequired) {
        issues.push(`${step.name}: مخرج إلى جدولة النشر بدون مراجعة`);
      }

      return issues;
    });

    const missingModelRoutes = workflowDraft.steps.flatMap((step) =>
      step.processorType === "model_call" && !getModelRouteSummary(step.processor)
        ? [`${step.name}: لا يوجد Model Route مطابق للمعالج ${step.processor}`]
        : []
    );

    const blockedReasons = [...missingInputs, ...unsafeOutputs, ...missingModelRoutes];

    const estimatedCost = workflowDraft.steps.reduce((sum, step) => {
      if (step.processorType === "tool") return sum + 0.05;
      if (step.processorType === "tool_call") return sum + 0.05;
      if (step.processorType === "llm") return sum + 0.18;
      if (step.processorType === "model_call") return sum + 0.18;
      if (step.processorType === "vision") return sum + 0.25;
      if (step.processorType === "generator") return sum + 0.75;
      if (step.processorType === "review") return sum + 0.12;
      return sum + 0.08;
    }, 0);

    const estimatedDuration = workflowDraft.steps.length * 12;

    const result = {
      status: blockedReasons.length ? "blocked" : "passed",
      blockedReasons,
      estimatedCost: estimatedCost.toFixed(2),
      estimatedDuration,
      simulatedSteps: workflowDraft.steps.map((step, index) => ({
        index: index + 1,
        name: step.name,
        processor: step.processor,
        inputFrom: step.inputFrom,
        outputKey: step.outputKey,
        destination: step.destination,
        visibility: step.visibility,
        reviewRequired: step.reviewRequired,
        modelRoute: step.processorType === "model_call" ? getModelRouteSummary(step.processor) : null,
        modelRouteWarnings: getModelRouteWarnings(step, getModelRouteSummary(step.processor)),
        result:
          step.visibility === "customer_visible" && !step.reviewRequired
            ? "blocked"
            : "passed",
      })),
      expectedOutputs: workflowDraft.steps.map((step) => ({
        outputKey: step.outputKey,
        outputType: step.outputType,
        destination: step.destination,
        visibility: step.visibility,
      })),
    };

    setDryRunResult(result);

    setTestLog((prev) => [
      {
        id: Date.now(),
        workflow: workflowDraft.name,
        status: result.status,
        message: blockedReasons.length
          ? `Dry Run blocked: ${blockedReasons.length} سبب`
          : "Dry Run passed successfully",
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const addRunAction = (title, detail, tone = "green") => {
    setRunActionLog((prev) => [
      {
        id: Date.now(),
        title,
        detail,
        tone,
        time: "الآن",
      },
      ...prev,
    ]);
  };

  const retrySelectedRun = () => {
    if (selectedRun.status === "waiting_for_review") {
      addRunAction(
        "تعذر إعادة التشغيل",
        "التشغيل يحتاج مراجعة بشرية أولًا قبل أي Retry.",
        "amber"
      );
      return;
    }

    addRunAction("تمت محاكاة إعادة التشغيل", selectedRun.id, "green");
  };

  const cancelSelectedRun = () => {
    if (selectedRun.status === "completed") {
      addRunAction("لا يمكن الإلغاء", "التشغيل مكتمل بالفعل.", "amber");
      return;
    }

    addRunAction("تمت محاكاة إلغاء التشغيل", selectedRun.id, "red");
  };

  const sendSelectedRunToReview = () => {
    addRunAction("تم إرسال التشغيل للمراجعة", selectedRun.id, "amber");
  };

  const copySelectedRunId = async () => {
    try {
      await navigator.clipboard.writeText(selectedRun.id);
      addRunAction("تم نسخ Run ID", selectedRun.id, "green");
    } catch {
      addRunAction("تعذر النسخ", "المتصفح لم يسمح بالنسخ.", "amber");
    }
  };

  return (
    <main className="workflow-builder-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow"><Workflow size={15} /> Workflow Orchestration</div>
          <h1>مصمم مسارات البيانات بين الأدوات والنماذج</h1>
          <p>
            هنا يتم تحديد مصدر البيانات، من يعالجها، ما المخرج، أين يذهب، وهل
            يدخل في Workflow آخر. هذه صفحة مدير نظام فقط.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button">
            <Save size={16} />
            حفظ محلي
          </button>
          <button type="button" className="primary-button" onClick={runLocalTest}>
            <PlayCircle size={16} />
            اختبار المسار
          </button>
        </div>
      </section>

      <section className="governance-alert">
        <ShieldCheck size={20} />
        <div>
          <strong>لا يظهر هذا للمستخدم النهائي</strong>
          <p>
            المستخدم يرى أفعالًا مثل فحص المتجر أو توليد فيديو. أما أسماء
            النماذج، المطالبات الداخلية، ومسارات البيانات فتظهر هنا فقط.
          </p>
        </div>
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

      {activeTab === "builder" && (
        <section className="builder-layout">
          <aside className="template-card">
            <h2>Workflow Templates</h2>
            <div className="template-list">
              {WORKFLOW_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={selectedTemplateId === template.id ? "active" : ""}
                  onClick={() => selectTemplate(template.id)}
                >
                  <strong>{template.name}</strong>
                  <span>{template.triggerScreen} → {template.triggerAction}</span>
                </button>
              ))}
            </div>
          </aside>

          <article className="steps-card">
            <div className="card-header">
              <div>
                <h2>{workflowDraft.name}</h2>
                <p>{workflowDraft.description}</p>
              </div>
              <button type="button" className="secondary-button" onClick={addStep}>
                + إضافة خطوة
              </button>
            </div>

            <div className="workflow-meta">
              <Info label="Trigger Screen" value={workflowDraft.triggerScreen} />
              <Info label="Trigger Action" value={workflowDraft.triggerAction} />
              <Info label="Inputs" value={workflowDraft.inputSources.join("، ")} />
              <Info label="Outputs To" value={workflowDraft.outputsTo.join("، ")} />
            </div>

            <div className="steps-table">
              <div className="table-head">
                <span>#</span>
                <span>Step</span>
                <span>Input From</span>
                <span>Processor Type</span>
                <span>Processor</span>
                <span>Output Key</span>
                <span>Destination</span>
              </div>

              {workflowDraft.steps.map((step, index) => (
                <button
                  type="button"
                  key={`${step.id}-${index}`}
                  className={`table-row ${selectedStepIndex === index ? "selected" : ""}`}
                  onClick={() => setSelectedStepIndex(index)}
                >
                  <span>{index + 1}</span>
                  <strong>{step.name}</strong>
                  <small>{step.inputFrom.join("، ")}</small>
                  <span>{PROCESSOR_TYPES.find(([id]) => id === step.processorType)?.[1]}</span>
                  <span>{PROCESSORS.find(([id]) => id === step.processor)?.[1] || step.processor}</span>
                  <span>{step.outputKey}</span>
                  <span>{step.destination}</span>
                </button>
              ))}
            </div>
          </article>

          <aside className="step-editor-card">
            <h2>إعداد الخطوة</h2>
            {workflowDraft.steps[selectedStepIndex] ? (
              <StepEditor
                step={workflowDraft.steps[selectedStepIndex]}
                index={selectedStepIndex}
                onChange={updateStep}
                onToggleInput={updateStepInput}
                onDelete={removeStep}
              />
            ) : (
              <p className="empty">لا توجد خطوة محددة.</p>
            )}
          </aside>
        </section>
      )}

{activeTab === "map" && (
  <section className="enhanced-map-layout">
    <article className="map-card">
      <div className="card-header">
        <div>
          <h2>Data Flow Map</h2>
          <p>خريطة تدفق البيانات من المصادر إلى المعالجة ثم المخرجات والوجهات.</p>
        </div>
      </div>

      <div className="flow-lanes">
        <div className="lane-title">Inputs</div>
        <div className="lane-title">Processor</div>
        <div className="lane-title">Output</div>
        <div className="lane-title">Destination</div>
      </div>

      <div className="flow-map-enhanced">
        {workflowDraft.steps.map((step, index) => {
          const visibilityLabel =
            VISIBILITY.find(([id]) => id === step.visibility)?.[1] || step.visibility;

          const processorLabel =
            PROCESSORS.find(([id]) => id === step.processor)?.[1] || step.processor;

          const hasGovernanceWarning =
            (step.visibility === "customer_visible" && !step.reviewRequired) ||
            (step.feedsNextWorkflow && !step.reviewRequired);

          return (
            <div key={`${step.id}-map-enhanced`} className="flow-row">
              <div className="flow-index">{index + 1}</div>

              <div className="flow-cell inputs">
                <strong>Input</strong>
                <div className="flow-tags">
                  {step.inputFrom.map((input) => (
                    <span key={input}>{input}</span>
                  ))}
                </div>
              </div>

              <div className="flow-arrow">←</div>

              <div className="flow-cell processor">
                <strong>{step.name}</strong>
                <span>{processorLabel}</span>
                <small>{PROCESSOR_TYPES.find(([id]) => id === step.processorType)?.[1]}</small>
                <ModelRoutingSummary step={step} compact />
              </div>

              <div className="flow-arrow">←</div>

              <div className={`flow-cell output ${step.visibility}`}>
                <strong>{step.outputKey}</strong>
                <span>{step.outputType}</span>
                <small>{visibilityLabel}</small>
              </div>

              <div className="flow-arrow">←</div>

              <div className="flow-cell destination">
                <strong>{step.destination}</strong>
                <span>
                  {step.feedsNextWorkflow
                    ? `يفتح: ${step.nextWorkflowType}`
                    : "لا يفتح Workflow آخر"}
                </span>
                <small>{step.reviewRequired ? "مراجعة مطلوبة" : "لا توجد مراجعة"}</small>
              </div>

              {hasGovernanceWarning ? (
                <div className="flow-warning">
                  <CircleAlert size={16} />
                  <span>
                    تحذير: هذا التدفق يحتاج مراجعة قبل السماح بالمخرجات أو فتح Workflow لاحق.
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>

    <aside className="map-side-card">
      <h3>Governance Legend</h3>

      <div className="legend-list">
        <div>
          <span className="dot customer" />
          <strong>ظاهر للعميل</strong>
          <small>يجب أن يمر بالمراجعة.</small>
        </div>

        <div>
          <span className="dot internal" />
          <strong>داخلي فقط</strong>
          <small>لا يظهر للعميل أو التقارير.</small>
        </div>

        <div>
          <span className="dot reviewer" />
          <strong>للمراجع فقط</strong>
          <small>يستخدم لاتخاذ قرار الاعتماد.</small>
        </div>

        <div>
          <span className="dot admin" />
          <strong>للمدير فقط</strong>
          <small>مخرجات تشغيلية أو حساسة.</small>
        </div>
      </div>

      <div className="map-policy-note">
        <CircleAlert size={17} />
        <p>
          أي مخرج customer_visible أو أي تدفق يفتح Workflow آخر يجب أن يمر عبر
          Review Gate قبل استخدامه في النشر أو التوليد التالي.
        </p>
      </div>
    </aside>
  </section>
)}

      {activeTab === "contracts" && (
        <section className="contracts-enhanced-layout">
          <article className="contracts-overview-card">
            <div className="card-header">
              <div>
                <h2>Output Contracts</h2>
                <p>تعريف صارم لمخرجات كل خطوة: نوع المخرج، وجهته، من يحق له استهلاكه، وحالة الحساسية والمراجعة.</p>
              </div>
              <span className="contracts-count">{workflowDraft.steps.length} عقود</span>
            </div>

            <div className="contracts-kpi-grid">
              <ContractKpi title="Customer-visible" value={workflowDraft.steps.filter((step) => step.visibility === "customer_visible").length} />
              <ContractKpi title="Review required" value={workflowDraft.steps.filter((step) => step.reviewRequired).length} />
              <ContractKpi title="Feeds workflow" value={workflowDraft.steps.filter((step) => step.feedsNextWorkflow).length} />
              <ContractKpi title="Sensitive outputs" value={workflowDraft.steps.filter((step) => isSensitiveOutput(step)).length} />
            </div>
          </article>

          <section className="contracts-grid enhanced-contracts-grid">
            {workflowDraft.steps.map((step) => {
              const schema = getContractSchema(step);
              const allowedConsumers = getAllowedConsumers(step);
              const riskFlags = getContractRiskFlags(step);
              const sensitive = isSensitiveOutput(step);

              return (
                <article key={`${step.id}-contract`} className={`contract-card enhanced-contract-card ${riskFlags.length ? "has-risk" : ""}`}>
                  <div className="contract-card-head">
                    <div>
                      <h3>{step.name}</h3>
                      <p>{step.outputKey}</p>
                    </div>
                    <span className={`visibility-pill ${step.visibility}`}>
                      {VISIBILITY.find(([id]) => id === step.visibility)?.[1] || step.visibility}
                    </span>
                  </div>

                  <div className="contract-info-grid">
                    <Info label="Output Type" value={step.outputType} />
                    <Info label="Destination" value={step.destination} />
                    <Info label="Review Required" value={step.reviewRequired ? "نعم" : "لا"} />
                    <Info label="Feeds Next Workflow" value={step.feedsNextWorkflow ? step.nextWorkflowType : "لا"} />
                    <Info label="Sensitive" value={sensitive ? "نعم" : "لا"} />
                    <Info label="Retention" value={getRetentionPolicy(step)} />
                  </div>

                  <div className="schema-preview">
                    <strong>Schema Preview</strong>
                    <div className="schema-fields">
                      {schema.required.map((field) => (
                        <span key={field}>{field}</span>
                      ))}
                    </div>
                  </div>

                  <div className="allowed-consumers">
                    <strong>Allowed Consumers</strong>
                    <div>
                      {allowedConsumers.map((consumer) => (
                        <span key={consumer}>{consumer}</span>
                      ))}
                    </div>
                  </div>

                  {riskFlags.length ? (
                    <div className="contract-risk-box">
                      <strong>تحذيرات العقد</strong>
                      {riskFlags.map((risk) => (
                        <p key={risk}>{risk}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="contract-safe-box">
                      <CheckCircle2 size={16} />
                      لا توجد ملاحظات حرجة على هذا العقد.
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        </section>
      )}

      {activeTab === "runs" && (
        <section className="runs-layout enhanced-runs-layout">
          <article className="runs-card">
            <div className="card-header">
              <div>
                <h2>تشغيلات فعلية / تجريبية</h2>
                <p>اختر تشغيلًا لعرض التفاصيل، الخطوات، المدخلات، المخرجات، والتحذيرات.</p>
              </div>
              <span className="runs-count">{RUNS.length} تشغيلات</span>
            </div>

            <div className="runs-list">
              {RUNS.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  className={`run-row ${selectedRun.id === run.id ? "selected" : ""}`}
                  onClick={() => setSelectedRunId(run.id)}
                >
                  <div>
                    <strong>{run.title}</strong>
                    <span>{run.workflowType} · {run.createdAt}</span>
                    <small>{run.id} · {run.modelUsed}</small>
                  </div>
                  <Status value={run.status} />
                </button>
              ))}
            </div>
          </article>

          <article className="run-detail-card">
            <div className="card-header">
              <div>
                <h2>{selectedRun.title}</h2>
                <p>{selectedRun.id}</p>
              </div>
              <Status value={selectedRun.status} />
            </div>

            <div className="run-info-grid">
              <Info label="Workflow Type" value={selectedRun.workflowType} />
              <Info label="Current Step" value={selectedRun.currentStep} />
              <Info label="Model Used" value={selectedRun.modelUsed} />
              <Info label="Source" value={selectedRun.source} />
              <Info label="Duration" value={selectedRun.duration} />
              <Info label="Cost Estimate" value={`$${selectedRun.cost}`} />
              <Info label="Owner" value={selectedRun.owner} />
              <Info label="Created At" value={selectedRun.createdAt} />
            </div>

            <div className="run-actions">
              <button type="button" onClick={retrySelectedRun}>
                <RefreshCw size={15} />
                إعادة التشغيل
              </button>
              <button type="button" onClick={cancelSelectedRun}>
                <XCircle size={15} />
                إلغاء
              </button>
              <button type="button" onClick={sendSelectedRunToReview}>
                <ShieldCheck size={15} />
                إرسال للمراجعة
              </button>
              <button type="button" onClick={copySelectedRunId}>
                <FileSearch size={15} />
                نسخ Run ID
              </button>
            </div>

            <div className="safe-preview-grid">
              <div className="safe-preview">
                <strong>Input Preview</strong>
                <p>{selectedRun.inputSummary}</p>
              </div>
              <div className="safe-preview">
                <strong>Output Preview</strong>
                <p>{selectedRun.outputSummary}</p>
              </div>
            </div>

            {selectedRun.error ? (
              <div className="run-error">
                <strong>Error</strong>
                <code>{selectedRun.error}</code>
              </div>
            ) : null}

            <div className="governance-alert compact-alert">
              <ShieldCheck size={18} />
              <div>
                <strong>عرض آمن للتشغيل</strong>
                <p>لا يتم عرض أسرار، Tokens، أو بيانات عملاء خام داخل هذه اللوحة.</p>
              </div>
            </div>
          </article>

          <article className="run-timeline-card">
            <h2>Step Timeline</h2>
            <div className="run-timeline">
              {selectedRun.steps.map(([id, label, duration, status]) => (
                <div key={`${selectedRun.id}-${id}`} className={`run-step ${status}`}>
                  <div className="run-dot" />
                  <div>
                    <strong>{label}</strong>
                    <span>{id} · {duration}</span>
                  </div>
                  <Status value={status} />
                </div>
              ))}
            </div>
          </article>

          <article className="run-warnings-card">
            <h2>Warnings / Actions</h2>

            <div className="warnings-list">
              {selectedRun.warnings?.length ? (
                selectedRun.warnings.map((warning) => (
                  <div key={warning} className="warning-row">
                    <AlertTriangle size={15} />
                    <span>{warning}</span>
                  </div>
                ))
              ) : (
                <p className="empty">لا توجد تحذيرات لهذا التشغيل.</p>
              )}
            </div>

            <div className="actions-log">
              {runActionLog.length ? (
                runActionLog.map((item) => (
                  <div key={item.id} className={`action-row ${item.tone}`}>
                    <Clock3 size={15} />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.detail} · {item.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty">لم يتم تنفيذ إجراء بعد.</p>
              )}
            </div>
          </article>
        </section>
      )}

      {activeTab === "test" && (
        <section className="enhanced-test-layout">
          <article className="test-card">
            <div className="card-header">
              <div>
                <h2>Test Input Panel</h2>
                <p>
                  اختبار محلي للمسار بدون استدعاء نماذج أو أدوات. الوضع الافتراضي Dry Run فقط.
                </p>
              </div>
            </div>

            <label className="field">
              <span>Source Screen</span>
              <select
                value={testInput.sourceScreen}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    sourceScreen: event.target.value,
                  }))
                }
              >
                <option>Store Setup</option>
                <option>Campaign Wizard</option>
                <option>Asset Library</option>
                <option>Content Studio</option>
                <option>Review</option>
                <option>Analytics</option>
              </select>
            </label>

            <label className="field">
              <span>Sample Payload</span>
              <textarea
                value={testInput.samplePayload}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    samplePayload: event.target.value,
                  }))
                }
              />
            </label>

            <div className="dry-run-mode">
              <strong>Mode</strong>
              <span>Dry Run فقط — لا يوجد تشغيل فعلي للأدوات أو النماذج.</span>
            </div>

            <button type="button" className="primary-button" onClick={runLocalTest}>
              <PlayCircle size={16} />
              تشغيل Dry Run
            </button>
          </article>

          <article className="test-card">
            <div className="card-header">
              <div>
                <h2>Validation Results</h2>
                <p>نتيجة التحقق من المدخلات والسياسات قبل التشغيل.</p>
              </div>
            </div>

            {dryRunResult ? (
              <div
                className={
                  dryRunResult.status === "passed"
                    ? "dry-result passed"
                    : "dry-result blocked"
                }
              >
                <strong>
                  {dryRunResult.status === "passed"
                    ? "Dry Run Passed"
                    : "Dry Run Blocked"}
                </strong>

                <span>
                  التكلفة التقديرية: ${dryRunResult.estimatedCost} · الزمن التقديري:{" "}
                  {dryRunResult.estimatedDuration}s
                </span>

                {dryRunResult.blockedReasons.length ? (
                  <div className="blocked-list">
                    {dryRunResult.blockedReasons.map((reason) => (
                      <div key={reason}>
                        <CircleAlert size={16} />
                        {reason}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>لا توجد أسباب حظر. يمكن الانتقال لتشغيل حقيقي لاحقًا بصلاحيات Admin.</p>
                )}
              </div>
            ) : (
              <p className="empty">لم يتم تنفيذ أي اختبار بعد.</p>
            )}
          </article>

          <article className="test-card wide-test-card">
            <h2>Step-by-step Simulation</h2>

            {dryRunResult ? (
              <div className="simulation-table">
                <div className="simulation-head">
                  <span>#</span>
                  <span>Step</span>
                  <span>Processor</span>
                  <span>Model Route</span>
                  <span>Input</span>
                  <span>Output</span>
                  <span>Destination</span>
                  <span>Status</span>
                </div>

                {dryRunResult.simulatedSteps.map((step) => (
                  <div key={step.index} className="simulation-row">
                    <span>{step.index}</span>
                    <strong>{step.name}</strong>
                    <span>{step.processor}</span>
                    <span>{step.modelRoute ? step.modelRoute.primaryModel : "—"}</span>
                    <span>{step.inputFrom.join(" + ")}</span>
                    <span>{step.outputKey}</span>
                    <span>{step.destination}</span>
                    <span className={step.result === "passed" ? "sim-ok" : "sim-blocked"}>
                      {step.result}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">شغّل Dry Run لرؤية محاكاة الخطوات.</p>
            )}
          </article>

          <article className="test-card wide-test-card">
            <h2>Expected Outputs</h2>

            {dryRunResult ? (
              <div className="expected-grid">
                {dryRunResult.expectedOutputs.map((output) => (
                  <div key={output.outputKey} className={`expected-card ${output.visibility}`}>
                    <strong>{output.outputKey}</strong>
                    <span>{output.outputType}</span>
                    <small>{output.destination}</small>
                    <em>{output.visibility}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">لا توجد مخرجات متوقعة قبل تشغيل الاختبار.</p>
            )}
          </article>

          <article className="test-card wide-test-card">
            <h2>سجل الاختبار</h2>
            <div className="test-log">
              {testLog.length ? (
                testLog.map((log) => (
                  <div key={log.id} className="test-row">
                    <strong>{log.workflow}</strong>
                    <span>{log.message}</span>
                    <small>{log.time}</small>
                  </div>
                ))
              ) : (
                <p className="empty">لم يتم تنفيذ أي اختبار بعد.</p>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}


function ModelRoutingSummary({ step, compact = false }) {
  if (step.processorType !== "model_call") return null;

  const route = getModelRouteSummary(step.processor);
  const warnings = getModelRouteWarnings(step, route);

  if (!route) {
    return (
      <div className={`model-route-summary missing ${compact ? "compact" : ""}`}>
        <div className="model-route-title">
          <CircleAlert size={15} />
          <strong>Model Routing Summary</strong>
        </div>
        <p>لا يوجد مسار توجيه مطابق لهذا المعالج. يجب ربطه من شاشة توجيه النماذج قبل أي تنفيذ حقيقي.</p>
      </div>
    );
  }

  return (
    <div className={`model-route-summary ${warnings.length ? "has-warning" : "safe"} ${compact ? "compact" : ""}`}>
      <div className="model-route-title">
        <GitBranch size={15} />
        <strong>Model Routing Summary</strong>
      </div>

      <div className="model-route-lines">
        <span>Primary: <b>{route.primaryModel}</b></span>
        <span>Fallback: <b>{route.fallback.length ? route.fallback.join(" → ") : "لا يوجد"}</b></span>
        <span>Max cost: <b>${route.maxCostPerRun}</b></span>
        <span>Review: <b>{route.humanReviewRequired ? "Required" : "Not required"}</b></span>
      </div>

      {warnings.length ? (
        <div className="model-route-warnings">
          {warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      ) : (
        <p className="model-route-safe-note">المسار مرتبط ومحكوم كقراءة فقط من شاشة توجيه النماذج.</p>
      )}
    </div>
  );
}

function StepEditor({ step, index, onChange, onToggleInput, onDelete }) {
  return (
    <div className="step-editor">
      <label className="field">
        <span>Step Name</span>
        <input value={step.name} onChange={(e) => onChange(index, "name", e.target.value)} />
      </label>

      <label className="field">
        <span>Step ID</span>
        <input value={step.id} onChange={(e) => onChange(index, "id", e.target.value)} />
      </label>

      <div className="input-source-box">
        <strong>Input From</strong>
        <div>
          {INPUT_SOURCES.map((source) => (
            <button
              key={source}
              type="button"
              className={step.inputFrom.includes(source) ? "selected" : ""}
              onClick={() => onToggleInput(index, source)}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <SelectField
        label="Processor Type"
        value={step.processorType}
        options={PROCESSOR_TYPES}
        onChange={(value) => onChange(index, "processorType", value)}
      />

      <SelectField
        label="Processor / Model Route"
        value={step.processor}
        options={PROCESSORS}
        onChange={(value) => onChange(index, "processor", value)}
      />

      <ModelRoutingSummary step={step} />

      <label className="field">
        <span>Output Key</span>
        <input value={step.outputKey} onChange={(e) => onChange(index, "outputKey", e.target.value)} />
      </label>

      <SelectField
        label="Output Type"
        value={step.outputType}
        options={OUTPUT_TYPES.map((x) => [x, x])}
        onChange={(value) => onChange(index, "outputType", value)}
      />

      <SelectField
        label="Destination"
        value={step.destination}
        options={DESTINATIONS.map((x) => [x, x])}
        onChange={(value) => onChange(index, "destination", value)}
      />

      <SelectField
        label="Visibility"
        value={step.visibility}
        options={VISIBILITY}
        onChange={(value) => onChange(index, "visibility", value)}
      />

      <Toggle
        label="Review Required"
        checked={step.reviewRequired}
        onChange={(value) => onChange(index, "reviewRequired", value)}
      />

      <Toggle
        label="Feeds Next Workflow"
        checked={step.feedsNextWorkflow}
        onChange={(value) => onChange(index, "feedsNextWorkflow", value)}
      />

      {step.feedsNextWorkflow ? (
        <SelectField
          label="Next Workflow"
          value={step.nextWorkflowType}
          options={NEXT_WORKFLOWS}
          onChange={(value) => onChange(index, "nextWorkflowType", value)}
        />
      ) : null}

      <button type="button" className="danger-button" onClick={() => onDelete(index)}>
        حذف الخطوة
      </button>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([id, labelText]) => (
          <option key={id} value={id}>
            {labelText}
          </option>
        ))}
      </select>
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


function ContractKpi({ title, value }) {
  return (
    <div className="contract-kpi">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getContractSchema(step) {
  const base = {
    required: ["output_key", "output_type", "destination", "visibility", "review_required"],
  };

  const map = {
    raw_store_snapshot: ["crawl_id", "source_url", "raw_summary", "captured_at", "confidence_score"],
    product_candidates: ["product_id", "name", "price", "url", "source", "confidence_score"],
    asset_candidates: ["asset_id", "type", "source_url", "usage_rights", "review_status"],
    brand_insights: ["tone", "keywords", "audience_guess", "confidence_score", "sources"],
    audience_insights: ["segments", "motives", "objections", "confidence_score"],
    campaign_strategy: ["goal", "message_angle", "channels", "offer", "risk_notes"],
    customer_visible_brief: ["title", "description", "cta", "constraints", "review_status"],
    internal_prompt: ["prompt_id", "prompt_text_redacted", "model_route", "visibility"],
    content_draft: ["content_id", "channel", "text", "status", "review_required"],
    risk_report: ["risk_level", "claims_to_verify", "blocked_terms", "recommendation"],
    generated_asset: ["asset_id", "asset_type", "url", "usage_rights", "review_status"],
    analytics_recommendation: ["metric_source", "recommendations", "confidence", "estimated_labels"],
    publishing_item: ["content_id", "channel", "scheduled_at", "approval_status", "publishing_mode"],
  };

  return {
    ...base,
    required: map[step.outputType] || base.required,
  };
}

function getAllowedConsumers(step) {
  const base = [step.destination];

  if (step.reviewRequired) base.push("review");
  if (step.feedsNextWorkflow && step.nextWorkflowType) base.push(step.nextWorkflowType);
  if (step.visibility === "admin_only") base.push("system_admin");
  if (step.visibility === "internal_only") base.push("workflow_runs");
  if (step.outputType === "generated_asset" || step.outputType === "asset_candidates") base.push("asset_library");
  if (step.outputType === "publishing_item") base.push("publishing_queue");

  return Array.from(new Set(base.filter(Boolean)));
}

function isSensitiveOutput(step) {
  return ["internal_prompt", "raw_store_snapshot", "risk_report"].includes(step.outputType) || step.visibility === "admin_only" || step.visibility === "internal_only";
}

function getRetentionPolicy(step) {
  if (step.visibility === "admin_only" || step.outputType === "internal_prompt") return "قصير / إداري";
  if (step.reviewRequired) return "حتى الاعتماد";
  return "حسب الحملة";
}

function getContractRiskFlags(step) {
  const risks = [];

  if (step.visibility === "customer_visible" && !step.reviewRequired) {
    risks.push("مخرج ظاهر للعميل بدون مراجعة بشرية — غير مسموح في V1.");
  }

  if (step.feedsNextWorkflow && !step.reviewRequired) {
    risks.push("المخرج يفتح Workflow آخر بدون بوابة مراجعة.");
  }

  if (step.outputType === "generated_asset" && step.destination !== "asset_library") {
    risks.push("الأصول المولدة يجب أن تمر عبر Asset Library قبل الاستخدام.");
  }

  if (step.outputType === "internal_prompt" && step.visibility === "customer_visible") {
    risks.push("المطالبات الداخلية لا يجب أن تكون ظاهرة للعميل.");
  }

  if (step.destination === "publishing_queue" && !step.reviewRequired) {
    risks.push("أي مخرج يذهب لجدولة النشر يجب أن يتطلب مراجعة.");
  }

  return risks;
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function Status({ value }) {
  const map = {
    running: ["قيد التشغيل", "blue"],
    waiting_for_review: ["بانتظار مراجعة", "amber"],
    completed: ["مكتمل", "green"],
    success: ["مكتمل", "green"],
    failed: ["فشل", "red"],
    queued: ["في الطابور", "slate"],
    cancelled: ["ملغي", "slate"],
  };
  const [label, tone] = map[value] || ["غير محدد", "slate"];
  return <span className={`status ${tone}`}>{label}</span>;
}

const styles = `
.workflow-builder-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.governance-alert,
.stat-card,
.tabs,
.template-card,
.steps-card,
.step-editor-card,
.map-card,
.contract-card,
.runs-card,
.test-card {
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
  letter-spacing: -0.04em;
}

.page-title p {
  max-width: 850px;
  color: #6f746b;
  line-height: 1.8;
}

.title-actions {
  display: flex;
  gap: 10px;
}

.primary-button,
.secondary-button,
.danger-button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  border: 0;
  background: #176b2c;
  color: white;
}

.secondary-button {
  border: 1px solid #e4e7df;
  background: white;
}

.danger-button {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
  width: 100%;
  justify-content: center;
}

.governance-alert {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  color: #176b2c;
  background: #eef7e9;
  border-color: #d9ead7;
}

.governance-alert p {
  margin: 4px 0 0;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 16px;
}

.stat-card span {
  display: block;
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.tabs {
  padding: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  background: #176b2c;
  color: white;
}

.builder-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.template-card,
.steps-card,
.step-editor-card,
.map-card,
.contract-card,
.runs-card,
.test-card {
  padding: 18px;
}

.template-card h2,
.steps-card h2,
.step-editor-card h2,
.map-card h2,
.runs-card h2,
.test-card h2 {
  margin: 0 0 14px;
}

.template-list {
  display: grid;
  gap: 10px;
}

.template-list button {
  border: 1px solid #e4e7df;
  background: white;
  border-radius: 18px;
  padding: 12px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.template-list button.active {
  border-color: #176b2c;
  background: #eef7e9;
}

.template-list strong,
.template-list span {
  display: block;
}

.template-list span {
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
}

.card-header p {
  color: #6f746b;
  margin: 5px 0 0;
  font-size: 12px;
}

.workflow-meta {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 14px;
  padding: 10px;
}

.info-row span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
}

.info-row strong {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
}

.steps-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 40px 1fr 1.2fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 12px 14px;
  align-items: center;
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
  background: white;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
  font-size: 12px;
}

.table-row.selected {
  background: #fbfdf9;
}

.table-row strong,
.table-row small,
.table-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.model-route-summary {
  border: 1px solid #d9ead7;
  background: #fbfdf9;
  border-radius: 18px;
  padding: 12px;
  margin-top: 12px;
}

.model-route-summary.compact {
  padding: 9px;
  margin-top: 9px;
  border-radius: 14px;
}

.model-route-summary.missing,
.model-route-summary.has-warning {
  border-color: #fed7aa;
  background: #fff7ed;
}

.model-route-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  font-size: 12px;
  font-weight: 900;
}

.model-route-summary.missing .model-route-title,
.model-route-summary.has-warning .model-route-title {
  color: #9a3412;
}

.model-route-lines {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 9px;
}

.model-route-summary.compact .model-route-lines {
  grid-template-columns: 1fr;
}

.model-route-lines span,
.model-route-safe-note,
.model-route-summary p {
  color: #374151;
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

.model-route-lines b {
  color: #1f241d;
}

.model-route-warnings {
  display: grid;
  gap: 5px;
  margin-top: 9px;
}

.model-route-warnings span {
  border-radius: 12px;
  background: #ffedd5;
  color: #9a3412;
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.6;
  font-weight: 800;
}

.model-route-safe-note {
  margin-top: 8px;
  color: #176b2c;
  font-weight: 800;
}

.step-editor {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.input-source-box > strong {
  font-size: 12px;
  font-weight: 900;
}

.field input,
.field select {
  min-height: 40px;
  border: 1px solid #e4e7df;
  border-radius: 14px;
  padding: 0 11px;
  font-family: inherit;
}

.input-source-box {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
}

.input-source-box > div {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.input-source-box button {
  min-height: 32px;
  border: 1px solid #e4e7df;
  background: white;
  border-radius: 999px;
  padding: 0 9px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}

.input-source-box button.selected {
  border-color: #176b2c;
  background: #eef7e9;
  color: #176b2c;
}

.toggle-row {
  min-height: 40px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
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
  background: white;
  border-radius: 999px;
  transform: translateX(0);
  transition: 0.18s ease;
}

.switch.on {
  background: #176b2c;
}

.switch.on i {
  transform: translateX(-22px);
}

.flow-map {
  display: grid;
  gap: 12px;
}

.flow-node {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  display: grid;
  gap: 6px;
}

.node-index {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #eef7e9;
  color: #176b2c;
  font-weight: 900;
}

.flow-node span,
.flow-node em,
.flow-node p {
  color: #6f746b;
  font-size: 12px;
  line-height: 1.6;
}

.flow-node b {
  color: #176b2c;
}

.contracts-grid,
.mapping-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.contract-card h3 {
  margin: 0 0 12px;
}

.runs-layout,
.test-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}

.runs-list,
.test-log {
  display: grid;
  gap: 10px;
}

.runs-list button {
  border: 1px solid #e4e7df;
  background: white;
  border-radius: 18px;
  padding: 13px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  text-align: right;
  font-family: inherit;
}

.status {
  width: fit-content;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.status.green {
  background: #f0fdf4;
  color: #166534;
}

.status.blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.status.amber {
  background: #fffbeb;
  color: #92400e;
}

.status.red {
  background: #fef2f2;
  color: #991b1b;
}

.test-card p,
.empty {
  color: #6f746b;
  line-height: 1.8;
}

.test-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.test-row strong,
.test-row span,
.test-row small {
  display: block;
}

.test-row span {
  margin-top: 5px;
  line-height: 1.7;
  font-size: 12px;
}

.test-row small {
  margin-top: 5px;
  color: #6f746b;
  font-size: 11px;
}

@media (max-width: 1320px) {
  .builder-layout,
  .runs-layout,
  .test-layout {
    grid-template-columns: 1fr;
  }

  .contracts-grid {
    grid-template-columns: 1fr;
  }

  .steps-table {
    overflow: auto;
  }

  .table-head,
  .table-row {
    min-width: 1150px;
  }
}

@media (max-width: 760px) {
  .workflow-builder-page {
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}


/* Conservative Workflow Runs additions */
.enhanced-runs-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
}

.run-detail-card,
.run-timeline-card,
.run-warnings-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.runs-count {
  width: fit-content;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eef7e9;
  color: #176b2c;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
}

.run-row.selected {
  border-color: #176b2c !important;
  background: #eef7e9 !important;
}

.run-row small {
  display: block;
  color: #6f746b;
  margin-top: 4px;
  font-size: 11px;
}

.run-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.run-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 14px 0;
}

.run-actions button {
  min-height: 38px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.safe-preview-grid {
  display: grid;
  gap: 10px;
}

.safe-preview,
.run-error {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
}

.safe-preview strong,
.safe-preview p,
.run-error strong {
  display: block;
  margin: 0;
}

.safe-preview p {
  color: #374151;
  line-height: 1.8;
  margin-top: 6px;
  font-size: 13px;
}

.run-error {
  margin-top: 10px;
  border-color: #fecaca;
  background: #fef2f2;
}

.run-error code {
  display: block;
  direction: ltr;
  text-align: left;
  color: #991b1b;
  margin-top: 6px;
  white-space: pre-wrap;
}

.compact-alert {
  margin-top: 12px;
  box-shadow: none;
}

.run-timeline,
.warnings-list,
.actions-log {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.run-step,
.warning-row,
.action-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.warning-row,
.action-row {
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: start;
}

.run-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #176b2c;
}

.run-step.running .run-dot {
  background: #2563eb;
}

.run-step.waiting_for_review .run-dot {
  background: #f59e0b;
}

.run-step.failed .run-dot {
  background: #dc2626;
}

.run-step strong,
.run-step span,
.action-row strong,
.action-row span {
  display: block;
}

.run-step span,
.action-row span {
  color: #6f746b;
  margin-top: 3px;
  font-size: 12px;
}

.action-row.green {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.action-row.amber {
  border-color: #fde68a;
  background: #fffbeb;
}

.action-row.red {
  border-color: #fecaca;
  background: #fef2f2;
}

/* Output Contracts enhancement */

.contracts-enhanced-layout {
  display: grid;
  gap: 16px;
}

.contracts-overview-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.contracts-count {
  color: #176b2c;
  background: #eef7e9;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.contracts-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.contract-kpi {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.contract-kpi span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
}

.contract-kpi strong {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  color: #176b2c;
}

.enhanced-contracts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.enhanced-contract-card {
  display: grid;
  gap: 12px;
}

.enhanced-contract-card.has-risk {
  border-color: #fde68a;
}

.contract-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.contract-card-head h3 {
  margin: 0;
}

.contract-card-head p {
  margin: 4px 0 0;
  color: #6f746b;
  font-size: 12px;
}

.visibility-pill {
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 900;
}

.visibility-pill.customer_visible {
  color: #166534;
  background: #f0fdf4;
}

.visibility-pill.internal_only {
  color: #1d4ed8;
  background: #eff6ff;
}

.visibility-pill.reviewer_only {
  color: #92400e;
  background: #fffbeb;
}

.visibility-pill.admin_only {
  color: #475569;
  background: #f8fafc;
}

.contract-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.schema-preview,
.allowed-consumers,
.contract-risk-box,
.contract-safe-box {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.schema-preview strong,
.allowed-consumers strong,
.contract-risk-box strong {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
}

.schema-fields,
.allowed-consumers div {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.schema-fields span,
.allowed-consumers span {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 900;
}

.contract-risk-box {
  border-color: #fde68a;
  background: #fff7e6;
  color: #92400e;
}

.contract-risk-box p {
  margin: 6px 0 0;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.contract-safe-box {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
}

@media (max-width: 1180px) {
  .enhanced-contracts-grid,
  .contracts-kpi-grid {
    grid-template-columns: 1fr;
  }

  .contract-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1280px) {
  .enhanced-runs-layout {
    grid-template-columns: 1fr;
  }

  .run-info-grid,
  .run-actions {
    grid-template-columns: 1fr;
  }
}

/* Test Run enhancement */

.enhanced-test-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 16px;
  align-items: start;
}

.wide-test-card {
  grid-column: 1 / -1;
}

.dry-run-mode {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 13px;
  margin: 14px 0;
}

.dry-run-mode strong,
.dry-run-mode span {
  display: block;
}

.dry-run-mode span {
  margin-top: 4px;
  color: #6f746b;
  font-size: 12px;
}

.dry-result {
  border: 1px solid;
  border-radius: 18px;
  padding: 14px;
}

.dry-result strong,
.dry-result span,
.dry-result p {
  display: block;
}

.dry-result span,
.dry-result p {
  margin-top: 6px;
  line-height: 1.7;
  font-size: 13px;
}

.dry-result.passed {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.dry-result.blocked {
  color: #92400e;
  background: #fffbeb;
  border-color: #fde68a;
}

.blocked-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.blocked-list div {
  border: 1px solid #fde68a;
  background: #fff7e6;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.simulation-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.simulation-head,
.simulation-row {
  display: grid;
  grid-template-columns: 40px 1.1fr 1fr 1.2fr 1fr 1fr 90px;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
}

.simulation-head {
  color: #6f746b;
  background: #f7f8f4;
  font-size: 12px;
  font-weight: 900;
}

.simulation-row {
  border-top: 1px solid #e4e7df;
  background: #fff;
  font-size: 12px;
}

.sim-ok,
.sim-blocked {
  width: fit-content;
  min-height: 26px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.sim-ok {
  color: #166534;
  background: #f0fdf4;
}

.sim-blocked {
  color: #92400e;
  background: #fffbeb;
}

.expected-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.expected-card {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 13px;
}

.expected-card strong,
.expected-card span,
.expected-card small,
.expected-card em {
  display: block;
}

.expected-card span {
  margin-top: 5px;
}

.expected-card small {
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
}

.expected-card em {
  margin-top: 8px;
  font-style: normal;
  font-size: 11px;
  font-weight: 900;
}

.expected-card.customer_visible {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.expected-card.internal_only {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.expected-card.reviewer_only {
  border-color: #fde68a;
  background: #fffbeb;
}

.expected-card.admin_only {
  border-color: #fecaca;
  background: #fef2f2;
}

@media (max-width: 1180px) {
  .enhanced-test-layout {
    grid-template-columns: 1fr;
  }

  .simulation-table {
    overflow: auto;
  }

  .simulation-head,
  .simulation-row {
    min-width: 980px;
  }

  .expected-grid {
    grid-template-columns: 1fr;
  }
}

`;
