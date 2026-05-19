import React, { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  ImageIcon,
  Megaphone,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const campaign = {
  name: "إطلاق مجموعة الصيف",
  product: "عطر أرابيان أود",
  goal: "Launch",
  status: "نشطة",
  readiness: 84,
  budget: "5,000 SAR",
  dates: "10 مارس → 15 مارس",
  owner: "أحمد",
};

const outputs = [
  ["Caption Instagram", "معتمد", "Instagram", "نص إعلاني قصير جاهز للمراجعة النهائية."],
  ["Reel Script", "مراجعة", "TikTok", "سكريبت فيديو قصير يحتاج CTA أوضح."],
  ["WhatsApp Message", "معتمد", "WhatsApp", "رسالة مباشرة لإعادة التنشيط."],
  ["Email Subject", "مسودة", "Email", "عنوان بريدي يحتاج تحسين."],
];

const edits = [
  ["تم تعديل الرسالة الرئيسية", "أحمد", "منذ 35 دقيقة"],
  ["تم طلب مراجعة Reel Script", "سارة", "منذ ساعة"],
  ["تم تحديث الجمهور المستهدف", "System", "منذ ساعتين"],
];

export default function CampaignDetailPage() {
  const [tab, setTab] = useState("overview");

  return (
    <main className="campaign-detail-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow"><Megaphone size={15} /> Campaign Detail</div>
          <h1>{campaign.name}</h1>
          <p>{campaign.product} · {campaign.goal} · {campaign.dates}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary"><Edit3 size={16} /> تعديل</button>
          <button type="button" className="primary"><Sparkles size={16} /> توليد مخرجات</button>
        </div>
      </section>

      <section className="kpi-grid">
        <Kpi title="الجاهزية" value={`${campaign.readiness}%`} icon={CheckCircle2} />
        <Kpi title="الميزانية" value={campaign.budget} icon={BarChart3} />
        <Kpi title="المخرجات" value={outputs.length} icon={FileText} />
        <Kpi title="التفاعل المتوقع" value="+18%" icon={TrendingUp} />
      </section>

      <section className="tabs">
        {["overview", "outputs", "performance", "changes"].map((item) => (
          <button key={item} type="button" className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item === "overview" ? "نظرة عامة" : item === "outputs" ? "المخرجات" : item === "performance" ? "الأداء" : "التعديلات"}
          </button>
        ))}
      </section>

      {tab === "overview" && (
        <section className="layout">
          <article className="card">
            <h2>ملخص الحملة</h2>
            <div className="summary-grid">
              <Info label="الحالة" value={campaign.status} />
              <Info label="المالك" value={campaign.owner} />
              <Info label="الهدف" value={campaign.goal} />
              <Info label="الفترة" value={campaign.dates} />
            </div>
            <div className="warning"><AlertTriangle size={18} /> أي نشر فعلي يجب أن يمر عبر مراجعة بشرية وسجل تدقيق.</div>
          </article>
          <aside className="card">
            <h2>قنوات الحملة</h2>
            <div className="chips">{["Instagram", "TikTok", "WhatsApp", "Email"].map((x) => <span key={x}>{x}</span>)}</div>
            <h2 className="mt">الأصول المستخدمة</h2>
            <div className="asset-row"><ImageIcon size={18} /> صورة المنتج الرئيسية</div>
            <div className="asset-row"><FileText size={18} /> وصف المنتج</div>
          </aside>
        </section>
      )}

      {tab === "outputs" && (
        <section className="card">
          <h2>مخرجات الحملة</h2>
          <div className="output-list">
            {outputs.map(([name, status, channel, text]) => (
              <div key={name} className="output-row">
                <div><strong>{name}</strong><span>{channel}</span></div>
                <p>{text}</p>
                <Status value={status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "performance" && (
        <section className="card">
          <h2>الأداء</h2>
          <div className="chart-placeholder">ROI 2.4x · Reach 38K · Conversions 124</div>
          <div className="summary-grid">
            <Info label="الوصول" value="38K" />
            <Info label="التحويلات" value="124" />
            <Info label="CPA" value="18 SAR" />
            <Info label="ROI" value="2.4x" />
          </div>
        </section>
      )}

      {tab === "changes" && (
        <section className="card">
          <h2>سجل التعديلات</h2>
          <div className="timeline">
            {edits.map(([action, actor, time]) => (
              <div key={action} className="timeline-row"><Clock3 size={17} /><div><strong>{action}</strong><span>{actor} · {time}</span></div></div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Kpi({ title, value, icon: Icon }) {
  return <article className="kpi"><div><span>{title}</span><strong>{value}</strong></div><div><Icon size={21} /></div></article>;
}
function Info({ label, value }) {
  return <div className="info"><span>{label}</span><strong>{value}</strong></div>;
}
function Status({ value }) {
  const cls = value === "معتمد" ? "green" : value === "مراجعة" ? "amber" : "slate";
  return <span className={`status ${cls}`}>{value}</span>;
}

const styles = `
.campaign-detail-page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}
.page-title,.kpi,.card,.tabs{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}
.page-title{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-title h1{margin:0;font-size:34px;letter-spacing:-.04em}.page-title p{margin:7px 0 0;color:#6f746b}.header-actions{display:flex;gap:10px}.primary,.secondary{min-height:42px;border-radius:16px;padding:0 16px;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900;cursor:pointer}.primary{border:0;background:#176b2c;color:#fff}.secondary{border:1px solid #e4e7df;background:#fff}
.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}.kpi{min-height:106px;padding:16px;display:flex;align-items:center;justify-content:space-between}.kpi span{color:#6f746b;font-size:13px;font-weight:900}.kpi strong{display:block;margin-top:8px;font-size:28px}.kpi>div:last-child{width:46px;height:46px;border-radius:16px;background:#eef7e9;color:#176b2c;display:grid;place-items:center}
.tabs{padding:8px;display:flex;gap:8px;margin-bottom:16px}.tabs button{min-height:38px;border:0;background:transparent;border-radius:999px;padding:0 14px;font-family:inherit;font-weight:900;cursor:pointer}.tabs button.active{background:#176b2c;color:#fff}
.layout{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:16px}.card{padding:18px}.card h2{margin:0 0 14px;font-size:18px}.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.info{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:13px}.info span{display:block;color:#6f746b;font-size:12px;font-weight:900}.info strong{display:block;margin-top:5px}.warning{margin-top:16px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;display:flex;gap:8px;font-weight:800}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chips span{border:1px solid #e4e7df;background:#eef7e9;color:#176b2c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}.mt{margin-top:20px!important}.asset-row{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:12px;display:flex;gap:8px;margin-top:8px}
.output-list,.timeline{display:grid;gap:10px}.output-row{border:1px solid #e4e7df;border-radius:18px;padding:14px;display:grid;grid-template-columns:220px minmax(0,1fr)120px;gap:12px;align-items:center}.output-row strong{display:block}.output-row span{display:block;color:#6f746b;font-size:12px}.output-row p{margin:0;color:#374151}.status{width:fit-content;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}.status.green{background:#f0fdf4;color:#166534}.status.amber{background:#fffbeb;color:#92400e}.status.slate{background:#f8fafc;color:#475569}
.chart-placeholder{min-height:240px;border:1px solid #e4e7df;background:linear-gradient(135deg,#eef7e9,#fff);border-radius:20px;display:grid;place-items:center;color:#176b2c;font-size:22px;font-weight:1000;margin-bottom:14px}.timeline-row{border:1px solid #e4e7df;background:#f7f8f4;border-radius:16px;padding:12px;display:flex;gap:10px}.timeline-row span{display:block;color:#6f746b;font-size:12px;margin-top:3px}
@media(max-width:900px){.page-title,.layout{grid-template-columns:1fr;display:grid}.kpi-grid,.summary-grid{grid-template-columns:1fr}.output-row{grid-template-columns:1fr}}
`;
