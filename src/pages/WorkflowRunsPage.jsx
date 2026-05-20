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

const RUNS = [
  {
    id: "wf-001",
    workflowType: "store_intelligence",
    title: "فحص متجر النمو",
    status: "completed",
    currentStep: "user_review",
    modelUsed: "Gemini Store Reader",
    cost: 0.18,
    createdAt: "منذ 12 دقيقة",
  },
  {
    id: "wf-002",
    workflowType: "campaign_generation",
    title: "توليد حملة عطر X",
    status: "running",
    currentStep: "content_plan",
    modelUsed: "GPT Campaign Writer",
    cost: 0.32,
    createdAt: "منذ 6 دقائق",
  },
  {
    id: "wf-003",
    workflowType: "video_generation",
    title: "فيديو Reel قصير",
    status: "waiting_for_review",
    currentStep: "risk_review",
    modelUsed: "Runway Video",
    cost: 3.7,
    createdAt: "منذ 22 دقيقة",
  },
];

const STATUS_META = {
  running: ["قيد التشغيل", "blue"],
  waiting_for_review: ["بانتظار مراجعة", "amber"],
  completed: ["مكتمل", "green"],
  failed: ["فشل", "red"],
  cancelled: ["ملغي", "slate"],
};

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
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

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
    setTestLog((prev) => [
      {
        id: Date.now(),
        workflow: workflowDraft.name,
        status: "success",
        message: `تمت محاكاة ${workflowDraft.steps.length} خطوات. المخرجات ستذهب إلى: ${workflowDraft.outputsTo.join("، ")}`,
        time: "الآن",
      },
      ...prev,
    ]);
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
        <section className="map-card">
          <h2>Data Flow Map</h2>
          <div className="flow-map">
            {workflowDraft.steps.map((step, index) => (
              <div key={`${step.id}-map`} className="flow-node">
                <div className="node-index">{index + 1}</div>
                <strong>{step.name}</strong>
                <span>Input: {step.inputFrom.join(" + ")}</span>
                <b>{PROCESSORS.find(([id]) => id === step.processor)?.[1] || step.processor}</b>
                <span>Output: {step.outputKey}</span>
                <em>→ {step.destination}</em>
                {step.feedsNextWorkflow ? (
                  <p>يفتح Workflow آخر: {step.nextWorkflowType}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "contracts" && (
        <section className="contracts-grid">
          {workflowDraft.steps.map((step) => (
            <article key={`${step.id}-contract`} className="contract-card">
              <h3>{step.name}</h3>
              <Info label="Output Key" value={step.outputKey} />
              <Info label="Output Type" value={step.outputType} />
              <Info label="Destination" value={step.destination} />
              <Info label="Visibility" value={VISIBILITY.find(([id]) => id === step.visibility)?.[1]} />
              <Info label="Review Required" value={step.reviewRequired ? "نعم" : "لا"} />
              <Info label="Feeds Next Workflow" value={step.feedsNextWorkflow ? step.nextWorkflowType : "لا"} />
            </article>
          ))}
        </section>
      )}

      {activeTab === "runs" && (
        <section className="runs-layout">
          <article className="runs-card">
            <h2>تشغيلات فعلية / تجريبية</h2>
            <div className="runs-list">
              {RUNS.map((run) => (
                <button key={run.id} type="button" className="run-row">
                  <div>
                    <strong>{run.title}</strong>
                    <span>{run.workflowType} · {run.createdAt}</span>
                  </div>
                  <Status value={run.status} />
                </button>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "test" && (
        <section className="test-layout">
          <article className="test-card">
            <h2>اختبار محلي للمسار</h2>
            <p>
              الاختبار يحاكي انتقال البيانات بين الخطوات والوجهات بدون استدعاء
              نماذج أو أدوات.
            </p>
            <button type="button" className="primary-button" onClick={runLocalTest}>
              <PlayCircle size={16} />
              تشغيل الاختبار
            </button>
          </article>

          <article className="test-card">
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
    failed: ["فشل", "red"],
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
`;
