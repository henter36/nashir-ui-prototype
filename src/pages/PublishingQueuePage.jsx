import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Megaphone,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const items = [
  { id: 1, title: "Story عرض الصيف", channel: "Instagram", date: "2026-05-21", time: "10:00", status: "ready", campaign: "إطلاق مجموعة الصيف" },
  { id: 2, title: "Reel وعي", channel: "TikTok", date: "2026-05-21", time: "18:00", status: "review", campaign: "إطلاق مجموعة الصيف" },
  { id: 3, title: "رسالة WhatsApp", channel: "WhatsApp", date: "2026-05-22", time: "12:30", status: "ready", campaign: "عرض نهاية الأسبوع" },
  { id: 4, title: "Email Offer", channel: "Email", date: "2026-05-23", time: "08:00", status: "draft", campaign: "خصومات العيد" },
];

const days = ["2026-05-21", "2026-05-22", "2026-05-23", "2026-05-24", "2026-05-25"];

const statusMap = {
  ready: ["جاهز", "green"],
  review: ["مراجعة", "amber"],
  draft: ["مسودة", "slate"],
};

export default function PublishingQueuePage() {
  const [selectedId, setSelectedId] = useState(items[0].id);
  const selected = items.find((x) => x.id === selectedId) || items[0];

  const stats = useMemo(() => ({
    total: items.length,
    ready: items.filter((x) => x.status === "ready").length,
    review: items.filter((x) => x.status === "review").length,
    draft: items.filter((x) => x.status === "draft").length,
  }), []);

  return (
    <main className="publishing-page" dir="rtl">
      <style>{styles}</style>

      <section className="page-title">
        <div>
          <div className="eyebrow"><CalendarDays size={15}/> Publishing Queue</div>
          <h1>جدولة النشر</h1>
          <p>ما سيُنشر، متى، وعلى أي قناة — مع إبقاء النشر اليدوي والمراجعة البشرية كقاعدة آمنة.</p>
        </div>
        <button type="button" className="primary"><Plus size={16}/> إضافة للنشر</button>
      </section>

      <section className="stats-grid">
        <Stat title="المجدول" value={stats.total} icon={CalendarDays}/>
        <Stat title="جاهز" value={stats.ready} icon={CheckCircle2}/>
        <Stat title="مراجعة" value={stats.review} icon={Clock3}/>
        <Stat title="مسودة" value={stats.draft} icon={Megaphone}/>
      </section>

      <section className="queue-layout">
        <article className="card calendar-card">
          <h2>تقويم النشر</h2>
          <div className="calendar-grid">
            {days.map((day) => (
              <div key={day} className="day-card">
                <strong>{day}</strong>
                <div className="day-items">
                  {items.filter((x) => x.date === day).map((item) => (
                    <button key={item.id} className={selectedId===item.id?"selected":""} onClick={()=>setSelectedId(item.id)}>
                      <span>{item.time}</span>
                      <b>{item.title}</b>
                      <small>{item.channel}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="card detail-card">
          <div className="detail-icon"><Send size={24}/></div>
          <h2>{selected.title}</h2>
          <p>{selected.campaign}</p>
          <Info label="القناة" value={selected.channel}/>
          <Info label="التاريخ" value={selected.date}/>
          <Info label="الوقت" value={selected.time}/>
          <Info label="الحالة" value={statusMap[selected.status][0]}/>
          <div className="actions">
            <button><Eye size={16}/> معاينة</button>
            <button><ShieldCheck size={16}/> مراجعة أخيرة</button>
            <button><Trash2 size={16}/> حذف</button>
          </div>
          <div className="warning">النشر التلقائي معطّل افتراضيًا. المسار الآمن: جدولة ← مراجعة أخيرة ← نشر يدوي.</div>
        </aside>
      </section>

      <section className="card">
        <h2>قائمة الانتظار</h2>
        <div className="table">
          {items.map((item)=><button key={item.id} onClick={()=>setSelectedId(item.id)} className={selectedId===item.id?"active":""}><span>{item.title}</span><span>{item.channel}</span><span>{item.date} · {item.time}</span><Status value={item.status}/></button>)}
        </div>
      </section>
    </main>
  );
}
function Stat({title,value,icon:Icon}){return <article className="stat"><div><span>{title}</span><strong>{value}</strong></div><div><Icon size={21}/></div></article>}
function Info({label,value}){return <div className="info"><span>{label}</span><strong>{value}</strong></div>}
function Status({value}){const [label,cls]=statusMap[value];return <span className={`status ${cls}`}>{label}</span>}

const styles=`
.publishing-page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.page-title,.stat,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.page-title{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-title h1{margin:0;font-size:34px;letter-spacing:-.04em}.page-title p{margin:7px 0 0;color:#6f746b}.primary{min-height:42px;border:0;border-radius:16px;padding:0 16px;background:#176b2c;color:#fff;display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:900;cursor:pointer}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}.stat{min-height:106px;padding:16px;display:flex;align-items:center;justify-content:space-between}.stat span{color:#6f746b;font-size:13px;font-weight:900}.stat strong{display:block;margin-top:8px;font-size:32px}.stat>div:last-child{width:48px;height:48px;border-radius:16px;background:#eef7e9;color:#176b2c;display:grid;place-items:center}.queue-layout{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:16px;margin-bottom:16px}.card{padding:18px}.card h2{margin:0 0 14px;font-size:18px}.calendar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.day-card{min-height:210px;border:1px solid #e4e7df;background:#f7f8f4;border-radius:18px;padding:12px}.day-card>strong{display:block;margin-bottom:10px}.day-items{display:grid;gap:8px}.day-items button{border:1px solid #e4e7df;background:#fff;border-radius:14px;padding:10px;text-align:right;font-family:inherit;cursor:pointer}.day-items button.selected{border-color:#176b2c;background:#eef7e9}.day-items span,.day-items small{display:block;color:#6f746b;font-size:11px}.day-items b{display:block;font-size:12px;margin:4px 0}.detail-icon{width:54px;height:54px;border-radius:18px;background:#176b2c;color:#fff;display:grid;place-items:center;margin-bottom:12px}.detail-card p{color:#6f746b}.info{min-height:44px;border-bottom:1px solid #e4e7df;display:flex;justify-content:space-between;align-items:center}.info span{color:#6f746b;font-size:12px;font-weight:900}.actions{display:grid;gap:9px;margin-top:16px}.actions button{min-height:40px;border:1px solid #e4e7df;background:#fff;border-radius:14px;display:flex;align-items:center;gap:8px;justify-content:center;font-family:inherit;font-weight:900}.warning{margin-top:16px;border:1px solid #fde68a;background:#fff7e6;color:#92400e;border-radius:18px;padding:13px;font-size:12px;line-height:1.8;font-weight:800}.table{display:grid;border:1px solid #e4e7df;border-radius:18px;overflow:hidden}.table button{display:grid;grid-template-columns:1.2fr .7fr 1fr .5fr;gap:12px;padding:13px 14px;border:0;border-top:1px solid #e4e7df;background:#fff;text-align:right;font-family:inherit}.table button:first-child{border-top:0}.table button.active{background:#fbfdf9}.status{width:fit-content;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900}.status.green{background:#f0fdf4;color:#166534}.status.amber{background:#fffbeb;color:#92400e}.status.slate{background:#f8fafc;color:#475569}@media(max-width:1100px){.stats-grid,.queue-layout,.calendar-grid{grid-template-columns:1fr}.table{overflow:auto}.table button{min-width:720px}}`;
