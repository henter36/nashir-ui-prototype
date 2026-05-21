import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  ImageIcon,
  Megaphone,
  MousePointerClick,
  Percent,
  Plus,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

const metrics = [
  {
    title: "إجمالي الحملات",
    value: "15",
    change: "+7%",
    tone: "teal",
    icon: Megaphone,
  },
  {
    title: "قطع المحتوى المنشأة",
    value: "156",
    change: "+22%",
    tone: "cyan",
    icon: FileText,
  },
  {
    title: "المحتوى المعتمد",
    value: "42",
    change: "+18%",
    tone: "green",
    icon: CheckCircle2,
  },
  {
    title: "المحتوى المرفوض",
    value: "7",
    change: "-12%",
    tone: "red",
    icon: XCircle,
  },
];

const campaigns = [
  {
    name: "إطلاق مجموعة الصيف",
    season: "منتجات الصيف 2024",
    status: "نشطة",
    tone: "green",
    stage: "تنفيذ",
    updated: "منذ 2 ساعة",
  },
  {
    name: "عودة إلى المدرسة",
    season: "أغسطس 2024",
    status: "تحتاج مراجعة",
    tone: "orange",
    stage: "مراجعة",
    updated: "منذ 5 ساعات",
  },
  {
    name: "عرض نهاية الأسبوع",
    season: "سبتمبر 2024",
    status: "مسودة",
    tone: "slate",
    stage: "مسودة",
    updated: "منذ يوم",
  },
  {
    name: "خصومات العيد",
    season: "عيد الأضحى 2024",
    status: "مكتملة",
    tone: "green",
    stage: "منتهية",
    updated: "منذ يومين",
  },
];


const activities = [
  ["تم اعتماد محتوى جديد لحملة", "إطلاق مجموعة الصيف", "منذ 35 دقيقة", "green", "س"],
  ["تم إرسال 3 قطع محتوى للمراجعة", "", "منذ ساعة", "orange", "م"],
  ["تم تحديث حملة", "عودة إلى المدرسة", "منذ ساعتين", "blue", "ن"],
  ["تم إنشاء محتوى جديد", "", "منذ 3 ساعات", "cyan", "أ"],
];

export default function DashboardPage({ onCreateCampaign = () => {} }) {
  return (
    <main className="ref-dashboard" dir="rtl">
      <style>{styles}</style>

      <section className="ref-dashboard-hero">
        <div>
          <h1>مرحبًا، أحمد 👋</h1>
          <p>إليك نظرة عامة على أداء التسويق اليوم.</p>
        </div>

        <div className="ref-dashboard-actions">
          <button type="button" className="ref-date-button">
            <CalendarDays size={16} />
            آخر 7 أيام
          </button>

          <button type="button" className="ref-create-button" onClick={onCreateCampaign}>
            <Plus size={17} />
            إنشاء حملة
          </button>
        </div>
      </section>

      <section className="ref-metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.title} className="ref-metric-card">
              <div className="ref-metric-top">
                <span>{metric.title}</span>
                <div className={`ref-metric-icon ${metric.tone}`}>
                  <Icon size={21} />
                </div>
              </div>

              <strong>{metric.value}</strong>

              <div className={`ref-metric-change ${metric.tone}`}>
                <span>{metric.change}</span>
                <span>عن الفترة السابقة</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="ref-dashboard-grid-top">
        <article className="ref-card campaigns-card">
          <div className="ref-card-header">
            <h2>أحدث الحملات</h2>
            <button type="button" className="ref-ghost-button">عرض الكل</button>
          </div>

          <div className="ref-table">
            <div className="ref-table-head">
              <span>الحملة</span>
              <span>الحالة</span>
              <span>المرحلة</span>
              <span>تاريخ التحديث</span>
            </div>

            {campaigns.map((campaign) => (
              <div key={campaign.name} className="ref-table-row">
                <div className="ref-campaign-main">
                  <div className="ref-thumb">
                    <ImageIcon size={17} />
                  </div>

                  <div>
                    <strong>{campaign.name}</strong>
                    <small>{campaign.season}</small>
                  </div>
                </div>

                <span className={`ref-status ${campaign.tone}`}>
                  <i />
                  {campaign.status}
                </span>

                <span className={`ref-stage ${campaign.tone}`}>
                  {campaign.stage}
                </span>

                <span className="ref-muted">{campaign.updated}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="ref-card performance-card">
          <div className="ref-card-header">
            <h2>أداء المحتوى <span>(آخر 7 أيام)</span></h2>
            <button type="button" className="ref-ghost-button">التفاعلات</button>
          </div>

          <div className="ref-chart">
            <svg viewBox="0 0 620 250" aria-hidden="true">
              <defs>
                <linearGradient id="refArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[42, 80, 118, 156, 194].map((y) => (
                <line key={y} x1="46" x2="590" y1={y} y2={y} className="grid-line" />
              ))}

              <path
                d="M50 165 C95 140, 120 115, 165 125 S230 182, 275 142 S350 110, 405 128 S480 70, 550 160"
                className="chart-line"
              />
              <path
                d="M50 165 C95 140, 120 115, 165 125 S230 182, 275 142 S350 110, 405 128 S480 70, 550 160 L550 210 L50 210 Z"
                fill="url(#refArea)"
              />

              {[
                [50, 165],
                [116, 124],
                [188, 142],
                [252, 176],
                [322, 122],
                [390, 128],
                [465, 82],
                [550, 160],
              ].map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r="5" className="chart-dot" />
              ))}

              {["قبل 6 أيام", "قبل 5 أيام", "قبل 4 أيام", "قبل 3 أيام", "قبل 2 يوم", "أمس", "اليوم"].map(
                (label, index) => (
                  <text
                    key={label}
                    x={70 + index * 78}
                    y="238"
                    textAnchor="middle"
                    className="axis-text"
                  >
                    {label}
                  </text>
                )
              )}
            </svg>
          </div>

          <div className="ref-mini-stats">
            <div>
              <strong>3.6K</strong>
              <span>الوصول</span>
              <Users size={18} />
            </div>
            <div>
              <strong>12.4%</strong>
              <span>معدل التفاعل</span>
              <Percent size={18} />
            </div>
            <div>
              <strong>85</strong>
              <span>النقرات</span>
              <MousePointerClick size={18} />
            </div>
            <div>
              <strong>1.2K</strong>
              <span>التفاعلات</span>
              <TrendingUp size={18} />
            </div>
          </div>
        </article>
      </section>

      <section className="ref-dashboard-grid-bottom">
    

        <article className="ref-card activity-card">
          <div className="ref-card-header">
            <h2>النشاط الأخير</h2>
          </div>

          <div className="activity-list">
            {activities.map(([title, highlight, time, tone, avatar]) => (
              <div key={`${title}-${time}`} className="activity-row">
                <div className={`activity-symbol ${tone}`}>
                  {tone === "green" && <CheckCircle2 size={17} />}
                  {tone === "orange" && <Clock3 size={17} />}
                  {tone === "blue" && <FileCheck2 size={17} />}
                  {tone === "cyan" && <FileText size={17} />}
                </div>

                <div>
                  <strong>
                    {title}
                    {highlight ? <b> {highlight}</b> : null}
                  </strong>
                  <span>{time}</span>
                </div>

                <div className="activity-avatar">{avatar}</div>
              </div>
            ))}
          </div>
        </article>

        <aside className="side-cards">
          <article className="ref-card brand-card">
            <div className="brand-layout">
              <div className="brand-ring">82%</div>
              <div>
                <h3>اكتمال ملف العلامة التجارية</h3>
                <strong>جيد جدًا</strong>
                <p>تبقى 3 عناصر لإكمال الملف</p>
                <button type="button">أكمل الآن</button>
              </div>
            </div>
          </article>

          <article className="ref-card active-card">
            <div className="side-title">
              <i />
              <h3>موجز الحملة النشطة</h3>
            </div>

            <div className="active-body">
              <div>
                <strong>إطلاق مجموعة الصيف</strong>
                <span>منتجات الصيف 2024</span>
              </div>
              <div className="side-thumb" />
            </div>

            <button type="button">عرض الموجز</button>
          </article>

          <article className="ref-card pending-card-ref">
            <div className="side-title orange">
              <Clock3 size={18} />
              <h3>المراجعات المعلقة</h3>
            </div>

            <strong className="pending-number">6</strong>
            <p>قطع محتوى بانتظار المراجعة</p>

            <button type="button">عرض المراجعات</button>
          </article>
        </aside>
      </section>
    </main>
  );
}

const styles = `
.ref-dashboard {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.04), transparent 32%),
    #f6f8fb;
}

.ref-dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.ref-dashboard-hero h1 {
  margin: 0;
  color: #111827;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.ref-dashboard-hero p {
  margin: 7px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.ref-dashboard-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ref-date-button,
.ref-create-button,
.ref-ghost-button,
.brand-card button,
.active-card button,
.pending-card-ref button {
  min-height: 40px;
  border-radius: 12px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 800;
  cursor: pointer;
}

.ref-create-button {
  color: #fff;
  border: 0;
  background: linear-gradient(135deg, #0f766e, #2563eb);
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.2);
}

.ref-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.ref-metric-card,
.ref-card {
  background: rgba(255,255,255,0.96);
  border: 1px solid #e7edf3;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}

.ref-metric-card {
  min-height: 150px;
  padding: 18px;
}

.ref-metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ref-metric-top span {
  color: #475569;
  font-size: 15px;
  font-weight: 800;
}

.ref-metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
}

.ref-metric-icon.teal,
.ref-metric-icon.cyan {
  color: #0f766e;
  background: #ecfeff;
}

.ref-metric-icon.green {
  color: #16a34a;
  background: #f0fdf4;
}

.ref-metric-icon.red {
  color: #ef4444;
  background: #fef2f2;
}

.ref-metric-card > strong {
  display: block;
  margin-top: 22px;
  color: #111827;
  font-size: 52px;
  line-height: 1;
  letter-spacing: -0.05em;
}

.ref-metric-change {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 900;
}

.ref-metric-change.teal,
.ref-metric-change.cyan,
.ref-metric-change.green {
  color: #0f766e;
}

.ref-metric-change.red {
  color: #ef4444;
}

.ref-dashboard-grid-top {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 16px;
  margin-bottom: 16px;
}

.ref-dashboard-grid-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.42fr);
  gap: 16px;
  align-items: start;
}

.activity-card {
  min-height: 100%;
}

.side-cards {
  display: grid;
  gap: 14px;
  align-content: start;
}

.ref-card {
  padding: 18px;
}

.ref-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.ref-card-header h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  line-height: 1.35;
}

.ref-card-header h2 span {
  color: #64748b;
  font-weight: 700;
}

.ref-table {
  border: 1px solid #edf2f7;
  border-radius: 14px;
  overflow: hidden;
}

.ref-table-head,
.ref-table-row {
  display: grid;
  grid-template-columns: 1.45fr 0.85fr 0.8fr 0.9fr;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
}

.ref-table-head {
  background: #fbfcfe;
  color: #64748b;
  font-size: 13px;
  font-weight: 900;
  border-bottom: 1px solid #edf2f7;
}

.ref-table-row {
  background: #fff;
  border-bottom: 1px solid #edf2f7;
}

.ref-table-row:last-child {
  border-bottom: 0;
}

.ref-campaign-main {
  display: flex;
  align-items: center;
  gap: 11px;
}

.ref-thumb {
  width: 44px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  color: #0f766e;
  background: linear-gradient(135deg, #ccfbf1, #fef3c7);
}

.ref-campaign-main strong {
  display: block;
  font-size: 14px;
  color: #111827;
}

.ref-campaign-main small,
.ref-muted {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
}

.ref-status,
.ref-stage {
  width: fit-content;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 900;
}

.ref-status i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.ref-status.green,
.ref-stage.green {
  color: #16a34a;
  background: #ecfdf5;
}

.ref-status.orange,
.ref-stage.orange {
  color: #d97706;
  background: #fffbeb;
}

.ref-status.slate,
.ref-stage.slate {
  color: #475569;
  background: #f1f5f9;
}

.ref-chart {
  min-height: 280px;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  background: #fff;
  padding: 10px;
}

.ref-chart svg {
  width: 100%;
  height: auto;
  display: block;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
  stroke-dasharray: 3 5;
}

.chart-line {
  fill: none;
  stroke: #14b8a6;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: #14b8a6;
  stroke: #fff;
  stroke-width: 3;
}

.axis-text {
  fill: #64748b;
  font-size: 12px;
}

.ref-mini-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.ref-mini-stats div {
  min-height: 70px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.ref-mini-stats strong {
  display: block;
  color: #111827;
  font-size: 24px;
  line-height: 1;
}

.ref-mini-stats span {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}


.activity-list {
  display: grid;
  gap: 10px;
}

.activity-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
}

.activity-symbol {
  width: 40px;
  height: 40px;
  border-radius: 13px;
  display: grid;
  place-items: center;
}

.activity-symbol.green { color: #16a34a; background: #ecfdf5; }
.activity-symbol.orange { color: #d97706; background: #fffbeb; }
.activity-symbol.blue { color: #2563eb; background: #eff6ff; }
.activity-symbol.cyan { color: #0891b2; background: #ecfeff; }

.activity-row strong {
  display: block;
  color: #111827;
  line-height: 1.5;
  font-size: 13px;
}

.activity-row b {
  color: #0f766e;
}

.activity-row span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.activity-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #111827;
  font-size: 12px;
  font-weight: 900;
}

.side-cards {
  display: grid;
  gap: 14px;
}

.brand-layout {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-ring {
  width: 82px;
  height: 82px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 8px solid #10b981;
  box-shadow: inset 0 0 0 7px #ecfdf5;
  color: #111827;
  background: #fff;
  font-size: 19px;
  font-weight: 1000;
  flex: 0 0 auto;
}

.brand-card h3,
.active-card h3,
.pending-card-ref h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.brand-card strong {
  display: block;
  margin-top: 7px;
  color: #16a34a;
  font-size: 17px;
}

.brand-card p,
.pending-card-ref p {
  margin: 4px 0 12px;
  color: #64748b;
  font-size: 13px;
}

.side-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.side-title i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #16a34a;
}

.side-title.orange {
  color: #d97706;
}

.active-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.active-body strong {
  display: block;
  color: #111827;
  font-size: 15px;
}

.active-body span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.side-thumb {
  width: 72px;
  height: 58px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fde68a, #a7f3d0, #bfdbfe);
  flex: 0 0 auto;
}

.pending-number {
  display: block;
  color: #111827;
  font-size: 42px;
  line-height: 1;
}

@media (max-width: 1280px) {
  .ref-metrics-grid,
  .ref-mini-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ref-dashboard-grid-top,
  .ref-dashboard-grid-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .ref-dashboard {
    padding: 14px;
  }

  .ref-dashboard-hero,
  .ref-dashboard-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .ref-dashboard-hero h1 {
    font-size: 26px;
  }

  .ref-metrics-grid,
  .ref-mini-stats {
    grid-template-columns: 1fr;
  }

  .ref-table-head,
  .ref-table-row {
    grid-template-columns: 1fr;
  }

  .workflow-layout {
    grid-template-columns: 1fr;
  }

  .activity-row {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .activity-avatar {
    display: none;
    
  }
}
/* =========================================================
   Reference Dashboard Compact Pass
   ========================================================= */

.ref-dashboard {
  padding: 18px 20px !important;
}

.ref-dashboard-hero {
  margin-bottom: 14px !important;
}

.ref-dashboard-hero h1 {
  font-size: 28px !important;
}

.ref-dashboard-hero p {
  font-size: 13px !important;
}

.ref-metrics-grid {
  gap: 12px !important;
  margin-bottom: 14px !important;
}

.ref-metric-card {
  min-height: 112px !important;
  padding: 14px !important;
  border-radius: 16px !important;
}

.ref-metric-top span {
  font-size: 13px !important;
}

.ref-metric-icon {
  width: 38px !important;
  height: 38px !important;
  border-radius: 12px !important;
}

.ref-metric-icon svg {
  width: 18px !important;
  height: 18px !important;
}

.ref-metric-card > strong {
  margin-top: 12px !important;
  font-size: 34px !important;
  line-height: 1 !important;
}

.ref-metric-change {
  margin-top: 8px !important;
  font-size: 11px !important;
  gap: 6px !important;
}

.ref-card {
  border-radius: 18px !important;
  padding: 16px !important;
}

.ref-card-header {
  margin-bottom: 12px !important;
}

.ref-card-header h2 {
  font-size: 16px !important;
}

.ref-dashboard-grid-top {
  gap: 14px !important;
  margin-bottom: 14px !important;
}

.ref-dashboard-grid-bottom {
  gap: 14px !important;
}`;