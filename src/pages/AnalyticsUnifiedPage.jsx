import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  Lightbulb,
  LineChart,
  MousePointerClick,
  Percent,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";
import {
  deriveMetricsFromCampaigns,
  formatCompactNumber,
  readCampaignMetrics,
  readCampaigns,
  refreshDashboardSummary,
} from "../utils/campaignAnalyticsStore.js";

const campaigns = [
  {
    id: "cmp-001",
    name: "إطلاق مجموعة الصيف",
    channel: "Instagram",
    spend: 5000,
    reach: 38000,
    clicks: 2850,
    conversions: 124,
    revenue: 12000,
    roi: 2.4,
    cpa: 18,
    trend: "+18%",
    status: "strong",
  },
  {
    id: "cmp-002",
    name: "عودة إلى المدرسة",
    channel: "Snapchat",
    spend: 3500,
    reach: 21000,
    clicks: 1380,
    conversions: 86,
    revenue: 6300,
    roi: 1.8,
    cpa: 24,
    trend: "+9%",
    status: "good",
  },
  {
    id: "cmp-003",
    name: "عرض نهاية الأسبوع",
    channel: "WhatsApp",
    spend: 1200,
    reach: 12000,
    clicks: 620,
    conversions: 44,
    revenue: 1450,
    roi: 1.2,
    cpa: 31,
    trend: "-3%",
    status: "weak",
  },
  {
    id: "cmp-004",
    name: "خصومات العيد",
    channel: "Email",
    spend: 7000,
    reach: 46000,
    clicks: 4100,
    conversions: 168,
    revenue: 21700,
    roi: 3.1,
    cpa: 15,
    trend: "+27%",
    status: "strong",
  },
];

const channelPerformance = [
  { name: "Instagram", reach: "38K", engagement: "12.4%", roi: "2.4x", score: 82 },
  { name: "TikTok", reach: "28K", engagement: "10.1%", roi: "2.0x", score: 76 },
  { name: "Snapchat", reach: "21K", engagement: "6.2%", roi: "1.8x", score: 58 },
  { name: "WhatsApp", reach: "12K", engagement: "4.8%", roi: "1.2x", score: 42 },
  { name: "Email", reach: "46K", engagement: "8.9%", roi: "3.1x", score: 88 },
];

const recommendations = [
  {
    title: "ارفع ميزانية Instagram بنسبة 15%",
    reason: "الحملة الأعلى ROI تعتمد على Instagram وتملك معدل تفاعل جيد.",
    impact: "قد يزيد التحويلات مع ضبط سقف CPA.",
    priority: "high",
  },
  {
    title: "أوقف توسيع WhatsApp مؤقتًا",
    reason: "ROI منخفض مقارنة بباقي القنوات، وCPA أعلى من المتوسط.",
    impact: "توفير ميزانية لإعادة اختبار الرسالة.",
    priority: "medium",
  },
  {
    title: "اختبر CTA جديد في Snapchat",
    reason: "الوصول جيد لكن التحويل أقل من المتوقع.",
    impact: "قد يحسن معدل النقر دون زيادة الإنفاق.",
    priority: "medium",
  },
  {
    title: "صدّر تقرير أداء أسبوعي للإدارة",
    reason: "توجد مؤشرات تقديرية تحتاج مراجعة بشرية قبل اعتمادها.",
    impact: "يوثق قرارات تحسين الحملة.",
    priority: "low",
  },
];

const reportRows = [
  ["مصدر ROI", "من بيانات mock / تقديري", "يحتاج ربط منصات"],
  ["مصدر التحويلات", "يدوي / تقديري", "لا تعرض كحقيقة نهائية"],
  ["أفضل قناة", "Email ثم Instagram", "حسب ROI الحالي"],
  ["أعلى مخاطرة", "حقوق الأصول + دقة التحويل", "يتطلب مراجعة"],
];

const ranges = [
  ["7d", "آخر 7 أيام"],
  ["30d", "آخر 30 يوم"],
  ["90d", "آخر 90 يوم"],
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function AnalyticsPage() {
  const [metricList, setMetricList] = useState(() => readCampaignMetrics(campaigns));
  const [range, setRange] = useState("7d");
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0].id);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const reloadMetrics = () => {
      const currentCampaigns = readCampaigns();
      const fallbackMetrics = currentCampaigns.length ? deriveMetricsFromCampaigns(currentCampaigns) : campaigns;
      const nextMetrics = readCampaignMetrics(fallbackMetrics);

      setMetricList(nextMetrics);
      refreshDashboardSummary(currentCampaigns, nextMetrics);
    };

    window.addEventListener("focus", reloadMetrics);
    window.addEventListener("storage", reloadMetrics);
    window.addEventListener("nashir-campaigns-updated", reloadMetrics);
    window.addEventListener("nashir-campaign-metrics-updated", reloadMetrics);

    return () => {
      window.removeEventListener("focus", reloadMetrics);
      window.removeEventListener("storage", reloadMetrics);
      window.removeEventListener("nashir-campaigns-updated", reloadMetrics);
      window.removeEventListener("nashir-campaign-metrics-updated", reloadMetrics);
    };
  }, []);

  const selectedCampaign =
    metricList.find((campaign) => campaign.id === selectedCampaignId) || metricList[0];

  const totals = useMemo(() => {
    const spend = metricList.reduce((sum, campaign) => sum + campaign.spend, 0);
    const revenue = metricList.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const reach = metricList.reduce((sum, campaign) => sum + campaign.reach, 0);
    const conversions = metricList.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const clicks = metricList.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const roi = spend ? revenue / spend : 0;
    const cpa = conversions ? spend / conversions : 0;
    const ctr = reach ? (clicks / reach) * 100 : 0;

    return {
      spend,
      revenue,
      reach,
      conversions,
      clicks,
      roi,
      cpa,
      ctr,
    };
  }, [metricList]);

  if (!selectedCampaign) return null;

  const exportReport = () => {
    setExported(true);
    window.setTimeout(() => setExported(false), 2200);
  };

  return (
    <main className="analytics-unified-page" dir="rtl">
      <style>{styles}</style>

      <section className="analytics-hero">
        <div>
          <div className="eyebrow">
            <Wand2 size={15} />
            Analytics + Smart Analytics
          </div>
          <h1>التحليلات والتوصيات الذكية</h1>
          <p>
            صفحة موحدة تجمع تقارير الأداء، مقارنة الحملات، توصيات AI، ومؤشرات
            قابلة للتصدير مع توضيح أن الأرقام تقديرية حتى يتم ربط المنصات فعليًا.
          </p>
        </div>

        <div className="hero-actions">
          <div className="range-switch">
            {ranges.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={range === id ? "active" : ""}
                onClick={() => setRange(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <button type="button" className="primary-button" onClick={exportReport}>
            <Download size={16} />
            تصدير تقرير
          </button>
        </div>
      </section>

      {exported ? (
        <div className="success-box">
          <CheckCircle2 size={18} />
          تم تجهيز تقرير تجريبي للتصدير. التصدير الحقيقي يحتاج Backend لاحقًا.
        </div>
      ) : null}

      <section className="metrics-grid">
        <MetricCard
          title="ROI تقديري"
          value={`${totals.roi.toFixed(1)}x`}
          subtitle="إيراد / إنفاق"
          icon={TrendingUp}
          tone="green"
        />
        <MetricCard
          title="الوصول"
          value={formatCompactNumber(totals.reach)}
          subtitle="إجمالي الوصول"
          icon={Users}
          tone="blue"
        />
        <MetricCard
          title="التحويلات"
          value={formatNumber(totals.conversions)}
          subtitle="تحويلات تقديرية"
          icon={MousePointerClick}
          tone="green"
        />
        <MetricCard
          title="CPA تقديري"
          value={`${Math.round(totals.cpa)} SAR`}
          subtitle="تكلفة التحويل"
          icon={Percent}
          tone="amber"
        />
      </section>

      <section className="main-grid">
        <article className="card chart-card">
          <div className="card-header">
            <div>
              <h2>اتجاه الأداء</h2>
              <p>رسم مبسط لتغير الوصول والتحويلات خلال الفترة.</p>
            </div>
            <button type="button" className="secondary-button">
              <RefreshCw size={15} />
              تحديث
            </button>
          </div>

          <div className="chart-area">
            <svg viewBox="0 0 760 300" aria-hidden="true">
              {[55, 105, 155, 205, 255].map((y) => (
                <line key={y} x1="44" x2="720" y1={y} y2={y} className="grid-line" />
              ))}

              <path
                d="M52 230 C120 180, 180 130, 250 160 S365 230, 440 150 S565 95, 710 170"
                className="main-line"
              />
              <path
                d="M52 230 C120 180, 180 130, 250 160 S365 230, 440 150 S565 95, 710 170 L710 270 L52 270 Z"
                className="chart-fill"
              />

              {[
                [52, 230],
                [150, 145],
                [250, 160],
                [360, 220],
                [440, 150],
                [565, 95],
                [710, 170],
              ].map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r="6" className="dot" />
              ))}
            </svg>
          </div>

          <div className="chart-warning">
            <AlertTriangle size={17} />
            الأرقام الحالية تقديرية. لا تعتمد ROI/CPA كحقيقة قبل ربط مصادر الأداء.
          </div>
        </article>

        <aside className="card selected-card">
          <div className="card-header">
            <div>
              <h2>تفصيل حملة مختارة</h2>
              <p>{selectedCampaign.name}</p>
            </div>
            <LineChart size={22} />
          </div>

          <CampaignDetail label="القناة" value={selectedCampaign.channel} />
          <CampaignDetail label="الإنفاق" value={`${formatNumber(selectedCampaign.spend)} SAR`} />
          <CampaignDetail label="الوصول" value={formatNumber(selectedCampaign.reach)} />
          <CampaignDetail label="النقرات" value={formatNumber(selectedCampaign.clicks)} />
          <CampaignDetail label="التحويلات" value={formatNumber(selectedCampaign.conversions)} />
          <CampaignDetail label="ROI" value={`${selectedCampaign.roi}x`} />

          <div className="selected-note">
            <Sparkles size={17} />
            <span>
              التوصية: {selectedCampaign.roi >= 2 ? "زد الاستثمار بحذر" : "اختبر رسالة جديدة قبل زيادة الميزانية"}.
            </span>
          </div>
        </aside>
      </section>

      <section className="lower-grid">
        <article className="card comparison-card">
          <div className="card-header">
            <div>
              <h2>مقارنة الحملات</h2>
              <p>اختر حملة من الجدول لرؤية تفاصيلها في البطاقة الجانبية.</p>
            </div>
          </div>

          <div className="campaign-table">
            <div className="table-head">
              <span>الحملة</span>
              <span>القناة</span>
              <span>الوصول</span>
              <span>التحويلات</span>
              <span>ROI</span>
              <span>CPA</span>
              <span>الاتجاه</span>
            </div>

            {metricList.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                className={`table-row ${selectedCampaign.id === campaign.id ? "selected" : ""}`}
                onClick={() => setSelectedCampaignId(campaign.id)}
              >
                <span className="campaign-name">{campaign.name}</span>
                <span>{campaign.channel}</span>
                <span>{formatNumber(campaign.reach)}</span>
                <span>{formatNumber(campaign.conversions)}</span>
                <span>{campaign.roi}x</span>
                <span>{campaign.cpa} SAR</span>
                <span className={campaign.trend.startsWith("+") ? "trend up" : "trend down"}>
                  {campaign.trend}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="card recommendations-card">
          <div className="card-header">
            <div>
              <h2>توصيات AI</h2>
              <p>توصيات تحسين مبنية على الأداء الحالي.</p>
            </div>
            <Lightbulb size={22} />
          </div>

          <div className="recommendation-list">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.title} className={`recommendation ${recommendation.priority}`}>
                <div className="recommendation-index">{index + 1}</div>
                <div>
                  <strong>{recommendation.title}</strong>
                  <p>{recommendation.reason}</p>
                  <span>{recommendation.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card channels-card">
          <div className="card-header">
            <div>
              <h2>أداء القنوات</h2>
              <p>مقارنة سريعة حسب القناة.</p>
            </div>
          </div>

          <div className="channel-list">
            {channelPerformance.map((channel) => (
              <div key={channel.name} className="channel-row">
                <div>
                  <strong>{channel.name}</strong>
                  <span>{channel.reach} · {channel.engagement} · {channel.roi}</span>
                </div>

                <div className="track">
                  <i style={{ width: `${channel.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card export-card">
          <div className="card-header">
            <div>
              <h2>جاهزية التقرير</h2>
              <p>ما الذي سيتم تضمينه عند التصدير.</p>
            </div>
          </div>

          <div className="report-list">
            {reportRows.map(([label, value, note]) => (
              <div key={label} className="report-row">
                <strong>{label}</strong>
                <span>{value}</span>
                <small>{note}</small>
              </div>
            ))}
          </div>

          <button type="button" className="secondary-button full" onClick={exportReport}>
            <Download size={16} />
            تصدير نسخة PDF لاحقًا
          </button>
        </article>
      </section>
    </main>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
      <div className="metric-icon">
        <Icon size={21} />
      </div>
    </article>
  );
}

function CampaignDetail({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.analytics-unified-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.06), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.analytics-hero,
.metric-card,
.card,
.success-box {
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 26px rgba(24, 38, 18, 0.035);
}

.analytics-hero {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.eyebrow {
  width: fit-content;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #176b2c;
  background: #eef7e9;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 10px;
}

.analytics-hero h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.analytics-hero p {
  margin: 7px 0 0;
  max-width: 840px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.hero-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.range-switch {
  min-height: 42px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.range-switch button {
  min-height: 32px;
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 0 12px;
  color: #6f746b;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.range-switch button.active {
  color: #fff;
  background: #176b2c;
}

.primary-button,
.secondary-button {
  min-height: 42px;
  border-radius: 16px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  color: #fff;
  background: #176b2c;
  border: 0;
  box-shadow: 0 12px 24px rgba(23, 107, 44, 0.16);
}

.secondary-button {
  border: 1px solid #e4e7df;
  background: #fff;
  color: #1f241d;
}

.full {
  width: 100%;
}

.success-box {
  margin-bottom: 16px;
  padding: 13px 14px;
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  font-weight: 900;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.metric-card {
  min-height: 108px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.metric-card span {
  color: #6f746b;
  font-size: 13px;
  font-weight: 900;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
  line-height: 1;
}

.metric-card small {
  display: block;
  margin-top: 7px;
  color: #6f746b;
  font-size: 11px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
}

.metric-card.green .metric-icon {
  color: #176b2c;
  background: #eef7e9;
}

.metric-card.blue .metric-icon {
  color: #2563eb;
  background: #eff6ff;
}

.metric-card.amber .metric-icon {
  color: #92400e;
  background: #fffbeb;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
}

.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(330px, 0.8fr);
  gap: 16px;
  align-items: start;
}

.card {
  padding: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.7;
}

.chart-area {
  border: 1px solid #e4e7df;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #fbfdf9);
  overflow: hidden;
}

.chart-area svg {
  display: block;
  width: 100%;
  height: auto;
}

.grid-line {
  stroke: #e4e7df;
  stroke-dasharray: 5 7;
}

.main-line {
  fill: none;
  stroke: #176b2c;
  stroke-width: 5;
  stroke-linecap: round;
}

.chart-fill {
  fill: #eef7e9;
}

.dot {
  fill: #176b2c;
  stroke: #fff;
  stroke-width: 3;
}

.chart-warning {
  margin-top: 12px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #92400e;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 8px;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 800;
}

.detail-row {
  min-height: 42px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.detail-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.detail-row strong {
  font-size: 13px;
}

.selected-note {
  margin-top: 14px;
  border: 1px solid #d9ead7;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 18px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.7;
  font-size: 12px;
  font-weight: 900;
}

.campaign-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(190px, 1.3fr) 110px 100px 100px 80px 80px 80px;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
}

.table-head {
  background: #f7f8f4;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.table-row {
  width: 100%;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
  font-size: 12px;
}

.table-row.selected {
  background: #fbfdf9;
}

.campaign-name {
  font-weight: 900;
}

.trend {
  font-weight: 900;
}

.trend.up {
  color: #166534;
}

.trend.down {
  color: #dc2626;
}

.recommendation-list,
.channel-list,
.report-list {
  display: grid;
  gap: 10px;
}

.recommendation {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  background: #f7f8f4;
  padding: 13px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
}

.recommendation.high {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.recommendation.medium {
  border-color: #fde68a;
  background: #fffbeb;
}

.recommendation-index {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #176b2c;
  background: #fff;
  font-weight: 1000;
}

.recommendation strong {
  display: block;
  font-size: 13px;
}

.recommendation p {
  margin: 5px 0;
  color: #374151;
  line-height: 1.7;
  font-size: 12px;
}

.recommendation span {
  color: #6f746b;
  font-size: 11px;
}

.channel-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.channel-row strong {
  display: block;
  font-size: 13px;
}

.channel-row span {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  font-size: 12px;
}

.track {
  height: 8px;
  margin-top: 10px;
  border-radius: 999px;
  background: #e4e7df;
  overflow: hidden;
}

.track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #176b2c;
}

.report-row {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  padding: 12px;
}

.report-row strong,
.report-row span,
.report-row small {
  display: block;
}

.report-row span {
  margin-top: 4px;
}

.report-row small {
  margin-top: 5px;
  color: #6f746b;
  font-size: 11px;
}

@media (max-width: 1180px) {
  .metrics-grid,
  .main-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .campaign-table {
    overflow: auto;
  }

  .table-head,
  .table-row {
    min-width: 780px;
  }
}

@media (max-width: 760px) {
  .analytics-unified-page {
    padding: 16px;
  }

  .analytics-hero,
  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .analytics-hero h1 {
    font-size: 27px;
  }
}
`;
