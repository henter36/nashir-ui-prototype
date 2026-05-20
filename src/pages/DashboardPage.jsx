import React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderOpen,
  ImageIcon,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

const kpis = [
  {
    title: "الحملات النشطة",
    value: "7",
    subtitle: "3 تحتاج متابعة",
    tone: "green",
    icon: Megaphone,
  },
  {
    title: "تحتاج مراجعة",
    value: "6",
    subtitle: "محتوى ينتظر اعتمادًا",
    tone: "amber",
    icon: AlertTriangle,
  },
  {
    title: "أصول غير معتمدة",
    value: "9",
    subtitle: "حقوق استخدام غير مؤكدة",
    tone: "blue",
    icon: FolderOpen,
  },
  {
    title: "جاهزية المتجر",
    value: "82%",
    subtitle: "تبقى 3 عناصر",
    tone: "green",
    icon: Store,
  },
];

const campaigns = [
  {
    name: "إطلاق مجموعة الصيف",
    product: "عطر أرابيان أود",
    status: "نشطة",
    tone: "green",
    readiness: 84,
    channel: "Instagram",
    updated: "منذ ساعتين",
  },
  {
    name: "عودة إلى المدرسة",
    product: "حذاء رياضي نايك",
    status: "تحتاج مراجعة",
    tone: "amber",
    readiness: 68,
    channel: "Snapchat",
    updated: "منذ 5 ساعات",
  },
  {
    name: "عرض نهاية الأسبوع",
    product: "كريم مرطب نيفيا",
    status: "مسودة",
    tone: "slate",
    readiness: 46,
    channel: "WhatsApp",
    updated: "منذ يوم",
  },
  {
    name: "خصومات العيد",
    product: "ساعة كاسيو",
    status: "معتمدة",
    tone: "blue",
    readiness: 92,
    channel: "Email",
    updated: "منذ يومين",
  },
];

const readiness = [
  ["رابط المتجر", "مفحوص", "green"],
  ["حساب Instagram", "تم التحليل", "green"],
  ["الجمهور الافتراضي", "جيد", "green"],
  ["الأصول", "9 تحتاج مراجعة", "amber"],
];

const assets = [
  ["صور معتمدة", "12", "green"],
  ["حقوق غير مؤكدة", "9", "amber"],
  ["فيديوهات ناقصة", "3", "amber"],
  ["شعار المتجر", "موجود", "green"],
];

const activities = [
  ["تم فحص رابط المتجر وجمع 3 منتجات", "إعداد المتجر", "منذ 12 دقيقة", "green"],
  ["تم إنشاء حملة تجريبية من Agent Mode", "إنشاء حملة", "منذ 35 دقيقة", "blue"],
  ["تم طلب مراجعة Reel Script", "المراجعة", "منذ ساعة", "amber"],
];

export default function DashboardPage({
  onCreateCampaign = () => {},
  onOpenStoreSetup = () => {},
  onOpenCampaigns = () => {},
  onOpenAssets = () => {},
  onOpenAnalytics = () => {},
  onOpenReview = () => {},
}) {
  return (
    <main className="dashboard-grid-page" dir="rtl">
      <style>{styles}</style>

      <section className="hero">
        <div>
          <div className="kicker">
            <Sparkles size={15} />
            مركز قيادة ناشر
          </div>
          <h1>مرحبًا، أحمد 👋</h1>
          <p>ملخص تنفيذي منظم للحملات، جاهزية المتجر، الأصول، والأداء.</p>
        </div>

        <div className="hero-actions">
          <button type="button" className="ghost-button">
            <CalendarDays size={16} />
            آخر 7 أيام
          </button>
          <button type="button" className="primary-button" onClick={onCreateCampaign}>
            <Plus size={17} />
            إنشاء حملة
          </button>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={`kpi-card ${item.tone}`}>
              <div className="kpi-icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <small>{item.subtitle}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="top-row">
        <article className="card next-action-card">
          <CardHeader
            title="الإجراء التالي"
            description="أولوية واحدة واضحة بدل بعثرة الكروت."
            icon={ShieldCheck}
          />

          <div className="next-action-box">
            <div className="action-icon">
              <FolderOpen size={24} />
            </div>
            <div>
              <strong>راجع 9 أصول قبل إنشاء الحملة التالية</strong>
              <p>
                توجد صور مكتشفة من رابط المتجر تحتاج تأكيد حقوق الاستخدام قبل
                استخدامها في الإعلانات.
              </p>
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="primary-button" onClick={onOpenAssets}>
              فتح مكتبة الأصول
              <ArrowLeft size={16} />
            </button>
            <button type="button" className="secondary-button" onClick={onOpenReview}>
              فتح المراجعة
            </button>
          </div>
        </article>

        <article className="card readiness-card">
          <CardHeader
            title="جاهزية المتجر"
            description="مصادر البيانات التي تغذي الحملات."
            icon={Store}
          />

          <div className="readiness-summary">
            <div className="ring">82%</div>
            <div>
              <strong>جيد</strong>
              <span>تبقى عناصر قليلة قبل الاعتماد الكامل.</span>
            </div>
          </div>

          <div className="compact-list">
            {readiness.map(([label, value, tone]) => (
              <InfoRow key={label} label={label} value={value} tone={tone} />
            ))}
          </div>

          <button type="button" className="secondary-button wide" onClick={onOpenStoreSetup}>
            استكمال إعداد المتجر
          </button>
        </article>
      </section>

      <section className="middle-row">
        <article className="card campaigns-card">
          <CardHeader
            title="الحملات القريبة"
            description="آخر الحملات التي تحتاج متابعة أو قرار."
            icon={Megaphone}
            action={
              <button type="button" className="mini-button" onClick={onOpenCampaigns}>
                عرض الكل
              </button>
            }
          />

          <div className="campaign-table">
            {campaigns.map((campaign) => (
              <button
                key={campaign.name}
                type="button"
                className="campaign-row"
                onClick={onOpenCampaigns}
              >
                <div className="campaign-main">
                  <div className="campaign-thumb">
                    <ImageIcon size={17} />
                  </div>
                  <div>
                    <strong>{campaign.name}</strong>
                    <span>{campaign.product}</span>
                  </div>
                </div>

                <Status tone={campaign.tone}>{campaign.status}</Status>

                <div className="readiness-cell">
                  <i>
                    <b style={{ width: `${campaign.readiness}%` }} />
                  </i>
                  <small>{campaign.readiness}%</small>
                </div>

                <span className="channel-pill">{campaign.channel}</span>
                <small className="muted">{campaign.updated}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="bottom-row">
        <article className="card small-card">
          <CardHeader
            title="جاهزية الأصول"
            description="ما يمكن استخدامه وما يحتاج مراجعة."
            icon={FolderOpen}
          />

          <div className="box-grid">
            {assets.map(([label, value, tone]) => (
              <div key={label} className={`metric-box ${tone}`}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <button type="button" className="secondary-button wide" onClick={onOpenAssets}>
            إدارة مكتبة الأصول
          </button>
        </article>

        <article className="card small-card">
          <CardHeader
            title="أداء مختصر"
            description="مؤشرات سريعة لا تستبدل التحليلات."
            icon={BarChart3}
          />

          <div className="box-grid">
            <Mini title="الوصول" value="38K" />
            <Mini title="التحويلات" value="124" />
            <Mini title="أفضل قناة" value="Instagram" />
            <Mini title="ROI تقديري" value="2.4x" />
          </div>

          <button type="button" className="secondary-button wide" onClick={onOpenAnalytics}>
            عرض التحليلات
          </button>
        </article>

        <article className="card small-card">
          <CardHeader
            title="النشاط الحديث"
            description="آخر أحداث مؤثرة داخل مساحة العمل."
            icon={Clock3}
          />

          <div className="activity-list">
            {activities.map(([title, source, time, tone]) => (
              <div key={`${title}-${time}`} className="activity-row">
                <div className={`dot ${tone}`} />
                <div>
                  <strong>{title}</strong>
                  <span>{source} · {time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function CardHeader({ title, description, icon: Icon, action }) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action || (
        <div className="header-icon">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, tone }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function Status({ tone, children }) {
  return <span className={`status ${tone}`}>{children}</span>;
}

function Mini({ title, value }) {
  return (
    <div className="metric-box">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.dashboard-grid-page {
  min-height: calc(100vh - 80px);
  padding: 22px;
  background:
    radial-gradient(circle at top right, rgba(23, 107, 44, 0.055), transparent 32%),
    #f7f8f4;
  color: #1f241d;
  font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
}

.hero,
.kpi-card,
.card {
  background: #ffffff;
  border: 1px solid #e4e7df;
  border-radius: 22px;
  box-shadow: 0 8px 24px rgba(24, 38, 18, 0.032);
}

.hero {
  min-height: 126px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.kicker {
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

.hero h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.hero p {
  margin: 7px 0 0;
  max-width: 720px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.hero-actions,
.button-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button,
.ghost-button,
.mini-button {
  min-height: 40px;
  border-radius: 14px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
}

.primary-button {
  color: #fff;
  border: 0;
  background: #176b2c;
  box-shadow: 0 10px 20px rgba(23, 107, 44, 0.14);
}

.secondary-button,
.ghost-button,
.mini-button {
  color: #1f241d;
  background: #fff;
  border: 1px solid #e4e7df;
}

.mini-button {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
}

.wide {
  width: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.kpi-card {
  height: 104px;
  padding: 14px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
}

.kpi-card.blue .kpi-icon {
  color: #2563eb;
  background: #eff6ff;
}

.kpi-card.amber .kpi-icon {
  color: #92400e;
  background: #fffbeb;
}

.kpi-card span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.kpi-card strong {
  display: block;
  margin-top: 5px;
  font-size: 25px;
  line-height: 1;
}

.kpi-card small {
  display: block;
  margin-top: 5px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.35;
}

.top-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 14px;
  align-items: stretch;
  margin-bottom: 14px;
}

.middle-row,
.bottom-row {
  margin-bottom: 14px;
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}

.card {
  padding: 16px;
}

.top-row .card {
  min-height: 300px;
}

.small-card {
  min-height: 295px;
  display: flex;
  flex-direction: column;
}

.card-header {
  min-height: 58px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0;
  color: #1f241d;
  font-size: 17px;
  line-height: 1.35;
}

.card-header p {
  margin: 5px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.7;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #176b2c;
  background: #eef7e9;
  flex: 0 0 auto;
}

.next-action-box {
  min-height: 132px;
  border: 1px solid #d9ead7;
  background: linear-gradient(135deg, #eef7e9, #ffffff);
  border-radius: 20px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.action-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 16px;
  color: #fff;
  background: #176b2c;
}

.next-action-box strong {
  display: block;
  font-size: 15px;
}

.next-action-box p {
  margin: 6px 0 0;
  color: #4d5f4a;
  line-height: 1.7;
  font-size: 13px;
}

.button-row {
  margin-top: 12px;
}

.readiness-summary {
  min-height: 96px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 12px;
}

.ring {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 7px solid #176b2c;
  box-shadow: inset 0 0 0 6px #eef7e9;
  font-weight: 1000;
  flex: 0 0 auto;
}

.readiness-summary strong {
  display: block;
}

.readiness-summary span {
  display: block;
  color: #6f746b;
  margin-top: 5px;
  line-height: 1.6;
  font-size: 12px;
}

.compact-list {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.info-row {
  min-height: 34px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-row span {
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.info-row strong {
  font-size: 12px;
}

.info-row strong.green {
  color: #166534;
}

.info-row strong.amber {
  color: #92400e;
}

.campaigns-card {
  width: 100%;
}

.campaign-table {
  border: 1px solid #e4e7df;
  border-radius: 18px;
  overflow: hidden;
}

.campaign-row {
  width: 100%;
  min-height: 64px;
  display: grid;
  grid-template-columns: minmax(240px, 1.4fr) 130px 130px 115px 95px;
  gap: 10px;
  align-items: center;
  text-align: right;
  border: 0;
  border-top: 1px solid #e4e7df;
  background: #fff;
  padding: 10px 13px;
  font-family: inherit;
  cursor: pointer;
}

.campaign-row:first-child {
  border-top: 0;
}

.campaign-row:hover {
  background: #fbfdf9;
}

.campaign-main {
  display: flex;
  gap: 10px;
  align-items: center;
}

.campaign-thumb {
  width: 40px;
  height: 38px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #176b2c;
  background: #eef7e9;
}

.campaign-main strong {
  display: block;
  color: #1f241d;
  font-size: 13px;
}

.campaign-main span,
.muted {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
}

.status {
  width: fit-content;
  min-height: 27px;
  border-radius: 999px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
}

.status.green {
  color: #166534;
  background: #f0fdf4;
}

.status.amber {
  color: #92400e;
  background: #fffbeb;
}

.status.slate {
  color: #475569;
  background: #f8fafc;
}

.status.blue {
  color: #1d4ed8;
  background: #eff6ff;
}

.readiness-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.readiness-cell i {
  width: 74px;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e4e7df;
}

.readiness-cell b {
  display: block;
  height: 100%;
  background: #176b2c;
}

.readiness-cell small {
  color: #1f241d;
  font-size: 11px;
  font-weight: 900;
}

.channel-pill {
  width: fit-content;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 900;
}

.box-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 12px;
}

.metric-box {
  min-height: 72px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 15px;
  padding: 11px;
}

.metric-box span {
  display: block;
  color: #6f746b;
  font-size: 11px;
  font-weight: 900;
}

.metric-box strong {
  display: block;
  margin-top: 6px;
  color: #1f241d;
  font-size: 18px;
}

.metric-box.green strong {
  color: #166534;
}

.metric-box.amber strong {
  color: #92400e;
}

.bar-chart {
  height: 116px;
  border: 1px solid #e4e7df;
  background: linear-gradient(180deg, #ffffff, #fbfdf9);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 9px;
  margin-bottom: 12px;
}

.bar-chart span {
  width: 100%;
  border-radius: 999px 999px 6px 6px;
  background: linear-gradient(180deg, #176b2c, #8bbf83);
}

.activity-list {
  display: grid;
  gap: 9px;
}

.activity-row {
  min-height: 55px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 15px;
  padding: 10px;
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.dot {
  width: 9px;
  height: 9px;
  margin-top: 8px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.dot.green {
  background: #16a34a;
}

.dot.blue {
  background: #2563eb;
}

.dot.amber {
  background: #f59e0b;
}

.activity-row strong {
  display: block;
  font-size: 12px;
}

.activity-row span {
  display: block;
  margin-top: 3px;
  color: #6f746b;
  font-size: 11px;
}

@media (max-width: 1320px) {
  .top-row,
  .bottom-row {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .campaign-row {
    grid-template-columns: 1fr;
  }

  .small-card {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .dashboard-grid-page {
    padding: 16px;
  }

  .hero,
  .hero-actions,
  .button-row {
    align-items: stretch;
    flex-direction: column;
  }

  .hero h1 {
    font-size: 27px;
  }

  .kpi-grid,
  .box-grid {
    grid-template-columns: 1fr;
  }

  .primary-button,
  .secondary-button,
  .ghost-button {
    width: 100%;
  }
}
`;
