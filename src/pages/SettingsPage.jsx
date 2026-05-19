import React, { useMemo, useState } from "react";
import {
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
  Wand2,
} from "lucide-react";

const channelDefaults = [
  {
    id: "instagram",
    name: "Instagram",
    description: "تجهيز المحتوى للمنشورات والقصص والإعلانات.",
    icon: Globe2,
    enabled: true,
    connected: false,
    handle: "",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "مخرجات فيديو قصيرة وسكربتات Reels/TikTok.",
    icon: PlayCircle,
    enabled: true,
    connected: false,
    handle: "",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "رسائل قصيرة وأفكار إعلانية مناسبة للسناب.",
    icon: Sparkles,
    enabled: false,
    connected: false,
    handle: "",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "رسائل مباشرة للعملاء أو حملات إعادة التنشيط.",
    icon: MessageCircle,
    enabled: true,
    connected: false,
    handle: "",
  },
  {
    id: "email",
    name: "Email",
    description: "حملات بريدية وعناوين ورسائل تسويقية.",
    icon: Mail,
    enabled: true,
    connected: false,
    handle: "",
  },
];

const providerOptions = [
  "غير محدد",
  "OpenAI",
  "Anthropic",
  "Google",
  "Runway",
  "Replicate",
  "مزود داخلي لاحقًا",
];

const toneOptions = [
  "ودية",
  "رسمية",
  "فاخرة",
  "شبابية",
  "عملية",
  "جريئة",
  "هادئة",
];

const languageOptions = ["العربية", "الإنجليزية", "العربية والإنجليزية"];

const riskLevels = ["منخفض", "متوسط", "مرتفع"];

export default function SettingsPage() {
  const [channels, setChannels] = useState(channelDefaults);
  const [saved, setSaved] = useState(false);

  const [workspace, setWorkspace] = useState({
    workspaceName: "ناشر",
    ownerName: "أحمد السعيد",
    defaultMarket: "السعودية",
    businessMode: "متجر إلكتروني",
  });

  const [aiSettings, setAiSettings] = useState({
    textProvider: "OpenAI",
    imageProvider: "غير محدد",
    videoProvider: "غير محدد",
    maxMonthlyBudget: "250",
    requireHumanReview: true,
    allowAutoGeneration: true,
  });

  const [governance, setGovernance] = useState({
    blockAutoPublish: true,
    requireApprovalBeforeSend: true,
    keepReviewLog: true,
    riskLevel: "متوسط",
    requireClaimsReview: true,
  });

  const [outputSettings, setOutputSettings] = useState({
    defaultLanguage: "العربية",
    defaultTone: "ودية",
    textLength: "متوسط",
    includeHashtags: true,
    includeCTA: true,
    generateVariants: true,
  });

  const enabledChannelsCount = useMemo(() => {
    return channels.filter((channel) => channel.enabled).length;
  }, [channels]);

  const governanceScore = useMemo(() => {
    const values = Object.values(governance);
    const booleanValues = values.filter((value) => typeof value === "boolean");
    const active = booleanValues.filter(Boolean).length;
    return Math.round((active / booleanValues.length) * 100);
  }, [governance]);

  const updateWorkspace = (key, value) => {
    setWorkspace((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateAi = (key, value) => {
    setAiSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateGovernance = (key, value) => {
    setGovernance((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateOutput = (key, value) => {
    setOutputSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateChannel = (id, key, value) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id
          ? {
              ...channel,
              [key]: value,
            }
          : channel
      )
    );

    setSaved(false);
  };

  const saveLocalSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const resetSettings = () => {
    setChannels(channelDefaults);
    setWorkspace({
      workspaceName: "ناشر",
      ownerName: "أحمد السعيد",
      defaultMarket: "السعودية",
      businessMode: "متجر إلكتروني",
    });
    setAiSettings({
      textProvider: "OpenAI",
      imageProvider: "غير محدد",
      videoProvider: "غير محدد",
      maxMonthlyBudget: "250",
      requireHumanReview: true,
      allowAutoGeneration: true,
    });
    setGovernance({
      blockAutoPublish: true,
      requireApprovalBeforeSend: true,
      keepReviewLog: true,
      riskLevel: "متوسط",
      requireClaimsReview: true,
    });
    setOutputSettings({
      defaultLanguage: "العربية",
      defaultTone: "ودية",
      textLength: "متوسط",
      includeHashtags: true,
      includeCTA: true,
      generateVariants: true,
    });
    setSaved(false);
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

          <h1>ضبط القنوات والأدوات والحوكمة قبل التشغيل الحقيقي</h1>

          <p>
            هذه الصفحة تجمع إعدادات القنوات، أدوات الذكاء الاصطناعي، حدود
            التكلفة، وسياسات المراجعة. الهدف الآن مراجعة تجربة الإدارة فقط، وليس
            تنفيذ ربط فعلي.
          </p>

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

          <span>مستوى الحوكمة</span>
          <strong>{governanceScore}%</strong>

          <div className="mini-progress">
            <div style={{ width: `${governanceScore}%` }} />
          </div>

          <p>
            القاعدة الحالية: المراجعة البشرية قبل الإرسال أو النشر، ولا يوجد نشر
            تلقائي.
          </p>
        </div>
      </section>

      <section className="settings-layout">
        <section className="settings-main">
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

          <SettingsCard
            icon={Globe2}
            title="القنوات والربط"
            description="تفعيل القنوات هنا لا يعني وجود تكامل فعلي. الربط الحقيقي مؤجل."
          >
            <div className="channels-grid">
              {channels.map((channel) => {
                const Icon = channel.icon;

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
                        onChange={(value) =>
                          updateChannel(channel.id, "enabled", value)
                        }
                      />
                    </div>

                    <div className="channel-fields">
                      <Field
                        label="الحساب أو الرابط"
                        value={channel.handle}
                        placeholder="رابط أو معرف الحساب"
                        onChange={(value) =>
                          updateChannel(channel.id, "handle", value)
                        }
                      />

                      <div className="connection-state">
                        <Lock size={16} />
                        <span>
                          {channel.connected
                            ? "مرتبط تجريبيًا"
                            : "غير مرتبط فعليًا"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Bot}
            title="إعدادات أدوات الذكاء الاصطناعي"
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
              </div>
            </div>
          </SettingsCard>

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
                  onChange={(value) =>
                    updateGovernance("requireApprovalBeforeSend", value)
                  }
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
                  onChange={(value) =>
                    updateGovernance("requireClaimsReview", value)
                  }
                />
              </div>
            </div>
          </SettingsCard>

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
              </div>
            </div>
          </SettingsCard>
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
              <SummaryRow
                label="مراجعة بشرية"
                value={aiSettings.requireHumanReview ? "مفعلة" : "غير مفعلة"}
              />
              <SummaryRow
                label="النشر التلقائي"
                value={governance.blockAutoPublish ? "ممنوع" : "غير مضبوط"}
              />
              <SummaryRow
                label="اللغة الافتراضية"
                value={outputSettings.defaultLanguage}
              />
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
              <p>
                حقول المفاتيح هنا شكلية فقط. لا يتم حفظ أسرار أو مفاتيح حقيقية
                في الواجهة.
              </p>
            </div>
          </div>

          <div className="side-warning">
            <CircleAlert size={20} />
            <div>
              <strong>فجوة V1 لاحقًا</strong>
              <p>
                قبل التنفيذ الحقيقي نحتاج ERD/API واضح لإعدادات القنوات،
                الصلاحيات، الأسرار، وسجل التدقيق.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="settings-card">
      <div className="card-header">
        <div className="card-icon">
          <Icon size={22} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
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
      <input
        type="password"
        value="••••••••••••••••"
        readOnly
        aria-label={label}
      />
      <small>Placeholder فقط — لا تستخدم مفتاحًا حقيقيًا.</small>
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

const styles = `
.settings-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(79, 70, 229, 0.12), transparent 31%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.12), transparent 32%),
    #f7f8fb;
  padding: 28px;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.settings-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-content,
.settings-score-card,
.settings-card,
.side-card,
.side-warning {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(18px);
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
  color: #4338ca;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
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
  color: #0f172a;
}

.hero-content p {
  max-width: 840px;
  margin: 14px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.9;
}

.hero-alert {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #92400e;
  background: #fffbeb;
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
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  margin-bottom: 18px;
}

.settings-score-card > span {
  color: #64748b;
  font-size: 14px;
}

.settings-score-card > strong {
  display: block;
  font-size: 42px;
  margin-top: 4px;
  color: #0f172a;
}

.settings-score-card p {
  color: #64748b;
  line-height: 1.8;
  margin: 14px 0 0;
  font-size: 14px;
}

.mini-progress {
  height: 9px;
  margin-top: 14px;
  overflow: hidden;
  background: #e5e7eb;
  border-radius: 999px;
}

.mini-progress div {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #0ea5e9);
  border-radius: inherit;
  transition: width 0.25s ease;
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

.settings-card {
  padding: 22px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.card-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  border-radius: 18px;
  background: linear-gradient(135deg, #111827, #334155);
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  letter-spacing: -0.03em;
}

.card-header p {
  margin: 6px 0 0;
  color: #64748b;
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
  color: #334155;
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
  border: 1px solid #dbe3ef;
  background: #fff;
  border-radius: 16px;
  padding: 13px 14px;
  color: #0f172a;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  transition: 0.2s ease;
}

input:focus,
select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

input[readonly] {
  color: #64748b;
  background: #f8fafc;
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
  border: 1px solid #e2e8f0;
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
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
}

.channel-title h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
}

.channel-title p {
  margin: 5px 0 0;
  color: #64748b;
  line-height: 1.7;
  font-size: 13px;
}

.channel-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 12px;
  margin-top: 14px;
  align-items: end;
}

.connection-state {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 900;
}

.switch {
  width: 50px;
  height: 28px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: #cbd5e1;
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
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
}

.switch.checked {
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
}

.toggle-row strong {
  color: #0f172a;
  font-size: 14px;
}

.toggle-row p {
  margin: 5px 0 0;
  color: #64748b;
  line-height: 1.7;
  font-size: 13px;
}

.risk-summary,
.output-preview {
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 18px;
  padding: 14px;
  color: #4338ca;
  font-weight: 900;
}

.risk-summary {
  display: grid;
}

.risk-summary strong {
  font-size: 18px;
}

.risk-summary span {
  font-size: 13px;
  color: #64748b;
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
  background: linear-gradient(135deg, #111827, #334155);
  margin-bottom: 14px;
}

.side-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.summary-list {
  display: grid;
  gap: 10px;
  margin: 18px 0;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
}

.summary-row span {
  color: #64748b;
  font-size: 13px;
}

.summary-row strong {
  color: #0f172a;
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
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.18);
}

.secondary-button {
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
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
  background: #fffbeb;
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

@media (max-width: 1100px) {
  .settings-hero,
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-side {
    position: static;
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
  .channel-fields {
    grid-template-columns: 1fr;
  }

  .channel-header,
  .toggle-row {
    align-items: stretch;
    flex-direction: column;
  }
}
`;