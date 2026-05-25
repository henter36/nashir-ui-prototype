import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  FolderOpen,
  ImageIcon,
  Layers,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import {
  formatCompactNumber,
  getDashboardSnapshot,
  refreshDashboardSummary,
} from "../utils/campaignAnalyticsStore.js";

const periodLabels = ["اليوم", "آخر 7 أيام", "هذا الشهر"];

const kpis = [
  {
    title: "الحملات النشطة",
    value: "7",
    subtitle: "3 تحتاج متابعة",
    tone: "green",
    icon: Megaphone,
  },
  {
    title: "محتوى ينتظر اعتمادًا",
    value: "6",
    subtitle: "راجع قبل الجدولة",
    tone: "amber",
    icon: AlertTriangle,
  },
  {
    title: "أصول غير مؤكدة",
    value: "9",
    subtitle: "حقوق استخدام ناقصة",
    tone: "blue",
    icon: FolderOpen,
  },
  {
    title: "جاهزية التشغيل",
    value: "82%",
    subtitle: "المتجر جيد ويحتاج استكمالًا",
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
  ["إعداد المتجر", "82%", "green"],
  ["كتالوج المنتجات", "4 عناصر", "green"],
  ["مصادر البيانات", "2 مفحوصة", "green"],
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
  ["تم إنشاء حملة تجريبية من معالج الحملات", "معالج الحملات", "منذ 35 دقيقة", "blue"],
  ["تم طلب مراجعة Reel Script", "المحتوى والمراجعة", "منذ ساعة", "amber"],
];

export default function DashboardPage({
  onCreateCampaign = () => {},
  onOpenStoreSetup = () => {},
  onOpenProductCatalog = () => {},
  onOpenDataSources = () => {},
  onOpenCampaigns = () => {},
  onOpenAssets = () => {},
  onOpenAnalytics = () => {},
  onOpenReview = () => {},
  onOpenPublishingQueue = () => {},
  onOpenMultiPlatform = () => {},
}) {
  const [period, setPeriod] = useState("آخر 7 أيام");
  const [dashboardSnapshot, setDashboardSnapshot] = useState(() => getDashboardSnapshot());

  useEffect(() => {
    const reloadDashboard = () => {
      refreshDashboardSummary();
      setDashboardSnapshot(getDashboardSnapshot());
    };

    window.addEventListener("focus", reloadDashboard);
    window.addEventListener("storage", reloadDashboard);
    window.addEventListener("nashir-campaigns-updated", reloadDashboard);
    window.addEventListener("nashir-campaign-metrics-updated", reloadDashboard);
    window.addEventListener("nashir-dashboard-summary-updated", reloadDashboard);

    return () => {
      window.removeEventListener("focus", reloadDashboard);
      window.removeEventListener("storage", reloadDashboard);
      window.removeEventListener("nashir-campaigns-updated", reloadDashboard);
      window.removeEventListener("nashir-campaign-metrics-updated", reloadDashboard);
      window.removeEventListener("nashir-dashboard-summary-updated", reloadDashboard);
    };
  }, []);

  const quickActions = useMemo(
    () => [
      ["إعداد المتجر", "أكمل بيانات المتجر والهوية", Store, onOpenStoreSetup],
      ["كتالوج المنتجات", "راجع المنتجات قبل الحملة", Store, onOpenProductCatalog],
      ["مصادر البيانات", "افحص الروابط والتكاملات", Database, onOpenDataSources],
      ["إنشاء حملة", "ابدأ من المعالج الرسمي", Megaphone, onCreateCampaign],
      ["المحتوى والمراجعة", "راجع النصوص والمخرجات", FileCheck2, onOpenReview],
      ["جدولة النشر", "جهّز خطة النشر", CalendarDays, onOpenPublishingQueue],
      ["متعدد القنوات", "تحقق من جاهزية القنوات", Layers, onOpenMultiPlatform],
      ["التحليلات", "راجع الأداء والمؤشرات", BarChart3, onOpenAnalytics],
    ],
    [
      onCreateCampaign,
      onOpenAnalytics,
      onOpenDataSources,
      onOpenMultiPlatform,
      onOpenProductCatalog,
      onOpenPublishingQueue,
      onOpenReview,
      onOpenStoreSetup,
    ]
  );

  const priorities = [
    {
      title: "استكمل أساس التشغيل",
      body: "راجع إعداد المتجر والمنتجات ومصادر البيانات قبل إنشاء حملات جديدة.",
      action: "فتح مصادر البيانات",
      icon: Database,
      tone: "green",
      onClick: onOpenDataSources,
    },
    {
      title: "راجع الأصول غير المؤكدة",
      body: "يوجد 9 أصول تحتاج تأكيد حقوق الاستخدام قبل استخدامها في الإعلانات.",
      action: "فتح مكتبة الأصول",
      icon: FolderOpen,
      tone: "amber",
      onClick: onOpenAssets,
    },
    {
      title: "جهّز النشر متعدد القنوات",
      body: "بعد اعتماد المحتوى، انتقل إلى الجدولة وفحص جاهزية القنوات.",
      action: "فتح متعدد القنوات",
      icon: Layers,
      tone: "blue",
      onClick: onOpenMultiPlatform,
    },
  ];

  const summary = dashboardSnapshot.summary;
  const recentCampaigns = dashboardSnapshot.recentCampaigns.length
    ? dashboardSnapshot.recentCampaigns
    : campaigns;
  const dashboardKpis = [
    {
      title: "الحملات النشطة",
      value: String(summary.activeCampaigns),
      subtitle: `${summary.reviewCampaigns} تحتاج متابعة`,
      tone: "green",
      icon: Megaphone,
    },
    {
      title: "محتوى ينتظر اعتمادًا",
      value: String(summary.reviewCampaigns),
      subtitle: "راجع قبل الجدولة",
      tone: "amber",
      icon: AlertTriangle,
    },
    {
      title: "أصول غير مؤكدة",
      value: "9",
      subtitle: "حقوق استخدام ناقصة",
      tone: "blue",
      icon: FolderOpen,
    },
    {
      title: "جاهزية التشغيل",
      value: `${summary.avgReadiness}%`,
      subtitle: "المتجر جيد ويحتاج استكمالًا",
      tone: "green",
      icon: Store,
    },
  ];
  const strategicSummary = {
    growthReadiness: summary.avgReadiness >= 80 ? "مرتفعة" : summary.avgReadiness >= 65 ? "متوسطة" : "تحتاج استكمال",
    opportunity: recentCampaigns[0]?.product
      ? `تحويل ${recentCampaigns[0].product} إلى حملة اختبارية مركزة.`
      : "بدء حملة اختبارية من المنتج الأعلى جاهزية.",
    risk: Number(summary.reviewCampaigns || 0) > 0
      ? "وجود محتوى أو حملات تحتاج مراجعة قبل التوسع."
      : "الأصول والقنوات تحتاج متابعة قبل زيادة النشر.",
    nextAction: Number(summary.reviewCampaigns || 0) > 0
      ? "راجع المحتوى المنتظر قبل الجدولة."
      : "ابدأ من المنتج الأعلى جاهزية في معالج الحملة.",
  };

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
          <p>ملخص تنفيذي سريع للحملات، المحتوى، جاهزية النشر، والتنبيهات التي تحتاج قرارًا.</p>
        </div>

        <div className="hero-actions">
          <div className="period-switch" aria-label="فلتر الفترة التجريبي">
            {periodLabels.map((item) => (
              <button
                key={item}
                type="button"
                className={period === item ? "active" : ""}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={onCreateCampaign}>
            <Plus size={17} />
            إنشاء حملة
          </button>
        </div>
      </section>

      <section className="screen-guidance-card">
        <div><span>هدف الشاشة</span><strong>عرض ملخص تنفيذي لحالة المتجر والحملات والخطة.</strong></div>
        <div><span>المدخلات</span><strong>ملخصات المتجر، الخطة، الحملات، الجاهزية.</strong></div>
        <div><span>المخرجات</span><strong>أهم فرصة، أهم خطر، والإجراء التالي.</strong></div>
        <div><span>الإجراء التالي</span><strong>الانتقال للشاشة التي تحتاج استكمالًا.</strong></div>
        <div><span>ما لا يحدث هنا</span><strong>الأرقام والمؤشرات هنا نموذجية وليست تشغيلًا إنتاجيًا.</strong></div>
      </section>

      <section className="kpi-grid">
        {dashboardKpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={`kpi-card ${item.tone}`}>
              <div className="kpi-icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <small>{item.subtitle} · {period}</small>
              </div>
            </article>
          );
        })}
      </section>

      <article className="card strategic-summary-card">
        <CardHeader
          title="ملخص الخطة الاستراتيجية"
          description="الملخص يعرض أهم نتيجة من خطة المتجر، والتفاصيل الكاملة تبقى في إعداد المتجر."
          icon={Sparkles}
          action={<span className="prototype-note">توصيات واجهية</span>}
        />
        <p className="strategy-note">هذه توصيات واجهية مشتقة من بيانات الإعداد الحالية، وليست تحليلًا إنتاجيًا.</p>
        <div className="strategy-summary-grid">
          <Mini title="درجة جاهزية النمو" value={strategicSummary.growthReadiness} />
          <Mini title="أهم فرصة" value={strategicSummary.opportunity} />
          <Mini title="أهم خطر" value={strategicSummary.risk} />
          <Mini title="الإجراء التالي" value={strategicSummary.nextAction} />
        </div>
      </article>

      <article className="card social-summary-card">
        <CardHeader
          title="ملخص التحليل الاجتماعي"
          description="مؤشرات واجهية خفيفة مرتبطة بتصميم موصلات Instagram وTikTok."
          icon={Megaphone}
          action={<span className="prototype-note">لا يتم سحب بيانات فعلية</span>}
        />
        <div className="strategy-summary-grid">
          <Mini title="أقوى قناة اجتماعية" value={summary.topChannel || "Instagram"} />
          <Mini title="أهم فرصة اجتماعية" value="تحويل المنتج الأعلى جاهزية إلى Reel أو TikTok قصير." />
          <Mini title="أهم خطر اجتماعي" value="الاعتماد على بيانات اجتماعية دون موصل مصرح." />
          <Mini title="الإجراء التالي" value="تجهيز موصل مصرح قبل استخدام التحليل الاجتماعي." />
        </div>
      </article>

      <SectionTitle title="أداء الحملات" description="آخر الحملات التي تحتاج متابعة أو قرار." />

      <section className="middle-row">
        <article className="card campaigns-card">
          <CardHeader
            title="الحملات القريبة"
            description="حالة مختصرة للجاهزية والقناة والتحديث الأخير."
            icon={Megaphone}
            action={
              <button type="button" className="mini-button" onClick={onOpenCampaigns}>
                عرض الكل
              </button>
            }
          />

          <div className="campaign-table">
            {recentCampaigns.map((campaign) => (
              <button
                key={campaign.id || campaign.name}
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

                <Status tone={campaign.tone}>{formatCampaignStatus(campaign.status)}</Status>

                <div className="readiness-cell">
                  <i>
                    <b style={{ width: `${campaign.readiness}%` }} />
                  </i>
                  <small>{campaign.readiness}%</small>
                </div>

                <span className="channel-pill">{campaign.channel || campaign.channels?.[0] || "عام"}</span>
                <small className="muted">{campaign.updatedAt || campaign.updated}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <SectionTitle title="المحتوى والنشر" description="جاهزية الأصول والقنوات قبل الانتقال إلى النشر والتحليلات." />

      <section className="bottom-row">
        <article className="card small-card">
          <CardHeader
            title="جاهزية الأصول"
            description="ما يؤثر على قرار استخدام الأصول."
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
            title="النشر والقنوات"
            description="ما قبل الجدولة والتحقق متعدد القنوات."
            icon={Layers}
          />

          <div className="box-grid">
            <Mini title="قنوات مختارة" value="4" />
            <Mini title="جاهزية القنوات" value="75%" />
            <Mini title="مخرجات جاهزة" value="3/5" />
            <Mini title="تحتاج موافقة" value="2" />
          </div>

          <div className="split-buttons">
            <button type="button" className="secondary-button" onClick={onOpenPublishingQueue}>جدولة النشر</button>
            <button type="button" className="secondary-button" onClick={onOpenMultiPlatform}>متعدد القنوات</button>
          </div>
        </article>

        <article className="card small-card">
          <CardHeader
            title="الأداء والنشاط"
            description="مؤشرات سريعة قبل فتح التحليلات."
            icon={BarChart3}
          />

          <div className="box-grid compact-metrics">
            <Mini title="الوصول" value={formatCompactNumber(summary.reach)} />
            <Mini title="التحويلات" value={formatCompactNumber(summary.conversions)} />
            <Mini title="أفضل قناة" value={summary.topChannel} />
            <Mini title="ROI تقديري" value={`${summary.roi}x`} />
          </div>

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

          <button type="button" className="secondary-button wide" onClick={onOpenAnalytics}>
            عرض التحليلات
          </button>
        </article>
      </section>

      <SectionTitle title="التنبيهات والتوصيات" description="قرارات تشغيلية تحتاج مراجعة قبل توسيع الحملات." />

      <section className="support-row">
        <article className="card readiness-card">
          <CardHeader
            title="جاهزية التشغيل"
            description="العناصر التي تغذي الحملات قبل التوليد أو النشر."
            icon={Store}
          />

          <div className="readiness-summary">
            <div className="ring">{summary.avgReadiness}%</div>
            <div>
              <strong>{summary.avgReadiness >= 70 ? "جيد، لكن غير مكتمل" : "يحتاج استكمال"}</strong>
              <span>المنتجات والمصادر جاهزة مبدئيًا، والأصول تحتاج مراجعة حقوق.</span>
            </div>
          </div>

          <div className="compact-list">
            {[
              ["إعداد المتجر", `${summary.avgReadiness}%`, summary.avgReadiness >= 70 ? "green" : "amber"],
              ["كتالوج المنتجات", "4 عناصر", "green"],
              ["مصادر البيانات", "2 مفحوصة", "green"],
              ["الأصول", "9 تحتاج مراجعة", "amber"],
            ].map(([label, value, tone]) => (
              <InfoRow key={label} label={label} value={value} tone={tone} />
            ))}
          </div>

          <div className="split-buttons">
            <button type="button" className="secondary-button" onClick={onOpenStoreSetup}>إعداد المتجر</button>
            <button type="button" className="secondary-button" onClick={onOpenDataSources}>مصادر البيانات</button>
          </div>
        </article>

        <article className="card next-action-card">
          <CardHeader
            title="الأولويات التالية"
            description="ثلاث قرارات عملية بدل إجراء واحد قد لا يناسب كل حالة."
            icon={ShieldCheck}
          />

          <div className="priority-list">
            {priorities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`priority-row ${item.tone}`}>
                  <div className="action-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                  <button type="button" onClick={item.onClick}>
                    {item.action}
                    <ArrowLeft size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="quick-actions-card">
        <CardHeader
          title="اختصارات الرحلة الأساسية"
          description="روابط مباشرة لأكثر الشاشات استخدامًا."
          icon={ShieldCheck}
        />
        <div className="quick-actions-grid">
          {quickActions.map(([title, description, Icon, onClick]) => (
            <button key={title} type="button" className="quick-action" onClick={onClick}>
              <span className="quick-icon"><Icon size={18} /></span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowLeft size={15} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
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

function formatCampaignStatus(status) {
  const map = {
    active: "نشطة",
    review: "تحتاج مراجعة",
    draft: "مسودة",
    approved: "معتمدة",
  };

  return map[status] || status;
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
.quick-actions-card,
.kpi-card,
.card {
  background: #ffffff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(24, 38, 18, 0.028);
}

.hero {
  min-height: 112px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
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
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: 0;
}

.hero p {
  margin: 7px 0 0;
  max-width: 760px;
  color: #6f746b;
  line-height: 1.8;
  font-size: 14px;
}

.hero-actions,
.button-row,
.split-buttons {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.period-switch {
  min-height: 40px;
  padding: 4px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 16px;
  display: flex;
  gap: 4px;
}

.period-switch button {
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 0 10px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.period-switch button.active {
  background: #176b2c;
  color: #fff;
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

.quick-actions-card {
  padding: 15px;
  margin-bottom: 12px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.quick-action {
  min-height: 68px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  text-align: right;
  font-family: inherit;
  cursor: pointer;
}

.quick-action:hover {
  border-color: #176b2c;
  background: #eef7e9;
}

.quick-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fff;
  color: #176b2c;
}

.quick-action strong,
.quick-action small {
  display: block;
}

.quick-action small {
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.5;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.strategic-summary-card,
.social-summary-card {
  margin-bottom: 16px;
}

.strategy-note {
  margin: -4px 0 12px;
  color: #66715f;
  font-size: 12px;
  line-height: 1.7;
  font-weight: 800;
}

.strategy-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.prototype-note {
  width: fit-content;
  border: 1px solid #d9ead7;
  background: #eef7e9;
  color: #176b2c;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

.kpi-card {
  height: 88px;
  padding: 12px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.kpi-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #eef7e9;
  color: #176b2c;
}

.kpi-card.blue .kpi-icon { color: #2563eb; background: #eff6ff; }
.kpi-card.amber .kpi-icon { color: #92400e; background: #fffbeb; }

.kpi-card span,
.metric-box span,
.info-row span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.kpi-card strong {
  display: block;
  margin-top: 4px;
  font-size: 22px;
  line-height: 1;
}

.kpi-card small {
  display: block;
  margin-top: 4px;
  color: #6f746b;
  font-size: 11px;
  line-height: 1.35;
}

.section-title {
  margin: 14px 2px 8px;
}

.section-title h2 {
  margin: 0;
  color: #1f241d;
  font-size: 16px;
  line-height: 1.35;
}

.section-title p {
  margin: 4px 0 0;
  color: #6f746b;
  font-size: 12px;
  line-height: 1.6;
}

.support-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 12px;
  align-items: stretch;
  margin-bottom: 12px;
}

.middle-row,
.bottom-row { margin-bottom: 12px; }

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

.card { padding: 15px; }
.support-row .card { min-height: 270px; }
.small-card { min-height: 268px; display: flex; flex-direction: column; }

.card-header {
  min-height: 48px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.card-header h2 { margin: 0; color: #1f241d; font-size: 16px; line-height: 1.35; }
.card-header p { margin: 5px 0 0; color: #6f746b; font-size: 12px; line-height: 1.7; }

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

.priority-list { display: grid; gap: 10px; }

.priority-row {
  min-height: 78px;
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.priority-row.green { border-color: #d9ead7; background: #f7fbf3; }
.priority-row.amber { border-color: #fde68a; background: #fffaf0; }
.priority-row.blue { border-color: #bfdbfe; background: #eff6ff; }

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

.priority-row.amber .action-icon { background: #d97706; }
.priority-row.blue .action-icon { background: #2563eb; }

.priority-row strong { display: block; font-size: 14px; }
.priority-row p { margin: 5px 0 0; color: #4d5f4a; line-height: 1.65; font-size: 12px; }
.priority-row button {
  min-height: 36px;
  border: 1px solid #e4e7df;
  background: #fff;
  border-radius: 14px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.readiness-summary {
  min-height: 84px;
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
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 7px solid #176b2c;
  box-shadow: inset 0 0 0 6px #eef7e9;
  font-weight: 1000;
  flex: 0 0 auto;
}

.readiness-summary strong { display: block; }
.readiness-summary span { display: block; color: #6f746b; margin-top: 5px; line-height: 1.6; font-size: 12px; }

.compact-list { display: grid; gap: 6px; margin-bottom: 12px; }

.info-row {
  min-height: 34px;
  border-bottom: 1px solid #e4e7df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-row strong { font-size: 12px; }
.info-row strong.green { color: #166534; }
.info-row strong.amber { color: #92400e; }

.split-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }

.campaign-table { border: 1px solid #e4e7df; border-radius: 18px; overflow: hidden; }

.campaign-row {
  width: 100%;
  min-height: 58px;
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

.campaign-row:first-child { border-top: 0; }
.campaign-row:hover { background: #fbfdf9; }

.campaign-main { display: flex; gap: 10px; align-items: center; }
.campaign-thumb { width: 36px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; color: #176b2c; background: #eef7e9; }
.campaign-main strong { display: block; color: #1f241d; font-size: 13px; }
.campaign-main span, .muted { display: block; margin-top: 4px; color: #6f746b; font-size: 11px; }

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
.status.green { color: #166534; background: #f0fdf4; }
.status.amber { color: #92400e; background: #fffbeb; }
.status.slate { color: #475569; background: #f8fafc; }
.status.blue { color: #1d4ed8; background: #eff6ff; }

.readiness-cell { display: flex; align-items: center; gap: 8px; }
.readiness-cell i { width: 74px; height: 7px; overflow: hidden; border-radius: 999px; background: #e4e7df; }
.readiness-cell b { display: block; height: 100%; background: #176b2c; }
.readiness-cell small { color: #1f241d; font-size: 11px; font-weight: 900; }
.channel-pill { width: fit-content; border: 1px solid #e4e7df; background: #fff; border-radius: 999px; padding: 5px 9px; font-size: 10px; font-weight: 900; }

.box-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 12px; }
.compact-metrics { margin-bottom: 8px; }
.metric-box { min-height: 64px; border: 1px solid #e4e7df; background: #f7f8f4; border-radius: 15px; padding: 10px; }
.metric-box strong { display: block; margin-top: 6px; color: #1f241d; font-size: 18px; }
.metric-box.green strong { color: #166534; }
.metric-box.amber strong { color: #92400e; }

.activity-list { display: grid; gap: 8px; margin-bottom: 12px; }
.activity-row { min-height: 50px; border: 1px solid #e4e7df; background: #f7f8f4; border-radius: 15px; padding: 9px; display: flex; align-items: flex-start; gap: 9px; }
.dot { width: 9px; height: 9px; margin-top: 8px; border-radius: 999px; flex: 0 0 auto; }
.dot.green { background: #16a34a; }
.dot.blue { background: #2563eb; }
.dot.amber { background: #f59e0b; }
.activity-row strong { display: block; font-size: 12px; }
.activity-row span { display: block; margin-top: 3px; color: #6f746b; font-size: 11px; }

@media (max-width: 1320px) {
  .support-row,
  .bottom-row,
  .quick-actions-grid { grid-template-columns: 1fr; }
  .kpi-grid,
  .strategy-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .campaign-row { grid-template-columns: 1fr; }
  .small-card { min-height: auto; }
  .priority-row { grid-template-columns: 48px minmax(0, 1fr); }
  .priority-row button { grid-column: 2; width: fit-content; }
}

@media (max-width: 760px) {
  .dashboard-grid-page { padding: 16px; }
  .hero,
  .hero-actions,
  .button-row { align-items: stretch; flex-direction: column; }
  .hero h1 { font-size: 27px; }
  .kpi-grid,
  .strategy-summary-grid,
  .box-grid,
  .split-buttons { grid-template-columns: 1fr; }
  .primary-button,
  .secondary-button,
  .ghost-button { width: 100%; }
  .period-switch { width: 100%; overflow:auto; }
}

.screen-guidance-card {
  background: #fff;
  border: 1px solid #e4e7df;
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(24, 38, 18, 0.028);
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.screen-guidance-card div {
  border: 1px solid #e4e7df;
  background: #f7f8f4;
  border-radius: 14px;
  padding: 10px;
}

.screen-guidance-card span {
  display: block;
  color: #6f746b;
  font-size: 12px;
  font-weight: 900;
}

.screen-guidance-card strong {
  display: block;
  margin-top: 5px;
  color: #1f241d;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .screen-guidance-card { grid-template-columns: 1fr; }
}
`;
