import React from "react";
import { BarChart3, Download, Lightbulb, TrendingUp, Wand2 } from "lucide-react";

const comparisons = [
  ["إطلاق مجموعة الصيف", "2.4x", "+18%", "Instagram"],
  ["عودة إلى المدرسة", "1.8x", "+9%", "Snapchat"],
  ["عرض نهاية الأسبوع", "1.2x", "-3%", "WhatsApp"],
];

const recommendations = [
  "ارفع ميزانية Instagram بنسبة 15% للحملة الأعلى ROI.",
  "قلل الاعتماد على Snapchat حتى يتم تحسين CTA.",
  "اختبر نسخة عرض بدون خصم للحفاظ على الهامش.",
];

export default function SmartAnalyticsPage() {
  return (
    <main className="page" dir="rtl">
      <style>{styles}</style>
      <section className="hero"><div><div className="eyebrow"><Wand2 size={15}/> Smart Analytics</div><h1>التحليلات الذكية</h1><p>مقارنة أداء الحملات، توصيات تحسين AI، وتقارير قابلة للتصدير.</p></div><button className="primary"><Download size={16}/> تصدير التقرير</button></section>
      <section className="stats"><Stat title="أفضل ROI" value="2.4x"/><Stat title="أفضل قناة" value="Instagram"/><Stat title="تحسين مقترح" value="+15%"/><Stat title="فرص اختبار" value="4"/></section>
      <section className="layout">
        <article className="card"><h2>مقارنة الحملات</h2><div className="table">{comparisons.map((row)=><div key={row[0]}>{row.map(cell=><span key={cell}>{cell}</span>)}</div>)}</div></article>
        <article className="card"><h2>توصيات AI</h2><div className="recs">{recommendations.map((rec,i)=><div key={rec}><Lightbulb size={18}/><p>{rec}</p><b>{i+1}</b></div>)}</div></article>
      </section>
      <section className="card chart"><h2>اتجاه الأداء الذكي</h2><div className="chartbox"><TrendingUp size={42}/> ROI ↑ · Reach ↑ · CPA ↓</div></section>
    </main>
  )
}
function Stat({title,value}){return <article className="stat"><span>{title}</span><strong>{value}</strong></article>}
const styles=`.page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.hero,.card,.stat{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.hero{padding:20px;display:flex;justify-content:space-between;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.hero h1{margin:0;font-size:34px;letter-spacing:-.04em}.hero p{color:#6f746b}.primary{min-height:42px;border:0;border-radius:16px;padding:0 16px;background:#176b2c;color:#fff;display:flex;align-items:center;gap:8px;font-weight:900}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.stat{padding:16px;min-height:100px}.stat span{color:#6f746b;font-size:13px;font-weight:900}.stat strong{display:block;margin-top:8px;font-size:28px}.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.card{padding:18px}.card h2{margin:0 0 14px}.table{display:grid;border:1px solid #e4e7df;border-radius:18px;overflow:hidden}.table div{display:grid;grid-template-columns:1.3fr repeat(3,1fr);padding:13px;border-top:1px solid #e4e7df}.table div:first-child{border-top:0}.table span:first-child{font-weight:900}.recs{display:grid;gap:10px}.recs div{border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:13px;display:grid;grid-template-columns:24px 1fr 28px;gap:10px;align-items:center}.recs p{margin:0;line-height:1.7}.recs b{width:28px;height:28px;border-radius:999px;background:#eef7e9;color:#176b2c;display:grid;place-items:center}.chartbox{min-height:260px;border:1px solid #e4e7df;border-radius:20px;background:linear-gradient(135deg,#eef7e9,#fff);display:grid;place-items:center;color:#176b2c;font-size:24px;font-weight:1000}@media(max-width:900px){.stats,.layout{grid-template-columns:1fr}}`;