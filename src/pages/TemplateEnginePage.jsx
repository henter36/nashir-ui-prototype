import { useEffect, useMemo, useState } from "react";
import { Copy, Gift, Search, Share2, Sparkles, Store, Wand2 } from "lucide-react";
import {
  createTemplateFromText,
  deleteTemplate,
  readTemplateRegistry,
  upsertTemplate,
} from "../utils/promptTemplateStore.js";

const templates = [
  { id: 1, title: "إطلاق منتج جديد", occasion: "Launch", type: "جاهز", channel: "Instagram", content: "اكتشف منتجنا الجديد الآن — تجربة مختلفة لفترة محدودة." },
  { id: 2, title: "عرض نهاية الأسبوع", occasion: "Weekend", type: "جاهز", channel: "WhatsApp", content: "عرض خاص لهذا الأسبوع فقط. اطلب الآن قبل انتهاء الكمية." },
  { id: 3, title: "رمضان والعيد", occasion: "Seasonal", type: "جاهز", channel: "Email", content: "مجموعة مختارة لموسم مميز — جودة، هدية، وتجربة أسهل." },
  { id: 4, title: "قالب متجر النمو", occasion: "Custom", type: "مخصص", channel: "TikTok", content: "نبرة ودية وموثوقة مع CTA مباشر يناسب متجر النمو." },
];

export default function TemplateEnginePage() {
  void deleteTemplate;
  const [query, setQuery] = useState("");
  const [templateList, setTemplateList] = useState(() => readTemplateRegistry(templates));
  const [selectedId, setSelectedId] = useState(String(templates[0].id));
  const [customText, setCustomText] = useState("اكتب قالبًا مخصصًا لهذا المتجر...");
  const visibleTemplates = templateList.length ? templateList : templates;
  const selected =
    visibleTemplates.find((x) => String(x.id) === String(selectedId)) ||
    visibleTemplates[0] ||
    templates[0];

  useEffect(() => {
    const reloadTemplates = () => {
      setTemplateList(readTemplateRegistry(templates));
    };

    window.addEventListener("focus", reloadTemplates);
    window.addEventListener("storage", reloadTemplates);
    window.addEventListener("nashir-template-engine-updated", reloadTemplates);

    return () => {
      window.removeEventListener("focus", reloadTemplates);
      window.removeEventListener("storage", reloadTemplates);
      window.removeEventListener("nashir-template-engine-updated", reloadTemplates);
    };
  }, []);

  const filtered = useMemo(() => visibleTemplates.filter((x) => `${x.title} ${x.occasion} ${x.channel}`.toLowerCase().includes(query.toLowerCase())), [query, visibleTemplates]);

  const createTemplate = () => {
    const result = createTemplateFromText(customText, {}, templates);
    setTemplateList(result.items);
    setSelectedId(String(result.item.id));
  };

  const updateSelectedTemplateText = (value) => {
    setCustomText(value);

    if (!selected || selected.type !== "مخصص") return;

    const next = upsertTemplate({ ...selected, content: value }, templates);
    setTemplateList(next);
  };

  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>
      <section className="hero"><div><div className="eyebrow"><Wand2 size={15}/> Template Engine</div><h1>محرك القوالب</h1><p>قوالب جاهزة حسب المناسبة، قوالب مخصصة للمتجر، ومشاركة القوالب بين الفريق.</p></div><button className="primary" onClick={createTemplate}><Sparkles size={16}/> إنشاء قالب</button></section>
      <section className="toolbar"><div className="search"><Search size={17}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ابحث في القوالب..." /></div><button>Launch</button><button>Seasonal</button><button>Custom</button></section>
      <section className="layout">
        <article className="card">
          <h2>القوالب</h2>
          <div className="template-grid">{filtered.map((t)=><button key={t.id} onClick={()=>setSelectedId(String(t.id))} className={String(selectedId)===String(t.id)?"selected":""}><div><Gift size={20}/></div><strong>{t.title}</strong><span>{t.type} · {t.channel}</span></button>)}</div>
        </article>
        <aside className="card detail">
          <div className="detail-icon"><Store size={24}/></div><h2>{selected?.title || "قالب غير محدد"}</h2><p>{selected?.occasion || "Custom"} · {selected?.channel || "عام"}</p>
          <textarea value={selected?.type==="مخصص"?customText:(selected?.content || "")} onChange={(e)=>updateSelectedTemplateText(e.target.value)} />
          <div className="actions"><button><Copy size={16}/> نسخ</button><button><Share2 size={16}/> مشاركة</button></div>
          <div className="warning">مشاركة القوالب هنا تجريبية. لاحقًا تحتاج صلاحيات وأثر تدقيق.</div>
        </aside>
      </section>
    </main>
  )
}
const styles=`.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.toolbar,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{margin:7px 0 0;color:#6f746b}.primary,.toolbar button,.actions button{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900;cursor:pointer}.primary{border:0;background:#176b2c;color:#fff}.toolbar{padding:14px;margin-bottom:16px;display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:10px}.toolbar button,.actions button{border:1px solid #e4e7df;background:#fff}.search{height:44px;border:1px solid #e4e7df;border-radius:999px;display:flex;gap:8px;align-items:center;padding:0 12px}.search input{border:0;outline:0;width:100%;font-family:inherit}.layout{display:grid;grid-template-columns:minmax(0,1fr)360px;gap:16px}.card{padding:18px}.card h2{margin:0 0 14px;font-size:18px}.template-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.template-grid button{min-height:150px;border:1px solid #e4e7df;background:#fff;border-radius:20px;text-align:right;padding:14px;font-family:inherit;cursor:pointer}.template-grid button.selected{border-color:#176b2c;background:#eef7e9}.template-grid div{width:42px;height:42px;border-radius:14px;background:#eef7e9;color:#176b2c;display:grid;place-items:center;margin-bottom:12px}.template-grid strong{display:block}.template-grid span{display:block;color:#6f746b;font-size:12px;margin-top:6px}.detail-icon{width:54px;height:54px;border-radius:18px;background:#176b2c;color:#fff;display:grid;place-items:center;margin-bottom:12px}.detail p{color:#6f746b}.detail textarea{width:100%;min-height:190px;border:1px solid #e4e7df;border-radius:16px;padding:14px;font-family:inherit;line-height:1.8}.actions{display:flex;gap:10px;margin-top:12px}.warning{margin-top:14px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;font-size:12px;line-height:1.8;font-weight:800}@media(max-width:1000px){.toolbar,.layout,.template-grid{grid-template-columns:1fr}}`;
