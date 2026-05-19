import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Globe2,
  Link2,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Users,
} from "lucide-react";

const steps = [
  ["store", "بيانات المتجر", "اسم المتجر، النشاط، السوق."],
  ["brand", "الهوية", "النبرة، الألوان، الكلمات الممنوعة."],
  ["channels", "القنوات", "اختيار قنوات البداية."],
  ["ready", "الجاهزية", "ملخص وقرار الانتقال."],
];

const businessTypes = ["متجر إلكتروني", "فرع فعلي", "خدمة", "مطعم/كافيه", "أزياء", "تجميل", "عطور"];
const tones = ["ودية", "رسمية", "فاخرة", "شبابية", "هادئة", "موثوقة"];
const channels = ["Instagram", "TikTok", "Snapchat", "WhatsApp", "Email", "Google Ads"];

export default function OnboardingFlowPage({ onFinish = () => {} }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    storeName: "",
    businessType: "",
    market: "السعودية",
    storeUrl: "",
    tone: "",
    brandWords: "",
    forbiddenWords: "",
    channels: ["Instagram", "WhatsApp"],
  });
  const [errors, setErrors] = useState({});

  const completion = useMemo(() => {
    let score = 0;
    if (form.storeName.trim()) score += 18;
    if (form.businessType) score += 14;
    if (form.market.trim()) score += 10;
    if (form.tone) score += 16;
    if (form.brandWords.trim()) score += 12;
    if (form.channels.length) score += 20;
    if (form.storeUrl.trim()) score += 10;
    return Math.min(score, 100);
  }, [form]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (step === 0) {
      if (!form.storeName.trim()) next.storeName = "اسم المتجر مطلوب.";
      if (!form.businessType) next.businessType = "اختر نوع النشاط.";
      if (!form.market.trim()) next.market = "حدد السوق المستهدف.";
    }
    if (step === 1) {
      if (!form.tone) next.tone = "اختر نبرة العلامة.";
      if (!form.brandWords.trim()) next.brandWords = "اكتب كلمات تعبّر عن العلامة.";
    }
    if (step === 2 && !form.channels.length) {
      next.channels = "اختر قناة واحدة على الأقل.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => setStep((current) => Math.max(current - 1, 0));

  return (
    <main className="onboarding-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow"><Sparkles size={15} /> Onboarding Flow</div>
          <h1>تهيئة ناشر لأول استخدام</h1>
          <p>رحلة مختصرة تمنع البداية بشاشة فارغة، وتجمع الحد الأدنى اللازم لتفعيل Dashboard والحملات.</p>
        </div>
        <div className="score-card">
          <strong>{completion}%</strong>
          <span>جاهزية أولية</span>
        </div>
      </section>

      <section className="onboarding-layout">
        <aside className="steps-card">
          {steps.map(([id, title, desc], index) => (
            <button
              type="button"
              key={id}
              className={`step-item ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
              onClick={() => setStep(index)}
            >
              <div>{index < step ? <CheckCircle2 size={18} /> : index + 1}</div>
              <span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="main-card">
          {step === 0 && (
            <>
              <Header icon={Store} title="بيانات المتجر" desc="ابدأ بتعريف المتجر والسوق المستهدف." />
              <div className="grid two">
                <Field label="اسم المتجر" value={form.storeName} onChange={(v) => update("storeName", v)} error={errors.storeName} />
                <Select label="نوع النشاط" value={form.businessType} options={businessTypes} onChange={(v) => update("businessType", v)} error={errors.businessType} />
                <Field label="السوق المستهدف" value={form.market} onChange={(v) => update("market", v)} error={errors.market} />
                <Field label="رابط المتجر" value={form.storeUrl} onChange={(v) => update("storeUrl", v)} icon={<Link2 size={16} />} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Header icon={Target} title="هوية العلامة" desc="اضبط النبرة والكلمات الأساسية قبل توليد أي حملة." />
              <Choice label="نبرة العلامة" options={tones} selected={form.tone} onSelect={(v) => update("tone", v)} error={errors.tone} />
              <TextArea label="كلمات تعبّر عن العلامة" value={form.brandWords} onChange={(v) => update("brandWords", v)} error={errors.brandWords} placeholder="مثال: موثوق، طبيعي، فاخر، سريع..." />
              <TextArea label="كلمات ممنوعة أو حساسة" value={form.forbiddenWords} onChange={(v) => update("forbiddenWords", v)} placeholder="مثال: مضمون، الأفضل مطلقًا، علاج..." />
            </>
          )}

          {step === 2 && (
            <>
              <Header icon={Globe2} title="القنوات" desc="اختر القنوات التي سيبدأ النظام بتجهيز المخرجات لها." />
              <Multi label="قنوات البداية" options={channels} selected={form.channels} onChange={(v) => update("channels", v)} error={errors.channels} />
              <div className="warning"><CircleAlert size={18} /> الربط الحقيقي مع المنصات مؤجل إلى Backend/OAuth. هذه اختيارات واجهة فقط.</div>
            </>
          )}

          {step === 3 && (
            <>
              <Header icon={ShieldCheck} title="الجاهزية" desc="ملخص التهيئة قبل الانتقال للمنصة." />
              <div className="summary-grid">
                <Summary label="المتجر" value={form.storeName || "غير محدد"} />
                <Summary label="النشاط" value={form.businessType || "غير محدد"} />
                <Summary label="السوق" value={form.market || "غير محدد"} />
                <Summary label="النبرة" value={form.tone || "غير محدد"} />
                <Summary label="القنوات" value={form.channels.join("، ") || "غير محدد"} />
                <Summary label="الجاهزية" value={`${completion}%`} />
              </div>
            </>
          )}

          <footer className="footer">
            <button type="button" className="secondary" onClick={back} disabled={step === 0}><ArrowRight size={16} /> رجوع</button>
            <div className="progress"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
            {step < steps.length - 1 ? (
              <button type="button" className="primary" onClick={next}>التالي <ArrowLeft size={16} /></button>
            ) : (
              <button type="button" className="primary" onClick={onFinish}>إنهاء التهيئة <CheckCircle2 size={16} /></button>
            )}
          </footer>
        </section>
      </section>
    </main>
  );
}

function Header({ icon: Icon, title, desc }) {
  return <div className="section-header"><div><Icon size={22} /></div><span><h2>{title}</h2><p>{desc}</p></span></div>;
}

function Field({ label, value, onChange, error, icon }) {
  return <label className="field"><span>{label}</span><div className="input-shell">{icon}<input value={value} onChange={(e) => onChange(e.target.value)} /></div>{error && <small>{error}</small>}</label>;
}

function Select({ label, value, options, onChange, error }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">اختر</option>{options.map((x) => <option key={x} value={x}>{x}</option>)}</select>{error && <small>{error}</small>}</label>;
}

function TextArea({ label, value, onChange, placeholder, error }) {
  return <label className="field wide"><span>{label}</span><textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />{error && <small>{error}</small>}</label>;
}

function Choice({ label, options, selected, onSelect, error }) {
  return <div className="choice"><span>{label}</span><div>{options.map((x) => <button key={x} type="button" className={selected === x ? "selected" : ""} onClick={() => onSelect(x)}>{x}</button>)}</div>{error && <small>{error}</small>}</div>;
}

function Multi({ label, options, selected, onChange, error }) {
  const toggle = (x) => onChange(selected.includes(x) ? selected.filter((i) => i !== x) : [...selected, x]);
  return <div className="choice"><span>{label}</span><div>{options.map((x) => <button key={x} type="button" className={selected.includes(x) ? "selected" : ""} onClick={() => toggle(x)}>{x}</button>)}</div>{error && <small>{error}</small>}</div>;
}

function Summary({ label, value }) {
  return <div className="summary"><span>{label}</span><strong>{value}</strong></div>;
}

const styles = `
.onboarding-page{min-height:calc(100vh - 80px);padding:24px;background:radial-gradient(circle at top right,rgba(23,107,44,.06),transparent 32%),#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}
.page-title,.steps-card,.main-card,.score-card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}
.page-title{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}
.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}
.page-title h1{margin:0;font-size:34px;line-height:1.2;letter-spacing:-.04em}.page-title p{margin:7px 0 0;color:#6f746b;line-height:1.8;font-size:14px}
.score-card{min-width:150px;padding:16px;display:grid;place-items:center}.score-card strong{font-size:34px;color:#176b2c}.score-card span{font-size:12px;color:#6f746b;font-weight:900}
.onboarding-layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px;align-items:start}
.steps-card{padding:14px;display:grid;gap:10px;position:sticky;top:96px}.step-item{min-height:72px;border:0;background:transparent;border-radius:18px;padding:12px;display:flex;gap:12px;text-align:right;font-family:inherit;cursor:pointer}.step-item.active{background:#eef7e9;color:#176b2c}.step-item.done{background:#f0fdf4}.step-item>div{width:34px;height:34px;border-radius:999px;background:#f7f8f4;display:grid;place-items:center;font-weight:900;flex:0 0 auto}.step-item.active>div{background:#176b2c;color:#fff}.step-item strong{display:block;font-size:14px}.step-item small{display:block;color:#6f746b;font-size:11px;margin-top:3px}
.main-card{padding:20px}.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e4e7df}.section-header>div{width:48px;height:48px;border-radius:16px;background:#176b2c;color:#fff;display:grid;place-items:center}.section-header h2{margin:0;font-size:22px}.section-header p{margin:5px 0 0;color:#6f746b;font-size:13px}
.grid{display:grid;gap:14px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.field{display:grid;gap:8px}.field.wide{grid-column:1/-1}.field span,.choice>span{font-size:13px;font-weight:900}.input-shell{min-height:46px;border:1px solid #e4e7df;border-radius:16px;background:#fff;display:flex;align-items:center;gap:8px;padding:0 12px}.input-shell input,.field select{width:100%;height:44px;border:0;outline:0;background:transparent;font-family:inherit}.field select{border:1px solid #e4e7df;border-radius:16px;padding:0 12px}.field textarea{min-height:120px;border:1px solid #e4e7df;border-radius:16px;padding:14px;resize:vertical;font-family:inherit;line-height:1.8}.field small,.choice small{color:#dc2626;font-size:12px;font-weight:900}
.choice{margin-top:16px}.choice>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.choice button{min-height:38px;border:1px solid #e4e7df;background:#fff;border-radius:16px;padding:0 13px;font-family:inherit;font-size:12px;font-weight:900;cursor:pointer}.choice button.selected{border-color:#176b2c;background:#eef7e9;color:#176b2c}
.warning{margin-top:16px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;display:flex;gap:8px;align-items:flex-start;font-size:13px;font-weight:800}
.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.summary{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:14px}.summary span{display:block;color:#6f746b;font-size:12px;font-weight:900}.summary strong{display:block;margin-top:6px}
.footer{margin-top:20px;padding-top:16px;border-top:1px solid #e4e7df;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center}.primary,.secondary{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900;cursor:pointer}.primary{border:0;background:#176b2c;color:#fff}.secondary{border:1px solid #e4e7df;background:#fff;color:#1f241d}.secondary:disabled{opacity:.45;cursor:not-allowed}.progress{height:8px;border-radius:999px;background:#eef7e9;overflow:hidden}.progress i{display:block;height:100%;background:#176b2c;border-radius:inherit}
@media(max-width:900px){.page-title,.footer{grid-template-columns:1fr}.onboarding-layout{grid-template-columns:1fr}.steps-card{position:static}.grid.two,.summary-grid{grid-template-columns:1fr}}
`;
