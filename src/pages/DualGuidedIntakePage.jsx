import React, { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Wand2, Bot, ArrowLeft, ArrowRight } from "lucide-react";

const PRODUCTS = ["عطر أرابيان أود", "حذاء رياضي نايك", "ساعة كاسيو", "كريم مرطب نيفيا"];
const CHANNELS = ["Instagram", "TikTok", "Snapchat", "WhatsApp", "Email"];

export default function DualGuidedIntakePage() {
  const [mode, setMode] = useState("wizard");
  const [step, setStep] = useState(1);
  const [agentLoading, setAgentLoading] = useState(false);
  const [form, setForm] = useState({
    campaignName: "",
    product: "",
    goal: "زيادة المبيعات",
    audience: "",
    channels: ["Instagram", "WhatsApp"],
    message: "",
    agentPrompt: "",
  });

  const score = useMemo(() => {
    let value = 0;
    if (form.campaignName) value += 18;
    if (form.product) value += 18;
    if (form.goal) value += 14;
    if (form.audience) value += 18;
    if (form.channels.length) value += 14;
    if (form.message) value += 18;
    return value;
  }, [form]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleChannel = (channel) =>
    update("channels", form.channels.includes(channel) ? form.channels.filter((x) => x !== channel) : [...form.channels, channel]);

  const parseAgent = () => {
    if (!form.agentPrompt.trim()) return;
    setAgentLoading(true);
    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        campaignName: prev.campaignName || "حملة مستخرجة من الوصف",
        product: prev.product || "عطر أرابيان أود",
        goal: "زيادة المبيعات",
        audience: prev.audience || "نساء 25-34 في الرياض وجدة مهتمات بالجمال والعطور",
        channels: prev.channels.length ? prev.channels : ["Instagram", "TikTok", "WhatsApp"],
        message: prev.message || "اكتشف عرضًا خاصًا لفترة محدودة مع تجربة شراء سهلة وموثوقة.",
      }));
      setAgentLoading(false);
      setMode("wizard");
      setStep(4);
    }, 1400);
  };

  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>

      <section className="hero">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> Dual Guided Intake</div>
          <h1>إدخال ذكي للحملة بطريقتين</h1>
          <p>Smart Wizard للمبتدئين، وAgent Mode للمحترفين، مع تحويل تلقائي يحافظ على البيانات المشتركة.</p>
        </div>
        <div className="switcher">
          <button className={mode === "wizard" ? "active" : ""} onClick={() => setMode("wizard")}>🧙 Smart Wizard</button>
          <button className={mode === "agent" ? "active" : ""} onClick={() => setMode("agent")}>⚡ Agent Mode</button>
        </div>
      </section>

      {mode === "wizard" ? (
        <>
          <section className="steps">
            {[1,2,3,4].map((item) => (
              <button key={item} className={step === item ? "active" : step > item ? "done" : ""} onClick={() => setStep(item)}>
                {step > item ? "✓" : item}
              </button>
            ))}
            <div className="progress"><i style={{ width: `${(step / 4) * 100}%` }} /></div>
          </section>

          <section className="layout">
            <article className="card">
              {step === 1 && (
                <>
                  <Title icon={Wand2} title="أساسيات الحملة" desc="حقول قليلة فقط حتى لا نزيد التسرب." />
                  <Field label="اسم الحملة" value={form.campaignName} onChange={(v)=>update("campaignName", v)} />
                  <Choice label="المنتج" options={PRODUCTS} value={form.product} onChange={(v)=>update("product", v)} />
                  <Choice label="الهدف" options={["زيادة المبيعات", "رفع الوعي", "إطلاق منتج", "إعادة تنشيط"]} value={form.goal} onChange={(v)=>update("goal", v)} />
                </>
              )}

              {step === 2 && (
                <>
                  <Title icon={Bot} title="الجمهور" desc="وصف مختصر للجمهور المستهدف." />
                  <TextArea label="الجمهور المستهدف" value={form.audience} onChange={(v)=>update("audience", v)} placeholder="مثال: نساء 25-34 في الرياض وجدة مهتمات بالجمال..." />
                </>
              )}

              {step === 3 && (
                <>
                  <Title icon={Sparkles} title="القنوات" desc="قنوات مقترحة يمكن تعديلها." />
                  <Multi label="القنوات" options={CHANNELS} selected={form.channels} onToggle={toggleChannel} />
                </>
              )}

              {step === 4 && (
                <>
                  <Title icon={CheckCircle2} title="الرسالة والمراجعة" desc="راجع الرسالة والجاهزية قبل التوليد." />
                  <TextArea label="الرسالة الرئيسية" value={form.message} onChange={(v)=>update("message", v)} placeholder="اكتب رسالة قصيرة وواضحة..." />
                  <div className="summary">
                    <Summary label="المنتج" value={form.product || "غير محدد"} />
                    <Summary label="الهدف" value={form.goal || "غير محدد"} />
                    <Summary label="القنوات" value={form.channels.join("، ") || "غير محدد"} />
                    <Summary label="الجاهزية" value={`${score}%`} />
                  </div>
                </>
              )}

              <div className="actions">
                <button className="secondary" disabled={step === 1} onClick={() => setStep((s)=>Math.max(1, s-1))}><ArrowRight size={16}/> رجوع</button>
                <button className="primary" onClick={() => step < 4 ? setStep((s)=>s+1) : alert("تم توليد حملة تجريبية")}>
                  {step < 4 ? "التالي" : "توليد الحملة"} <ArrowLeft size={16}/>
                </button>
              </div>
            </article>

            <aside className="smart">
              <strong>توصية ذكية</strong>
              <p>استخدم المعالج عندما تريد إدخالًا سريعًا ومحكومًا. استخدم Agent Mode إذا كان لديك وصف كامل للحملة.</p>
              <div className={score >= 60 ? "score ok" : "score"}>{score}%</div>
            </aside>
          </section>
        </>
      ) : (
        <section className="layout">
          <article className="card">
            <Title icon={Bot} title="Agent Mode" desc="اكتب وصف الحملة بحرية وسيحوّلها النظام إلى ملخص جاهز." />
            <TextArea tall label="وصف الحملة" value={form.agentPrompt} onChange={(v)=>update("agentPrompt", v)} placeholder="صف حملتك بحرية..." />
            {agentLoading ? <div className="skeleton"><span/><span/><span/></div> : null}
            <div className="actions">
              <span />
              <button className="primary" onClick={parseAgent}>Parse & Generate</button>
            </div>
          </article>
          <aside className="smart">
            <strong>Advanced Parameters</strong>
            <Field label="ميزانية تقريبية" value="" onChange={()=>{}} placeholder="5000 SAR" />
            <Multi label="قنوات مفضلة" options={CHANNELS} selected={form.channels} onToggle={toggleChannel} />
          </aside>
        </section>
      )}
    </main>
  );
}

function Title({ icon: Icon, title, desc }) {
  return <div className="title"><div><Icon size={22}/></div><span><h2>{title}</h2><p>{desc}</p></span></div>;
}
function Field({ label, value, onChange, placeholder }) {
  return <label className="field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)} /></label>;
}
function TextArea({ label, value, onChange, placeholder, tall }) {
  return <label className="field"><span>{label}</span><textarea className={tall ? "tall" : ""} value={value} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)} /></label>;
}
function Choice({ label, options, value, onChange }) {
  return <div className="choice"><span>{label}</span><div>{options.map((x)=><button key={x} className={value===x?"selected":""} onClick={()=>onChange(x)}>{x}</button>)}</div></div>;
}
function Multi({ label, options, selected, onToggle }) {
  return <div className="choice"><span>{label}</span><div>{options.map((x)=><button key={x} className={selected.includes(x)?"selected":""} onClick={()=>onToggle(x)}>{x}</button>)}</div></div>;
}
function Summary({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

const styles = `
.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.card,.smart,.steps{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{margin:7px 0 0;color:#6f746b}.switcher{background:#f7f8f4;border:1px solid #e4e7df;border-radius:999px;padding:5px;display:flex;gap:5px;align-self:start}.switcher button{border:0;background:transparent;border-radius:999px;min-height:38px;padding:0 14px;font-weight:900;cursor:pointer}.switcher button.active{background:#176b2c;color:#fff}.steps{padding:14px;margin-bottom:16px;display:flex;gap:8px;align-items:center}.steps button{width:34px;height:34px;border:0;border-radius:999px;background:#f7f8f4;color:#6f746b;font-weight:900}.steps button.active{background:#176b2c;color:#fff}.steps button.done{background:#d9ead7;color:#176b2c}.progress{height:7px;flex:1;background:#eef7e9;border-radius:999px;overflow:hidden}.progress i{display:block;height:100%;background:#176b2c}.layout{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:16px;align-items:start}.card,.smart{padding:20px}.title{display:flex;gap:12px;align-items:center;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #e4e7df}.title>div{width:48px;height:48px;border-radius:16px;background:#176b2c;color:#fff;display:grid;place-items:center}.title h2{margin:0;font-size:22px}.title p{margin:5px 0 0;color:#6f746b}.field{display:grid;gap:8px;margin-bottom:14px}.field span,.choice>span{font-size:13px;font-weight:900}.field input,.field textarea{border:1px solid #e4e7df;border-radius:16px;padding:13px 14px;font-family:inherit;outline:0}.field input{height:46px}.field textarea{min-height:120px;resize:vertical;line-height:1.8}.field textarea.tall{min-height:260px}.choice{margin-bottom:16px}.choice>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.choice button{min-height:38px;border:1px solid #e4e7df;background:#fff;border-radius:16px;padding:0 13px;font-family:inherit;font-size:12px;font-weight:900;cursor:pointer}.choice button.selected{border-color:#176b2c;background:#eef7e9;color:#176b2c}.summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.summary div{background:#f7f8f4;border:1px solid #e4e7df;border-radius:16px;padding:12px}.summary span{display:block;color:#6f746b;font-size:12px;font-weight:900}.summary strong{display:block;margin-top:5px}.actions{margin-top:18px;padding-top:16px;border-top:1px solid #e4e7df;display:flex;justify-content:space-between;gap:10px}.primary,.secondary{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900;cursor:pointer}.primary{border:0;background:#176b2c;color:#fff}.secondary{border:1px solid #e4e7df;background:#fff}.secondary:disabled{opacity:.45}.smart{position:sticky;top:96px}.smart strong{display:block;color:#176b2c;margin-bottom:8px}.smart p{color:#6f746b;line-height:1.8}.score{width:82px;height:82px;border-radius:999px;border:8px solid #dc2626;display:grid;place-items:center;font-weight:1000;background:#fff}.score.ok{border-color:#176b2c;color:#176b2c}.skeleton{display:grid;gap:10px}.skeleton span{height:18px;border-radius:999px;background:linear-gradient(90deg,#f7f8f4,#e4e7df,#f7f8f4);animation:pulse 1s infinite}@keyframes pulse{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}@media(max-width:900px){.hero,.layout{grid-template-columns:1fr;display:grid}.smart{position:static}.summary{grid-template-columns:1fr}}`;
