import React, { useMemo, useState } from "react";
import {
  BarChart3,
  DollarSign,
  LineChart,
  MousePointerClick,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

const campaigns = [
  ["إطلاق مجموعة الصيف", "38K", "124", "2.4x", "18 SAR"],
  ["عودة إلى المدرسة", "21K", "86", "1.8x", "24 SAR"],
  ["عرض نهاية الأسبوع", "12K", "44", "1.2x", "31 SAR"],
  ["خصومات العيد", "46K", "168", "3.1x", "15 SAR"],
];

const channels = [
  ["Instagram", 82, "3.6K", "12.4%"],
  ["TikTok", 76, "2.8K", "10.1%"],
  ["Snapchat", 48, "1.4K", "6.2%"],
  ["Email", 38, "920", "4.8%"],
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");

  const stats = useMemo(() => ({
    roi: "2.4x",
    reach: "117K",
    conversions: "422",
    cpa: "19 SAR",
  }), []);

  return (
    <main className="analytics-page" dir="rtl">
      <style>{styles}</style>
      <section className="page-title">
        <div>
          <div className="eyebrow"><BarChart3 size={15} /> Analytics</div>
          <h1>تقارير الأداء</h1>
          <p>تحليل ROI والوصول والتحويلات ومقارنة الحملات والقنوات.</p>
        </div>
        <div className="range-switch">
          {["7d","30d","90d"].map((item) => <button key={item} className={range===item?"active":""} onClick={()=>setRange(item)}>{item}</button>)}
        </div>
      </section>

      <section className="stats-grid">
        <Stat title="ROI" value={stats.roi} icon={DollarSign} />
        <Stat title="الوصول" value={stats.reach} icon={Users} />
        <Stat title="التحويلات" value={stats.conversions} icon={MousePointerClick} />
        <Stat title="CPA" value={stats.cpa} icon={Percent} />
      </section>

      <section className="analytics-grid">
        <article className="card chart-card">
          <div className="card-header"><h2>اتجاه الأداء</h2><button><RefreshCw size={15}/> تحديث</button></div>
          <svg viewBox="0 0 760 280" className="chart">
            {[45,90,135,180,225].map(y=><line key={y} x1="40" x2="730" y1={y} y2={y} className="grid-line"/>)}
            <path d="M45 210 C120 170, 170 125, 245 150 S360 215, 435 135 S560 90, 705 155" className="main-line"/>
            <path d="M45 210 C120 170, 170 125, 245 150 S360 215, 435 135 S560 90, 705 155 L705 240 L45 240 Z" className="area"/>
            {[[45,210],[150,135],[245,150],[355,205],[435,135],[560,90],[705,155]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="6" className="dot"/>)}
          </svg>
        </article>

        <article className="card">
          <h2>أداء القنوات</h2>
          <div className="channel-list">
            {channels.map(([name, value, reach, rate]) => (
              <div className="channel-row" key={name}>
                <div><strong>{name}</strong><span>{reach} · {rate}</span></div>
                <div className="track"><i style={{width:`${value}%`}}/></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h2>مقارنة الحملات</h2>
        <div className="table">
          <div className="head"><span>الحملة</span><span>الوصول</span><span>التحويلات</span><span>ROI</span><span>CPA</span></div>
          {campaigns.map((row)=><div className="row" key={row[0]}>{row.map((cell)=><span key={cell}>{cell}</span>)}</div>)}
        </div>
      </section>
    </main>
  );
}
function Stat({title,value,icon:Icon}){return <article className="stat-card"><div><span>{title}</span><strong>{value}</strong></div><div><Icon size={21}/></div></article>}

const styles=`
.analytics-page{min-height:calc(100vh - 80px);padding:24px;background:#f7f8f4;color:#1f241d;font-family:Inter,"Segoe UI",Tahoma,Arial,sans-serif}.page-title,.stat-card,.card{border:1px solid #e4e7df;background:#fff;border-radius:24px;box-shadow:0 8px 26px rgba(24,38,18,.035)}.page-title{padding:20px;display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{width:fit-content;min-height:30px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;color:#176b2c;background:#eef7e9;font-size:12px;font-weight:900;margin-bottom:10px}.page-title h1{margin:0;font-size:34px;letter-spacing:-.04em}.page-title p{margin:7px 0 0;color:#6f746b}.range-switch{background:#fff;border:1px solid #e4e7df;border-radius:999px;padding:5px;display:flex;gap:5px;align-self:start}.range-switch button{border:0;background:transparent;border-radius:999px;padding:0 14px;min-height:36px;font-weight:900;cursor:pointer}.range-switch button.active{background:#176b2c;color:#fff}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}.stat-card{min-height:106px;padding:16px;display:flex;align-items:center;justify-content:space-between}.stat-card span{color:#6f746b;font-size:13px;font-weight:900}.stat-card strong{display:block;margin-top:8px;font-size:32px}.stat-card>div:last-child{width:48px;height:48px;border-radius:16px;background:#eef7e9;color:#176b2c;display:grid;place-items:center}.analytics-grid{display:grid;grid-template-columns:minmax(0,1.2fr)360px;gap:16px;margin-bottom:16px}.card{padding:18px}.card h2{margin:0 0 14px;font-size:18px}.card-header{display:flex;justify-content:space-between;align-items:center}.card-header button{border:1px solid #e4e7df;background:#fff;border-radius:14px;min-height:36px;padding:0 12px;display:flex;gap:7px;align-items:center;font-family:inherit;font-weight:900}.chart{width:100%;height:auto;min-height:300px;border:1px solid #e4e7df;border-radius:20px;background:#fbfdf9}.grid-line{stroke:#e4e7df;stroke-dasharray:5 7}.main-line{fill:none;stroke:#176b2c;stroke-width:5;stroke-linecap:round}.area{fill:#eef7e9}.dot{fill:#176b2c;stroke:#fff;stroke-width:3}.channel-list{display:grid;gap:14px}.channel-row{border:1px solid #e4e7df;border-radius:16px;padding:13px}.channel-row strong{display:block}.channel-row span{display:block;color:#6f746b;font-size:12px;margin-top:3px}.track{height:8px;background:#e4e7df;border-radius:999px;overflow:hidden;margin-top:10px}.track i{display:block;height:100%;background:#176b2c}.table{border:1px solid #e4e7df;border-radius:18px;overflow:hidden}.head,.row{display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:10px;padding:13px 14px}.head{background:#f7f8f4;color:#6f746b;font-weight:900}.row{border-top:1px solid #e4e7df}.row span:first-child{font-weight:900}@media(max-width:1000px){.stats-grid,.analytics-grid{grid-template-columns:1fr}.head,.row{min-width:720px}.table{overflow:auto}}`;
