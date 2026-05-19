import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Globe2,
  ImageIcon,
  Mail,
  Megaphone,
  MessageCircle,
  PlayCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  Wand2,
} from "lucide-react";

const steps = [
  [1, "أساسيات الحملة", "الهدف، المنتجات، النوع، الأولوية، التاريخ، الميزانية."],
  [2, "الأصول المتاحة", "الأصول المحفوظة والجديدة وفحص الجودة."],
  [3, "العرض والرسالة", "العرض، سبب الشراء الآن، الاعتراضات، الإثباتات."],
  [4, "الجمهور والقنوات", "وراثة جمهور المتجر مع تعديل ما يخص الحملة."],
  [5, "المخرجات المطلوبة", "النصوص، التصميم، الفيديو، المقاسات، النسخ."],
  [6, "Brief + الجاهزية", "ملخص كامل ومؤشر جاهزية قبل التوليد."],
];

const tips = {
  1: [
    "ابدأ بهدف واحد واضح للحملة حتى لا تصبح المخرجات مشتتة.",
    "لا توسّع القنوات قبل ضبط الرسالة والعرض وسبب الشراء الآن.",
  ],
  2: [
    "الأصول الضعيفة ترفع تكلفة التوليد والمراجعة وتقلل جودة الإعلانات.",
    "استخدم أصول المتجر المحفوظة قبل رفع أصول جديدة لتقليل التكرار.",
  ],
  3: [
    "الرسالة القوية تحتاج عرضًا واضحًا وسبب شراء الآن وإثبات ثقة.",
    "راجع أي ادعاء تسويقي قبل اعتماده حتى لا يتحول لمخاطر سمعة أو امتثال.",
  ],
  4: [
    "استخدم جمهور المتجر الافتراضي كبداية، ثم عدّل ما يخص الحملة فقط.",
    "اختر قناة أو قناتين كبداية إذا كانت الأصول أو الرسالة غير مكتملة.",
  ],
  5: [
    "لا تطلب كل المخرجات دفعة واحدة؛ ابدأ بالمخرجات الأقرب للهدف.",
    "الفيديو القصير يحتاج أصولًا بصرية واضحة ورسالة مختصرة جدًا.",
  ],
  6: [
    "لا تولّد قبل وصول الجاهزية إلى حد آمن.",
    "كل المخرجات الناتجة يجب أن تمر عبر المراجعة البشرية قبل النشر أو الإرسال.",
  ],
};

const goalOptions = [
  "زيادة المبيعات",
  "إطلاق منتج جديد",
  "تصريف مخزون",
  "رفع الوعي",
  "زيادة المتابعين",
  "جمع عملاء محتملين",
  "زيارات للمتجر الإلكتروني",
  "زيارات للفرع",
  "إعادة استهداف",
  "حملة موسمية",
  "حملة عروض",
];

const campaignTypes = [
  "محتوى عضوي",
  "إعلان مدفوع",
  "حملة مؤثرين",
  "WhatsApp",
  "Email-SMS",
  "متعددة القنوات",
];

const occasions = [
  "رمضان",
  "العيد",
  "اليوم الوطني",
  "الجمعة البيضاء",
  "العودة للمدارس",
  "موسم الشتاء",
  "تصفية",
  "إطلاق منتج",
  "أخرى",
];

const audienceStages = [
  "لا يعرف المنتج",
  "يعرف المشكلة فقط",
  "يعرف العلامة ولم يشترِ",
  "يعرفها ولم يشترِ",
  "عميل سابق",
  "عميل متكرر",
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
];

const outputOptions = [
  "Caption",
  "Story",
  "Carousel",
  "Reel قصير",
  "سكريبت فيديو",
  "Email",
  "رسالة WhatsApp",
  "إعلانات قصيرة",
  "Hashtags",
  "خطة نشر",
];

const objectionsOptions = ["السعر مرتفع", "لا يعرف العلامة", "لا يثق بالنتيجة", "يقارن بالمنافس", "لا يحتاج الآن", "يحتاج شرحًا"];
const proofsOptions = ["تقييمات عملاء", "ضمان", "سياسة استرجاع", "صور قبل/بعد", "شهادات جودة", "تجربة مجانية"];

export default function CampaignWizardPage() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [goal, setGoal] = useState("زيادة المبيعات");
  const [campaignType, setCampaignType] = useState("متعددة القنوات");
  const [priority, setPriority] = useState("مهمة");
  const [occasion, setOccasion] = useState("إطلاق منتج");
  const [offer, setOffer] = useState("خصم");
  const [cta, setCta] = useState("اطلب الآن");
  const [audienceMode, setAudienceMode] = useState("استخدم جمهور المتجر الافتراضي");
  const [audienceStage, setAudienceStage] = useState("يعرفها ولم يشترِ");
  const [language, setLanguage] = useState("العربية");
  const [channels, setChannels] = useState(["Instagram", "TikTok", "Email"]);
  const [outputs, setOutputs] = useState(["Caption", "Story", "Carousel", "Reel قصير"]);
  const [copies, setCopies] = useState("3 نسخ");
  const [videoDuration, setVideoDuration] = useState("15 ثانية");
  const [style, setStyle] = useState("مباشر");
  const [objections, setObjections] = useState(["السعر مرتفع", "لا يعرف العلامة"]);
  const [proofs, setProofs] = useState(["تقييمات عملاء", "ضمان", "سياسة استرجاع"]);

  const readiness = useMemo(() => {
    let score = 0;
    if (goal) score += 12;
    if (campaignType) score += 10;
    if (offer) score += 10;
    if (cta) score += 8;
    if (audienceMode) score += 8;
    if (audienceStage) score += 8;
    if (channels.length) score += Math.min(14, channels.length * 4);
    if (outputs.length) score += Math.min(14, outputs.length * 3);
    if (objections.length) score += 8;
    if (proofs.length) score += 8;
    return Math.min(100, score);
  }, [goal, campaignType, offer, cta, audienceMode, audienceStage, channels, outputs, objections, proofs]);

  const canGenerate = readiness >= 60;

  const briefRows = [
    ["اسم الحملة", "حملة عطر X - مارس"],
    ["الهدف", goal],
    ["المنتج", "عطر X، باقة العطور الموسمية"],
    ["الجمهور", `${audienceMode} · ${audienceStage}`],
    ["القنوات", channels.join("، ")],
    ["الرسالة الأساسية", "فرصة محدودة لتجربة عطر فاخر بسعر مباشر."],
    ["العرض", offer],
    ["الميزانية", "5,000 ريال"],
    ["التواريخ", "10 مارس → 15 مارس"],
    ["المخرجات", outputs.join("، ")],
    ["الأصول", "3 صور، 1 فيديو، شعار، تقييمات عملاء"],
  ];

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const back = () => setStep((prev) => Math.max(prev - 1, 1));
  const saveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="campaign-ref-page" dir="rtl">
      <style>{styles}</style>

      <PageTitle
        title="إنشاء حملة"
        description="معالج تفصيلي لإعداد الحملة قبل التوليد، مع فحص الجاهزية والحوكمة قبل أي مخرجات."
        status="Prototype"
      />

      <section className="wizard-shell">
        <aside className="wizard-left">
          <StepTabs steps={steps} step={step} setStep={setStep} />
          <SmartBox title="توصيات ذكية" tips={tips[step] || []} />
        </aside>

        <section className="wizard-main">
          {step === 1 && (
            <div className="step-layout with-side">
              <Card>
                <h3>الخطوة 1: أساسيات الحملة</h3>
                <p className="card-subtitle">حدد هدف الحملة، نوعها، الأولوية، الفترة والميزانية.</p>

                <div className="form-grid two">
                  <Field label="اسم الحملة" value="حملة عطر X - مارس" />

                  <ChoiceGroup title="هدف الحملة" options={goalOptions} selected={goal} setSelected={setGoal} />

                  <label className="field">
                    <span>المنتج / المنتجات المستهدفة</span>
                    <select>
                      <option>عطر X</option>
                      <option>باقة العطور الموسمية</option>
                      <option>منتج العناية اليومي</option>
                    </select>
                    <small>Picker من قائمة المتجر — لا إدخال يدوي.</small>
                  </label>

                  <ChoiceGroup title="نوع الحملة" options={campaignTypes} selected={campaignType} setSelected={setCampaignType} />

                  <ChoiceGroup title="أولوية الحملة" options={["عادية", "مهمة", "عاجلة"]} selected={priority} setSelected={setPriority} />

                  <Field label="تاريخ البداية" value="2025-03-10" icon={<CalendarDays size={17} />} />
                  <Field label="تاريخ النهاية" value="2025-03-15" icon={<CalendarDays size={17} />} />
                  <Field label="الميزانية" value="5,000 ريال" />

                  <ChoiceGroup title="هل توجد مناسبة مرتبطة؟" options={occasions} selected={occasion} setSelected={setOccasion} wide />
                </div>
              </Card>

              <SmartBox
                title="توصية تشغيلية"
                tips={[
                  "بناءً على بيانات المنتج، الهدف الأنسب هو زيادة التحويلات وليس رفع الوعي.",
                  "لا توسّع القنوات قبل ضبط الرسالة والعرض وسبب الشراء الآن.",
                ]}
              />
            </div>
          )}

          {step === 2 && (
            <div className="step-layout with-side">
              <div className="stack">
                <Card>
                  <h3>الخطوة 2: الأصول المتاحة</h3>
                  <p className="card-subtitle">حدد الأصول الحالية والجديدة، ثم راجع جودة الملفات قبل التوليد.</p>

                  <div className="asset-strip">
                    <button type="button" className="secondary-button">استخدم أصول المتجر المحفوظة</button>
                    <p>يجلب الشعار والصور والهوية المحفوظة تلقائيًا.</p>
                  </div>

                  <div className="upload-grid">
                    <UploadBox title="صور المنتج" />
                    <UploadBox title="فيديوهات المنتج" />
                    <UploadBox title="صور العملاء / تقييمات مصورة" />
                    <UploadBox title="ملفات الهوية الإضافية" />
                    <UploadBox title="PDF أو كتالوج" />
                    <UploadBox title="روابط منشورات سابقة ومنافسين" />
                  </div>

                  <div className="form-grid two mt">
                    <TextArea label="أمثلة على نمط مطلوب" placeholder="ضع أمثلة أو روابط مرجعية..." />
                    <TextArea label="تعليمات خاصة للتصميم" placeholder="ما الذي يجب أن يظهر في التصميم؟" />
                    <TextArea label="عناصر ممنوعة في التصميم" placeholder="ألوان، رموز، عبارات، أشخاص، ادعاءات..." wide />
                  </div>
                </Card>

                <Card>
                  <h3>فحص جودة تلقائي للأصول</h3>
                  <div className="quality-table">
                    {[
                      ["وضوح الصورة", "✅"],
                      ["المنتج ظاهر", "✅"],
                      ["الخلفية مناسبة", "⚠️ تحتاج إزالة"],
                      ["المقاس مناسب", "✅"],
                      ["تصلح للإعلان", "✅"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <strong>{label}</strong>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <SmartBox
                title="لماذا الأصول قبل المخرجات؟"
                tips={[
                  "المخرجات يجب أن تُبنى على ما هو متاح فعليًا من صور وفيديو وهوية.",
                  "ضعف الأصول يرفع تكلفة التوليد والمراجعة ويقلل جودة الإعلانات.",
                ]}
              />
            </div>
          )}

          {step === 3 && (
            <div className="step-layout with-side">
              <Card>
                <h3>الخطوة 3: العرض والرسالة</h3>
                <p className="card-subtitle">حدد العرض، سبب الشراء الآن، الاعتراضات، والإثباتات.</p>

                <div className="form-grid two">
                  <ChoiceGroup title="نوع العرض" options={["خصم", "هدية", "توصيل مجاني", "عرض محدود", "باقة", "بدون عرض"]} selected={offer} setSelected={setOffer} />
                  <ChoiceGroup title="دعوة الإجراء CTA" options={["اطلب الآن", "تسوق المجموعة", "اكتشف العرض", "احجز الآن", "تواصل معنا"]} selected={cta} setSelected={setCta} />
                  <TextArea label="سبب الشراء الآن" value="العرض متاح لفترة محدودة والكمية محدودة." />
                  <TextArea label="الرسالة الأساسية" value="فرصة محدودة لتجربة عطر فاخر بسعر مباشر." />
                  <MultiChoice title="الاعتراضات المتوقعة" options={objectionsOptions} selected={objections} setSelected={setObjections} wide />
                  <MultiChoice title="إثباتات الثقة" options={proofsOptions} selected={proofs} setSelected={setProofs} wide />
                </div>

                <div className="warning-box">
                  <CircleAlert size={18} />
                  <p>أي ادعاء مثل “الأفضل” أو “مضمون” يحتاج مراجعة قبل اعتماده في المخرجات.</p>
                </div>
              </Card>

              <SmartBox title="فحص الرسالة" tips={["العرض بدون سبب شراء الآن يضعف التحويل.", "الإثباتات تقلل الاعتراضات وتزيد الثقة."]} />
            </div>
          )}

          {step === 4 && (
            <div className="step-layout with-side">
              <Card>
                <h3>الخطوة 4: الجمهور والقنوات</h3>
                <p className="card-subtitle">ابدأ من جمهور المتجر الافتراضي ثم خصص الحملة.</p>

                <div className="form-grid two">
                  <ChoiceGroup title="وضع الجمهور" options={["استخدم جمهور المتجر الافتراضي", "خصص جمهور الحملة", "جمهور إعادة استهداف"]} selected={audienceMode} setSelected={setAudienceMode} />
                  <ChoiceGroup title="مرحلة الجمهور" options={audienceStages} selected={audienceStage} setSelected={setAudienceStage} />
                  <ChoiceGroup title="لغة الحملة" options={["العربية", "الإنجليزية", "العربية والإنجليزية"]} selected={language} setSelected={setLanguage} />
                  <Field label="الموقع الجغرافي" value="الرياض، السعودية" />
                  <TextArea label="تعديل خاص على الجمهور" value="جمهور مهتم بالعطور والهدايا والمنتجات الفاخرة بسعر مناسب." wide />
                  <MultiChoice title="القنوات" options={channelOptions} selected={channels} setSelected={setChannels} wide />
                </div>
              </Card>

              <SmartBox title="حماية القرار" tips={["لا تفعل النشر التلقائي في هذه المرحلة.", "اختر القنوات التي تملك لها أصولًا مناسبة فقط."]} />
            </div>
          )}

          {step === 5 && (
            <div className="step-layout with-side">
              <Card>
                <h3>الخطوة 5: المخرجات المطلوبة</h3>
                <p className="card-subtitle">حدد أنواع المخرجات وعدد النسخ ونمط الرسالة.</p>

                <div className="form-grid two">
                  <MultiChoice title="أنواع المخرجات" options={outputOptions} selected={outputs} setSelected={setOutputs} wide />
                  <ChoiceGroup title="عدد النسخ" options={["نسخة واحدة", "3 نسخ", "5 نسخ"]} selected={copies} setSelected={setCopies} />
                  <ChoiceGroup title="مدة الفيديو" options={["6 ثواني", "15 ثانية", "30 ثانية", "45 ثانية"]} selected={videoDuration} setSelected={setVideoDuration} />
                  <ChoiceGroup title="أسلوب الرسالة" options={["مباشر", "قصصي", "تعليمي", "فاخر", "مرح", "مقارنة"]} selected={style} setSelected={setStyle} />
                  <TextArea label="تعليمات خاصة للمخرجات" placeholder="مثال: لا تستخدم وجوه أشخاص، ركز على التغليف، أظهر السعر في آخر المشهد..." wide />
                </div>
              </Card>

              <SmartBox title="ترشيد التكلفة" tips={["كل مخرج إضافي يعني وقت مراجعة وتكلفة أعلى.", "ابدأ بنسخ قليلة ثم وسّع بعد معرفة أفضل أداء."]} />
            </div>
          )}

          {step === 6 && (
            <div className="step-layout with-side">
              <div className="stack">
                <Card>
                  <div className="readiness-head">
                    <div>
                      <h3>الخطوة 6: Brief + الجاهزية</h3>
                      <p className="card-subtitle">راجع ملخص الحملة قبل توليد أي مخرجات.</p>
                    </div>
                    <div className="readiness-ring">{readiness}%</div>
                  </div>

                  <div className="brief-grid">
                    <Brief title="ملخص الحملة" rows={briefRows.slice(0, 6)} />
                    <Brief title="التنفيذ والمخرجات" rows={briefRows.slice(6)} />
                  </div>

                  <div className={canGenerate ? "go-box" : "warning-box"}>
                    {canGenerate ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
                    <p>
                      {canGenerate
                        ? "الحملة جاهزة للتوليد التجريبي، مع بقاء المراجعة البشرية إلزامية قبل الاعتماد."
                        : "الجاهزية منخفضة. أكمل البيانات الأساسية قبل توليد المخرجات."}
                    </p>
                  </div>

                  <div className="generate-actions">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!canGenerate}
                      onClick={() => setGenerated(true)}
                    >
                      <Wand2 size={17} />
                      توليد مخرجات تجريبية
                    </button>
                    <button type="button" className="secondary-button" onClick={saveDraft}>
                      <Save size={17} />
                      حفظ Brief
                    </button>
                  </div>
                </Card>

                {generated && (
                  <Card className="generated-card">
                    <h3>مخرجات تجريبية</h3>
                    <div className="generated-list">
                      {outputs.map((output) => (
                        <div key={output}>
                          <strong>{output}</strong>
                          <p>مسودة مبدئية مبنية على الهدف والجمهور والقنوات المختارة، وتحتاج مراجعة بشرية قبل الاعتماد.</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <SmartBox title="قبل التوليد" tips={["راجع الادعاءات الحساسة.", "تأكد أن القنوات المختارة تملك أصولًا مناسبة.", "النشر التلقائي غير مفعل في هذه النسخة."]} />
            </div>
          )}
        </section>
      </section>

      {saved && (
        <div className="floating-success">
          <CheckCircle2 size={18} />
          تم الحفظ محليًا داخل الواجهة فقط.
        </div>
      )}

      <Footer
        step={step}
        total={steps.length}
        back={back}
        next={next}
        save={saveDraft}
        nextLabel={step < steps.length ? "التالي" : "إنهاء الإعداد"}
      />
    </main>
  );
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function PageTitle({ title, description, status }) {
  return (
    <section className="page-title-card">
      <div>
        <div className="eyebrow"><Sparkles size={15} /> {status}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="title-icon"><Megaphone size={26} /></div>
    </section>
  );
}

function Card({ children, className = "" }) {
  return <section className={cx("ref-card", className)}>{children}</section>;
}

function Button({ children, onClick, variant = "primary" }) {
  return (
    <button type="button" onClick={onClick} className={variant === "secondary" ? "secondary-button" : "primary-button"}>
      {children}
    </button>
  );
}

function StepTabs({ steps, step, setStep }) {
  return (
    <div className="step-tabs">
      {steps.map(([id, title, desc]) => {
        const state = id < step ? "done" : id === step ? "current" : "future";
        return (
          <button key={id} type="button" onClick={() => setStep(id)} className={cx("step-tab", state)}>
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

function Field({ label, value = "", placeholder = "", icon }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        {icon && <div className="input-icon">{icon}</div>}
        <input defaultValue={value} placeholder={placeholder} />
      </div>
    </label>
  );
}

function TextArea({ label, value = "", placeholder = "", wide }) {
  return (
    <label className={cx("field", wide && "wide")}>
      <span>{label}</span>
      <textarea defaultValue={value} placeholder={placeholder} rows={5} />
    </label>
  );
}

function ChoiceGroup({ title, options, selected, setSelected, wide }) {
  return (
    <div className={cx("choice-group", wide && "wide")}>
      <span>{title}</span>
      <div className="choice-list">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={selected === item ? "choice active" : "choice"}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({ title, options, selected, setSelected, wide }) {
  const toggle = (item) => {
    setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item]);
  };

  return (
    <div className={cx("choice-group", wide && "wide")}>
      <span>{title}</span>
      <div className="choice-list">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={selected.includes(item) ? "choice active" : "choice"}
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
    <button type="button" className="upload-box">
      <Upload size={23} />
      <strong>{title}</strong>
      <span>إرفاق صور / فيديو / كتابة</span>
      <small>اسحب الملفات أو أضف روابط أو نصوصًا مرجعية</small>
    </button>
  );
}

function SmartBox({ title, tips = [] }) {
  return (
    <aside className="smart-box">
      <div className="smart-title"><Sparkles size={18} /> <strong>{title}</strong></div>
      <div className="smart-list">
        {tips.map((tip, index) => (
          <div key={`${tip}-${index}`}>
            <span>{index + 1}</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Brief({ title, rows }) {
  return (
    <div className="brief-card">
      <h4>{title}</h4>
      <div>
        {rows.map(([label, value]) => (
          <div key={label} className="brief-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ step, total, back, next, save, nextLabel }) {
  return (
    <footer className="wizard-footer">
      <button type="button" className="secondary-button" onClick={back} disabled={step === 1}>
        <ArrowRight size={17} />
        رجوع
      </button>

      <div className="footer-progress">
        <strong>الخطوة {step} من {total}</strong>
        <span><i style={{ width: `${(step / total) * 100}%` }} /></span>
      </div>

      <div className="footer-actions">
        <button type="button" className="secondary-button" onClick={save}>
          <Save size={17} />
          حفظ كمسودة
        </button>

        <button type="button" className="primary-button" onClick={next}>
          {nextLabel}
          <ArrowLeft size={17} />
        </button>
      </div>
    </footer>
  );
}

const styles = `
.campaign-ref-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.05), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: "Inter", "Tajawal", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page-title-card,
.ref-card,
.smart-box,
.wizard-left,
.wizard-footer {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e4e7df;
  border-radius: 24px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}

.page-title-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  margin-bottom: 18px;
}

.eyebrow {
  width: fit-content;
  min-height: 30px;
  border-radius: 999px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  background: #eef7e9;
  border: 1px solid #d7ead1;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.page-title-card h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title-card p {
  margin: 7px 0 0;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.title-icon {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #176b2c, #2563eb);
  flex: 0 0 auto;
}

.wizard-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.wizard-left {
  padding: 14px;
  display: grid;
  gap: 14px;
  position: sticky;
  top: 96px;
}

.step-tabs {
  display: grid;
  gap: 10px;
}

.step-tab {
  min-height: 82px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: #fff;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
  transition: 0.18s ease;
}

.step-tab:hover {
  background: #f7f8f4;
}

.step-tab.current {
  background: #eef7e9;
  border-color: #176b2c;
  box-shadow: 0 0 0 4px #eef7e9;
}

.step-tab.done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #64748b;
  background: #f1f5f9;
  font-size: 12px;
  font-weight: 1000;
  flex: 0 0 auto;
}

.step-tab.current .step-number,
.step-tab.done .step-number {
  background: #176b2c;
  color: #fff;
}

.step-tab strong {
  display: block;
  color: #1f241d;
  font-size: 13px;
}

.step-tab span {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  line-height: 1.55;
  font-size: 11px;
}

.smart-box {
  padding: 16px;
  background: linear-gradient(135deg, #eef7e9, #ffffff);
}

.smart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b2c;
  margin-bottom: 12px;
}

.smart-list {
  display: grid;
  gap: 10px;
}

.smart-list div {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border-radius: 16px;
  background: rgba(255,255,255,0.82);
  padding: 12px;
}

.smart-list span {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #176b2c;
  color: #fff;
  font-size: 11px;
  font-weight: 1000;
  flex: 0 0 auto;
}

.smart-list p {
  margin: 0;
  color: #344054;
  line-height: 1.8;
  font-size: 13px;
}

.step-layout.with-side {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.stack {
  display: grid;
  gap: 16px;
}

.ref-card {
  padding: 20px;
}

.ref-card h3 {
  margin: 0;
  font-size: 21px;
  line-height: 1.35;
  letter-spacing: -0.03em;
}

.card-subtitle {
  margin: 7px 0 18px;
  color: #6f746b;
  font-size: 13px;
  line-height: 1.8;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mt {
  margin-top: 16px;
}

.field,
.choice-group {
  display: grid;
  gap: 8px;
}

.field.wide,
.choice-group.wide,
.wide {
  grid-column: 1 / -1;
}

.field > span,
.choice-group > span {
  color: #344054;
  font-size: 13px;
  font-weight: 900;
}

.field small {
  color: #6f746b;
  font-size: 11px;
}

.input-shell {
  position: relative;
}

.input-icon {
  position: absolute;
  inset-inline-start: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.input-icon + input {
  padding-inline-start: 42px;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e4e7df;
  border-radius: 16px;
  background: #fff;
  color: #1f241d;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  padding: 13px 14px;
  transition: 0.18s ease;
}

textarea {
  resize: vertical;
  min-height: 118px;
  line-height: 1.9;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #176b2c;
  box-shadow: 0 0 0 4px #eef7e9;
}

.choice-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice {
  min-height: 38px;
  border-radius: 16px;
  padding: 0 12px;
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.choice.active {
  color: #176b2c;
  background: #eef7e9;
  border-color: #176b2c;
}

.asset-strip {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  background: #f7f8f4;
  padding: 14px;
  margin-bottom: 16px;
}

.asset-strip p {
  margin: 8px 0 0;
  color: #6f746b;
  font-size: 13px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.upload-box {
  min-height: 154px;
  border: 1px dashed #cbd5e1;
  border-radius: 22px;
  background: #f8fafc;
  padding: 16px;
  display: grid;
  place-items: center;
  gap: 5px;
  text-align: center;
  font-family: inherit;
  cursor: pointer;
  color: #6f746b;
}

.upload-box svg {
  color: #176b2c;
}

.upload-box strong {
  color: #1f241d;
  font-size: 14px;
}

.upload-box span,
.upload-box small {
  font-size: 12px;
  line-height: 1.6;
}

.quality-table {
  overflow: hidden;
  border: 1px solid #e4e7df;
  border-radius: 20px;
}

.quality-table div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border-bottom: 1px solid #e4e7df;
}

.quality-table div:last-child {
  border-bottom: 0;
}

.warning-box,
.go-box {
  margin-top: 16px;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.warning-box {
  color: #92400e;
  background: #fff7e6;
  border: 1px solid #fde68a;
}

.go-box {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.warning-box p,
.go-box p {
  margin: 0;
  line-height: 1.8;
  font-size: 13px;
  font-weight: 800;
}

.readiness-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.readiness-ring {
  width: 82px;
  height: 82px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 8px solid #176b2c;
  box-shadow: inset 0 0 0 7px #eef7e9;
  font-size: 19px;
  font-weight: 1000;
  background: #fff;
}

.brief-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.brief-card {
  border: 1px solid #e4e7df;
  border-radius: 20px;
  background: #f7f8f4;
  padding: 14px;
}

.brief-card h4 {
  margin: 0 0 12px;
  font-size: 15px;
}

.brief-row {
  background: #fff;
  border-radius: 14px;
  padding: 11px;
  margin-bottom: 8px;
}

.brief-row:last-child {
  margin-bottom: 0;
}

.brief-row span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 4px;
}

.brief-row strong {
  display: block;
  color: #1f241d;
  font-size: 13px;
  line-height: 1.7;
}

.generate-actions,
.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.generated-card {
  background: #eef7e9;
}

.generated-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.generated-list div {
  background: #fff;
  border-radius: 16px;
  padding: 13px;
}

.generated-list p {
  margin: 5px 0 0;
  color: #6f746b;
  line-height: 1.7;
  font-size: 13px;
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
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.18s ease;
}

.primary-button {
  color: #fff;
  border: 0;
  background: #176b2c;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.primary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.secondary-button {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.floating-success {
  position: fixed;
  bottom: 94px;
  inset-inline-start: 24px;
  z-index: 30;
  min-height: 44px;
  border-radius: 999px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-weight: 900;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.wizard-footer {
  position: sticky;
  bottom: 16px;
  z-index: 20;
  margin-top: 18px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto minmax(240px, 1fr) auto;
  gap: 14px;
  align-items: center;
  backdrop-filter: blur(16px);
}

.footer-progress {
  min-height: 44px;
  border-radius: 16px;
  background: #eef7e9;
  color: #176b2c;
  border: 1px solid #d7ead1;
  padding: 8px 14px;
  display: grid;
  gap: 7px;
  text-align: center;
  font-size: 13px;
}

.footer-progress span {
  height: 6px;
  border-radius: 999px;
  background: #dcefd6;
  overflow: hidden;
}

.footer-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #176b2c, #2563eb);
}

@media (max-width: 1280px) {
  .wizard-shell,
  .step-layout.with-side {
    grid-template-columns: 1fr;
  }

  .wizard-left {
    position: static;
  }

  .step-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .upload-grid,
  .form-grid.two,
  .brief-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .campaign-ref-page {
    padding: 16px;
  }

  .page-title-card,
  .readiness-head,
  .wizard-footer {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .page-title-card h1 {
    font-size: 27px;
  }

  .step-tabs,
  .upload-grid,
  .form-grid.two,
  .brief-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
`;
