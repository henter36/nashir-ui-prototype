import React, { useState } from "react";
import { CheckCircle2, Globe2, Layers, Link2, RefreshCw, Smartphone, Users } from "lucide-react";

const accounts = [
  ["Instagram", "@growth_store", "مرتبط"],
  ["TikTok", "@growth_store", "مرتبط"],
  ["Snapchat", "growth.snap", "بانتظار"],
  ["WhatsApp", "+966 5X XXX XXXX", "مرتبط"],
  ["Email", "marketing@example.com", "مرتبط"],
];

const sizes = [
  ["Instagram Story", "1080 × 1920", "جاهز"],
  ["Instagram Post", "1080 × 1080", "جاهز"],
  ["TikTok Video", "1080 × 1920", "يحتاج فيديو"],
  ["Email Header", "1200 × 600", "جاهز"],
];

export default function MultiPlatformPage() {
  const [selected, setSelected] = useState(["Instagram", "TikTok", "WhatsApp"]);

  const toggle = (name) => setSelected(selected.includes(name) ? selected.filter((x)=>x!==name) : [...selected, name]);

  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>
      <section className="hero"><div><div className="eyebrow"><Layers size={15}/> Multi-Platform</div><h1>النشر متعدد القنوات</h1><p>نشر متزامن، تكييف المقاسات تلقائيًا، وإدارة حسابات متعددة.</p></div><button className="primary"><RefreshCw size={16}/> تحديث الحسابات</button></section>
      <section className="grid">
        <article className="card">
          <h2>الحسابات المتصلة</h2>
          <div className="account-list">{accounts.map(([platform, account, status])=><button key={platform} className={selected.includes(platform)?"selected":""} onClick={()=>toggle(platform)}><div><Globe2 size={18}/><span><strong>{platform}</strong><small>{account}</small></span></div><b>{status}</b></button>)}</div>
        </article>
        <article className="card">
          <h2>تكييف المقاسات تلقائيًا</h2>
          <div className="size-grid">{sizes.map(([name,size,status])=><div key={name}><div><Smartphone size={18}/><strong>{name}</strong></div><span>{size}</span><b>{status}</b></div>)}</div>
        </article>
        <aside className="card">
          <h2>ملخص النشر</h2>
          <div className="summary"><span>القنوات المختارة</span><strong>{selected.length}</strong></div>
          <div className="summary"><span>المقاسات الجاهزة</span><strong>3/4</strong></div>
          <div className="summary"><span>حسابات متعددة</span><strong>مفعلة</strong></div>
          <div className="warning">النشر المتزامن هنا محاكاة فقط. التنفيذ الحقيقي يحتاج موافقة نهائية لكل قناة.</div>
        </aside>
      </section>
    </main>
  )
}
const styles=`.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{margin:7px 0 0;color:#6f746b}.primary{min-height:42px;border:0;border-radius:16px;padding:0 16px;background:#176b2c;color:#fff;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900}.grid{display:grid;grid-template-columns:360px minmax(0,1fr)300px;gap:16px}.card{padding:18px}.card h2{margin:0 0 14px}.account-list{display:grid;gap:10px}.account-list button{border:1px solid #e4e7df;background:#fff;border-radius:18px;padding:13px;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:right;font-family:inherit;cursor:pointer}.account-list button.selected{border-color:#176b2c;background:#eef7e9}.account-list div{display:flex;gap:10px;align-items:center}.account-list strong{display:block}.account-list small{display:block;color:#6f746b}.account-list b{font-size:12px;color:#176b2c}.size-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.size-grid>div{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:14px}.size-grid div div{display:flex;gap:8px;color:#176b2c}.size-grid span{display:block;margin-top:10px;color:#6f746b}.size-grid b{display:block;margin-top:6px}.summary{border-bottom:1px solid #e4e7df;min-height:44px;display:flex;justify-content:space-between;align-items:center}.summary span{color:#6f746b;font-size:12px;font-weight:900}.warning{margin-top:16px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;line-height:1.8;font-size:12px;font-weight:800}@media(max-width:1100px){.grid,.size-grid{grid-template-columns:1fr}}`;