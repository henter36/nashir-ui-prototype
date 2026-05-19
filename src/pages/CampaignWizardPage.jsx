import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  ImageIcon,
  Mail,
  Megaphone,
  MessageCircle,
  PlayCircle,
  Save,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";

const steps = [
  {
    id: "campaign",
    title: "بيانات الحملة",
    subtitle: "حدد اسم الحملة وهدفها والعناصر المستهدفة",
    icon: Megaphone,
  },
  {
    id: "audience",
    title: "الجمهور والسوق",
    subtitle: "حدد لمن تتحدث وما الذي يمنعهم من الشراء",
    icon: Users,
  },
  {
    id: "outputs",
    title: "القنوات والمخرجات",
    subtitle: "اختر أين ستنشر وما نوع المواد المطلوبة",
    icon: FileText,
  },
  {
    id: "review",
    title: "المراجعة والتوليد",
    subtitle: "راجع الملخص وأنشئ مخرجات تجريبية محلية",
    icon: Wand2,
  },
];

const campaignGoals = [
  "زيادة المبيعات",
  "زيادة الوعي بالعلامة",
  "إطلاق منتج جديد",
  "جذب عملاء محتملين",
  "إعادة تنشيط عملاء سابقين",
  "زيادة زيارات المتجر",
];

const awarenessLevels = [
  "لا يعرف المنتج",
  "يعرف المشكلة فقط",
  "يقارن بين حلول",
  "يعرف المتجر ولم يشترِ بعد",
  "عميل سابق",
];

const channels = [
  { id: "instagram", label: "Instagram", icon: ImageIcon },
  { id: "tiktok", label: "TikTok", icon: PlayCircle },
  { id: "snapchat", label: "Snapchat", icon: Sparkles },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
];

const outputTypes = [
  "نصوص إعلانية",
  "أفكار صور",
  "سكريبت فيديو قصير",
  "خطة نشر",
  "رسائل واتساب",
  "عناوين وإعلانات قصيرة",
];

export default function CampaignWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [generated, setGenerated] = useState(false);

  const [form, setForm] = useState({
    campaignName: "",
    campaignGoal: "",
    targetProduct: "",
    campaignOffer: "",
    targetAudience: "",
    targetMarket: "",
    awarenessLevel: "",
    objections: "",
    selectedChannels: [],
    selectedOutputs: [],
    notes: "",
  });

  const progress = useMemo(() => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  }, [currentStep]);

  const readiness = useMemo(() => {
    const baseFields = [
      form.campaignName,
      form.campaignGoal,
      form.targetProduct,
      form.targetAudience,
      form.targetMarket,
      form.awarenessLevel,
    ];

    const filled = baseFields.filter((value) => String(value).trim()).length;
    const channelScore = form.selectedChannels.length > 0 ? 1 : 0;
    const outputScore = form.selectedOutputs.length > 0 ? 1 : 0;

    return Math.round(((filled + channelScore + outputScore) / 8) * 100);
  }, [form]);

  const CurrentIcon = steps[currentStep].icon;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setGenerated(false);
  };

  const toggleArrayValue = (key, value) => {
    setForm((prev) => {
      const exists = prev[key].includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });

    setGenerated(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generateOutputs = () => {
    setGenerated(true);
  };

  return (
    <main className="campaign-wizard-page" dir="rtl">
      <style>{styles}</style>

      <section className="campaign-hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Megaphone size={16} />
            معالج إنشاء الحملة
          </div>

          <h1>حوّل بيانات المتجر إلى حملة قابلة للمراجعة</h1>

          <p>
            هذه الصفحة تجمع إعدادات الحملة قبل إنشاء المخرجات. الهدف الآن هو
            اختبار رحلة المستخدم بصريًا ومنطقيًا فقط، وليس تنفيذ توليد فعلي أو
            حفظ بيانات.
          </p>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              هذه شاشة واجهة فقط. لا يوجد توليد AI فعلي، ولا API، ولا تخزين،
              ولا نشر تلقائي على أي قناة.
            </span>
          </div>
        </div>

        <div className="readiness-card">
          <div className="readiness-icon">
            <Target size={26} />
          </div>

          <span>جاهزية الحملة</span>
          <strong>{readiness}%</strong>

          <div className="mini-progress">
            <div style={{ width: `${readiness}%` }} />
          </div>

          <p>
            الحملة تصبح أكثر وضوحًا عندما يتحدد الهدف والجمهور والقنوات
            والمخرجات المطلوبة.
          </p>
        </div>
      </section>

      <section className="wizard-layout">
        <aside className="steps-panel">
          <div className="steps-header">
            <span>مراحل الحملة</span>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-line">
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="steps-list">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  className={`step-item ${isActive ? "active" : ""} ${
                    isDone ? "done" : ""
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="step-icon">
                    {isDone ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>

                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="form-panel">
          <div className="form-header">
            <div className="form-title">
              <div className="form-icon">
                <CurrentIcon size={24} />
              </div>

              <div>
                <h2>{steps[currentStep].title}</h2>
                <p>{steps[currentStep].subtitle}</p>
              </div>
            </div>

            <div className="step-count">
              {currentStep + 1} / {steps.length}
            </div>
          </div>

          {currentStep === 0 && (
            <div className="form-grid">
              <Field
                label="اسم الحملة"
                placeholder="مثال: حملة إطلاق مجموعة الصيف"
                value={form.campaignName}
                onChange={(value) => updateField("campaignName", value)}
              />

              <SelectField
                label="هدف الحملة"
                value={form.campaignGoal}
                placeholder="اختر هدف الحملة"
                options={campaignGoals}
                onChange={(value) => updateField("campaignGoal", value)}
              />

              <TextArea
                label="المنتج أو العناصر المستهدفة"
                placeholder="اكتب المنتج أو المجموعة التي تستهدفها الحملة..."
                value={form.targetProduct}
                onChange={(value) => updateField("targetProduct", value)}
                wide
              />

              <TextArea
                label="العرض أو الرسالة الرئيسية"
                placeholder="مثال: خصم 20%، توصيل مجاني، منتج محدود، جودة أعلى..."
                value={form.campaignOffer}
                onChange={(value) => updateField("campaignOffer", value)}
                wide
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="form-grid">
              <TextArea
                label="الجمهور المستهدف"
                placeholder="مثال: أمهات، طالبات، موظفات، أصحاب مشاريع..."
                value={form.targetAudience}
                onChange={(value) => updateField("targetAudience", value)}
                wide
              />

              <Field
                label="السوق أو المنطقة"
                placeholder="مثال: الرياض، السعودية، الخليج"
                value={form.targetMarket}
                onChange={(value) => updateField("targetMarket", value)}
              />

              <SelectField
                label="مستوى وعي الجمهور"
                value={form.awarenessLevel}
                placeholder="اختر مستوى الوعي"
                options={awarenessLevels}
                onChange={(value) => updateField("awarenessLevel", value)}
              />

              <TextArea
                label="الاعتراضات المحتملة"
                placeholder="ما الذي قد يمنع العميل من الشراء؟ السعر، الثقة، الحاجة، المقارنة..."
                value={form.objections}
                onChange={(value) => updateField("objections", value)}
                wide
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="selection-area">
              <div>
                <h3>القنوات المستهدفة</h3>
                <p>اختر القنوات التي تريد تجهيز الحملة لها.</p>
              </div>

              <div className="choice-grid">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const selected = form.selectedChannels.includes(channel.id);

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      className={`choice-card ${selected ? "selected" : ""}`}
                      onClick={() =>
                        toggleArrayValue("selectedChannels", channel.id)
                      }
                    >
                      <Icon size={22} />
                      <span>{channel.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <h3>نوع المخرجات المطلوبة</h3>
                <p>حدد المواد التي تريد أن يجهزها النظام لاحقًا.</p>
              </div>

              <div className="pill-grid">
                {outputTypes.map((output) => {
                  const selected = form.selectedOutputs.includes(output);

                  return (
                    <button
                      key={output}
                      type="button"
                      className={`pill ${selected ? "selected" : ""}`}
                      onClick={() =>
                        toggleArrayValue("selectedOutputs", output)
                      }
                    >
                      {output}
                    </button>
                  );
                })}
              </div>

              <TextArea
                label="ملاحظات إضافية"
                placeholder="أي قيود أو توجيهات مهمة للحملة..."
                value={form.notes}
                onChange={(value) => updateField("notes", value)}
                wide
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="review-layout">
              <div className="summary-card">
                <div className="summary-header">
                  <ClipboardList size={22} />
                  <h3>ملخص الحملة</h3>
                </div>

                <SummaryItem label="اسم الحملة" value={form.campaignName} />
                <SummaryItem label="الهدف" value={form.campaignGoal} />
                <SummaryItem
                  label="المنتج المستهدف"
                  value={form.targetProduct}
                />
                <SummaryItem label="العرض" value={form.campaignOffer} />
                <SummaryItem label="الجمهور" value={form.targetAudience} />
                <SummaryItem label="السوق" value={form.targetMarket} />
                <SummaryItem label="مستوى الوعي" value={form.awarenessLevel} />
                <SummaryItem label="الاعتراضات" value={form.objections} />

                <SummaryItem
                  label="القنوات"
                  value={
                    form.selectedChannels.length
                      ? form.selectedChannels.join("، ")
                      : ""
                  }
                />

                <SummaryItem
                  label="المخرجات"
                  value={
                    form.selectedOutputs.length
                      ? form.selectedOutputs.join("، ")
                      : ""
                  }
                />
              </div>

              <div className="generation-card">
                <div className="generation-icon">
                  <Wand2 size={28} />
                </div>

                <h3>إنشاء مخرجات الحملة</h3>

                <p>
                  الزر الحالي يعرض نتيجة تجريبية محلية فقط لإثبات تجربة
                  المستخدم. التوليد الفعلي يحتاج لاحقًا إلى اعتماد API وAI
                  Service Layer وقواعد مراجعة بشرية.
                </p>

                <button
                  type="button"
                  className="primary-button full"
                  onClick={generateOutputs}
                >
                  إنشاء مخرجات الحملة
                  <Sparkles size={18} />
                </button>

                {generated && (
                  <div className="mock-output">
                    <strong>مخرجات تجريبية</strong>

                    <ul>
                      <li>
                        إعلان قصير يركز على هدف الحملة والجمهور المحدد.
                      </li>
                      <li>
                        فكرة منشور بصري مناسبة للقنوات المختارة.
                      </li>
                      <li>
                        رسالة واتساب أو بريد مختصرة عند اختيار القناة.
                      </li>
                      <li>
                        خطة نشر أولية قابلة للمراجعة والتعديل.
                      </li>
                    </ul>

                    <div className="governance-note">
                      لا يتم إرسال أو نشر أي شيء تلقائيًا. كل المخرجات يجب أن
                      تمر على مراجعة بشرية قبل الاعتماد.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowRight size={18} />
              السابق
            </button>

            {currentStep < steps.length - 1 ? (
              <button type="button" className="primary-button" onClick={nextStep}>
                التالي
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setGenerated(false)}
              >
                حفظ كمسودة محلية
                <Save size={18} />
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, placeholder, value, onChange }) {
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

function TextArea({ label, placeholder, value, onChange, wide }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    </label>
  );
}

function SelectField({ label, value, placeholder, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <p>{String(value || "غير محدد")}</p>
    </div>
  );
}

const styles = `
.campaign-wizard-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 32%),
    radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.13), transparent 30%),
    #f7f8fb;
  padding: 28px;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.campaign-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-content,
.readiness-card,
.steps-panel,
.form-panel {
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
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
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
  max-width: 780px;
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

.readiness-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.readiness-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  margin-bottom: 18px;
}

.readiness-card span {
  color: #64748b;
  font-size: 14px;
}

.readiness-card strong {
  display: block;
  font-size: 38px;
  margin-top: 4px;
  color: #0f172a;
}

.readiness-card p {
  color: #64748b;
  line-height: 1.8;
  margin: 14px 0 0;
  font-size: 14px;
}

.mini-progress,
.progress-line {
  overflow: hidden;
  background: #e5e7eb;
  border-radius: 999px;
}

.mini-progress {
  height: 9px;
  margin-top: 14px;
}

.progress-line {
  height: 8px;
  margin: 12px 0 20px;
}

.mini-progress div,
.progress-line div {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: inherit;
  transition: width 0.25s ease;
}

.wizard-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.steps-panel {
  padding: 20px;
  position: sticky;
  top: 24px;
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.steps-header span {
  color: #64748b;
  font-size: 14px;
}

.steps-header strong {
  color: #0f172a;
  font-size: 18px;
}

.steps-list {
  display: grid;
  gap: 10px;
}

.step-item {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: right;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition: 0.2s ease;
}

.step-item:hover {
  background: #f8fafc;
}

.step-item.active {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.step-item.done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.step-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #475569;
  background: #f1f5f9;
}

.step-item.active .step-icon {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.step-item.done .step-icon {
  color: #16a34a;
  background: #dcfce7;
}

.step-item strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 4px;
}

.step-item span {
  display: block;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.form-panel {
  padding: 24px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.form-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #111827, #334155);
}

.form-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  letter-spacing: -0.03em;
}

.form-title p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.step-count {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 9px 12px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
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

.field.wide,
.wide {
  grid-column: 1 / -1;
}

.field span {
  color: #334155;
  font-size: 13px;
  font-weight: 900;
}

input,
select,
textarea {
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

textarea {
  resize: vertical;
  min-height: 110px;
  line-height: 1.8;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

input::placeholder,
textarea::placeholder {
  color: #94a3b8;
}

.selection-area {
  display: grid;
  gap: 18px;
}

.selection-area h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.selection-area p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.choice-card {
  min-height: 96px;
  display: grid;
  place-items: center;
  gap: 8px;
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #475569;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 900;
  transition: 0.2s ease;
}

.choice-card:hover {
  background: #f8fafc;
}

.choice-card.selected {
  color: #2563eb;
  background: #eff6ff;
  border-color: #93c5fd;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.12);
}

.pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill {
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #475569;
  border-radius: 999px;
  padding: 11px 14px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.pill.selected {
  color: #2563eb;
  background: #eff6ff;
  border-color: #93c5fd;
}

.review-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}

.summary-card,
.generation-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.summary-header h3,
.generation-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
}

.summary-item {
  display: grid;
  gap: 5px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-item span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.summary-item p {
  margin: 0;
  color: #0f172a;
  line-height: 1.8;
  font-size: 14px;
}

.generation-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  margin-bottom: 14px;
}

.generation-card p {
  color: #64748b;
  line-height: 1.9;
  font-size: 14px;
}

.mock-output {
  margin-top: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
}

.mock-output strong {
  color: #0f172a;
}

.mock-output ul {
  margin: 12px 0;
  padding-right: 20px;
  color: #334155;
  line-height: 1.9;
  font-size: 14px;
}

.governance-note {
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 10px;
  line-height: 1.8;
  font-size: 13px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.primary-button,
.secondary-button {
  border-radius: 16px;
  padding: 12px 18px;
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
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.22);
}

.primary-button:hover {
  transform: translateY(-1px);
}

.secondary-button {
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.full {
  width: 100%;
}

@media (max-width: 1100px) {
  .choice-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .review-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 980px) {
  .campaign-wizard-page {
    padding: 18px;
  }

  .campaign-hero,
  .wizard-layout {
    grid-template-columns: 1fr;
  }

  .steps-panel {
    position: static;
  }

  .hero-content h1 {
    font-size: 28px;
  }
}

@media (max-width: 640px) {
  .form-grid,
  .choice-grid {
    grid-template-columns: 1fr;
  }

  .form-header,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
`;