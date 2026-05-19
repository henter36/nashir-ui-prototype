import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Globe2,
  ImageIcon,
  Link2,
  Lock,
  Mail,
  MessageCircle,
  Package,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Upload,
  Users,
  Wand2,
} from "lucide-react";

const steps = [
  [1, "بيانات المتجر", "اسم المتجر والرابط والموقع والنشاط."],
  [2, "هوية العلامة", "الشعار والألوان والنبرة والكلمات."],
  [3, "الجمهور الافتراضي", "الجمهور المستخدم تلقائيًا في الحملات."],
  [4, "المنتجات", "المنتجات وخصائصها وأصولها."],
  [5, "القنوات", "ربط القنوات وحدود الصلاحيات."],
  [6, "السياسات", "الادعاءات والموافقات وحدود النشر."],
  [7, "الجاهزية", "ملخص النواقص والتوصيات."],
];

const integrationProviders = [
  {
    id: "instagram",
    name: "Instagram",
    description: "ربط حساب Instagram لإعداد المحتوى وقراءة حالة الربط لاحقًا.",
    connectPath: "/api/integrations/instagram/connect",
    permissions: ["قراءة الملف", "تجهيز المحتوى", "قراءة الأداء لاحقًا"],
    risk: "مشروط",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "ربط TikTok لتجهيز مخرجات الفيديو القصير وسكربتات Reels/TikTok.",
    connectPath: "/api/integrations/tiktok/connect",
    permissions: ["قراءة الملف", "تجهيز الفيديو", "اقتراح نصوص"],
    risk: "مشروط",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "ربط Snapchat لإعداد الحملات والمخرجات المناسبة للقناة.",
    connectPath: "/api/integrations/snapchat/connect",
    permissions: ["قراءة الحساب", "تجهيز محتوى", "قراءة حالة الربط"],
    risk: "مشروط",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "ربط WhatsApp Business للرسائل، مع منع الإرسال التلقائي حاليًا.",
    connectPath: "/api/integrations/whatsapp/connect",
    permissions: ["تجهيز الرسائل", "إدارة القوالب لاحقًا", "لا إرسال تلقائي"],
    risk: "مراجعة مطلوبة",
  },
  {
    id: "email",
    name: "Email",
    description: "ربط البريد لإعداد حملات Email لاحقًا دون إرسال تلقائي.",
    connectPath: "/api/integrations/email/connect",
    permissions: ["تجهيز البريد", "إدارة المسودات", "لا إرسال تلقائي"],
    risk: "مشروط",
  },
  {
    id: "google",
    name: "Google / YouTube",
    description: "ربط Google لاستخدامات مستقبلية مثل YouTube أو Google Ads.",
    connectPath: "/api/integrations/google/connect",
    permissions: ["قراءة الحساب", "تجهيز أصول", "Ads غير مفعّل"],
    risk: "غير مفعّل للإعلانات",
  },
];

const defaultForm = {
  storeName: "متجر النخبة",
  storeUrl: "https://store.example",
  hasPhysicalBranch: "نعمل لاحقًا",
  activity: "متجر إلكتروني",
  category: "عناية وجمال",
  subCategories: ["عناية بالبشرة", "منتجات طبيعية"],
  colors: "#176B2C, #F7F8F4, #1F241D",
  fonts: "IBM Plex Sans Arabic",
  tone: ["ودية", "موثوقة", "هادئة"],
  useWords: "طبيعي، موثوق، تجربة، جودة",
  avoidWords: "علاج، مضمون، الأفضل مطلقًا",
  age: "25–34",
  gender: "نساء",
  income: "متوسط",
  location: "الرياض، السعودية",
  interests: "العناية، الجمال، المنتجات الطبيعية، الهدايا",
  audiencePain: "الحاجة لمنتج موثوق وروتين بسيط وتجربة أقل عشوائية.",
  motives: ["جودة", "تجربة", "هدية"],
  productName: "سيروم عناية طبيعي",
  productUrl: "https://store.example/products/serum",
  price: "149 ر.س",
  margin: "",
  productDescription:
    "منتج عناية يومي مناسب لجمهور يبحث عن بساطة وثقة وتجربة طبيعية.",
  productFlags: ["جديد", "مناسب للهدايا", "يصلح للفيديو"],
  channels: ["Instagram", "Email", "Salla"],
  policyAnswers: {},
};

const policyItems = [
  "هل توجد عبارات ممنوعة؟",
  "هل توجد ادعاءات لا يجوز استخدامها؟",
  "هل النشاط يتطلب موافقات خاصة؟",
  "هل توجد منتجات مقيدة؟",
  "سياسة الخصومات",
  "سياسة استخدام صور العملاء",
  "سياسة الرد على التعليقات",
  "من يعتمد الحملات قبل النشر؟",
  "هل يسمح باستخدام وجوه أشخاص؟",
  "هل توجد حساسية ثقافية أو تنظيمية؟",
];

const channelOptions = [
  "Instagram",
  "TikTok",
  "Snapchat",
  "X",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "WhatsApp Business",
  "Email",
  "Google Ads",
  "Meta Ads",
  "Salla",
];

export default function StoreSetupPage({ onCreateCampaign }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [connections, setConnections] = useState({});
  const [saved, setSaved] = useState(false);

  const completion = useMemo(() => {
    const checks = [
      form.storeName,
      form.storeUrl,
      form.activity,
      form.category,
      form.subCategories.length,
      form.tone.length,
      form.age,
      form.gender,
      form.location,
      form.productName,
      form.productFlags.length,
      form.channels.length,
      Object.keys(form.policyAnswers).length >= 4,
    ];

    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [form]);

  const connectedCount = Object.values(connections).filter(
    (status) => status === "connected" || status === "pending"
  ).length;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleArray = (key, value) => {
    setForm((prev) => {
      const list = prev[key] || [];
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });
    setSaved(false);
  };

  const updatePolicy = (title, value) => {
    setForm((prev) => ({
      ...prev,
      policyAnswers: {
        ...prev.policyAnswers,
        [title]: value,
      },
    }));
    setSaved(false);
  };

  const startConnection = (provider) => {
    setConnections((prev) => ({
      ...prev,
      [provider.id]: "pending",
    }));

    window.open(provider.connectPath, "_blank", "noopener,noreferrer");
  };

  const markConnectionAsConnected = (providerId) => {
    setConnections((prev) => ({
      ...prev,
      [providerId]: "connected",
    }));
  };

  const saveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const next = () => {
    if (step < 7) setStep((current) => current + 1);
  };

  const back = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  return (
    <main className="store-os-page" dir="rtl">
      <style>{styles}</style>

      <PageTitle
        title="إعداد المتجر"
        description="استكمال بيانات المتجر والهوية والجمهور والمنتجات والقنوات قبل إنشاء الحملات."
        status="Prototype"
      />

      <section className="store-os-overview">
        <Card className="store-score-card">
          <div className="score-ring">{completion}%</div>
          <div>
            <h3>حالة اكتمال المتجر</h3>
            <p>كل خطوة مكتملة تقلل التخمين عند إنشاء الحملات والمخرجات.</p>
          </div>
        </Card>

        <Card className="warning-card">
          <CircleAlert size={20} />
          <div>
            <strong>تنبيه حوكمي</strong>
            <p>
              الربط مع المنصات هنا واجهة فقط. التنفيذ الحقيقي يحتاج Backend آمن،
              OAuth state، callback، وتخزين مشفّر للتوكنات.
            </p>
          </div>
        </Card>

        <Card className="quick-card">
          <Globe2 size={22} />
          <div>
            <strong>{connectedCount}</strong>
            <span>قنوات بانتظار الربط أو مرتبطة تجريبيًا</span>
          </div>
        </Card>
      </section>

      <div className="store-os-layout">
        <aside className="steps-panel">
          <StepTabs steps={steps} step={step} setStep={setStep} />
        </aside>

        <section className="screen-panel">
          {step === 1 && (
            <Card>
              <SectionHeader
                icon={Store}
                title="الخطوة 1: بيانات المتجر"
                description="اسم المتجر والرابط والموقع والنشاط والتصنيفات الأساسية."
              />

              <div className="form-grid">
                <Field
                  label="اسم المتجر"
                  value={form.storeName}
                  onChange={(value) => update("storeName", value)}
                />
                <Field
                  label="رابط المتجر"
                  value={form.storeUrl}
                  onChange={(value) => update("storeUrl", value)}
                />
                <ChoiceGroup
                  title="هل يوجد فرع فعلي؟"
                  options={["نعم", "لا", "نعمل لاحقًا"]}
                  selected={form.hasPhysicalBranch}
                  setSelected={(value) => update("hasPhysicalBranch", value)}
                />
                <ChoiceGroup
                  title="نوع النشاط"
                  options={[
                    "متجر إلكتروني",
                    "فرع فعلي",
                    "خدمة",
                    "مطعم/كافيه",
                    "تعليم",
                    "أزياء",
                    "تجميل",
                    "عطور",
                  ]}
                  selected={form.activity}
                  setSelected={(value) => update("activity", value)}
                />
                <ChoiceGroup
                  title="تصنيف النشاط الرئيسي"
                  options={[
                    "عناية وجمال",
                    "أزياء",
                    "عطور",
                    "أغذية",
                    "إلكترونيات",
                    "خدمات",
                    "تعليم",
                    "هدايا",
                  ]}
                  selected={form.category}
                  setSelected={(value) => update("category", value)}
                />
                <MultiChoice
                  title="التصنيفات الفرعية"
                  options={[
                    "عناية بالبشرة",
                    "عناية بالشعر",
                    "منتجات طبيعية",
                    "مكياج",
                    "عطور",
                    "هدايا",
                    "اشتراكات",
                  ]}
                  selected={form.subCategories}
                  setSelected={(value) => update("subCategories", value)}
                />
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <SectionHeader
                icon={Sparkles}
                title="الخطوة 2: هوية العلامة التجارية"
                description="الشعار، الألوان، النبرة، الكلمات المفضلة والممنوعة."
              />

              <Notice tone="amber">
                غياب هوية العلامة يجعل المخرجات عامة وضعيفة، لذلك يجب تثبيت
                النبرة والكلمات قبل حملات V1.
              </Notice>

              <div className="form-grid three">
                <UploadBox title="شعار المتجر" />
                <Field
                  label="ألوان العلامة التجارية"
                  value={form.colors}
                  onChange={(value) => update("colors", value)}
                />
                <Field
                  label="الخطوط المفضلة"
                  value={form.fonts}
                  onChange={(value) => update("fonts", value)}
                />
              </div>

              <MultiChoice
                title="نبرة العلامة التجارية"
                options={[
                  "رسمية",
                  "ودية",
                  "فاخرة",
                  "شبابية",
                  "جريئة",
                  "هادئة",
                  "تعليمية",
                  "سعودية/محلية",
                  "عالمية",
                  "موثوقة",
                ]}
                selected={form.tone}
                setSelected={(value) => update("tone", value)}
              />

              <div className="form-grid">
                <TextArea
                  label="كلمات يجب استخدامها"
                  value={form.useWords}
                  onChange={(value) => update("useWords", value)}
                />
                <TextArea
                  label="كلمات يجب تجنبها"
                  value={form.avoidWords}
                  onChange={(value) => update("avoidWords", value)}
                />
                <UploadBox title="أمثلة على منشورات سابقة ناجحة" />
                <UploadBox title="أمثلة على تصاميم أو حملات تعجب العميل" />
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <SectionHeader
                icon={Users}
                title="الخطوة 3: الجمهور المستهدف الافتراضي"
                description="اختيارات الجمهور التي يرثها معالج الحملة تلقائيًا."
              />

              <div className="form-grid three">
                <ChoiceGroup
                  title="الفئة العمرية"
                  options={["13–17", "18–24", "25–34", "35–44", "45–54", "55+"]}
                  selected={form.age}
                  setSelected={(value) => update("age", value)}
                />
                <ChoiceGroup
                  title="الجنس"
                  options={["رجال", "نساء", "الجميع"]}
                  selected={form.gender}
                  setSelected={(value) => update("gender", value)}
                />
                <ChoiceGroup
                  title="مستوى الدخل التقريبي"
                  options={["اقتصادي", "متوسط", "مرتفع", "فاخر"]}
                  selected={form.income}
                  setSelected={(value) => update("income", value)}
                />
              </div>

              <div className="form-grid">
                <Field
                  label="الموقع الجغرافي"
                  value={form.location}
                  onChange={(value) => update("location", value)}
                />
                <Field
                  label="اهتمامات الجمهور"
                  value={form.interests}
                  onChange={(value) => update("interests", value)}
                />
                <TextArea
                  label="مشاكل الجمهور التي يحلها المنتج"
                  value={form.audiencePain}
                  onChange={(value) => update("audiencePain", value)}
                />
                <MultiChoice
                  title="دوافع الشراء"
                  options={["سعر", "جودة", "سرعة", "هدية", "مناسبة", "رفاهية", "ضرورة", "تجربة"]}
                  selected={form.motives}
                  setSelected={(value) => update("motives", value)}
                />
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <SectionHeader
                icon={Package}
                title="الخطوة 4: المنتجات والخدمات"
                description="إضافة المنتج، الرابط، السعر، الصور، والخصائص التسويقية."
              />

              <Notice tone="amber">
                هامش الربح اختياري وحساس ولا يجب جعله إلزاميًا في النسخة الأولى.
              </Notice>

              <div className="form-grid">
                <Field
                  label="اسم المنتج"
                  value={form.productName}
                  onChange={(value) => update("productName", value)}
                />
                <Field
                  label="رابط المنتج"
                  value={form.productUrl}
                  onChange={(value) => update("productUrl", value)}
                />
                <Field
                  label="السعر"
                  value={form.price}
                  onChange={(value) => update("price", value)}
                />
                <UploadBox title="صور المنتج" />
                <Field
                  label="هامش الربح التقريبي - اختياري"
                  value={form.margin}
                  placeholder="اختياري"
                  onChange={(value) => update("margin", value)}
                />
                <TextArea
                  label="وصف المنتج ومميزاته"
                  value={form.productDescription}
                  onChange={(value) => update("productDescription", value)}
                />
              </div>

              <MultiChoice
                title="خصائص المنتج"
                options={[
                  "موسمي",
                  "مخزون كبير",
                  "جديد",
                  "الأكثر مبيعًا",
                  "مناسب للهدايا",
                  "يحتاج شرحًا",
                  "يصلح للفيديو",
                ]}
                selected={form.productFlags}
                setSelected={(value) => update("productFlags", value)}
              />
            </Card>
          )}

          {step === 5 && (
            <Card>
              <SectionHeader
                icon={Globe2}
                title="الخطوة 5: الربط مع القنوات والمنصات"
                description="تفعيل القنوات، تحديد الصلاحيات، وبدء الربط عبر صفحة موافقة المنصة."
              />

              <Notice tone="red">
                النشر التلقائي الكامل غير مناسب في البداية. المسار الآمن: ربط
                الحساب ← توليد مسودات ← مراجعة بشرية ← نشر أو إرسال يدوي.
              </Notice>

              <MultiChoice
                title="القنوات المستخدمة"
                options={channelOptions}
                selected={form.channels}
                setSelected={(value) => update("channels", value)}
              />

              <div className="integration-grid">
                {integrationProviders.map((provider) => {
                  const status = connections[provider.id] || "disconnected";
                  return (
                    <IntegrationCard
                      key={provider.id}
                      provider={provider}
                      status={status}
                      onConnect={() => startConnection(provider)}
                      onMockSuccess={() => markConnectionAsConnected(provider.id)}
                    />
                  );
                })}
              </div>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <SectionHeader
                icon={ShieldCheck}
                title="الخطوة 6: قيود وتشريعات وسياسات"
                description="تثبيت قيود الادعاءات، الموافقات، وحدود النشر قبل التوليد."
              />

              <div className="policy-grid">
                {policyItems.map((item) => (
                  <PolicyRow
                    key={item}
                    title={item}
                    value={form.policyAnswers[item] || "بحاجة مراجعة"}
                    onChange={(value) => updatePolicy(item, value)}
                  />
                ))}
              </div>
            </Card>
          )}

          {step === 7 && (
            <div className="readiness-grid">
              <Card>
                <SectionHeader
                  icon={FileCheck2}
                  title="الخطوة 7: ملخص جاهزية المتجر"
                  description="مؤشرات مختصرة قبل بدء أول حملة."
                />

                <div className="metrics-grid">
                  <Metric title="اكتمال الملف التجاري" value={`${completion}%`} />
                  <Metric title="القنوات المحددة" value={form.channels.length} />
                  <Metric title="الربط التجريبي" value={connectedCount} />
                  <Metric title="المنتجات المضافة" value="1" />
                  <Metric title="جودة الهوية" value="جيدة" tone="green" />
                  <Metric title="جاهزية الحملات" value={completion >= 75 ? "جيدة" : "ناقصة"} tone={completion >= 75 ? "green" : "amber"} />
                </div>
              </Card>

              <Card className="recommendation-card">
                <h3>توصيات قبل البدء</h3>
                <div className="recommendation-list">
                  <div>أضف صور المنتجات قبل أول حملة.</div>
                  <div>ثبّت قيود الادعاءات قبل التوليد.</div>
                  <div>ابدأ بقناة أو قناتين فقط.</div>
                  <div>لا تفعّل النشر التلقائي قبل Audit Log وصلاحيات.</div>
                </div>
                <Button onClick={onCreateCampaign}>إنشاء أول حملة</Button>
              </Card>
            </div>
          )}
        </section>

        <aside className="smart-panel">
          <SmartBox step={step} />
        </aside>
      </div>

      <Footer
        step={step}
        total={7}
        back={back}
        next={next}
        nextLabel={step < 7 ? "التالي" : "إنهاء الإعداد"}
        saveDraft={saveDraft}
      />

      {saved && (
        <div className="saved-toast">
          <CheckCircle2 size={18} />
          تم حفظ المسودة محليًا داخل الواجهة فقط.
        </div>
      )}
    </main>
  );
}

function PageTitle({ title, description, status }) {
  return (
    <section className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {status ? <Badge tone="blue">{status}</Badge> : null}
    </section>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Button({ children, onClick, variant = "primary" }) {
  return (
    <button type="button" onClick={onClick} className={`button ${variant}`}>
      {children}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="section-header">
      <div className="section-icon">
        <Icon size={22} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StepTabs({ steps, step, setStep }) {
  return (
    <div className="step-tabs">
      {steps.map(([id, title, desc]) => {
        const state = id < step ? "done" : id === step ? "current" : "future";
        return (
          <button
            key={id}
            type="button"
            onClick={() => setStep(id)}
            className={`step-tab ${state}`}
          >
            <div className="step-number">{state === "done" ? "✓" : id}</div>
            <div>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, value, placeholder = "", onChange }) {
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

function TextArea({ label, value, placeholder = "", onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
      />
    </label>
  );
}

function ChoiceGroup({ title, options, selected, setSelected }) {
  return (
    <div className="choice-block">
      <h4>{title}</h4>
      <div className="choice-list">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={`choice ${selected === item ? "selected" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({ title, options, selected, setSelected }) {
  const toggle = (item) => {
    setSelected(
      selected.includes(item)
        ? selected.filter((value) => value !== item)
        : [...selected, item]
    );
  };

  return (
    <div className="choice-block wide">
      <h4>{title}</h4>
      <div className="choice-list">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={`choice ${selected.includes(item) ? "selected" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadBox({ title }) {
  return (
    <div className="upload-box">
      <Upload size={22} />
      <strong>{title}</strong>
      <span>إرفاق صور / فيديو / كتابة</span>
      <p>اسحب الملفات أو أضف روابط أو نصوصًا مرجعية.</p>
    </div>
  );
}

function Notice({ children, tone = "amber" }) {
  return <div className={`notice ${tone}`}>{children}</div>;
}

function IntegrationCard({ provider, status, onConnect, onMockSuccess }) {
  return (
    <article className="integration-card">
      <div className="integration-head">
        <div>
          <h4>{provider.name}</h4>
          <p>{provider.description}</p>
        </div>
        <ConnectionStatus status={status} />
      </div>

      <div className="permission-list">
        {provider.permissions.map((permission) => (
          <span key={permission}>{permission}</span>
        ))}
      </div>

      <div className="integration-actions">
        <button type="button" className="connect-button" onClick={onConnect}>
          <ExternalLink size={16} />
          ربط الحساب
        </button>
        <button type="button" className="secondary-connect-button" onClick={onMockSuccess}>
          محاكاة نجاح الربط
        </button>
      </div>

      <div className="integration-warning">
        <Lock size={15} />
        <span>
          الربط يفتح مسار Backend للموافقة. لا تحفظ tokens أو client_secret داخل React.
        </span>
      </div>
    </article>
  );
}

function ConnectionStatus({ status }) {
  const label =
    status === "pending"
      ? "بانتظار الموافقة"
      : status === "connected"
      ? "مرتبط"
      : "غير مرتبط";

  return <span className={`connection-status ${status}`}>{label}</span>;
}

function PolicyRow({ title, value, onChange }) {
  return (
    <div className="policy-row">
      <strong>{title}</strong>
      <div>
        {["نعم", "لا", "بحاجة مراجعة"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={value === item ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ title, value, tone = "green" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SmartBox({ step }) {
  const tips = {
    1: ["حدد مناطق البيع بدقة.", "رابط خرائط Google مهم للحملات المحلية."],
    2: ["غياب الهوية يجعل المخرجات عامة.", "الكلمات الممنوعة تحمي العلامة."],
    3: ["الجمهور الافتراضي يجب أن يكون قابلًا لإعادة الاستخدام.", "دوافع الشراء متعددة غالبًا."],
    4: ["هامش الربح اختياري وحساس.", "المنتجات المناسبة للفيديو تستحق أولوية."],
    5: ["لا تفعل النشر التلقائي مبكرًا.", "اجعل النشر بعد مراجعة بشرية."],
    6: ["هذه الخطوة تحمي النظام والعميل.", "أي حساسية تنظيمية ترفع مستوى المراجعة."],
    7: ["ابدأ بحملة منتج واحد.", "لا تتوسع قبل اكتمال الصور والقيود."],
  };

  return (
    <Card className="smart-box">
      <div className="smart-title">
        <Wand2 size={20} />
        <h3>توصيات ذكية</h3>
      </div>
      <div className="tips-list">
        {(tips[step] || []).map((tip, index) => (
          <div key={tip} className="tip">
            <span>{index + 1}</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Footer({ step, total, back, next, nextLabel, saveDraft }) {
  return (
    <footer className="footer-bar">
      <Button variant="secondary" onClick={back}>
        <ArrowRight size={16} />
        رجوع
      </Button>

      <div className="footer-progress">
        <strong>
          الخطوة {step} من {total}
        </strong>
        <span>
          <i style={{ width: `${(step / total) * 100}%` }} />
        </span>
      </div>

      <div className="footer-actions">
        <Button variant="secondary" onClick={saveDraft}>
          <Save size={16} />
          حفظ كمسودة
        </Button>
        <Button onClick={next}>
          {nextLabel}
          {step < total ? <ArrowLeft size={16} /> : <CheckCircle2 size={16} />}
        </Button>
      </div>
    </footer>
  );
}

const styles = `
.store-os-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.05), transparent 30%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 8px 0 0;
  color: #6f746b;
  line-height: 1.8;
}

.card {
  background: #ffffff;
  border: 1px solid #e4e7df;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.badge {
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid;
}

.badge.green { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
.badge.amber { color: #92400e; background: #fffbeb; border-color: #fde68a; }
.badge.red { color: #991b1b; background: #fef2f2; border-color: #fecaca; }
.badge.blue { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
.badge.neutral { color: #475569; background: #f8fafc; border-color: #e2e8f0; }

.button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.18s ease;
}

.button.primary {
  border: 0;
  color: #fff;
  background: #176b2c;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.button.secondary {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.store-os-overview {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 280px;
  gap: 14px;
  margin-bottom: 16px;
}

.store-score-card,
.warning-card,
.quick-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.score-ring {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  border: 8px solid #176b2c;
  box-shadow: inset 0 0 0 6px #eef7e9;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 950;
  background: #fff;
  flex: 0 0 auto;
}

.store-score-card h3,
.quick-card strong {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
}

.store-score-card p,
.quick-card span,
.warning-card p {
  margin: 6px 0 0;
  color: #6f746b;
  font-size: 13px;
  line-height: 1.7;
}

.warning-card {
  color: #92400e;
  background: #fff7e6;
  border-color: #fde68a;
}

.store-os-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.steps-panel,
.smart-panel {
  position: sticky;
  top: 96px;
}

.step-tabs {
  display: grid;
  gap: 10px;
}

.step-tab {
  width: 100%;
  min-height: 76px;
  border-radius: 18px;
  border: 1px solid #e4e7df;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.step-tab.current {
  border-color: #176b2c;
  background: #eef7e9;
  box-shadow: 0 0 0 4px #eef7e9;
}

.step-tab.done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.step-number {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  background: #176b2c;
  font-size: 13px;
  font-weight: 950;
  flex: 0 0 auto;
}

.step-tab.future .step-number {
  color: #64748b;
  background: #f1f5f9;
}

.step-tab strong {
  display: block;
  font-size: 14px;
}

.step-tab span {
  display: block;
  margin-top: 3px;
  color: #6f746b;
  line-height: 1.5;
  font-size: 11px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e4e7df;
}

.section-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: #176b2c;
  flex: 0 0 auto;
}

.section-header h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.03em;
}

.section-header p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.form-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 8px;
}

.field span,
.choice-block h4 {
  margin: 0;
  color: #1f241d;
  font-size: 13px;
  font-weight: 950;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  background: #fff;
  outline: none;
  padding: 13px 14px;
  color: #1f241d;
  font-family: inherit;
  font-size: 14px;
}

.field textarea {
  min-height: 128px;
  resize: vertical;
  line-height: 1.8;
}

.choice-block {
  display: grid;
  gap: 10px;
}

.choice-block.wide {
  grid-column: 1 / -1;
  margin-top: 16px;
}

.choice-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice {
  min-height: 38px;
  border-radius: 16px;
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
  padding: 0 13px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

.choice.selected {
  border-color: #176b2c;
  color: #176b2c;
  background: #eef7e9;
}

.upload-box {
  min-height: 150px;
  border: 1px dashed #cbd5e1;
  background: #f7f8f4;
  border-radius: 22px;
  padding: 16px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #6f746b;
}

.upload-box strong {
  color: #1f241d;
}

.upload-box p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

.notice {
  border-radius: 18px;
  padding: 14px;
  margin: 14px 0;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.notice.amber { color: #92400e; background: #fff7e6; border: 1px solid #fde68a; }
.notice.red { color: #991b1b; background: #feecec; border: 1px solid #fecaca; }

.integration-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.integration-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 24px;
  padding: 16px;
}

.integration-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.integration-card h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 950;
}

.integration-card p {
  margin: 6px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
}

.connection-status {
  min-height: 30px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border: 1px solid;
  font-size: 12px;
  font-weight: 950;
}

.connection-status.disconnected { color: #475569; background: #f8fafc; border-color: #e2e8f0; }
.connection-status.pending { color: #92400e; background: #fffbeb; border-color: #fde68a; }
.connection-status.connected { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.permission-list span {
  min-height: 28px;
  border-radius: 999px;
  background: #f7f8f4;
  color: #6f746b;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.integration-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 14px;
}

.connect-button,
.secondary-connect-button {
  min-height: 40px;
  border-radius: 16px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
}

.connect-button {
  border: 0;
  color: #fff;
  background: #176b2c;
}

.secondary-connect-button {
  border: 1px solid #e4e7df;
  color: #1f241d;
  background: #fff;
}

.integration-warning {
  margin-top: 12px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 16px;
  padding: 11px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.policy-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 14px;
}

.policy-row strong {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}

.policy-row div {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.policy-row button {
  min-height: 32px;
  border-radius: 999px;
  border: 1px solid #e4e7df;
  background: #fff;
  padding: 0 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.policy-row button.active {
  border-color: #176b2c;
  color: #176b2c;
  background: #eef7e9;
}

.readiness-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric {
  border-radius: 22px;
  border: 1px solid;
  padding: 16px;
}

.metric.green { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
.metric.amber { color: #92400e; background: #fffbeb; border-color: #fde68a; }

.metric span {
  display: block;
  font-size: 12px;
  font-weight: 900;
}

.metric strong {
  display: block;
  margin-top: 9px;
  font-size: 26px;
  color: #1f241d;
}

.recommendation-card {
  background: #eef7e9;
}

.recommendation-card h3 {
  margin: 0;
  color: #176b2c;
}

.recommendation-list {
  display: grid;
  gap: 10px;
  margin: 16px 0;
}

.recommendation-list div {
  border-radius: 16px;
  background: #fff;
  padding: 12px;
  line-height: 1.7;
  font-size: 13px;
  font-weight: 800;
}

.smart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b2c;
}

.smart-title h3 {
  margin: 0;
}

.tips-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.tip {
  display: flex;
  gap: 10px;
  border-radius: 16px;
  background: #f7f8f4;
  padding: 12px;
}

.tip span {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #176b2c;
  font-size: 12px;
  font-weight: 950;
  flex: 0 0 auto;
}

.tip p {
  margin: 0;
  color: #1f241d;
  line-height: 1.7;
  font-size: 13px;
  font-weight: 800;
}

.footer-bar {
  position: sticky;
  bottom: 16px;
  z-index: 10;
  margin-top: 18px;
  border: 1px solid #e4e7df;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.10);
  border-radius: 24px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto minmax(240px, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.footer-progress {
  min-height: 44px;
  border-radius: 16px;
  background: #eef7e9;
  color: #176b2c;
  padding: 8px 14px;
  display: grid;
  gap: 7px;
  text-align: center;
  font-size: 13px;
}

.footer-progress span {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: #d8ead3;
}

.footer-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #176b2c;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saved-toast {
  position: fixed;
  left: 22px;
  bottom: 98px;
  min-height: 44px;
  border-radius: 16px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 1280px) {
  .store-os-overview,
  .store-os-layout,
  .readiness-grid {
    grid-template-columns: 1fr;
  }

  .steps-panel,
  .smart-panel {
    position: static;
  }

  .step-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .store-os-page {
    padding: 16px;
  }

  .page-title,
  .footer-bar,
  .footer-actions {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .form-grid,
  .form-grid.three,
  .integration-grid,
  .policy-grid,
  .metrics-grid,
  .step-tabs {
    grid-template-columns: 1fr;
  }

  .button,
  .connect-button,
  .secondary-connect-button {
    width: 100%;
  }
}
`;
