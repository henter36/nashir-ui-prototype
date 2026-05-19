import React, { useCallback, useMemo, useState } from "react";

const MOCK_PRODUCTS = [
  { id: 1, name: "حذاء رياضي نايك", price: 349 },
  { id: 2, name: "عطر أرابيان أود", price: 599 },
  { id: 3, name: "ساعة كاسيو", price: 189 },
  { id: 4, name: "كريم مرطب نيفيا", price: 79 },
];

const GOALS = ["Sales", "Awareness", "Retention", "Launch"];
const GENDERS = ["All", "Male", "Female"];
const CITIES = ["Riyadh", "Jeddah", "Dammam", "Mecca", "All"];
const INTERESTS = ["Fashion", "Electronics", "Food", "Sports", "Beauty"];
const CHANNELS = ["Instagram", "Snapchat", "Twitter(X)", "TikTok", "WhatsApp", "Email"];
const OFFERS = ["Discount %", "Free Shipping", "Bundle", "No offer"];
const TONES = ["Formal", "Friendly", "Exciting", "Urgent"];

const initialForm = {
  campaignName: "",
  productIds: [],
  goal: "",
  budget: "",
  ageMin: 18,
  ageMax: 65,
  gender: "All",
  cities: [],
  interests: [],
  channels: [],
  mainMessage: "",
  offerType: "",
  offerValue: "",
  tone: "",
  agentPrompt: "",
  startDate: "",
  endDate: "",
  audienceSummary: "",
};

const steps = [
  [1, "أساسيات الحملة", "اسم الحملة، المنتج، الهدف، الميزانية."],
  [2, "الجمهور", "العمر، الجنس، المدينة، الاهتمامات."],
  [3, "القنوات", "قنوات مقترحة تلقائيًا وقابلة للتعديل."],
  [4, "الرسالة والعرض", "رسالة مختصرة، نوع العرض، النبرة."],
  [5, "المراجعة والتوليد", "ملخص الجاهزية قبل التوليد."],
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function calculateReadiness(form) {
  let score = 0;
  if (form.campaignName.trim()) score += 12;
  if (form.productIds.length) score += 12;
  if (form.goal) score += 10;
  if (String(form.budget).trim()) score += 10;
  if (form.gender) score += 6;
  if (form.cities.length) score += 8;
  if (form.interests.length) score += 8;
  if (form.channels.length) score += 12;
  if (form.mainMessage.trim()) score += 12;
  if (form.offerType) score += 5;
  if (form.tone) score += 5;
  return Math.min(score, 100);
}

function getRecommendedChannels(form) {
  const recommended = new Set(["Instagram", "WhatsApp"]);

  if (form.goal === "Awareness" || form.goal === "Launch") {
    recommended.add("TikTok");
    recommended.add("Snapchat");
  }

  if (form.goal === "Retention") {
    recommended.add("Email");
    recommended.add("WhatsApp");
  }

  if (form.interests.includes("Fashion") || form.interests.includes("Beauty")) {
    recommended.add("TikTok");
    recommended.add("Snapchat");
  }

  if (form.interests.includes("Food") || form.interests.includes("Sports")) {
    recommended.add("Snapchat");
  }

  return Array.from(recommended);
}

export default function CampaignIntakePage() {
  const [mode, setMode] = useState("wizard");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentDone, setAgentDone] = useState(false);

  const readiness = useMemo(() => calculateReadiness(form), [form]);
  const recommendedChannels = useMemo(() => getRecommendedChannels(form), [form.goal, form.interests]);
  const selectedProducts = useMemo(
    () => MOCK_PRODUCTS.filter((product) => form.productIds.includes(product.id)),
    [form.productIds]
  );

  const update = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const switchMode = useCallback((nextMode) => {
    setMode(nextMode);
    setErrors({});
  }, []);

  const validateStep = useCallback(() => {
    const nextErrors = {};

    if (step === 1) {
      if (!form.campaignName.trim()) nextErrors.campaignName = "اسم الحملة مطلوب.";
      if (!form.productIds.length) nextErrors.productIds = "اختر منتجًا واحدًا على الأقل.";
      if (!form.goal) nextErrors.goal = "اختر هدف الحملة.";
      if (!String(form.budget).trim()) nextErrors.budget = "الميزانية مطلوبة.";
    }

    if (step === 2) {
      if (Number(form.ageMin) > Number(form.ageMax)) nextErrors.ageRange = "العمر الأدنى لا يجب أن يتجاوز العمر الأعلى.";
      if (!form.gender) nextErrors.gender = "اختر الجنس المستهدف.";
      if (!form.cities.length) nextErrors.cities = "اختر مدينة واحدة على الأقل.";
      if (!form.interests.length) nextErrors.interests = "اختر اهتمامًا واحدًا على الأقل.";
    }

    if (step === 3) {
      if (!form.channels.length) nextErrors.channels = "اختر قناة واحدة على الأقل.";
    }

    if (step === 4) {
      if (!form.mainMessage.trim()) nextErrors.mainMessage = "اكتب الرسالة الرئيسية.";
      if (form.mainMessage.length > 280) nextErrors.mainMessage = "الرسالة يجب ألا تتجاوز 280 حرفًا.";
      if (!form.offerType) nextErrors.offerType = "اختر نوع العرض.";
      if (form.offerType === "Discount %" && !String(form.offerValue).trim()) {
        nextErrors.offerValue = "أدخل نسبة الخصم.";
      }
      if (!form.tone) nextErrors.tone = "اختر نبرة الرسالة.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form, step]);

  const goNext = useCallback(() => {
    if (!validateStep()) return;

    if (step === 2 && !form.channels.length) {
      setForm((prev) => ({
        ...prev,
        channels: getRecommendedChannels(prev),
      }));
    }

    setStep((current) => Math.min(current + 1, 5));
  }, [form.channels.length, step, validateStep]);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 1));
  }, []);

  const parseAgent = useCallback(() => {
    if (!form.agentPrompt.trim()) {
      setErrors({ agentPrompt: "اكتب وصفًا للحملة أولًا." });
      return;
    }

    setAgentLoading(true);
    setAgentDone(false);

    window.setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        campaignName: prev.campaignName || "حملة مستخرجة من وصف الوكيل",
        productIds: prev.productIds.length ? prev.productIds : [2],
        goal: prev.goal || "Sales",
        budget: prev.budget || "5000",
        ageMin: prev.ageMin || 25,
        ageMax: prev.ageMax || 44,
        gender: prev.gender || "All",
        cities: prev.cities.length ? prev.cities : ["Riyadh", "Jeddah"],
        interests: prev.interests.length ? prev.interests : ["Beauty"],
        channels: prev.channels.length ? prev.channels : ["Instagram", "TikTok", "WhatsApp"],
        mainMessage:
          prev.mainMessage ||
          "اكتشف عرضًا خاصًا لفترة محدودة مع تجربة شراء سهلة وموثوقة.",
        offerType: prev.offerType || "Discount %",
        offerValue: prev.offerValue || "20",
        tone: prev.tone || "Friendly",
      }));
      setAgentLoading(false);
      setAgentDone(true);
      setMode("wizard");
      setStep(5);
    }, 1500);
  }, [form.agentPrompt]);

  return (
    <main className="campaign-intake-page" dir="rtl">
      <style>{styles}</style>

      <PageTitle
        title="إنشاء حملة"
        description="نسخة مختصرة من رحلة إنشاء الحملة مع الحفاظ على هوية ناشر وطريقة الإدخال المعتمدة."
        status="Dual Intake"
      />

      <div className="mode-switch-card">
        <div>
          <h2>اختر طريقة الإدخال</h2>
          <p>المعالج للمستخدم غير الخبير، ووضع الوكيل للمستخدم المتقدم.</p>
        </div>

        <div className="mode-switcher" role="tablist" aria-label="Campaign intake mode">
          <button
            type="button"
            onClick={() => switchMode("wizard")}
            className={cx(mode === "wizard" && "active")}
          >
            🧙 Guided Wizard
          </button>
          <button
            type="button"
            onClick={() => switchMode("agent")}
            className={cx(mode === "agent" && "active")}
          >
            ⚡ Agent Mode
          </button>
        </div>
      </div>

      {mode === "wizard" ? (
        <>
          <StepTabs steps={steps} step={step} setStep={setStep} />
          <ProgressBar step={step} readiness={readiness} />

          <div className="intake-layout">
            <div className="intake-main">
              {step === 1 && (
                <Card>
                  <SectionTitle title="الخطوة 1: أساسيات الحملة" description="أدخل أقل قدر من البيانات اللازمة لبدء الحملة." />
                  <div className="form-grid two">
                    <Field
                      label="Campaign name"
                      value={form.campaignName}
                      placeholder="مثال: حملة إطلاق عطر الشتاء"
                      onChange={(value) => update("campaignName", value)}
                      error={errors.campaignName}
                    />

                    <Field
                      label="Budget"
                      type="number"
                      value={form.budget}
                      placeholder="5000"
                      suffix="SAR"
                      onChange={(value) => update("budget", value)}
                      error={errors.budget}
                    />
                  </div>

                  <ProductPicker
                    selected={form.productIds}
                    setSelected={(value) => update("productIds", value)}
                    error={errors.productIds}
                  />

                  <ChoiceGroup
                    title="Goal"
                    options={GOALS}
                    selected={form.goal}
                    setSelected={(value) => update("goal", value)}
                    error={errors.goal}
                  />
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <SectionTitle title="الخطوة 2: الجمهور" description="حدد الجمهور بسرعة دون تعقيد زائد." />

                  <div className="range-card">
                    <div className="range-head">
                      <strong>Age range</strong>
                      <span>{form.ageMin}–{form.ageMax}</span>
                    </div>
                    <div className="form-grid two">
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={form.ageMin}
                        onChange={(event) => update("ageMin", Number(event.target.value))}
                      />
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={form.ageMax}
                        onChange={(event) => update("ageMax", Number(event.target.value))}
                      />
                    </div>
                    <Error text={errors.ageRange} />
                  </div>

                  <ChoiceGroup
                    title="Gender"
                    options={GENDERS}
                    selected={form.gender}
                    setSelected={(value) => update("gender", value)}
                    error={errors.gender}
                  />

                  <MultiChoice
                    title="City targeting"
                    options={CITIES}
                    selected={form.cities}
                    setSelected={(value) => update("cities", value)}
                    error={errors.cities}
                  />

                  <MultiChoice
                    title="Interest tags"
                    options={INTERESTS}
                    selected={form.interests}
                    setSelected={(value) => update("interests", value)}
                    error={errors.interests}
                  />
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <SectionTitle
                    title="الخطوة 3: القنوات"
                    description="القنوات أدناه موصى بها تلقائيًا حسب الهدف والجمهور، ويمكن تعديلها."
                  />

                  <div className="recommendation-box">
                    <strong>القنوات المقترحة</strong>
                    <span>{recommendedChannels.join("، ")}</span>
                  </div>

                  <div className="channel-grid">
                    {CHANNELS.map((channel) => {
                      const selected = form.channels.includes(channel);
                      const recommended = recommendedChannels.includes(channel);

                      return (
                        <button
                          key={channel}
                          type="button"
                          className={cx("channel-card", selected && "selected")}
                          onClick={() => update("channels", toggle(form.channels, channel))}
                        >
                          <div>
                            <strong>{channel}</strong>
                            <span>{recommended ? "موصى بها" : "اختيارية"}</span>
                          </div>
                          <i>{selected ? "✓" : "+"}</i>
                        </button>
                      );
                    })}
                  </div>

                  <Error text={errors.channels} />
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <SectionTitle title="الخطوة 4: الرسالة والعرض" description="رسالة مختصرة وواضحة قابلة للتوليد." />

                  <TextArea
                    label="Main message"
                    value={form.mainMessage}
                    placeholder="اكتب رسالة قصيرة وواضحة للحملة..."
                    maxLength={280}
                    onChange={(value) => update("mainMessage", value)}
                    error={errors.mainMessage}
                    counter={`${form.mainMessage.length}/280`}
                  />

                  <ChoiceGroup
                    title="Offer type"
                    options={OFFERS}
                    selected={form.offerType}
                    setSelected={(value) => update("offerType", value)}
                    error={errors.offerType}
                  />

                  {form.offerType === "Discount %" ? (
                    <Field
                      label="Offer value"
                      type="number"
                      value={form.offerValue}
                      placeholder="20"
                      suffix="%"
                      onChange={(value) => update("offerValue", value)}
                      error={errors.offerValue}
                    />
                  ) : null}

                  <ChoiceGroup
                    title="Tone"
                    options={TONES}
                    selected={form.tone}
                    setSelected={(value) => update("tone", value)}
                    error={errors.tone}
                  />
                </Card>
              )}

              {step === 5 && (
                <Card>
                  <SectionTitle title="الخطوة 5: Review & Generate" description="راجع المدخلات قبل توليد الحملة." />
                  <ReviewSummary form={form} readiness={readiness} selectedProducts={selectedProducts} />
                </Card>
              )}

              <Footer
                step={step}
                total={5}
                back={goBack}
                next={step < 5 ? goNext : () => undefined}
                nextLabel={step < 5 ? "التالي" : "Generate Campaign"}
                nextDisabled={step === 5 && readiness < 60}
                onGenerate={() => alert("تم توليد حملة تجريبية محليًا.")}
              />
            </div>

            <SmartBox
              title="توصيات ذكية"
              tips={
                step === 1
                  ? ["ابدأ بهدف واحد فقط حتى لا تتشتت المخرجات.", "الميزانية تساعد لاحقًا في اختيار القنوات."]
                  : step === 2
                  ? ["المدن والاهتمامات تؤثر على توصية القنوات.", "استخدم All فقط إذا كان المنتج واسع الانتشار."]
                  : step === 3
                  ? ["لا توسّع القنوات قبل وضوح الرسالة.", "WhatsApp و Email أنسب للاحتفاظ وإعادة الاستهداف."]
                  : step === 4
                  ? ["الرسالة القصيرة أفضل للإعلانات.", "الخصم يتطلب قيمة واضحة حتى لا يضعف التوليد."]
                  : ["لا تولّد قبل 60% جاهزية.", "المخرجات هنا مسودة وتحتاج مراجعة بشرية."]
              }
            />
          </div>
        </>
      ) : (
        <div className="agent-layout">
          <Card>
            <SectionTitle title="Agent Mode" description="اكتب وصف الحملة بحرية وسيحوّله النظام إلى ملخص قابل للتوليد." />

            <TextArea
              label="وصف الحملة"
              value={form.agentPrompt}
              placeholder="صف حملتك بحرية... مثال: أريد حملة لعطر فاخر تستهدف النساء في الرياض وجدة بميزانية 5000 ريال مع خصم 20٪ لمدة أسبوع."
              onChange={(value) => update("agentPrompt", value)}
              error={errors.agentPrompt}
              tall
            />

            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setAdvancedOpen((current) => !current)}
            >
              {advancedOpen ? "إخفاء Advanced Parameters" : "عرض Advanced Parameters"}
            </button>

            {advancedOpen ? (
              <div className="advanced-panel">
                <div className="form-grid two">
                  <Field
                    label="Budget"
                    type="number"
                    value={form.budget}
                    placeholder="5000"
                    suffix="SAR"
                    onChange={(value) => update("budget", value)}
                  />
                  <Field
                    label="Start date"
                    type="date"
                    value={form.startDate}
                    onChange={(value) => update("startDate", value)}
                  />
                  <Field
                    label="End date"
                    type="date"
                    value={form.endDate}
                    onChange={(value) => update("endDate", value)}
                  />
                </div>

                <MultiChoice
                  title="Channel multi-select"
                  options={CHANNELS}
                  selected={form.channels}
                  setSelected={(value) => update("channels", value)}
                />

                <TextArea
                  label="Target audience summary"
                  value={form.audienceSummary}
                  placeholder="مثال: نساء 25–34 في الرياض وجدة مهتمات بالجمال والعطور."
                  onChange={(value) => update("audienceSummary", value)}
                />
              </div>
            ) : null}

            {agentLoading ? <Skeleton /> : null}
            {agentDone ? <div className="success-note">تم تحليل الوصف والانتقال إلى ملخص الخطوة الخامسة.</div> : null}

            <div className="agent-actions">
              <Button onClick={parseAgent}>Parse & Generate</Button>
            </div>
          </Card>

          <SmartBox
            title="متى أستخدم Agent Mode؟"
            tips={[
              "مناسب لمن يعرف الحملة جيدًا ويريد إدخالها كنص واحد.",
              "المعالجة هنا تجريبية وتحوّل النص إلى ملخص جاهز للمراجعة.",
              "أي توليد فعلي لاحقًا يجب أن يمر بمراجعة بشرية.",
            ]}
          />
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
      {status ? <Badge tone="green">{status}</Badge> : null}
    </section>
  );
}

function Card({ children, className = "" }) {
  return <section className={cx("card", className)}>{children}</section>;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={cx("badge", `badge-${tone}`)}>{children}</span>;
}

function Button({ children, onClick, variant = "primary", disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cx("button", variant)}>
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
          <button
            key={id}
            type="button"
            onClick={() => setStep(id)}
            className={cx("step-tab", state)}
          >
            <div className="step-index">{state === "done" ? "✓" : id}</div>
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

function ProgressBar({ step, readiness }) {
  return (
    <div className="progress-card">
      <div className="progress-head">
        <span>تقدم المعالج</span>
        <strong>{Math.round((step / 5) * 100)}%</strong>
      </div>
      <div className="progress-track">
        <i style={{ width: `${(step / 5) * 100}%` }} />
      </div>
      <div className="readiness-mini">جاهزية الحملة: {readiness}%</div>
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Field({ label, value, placeholder, onChange, type = "text", error, suffix }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className={cx("input-shell", suffix && "with-suffix")}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <b>{suffix}</b> : null}
      </div>
      <Error text={error} />
    </label>
  );
}

function TextArea({ label, value, placeholder, onChange, error, maxLength, counter, tall }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cx(tall && "tall")}
        onChange={(event) => onChange(event.target.value)}
      />
      {counter ? <div className="counter">{counter}</div> : null}
      <Error text={error} />
    </label>
  );
}

function ChoiceGroup({ title, options, selected, setSelected, error }) {
  return (
    <div className="choice-section">
      <div className="choice-title">{title}</div>
      <div className="choice-row">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={cx("choice-chip", selected === item && "selected")}
          >
            {item}
          </button>
        ))}
      </div>
      <Error text={error} />
    </div>
  );
}

function MultiChoice({ title, options, selected, setSelected, error }) {
  return (
    <div className="choice-section">
      <div className="choice-title">{title}</div>
      <div className="choice-row">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(toggle(selected, item))}
            className={cx("choice-chip", selected.includes(item) && "selected")}
          >
            {item}
          </button>
        ))}
      </div>
      <Error text={error} />
    </div>
  );
}

function ProductPicker({ selected, setSelected, error }) {
  return (
    <div className="choice-section">
      <div className="choice-title">Product/products</div>
      <div className="product-grid">
        {MOCK_PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            className={cx("product-card", selected.includes(product.id) && "selected")}
            onClick={() => setSelected(toggle(selected, product.id))}
          >
            <strong>{product.name}</strong>
            <span>{product.price} SAR</span>
          </button>
        ))}
      </div>
      <Error text={error} />
    </div>
  );
}

function ReviewSummary({ form, readiness, selectedProducts }) {
  const rows = [
    ["اسم الحملة", form.campaignName || "غير محدد"],
    ["المنتجات", selectedProducts.map((x) => x.name).join("، ") || "غير محدد"],
    ["الهدف", form.goal || "غير محدد"],
    ["الميزانية", form.budget ? `${form.budget} SAR` : "غير محدد"],
    ["الجمهور", `${form.gender} · ${form.ageMin}–${form.ageMax}`],
    ["المدن", form.cities.join("، ") || "غير محدد"],
    ["الاهتمامات", form.interests.join("، ") || "غير محدد"],
    ["القنوات", form.channels.join("، ") || "غير محدد"],
    ["العرض", form.offerType === "Discount %" ? `${form.offerValue}%` : form.offerType || "غير محدد"],
    ["النبرة", form.tone || "غير محدد"],
  ];

  return (
    <div className="review-grid">
      <div className="brief-card">
        {rows.map(([label, value]) => (
          <div className="brief-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="readiness-card">
        <div className={cx("readiness-ring", readiness >= 60 && "ok")}>{readiness}%</div>
        <strong>{readiness >= 60 ? "جاهزة للتوليد" : "غير جاهزة"}</strong>
        <p>زر التوليد يعمل فقط إذا تجاوزت الجاهزية 60%.</p>
      </div>
    </div>
  );
}

function SmartBox({ title, tips = [] }) {
  return (
    <aside className="smart-box">
      <div className="smart-head">✦ {title}</div>
      <div className="smart-list">
        {tips.map((tip, index) => (
          <div key={`${tip}-${index}`} className="smart-tip">
            <span>{index + 1}</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Footer({ step, total, back, next, nextLabel, nextDisabled, onGenerate }) {
  return (
    <div className="footer-bar">
      <Button variant="secondary" onClick={back} disabled={step === 1}>
        رجوع
      </Button>
      <div className="footer-progress">الخطوة {step} من {total}</div>
      <div className="footer-actions">
        <Button variant="secondary" onClick={() => undefined}>حفظ كمسودة</Button>
        <Button onClick={step === total ? onGenerate : next} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton">
      <div />
      <div />
      <div />
    </div>
  );
}

function Error({ text }) {
  return text ? <div className="error">{text}</div> : null;
}

const styles = `
.campaign-intake-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.page-title,
.mode-switch-card,
.card,
.smart-box,
.progress-card,
.footer-bar {
  border: 1px solid #e4e7df;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.page-title {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-title h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-title p {
  margin: 7px 0 0;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.mode-switch-card {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.mode-switch-card h2 {
  margin: 0;
  font-size: 18px;
}

.mode-switch-card p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 13px;
}

.mode-switcher {
  background: #f7f8f4;
  border: 1px solid #e4e7df;
  border-radius: 999px;
  padding: 5px;
  display: flex;
  gap: 5px;
}

.mode-switcher button {
  border: 0;
  min-height: 38px;
  border-radius: 999px;
  padding: 0 14px;
  background: transparent;
  color: #6f746b;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.mode-switcher button.active {
  color: #ffffff;
  background: #176b2c;
}

.step-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.step-tab {
  min-height: 76px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
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
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.step-index {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.step-tab.current .step-index {
  background: #176b2c;
  color: #fff;
}

.step-tab.done .step-index {
  background: #16a34a;
  color: #fff;
}

.step-tab strong {
  display: block;
  font-size: 13px;
}

.step-tab span {
  display: block;
  margin-top: 3px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.5;
}

.progress-card {
  padding: 12px 14px;
  margin-bottom: 16px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  color: #176b2c;
  font-size: 12px;
  font-weight: 900;
}

.progress-track {
  height: 7px;
  border-radius: 999px;
  background: #eef7e9;
  overflow: hidden;
  margin-top: 9px;
}

.progress-track i {
  display: block;
  height: 100%;
  background: #176b2c;
  border-radius: inherit;
}

.readiness-mini {
  text-align: center;
  margin-top: 9px;
  color: #6f746b;
  font-size: 12px;
  font-weight: 800;
}

.intake-layout,
.agent-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.card {
  padding: 20px;
}

.section-title {
  margin-bottom: 18px;
}

.section-title h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.03em;
}

.section-title p {
  margin: 6px 0 0;
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

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.field span,
.choice-title {
  color: #1f241d;
  font-size: 13px;
  font-weight: 900;
}

.input-shell {
  min-height: 46px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.input-shell input {
  min-height: 44px;
  border: 0;
  outline: 0;
  padding: 0 14px;
  background: transparent;
  font-family: inherit;
  color: #1f241d;
}

.input-shell b {
  padding-inline-end: 14px;
  color: #176b2c;
}

.field textarea {
  width: 100%;
  min-height: 128px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  outline: 0;
  resize: vertical;
  font-family: inherit;
  line-height: 1.9;
  color: #1f241d;
}

.field textarea.tall {
  min-height: 260px;
}

.counter {
  text-align: left;
  color: #6f746b;
  font-size: 12px;
  font-weight: 800;
}

.choice-section {
  margin-top: 16px;
}

.choice-title {
  margin-bottom: 10px;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice-chip {
  min-height: 38px;
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
  border-radius: 16px;
  padding: 0 13px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.choice-chip.selected {
  border-color: #176b2c;
  background: #eef7e9;
  color: #176b2c;
}

.product-grid,
.channel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.product-card,
.channel-card {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.product-card.selected,
.channel-card.selected {
  border-color: #176b2c;
  background: #eef7e9;
}

.product-card strong,
.channel-card strong {
  display: block;
  font-size: 14px;
}

.product-card span,
.channel-card span {
  display: block;
  margin-top: 5px;
  color: #6f746b;
  font-size: 12px;
}

.channel-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.channel-card i {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #f7f8f4;
  color: #176b2c;
  font-style: normal;
  font-weight: 900;
}

.recommendation-box,
.range-card,
.advanced-panel,
.success-note {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 14px;
}

.recommendation-box strong,
.range-card strong {
  display: block;
  color: #176b2c;
  font-size: 13px;
}

.recommendation-box span,
.range-card span {
  display: block;
  color: #6f746b;
  margin-top: 4px;
  font-size: 12px;
}

.range-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 14px;
}

.brief-card,
.readiness-card {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 20px;
  padding: 16px;
}

.brief-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  min-height: 42px;
  border-bottom: 1px solid #e4e7df;
  align-items: center;
}

.brief-row:last-child {
  border-bottom: 0;
}

.brief-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.brief-row strong {
  text-align: left;
  font-size: 13px;
}

.readiness-card {
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
}

.readiness-ring {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 9px solid #dc2626;
  color: #991b1b;
  background: #fff;
  font-size: 24px;
  font-weight: 1000;
}

.readiness-ring.ok {
  border-color: #176b2c;
  color: #176b2c;
}

.readiness-card strong {
  display: block;
  margin-top: 12px;
}

.readiness-card p {
  color: #6f746b;
  font-size: 12px;
  line-height: 1.8;
}

.footer-bar {
  position: sticky;
  bottom: 16px;
  z-index: 12;
  margin-top: 16px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto minmax(180px, 1fr) auto;
  gap: 12px;
  align-items: center;
  backdrop-filter: blur(16px);
}

.footer-progress {
  min-height: 42px;
  border-radius: 16px;
  background: #eef7e9;
  color: #176b2c;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 900;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.button.primary {
  color: #fff;
  background: #176b2c;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.button.secondary {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.smart-box {
  padding: 16px;
  position: sticky;
  top: 96px;
}

.smart-head {
  color: #176b2c;
  font-weight: 1000;
  margin-bottom: 12px;
}

.smart-list {
  display: grid;
  gap: 10px;
}

.smart-tip {
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 10px;
}

.smart-tip span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 999px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 1000;
}

.smart-tip p {
  margin: 0;
  color: #1f241d;
  line-height: 1.7;
  font-size: 13px;
}

.agent-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.advanced-toggle {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 14px;
  border: 1px solid #e4e7df;
  background: #fff;
  color: #176b2c;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  margin-bottom: 14px;
}

.skeleton {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.skeleton div {
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f7f8f4, #e4e7df, #f7f8f4);
  animation: pulse 1s infinite linear;
}

.skeleton div:nth-child(2) {
  width: 80%;
}

.skeleton div:nth-child(3) {
  width: 60%;
}

.success-note {
  color: #176b2c;
  font-weight: 900;
}

.error {
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 900;
}

@keyframes pulse {
  0% { opacity: 0.45; }
  50% { opacity: 1; }
  100% { opacity: 0.45; }
}

@media (max-width: 1180px) {
  .step-tabs {
    grid-template-columns: 1fr;
  }

  .intake-layout,
  .agent-layout {
    grid-template-columns: 1fr;
  }

  .smart-box {
    position: static;
  }
}

@media (max-width: 760px) {
  .campaign-intake-page {
    padding: 16px;
  }

  .page-title,
  .mode-switch-card {
    align-items: stretch;
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 27px;
  }

  .mode-switcher,
  .footer-actions {
    width: 100%;
  }

  .mode-switcher button,
  .footer-actions .button {
    flex: 1;
  }

  .form-grid.two,
  .product-grid,
  .channel-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .footer-bar {
    grid-template-columns: 1fr;
  }
}
`;
