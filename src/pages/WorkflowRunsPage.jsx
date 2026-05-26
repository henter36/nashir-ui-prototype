import React, { useEffect, useMemo, useState } from "react";
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
import {
  readCostRows,
  readModelRegistry,
  readModelRoutes,
} from "../utils/modelCostStore.js";
import { readPromptRegistry } from "../utils/promptTemplateStore.js";

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
  ["", "لا يفتح مسارًا آخر"],
  ["store_intelligence", "Store Intelligence"],
  ["campaign_generation", "Campaign Generation"],
  ["content_generation", "Content Generation"],
  ["image_generation", "Image Generation"],
  ["video_generation", "Video Generation"],
  ["risk_review", "Risk Review"],
  ["publishing", "Publishing"],
  ["analytics_recommendation", "Analytics Recommendation"],
];

const STRUCTURED_INPUT_SOURCES = [
  {
    value: "store_setup",
    label: "إعداد المتجر",
    fields: ["store_name", "store_category", "channels", "audience", "offer", "data_source"],
  },
  {
    value: "product_catalog",
    label: "كتالوج المنتجات",
    fields: ["product_name", "category", "price", "product_description"],
  },
  {
    value: "asset_library",
    label: "مكتبة الأصول",
    fields: ["selected_assets", "asset_usage", "review_notes"],
  },
  {
    value: "campaign_wizard",
    label: "معالج الحملة",
    fields: ["audience", "offer", "channels", "cta", "selected_assets"],
  },
  {
    value: "content_studio",
    label: "استوديو المحتوى",
    fields: ["campaign_content", "cta", "previous_outputs"],
  },
  {
    value: "data_sources",
    label: "مصادر البيانات",
    fields: ["data_source", "performance_metrics", "channels"],
  },
  {
    value: "review_preview",
    label: "المراجعة والمعاينة",
    fields: ["review_notes", "campaign_content", "previous_outputs"],
  },
  {
    value: "analytics",
    label: "التحليلات",
    fields: ["performance_metrics", "channels", "previous_outputs"],
  },
  {
    value: "manual",
    label: "إدخال يدوي",
    fields: ["manual_notes", "audience", "offer", "cta"],
  },
];

const INPUT_FIELD_OPTIONS = [
  ["product_name", "اسم المنتج"],
  ["category", "التصنيف"],
  ["price", "السعر"],
  ["product_description", "وصف المنتج"],
  ["selected_assets", "الأصول المختارة"],
  ["channels", "القنوات"],
  ["audience", "الجمهور"],
  ["offer", "العرض"],
  ["cta", "دعوة الإجراء"],
  ["data_source", "مصدر البيانات"],
  ["performance_metrics", "مؤشرات الأداء"],
  ["review_notes", "ملاحظات المراجعة"],
  ["campaign_content", "محتوى الحملة"],
  ["previous_outputs", "المخرجات السابقة"],
  ["store_name", "اسم المتجر"],
  ["store_category", "تصنيف المتجر"],
  ["asset_usage", "استخدام الأصل"],
  ["manual_notes", "ملاحظات يدوية"],
  ["store_url", "رابط المتجر"],
  ["workspace_id", "مساحة العمل"],
  ["language_hint", "تلميح اللغة"],
  ["social_account", "الحساب الاجتماعي"],
  ["campaign_brief", "ملخص الحملة"],
  ["store_context", "سياق المتجر"],
  ["product_context", "سياق المنتج"],
  ["product_candidates", "منتجات مرشحة"],
  ["asset_context", "سياق الأصول"],
  ["approved_assets", "أصول تمت مراجعتها"],
  ["channel_specs", "مواصفات القناة"],
  ["governance_context", "سياق الحوكمة"],
  ["analytics_metrics", "مؤشرات التحليلات"],
  ["content_id", "مرجع المحتوى"],
  ["manual_input", "إدخال يدوي"],
  ["previous_step_output", "مخرج الخطوة السابقة"],
  ["brand_insights", "إشارات العلامة"],
  ["selected_channels", "القنوات المختارة"],
  ["content_context", "سياق المحتوى"],
  ["customer_video_brief", "شرح فيديو للعميل"],
  ["internal_video_prompt", "مطالبة داخلية محجوبة"],
  ["risk_clearance", "نتيجة مراجعة المخاطر"],
  ["brand_rules", "قواعد العلامة"],
];

const OUTPUT_TYPE_OPTIONS = [
  ["content_draft", "نص حملة"],
  ["generated_asset", "أصل بصري"],
  ["customer_visible_brief", "سيناريو فيديو"],
  ["analytics_recommendation", "ملخص تحليلي"],
  ["campaign_strategy", "توصية"],
  ["brand_insights", "بيانات منظمة"],
  ["product_candidates", "قائمة مهام"],
  ["risk_report", "قرار مراجعة"],
  ["asset_candidates", "أصول مرشحة"],
  ["raw_store_snapshot", "لقطة بيانات"],
  ["audience_insights", "تحليل جمهور"],
  ["internal_prompt", "مخرج داخلي محجوب"],
  ["publishing_item", "عنصر جاهزية نشر"],
];

const OUTPUT_FORMATS = [
  ["text", "نص"],
  ["json", "JSON"],
  ["preview_card", "بطاقة معاينة"],
  ["image", "صورة"],
  ["video", "فيديو"],
  ["table", "جدول"],
  ["list", "قائمة"],
];

const DESTINATION_OPTIONS = [
  ["store_setup", "إعداد المتجر"],
  ["store_profile", "ملف المتجر"],
  ["data_sources", "مصادر البيانات"],
  ["product_catalog", "كتالوج المنتجات"],
  ["asset_library", "مكتبة الأصول"],
  ["campaign_detail", "تفاصيل الحملة"],
  ["content_studio", "استوديو المحتوى"],
  ["review", "المراجعة والمعاينة"],
  ["publishing_queue", "جاهزية النشر"],
  ["analytics", "التحليلات"],
  ["workflow_runs", "تشغيلات النظام"],
  ["audit_log", "سجل المراجعة"],
];

const TRANSITION_CONDITIONS = [
  ["always", "دائمًا"],
  ["after_review", "بعد المراجعة"],
  ["no_warnings", "عند عدم وجود تحذيرات"],
  ["user_approved", "عند اعتماد المستخدم"],
  ["valid_output", "عند وجود مخرج صالح"],
];

const TABS = [
  ["builder", "مصمم مسارات التشغيل"],
  ["map", "خريطة تدفق البيانات"],
  ["contracts", "ضوابط المخرجات"],
  ["runs", "مراقبة التشغيلات"],
  ["test", "اختبار المسار"],
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

const DATA_PROCESSING_PIPELINE = [
  {
    name: "تحديد مصدر البيانات",
    status: "جاهز للتصميم",
    input: "نوع المتجر وقناة البيع الأساسية",
    output: "خطة جمع البيانات",
    layer: "إعداد المتجر",
    tool: "اختيار واجهي",
    blocked: "لا يوجد حظر في النموذج الأولي",
    warnings: "تحتاج مراجعة قبل التنفيذ الحقيقي",
  },
  {
    name: "تشغيل الموصل",
    status: "غير منفذ",
    input: "إعداد الموصل ومرجع السر",
    output: "تشغيل مجدول أو يدوي لاحقًا",
    layer: "Data Sources Hub",
    tool: "Official API / Firecrawl / Browserless / Apify",
    blocked: "Backend مطلوب",
    warnings: "لا توجد موصلات نشطة من الواجهة",
  },
  {
    name: "حفظ البيانات الخام",
    status: "غير منفذ",
    input: "نتيجة الموصل",
    output: "Raw Payload",
    layer: "طبقة التخزين لاحقًا",
    tool: "Queue + Storage",
    blocked: "لا يوجد تخزين إنتاجي",
    warnings: "يلزم تحديد سياسة الاحتفاظ",
  },
  {
    name: "تطبيع البيانات",
    status: "جاهز للتصميم",
    input: "Raw Payload",
    output: "Normalized Signals",
    layer: "Processing Pipeline",
    tool: "Rule engine + classifiers",
    blocked: "لا يوجد Backend للمعالجة",
    warnings: "الخرائط الحالية واجهية فقط",
  },
  {
    name: "بناء حزمة أدلة للتحليل",
    status: "جاهز للتصميم",
    input: "البيانات المنظمة",
    output: "Evidence Pack",
    layer: "AI preparation",
    tool: "Evidence builder",
    blocked: "لا يوجد إنشاء حقيقي للحزمة",
    warnings: "يجب فصل الحقائق عن الاستنتاجات",
  },
  {
    name: "إرسال مهمة الذكاء الاصطناعي",
    status: "غير منفذ",
    input: "Evidence Pack + مخطط الإخراج",
    output: "Structured AI result",
    layer: "AI orchestration",
    tool: "Model Route + Prompt Governance",
    blocked: "لا يوجد استدعاء نموذج حقيقي",
    warnings: "تحتاج مطالبة معتمدة وحد تكلفة",
  },
  {
    name: "مراجعة المخرجات",
    status: "مطلوبة",
    input: "Structured AI result",
    output: "ReviewFinding",
    layer: "Review Preview",
    tool: "Human review",
    blocked: "لا يعتمد أي مخرج ظاهر دون مراجعة",
    warnings: "النشر التلقائي غير مسموح",
  },
  {
    name: "إعادة استخدام النتائج",
    status: "جاهز للتصميم",
    input: "مخرجات معتمدة",
    output: "Strategy / Brief / Readiness",
    layer: "Commercial journey",
    tool: "Shared contracts",
    blocked: "لا يوجد حفظ إنتاجي",
    warnings: "إعادة الاستخدام يجب أن تحفظ المصدر والقيود",
  },
];

const PROCESSING_READINESS_CHECKS = [
  ["نوع المتجر محدد", "مخطط من إعداد المتجر"],
  ["خطة جمع البيانات موجودة", "متوفرة كتصميم واجهي"],
  ["الموصل مهيأ", "مهيأ فقط"],
  ["مرجع السر موجود", "اسم مرجع لاحقًا فقط"],
  ["Backend مطلوب", "نعم"],
  ["مخطط المخرجات محدد", "محدد كعقد واجهي"],
  ["مراجعة بشرية مطلوبة", "نعم"],
  ["النشر التلقائي غير مسموح", "نعم"],
];

const EVIDENCE_PACK_ITEMS = [
  "ملخص المتجر",
  "المنتجات",
  "الأصول",
  "القنوات",
  "السياسات",
  "إشارات اجتماعية عند توفر موصل مصرح",
  "حدود البيانات",
  "مستوى الثقة",
  "نوع المهمة",
  "مخطط الإخراج",
];

const REUSABLE_OUTPUTS = [
  ["StoreStrategicPlan", "إعداد المتجر، Dashboard، معالج الحملة"],
  ["SocialStoreIntelligenceReport", "إعداد المتجر، Dashboard، معالج الحملة، استوديو المحتوى"],
  ["ProductMarketingPriority", "كتالوج المنتجات، معالج الحملة"],
  ["AssetGapReport", "مكتبة الأصول، استوديو المحتوى"],
  ["CampaignBrief", "معالج الحملة، استوديو المحتوى"],
  ["CampaignContentOutput", "استوديو المحتوى، المراجعة والمعاينة"],
  ["ReviewFinding", "المراجعة والمعاينة، جدولة النشر"],
  ["PublishingReadiness", "جدولة النشر، Dashboard"],
];


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
  if (!route.humanReviewRequired) warnings.push("أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.");
  if (!route.blockAutoPublish) warnings.push("يجب منع النشر التلقائي دون مراجعة.");
  if (Number(route.maxCostPerRun) >= 1) warnings.push("المسارات عالية التكلفة تحتاج اعتمادًا قبل التشغيل.");
  if (step.visibility === "customer_visible" && !step.reviewRequired) warnings.push("أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.");

  return warnings;
}

function getStepRoute(step, modelRoutes = []) {
  if (!step || step.processorType !== "model_call") return null;

  return (
    modelRoutes.find((route) => route.taskType === step.processor || route.processor === step.processor) ||
    modelRoutes.find((route) => route.taskType === step.outputType) ||
    null
  );
}

function getStepCostRow(step, route, costRows = []) {
  if (!step) return null;
  const routeKeys = [route?.taskType, route?.["route" + "Id"], route?.id, step.processor, step.outputType].filter(Boolean);

  return (
    costRows.find((row) => routeKeys.includes(row.task) || routeKeys.includes(row.route)) ||
    null
  );
}

function getOptionLabel(options, value) {
  return options.find(([id]) => id === value)?.[1] || value || "—";
}

function getInputFieldLabel(value) {
  return getOptionLabel(INPUT_FIELD_OPTIONS, value);
}

function getInputSourceLabel(value) {
  return STRUCTURED_INPUT_SOURCES.find((source) => source.value === value)?.label || "إدخال يدوي";
}

function inferInputDomain(step) {
  const fields = Array.isArray(step?.inputFrom) ? step.inputFrom : [];
  const match = STRUCTURED_INPUT_SOURCES.find((source) =>
    fields.some((field) => source.fields.includes(field))
  );

  return step?.inputDomain || match?.value || "manual";
}

function getFieldsForSource(sourceValue) {
  const source = STRUCTURED_INPUT_SOURCES.find((item) => item.value === sourceValue);
  return source?.fields?.length ? source.fields : INPUT_FIELD_OPTIONS.map(([id]) => id);
}

function getPromptStatusLabel(prompt) {
  if (!prompt) return "لا توجد مطالبة مرتبطة";
  const statusMap = {
    active: "معتمدة",
    approved: "معتمدة",
    testing: "تحت الاختبار",
    draft: "المطالبة غير معتمدة / تحتاج مراجعة",
    blocked: "المطالبة غير معتمدة / تحتاج مراجعة",
  };

  return statusMap[prompt.status] || "تحتاج مراجعة";
}

function getWorkflowLabel(value) {
  return NEXT_WORKFLOWS.find(([id]) => id === value)?.[1] || value || "لا يوجد";
}

function getConsumerLabel(value) {
  const destination = DESTINATION_OPTIONS.find(([id]) => id === value)?.[1];
  const workflow = NEXT_WORKFLOWS.find(([id]) => id === value)?.[1];
  return destination || workflow || value || "—";
}

function getStepOutputName(step) {
  return step?.outputKey || "مخرج غير مسمى";
}

function getStepPrompt(step, workflowDraft, promptRegistry = []) {
  if (!step) return null;

  return (
    promptRegistry.find((prompt) => prompt.task === step.processor || prompt.task === step.outputType) ||
    promptRegistry.find((prompt) =>
      prompt.usage?.some((usage) => usage.step === step.id || usage.step === step.name || usage.workflow === workflowDraft?.name)
    ) ||
    null
  );
}

function getCostLimitLabel(route, costRow) {
  const routeMax = route?.cost?.maxCostPerRun;
  const rowMax = costRow?.avgRunCost;
  const value = routeMax ?? rowMax;

  return value !== undefined && value !== null && value !== "" ? `$${value}` : "غير محدد";
}

function buildStepReadiness(step, context = {}) {
  const checks = [];
  const warnings = [];
  const blockedReasons = [];
  const {
    modelRegistry = [],
    modelRoutes = [],
    costRows = [],
    promptRegistry = [],
    workflowDraft = null,
  } = context;

  if (!step) {
    return {
      status: "blocked",
      score: 0,
      checks: ["لا توجد خطوة محددة."],
      warnings: [],
      blockedReasons: ["لا توجد خطوة محددة."],
      route: null,
      primaryModel: null,
      fallbackModels: [],
      costRow: null,
      prompt: null,
    };
  }

  const route = getStepRoute(step, modelRoutes);
  const staticRoute = getModelRouteSummary(step.processor);
  const primaryModel = route
    ? modelRegistry.find((model) => model.id === route.primaryModelId || model.modelId === route.primaryModelId)
    : null;
  const fallbackIds = Array.isArray(route?.fallbackModelIds) ? route.fallbackModelIds : [];
  const fallbackModels = fallbackIds
    .map((id) => modelRegistry.find((model) => model.id === id || model.modelId === id))
    .filter(Boolean);
  const costRow = getStepCostRow(step, route, costRows);
  const prompt = getStepPrompt(step, workflowDraft, promptRegistry);

  if (step.processorType !== "model_call") {
    checks.push("لا يحتاج مسار نموذج.");
    checks.push("متطلبات تشغيل غير نموذجية.");
  } else if (route) {
    checks.push("مسار النموذج موجود.");
  } else if (staticRoute) {
    warnings.push("لا يوجد مسار نموذج مطابق لهذه الخطوة في بيانات التوجيه الحالية.");
  } else {
    warnings.push("لا يوجد مسار نموذج مطابق لهذه الخطوة.");
  }

  if (step.processorType === "model_call" && route) {
    if (primaryModel) {
      checks.push("النموذج الأساسي موجود.");
      if (primaryModel.status === "active") {
        checks.push("النموذج الأساسي نشط.");
      } else {
        blockedReasons.push("النموذج الأساسي غير نشط.");
      }
    } else {
      blockedReasons.push("النموذج الأساسي غير موجود في سجل النماذج.");
    }

    if (fallbackIds.length) {
      if (fallbackModels.length === fallbackIds.length) {
        checks.push("النماذج البديلة معرفة.");
      } else {
        warnings.push("بعض النماذج البديلة غير موجودة في سجل النماذج.");
      }
    } else {
      warnings.push("لا توجد نماذج بديلة معرفة لهذه الخطوة.");
    }
  }

  if (step.processorType === "model_call") {
    if (costRow) {
      checks.push("صف التكلفة مرتبط.");
    } else {
      warnings.push("لا يوجد صف تكلفة مطابق لهذه الخطوة.");
    }

    const maxCost = Number(route?.cost?.maxCostPerRun ?? costRow?.avgRunCost ?? 0);
    const approvalAbove = Number(route?.cost?.requireApprovalAboveCost ?? costRow?.approvalAbove ?? Number.POSITIVE_INFINITY);

    if (Number.isFinite(maxCost) && Number.isFinite(approvalAbove) && maxCost > approvalAbove) {
      warnings.push("حد تكلفة التشغيل أعلى من حد الموافقة.");
    } else if (maxCost > 0) {
      checks.push("حد التكلفة ضمن سياسة الموافقة.");
    }
  }

  if (step.visibility === "customer_visible") {
    if (step.reviewRequired) {
      checks.push("المخرج الظاهر للعميل يمر بالمراجعة.");
    } else {
      blockedReasons.push("أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.");
    }
  }

  if (step.destination === "publishing_queue") {
    if (step.reviewRequired) {
      checks.push("وجهة النشر مرتبطة بمراجعة.");
    } else {
      blockedReasons.push("وجهات النشر تحتاج مراجعة قبل الاستخدام.");
    }
  }

  if (step.feedsNextWorkflow) {
    if (step.reviewRequired) {
      checks.push("المخرج الذي يفتح مسارًا آخر يمر بالمراجعة.");
    } else {
      blockedReasons.push("المخرج يفتح مسارًا آخر دون مراجعة.");
    }
  }

  if (step.processorType === "model_call") {
    if (prompt) {
      checks.push("المطالبة المرتبطة موجودة.");
      if (prompt.status === "active" || prompt.status === "approved") {
        checks.push("المطالبة المرتبطة معتمدة.");
      } else if (prompt.status === "testing") {
        warnings.push("المطالبة المرتبطة في حالة اختبار.");
      } else if (prompt.status === "draft") {
        blockedReasons.push("المطالبة المرتبطة ما زالت مسودة.");
      } else if (prompt.status === "blocked") {
        blockedReasons.push("المطالبة المرتبطة محظورة.");
      } else {
        warnings.push("حالة المطالبة المرتبطة تحتاج مراجعة.");
      }
    } else {
      warnings.push("لا يوجد ربط مطالبة معتمد لهذه الخطوة.");
    }
  }

  const score = Math.max(0, 100 - blockedReasons.length * 30 - warnings.length * 10);
  const status = blockedReasons.length ? "blocked" : warnings.length ? "warning" : "ready";

  return {
    status,
    score,
    checks,
    blockedReasons,
    warnings,
    route,
    primaryModel,
    fallbackModels,
    costRow,
    prompt,
    staticRoute,
  };
}

function cloneTemplate(template) {
  const source = template || WORKFLOW_TEMPLATES[0];
  return {
    workflowType: source.id,
    name: source.name,
    description: source.description,
    triggerScreen: source.triggerScreen,
    triggerAction: source.triggerAction,
    inputSources: [...source.inputSources],
    outputsTo: [...source.outputsTo],
    steps: source.steps.map((step) => ({ ...step, inputFrom: [...step.inputFrom] })),
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
  const [modelRegistry, setModelRegistry] = useState(() => readModelRegistry([]));
  const [modelRoutes, setModelRoutes] = useState(() => readModelRoutes([]));
  const [costRows, setCostRows] = useState(() => readCostRows([]));
  const [promptRegistry, setPromptRegistry] = useState(() => readPromptRegistry([]));
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

  useEffect(() => {
    const reloadReadinessSources = () => {
      setModelRegistry(readModelRegistry([]));
      setModelRoutes(readModelRoutes([]));
      setCostRows(readCostRows([]));
      setPromptRegistry(readPromptRegistry([]));
    };

    window.addEventListener("focus", reloadReadinessSources);
    window.addEventListener("storage", reloadReadinessSources);
    window.addEventListener("nashir-model-registry-updated", reloadReadinessSources);
    window.addEventListener("nashir-model-routing-updated", reloadReadinessSources);
    window.addEventListener("nashir-cost-monitor-updated", reloadReadinessSources);
    window.addEventListener("nashir-prompt-governance-updated", reloadReadinessSources);

    return () => {
      window.removeEventListener("focus", reloadReadinessSources);
      window.removeEventListener("storage", reloadReadinessSources);
      window.removeEventListener("nashir-model-registry-updated", reloadReadinessSources);
      window.removeEventListener("nashir-model-routing-updated", reloadReadinessSources);
      window.removeEventListener("nashir-cost-monitor-updated", reloadReadinessSources);
      window.removeEventListener("nashir-prompt-governance-updated", reloadReadinessSources);
    };
  }, []);

  const readinessContext = useMemo(
    () => ({
      modelRegistry,
      modelRoutes,
      costRows,
      promptRegistry,
      workflowDraft,
    }),
    [costRows, modelRegistry, modelRoutes, promptRegistry, workflowDraft]
  );

  const selectedRun = RUNS.find((run) => run.id === selectedRunId) || RUNS[0] || {
    id: "run-empty",
    title: "لا يوجد تشغيل محدد",
    workflowType: "—",
    status: "waiting_for_review",
    currentStep: "—",
    modelUsed: "—",
    source: "—",
    duration: "—",
    cost: 0,
    owner: "—",
    createdAt: "—",
    inputSummary: "—",
    outputSummary: "—",
    warnings: [],
    steps: [],
  };

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
          inputDomain: "manual",
          inputFrom: ["previous_outputs"],
          processorType: "model_call",
          processor: "ad_copy_generation",
          outputKey: `output_${Date.now()}`,
          outputType: "content_draft",
          outputFormat: "text",
          destination: "content_studio",
          visibility: "reviewer_only",
          reviewRequired: true,
          feedsNextWorkflow: false,
          nextWorkflowType: "",
          nextStepName: "",
          transitionCondition: "after_review",
          nextInputs: ["previous_outputs"],
          nextPromptName: "",
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
    const readinessByStep = workflowDraft.steps.map((step) =>
      buildStepReadiness(step, readinessContext)
    );
    const missingInputs = workflowDraft.steps.flatMap((step) =>
      step.inputFrom.length ? [] : [`${step.name}: لا يوجد Input source`]
    );

    const unsafeOutputs = workflowDraft.steps.flatMap((step) => {
      const issues = [];

      if (step.visibility === "customer_visible" && !step.reviewRequired) {
        issues.push(`${step.name}: أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.`);
      }

      if (step.feedsNextWorkflow && !step.reviewRequired) {
        issues.push(`${step.name}: يفتح مسارًا آخر دون مراجعة`);
      }

      if (step.destination === "publishing_queue" && !step.reviewRequired) {
        issues.push(`${step.name}: وجهات النشر تحتاج مراجعة قبل الاستخدام.`);
      }

      return issues;
    });

    const missingModelRoutes = workflowDraft.steps.flatMap((step) =>
      step.processorType === "model_call" && !getModelRouteSummary(step.processor)
        ? [`${step.name}: لا يوجد Model Route مطابق للمعالج ${step.processor}`]
        : []
    );

    const readinessBlockedReasons = workflowDraft.steps.flatMap((step, index) =>
      readinessByStep[index].blockedReasons.map((reason) => `${step.name}: ${reason}`)
    );

    const blockedReasons = Array.from(
      new Set([...missingInputs, ...unsafeOutputs, ...missingModelRoutes, ...readinessBlockedReasons])
    );

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
        readiness: readinessByStep[index],
        result:
          readinessByStep[index].status === "blocked" ||
          (step.visibility === "customer_visible" && !step.reviewRequired)
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
          ? `تم حظر الاختبار: ${blockedReasons.length} سبب`
          : "نجح الاختبار",
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
        "تعذر إعادة تشغيل المسار",
        "التشغيل يحتاج مراجعة بشرية أولًا قبل أي Retry.",
        "amber"
      );
      return;
    }

    addRunAction("إعادة تشغيل المسار", selectedRun.title, "green");
  };

  const cancelSelectedRun = () => {
    if (selectedRun.status === "completed") {
      addRunAction("لا يمكن إلغاء التشغيل", "التشغيل مكتمل بالفعل.", "amber");
      return;
    }

    addRunAction("إلغاء التشغيل", selectedRun.title, "red");
  };

  const sendSelectedRunToReview = () => {
    addRunAction("إرسال التشغيل للمراجعة", selectedRun.title, "amber");
  };

  const copySelectedRunId = async () => {
    try {
      await navigator.clipboard.writeText(selectedRun.title);
      addRunAction("تم نسخ اسم التشغيل", selectedRun.title, "green");
    } catch {
      addRunAction("تعذر النسخ", "المتصفح لم يسمح بالنسخ.", "amber");
    }
  };

  return (
    <main className="workflow-builder-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow"><Workflow size={15} /> تشغيل المسارات</div>
          <h1>مصمم مسارات البيانات بين الأدوات والنماذج</h1>
          <p>
            هذه الصفحة توثق شكل تشغيل المسارات المطلوب عند التنفيذ. الأزرار والحالات تمثل
            السلوك المستهدف للنظام، ولا تتصل حاليًا بمحرك تشغيل فعلي في هذا النموذج الأولي.
          </p>
        </div>

        <div className="title-actions">
          <button type="button" className="secondary-button">
            <Save size={16} />
            حفظ إعدادات المسار
          </button>
          <button type="button" className="primary-button" onClick={runLocalTest}>
            <PlayCircle size={16} />
            اختبار المسار
          </button>
        </div>
      </section>

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>متابعة مسار التشغيل ومعرفة أين توقفت العملية.</strong></div>
        <div><span>المدخلات</span><strong>Workflow، الموصلات، النماذج، المطالبات، حدود التكلفة.</strong></div>
        <div><span>المخرجات</span><strong>جاهزية التشغيل، أسباب الحظر، حزمة الأدلة، مخرجات قابلة لإعادة الاستخدام.</strong></div>
        <div><span>الإجراء التالي</span><strong>إصلاح سبب الحظر أو إرسال المخرج للمراجعة.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>لا يتم تنفيذ Backend أو إرسال بيانات فعلية للنماذج.</strong></div>
      </section>

      <section className="governance-alert">
        <ShieldCheck size={20} />
          <div>
            <strong>لا يظهر هذا للمستخدم النهائي</strong>
            <p>
            المستخدم يرى أفعالًا مثل فحص المتجر أو توليد فيديو. أما أسماء
            النماذج، المطالبات الداخلية، ومسارات البيانات فتظهر هنا كمتطلبات تشغيل عند التنفيذ.
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

      <section className="pipeline-reflection-card">
        <div className="card-header">
          <div>
            <h2>مسار معالجة البيانات</h2>
            <p>
              تشغيلات النظام هنا محاكاة واجهية. التنفيذ الحقيقي يحتاج Backend وQueue
              وموصلات مصرح بها وتخزين أسرار آمن ومراجعة بشرية.
            </p>
          </div>
          <span className="prototype-pill">تصميم واجهي</span>
        </div>

        <div className="pipeline-step-grid">
          {DATA_PROCESSING_PIPELINE.map((step, index) => (
            <div key={step.name} className="pipeline-step-card">
              <div className="pipeline-step-head">
                <span>{index + 1}</span>
                <strong>{step.name}</strong>
              </div>
              <Info label="الحالة" value={step.status} />
              <Info label="المدخل" value={step.input} />
              <Info label="المخرج" value={step.output} />
              <Info label="الطبقة المسؤولة" value={step.layer} />
              <Info label="أداة/مزود محتمل" value={step.tool} />
              <Info label="أسباب الحظر" value={step.blocked} />
              <Info label="تحذيرات" value={step.warnings} />
            </div>
          ))}
        </div>

        <div className="pipeline-support-grid">
          <div className="pipeline-support-card">
            <h3>جاهزية خط المعالجة</h3>
            <div className="readiness-check-grid">
              {PROCESSING_READINESS_CHECKS.map(([label, value]) => (
                <Info key={label} label={label} value={value} />
              ))}
            </div>
          </div>

          <div className="pipeline-support-card">
            <h3>حزمة الأدلة قبل الذكاء الاصطناعي</h3>
            <p className="pipeline-helper">
              هذه الحزمة تمثل ما سيرسل لاحقًا لمهمة ذكاء اصطناعي بعد تنفيذ Backend والموصلات.
              لا يتم إرسال بيانات فعلية من هذه الواجهة.
            </p>
            <div className="pipeline-chip-grid">
              {EVIDENCE_PACK_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="pipeline-support-card reusable-output-card">
            <h3>مخرجات قابلة لإعادة الاستخدام</h3>
            <div className="reusable-output-list">
              {REUSABLE_OUTPUTS.map(([name, reuse]) => (
                <div key={name}>
                  <strong>{name}</strong>
                  <span>{reuse}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeTab === "builder" && (
        <section className="builder-layout">
          <aside className="template-card">
          <h2>مصمم مسارات التشغيل</h2>
            <p className="section-purpose">يعرض طريقة تكوين المسار والخطوات المطلوبة لتنفيذه لاحقًا.</p>
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
              <Info label="نقطة البدء" value={workflowDraft.triggerScreen} />
              <Info label="إجراء البدء" value={workflowDraft.triggerAction} />
              <Info label="المدخلات" value={workflowDraft.inputSources.join("، ")} />
              <Info label="وجهات المخرجات" value={workflowDraft.outputsTo.join("، ")} />
            </div>

            <div className="steps-table">
              <div className="table-head">
                <span>#</span>
                <span>الخطوة</span>
                <span>المدخل</span>
                <span>نوع المعالجة</span>
                <span>المعالج</span>
                <span>المخرج</span>
                <span>الوجهة</span>
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
                  <small>{(step.inputFrom || []).map(getInputFieldLabel).join("، ") || "لا توجد حقول"}</small>
                  <span>{PROCESSOR_TYPES.find(([id]) => id === step.processorType)?.[1]}</span>
                  <span>{PROCESSORS.find(([id]) => id === step.processor)?.[1] || step.processor}</span>
                  <span>{getStepOutputName(step)}</span>
                  <span>{getOptionLabel(DESTINATION_OPTIONS, step.destination)}</span>
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
                readinessContext={readinessContext}
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
          <h2>خريطة تدفق البيانات</h2>
          <p>
            توضح انتقال البيانات من المصدر إلى المعالجة ثم المخرجات والوجهات.
            هذا مصمم تدفق واجهي فقط. لا يتم تنفيذ المسارات أو استدعاء النماذج فعليًا في هذا النموذج.
          </p>
        </div>
      </div>

      <div className="flow-lanes">
        <div className="lane-title">من أين تأتي البيانات؟</div>
        <div className="lane-title">ماذا تعالج الخطوة؟</div>
        <div className="lane-title">ماذا تنتج؟</div>
        <div className="lane-title">أين يذهب المخرج؟</div>
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
                <strong>من أين تأتي البيانات؟</strong>
                <small>{getInputSourceLabel(inferInputDomain(step))}</small>
                <div className="flow-tags">
                  {(step.inputFrom || []).map((input) => (
                    <span key={input}>{getInputFieldLabel(input)}</span>
                  ))}
                </div>
              </div>

              <div className="flow-arrow">←</div>

              <div className="flow-cell processor">
                <strong>ماذا تعالج الخطوة؟ {step.name}</strong>
                <span>{processorLabel}</span>
                <small>{PROCESSOR_TYPES.find(([id]) => id === step.processorType)?.[1]}</small>
                <ModelRoutingSummary step={step} readinessContext={readinessContext} compact />
              </div>

              <div className="flow-arrow">←</div>

              <div className={`flow-cell output ${step.visibility}`}>
                <strong>ماذا تنتج؟ {getStepOutputName(step)}</strong>
                <span>{getOptionLabel(OUTPUT_TYPE_OPTIONS, step.outputType)}</span>
                <small>صيغة المخرج: {getOptionLabel(OUTPUT_FORMATS, step.outputFormat || "text")}</small>
                <small>مستوى الظهور: {visibilityLabel}</small>
              </div>

              <div className="flow-arrow">←</div>

              <div className="flow-cell destination">
                <strong>أين يذهب المخرج؟ {getOptionLabel(DESTINATION_OPTIONS, step.destination)}</strong>
                <span>
                  {step.feedsNextWorkflow
                    ? `هل يفتح مسارًا تاليًا؟ نعم · ${getWorkflowLabel(step.nextWorkflowType)}`
                    : "هل يفتح مسارًا تاليًا؟ لا"}
                </span>
                <small>هل يحتاج المخرج مراجعة؟ {step.reviewRequired ? "نعم" : "لا"}</small>
                {step.feedsNextWorkflow ? (
                  <small>شرط الانتقال: {getOptionLabel(TRANSITION_CONDITIONS, step.transitionCondition || "after_review")}</small>
                ) : null}
              </div>

              {hasGovernanceWarning ? (
                <div className="flow-warning">
                  <CircleAlert size={16} />
                  <span>
                    تحذير: هذا التدفق يحتاج مراجعة قبل السماح بالمخرجات أو فتح مسار لاحق.
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>

    <aside className="map-side-card">
      <h3>دليل قواعد الظهور</h3>

      <div className="legend-list">
        <div>
          <span className="dot customer" />
          <strong>ظاهر للعميل</strong>
          <small>أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.</small>
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
         أي مخرج ظاهر للعميل أو أي تدفق يفتح مسارًا آخر يجب أن يمر عبر
          مراجعة قبل استخدامه في النشر أو التوليد التالي.
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
                <h2>ضوابط المخرجات</h2>
                <p>تحدد قواعد الظهور والمراجعة قبل استخدام المخرجات أو نشرها.</p>
              </div>
              <span className="contracts-count">{workflowDraft.steps.length} عقود</span>
            </div>

            <div className="contracts-kpi-grid">
              <ContractKpi title="ظاهر للعميل" value={workflowDraft.steps.filter((step) => step.visibility === "customer_visible").length} />
              <ContractKpi title="يحتاج مراجعة" value={workflowDraft.steps.filter((step) => step.reviewRequired).length} />
              <ContractKpi title="يفتح مسارًا آخر" value={workflowDraft.steps.filter((step) => step.feedsNextWorkflow).length} />
              <ContractKpi title="داخلي فقط أو حساس" value={workflowDraft.steps.filter((step) => isSensitiveOutput(step)).length} />
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
                    <Info label="نوع المخرج" value={getOptionLabel(OUTPUT_TYPE_OPTIONS, step.outputType)} />
                    <Info label="صيغة المخرج" value={getOptionLabel(OUTPUT_FORMATS, step.outputFormat || "text")} />
                    <Info label="وجهة المخرج" value={getOptionLabel(DESTINATION_OPTIONS, step.destination)} />
                    <Info label="مراجعة قبل النشر" value={step.reviewRequired ? "نعم" : "لا"} />
                    <Info label="يفتح مسارًا آخر" value={step.feedsNextWorkflow ? getWorkflowLabel(step.nextWorkflowType) : "لا"} />
                    <Info label="داخلي فقط" value={sensitive ? "نعم" : "لا"} />
                    <Info label="مدة الاحتفاظ" value={getRetentionPolicy(step)} />
                  </div>

                  <div className="schema-preview">
                    <strong>قواعد الظهور</strong>
                    <div className="schema-fields">
                      {schema.required.map((field) => (
                        <span key={field}>{field}</span>
                      ))}
                    </div>
                  </div>

                  <div className="allowed-consumers">
                    <strong>وجهة المخرج</strong>
                    <div>
                      {allowedConsumers.map((consumer) => (
                        <span key={consumer}>{getConsumerLabel(consumer)}</span>
                      ))}
                    </div>
                  </div>

                  {riskFlags.length ? (
                    <div className="contract-risk-box">
                      <strong>ضوابط مطلوبة</strong>
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
                <h2>مراقبة التشغيلات</h2>
                <p>تعرض حالات التشغيل والأخطاء والمراجعات المطلوبة كما يجب أن تظهر عند التنفيذ.</p>
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
                    <small>{run.modelUsed}</small>
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
                <p>حالة التشغيل: {STATUS_META[selectedRun.status]?.[0] || selectedRun.status}</p>
              </div>
              <Status value={selectedRun.status} />
            </div>

            <div className="run-info-grid">
              <Info label="نوع المسار" value={selectedRun.workflowType} />
              <Info label="الخطوة الحالية" value={selectedRun.currentStep} />
              <Info label="المعالج المستخدم" value={selectedRun.modelUsed} />
              <Info label="مصدر الطلب" value={selectedRun.source} />
              <Info label="مدة التشغيل" value={selectedRun.duration} />
              <Info label="تقدير التكلفة" value={`$${selectedRun.cost}`} />
              <Info label="المسؤول" value={selectedRun.owner} />
              <Info label="آخر تشغيل" value={selectedRun.createdAt} />
              <Info label="سبب التعطل" value={selectedRun.error || (selectedRun.status === "waiting_for_review" ? "يحتاج مراجعة" : "—")} />
              <Info label="جاهز للاستكمال" value={selectedRun.status === "waiting_for_review" ? "بعد المراجعة" : "حسب الحالة"} />
            </div>

            <div className="run-actions">
              <button type="button" onClick={retrySelectedRun}>
                <RefreshCw size={15} />
                إعادة تشغيل المسار
              </button>
              <button type="button" onClick={cancelSelectedRun}>
                <XCircle size={15} />
                إلغاء التشغيل
              </button>
              <button type="button" onClick={sendSelectedRunToReview}>
                <ShieldCheck size={15} />
                إرسال التشغيل للمراجعة
              </button>
              <button type="button" onClick={copySelectedRunId}>
                <FileSearch size={15} />
                نسخ اسم التشغيل
              </button>
            </div>

            <div className="safe-preview-grid">
              <div className="safe-preview">
                <strong>ملخص المدخل</strong>
                <p>{selectedRun.inputSummary}</p>
              </div>
              <div className="safe-preview">
                <strong>ملخص المخرج</strong>
                <p>{selectedRun.outputSummary}</p>
              </div>
            </div>

            {selectedRun.error ? (
              <div className="run-error">
                <strong>سبب التعطل</strong>
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
                    <span>{duration}</span>
                  </div>
                  <Status value={status} />
                </div>
              ))}
            </div>
          </article>

          <article className="run-warnings-card">
            <h2>التحذيرات والإجراءات</h2>

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
                <h2>اختبار المسار</h2>
                <p>
                  يوضح كيف سيتم فحص المسار قبل التشغيل الفعلي.
                </p>
              </div>
            </div>

            <label className="field">
              <span>مصدر الاختبار</span>
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
              <span>عينة المدخلات</span>
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
              <strong>المتطلبات قبل التشغيل</strong>
              <span>يجب التحقق من المدخلات، ضوابط المخرجات، والتكلفة قبل الانتقال للتنفيذ.</span>
            </div>

            <button type="button" className="primary-button" onClick={runLocalTest}>
              <PlayCircle size={16} />
              اختبار المسار
            </button>
          </article>

          <article className="test-card">
            <div className="card-header">
              <div>
                <h2>نتيجة الاختبار</h2>
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
                    ? "نجح الاختبار"
                    : "تم حظر الاختبار"}
                </strong>

                <span>
                  التكلفة التقديرية: ${dryRunResult.estimatedCost} · الزمن التقديري:{" "}
                  {dryRunResult.estimatedDuration}s
                </span>

                {dryRunResult.blockedReasons.length ? (
                  <div className="blocked-list">
                    <strong>أسباب الحظر</strong>
                    {dryRunResult.blockedReasons.map((reason) => (
                      <div key={reason}>
                        <CircleAlert size={16} />
                        {reason}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>لا توجد أسباب حظر. يمكن الانتقال للتشغيل لاحقًا بعد توفر الصلاحيات المطلوبة.</p>
                )}
              </div>
            ) : (
              <p className="empty">لم يتم تنفيذ أي اختبار بعد.</p>
            )}
          </article>

          <article className="test-card wide-test-card">
            <h2>تسلسل فحص الخطوات</h2>

            {dryRunResult ? (
              <div className="simulation-table">
                <div className="simulation-head">
                  <span>#</span>
                  <span>الخطوة</span>
                  <span>المعالج</span>
                  <span>مسار النموذج</span>
                  <span>المدخل</span>
                  <span>المخرج</span>
                  <span>الوجهة</span>
                  <span>الحالة</span>
                </div>

                {dryRunResult.simulatedSteps.map((step) => (
                  <div key={step.index} className="simulation-row">
                    <span>{step.index}</span>
                    <strong>{step.name}</strong>
                    <span>{step.processor}</span>
                    <span>{step.modelRoute ? step.modelRoute.primaryModel : "—"}</span>
                    <span>{(step.inputFrom || []).map(getInputFieldLabel).join(" + ")}</span>
                    <span>{getStepOutputName(step)}</span>
                    <span>{getOptionLabel(DESTINATION_OPTIONS, step.destination)}</span>
                    <span className={step.result === "passed" ? "sim-ok" : "sim-blocked"}>
                      {step.result}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">شغّل اختبار المسار لرؤية فحص الخطوات.</p>
            )}
          </article>

          <article className="test-card wide-test-card">
            <h2>المخرجات المتوقعة</h2>

            {dryRunResult ? (
              <div className="expected-grid">
                {dryRunResult.expectedOutputs.map((output) => (
                  <div key={output.outputKey} className={`expected-card ${output.visibility}`}>
                    <strong>{output.outputKey}</strong>
                    <span>{getOptionLabel(OUTPUT_TYPE_OPTIONS, output.outputType)}</span>
                    <small>{getOptionLabel(DESTINATION_OPTIONS, output.destination)}</small>
                    <em>{VISIBILITY.find(([id]) => id === output.visibility)?.[1] || output.visibility}</em>
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


function ModelRoutingSummary({ step, readinessContext = {}, compact = false }) {
  if (step.processorType !== "model_call") return null;

  const readiness = buildStepReadiness(step, readinessContext);
  const route = getModelRouteSummary(step.processor);
  const warnings = [
    ...getModelRouteWarnings(step, route),
    ...readiness.warnings,
    ...readiness.blockedReasons,
  ];

  if (!route) {
    return (
      <div className={`model-route-summary missing ${compact ? "compact" : ""}`}>
        <div className="model-route-title">
          <CircleAlert size={15} />
          <strong>مسار النموذج</strong>
        </div>
        <p>لا يوجد مسار نموذج مطابق لهذه الخطوة. يجب ربطها قبل التشغيل عند التنفيذ.</p>
      </div>
    );
  }

  return (
    <div className={`model-route-summary ${warnings.length ? "has-warning" : "safe"} ${compact ? "compact" : ""}`}>
      <div className="model-route-title">
        <GitBranch size={15} />
        <strong>مسار النموذج</strong>
      </div>

      <div className="model-route-lines">
        <span>المسار الأساسي: <b>{route.primaryModel}</b></span>
        <span>المسار البديل: <b>{route.fallback.length ? route.fallback.join(" → ") : "لا يوجد"}</b></span>
        <span>حد التكلفة: <b>{getCostLimitLabel(readiness.route, readiness.costRow) || `$${route.maxCostPerRun}`}</b></span>
        <span>المراجعة: <b>{route.humanReviewRequired ? "مطلوبة" : "غير مطلوبة"}</b></span>
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

function StepReadinessPanel({ step, readinessContext = {}, compact = false }) {
  const readiness = buildStepReadiness(step, readinessContext);
  const selectedInputs = Array.isArray(step.inputFrom) ? step.inputFrom : [];
  const selectedOutputs = [
    getStepOutputName(step),
    getOptionLabel(OUTPUT_TYPE_OPTIONS, step.outputType),
    getOptionLabel(OUTPUT_FORMATS, step.outputFormat || "text"),
  ].filter(Boolean);
  const promptForNext = step.nextPromptName
    ? (readinessContext.promptRegistry || []).find((prompt) => prompt.name === step.nextPromptName)
    : null;
  const statusLabel = {
    ready: "جاهز",
    warning: "يحتاج ضبط",
    blocked: "محظور",
  }[readiness.status];
  const routeLabel =
    readiness.primaryModel?.displayName ||
    readiness.staticRoute?.primaryModel ||
    (step.processorType === "model_call" ? "غير مرتبط" : "لا يحتاج مسار نموذج");
  const promptLabel = readiness.prompt
    ? `${readiness.prompt.name} · ${readiness.prompt.version}`
    : step.processorType === "model_call"
      ? "لا يوجد ربط مطالبة معتمد"
      : "لا يحتاج مطالبة";
  const reviewLabel = step.reviewRequired ? "مطلوبة" : "غير مطلوبة";

  return (
    <section className={`step-readiness-panel ${readiness.status} ${compact ? "compact" : ""}`}>
      <div className="step-readiness-head">
        <div>
          <strong>جاهزية الخطوة</strong>
          <span>جاهزية الخطوة تجمع المسار والمطالبة والتكلفة والمراجعة. · {readiness.score}%</span>
        </div>
        <Status value={readiness.status} />
      </div>

      <div className="step-readiness-grid">
        <Info label="المدخلات المحددة" value={`${selectedInputs.length} · ${selectedInputs.map(getInputFieldLabel).join("، ") || "لا توجد حقول مختارة"}`} />
        <Info label="المخرجات المحددة" value={selectedOutputs.join(" · ")} />
        <Info label="المسار التالي إن وجد" value={step.feedsNextWorkflow ? getWorkflowLabel(step.nextWorkflowType) : "لا يوجد"} />
        <Info label="المطالبة المرتبطة إن وجدت" value={step.nextPromptName ? `${step.nextPromptName} · ${getPromptStatusLabel(promptForNext)}` : "لا توجد مطالبة مرتبطة"} />
        <Info label="مسار النموذج" value={routeLabel} />
        <Info label="المطالبة المرتبطة" value={promptLabel} />
        <Info label="حد التكلفة" value={getCostLimitLabel(readiness.route, readiness.costRow)} />
        <Info label="المراجعة" value={reviewLabel} />
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

      {readiness.checks.length ? (
        <div className="readiness-notes safe-notes">
          <strong>الفحوصات الناجحة</strong>
          {readiness.checks.slice(0, 3).map((check) => (
            <span key={check}>{check}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StepEditor({ step, index, onChange, onDelete, readinessContext }) {
  const promptRegistry = readinessContext.promptRegistry || [];
  const inputDomain = inferInputDomain(step);
  const selectedFields = Array.isArray(step.inputFrom) ? step.inputFrom : [];
  const availableFields = Array.from(new Set([...getFieldsForSource(inputDomain), ...selectedFields]));
  const nextInputs = Array.isArray(step.nextInputs) ? step.nextInputs : selectedFields;
  const selectedPrompt = step.nextPromptName
    ? promptRegistry.find((prompt) => prompt.name === step.nextPromptName)
    : null;

  const setInputDomain = (value) => {
    const fields = getFieldsForSource(value);
    onChange(index, "inputDomain", value);
    onChange(index, "inputFrom", selectedFields.filter((field) => fields.includes(field)));
  };

  const toggleInputField = (field) => {
    const nextFields = selectedFields.includes(field)
      ? selectedFields.filter((item) => item !== field)
      : [...selectedFields, field];
    onChange(index, "inputFrom", nextFields);
  };

  const addRequiredField = (field) => {
    if (!field || selectedFields.includes(field)) return;
    onChange(index, "inputFrom", [...selectedFields, field]);
  };

  const toggleNextInput = (field) => {
    const safeNextInputs = nextInputs.includes(field)
      ? nextInputs.filter((item) => item !== field)
      : [...nextInputs, field];
    onChange(index, "nextInputs", safeNextInputs);
  };

  return (
    <div className="step-editor">
      <label className="field">
        <span>اسم الخطوة</span>
        <input value={step.name} onChange={(e) => onChange(index, "name", e.target.value)} />
      </label>

      <section className="io-designer-card">
        <div className="io-designer-head">
          <strong>مصدر الإدخال</strong>
          <span>اختيار متعدد للحقول</span>
        </div>

        <SelectField
          label="الصفحة أو المجال"
          value={inputDomain}
          options={STRUCTURED_INPUT_SOURCES.map((source) => [source.value, source.label])}
          onChange={setInputDomain}
        />

        <SelectField
          label="الحقل المطلوب"
          value=""
          options={[["", "اختر حقلًا لإضافته"], ...availableFields.map((field) => [field, getInputFieldLabel(field)])]}
          onChange={addRequiredField}
        />

        <div className="input-source-box structured-inputs">
          <strong>الحقول المختارة · {selectedFields.length}</strong>
          <div>
            {availableFields.map((field) => (
              <button
                key={field}
                type="button"
                className={selectedFields.includes(field) ? "selected" : ""}
                onClick={() => toggleInputField(field)}
              >
                {getInputFieldLabel(field)}
              </button>
            ))}
          </div>
          {!selectedFields.length ? (
            <p className="inline-warning">تحذير: لا توجد حقول إدخال مختارة لهذه الخطوة.</p>
          ) : null}
        </div>
      </section>

      <SelectField
        label="نوع المعالجة"
        value={step.processorType}
        options={PROCESSOR_TYPES}
        onChange={(value) => onChange(index, "processorType", value)}
      />

      <SelectField
        label="المعالج / مسار النموذج"
        value={step.processor}
        options={PROCESSORS}
        onChange={(value) => onChange(index, "processor", value)}
      />

      <StepReadinessPanel step={step} readinessContext={readinessContext} />

      <ModelRoutingSummary step={step} readinessContext={readinessContext} />

      <section className="io-designer-card output-designer">
        <div className="io-designer-head">
          <strong>مراجعة المخرج</strong>
          <span>لا يتم تنفيذ أي مسار من هذه الإعدادات.</span>
        </div>

        <label className="field">
          <span>اسم المخرج</span>
          <input value={step.outputKey} onChange={(e) => onChange(index, "outputKey", e.target.value)} />
        </label>

        <SelectField
          label="نوع المخرج"
          value={step.outputType}
          options={OUTPUT_TYPE_OPTIONS}
          onChange={(value) => onChange(index, "outputType", value)}
        />

        <SelectField
          label="صيغة المخرج"
          value={step.outputFormat || "text"}
          options={OUTPUT_FORMATS}
          onChange={(value) => onChange(index, "outputFormat", value)}
        />

        <SelectField
          label="وجهة المخرج"
          value={step.destination}
          options={DESTINATION_OPTIONS}
          onChange={(value) => onChange(index, "destination", value)}
        />
      </section>

      <SelectField
        label="مستوى الظهور"
        value={step.visibility}
        options={VISIBILITY}
        onChange={(value) => onChange(index, "visibility", value)}
      />

      <Toggle
        label="يحتاج مراجعة"
        checked={step.reviewRequired}
        onChange={(value) => onChange(index, "reviewRequired", value)}
      />

      <Toggle
        label="يصلح كمدخل لخطوة لاحقة؟"
        checked={step.feedsNextWorkflow}
        onChange={(value) => onChange(index, "feedsNextWorkflow", value)}
      />

      {step.feedsNextWorkflow ? (
        <section className="io-designer-card chaining-card">
          <div className="io-designer-head">
            <strong>يفتح مسارًا تاليًا</strong>
            <span>ترسل مع المخرج إلى المسار التالي</span>
          </div>

          <SelectField
            label="المسار التالي"
            value={step.nextWorkflowType}
            options={NEXT_WORKFLOWS}
            onChange={(value) => onChange(index, "nextWorkflowType", value)}
          />

          <label className="field">
            <span>الخطوة التالية</span>
            <input
              value={step.nextStepName || ""}
              onChange={(e) => onChange(index, "nextStepName", e.target.value)}
              placeholder="مثال: مراجعة المحتوى"
            />
          </label>

          <SelectField
            label="شرط الانتقال"
            value={step.transitionCondition || "after_review"}
            options={TRANSITION_CONDITIONS}
            onChange={(value) => onChange(index, "transitionCondition", value)}
          />

          <div className="input-source-box structured-inputs">
            <strong>المدخلات المرسلة للمسار التالي</strong>
            <div>
              {selectedFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  className={nextInputs.includes(field) ? "selected" : ""}
                  onClick={() => toggleNextInput(field)}
                >
                  {getInputFieldLabel(field)}
                </button>
              ))}
              <button
                type="button"
                className={nextInputs.includes(step.outputKey) ? "selected" : ""}
                onClick={() => toggleNextInput(step.outputKey)}
              >
                {getStepOutputName(step)}
              </button>
            </div>
          </div>

          <SelectField
            label="المطالبة المرسلة مع المخرج"
            value={step.nextPromptName || ""}
            options={[
              ["", "لا توجد مطالبة مرتبطة"],
              ...promptRegistry.map((prompt) => [prompt.name, `${prompt.name} · ${getPromptStatusLabel(prompt)}`]),
            ]}
            onChange={(value) => onChange(index, "nextPromptName", value)}
          />

          {!promptRegistry.length ? (
            <p className="inline-warning">لا توجد مطالبات متاحة. أضف المطالبات من حوكمة المطالبات.</p>
          ) : selectedPrompt ? (
            <p className="inline-note">{getPromptStatusLabel(selectedPrompt)}</p>
          ) : null}
        </section>
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
    required: ["مفتاح المخرج", "نوع المخرج", "الوجهة", "مستوى الظهور", "حالة المراجعة"],
  };

  const map = {
    raw_store_snapshot: ["مرجع الفحص", "رابط المصدر", "ملخص الالتقاط", "وقت الالتقاط", "درجة الثقة"],
    product_candidates: ["مرجع المنتج", "الاسم", "السعر", "الرابط", "المصدر", "درجة الثقة"],
    asset_candidates: ["مرجع الأصل", "النوع", "رابط المصدر", "حقوق الاستخدام", "حالة المراجعة"],
    brand_insights: ["النبرة", "الكلمات المفتاحية", "تقدير الجمهور", "درجة الثقة", "المصادر"],
    audience_insights: ["الشرائح", "الدوافع", "الملاحظات", "درجة الثقة"],
    campaign_strategy: ["الهدف", "زاوية الرسالة", "القنوات", "العرض", "ملاحظات المخاطر"],
    customer_visible_brief: ["العنوان", "الوصف", "دعوة الإجراء", "القيود", "حالة المراجعة"],
    internal_prompt: ["مرجع المطالبة", "وصف محجوب", "مسار النموذج", "مستوى الظهور"],
    content_draft: ["مرجع المحتوى", "القناة", "النص", "الحالة", "حالة المراجعة"],
    risk_report: ["مستوى المخاطر", "الادعاءات المطلوبة", "العبارات المحظورة", "التوصية"],
    generated_asset: ["مرجع الأصل", "نوع الأصل", "الرابط", "حقوق الاستخدام", "حالة المراجعة"],
    analytics_recommendation: ["مصدر القياس", "التوصيات", "درجة الثقة", "التسميات المقدرة"],
    publishing_item: ["مرجع المحتوى", "القناة", "وقت الجدولة", "حالة الاعتماد", "وضع النشر"],
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
    risks.push("أي مخرج ظاهر للعميل يجب أن يمر بالمراجعة.");
  }

  if (step.feedsNextWorkflow && !step.reviewRequired) {
    risks.push("المخرج يفتح مسارًا آخر دون مراجعة.");
  }

  if (step.outputType === "generated_asset" && step.destination !== "asset_library") {
    risks.push("الأصول المولدة يجب أن تمر عبر Asset Library قبل الاستخدام.");
  }

  if (step.outputType === "internal_prompt" && step.visibility === "customer_visible") {
    risks.push("المطالبات الداخلية لا يجب أن تكون ظاهرة للعميل.");
  }

  if (step.destination === "publishing_queue" && !step.reviewRequired) {
    risks.push("يجب منع النشر التلقائي دون مراجعة.");
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
    ready: ["جاهز", "green"],
    warning: ["يحتاج ضبط", "amber"],
    blocked: ["محظور", "red"],
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

.step-readiness-panel {
  border: 1px solid #d9ead7;
  background: #fbfdf9;
  border-radius: 18px;
  padding: 12px;
}

.step-readiness-panel.warning {
  border-color: #fde68a;
  background: #fffaf0;
}

.step-readiness-panel.blocked {
  border-color: #fecaca;
  background: #fff5f5;
}

.step-readiness-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.step-readiness-head strong,
.readiness-notes strong {
  display: block;
  color: #1f241d;
  font-size: 13px;
}

.step-readiness-head span {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.step-readiness-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.readiness-notes {
  display: grid;
  gap: 6px;
  margin-top: 10px;
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

.safe-notes span {
  color: #166534;
  background: #ecfdf5;
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

.io-designer-card {
  border: 1px solid #e4e7df;
  background: #fbfdf9;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.output-designer {
  background: #fff;
}

.chaining-card {
  background: #f8fbff;
  border-color: #dbeafe;
}

.io-designer-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.io-designer-head strong {
  color: #1f241d;
  font-size: 13px;
}

.io-designer-head span,
.inline-note,
.inline-warning {
  color: #6b7280;
  font-size: 11px;
  line-height: 1.6;
  font-weight: 800;
}

.structured-inputs {
  background: white;
}

.inline-warning {
  margin: 10px 0 0;
  color: #9a3412;
  background: #fff7ed;
  border-radius: 12px;
  padding: 8px 10px;
}

.inline-note {
  margin: 0;
  color: #176b2c;
  background: #eef7e9;
  border-radius: 12px;
  padding: 8px 10px;
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


/* إضافات مراقبة التشغيلات */
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

/* تعزيز ضوابط المخرجات */

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

/* تعزيز اختبار المسار */

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

.pipeline-reflection-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
  margin-bottom: 16px;
}

.prototype-pill {
  background: #eef7e9;
  color: #176b2c;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.pipeline-step-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.pipeline-step-card,
.pipeline-support-card {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 13px;
}

.pipeline-step-head {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 8px;
}

.pipeline-step-head span {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #176b2c;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 950;
  flex: 0 0 auto;
}

.pipeline-step-head strong,
.pipeline-support-card h3 {
  font-size: 14px;
  font-weight: 950;
}

.pipeline-support-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr;
  gap: 12px;
  margin-top: 12px;
}

.readiness-check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.pipeline-helper {
  color: #52604c;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
  margin: 8px 0 0;
}

.pipeline-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pipeline-chip-grid span {
  border: 1px solid #d9ead7;
  background: #fff;
  color: #176b2c;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 900;
}

.reusable-output-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.reusable-output-list div {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
}

.reusable-output-list strong,
.reusable-output-list span {
  display: block;
}

.reusable-output-list span {
  margin-top: 4px;
  color: #52604c;
  line-height: 1.6;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .pipeline-step-grid,
  .pipeline-support-grid,
  .readiness-check-grid {
    grid-template-columns: 1fr;
  }
}

.screen-guidance-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.screen-guidance-card div {
  border: 1px solid #edf0e8;
  background: #f8faf5;
  border-radius: 16px;
  padding: 10px;
}

.screen-guidance-card strong,
.screen-guidance-card span {
  display: block;
}

.screen-guidance-card strong {
  color: #176b2c;
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 6px;
}

.screen-guidance-card span {
  color: #384333;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .screen-guidance-card {
    grid-template-columns: 1fr;
  }
}

`;
