import React, { useState } from "react";
import { Eye, ImageIcon, Megaphone, MonitorSmartphone, Smartphone, Sparkles } from "lucide-react";

const platforms = ["Instagram", "TikTok", "Snapchat", "WhatsApp", "Email", "Ad Preview"];

export default function LivePreviewPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [content, setContent] = useState("اكتشف عرضنا الجديد لفترة محدودة. جودة موثوقة وتجربة شراء أسهل.");
  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>
      <section className="hero"><div><div className="eyebrow"><Eye size={15}/> Live Preview</div><h1>معاينة المحتوى قبل النشر</h1><p>محاكاة كل منصة ومعاينة الإعلانات قبل اعتماد النشر.</p></div></section>
      <section className="layout">
        <article className="card editor"><h2>المحتوى</h2><textarea value={content} onChange={(e)=>setContent(e.target.value)} /><div className="platforms">{platforms.map(p=><button key={p} className={platform===p?"active":""} onClick={()=>setPlatform(p)}>{p}</button>)}</div></article>
        <article className="card preview"><div className="phone"><div className="phone-top"><Smartphone size={18}/><strong>{platform}</strong></div><div className="media"><ImageIcon size={42}/></div><p>{content}</p><button>CTA: اطلب الآن</button></div></article>
        <aside className="card checks"><h2>فحص قبل النشر</h2>{["الطول مناسب", "CTA موجود", "لا توجد كلمات محظورة", "الصيغة مناسبة للمنصة"].map((x)=><div className="check" key={x}><Sparkles size={16}/>{x}</div>)}<div className="adbox"><Megaphone size={18}/> معاينة الإعلان هنا محاكاة فقط ولا تعني إرسالًا لمنصة إعلانية.</div></aside>
      </section>
    </main>
  )
}
const styles=`.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{margin:7px 0 0;color:#6f746b}.layout{display:grid;grid-template-columns:360px minmax(0,1fr)300px;gap:16px}.card{padding:18px}.card h2{margin:0 0 14px}.editor textarea{width:100%;min-height:240px;border:1px solid #e4e7df;border-radius:16px;padding:14px;font-family:inherit;line-height:1.8}.platforms{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.platforms button{border:1px solid #e4e7df;background:#fff;border-radius:999px;min-height:36px;padding:0 12px;font-weight:900}.platforms button.active{background:#176b2c;color:#fff}.preview{display:grid;place-items:center}.phone{width:min(360px,100%);min-height:560px;border:10px solid #111827;border-radius:38px;background:#fff;padding:16px}.phone-top{display:flex;gap:8px;align-items:center;border-bottom:1px solid #e4e7df;padding-bottom:12px}.media{height:260px;border-radius:22px;background:linear-gradient(135deg,#eef7e9,#eff6ff);display:grid;place-items:center;color:#176b2c;margin:16px 0}.phone p{line-height:1.8}.phone button{width:100%;min-height:42px;border:0;border-radius:16px;background:#176b2c;color:#fff;font-weight:900}.checks{display:grid;gap:10px;align-content:start}.check{border:1px solid #e4e7df;border-radius:16px;background:#f7f8f4;padding:12px;display:flex;gap:8px;color:#176b2c;font-weight:900}.adbox{border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;line-height:1.8;font-size:12px;font-weight:800}@media(max-width:1100px){.layout{grid-template-columns:1fr}}`;