import React, { useMemo, useState } from "react";
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
  Trash2,
  Wand2,
} from "lucide-react";

const DEFAULT_CHANNELS = [
  {
    id: "instagram",
    name: "Instagram",
    description: "تجهيز المحتوى للمنشورات والقصص والإعلانات.",
    icon: Globe2,
    enabled: true,
    connected: false,
    handle: "",
    mode: "manual",
    owner: "Marketing",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "مخرجات فيديو قصيرة وسكربتات Reels/TikTok.",
    icon: PlayCircle,
    enabled: true,
    connected: false,
    handle: "",
    mode: "manual",
    owner: "Content",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "رسائل قصيرة وأفكار إعلانية مناسبة للسناب.",
    icon: Sparkles,
    enabled: false,
    connected: false,
    handle: "",
    mode: "planned",
    owner: "Marketing",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "رسائل مباشرة للعملاء أو حملات إعادة التنشيط.",
    icon: MessageCircle,
    enabled: true,
    connected: false,
    handle: "",
    mode: "manual",
    owner: "Sales",
  },
  {
    id: "email",
    name: "Email",
    description: "حملات بريدية وعناوين ورسائل تسويقية.",
    icon: Mail,
    enabled: true,
    connected: false,
    handle: "",
    mode: "manual",
    owner: "CRM",
  },
];

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

const channelModes = ["manual", "planned", "connected_mock"];

const channelModeLabels = {
  manual: "إدخال يدوي",
  planned: "مؤجل",
  connected_mock: "ربط تجريبي",
};

const TABS = [
  ["overview", "نظرة عامة"],
  ["workspace", "مساحة العمل"],
  ["channels", "القنوات"],
  ["ai", "الذكاء الاصطناعي والتكلفة"],
  ["governance", "الحوكمة"],
  ["outputs", "المخرجات"],
  ["audit", "سجل الإعدادات"],
];

const iconMap = {
  Instagram: Globe2,
  TikTok: PlayCircle,
  Snapchat: Sparkles,
  WhatsApp: MessageCircle,
  Email: Mail,
};

function getChannelIcon(name) {
  return iconMap[name] || Globe2;
}

function buildWarnings({ channels, aiSettings, governance, outputSettings, workspace }) {
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

  channels
    .filter((channel) => channel.enabled && !channel.handle.trim())
    .forEach((channel) => {
      warnings.push({
        id: `missing_handle_${channel.id}`,
        tone: "amber",
        title: `قناة ${channel.name} مفعلة بلا حساب`,
        message: "هذا مقبول في البروتوتايب، لكنه يجب أن يصبح رابطًا أو معرفًا واضحًا لاحقًا.",
      });
    });

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
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
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

  const warnings = useMemo(
    () => buildWarnings({ channels, aiSettings, governance, outputSettings, workspace }),
    [channels, aiSettings, governance, outputSettings, workspace]
  );

  const governanceScore = useMemo(() => calculateScore(warnings), [warnings]);

  const enabledChannelsCount = useMemo(
    () => channels.filter((channel) => channel.enabled).length,
    [channels]
  );

  const connectedMockCount = useMemo(
    () => channels.filter((channel) => channel.connected || channel.mode === "connected_mock").length,
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

  const updateChannel = (id, key, value) => {
    setChannels((prev) =>
      prev.map((channel) => {
        if (channel.id !== id) return channel;
        return { ...channel, [key]: value };
      })
    );
    recordChange(`تعديل قناة ${id}: ${key}`);
  };

  const addChannel = () => {
    const newId = `custom_${Date.now()}`;
    setChannels((prev) => [
      ...prev,
      {
        id: newId,
        name: "قناة جديدة",
        description: "قناة مخصصة داخل البروتوتايب.",
        icon: Globe2,
        enabled: false,
        connected: false,
        handle: "",
        mode: "planned",
        owner: "Marketing",
        custom: true,
      },
    ]);
    setActiveTab("channels");
    recordChange("إضافة قناة مخصصة", "warning");
  };

  const deleteChannel = (id) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
    recordChange(`حذف قناة محلية: ${id}`, "warning");
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
    setChannels(DEFAULT_CHANNELS);
    setWorkspace(DEFAULT_WORKSPACE);
    setAiSettings(DEFAULT_AI_SETTINGS);
    setGovernance(DEFAULT_GOVERNANCE);
    setOutputSettings(DEFAULT_OUTPUT_SETTINGS);
    setSaved(false);
    setDirty(false);
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        event: "إعادة الإعدادات إلى القيم الافتراضية",
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
            التكلفة، وسياسات المراجعة. كل شيء هنا محلي وتجريبي، ولا يوجد حفظ في
            Backend أو ربط فعلي بمزود خارجي.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={saveLocalSettings}>
              <Save size={17} />
              حفظ محلي
            </button>

            <button type="button" className="secondary-button" onClick={addChannel}>
              <Globe2 size={17} />
              إضافة قناة
            </button>

            <button type="button" className="secondary-button" onClick={resetSettings}>
              <RefreshCw size={17} />
              إعادة الضبط
            </button>
          </div>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              لا تضع مفاتيح API حقيقية هنا. أي تخزين للأسرار لاحقًا يجب أن يتم
              في Backend آمن مع تشفير وصلاحيات وسجل تدقيق.
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
                <Metric title="ربط تجريبي" value={connectedMockCount} note="لا يوجد ربط فعلي" />
                <Metric title="مزود النصوص" value={aiSettings.textProvider} note="اختيار توجيهي فقط" />
                <Metric title="حالة التغييرات" value={dirty ? "غير محفوظة" : "محفوظة"} note="داخل الواجهة فقط" />
              </section>

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
              title="القنوات والربط"
              description="تفعيل القنوات هنا لا يعني وجود تكامل فعلي. الربط الحقيقي مؤجل."
              action={
                <button type="button" className="secondary-button compact" onClick={addChannel}>
                  إضافة قناة
                </button>
              }
            >
              <div className="channels-grid">
                {channels.map((channel) => {
                  const Icon = getChannelIcon(channel.name);

                  return (
                    <div key={channel.id} className="channel-card">
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
                          onChange={(value) => updateChannel(channel.id, "enabled", value)}
                        />
                      </div>

                      <div className="channel-fields">
                        <Field
                          label="اسم القناة"
                          value={channel.name}
                          onChange={(value) => updateChannel(channel.id, "name", value)}
                        />

                        <SelectField
                          label="طريقة الربط"
                          value={channel.mode}
                          options={channelModes}
                          optionLabels={channelModeLabels}
                          onChange={(value) => {
                            updateChannel(channel.id, "mode", value);
                            updateChannel(channel.id, "connected", value === "connected_mock");
                          }}
                        />

                        <Field
                          label="الحساب أو الرابط"
                          value={channel.handle}
                          placeholder="رابط أو معرف الحساب"
                          onChange={(value) => updateChannel(channel.id, "handle", value)}
                        />

                        <Field
                          label="المالك التشغيلي"
                          value={channel.owner}
                          onChange={(value) => updateChannel(channel.id, "owner", value)}
                        />
                      </div>

                      <div className="connection-state">
                        <Lock size={16} />
                        <span>
                          {channel.connected || channel.mode === "connected_mock"
                            ? "مرتبط تجريبيًا داخل البروتوتايب"
                            : "غير مرتبط فعليًا"}
                        </span>
                        {channel.custom && (
                          <button
                            type="button"
                            className="danger-link"
                            onClick={() => deleteChannel(channel.id)}
                          >
                            <Trash2 size={14} />
                            حذف محلي
                          </button>
                        )}
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
                  label="حد التكلفة الشهري التجريبي"
                  value={aiSettings.maxMonthlyBudget}
                  placeholder="مثال: 250"
                  onChange={(value) => updateAi("maxMonthlyBudget", value)}
                />

                <SecretField label="API Key Placeholder" />

                <div className="cost-preview">
                  <DollarSign size={18} />
                  <div>
                    <strong>{aiSettings.maxMonthlyBudget || 0}$</strong>
                    <span>حد شكلي داخل البروتوتايب وليس مراقبة تكلفة فعلية.</span>
                  </div>
                </div>

                <div className="toggle-stack wide">
                  <ToggleRow
                    title="تفعيل التوليد المحلي التجريبي"
                    description="زر التوليد يعرض مخرجات وهمية داخل الواجهة فقط."
                    checked={aiSettings.allowAutoGeneration}
                    onChange={(value) => updateAi("allowAutoGeneration", value)}
                  />

                  <ToggleRow
                    title="اشتراط مراجعة بشرية"
                    description="لا تعتمد المخرجات تلقائيًا بعد التوليد."
                    checked={aiSettings.requireHumanReview}
                    onChange={(value) => updateAi("requireHumanReview", value)}
                  />

                  <ToggleRow
                    title="اشتراط Fallback للنماذج"
                    description="أي مسار نموذج يجب أن يملك بديلًا واضحًا لاحقًا."
                    checked={aiSettings.requireFallbackModel}
                    onChange={(value) => updateAi("requireFallbackModel", value)}
                  />

                  <ToggleRow
                    title="إخفاء بيانات العملاء قبل إرسالها للنماذج"
                    description="قاعدة حوكمة أساسية قبل أي تنفيذ حقيقي."
                    checked={aiSettings.redactCustomerData}
                    onChange={(value) => updateAi("redactCustomerData", value)}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === "governance" && (
            <SettingsCard
              icon={Shield}
              title="إعدادات الحوكمة والمخاطر"
              description="قواعد تمنع الاستخدام غير المنضبط للمخرجات."
            >
              <div className="form-grid">
                <SelectField
                  label="مستوى المخاطر الافتراضي"
                  value={governance.riskLevel}
                  options={riskLevels}
                  onChange={(value) => updateGovernance("riskLevel", value)}
                />

                <div className="risk-summary">
                  <strong>{governance.riskLevel}</strong>
                  <span>تصنيف تشغيلي مبدئي للمخاطر</span>
                </div>

                <div className="toggle-stack wide">
                  <ToggleRow
                    title="منع النشر التلقائي"
                    description="أي نشر يجب أن يكون بإجراء منفصل وموافق عليه."
                    checked={governance.blockAutoPublish}
                    onChange={(value) => updateGovernance("blockAutoPublish", value)}
                  />

                  <ToggleRow
                    title="طلب اعتماد قبل الإرسال"
                    description="WhatsApp و Email وأي قناة خارجية تحتاج موافقة."
                    checked={governance.requireApprovalBeforeSend}
                    onChange={(value) => updateGovernance("requireApprovalBeforeSend", value)}
                  />

                  <ToggleRow
                    title="تفعيل سجل مراجعة لاحقًا"
                    description="حاليًا سجل تجريبي فقط، والتدقيق الحقيقي يحتاج Backend."
                    checked={governance.keepReviewLog}
                    onChange={(value) => updateGovernance("keepReviewLog", value)}
                  />

                  <ToggleRow
                    title="مراجعة الادعاءات التسويقية"
                    description="منع الوعود غير المثبتة أو العبارات عالية المخاطر."
                    checked={governance.requireClaimsReview}
                    onChange={(value) => updateGovernance("requireClaimsReview", value)}
                  />

                  <ToggleRow
                    title="مراجعة حقوق الأصول"
                    description="الصور والفيديوهات تحتاج تحقق ملكية أو إذن استخدام."
                    checked={governance.requireAssetRightsReview}
                    onChange={(value) => updateGovernance("requireAssetRightsReview", value)}
                  />

                  <ToggleRow
                    title="إصدارات المطالبات"
                    description="كل مطالبة يجب أن تكون قابلة للتتبع بإصدار واضح."
                    checked={governance.requirePromptVersioning}
                    onChange={(value) => updateGovernance("requirePromptVersioning", value)}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === "outputs" && (
            <SettingsCard
              icon={FileText}
              title="إعدادات المخرجات الافتراضية"
              description="تفضيلات المحتوى التي ستؤثر لاحقًا على الحملات."
            >
              <div className="form-grid">
                <SelectField
                  label="اللغة الافتراضية"
                  value={outputSettings.defaultLanguage}
                  options={languageOptions}
                  onChange={(value) => updateOutput("defaultLanguage", value)}
                />

                <SelectField
                  label="نبرة المحتوى"
                  value={outputSettings.defaultTone}
                  options={toneOptions}
                  onChange={(value) => updateOutput("defaultTone", value)}
                />

                <SelectField
                  label="طول النصوص"
                  value={outputSettings.textLength}
                  options={["قصير", "متوسط", "طويل"]}
                  onChange={(value) => updateOutput("textLength", value)}
                />

                <div className="output-preview">
                  <Wand2 size={20} />
                  <span>
                    {outputSettings.defaultLanguage} · {outputSettings.defaultTone} ·{" "}
                    {outputSettings.textLength}
                  </span>
                </div>

                <div className="toggle-stack wide">
                  <ToggleRow
                    title="إضافة دعوة لاتخاذ إجراء CTA"
                    description="مثل: اطلب الآن، اكتشف العرض، تواصل معنا."
                    checked={outputSettings.includeCTA}
                    onChange={(value) => updateOutput("includeCTA", value)}
                  />

                  <ToggleRow
                    title="اقتراح Hashtags"
                    description="اقتراح وسوم مناسبة للمحتوى الاجتماعي."
                    checked={outputSettings.includeHashtags}
                    onChange={(value) => updateOutput("includeHashtags", value)}
                  />

                  <ToggleRow
                    title="توليد أكثر من نسخة"
                    description="تجهيز بدائل للمراجعة بدل نسخة واحدة."
                    checked={outputSettings.generateVariants}
                    onChange={(value) => updateOutput("generateVariants", value)}
                  />

                  <ToggleRow
                    title="ملخص آمن للعميل"
                    description="يفصل بين المطالبة الداخلية وما يراه العميل."
                    checked={outputSettings.requireCustomerSafeSummary}
                    onChange={(value) => updateOutput("requireCustomerSafeSummary", value)}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === "audit" && (
            <SettingsCard
              icon={KeyRound}
              title="سجل الإعدادات المحلي"
              description="سجل تمثيلي داخل الواجهة فقط. السجل الحقيقي يحتاج Backend وتوقيع مستخدم."
            >
              <div className="audit-list">
                {auditLog.map((item) => (
                  <div key={item.id} className={`audit-row ${item.severity}`}>
                    <div>
                      <strong>{item.event}</strong>
                      <span>{item.actor} · {item.time}</span>
                    </div>
                    <Badge tone={item.severity === "warning" ? "amber" : item.severity === "success" ? "green" : "slate"}>
                      {item.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}
        </section>

        <aside className="settings-side">
          <div className="side-card">
            <div className="side-icon">
              <SlidersHorizontal size={24} />
            </div>

            <h3>ملخص الإعدادات</h3>

            <div className="summary-list">
              <SummaryRow label="القنوات المفعلة" value={enabledChannelsCount} />
              <SummaryRow label="مزود النصوص" value={aiSettings.textProvider} />
              <SummaryRow label="مراجعة بشرية" value={aiSettings.requireHumanReview ? "مفعلة" : "غير مفعلة"} />
              <SummaryRow label="النشر التلقائي" value={governance.blockAutoPublish ? "ممنوع" : "غير مضبوط"} />
              <SummaryRow label="اللغة الافتراضية" value={outputSettings.defaultLanguage} />
              <SummaryRow label="حالة الحفظ" value={dirty ? "غير محفوظ" : "محفوظ محليًا"} />
            </div>

            <div className="side-actions">
              <button type="button" className="primary-button" onClick={saveLocalSettings}>
                <Save size={17} />
                حفظ محلي
              </button>

              <button type="button" className="secondary-button" onClick={resetSettings}>
                <RefreshCw size={17} />
                إعادة الضبط
              </button>
            </div>

            {saved && (
              <div className="success-box">
                <CheckCircle2 size={18} />
                تم حفظ الإعدادات محليًا داخل الواجهة فقط.
              </div>
            )}
          </div>

          <div className="side-warning">
            <KeyRound size={20} />
            <div>
              <strong>تحذير أمني</strong>
              <p>حقول المفاتيح هنا شكلية فقط. لا يتم حفظ أسرار أو مفاتيح حقيقية في الواجهة.</p>
            </div>
          </div>

          <div className="side-warning">
            <CircleAlert size={20} />
            <div>
              <strong>فجوة V1 لاحقًا</strong>
              <p>قبل التنفيذ الحقيقي نحتاج ERD/API واضح لإعدادات القنوات، الصلاحيات، الأسرار، وسجل التدقيق.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SettingsCard({ icon: Icon, title, description, children, action }) {
  return (
    <section className="settings-card">
      <div className="card-header">
        <div className="card-title-row">
          <div className="card-icon">
            <Icon size={22} />
          </div>

          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {action}
      </div>

      <div className="card-body">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }) {
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

function SecretField({ label }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="password" value="••••••••••••••••" readOnly aria-label={label} />
      <small>Placeholder فقط — لا تستخدم مفتاحًا حقيقيًا.</small>
    </label>
  );
}

function SelectField({ label, value, options, optionLabels = {}, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`switch ${checked ? "checked" : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <Switch checked={checked} onChange={onChange} />
    </div>
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

function Metric({ title, value, note }) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Badge({ tone = "slate", children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function WarningsList({ warnings }) {
  if (!warnings.length) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={20} />
        لا توجد تحذيرات حوكمة حرجة في الإعدادات الحالية.
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
            <p>{warning.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = `
.settings-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.12), transparent 31%),
    radial-gradient(circle at bottom left, rgba(105, 138, 72, 0.12), transparent 32%),
    #f7f8f4;
  padding: 28px;
  color: #1f241d;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.settings-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  margin-bottom: 16px;
}

.hero-content,
.settings-score-card,
.settings-card,
.side-card,
.side-warning,
.metric-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #e4e7df;
  box-shadow: 0 18px 54px rgba(24, 38, 18, 0.06);
  border-radius: 28px;
}

.hero-content {
  padding: 30px;
}

.eyebrow {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b2c;
  background: #eef7e9;
  border: 1px solid #d5ecd0;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 18px;
}

.hero-content h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.25;
  letter-spacing: -0.04em;
  color: #1f241d;
}

.hero-content p {
  max-width: 860px;
  margin: 14px 0 0;
  color: #6f746b;
  font-size: 15px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.hero-alert {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #92400e;
  background: #fff7e6;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 13px 14px;
  font-size: 14px;
  line-height: 1.8;
}

.settings-score-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.score-icon,
.side-icon,
.card-icon,
.channel-icon {
  display: grid;
  place-items: center;
  color: #fff;
}

.score-icon {
  width: 56px;
  height: 56px;
  border-radius: 20px;
  background: linear-gradient(135deg, #176b2c, #698a48);
  margin-bottom: 18px;
}

.settings-score-card > span {
  color: #6f746b;
  font-size: 14px;
}

.settings-score-card > strong {
  display: block;
  font-size: 42px;
  margin-top: 4px;
  color: #1f241d;
}

.settings-score-card p {
  color: #6f746b;
  line-height: 1.8;
  margin: 14px 0 0;
  font-size: 14px;
}

.score-meta {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.mini-progress {
  height: 9px;
  margin-top: 14px;
  overflow: hidden;
  background: #e4e7df;
  border-radius: 999px;
}

.mini-progress div {
  height: 100%;
  background: linear-gradient(90deg, #176b2c, #698a48);
  border-radius: inherit;
  transition: width 0.25s ease;
}

.settings-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.settings-tabs button {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #6f746b;
  border-radius: 999px;
  padding: 10px 14px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.settings-tabs button.active {
  background: #176b2c;
  color: #fff;
  border-color: #176b2c;
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.settings-main {
  display: grid;
  gap: 18px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  padding: 18px;
}

.metric-card span {
  display: block;
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  color: #1f241d;
  font-size: 26px;
}

.metric-card small {
  display: block;
  margin-top: 6px;
  color: #8b9284;
  font-weight: 800;
}

.settings-card {
  padding: 22px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e4e7df;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.card-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  border-radius: 18px;
  background: linear-gradient(135deg, #176b2c, #1f241d);
}

.card-header h2 {
  margin: 0;
  color: #1f241d;
  font-size: 22px;
  letter-spacing: -0.03em;
}

.card-header p {
  margin: 6px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #3c4238;
  font-size: 13px;
  font-weight: 900;
}

.field small {
  color: #92400e;
  font-size: 12px;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe3d3;
  background: #fff;
  border-radius: 16px;
  padding: 13px 14px;
  color: #1f241d;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  transition: 0.2s ease;
}

input:focus,
select:focus {
  border-color: #176b2c;
  box-shadow: 0 0 0 4px rgba(23, 107, 44, 0.12);
}

input[readonly] {
  color: #6f746b;
  background: #f7f8f4;
}

.wide {
  grid-column: 1 / -1;
}

.channels-grid {
  display: grid;
  gap: 12px;
}

.channel-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 22px;
  padding: 16px;
}

.channel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.channel-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.channel-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 16px;
  background: linear-gradient(135deg, #176b2c, #698a48);
}

.channel-title h3 {
  margin: 0;
  color: #1f241d;
  font-size: 16px;
}

.channel-title p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.channel-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
  align-items: end;
}

.connection-state {
  min-height: 46px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6f746b;
  background: #f7f8f4;
  border: 1px dashed #cad4c3;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 900;
}

.danger-link {
  margin-inline-start: auto;
  border: 0;
  background: transparent;
  color: #991b1b;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 900;
}

.switch {
  width: 50px;
  height: 28px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: #cad4c3;
  padding: 3px;
  cursor: pointer;
  transition: 0.2s ease;
}

.switch span {
  width: 22px;
  height: 22px;
  display: block;
  border-radius: 50%;
  background: #fff;
  transform: translateX(0);
  transition: 0.2s ease;
  box-shadow: 0 2px 8px rgba(24, 38, 18, 0.18);
}

.switch.checked {
  background: linear-gradient(135deg, #176b2c, #698a48);
}

.switch.checked span {
  transform: translateX(-22px);
}

.toggle-stack {
  display: grid;
  gap: 10px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #f7f8f4;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  padding: 14px;
}

.toggle-row strong {
  color: #1f241d;
  font-size: 14px;
}

.toggle-row p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.risk-summary,
.output-preview,
.cost-preview {
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eef7e9;
  border: 1px solid #d5ecd0;
  border-radius: 18px;
  padding: 14px;
  color: #176b2c;
  font-weight: 900;
}

.risk-summary {
  display: grid;
}

.risk-summary strong,
.cost-preview strong {
  font-size: 18px;
}

.risk-summary span,
.cost-preview span {
  font-size: 13px;
  color: #6f746b;
}

.settings-side {
  display: grid;
  gap: 16px;
  position: sticky;
  top: 24px;
}

.side-card {
  padding: 22px;
}

.side-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1f241d, #3c4238);
  margin-bottom: 14px;
}

.side-card h3 {
  margin: 0;
  color: #1f241d;
  font-size: 22px;
}

.summary-list {
  display: grid;
  gap: 10px;
  margin: 18px 0;
}

.summary-list.inline {
  margin: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f7f8f4;
  border: 1px solid #e4e7df;
  border-radius: 16px;
  padding: 12px;
}

.summary-row span {
  color: #6f746b;
  font-size: 13px;
}

.summary-row strong {
  color: #1f241d;
  font-size: 13px;
}

.side-actions {
  display: grid;
  gap: 10px;
}

.primary-button,
.secondary-button {
  border-radius: 16px;
  padding: 12px 16px;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button {
  border: 0;
  color: #fff;
  background: #176b2c;
  box-shadow: 0 14px 28px rgba(23, 107, 44, 0.18);
}

.secondary-button {
  color: #3c4238;
  background: #fff;
  border: 1px solid #e4e7df;
}

.secondary-button.compact {
  min-height: 40px;
  padding: 8px 12px;
}

.success-box {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 12px;
  font-size: 13px;
  font-weight: 800;
}

.side-warning {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  color: #92400e;
  background: #fff7e6;
  border-color: #fde68a;
}

.side-warning strong {
  display: block;
  margin-bottom: 4px;
}

.side-warning p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
}

.warnings-list,
.audit-list {
  display: grid;
  gap: 10px;
}

.warning-row,
.audit-row {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  padding: 13px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
}

.warning-row p,
.audit-row span {
  margin: 5px 0 0;
  display: block;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.warning-row.red {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.warning-row.amber,
.audit-row.warning {
  background: #fff7e6;
  border-color: #fde68a;
  color: #92400e;
}

.audit-row.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.audit-row {
  justify-content: space-between;
}

.badge {
  width: fit-content;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

.badge.green {
  background: #f0fdf4;
  color: #166534;
}

.badge.amber {
  background: #fff7e6;
  color: #92400e;
}

.badge.slate {
  background: #f8fafc;
  color: #475569;
}

.empty-state {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 900;
}

@media (max-width: 1100px) {
  .settings-hero,
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-side {
    position: static;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .settings-page {
    padding: 18px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .form-grid,
  .channel-fields,
  .summary-list.inline,
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .channel-header,
  .toggle-row,
  .card-header {
    align-items: stretch;
    flex-direction: column;
  }
}
`;
