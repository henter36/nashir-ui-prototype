import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Globe2,
  MessageCircle,
  Save,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Wand2,
} from "lucide-react";

const steps = [
  {
    id: "basic",
    title: "بيانات المتجر",
    subtitle: "المعلومات الأساسية التي سيُبنى عليها النظام",
    icon: Store,
  },
  {
    id: "products",
    title: "المنتجات والخدمات",
    subtitle: "ما الذي تبيعه وما الذي يميزك؟",
    icon: ShoppingBag,
  },
  {
    id: "audience",
    title: "الجمهور والهوية",
    subtitle: "تحديد العميل المستهدف ونبرة العلامة",
    icon: Target,
  },
  {
    id: "channels",
    title: "القنوات والربط",
    subtitle: "قنوات التواصل والتسويق الحالية",
    icon: Globe2,
  },
];

const businessTypes = [
  "متجر أزياء",
  "عطور وتجميل",
  "مطعم أو كافيه",
  "منتجات رقمية",
  "خدمات مهنية",
  "منتجات منزلية",
  "أطفال وهدايا",
  "أخرى",
];

const tones = ["رسمية", "ودية", "فاخرة", "شبابية", "عملية", "جريئة", "هادئة"];

const priceRanges = ["اقتصادي", "متوسط", "مرتفع", "فاخر", "متفاوت حسب المنتج"];

export default function StoreSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    storeUrl: "",
    businessType: "",
    description: "",
    category: "",
    mainProducts: "",
    priceRange: "",
    usp: "",
    targetAudience: "",
    targetMarket: "",
    brandTone: "",
    forbiddenWords: "",
    instagram: "",
    tiktok: "",
    snapchat: "",
    whatsapp: "",
    email: "",
  });

  const progress = useMemo(() => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  }, [currentStep]);

  const completedFields = useMemo(() => {
    const values = Object.values(form);
    const filled = values.filter((value) => String(value).trim().length > 0);
    return Math.round((filled.length / values.length) * 100);
  }, [form]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
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

  const saveSettings = () => {
    setSaved(true);
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <main className="store-setup-page" dir="rtl">
      <style>{styles}</style>

      <section className="setup-hero">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={16} />
            إعداد المتجر
          </div>

          <h1>بناء ملف المتجر قبل إنشاء الحملات</h1>

          <p>
            هذه الصفحة تجمع المعلومات الأساسية عن المتجر حتى تكون مخرجات الحملات
            لاحقًا أدق، أكثر ارتباطًا بالمنتج، وأقل اعتمادًا على التخمين.
          </p>

          <div className="hero-alert">
            <CircleAlert size={18} />
            <span>
              هذه شاشة واجهة فقط حاليًا. لا يوجد ربط فعلي، ولا حفظ في قاعدة
              بيانات، ولا اتصال بمنصات خارجية.
            </span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <Wand2 size={26} />
          </div>

          <div>
            <span>جاهزية الملف</span>
            <strong>{completedFields}%</strong>
          </div>

          <div className="mini-progress">
            <div style={{ width: `${completedFields}%` }} />
          </div>

          <p>
            كلما اكتمل ملف المتجر، أصبحت توصيات الحملات والمحتوى أكثر قابلية
            للتنفيذ.
          </p>
        </div>
      </section>

      <section className="setup-layout">
        <aside className="steps-panel">
          <div className="steps-header">
            <span>مراحل الإعداد</span>
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
                label="اسم المتجر"
                placeholder="مثال: متجر لمسة"
                value={form.storeName}
                onChange={(value) => updateField("storeName", value)}
              />

              <Field
                label="رابط المتجر أو الموقع"
                placeholder="https://example.com"
                value={form.storeUrl}
                onChange={(value) => updateField("storeUrl", value)}
              />

              <SelectField
                label="نوع النشاط"
                value={form.businessType}
                placeholder="اختر نوع النشاط"
                options={businessTypes}
                onChange={(value) => updateField("businessType", value)}
              />

              <TextArea
                label="وصف مختصر للمتجر"
                placeholder="اكتب وصفًا واضحًا لما يقدمه المتجر..."
                value={form.description}
                onChange={(value) => updateField("description", value)}
                wide
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="form-grid">
              <Field
                label="تصنيف المنتج أو الخدمة"
                placeholder="مثال: فساتين أطفال، عطور، قهوة مختصة"
                value={form.category}
                onChange={(value) => updateField("category", value)}
              />

              <SelectField
                label="الفئة السعرية"
                value={form.priceRange}
                placeholder="اختر الفئة السعرية"
                options={priceRanges}
                onChange={(value) => updateField("priceRange", value)}
              />

              <TextArea
                label="أهم المنتجات أو الخدمات"
                placeholder="اكتب المنتجات الرئيسية أو التصنيفات الأكثر أهمية..."
                value={form.mainProducts}
                onChange={(value) => updateField("mainProducts", value)}
                wide
              />

              <TextArea
                label="نقطة التميز"
                placeholder="ما الذي يجعل المتجر مختلفًا عن المنافسين؟"
                value={form.usp}
                onChange={(value) => updateField("usp", value)}
                wide
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-grid">
              <TextArea
                label="الجمهور المستهدف"
                placeholder="مثال: أمهات، طالبات جامعة، أصحاب مشاريع صغيرة..."
                value={form.targetAudience}
                onChange={(value) => updateField("targetAudience", value)}
                wide
              />

              <Field
                label="السوق أو المدينة المستهدفة"
                placeholder="مثال: السعودية، الرياض، الخليج"
                value={form.targetMarket}
                onChange={(value) => updateField("targetMarket", value)}
              />

              <SelectField
                label="نبرة العلامة"
                value={form.brandTone}
                placeholder="اختر نبرة التواصل"
                options={tones}
                onChange={(value) => updateField("brandTone", value)}
              />

              <TextArea
                label="كلمات أو عبارات ممنوعة"
                placeholder="أي كلمات لا ترغب باستخدامها في الإعلانات أو المحتوى"
                value={form.forbiddenWords}
                onChange={(value) => updateField("forbiddenWords", value)}
                wide
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-grid">
              <Field
                label="Instagram"
                placeholder="رابط حساب Instagram"
                value={form.instagram}
                onChange={(value) => updateField("instagram", value)}
                icon={<Globe2 size={18} />}
              />

              <Field
                label="TikTok"
                placeholder="رابط حساب TikTok"
                value={form.tiktok}
                onChange={(value) => updateField("tiktok", value)}
                icon={<Globe2 size={18} />}
              />

              <Field
                label="Snapchat"
                placeholder="رابط حساب Snapchat"
                value={form.snapchat}
                onChange={(value) => updateField("snapchat", value)}
                icon={<Globe2 size={18} />}
              />

              <Field
                label="WhatsApp"
                placeholder="رقم واتساب للتواصل"
                value={form.whatsapp}
                onChange={(value) => updateField("whatsapp", value)}
                icon={<MessageCircle size={18} />}
              />

              <Field
                label="البريد الإلكتروني"
                placeholder="name@example.com"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                wide
              />

              <div className="integration-note wide">
                <CircleAlert size={18} />
                <div>
                  <strong>تنبيه حوكمي مهم</strong>
                  <p>
                    هذه الحقول تمثل بيانات ربط ظاهرة في الواجهة فقط. أي تكامل
                    فعلي مع المنصات يحتاج لاحقًا إلى API، صلاحيات، سياسة
                    خصوصية، وموافقة مستقلة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {saved && (
            <div className="success-box">
              <CheckCircle2 size={20} />
              <span>
                تم حفظ الإعدادات محليًا في الواجهة. الحفظ الفعلي مؤجل إلى مرحلة
                الربط مع قاعدة البيانات.
              </span>
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
              <button type="button" className="primary-button" onClick={saveSettings}>
                حفظ الإعدادات
                <Save size={18} />
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, placeholder, value, onChange, icon, wide }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <div className="input-shell">
        {icon && <div className="input-icon">{icon}</div>}
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
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

const styles = `
.store-setup-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.14), transparent 34%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.12), transparent 32%),
    #f7f8fb;
  padding: 28px;
  color: #111827;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.setup-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-content,
.hero-card,
.steps-panel,
.form-panel {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(18px);
  border-radius: 28px;
}

.hero-content { padding: 30px; }

.eyebrow {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6d28d9;
  background: #f3e8ff;
  border: 1px solid #e9d5ff;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 800;
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

.hero-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-card-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  margin-bottom: 18px;
}

.hero-card span { color: #64748b; font-size: 14px; }
.hero-card strong { display: block; font-size: 38px; margin-top: 4px; color: #0f172a; }
.hero-card p { color: #64748b; line-height: 1.8; margin: 14px 0 0; font-size: 14px; }

.mini-progress,
.progress-line {
  overflow: hidden;
  background: #e5e7eb;
  border-radius: 999px;
}

.mini-progress { height: 9px; margin-top: 14px; }
.progress-line { height: 8px; margin: 12px 0 20px; }

.mini-progress div,
.progress-line div {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #2563eb);
  border-radius: inherit;
  transition: width 0.25s ease;
}

.setup-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.steps-panel { padding: 20px; position: sticky; top: 24px; }

.steps-header { display: flex; align-items: center; justify-content: space-between; }
.steps-header span { color: #64748b; font-size: 14px; }
.steps-header strong { color: #0f172a; font-size: 18px; }

.steps-list { display: grid; gap: 10px; }

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

.step-item:hover { background: #f8fafc; }
.step-item.active { background: #f5f3ff; border-color: #ddd6fe; }
.step-item.done { background: #f0fdf4; border-color: #bbf7d0; }

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

.step-item.active .step-icon { color: #fff; background: linear-gradient(135deg, #7c3aed, #2563eb); }
.step-item.done .step-icon { color: #16a34a; background: #dcfce7; }

.step-item strong { display: block; color: #0f172a; font-size: 14px; margin-bottom: 4px; }
.step-item span { display: block; color: #64748b; font-size: 12px; line-height: 1.6; }

.form-panel { padding: 24px; }

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.form-title { display: flex; align-items: center; gap: 14px; }

.form-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #111827, #334155);
}

.form-title h2 { margin: 0; color: #0f172a; font-size: 24px; letter-spacing: -0.03em; }
.form-title p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

.step-count {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 9px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
}

.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: grid; gap: 8px; }
.field.wide, .wide { grid-column: 1 / -1; }
.field span { color: #334155; font-size: 13px; font-weight: 800; }

.input-shell { position: relative; }
.input-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: grid;
  place-items: center;
}
.input-icon + input { padding-right: 44px; }

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

textarea { resize: vertical; min-height: 110px; line-height: 1.8; }
input:focus, select:focus, textarea:focus { border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12); }
input::placeholder, textarea::placeholder { color: #94a3b8; }

.integration-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 14px;
}

.integration-note strong { display: block; margin-bottom: 4px; }
.integration-note p { margin: 0; line-height: 1.8; font-size: 13px; }

.success-box {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  align-items: center;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 18px;
  padding: 13px 14px;
  font-size: 14px;
  line-height: 1.8;
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
  border: 0;
  border-radius: 16px;
  padding: 12px 18px;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button {
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.22);
}
.primary-button:hover { transform: translateY(-1px); }
.secondary-button { color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; }
.secondary-button:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 980px) {
  .store-setup-page { padding: 18px; }
  .setup-hero, .setup-layout { grid-template-columns: 1fr; }
  .steps-panel { position: static; }
  .hero-content h1 { font-size: 28px; }
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-header, .form-actions { align-items: stretch; flex-direction: column; }
  .primary-button, .secondary-button { justify-content: center; width: 100%; }
}
`;
